import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
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
 *  - declared by a component on its OWN CLASS in primitives.css, as a knob a
 *    consumer or a media query can read and re-declare. --ds-appbar-h and
 *    --ds-sidebar-w are both this shape, and it is the shape new
 *    component-scoped knobs must use.
 *  - set inline by a component on its own subtree, as a documented knob
 *    (--ds-snackbar-offset). Kept working, but NOT the pattern to copy: an
 *    inline custom property is fixed at construction, so no media query,
 *    container query or density axis can drive it. --ds-sidebar-w used to be
 *    this shape, which is why UI-SPEC's 208px compact sidebar was measured as
 *    unreachable (finding E2); plan 01-13 moved it to the class, so the only
 *    remaining inline write is the explicit `sidebarWidth` prop, documented on
 *    the prop as an author-level override that trades reachability away.
 *  - scoped entirely to the standalone Overview landing page
 *
 * They are all absent from tokens.css for the same reason: they are component
 * geometry, not theme values, so a brand has no business overriding them
 * wholesale.
 */
const COMPONENT_SCOPED = /^--(ds-appbar-h|ds-sidebar-w|ds-snackbar-offset|ov-[a-z0-9-]+)$/;

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

/**
 * THE SEAM between the two exhaustiveness checks above, which is where the
 * amber focus ring lived undetected through fifteen plans.
 *
 * The mirrors above compare charcoal's own two blocks against each other, and
 * the tokens.css mirror compares its dark block against its light one. Neither
 * can see a token that tokens.css overrides in ITS OWN dark block while
 * charcoal never mentions it at all: such a token is in lightTokens and in
 * darkTokens, so the first mirror is satisfied, and it is in neither
 * charcoalLight nor charcoalDark, so both charcoal mirrors are satisfied
 * vacuously. --focus-ring-soft was exactly that shape. It spelled --amber-d as
 * an rgba literal in both tokens.css blocks, so charcoal's `--focus` rebinding
 * could not reach it, and every focused text field in charcoal dark drew a
 * #fbbf24 glow at 30% around an ochre border. No contrast gate samples it
 * because it is a box-shadow, and no exhaustiveness gate compared it because
 * charcoal never overrode it.
 *
 * So assert reachability directly rather than symmetry: a brand-accent colour
 * spelled as a LITERAL in tokens.css is unreachable by any brand, and charcoal
 * must therefore redeclare the token that carries it.
 */
describe("brand accent reach", () => {
	/** Comments are not declarations. Strip them, or a token name mentioned in
	 * prose satisfies the gate and a hex quoted in prose fails it. */
	const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

	/** Parsed NAME/VALUE pairs — literals are only ever read from the value. */
	function valueDecls(css: string): [string, string][] {
		const out: [string, string][] = [];
		for (const m of stripComments(css).matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim))
			out.push([m[1]!, m[2]!.replace(/\s+/g, " ").trim()]);
		return out;
	}

	/** Every sRGB literal in a value, as 8-bit channels. */
	function literals(value: string): [string, [number, number, number]][] {
		const out: [string, [number, number, number]][] = [];
		for (const m of value.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
			const h = m[1]!;
			out.push([
				m[0]!,
				[
					Number.parseInt(h.slice(0, 2), 16),
					Number.parseInt(h.slice(2, 4), 16),
					Number.parseInt(h.slice(4, 6), 16),
				],
			]);
		}
		for (const m of value.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g))
			out.push([`${m[0]!})`, [Number(m[1]), Number(m[2]), Number(m[3])]]);
		return out;
	}

	function hue([r, g, b]: [number, number, number]): number | null {
		const mx = Math.max(r, g, b);
		const d = mx - Math.min(r, g, b);
		if (d === 0) return null;
		const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		return (((h * 60) % 360) + 360) % 360;
	}

	/**
	 * A BRAND accent, as opposed to a warm-tinted neutral or a status colour.
	 * Two axes, both needed, and the thresholds are the reason this gate does
	 * not have an allowlist to erode:
	 *
	 *  - channel spread >= 60/255 is chroma. It admits the amber ramp (#b45309
	 *    spreads 171, #fbbf24 spreads 215) and rejects warm-tinted NEUTRALS,
	 *    which charcoal is entitled to inherit: --g-bd spreads 28,
	 *    --fill-disabled 12, the dark --g-bg 4.
	 *  - hue 18-70 is the amber/ochre wedge. It rejects the status reds, which
	 *    charcoal deliberately shares rather than rebrands: every one of them
	 *    sits at hue 0-3.5 (--red, --red-ink, --red-vivid, --error-ring).
	 */
	const SPREAD_MIN = 60;
	const isBrandAccent = (rgb: [number, number, number]) => {
		const h = hue(rgb);
		return h !== null && Math.max(...rgb) - Math.min(...rgb) >= SPREAD_MIN && h >= 18 && h <= 70;
	};

	it("rejects a comment and rejects a status red, so the two axes are real", () => {
		// The gate must read declarations, not prose.
		expect(valueDecls("/* --x: #fbbf24; */\n--y: #101010;").map(([n]) => n)).toEqual(["--y"]);
		// Amber ramp in, status reds and warm neutrals out.
		expect(isBrandAccent([180, 83, 9])).toBe(true); // --amber-d light
		expect(isBrandAccent([251, 191, 36])).toBe(true); // --amber-d dark
		expect(isBrandAccent([184, 70, 63])).toBe(false); // --error-ring light, hue 3.5
		expect(isBrandAccent([240, 164, 160])).toBe(false); // --error-ring dark, hue 3.0
		expect(isBrandAccent([247, 236, 219])).toBe(false); // --g-bd, spread 28
	});

	it("leaves no brand-accent literal in tokens.css beyond charcoal's reach", () => {
		const unreachable: string[] = [];
		for (const [mode, sel] of [
			["light", ":root {"],
			["dark", ":root.dark,"],
		] as const)
			for (const [name, value] of valueDecls(block(tokensCss, sel)))
				for (const [lit, rgb] of literals(value))
					if (isBrandAccent(rgb) && !charcoalLight.has(name))
						unreachable.push(
							`tokens.css ${mode} ${name}: ${lit} is a brand accent charcoal cannot reach`,
						);
		expect(unreachable).toEqual([]);
	});

	it("smuggles no accent hue into charcoal itself", () => {
		// The bypass the case above cannot see: redeclare the token INSIDE
		// charcoal and paint it amber anyway.
		//
		// This assertion used to compare charcoal's own literals against its ochre
		// ramp, and that premise is gone: charcoal is near-monochrome and HAS no
		// accent ramp to compare against. The successor is strictly stronger and
		// needs no reference set at all - charcoal may declare NO brand-accent
		// literal whatsoever. A set-difference gate can pass vacuously on an empty
		// reference; "there are none" cannot.
		const foreign: string[] = [];
		let scanned = 0;
		for (const [mode, sel] of [
			["light", CHARCOAL_LIGHT],
			["dark", CHARCOAL_DARK],
		] as const)
			for (const [name, value] of valueDecls(block(charcoalCss, sel)))
				for (const [lit, rgb] of literals(value)) {
					scanned++;
					if (isBrandAccent(rgb))
						foreign.push(
							`charcoal ${mode} ${name}: ${lit} is an accent hue, and charcoal has no accent hue`,
						);
				}
		// Anti-vacuity, in the one form that still applies: the scan must actually
		// have parsed charcoal's literals. A parse that yields nothing would report
		// "no accent found" for the wrong reason, which is the failure mode this
		// file has shipped before.
		expect(scanned, "parsed no colour literals out of charcoal at all").toBeGreaterThanOrEqual(20);
		expect(foreign).toEqual([]);
	});
});

