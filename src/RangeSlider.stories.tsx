/**
 * # Usage Audit — RangeSlider (D-87, D-151, D-230)
 *
 * Consumers (post v2.1):
 * - filters/SalaryRange — single-thumb slider with label="Target salary" + valueFormat=currency (or paired with NumberStepper for direct entry)
 * - filters/FitScoreFilter — slider 0-100 with suffix='%' valueFormat
 * - settings/AutoArchiveDays — slider for "auto-archive after N days" (alternative to NumberStepper)
 * - search/RelevanceThreshold — fit-score gate slider on search results
 *
 * API shape consumers expect:
 * - value (controlled) + onChange(next: number, e: ChangeEvent) — always controlled
 * - min/max/step propagate to native <input type="range"> for keyboard a11y
 * - label + valueFormat together display the value alongside the label
 * - Single-thumb only; two-thumb deferred to v2.1
 * - Native input integrates with form submission (use `name` prop)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RangeSlider } from "./RangeSlider";

const meta: Meta<typeof RangeSlider> = {
	title: "Atoms/RangeSlider",
	component: RangeSlider,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Basic: Story = {
	render: () => {
		const [v, setV] = useState(50);
		return (
			<div style={{ width: 320 }}>
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
	render: () => {
		const [v, setV] = useState(120000);
		return (
			<div style={{ width: 320 }}>
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
	render: () => {
		const [v, setV] = useState(78);
		return (
			<div style={{ width: 320 }}>
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
	render: () => (
		<div style={{ width: 320 }}>
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
	render: () => (
		<div style={{ width: 320 }}>
			<RangeSlider value={0} onChange={() => {}} min={0} max={100} ariaLabel="At min" />
		</div>
	),
};

export const AtMax: Story = {
	render: () => (
		<div style={{ width: 320 }}>
			<RangeSlider value={100} onChange={() => {}} min={0} max={100} ariaLabel="At max" />
		</div>
	),
};

export const Playground: Story = {
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
			<div style={{ width: 320 }}>
				<RangeSlider {...args} value={v} onChange={setV} />
			</div>
		);
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => {
		const [a, setA] = useState(50);
		const [b, setB] = useState(120000);
		const [c, setC] = useState(78);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 18, width: 320 }}>
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
