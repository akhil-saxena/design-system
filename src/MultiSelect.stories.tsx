/**
 * # Usage Audit — MultiSelect (DS-87, DS-51, D-501, D-520)
 *
 * Consumers (post v2.1):
 * - applications/JobFilters — multi-select tag picker (Remote / On-site / Hybrid + seniority levels)
 * - applications/SkillsField — pick known skill chips for a profile
 * - settings/NotificationChannels — pick which channels (Email / Slack / Push) receive a category
 *
 * API:
 * - value (required): string[] — currently-selected values
 * - onChange (required): (vs: string[]) => void
 * - options (required): { value, label }[]
 * - placeholder?: shown when value.length === 0
 * - disabled?: trigger ignores clicks
 *
 * Behavior (D-501 + D-520):
 * - Trigger renders selected chips inside, flex-wrap layout
 * - Cap 3 visible chips + "+N more" non-removable chip; "+N more" opens Popover with full list + per-item remove
 * - Listbox: role=listbox aria-multiselectable=true; options: role=option aria-selected
 * - Click option toggles its presence; dropdown stays open (multi-select stays open)
 * - Each option leads with a mini-checkbox (CSS-styled span with Check icon when selected)
 *
 * Visual baselines: deferred to 16-09 closeout (DS-86).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

const tagOptions: MultiSelectOption[] = [
	{ value: "remote", label: "Remote" },
	{ value: "onsite", label: "On-site" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "senior", label: "Senior" },
	{ value: "mid", label: "Mid" },
	{ value: "junior", label: "Junior" },
];

const meta: Meta<typeof MultiSelect> = {
	title: "Compound/MultiSelect",
	component: MultiSelect,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

function ControlledHarness({
	initial,
	options = tagOptions,
	placeholder,
	disabled,
}: {
	initial: string[];
	options?: MultiSelectOption[];
	placeholder?: string;
	disabled?: boolean;
}) {
	const [value, setValue] = useState<string[]>(initial);
	return (
		<div style={{ width: 360 }}>
			<MultiSelect
				value={value}
				onChange={setValue}
				options={options}
				placeholder={placeholder}
				disabled={disabled}
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <ControlledHarness initial={[]} placeholder="Pick tags" />,
};

export const FewSelected: Story = {
	render: () => <ControlledHarness initial={["remote", "senior"]} />,
};

export const ManySelected: Story = {
	render: () => <ControlledHarness initial={["remote", "onsite", "hybrid", "senior", "mid"]} />,
};

export const Disabled: Story = {
	render: () => <ControlledHarness initial={["remote"]} disabled placeholder="Pick tags" />,
};

export const Playground: Story = {
	render: () => <ControlledHarness initial={["remote", "hybrid"]} placeholder="Pick tags" />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<ControlledHarness initial={["remote", "onsite", "hybrid", "senior"]} placeholder="Pick tags" />
	),
};
