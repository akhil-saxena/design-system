import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
	it("renders with rows", () => {
		const { getByRole } = render(<Textarea rows={5} placeholder="x" />);
		expect(getByRole("textbox")).toHaveAttribute("rows", "5");
	});

	it("calls onChange when typed", () => {
		const onChange = vi.fn();
		const { getByRole } = render(<Textarea onChange={onChange} />);
		fireEvent.change(getByRole("textbox"), { target: { value: "abc" } });
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("disabled", () => {
		const { getByRole } = render(<Textarea disabled />);
		expect(getByRole("textbox")).toBeDisabled();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLTextAreaElement>();
		render(<Textarea ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
	});

	it("error attribute reflects error prop", () => {
		const { getByRole } = render(<Textarea error />);
		expect(getByRole("textbox")).toHaveAttribute("data-error", "true");
	});

	it("renders character counter when maxLength provided (uncontrolled)", () => {
		const { getByText } = render(<Textarea maxLength={100} defaultValue="hello" />);
		expect(getByText("5/100")).toBeInTheDocument();
	});

	it("counter updates on type", () => {
		const { getByText, getByRole } = render(<Textarea maxLength={50} />);
		fireEvent.change(getByRole("textbox"), { target: { value: "abc" } });
		expect(getByText("3/50")).toBeInTheDocument();
	});

	it("no counter when maxLength absent", () => {
		const { container } = render(<Textarea defaultValue="abc" />);
		expect(container.textContent).not.toContain("/");
	});
});
