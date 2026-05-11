import type { Meta, StoryObj } from "@storybook/react";
import { RelativeTime } from ".";

const SRC = {
	RecentMinutes: "<RelativeTime date={Date.now() - 10 * 60_000} />",
	RecentHours: "<RelativeTime date={Date.now() - 3 * 3_600_000} />",
	RecentDays: "<RelativeTime date={Date.now() - 5 * 86_400_000} />",
	OlderThan30Days: "<RelativeTime date={Date.now() - 45 * 86_400_000} />",
	Future: "<RelativeTime date={Date.now() + 5 * 60_000} />",
	WithPrefix: `<RelativeTime date={Date.now() - 2 * 86_400_000} prefix="Applied" />`,
	DarkMode: "<RelativeTime date={Date.now() - 10 * 60_000} updateInterval={0} />",
};

const meta: Meta<typeof RelativeTime> = {
	title: "Interaction/RelativeTime",
	component: RelativeTime,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Displays a human-readable relative timestamp with an exact datetime tooltip. Auto-updates every 60 s via setInterval. Used in DataGrid applied-date columns.",
			},
		},
	},
	argTypes: {
		className: { control: false },
		style: { control: false },
		updateInterval: { control: { type: "number" } },
	},
};

export default meta;
type Story = StoryObj<typeof RelativeTime>;

export const RecentMinutes: Story = {
	args: { date: Date.now() - 10 * 60_000 },
	parameters: {
		docs: {
			description: { story: "Less than 60 minutes ago — shows minutes bucket." },
			source: { code: SRC.RecentMinutes },
		},
	},
};

export const RecentHours: Story = {
	args: { date: Date.now() - 3 * 3_600_000 },
	parameters: {
		docs: {
			description: { story: "Less than 24 hours ago — shows hours bucket." },
			source: { code: SRC.RecentHours },
		},
	},
};

export const RecentDays: Story = {
	args: { date: Date.now() - 5 * 86_400_000 },
	parameters: {
		docs: {
			description: { story: "Less than 30 days ago — shows days bucket." },
			source: { code: SRC.RecentDays },
		},
	},
};

export const OlderThan30Days: Story = {
	args: { date: Date.now() - 45 * 86_400_000 },
	parameters: {
		docs: {
			description: {
				story: "30+ days ago — falls back to locale date string with no 'ago' suffix.",
			},
			source: { code: SRC.OlderThan30Days },
		},
	},
};

export const Future: Story = {
	args: { date: Date.now() + 5 * 60_000 },
	parameters: {
		docs: {
			description: { story: "Future date — shows 'in Nm' format." },
			source: { code: SRC.Future },
		},
	},
};

export const WithPrefix: Story = {
	args: { date: Date.now() - 2 * 86_400_000, prefix: "Applied" },
	parameters: {
		docs: {
			description: {
				story: "Optional prefix rendered in --ink-4 before the relative string.",
			},
			source: { code: SRC.WithPrefix },
		},
	},
};

export const DarkMode: Story = {
	parameters: {
		docs: { source: { code: SRC.DarkMode } },
	},
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>10m ago:</span>
						<RelativeTime date={Date.now() - 10 * 60_000} updateInterval={0} />
					</div>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>3h ago:</span>
						<RelativeTime date={Date.now() - 3 * 3_600_000} updateInterval={0} />
					</div>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>5d ago:</span>
						<RelativeTime date={Date.now() - 5 * 86_400_000} updateInterval={0} />
					</div>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>45d ago:</span>
						<RelativeTime date={Date.now() - 45 * 86_400_000} updateInterval={0} />
					</div>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>future:</span>
						<RelativeTime date={Date.now() + 5 * 60_000} updateInterval={0} />
					</div>
					<div>
						<span style={{ color: "#a8a29e", fontSize: 12, marginRight: 8 }}>prefix:</span>
						<RelativeTime date={Date.now() - 2 * 86_400_000} prefix="Applied" updateInterval={0} />
					</div>
				</div>
			</div>
		),
	],
};
