import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette, type CommandPaletteItem } from "./index";

const ITEMS: CommandPaletteItem[] = [
	{ id: "1", label: "Add application", group: "Actions", onSelect: vi.fn() },
	{ id: "2", label: "Search applications", group: "Actions", shortcut: "⌘K", onSelect: vi.fn() },
	{ id: "3", label: "Go to Board", group: "Navigation", onSelect: vi.fn() },
	{ id: "4", label: "Stripe — Staff Engineer", group: "Recent", onSelect: vi.fn() },
];

describe("CommandPalette", () => {
	it("returns null when open=false", () => {
		const { container } = render(<CommandPalette open={false} onClose={vi.fn()} items={ITEMS} />);
		expect(container.querySelector(".ds-atom-cmd-panel")).toBeNull();
		expect(document.body.querySelector(".ds-atom-cmd-panel")).toBeNull();
	});

	it("renders backdrop and panel when open=true", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		expect(document.querySelector(".ds-atom-modal-backdrop")).not.toBeNull();
		expect(document.querySelector(".ds-atom-cmd-panel")).not.toBeNull();
	});

	it("renders all items grouped when query is empty", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		expect(document.querySelectorAll(".ds-atom-cmd-item").length).toBe(4);
		expect(document.querySelectorAll(".ds-atom-cmd-group").length).toBe(3);
	});

	it("filters items by substring match (case-insensitive)", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		const input = document.querySelector<HTMLInputElement>(".ds-atom-cmd-input");
		if (!input) throw new Error("input not found");
		fireEvent.change(input, { target: { value: "go to" } });
		expect(document.querySelectorAll(".ds-atom-cmd-item").length).toBe(1);
		expect(document.querySelector(".ds-atom-cmd-item-label")?.textContent).toBe("Go to Board");
	});

	it("shows empty state when no results", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		const input = document.querySelector<HTMLInputElement>(".ds-atom-cmd-input");
		if (!input) throw new Error("input not found");
		fireEvent.change(input, { target: { value: "xyzzy" } });
		expect(document.querySelector(".ds-atom-cmd-empty")?.textContent).toContain("xyzzy");
	});

	it("Escape calls onClose", () => {
		const onClose = vi.fn();
		render(<CommandPalette open onClose={onClose} items={ITEMS} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalled();
	});

	it("ArrowDown advances activeIndex (clamped)", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		fireEvent.keyDown(document, { key: "ArrowDown" });
		fireEvent.keyDown(document, { key: "ArrowDown" });
		const items = document.querySelectorAll<HTMLButtonElement>(".ds-atom-cmd-item");
		expect(items[1]?.getAttribute("data-active")).toBe("true");
	});

	it("ArrowUp clamps at 0 (no wrap)", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		fireEvent.keyDown(document, { key: "ArrowUp" });
		fireEvent.keyDown(document, { key: "ArrowUp" });
		const items = document.querySelectorAll<HTMLButtonElement>(".ds-atom-cmd-item");
		for (const btn of items) {
			expect(btn.getAttribute("data-active")).not.toBe("true");
		}
	});

	it("Enter on active item fires onSelect and onClose", () => {
		const onClose = vi.fn();
		const onSelect = vi.fn();
		const items: CommandPaletteItem[] = [{ id: "x", label: "Test", group: "G", onSelect }];
		render(<CommandPalette open onClose={onClose} items={items} />);
		fireEvent.keyDown(document, { key: "ArrowDown" });
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onSelect).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
	});

	it("renders Kbd shortcut chip when item has shortcut", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		const items = document.querySelectorAll(".ds-atom-cmd-item");
		const second = items[1];
		expect(second?.querySelector(".ds-atom-kbd")).not.toBeNull();
	});

	it("clicking an item fires its onSelect and onClose", () => {
		const onClose = vi.fn();
		const onSelect = vi.fn();
		const items: CommandPaletteItem[] = [{ id: "x", label: "Test", group: "G", onSelect }];
		render(<CommandPalette open onClose={onClose} items={items} />);
		const btn = document.querySelector(".ds-atom-cmd-item");
		if (!btn) throw new Error("item not found");
		fireEvent.click(btn);
		expect(onSelect).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
	});

	it("backdrop click calls onClose; panel click does not", () => {
		const onClose = vi.fn();
		render(<CommandPalette open onClose={onClose} items={ITEMS} />);
		const backdrop = document.querySelector<HTMLDivElement>(".ds-atom-modal-backdrop");
		if (!backdrop) throw new Error("backdrop not found");
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalledTimes(1);
		const panel = document.querySelector(".ds-atom-cmd-panel");
		if (!panel) throw new Error("panel not found");
		fireEvent.click(panel);
		expect(onClose).toHaveBeenCalledTimes(1); // unchanged
	});

	// ── a11y: combobox + listbox + option wiring ──────────────────────────────

	it("input has role=combobox with aria-controls pointing at the listbox", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		const input = document.querySelector<HTMLInputElement>(".ds-atom-cmd-input");
		expect(input?.getAttribute("role")).toBe("combobox");
		const listId = input?.getAttribute("aria-controls");
		expect(listId).toBeTruthy();
		const list = document.getElementById(listId ?? "");
		expect(list?.getAttribute("role")).toBe("listbox");
	});

	it("list container has role=listbox and items have role=option", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		expect(document.querySelector('[role="listbox"]')).not.toBeNull();
		const options = document.querySelectorAll('[role="option"]');
		expect(options.length).toBe(ITEMS.length);
	});

	it("aria-activedescendant tracks the active option id on ArrowDown", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		const input = document.querySelector<HTMLInputElement>(".ds-atom-cmd-input");
		// No active descendant before any navigation
		expect(input?.getAttribute("aria-activedescendant")).toBeNull();
		fireEvent.keyDown(document, { key: "ArrowDown" });
		const activeId = input?.getAttribute("aria-activedescendant");
		expect(activeId).toBeTruthy();
		const activeOption = document.getElementById(activeId ?? "");
		expect(activeOption?.getAttribute("role")).toBe("option");
		expect(activeOption?.getAttribute("aria-selected")).toBe("true");
	});

	it("active option carries aria-selected=true; inactive options aria-selected=false", () => {
		render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		fireEvent.keyDown(document, { key: "ArrowDown" });
		const options = document.querySelectorAll<HTMLElement>('[role="option"]');
		expect(options[0]?.getAttribute("aria-selected")).toBe("true");
		expect(options[1]?.getAttribute("aria-selected")).toBe("false");
	});

	// ── scroll-lock ───────────────────────────────────────────────────────────

	it("locks body scroll while open and restores it on close", () => {
		document.body.style.overflow = "scroll";
		const { rerender } = render(<CommandPalette open onClose={vi.fn()} items={ITEMS} />);
		expect(document.body.style.overflow).toBe("hidden");
		rerender(<CommandPalette open={false} onClose={vi.fn()} items={ITEMS} />);
		expect(document.body.style.overflow).toBe("scroll");
		document.body.style.overflow = "";
	});
});
