import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { hexToRgb, probeComputed, probeMeta } from "./computed";

/**
 * Charcoal must resolve to its own declared value in its own mode, no matter
 * where the bundler emitted its stylesheet.
 *
 * Phase 0 measured this in a throwaway consumer: 17 tokens x 4 deliberately
 * constructed import orders x 2 colour modes, twice, for 272 green assertions
 * against a live hazard. The default emitted order in that stack put the design
 * system's ":root.dark" chunk BEFORE the charcoal chunk, which is the ordering
 * that loses charcoal entirely in dark mode once the exhaustiveness invariant is
 * broken. None of that survives as a CI signal, because constructing four import
 * orders inside Storybook is not possible and faking it would prove nothing.
 *
 * What this spec asserts instead is the property that makes order irrelevant, in
 * the browser rather than in the source: for every custom property the charcoal
 * light block declares, the dark block declares it too, and the dark value is
 * what getComputedStyle returns under charcoal x dark. A property that fell
 * through to ":root.dark" — the whole failure mode — reads as the design
 * system's neutral instead, and the discriminating-set assertion below is what
 * makes that detectable rather than merely unlikely.
 *
 * Everything here is a computed value. There is no screenshot: charcoal's
 * baselines are D-37 and land in plan 01-20, after the component fixes, so they
 * are recorded once against finished behaviour.
 */

/** Cheap, always-present, and its root element sits INSIDE the dark wrapper. */
const TOKEN_STORY = "foundation-divider--default";
const TOKEN_SELECTOR = ".ds-atom-divider";

/**
 * Button primary is the E1 mechanism itself: it sets `background: var(--amber)`
 * as an INLINE style, which beats any class rule without !important. Findings
 * E3, E5 and F-12-2 are all this shape, which is why the accent bridge had to be
 * done in the token layer and why proving it needs a painted colour rather than
 * a token read.
 */
const PAINT_STORY = "inputs-button--default";
const PAINT_SELECTOR = ".ds-atom-btn";

/**
 * The two blocks, read with the parser charcoal.css's own header specifies:
 * find the selector, then its opening brace, then the next newline-plus-brace at
 * column 0. The header calls that formatting load-bearing precisely because an
 * indented closing brace would silently truncate the parsed set and let the
 * exhaustiveness check pass for the wrong reason.
 */
function blockOf(css: string, selector: string): string {
	const at = css.indexOf(`${selector} {`);
	if (at < 0) throw new Error(`charcoal.css declares no block for ${selector}`);
	const open = css.indexOf("{", at) + 1;
	const close = css.indexOf("\n}", open);
	if (close < 0)
		throw new Error(`the ${selector} block in charcoal.css is never closed at column 0`);
	return css.slice(open, close);
}

function declarationsOf(body: string): Map<string, string> {
	// Comments first: charcoal.css's header warns that a colon written after a
	// token name inside prose would otherwise be parsed as a real declaration.
	const code = body.replace(/\/\*[\s\S]*?\*\//g, "");
	const found = new Map<string, string>();
	for (const m of code.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
		const [, name, value] = m;
		if (name && value) found.set(name, value.trim());
	}
	return found;
}

/** Substitute var() against the block's own declarations, as the cascade does. */
function expand(value: string, within: Map<string, string>, seen: Set<string> = new Set()): string {
	return value.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/gi, (whole, name: string) => {
		if (seen.has(name)) return whole;
		const inner = within.get(name);
		if (inner === undefined) return whole;
		return expand(inner, within, new Set([...seen, name]));
	});
}

/** Whitespace and case are not value; Biome rewrites hex case on commit. */
const norm = (v: string) => v.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * The repo root, derived from the config file rather than from config.rootDir —
 * which resolves to testDir (tests/visual) and sent the first run looking for
 * tests/visual/src/themes/charcoal.css.
 */
function repoRoot(): string {
	const configFile = test.info().config.configFile;
	if (!configFile) {
		throw new Error("no Playwright config file on test.info(); cannot locate charcoal.css");
	}
	return dirname(configFile);
}

function charcoalBlocks(rootDir: string) {
	const css = readFileSync(join(rootDir, "src", "themes", "charcoal.css"), "utf8");
	const light = declarationsOf(blockOf(css, ':root[data-brand="charcoal"]'));
	const dark = declarationsOf(blockOf(css, ':root[data-brand="charcoal"].dark'));
	if (light.size === 0 || dark.size === 0) {
		throw new Error(
			[
				`parsed ${light.size} light and ${dark.size} dark declarations out of charcoal.css;`,
				"a zero count means the parser missed the block, not that the block is empty",
			].join(" "),
		);
	}
	return { light, dark };
}

