import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from ".";
import { Button } from "../../inputs/Button";
import { ConfirmDialog } from "../ConfirmDialog";
const SRC = {
	NotClosable: `<Modal
  inline
  closable={false}
  open={open}
  onClose={() => {}}
  role="alertdialog"
  title="Your session expired"
  description="Sign in again to keep editing. Nothing has been lost."
  footer={
    <>
      <Button variant="ghost">Sign out</Button>
      <Button variant="primary">Sign in again</Button>
    </>
  }
>
  <p>The two actions in the footer are the only ways out, and that is deliberate.</p>
</Modal>`,
	Basic: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open Modal</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Add item">
      <p>Body content here. Tab cycles focus inside the panel; Escape closes.</p>
    </Modal>
  </>
);`,
	WithFooter: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open with footer</Button>
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Add item"
      description="Fill out the details below."
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Add item</Button>
        </>
      }
    >
      <p>Custom form would go here.</p>
    </Modal>
  </>
);`,
	LargeContent: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open scrollable modal</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Long content (scrollable)">
      <p>Paragraph 1 - modal max-height is 80vh and overflow-y: auto.</p>
      <p>Paragraph 2 ...</p>
    </Modal>
  </>
);`,
	AlertDialog: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open alertdialog</Button>
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Critical Notice"
      role="alertdialog"
      closeOnBackdropClick={false}
    >
      <p>role="alertdialog"; backdrop click disabled. Press Escape or use a button to close.</p>
    </Modal>
  </>
);`,
	DarkMode: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open Modal</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Add item">
      <p>Body content here.</p>
    </Modal>
  </>
);`,
	ConfirmDialogBasic: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open confirm</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Send to contact?"
      description="Jordan Lee will receive the file."
      confirmLabel="Send"
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
	ConfirmDialogDestructive: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Delete item?"
      description="This will permanently remove the item and all associated notes, documents, and history."
      confirmLabel="Yes, delete"
      cancelLabel="Cancel"
      danger
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
	ConfirmDialogWithDescription: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open with rich description</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Move 12 items to archive?"
      description={
        <>
          <p>Archived items stop receiving follow-up reminders.</p>
          <p>You can restore them at any time from the archive view.</p>
        </>
      }
      confirmLabel="Archive all"
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
	ConfirmDialogDarkMode: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Delete item?"
      description="This will permanently remove the item."
      confirmLabel="Yes, delete"
      danger
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
};

const meta: Meta<typeof Modal> = {
	title: "Overlays/Modal",
	component: Modal,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"DSPortal-mounted dialog with focus trap, Escape close, optional backdrop-click dismiss, and a same-file `ConfirmDialog` variant for destructive confirmations.",
			},
		},
	},
	argTypes: {
		open: { control: "boolean", description: "Controls visibility; returns null when false." },
		onClose: {
			control: false,
			description: "Called when the user closes the modal via Escape or backdrop click.",
		},
		title: {
			control: false,
			description: "Heading rendered in the modal header; auto-wired to aria-labelledby.",
		},
		description: {
			control: "text",
			description: "Short description rendered above children; auto-wired to aria-describedby.",
		},
		footer: {
			control: false,
			description: "Content for the footer slot (typically action buttons).",
		},
		children: { control: false, description: "Main body content of the modal." },
		closeOnBackdropClick: {
			control: "boolean",
			description: "Whether clicking the backdrop calls onClose.",
		},
		closable: {
			control: "boolean",
			description:
				"Whether the user may dismiss the modal at all. false suppresses the Close button, Escape AND the backdrop path together, and overrides closeOnBackdropClick. The dialog becomes a keyboard trap by design, so it must contain its own way out.",
		},
		inline: {
			control: "boolean",
			description:
				"Render in place instead of through a portal, so the dialog exists in server-rendered HTML. Opt-in; it reintroduces coupling to ancestor overflow/transform/z-index.",
		},
		role: {
			control: "select",
			options: ["dialog", "alertdialog"],
			description: "ARIA role - use alertdialog for destructive confirmations.",
		},
		initialFocus: {
			control: false,
			description: "Ref to the element that should receive focus when the modal opens.",
		},
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Modal>;

function BasicDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Modal</Button>
			<Modal open={open} onClose={() => setOpen(false)} title="Add item">
				<p>Body content here. Tab cycles focus inside the panel; Escape closes.</p>
			</Modal>
		</>
	);
}
export const Basic: Story = {
	parameters: { docs: { source: { code: SRC.Basic } } },
	render: () => <BasicDemo />,
};

function WithFooterDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open with footer</Button>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="Add item"
				description="Fill out the details below."
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Add item
						</Button>
					</>
				}
			>
				<p>Custom form would go here.</p>
			</Modal>
		</>
	);
}
export const WithFooter: Story = {
	parameters: { docs: { source: { code: SRC.WithFooter } } },
	render: () => <WithFooterDemo />,
};

function LargeContentDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open scrollable modal</Button>
			<Modal open={open} onClose={() => setOpen(false)} title="Long content (scrollable)">
				{Array.from({ length: 20 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static demo content; index is a stable identity here
					<p key={i}>Paragraph {i + 1} - modal max-height is 80vh and overflow-y: auto.</p>
				))}
			</Modal>
		</>
	);
}
export const LargeContent: Story = {
	parameters: { docs: { source: { code: SRC.LargeContent } } },
	render: () => <LargeContentDemo />,
};

function AlertDialogDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open alertdialog</Button>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="Critical Notice"
				role="alertdialog"
				closeOnBackdropClick={false}
			>
				<p>role="alertdialog"; backdrop click disabled. Press Escape or use a button to close.</p>
			</Modal>
		</>
	);
}
export const AlertDialog: Story = {
	parameters: { docs: { source: { code: SRC.AlertDialog } } },
	render: () => <AlertDialogDemo />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				style={{
					background: "var(--cream-2)",
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
	render: () => <BasicDemo />,
};

/**
 * The fail-closed dialog `closable` exists for (F-15-2).
 *
 * All three exits are suppressed together — there is no Close button in the
 * header, Escape does nothing, and clicking the backdrop does nothing. That is
 * the entire point of a re-auth prompt: a session has expired and there is no
 * "later".
 *
 * Which is why the panel contains its own way out. An undismissable dialog with
 * no action inside it is an accessibility failure, not a security feature — a
 * keyboard user would be trapped with nothing to do. Read the footer as part of
 * the contract, not as decoration.
 *
 * `inline` is set for two reasons beyond the SSR one: it keeps the dialog inside
 * `#storybook-root`, which is the element `test:a11y` scopes axe to — so this is
 * the only Modal story whose dialog is actually scanned — and it keeps the
 * captured baseline containing the panel rather than the button that opens it.
 */
