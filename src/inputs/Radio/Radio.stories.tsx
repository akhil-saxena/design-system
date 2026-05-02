import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio, RadioGroup } from ".";
const SRC = {
	Default: `// Uncontrolled - RadioGroup manages its own state
<RadioGroup name="status" defaultValue="active">
  <Radio value="new"          label="New"          />
  <Radio value="active"       label="Active"       />
  <Radio value="review"       label="Review"       />
  <Radio value="approved"     label="Approved"     />
</RadioGroup>`,

	Controlled: `// Controlled - parent owns the value
const [value, setValue] = useState("active");

<RadioGroup name="status" value={value} onChange={(next) => setValue(next)}>
  <Radio value="new"       label="New"       />
  <Radio value="active"    label="Active"    />
  <Radio value="review"    label="Review"    />
</RadioGroup>`,

	Disabled: `<RadioGroup name="status" defaultValue="new">
  <Radio value="new"       label="New"                  />
  <Radio value="active"    label="Active"    disabled   />
  <Radio value="review"    label="Review"    disabled   />
</RadioGroup>`,

	Standalone: `<Radio value="opt1" name="standalone" label="Option 1" defaultChecked />
<Radio value="opt2" name="standalone" label="Option 2" />`,

	Playground: `<RadioGroup name="options" defaultValue="b">
  <Radio value="a" label="Option A" />
  <Radio value="b" label="Option B" />
  <Radio value="c" label="Option C" />
</RadioGroup>`,

	DarkMode: `<RadioGroup name="status" defaultValue="active">
  <Radio value="new"       label="New"                />
  <Radio value="active"    label="Active (selected)"  />
  <Radio value="review"    label="Review"             />
  <Radio value="archived"  label="Archived"  disabled />
</RadioGroup>`,
};

const meta: Meta<typeof Radio> = {
	title: "Inputs/Radio",
	component: Radio,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Accessible radio button. Use inside `RadioGroup` for mutually-exclusive selection. `RadioGroup` supports both **uncontrolled** (`defaultValue`) and **controlled** (`value` + `onChange`) modes.",
			},
		},
	},
	argTypes: {
		value: { control: "text", description: "The value this radio represents." },
		label: { control: "text", description: "Visible text label beside the radio." },
		disabled: { control: "boolean", description: "Disables the radio." },
		checked: {
			control: "boolean",
			description: "Controlled checked state (standalone, without RadioGroup).",
		},
		name: { control: "text", description: "HTML name groups radios in the browser." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Uncontrolled - `RadioGroup` manages state via `defaultValue`. Click any option.",
			},
			source: { code: SRC.Default },
		},
	},
	render: () => (
		<RadioGroup name="story-default" defaultValue="active">
			<Radio value="new" label="New" />
			<Radio value="active" label="Active" />
			<Radio value="review" label="Review" />
			<Radio value="approved" label="Approved" />
		</RadioGroup>
	),
};

export const Controlled: Story = {
	parameters: {
		docs: {
			description: { story: "Controlled - parent owns state via `value` + `onChange`." },
			source: { code: SRC.Controlled },
		},
	},
	render: function ControlledStory() {
		const [v, setV] = useState("active");
		return (
			<RadioGroup name="story-controlled" value={v} onChange={(next) => setV(next)}>
				<Radio value="new" label="New" />
				<Radio value="active" label={`Active${v === "active" ? " ✓" : ""}`} />
				<Radio value="review" label="Review" />
			</RadioGroup>
		);
	},
};

export const Disabled: Story = {
	parameters: {
		docs: {
			description: {
				story: "Disabled radios cannot be selected. The non-disabled option is still interactive.",
			},
			source: { code: SRC.Disabled },
		},
	},
	render: () => (
		<RadioGroup name="story-disabled" defaultValue="new">
			<Radio value="new" label="New" />
			<Radio value="active" label="Active" disabled />
			<Radio value="review" label="Review" disabled />
		</RadioGroup>
	),
};

export const Standalone: Story = {
	parameters: {
		docs: {
			description: {
				story: "Without RadioGroup - wire `name`, `defaultChecked`, and `onChange` directly.",
			},
			source: { code: SRC.Standalone },
		},
	},
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Radio value="opt1" name="story-standalone" label="Option 1" defaultChecked />
			<Radio value="opt2" name="story-standalone" label="Option 2" />
		</div>
	),
};

export const Playground: Story = {
	parameters: {
		docs: {
			description: { story: "Click to select. Uses uncontrolled `defaultValue`." },
			source: { code: SRC.Playground },
		},
	},
	render: () => (
		<RadioGroup name="story-playground" defaultValue="b">
			<Radio value="a" label="Option A" />
			<Radio value="b" label="Option B" />
			<Radio value="c" label="Option C" />
		</RadioGroup>
	),
};

export const DarkMode: Story = {
	parameters: {
		docs: {
			description: { story: "Radio ring and amber dot on dark surface." },
			source: { code: SRC.DarkMode },
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<RadioGroup name="story-dark" defaultValue="active">
			<Radio value="new" label="New" />
			<Radio value="active" label="Active (selected)" />
			<Radio value="review" label="Review" />
			<Radio value="archived" label="Archived" disabled />
		</RadioGroup>
	),
};