// ── Contrast ────────────────────────────────────────────────────────────────
function srgb(c: number) {
	const v = c / 255;
	return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
/**
 * THROWS on anything it cannot measure, and that is the point rather than
 * defensive habit.
 *
 * This function used to accept any string and reach for `slice(0, 2)` on it. Fed
 * a translucent token — `--surf-2` is `rgba(255, 255, 255, 0.055)` in dark —
 * `Number.parseInt("rg", 16)` returns NaN, every channel is NaN, and the
 * luminance is NaN. `contrast()` then returns NaN, and the caller's guard is
 * `if (ratio < 4.5)`, which is FALSE for NaN. So the surface was not measured
 * leniently; it was not measured at all, and the gate reported no failure.
 *
 * That is exactly how the `Data Display/Tabs > DarkMode` axe failure reached a
 * release branch. The Tabs pill track was painted with `--surf-2`, `--ink-3`
 * composited to 4.47:1 on it, and adding `--surf-2` to the surface list below
 * would have LOOKED like it closed the gap while measuring nothing. A silent
 * pass is worse than a crash here, so this throws.
 */
function luminance(color: string) {
	const rgb = parseColor(color);
	// Refuse a translucent colour outright rather than measuring it as if the
	// alpha were 1. Parsing it was not enough: fed --surf-2 directly, an
	// alpha-blind reading treats rgba(255,255,255,0.055) as near-white and
	// reports --ink on it as 1.17:1 — a confident number about a surface that is
	// not painted anywhere. Callers must composite with flatten() first, which
	// makes the backdrop an explicit argument instead of an assumption.
	if (rgb[3] !== 1) {
		throw new Error(
			`luminance(): ${JSON.stringify(color)} is translucent (alpha ${rgb[3]}). Composite it onto a backdrop with flatten(colour, backdrop) first — a translucent surface has no contrast ratio of its own.`,
		);
	}
	return 0.2126 * srgb(rgb[0]) + 0.7152 * srgb(rgb[1]) + 0.0722 * srgb(rgb[2]);
}

/** `#abc` / `#aabbcc` / `rgb(...)` / `rgba(...)` -> channels. Throws otherwise. */
function parseColor(color: string): [number, number, number, number] {
	const v = color.trim();
	const fn = v.match(/^rgba?\(([^)]+)\)$/i);
	if (fn) {
		const parts = (fn[1] ?? "")
			.split(/[,\s/]+/)
			.filter(Boolean)
			.map(Number);
		if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) {
			throw new Error(`luminance(): unparseable rgb() colour ${JSON.stringify(color)}`);
		}
		const a = parts.length > 3 ? (parts[3] as number) : 1;
		return [parts[0] as number, parts[1] as number, parts[2] as number, a];
	}
	if (!/^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(v)) {
		throw new Error(
			`luminance(): ${JSON.stringify(color)} is not a colour this gate can measure. Returning NaN here would make the caller's threshold comparison false and report a pass for a surface that was never measured.`,
		);
	}
	const h = v.replace("#", "");
	const full =
		h.length === 3
			? h
					.split("")
					.map((c) => c + c)
					.join("")
			: h;
	const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
	return [r as number, g as number, b as number, 1];
}

