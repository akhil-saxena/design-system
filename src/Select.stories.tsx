import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select, type SelectOption } from "./Select";

const SRC = {
	Default: `const [value, setValue] = useState(null);
return (
  <Select
    value={value}
    onChange={setValue}
    options={STATUS_OPTIONS}
    placeholder="Choose status"
  />
);`,
	WithDots: `const [value, setValue] = useState("applied");
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Choose status" />
);`,
	Searchable: `const [value, setValue] = useState(null);
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Search status…" searchable />
);`,
	NonSearchable: `const [value, setValue] = useState(null);
return (
  <Select
    value={value}
    onChange={setValue}
    options={[
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ]}
    placeholder="Pick priority"
    searchable={false}
  />
);`,
	NoResults: `const [value, setValue] = useState(null);
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Type 'zzz' to see empty state" />
);`,
	Disabled: `const [value, setValue] = useState(null);
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Disabled select" disabled />
);`,
	Playground: `const [value, setValue] = useState(null);
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Playground" />
);`,
	DarkMode: `const [value, setValue] = useState("interview");
return (
  <Select value={value} onChange={setValue} options={STATUS_OPTIONS} placeholder="Choose status" />
);`,
};

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "new", label: "New", dotColor: "#9ca3af" },
	{ value: "active", label: "Active", dotColor: "var(--amber)" },
	{ value: "review", label: "Review", dotColor: "#3b82f6" },
	{ value: "approved", label: "Approved", dotColor: "#10b981" },
	{ value: "archived", label: "Archived", dotColor: "#ef4444" },
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
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Single-select dropdown composed on top of an internal dropdown helper; supports grouped options, search filter, and placeholder.",
			},
		},
	},
	argTypes: {
		value: {
			control: false,
			description: "Controlled selected option value; pass null for no selection.",
		},
		onChange: {
			control: false,
			description: "Called with the value string of the selected option.",
		},
		options: { control: false, description: "Full list of options rendered in the dropdown." },
		placeholder: {
			control: "text",
			description: "Placeholder text shown in the trigger when no option is selected.",
		},
		searchable: {
			control: "boolean",
			description: "When true, renders a search input at the top of the dropdown.",
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
type Story = StoryObj<typeof Select>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <ControlledSelect placeholder="Choose status" />,
};

export const WithDots: Story = {
	parameters: { docs: { source: { code: SRC.WithDots } } },
	render: () => <ControlledSelect initialValue="active" placeholder="Choose status" />,
};

export const Searchable: Story = {
	parameters: { docs: { source: { code: SRC.Searchable } } },
	render: () => <ControlledSelect placeholder="Search status…" searchable />,
};

export const NonSearchable: Story = {
	parameters: { docs: { source: { code: SRC.NonSearchable } } },
	render: () => (
		<ControlledSelect options={PRIORITY_OPTIONS} placeholder="Pick priority" searchable={false} />
	),
};

export const NoResults: Story = {
	name: "No results (search)",
	parameters: { docs: { source: { code: SRC.NoResults } } },
	render: () => <ControlledSelect placeholder="Type 'zzz' to see empty state" />,
};

export const Disabled: Story = {
	parameters: { docs: { source: { code: SRC.Disabled } } },
	render: () => <ControlledSelect placeholder="Disabled select" disabled />,
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: () => <ControlledSelect placeholder="Playground" />,
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
	render: () => <ControlledSelect initialValue="review" placeholder="Choose status" />,
};
