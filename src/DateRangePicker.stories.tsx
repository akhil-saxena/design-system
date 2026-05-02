import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";

const SRC = {
	Default: `const [value, setValue] = useState({
  start: new Date(2026, 3, 10),
  end: new Date(2026, 3, 22),
});
return <DateRangePicker value={value} onChange={setValue} />;`,
	DisablePast: `const [value, setValue] = useState({ start: null, end: null });
return <DateRangePicker value={value} onChange={setValue} disablePast />;`,
	Playground: `const [value, setValue] = useState({ start: null, end: null });
return <DateRangePicker value={value} onChange={setValue} />;`,
	DarkMode: `const [value, setValue] = useState({
  start: new Date(2026, 3, 10),
  end: new Date(2026, 3, 22),
});
return <DateRangePicker value={value} onChange={setValue} />;`,
};

const meta: Meta<typeof DateRangePicker> = {
	title: "Pickers/DateRangePicker",
	component: DateRangePicker,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Date-range picker with a single calendar and a click-twice flow: first click sets the start date, second click sets the end date.",
			},
		},
	},
	argTypes: {
		value: {
			control: false,
			description: "Controlled range with start and end dates (either may be null while picking).",
		},
		onChange: {
			control: false,
			description: "Called on every click with the updated { start, end } range object.",
		},
		disablePast: {
			control: "boolean",
			description: "When true, all dates before today are disabled.",
		},
		disableFuture: {
			control: "boolean",
			description: "When true, all dates after today are disabled.",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: new Date(2026, 3, 10),
			end: new Date(2026, 3, 22),
		});
		return (
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Date range
				</div>
				<DateRangePicker value={value} onChange={setValue} />
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 11,
						color: "var(--ink-3)",
						marginTop: 12,
					}}
				>
					{value.start ? value.start.toDateString() : "(none)"} →{" "}
					{value.end ? value.end.toDateString() : "(none)"}
				</div>
			</div>
		);
	},
};

export const DisablePast: Story = {
	parameters: { docs: { source: { code: SRC.DisablePast } } },
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: null,
			end: null,
		});
		return <DateRangePicker value={value} onChange={setValue} disablePast />;
	},
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: null,
			end: null,
		});
		return (
			<div style={{ display: "grid", gap: 16 }}>
				<DateRangePicker value={value} onChange={setValue} />
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					Click to set start. Click again to set end (auto-swaps if before start). Third click
					resets.
				</div>
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					start: {value.start ? value.start.toDateString() : "(none)"}
					<br />
					end: {value.end ? value.end.toDateString() : "(none)"}
				</div>
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
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: new Date(2026, 3, 10),
			end: new Date(2026, 3, 22),
		});
		return (
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Date range (dark)
				</div>
				<DateRangePicker value={value} onChange={setValue} />
			</div>
		);
	},
};
