import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberStepper } from "./NumberStepper";

describe("NumberStepper", () => {
	it("renders the value in the input", () => {
		render(<NumberStepper value={5} onChange={() => {}} />);
		expect(screen.getByRole("textbox")).toHaveValue("5");
	});

	it("+ button calls onChange with value + step", () => {
		const fn = vi.fn();
		render(<NumberStepper value={5} onChange={fn} step={1} />);
		fireEvent.click(screen.getByLabelText("Increment"));
		expect(fn).toHaveBeenCalledWith(6);
	});

	it("− button calls onChange with value - step", () => {
		const fn = vi.fn();
		render(<NumberStepper value={5} onChange={fn} step={1} />);
		fireEvent.click(screen.getByLabelText("Decrement"));
		expect(fn).toHaveBeenCalledWith(4);
	});

	it("clamps at min — − button disabled when value <= min", () => {
		render(<NumberStepper value={0} onChange={() => {}} min={0} step={1} />);
		expect(screen.getByLabelText("Decrement")).toBeDisabled();
	});

	it("clamps at max — + button disabled when value >= max", () => {
		render(<NumberStepper value={100} onChange={() => {}} max={100} step={1} />);
		expect(screen.getByLabelText("Increment")).toBeDisabled();
	});

	it("formatFn output appears in display", () => {
		render(<NumberStepper value={50} onChange={() => {}} formatFn={(v) => `${v}%`} />);
		expect(screen.getByRole("textbox")).toHaveValue("50%");
	});

	it("disabled disables both buttons + input", () => {
		render(<NumberStepper value={5} onChange={() => {}} disabled />);
		expect(screen.getByLabelText("Decrement")).toBeDisabled();
		expect(screen.getByLabelText("Increment")).toBeDisabled();
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("step !== 1 increments by step", () => {
		const fn = vi.fn();
		render(<NumberStepper value={1000} onChange={fn} step={1000} />);
		fireEvent.click(screen.getByLabelText("Increment"));
		expect(fn).toHaveBeenCalledWith(2000);
	});

	it("forwards ref to internal input", () => {
		const ref = createRef<HTMLInputElement>();
		render(<NumberStepper ref={ref} value={5} onChange={() => {}} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});
});
