import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const SRC = {
	Default: `const [v, setV] = useState("week");
return (
  <SegmentedControl
    options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
    value={v}
    onChange={setV}
    ariaLabel="View mode"
  />
);`,
	TwoOptions: `const [v, setV] = useState("active");
return (
  <SegmentedControl
    options={[{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }]}
    value={v}
    onChange={setV}
    ariaLabel="Status filter"
  />
);`,
	FiveOptions: `const [v, setV] = useState("1m");
return (
  <SegmentedControl
    options={[
      { value: "1d", label: "1D" },
      { value: "1w", label: "1W" },
      { value: "1m", label: "1M" },
      { value: "3m", label: "3M" },
      { value: "1y", label: "1Y" },
    ]}
    value={v}
    onChange={setV}
    ariaLabel="Time period"
  />
);`,
	Sizes: `<SegmentedControl options={options} value={v} onChange={setV} ariaLabel="View mode small" size="sm" />
<SegmentedControl options={options} value={v} onChange={setV} ariaLabel="View mode medium" size="md" />
<SegmentedControl options={options} value={v} onChange={setV} ariaLabel="View mode large" size="lg" />`,
	Disabled: `<SegmentedControl
  options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
  value="week"
  onChange={() => {}}
  ariaLabel="View mode (disabled)"
  disabled
/>`,
	WithDisabledOption: `const [v, setV] = useState("list");
return (
  <SegmentedControl
    options={[
      { value: "list", label: "List" },
      { value: "board", label: "Board", disabled: true },
      { value: "calendar", label: "Calendar" },
    ]}
    value={v}
    onChange={setV}
    ariaLabel="View layout"
  />
);`,
	DarkMode: `const [view, setView] = useState("week");
return (
  <SegmentedControl
    options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
    value={view}
    onChange={setView}
    ariaLabel="View mode (dark)"
  />
);`,
	Playground: `const [v, setV] = useState("week");
return (
  <SegmentedControl
    options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
    value={v}
    onChange={setV}
    size="md"
    ariaLabel="Playground"
  />
);`,
};

const meta: Meta<typeof SegmentedControl> = {
	title: "Atoms/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Pill-style single-select control for switching between a small set of mutually exclusive options, styled as a connected button group.",
			},
		},
	},
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
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => {
		const [v, setV] = useState("week");
		return (
			<SegmentedControl options={VIEW_OPTIONS} value={v} onChange={setV} ariaLabel="View mode" />
		);
	},
};

export const TwoOptions: Story = {
	parameters: { docs: { source: { code: SRC.TwoOptions } } },
	render: () => {
		const [v, setV] = useState("active");
		return (
			<SegmentedControl options={TWO_OPTIONS} value={v} onChange={setV} ariaLabel="Status filter" />
		);
	},
};

export const FiveOptions: Story = {
	parameters: { docs: { source: { code: SRC.FiveOptions } } },
	render: () => {
		const [v, setV] = useState("1m");
		return (
			<SegmentedControl options={FIVE_OPTIONS} value={v} onChange={setV} ariaLabel="Time period" />
		);
	},
};

export const Sizes: Story = {
	parameters: { docs: { source: { code: SRC.Sizes } } },
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
	parameters: { docs: { source: { code: SRC.Disabled } } },
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
	parameters: { docs: { source: { code: SRC.WithDisabledOption } } },
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
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
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
	parameters: { docs: { source: { code: SRC.Playground } } },
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
