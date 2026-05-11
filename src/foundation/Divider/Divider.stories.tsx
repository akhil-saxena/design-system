import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from ".";

const meta: Meta<typeof Divider> = {
	title: "Foundation/Divider",
	component: Divider,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					'Hairline rule with an optional centered label (e.g. "OR" between OAuth and email forms). Supports horizontal/vertical orientation, spacing presets, and dashed/amber accents.',
			},
		},
	},
	args: { spacing: "md" },
	argTypes: {
		spacing: { control: "select", options: [undefined, "none", "sm", "md", "lg", "xl"] },
		accent: { control: "select", options: [undefined, "dashed", "amber"] },
		vertical: { control: "boolean" },
		label: { control: "text" },
		color: { control: "color" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
	render: (args) => (
		<div style={{ width: 360 }}>
			<Divider {...args} />
		</div>
	),
};

export const Labeled: Story = {
	args: { label: "OR" },
	render: (args) => (
		<div style={{ width: 360 }}>
			<Divider {...args} />
		</div>
	),
};

export const Accents: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24, width: 360 }}>
			<Divider />
			<Divider accent="dashed" />
			<Divider accent="amber" />
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
			<span>left</span>
			<Divider vertical spacing="md" />
			<span>middle</span>
			<Divider vertical spacing="md" />
			<span>right</span>
		</div>
	),
};
