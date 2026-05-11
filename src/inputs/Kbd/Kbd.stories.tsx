import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from ".";

const SRC = {
	Default: "<Kbd>⌘K</Kbd>",
	InlineInText: "<p>Press <Kbd>ESC</Kbd> to dismiss the dialog.</p>",
};

const meta: Meta<typeof Kbd> = {
	title: "Inputs/Kbd",
	component: Kbd,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Semantic keyboard key label rendered as a <kbd> element. Supports two size variants and composes naturally in inline text.",
			},
		},
	},
	args: { children: "⌘K" },
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "Size variant. 'sm' for inline hints (9.5px); 'md' default (11px).",
		},
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
	args: { children: "⌘K" },
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const ModifierKeys: Story = {
	parameters: {
		docs: {
			source: {
				code: `["⌘","⇧","⌥","⌃","Enter","Esc","Tab","Space","↑","↓","←","→"].map(k => <Kbd>{k}</Kbd>)`,
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
			{["⌘", "⇧", "⌥", "⌃", "Enter", "Esc", "Tab", "Space", "↑", "↓", "←", "→"].map((key) => (
				<Kbd key={key}>{key}</Kbd>
			))}
		</div>
	),
};

export const Combinations: Story = {
	parameters: { docs: { source: { code: "<Kbd>⌘</Kbd>+<Kbd>K</Kbd>" } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 3 }}>
				<Kbd>⌘</Kbd>
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>+</span>
				<Kbd>K</Kbd>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 3 }}>
				<Kbd>⌘</Kbd>
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>+</span>
				<Kbd>⇧</Kbd>
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>+</span>
				<Kbd>D</Kbd>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 3 }}>
				<Kbd>⌘</Kbd>
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>+</span>
				<Kbd>N</Kbd>
			</div>
		</div>
	),
};

export const SmSize: Story = {
	parameters: { docs: { source: { code: `<Kbd size="sm">⌘</Kbd>` } } },
	render: () => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
			{["⌘", "⇧", "⌥", "⌃", "Enter", "Esc", "Tab", "Space", "↑", "↓", "←", "→"].map((key) => (
				<Kbd key={key} size="sm">
					{key}
				</Kbd>
			))}
		</div>
	),
};

export const InlineInText: Story = {
	parameters: { docs: { source: { code: SRC.InlineInText } } },
	render: () => (
		<p>
			Press <Kbd>ESC</Kbd> to dismiss the dialog.
		</p>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: "<Kbd>⌘K</Kbd>" } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
				{["⌘", "⇧", "⌥", "⌃", "Enter", "Esc", "Tab", "Space", "↑", "↓", "←", "→"].map((key) => (
					<Kbd key={key}>{key}</Kbd>
				))}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 3 }}>
				<Kbd>⌘</Kbd>
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>+</span>
				<Kbd>K</Kbd>
			</div>
		</div>
	),
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
};
