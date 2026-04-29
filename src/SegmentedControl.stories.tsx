/**
 * # Usage Audit — SegmentedControl (DS-63, D-17-20)
 *
 * Consumers (post v0.6):
 * - Calendar (DS-68) — view-mode toggle (month/week/day)
 * - Consumer apps — 2-5 way visual toggles (filter, mode, view)
 *
 * API shape consumers expect:
 * - options: SegmentedOption[] — 2-5 items; 6+ → use Select
 * - value (controlled) + onChange(next: string) — controlled callback
 * - size: "sm" | "md" | "lg" (default md)
 * - disabled: boolean (group-level)
 * - ariaLabel: string (required — radiogroup needs accessible name)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
	title: "Atoms/SegmentedControl",
	component: SegmentedControl,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const VIEW_OPTIONS: SegmentedOption[] = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
];

const TWO_OPTIONS: SegmentedOption[] = [
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
];

const FIVE_OPTIONS: SegmentedOption[] = [
	{ value: "1d", label: "1D" },
	{ value: "1w", label: "1W" },
	{ value: "1m", label: "1M" },
	{ value: "3m", label: "3M" },
	{ value: "1y", label: "1Y" },
];

const WITH_DISABLED_OPTION: SegmentedOption[] = [
	{ value: "list", label: "List" },
	{ value: "board", label: "Board", disabled: true },
	{ value: "calendar", label: "Calendar" },
];

export const Default: Story = {
	render: () => {
		const [v, setV] = useState("week");
		return (
			<SegmentedControl options={VIEW_OPTIONS} value={v} onChange={setV} ariaLabel="View mode" />
		);
	},
};

export const TwoOptions: Story = {
	render: () => {
		const [v, setV] = useState("active");
		return (
			<SegmentedControl options={TWO_OPTIONS} value={v} onChange={setV} ariaLabel="Status filter" />
		);
	},
};

export const FiveOptions: Story = {
	render: () => {
		const [v, setV] = useState("1m");
		return (
			<SegmentedControl options={FIVE_OPTIONS} value={v} onChange={setV} ariaLabel="Time period" />
		);
	},
};

export const Sizes: Story = {
	render: () => {
		const [sm, setSm] = useState("week");
		const [md, setMd] = useState("week");
		const [lg, setLg] = useState("week");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-4)",
							fontWeight: 600,
							width: 24,
						}}
					>
						SM
					</span>
					<SegmentedControl
						options={VIEW_OPTIONS}
						value={sm}
						onChange={setSm}
						ariaLabel="View mode small"
						size="sm"
					/>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-4)",
							fontWeight: 600,
							width: 24,
						}}
					>
						MD
					</span>
					<SegmentedControl
						options={VIEW_OPTIONS}
						value={md}
						onChange={setMd}
						ariaLabel="View mode medium"
						size="md"
					/>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-4)",
							fontWeight: 600,
							width: 24,
						}}
					>
						LG
					</span>
					<SegmentedControl
						options={VIEW_OPTIONS}
						value={lg}
						onChange={setLg}
						ariaLabel="View mode large"
						size="lg"
					/>
				</div>
			</div>
		);
	},
};

export const Disabled: Story = {
	render: () => (
		<SegmentedControl
			options={VIEW_OPTIONS}
			value="week"
			onChange={() => {}}
			ariaLabel="View mode (disabled)"
			disabled
		/>
	),
};

export const WithDisabledOption: Story = {
	render: () => {
		const [v, setV] = useState("list");
		return (
			<SegmentedControl
				options={WITH_DISABLED_OPTION}
				value={v}
				onChange={setV}
				ariaLabel="View layout"
			/>
		);
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => {
		const [view, setView] = useState("week");
		const [period, setPeriod] = useState("1m");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
				<SegmentedControl
					options={VIEW_OPTIONS}
					value={view}
					onChange={setView}
					ariaLabel="View mode (dark)"
				/>
				<SegmentedControl
					options={FIVE_OPTIONS}
					value={period}
					onChange={setPeriod}
					ariaLabel="Time period (dark)"
				/>
				<SegmentedControl
					options={VIEW_OPTIONS}
					value="week"
					onChange={() => {}}
					ariaLabel="Disabled (dark)"
					disabled
				/>
			</div>
		);
	},
};

export const Playground: Story = {
	args: {
		options: VIEW_OPTIONS,
		value: "week",
		size: "md",
		disabled: false,
		ariaLabel: "Playground",
	},
	argTypes: {
		size: { control: { type: "select", options: ["sm", "md", "lg"] } },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [v, setV] = useState(args.value);
		return <SegmentedControl {...args} value={v} onChange={setV} />;
	},
};
