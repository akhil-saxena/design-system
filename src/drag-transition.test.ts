import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(resolve(__dirname, ".."), "src", "primitives.css"), "utf8");

/**
 * The drag-responsiveness fixes live entirely in CSS, and jsdom applies no
 * stylesheet — so the component tests that assert `data-dragging` flips prove
 * the *hook* fires, not that the transition is actually suppressed. The visual
 * suite cannot cover it either: it captures static screenshots, and this is a
 * timing property. These assertions close that gap by checking the rule itself.
 */
describe("drag responsiveness", () => {
	it("suppresses the RangeSlider fill transition while dragging", () => {
		// Without this rule the amber fill eases toward a thumb that moved
		// instantly, so the two halves of the control visibly separate mid-drag.
		const rule = css.match(
			/\.ds-atom-range\[data-dragging="true"\]\s+\.ds-atom-range-fill\s*\{[^}]*\}/,
		);
		expect(rule, "the data-dragging override is missing").not.toBeNull();
		expect(rule?.[0]).toMatch(/transition:\s*none/);
	});

	it("keeps the glide for discrete changes", () => {
		// Arrow keys and programmatic sets should still animate — the fix is scoped
		// to the drag, not a blanket removal.
		const base = css.match(/\.ds-atom-range-fill\s*\{[^}]*\}/);
		expect(base?.[0]).toMatch(/transition:\s*width/);
	});

	it("keeps the ProgressBar fill responsive to a continuously updated value", () => {
		// Was 0.5s, which left the bar half a second behind the number beside it.
		const rule = css.match(/\.ds-atom-progress-fill\s*\{[^}]*\}/);
		const duration = rule?.[0].match(/transition:\s*width\s+([\d.]+)s/)?.[1];
		expect(duration, "no width transition found").toBeDefined();
		expect(Number(duration)).toBeLessThanOrEqual(0.25);
	});
});
