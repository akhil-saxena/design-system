import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname);
const tokensCss = readFileSync(join(SRC, "tokens.css"), "utf8");

/** Extract the declarations inside the first `{...}` block of a selector. */
function block(css: string, selector: string): string {
	const start = css.indexOf(selector);
	if (start === -1) throw new Error(`selector not found: ${selector}`);
	const open = css.indexOf("{", start);
	// Token blocks are flat (no nesting), so the next `}` at column 0 closes it.
	const close = css.indexOf("\n}", open);
	return css.slice(open, close);
}

function declaredIn(css: string): Set<string> {
	const out = new Set<string>();
	for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) out.add(m[1]!);
	return out;
}

/**
 * Raw declaration count for a block — deliberately NOT deduplicated.
 * `declaredIn` returns a Set, so a name declared twice in one block collapses
 * to one entry and every name-set comparison stays green. "Same count" is only
 * a checkable claim against the raw tally.
 */
function declarationCount(css: string): number {
	return [...css.matchAll(/^\s*--[a-z0-9-]+\s*:/gim)].length;
}

const lightTokens = declaredIn(block(tokensCss, ":root {"));
const darkTokens = declaredIn(block(tokensCss, ":root.dark,"));

/**
 * The charcoal brand layer, parsed with the *same* block()/declaredIn() the
 * default theme uses. One parser and one WCAG formula serve both themes, so a
 * disagreement between them is a real disagreement rather than an artefact of
 * a second implementation.
 */
const charcoalCss = readFileSync(join(SRC, "themes/charcoal.css"), "utf8");
const CHARCOAL_LIGHT = ':root[data-brand="charcoal"] {';
const CHARCOAL_DARK = ':root[data-brand="charcoal"].dark {';
const charcoalLight = declaredIn(block(charcoalCss, CHARCOAL_LIGHT));
const charcoalDark = declaredIn(block(charcoalCss, CHARCOAL_DARK));

/** Every source file that can reference a token. */
function walk(dir: string, acc: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) walk(p, acc);
		else if (/\.(css|tsx?|mdx)$/.test(entry) && !entry.endsWith(".d.ts")) acc.push(p);
	}
	return acc;
}
const sourceFiles = walk(SRC);

/**
 * Tokens that are legitimately not declared in tokens.css:
 *  - set inline by a component on its own subtree, as a documented knob
 *  - scoped entirely to the standalone Overview landing page
 */
const COMPONENT_SCOPED = /^--(ds-sidebar-w|ds-snackbar-offset|ov-[a-z0-9-]+)$/;

