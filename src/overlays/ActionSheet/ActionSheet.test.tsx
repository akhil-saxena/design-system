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

	it("a11y: role=menu has an accessible name (default 'Actions', overridable)", () => {
		const { rerender } = render(<ActionSheet open onClose={() => {}} items={items} />);
		expect(screen.getByRole("menu").getAttribute("aria-label")).toBe("Actions");
		rerender(<ActionSheet open onClose={() => {}} items={items} aria-label="Photo actions" />);
		expect(screen.getByRole("menu", { name: "Photo actions" })).toBeTruthy();
	});

	it("a11y: moves focus into the sheet on open (first menu item)", () => {
		render(<ActionSheet open onClose={() => {}} items={items} />);
		expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }));
	});

	it("a11y: restores focus to the trigger on close", () => {
		const onClose = vi.fn();
		const { rerender } = render(
			<>
				<button type="button" data-testid="trigger">
					Open
				</button>
				<ActionSheet open={false} onClose={onClose} items={items} />
			</>,
		);
		const trigger = screen.getByTestId("trigger");
		trigger.focus();
		expect(document.activeElement).toBe(trigger);

		// Open: focus moves into the sheet.
		rerender(
			<>
				<button type="button" data-testid="trigger">
					Open
				</button>
				<ActionSheet open onClose={onClose} items={items} />
			</>,
		);
		expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }));

		// Close: focus trap cleanup restores focus to the trigger.
		rerender(
			<>
				<button type="button" data-testid="trigger">
					Open
				</button>
				<ActionSheet open={false} onClose={onClose} items={items} />
			</>,
		);
		expect(document.activeElement).toBe(trigger);
	});
});
