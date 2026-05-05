import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextInput } from "../TextInput";
import { ColorInput } from "./ColorInput";

const SRC = {
	Default: `<ColorInput defaultValue="#f59e0b" />`,
	WithLabel: `<ColorInput label="Primary brand color" defaultValue="#3b82f6" />`,
	InFormRow: `<form>
  <TextInput placeholder="Brand name" defaultValue="Acme" />
  <ColorInput label="Primary" defaultValue="#f59e0b" />
  <ColorInput label="Accent" defaultValue="#3b82f6" />
</form>`,
	DarkMode: `<ColorInput label="Brand color" defaultValue="#22c55e" />`,
};

const meta: Meta<typeof ColorInput> = {
	title: "Inputs/ColorInput",
	component: ColorInput,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "white",
			values: [
				{ name: "white", value: "#ffffff" },
				{ name: "light", value: "#f5f3f0" },
				{ name: "dark", value: "#1c1917" },
			],
		},
		docs: {
			description: {
				component:
					"Compact inline color field — 28×28 swatch + monospace hex input. Designed to drop into a form row alongside other ds-input fields. No popover, no full picker. Pair with ColorPicker for full editing.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div style={{ width: "100%", maxWidth: 320 }}>
				<Story />
			</div>
		),
	],
	argTypes: {
		value: { control: false, description: "Controlled hex value." },
		onChange: { control: false, description: "Called with valid hex on change." },
		defaultValue: { control: false, description: "Initial hex when uncontrolled." },
		label: { control: "text", description: "Optional label text rendered above the input." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof ColorInput>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <ColorInput defaultValue="#f59e0b" />,
};

export const WithLabel: Story = {
	parameters: { docs: { source: { code: SRC.WithLabel } } },
	render: () => <ColorInput label="Primary brand color" defaultValue="#3b82f6" />,
};

function ColorInputFormRowDemo() {
	const [primary, setPrimary] = useState<string>("#f59e0b");
	const [accent, setAccent] = useState<string>("#3b82f6");
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div>
				<label
					className="ds-label"
					style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}
				>
					Brand name
				</label>
				<TextInput placeholder="Acme Corp" defaultValue="Acme Corp" />
			</div>
			<ColorInput label="Primary" value={primary} onChange={setPrimary} />
			<ColorInput label="Accent" value={accent} onChange={setAccent} />
			<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
				Primary: {primary} · Accent: {accent}
			</div>
		</div>
	);
}

export const InFormRow: Story = {
	parameters: { docs: { source: { code: SRC.InFormRow } } },
	render: () => <ColorInputFormRowDemo />,
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 24,
					borderRadius: 8,
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <ColorInput label="Brand color" defaultValue="#22c55e" />,
};
