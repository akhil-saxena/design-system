import type { Meta, StoryObj } from "@storybook/react";
import { DotGrid } from ".";

const meta: Meta<typeof DotGrid> = {
	title: "Foundation/DotGrid",
	component: DotGrid,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Radial-gradient dot-pattern overlay. `position: absolute; inset: 0; pointer-events: none` — drop into a `position: relative` parent as a decorative texture on dark hero panels, marketing surfaces, or empty-state backgrounds.",
			},
		},
	},
	argTypes: {
		color: { control: "color" },
		opacity: { control: { type: "number", min: 0, max: 1, step: 0.01 } },
		tile: { control: { type: "number", min: 4, max: 64, step: 1 } },
		dotRadius: { control: { type: "number", min: 0.5, max: 4, step: 0.1 } },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof DotGrid>;

export const Default: Story = {
	render: (args) => (
		<div
			style={{
				position: "relative",
				width: 480,
				height: 240,
				background: "#1c1917",
				borderRadius: 12,
				overflow: "hidden",
			}}
		>
			<DotGrid {...args} />
			<div
				style={{
					position: "relative",
					padding: 24,
					color: "#f5f3f0",
					fontFamily: "var(--font)",
				}}
			>
				Hero content over dots.
			</div>
		</div>
	),
};

export const HighOpacityAmber: Story = {
	args: { color: "#f59e0b", opacity: 0.18, tile: 14, dotRadius: 1.2 },
	render: (args) => (
		<div
			style={{
				position: "relative",
				width: 480,
				height: 240,
				background: "#1c1917",
				borderRadius: 12,
				overflow: "hidden",
			}}
		>
			<DotGrid {...args} />
		</div>
	),
};
