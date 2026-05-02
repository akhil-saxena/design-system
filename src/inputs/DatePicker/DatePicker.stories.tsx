import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from ".";
const SRC = {
	Default: `const [value, setValue] = useState(new Date(2026, 3, 22));
return <DatePicker value={value} onChange={setValue} />;`,
	WithEvents: `const [value, setValue] = useState(new Date(2026, 3, 15));
const events = [
  new Date(2026, 3, 7),
  new Date(2026, 3, 14),
  new Date(2026, 3, 21),
  new Date(2026, 3, 28),
];
return <DatePicker value={value} onChange={setValue} events={events} />;`,
	DisablePast: `const [value, setValue] = useState(null);
return <DatePicker value={value} onChange={setValue} disablePast />;`,
	WithTimePicker: `const [value, setValue] = useState(new Date(2026, 3, 22, 14, 30));
return <DatePicker value={value} onChange={setValue} showTime />;`,
	Playground: `const [value, setValue] = useState(new Date(2026, 3, 22));
return (
  <DatePicker
    value={value}
    onChange={setValue}
    events={[new Date(2026, 3, 10), new Date(2026, 3, 18)]}
    disablePast
    inRange={(d) => d.getMonth() === 3 && d.getDate() >= 10 && d.getDate() <= 22}
  />
);`,
	DarkMode: `const [value, setValue] = useState(new Date(2026, 3, 22));
return (
  <DatePicker
    value={value}
    onChange={setValue}
    events={[new Date(2026, 3, 14), new Date(2026, 3, 21)]}
  />
);`,
};

const meta: Meta<typeof DatePicker> = {
	title: "Inputs/DatePicker",
	component: DatePicker,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		backgrounds: {
			default: "white",
			values: [
				{ name: "white", value: "#ffffff" },
				{ name: "light", value: "#f5f3f0" },
				{ name: "dark", value: "#1c1917" },
			],
		},
		docs: {
			description: {
				component:
					"Single-date picker with a popover calendar, optional range-highlight predicate, and controlled value via `value` + `onChange`.",
			},
		},
	},
	argTypes: {
		value: { control: false, description: "Controlled selected date; pass null for no selection." },
		onChange: { control: false, description: "Called when the user clicks a calendar day cell." },
		onMonthChange: {
			control: false,
			description: "Called when the user navigates to a different month.",
		},
		disabled: {
			control: false,
			description: "Predicate that returns true for dates that should be disabled.",
		},
		events: { control: false, description: "Array of dates that receive an event-dot indicator." },
		disablePast: {
			control: "boolean",
			description: "When true, all dates before today are disabled.",
		},
		disableFuture: {
			control: "boolean",
			description: "When true, all dates after today are disabled.",
		},
		showTime: {
			control: "boolean",
			description: "When true, renders a 12-hour time picker row below the grid.",
		},
		inRange: { control: false, description: "Predicate for cells in an in-progress date range." },
		defaultMonth: { control: false, description: "Initial month displayed when value is null." },
		isCellSelected: {
			control: false,
			description: "Override cell-selected detection; used by DateRangePicker.",
		},
		isRangeStart: { control: false, description: "Marks a cell as the start of a range." },
		isRangeEnd: { control: false, description: "Marks a cell as the end of a range." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
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
					Selected date
				</div>
				<DatePicker value={value} onChange={setValue} />
			</div>
		);
	},
};

export const WithEvents: Story = {
	parameters: { docs: { source: { code: SRC.WithEvents } } },
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 15));
		const events = [
			new Date(2026, 3, 7),
			new Date(2026, 3, 14),
			new Date(2026, 3, 21),
			new Date(2026, 3, 28),
		];
		return <DatePicker value={value} onChange={setValue} events={events} />;
	},
};

export const DisablePast: Story = {
	parameters: { docs: { source: { code: SRC.DisablePast } } },
	render: () => {
		const [value, setValue] = useState<Date | null>(null);
		return <DatePicker value={value} onChange={setValue} disablePast />;
	},
};

export const WithTimePicker: Story = {
	parameters: { docs: { source: { code: SRC.WithTimePicker } } },
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22, 14, 30));
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
					Event date &amp; time
				</div>
				<DatePicker value={value} onChange={setValue} showTime />
			</div>
		);
	},
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
		return (
			<div style={{ display: "inline-grid", gap: 16 }}>
				<DatePicker value={value} onChange={setValue} />
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					Selected: {value ? value.toDateString() : "(none)"}
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
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
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
					Selected date (dark)
				</div>
				<DatePicker
					value={value}
					onChange={setValue}
					events={[new Date(2026, 3, 14), new Date(2026, 3, 21)]}
				/>
			</div>
		);
	},
};
