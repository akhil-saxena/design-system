/**
 * # Usage Audit — ProgressBar (DS-87, DS-42)
 *
 * Consumers (post v2.1):
 * - upload/DocumentUploadProgress — `<ProgressBar value={pct} label="Uploading" />`
 *   while file uploads to R2; switches to `<ProgressBar loading />` during
 *   the brief gap between upload-complete and metadata-write
 * - dashboard/AppQuotaIndicator — `<ProgressBar value={used} max={limit}
 *   label="Storage" />` showing R2 free-tier usage
 * - import/CsvImportProgress — `<ProgressBar value={rows} max={total}
 *   label="Importing rows" />` during bulk CSV import (deferred v2 feature)
 * - kanban/PipelineCompleteness — `<ProgressBar value={completed} max={total}
 *   label="Profile completeness" />` for onboarding progress
 * - ANY async-operation-bound surface that needs visual feedback
 *
 * API:
 * - `value?: number` — 0 to `max`; default 0; clamped internally
 * - `max?: number` — default 100
 * - `loading?: boolean` — default false; switches to indeterminate 3-dot pulse
 * - `label?: ReactNode` — string only used for `aria-label` (defaults
 *   "Progress" / "Loading"); for visible label, render your own caption
 *   above/below
 * - extends native <div> attributes via `...rest` spread
 * - forwards ref to root div
 *
 * A11y:
 * - Determinate: role="progressbar" + aria-valuenow/min/max
 * - Loading: role="status" + aria-live="polite" (announced once on mount)
 *
 * Implementation:
 * - Determinate: `<div .ds-atom-progress-track><div .ds-atom-progress-fill style="width: pct%">`
 * - Loading: `<span .ds-atom-progress-dots>` with 3 staggered-pulse dots
 * - Tone: amber gradient fill (var(--amber) → var(--amber-d)) — same
 *   family as primary Button (DS-10)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { ProgressBar } from "./ProgressBar";

const SRC = {
	Default: "<ProgressBar value={50} />",
	Range: `// Determinate — value 0–100
<ProgressBar value={0}   label="0%"   />
<ProgressBar value={25}  label="25%"  />
<ProgressBar value={50}  label="50%"  />
<ProgressBar value={75}  label="75%"  />
<ProgressBar value={100} label="100%" />`,
	Animated: `const [v, setV] = useState(0);
useEffect(() => {
  const id = window.setInterval(() => {
    setV((prev) => (prev >= 100 ? 0 : prev + 10));
  }, 800);
  return () => window.clearInterval(id);
}, []);
return <ProgressBar value={v} label="Animated upload" />;`,
	Loading: `<ProgressBar loading label="Loading" />`,
	CustomMax: `<ProgressBar value={7} max={10} label="Step 7 of 10" />`,
	Playground: "<ProgressBar value={35} max={100} />",
	DarkMode: `<ProgressBar value={25} label="25%" />
<ProgressBar value={50} label="50%" />
<ProgressBar value={75} label="75%" />
<ProgressBar loading label="Loading" />`,
};

const meta: Meta<typeof ProgressBar> = {
	title: "Feedback/ProgressBar",
	component: ProgressBar,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Determinate progress indicator with an optional indeterminate loading variant; exposes `aria-valuenow` and label slot.",
			},
		},
	},
	argTypes: {
		value: {
			control: "number",
			description: "Current progress value; clamped to [0, max] internally.",
		},
		max: { control: "number", description: "Maximum value used to compute the fill percentage." },
		loading: {
			control: "boolean",
			description: "When true, renders an animated 3-dot pulse instead of a determinate fill bar.",
		},
		label: {
			control: false,
			description: "Accessible label; string values also render visually above the bar.",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
	args: { value: 50 },
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const Range: Story = {
	parameters: { docs: { source: { code: SRC.Range } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
			{[0, 25, 50, 75, 100].map((v) => (
				<div key={v}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-3)",
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							marginBottom: 6,
						}}
					>
						{v}%
					</div>
					<ProgressBar value={v} label={`Progress ${v}%`} />
				</div>
			))}
		</div>
	),
};

function AnimatedDemo() {
	const [v, setV] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => {
			setV((prev) => (prev >= 100 ? 0 : prev + 10));
		}, 800);
		return () => window.clearInterval(id);
	}, []);
	return (
		<div style={{ maxWidth: 480 }}>
			<div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6 }}>
				Animating 0 → 100 every 0.8s; transition 0.5s ease-out per step
			</div>
			<ProgressBar value={v} label="Animated upload" />
		</div>
	);
}

export const Animated: Story = {
	parameters: { docs: { source: { code: SRC.Animated } } },
	render: () => <AnimatedDemo />,
};

export const Loading: Story = {
	parameters: { docs: { source: { code: SRC.Loading } } },
	render: () => (
		<div style={{ maxWidth: 480 }}>
			<div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6 }}>
				Indeterminate 3-dot pulse — for unknown-duration operations
			</div>
			<ProgressBar loading label="Loading" />
		</div>
	),
};

export const CustomMax: Story = {
	args: {
		value: 7,
		max: 10,
		label: "Step 7 of 10",
	},
	parameters: { docs: { source: { code: SRC.CustomMax } } },
};

export const Playground: Story = {
	args: { value: 35, max: 100, loading: false },
	parameters: { docs: { source: { code: SRC.Playground } } },
	argTypes: {
		value: { control: { type: "range", min: 0, max: 100, step: 1 } },
		max: { control: "number" },
		loading: { control: "boolean" },
	},
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
			<ProgressBar value={25} label="25% (dark)" />
			<ProgressBar value={50} label="50% (dark)" />
			<ProgressBar value={75} label="75% (dark)" />
			<ProgressBar loading label="Loading (dark)" />
		</div>
	),
};