test.describe("charcoal brand cascade", () => {
	test("anchor tokens resolve to their declared values in all four brand x mode cells", async ({
		page,
	}) => {
		const props = ["--cream", "--ochre-d-strong", "--amber", "--panel"];
		const cell = async (brand: "default" | "charcoal", mode: "light" | "dark") =>
			probeComputed(page, { story: TOKEN_STORY, brand, mode, selector: TOKEN_SELECTOR, props });

		const charcoalLight = await cell("charcoal", "light");
		const charcoalDark = await cell("charcoal", "dark");
		const defaultLight = await cell("default", "light");
		const defaultDark = await cell("default", "dark");

		// Declared values, not cross-cell agreement. Agreement alone would also
		// pass if data-brand were misspelled everywhere, or if charcoal.css stopped
		// being imported at all — every cell would agree on the design system's
		// neutrals and this would go green while measuring nothing.
		const expected = {
			"--cream": ["#f4f1ea", "#161616"],
			"--ochre-d-strong": ["#6b4417", "#d4a66d"],
			"--amber": ["#b0722a", "#b0722a"],
			"--panel": ["#fbf9f4", "#1e1e1d"],
		} as const;
		for (const [token, [light, dark]] of Object.entries(expected)) {
			expect.soft(norm(charcoalLight[token] ?? ""), `charcoal light ${token}`).toBe(light);
			expect.soft(norm(charcoalDark[token] ?? ""), `charcoal dark ${token}`).toBe(dark);
		}

		// Charcoal is scoped: the default brand is untouched. These are the values
		// tokens.css actually declares. Plan 01-02 named #f5f3f0 / #1c1917 here,
		// which are Storybook's own `backgrounds` constants and DARK_BG — chrome
		// colours, not this token. Asserting the constant would have made the gate
		// fail for a reason unrelated to the property it exists to protect.
		expect.soft(norm(defaultLight["--cream"] ?? ""), "default light --cream").toBe("#fcfcfc");
		expect.soft(norm(defaultDark["--cream"] ?? ""), "default dark --cream").toBe("#181818");
		expect.soft(norm(defaultLight["--amber"] ?? ""), "default light --amber").toBe("#f59e0b");
	});

	test("every property charcoal declares wins in its own mode, so emission order cannot decide", async ({
		page,
	}) => {
		const { light, dark } = charcoalBlocks(repoRoot());

		// The invariant itself, read out of the source. Soft on purpose: a hard
		// assert here short-circuits the run, and the browser half below is the half
		// that matters — a source check cannot prove a style applied. Leaving this
		// hard would mean the negative control only ever exercised the parser.
		expect
			.soft(
				[...light.keys()].filter((n) => !dark.has(n)),
				"declared in light but not dark",
			)
			.toEqual([]);
		expect
			.soft(
				[...dark.keys()].filter((n) => !light.has(n)),
				"declared in dark but not light",
			)
			.toEqual([]);

		const props = [...light.keys()];
		const opts = { story: TOKEN_STORY, selector: TOKEN_SELECTOR, props } as const;
		const charcoalLight = await probeComputed(page, { ...opts, brand: "charcoal", mode: "light" });
		const charcoalDark = await probeComputed(page, { ...opts, brand: "charcoal", mode: "dark" });
		const neutralDark = await probeComputed(page, { ...opts, brand: "default", mode: "dark" });

		// Which properties could possibly reveal a fall-through: the ones whose
		// charcoal dark value differs from what the design system paints in dark.
		// For every other property the two agree, so no ordering could tell them
		// apart and a green result there proves nothing. Counting them is what
		// keeps this test honest.
		const discriminating: string[] = [];
		for (const name of props) {
			const wantDark = norm(expand(dark.get(name) ?? "", dark));
			const wantLight = norm(expand(light.get(name) ?? "", light));
			expect.soft(norm(charcoalDark[name] ?? ""), `charcoal dark ${name}`).toBe(wantDark);
			expect.soft(norm(charcoalLight[name] ?? ""), `charcoal light ${name}`).toBe(wantLight);
			if (norm(neutralDark[name] ?? "") !== wantDark) {
				discriminating.push(name);
				expect
					.soft(norm(charcoalDark[name] ?? ""), `charcoal dark ${name} fell through to the neutral`)
					.not.toBe(norm(neutralDark[name] ?? ""));
			}
		}

		expect(
			discriminating.length,
			"properties whose value could reveal a fall-through",
		).toBeGreaterThan(10);
		// --wire is the token Phase 0's negative control deletes. If it were not
		// discriminating, deleting it would prove nothing and the control would be
		// theatre.
		expect(discriminating, "--wire must be able to reveal a fall-through").toContain("--wire");
		console.log(
			`charcoal cascade: ${props.length} properties asserted in both modes, ` +
				`${discriminating.length} of them distinguishable from the design system's dark values`,
		);
	});

	test("the ochre accent reaches an inline var(--amber) consumer in both modes", async ({
		page,
	}) => {
		const props = ["background-color", "color"];
		const opts = { story: PAINT_STORY, selector: PAINT_SELECTOR, props } as const;
		const charcoalLight = await probeComputed(page, { ...opts, brand: "charcoal", mode: "light" });
		const charcoalDark = await probeComputed(page, { ...opts, brand: "charcoal", mode: "dark" });
		const neutralLight = await probeComputed(page, { ...opts, brand: "default", mode: "light" });

		// A painted colour, not a token read. Button primary sets its background as
		// an inline style, so this is the one assertion in the file that could not
		// be replaced by parsing CSS.
		expect
			.soft(charcoalLight["background-color"], "charcoal light button fill")
			.toBe(hexToRgb("#b0722a"));
		expect
			.soft(charcoalDark["background-color"], "charcoal dark button fill")
			.toBe(hexToRgb("#b0722a"));
		expect.soft(charcoalLight.color, "charcoal light button ink").toBe(hexToRgb("#161616"));
		expect.soft(charcoalDark.color, "charcoal dark button ink").toBe(hexToRgb("#161616"));
		// The negative half: without the brand the same element paints the design
		// system's amber, which is what makes the charcoal readings attributable.
		expect
			.soft(neutralLight["background-color"], "default brand button fill")
			.toBe(hexToRgb("#f59e0b"));

		// Recorded rather than assumed: if a Storybook upgrade drops the globals
		// query parameter, the helper falls back to driving the DOM directly and
		// this is where that shows up.
		console.log(
			`brand axis applied via url-globals ${probeMeta.urlGlobals}x, direct-dom ${probeMeta.directDom}x`,
		);
		expect(probeMeta.directDom + probeMeta.urlGlobals, "probes performed").toBeGreaterThan(0);
	});
});
