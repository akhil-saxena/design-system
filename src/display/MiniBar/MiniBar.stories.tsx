import type { Meta, StoryObj } from "@storybook/react";
import { MiniBar } from ".";

const meta: Meta<typeof MiniBar> = {
	title: "Display/MiniBar",
	component: MiniBar,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"CSS flexbox bar chart. Bars are bottom-aligned with heights proportional to their values at a 70% maximum. Value labels appear above each bar; category labels below are optional.",
			},
		},
	},
	argTypes: {
		data: { control: false, description: "Array of numbers. Max value gets 70% bar height." },
		labels: { control: false, description: "Optional category label strings below each bar." },
		height: {
			control: { type: "range", min: 40, max: 200, step: 4 },
			description: "Container height in px.",
		},
		barColor: {
			control: "text",
			description: "Bar fill color; any CSS color value or token reference.",
		},
	},
};
export default meta;
type Story = StoryObj<typeof MiniBar>;

export const WithLabels: Story = {
	args: {
		data: [5, 8, 3, 2, 1],
		labels: ["Wish", "Applied", "Screen", "Interview", "Offer"],
	},
	parameters: {
		docs: {
			description: { story: "Job application funnel showing category labels below each bar." },
		},
	},
};

export const NoLabels: Story = {
	args: { data: [5, 8, 3, 2, 1] },
	parameters: {
		docs: { description: { story: "Same data without category labels." } },
	},
};

export const WeeklyActivity: Story = {
	args: {
		data: [2, 4, 1, 6, 3, 5, 3],
		labels: ["M", "T", "W", "T", "F", "S", "S"],
	},
	parameters: {
		docs: { description: { story: "7-day activity chart with single-letter day labels." } },
	},
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			<MiniBar
				data={[5, 8, 3, 2, 1]}
				labels={["Wish", "Applied", "Screen", "Interview", "Offer"]}
			/>
			<MiniBar data={[2, 4, 1, 6, 3, 5, 3]} labels={["M", "T", "W", "T", "F", "S", "S"]} />
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
