import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmDialog, TypeToConfirm } from ".";
import { Button } from "../../inputs/Button";

// ─── Source snippets ──────────────────────────────────────────────────────────

const SRC = {
	Danger: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      tone="danger"
      title="Delete item?"
      body="This will permanently remove the item and cannot be undone."
      confirmLabel="Yes, delete"
    />
  </>
);`,
	Warn: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="secondary" onClick={() => setOpen(true)}>Proceed with caution</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      tone="warn"
      title="Proceed with caution?"
      body="This action may have unintended side effects."
      confirmLabel="Yes, proceed"
    />
  </>
);`,
	Success: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="primary" onClick={() => setOpen(true)}>Publish changes</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      tone="success"
      title="Publish changes?"
      body="Your changes will be visible to all users."
      confirmLabel="Yes, publish"
    />
  </>
);`,
	Neutral: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="secondary" onClick={() => setOpen(true)}>Archive item</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      tone="neutral"
      title="Archive item?"
      body="You can restore archived items later."
      confirmLabel="Archive"
    />
  </>
);`,
	DarkMode: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      tone="danger"
      title="Delete item?"
      body="This will permanently remove the item and cannot be undone."
      confirmLabel="Yes, delete"
    />
  </>
);`,
	TypeToConfirm: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete account</Button>
    <TypeToConfirm
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      title="Delete account permanently?"
      body="All your data will be deleted. This cannot be undone."
      guardWord="DELETE"
      confirmLabel="Delete forever"
    />
  </>
);`,
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ConfirmDialog> = {
	title: "Overlays/ConfirmDialog",
	component: ConfirmDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Tone-differentiated confirmation dialog. Always-light glass surface (rgba(255,255,255,.97)) regardless of dark mode. Four tones: danger, warn, success, neutral.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

// ─── Demo functions ───────────────────────────────────────────────────────────

function DangerDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="danger" onClick={() => setOpen(true)}>
				Delete item
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				onConfirm={() => setOpen(false)}
				tone="danger"
				title="Delete item?"
				body="This will permanently remove the item and cannot be undone."
				confirmLabel="Yes, delete"
			/>
		</>
	);
}

function WarnDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Proceed with caution
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				onConfirm={() => setOpen(false)}
				tone="warn"
				title="Proceed with caution?"
				body="This action may have unintended side effects."
				confirmLabel="Yes, proceed"
			/>
		</>
	);
}

function SuccessDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="primary" onClick={() => setOpen(true)}>
				Publish changes
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				onConfirm={() => setOpen(false)}
				tone="success"
				title="Publish changes?"
				body="Your changes will be visible to all users."
				confirmLabel="Yes, publish"
			/>
		</>
	);
}

function NeutralDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Archive item
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				onConfirm={() => setOpen(false)}
				tone="neutral"
				title="Archive item?"
				body="You can restore archived items later."
				confirmLabel="Archive"
			/>
		</>
	);
}

function TypeToConfirmDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="danger" onClick={() => setOpen(true)}>
				Delete account
			</Button>
			<TypeToConfirm
				open={open}
				onClose={() => setOpen(false)}
				onConfirm={() => setOpen(false)}
				title="Delete account permanently?"
				body="All your data will be deleted. This cannot be undone."
				guardWord="DELETE"
				confirmLabel="Delete forever"
			/>
		</>
	);
}

// ─── Story exports ────────────────────────────────────────────────────────────

export const Danger: Story = {
	parameters: { docs: { source: { code: SRC.Danger } } },
	render: () => <DangerDemo />,
};

export const Warn: Story = {
	parameters: { docs: { source: { code: SRC.Warn } } },
	render: () => <WarnDemo />,
};

export const Success: Story = {
	parameters: { docs: { source: { code: SRC.Success } } },
	render: () => <SuccessDemo />,
};

export const Neutral: Story = {
	parameters: { docs: { source: { code: SRC.Neutral } } },
	render: () => <NeutralDemo />,
};

export const DarkMode: Story = {
	name: "Dark Mode (panel stays light)",
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <DangerDemo />,
};

export const TypeToConfirmStory: Story = {
	name: "TypeToConfirm",
	parameters: { docs: { source: { code: SRC.TypeToConfirm } } },
	render: () => <TypeToConfirmDemo />,
};
