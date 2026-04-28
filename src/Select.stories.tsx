/**
 * # Usage Audit — Select (DS-50, DS-87, D-500, D-501)
 *
 * Consumers (post v2.1):
 * - kanban/StatusFilter — single-select with status pipeline options + dotColor
 * - applications/StatusEditor — inline status change in row/detail view
 * - settings/PreferencesForm — single-select for theme / locale / week-start
 * - filters/CompanyTier — small option lists (≤5) with searchable=false
 * - shared/SortPicker — single-select with searchable=false (4-6 opts)
 *
 * API:
 * - value: string | null (controlled)
 * - onChange: (v: string) => void
 * - options: SelectOption[] — { value, label, dotColor? }
 * - placeholder?: string (default "Select…")
 * - searchable?: boolean (default true) — toggles header search input
 * - disabled?: boolean
 * - forwards ref to trigger button; style applies to trigger
 *
 * Implementation:
 * - Composes _internals/DSDropdown (D-500) — DSPortal + anchor-ref position +
 *   useClickOutside + ArrowUp/Down/Home/End/Enter/Escape + 500ms type-ahead.
 * - ARIA per D-501: trigger role="combobox" aria-expanded aria-haspopup="listbox"
 *   aria-controls aria-activedescendant; panel <ul role="listbox"> with
 *   <li role="option" aria-selected> items. DSDropdown does NOT inject these —
 *   Select wires them so the listbox semantic stays accurate.
 * - Searchable: case-insensitive label substring filter; empty filtered set
 *   renders inline "No results" empty state. Filter resets on close.
 * - Visuals: TextInput-shaped trigger (36px height, var(--rule) border),
 *   ChevronDown rotates 180° via .is-open class. Reuses .ds-atom-dropdown
 *   panel chrome from 16-01 (no chrome duplication here).
 *
 * Visual baselines deferred to phase 16-09 cumulative capture (DS-86).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select, type SelectOption } from "./Select";

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "wishlist", label: "Wishlist", dotColor: "#9ca3af" },
	{ value: "applied", label: "Applied", dotColor: "var(--amber)" },
	{ value: "interview", label: "Interview", dotColor: "#3b82f6" },
	{ value: "offer", label: "Offer", dotColor: "#10b981" },
	{ value: "rejected", label: "Rejected", dotColor: "#ef4444" },
];

const PRIORITY_OPTIONS: SelectOption[] = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
	{ value: "urgent", label: "Urgent" },
];

function ControlledSelect({
	options = STATUS_OPTIONS,
	initialValue = null,
	placeholder,
	searchable,
	disabled,
}: {
	options?: SelectOption[];
	initialValue?: string | null;
	placeholder?: string;
	searchable?: boolean;
	disabled?: boolean;
}) {
	const [value, setValue] = useState<string | null>(initialValue);
	return (
		<div style={{ width: 240 }}>
			<Select
				value={value}
				onChange={setValue}
				options={options}
				placeholder={placeholder}
				searchable={searchable}
				disabled={disabled}
			/>
		</div>
	);
}

const meta: Meta<typeof Select> = {
	title: "Compound/Select",
	component: Select,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
	render: () => <ControlledSelect placeholder="Choose status" />,
};

export const WithDots: Story = {
	render: () => <ControlledSelect initialValue="applied" placeholder="Choose status" />,
};

export const Searchable: Story = {
	render: () => <ControlledSelect placeholder="Search status…" searchable />,
};

export const NonSearchable: Story = {
	render: () => (
		<ControlledSelect options={PRIORITY_OPTIONS} placeholder="Pick priority" searchable={false} />
	),
};

export const NoResults: Story = {
	name: "No results (search)",
	render: () => <ControlledSelect placeholder="Type 'zzz' to see empty state" />,
};

export const Disabled: Story = {
	render: () => <ControlledSelect placeholder="Disabled select" disabled />,
};

export const Playground: Story = {
	render: () => <ControlledSelect placeholder="Playground" />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => <ControlledSelect initialValue="interview" placeholder="Choose status" />,
};
