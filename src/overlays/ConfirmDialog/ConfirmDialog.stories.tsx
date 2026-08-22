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
					"Tone-differentiated confirmation dialog. Four tones: danger, warn, success, neutral. The panel is a token-driven glass surface — 97% of --panel plus a 14px blur — so it follows the brand and the colour mode. It was previously always-light with a hardcoded rgba(255,255,255,.97), which had no rule in any stylesheet and which no theme could reach (F-15-3).",
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
	globals: { theme: "dark" },
	// Renamed: the panel is no longer hardcoded light. It still renders light HERE,
	// for a different reason — it portals to document.body and so escapes this
	// decorator's scoped `.dark`, exactly as Modal does. Under a dark THEME global
	// (`.dark` on <html>) it is now a dark surface. DarkModeInline below is the
	// version that renders inside the dark scope and shows the fix.
	name: "Dark Mode (portaled — escapes the scoped dark)",
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				style={{
					background: "var(--cream-2)",
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

/**
 * The panel itself, rendered — and the only ConfirmDialog story in which it is.
 *
 * Three things this story exists for:
 *
 * 1. `open` is fixed true rather than driven by a button, so the captured
 *    baseline contains the PANEL. Every other ConfirmDialog story starts closed,
 *    which means no visual baseline in this repository has ever contained this
 *    surface — the finding that it was a hardcoded near-white card could not have
 *    been caught by a screenshot.
 * 2. `inline` keeps the dialog in place instead of portaling it to
 *    `document.body`, which is the only reason axe sees it: `test:a11y` scopes
 *    `checkA11y` to `#storybook-root`, and a portaled panel is outside that
 *    element. Every other dialog story in this library is scanned without its
 *    dialog in it.
 * 3. It is the story the charcoal computed-style probe reads
 *    (`tests/visual/confirm-panel.spec.ts`), in all four brand x mode cells.
 *
 * There is deliberately no scoped dark wrapper here — and as of plan 01-19.1 no
 * story in this library has one. Under charcoal such a wrapper re-declares the
 * design system's own neutral dark tokens below the brand layer — `:root.dark,
 * .dark` in tokens.css matches any element, charcoal.css only declares
 * `:root[data-brand="charcoal"].dark` — so the panel would resolve `--cream-2`
 * to #1f1f1f instead of charcoal's #1e1e1d. That is the hazard
 * `.storybook/preview.tsx` documents on its own wrapper, and it was measured
 * here: the first draft of this story carried the class and the probe read
 * 31,31,31 where charcoal declares 30,30,29. The mode comes from the theme
 * global instead, enforced by `src/story-mode.test.ts`.
 */
export const InlinePanel: Story = {
	name: "Inline (the panel, in the cascade)",
	parameters: { docs: { source: { code: SRC.Danger } } },
	render: () => (
		<div style={{ padding: 32, background: "var(--cream)", borderRadius: 8 }}>
			<ConfirmDialog
				inline
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="danger"
				title="Delete item?"
				body="This will permanently remove the item and cannot be undone."
				confirmLabel="Yes, delete"
			/>
		</div>
	),
};

export const TypeToConfirmStory: Story = {
	name: "TypeToConfirm",
	parameters: { docs: { source: { code: SRC.TypeToConfirm } } },
	render: () => <TypeToConfirmDemo />,
};
