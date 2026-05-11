import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "./ColorInput";

describe("ColorInput", () => {
	it("renders swatch + input", () => {
		const { container } = render(<ColorInput />);
		expect(container.querySelector(".ds-atom-colorinput")).not.toBeNull();
		expect(container.querySelector(".ds-input-wrap")).not.toBeNull();
		expect(container.querySelector("input.ds-input")).not.toBeNull();
	});

	it("renders label when provided", () => {
		const { container } = render(<ColorInput label="Primary color" />);
		expect(container.querySelector("label.ds-label")?.textContent).toBe("Primary color");
	});

	it("typing valid hex calls onChange", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorInput onChange={onChange} />);
		const input = container.querySelector<HTMLInputElement>("input.ds-input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "#abcdef" } });
		expect(onChange).toHaveBeenCalledWith("#abcdef");
	});

	it("typing partial hex does not call onChange", () => {
		const onChange = vi.fn();
		const { container } = render(<ColorInput onChange={onChange} />);
		const input = container.querySelector<HTMLInputElement>("input.ds-input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "#abc" } });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("controlled value updates swatch", () => {
		const { container, rerender } = render(<ColorInput value="#ff0000" />);
		rerender(<ColorInput value="#3b82f6" />);
		const swatch = container.querySelector<HTMLDivElement>(
			".ds-input-wrap > div",
		) as HTMLDivElement;
		expect(swatch.style.background).toContain("rgb(59, 130, 246)");
	});

	it("uses defaultValue in uncontrolled mode", () => {
		const { container } = render(<ColorInput defaultValue="#22c55e" />);
		const input = container.querySelector<HTMLInputElement>("input.ds-input") as HTMLInputElement;
		expect(input.value).toBe("#22c55e");
	});
});
