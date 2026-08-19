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
 * most damaging: motion (defeats reduced-motion guards), z-index (defeats the
 * layering scale), and — added after findings E3, E4 and E5 — display and color
 * (defeat the consumer outright: a page cannot lay out, or recolour, a component
 * it has been handed).
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

/** Component files whose comment-stripped source declares a match for `re` inline. */
function inlineOffenders(re: RegExp): string[] {
	return files
		.filter((f) => re.test(stripComments(readFileSync(f, "utf8"))))
		.map(rel)
		.sort();
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
	 *
	 * TextInput came off this list when its base styles moved into the stylesheet
	 * — which is what made it safe for CommandPalette, Select, ColorPicker and the
	 * rest to compose it and still restyle the field through their own class.
	 */
	/**
	 * Every component that once declared `transition` inline has been migrated
	 * into `primitives.css`, so this list is empty — and the assertions below now
	 * simply forbid the pattern outright.
	 *
	 * It began at eleven. The migration was not cosmetic: an inline transition
	 * outranks every class rule, which is what made Button's
	 * `prefers-reduced-motion` guard inert while reading as correct, and what kept
	 * `.ds-atom-cmd-input` from ever applying.
	 */
	const KNOWN_INLINE_TRANSITIONS: string[] = [];

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

	/**
	 * Known inline `display` declarations, as of the E3/E4/E5 pass.
	 *
	 * Same contract as the transition list above — a ratchet, not an approval
	 * list: it may shrink, never grow.
	 *
	 * `display` earns a place here because Card proved the cost. It inlined the
	 * box type while `.ds-atom-card` already declared the identical value, so the
	 * inline copy bought nothing and silently outranked every consumer rule: a
	 * page writing `.wk-card { display: flex; flex-direction: column }` got the
	 * flex-direction and not the box type, so a child's `margin-top: auto` quietly
	 * did nothing. Measured in a browser on a real page (E3).
	 *
	 * The entries below are not equally bad, and each reason says which it is. A
	 * declaration on an INTERNAL wrapper — a element with no class of its own — is
	 * unreachable from a consumer stylesheet either way, so migrating it buys
	 * nothing today. A declaration in a module-level base style spread onto the
	 * element that also carries the `ds-atom-*` class is the E3 shape exactly, and
	 * every one of those is a consumer-styling bug nobody has reported yet.
	 */
	const KNOWN_INLINE_DISPLAY: Record<string, string> = {
		"data-display/Calendar/index.tsx":
			"internal day-grid and header wrappers; no class hook for a consumer to target",
		"data-display/DataGrid/index.tsx": "internal sort-indicator and cell-truncation wrappers",
		"data-display/Pagination/index.tsx": "one internal row wrapper around the page buttons",
		"display/Avatar/index.tsx": "root base style plus internal image/initials wrappers",
		"display/MiniBar/index.tsx": "root bar-track style plus an internal label row",
		"display/MiniDonut/index.tsx": "on the <svg> itself, to kill inline-element descender space",
		"display/Sparkline/index.tsx": "on the <svg> itself, to kill inline-element descender space",
		"display/StatCard/index.tsx": "internal label row",
		"feedback/AlertBanner/index.tsx":
			"root baseStyle — same shape as E3, migrate to .ds-atom-alertbanner",
		"feedback/ProgressBar/index.tsx":
			"root baseStyle — same shape as E3, migrate to .ds-atom-progressbar",
		"foundation/Divider/index.tsx":
			"the labelled variant, which lays its rule/label/rule out inline",
		"foundation/Eyebrow/index.tsx":
			"root baseStyle — same shape as E3, migrate to .ds-atom-eyebrow",
		"inputs/Badge/index.tsx":
			"root baseStyle; Badge is one inline style object with no class at all — F-15-4, owned by plan 01-18",
		"inputs/Button/index.tsx": "root baseStyle — same shape as E3, migrate to .ds-atom-btn",
		"inputs/Checkbox/index.tsx":
			"labelStyle and boxStyle roots, plus the visually-hidden native input",
		"inputs/Chip/index.tsx":
			"root baseStyle plus the leading-icon and dismiss-× wrappers; E4 restored the class hook but left the inline layer alone",
		"inputs/ColorPicker/index.tsx": "internal swatch grid, sliders and field rows",
		"inputs/FileInput/index.tsx":
			"the visually-hidden native input, plus internal file-row wrappers",
		"inputs/InlineAddRow/index.tsx": "triggerStyle and activeStyle roots — same shape as E3",
		"inputs/Kbd/index.tsx": "root baseStyle — same shape as E3, migrate to .ds-atom-kbd",
		"inputs/Radio/index.tsx": "group wrapper plus labelStyle and boxStyle roots",
		"inputs/TextInput/index.tsx": "the leading-icon wrapper span",
		"inputs/Toggle/index.tsx": "labelStyle root — same shape as E3",
		"interaction/RichText/index.tsx": "internal toolbar and status-row wrappers",
		"layout/AppBar/index.tsx":
			"eight internal brand/nav/action row wrappers; AppBar geometry is D-16-1, owned by plan 01-12",
		"layout/Footer/index.tsx":
			"internal column and link-row wrappers; Footer geometry is D-16-1, owned by plan 01-12",
		"layout/SplitHero/index.tsx":
			"component-scoped <style> block owns the responsive axis; these are its base boxes",
		"overlays/ActionSheet/index.tsx":
			"itemBase root for each sheet row, plus one internal row wrapper",
		"overlays/ConfirmDialog/index.tsx": "internal header, body and footer-button wrappers",
		"surfaces/StickyNote/index.tsx":
			"root baseStyle — same shape as E3, migrate to .ds-atom-stickynote",
	};

	it("does not add new inline `display` declarations", () => {
		const offenders = inlineOffenders(/\bdisplay:\s*["'`]/);
		const added = offenders.filter((f) => !(f in KNOWN_INLINE_DISPLAY));
		expect(added, "new inline display — declare it in primitives.css instead").toEqual([]);

		// Fail when an entry is fixed but not removed, so the ratchet tightens.
		const stale = Object.keys(KNOWN_INLINE_DISPLAY).filter((f) => !offenders.includes(f));
		expect(stale, "fixed — remove from KNOWN_INLINE_DISPLAY").toEqual([]);
	});

	/**
	 * Known inline `color` declarations, as of the E3/E4/E5 pass. Same contract.
	 *
	 * `color` is the property a page is most likely to want back, and Text is why
	 * it is listed: Text inlined its variant colour whenever `tone` was absent, so
	 * a correct-looking `.foo .ds-atom-text { color: … }` did nothing at all, and
	 * plan 00-10 lost real time to it (E5). Text is no longer on this list — its
	 * four variant colours are zero-specificity rules in primitives.css now.
	 *
	 * Some entries carry an owning finding rather than a migration note, because
	 * the fix belongs to another plan: Badge is one inline style object with no
	 * class hook at all (F-15-4, plan 01-18), and AppBar/Footer geometry is D-16-1
	 * (plan 01-12). Listing them rather than widening the regex is the whole point
	 * of a ratchet — the list is visible, and it can only shrink.
	 */
	const KNOWN_INLINE_COLOR: Record<string, string> = {
		"data-display/Calendar/index.tsx": "internal month-label and weekday-header spans",
		"display/Avatar/index.tsx":
			"initials-on-tint contrast pair, computed against the generated background",
		"display/MiniBar/index.tsx": "internal label and value spans",
		"display/StatCard/index.tsx": "internal label span",
		"foundation/Divider/index.tsx": "the labelled variant's inline <span>",
		"foundation/Eyebrow/index.tsx":
			"identical shape to E5 — the variant colour is inlined whenever `tone` is absent, so a page cannot recolour an Eyebrow from a stylesheet either. Not fixed here: Eyebrow is outside this plan's file set. Raised as a finding by plan 01-09",
		"foundation/Link/index.tsx":
			"variantStyles carries the three link colours; the same E5 migration applies and has not been done",
		"inputs/Badge/index.tsx":
			"ten toneStyles colours; Badge has no class hook at all — F-15-4, owned by plan 01-18",
		"inputs/Button/index.tsx":
			"variantStyles carries the per-variant foreground; migrate with the rest of Button's base layer",
		"inputs/Checkbox/index.tsx": "labelStyle root",
		"inputs/Chip/index.tsx":
			"baseStyle plus five toneStyles entries; these already outranked `.dark .ds-atom-chip`, which is why restoring the class hook in E4 moved no pixel",
		"inputs/ColorPicker/index.tsx": "internal hex-field and channel-label spans",
		"inputs/FileInput/index.tsx": "internal file-name, size and error spans",
		"inputs/InlineAddRow/index.tsx": "triggerStyle and hintStyle roots",
		"inputs/InlineEditField/index.tsx": "the empty-value placeholder span",
		"inputs/Radio/index.tsx": "labelStyle root",
		"inputs/TextInput/index.tsx": "affixStyle plus the leading-icon span",
		"inputs/Textarea/index.tsx": "root base style plus the character-counter span",
		"inputs/Toggle/index.tsx": "labelStyle root",
		"interaction/InlineEdit/index.tsx": "the empty-value placeholder span",
		"interaction/RelativeTime/index.tsx": "the optional prefix span",
		"interaction/RichText/index.tsx": "internal placeholder and word-count spans",
		"layout/AppBar/index.tsx":
			"the brand accent mark; AppBar geometry is D-16-1, owned by plan 01-12",
		"layout/Footer/index.tsx":
			"internal fine-print span; Footer geometry is D-16-1, owned by plan 01-12",
		"overlays/ActionSheet/index.tsx": "the destructive-row foreground, composed over itemBase",
		"overlays/ConfirmDialog/index.tsx":
			"a per-tone colour table driving the icon, the accent and the confirm button",
	};

	it("does not add new inline `color` declarations", () => {
		// The word boundary keeps backgroundColor / borderColor / outlineColor out:
		// they spell the property with a capital C, so there is no match to make.
		const offenders = inlineOffenders(/\bcolor:\s*["'`]/);
		const added = offenders.filter((f) => !(f in KNOWN_INLINE_COLOR));
		expect(added, "new inline color — declare it in primitives.css instead").toEqual([]);

		const stale = Object.keys(KNOWN_INLINE_COLOR).filter((f) => !offenders.includes(f));
		expect(stale, "fixed — remove from KNOWN_INLINE_COLOR").toEqual([]);
	});
});
