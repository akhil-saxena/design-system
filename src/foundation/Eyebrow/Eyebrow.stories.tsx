import type { Meta, StoryObj } from "@storybook/react";
import { Eyebrow } from ".";

const meta: Meta<typeof Eyebrow> = {
	title: "Foundation/Eyebrow",
	component: Eyebrow,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Mono-caps eyebrow / overline. Used as form field labels, hero kickers, section headers, and stage-chip captions.",
			},
		},
	},
	args: { children: "WELCOME BACK" },
	argTypes: {
		size: { control: "select", options: ["xs", "sm", "md"] },
		tone: { control: "select", options: [undefined, "ink-3", "ink-4", "amber"] },
		color: { control: "color" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Eyebrow>;

export const Default: Story = {};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Eyebrow size="xs">SIZE XS</Eyebrow>
			<Eyebrow size="sm">SIZE SM</Eyebrow>
			<Eyebrow size="md">SIZE MD</Eyebrow>
		</div>
	),
};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Eyebrow>DEFAULT (INK-3)</Eyebrow>
			<Eyebrow tone="ink-4">INK-4</Eyebrow>
			<Eyebrow tone="amber">AMBER</Eyebrow>
		</div>
	),
};
