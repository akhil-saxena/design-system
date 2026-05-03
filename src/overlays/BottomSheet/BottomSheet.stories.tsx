import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BottomSheet } from ".";
import { Button } from "../../inputs/Button";
import { Checkbox } from "../../inputs/Checkbox";
import { Chip } from "../../inputs/Chip";
import { RangeSlider } from "../../inputs/RangeSlider";
import { Textarea } from "../../inputs/Textarea";
const SRC = {
	Half: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open half</Button>
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Item actions">
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Edit item</li>
        <li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Open record</li>
        <li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Mark as priority</li>
        <li style={{ padding: "12px 0", color: "var(--red)" }}>Withdraw</li>
      </ul>
    </BottomSheet>
  </>
);`,
	Full: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open full</Button>
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Filter items" height="full">
      <p>Status</p>
      <p>Location</p>
      <p>Salary range</p>
      <p>Remote-only</p>
      <p>Posted within</p>
    </BottomSheet>
  </>
);`,
	WithTitle: `const [open, setOpen] = useState(true);
return (
  <BottomSheet open={open} onClose={() => setOpen(false)} title="Notifications">
    <p>You have 3 unread digests.</p>
  </BottomSheet>
);`,
	WithFooter: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open with footer</Button>
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Quick note"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
        </>
      }
    >
      <textarea style={{ width: "100%", minHeight: 80 }} placeholder="Add a note..." />
    </BottomSheet>
  </>
);`,
	MobileFilters: `const [open, setOpen] = useState(false);
