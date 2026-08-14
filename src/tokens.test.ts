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

const lightTokens = declaredIn(block(tokensCss, ":root {"));
const darkTokens = declaredIn(block(tokensCss, ":root.dark,"));

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
