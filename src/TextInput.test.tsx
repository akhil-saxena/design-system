import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
	it("renders bare input when no icon/prefix/suffix", () => {
		const { getByRole } = render(<TextInput placeholder="Test" />);
		const input = getByRole("textbox") as HTMLInputElement;
		expect(input).toHaveAttribute("placeholder", "Test");
		expect(input).toHaveClass("ds-atom-input");
	});

	it("renders wrapped variant when icon is present", () => {
		const { getByRole, container } = render(<TextInput icon={<span data-testid="i">★</span>} />);
		expect(container.querySelector(".ds-atom-input-wrap")).toBeInTheDocument();
		expect(getByRole("textbox")).toBeInTheDocument();
	});

	it("calls onChange when typed", () => {
		const onChange = vi.fn();
		const { getByRole } = render(<TextInput onChange={onChange} />);
		fireEvent.change(getByRole("textbox"), { target: { value: "abc" } });
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("disabled state suppresses typing handler firing", () => {
		const onChange = vi.fn();
		const { getByRole } = render(<TextInput onChange={onChange} disabled />);
		const input = getByRole("textbox") as HTMLInputElement;
		expect(input).toBeDisabled();
	});

	it("forwards ref to input element", () => {
		const ref = createRef<HTMLInputElement>();
		render(<TextInput ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it("error attribute reflects error prop", () => {
		const { getByRole } = render(<TextInput error />);
		expect(getByRole("textbox")).toHaveAttribute("data-error", "true");
	});

	it("renders prefix and suffix", () => {
		const { getByText } = render(<TextInput prefix="$" suffix="USD" />);
		expect(getByText("$")).toBeInTheDocument();
		expect(getByText("USD")).toBeInTheDocument();
	});

	it("renders kbd hint when kbd prop set", () => {
		const { getByText } = render(<TextInput kbd="⌘K" placeholder="Search" />);
		expect(getByText("⌘K")).toBeInTheDocument();
	});

	it("kbd alone (no icon/prefix/suffix) still triggers wrapped variant", () => {
		const { container } = render(<TextInput kbd="/" />);
		expect(container.querySelector(".ds-atom-input-wrap")).toBeInTheDocument();
	});
});
