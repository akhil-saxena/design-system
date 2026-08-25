import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
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