export const NotClosable: Story = {
	name: "Not closable (fail-closed re-auth)",
	parameters: { docs: { source: { code: SRC.NotClosable } } },
	render: () => (
		<Modal
			inline
			closable={false}
			open={true}
			onClose={() => {}}
			role="alertdialog"
			title="Your session expired"
			description="Sign in again to keep editing. Nothing has been lost."
			footer={
				<>
					<Button variant="ghost">Sign out</Button>
					<Button variant="primary">Sign in again</Button>
				</>
			}
		>
			<p>
				This dialog has no Close button, ignores Escape and ignores a backdrop click. The two
				actions in the footer are the only ways out, and that is deliberate.
			</p>
		</Modal>
	),
};

// ─── ConfirmDialog stories ──────────────────────────────────────────

function ConfirmDialogBasicDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open confirm</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				title="Send to contact?"
				body="Jordan Lee will receive the file."
				confirmLabel="Send"
				onConfirm={() => {
					setOpen(false);
				}}
			/>
		</>
	);
}
export const ConfirmDialogBasic: Story = {
	parameters: { docs: { source: { code: SRC.ConfirmDialogBasic } } },
	render: () => <ConfirmDialogBasicDemo />,
};

function ConfirmDialogDestructiveDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="danger" onClick={() => setOpen(true)}>
				Delete item
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				title="Delete item?"
				body="This will permanently remove the item and all associated notes, documents, and history."
				confirmLabel="Yes, delete"
				cancelLabel="Cancel"
				tone="danger"
				onConfirm={() => {
					setOpen(false);
				}}
			/>
		</>
	);
}
export const ConfirmDialogDestructive: Story = {
	parameters: { docs: { source: { code: SRC.ConfirmDialogDestructive } } },
	render: () => <ConfirmDialogDestructiveDemo />,
};

function ConfirmDialogWithDescriptionNodeDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open with rich description</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				title="Move 12 items to archive?"
				body={
					<>
						<p>Archived items stop receiving follow-up reminders.</p>
						<p>You can restore them at any time from the archive view.</p>
					</>
				}
				confirmLabel="Archive all"
				onConfirm={() => setOpen(false)}
			/>
		</>
	);
}
export const ConfirmDialogWithDescription: Story = {
	parameters: { docs: { source: { code: SRC.ConfirmDialogWithDescription } } },
	render: () => <ConfirmDialogWithDescriptionNodeDemo />,
};

export const ConfirmDialogDarkMode: Story = {
	globals: { theme: "dark" },
	parameters: { docs: { source: { code: SRC.ConfirmDialogDarkMode } } },
	render: () => <ConfirmDialogDestructiveDemo />,
};
