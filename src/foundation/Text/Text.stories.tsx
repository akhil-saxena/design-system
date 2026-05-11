import type { Meta, StoryObj } from "@storybook/react";
import { Text } from ".";

const meta: Meta<typeof Text> = {
	title: "Foundation/Text",
	component: Text,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Body-text primitive. `variant` (`body`/`small`/`caption`/`legal`) is the legacy inline-style path. `size`/`weight`/`tone`/`mono`/`leading` route through `primitives.css` data-attr rules — prefer this path for new code.",
			},
		},
	},
	args: { children: "Mark every step of your job search." },
	argTypes: {
		variant: { control: "select", options: ["body", "small", "caption", "legal"] },
		as: { control: "select", options: ["p", "span", "div"] },
		size: {
			control: "select",
			options: [undefined, "2xs", "xs", "sm", "base", "md", "lg"],
		},
		weight: {
			control: "select",
			options: [undefined, "regular", "medium", "bold", "black"],
		},
		tone: {
			control: "select",
			options: [undefined, "ink", "ink-2", "ink-3", "ink-4", "amber", "red", "green"],
		},
		leading: {
			control: "select",
			options: [undefined, "tight", "snug", "normal", "relaxed"],
		},
		mono: { control: "boolean" },
		maxWidth: { control: "number" },
		color: { control: "color" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};

export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<Text variant="body">Body — the default. Lorem ipsum dolor sit amet.</Text>
			<Text variant="small">Small — for dense rows or supporting copy.</Text>
			<Text variant="caption">Caption — applied 3d ago to alex@example.com.</Text>
			<Text variant="legal">Legal — by continuing you agree to the Terms and Privacy Policy.</Text>
		</div>
	),
};

export const Tokens: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
			<Text size="lg" weight="bold">
				lg / bold
			</Text>
			<Text size="md" tone="ink-2">
				md / ink-2
			</Text>
			<Text size="base" tone="ink-3">
				base / ink-3
			</Text>
			<Text size="sm" tone="amber" mono>
				sm / amber / mono
			</Text>
		</div>
	),
};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Text tone="ink">ink (primary)</Text>
			<Text tone="ink-2">ink-2</Text>
			<Text tone="ink-3">ink-3</Text>
			<Text tone="ink-4">ink-4</Text>
			<Text tone="amber">amber</Text>
			<Text tone="red">red</Text>
			<Text tone="green">green</Text>
		</div>
	),
};

export const MaxWidth: Story = {
	args: {
		maxWidth: 320,
		children:
			"Caps line length for readability — long-form copy should not stretch wider than ~70ch. Useful for empty states, marketing blurbs, and legal text.",
	},
};
