/**
 * # Usage Audit — Checkbox
 *
 * Consumers (post v2.1):
 * - kanban/CardSelectCheckbox — bulk-select checkboxes per card
 * - settings/EmailNotificationsToggle — feature flags
 * - filters/IncludeArchived — filter inclusions
 *
 * API:
 * - extends native <input type="checkbox"> attributes (Omit'd 'type')
 * - label?: string — co-rendered text node inside the wrapping <label>
 * - controlled or uncontrolled (native input semantics)
 *
 * Implementation (D-130 / D-131): native <input type="checkbox"> visually
 * hidden inside <label>, sibling-selector CSS in index.css drives :checked
 * background + Lucide <Check /> visibility.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
	title: "Atoms/Checkbox",
	component: Checkbox,
	parameters: { layout: "centered" },
	args: { label: "I agree" },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
	args: { disabled: true, defaultChecked: true },
};
export const NoLabel: Story = { args: { label: undefined } };

export const Controlled: Story = {
	render: () => {
		const [checked, setChecked] = useState(false);
		return (
			<Checkbox
				label={`Checked: ${checked}`}
				checked={checked}
				onChange={(e) => setChecked(e.target.checked)}
			/>
		);
	},
};

export const Playground: Story = {
	args: { label: "Playground", disabled: false, defaultChecked: false },
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Checkbox label="Default" />
			<Checkbox label="Checked" defaultChecked />
			<Checkbox label="Disabled" disabled />
			<Checkbox label="Disabled + Checked" disabled defaultChecked />
		</div>
	),
	globals: { theme: "dark" },
};
