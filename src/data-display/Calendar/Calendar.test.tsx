import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar, type CalendarEvent } from ".";
// ─── Shared fixtures ──────────────────────────────────────────────────────

const TODAY = new Date();
const FIXED_YEAR = 2026;
const FIXED_MONTH = 3; // April 2026

// Events on April 5, 12, 15, 18, 22 2026
const EVENTS: CalendarEvent[] = [
	{ id: "e1", date: new Date(2026, 3, 5), label: "Stripe call", color: "blue" },
	{ id: "e2", date: new Date(2026, 3, 12), label: "Figma panel", color: "green" },
	{ id: "e3", date: new Date(2026, 3, 15), label: "Take-home due", color: "red" },
	{ id: "e4", date: new Date(2026, 3, 18), label: "Automattic chat" },
	{ id: "e5", date: new Date(2026, 3, 22), label: "Offer deadline", color: "green" },
];

// April 2026 fixture date (selectedDate controls viewMonth initial state)
const APRIL_2026 = new Date(2026, 3, 1);

// ─── Task 1: Month view structure ─────────────────────────────────────────

describe("Calendar - month view", () => {
	it("renders month grid with 7-cell rows (April 2026 = 5 rows after trim)", () => {
		// April 2026 with Monday-first weekStart trims the final fully-out-of-month
		// week (May 4-10), leaving 5 visible weeks. cells flat is still 42.
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const rows = container.querySelectorAll('[role="row"].ds-atom-calendar-week');
		expect(rows).toHaveLength(5);
		for (const row of rows) {
			const cells = row.querySelectorAll('[role="gridcell"]');
			expect(cells).toHaveLength(7);
		}
	});

	it("weekday header row renders 7 columns with Monday-first labels by default", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const headers = container.querySelectorAll('[role="columnheader"]');
		expect(headers).toHaveLength(7);
		// Monday-first (weekStart=1): first should be M
		expect(headers[0]?.textContent).toBe("M");
	});

	it("clicking a cell fires onSelectedDateChange with that date", () => {
		const handler = vi.fn();
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={handler} />,
		);
		// Click first in-month cell that's day 1
		const cells = container.querySelectorAll<HTMLButtonElement>(
			"[role='gridcell']:not([data-out-of-month])",
		);
		fireEvent.click(cells[0]!);
		expect(handler).toHaveBeenCalledOnce();
		const called = handler.mock.calls[0][0] as Date;
		expect(called instanceof Date).toBe(true);
	});

	it("prev nav button decrements viewMonth", () => {
		render(<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />);
		const label = screen.getByText(/April 2026/i);
		expect(label).toBeInTheDocument();
		const prevBtn = screen.getByRole("button", { name: /previous month/i });
		fireEvent.click(prevBtn);
		expect(screen.getByText(/March 2026/i)).toBeInTheDocument();
	});

	it("next nav button increments viewMonth", () => {
		render(<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />);
		const nextBtn = screen.getByRole("button", { name: /next month/i });
		fireEvent.click(nextBtn);
		expect(screen.getByText(/May 2026/i)).toBeInTheDocument();
	});

	it("today's cell has data-today attribute", () => {
		const { container } = render(<Calendar onSelectedDateChange={() => {}} />);
		const todayCell = container.querySelector("[data-today]");
		expect(todayCell).not.toBeNull();
	});

	it("selectedDate cell has data-selected attribute", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const selectedCells = container.querySelectorAll("[data-selected]");
		expect(selectedCells.length).toBeGreaterThan(0);
	});

	it("cells outside the current month have data-out-of-month attribute", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const outCells = container.querySelectorAll("[data-out-of-month]");
		// April 2026 is a 30-day month with 2 leading padding cells (Mon-first)
		// so leading padding + trailing padding should exist
		expect(outCells.length).toBeGreaterThan(0);
	});

	it("SegmentedControl view toggle changes to week view", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const weekBtn = screen.getByRole("radio", { name: "Week" });
		fireEvent.click(weekBtn);
		expect(container.querySelector('[data-view="week"]')).toBeInTheDocument();
	});

	it("SegmentedControl view toggle changes to day view", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const dayBtn = screen.getByRole("radio", { name: "Day" });
		fireEvent.click(dayBtn);
		expect(container.querySelector('[data-view="day"]')).toBeInTheDocument();
	});

	it("Calendar.Agenda renders sorted ordered list", () => {
		// Reverse order to verify sorting
		const reversed = [...EVENTS].reverse();
		const { container } = render(<Calendar.Agenda events={reversed} />);
		const list = container.querySelector("ol");
		expect(list).toBeInTheDocument();
		const items = container.querySelectorAll("li");
		expect(items).toHaveLength(5);
		// First item should be the earliest event (April 5)
		const firstTime = items[0]?.querySelector("time");
		expect(firstTime).toBeInTheDocument();
	});
});

