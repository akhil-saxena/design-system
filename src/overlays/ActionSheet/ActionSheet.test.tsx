import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionSheet, type ActionSheetItem } from "./index";

const items: ActionSheetItem[] = [
	{ label: "Edit", onSelect: vi.fn() },
	{ label: "Delete", variant: "destructive", onSelect: vi.fn() },
];

describe("ActionSheet", () => {
	it("renders nothing when closed", () => {
		render(<ActionSheet open={false} onClose={() => {}} items={items} />);
		expect(screen.queryByRole("menu")).toBeNull();
	});

	it("renders the items when open", () => {
		render(<ActionSheet open onClose={() => {}} items={items} />);
		expect(screen.getByRole("menuitem", { name: "Edit" })).toBeTruthy();
		expect(screen.getByRole("menuitem", { name: "Delete" })).toBeTruthy();
	});

	it("fires the item's onSelect and onClose when tapped", () => {
		const onClose = vi.fn();
		const onSelect = vi.fn();
		render(<ActionSheet open onClose={onClose} items={[{ label: "Edit", onSelect }]} />);
		fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("dismisses on Escape", () => {
		const onClose = vi.fn();
		render(<ActionSheet open onClose={onClose} items={items} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onClose).toHaveBeenCalled();
	});
});
