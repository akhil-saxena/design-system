import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from ".";

const meta: Meta<typeof StatCard> = {
	title: "Display/StatCard",
	component: StatCard,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"KPI card composing a mono uppercase label, large Archivo value, sentiment-colored trend badge, and optional Sparkline chart. Uses the glass surface. All styling is inline — no new CSS class required.",
			},
		},
	},
	argTypes: {
		label: { control: "text", description: "Monospace uppercase label" },
		value: { control: "text", description: "Primary metric value string or number" },
		change: { control: "text", description: "Trend badge text, e.g. '+12%'" },
		changeDir: {
			control: "radio",
			options: [undefined, "up", "down"],
			description: "Trend direction — drives badge and sparkline color",
		},
		data: { control: false, description: "Sparkline data points (min 2)" },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof StatCard>;

// ── Raw source strings for docs panels ─────────────────────────────────────
const SRC = {
	Default: `<StatCard
  label="Total Applications"
  value="24"
  change="+12%"
  changeDir="up"
  data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24]}
/>`,
	TrendDown: `<StatCard
  label="Response Rate"
  value="42%"
  change="-5%"
  changeDir="down"
  data={[60, 55, 50, 48, 52, 45, 42]}
/>`,
	NoSparkline: `<StatCard
  label="Avg. Response"
  value="4.2d"
/>`,
	Variants: `<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
  <StatCard label="Total Applications" value="24"  change="+12%" changeDir="up"   data={[4,6,5,8,7,10,9,12,11,15]} />
  <StatCard label="Response Rate"      value="42%" change="-5%"  changeDir="down" data={[60,55,50,48,52,45,42]} />
  <StatCard label="Avg. Response"      value="4.2d" />
</div>`,
	DarkMode: "// Dark mode decorator applied — glass surface adapts via CSS tokens",
};

// ── Stories ─────────────────────────────────────────────────────────────────

/** Playground — all props are controllable in the Storybook controls panel. */
export const Default: Story = {
	args: {
		label: "Total Applications",
		value: "24",
		change: "+12%",
		changeDir: "up",
		data: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24],
	},
	parameters: {
		docs: {
			description: {
				story: "Default playground — positive trend with sparkline.",
			},
			source: { code: SRC.Default },
		},
	},
};

/** Positive trend (green badge + green sparkline) alongside negative trend (red). */
export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
			<StatCard
				label="Total Applications"
				value="24"
				change="+12%"
				changeDir="up"
				data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15]}
			/>
			<StatCard
				label="Response Rate"
				value="42%"
				change="-5%"
				changeDir="down"
				data={[60, 55, 50, 48, 52, 45, 42]}
			/>
			<StatCard label="Avg. Response" value="4.2d" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All three required REQ-20-01 variants side by side.",
			},
			source: { code: SRC.Variants },
		},
	},
};

/** Negative trend — red badge and red sparkline line. */
export const TrendDown: Story = {
	args: {
		label: "Response Rate",
		value: "42%",
		change: "-5%",
		changeDir: "down",
		data: [60, 55, 50, 48, 52, 45, 42],
	},
	parameters: {
		docs: {
			description: {
				story: "Negative changeDir: badge background is rgba(239,68,68,.08), text is var(--red).",
			},
			source: { code: SRC.TrendDown },
		},
	},
};

/** No sparkline — data prop absent, no SVG element rendered below value row. */
export const NoSparkline: Story = {
	args: {
		label: "Avg. Response",
		value: "4.2d",
	},
	parameters: {
		docs: {
			description: {
				story: "When data prop is omitted, no Sparkline is rendered. No change badge either.",
			},
			source: { code: SRC.NoSparkline },
		},
	},
};

/** Dark mode — glass tokens adapt automatically; verify bg and border remain readable. */
export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
			<StatCard
				label="Total Applications"
				value="24"
				change="+12%"
				changeDir="up"
				data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15]}
			/>
			<StatCard
				label="Response Rate"
				value="42%"
				change="-5%"
				changeDir="down"
				data={[60, 55, 50, 48, 52, 45, 42]}
			/>
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
	parameters: {
		docs: {
			description: {
				story:
					"Dark mode: glass surface uses var(--g-bg) dark token (rgba(40,37,34,0.7)), border uses var(--g-bd) dark token. Green/red badge tokens flip automatically.",
			},
			source: { code: SRC.DarkMode },
		},
	},
};
