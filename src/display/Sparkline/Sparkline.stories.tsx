import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from ".";

const meta: Meta<typeof Sparkline> = {
	title: "Display/Sparkline",
	component: Sparkline,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"SVG polyline chart. Normalizes a number array onto a fixed-height canvas with optional fill area and a terminal dot.",
			},
		},
	},
	argTypes: {
		data: { control: false, description: "Array of numbers to plot (min 2 points)." },
		width: {
			control: { type: "range", min: 40, max: 300, step: 4 },
			description: "SVG width in px.",
		},
		height: {
			control: { type: "range", min: 16, max: 80, step: 2 },
			description: "SVG height in px.",
		},
		color: {
			control: "text",
			description: "Stroke and fill color; any CSS color value or token reference.",
		},
		fill: { control: "boolean", description: "Show filled area under the line at 10% opacity." },
	},
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Default: Story = {
	args: { data: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24] },
};

export const NoFill: Story = {
	args: { data: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24], fill: false },
};

export const FlatData: Story = {
	args: { data: [5, 5, 5, 5, 5] },
	parameters: {
		docs: {
			description: { story: "All-equal values: range clamps to 1, produces a flat center line." },
		},
	},
};

export const CustomColors: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12]} color="var(--red)" />
			<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12]} color="var(--green)" />
			<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12]} color="var(--blue)" />
		</div>
	),
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24]} />
			<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24]} fill={false} />
			<Sparkline data={[5, 5, 5, 5, 5]} />
		</div>
	),
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 12,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
};
