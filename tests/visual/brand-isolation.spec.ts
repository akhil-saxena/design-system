import { expect, test } from "@playwright/test";
import { probeComputed, probeMeta } from "./computed";

/**
 * E29. A charcoal-dark capture must read charcoal's neutrals, not the design
 * system's.
 *
 * `src/tokens.css` declares its dark block as `:root.dark, .dark`, so ANY
 * element carrying that class re-declares roughly fifty neutral dark tokens.
 * `src/themes/charcoal.css` is scoped to `:root[data-brand="charcoal"]` and
 * cannot reach inside such an element. Sixty-seven story files used to wrap
 * themselves in `<div className="dark">`, so a charcoal-dark probe inside them
 * measured the DEFAULT brand while the render still looked plausibly dark —
 * measured before the fix, in this browser, at the deepest node of
 * `inputs-badge--dark-mode`: `--cream` `#181818` where charcoal declares
 * `#161616`, and `--wire` `rgba(255, 255, 255, 0.22)` where charcoal declares
 * `#727268`. Plan 01-19.1 removed every one of those wrappers; dark now comes
 * from the Storybook theme global, which `.storybook/preview.tsx` applies to
 * `document.documentElement`.
 *
 * Three deliberate choices, each answering a way this spec could lie:
 *
 * 1. THE BRAND IS ASSERTED AT THE PROBED ELEMENT, not from toolbar state.
 *    `--ochre` is declared ONLY in `src/themes/charcoal.css`, so reading it at
 *    the same node as the neutrals proves the brand layer reaches that node.
 *    Plan 01-18 caught its own hex-vs-rgb bug this way before it measured
 *    anything. Note the sharp edge that makes this necessary but not sufficient:
 *    before the fix `--ochre` read `#b0722a` CORRECTLY at that node while
 *    `--cream` was the wrong brand's — the brand layer applied, and the neutrals
 *    were shadowed underneath it. So both halves are asserted.
 *
 * 2. THE PROBE IS THE DEEPEST NODE, not a fixed selector. The defect lives in
 *    whatever wrapper a story declares, at whatever depth. A selector pinned near
 *    `#storybook-root` would sit ABOVE a reintroduced wrapper and pass over it.
 *
 * 3. THE `.dark` ELEMENT SET IS ASSERTED, which is mechanism-independent. The
 *    static guard in `src/story-mode.test.ts` matches literal class values and
 *    cannot see `clsx("dark")` or a computed string; this assertion reads the DOM,
 *    so a reintroduction is caught however it was spelled.
 *
 * No alpha compositing is involved. Every value here is a DECLARED custom
 * property read back from the cascade, not a painted colour — so this spec is not
 * exposed to the trap 01-18 hit, where `getComputedStyle` reported a
 * non-composited `rgba` fill as 2.020:1 when the composited truth was 1.114:1.
 *
 * There is no screenshot here. Charcoal's baselines are D-37 / plan 01-20, behind
 * a human gate.
 */

/** Declared only in src/themes/charcoal.css — the brand fingerprint. */
const OCHRE = "#b0722a";
/** src/themes/charcoal.css, :root[data-brand="charcoal"].dark */
const CHARCOAL_DARK_CREAM = "#161616";
const CHARCOAL_DARK_WIRE = "#727268";
/** src/tokens.css, ":root.dark, .dark" — what a shadowed probe reads instead. */
const DS_DARK_CREAM = "#181818";
const DS_DARK_WIRE = "rgba(255, 255, 255, 0.22)";

/**
 * Stories that used to own their mode, one per structural shape the conversion
 * had to handle: a decorator wrapper, a render-level wrapper, a wrapper with no
 * background of its own, a helper component rendering the wrapper, and the two
 * that selected dark by pinning a `backgrounds` hex instead of a class.
 */
const CONVERTED_DARK_STORIES = [
	"inputs-badge--dark-mode",
	"inputs-statuspill--dark-mode",
	"data-display-tabs--dark-mode",
	"overlays-modal--dark-mode",
	"interaction-sortable--dark",
	"layout-appshell--dark",
	"data-display-accordion--dark-mode",
	"surfaces-card--dark-mode",
];

/**
 * Reads the tokens at the deepest node of the rendered story, and the set of
 * elements carrying `.dark`.
 *
 * Depth is resolved by walking children rather than by selector so no story
 * structure can hide a wrapper from it.
 */
