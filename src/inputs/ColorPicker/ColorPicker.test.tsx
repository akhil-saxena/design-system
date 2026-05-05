import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./index";

describe("ColorPicker", () => {
	it("renders with default amber color", () => {
		const { container } = render(<ColorPicker />);
		expect(container.querySelector(".ds-atom-colorpicker")).not.toBeNull();
	});

	it("renders 10 preset swatches", () => {
		const { container } = render(<ColorPicker />);
		expect(container.querySelectorAll(".ds-atom-colorpicker-swatch").length).toBe(10);
	});

	it("renders 3 tonal strips with 8 cells each (24 total)", () => {
		const { container } = render(<ColorPicker />);
		expect(container.querySelectorAll(".ds-atom-colorpicker-cell").length).toBe(24);
	});

	it("clicking a preset swatch fires onChange with that hex", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorPicker onChange={onChange} />);
		const swatches = container.querySelectorAll<HTMLButtonElement>(
			".ds-atom-colorpicker-swatch",
		);
		fireEvent.click(swatches[1] as HTMLButtonElement); // '#ef4444'
		expect(onChange).toHaveBeenCalledWith("#ef4444");
	});

	it("clicking a tonal cell fires onChange with that hex", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorPicker onChange={onChange} />);
		const cells = container.querySelectorAll<HTMLButtonElement>(".ds-atom-colorpicker-cell");
		fireEvent.click(cells[0] as HTMLButtonElement); // first amber cell '#fef3c7'
		expect(onChange).toHaveBeenCalledWith("#fef3c7");
	});

	it("hex input shows current color", () => {
		const { container } = render(<ColorPicker value="#3b82f6" />);
		const hex = container.querySelector<HTMLInputElement>("input.ds-input");
		expect((hex as HTMLInputElement).value).toBe("#3b82f6");
	});

	it("partial hex input does not corrupt color state", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorPicker onChange={onChange} value="#ff0000" />);
		const hexInput = container.querySelector<HTMLInputElement>(
			"input.ds-input",
		) as HTMLInputElement;
		fireEvent.change(hexInput, { target: { value: "#abc" } }); // partial
		expect(onChange).not.toHaveBeenCalled();
	});

	it("valid hex input updates color via onChange", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorPicker onChange={onChange} />);
		const hexInput = container.querySelector<HTMLInputElement>(
			"input.ds-input",
		) as HTMLInputElement;
		fireEvent.change(hexInput, { target: { value: "#abcdef" } });
		expect(onChange).toHaveBeenCalledWith("#abcdef");
	});

	it("alpha input shows 100% by default and is readonly", () => {
		const { container } = render(<ColorPicker />);
		const alpha = container.querySelectorAll<HTMLInputElement>(
			"input.ds-input",
		)[1] as HTMLInputElement;
		expect(alpha.value).toBe("100%");
		expect(alpha.readOnly).toBe(true);
	});

	it("selected preset shows 2.5px ink border", () => {
		const { container } = render(<ColorPicker value="#f59e0b" />);
		const swatches = container.querySelectorAll<HTMLButtonElement>(
			".ds-atom-colorpicker-swatch",
		);
		expect((swatches[0] as HTMLButtonElement).style.border).toContain(
			"2.5px solid var(--ink)",
		);
	});

	it("renders gradient canvas with role=slider", () => {
		const { container } = render(<ColorPicker />);
		const canvas = container.querySelector(".ds-atom-colorpicker-canvas");
		expect(canvas?.getAttribute("role")).toBe("slider");
		expect(canvas?.getAttribute("tabindex")).toBe("0");
	});

	it("renders hue + opacity sliders with role=slider", () => {
		const { container } = render(<ColorPicker />);
		const sliders = container.querySelectorAll('[role="slider"]');
		expect(sliders.length).toBe(3); // canvas + hue + opacity
	});

	it("controlled value changes update display", () => {
		const { container, rerender } = render(<ColorPicker value="#ff0000" />);
		rerender(<ColorPicker value="#3b82f6" />);
		const swatches = container.querySelectorAll<HTMLButtonElement>(
			".ds-atom-colorpicker-swatch",
		);
		const blueSwatch = swatches[2] as HTMLButtonElement; // '#3b82f6' is index 2
		expect(blueSwatch.style.border).toContain("2.5px solid var(--ink)");
	});
});
