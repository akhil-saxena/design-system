import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ColorPicker } from ".";

const SRC = {
	Default: "<ColorPicker />",
	Controlled: `const [color, setColor] = useState("#3b82f6");
return <ColorPicker value={color} onChange={setColor} />;`,
	CustomPresets: `<ColorPicker
  presets={["#0ea5e9", "#10b981", "#a855f7", "#f43f5e", "#eab308"]}
/>`,
	DarkMode: `<ColorPicker defaultValue="#f97316" />`,
};

const meta: Meta<typeof ColorPicker> = {
	title: "Inputs/ColorPicker",
	component: ColorPicker,
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
					"Full color picker panel — saturation/value canvas, hue bar, opacity bar, hex input, alpha display, 10 preset swatches, and 3 tonal strips. Three-slot decoupled state (color / hex / hue) prevents partial-typing corruption and gradient self-reference loops.",
			},
		},
	},
	argTypes: {
		value: { control: false, description: "Controlled hex value (e.g. '#f59e0b')." },
		onChange: { control: false, description: "Called with new hex on any color change." },
		defaultValue: { control: false, description: "Initial hex when uncontrolled." },
		presets: { control: false, description: "Custom 10-color preset palette." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

const labelStyle = {
	fontFamily: "var(--mono)" as const,
	fontSize: 10,
	letterSpacing: "0.08em",
	textTransform: "uppercase" as const,
	color: "var(--ink-3)",
	marginBottom: 8,
};

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <ColorPicker />,
};

function ColorPickerControlledDemo() {
	const [color, setColor] = useState<string>("#3b82f6");
	return (
		<div style={{ display: "inline-grid", gap: 16 }}>
			<ColorPicker value={color} onChange={setColor} />
			<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
				Selected: {color}
			</div>
		</div>
	);
}

export const Controlled: Story = {
	parameters: { docs: { source: { code: SRC.Controlled } } },
	render: () => <ColorPickerControlledDemo />,
};

export const CustomPresets: Story = {
	parameters: { docs: { source: { code: SRC.CustomPresets } } },
	render: () => (
		<div>
			<div style={labelStyle}>Brand palette</div>
			<ColorPicker
				presets={[
					"#0ea5e9",
					"#10b981",
					"#a855f7",
					"#f43f5e",
					"#eab308",
					"#14b8a6",
					"#f97316",
					"#6366f1",
					"#84cc16",
					"#ec4899",
				]}
			/>
		</div>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 8,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <ColorPicker defaultValue="#f97316" />,
};
