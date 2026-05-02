import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NumberStepper } from ".";
const SRC = {
	Basic: `const [v, setV] = useState(5);
return <NumberStepper value={v} onChange={setV} step={1} />;`,
	Percentage: `const [v, setV] = useState(50);
return (
  <NumberStepper
    value={v}
    onChange={setV}
    min={0}
    max={100}
    step={5}
    formatFn={(n) => \`\${n}%\`}
  />
);`,
	Days: `const [v, setV] = useState(14);
return <NumberStepper value={v} onChange={setV} min={0} step={1} suffix=" days" />;`,
	Salary: `const [v, setV] = useState(120000);
return (
  <NumberStepper
    value={v}
    onChange={setV}
    min={0}
    step={1000}
    formatFn={(n) => \`$\${n.toLocaleString()}\`}
  />
);`,
	AtMin: "<NumberStepper value={0} onChange={() => {}} min={0} max={100} step={1} />",
	AtMax: "<NumberStepper value={100} onChange={() => {}} min={0} max={100} step={1} />",
	Disabled: "<NumberStepper value={42} onChange={() => {}} disabled />",
	Playground: `const [v, setV] = useState(10);
return <NumberStepper value={v} onChange={setV} step={1} />;`,
	DarkMode: `const [a, setA] = useState(5);
const [b, setB] = useState(50);
const [c, setC] = useState(120000);
return (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <NumberStepper value={a} onChange={setA} step={1} />
    <NumberStepper value={b} onChange={setB} min={0} max={100} step={5} formatFn={(n) => \`\${n}%\`} />
    <NumberStepper value={c} onChange={setC} step={1000} formatFn={(n) => \`$\${n.toLocaleString()}\`} />
    <NumberStepper value={42} onChange={() => {}} disabled />
  </div>
);`,
};

const meta: Meta<typeof NumberStepper> = {
	title: "Inputs/NumberStepper",
	component: NumberStepper,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Numeric input with increment/decrement buttons, optional min/max/step constraints, and a custom format function.",
			},
		},
	},
	argTypes: {
		value: { control: "number", description: "Controlled numeric value." },
		onChange: {
			control: false,
			description: "Called with the clamped next value after each change.",
		},
		min: {
			control: "number",
			description: "Minimum allowed value; decrement button disables at this boundary.",
		},
		max: {
			control: "number",
			description: "Maximum allowed value; increment button disables at this boundary.",
		},
		step: { control: "number", description: "Amount added or subtracted per button click." },
		prefix: {
			control: false,
			description: "Optional leading adornment rendered before the value.",
		},
		suffix: {
			control: false,
			description: "Optional trailing adornment rendered after the value.",
		},
		formatFn: {
			control: false,
			description: "Custom display formatter called when the input is not focused.",
		},
		disabled: { control: "boolean", description: "When true, disables all interaction." },
		ariaLabel: { control: "text", description: "Accessible label for the stepper container." },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const Basic: Story = {
	parameters: { docs: { source: { code: SRC.Basic } } },
	render: () => {
		const [v, setV] = useState(5);
		return <NumberStepper value={v} onChange={setV} step={1} />;
	},
};

export const Percentage: Story = {
	parameters: { docs: { source: { code: SRC.Percentage } } },
	render: () => {
		const [v, setV] = useState(50);
		return (
			<NumberStepper
				value={v}
				onChange={setV}
				min={0}
				max={100}
				step={5}
				formatFn={(n) => `${n}%`}
			/>
		);
	},
};

export const Days: Story = {
	parameters: { docs: { source: { code: SRC.Days } } },
	render: () => {
		const [v, setV] = useState(14);
		return <NumberStepper value={v} onChange={setV} min={0} step={1} suffix=" days" />;
	},
};

export const Salary: Story = {
	parameters: { docs: { source: { code: SRC.Salary } } },
	render: () => {
		const [v, setV] = useState(120000);
		return (
			<NumberStepper
				value={v}
				onChange={setV}
				min={0}
				step={1000}
				formatFn={(n) => `$${n.toLocaleString()}`}
			/>
		);
	},
};

export const AtMin: Story = {
	parameters: { docs: { source: { code: SRC.AtMin } } },
	render: () => <NumberStepper value={0} onChange={() => {}} min={0} max={100} step={1} />,
};

export const AtMax: Story = {
	parameters: { docs: { source: { code: SRC.AtMax } } },
	render: () => <NumberStepper value={100} onChange={() => {}} min={0} max={100} step={1} />,
};

export const Disabled: Story = {
	parameters: { docs: { source: { code: SRC.Disabled } } },
	render: () => <NumberStepper value={42} onChange={() => {}} disabled />,
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	args: { value: 10, step: 1 },
	argTypes: {
		min: { control: "number" },
		max: { control: "number" },
		step: { control: "number" },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [v, setV] = useState(args.value);
		return <NumberStepper {...args} value={v} onChange={setV} />;
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
		const [a, setA] = useState(5);
		const [b, setB] = useState(50);
		const [c, setC] = useState(120000);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
				<NumberStepper value={a} onChange={setA} step={1} />
				<NumberStepper
					value={b}
					onChange={setB}
					min={0}
					max={100}
					step={5}
					formatFn={(n) => `${n}%`}
				/>
				<NumberStepper
					value={c}
					onChange={setC}
					step={1000}
					formatFn={(n) => `$${n.toLocaleString()}`}
				/>
				<NumberStepper value={42} onChange={() => {}} disabled />
			</div>
		);
	},
};
