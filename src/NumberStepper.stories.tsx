/**
 * # Usage Audit — NumberStepper (D-87, D-151, D-210, D-211)
 *
 * Consumers (post v2.1):
 * - filters/SalaryRange — paired NumberSteppers (min/max) with prefix='$' + formatFn=(v)=>v.toLocaleString()
 * - quick-add modal/SalaryField — single NumberStepper for target salary
 * - settings/AutoArchiveDays — suffix='days' for "auto-archive after N days"
 * - kanban/MaxItemsPerColumn — basic NumberStepper with min=1, max=99
 * - analytics/PercentileSlider — variant alternative to RangeSlider for fit-score (suffix='%')
 *
 * API shape consumers expect:
 * - value (controlled) + onChange(next: number) — always controlled, no defaultValue
 * - prefix / suffix as ReactNode (typically string but can be Lucide icon)
 * - formatFn for non-trivial display (e.g., "$50,000" or "12 hrs")
 * - min / max enforce both button-disable AND on-blur clamping
 * - step (default 1) used by both buttons and ArrowUp/Down keys
 * - disabled disables both buttons + input
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NumberStepper } from "./NumberStepper";

const meta: Meta<typeof NumberStepper> = {
	title: "Atoms/NumberStepper",
	component: NumberStepper,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const Basic: Story = {
	render: () => {
		const [v, setV] = useState(5);
		return <NumberStepper value={v} onChange={setV} step={1} />;
	},
};

export const Percentage: Story = {
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
	render: () => {
		const [v, setV] = useState(14);
		return <NumberStepper value={v} onChange={setV} min={0} step={1} suffix=" days" />;
	},
};

export const Salary: Story = {
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
	render: () => <NumberStepper value={0} onChange={() => {}} min={0} max={100} step={1} />,
};

export const AtMax: Story = {
	render: () => <NumberStepper value={100} onChange={() => {}} min={0} max={100} step={1} />,
};

export const Disabled: Story = {
	render: () => <NumberStepper value={42} onChange={() => {}} disabled />,
};

export const Playground: Story = {
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
	globals: { theme: "dark" },
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