describe("token layer", () => {
	it("declares a light value for every token the dark theme overrides", () => {
		// A token that exists only under .dark silently resolves to nothing in
		// light mode. --rule-strong shipped that way.
		const darkOnly = [...darkTokens].filter((t) => !lightTokens.has(t));
		expect(darkOnly).toEqual([]);
	});

	it("defines every custom property referenced anywhere in src", () => {
		// The regression this guards: a wave of components was authored against
		// --font-body / --font-display / --font-mono while the token layer only
		// defined --font / --display / --mono, so 28 font-family declarations
		// were dropped by the browser as invalid at computed-value time.
		const missing = new Map<string, string[]>();
		for (const file of sourceFiles) {
			const text = readFileSync(file, "utf8");
			// Strip local declarations — a file may define its own scoped vars.
			const localDecls = declaredIn(text);
			for (const m of text.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) {
				const name = m[1]!;
				if (lightTokens.has(name)) continue;
				if (localDecls.has(name)) continue;
				if (COMPONENT_SCOPED.test(name)) continue;
				const where = missing.get(name) ?? [];
				where.push(file.replace(`${SRC}/`, ""));
				missing.set(name, where);
			}
		}
		expect(Object.fromEntries(missing)).toEqual({});
	});

	it("routes every focus indicator through the --focus / --focus-ring tokens", () => {
		// Five different focus treatments used to coexist: outline var(--amber),
		// outline var(--amber-d), and three hand-rolled halos at 0.12 / 0.25 /
		// 0.35 alpha. Only *focus* rules are checked — an amber hover halo on a
		// slider thumb or an amber elevation shadow on StickyNote is a
		// deliberate, non-indicator use of the accent.
		const primitives = readFileSync(join(SRC, "primitives.css"), "utf8");
		const offenders: string[] = [];
		for (const m of primitives.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
			const selector = m[1]!.trim();
			const body = m[2]!;
			if (!/:focus/.test(selector)) continue;
			if (/rgba\(245,\s*158,\s*11/.test(body) || /var\(--amber(-d)?\)/.test(body)) {
				offenders.push(selector.split("\n").pop()!.trim());
			}
		}
		expect(offenders).toEqual([]);
	});

	it("uses the layering scale instead of ad-hoc z-index values", () => {
		// ActionSheet at 61 and Popover at 100 rendered *behind* a Modal at 1000.
		const primitives = readFileSync(join(SRC, "primitives.css"), "utf8");
		const bare = (primitives.match(/z-index:\s*[0-9]+/g) ?? []).filter(
			// 0/1/2 are local stacking within a component's own subtree.
			(d) => !/z-index:\s*[012]\b/.test(d),
		);
		expect(bare).toEqual([]);
	});

	it("restates every charcoal light token in the charcoal dark block", () => {
		// The mechanism, not just the rule. A charcoal token declared only in the
		// light block still resolves at (0,2,0) in dark mode, which *ties*
		// ":root.dark" at (0,2,0). The tie is then decided by whichever stylesheet
		// the bundler emitted last, and the two possible orders produce two
		// DIFFERENT wrong answers: charcoal's light value painted in dark mode, or
		// charcoal dropped in dark mode entirely. Light mode never breaks, because
		// (0,2,0) beats ":root" at (0,1,0) unconditionally — which is exactly why
		// this class of bug ships unnoticed.
		const lightOnly = [...charcoalLight].filter((t) => !charcoalDark.has(t));
		expect(lightOnly).toEqual([]);
	});

	it("declares a charcoal light value for every token charcoal dark overrides", () => {
		// The same shape as the tokens.css assertion at the top of this group, and
		// it catches the same real regression (--rule-strong shipped dark-only).
		// Not redundant with the mirror above: one-directional exhaustiveness would
		// satisfy charcoal's own invariant while violating the design system's,
		// because charcoal's dark block redefines --shadow-1/2/3 and its light
		// block must therefore restate them.
		const darkOnly = [...charcoalDark].filter((t) => !charcoalLight.has(t));
		expect(darkOnly).toEqual([]);
	});

	it("parses a whole charcoal block rather than a truncated one", () => {
		// block() closes on the first `\n}` — a brace at column 0. Indent the
		// charcoal closing brace by one space, or nest a rule inside the block, and
		// the slice truncates, declaredIn() returns nearly nothing, both set
		// differences above are trivially empty and the mirror passes for the WRONG
		// REASON. A floor rather than the exact count, so the additive growth this
		// phase and 06.1 will keep doing does not need a test edit.
		const truncated = [
			"is not a small theme, it is a TRUNCATED PARSE:",
			"check src/themes/charcoal.css for an indented closing brace or a nested",
			"rule inside the charcoal block. block() closes on the first",
			"newline-plus-brace at column 0, so a stray one truncates the slice.",
		].join(" ");
		expect(charcoalLight.size, `charcoal light ${truncated}`).toBeGreaterThanOrEqual(25);
		expect(charcoalDark.size, `charcoal dark ${truncated}`).toBeGreaterThanOrEqual(25);

		// The floor above catches an UNDER-parse, and on its own that is only half
		// the job — measured, not assumed. Indenting the LIGHT block's closing
		// brace does not truncate this file, it OVER-parses: the next brace at
		// column 0 is the dark block's, so the light slice swallows the dark block
		// whole and returns the same 49 names. The floor sails through at 49 >= 25
		// and both mirrors pass, because a set unioned with itself equals itself.
		// So assert the structural precondition block() actually depends on. This
		// is charcoal.css's own stated contract — its header requires exactly two
		// lines beginning with a closing brace — and it is what makes an indented
		// brace, a nested rule and a stray at-rule all fail loudly instead of
		// quietly changing which declarations get measured.
		const closers = (charcoalCss.match(/^}/gm) ?? []).length;
		expect(closers, "charcoal.css must have exactly one closing brace at column 0 per block").toBe(
			2,
		);
		expect(
			block(charcoalCss, CHARCOAL_LIGHT).includes(CHARCOAL_DARK),
			"the charcoal light slice ran on into the dark block — its closing brace is indented",
		).toBe(false);
	});

	it("declares the same number of charcoal tokens in both blocks", () => {
		expect(charcoalLight.size).toBe(charcoalDark.size);
		// The line above compares Set sizes, and the two mirrors already imply it
		// for name sets — so on its own it can never be the thing that goes red.
		// The failure it is *supposed* to catch, a name declared twice in one
		// block, is absorbed by the Set before it is ever compared. Count the raw
		// declarations too, or "same count, same names" is half unchecked.
		expect(declarationCount(block(charcoalCss, CHARCOAL_LIGHT))).toBe(charcoalLight.size);
		expect(declarationCount(block(charcoalCss, CHARCOAL_DARK))).toBe(charcoalDark.size);
	});
});

// ── Contrast ────────────────────────────────────────────────────────────────
function srgb(c: number) {
	const v = c / 255;
	return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string) {
	const h = hex.replace("#", "");
	const full =
		h.length === 3
			? h
					.split("")
					.map((c) => c + c)
					.join("")
			: h;
	const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
	return 0.2126 * srgb(r!) + 0.7152 * srgb(g!) + 0.0722 * srgb(b!);
}
function contrast(a: string, b: string) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi! + 0.05) / (lo! + 0.05);
}

/**
 * Resolve a token to its literal hex in a given theme, following `var()`
 * aliases. Falls back to the light `:root` block when the theme does not
 * override the token — which is how the cascade actually behaves, and is what
 * lets `--focus: var(--amber-d)` declared once on `:root` pick up the dark
 * `--amber-d` value under `.dark`.
 */