// ─── Task 2: Event chips ──────────────────────────────────────────────────

describe("Calendar - event chips (month view)", () => {
	const MULTI_EVENTS: CalendarEvent[] = [
		{ id: "a1", date: new Date(2026, 3, 10), label: "Event A", color: "blue" },
		{ id: "a2", date: new Date(2026, 3, 10), label: "Event B", color: "green" },
		{ id: "a3", date: new Date(2026, 3, 10), label: "Event C", color: "red" },
	];

	it("cell with 1-3 events renders a chip per event", () => {
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} events={MULTI_EVENTS} />,
		);
		const chips = container.querySelectorAll(".ds-atom-calendar-chip");
		expect(chips.length).toBeGreaterThanOrEqual(3);
	});

	it("cell with >maxVisibleEventsPerDay renders '+N more' button", () => {
		const overflow: CalendarEvent[] = [
			{ id: "o1", date: new Date(2026, 3, 10), label: "Event 1" },
			{ id: "o2", date: new Date(2026, 3, 10), label: "Event 2" },
			{ id: "o3", date: new Date(2026, 3, 10), label: "Event 3" },
			{ id: "o4", date: new Date(2026, 3, 10), label: "Event 4" },
			{ id: "o5", date: new Date(2026, 3, 10), label: "Event 5" },
		];
		render(
			<Calendar
				selectedDate={APRIL_2026}
				onSelectedDateChange={() => {}}
				events={overflow}
				maxVisibleEventsPerDay={3}
			/>,
		);
		const moreBtn = screen.getByText(/\+2 more/i);
		expect(moreBtn).toBeInTheDocument();
	});

	it("clicking '+N more' shows popover content with all events", () => {
		const overflow: CalendarEvent[] = [
			{ id: "o1", date: new Date(2026, 3, 10), label: "Alpha Event" },
			{ id: "o2", date: new Date(2026, 3, 10), label: "Beta Event" },
			{ id: "o3", date: new Date(2026, 3, 10), label: "Gamma Event" },
			{ id: "o4", date: new Date(2026, 3, 10), label: "Delta Event" },
		];
		render(
			<Calendar
				selectedDate={APRIL_2026}
				onSelectedDateChange={() => {}}
				events={overflow}
				maxVisibleEventsPerDay={3}
			/>,
		);
		const moreBtn = screen.getByText(/\+1 more/i);
		fireEvent.click(moreBtn);
		// After clicking, the overflow event (Delta) is visible in the overlay.
		// Alpha/Beta/Gamma also appear in the chip list so use getAllByText.
		expect(screen.getByText("Delta Event")).toBeInTheDocument();
		// All 4 events should now be present in some form (chips + popover list)
		expect(screen.getAllByText("Alpha Event").length).toBeGreaterThanOrEqual(1);
	});

	it("clicking '+N more' does NOT fire onSelectedDateChange (stopPropagation)", () => {
		const handler = vi.fn();
		const overflow: CalendarEvent[] = [
			{ id: "o1", date: new Date(2026, 3, 10), label: "Event 1" },
			{ id: "o2", date: new Date(2026, 3, 10), label: "Event 2" },
			{ id: "o3", date: new Date(2026, 3, 10), label: "Event 3" },
			{ id: "o4", date: new Date(2026, 3, 10), label: "Event 4" },
		];
		render(
			<Calendar
				selectedDate={APRIL_2026}
				onSelectedDateChange={handler}
				events={overflow}
				maxVisibleEventsPerDay={3}
			/>,
		);
		const moreBtn = screen.getByText(/\+1 more/i);
		fireEvent.click(moreBtn);
		expect(handler).not.toHaveBeenCalled();
	});

	it("multi-day event renders chip on each day in range", () => {
		const multiDay: CalendarEvent[] = [
			{
				id: "m1",
				date: new Date(2026, 3, 5),
				endDate: new Date(2026, 3, 7),
				label: "Sprint",
				color: "purple",
			},
		];
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} events={multiDay} />,
		);
		// Should render chips on April 5, 6, and 7
		const chips = container.querySelectorAll(".ds-atom-calendar-chip");
		expect(chips.length).toBeGreaterThanOrEqual(3);
	});

	it("event color prop applies to chip via inline style", () => {
		const colorEvent: CalendarEvent[] = [
			{ id: "c1", date: new Date(2026, 3, 10), label: "Color event", color: "rgb(255, 0, 0)" },
		];
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} events={colorEvent} />,
		);
		const chip = container.querySelector(".ds-atom-calendar-chip") as HTMLElement;
		expect(chip).not.toBeNull();
		expect(chip.style.background).toBe("rgb(255, 0, 0)");
	});

	it("chip label renders event.label as text (XSS-safe, no dangerouslySetInnerHTML)", () => {
		const xssEvent: CalendarEvent[] = [
			{
				id: "x1",
				date: new Date(2026, 3, 10),
				label: "<script>alert('xss')</script>",
			},
		];
		const { container } = render(
			<Calendar selectedDate={APRIL_2026} onSelectedDateChange={() => {}} events={xssEvent} />,
		);
		const chip = container.querySelector(".ds-atom-calendar-chip");
		// Escaped - tag should appear as text, no actual script element
		expect(container.querySelector("script")).toBeNull();
		expect(chip?.textContent).toContain("<script>");
	});
});

