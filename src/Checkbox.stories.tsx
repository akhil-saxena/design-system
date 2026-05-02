import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const SRC = {
	Default: `<Checkbox label="I agree" />`,
	Checked: `<Checkbox label="I agree" defaultChecked />`,
	Disabled: `<Checkbox label="I agree" disabled />`,
	DisabledChecked: `<Checkbox label="I agree" disabled defaultChecked />`,
	NoLabel: "<Checkbox />",
	Controlled: `const [checked, setChecked] = useState(false);
return (
  <Checkbox
    label={\`Checked: \${checked}\`}
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
  />
);`,
	Playground: `<Checkbox label="Playground" disabled={false} defaultChecked={false} />`,
	DarkMode: `<Checkbox label="Default" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Disabled + Checked" disabled defaultChecked />`,
};

const meta: Meta<typeof Checkbox> = {
	title: "Atoms/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					'Accessible checkbox with label, indeterminate state support, and error styling; wraps a native `<input type="checkbox">`.',
			},
		},
	},
	args: { label: "I agree" },
	argTypes: {
		label: { control: "text", description: "Visible text label rendered beside the checkbox." },
		disabled: { control: "boolean", description: "When true, disables the checkbox and dims it." },
		indeterminate: {
			control: "boolean",
			description: "Sets the native DOM indeterminate property (tri-state).",
		},
		checked: { control: "boolean", description: "Controlled checked state." },
		defaultChecked: { control: "boolean", description: "Initial checked state when uncontrolled." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
};
export const Checked: Story = {
	args: { defaultChecked: true },
	parameters: { docs: { source: { code: SRC.Checked } } },
};
export const Disabled: Story = {
	args: { disabled: true },
	parameters: { docs: { source: { code: SRC.Disabled } } },
};
export const DisabledChecked: Story = {
	args: { disabled: true, defaultChecked: true },
	parameters: { docs: { source: { code: SRC.DisabledChecked } } },
};
export const NoLabel: Story = {
	args: { label: undefined },
	parameters: { docs: { source: { code: SRC.NoLabel } } },
};

export const Controlled: Story = {
	parameters: { docs: { source: { code: SRC.Controlled } } },
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

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Checkbox label="Default" />
			<Checkbox label="Checked" defaultChecked />
			<Checkbox label="Disabled" disabled />
			<Checkbox label="Disabled + Checked" disabled defaultChecked />
		</div>
	),
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
};
