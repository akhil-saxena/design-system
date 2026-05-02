import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { ContextMenu, type ContextMenuItem, Popover, type PopoverPlacement } from ".";
import { Button } from "../../inputs/Button";
const SRC = {
	BottomStart: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>Open (bottom-start)</Button>
    <Popover anchorRef={anchorRef} open={open} onOpenChange={setOpen} placement="bottom-start">
      <div style={{ padding: 16, fontSize: 13, maxWidth: 240 }}>
        Popover content. Anchored to the button, portaled to body.
      </div>
    </Popover>
  </>
);`,
	BottomEnd: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>Open (bottom-end)</Button>
    <Popover anchorRef={anchorRef} open={open} onOpenChange={setOpen} placement="bottom-end">
      <div style={{ padding: 16, fontSize: 13 }}>Popover content.</div>
    </Popover>
  </>
);`,
	TopStart: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>Open (top-start)</Button>
    <Popover anchorRef={anchorRef} open={open} onOpenChange={setOpen} placement="top-start">
      <div style={{ padding: 16, fontSize: 13 }}>Popover content.</div>
    </Popover>
  </>
);`,
	TopEnd: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>Open (top-end)</Button>
    <Popover anchorRef={anchorRef} open={open} onOpenChange={setOpen} placement="top-end">
      <div style={{ padding: 16, fontSize: 13 }}>Popover content.</div>
    </Popover>
  </>
);`,
	ContextMenuDefault: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
const items = [
  { label: "Edit item", onSelect: () => {} },
  { label: "Duplicate", onSelect: () => {} },
  { label: "Move to group…", onSelect: () => {} },
  { label: "Export as PDF", onSelect: () => {} },
  { label: "Delete item", onSelect: () => {}, variant: "danger" },
];
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>More actions</Button>
    <ContextMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen} items={items} />
  </>
);`,
	ContextMenuWithDisabled: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
const items = [
  { label: "Edit", onSelect: () => {} },
  { label: "Locked (disabled)", onSelect: () => {}, disabled: true },
  { label: "Delete", onSelect: () => {}, variant: "danger" },
];
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>With disabled item</Button>
    <ContextMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen} items={items} />
  </>
);`,
	DarkMode: `const anchorRef = useRef(null);
const [open, setOpen] = useState(false);
const items = [
  { label: "Edit item", onSelect: () => {} },
  { label: "Delete item", onSelect: () => {}, variant: "danger" },
];
return (
  <>
    <Button ref={anchorRef} onClick={() => setOpen((v) => !v)}>More actions</Button>
    <ContextMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen} items={items} />
  </>
);`,
};

const meta: Meta<typeof Popover> = {
	title: "Overlays/Popover",
	component: Popover,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Anchor-positioned DSPortal overlay with configurable placement, item rows, a context-menu variant, and optional danger-styled items.",
			},
		},
	},
	argTypes: {
		anchorRef: {
			control: false,
			description: "Ref to the anchor element; popover positions itself relative to this element.",
		},
		open: { control: "boolean", description: "Controls visibility; returns null when false." },
		onOpenChange: { control: false, description: "Called when the popover requests to close." },
		placement: {
			control: "select",
			options: ["bottom-start", "bottom-end", "top-start", "top-end"],
			description: "Which edge of the anchor the panel appears on.",
		},
		offset: {
			control: "number",
			description: "Gap in pixels between the anchor edge and the panel.",
		},
		variant: {
			control: "select",
			options: ["default", "contextmenu"],
			description: "Visual variant; contextmenu applies tighter padding.",
		},
		children: { control: false, description: "Content rendered inside the popover panel." },
		className: { control: false },
		style: { control: false },
	},
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

export const BottomStart: Story = {
	parameters: { docs: { source: { code: SRC.BottomStart } } },
	render: () => <PopoverDemo placement="bottom-start" />,
};
export const BottomEnd: Story = {
	parameters: { docs: { source: { code: SRC.BottomEnd } } },
	render: () => <PopoverDemo placement="bottom-end" />,
};
export const TopStart: Story = {
	parameters: { docs: { source: { code: SRC.TopStart } } },
	render: () => <PopoverDemo placement="top-start" />,
};
export const TopEnd: Story = {
	parameters: { docs: { source: { code: SRC.TopEnd } } },
	render: () => <PopoverDemo placement="top-end" />,
};

function ContextMenuDemo() {
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const items: ContextMenuItem[] = [
		{ label: "Edit item", onSelect: () => console.log("edit") },
		{ label: "Duplicate", onSelect: () => console.log("duplicate") },
		{ label: "Move to group…", onSelect: () => console.log("move") },
		{ label: "Export as PDF", onSelect: () => console.log("export") },
		{ label: "Delete item", onSelect: () => console.log("delete"), variant: "danger" },
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

export const ContextMenuDefault: Story = {
	parameters: { docs: { source: { code: SRC.ContextMenuDefault } } },
	render: () => <ContextMenuDemo />,
};

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

export const ContextMenuWithDisabled: Story = {
	parameters: { docs: { source: { code: SRC.ContextMenuWithDisabled } } },
	render: () => <ContextMenuDisabledDemo />,
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => <ContextMenuDemo />,
};