/** Composite a possibly-translucent colour down onto an opaque backdrop. */
function flatten(color: string, backdrop: string): string {
	const [r, g, b, a] = parseColor(color);
	if (a === 1) return color;
	const [br, bg, bb] = parseColor(backdrop);
	const mix = [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
	return `#${mix.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
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
	// The OPAQUE surface stops. Named precisely because the previous comment
	// said "every surface" and the test name claimed it too, while the list
	// held only these six — `--surf-2` and `--surf-3` are surfaces by role and
	// are used as `background` in 29 rules in primitives.css, and neither was
	// ever measured. The translucent stops are covered by the case below.
	const lightSurfaces = ["--cream", "--cream-2", "--cream-3", "--panel", "--bg", "--paper-deep"];
	const darkSurfaces = lightSurfaces;
	/** Surfaces declared as a translucent veil, which must be composited first. */
	const veils = ["--surf-2", "--surf-3"];

	it("muted text steps clear AA (4.5:1) on every OPAQUE surface stop, in both themes", () => {
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

	/**
	 * The translucent stops, composited — the gap that let the Tabs failure ship.
	 *
	 * `--surf-2` / `--surf-3` are white veils. Which way they move contrast
	 * depends on the mode, and that asymmetry is the whole finding:
	 *
	 *   in LIGHT a white veil lightens the surface under DARK text, so contrast
	 *   RISES and every ink step is safe by construction;
	 *   in DARK the same veil lightens the surface under LIGHT text, so contrast
	 *   FALLS, and the muted steps stop clearing AA.
	 *
	 * So light asserts all four steps and dark asserts only the two that hold.
	 * `--ink-3` / `--ink-4` on a dark veil are a KNOWN boundary, not an
	 * oversight: measured 3.85 on `--surf-2` over `--cream-3` and 3.44 on
	 * `--surf-3` over `--cream-3`. They are excluded here rather than "fixed" by
	 * brightening the ramp, because the lightest grey that would clear the worst
	 * cell is #9e9e9e, which sits midway between `--ink-3` and `--ink-2` and
	 * erases the muted step. The real invariant is a component-level one — muted
	 * text must not be placed on a translucent surface in dark — and it is
	 * asserted in the browser, against the painted result, by
	 * tests/visual/tabs-label-contrast.spec.ts.
	 */
	it("primary and secondary ink clear AA on the translucent stops too, composited", () => {
		const failures: string[] = [];
		for (const [mode, sel, stops] of [
			["light", LIGHT, lightSurfaces],
			["dark", DARK, darkSurfaces],
		] as const) {
			// Light is safe for every step; dark only for the two brightest.
			const inks =
				mode === "light" ? ["--ink", "--ink-2", "--ink-3", "--ink-4"] : ["--ink", "--ink-2"];
			for (const veil of veils) {
				const declared = resolve(tokensCss, sel, veil);
				// The veil must actually BE a veil. If someone makes it opaque this
				// case would otherwise keep passing while measuring a different thing.
				expect(declared, `${mode} ${veil} should be declared translucent`).toMatch(/^rgba\(/);
				for (const stop of stops) {
					const backdrop = resolve(tokensCss, sel, stop);
					const painted = flatten(declared, backdrop);
					for (const ink of inks) {
						const ratio = contrast(resolve(tokensCss, sel, ink), painted);
						if (ratio < 4.5) {
							failures.push(
								`${mode} ${ink} on ${veil} over ${stop} (${painted}) = ${ratio.toFixed(2)}`,
							);
						}
					}
				}
			}
		}
		expect(failures).toEqual([]);
	});

	/**
	 * The parser must refuse what it cannot measure. Guards the repair directly:
	 * before it, this call returned NaN and every `ratio < threshold` comparison
	 * against it was false, so an unmeasurable surface reported a pass.
	 */
	it("refuses to measure a colour it cannot parse, rather than returning NaN", () => {
		// Deliberately not a custom-property reference: the "defines every custom
		// property referenced anywhere in src" case greps this very file, and its
		// declaredIn() helper does NOT strip comments, so even naming that syntax
		// in a comment here would register as a reference to an undefined token.
		expect(() => contrast("#919191", "chartreuse")).toThrow(/not a colour this gate can measure/);
		expect(() => contrast("#919191", "")).toThrow(/not a colour this gate can measure/);
		// A translucent value is refused rather than read as if it were opaque —
		// reading --surf-2 alpha-blind yields a confident 1.17:1 about a surface
		// that is painted nowhere.
		expect(() => contrast("#919191", "rgba(255, 255, 255, 0.055)")).toThrow(
			/translucent \(alpha 0\.055\)/,
		);
		// And it DOES measure that same value once composited.
		expect(contrast("#919191", flatten("rgba(255, 255, 255, 0.055)", "#1f1f1f"))).toBeCloseTo(
			4.49,
			1,
		);
	});

	/**
	 * Rule C-3 gives --wire and --rule different jobs — a control's sole boundary
	 * at the 3:1 SC 1.4.11 bar, versus a decorative hairline — but their VALUES are
	 * what keeps those jobs apart. Two tokens whose difference is a rule rather
	 * than a number erode into each other one component at a time, which is exactly
	 * what Rule C-6 says of the two ochres. If they ever resolve to the same colour,
	 * every rebinding this library did in plan 01-10 silently becomes a no-op and
	 * the browser gate in tests/visual/control-boundary.spec.ts keeps passing,
	 * because a --rule border would then measure the same 3.44:1 as a --wire one.
	 *
	 * All four cells, because the erosion only has to happen in one of them.
	 */
	it("keeps --wire and --rule distinct in both themes and both modes", () => {
		const cells = [
			["default light", tokensCss, LIGHT],
			["default dark", tokensCss, DARK],
			["charcoal light", charcoalCss, CHARCOAL_LIGHT],
			["charcoal dark", charcoalCss, CHARCOAL_DARK],
		] as const;
		const same: string[] = [];
		for (const [label, css, sel] of cells) {
			const wire = resolve(css, sel, "--wire");
			const rule = resolve(css, sel, "--rule");
			// Both must actually resolve; a typo'd token name would otherwise throw
			// inside resolve() and read as a different failure than the one meant.
			expect(wire, `--wire did not resolve in ${label}`).toBeTruthy();
			expect(rule, `--rule did not resolve in ${label}`).toBeTruthy();
			if (wire === rule) same.push(`${label}: both are ${wire}`);
		}
		expect(same, "--wire and --rule have converged, so Rule C-3 no longer has two tokens").toEqual(
			[],
		);
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
 * Charcoal's contrast register - every foreground token measured against ALL
 * THREE surfaces of its own mode, never against the page alone.
 *
 * Page-only measurement is how two wrong values survived review, and it is the
 * whole content of AAA-1: the superseded #6e6a5e muted step reads like an AA
 * pass on the page (4.79) and fails AA outright on the panel (4.46) - which is
 * exactly where admin zebra rows, disabled fields and the pending dashboard put
 * muted text. In both modes the binding constraint is the panel, the surface a
 * page-only check never sees. That makes three surfaces a rule here, not a
 * preference.
 *
 * The helpers above are reused deliberately. One WCAG formula serves both
 * themes, so a disagreement between charcoal and the default theme is a real
 * disagreement rather than a second implementation's rounding.
 */
describe("charcoal token contrast (WCAG)", () => {
	const MODES = [
		["light", CHARCOAL_LIGHT],
		["dark", CHARCOAL_DARK],
	] as const;

	/**
	 * page / paper / panel, read through resolve() rather than hardcoded, so
	 * remapping a surface alias is caught instead of silently measuring against
	 * a literal that no longer matches the theme.
	 *   light  #f4f1ea / #fbf9f4 / #ede9e0
	 *   dark   #161616 / #1e1e1d / #242423
	 */
	const SURFACES = [
		["page", "--cream"],
		["paper", "--cream-2"],
		["panel", "--cream-3"],
	] as const;

	/**
	 * The three bars, with the contract's measured values recorded beside each
	 * so a reader can see exactly what moved. Order is page / paper / panel.
	 *
	 * Every figure below was RECOMPUTED when charcoal went near-monochrome in
	 * plan 01-22. The surfaces themselves moved, so not one number here is
	 * carried over from the warm palette.
	 *
	 * 7:1 AAA - D-46's targeted AAA, adopted rather than contingent
	 *   --ink-3           light  7.44  7.63  7.06    dark  8.21  7.56  7.02
	 *   --ink-4           an alias of --ink-3, so the two cannot diverge by mode
	 *   --ochre-d-strong  light  7.92  8.13  7.52    dark  9.00  8.29  7.70
	 *
	 * 4.5:1 AA - body text
	 *   --ink             light 18.07 18.54 17.16    dark 17.37 16.00 14.86
	 *   --ink-2           light  9.57  9.82  9.08    dark 10.61  9.77  9.08
	 *   --ochre-d         light  5.63  5.78  5.35    dark  6.52  6.01  5.58
	 *
	 * 3:1 SC 1.4.11 - non-text: a control's sole boundary, and the focus ring
	 *   --wire            light  3.38  3.47  3.21    dark  3.78  3.48  3.23
	 *   --focus           bound to --ink now, not to the accent, because a
	 *                     neutral accent is a mid grey and would make a weaker
	 *                     ring than the page's own text colour
	 *
	 * The tightest three, i.e. what a regression reaches first: 7.02 (dark
	 * --ink-3 on panel), 5.35 (light --ochre-d on panel) and 3.21 (--wire on
	 * panel in light, 3.23 in dark).
	 */
	const TIERS = [
		[7, "7:1 (AAA)", ["--ink-3", "--ink-4", "--ochre-d-strong"]],
		[4.5, "4.5:1 (AA text)", ["--ink", "--ink-2", "--ochre-d"]],
		[3, "3:1 (non-text, SC 1.4.11)", ["--wire", "--focus"]],
	] as const;

	/**
	 * The accent contract, asserted DIRECTIONALLY - the half of this register
	 * that is easy to get backwards, and rewritten a second time because its
	 * premise moved again.
	 *
	 * WHAT IT USED TO SAY, and why that is now false. Through 01-22 it asserted
	 * that THE ACCENT FILL IS LIGHT IN BOTH MODES: it did not invert, because
	 * --ink-inverse did not either. That was true of the values then declared and
	 * it was never true of the ROLE. It held only because the light-mode accent
	 * was being kept at a mid grey, which is what made the primary button read as
	 * disabled on a near-white page - 3.11 against the page, below even the 3:1
	 * floor a non-text control needs. The accent now aliases --ink in both blocks
	 * and inverts with the mode, --ink-inverse inverts with it, and a filled
	 * control is a black slab with white ink in light and a white slab with black
	 * ink in dark.
	 *
	 * The four claims below are what the monochrome accent actually rests on.
	 * None of them is obvious from the values alone, and the last two are the
	 * ones that keep this from being re-broken by the obvious "simplification".
	 *
	 *   1. THE ACCENT FILL CARRIES ITS INK, IN BOTH MODES. This is the claim the
	 *      old contract was really protecting, stated without the incidental
	 *      premise that the fill is light. It survives the inversion unchanged in
	 *      dark and improves threefold in light.
	 *
	 *   2. THE PINNED CHIPS ARE PAINTED FROM THE MODE-STABLE STEP. AppBar's
	 *      DefaultLogo hardcodes background #1c1c1a and Card's dark variant
	 *      hardcodes #1c1917. Those literals are beyond any theme's reach, so a
	 *      foreground on them must not follow the mode - and --amber now does.
	 *      Both read --amber-vivid, which is finding G3 closed at the component
	 *      instead of by holding a whole theme's accent inside a band that suited
	 *      nothing else. The bands never intersected: no value of --amber gives a
	 *      black button and a legible chip at once.
	 *
	 *   3. --amber-vivid IS THE SAME VALUE IN BOTH BLOCKS. That is the entire
	 *      reason it can serve a pinned surface, so it is asserted from the parsed
	 *      file rather than inferred from two ratios that happen to match.
	 *
	 *   4. --amber IS NOT. Stated as its own case because 3 alone would be
	 *      satisfied by flattening the accent back onto one value, which is the
	 *      change that put the grey button on the page to begin with.
	 *
	 * Pinned at 2dp in BOTH directions on purpose, exactly as the contract they
	 * replace was. A one-sided toBeGreaterThan would wave through someone quietly
	 * lightening the light-mode accent until the chips pass and the fill has
	 * stopped reading as a fill.
	 */
	const PINNED_APPBAR_CHIP = "#1c1c1a";
	const PINNED_CARD_CHIP = "#1c1917";
	/** The token the two pinned chips actually paint with. */
	const CHIP_TOKEN = "--amber-vivid";
	const ACCENT_CONTRACT = {
		"light --ink-inverse on --amber": 18.07,
		"dark --ink-inverse on --amber": 17.37,
		[`light ${CHIP_TOKEN} on the pinned AppBar chip ${PINNED_APPBAR_CHIP}`]: 5.26,
		[`dark ${CHIP_TOKEN} on the pinned AppBar chip ${PINNED_APPBAR_CHIP}`]: 5.26,
		[`light ${CHIP_TOKEN} on the pinned Card chip ${PINNED_CARD_CHIP}`]: 5.38,
		[`dark ${CHIP_TOKEN} on the pinned Card chip ${PINNED_CARD_CHIP}`]: 5.38,
	} as Record<string, number>;

	/**
	 * Measured at collection time so each case NAME carries its ratio and the
	 * reporter itself is the evidence. A token that cannot be resolved becomes a
	 * FAILING CASE naming it, never a collection crash: a throw here would
	 * preempt the exhaustiveness mirror above, which is the assertion that
	 * actually diagnoses a missing declaration.
	 */
	function measure(selector: string, fg: string, bg: string): number | string {
		try {
			return contrast(resolve(charcoalCss, selector, fg), resolve(charcoalCss, selector, bg));
		} catch (e) {
			return (e as Error).message;
		}
	}

	/** Same, but against a hex a COMPONENT pins beyond any theme's reach. */
	function measureOnLiteral(selector: string, fg: string, bgHex: string): number | string {
		try {
			return contrast(resolve(charcoalCss, selector, fg), bgHex);
		} catch (e) {
			return (e as Error).message;
		}
	}

	const cases: { name: string; run: () => void }[] = [];

	for (const [bar, label, tokens] of TIERS) {
		for (const token of tokens) {
			for (const [mode, selector] of MODES) {
				for (const [surface, surfaceToken] of SURFACES) {
					const m = measure(selector, token, surfaceToken);
					const shown = typeof m === "number" ? m.toFixed(2) : "unresolved";
					cases.push({
						name: `charcoal ${mode} ${token} on ${surface} clears ${label} = ${shown}`,
						run: () => {
							if (typeof m === "string") throw new Error(m);
							expect(m).toBeGreaterThanOrEqual(bar);
						},
					});
				}
			}
		}
	}

	for (const [mode, selector] of MODES) {
		// 1. The accent fill carries dark ink, in BOTH modes.
		const inkOnFill = measure(selector, "--ink-inverse", "--amber");
		const inkShown = typeof inkOnFill === "number" ? inkOnFill.toFixed(2) : "unresolved";
		const inkExpected = ACCENT_CONTRACT[`${mode} --ink-inverse on --amber`];
		cases.push({
			name: `charcoal ${mode} --ink-inverse clears the 4.5:1 text bar on the --amber fill = ${inkShown}`,
			run: () => {
				if (typeof inkOnFill === "string") throw new Error(inkOnFill);
				expect(Number(inkOnFill.toFixed(2))).toBe(inkExpected);
				expect(inkOnFill).toBeGreaterThanOrEqual(4.5);
			},
		});

		// 2. The accent reads on the two chips components pin beyond reach (G3).
		for (const [chip, hex] of [
			["AppBar", PINNED_APPBAR_CHIP],
			["Card", PINNED_CARD_CHIP],
		] as const) {
			const m = measureOnLiteral(selector, CHIP_TOKEN, hex);
			const shown = typeof m === "number" ? m.toFixed(2) : "unresolved";
			const expected = ACCENT_CONTRACT[`${mode} ${CHIP_TOKEN} on the pinned ${chip} chip ${hex}`];
			cases.push({
				name: `charcoal ${mode} ${CHIP_TOKEN} clears the 4.5:1 text bar on the pinned ${chip} chip ${hex} = ${shown}`,
				run: () => {
					if (typeof m === "string") throw new Error(m);
					expect(Number(m.toFixed(2))).toBe(expected);
					expect(m).toBeGreaterThanOrEqual(4.5);
				},
			});
		}
	}

	// 3. The chip token does not move between modes. This is WHY it can paint a
	//    pinned surface, and it is read from the parsed file rather than inferred
	//    from the two matching ratios above - which would be circular.
	{
		const light = resolve(charcoalCss, CHARCOAL_LIGHT, CHIP_TOKEN);
		const dark = resolve(charcoalCss, CHARCOAL_DARK, CHIP_TOKEN);
		cases.push({
			name: `charcoal ${CHIP_TOKEN} is one value across modes, which is what lets it paint a pinned surface = ${light}`,
			run: () => {
				expect(light).toBe(dark);
			},
		});
	}

	// 4. The accent DOES move between modes. Stated separately because case 3
	//    alone is satisfied by flattening the accent back onto a single value,
	//    which is exactly the change that produced the grey primary button.
	{
		const light = resolve(charcoalCss, CHARCOAL_LIGHT, "--amber");
		const dark = resolve(charcoalCss, CHARCOAL_DARK, "--amber");
		cases.push({
			name: `charcoal --amber inverts with the mode, ${light} light against ${dark} dark`,
			run: () => {
				expect(light).not.toBe(dark);
				// And it inverts by reaching the ink at BOTH ends, which is the
				// identity claim. A near-black light accent that stopped tracking
				// --ink would pass the inequality above and still be wrong.
				expect(light).toBe(resolve(charcoalCss, CHARCOAL_LIGHT, "--ink"));
				expect(dark).toBe(resolve(charcoalCss, CHARCOAL_DARK, "--ink"));
			},
		});
	}

	it("measures 56 charcoal cases: 48 tiered plus 8 accent-contract", () => {
		// Assert the case COUNT, not only the cases. A token quietly dropped from
		// a tier list would otherwise produce a smaller green run, which reads
		// exactly like a pass. Same shape as the parse floor, and the same reason:
		// 8 tokens x 3 surfaces x 2 modes = 48, plus the 8 accent-contract cases
		// (one ink-on-fill and two pinned chips per mode, plus the two
		// mode-stability cases that say why those two tokens are different jobs).
		expect(cases).toHaveLength(56);
	});

	for (const c of cases) it(c.name, c.run);
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

// ── Font delivery (D-29 / D-36) ─────────────────────────────────────────────
//
// Everything below counts faces by parsing the INSTALLED packages under
// node_modules. That is Phase 0's second independent counting method and the
// one that needs no build — and it is the only one that measures anything at
// all, for a reason worth stating plainly:
//
//   dist/tokens.css is a byte-identical copyFileSync of src/tokens.css
//   (scripts/postbuild.mjs). It has therefore ALWAYS contained zero @font-face
//   rules, including on the release that shipped all 73. The 73 only come into
//   existence after a bundler resolves the bare @fontsource specifiers, so
//   grepping the built token layer for face rules proves nothing whatsoever.
//
// What actually holds D-36 in place is the transitive count below: follow every
// @import out of a stylesheet, into node_modules, and add up the faces the
// consumer's bundler will inline. Measured against a real Vite build of
// dist/tokens.css, this agrees exactly — 73 before the split, 0 after.

const ROOT = join(SRC, "..");

/** CSS block comments, removed. A header that mentions a token name in prose
 *  must not read as a declaration — fonts/default.css says "(--serif)" in the
 *  Newsreader comment it inherited from tokens.css. */
function stripCssComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function importSpecifiers(css: string): string[] {
	return [...stripCssComments(css).matchAll(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g)].map(
		(m) => m[1]!,
	);
}

/** Bare specifier -> node_modules; relative specifier -> alongside its importer. */
function resolveCssSpecifier(spec: string, fromFile: string): string {
	if (spec.startsWith(".") || spec.startsWith("/")) return resolvePath(dirname(fromFile), spec);
	return join(ROOT, "node_modules", spec);
}

type FaceCensus = { total: number; families: string[]; perImport: Record<string, number> };

/**
 * Every @font-face a stylesheet contributes once its @imports are inlined.
 *
 * An unresolvable specifier throws with the path, because the failure a
 * consumer would otherwise meet is a postcss ENOENT quoting the bare specifier
 * as though it were a filesystem path, with no mention of why (G-12).
 */
function faceCensus(file: string, seen = new Set<string>()): FaceCensus {
	if (seen.has(file)) return { total: 0, families: [], perImport: {} };
	seen.add(file);
	if (!existsSync(file)) throw new Error(`@import does not resolve to a file on disk: ${file}`);
	const css = readFileSync(file, "utf8");
	const bodies = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]!);
	const families = bodies.map(
		(b) =>
			b
				.match(/font-family:\s*([^;]+);/)?.[1]
				?.trim()
				.replace(/^['"]|['"]$/g, "") ?? "(unnamed)",
	);
	let total = bodies.length;
	const perImport: Record<string, number> = {};
	for (const spec of importSpecifiers(css)) {
		const child = faceCensus(resolveCssSpecifier(spec, file), seen);
		perImport[spec] = child.total;
		total += child.total;
		families.push(...child.families);
	}
	return { total, families, perImport };
}

const CHARCOAL_FACE_LAYER = join(SRC, "fonts/charcoal.css");
const DEFAULT_FACE_LAYER = join(SRC, "fonts/default.css");

/**
 * The five charcoal entry points and the faces each is expected to contribute.
 * Written out per entry point rather than as a bare total so that a Fontsource
 * minor bump changing one subset count fails with a diff naming it, instead of
 * a total that is off by one with nothing to point at.
 */
const CHARCOAL_ENTRY_POINTS: Record<string, number> = {
	"@fontsource-variable/playfair-display/wght.css": 4, // cyrillic, vietnamese, latin-ext, latin
	"@fontsource-variable/playfair-display/wght-italic.css": 4, // the same four, drawn italic
	"@fontsource-variable/dm-sans/wght.css": 2, // latin-ext, latin
	"@fontsource/ibm-plex-mono/latin-400.css": 1,
	"@fontsource/ibm-plex-mono/latin-500.css": 1,
};

/** Registered by Fontsource's variable packages WITH the suffix. A token naming
 *  the plain "Playfair Display" matches nothing and renders Georgia. */
const CHARCOAL_FAMILIES = ["DM Sans Variable", "IBM Plex Mono", "Playfair Display Variable"];

/** The four families the design system shipped before v2.0.0. Criterion 4 is
 *  that a page consuming only charcoal never downloads any of them. */
const PRE_2_0_FAMILIES = ["Inter", "Archivo", "JetBrains Mono", "Newsreader"];

describe("font delivery", () => {
	// ── (a) DS-04, literally rather than aspirationally ──────────────────────
	it("declares no faces and pulls in no font packages from the token layer", () => {
		// Occurrence counts, not line counts: two matches on one line count twice.
		expect((tokensCss.match(/@font-face/g) ?? []).length).toBe(0);
		expect((tokensCss.match(/@fontsource/g) ?? []).length).toBe(0);
	});

	it("pulls in zero faces transitively through the token layer", () => {
		// The assertion the zero-@fontsource check above cannot make. Adding
		// `@import "./fonts/default.css";` to tokens.css keeps the @fontsource
		// count at 0 while putting all 73 faces straight back into every
		// consumer's bundle — which is precisely the state D-36 exists to end.
		const census = faceCensus(join(SRC, "tokens.css"));
		expect(census.perImport).toEqual({});
		expect(census.total).toBe(0);
	});

	for (const [label, file] of [
		["charcoal", CHARCOAL_FACE_LAYER],
		["default", DEFAULT_FACE_LAYER],
	] as const) {
		it(`fonts/${label}.css carries faces only, never tokens`, () => {
			// Comments stripped first: a header is free to discuss a token by name
			// without that reading as a declaration.
			expect([...declaredIn(stripCssComments(readFileSync(file, "utf8")))]).toEqual([]);
		});
	}

	// ── (b) The face census — criterion 4 ────────────────────────────────────
	const charcoalCensus = faceCensus(CHARCOAL_FACE_LAYER);

	it("resolves the charcoal face layer to exactly its five entry points", () => {
		// Keyed comparison, so adding a sixth entry point or renaming one fails
		// here with a diff rather than silently shifting the total below.
		expect(charcoalCensus.perImport).toEqual(CHARCOAL_ENTRY_POINTS);
	});

	it("resolves the charcoal face layer to exactly 12 @font-face rules", () => {
		expect(charcoalCensus.total).toBe(12);
	});

	it("names exactly the three charcoal families, with the Variable suffix", () => {
		expect([...new Set(charcoalCensus.families)].sort()).toEqual(CHARCOAL_FAMILIES);
	});

	it("downloads none of the four pre-2.0 families under charcoal", () => {
		// The criterion's actual content, asserted separately from the positive
		// half above: "these three are present" and "those four are absent" are
		// different claims, and only the second one is what D-30 bought.
		const banned = charcoalCensus.families.filter((f) =>
			PRE_2_0_FAMILIES.some((p) => f.toLowerCase().includes(p.toLowerCase())),
		);
		expect(banned).toEqual([]);
	});

	it("relocates all 73 pre-2.0 faces without losing one", () => {
		// tokens.css contributed 73 before the split; fonts/default.css must
		// contribute the same 73, or the "nothing was deleted, only moved"
		// promise in the BREAKING CHANGE footer is not true.
		const census = faceCensus(DEFAULT_FACE_LAYER);
		expect(Object.keys(census.perImport)).toHaveLength(15);
		expect(census.total).toBe(73);
		expect([...new Set(census.families)].sort()).toEqual([
			"Archivo",
			"Inter",
			"JetBrains Mono",
			"Newsreader Variable",
		]);
	});

	// ── (c) The Variable-suffix guard — DS-05 ────────────────────────────────
	//
	// Only the HEAD of each stack is checked. Everything after the first comma
	// is a deliberate fallback — Georgia, system-ui, ui-monospace, -apple-system
	// and friends — which has no @font-face by design, so asserting on the tail
	// would be wrong. Checking the head is the whole point: the head is the name
	// that has to agree with what Fontsource actually registered.
	const FONT_TOKEN = /^--(font|mono|display|serif)(-[a-z0-9-]+)?$/;

	function fontTokensOf(css: string, selector: string): string[] {
		return [
			...new Set(
				[...block(css, selector).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)]
					.map((m) => m[1]!)
					.filter((n) => FONT_TOKEN.test(n)),
			),
		];
	}

	const stackHead = (stack: string) =>
		stack
			.split(",")[0]!
			.trim()
			.replace(/^['"]|['"]$/g, "");

	// Charcoal declares all eight font tokens in BOTH of its blocks, so both are
	// checked. Reading only the light block would leave a wrong family name in the
	// dark block undetected — the same light-only blind spot that let --rule-strong
	// ship dark-only, pointing the other way.
	for (const [theme, css, selector, layer, faceLayer] of [
		["default", tokensCss, ":root {", "default", DEFAULT_FACE_LAYER],
		["charcoal light", charcoalCss, CHARCOAL_LIGHT, "charcoal", CHARCOAL_FACE_LAYER],
		["charcoal dark", charcoalCss, CHARCOAL_DARK, "charcoal", CHARCOAL_FACE_LAYER],
	] as const) {
		const registered = new Set(faceCensus(faceLayer).families.map((f) => f.toLowerCase()));
		const tokens = fontTokensOf(css, selector);

		it(`collects all 8 ${theme} font tokens`, () => {
			// Asserted so a renamed token shrinks the set loudly instead of
			// producing a smaller green run — the failure mode that let two gates
			// in this phase ship unable to fail.
			expect([...tokens].sort()).toEqual(
				[
					"--display",
					"--font",
					"--font-body",
					"--font-display",
					"--font-mono",
					"--font-serif",
					"--mono",
					"--serif",
				].sort(),
			);
		});

		for (const name of tokens) {
			it(`${theme} ${name} names a family that fonts/${layer}.css actually declares`, () => {
				// resolve() follows var(), so breaking one token surfaces every token
				// that resolves through it. Charcoal's --font-display, --display and
				// --serif all resolve through --font-serif; a per-token check that
				// did not follow aliases would report one failure and leave three
				// tokens silently rendering Georgia.
				let head: string;
				try {
					head = stackHead(resolve(css, selector, name));
				} catch (e) {
					// A missing declaration must fail THIS case by name, never crash
					// collection and take the rest of the file down with it.
					throw new Error(`${theme} ${name}: ${(e as Error).message}`);
				}
				expect(
					registered.has(head.toLowerCase()),
					`${theme} ${name} heads its stack with "${head}", which has no @font-face in fonts/${layer}.css. Registered there: ${[...registered].sort().join(", ")}`,
				).toBe(true);
			});
		}
	}
});
