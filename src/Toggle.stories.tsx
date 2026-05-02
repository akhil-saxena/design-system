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

const SRC = {
	Default: `<Toggle label="Email notifications" />`,
	Checked: `<Toggle label="Auto-advance stage" defaultChecked />`,
	Disabled: `<Toggle label="Disabled" disabled />`,
	DisabledChecked: `<Toggle label="Locked on" disabled defaultChecked />`,
	States: `<Toggle label="Default" />
<Toggle label="Checked" defaultChecked />
<Toggle label="Disabled" disabled />
<Toggle label="Disabled checked" disabled defaultChecked />`,
	Group: `<Toggle label="Email notifications" defaultChecked />
<Toggle label="Dark mode" />
<Toggle label="Auto-advance stage" defaultChecked />`,
	Controlled: `const [on, setOn] = useState(false);
return (
  <Toggle
    label={\`Currently: \${on ? "ON" : "OFF"}\`}
    checked={on}
    onChange={(e) => setOn(e.target.checked)}
  />
);`,
	Playground: `<Toggle label="Toggle me" defaultChecked={false} />`,
	DarkMode: `<Toggle label="Default" />
<Toggle label="Checked" defaultChecked />
<Toggle label="Disabled" disabled />
<Toggle label="Disabled checked" disabled defaultChecked />`,
};

const meta: Meta<typeof Toggle> = {
	title: "Atoms/Toggle",
	component: Toggle,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					'On/off switch implemented as a styled `<input type="checkbox">` with an optional label; fully keyboard and screen-reader accessible.',
			},
		},
	},
	argTypes: {
		label: { control: "text", description: "Visible text label rendered beside the toggle track." },
		disabled: { control: "boolean", description: "When true, disables the toggle and dims it." },
		checked: { control: "boolean", description: "Controlled checked state." },
		defaultChecked: { control: "boolean", description: "Initial checked state when uncontrolled." },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
	args: { label: "Email notifications" },
	parameters: { docs: { source: { code: SRC.Default } } },
};
export const Checked: Story = {
	args: { label: "Auto-advance stage", defaultChecked: true },
	parameters: { docs: { source: { code: SRC.Checked } } },
};
export const Disabled: Story = {
	args: { label: "Disabled", disabled: true },
	parameters: { docs: { source: { code: SRC.Disabled } } },
};
export const DisabledChecked: Story = {
	args: { label: "Locked on", disabled: true, defaultChecked: true },
	parameters: { docs: { source: { code: SRC.DisabledChecked } } },
};

export const States: Story = {
	parameters: { docs: { source: { code: SRC.States } } },
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
	parameters: { docs: { source: { code: SRC.Group } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
			<Toggle label="Email notifications" defaultChecked />
			<Toggle label="Dark mode" />
			<Toggle label="Auto-advance stage" defaultChecked />
		</div>
	),
};

export const Controlled: Story = {
	parameters: { docs: { source: { code: SRC.Controlled } } },
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
	parameters: { docs: { source: { code: SRC.Playground } } },
	argTypes: { defaultChecked: { control: "boolean" }, disabled: { control: "boolean" } },
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
		<div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
			<Toggle label="Default" />
			<Toggle label="Checked" defaultChecked />
			<Toggle label="Disabled" disabled />
			<Toggle label="Disabled checked" disabled defaultChecked />
		</div>
	),
};
