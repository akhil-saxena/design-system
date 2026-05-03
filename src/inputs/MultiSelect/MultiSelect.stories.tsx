import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiSelect, type MultiSelectOption } from ".";
const SRC = {
	Default: `const [value, setValue] = useState([]);
return (
  <MultiSelect
    value={value}
    onChange={setValue}
    options={options}
    placeholder="Pick tags"
  />
);`,
	FewSelected: `const [value, setValue] = useState(["remote", "senior"]);
return (
  <MultiSelect value={value} onChange={setValue} options={options} />
);`,
	ManySelected: `const [value, setValue] = useState(["remote", "onsite", "hybrid", "senior", "mid"]);
return (
  <MultiSelect value={value} onChange={setValue} options={options} />
);`,
	Disabled: `const [value, setValue] = useState(["remote"]);
return (
  <MultiSelect
    value={value}
    onChange={setValue}
    options={options}
    placeholder="Pick tags"
    disabled
  />
);`,
	Playground: `const [value, setValue] = useState(["remote", "hybrid"]);
return (
  <MultiSelect value={value} onChange={setValue} options={options} placeholder="Pick tags" />
);`,
	DarkMode: `const [value, setValue] = useState(["remote", "onsite", "hybrid", "senior"]);
return (
  <MultiSelect value={value} onChange={setValue} options={options} placeholder="Pick tags" />
);`,
};

const tagOptions: MultiSelectOption[] = [
	{ value: "remote", label: "Remote" },
	{ value: "onsite", label: "On-site" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "senior", label: "Senior" },
	{ value: "mid", label: "Mid" },
	{ value: "junior", label: "Junior" },
];

const meta: Meta<typeof MultiSelect> = {
	title: "Inputs/MultiSelect",
	component: MultiSelect,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Multi-select dropdown with chips-in-trigger layout; supports search filtering, keyboard navigation, and a select-all option.",
			},
		},
	},
	argTypes: {
		value: { control: false, description: "Controlled array of selected option values." },
		onChange: {
			control: false,
			description: "Called with the full updated selection array after each toggle or remove.",
		},
		options: {
			control: false,
			description: "Full list of available options shown in the dropdown.",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text shown in the trigger when nothing is selected.",
		},
		disabled: {
			control: "boolean",
			description: "When true, disables the trigger and prevents interaction.",
		},
		className: { control: false },
		style: { control: false },
	},
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
		<div style={{ maxWidth: 360, width: "100%" }}>
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
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <ControlledHarness initial={[]} placeholder="Pick tags" />,
};

export const FewSelected: Story = {
	parameters: { docs: { source: { code: SRC.FewSelected } } },
	render: () => <ControlledHarness initial={["remote", "senior"]} />,
};

export const ManySelected: Story = {
	parameters: { docs: { source: { code: SRC.ManySelected } } },
	render: () => <ControlledHarness initial={["remote", "onsite", "hybrid", "senior", "mid"]} />,
};

export const Disabled: Story = {
	parameters: { docs: { source: { code: SRC.Disabled } } },
	render: () => <ControlledHarness initial={["remote"]} disabled placeholder="Pick tags" />,
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: () => <ControlledHarness initial={["remote", "hybrid"]} placeholder="Pick tags" />,
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
		<ControlledHarness initial={["remote", "onsite", "hybrid", "senior"]} placeholder="Pick tags" />
	),
};