function resolve(css: string, selector: string, name: string): string {
	const read = (sel: string) => {
		const re = new RegExp(`${name}:\\s*([^;]+);`);
		return block(css, sel).match(re)?.[1]?.trim();
	};
	const raw = read(selector) ?? read(":root {");
	if (!raw) throw new Error(`${name} not declared in ${selector} or :root`);
	const alias = raw.match(/var\((--[a-z0-9-]+)\)/);
	return alias ? resolve(css, selector, alias[1]!) : raw;
}

describe("token contrast (WCAG)", () => {
	const LIGHT = ":root {";
	const DARK = ":root.dark,";
	// The lightest surfaces in light mode / darkest-contrast surfaces in dark.
	const lightSurfaces = ["--cream", "--cream-2", "--cream-3", "--panel", "--bg", "--paper-deep"];
	const darkSurfaces = lightSurfaces;

	it("muted text steps clear AA (4.5:1) on every surface, in both themes", () => {
		// --ink-4 measured 1.96:1 on --cream-3 in dark mode while being used as a
		// text colour in ~28 places; --ink-3 measured 3.44:1.
		const failures: string[] = [];
		for (const [mode, sel] of [
			["light", LIGHT],
			["dark", DARK],
		] as const) {
			for (const ink of ["--ink", "--ink-2", "--ink-3", "--ink-4"]) {
				for (const surf of mode === "light" ? lightSurfaces : darkSurfaces) {
					const ratio = contrast(resolve(tokensCss, sel, ink), resolve(tokensCss, sel, surf));
					if (ratio < 4.5) failures.push(`${mode} ${ink} on ${surf} = ${ratio.toFixed(2)}`);
				}
			}
		}
		expect(failures).toEqual([]);
	});

	it("the focus indicator clears the 3:1 non-text contrast floor (WCAG 1.4.11)", () => {
		// The brand --amber reaches only 2.09:1 on --cream, so --focus is keyed to
		// --amber-d instead.
		const failures: string[] = [];
		for (const [mode, sel] of [
			["light", LIGHT],
			["dark", DARK],
		] as const) {
			const ring = resolve(tokensCss, sel, "--focus");
			for (const surf of lightSurfaces) {
				const ratio = contrast(ring, resolve(tokensCss, sel, surf));
				if (ratio < 3) failures.push(`${mode} focus on ${surf} = ${ratio.toFixed(2)}`);
			}
		}
		expect(failures).toEqual([]);
	});
});

/**
 * Inset surfaces — the unfilled part of a slider or progress track, and the
 * skeleton placeholder — must be visible against the page they sit on.
 *
 * All three were painted with `--cream-2`, the *raised* surface token, which
 * sits 1.06:1 against the page: a slider showed no groove at all and a skeleton
 * showed nothing. Nothing caught it, because `--cream-2` is a legitimate token
 * and axe only assesses text contrast.
 *
 * The threshold is deliberately below WCAG 1.4.11's 3:1. That rule governs the
 * parts needed to *identify* a control — here the thumb and the filled portion,
 * which clear it comfortably. The unfilled groove only has to be perceivable,
 * and forcing it to 3:1 would mean a near-black track on a white page.
 */
describe("inset surface visibility", () => {
	const css = tokensCss;

	/** Composite a translucent token over an opaque backdrop. */
	function over(rgba: string, backdrop: string): string {
		const n = (rgba.match(/[\d.]+/g) ?? []).map(Number);
		const a = n.length > 3 ? (n[3] as number) : 1;
		const bg = [1, 3, 5].map((i) => Number.parseInt(backdrop.slice(i, i + 2), 16));
		const out = [0, 1, 2].map((i) =>
			Math.round((n[i] as number) * a + (bg[i] as number) * (1 - a)),
		);
		return `#${out.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
	}

	for (const [theme, selector, page] of [
		["light", ":root {", "#fcfcfc"],
		["dark", ":root.dark,", "#181818"],
	] as const) {
		it(`--track is a translucent ink in ${theme}, not a surface alias`, () => {
			// Asserted on the declared value, not only on a computed ratio: the point
			// of the token is that it composites, so it holds the same contrast on the
			// page, on a card and on a panel. An opaque surface token — which is what
			// `--cream-2` was — only ever works on one backdrop.
			expect(resolve(css, selector, "--track")).toMatch(/^rgba\(/);
		});

		it(`--track is perceivable against the ${theme} page`, () => {
			const painted = over(resolve(css, selector, "--track"), page);
			expect(contrast(painted, page)).toBeGreaterThanOrEqual(1.35);
		});

		it(`--fill-disabled reads against the ${theme} track, not into it`, () => {
			// A disabled fill that matches the groove behind it conveys nothing. This
			// is why dark cannot reuse --ink-5, which is darker than the track there.
			const track = over(resolve(css, selector, "--track"), page);
			const fill = resolve(css, selector, "--fill-disabled");
			expect(contrast(fill, track)).toBeGreaterThanOrEqual(1.4);
		});
	}
});
