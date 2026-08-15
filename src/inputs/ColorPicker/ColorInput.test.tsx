import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "./ColorInput";

const field = () => screen.getByLabelText("Brand") as HTMLInputElement;
const swatchBg = () =>
	(document.querySelector(".ds-atom-colorinput-swatch") as HTMLElement).style.background;

function Controlled() {
	const [v, setV] = useState("#f59e0b");
	return <ColorInput label="Brand" value={v} onChange={setV} />;
}

describe("ColorInput", () => {
	it("composes the design system TextInput rather than a bare input", () => {
		// It used to render a raw <input className="ds-input"> — a class that does
		// not exist in the stylesheet (the real one is .ds-atom-input), so the field
		// had no design-system styling at all.
		const { container } = render(<ColorInput label="Brand" />);
		expect(container.querySelector(".ds-atom-input-wrap")).not.toBeNull();
		expect(container.querySelector(".ds-input, .ds-input-wrap")).toBeNull();
	});

	it("associates the visible label with the field", () => {
		render(<ColorInput label="Brand" />);
		expect(field()).toBeInstanceOf(HTMLInputElement);
	});

	it("uses defaultValue when uncontrolled", () => {
		render(<ColorInput label="Brand" defaultValue="#22c55e" />);
		expect(field().value).toBe("#22c55e");
	});

	it("follows a controlled value", () => {
		const { rerender } = render(<ColorInput label="Brand" value="#ff0000" />);
		rerender(<ColorInput label="Brand" value="#3b82f6" />);
		expect(swatchBg()).toContain("rgb(59, 130, 246)");
	});
});

/**
 * The reported bug: typing in the field did not move the swatch. The old
 * validator was `/^#[0-9a-fA-F]{6}$/`, so the two most natural ways to enter a
 * colour — pasting `ff0000` without the hash, and CSS shorthand `#f00` — were
 * silently ignored, with no swatch change, no onChange and no error.
 */
describe("ColorInput — hex normalisation", () => {
	const cases: Array<[string, string, string]> = [
		["#ff0000", "#ff0000", "6-digit with hash"],
		["ff0000", "#ff0000", "6-digit without hash"],
		["#f00", "#ff0000", "3-digit shorthand"],
		["f00", "#ff0000", "3-digit shorthand without hash"],
		["#FF0000", "#ff0000", "uppercase is canonicalised"],
		["  #ff0000  ", "#ff0000", "surrounding whitespace"],
		["#ff0000ff", "#ff0000", "8-digit drops the alpha"],
	];

	for (const [typed, expected, label] of cases) {
		it(`uncontrolled: ${label} (${typed.trim()}) updates the swatch`, () => {
			render(<ColorInput label="Brand" />);
			fireEvent.change(field(), { target: { value: typed } });
			expect(swatchBg()).toContain("rgb(255, 0, 0)");
		});

		it(`controlled: ${label} (${typed.trim()}) reaches onChange as ${expected}`, () => {
			const onChange = vi.fn();
			render(<ColorInput label="Brand" onChange={onChange} />);
			fireEvent.change(field(), { target: { value: typed } });
			expect(onChange).toHaveBeenCalledWith(expected);
		});
	}

	it("round-trips through a controlled parent", () => {
		render(<Controlled />);
		fireEvent.change(field(), { target: { value: "f00" } });
		expect(swatchBg()).toContain("rgb(255, 0, 0)");
		// The parent normalises, so the field settles on the canonical form.
		expect(field().value).toBe("#ff0000");
	});

	it("leaves the typed text alone while it is still incomplete", () => {
		// Rewriting the input mid-keystroke would fight the cursor.
		render(<ColorInput label="Brand" />);
		fireEvent.change(field(), { target: { value: "#ff" } });
		expect(field().value).toBe("#ff");
	});

	it("does not fire onChange for text that is not yet a colour", () => {
		const onChange = vi.fn();
		render(<ColorInput label="Brand" onChange={onChange} />);
		fireEvent.change(field(), { target: { value: "#ff" } });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("flags genuinely invalid input, but not partial input", () => {
		render(<ColorInput label="Brand" />);
		// Mid-typing is not an error state.
		fireEvent.change(field(), { target: { value: "#ff" } });
		expect(field()).not.toHaveAttribute("aria-invalid");
		// "zzz" can never become a hex colour, so it is.
		fireEvent.change(field(), { target: { value: "zzzzzz" } });
		expect(field()).toHaveAttribute("aria-invalid", "true");
	});
});
