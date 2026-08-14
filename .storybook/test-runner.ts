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

const config: TestRunnerConfig = {
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
