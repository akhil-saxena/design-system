import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";
const SRC = {
	Default: "<Badge>Label</Badge>",
	Tones: `<Badge tone="upcoming">Upcoming</Badge>
<Badge tone="passed">Passed</Badge>
<Badge tone="pending">Pending</Badge>
<Badge tone="done">Done</Badge>
<Badge tone="count">+3</Badge>
<Badge tone="neutral">Neutral</Badge>`,
	WithDot: `<Badge tone="upcoming" dot>Upcoming</Badge>
<Badge tone="passed" dot>Passed</Badge>
<Badge tone="pending" dot>Pending</Badge>
<Badge tone="done" dot>Done</Badge>`,
	Playground: `<Badge tone="upcoming" dot={false}>Playground</Badge>`,
	DarkMode: `<Badge tone="upcoming">Upcoming</Badge>
<Badge tone="passed">Passed</Badge>
<Badge tone="pending">Pending</Badge>
<Badge tone="done">Done</Badge>
<Badge tone="count">+3</Badge>`,
};

const meta: Meta<typeof Badge> = {
	title: "Inputs/Badge",
	component: Badge,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Small label chip with tone variants (neutral, info, success, warning, error) and an optional leading colored dot.",
			},
		},
	},
	args: { children: "Label" },
	argTypes: {
		tone: {
			control: "select",
			options: ["upcoming", "passed", "pending", "done", "count", "neutral"],
			description: "Color tone applying semantic background and text colors.",
		},
		dot: {
			control: "boolean",
			description: "When true, renders a small leading colored dot inside the badge.",
		},
		dotColor: { control: "text", description: "Override the dot color with any CSS color string." },
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const Tones: Story = {
	parameters: { docs: { source: { code: SRC.Tones } } },
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming">Upcoming</Badge>
			<Badge tone="passed">Passed</Badge>
			<Badge tone="pending">Pending</Badge>
			<Badge tone="done">Done</Badge>
			<Badge tone="count">+3</Badge>
			<Badge tone="neutral">Neutral</Badge>
		</div>
	),
};

export const WithDot: Story = {
	parameters: { docs: { source: { code: SRC.WithDot } } },
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming" dot>
				Upcoming
			</Badge>
			<Badge tone="passed" dot>
				Passed
			</Badge>
			<Badge tone="pending" dot>
				Pending
			</Badge>
			<Badge tone="done" dot>
				Done
			</Badge>
		</div>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming">Upcoming</Badge>
			<Badge tone="passed">Passed</Badge>
			<Badge tone="pending">Pending</Badge>
			<Badge tone="done">Done</Badge>
			<Badge tone="count">+3</Badge>
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
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
};
