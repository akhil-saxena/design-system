import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Radio, RadioGroup } from "./Radio";
import { Sheet } from "./Sheet";
import { TextInput } from "./TextInput";
import { Textarea } from "./Textarea";

const SRC = {
	Default: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open from right</Button>
    <Sheet open={open} onClose={() => setOpen(false)} title="Application Details">
      <p>Sheet body content.</p>
    </Sheet>
  </>
);`,
	LeftSide: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open from left</Button>
    <Sheet open={open} onClose={() => setOpen(false)} side="left" title="Filters">
      <p>Filter controls here.</p>
    </Sheet>
  </>
);`,
	WithFooter: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open with footer</Button>
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="Edit Application"
      description="Update the role details below."
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
        </>
      }
    >
      <TextInput placeholder="Role title" />
      <Textarea placeholder="Notes" rows={4} />
    </Sheet>
  </>
);`,
	MobileFullWidth: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open (mobile)</Button>
    <Sheet open={open} onClose={() => setOpen(false)} title="Mobile preview">
      <p>Under 640 px the sheet fills the screen.</p>
    </Sheet>
  </>
);`,
	DarkMode: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open sheet</Button>
    <Sheet open={open} onClose={() => setOpen(false)} title="Edit Application"
      footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
               <Button variant="primary" onClick={() => setOpen(false)}>Save</Button></>}>
      <TextInput placeholder="Role title" />
    </Sheet>
  </>
);`,
};

const meta: Meta<typeof Sheet> = {
	title: "Surfaces/Sheet",
	component: Sheet,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Side-anchored drawer that slides in from the left or right edge with focus trap, Escape close, × close button, optional description, and footer slot.",
			},
		},
	},
	argTypes: {
		open: { control: "boolean", description: "Controls visibility." },
		onClose: { control: false },
		side: {
			control: "select",
			options: ["right", "left"],
			description: "Which edge the panel slides in from.",
		},
		title: { control: false },
		description: { control: "text" },
		footer: { control: false },
		children: { control: false },
		closeOnBackdropClick: { control: "boolean" },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Sheet>;

// ─── Demo components ──────────────────────────────────────────────────────────

function DefaultDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open from right</Button>
			<Sheet open={open} onClose={() => setOpen(false)} title="Application Details">
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
						<Badge tone="info">Engineering</Badge>
						<Badge tone="success">Active</Badge>
						<Badge tone="warning">Stage 2</Badge>
					</div>
					<p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
						Tab cycles focus inside; Escape or the × button closes; backdrop click closes.
					</p>
				</div>
			</Sheet>
		</>
	);
}

function LeftSideDemo() {
	const [open, setOpen] = useState(false);
	const [remote, setRemote] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open from left</Button>
			<Sheet open={open} onClose={() => setOpen(false)} side="left" title="Filters">
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<RadioGroup name="filter-sort" defaultValue="recent">
						<Radio value="recent" label="Most recent" />
						<Radio value="stage" label="By stage" />
						<Radio value="alpha" label="Alphabetical" />
					</RadioGroup>
					<Checkbox
						label="Remote-friendly only"
						checked={remote}
						onChange={(e) => setRemote(e.target.checked)}
					/>
				</div>
			</Sheet>
		</>
	);
}

function WithFooterDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open with footer</Button>
			<Sheet
				open={open}
				onClose={() => setOpen(false)}
				title="Edit Application"
				description="Update the role details below."
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
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<TextInput placeholder="Role title" />
					<TextInput placeholder="Company" />
					<Textarea placeholder="Notes…" rows={4} />
				</div>
			</Sheet>
		</>
	);
}

function MobileFullWidthDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open (preview mobile)</Button>
			<Sheet open={open} onClose={() => setOpen(false)} title="Mobile preview">
				<p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
					On viewports &lt;640 px wide, the sheet auto-fills the screen via the CSS media query.
				</p>
			</Sheet>
		</>
	);
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Slides in from the right. Tab cycles focus inside; Escape or × closes; badge and text content shown.",
			},
			source: { code: SRC.Default },
		},
	},
	render: () => <DefaultDemo />,
};

export const LeftSide: Story = {
	name: "Left side",
	parameters: {
		docs: {
			description: {
				story:
					"Slides in from the left edge. Contains a RadioGroup sort option and a Checkbox filter.",
			},
			source: { code: SRC.LeftSide },
		},
	},
	render: () => <LeftSideDemo />,
};

export const WithFooter: Story = {
	name: "With footer",
	parameters: {
		docs: {
			description: {
				story:
					"Header + footer pinned; body scrolls. Contains TextInput and Textarea DS components.",
			},
			source: { code: SRC.WithFooter },
		},
	},
	render: () => <WithFooterDemo />,
};

export const MobileFullWidth: Story = {
	name: "Mobile full width",
	parameters: {
		viewport: { defaultViewport: "iphone6" },
		docs: {
			description: {
				story: "On viewports under 640 px the sheet auto-fills the screen via CSS media query.",
			},
			source: { code: SRC.MobileFullWidth },
		},
	},
	render: () => <MobileFullWidthDemo />,
};

export const DarkMode: Story = {
	name: "Dark mode",
	parameters: {
		docs: {
			description: { story: "Sheet on a dark surface — panel follows dark tokens." },
			source: { code: SRC.DarkMode },
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => <WithFooterDemo />,
};
