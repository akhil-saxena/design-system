/**
 * # Usage Audit — Popover + ContextMenu (D-87, D-330, D-331)
 *
 * Consumers (post v2.1):
 * - kanban/CardActionsMenu — ContextMenu with [Edit, Duplicate, Move to stage…, Export, Delete (danger)]
 * - table/RowActions — ContextMenu on the trailing-cell triple-dot button
 * - appbar/UserMenu — ContextMenu with [Profile, Settings, Sign out (danger)]
 * - settings/AdvancedToggleGroup — Popover with arbitrary form children (anchored to gear icon)
 * - filters/SortDropdown — Popover with custom radio-list children
 *
 * API shape consumers expect:
 * - anchorRef + open + onOpenChange — controlled; consumer owns toggle state
 * - placement: 4 fixed (no auto-flip in v0.2; deferred to v2.1)
 * - ContextMenu items[]: array-driven; items with variant="danger" get red text
 * - Both close on outside-click + Escape
 * - Both portal to body via DSPortal
 *
 * Implementation (D-330): no Floating-UI dep. Position = anchor rect +
 * placement + offset, computed once-on-open. ContextMenu (D-331) is a
 * named export from the SAME file (Popover.tsx) — mirrors Modal+ConfirmDialog.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Button } from "./Button";
import { ContextMenu, type ContextMenuItem, Popover, type PopoverPlacement } from "./Popover";

const meta: Meta<typeof Popover> = {
	title: "Surfaces/Popover",
	component: Popover,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Popover>;

function PopoverDemo({ placement }: { placement: PopoverPlacement }) {
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	return (
		<div style={{ padding: 80, display: "inline-block" }}>
			<Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
				Open ({placement})
			</Button>
			<Popover anchorRef={anchorRef} open={open} onOpenChange={setOpen} placement={placement}>
				<div style={{ padding: 16, fontSize: 13, maxWidth: 240 }}>
					Popover content. Anchored to the button via getBoundingClientRect, portaled to body.
				</div>
			</Popover>
		</div>
	);
}

export const BottomStart: Story = { render: () => <PopoverDemo placement="bottom-start" /> };
export const BottomEnd: Story = { render: () => <PopoverDemo placement="bottom-end" /> };
export const TopStart: Story = { render: () => <PopoverDemo placement="top-start" /> };
export const TopEnd: Story = { render: () => <PopoverDemo placement="top-end" /> };

function ContextMenuDemo() {
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const items: ContextMenuItem[] = [
		{ label: "Edit application", onSelect: () => console.log("edit") },
		{ label: "Duplicate", onSelect: () => console.log("duplicate") },
		{ label: "Move to stage…", onSelect: () => console.log("move") },
		{ label: "Export as PDF", onSelect: () => console.log("export") },
		{ label: "Delete application", onSelect: () => console.log("delete"), variant: "danger" },
	];
	return (
		<div style={{ padding: 80, display: "inline-block" }}>
			<Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
				More actions
			</Button>
			<ContextMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen} items={items} />
		</div>
	);
}

export const ContextMenuDefault: Story = { render: () => <ContextMenuDemo /> };

function ContextMenuDisabledDemo() {
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const items: ContextMenuItem[] = [
		{ label: "Edit", onSelect: () => {} },
		{ label: "Locked (disabled)", onSelect: () => {}, disabled: true },
		{ label: "Delete", onSelect: () => {}, variant: "danger" },
	];
	return (
		<div style={{ padding: 80, display: "inline-block" }}>
			<Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
				With disabled item
			</Button>
			<ContextMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen} items={items} />
		</div>
	);
}

export const ContextMenuWithDisabled: Story = { render: () => <ContextMenuDisabledDemo /> };

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => <ContextMenuDemo />,
};
