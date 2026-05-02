import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from ".";
describe("Radio (standalone)", () => {
	it("renders type=radio", () => {
		const { getByRole } = render(<Radio name="x" value="a" label="A" />);
		expect(getByRole("radio")).toHaveAttribute("type", "radio");
	});

	it("calls onChange when clicked", () => {
		const onChange = vi.fn();
		const { getByText } = render(<Radio name="x" value="a" label="A" onChange={onChange} />);
		fireEvent.click(getByText("A"));
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("disabled attribute set", () => {
		const { getByRole } = render(<Radio name="x" value="a" label="A" disabled />);
		expect(getByRole("radio")).toBeDisabled();
	});
});

describe("RadioGroup", () => {
	it("renders role=radiogroup", () => {
		const { getByRole } = render(
			<RadioGroup name="x">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		expect(getByRole("radiogroup")).toBeInTheDocument();
	});

	it("propagates name to children", () => {
		const { getByRole } = render(
			<RadioGroup name="status">
				<Radio value="a" label="A" />
			</RadioGroup>,
		);
		expect(getByRole("radio")).toHaveAttribute("name", "status");
	});

	it("controlled: only the matching value is checked", () => {
		const { getByLabelText } = render(
			<RadioGroup name="x" value="b">
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
				<Radio value="c" label="C" />
			</RadioGroup>,
		);
		expect((getByLabelText("A") as HTMLInputElement).checked).toBe(false);
		expect((getByLabelText("B") as HTMLInputElement).checked).toBe(true);
		expect((getByLabelText("C") as HTMLInputElement).checked).toBe(false);
	});

	it("onChange receives the clicked value", () => {
		const onChange = vi.fn();
		const { getByText } = render(
			<RadioGroup name="x" value="a" onChange={onChange}>
				<Radio value="a" label="A" />
				<Radio value="b" label="B" />
			</RadioGroup>,
		);
		fireEvent.click(getByText("B"));
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0]?.[0]).toBe("b");
	});

	it("end-to-end controlled flow updates selection", () => {
		function Harness() {
			const [v, setV] = useState("a");
			return (
				<RadioGroup name="x" value={v} onChange={(next) => setV(next)}>
					<Radio value="a" label="A" />
					<Radio value="b" label="B" />
				</RadioGroup>
			);
		}
		const { getByLabelText, getByText } = render(<Harness />);
		expect((getByLabelText("A") as HTMLInputElement).checked).toBe(true);
		fireEvent.click(getByText("B"));
		expect((getByLabelText("B") as HTMLInputElement).checked).toBe(true);
		expect((getByLabelText("A") as HTMLInputElement).checked).toBe(false);
	});
});
