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
		// Dispatched on document, matching how a real key press bubbles up from
		// the focused element. The listener moved from `window` to `document` so
		// every overlay in the system listens on the same target.
		fireEvent.keyDown(document, { key: "Escape" });
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

	// role="menu" commits the component to the WAI-ARIA menu keyboard model.
	// These were previously unimplemented — the role announced an interaction
	// contract the component did not honour.
	describe("a11y: arrow-key roving (WAI-ARIA menu pattern)", () => {
		const three: ActionSheetItem[] = [
			{ label: "One", onSelect: vi.fn() },
			{ label: "Two", onSelect: vi.fn() },
			{ label: "Three", onSelect: vi.fn() },
		];
		const menu = () => screen.getByRole("menu");
		const item = (name: string) => screen.getByRole("menuitem", { name });

		it("ArrowDown moves to the next item and wraps at the end", () => {
			render(<ActionSheet open onClose={() => {}} items={three} />);
			expect(document.activeElement).toBe(item("One"));
			fireEvent.keyDown(menu(), { key: "ArrowDown" });
			expect(document.activeElement).toBe(item("Two"));
			fireEvent.keyDown(menu(), { key: "ArrowDown" });
			expect(document.activeElement).toBe(item("Three"));
			fireEvent.keyDown(menu(), { key: "ArrowDown" });
			expect(document.activeElement).toBe(item("One"));
		});

		it("ArrowUp moves backwards and wraps at the start", () => {
			render(<ActionSheet open onClose={() => {}} items={three} />);
			fireEvent.keyDown(menu(), { key: "ArrowUp" });
			expect(document.activeElement).toBe(item("Three"));
			fireEvent.keyDown(menu(), { key: "ArrowUp" });
			expect(document.activeElement).toBe(item("Two"));
		});

		it("Home and End jump to the first and last item", () => {
			render(<ActionSheet open onClose={() => {}} items={three} />);
			fireEvent.keyDown(menu(), { key: "End" });
			expect(document.activeElement).toBe(item("Three"));
			fireEvent.keyDown(menu(), { key: "Home" });
			expect(document.activeElement).toBe(item("One"));
		});

		it("skips disabled items when roving", () => {
			const withDisabled: ActionSheetItem[] = [
				{ label: "One", onSelect: vi.fn() },
				{ label: "Nope", disabled: true, onSelect: vi.fn() },
				{ label: "Three", onSelect: vi.fn() },
			];
			render(<ActionSheet open onClose={() => {}} items={withDisabled} />);
			fireEvent.keyDown(menu(), { key: "ArrowDown" });
			expect(document.activeElement).toBe(item("Three"));
		});

		it("does not hijack unrelated keys", () => {
			render(<ActionSheet open onClose={() => {}} items={three} />);
			const before = document.activeElement;
			fireEvent.keyDown(menu(), { key: "a" });
			expect(document.activeElement).toBe(before);
		});
	});

	it("keeps items with duplicate labels distinct via id", () => {
		const dupes: ActionSheetItem[] = [
			{ id: "a", label: "Open", onSelect: vi.fn() },
			{ id: "b", label: "Open", onSelect: vi.fn() },
		];
		render(<ActionSheet open onClose={() => {}} items={dupes} />);
		expect(screen.getAllByRole("menuitem", { name: "Open" })).toHaveLength(2);
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

describe("ActionSheet — naming prop", () => {
	it("accepts the canonical ariaLabel spelling", () => {
		render(<ActionSheet open onClose={() => {}} items={items} ariaLabel="Photo actions" />);
		expect(screen.getByRole("menu", { name: "Photo actions" })).toBeTruthy();
	});

	it("still accepts the deprecated 'aria-label' spelling", () => {
		render(<ActionSheet open onClose={() => {}} items={items} aria-label="Legacy actions" />);
		expect(screen.getByRole("menu", { name: "Legacy actions" })).toBeTruthy();
	});

	it("prefers ariaLabel when both are supplied", () => {
		render(
			<ActionSheet
				open
				onClose={() => {}}
				items={items}
				ariaLabel="Canonical"
				aria-label="Legacy"
			/>,
		);
		expect(screen.getByRole("menu", { name: "Canonical" })).toBeTruthy();
	});
});