return (
  <BottomSheet
    open={open}
    onClose={() => setOpen(false)}
    title="Filter records"
    height="half"
    footer={
      <>
        <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
        <Button variant="primary" onClick={() => setOpen(false)}>Apply filters</Button>
      </>
    }
  >
    <Checkbox label="Remote-friendly only" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
  </BottomSheet>
);`,
	SwipeToClose: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open swipe-to-close</Button>
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Drag the handle to close">
      <p>Drag the handle at the top down by more than ~120px to close. Smaller drags snap back.</p>
    </BottomSheet>
  </>
);`,
	DarkMode: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open half</Button>
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Item actions">
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Edit item</li>
        <li style={{ padding: "12px 0", color: "var(--red)" }}>Withdraw</li>
      </ul>
    </BottomSheet>
  </>
);`,
};

const meta: Meta<typeof BottomSheet> = {
	title: "Overlays/BottomSheet",
	component: BottomSheet,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Bottom-anchored drawer with half or full height, optional header and footer slots, backdrop-click dismiss, and swipe-to-close gesture support.",
			},
		},
	},
	argTypes: {
		open: {
			control: "boolean",
			description: "Controls whether the sheet is visible.",
			table: { type: { summary: "boolean" } },
		},
		onClose: {
			control: false,
			description:
				"Called when the user dismisses the sheet (backdrop click, swipe, or close button).",
			table: { type: { summary: "() => void" } },
		},
		title: {
			control: "text",
			description: "Optional header title string rendered in the sheet header.",
			table: { type: { summary: "string" } },
		},
		description: {
			control: "text",
			description: "Optional secondary text rendered below the title in the header.",
			table: { type: { summary: "string" } },
		},
		height: {
			control: { type: "select" },
			options: ["half", "full"],
			description: "Sheet height - half (default) or full screen.",
			table: { type: { summary: '"half" | "full"' } },
		},
		children: {
			control: false,
			description: "Content rendered in the scrollable sheet body.",
			table: { type: { summary: "React.ReactNode" } },
		},
		footer: {
			control: false,
			description: "Optional footer slot rendered in a sticky row at the bottom of the sheet.",
			table: { type: { summary: "React.ReactNode" } },
		},
		className: { control: false, table: { type: { summary: "string" } } },
		style: { control: false, table: { type: { summary: "React.CSSProperties" } } },
	},
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

/* Compact preview - just the trigger button, no 100vh blank space */
function Preview({ children }: Readonly<{ children: React.ReactNode }>) {
	return <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>{children}</div>;
}

function HalfDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open half sheet</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Item actions">
				<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Edit item</li>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Open record</li>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>
						Mark as priority
					</li>
					<li style={{ padding: "12px 0", color: "var(--red)" }}>Archive</li>
				</ul>
			</BottomSheet>
		</Preview>
	);
}
export const Half: Story = {
	parameters: { docs: { source: { code: SRC.Half } } },
	render: () => <HalfDemo />,
};

function FullDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open full sheet</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Filter items" height="full">
				<p>Status</p>
				<p>Location</p>
				<p>Salary range</p>
				<p>Remote-only</p>
				<p>Posted within</p>
			</BottomSheet>
		</Preview>
	);
}
export const Full: Story = {
	parameters: { docs: { source: { code: SRC.Full } } },
	render: () => <FullDemo />,
};

function WithTitleDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open with title</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Notifications">
				<p>You have 3 unread digests.</p>
			</BottomSheet>
		</Preview>
	);
}
export const WithTitle: Story = {
	parameters: { docs: { source: { code: SRC.WithTitle } } },
	render: () => <WithTitleDemo />,
};

function WithFooterDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open with footer</Button>
			<BottomSheet
				open={open}
				onClose={() => setOpen(false)}
				title="Quick note"
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Save
						</Button>
					</>
				}
			>
				<Textarea placeholder="Add a note..." rows={3} />
			</BottomSheet>
		</Preview>
	);
}
export const WithFooter: Story = {
	parameters: { docs: { source: { code: SRC.WithFooter } } },
	render: () => <WithFooterDemo />,
};

const STATUS_OPTIONS = ["New", "In Progress", "Review", "Approved", "On Hold", "Archived"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

function MobileFiltersDemo() {
	const [open, setOpen] = useState(false);
	const [salary, setSalary] = useState(120);
	const [remote, setRemote] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open filters</Button>
			<BottomSheet
				open={open}
				onClose={() => setOpen(false)}
				title="Filter records"
				height="half"
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Reset
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Apply filters
						</Button>
					</>
				}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--ink-3)",
								marginBottom: 6,
							}}
						>
							Min salary
						</div>
						<RangeSlider
							min={50}
							max={300}
							value={salary}
							onChange={setSalary}
							label="Min salary"
							valueFormat={(v) => `$${v}k`}
						/>
					</div>
					<Checkbox
						label="Remote-friendly only"
						checked={remote}
						onChange={(e) => setRemote(e.target.checked)}
					/>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--ink-3)",
								marginBottom: 6,
							}}
						>
							Status
						</div>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
							{STATUS_OPTIONS.map((s) => (
								<Chip
									key={s}
									tone={selectedStatus === s ? "tag" : "default"}
									data-interactive="true"
									tabIndex={0}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setSelectedStatus(selectedStatus === s ? null : s);
										}
									}}
								>
									{s}
								</Chip>
							))}
						</div>
					</div>
				</div>
			</BottomSheet>
		</Preview>
	);
}
export const MobileFilters: Story = {
	parameters: { docs: { source: { code: SRC.MobileFilters } } },
	render: () => <MobileFiltersDemo />,
};

function SwipeToCloseDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open swipe-to-close</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Drag the handle to close">
				<p style={{ marginBottom: 12 }}>
					Drag the handle at the top down by more than ~120px (or 40% of panel height) to close.
					Smaller drags snap back.
				</p>
				<p style={{ color: "var(--ink-3)", fontSize: 12 }}>
					Try it on touch or click-and-drag the pill at the top.
				</p>
			</BottomSheet>
		</Preview>
	);
}
export const SwipeToClose: Story = {
	parameters: { docs: { source: { code: SRC.SwipeToClose } } },
	render: () => <SwipeToCloseDemo />,
};

function DarkHalfDemo() {
	const [open, setOpen] = useState(false);
	return (
		<Preview>
			<Button onClick={() => setOpen(true)}>Open half sheet</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Item actions" dark>
				<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Edit item</li>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>Open record</li>
					<li style={{ padding: "12px 0", color: "var(--red)" }}>Archive</li>
				</ul>
			</BottomSheet>
		</Preview>
	);
}

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <DarkHalfDemo />,
};
