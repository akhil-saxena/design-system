import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu, type ContextMenuItem, Popover } from ".";
function PopoverHarness({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const anchorRef = useRef<HTMLButtonElement>(null);
	return (
		<div>
			<button ref={anchorRef} type="button">
				anchor
			</button>
			<Popover anchorRef={anchorRef} open={open} onOpenChange={onOpenChange}>
				<div>content</div>
			</Popover>
		</div>
	);
}

function ContextMenuHarness({
	items,
	onOpenChange,
}: {
	items: ContextMenuItem[];
	onOpenChange: (v: boolean) => void;
}) {
	const anchorRef = useRef<HTMLButtonElement>(null);
	return (
		<div>
			<button ref={anchorRef} type="button">
				anchor
			</button>
			<ContextMenu anchorRef={anchorRef} open={true} onOpenChange={onOpenChange} items={items} />
		</div>
	);
}

describe("Popover", () => {
	it("renders portaled to body when open=true", () => {
		render(<PopoverHarness open={true} onOpenChange={() => {}} />);
		const panel = document.body.querySelector(".ds-atom-popover");
		expect(panel).not.toBeNull();
		expect(screen.getByText("content")).toBeInTheDocument();
	});

	it("renders nothing when open=false", () => {
		render(<PopoverHarness open={false} onOpenChange={() => {}} />);
		expect(document.body.querySelector(".ds-atom-popover")).toBeNull();
	});

	it("calls onOpenChange(false) on outside click", () => {
		const onOpenChange = vi.fn();
		render(<PopoverHarness open={true} onOpenChange={onOpenChange} />);
		fireEvent.mouseDown(document.body);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("calls onOpenChange(false) on Escape", () => {
		const onOpenChange = vi.fn();
		render(<PopoverHarness open={true} onOpenChange={onOpenChange} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("applies data-placement attribute on the panel", () => {
		render(<PopoverHarness open={true} onOpenChange={() => {}} />);
		const panel = document.body.querySelector(".ds-atom-popover");
		expect(panel).toHaveAttribute("data-placement", "bottom-start");
	});

	it("ContextMenu renders all items including danger variant", () => {
		const items: ContextMenuItem[] = [
			{ label: "Edit", onSelect: vi.fn() },
			{ label: "Delete", onSelect: vi.fn(), variant: "danger" },
		];
		render(<ContextMenuHarness items={items} onOpenChange={() => {}} />);
		expect(screen.getByText("Edit")).toBeInTheDocument();
		const deleteBtn = screen.getByText("Delete").closest("button");
		expect(deleteBtn).not.toBeNull();
		expect(deleteBtn).toHaveAttribute("data-tone", "danger");
	});

	it("ContextMenu renders root with data-variant=contextmenu", () => {
		const items: ContextMenuItem[] = [{ label: "Edit", onSelect: vi.fn() }];
		render(<ContextMenuHarness items={items} onOpenChange={() => {}} />);
		const panel = document.body.querySelector(".ds-atom-popover");
		expect(panel).toHaveAttribute("data-variant", "contextmenu");
	});

	it("ContextMenu item.onSelect fires + closes", () => {
		const editFn = vi.fn();
		const onOpenChange = vi.fn();
		const items: ContextMenuItem[] = [{ label: "Edit", onSelect: editFn }];
		render(<ContextMenuHarness items={items} onOpenChange={onOpenChange} />);
		fireEvent.click(screen.getByText("Edit"));
		expect(editFn).toHaveBeenCalledTimes(1);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("disabled ContextMenu item does NOT invoke onSelect", () => {
		const lockedFn = vi.fn();
		const onOpenChange = vi.fn();
		const items: ContextMenuItem[] = [{ label: "Locked", onSelect: lockedFn, disabled: true }];
		render(<ContextMenuHarness items={items} onOpenChange={onOpenChange} />);
		const btn = screen.getByText("Locked").closest("button");
		expect(btn).toBeDisabled();
		fireEvent.click(screen.getByText("Locked"));
		expect(lockedFn).not.toHaveBeenCalled();
	});
});
