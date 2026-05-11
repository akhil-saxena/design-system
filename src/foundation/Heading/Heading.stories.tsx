import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from ".";

const meta: Meta<typeof Heading> = {
	title: "Foundation/Heading",
	component: Heading,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					'Display-typography primitive. Numeric `size`/`weight` drive inline styles (legacy). Token `size` (e.g. `"2xl"`) + token `weight` (e.g. `"black"`) route through `primitives.css` data-attr rules — prefer this path for new code so the theme can override.',
			},
		},
	},
	args: { children: "Job search, organized.", level: 2 },
	argTypes: {
		level: {
			control: { type: "number", min: 1, max: 6 },
			description: "Semantic heading level (1–6).",
		},
		size: { control: "text", description: "Px number (legacy) or type-scale token." },
		weight: { control: "text", description: "Numeric weight or weight token." },
		tone: {
			control: "select",
			options: [undefined, "ink", "ink-2", "ink-3", "amber"],
		},
		color: { control: "color" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {};

export const TokenScale: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<Heading level={1} size="4xl" weight="black">
				4xl / black
			</Heading>
			<Heading level={1} size="3xl" weight="black">
				3xl / black
			</Heading>
			<Heading level={2} size="2xl" weight="bold">
				2xl / bold
			</Heading>
			<Heading level={2} size="xl" weight="bold">
				xl / bold
			</Heading>
			<Heading level={3} size="lg" weight="medium">
				lg / medium
			</Heading>
		</div>
	),
};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<Heading tone="ink-2" size="xl">
				ink-2
			</Heading>
			<Heading tone="ink-3" size="xl">
				ink-3
			</Heading>
			<Heading tone="amber" size="xl">
				amber
			</Heading>
		</div>
	),
};

export const Legacy: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<Heading level={1} size={72} weight={900}>
				Hero — 72px / 900
			</Heading>
			<Heading level={2} size={28} weight={700}>
				Section — 28px / 700
			</Heading>
		</div>
	),
};
