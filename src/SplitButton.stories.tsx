/**
 * # Usage Audit — SplitButton (D-87, D-530)
 *
 * Consumers (post v2.1):
 * - kanban/CardSaveActions — SplitButton with [Save, Save as draft, Save and close]
 * - applications/BulkActions — SplitButton with [Apply now, Apply later, Discard]
 * - settings/ExportActions — SplitButton with [Export as CSV, Export as JSON, Export as PDF]
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Archive, FileText, Save, Trash2, X } from "lucide-react";
import { SplitButton } from "./SplitButton";

const SRC = {
	default: `<SplitButton
  actions={[
    { label: "Save", onClick: handleSave },
    { label: "Save as draft", onClick: handleDraft },
    { label: "Save and close", onClick: handleSaveClose },
  ]}
/>`,

	tones: `// tone colours both the dropdown item AND the primary face when selected
<SplitButton
  actions={[
    { label: "Save",    onClick: handleSave },
    { label: "Archive", onClick: handleArchive, tone: "warning" },  // → secondary face
    { label: "Delete",  onClick: handleDelete,  tone: "danger"  },  // → danger (red) face
  ]}
/>`,

	variants: `<SplitButton actions={actions} variant="primary" />
<SplitButton actions={actions} variant="secondary" />
<SplitButton actions={actions} variant="ghost" />
<SplitButton actions={actions} variant="danger" />`,

	perAction: `// Per-action variant drives primary face when that action is selected
<SplitButton
  actions={[
    { label: "Save",    onClick: handleSave,    variant: "primary" },
    { label: "Draft",   onClick: handleDraft,   variant: "secondary" },
    { label: "Discard", onClick: handleDiscard, variant: "danger" },
  ]}
/>`,

	sizes: `<SplitButton actions={actions} size="sm" />
<SplitButton actions={actions} size="md" />
<SplitButton actions={actions} size="lg" />`,

	icons: `<SplitButton
  actions={[
    { label: "Save",          icon: <Save size={13} />,     onClick: handleSave },
    { label: "Save as draft", icon: <FileText size={13} />, onClick: handleDraft },
    { label: "Discard",       icon: <X size={13} />,        onClick: handleDiscard, tone: "danger" },
  ]}
/>`,
};

const meta: Meta<typeof SplitButton> = {
	title: "Compound/SplitButton",
	component: SplitButton,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					'Combined primary action + chevron-triggered dropdown for secondary actions. Selecting an alternative re-binds the primary face for this instance. Use `tone` on individual actions for semantic coloring (`"danger"`, `"warning"`, `"success"`) without changing the primary face variant.',
			},
		},
	},
	argTypes: {
		actions: {
			control: false,
			description: "Non-empty array of actions; first element is the primary face on mount.",
		},
		variant: {
			control: "select",
			options: ["primary", "secondary", "ghost", "danger"],
			description: "Default visual variant. Applied to actions that don't set their own variant.",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Size token applied to the primary face and chevron button.",
		},
		className: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof SplitButton>;

const baseActions: [(typeof baseActions)[0], ...typeof baseActions] = [
	{ label: "Save", onClick: () => {} },
	{ label: "Save as draft", onClick: () => {} },
	{ label: "Save and close", onClick: () => {} },
];

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Default `primary` variant. Chevron opens a dropdown; selecting an item re-binds the primary face.",
			},
			source: { code: SRC.default },
		},
	},
	render: () => (
		<div style={{ padding: 80 }}>
			<SplitButton actions={baseActions} />
		</div>
	),
};

export const Tones: Story = {
	name: "Menu item tones",
	parameters: {
		docs: {
			description: {
				story:
					'Click **Archive** or **Delete** to see the primary face update to reflect that action\'s tone. `tone="danger"` → danger (red) face. `tone="warning"` / `tone="success"` → secondary (neutral) face. Tone also colours the dropdown item text.',
			},
			source: { code: SRC.tones },
		},
	},
	render: () => (
		<div style={{ padding: 80, display: "flex", flexDirection: "column", gap: 24 }}>
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Open the dropdown to see tone coloring
				</div>
				<SplitButton
					actions={[
						{ label: "Save", onClick: () => {} },
						{ label: "Archive", onClick: () => {}, tone: "warning", icon: <Archive size={13} /> },
						{ label: "Delete", onClick: () => {}, tone: "danger", icon: <Trash2 size={13} /> },
					]}
				/>
			</div>
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					With per-action variant + tone together
				</div>
				<SplitButton
					actions={[
						{ label: "Export CSV", onClick: () => {} },
						{ label: "Export JSON", onClick: () => {}, tone: "warning" },
						{ label: "Delete all", onClick: () => {}, variant: "danger", tone: "danger" },
					]}
					variant="secondary"
				/>
			</div>
		</div>
	),
};

export const Variants: Story = {
	parameters: {
		docs: {
			description: { story: "All four button-level variants on the primary face and chevron." },
			source: { code: SRC.variants },
		},
	},
	render: () => (
		<div style={{ padding: 80, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
			<SplitButton actions={baseActions} variant="primary" />
			<SplitButton actions={baseActions} variant="secondary" />
			<SplitButton actions={baseActions} variant="ghost" />
			<SplitButton actions={baseActions} variant="danger" />
		</div>
	),
};

export const PerActionVariant: Story = {
	name: "Per-action variant",
	parameters: {
		docs: {
			description: {
				story:
					"Each action can override the variant. Selecting an action re-binds the primary face to that variant — try clicking different items.",
			},
			source: { code: SRC.perAction },
		},
	},
	render: () => (
		<div style={{ padding: 80 }}>
			<SplitButton
				actions={[
					{ label: "Save", onClick: () => {}, variant: "primary" },
					{ label: "Save as draft", onClick: () => {}, variant: "secondary" },
					{ label: "Discard", onClick: () => {}, variant: "danger" },
				]}
			/>
		</div>
	),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: "Three size tokens matching Button sizes." },
			source: { code: SRC.sizes },
		},
	},
	render: () => (
		<div style={{ padding: 80, display: "flex", gap: 16, alignItems: "center" }}>
			<SplitButton actions={baseActions} size="sm" />
			<SplitButton actions={baseActions} size="md" />
			<SplitButton actions={baseActions} size="lg" />
		</div>
	),
};

export const WithIcons: Story = {
	name: "With icons",
	parameters: {
		docs: {
			description: {
				story:
					"Pass an `icon` per action to render before the label in both the primary face and the dropdown.",
			},
			source: { code: SRC.icons },
		},
	},
	render: () => (
		<div style={{ padding: 80 }}>
			<SplitButton
				actions={[
					{ label: "Save", icon: <Save size={13} />, onClick: () => {} },
					{ label: "Save as draft", icon: <FileText size={13} />, onClick: () => {} },
					{ label: "Discard", icon: <X size={13} />, onClick: () => {}, tone: "danger" },
				]}
			/>
		</div>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 40, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				story: "All variants on dark surface — amber primary, ghost/secondary with dark-mode ink.",
			},
			source: { code: SRC.variants },
		},
	},
	render: () => (
		<div style={{ padding: 40, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
			<SplitButton actions={baseActions} variant="primary" />
			<SplitButton actions={baseActions} variant="secondary" />
			<SplitButton actions={baseActions} variant="ghost" />
			<SplitButton actions={baseActions} variant="danger" />
		</div>
	),
};
