import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The library styles components two ways at once: base styles live in
 * module-level inline style objects, states and animation live in
 * `primitives.css`. That split is fine until both layers declare the *same*
 * property — inline styles always win, silently, with no warning.
 *
 * Button demonstrated the cost. It carried `transition: "all .15s"` inline,
 * which beat the carefully enumerated transition in `primitives.css` *and* the
 * `@media (prefers-reduced-motion: reduce)` block that turned it off. The
 * reduced-motion guard looked correct in the stylesheet and did nothing in the
 * browser.
 *
 * These tests pin the boundary for the properties where an inline declaration is
 * most damaging: motion (defeats reduced-motion guards) and z-index (defeats the
 * layering scale).
 */

const SRC = __dirname;

function componentFiles(dir: string, acc: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) componentFiles(p, acc);
		else if (entry === "index.tsx") acc.push(p);
	}
	return acc;
}

const files = componentFiles(SRC);
const rel = (f: string) => f.replace(`${SRC}/`, "");

/** Strip block comments and `//` lines so prose about a property isn't a match. */
function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("styling boundary: inline styles must not fight primitives.css", () => {
	/**
	 * Known inline `transition` declarations, as of the hardening pass.
	 *
	 * This is a **ratchet, not an approval list**: it may shrink, never grow. Each
	 * entry is a place where an inline transition outranks whatever
	 * `primitives.css` declares for the same element, which is the shape of bug
	 * that made Button's reduced-motion guard inert.
	 *
	 * These are no longer *reduced-motion* bugs — the system-wide
	 * `prefers-reduced-motion` block added in the same pass uses `!important`, so
	 * it now beats inline styles. They remain latent
	 * inline-overrides-stylesheet conflicts and should migrate into
	 * `primitives.css` component by component.
	 */
	const KNOWN_INLINE_TRANSITIONS = [
		"display/MiniBar/index.tsx",
		"display/MiniDonut/index.tsx",
		"display/RollingNumber/index.tsx",
		"foundation/Link/index.tsx",
		"inputs/Checkbox/index.tsx",
		"inputs/FileInput/index.tsx",
		"inputs/Radio/index.tsx",
		"inputs/TextInput/index.tsx",
		"inputs/Textarea/index.tsx",
		"interaction/RichText/index.tsx",
		"layout/AppBar/index.tsx",
	];

	it("does not add new inline `transition` declarations", () => {
		const offenders: string[] = [];
		for (const f of files) {
			const src = stripComments(readFileSync(f, "utf8"));
			if (/\btransition:\s*["'`]/.test(src)) offenders.push(rel(f));
		}
		const added = offenders.filter((f) => !KNOWN_INLINE_TRANSITIONS.includes(f));
		expect(added, "new inline transition — declare it in primitives.css instead").toEqual([]);

		// Fail when an entry is fixed but not removed, so the ratchet tightens.
		const stale = KNOWN_INLINE_TRANSITIONS.filter((f) => !offenders.includes(f));
		expect(stale, "fixed — remove from KNOWN_INLINE_TRANSITIONS").toEqual([]);
	});

	it("no component declares `animation` inline outside a guarded <style> block", () => {
		const offenders: string[] = [];
		for (const f of files) {
			const src = stripComments(readFileSync(f, "utf8"));
			if (!/\banimation:\s*["'`]/.test(src)) continue;
			// Components that inject their own <style> must ship a reduced-motion
			// guard alongside it.
			const guarded = src.includes("prefers-reduced-motion");
			if (!guarded) offenders.push(rel(f));
		}
		expect(offenders).toEqual([]);
	});

	it("no component hardcodes a numeric z-index inline", () => {
		// The layering scale (--z-*) is the contract that keeps a Popover opened
		// from inside a Modal on top of it. A bare number opts out of that.
		const offenders: string[] = [];
		for (const f of files) {
			const src = stripComments(readFileSync(f, "utf8"));
			for (const m of src.matchAll(/zIndex:\s*([^,\n}]+)/g)) {
				const value = m[1]!.trim();
				if (/^["'`]?(var\(--z-|calc\(var\(--z-)/.test(value)) continue;
				// Local stacking inside a component's own subtree is fine.
				if (/^\d$/.test(value)) continue;
				// Computed values (e.g. AvatarStack's overlap order) are not layering.
				if (!/^\d+$/.test(value)) continue;
				offenders.push(`${rel(f)}: zIndex: ${value}`);
			}
		}
		expect(offenders).toEqual([]);
	});
});
