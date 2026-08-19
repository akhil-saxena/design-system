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

/**
 * E3, E4, E5 — the consumer styling boundary, read in a real browser.
 *
 * All three findings are one bug in three places: an inline style beating a
 * class rule without `!important`. Every claim below is a getComputedStyle
 * read, because that is the only kind of evidence that can tell the difference
 * between a declaration being present and a declaration applying — which is the
 * entire content of the three findings.
 *
 * Both brands, both modes. Charcoal is where the consequences land (`--ink-2`
 * is #44403a light and #c9c5bc dark under charcoal), so a default-brand-only
 * check would miss a token that resolves in one brand and not the other.
 */
const BOUNDARY_CELLS = [
	{ brand: "default", mode: "light" },
	{ brand: "default", mode: "dark" },
	{ brand: "charcoal", mode: "light" },
	{ brand: "charcoal", mode: "dark" },
] as const;

/**
 * Apply a consumer stylesheet — and the class that selects it — to an element
 * already rendered in a settled cell, then read it again.
 *
 * `probeComputed` leaves the page on the story in the requested brand x mode,
 * so this re-reads the same element in the same cell without duplicating any of
 * the axis-settling logic that lives in computed.ts.
 *
 * `classList.add` is a faithful stand-in for `<Card className="wk-card">` for
 * E3 and E5, because what those two turn on is a CASCADE fact rather than a
 * rendering one: after the fix React emits exactly `ds-atom-card wk-card`, and
 * before the fix the inline declaration is still on the element and still wins.
 * So this probe discriminates fixed from unfixed, which is the only property
 * that matters.
 *
 * E4 is deliberately NOT probed that way. Its defect is that React DROPPED the
 * atom class, so adding the class back by hand would be testing this helper
 * rather than the component. No story passes a className, so E4's concatenation
 * is proven at DOM level in src/inputs/Chip/Chip.test.tsx, and what is proven
 * here is its consequence: that the `[data-interactive]` rules reach a chip
 * which also carries a consumer class.
 */
async function withConsumerRule(
	page: import("@playwright/test").Page,
	opts: {
		selector: string;
		className: string;
		css: string;
		props: string[];
		attrs?: Record<string, string>;
	},
): Promise<Record<string, string>> {
	await page.addStyleTag({ content: opts.css });
	return await page.evaluate(
		(arg: {
			selector: string;
			className: string;
			props: string[];
			attrs: Record<string, string>;
		}) => {
			const el = document.querySelector(arg.selector);
			if (!el) throw new Error(`withConsumerRule found no element for ${arg.selector}`);
			el.classList.add(arg.className);
			for (const [k, v] of Object.entries(arg.attrs)) el.setAttribute(k, v);
			const cs = getComputedStyle(el);
			const out: Record<string, string> = { class: el.getAttribute("class") ?? "" };
			for (const p of arg.props) out[p] = cs.getPropertyValue(p).trim();
			return out;
		},
		{
			selector: opts.selector,
			className: opts.className,
			props: opts.props,
			attrs: opts.attrs ?? {},
		},
	);
}

