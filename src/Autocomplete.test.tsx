import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete } from "./Autocomplete";

type Item = { id: string; name: string };

const POOL: Item[] = [
	{ id: "1", name: "Stripe" },
	{ id: "2", name: "Automattic" },
	{ id: "3", name: "Supabase" },
];

function filter(items: Item[], q: string) {
	if (!q.trim()) return items;
	const lower = q.toLowerCase();
	return items.filter((c) => c.name.toLowerCase().includes(lower));
}

function Wrapper(props: {
	onSelect?: (i: Item) => void;
	onCreate?: (q: string) => void;
	recents?: Item[];
	initial?: string;
	pool?: Item[];
	onValueChange?: (q: string) => void;
}) {
	const [value, setValue] = useState(props.initial ?? "");
	const pool = props.pool ?? POOL;
	const items = filter(pool, value);
	return (
		<Autocomplete<Item>
			value={value}
			onValueChange={(q) => {
				setValue(q);
				props.onValueChange?.(q);
			}}
			items={items}
			recentItems={props.recents}
			onSelect={props.onSelect ?? (() => {})}
			onCreate={props.onCreate}
			getItemLabel={(i) => i.name}
			getItemKey={(i) => i.id}
			placeholder="Search…"
		/>
	);
}

describe("Autocomplete", () => {
	it("typing fires onValueChange", () => {
		const onValueChange = vi.fn();
		render(<Wrapper onValueChange={onValueChange} />);
		const input = screen.getByRole("combobox");
		fireEvent.change(input, { target: { value: "stri" } });
		expect(onValueChange).toHaveBeenCalledWith("stri");
	});

	it("trigger has role=combobox + aria-autocomplete=list", () => {
		render(<Wrapper />);
		const input = screen.getByRole("combobox");
		expect(input).toHaveAttribute("aria-autocomplete", "list");
	});

	it("empty focus + recentItems opens dropdown showing RECENT header", () => {
		const recents: Item[] = [
			{ id: "r1", name: "RecentA" },
			{ id: "r2", name: "RecentB" },
		];
		render(<Wrapper recents={recents} />);
		const input = screen.getByRole("combobox");
		fireEvent.focus(input);
		expect(screen.getByText("RECENT")).toBeInTheDocument();
		expect(screen.getByText("RecentA")).toBeInTheDocument();
		expect(screen.getByText("RecentB")).toBeInTheDocument();
	});

	it("ArrowDown+Enter calls onSelect with the active item", () => {
		const onSelect = vi.fn();
		render(<Wrapper onSelect={onSelect} initial="S" />);
		const input = screen.getByRole("combobox");
		fireEvent.focus(input);
		// Open via change to ensure dropdown open with items.
		fireEvent.change(input, { target: { value: "S" } });
		// activeIndex starts at 0 → Enter selects first item ("Stripe").
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect.mock.calls[0][0].name).toBe("Stripe");
	});

	it("shows + Add button when items=[] + onCreate provided", () => {
		const onCreate = vi.fn();
		render(<Wrapper onCreate={onCreate} initial="Acme" pool={[]} />);
		const input = screen.getByRole("combobox");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Acme" } });
		const addBtn = screen.getByRole("button", { name: /Add "Acme" as new/ });
		expect(addBtn).toBeInTheDocument();
		// Sanity: create button is NOT role=option.
		expect(addBtn.getAttribute("role")).not.toBe("option");
		fireEvent.click(addBtn);
		expect(onCreate).toHaveBeenCalledWith("Acme");
	});

	it("shows 'No results' when items=[] + no onCreate", () => {
		render(<Wrapper initial="zzzz" pool={[]} />);
		const input = screen.getByRole("combobox");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "zzzz" } });
		expect(screen.getByText("No results")).toBeInTheDocument();
	});
});
