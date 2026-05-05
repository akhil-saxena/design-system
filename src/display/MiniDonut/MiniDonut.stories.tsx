import type { Meta, StoryObj } from "@storybook/react";
import { MiniDonut } from ".";

const meta: Meta<typeof MiniDonut> = {
	title: "Display/MiniDonut",
	component: MiniDonut,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"SVG ring progress chart. Two concentric circles: a cream track and an amber arc that animates from 12 o'clock.",
			},
		},
	},
	argTypes: {
		value: {
			control: { type: "range", min: 0, max: 150, step: 1 },
			description: "Current value. Values above max are clamped.",
		},
		max: {
			control: { type: "number" },
			description: "Maximum value (denominator for percentage).",
		},
		size: {
			control: { type: "range", min: 24, max: 120, step: 4 },
			description: "SVG width and height in px.",
		},
		strokeWidth: {
			control: { type: "range", min: 2, max: 16, step: 1 },
			description: "Ring stroke width in px.",
		},
		color: {
			control: "text",
			description:
				"Arc stroke color; any CSS color value or token reference.",
		},
	},
};
export default meta;
type Story = StoryObj<typeof MiniDonut>;

export const Default: Story = {
	args: { value: 65 },
};

export const MultiColor: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<MiniDonut value={78} color="var(--green)" />
			<MiniDonut value={65} color="var(--amber)" />
			<MiniDonut value={42} color="var(--blue)" />
			<MiniDonut value={90} color="var(--purple)" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Four donuts side-by-side: green 78%, amber 65%, blue 42%, purple 90%.",
			},
		},
	},
};

export const WithLabel: Story = {
	render: () => (
		<div
			style={{
				position: "relative",
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<MiniDonut value={65} size={64} strokeWidth={6} />
			<div
				style={{
					position: "absolute",
					fontFamily: "var(--mono)",
					fontSize: 13,
					fontWeight: 600,
					color: "var(--ink-1)",
				}}
			>
				65%
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"MiniDonut renders no label itself. Wrap in a relative-positioned container and absolutely center the text.",
			},
		},
	},
};

export const EdgeCases: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<div style={{ textAlign: "center" }}>
				<MiniDonut value={0} />
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-3)",
						marginTop: 4,
					}}
				>
					0%
				</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<MiniDonut value={100} />
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-3)",
						marginTop: 4,
					}}
				>
					100%
				</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<MiniDonut value={150} />
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-3)",
						marginTop: 4,
					}}
				>
					150 (clamped)
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"value=0 (empty ring), value=100 (full ring), value=150 (clamped to 100%).",
			},
		},
	},
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<MiniDonut value={65} />
			<MiniDonut value={78} color="var(--green)" />
			<MiniDonut value={42} color="var(--blue)" />
			<MiniDonut value={0} />
			<MiniDonut value={100} />
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
