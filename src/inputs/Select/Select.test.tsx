import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from ".";
const STATUS_OPTIONS: SelectOption[] = [
	{ value: "wishlist", label: "Wishlist", dotColor: "#9ca3af" },
	{ value: "applied", label: "Applied", dotColor: "var(--amber)" },
	{ value: "interview", label: "Interview", dotColor: "#3b82f6" },
	{ value: "offer", label: "Offer", dotColor: "#10b981" },
	{ value: "rejected", label: "Rejected", dotColor: "#ef4444" },
];

function Harness({
	onChange,
	initialValue = null,
	searchable = true,
}: {
	onChange?: (v: string) => void;
	initialValue?: string | null;
	searchable?: boolean;
}) {
	const [value, setValue] = useState<string | null>(initialValue);
	return (
		<Select
			value={value}
			onChange={(v) => {
				setValue(v);
				onChange?.(v);
			}}
			options={STATUS_OPTIONS}
			placeholder="Choose status"
			searchable={searchable}
		/>
	);
}

describe("Select", () => {
	it("renders placeholder when value is null", () => {
		render(<Harness />);
		const trigger = screen.getByRole("combobox");
		expect(trigger.textContent).toContain("Choose status");
	});

	it("trigger has correct ARIA: combobox + haspopup=listbox + aria-controls", () => {
		render(<Harness />);
		const trigger = screen.getByRole("combobox");
		expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(trigger.getAttribute("aria-controls")).toBeTruthy();
	});

	it("clicking trigger opens the listbox with all options visible in document.body", () => {
		render(<Harness searchable={false} />);
		const trigger = screen.getByRole("combobox");
		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		const opts = document.body.querySelectorAll('[role="option"]');
		expect(opts.length).toBe(STATUS_OPTIONS.length);
	});

	it("ArrowDown then Enter selects the next option (calls onChange with value)", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} searchable={false} />);
		const trigger = screen.getByRole("combobox");
		fireEvent.click(trigger);
		// activeIndex starts at 0; ArrowDown moves to 1, Enter selects index 1.
		fireEvent.keyDown(document, { key: "ArrowDown" });
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onChange).toHaveBeenCalledWith(STATUS_OPTIONS[1].value);
	});

	it("search filters options by case-insensitive label substring", () => {
		render(<Harness />);
		fireEvent.click(screen.getByRole("combobox"));
		const search = document.body.querySelector(
			".ds-atom-select-search input",
		) as HTMLInputElement | null;
		expect(search).not.toBeNull();
		fireEvent.change(search!, { target: { value: "off" } });
		const visible = Array.from(document.body.querySelectorAll('[role="option"]'));
		expect(visible.length).toBe(1);
		expect(visible[0].textContent).toContain("Offer");
	});

	it("empty filter result shows the No results empty state", () => {
		render(<Harness />);
		fireEvent.click(screen.getByRole("combobox"));
		const search = document.body.querySelector(
			".ds-atom-select-search input",
		) as HTMLInputElement | null;
		fireEvent.change(search!, { target: { value: "zzznomatch" } });
		expect(document.body.querySelectorAll('[role="option"]').length).toBe(0);
		expect(document.body.textContent).toContain("No results");
	});

	it("Escape closes the dropdown (aria-expanded back to false)", () => {
		render(<Harness searchable={false} />);
		const trigger = screen.getByRole("combobox");
		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		fireEvent.keyDown(document, { key: "Escape" });
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
	});
});
