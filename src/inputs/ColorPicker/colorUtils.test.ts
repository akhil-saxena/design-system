import { describe, expect, it } from "vitest";
import { hexToHsv, hsvToHex } from "./colorUtils";

describe("hexToHsv", () => {
	it("white", () => {
		const [h, s, v] = hexToHsv("#ffffff");
		expect(h).toBeCloseTo(0, 5);
		expect(s).toBeCloseTo(0, 5);
		expect(v).toBeCloseTo(1, 5);
	});

	it("black", () => {
		const [h, s, v] = hexToHsv("#000000");
		expect(h).toBeCloseTo(0, 5);
		expect(s).toBeCloseTo(0, 5);
		expect(v).toBeCloseTo(0, 5);
	});

	it("pure red", () => {
		const [h, s, v] = hexToHsv("#ff0000");
		expect(h).toBeCloseTo(0, 5);
		expect(s).toBeCloseTo(1, 5);
		expect(v).toBeCloseTo(1, 5);
	});

	it("pure green", () => {
		const [h, s, v] = hexToHsv("#00ff00");
		expect(h).toBeCloseTo(120, 5);
		expect(s).toBeCloseTo(1, 5);
		expect(v).toBeCloseTo(1, 5);
	});

	it("pure blue", () => {
		const [h, s, v] = hexToHsv("#0000ff");
		expect(h).toBeCloseTo(240, 5);
		expect(s).toBeCloseTo(1, 5);
		expect(v).toBeCloseTo(1, 5);
	});

	it("amber #f59e0b", () => {
		const [h, s, v] = hexToHsv("#f59e0b");
		// Amber is around hue 38, full saturation, near-full value
		expect(h).toBeGreaterThan(36);
		expect(h).toBeLessThan(42);
		expect(s).toBeGreaterThan(0.95);
		expect(v).toBeGreaterThan(0.9);
	});
});

describe("hsvToHex", () => {
	it("white corner: hsv(0,0,1) -> #ffffff", () => {
		expect(hsvToHex(0, 0, 1)).toBe("#ffffff");
	});

	it("black corner: hsv(0,0,0) -> #000000", () => {
		expect(hsvToHex(0, 0, 0)).toBe("#000000");
	});

	it("pure red: hsv(0,1,1) -> #ff0000", () => {
		expect(hsvToHex(0, 1, 1)).toBe("#ff0000");
	});

	it("pure green: hsv(120,1,1) -> #00ff00", () => {
		expect(hsvToHex(120, 1, 1)).toBe("#00ff00");
	});

	it("pure blue: hsv(240,1,1) -> #0000ff", () => {
		expect(hsvToHex(240, 1, 1)).toBe("#0000ff");
	});

	it("output is always 7 chars: # + 6 lowercase hex digits", () => {
		const samples = [
			hsvToHex(0, 0, 1),
			hsvToHex(180, 0.5, 0.5),
			hsvToHex(38, 1, 0.965),
			hsvToHex(300, 0.7, 0.3),
		];
		for (const out of samples) {
			expect(out).toMatch(/^#[0-9a-f]{6}$/);
			expect(out.length).toBe(7);
		}
	});
});

describe("hexToHsv <-> hsvToHex round-trip", () => {
	it("'#f59e0b' round-trip", () => {
		const [h, s, v] = hexToHsv("#f59e0b");
		expect(hsvToHex(h, s, v)).toBe("#f59e0b");
	});

	it("'#3b82f6' round-trip", () => {
		const [h, s, v] = hexToHsv("#3b82f6");
		expect(hsvToHex(h, s, v)).toBe("#3b82f6");
	});

	it("'#ef4444' round-trip", () => {
		const [h, s, v] = hexToHsv("#ef4444");
		expect(hsvToHex(h, s, v)).toBe("#ef4444");
	});
});
