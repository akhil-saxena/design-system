import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RangeSlider } from ".";
const SRC = {
	Basic: `const [v, setV] = useState(50);
return <RangeSlider value={v} onChange={setV} min={0} max={100} step={5} ariaLabel="Basic slider" />;`,
	WithLabelAndFormat: `const [v, setV] = useState(120000);
return (
  <RangeSlider
    value={v}
    onChange={setV}
    min={30000}
    max={300000}
    step={5000}
    label="Target salary"
    valueFormat={(n) => \`$\${n.toLocaleString()}\`}
  />
);`,
	FitScore: `const [v, setV] = useState(78);
return (
  <RangeSlider
    value={v}
    onChange={setV}
    min={0}
    max={100}
    step={1}
    label="Fit score"
    valueFormat={(n) => \`\${n}%\`}
  />
);`,
	Disabled: `<RangeSlider
  value={50}
  onChange={() => {}}
  min={0}
  max={100}
  disabled
  label="Locked"
  valueFormat={(n) => \`\${n}%\`}
/>`,
	AtMin: `<RangeSlider value={0} onChange={() => {}} min={0} max={100} ariaLabel="At min" />`,
	AtMax: `<RangeSlider value={100} onChange={() => {}} min={0} max={100} ariaLabel="At max" />`,
	Playground: `const [v, setV] = useState(50);
return (
  <RangeSlider value={v} onChange={setV} min={0} max={100} step={1} label="Slider" />
);`,
	DarkMode: `const [a, setA] = useState(50);
const [b, setB] = useState(120000);
const [c, setC] = useState(78);
return (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 320, width: "100%" }}>
    <RangeSlider value={a} onChange={setA} min={0} max={100} step={5} ariaLabel="Basic" />
    <RangeSlider value={b} onChange={setB} min={30000} max={300000} step={5000} label="Target salary" valueFormat={(n) => \`$\${n.toLocaleString()}\`} />
    <RangeSlider value={c} onChange={setC} min={0} max={100} label="Fit score" valueFormat={(n) => \`\${n}%\`} />
    <RangeSlider value={50} onChange={() => {}} min={0} max={100} disabled label="Locked" valueFormat={(n) => \`\${n}%\`} />
  </div>
);`,
};

const meta: Meta<typeof RangeSlider> = {
	title: "Inputs/RangeSlider",
	component: RangeSlider,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					'Single-thumb range slider wrapping a native `<input type="range">` with optional label, value format function, and disabled state.',
			},
		},
	},
	argTypes: {
		value: {
			control: "number",
			description: "Controlled numeric value of the slider thumb position.",
		},
		onChange: { control: false, description: "Called on every thumb movement with the new value." },
		min: { control: "number", description: "Minimum selectable value." },
		max: { control: "number", description: "Maximum selectable value." },
		step: { control: "number", description: "Increment between selectable values." },
		label: {
			control: "text",
			description: "Optional text label rendered above the track on the left side.",
		},
		valueFormat: {
			control: false,
			description: "Formats the current value displayed on the right side of the label row.",
		},
		disabled: {
			control: "boolean",
			description: "When true, disables the slider and grays it out.",
		},
		ariaLabel: {
			control: "text",
			description: "Accessible label for the underlying input; falls back to label.",
		},
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Basic: Story = {
	parameters: { docs: { source: { code: SRC.Basic } } },
	render: () => {
		const [v, setV] = useState(50);
		return (
			<div style={{ maxWidth: 320, width: "100%" }}>
				<RangeSlider
					value={v}
					onChange={setV}
					min={0}
					max={100}
					step={5}
					ariaLabel="Basic slider"
				/>
			</div>
		);
	},
};

export const WithLabelAndFormat: Story = {
	parameters: { docs: { source: { code: SRC.WithLabelAndFormat } } },
	render: () => {
		const [v, setV] = useState(120000);
		return (
			<div style={{ maxWidth: 320, width: "100%" }}>
				<RangeSlider
					value={v}
					onChange={setV}
					min={30000}
					max={300000}
					step={5000}
					label="Target salary"
					valueFormat={(n) => `$${n.toLocaleString()}`}
				/>
			</div>
		);
	},
};

export const FitScore: Story = {
	parameters: { docs: { source: { code: SRC.FitScore } } },
	render: () => {
		const [v, setV] = useState(78);
		return (
			<div style={{ maxWidth: 320, width: "100%" }}>
				<RangeSlider
					value={v}
					onChange={setV}
					min={0}
					max={100}
					step={1}
					label="Fit score"
					valueFormat={(n) => `${n}%`}
				/>
			</div>
		);
	},
};

export const Disabled: Story = {
	parameters: { docs: { source: { code: SRC.Disabled } } },
	render: () => (
		<div style={{ maxWidth: 320, width: "100%" }}>
			<RangeSlider
				value={50}
				onChange={() => {}}
				min={0}
				max={100}
				disabled
				label="Locked"
				valueFormat={(n) => `${n}%`}
			/>
		</div>
	),
};

export const AtMin: Story = {
	parameters: { docs: { source: { code: SRC.AtMin } } },
	render: () => (
		<div style={{ maxWidth: 320, width: "100%" }}>
			<RangeSlider value={0} onChange={() => {}} min={0} max={100} ariaLabel="At min" />
		</div>
	),
};

export const AtMax: Story = {
	parameters: { docs: { source: { code: SRC.AtMax } } },
	render: () => (
		<div style={{ maxWidth: 320, width: "100%" }}>
			<RangeSlider value={100} onChange={() => {}} min={0} max={100} ariaLabel="At max" />
		</div>
	),
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	args: { value: 50, min: 0, max: 100, step: 1, label: "Slider", disabled: false },
	argTypes: {
		value: { control: { type: "range", min: 0, max: 100, step: 1 } },
		min: { control: "number" },
		max: { control: "number" },
		step: { control: "number" },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [v, setV] = useState(args.value);
		return (
			<div style={{ maxWidth: 320, width: "100%" }}>
				<RangeSlider {...args} value={v} onChange={setV} />
			</div>
		);
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
		const [a, setA] = useState(50);
		const [b, setB] = useState(120000);
		const [c, setC] = useState(78);
		return (
			<div
				style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 320, width: "100%" }}
			>
				<RangeSlider value={a} onChange={setA} min={0} max={100} step={5} ariaLabel="Basic" />
				<RangeSlider
					value={b}
					onChange={setB}
					min={30000}
					max={300000}
					step={5000}
					label="Target salary"
					valueFormat={(n) => `$${n.toLocaleString()}`}
				/>
				<RangeSlider
					value={c}
					onChange={setC}
					min={0}
					max={100}
					label="Fit score"
					valueFormat={(n) => `${n}%`}
				/>
				<RangeSlider
					value={50}
					onChange={() => {}}
					min={0}
					max={100}
					disabled
					label="Locked"
					valueFormat={(n) => `${n}%`}
				/>
			</div>
		);
	},
};
