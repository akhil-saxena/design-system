import { type TestRunnerConfig, getStoryContext, waitForPageReady } from "@storybook/test-runner";
import { checkA11y, configureAxe, injectAxe } from "axe-playwright";

/**
 * Storybook test-runner orchestration. Two independent jobs share this file,
 * selected by DS_TEST_MODE so they can run separately in CI:
 *
 *   DS_TEST_MODE=a11y    → run axe-core against every story (default)
 *   DS_TEST_MODE=visual  → capture a PNG per story per theme (local only, D-31)
 *
 * Visual capture writes into tests/visual-baselines/ and is deliberately not a
 * CI job (D-31); the a11y sweep is cheap and deterministic, so it is.
 */
const MODE = process.env.DS_TEST_MODE ?? "a11y";

/**
 * THE BRAND AXIS (D-37 / T-20-02).
 *
 *   DS_BRAND=charcoal npm run test:a11y
 *
 * Without this, every a11y result in the charcoal release is default-brand-only.
 * Nothing pins the brand: `preview.tsx` sets `initialGlobals.brand = "default"`
 * deliberately (so charcoal is opt-in and no recorded baseline moves) and no
 * story overrides it — so an unqualified `test:a11y` sweeps the JobDash cream/
 * ink/amber palette exclusively. Charcoal is the brand that changes *colours*,
 * and colour-contrast is where axe violations live, so a green default sweep
 * says nothing whatsoever about it.
 *
 * DEFAULT IS STILL "default", on purpose. This is a switch, not a re-point: the
 * committed gate keeps sweeping the brand every existing consumer is on, and the
 * charcoal sweep is a second, explicitly-requested run. Making charcoal the
 * default here would silently change what `npm run test:a11y` means for anyone
 * who inherits this file.
 */
const BRAND = process.env.DS_BRAND ?? "default";

const config: TestRunnerConfig = {
	/**
	 * Overrides the runner's default navigation for one reason: to carry the brand
	 * global on the URL.
	 *
	 * This is the only seam that works, and the URL has to be shaped exactly like
	 * this. The runner navigates to `iframe.html` ONCE per worker and thereafter
	 * switches stories over Storybook's channel without re-navigating, so a
	 * `preVisit` that wrote `documentElement.dataset.brand` would be undone the
	 * moment the decorator re-renders -- it calls `removeAttribute("data-brand")`
	 * on every render whose `globals.brand` is not charcoal. Setting the DOM
	 * attribute directly is precisely the kind of change a grep can confirm and a
	 * browser cannot; the global has to be set where Storybook reads it.
	 *
	 * AND IT MUST BOOT WITH A STORY ID. Storybook only reads the `globals` query
	 * parameter on a boot that carries an `id`; `iframe.html?globals=brand:charcoal`
	 * with no story silently discards it, and no later channel switch recovers it.
	 * Measured all three ways: `?id=X&globals=brand:charcoal` resolves --cream to
	 * charcoal's #f4f1ea; the same URL without `id` resolves #fcfcfc, the default
	 * brand; and once the globals HAVE landed on an id-carrying boot they survive a
	 * `setCurrentStory` switch to any other story, which is what makes one
	 * navigation brand the entire sweep.
	 *
	 * The first version of this hook omitted the id and therefore swept the default
	 * brand under a charcoal label. It was caught by postVisit's assertion below,
	 * on all 508 stories, rather than by review -- which is the whole argument for
	 * that assertion existing.
	 */
	async prepare({ page, browserContext, testRunnerConfig }) {
		const targetURL = process.env.TARGET_URL ?? "http://localhost:6006";
		// Any real story will do as the seed; the first one the index reports is
		// deterministic and needs no hardcoded id to fall out of date.
		const index = await page.request.get(new URL("index.json", targetURL).toString());
		const entries = ((await index.json()) as { entries?: Record<string, { type: string }> })
			.entries;
		const seed = Object.entries(entries ?? {}).find(([, e]) => e.type === "story")?.[0];
		if (!seed) throw new Error(`Could not read a story id from ${targetURL}/index.json`);
		// Built by concatenation rather than URLSearchParams: the latter
		// percent-encodes the ":" in "brand:charcoal" into "%3A", and this URL is
		// also what gets printed in a failure, where the encoded form is harder to
		// paste into a browser.
		const iframeURL = `${new URL("iframe.html", targetURL).toString()}?id=${seed}&viewMode=story&globals=brand:${BRAND}`;
		if (testRunnerConfig?.getHttpHeaders) {
			await browserContext.setExtraHTTPHeaders(await testRunnerConfig.getHttpHeaders(iframeURL));
		}
		await page.goto(iframeURL, { waitUntil: "load" });
	},

	async preVisit(page) {
		// Freezing animation makes both jobs deterministic: screenshots stop
		// catching mid-transition frames, and axe stops sampling colours from a
		// half-faded element.
		await page.addStyleTag({
			content: `
				*, *::before, *::after {
					animation: none !important;
					transition: none !important;
					caret-color: transparent !important;
				}
			`,
		});
		if (MODE === "a11y") await injectAxe(page);
	},

	async postVisit(page, context) {
		await waitForPageReady(page);

		/**
		 * Assert the brand axis actually reached the DOM, on every story.
		 *
		 * This exists because "the runner is brand-aware" is otherwise a claim no
		 * gate can check: if the globals query param stopped being honoured — a
		 * Storybook upgrade, a decorator rewrite, a typo in the key — the sweep
		 * would keep passing while silently testing the default brand again, which
		 * is exactly the failure T-20-02 describes and exactly the failure this
		 * whole mechanism was added to end. A wrong brand must be LOUD, so it
		 * throws per story rather than warning once.
		 */
		const domBrand = await page.evaluate(() => document.documentElement.dataset.brand ?? "default");
		if (domBrand !== BRAND) {
			throw new Error(
				[
					`Brand axis did not apply on "${context.id}":`,
					`requested DS_BRAND="${BRAND}" but <html data-brand> resolves to "${domBrand}".`,
					`The sweep would have reported "${domBrand}" results under a "${BRAND}" label.`,
					"Check that preview.tsx's decorator still reads context.globals.brand,",
					"and that the globals query parameter is still honoured by this Storybook version.",
				].join(" "),
			);
		}

		if (MODE === "visual") {
			const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
			const theme = isDark ? "dark" : "light";
			const safeId = context.id.replace(/[^a-z0-9-]/gi, "_");
			await page.screenshot({
				path: `tests/visual-baselines/${safeId}/${theme}.png`,
				fullPage: true,
			});
			return;
		}

		// ── a11y ──────────────────────────────────────────────────────────────
		const storyContext = await getStoryContext(page, context);

		// Per-story opt-out: `parameters: { a11y: { disable: true } }`. Use it only
		// for stories that deliberately render an invalid state (e.g. a story
		// documenting an error case), and say why in the story.
		if (storyContext.parameters?.a11y?.disable) return;

		await configureAxe(page, {
			rules: storyContext.parameters?.a11y?.config?.rules,
		});

		// Scope to the story root rather than the whole page so Storybook's own
		// chrome is not attributed to the component under test.
		await checkA11y(page, "#storybook-root", {
			detailedReport: true,
			detailedReportOptions: { html: true },
		});
	},
};

export default config;
