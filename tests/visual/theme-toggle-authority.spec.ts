import { readFileSync } from "node:fs";
import type { Frame, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * The Theme toolbar must be able to express BOTH of its states.
 *
 * THE REPORTED FAILURE, in Akhil's words: "from toolbar, theme toggle broken,
 * always dark." Not intermittent, not a stale bundle — a control that had one
 * working direction.
 *
 * THE MECHANISM. `.storybook/preview.tsx`'s decorator decided the mode with
 *
 *     context.globals.theme === "dark" || context.globals.backgrounds?.value === DARK_BG
 *
 * and `src/OverviewPage.tsx`'s `globalsUpdated` handler carried a byte-identical
 * copy. `backgrounds` is a STICKY global: Storybook's manager persists the
 * toolbar selection and restores it across reloads. So the moment that global
 * held `#1c1917` the right-hand clause was permanently true, and every later
 * "Light" was swallowed by an OR the user could not see and had no control to
 * clear. The Theme toolbar could still turn dark ON; it could never turn it off.
 *
 * WHY THE OR WAS REMOVED RATHER THAN MADE ONE-WAY. Checked before changing it:
 * nothing depended on it. ~70 stories request dark with `globals: { theme:
 * "dark" }` and `src/story-mode.test.ts` fails the build if any story selects
 * dark by pinning a backgrounds hex; every Playwright spec drives the axis with
 * `?globals=theme:...`; `.storybook/test-runner.ts` sets only
 * `globals=brand:...`. And `parameters.backgrounds.default` never fed it —
 * asserted below, because it is the one input that looks like it should.
 *
 * WHAT THIS SPEC REFUSES TO DO. It never asserts "not dark" without first
 * proving the sticky dark background actually landed. A spec that silently
 * failed to establish the stuck state would pass on a broken tree while
 * measuring nothing, which is the failure mode this phase keeps paying for.
 */

const DARK_BG = "#1c1917";
/** What the backgrounds addon paints on <body> when that global is set. */
const DARK_BG_RGB = "rgb(28, 25, 23)";
/** Any real story; the axis under test is global, not component-specific. */
const STORY = "foundation-divider--default";
/** src/Overview.mdx renders <OverviewPage />, which owns the second copy. */
const DOCS = "overview--docs";

type Reading = {
	dark: boolean;
	bodyBg: string;
	themeGlobal: unknown;
	bgGlobal: { value?: string } | null;
};

declare global {
	interface Window {
		__STORYBOOK_ADDONS_CHANNEL__?: { emit: (event: string, payload: unknown) => void };
		__STORYBOOK_PREVIEW__?: {
			storyStore?: { userGlobals?: { globals?: Record<string, unknown> } };
		};
	}
}

const read = (page: Page): Promise<Reading> =>
	page.evaluate(() => {
		const globals = window.__STORYBOOK_PREVIEW__?.storyStore?.userGlobals?.globals ?? {};
		return {
			dark: document.documentElement.classList.contains("dark"),
			bodyBg: getComputedStyle(document.body).backgroundColor,
			themeGlobal: globals.theme ?? null,
			bgGlobal: (globals.backgrounds as { value?: string } | undefined) ?? null,
		};
	});

/**
 * Drive a toolbar the way the toolbar does — over the preview channel, the same
 * `updateGlobals` event the manager emits when a menu item is clicked. A URL
 * reload would re-boot the preview and hide precisely the cross-update
 * stickiness this is about.
 */
const setGlobals = async (page: Page, globals: Record<string, unknown>) => {
	await page.evaluate((g) => {
		const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
		if (!channel) throw new Error("no preview channel — cannot drive the toolbar");
		channel.emit("updateGlobals", { globals: g });
	}, globals);
	// The decorator writes the class during React's render pass; a bare
	// `evaluate` returns before that lands.
	await page.waitForTimeout(600);
};

test.describe("the Theme toolbar is authoritative", () => {
	test("a fresh boot has NO backgrounds global — parameters.backgrounds.default does not feed the mode", async ({
		page,
	}) => {
		// This is the input that most looks like it should have been the culprit,
		// and five story files declare their own `backgrounds.values`. Measured
		// instead of assumed: `globals.backgrounds` is null until a toolbar
		// selection exists, so `parameters.backgrounds.default: "light"` never
		// reached the removed OR and no story-level values block did either.
		await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:light`);
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 30_000 });
		await page.waitForTimeout(800);
		const r = await read(page);
		expect(r.bgGlobal, "parameters.backgrounds.default leaked into globals.backgrounds").toBeNull();
		expect(r.themeGlobal).toBe("light");
		expect(r.dark).toBe(false);
	});

	test("THE REPORTED STATE: a sticky dark background plus Theme=light is LIGHT", async ({
		page,
	}) => {
		await page.goto(
			`/iframe.html?id=${STORY}&viewMode=story&globals=theme:light;backgrounds.value:!hex(1c1917)`,
		);
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 30_000 });
		await page.waitForTimeout(800);
		const r = await read(page);

		// PRECONDITION FIRST. Without these three the assertion below is worthless:
		// a Storybook that stopped honouring this globals encoding would leave the
		// page in plain light mode and the spec would pass having tested nothing.
		expect(r.bgGlobal?.value, "the dark background global never landed").toBe(DARK_BG);
		expect(r.bodyBg, "the backgrounds addon never painted, so nothing was sticky").toBe(
			DARK_BG_RGB,
		);
		expect(r.themeGlobal, "the theme global never landed").toBe("light");

		// The defect.
		expect(r.dark, "Theme=light lost to a sticky dark background").toBe(false);
	});

	test("the toolbar sequence Akhil was stuck in: bg=dark, then dark → light → dark → light", async ({
		page,
	}) => {
		await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:light`);
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 30_000 });
		await page.waitForTimeout(800);

		// Pick the dark background from the Backgrounds toolbar.
		await setGlobals(page, { backgrounds: { value: DARK_BG } });
		let r = await read(page);
		expect(r.bgGlobal?.value, "the Backgrounds toolbar selection did not stick").toBe(DARK_BG);
		expect(r.bodyBg, "the backgrounds addon never painted").toBe(DARK_BG_RGB);
		expect(r.dark, "a background selection alone must not force the theme").toBe(false);

		// Now work the Theme toolbar. Both directions, twice, with the background
		// left pinned throughout — one pass could not distinguish "works" from
		// "stuck on the value we happened to ask for first".
		for (const step of ["dark", "light", "dark", "light"] as const) {
			await setGlobals(page, { theme: step });
			r = await read(page);
			expect(r.bgGlobal?.value, "the sticky background stopped being sticky mid-run").toBe(DARK_BG);
			expect(r.dark, `Theme=${step} did not reach <html> (background pinned to ${DARK_BG})`).toBe(
				step === "dark",
			);
		}
	});

	test("the same on the Overview page, which owns a second copy of the rule", async ({ page }) => {
		// src/OverviewPage.tsx listens to `globalsUpdated` and writes `.dark` onto
		// document.documentElement itself — the same element the preview decorator
		// writes. Its copy of the OR would have reinstated the class right after the
		// decorator cleared it, so fixing preview.tsx alone leaves the Theme toggle
		// broken on the first page anyone opens.
		await page.goto(
			`/iframe.html?id=${DOCS}&viewMode=docs&globals=theme:light;backgrounds.value:!hex(1c1917)`,
		);
		await page.waitForSelector("#storybook-docs", { state: "attached", timeout: 30_000 });
		await page.waitForTimeout(2000);

		let r = await read(page);
		expect(r.bgGlobal?.value, "the dark background global never landed on the docs page").toBe(
			DARK_BG,
		);
		expect(r.dark, "Theme=light lost to a sticky dark background on the Overview page").toBe(false);

		for (const step of ["dark", "light", "dark", "light"] as const) {
			await setGlobals(page, { theme: step });
			r = await read(page);
			expect(r.bgGlobal?.value).toBe(DARK_BG);
			expect(r.dark, `Overview page: Theme=${step} did not reach <html>`).toBe(step === "dark");
		}
	});

	test("neither source reads globals.backgrounds again", async () => {
		// A source assertion alongside the four browser ones, for the one thing a
		// browser cannot cover: it names BOTH files, so an edit that reintroduces
		// the OR in only one of them fails here even when the cell that would have
		// exercised it is not a cell anyone is looking at.
		//
		// `globals.backgrounds` is the precise thing forbidden, not the word
		// "backgrounds": `parameters.backgrounds` is still declared in preview.tsx
		// and must stay legal — it is Storybook's own canvas chrome, and repointing
		// it is the change 12b723c refused because it repaints the story canvas
		// recorded in 1,019 baselines.
		const READS_GLOBAL = /globals\s*(?:\.\s*backgrounds\b|\[\s*["'`]backgrounds["'`]\s*\])/;
		for (const file of [".storybook/preview.tsx", "src/OverviewPage.tsx"]) {
			// Comments are stripped first: preview.tsx quotes the removed expression
			// verbatim in its own docstring, which is deliberate and must stay legal.
			const code = readFileSync(file, "utf8")
				.replace(/\/\*[\s\S]*?\*\//g, "")
				.split("\n")
				.map((l) => l.replace(/\/\/.*$/, ""))
				.join("\n");
			expect(
				READS_GLOBAL.test(code),
				`${file} decides the colour mode from globals.backgrounds again`,
			).toBe(false);
			// And prove the comment stripper did not simply eat the whole file,
			// which would make the negative above pass for the wrong reason. The
			// anchor is the very identifier the regex hunts for, so it cannot
			// survive a strip that removed the code the regex needs to see.
			expect(code, `${file} stripped to nothing — the check measured nothing`).toContain("globals");
		}
	});
});

/* ─── DOCS MODE, WHICH IS THE CASE THE FIVE ROWS ABOVE COULD NOT SEE ──────────

   Akhil, at http://localhost:6006/?path=/docs/inputs-button--docs: "theme toggle
   light/dark doesn't work. always dark." The five rows above were green the whole
   time, because four of them drive viewMode=story and the fifth drives a docs page
   whose second copy of the rule (src/OverviewPage.tsx) corrected the class itself.

   THE MECHANISM, and it is NOT "the decorator did not re-run". Instrumented in a
   real browser: on every toolbar change the docs preview re-rendered and the
   decorator ran EIGHT times, once per story block on the page. `<html>` is one
   element, and `inputs-button--dark-mode` pins `globals: { theme: "dark" }`, so
   that block's merged globals said dark no matter what the toolbar said. Whichever
   block rendered LAST decided the whole page, and through the toolbar the dark one
   did, six times out of six.

   That is why the axis that stuck was exactly the one a story contradicted, and
   why BRAND was fine on the same page: no story overrides `brand`, so all eight
   blocks agreed. Brand had its own separate failure, on the one docs page that
   renders no story blocks at all — see the last row.

   WHY THESE ROWS DRIVE THE MANAGER AND NOT iframe.html. Both cheaper drivers were
   measured and both are unusable here:
     - `updateGlobals` on a bare iframe.html in DOCS mode RELOADS the document, so
       the state under test is destroyed before it can be read;
     - navigating to iframe.html?...&globals=theme:light IS the defect's own race,
       and sampling it is a coin flip — six pre-fix trials came back light five
       times. A row that samples a race and reports the lucky draw is the "34 tests
       all focused the first tile" defect in a new costume.
   Through the real toolbar the same six trials came back DARK six times out of six.

   EVERY ROW DRIVES ALL FOUR TRANSITIONS. The bug was one-way: Dark always worked.
   A row that only goes light → dark passes on the broken build. */

/** The `title` Storybook renders on each toolbar button, from globalTypes above. */
const TOOLBAR = { theme: "Color scheme", brand: "Brand token layer" } as const;
/** A docs page containing a story that pins `globals: { theme: "dark" }`. */
const DOCS_WITH_DARK_STORY = "inputs-button--docs";
/** That story's anchor, asserted present so a row cannot pass by measuring nothing. */
const DARK_BLOCK_ANCHOR = "#anchor--inputs-button--dark-mode";
/** A story with no globals of its own, so its Theme toolbar is not disabled. */
const PLAIN_STORY = "foundation-divider--default";

/**
 * The preview iframe, re-resolved on every call rather than captured once.
 * A DOCS page swaps its whole document on a globals change — measured with a
 * marker on `window`, which was gone afterwards in docs mode and still there in
 * story mode — so a held Frame handle goes stale mid-test. The manager also
 * mounts the iframe after its own first paint, hence the poll rather than a
 * straight `page.frames()` lookup.
 */
const previewFrame = async (page: Page): Promise<Frame> => {
	await page.waitForSelector("#storybook-preview-iframe", { state: "attached", timeout: 60_000 });
	for (let i = 0; i < 240; i++) {
		const frame = page.frames().find((f) => !f.isDetached() && f.url().includes("iframe.html"));
		if (frame) return frame;
		await page.waitForTimeout(250);
	}
	throw new Error("no preview iframe — the manager never mounted one");
};

type Chrome = { dark: boolean; brand: string | null };

const readChrome = async (page: Page): Promise<Chrome> =>
	(await previewFrame(page)).evaluate(() => ({
		dark: document.documentElement.classList.contains("dark"),
		brand: document.documentElement.getAttribute("data-brand"),
	}));

const countIn = async (page: Page, selector: string) =>
	(await previewFrame(page)).locator(selector).count();

const openManager = async (page: Page, path: string, rootSelector: string) => {
	await page.goto(`/?path=${path}`);
	const frame = await previewFrame(page);
	await frame.waitForSelector(rootSelector, { state: "attached", timeout: 60_000 });
	await page.waitForTimeout(4_000);
};

/**
 * Click a real toolbar menu item. Storybook renders the open menu as plain
 * <button>s in a portal appended to <body>, outside #root — hence the selector.
 */
const clickToolbar = async (page: Page, toolbar: string, item: string) => {
	const button = page.locator(`button[title="${toolbar}"]`).first();
	await expect(button, `the ${toolbar} toolbar is missing`).toBeVisible();
	await expect(
		button,
		`the ${toolbar} toolbar is DISABLED — Storybook disables it when the current story overrides that global, so this row would be measuring a control nobody can use`,
	).toBeEnabled();
	await button.click();
	await page
		.locator("body > div:not(#root) button")
		.filter({ hasText: new RegExp(`^${item}$`) })
		.first()
		.click();
	// A docs page reloads its preview document on a globals change; a story page
	// re-renders in place. Both settle well inside this.
	await page.waitForTimeout(2_500);
};

/** light → dark → light → dark → light. Both directions, twice each. */
const THEME_SEQUENCE = ["Dark", "Light", "Dark", "Light"] as const;
const BRAND_SEQUENCE = ["Monochrome", "Default", "Monochrome", "Default"] as const;

test.describe("the Theme toolbar reaches <html> on docs pages too", () => {
	test("DOCS: all four theme transitions, on a page that contains a story pinning theme=dark", async ({
		page,
	}) => {
		await openManager(page, `/docs/${DOCS_WITH_DARK_STORY}`, "#storybook-docs");

		// PRECONDITIONS. Without both of these the row asserts nothing: a docs page
		// with no contradicting block never reproduced this, and a disabled toolbar
		// would mean the clicks below did nothing at all.
		expect(
			await countIn(page, DARK_BLOCK_ANCHOR),
			"the dark-pinned story block is not on this page, so the last-writer race cannot occur and this row is vacuous",
		).toBe(1);
		expect(
			await countIn(page, ".docs-story"),
			"a docs page with one story block cannot have a race between blocks",
		).toBeGreaterThan(1);
		// SOFT, and deliberately so. First paint on this page is itself a draw from
		// the same race — pre-fix it came back light in one manager run and dark in
		// the next — so a hard assertion here would abort before the four
		// transitions, which ARE deterministic, ever ran. Soft reports it and carries
		// on, so one red row shows the whole picture instead of the first symptom it
		// happened to hit.
		expect
			.soft(
				(await readChrome(page)).dark,
				"first paint: <html> is dark while the toolbar says light — a story block's own globals decided the page",
			)
			.toBe(false);

		for (const step of THEME_SEQUENCE) {
			await clickToolbar(page, TOOLBAR.theme, step);
			expect
				.soft(
					(await readChrome(page)).dark,
					`docs: Theme=${step} did not reach <html> — a story block's own globals decided the page`,
				)
				.toBe(step === "Dark");
		}
	});

	test("STORY: the same four transitions through the same driver", async ({ page }) => {
		// The control. If the docs row above ever goes red for a reason that has
		// nothing to do with docs — a broken toolbar selector, a Storybook upgrade
		// that renames the menu — this row goes red with it and says so.
		await openManager(page, `/story/${PLAIN_STORY}`, "#storybook-root");
		expect((await readChrome(page)).dark, "the story did not start light").toBe(false);

		for (const step of THEME_SEQUENCE) {
			await clickToolbar(page, TOOLBAR.theme, step);
			expect((await readChrome(page)).dark, `story: Theme=${step} did not reach <html>`).toBe(
				step === "Dark",
			);
		}
	});

	test("DOCS: all four BRAND transitions on that same page", async ({ page }) => {
		// Brand is applied by the same decorator in the same pass, so if the mode
		// was stuck the presumption is that brand was too. It was NOT, and the
		// reason is the whole mechanism in one line: no story in this repo overrides
		// `brand`, so all eight blocks always agreed on it. Asserted rather than
		// assumed, because that presumption is the obvious one to make.
		await openManager(page, `/docs/${DOCS_WITH_DARK_STORY}`, "#storybook-docs");
		expect(await countIn(page, DARK_BLOCK_ANCHOR)).toBe(1);
		expect
			.soft((await readChrome(page)).brand, "the page did not start on the default brand")
			.toBeNull();

		for (const step of BRAND_SEQUENCE) {
			await clickToolbar(page, TOOLBAR.brand, step);
			expect
				.soft((await readChrome(page)).brand, `docs: Brand=${step} did not reach <html data-brand>`)
				.toBe(step === "Monochrome" ? "monochrome" : null);
		}
	});

	test("DOCS: a page that renders ZERO story blocks still gets brand AND mode", async ({
		page,
	}) => {
		// THE SUBSCRIPTION'S OWN ROW, and it is not a hypothetical. src/Overview.mdx
		// renders <OverviewPage /> and no <Story> block, so the decorator never runs
		// there at all. Measured on the pre-fix tree:
		//   /iframe.html?id=overview--docs&viewMode=docs&globals=theme:dark;brand:monochrome
		//   painted <html> with NO class and NO data-brand.
		// The theme half was masked because OverviewPage carries its own
		// `globalsUpdated` handler; nothing ever applied the BRAND. This row fails
		// if preview.tsx's subscription is removed, which the decorator alone cannot
		// replace on this page.
		await openManager(page, "/docs/overview--docs", "#storybook-docs");
		expect(
			await countIn(page, ".docs-story"),
			"overview--docs now renders story blocks, so the decorator covers it and this row no longer exercises the subscription",
		).toBe(0);

		// Soft on both halves: the theme half is masked by OverviewPage's own handler
		// and the brand half is not, so a hard theme assertion passing would say
		// nothing about the brand one failing, and vice versa.
		for (const step of THEME_SEQUENCE) {
			await clickToolbar(page, TOOLBAR.theme, step);
			expect
				.soft((await readChrome(page)).dark, `overview docs: Theme=${step} did not reach <html>`)
				.toBe(step === "Dark");
		}
		for (const step of BRAND_SEQUENCE) {
			await clickToolbar(page, TOOLBAR.brand, step);
			expect
				.soft(
					(await readChrome(page)).brand,
					`overview docs: Brand=${step} did not reach <html data-brand> — nothing applies the brand on a page with no story blocks except the subscription`,
				)
				.toBe(step === "Monochrome" ? "monochrome" : null);
		}
	});

	test("FIRST PAINT: every brand × mode cell is already correct before any click", async ({
		page,
	}) => {
		// The subscription covers updates; the decorator covers the initial render.
		// This asserts the second half has not been traded away for the first, on
		// all three shapes at once: a docs page with a contradicting story, a docs
		// page with no stories, and a story that pins dark against a light toolbar.
		for (const cell of [
			{
				id: DOCS_WITH_DARK_STORY,
				vm: "docs",
				sel: "#storybook-docs",
				theme: "light",
				brand: "default",
				dark: false,
			},
			{
				id: DOCS_WITH_DARK_STORY,
				vm: "docs",
				sel: "#storybook-docs",
				theme: "dark",
				brand: "monochrome",
				dark: true,
			},
			{
				id: "overview--docs",
				vm: "docs",
				sel: "#storybook-docs",
				theme: "dark",
				brand: "default",
				dark: true,
			},
			{
				id: "overview--docs",
				vm: "docs",
				sel: "#storybook-docs",
				theme: "light",
				brand: "monochrome",
				dark: false,
			},
			// A story pinning its own dark stays dark against a LIGHT toolbar. This
			// is what the ~70 dark stories and all 1,019 baselines depend on, and it
			// is the thing a docs-only fix is most likely to break.
			{
				id: "inputs-button--dark-mode",
				vm: "story",
				sel: "#storybook-root",
				theme: "light",
				brand: "default",
				dark: true,
			},
			{
				id: "inputs-button--dark-mode",
				vm: "story",
				sel: "#storybook-root",
				theme: "light",
				brand: "monochrome",
				dark: true,
			},
			{
				id: PLAIN_STORY,
				vm: "story",
				sel: "#storybook-root",
				theme: "dark",
				brand: "monochrome",
				dark: true,
			},
		] as const) {
			await page.goto(
				`/iframe.html?id=${cell.id}&viewMode=${cell.vm}&globals=theme:${cell.theme};brand:${cell.brand}`,
			);
			await page.waitForSelector(cell.sel, { state: "attached", timeout: 30_000 });
			await page.waitForTimeout(2_000);
			const r = await page.evaluate(() => ({
				dark: document.documentElement.classList.contains("dark"),
				brand: document.documentElement.getAttribute("data-brand"),
			}));
			const where = `${cell.id} ${cell.vm} theme:${cell.theme} brand:${cell.brand}`;
			// Soft per cell: seven cells, and knowing WHICH ones moved is the
			// difference between "docs regressed" and "story mode regressed", which
			// are opposite diagnoses.
			expect.soft(r.dark, `first paint mode wrong: ${where}`).toBe(cell.dark);
			expect
				.soft(r.brand, `first paint brand wrong: ${where}`)
				.toBe(cell.brand === "monochrome" ? "monochrome" : null);
		}
	});
});
