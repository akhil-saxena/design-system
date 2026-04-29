/**
 * # Usage Audit — Calendar (DS-68, D-17-20..D-17-25)
 *
 * Stories demonstrate:
 * - Month view (default), week view, day view
 * - Event chips with overflow popover
 * - Multi-day events
 * - selectedDate controlled prop
 * - Calendar.Agenda consumer slot
 * - Dark mode parity
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, type CalendarEvent } from "./Calendar";

const meta: Meta<typeof Calendar> = {
	title: "Atoms/Calendar",
	component: Calendar,
	parameters: { layout: "padded" },
	argTypes: {
		defaultView: {
			control: "radio",
			options: ["month", "week", "day"],
		},
		weekStart: {
			control: "radio",
			options: [0, 1],
		},
		maxVisibleEventsPerDay: {
			control: { type: "number", min: 1, max: 10 },
		},
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
		label: "Stripe phone call",
		color: "var(--blue-vivid, #1d6aff)",
	},
	{
		id: "e2",
		date: new Date(2026, 3, 7),
		label: "Linear onsite",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "e3",
		date: new Date(2026, 3, 12),
		label: "Figma panel",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "e4",
		date: new Date(2026, 3, 15),
		label: "Take-home due",
		color: "var(--red-vivid, #dc2626)",
	},
	{
		id: "e5",
		date: new Date(2026, 3, 18),
		label: "Automattic chat",
		color: "var(--amber, #f59e0b)",
	},
	{
		id: "e6",
		date: new Date(2026, 3, 22),
		label: "Offer deadline",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "e7",
		date: new Date(2026, 3, 25),
		label: "Team lunch",
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
		label: "Mon standup",
		color: "var(--blue-vivid, #1d6aff)",
	},
	{
		id: "w2",
		date: new Date(2026, 3, 7, 14, 0),
		label: "Tue design review",
		color: "var(--purple-vivid, #7c3aed)",
	},
	{
		id: "w3",
		date: new Date(2026, 3, 8, 11, 0),
		label: "Wed sync",
		color: "var(--green-vivid, #16a34a)",
	},
	{
		id: "w4",
		date: new Date(2026, 3, 10, 15, 0),
		label: "Fri retro",
		color: "var(--amber, #f59e0b)",
	},
];

const DAY_EVENTS: CalendarEvent[] = [
	// All-day (midnight)
	{
		id: "d0",
		date: new Date(2026, 3, 15, 0, 0),
		label: "Take-home due",
		color: "var(--red-vivid, #dc2626)",
	},
	// Hourly
	{
		id: "d1",
		date: new Date(2026, 3, 15, 9, 0),
		label: "Morning standup",
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
};

export const MonthWithEvents: Story = {
	render: () => {
		const [selected, setSelected] = useState<Date>(APRIL_2026);
		return (
			<Calendar events={BASE_EVENTS} selectedDate={selected} onSelectedDateChange={setSelected} />
		);
	},
};

export const MonthOverflowChips: Story = {
	name: "Month — Overflow Chips (+N more)",
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
	name: "Month — Multi-day events",
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
	render: () => {
		const [selected, setSelected] = useState<Date>(new Date(2026, 3, 15));
		return (
			<Calendar
				defaultView="day"
				events={DAY_EVENTS}
				selectedDate={selected}
				onSelectedDateChange={setSelected}
			/>
		);
	},
};

export const AgendaSlot: Story = {
	name: "Calendar.Agenda slot",
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
	name: "Week Start — Sunday",
	args: {
		selectedDate: APRIL_2026,
		onSelectedDateChange: () => {},
		weekStart: 0,
	},
};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div className="dark" style={{ padding: 24, background: "var(--surface, #111)" }}>
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

export const Playground: Story = {
	render: () => {
		const [selected, setSelected] = useState<Date | null>(null);
		const [view, setView] = useState<"month" | "week" | "day">("month");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<Calendar
					view={view}
					onViewChange={setView}
					events={BASE_EVENTS}
					selectedDate={selected}
					onSelectedDateChange={setSelected}
				/>
				<p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
					Selected: {selected ? selected.toLocaleDateString() : "none"} | View: {view}
				</p>
			</div>
		);
	},
};