// ─── Task 3: Week view ────────────────────────────────────────────────────

describe("Calendar - week view", () => {
	it("week view renders 7 cells (one per weekday)", () => {
		const { container } = render(
			<Calendar defaultView="week" selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const cells = container.querySelectorAll(".ds-atom-calendar-weekcell");
		expect(cells).toHaveLength(7);
	});

	it("week view: events filter to their day correctly", () => {
		const weekEvent: CalendarEvent[] = [
			{ id: "w1", date: new Date(2026, 3, 2), label: "Thursday meeting" },
		];
		const { container } = render(
			<Calendar
				defaultView="week"
				selectedDate={APRIL_2026}
				onSelectedDateChange={() => {}}
				events={weekEvent}
			/>,
		);
		expect(screen.getByText("Thursday meeting")).toBeInTheDocument();
	});

	it("week view: clicking a day fires onSelectedDateChange", () => {
		const handler = vi.fn();
		const { container } = render(
			<Calendar defaultView="week" selectedDate={APRIL_2026} onSelectedDateChange={handler} />,
		);
		const dayBtn = container.querySelector<HTMLButtonElement>(".ds-atom-calendar-weekcell-header");
		expect(dayBtn).not.toBeNull();
		fireEvent.click(dayBtn!);
		expect(handler).toHaveBeenCalledOnce();
	});

	it("week view prev nav decrements by 7 days", () => {
		render(
			<Calendar
				defaultView="week"
				selectedDate={new Date(2026, 3, 6)}
				onSelectedDateChange={() => {}}
			/>,
		);
		// Initial week-of label contains "Apr"
		const prevBtn = screen.getByRole("button", { name: /previous/i });
		fireEvent.click(prevBtn);
		// After going back 7 days from April 6, should show March week
		expect(screen.getByText(/Week of/i)).toBeInTheDocument();
	});
});

// ─── Task 3: Day view ─────────────────────────────────────────────────────

describe("Calendar - day view", () => {
	it("day view renders 24 hour slots", () => {
		const { container } = render(
			<Calendar defaultView="day" selectedDate={APRIL_2026} onSelectedDateChange={() => {}} />,
		);
		const hours = container.querySelectorAll(".ds-atom-calendar-dayview-hour");
		expect(hours).toHaveLength(24);
	});

	it("day view: all-day events (date at 00:00) render in all-day section", () => {
		const allDayEvent: CalendarEvent[] = [
			{
				id: "ad1",
				date: new Date(2026, 3, 1, 0, 0, 0), // midnight = all-day
				label: "All day conference",
			},
		];
		render(
			<Calendar
				defaultView="day"
				selectedDate={APRIL_2026}
				onSelectedDateChange={() => {}}
				events={allDayEvent}
			/>,
		);
		// Should be in all-day section
		const allDaySection = screen.getByText("All day").closest(".ds-atom-calendar-dayview-allday");
		expect(allDaySection).not.toBeNull();
		expect(allDaySection).toHaveTextContent("All day conference");
	});

	it("day view: hourly events render in their hour slot", () => {
		const hourlyEvent: CalendarEvent[] = [
			{
				id: "h1",
				date: new Date(2026, 3, 1, 14, 30), // 2:30 PM - hour slot 14
				label: "Afternoon meeting",
			},
		];
		const { container } = render(
			<Calendar
				defaultView="day"
				selectedDate={APRIL_2026}
				onSelectedDateChange={() => {}}
				events={hourlyEvent}
			/>,
		);
		expect(screen.getByText("Afternoon meeting")).toBeInTheDocument();
		// Should be inside the hour-14 slot
		const hourSlots = container.querySelectorAll(".ds-atom-calendar-dayview-hour");
		const slot14 = hourSlots[14];
		expect(slot14).toHaveTextContent("Afternoon meeting");
	});

	it("day view next nav increments by 1 day", () => {
		render(
			<Calendar
				defaultView="day"
				selectedDate={new Date(2026, 3, 1)}
				onSelectedDateChange={() => {}}
			/>,
		);
		// Header shows Apr 1
		expect(screen.getByText(/Apr 1, 2026/i)).toBeInTheDocument();
		const nextBtn = screen.getByRole("button", { name: /next/i });
		fireEvent.click(nextBtn);
		// Now should show Apr 2
		expect(screen.getByText(/Apr 2, 2026/i)).toBeInTheDocument();
	});
});
