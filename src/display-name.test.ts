import { describe, expect, it } from "vitest";
import * as DS from "./index";

/**
 * Every exported component should identify itself in React DevTools.
 *
 * `forwardRef` only inherits a name when its render function has one. Where the
 * inner function is anonymous the component shows up as "ForwardRef", and where
 * it is named after an implementation detail it shows up as that — so a
 * component tree reads "SegmentedControlInner" or nothing at all instead of the
 * name the consumer wrote.
 */
type Named = { displayName?: string; name?: string; $$typeof?: symbol; render?: { name?: string } };

describe("component identity in DevTools", () => {
	const entries = Object.entries(DS as Record<string, unknown>).filter(
		([name, v]) =>
			/^[A-Z]/.test(name) &&
			(typeof v === "function" || (typeof v === "object" && v !== null && "render" in v)),
	);

	it("exports enough components to make this check meaningful", () => {
		expect(entries.length).toBeGreaterThan(50);
	});

	for (const [exportName, value] of entries) {
		it(`${exportName} reports its own name`, () => {
			const c = value as Named;
			const reported = c.displayName ?? c.render?.name ?? c.name ?? "";
			expect(reported, `${exportName} is anonymous in DevTools`).not.toBe("");
			// An implementation-detail name ("…Inner", "…Impl") is as unhelpful as none.
			expect(reported, `${exportName} reports the internal name "${reported}"`).not.toMatch(
				/(Inner|Impl|Base)$/,
			);
		});
	}
});
