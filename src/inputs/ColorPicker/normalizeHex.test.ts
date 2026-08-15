import { describe, expect, it } from "vitest";
import { isPartialHex, normalizeHex } from "./normalizeHex";

describe("normalizeHex", () => {
	it("canonicalises every form a user might type", () => {
		const cases: Array<[string, string]> = [
			["#ff0000", "#ff0000"],
			["ff0000", "#ff0000"], // pasted from a design tool, no hash
			["#FF0000", "#ff0000"], // uppercase
			["#f00", "#ff0000"], // CSS shorthand
			["f00", "#ff0000"],
			["  #ff0000  ", "#ff0000"], // stray whitespace from a paste
			["#ff0000ff", "#ff0000"], // 8-digit: alpha dropped
			["#f00f", "#ff0000"], // 4-digit: alpha dropped
			["#abc", "#aabbcc"], // each nibble doubles, not repeated wholesale
		];
		for (const [input, expected] of cases) {
			expect(normalizeHex(input), `${input} should normalise to ${expected}`).toBe(expected);
		}
	});

	it("returns null for text that is not a colour", () => {
		for (const input of ["", "#", "#f", "#ff", "zzz", "#12345", "rgb(1,2,3)", "#1234567"]) {
			expect(normalizeHex(input), `${input} should not parse`).toBeNull();
		}
	});
});

describe("isPartialHex", () => {
	it("recognises a value that could still become a colour", () => {
		// Used so a half-typed value is not rendered as an error mid-keystroke.
		for (const input of ["", "#", "#f", "#ff", "ff", "#fff0"]) {
			expect(isPartialHex(input), `${input} should read as partial`).toBe(true);
		}
	});

	it("rejects text that can never become a colour", () => {
		for (const input of ["zz", "#gg", "rgb("]) {
			expect(isPartialHex(input), `${input} should not read as partial`).toBe(false);
		}
	});
});
