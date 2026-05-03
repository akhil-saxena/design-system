import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, type CalendarEvent } from ".";
const SRC = {
	MonthDefault: `<Calendar
  selectedDate={new Date(2026, 3, 1)}
  onSelectedDateChange={() => {}}
/>`,
	MonthWithEvents: `const [selected, setSelected] = useState(new Date(2026, 3, 1));
return (
  <Calendar
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
	MonthOverflowChips: `const [selected, setSelected] = useState(new Date(2026, 3, 1));
return (
  <Calendar
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
    maxVisibleEventsPerDay={3}
  />
);`,
	MultiDayEvent: `const [selected, setSelected] = useState(new Date(2026, 3, 1));
return (
  <Calendar
    events={[
      { id: "m1", date: new Date(2026, 3, 5), endDate: new Date(2026, 3, 8), label: "Phase 1", color: "var(--purple-vivid)" },
      { id: "m2", date: new Date(2026, 3, 20), endDate: new Date(2026, 3, 22), label: "Hackathon", color: "var(--green-vivid)" },
    ]}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
	WeekView: `const [selected, setSelected] = useState(new Date(2026, 3, 6));
return (
  <Calendar
    defaultView="week"
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
	DayView: `const [selected, setSelected] = useState(new Date(2026, 3, 15));
return (
  <Calendar
    defaultView="day"
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
	AgendaSlot: `<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
  <Calendar events={events} selectedDate={selectedDate} onSelectedDateChange={() => {}} />
  <div>
    <h3>Upcoming</h3>
    <Calendar.Agenda events={events} />
  </div>
</div>`,
	SundayFirst: `<Calendar
  selectedDate={new Date(2026, 3, 1)}
  onSelectedDateChange={() => {}}
  weekStart={0}
/>`,
	DarkMode: `const [selected, setSelected] = useState(new Date(2026, 3, 1));
return (
  <Calendar
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
	Playground: `const [selected, setSelected] = useState(null);
const [view, setView] = useState("month");
return (
  <Calendar
    view={view}
    onViewChange={setView}
    events={events}
    selectedDate={selected}
    onSelectedDateChange={setSelected}
  />
);`,
};

const meta: Meta<typeof Calendar> = {
	title: "Data Display/Calendar",
	component: Calendar,
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
					"Full-featured calendar with month, week, and day views; supports event chips, multi-day events, overflow, and an optional Agenda slot.",
			},
		},
	},
	argTypes: {
		defaultView: {
			control: "select",
			options: ["month", "week", "day"],
			description: "Initial view when uncontrolled.",
		},
		view: {
			control: "select",
			options: ["month", "week", "day"],
			description: "Controlled active view; omit for uncontrolled.",
		},
		weekStart: {
			control: "select",
			options: [0, 1],
			description: "Day the week starts on: 0 = Sunday, 1 = Monday.",
		},
		maxVisibleEventsPerDay: {
			control: "number",
			description: "Maximum event chips shown per day cell before a '+N more' overflow trigger.",
		},
		ariaLabel: { control: "text", description: "Accessible label for the calendar region." },
		events: { control: false, description: "Array of events to display as chips on day cells." },
		selectedDate: {
			control: false,
			description: "Controlled selected date; highlighted in amber.",
		},
		onSelectedDateChange: { control: false },
		onViewChange: { control: false },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Calendar>;

// ─── Fixtures ─────────────────────────────────────────────────────────────

const APRIL_2026 = new Date(2026, 3, 1);

const BASE_EVENTS: CalendarEvent[] = [
	{
		id: "e1",
		date: new Date(2026, 3, 3),
		label: "Client call",
		color: "var(--blue-vivid, #1d6aff)",
	},
	{
		id: "e2",
		date: new Date(2026, 3, 7),
		label: "Planning meeting",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "e3",
		date: new Date(2026, 3, 12),
		label: "Design review",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "e4",
		date: new Date(2026, 3, 15),
		label: "Project deadline",
		color: "var(--red-vivid, #dc2626)",
	},
	{
		id: "e5",
		date: new Date(2026, 3, 18),
		label: "Team standup",
		color: "var(--amber, #f59e0b)",
	},
	{
		id: "e6",
		date: new Date(2026, 3, 22),
		label: "Sprint review",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "e7",
		date: new Date(2026, 3, 25),
		label: "Sync meeting",
		color: "var(--blue-vivid, #1d6aff)",
	},
];

const OVERFLOW_EVENTS: CalendarEvent[] = [
	...BASE_EVENTS,
	{
		id: "o1",
		date: new Date(2026, 3, 12),
		label: "Design review",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{ id: "o2", date: new Date(2026, 3, 12), label: "PM sync", color: "var(--blue-vivid, #1d6aff)" },
	{ id: "o3", date: new Date(2026, 3, 12), label: "Retro", color: "var(--amber, #f59e0b)" },
	{
		id: "o4",
		date: new Date(2026, 3, 12),
		label: "Sprint planning",
		color: "var(--green-vivid, #16a34a)",
	},
];

const MULTIDAY_EVENTS: CalendarEvent[] = [
	{
		id: "m1",
		date: new Date(2026, 3, 5),
		endDate: new Date(2026, 3, 8),
		label: "Sprint 12",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "m2",
		date: new Date(2026, 3, 20),
		endDate: new Date(2026, 3, 22),
		label: "Hackathon",
		color: "var(--green-vivid, #16a34a)",
	},
];

const WEEK_EVENTS: CalendarEvent[] = [
	{
		id: "w1",
		date: new Date(2026, 3, 6, 10, 0),
		label: "Team standup",
		color: "var(--blue-vivid, #1d6aff)",
	},
	{
		id: "w2",
		date: new Date(2026, 3, 7, 14, 0),
		label: "Design review",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "w3",
		date: new Date(2026, 3, 8, 11, 0),
		label: "Sync meeting",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "w4",
		date: new Date(2026, 3, 10, 15, 0),
		label: "Sprint review",
		color: "var(--amber, #f59e0b)",
	},
];

const DAY_EVENTS: CalendarEvent[] = [
	// All-day (midnight)
	{
		id: "d0",
		date: new Date(2026, 3, 15, 0, 0),
		label: "Project deadline",
		color: "var(--red-vivid, #dc2626)",
	},
	// Hourly
	{
		id: "d1",
		date: new Date(2026, 3, 15, 9, 0),
		label: "Morning sync",
		color: "var(--blue-vivid, #1d6aff)",
	},
	{
		id: "d2",
		date: new Date(2026, 3, 15, 11, 0),
		label: "Design review",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "d3",
		date: new Date(2026, 3, 15, 14, 0),
		label: "PM sync",
		color: "var(--green-vivid, #16a34a)",
	},
	{ id: "d4", date: new Date(2026, 3, 15, 16, 30), label: "Retro", color: "var(--amber, #f59e0b)" },
];

// ─── Stories ──────────────────────────────────────────────────────────────

export const MonthDefault: Story = {
	args: {
		selectedDate: APRIL_2026,
		onSelectedDateChange: () => {},
	},
	parameters: { docs: { source: { code: SRC.MonthDefault } } },
};

export const MonthWithEvents: Story = {
	parameters: { docs: { source: { code: SRC.MonthWithEvents } } },
	render: () => {
		const [selected, setSelected] = useState<Date>(APRIL_2026);
		return (
			<Calendar events={BASE_EVENTS} selectedDate={selected} onSelectedDateChange={setSelected} />
		);
	},
};

export const MonthOverflowChips: Story = {
	name: "Month - Overflow Chips (+N more)",
	parameters: { docs: { source: { code: SRC.MonthOverflowChips } } },
	render: () => {
		const [selected, setSelected] = useState<Date>(APRIL_2026);
		return (
			<Calendar
				events={OVERFLOW_EVENTS}
				selectedDate={selected}
				onSelectedDateChange={setSelected}
				maxVisibleEventsPerDay={3}
			/>
		);
	},
};

export const MultiDayEvent: Story = {
	name: "Month - Multi-day events",
	parameters: { docs: { source: { code: SRC.MultiDayEvent } } },
	render: () => {
		const [selected, setSelected] = useState<Date>(APRIL_2026);
		return (
			<Calendar
				events={MULTIDAY_EVENTS}
				selectedDate={selected}
				onSelectedDateChange={setSelected}
			/>
		);
	},
};

export const WeekView: Story = {
	name: "Week View",
	parameters: { docs: { source: { code: SRC.WeekView } } },
	render: () => {
		const [selected, setSelected] = useState<Date>(new Date(2026, 3, 6));
		return (
			<Calendar
				defaultView="week"
				events={WEEK_EVENTS}
				selectedDate={selected}
				onSelectedDateChange={setSelected}
			/>
		);
	},
};

export const DayView: Story = {
	name: "Day View",
	parameters: {
		docs: {
			description: {
				story:
					"Day view with a fixed-height scrollable time grid (`dayViewHeight={480}`). An amber line marks the current time - visible when viewing today.",
			},
			source: { code: SRC.DayView },
		},
	},
	render: () => {
		// Default to today so the current-time line is visible on load
		const [selected, setSelected] = useState<Date>(() => new Date());
		return (
			<Calendar
				defaultView="day"
				events={DAY_EVENTS}
				selectedDate={selected}
				onSelectedDateChange={setSelected}
				dayViewHeight={480}
			/>
		);
	},
};

export const AgendaSlot: Story = {
	name: "Calendar.Agenda slot",
	parameters: { docs: { source: { code: SRC.AgendaSlot } } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
			<Calendar events={BASE_EVENTS} selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />
			<div>
				<h3 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: 14 }}>
					Upcoming
				</h3>
				<Calendar.Agenda events={BASE_EVENTS} />
			</div>
		</div>
	),
};

export const SundayFirst: Story = {
	name: "Week Start - Sunday",
	args: {
		selectedDate: APRIL_2026,
		onSelectedDateChange: () => {},
		weekStart: 0,
	},
	parameters: { docs: { source: { code: SRC.SundayFirst } } },
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => {
		const [selected, setSelected] = useState<Date>(APRIL_2026);
		return (
			<Calendar events={BASE_EVENTS} selectedDate={selected} onSelectedDateChange={setSelected} />
		);
	},
};
