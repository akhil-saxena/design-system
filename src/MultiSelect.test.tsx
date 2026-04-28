import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

const opts: MultiSelectOption[] = [
	{ value: "a", label: "Alpha" },
	{ value: "b", label: "Bravo" },
	{ value: "c", label: "Charlie" },
	{ value: "d", label: "Delta" },
	{ value: "e", label: "Echo" },
];

describe("MultiSelect", () => {
	it("renders placeholder when value is empty", () => {
		render(<MultiSelect value={[]} onChange={() => {}} options={opts} placeholder="Pick tags" />);
		expect(screen.getByRole("combobox")).toHaveTextContent("Pick tags");
	});

	it("renders 3 chips + '+N more' when value.length > 3", () => {
		render(<MultiSelect value={["a", "b", "c", "d", "e"]} onChange={() => {}} options={opts} />);
		const trigger = screen.getByRole("combobox");
		expect(within(trigger).getByText("Alpha")).toBeInTheDocument();
		expect(within(trigger).getByText("Bravo")).toBeInTheDocument();
		expect(within(trigger).getByText("Charlie")).toBeInTheDocument();
		expect(within(trigger).getByText("+2 more")).toBeInTheDocument();
		// 4th and 5th labels are NOT visible inside the trigger directly
		expect(within(trigger).queryByText("Delta")).not.toBeInTheDocument();
	});

	it("clicking an option in the listbox toggles it on (selection)", () => {
		const onChange = vi.fn();
		render(<MultiSelect value={[]} onChange={onChange} options={opts} />);
		fireEvent.click(screen.getByRole("combobox"));
		const listbox = screen.getByRole("listbox");
		fireEvent.click(within(listbox).getByText("Alpha"));
		expect(onChange).toHaveBeenCalledWith(["a"]);
	});

	it("clicking a selected option deselects it", () => {
		const onChange = vi.fn();
		render(<MultiSelect value={["a"]} onChange={onChange} options={opts} />);
		fireEvent.click(screen.getByRole("combobox"));
		const listbox = screen.getByRole("listbox");
		fireEvent.click(within(listbox).getByText("Alpha"));
		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("removing a chip filters it out of value", () => {
		const onChange = vi.fn();
		render(<MultiSelect value={["a", "b"]} onChange={onChange} options={opts} />);
		const removeAlpha = screen.getByRole("button", { name: /Remove Alpha/i });
		fireEvent.click(removeAlpha);
		expect(onChange).toHaveBeenCalledWith(["b"]);
	});

	it("listbox carries aria-multiselectable=true and options have aria-selected", () => {
		render(<MultiSelect value={["a"]} onChange={() => {}} options={opts} />);
		fireEvent.click(screen.getByRole("combobox"));
		const listbox = screen.getByRole("listbox");
		expect(listbox).toHaveAttribute("aria-multiselectable", "true");
		const selectedOpt = within(listbox).getByRole("option", { selected: true });
		expect(selectedOpt).toHaveTextContent("Alpha");
	});

	it("clicking '+N more' chip opens a popover with full selection and per-item remove", () => {
		const onChange = vi.fn();
		render(<MultiSelect value={["a", "b", "c", "d", "e"]} onChange={onChange} options={opts} />);
		fireEvent.click(screen.getByRole("button", { name: /\+2 more/ }));
		// Popover renders all 5 selected items with per-item Remove buttons
		const removeDelta = screen.getByRole("button", { name: /Remove Delta/i });
		fireEvent.click(removeDelta);
		expect(onChange).toHaveBeenCalledWith(["a", "b", "c", "e"]);
	});
});
