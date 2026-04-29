import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
	it("renders native input[type=checkbox]", () => {
		const { getByRole } = render(<Checkbox label="x" />);
		expect(getByRole("checkbox")).toHaveAttribute("type", "checkbox");
	});

	it("toggles on click via the wrapping label (native semantics)", () => {
		const { getByRole, getByText } = render(<Checkbox label="Click me" defaultChecked={false} />);
		const checkbox = getByRole("checkbox") as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
		fireEvent.click(getByText("Click me"));
		expect(checkbox.checked).toBe(true);
	});

	it("calls onChange", () => {
		const onChange = vi.fn();
		const { getByRole } = render(<Checkbox label="x" onChange={onChange} />);
		fireEvent.click(getByRole("checkbox"));
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("disabled state sets the native disabled attribute", () => {
		// jsdom fires synthetic click events on disabled inputs; browsers do not.
		// We verify the contract that matters: the native disabled attribute is set,
		// which the browser uses to suppress real user interaction + form submission.
		const { getByRole } = render(<Checkbox label="x" disabled />);
		expect(getByRole("checkbox")).toBeDisabled();
	});

	it("forwards ref to input element", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Checkbox label="x" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
		expect(ref.current?.type).toBe("checkbox");
	});

	it("controlled value reflects prop", () => {
		const { getByRole, rerender } = render(
			<Checkbox label="x" checked={false} onChange={() => {}} />,
		);
		expect((getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
		rerender(<Checkbox label="x" checked={true} onChange={() => {}} />);
		expect((getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
	});

	it("sets DOM indeterminate=true when indeterminate prop is true", () => {
		const { container } = render(
			<Checkbox checked={false} onChange={() => {}} indeterminate aria-label="Test" />,
		);
		const input = container.querySelector("input[type=checkbox]") as HTMLInputElement;
		expect(input.indeterminate).toBe(true);
	});

	it("sets DOM indeterminate=false when indeterminate prop is false", () => {
		const { container } = render(
			<Checkbox checked={false} onChange={() => {}} indeterminate={false} aria-label="Test" />,
		);
		const input = container.querySelector("input[type=checkbox]") as HTMLInputElement;
		expect(input.indeterminate).toBe(false);
	});
});