test.describe("consumer styling boundary", () => {
	test("E3 — a consumer stylesheet can set display on a Card", async ({ page }) => {
		const readings: string[] = [];
		for (const cell of BOUNDARY_CELLS) {
			const bare = await probeComputed(page, {
				story: "surfaces-card--default",
				brand: cell.brand,
				mode: cell.mode,
				selector: ".ds-atom-card",
				props: ["display", "box-sizing", "font-family"],
			});
			expect
				.soft(bare.display, `${cell.brand}/${cell.mode}: the default must not move`)
				.toBe("block");
			expect.soft(bare["box-sizing"]).toBe("border-box");

			const after = await withConsumerRule(page, {
				selector: ".ds-atom-card",
				className: "wk-card",
				css: ".wk-card { display: flex; flex-direction: column; }",
				props: ["display", "flex-direction"],
			});
			expect
				.soft(after.display, `${cell.brand}/${cell.mode}: consumer display must apply`)
				.toBe("flex");
			// flex-direction applied even BEFORE the fix — it was never inlined.
			// Reading it proves the consumer rule matched, so a failure on display
			// cannot be explained away as a selector that missed.
			expect.soft(after["flex-direction"]).toBe("column");
			readings.push(
				`E3 ${cell.brand}/${cell.mode}: bare display=${bare.display} box-sizing=${bare["box-sizing"]} font-family=${bare["font-family"]} | consumer display=${after.display} flex-direction=${after["flex-direction"]} class="${after.class}"`,
			);
		}
		console.log(readings.join("\n"));
	});

	test("E4 — an interactive Chip keeps the atom hook alongside a consumer class", async ({
		page,
	}) => {
		const readings: string[] = [];
		for (const cell of BOUNDARY_CELLS) {
			const bare = await probeComputed(page, {
				story: "inputs-chip--default",
				brand: cell.brand,
				mode: cell.mode,
				selector: ".ds-atom-chip",
				props: ["cursor", "color", "background-color"],
			});
			const bareClass = await page.evaluate(
				() => document.querySelector(".ds-atom-chip")?.getAttribute("class") ?? "",
			);
			expect
				.soft(bareClass, `${cell.brand}/${cell.mode}: a bare chip renders only the atom class`)
				.toBe("ds-atom-chip");

			const after = await withConsumerRule(page, {
				selector: ".ds-atom-chip",
				className: "wk-chip",
				css: ".wk-chip { border-radius: 4px; }",
				props: ["cursor"],
				attrs: { "data-interactive": "true" },
			});
			expect
				.soft(
					after.cursor,
					`${cell.brand}/${cell.mode}: [data-interactive] must still reach a chip that carries a consumer class`,
				)
				.toBe("pointer");
			readings.push(
				`E4 ${cell.brand}/${cell.mode}: bare class="${bareClass}" cursor=${bare.cursor} color=${bare.color} bg=${bare["background-color"]} | +consumer class="${after.class}" cursor=${after.cursor}`,
			);
		}
		console.log(readings.join("\n"));
	});

	test("E5 — a consumer stylesheet can recolour a Text that was given no tone", async ({
		page,
	}) => {
		const readings: string[] = [];
		for (const cell of BOUNDARY_CELLS) {
			const bare = await probeComputed(page, {
				story: "foundation-text--default",
				brand: cell.brand,
				mode: cell.mode,
				selector: ".ds-atom-text",
				props: ["color"],
			});
			const after = await withConsumerRule(page, {
				selector: ".ds-atom-text",
				className: "wk-red",
				css: ".wk-red { color: rgb(255, 0, 0); }",
				props: ["color"],
			});
			expect
				.soft(after.color, `${cell.brand}/${cell.mode}: consumer colour must apply`)
				.toBe("rgb(255, 0, 0)");
			expect
				.soft(bare.color, `${cell.brand}/${cell.mode}: the variant default must not already be red`)
				.not.toBe("rgb(255, 0, 0)");
			readings.push(
				`E5 ${cell.brand}/${cell.mode}: body default color=${bare.color} | with consumer class=${after.color}`,
			);
		}
		console.log(readings.join("\n"));
	});

	test("E5 — `tone` outranks a consumer class by specificity, not by load order", async ({
		page,
	}) => {
		// The contract the docstring states: passing `tone` means the component
		// owns the colour. `.ds-atom-text[data-tone=…]` is (0,2,0) against a
		// consumer's (0,1,0), so it holds however the sheets are ordered — and the
		// consumer sheet here is injected LAST, which is the ordering that would
		// win if this were decided by source order. jsdom cannot check this at all
		// (it implements no specificity), which is why it lives in a browser.
		const readings: string[] = [];
		for (const cell of BOUNDARY_CELLS) {
			const bare = await probeComputed(page, {
				story: "foundation-text--tones",
				brand: cell.brand,
				mode: cell.mode,
				selector: '.ds-atom-text[data-tone="muted"]',
				props: ["color"],
			});
			const after = await withConsumerRule(page, {
				selector: '.ds-atom-text[data-tone="muted"]',
				className: "wk-red",
				css: ".wk-red { color: rgb(255, 0, 0); }",
				props: ["color"],
			});
			expect
				.soft(after.color, `${cell.brand}/${cell.mode}: the tone rule must still win`)
				.toBe(bare.color);
			expect.soft(after.color).not.toBe("rgb(255, 0, 0)");
			readings.push(
				`E5-tone ${cell.brand}/${cell.mode}: tone=muted color=${bare.color} | after a later consumer rule=${after.color}`,
			);
		}
		console.log(readings.join("\n"));
	});
});