const DEEP_READ = () => {
	const root = document.getElementById("storybook-root");
	if (!root) throw new Error("#storybook-root missing");
	let deepest: Element = root;
	let best = -1;
	(function walk(el: Element, d: number) {
		if (d > best) {
			best = d;
			deepest = el;
		}
		for (const c of Array.from(el.children)) walk(c, d + 1);
	})(root, 0);
	const cs = getComputedStyle(deepest);
	return {
		depth: best,
		tag: deepest.tagName.toLowerCase(),
		cream: cs.getPropertyValue("--cream").trim(),
		wire: cs.getPropertyValue("--wire").trim(),
		ochre: cs.getPropertyValue("--ochre").trim(),
		darkElements: Array.from(document.querySelectorAll(".dark")).map(
			(e) => e.tagName.toLowerCase() + (e === document.documentElement ? "(root)" : "(scoped)"),
		),
		htmlBrand: document.documentElement.getAttribute("data-brand"),
		htmlDark: document.documentElement.classList.contains("dark"),
	};
};

test.describe("charcoal-dark stories resolve charcoal's neutrals (E29)", () => {
	for (const story of CONVERTED_DARK_STORIES) {
		test(`${story} reads charcoal, not the design system's dark neutrals`, async ({ page }) => {
			// probeComputed drives the cell and throws if <html> did not end up in it,
			// so a value read below cannot belong to a different brand x mode.
			await probeComputed(page, {
				story,
				brand: "charcoal",
				mode: "dark",
				selector: "#storybook-root",
				props: ["--cream"],
			});
			const deep = await page.evaluate(DEEP_READ);

			// The cell, restated at the element rather than taken on trust.
			expect(deep.htmlBrand).toBe("charcoal");
			expect(deep.htmlDark).toBe(true);
			expect(deep.depth).toBeGreaterThan(0);

			// The brand layer reaches the probed node.
			expect(deep.ochre).toBe(OCHRE);

			// ...and the neutrals at that same node are charcoal's, not the shadowed ones.
			expect(deep.cream).toBe(CHARCOAL_DARK_CREAM);
			expect(deep.cream).not.toBe(DS_DARK_CREAM);
			expect(deep.wire).toBe(CHARCOAL_DARK_WIRE);
			expect(deep.wire).not.toBe(DS_DARK_WIRE);

			// Mechanism-independent: under charcoal the ONLY .dark element is <html>.
			// preview.tsx drops the class from its own wrapper under charcoal for
			// exactly this reason, so anything scoped here is a reintroduction.
			expect(deep.darkElements).toEqual(["html(root)"]);
		});
	}

	test("the same stories read the design system's neutrals under the default brand", async ({
		page,
	}) => {
		// The other direction: charcoal's values must not leak when the brand is off,
		// and `--ochre` must be ABSENT — a charcoal-only token resolving here would
		// mean the brand layer was applied when nobody asked for it.
		for (const story of CONVERTED_DARK_STORIES.slice(0, 4)) {
			await probeComputed(page, {
				story,
				brand: "default",
				mode: "dark",
				selector: "#storybook-root",
				props: ["--cream"],
			});
			const deep = await page.evaluate(DEEP_READ);
			expect(deep.htmlBrand, story).toBeNull();
			expect(deep.ochre, story).toBe("");
			expect(deep.cream, story).toBe(DS_DARK_CREAM);
			// Under the default brand preview.tsx KEEPS the class on its own wrapper,
			// which is correct and is how all 477 recorded baselines were captured.
			expect(deep.darkElements, story).toContain("html(root)");
		}
	});

	test("the axis was driven by the globals query parameter, not the DOM fallback", async ({
		page,
	}) => {
		// If Storybook ever drops `?globals=`, computed.ts falls back to setting the
		// attribute directly. That still measures the cascade, but it stops proving
		// that a story REQUESTING dark gets it — which is the whole subject here.
		//
		// This test does its OWN probe rather than reading the counters left by the
		// tests above. probeMeta is module state, so it is per-WORKER: with
		// `fullyParallel: true` and six workers this assertion could otherwise land
		// in a worker that had probed nothing and read a vacuous 0/0.
		await probeComputed(page, {
			story: CONVERTED_DARK_STORIES[0] as string,
			brand: "charcoal",
			mode: "dark",
			selector: "#storybook-root",
			props: ["--cream"],
		});
		expect(probeMeta.urlGlobals).toBeGreaterThan(0);
		expect(probeMeta.directDom).toBe(0);
		expect(probeMeta.lastAppliedVia).toBe("url-globals");
	});
});
