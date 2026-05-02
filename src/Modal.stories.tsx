/**
 * # Usage Audit — Modal + ConfirmDialog (D-87, D-287, D-321, D-322, D-356)
 *
 * Consumers (post v2.1):
 * - kanban/AddApplicationModal — Modal with form children + footer Button[Cancel|Add]
 * - kanban/DeleteApplicationConfirm — ConfirmDialog danger=true, "Delete application?"
 * - settings/KeyboardShortcutsInfo — Modal with shortcuts list + close button only (no footer)
 * - profile/SignOutConfirm — ConfirmDialog danger=false (neutral), "Sign out?"
 * - import/CSVUploadModal — Modal with file picker + footer Button[Cancel|Upload]
 *
 * API shape consumers expect:
 * - open + onClose — controlled; consumer owns toggle state
 * - title, description (string), footer — slotted ReactNode
 * - role: "dialog" (default) or "alertdialog" — surfaces to assistive tech
 * - closeOnBackdropClick: true by default (D-320); set false for destructive flows
 * - aria-labelledby + aria-describedby auto-generated via useId() (D-321)
 * - useFocusTrap traps Tab + restores on close (Wave 0 hook); Escape closes via document keydown
 * - ConfirmDialog: same-file variant (D-287); danger=true sets role=alertdialog +
 *   closeOnBackdropClick=false + Button variant=danger
 *
 * Same-file variant-export pattern proven twice in Wave 3:
 *   Popover.tsx → { Popover, ContextMenu }   (14-04)
 *   Modal.tsx   → { Modal, ConfirmDialog }   (14-05)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./Button";
import { ConfirmDialog, Modal } from "./Modal";

const SRC = {
	Basic: `const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Open Modal</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Add Application">
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
      title="Add Application"
      description="Fill out the details below."
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Add Application</Button>
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
      <p>Paragraph 1 — modal max-height is 80vh and overflow-y: auto.</p>
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
    <Modal open={open} onClose={() => setOpen(false)} title="Add Application">
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
      title="Send to recruiter?"
      description="Anya Patel will receive your resume and cover letter."
      confirmLabel="Send"
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
	ConfirmDialogDestructive: `const [open, setOpen] = useState(false);
return (
  <>
    <Button variant="danger" onClick={() => setOpen(true)}>Delete application</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Delete application?"
      description="This will permanently remove the Automattic application and all associated notes, documents, and timeline events."
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
      title="Move 12 applications to archive?"
      description={
        <>
          <p>Archived applications stop receiving follow-up reminders.</p>
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
    <Button variant="danger" onClick={() => setOpen(true)}>Delete application</Button>
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Delete application?"
      description="This will permanently remove the application."
      confirmLabel="Yes, delete"
      danger
      onConfirm={() => setOpen(false)}
    />
  </>
);`,
};

const meta: Meta<typeof Modal> = {
	title: "Surfaces/Modal",
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
		role: {
			control: "select",
			options: ["dialog", "alertdialog"],
			description: "ARIA role — use alertdialog for destructive confirmations.",
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
			<Modal open={open} onClose={() => setOpen(false)} title="Add Application">
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
				title="Add Application"
				description="Fill out the details below."
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Add Application
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
					<p key={i}>Paragraph {i + 1} — modal max-height is 80vh and overflow-y: auto.</p>
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
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => <BasicDemo />,
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
				title="Send to recruiter?"
				description="Anya Patel will receive your resume and cover letter."
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
				Delete application
			</Button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				title="Delete application?"
				description="This will permanently remove the Automattic application and all associated notes, documents, and timeline events."
				confirmLabel="Yes, delete"
				cancelLabel="Cancel"
				danger={true}
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
				title="Move 12 applications to archive?"
				description={
					<>
						<p>Archived applications stop receiving follow-up reminders.</p>
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
	globals: { backgrounds: { value: "#1c1917" } },
	parameters: { docs: { source: { code: SRC.ConfirmDialogDarkMode } } },
	render: () => <ConfirmDialogDestructiveDemo />,
};
