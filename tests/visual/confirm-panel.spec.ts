import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * F-15-3: `ConfirmDialog`'s panel had no `.ds-atom-confirm-panel` rule anywhere
 * under `dist/css/`. It was one inline style object with a hardcoded
 * `rgba(255,255,255,.97)` background, and **nothing in any theme's cascade
 * reached it** — so under charcoal it was a near-white card floating on a
 * charcoal page.
 *
 * A grep proves nothing here. That is the entire finding: the declaration existed,
 * the class existed, and the style still did not apply, because an inline style
 * beats a class rule without `!important`. Only `getComputedStyle` in a real
 * browser can tell the difference between "the rule is in the sheet" and "the rule
 * won".
 *
 * The story probed is `overlays-confirmdialog--inline-panel`, which is the only
 * ConfirmDialog story that renders the panel at all: every other one starts
 * closed behind a button, and a portaled panel would also sit outside the story
 * root. `inline` puts it in place, so there is something to measure. That story
 * carries no scoped `.dark` decorator on purpose — see its docstring; a first
 * draft that did read 31,31,31 where charcoal declares 30,30,29, because
 * tokens.css's ":root.dark, .dark" block re-declares the neutral dark tokens
 * inside any such wrapper and charcoal.css is root-scoped.
 */

const STORY = "overlays-confirmdialog--inline-panel";
const PANEL = ".ds-atom-confirm-panel";

/** "rgba(30, 30, 29, 0.97)" / "color(srgb …)" → [r,g,b,a] in 0-255 / 0-1. */
function parseColour(value: string): [number, number, number, number] {
	const nums = [...value.matchAll(/[\d.]+%?/g)].map((m) => m[0]);
	if (nums.length < 3) throw new Error(`could not parse colour ${JSON.stringify(value)}`);
	const scale = (raw: string, i: number) => {
		const n = Number.parseFloat(raw);
		if (raw.endsWith("%")) return i < 3 ? (n / 100) * 255 : n / 100;
		// color(srgb 0.117 0.117 0.113 / 0.97) reports channels in 0-1.
		return i < 3 && value.includes("srgb") ? n * 255 : n;
	};
	const [r, g, b] = [scale(nums[0]!, 0), scale(nums[1]!, 1), scale(nums[2]!, 2)];
	const a = nums[3] === undefined ? 1 : scale(nums[3], 3);
	return [r, g, b, a];
}

const NEAR_WHITE_97 = "the hardcoded rgba(255,255,255,.97) the finding measured";

test.describe("ConfirmDialog panel is in the cascade (F-15-3)", () => {
	test("charcoal x dark: the panel is a charcoal surface, not a near-white card", async ({
		page,
	}) => {
		const got = await probeComputed(page, {
			story: STORY,
			brand: "charcoal",
			mode: "dark",
			selector: PANEL,
			props: ["background-color", "box-shadow", "--panel", "--cream-2"],
		});
		const [r, g, b, a] = parseColour(got["background-color"]!);

		// charcoal dark --cream-2 is #1E1E1D. The 97% glass is preserved, so the
		// expected paint is that colour at alpha .97.
		expect.soft(Math.round(r), NEAR_WHITE_97).toBeCloseTo(30, 0);
		expect.soft(Math.round(g)).toBeCloseTo(30, 0);
		expect.soft(Math.round(b)).toBeCloseTo(29, 0);
		expect(a).toBeCloseTo(0.97, 2);

		// Non-vacuity in the direction that matters: the value must not be the
		// literal the finding measured. A parser bug that returned zeroes would fail
		// the assertions above; this one fails if it returned the OLD value.
		expect(Math.round(r), NEAR_WHITE_97).toBeLessThan(128);

		// Rule C-5: charcoal's dark --shadow-3 leads with a hairline ring, where an
		// alpha-only shadow is invisible against #161616. The old hardcoded
		// `0 16px 48px rgba(0,0,0,.18)` had no ring at all.
		expect(got["box-shadow"]).toMatch(/rgba?\([^)]*\)\s+0px\s+0px\s+0px\s+1px|0px 0px 0px 1px/);
	});

	test("charcoal x light: the panel is the charcoal paper surface", async ({ page }) => {
		const got = await probeComputed(page, {
			story: STORY,
			brand: "charcoal",
			mode: "light",
			selector: PANEL,
			props: ["background-color"],
		});
		const [r, g, b, a] = parseColour(got["background-color"]!);
		// charcoal light --panel is var(--cream-2) = #FBF9F4.
		expect.soft(Math.round(r)).toBeCloseTo(251, 0);
		expect.soft(Math.round(g)).toBeCloseTo(249, 0);
		expect.soft(Math.round(b)).toBeCloseTo(244, 0);
		expect(a).toBeCloseTo(0.97, 2);
		// It is a CREAM white, not a pure one — so it is charcoal's surface token and
		// not the old hardcoded #ffffff at .97.
		expect(Math.round(b), NEAR_WHITE_97).toBeLessThan(255);
	});

	test("default brand x light is unchanged: rgba(255,255,255,.97)", async ({ page }) => {
		// The regression guard. --panel is #ffffff in the default brand's light mode,
		// so the color-mix reproduces the old literal exactly and no existing
		// baseline in this brand moves.
		const got = await probeComputed(page, {
			story: STORY,
			brand: "default",
			mode: "light",
			selector: PANEL,
			props: ["background-color"],
		});
		const [r, g, b, a] = parseColour(got["background-color"]!);
		expect(Math.round(r)).toBe(255);
		expect(Math.round(g)).toBe(255);
		expect(Math.round(b)).toBe(255);
		expect(a).toBeCloseTo(0.97, 2);
	});

	test("the danger tone wash resolves through a token in both brands", async ({ page }) => {
		// `rgba(239,68,68,.1)` was hardcoded, so it painted the same wash in every
		// brand and every mode. --red-bg is a real tint in each.
		const charcoal = await probeComputed(page, {
			story: STORY,
			brand: "charcoal",
			mode: "dark",
			selector: `${PANEL} > div > div:first-child`,
			props: ["background-color", "--red-bg"],
		});
		const dflt = await probeComputed(page, {
			story: STORY,
			brand: "default",
			mode: "light",
			selector: `${PANEL} > div > div:first-child`,
			props: ["background-color", "--red-bg"],
		});
		// The token is declared, and the two cells disagree — which is the whole
		// difference between a token and a literal.
		expect(charcoal["--red-bg"]).not.toBe("");
		expect(dflt["--red-bg"]).not.toBe("");
		expect(charcoal["background-color"]).not.toBe(dflt["background-color"]);
		// And neither is the literal it replaced.
		for (const cell of [charcoal, dflt]) {
			expect(cell["background-color"]).not.toMatch(/239,\s*68,\s*68/);
		}
	});
});
