/**
 * # Usage Audit — RollingNumber (D-87, D-151, D-220)
 *
 * Consumers (post v2.1):
 * - dashboard/StatCounter — animated app-count display ("42 active applications")
 * - filters/SalaryRange — paired with NumberStepper as "live preview" (handoff SalaryRange pattern)
 * - analytics/PipelineMetrics — total counts + percentile badges
 * - pricing display in offer detail — "$120,000" formatted
 *
 * API shape consumers expect:
 * - value (any number) — controlled via parent state
 * - format(v) for currency / locale formatting (e.g., v => v.toLocaleString())
 * - prefix / suffix for currency/percentage decoration
 * - ariaLabel for assistive-tech announcement; defaults to visible display string
 * - Display-only — no onChange / no controlled-input semantics
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { RollingNumber } from "./RollingNumber";

const meta: Meta<typeof RollingNumber> = {
	title: "Atoms/RollingNumber",
	component: RollingNumber,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof RollingNumber>;

export const Basic: Story = {
	args: { value: 42 },
};

export const Currency: Story = {
	args: { value: 120000, prefix: "$", format: (v: number) => v.toLocaleString() },
};

export const Percentage: Story = {
	args: { value: 78, suffix: "%" },
};

export const MultiDigit: Story = {
	args: { value: 1234567, format: (v: number) => v.toLocaleString() },
};

export const AnimatedCounter: Story = {
	render: () => {
		const [v, setV] = useState(0);
		useEffect(() => {
			const id = setInterval(() => {
				setV((prev) => (prev >= 100 ? 0 : prev + 7));
			}, 1500);
			return () => clearInterval(id);
		}, []);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<RollingNumber value={v} suffix="%" ariaLabel="Animated counter" />
				<span style={{ fontSize: 11, color: "var(--ink-4)" }}>
					Auto-increments every 1.5s (animation visible in dev; frozen in baselines)
				</span>
			</div>
		);
	},
};

export const Playground: Story = {
	args: { value: 42 },
	argTypes: {
		value: { control: "number" },
		prefix: { control: "text" },
		suffix: { control: "text" },
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
			<RollingNumber value={42} />
			<RollingNumber value={120000} prefix="$" format={(v) => v.toLocaleString()} />
			<RollingNumber value={78} suffix="%" />
			<RollingNumber value={1234567} format={(v) => v.toLocaleString()} />
		</div>
	),
};
