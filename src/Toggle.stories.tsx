/**
 * # Usage Audit — Toggle (D-87, D-151, D-200)
 *
 * Consumers (post v2.1):
 * - settings/EmailNotifications — single Toggle with "Email notifications" label
 * - settings/AutoAdvanceStage — settings page toggle row
 * - settings/DarkModeToggle — paired with theme picker (Wave 5 RadioGroup)
 * - kanban/QuickFiltersBar — "Show archived" toggle
 * - filters/RemoteOnly — toggle filter (could also be Checkbox; either works — Toggle reads as a setting, Checkbox as a filter selection)
 *
 * API shape consumers expect:
 * - checked / defaultChecked / onChange via ...rest pass-through
 * - label: optional string rendered after the track
 * - role="switch" surfaces to assistive tech as "switch" not "checkbox"
 * - Native form integration: includes `name` and `value` attributes via ...rest
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
	title: "Atoms/Toggle",
	component: Toggle,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = { args: { label: "Email notifications" } };
export const Checked: Story = { args: { label: "Auto-advance stage", defaultChecked: true } };
export const Disabled: Story = { args: { label: "Disabled", disabled: true } };
export const DisabledChecked: Story = {
	args: { label: "Locked on", disabled: true, defaultChecked: true },
};

export const States: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
			<Toggle label="Default" />
			<Toggle label="Checked" defaultChecked />
			<Toggle label="Disabled" disabled />
			<Toggle label="Disabled checked" disabled defaultChecked />
		</div>
	),
};

export const Group: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
			<Toggle label="Email notifications" defaultChecked />
			<Toggle label="Dark mode" />
			<Toggle label="Auto-advance stage" defaultChecked />
		</div>
	),
};

export const Controlled: Story = {
	render: () => {
		const [on, setOn] = useState(false);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<Toggle
					label={`Currently: ${on ? "ON" : "OFF"}`}
					checked={on}
					onChange={(e) => setOn(e.target.checked)}
				/>
			</div>
		);
	},
};

export const Playground: Story = {
	args: { label: "Toggle me", defaultChecked: false, disabled: false },
	argTypes: { defaultChecked: { control: "boolean" }, disabled: { control: "boolean" } },
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
			<Toggle label="Default" />
			<Toggle label="Checked" defaultChecked />
			<Toggle label="Disabled" disabled />
			<Toggle label="Disabled checked" disabled defaultChecked />
		</div>
	),
};
