import { describe, expect, it } from "vitest";
import { focusRing, glass, glassHeavy, glassSubtle, label } from "./_tokens";

describe("_tokens style helpers", () => {
	it("glass uses var(--g-bg) and var(--g-blur)", () => {
		expect(glass.background).toBe("var(--g-bg)");
		expect(glass.backdropFilter).toBe("blur(var(--g-blur))");
		expect(glass.border).toBe("1px solid var(--g-bd)");
		expect(glass.borderRadius).toBe("var(--radius-xl)");
	});

	it("glassSubtle uses 6px blur (handoff Glass Effect: Subtle row)", () => {
		expect(glassSubtle.backdropFilter).toBe("blur(6px)");
		expect(glassSubtle.background).toBe("rgba(255,255,255,.85)");
	});

	it("glassHeavy uses 22px blur (handoff Glass Effect: Heavy row)", () => {
		expect(glassHeavy.backdropFilter).toBe("blur(22px)");
		expect(glassHeavy.background).toBe("rgba(255,255,255,.4)");
	});

	it("label is mono uppercase 10px / 600 weight (spec §4)", () => {
		expect(label.fontFamily).toBe("var(--mono)");
		expect(label.fontSize).toBe(10);
		expect(label.fontWeight).toBe(600);
		expect(label.letterSpacing).toBe("0.08em");
		expect(label.textTransform).toBe("uppercase");
		expect(label.color).toBe("var(--ink-3)");
	});

	it("focusRing produces the signature 3px amber halo", () => {
		expect(focusRing.outline).toBe("none");
		expect(focusRing.borderColor).toBe("var(--amber)");
		expect(focusRing.boxShadow).toBe("0 0 0 3px rgba(245,158,11,.12)");
	});
});
