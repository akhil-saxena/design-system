import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextInput } from ".";
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

describe("TextInput — field chrome", () => {
	it("associates a visible label with the input", () => {
		render(<TextInput label="Email" />);
		// getByLabelText only resolves when htmlFor/id are wired correctly.
		expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
	});

	it("honours a consumer-supplied id instead of generating one", () => {
		render(<TextInput id="my-field" label="Email" />);
		expect(screen.getByLabelText("Email")).toHaveAttribute("id", "my-field");
	});

	it("wires hint and error text through aria-describedby", () => {
		render(<TextInput label="Email" hint="We never share it." errorMessage="Required" />);
		const input = screen.getByLabelText("Email");
		const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? [];
		expect(describedBy).toHaveLength(2);
		const texts = describedBy.map((id) => document.getElementById(id)?.textContent);
		expect(texts).toContain("We never share it.");
		expect(texts).toContain("Required");
	});

	it("preserves a consumer's own aria-describedby", () => {
		render(
			<>
				<span id="outside">External note</span>
				<TextInput label="Email" aria-describedby="outside" hint="Hint" />
			</>,
		);
		expect(screen.getByLabelText("Email").getAttribute("aria-describedby")).toMatch(/^outside /);
	});

	it("marks the field aria-invalid, not just data-error", () => {
		// data-error is styling only; assistive tech reads aria-invalid.
		const { rerender } = render(<TextInput label="Email" />);
		expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
		rerender(<TextInput label="Email" error />);
		expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
	});

	it("treats errorMessage as implying the error state", () => {
		render(<TextInput label="Email" errorMessage="Required" />);
		expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
		expect(screen.getByRole("alert")).toHaveTextContent("Required");
	});

	it("renders the bare input unchanged when no field chrome is requested", () => {
		// Guards the back-compat promise: adding these props must not alter the
		// DOM shape for existing call sites.
		const { container } = render(<TextInput placeholder="x" />);
		expect(container.firstElementChild?.tagName).toBe("INPUT");
		expect(container.querySelector(".ds-atom-field")).toBeNull();
	});

	it("keeps className on the control, not the new field wrapper", () => {
		const { container } = render(<TextInput label="Email" className="mine" />);
		expect(container.querySelector(".ds-atom-field")).not.toHaveClass("mine");
		expect(screen.getByLabelText("Email")).toHaveClass("mine");
	});
});
