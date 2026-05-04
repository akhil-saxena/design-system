// Pure month-grid helpers - no React imports. Consumed by DatePicker (16-05)
// refactor and Calendar (DS-68). Lifted from DatePicker.tsx lines 113-141 in
// Phase 17 (D-17-21). Same no-dep policy as dateUtils.ts.

import { daysInMonth, startOfMonth } from "./dateUtils";

export interface DayCell {
	date: Date;
	inMonth: boolean;
	weekIndex: number; // 0-5
}

export interface MonthGrid {
	weeks: DayCell[][]; // 6 weeks × 7 days
	cells: DayCell[]; // flat 42 cells, same order
	weekStart: 0 | 1;
	monthStart: Date;
}

/**
 * Build a 6×7 month grid (42 cells) for the given year/month.
 * weekStart: 0 = Sunday-first (DatePicker default for backward compat),
 *            1 = Monday-first (Calendar default per handoff ds-calendar.jsx).
 */
export function buildMonthGrid(year: number, month: number, weekStart: 0 | 1 = 0): MonthGrid {
	const monthStart = startOfMonth(new Date(year, month, 1));
	const firstWeekday = monthStart.getDay(); // 0=Sun
	const dim = daysInMonth(monthStart);
	// Leading pad: number of cells from previous month before day 1.
	// weekStart=0 (Sun-first): leadingPad = firstWeekday (0..6)
	// weekStart=1 (Mon-first): leadingPad = (firstWeekday + 6) % 7  i.e. (firstWeekday - 1 + 7) % 7
	const leadingPad = (firstWeekday - weekStart + 7) % 7;

	const cells: DayCell[] = [];
	// Leading prev-month padding
	for (let i = leadingPad - 1; i >= 0; i--) {
		cells.push({
			date: new Date(monthStart.getFullYear(), monthStart.getMonth(), -i),
			inMonth: false,
			weekIndex: 0,
		});
	}
	// Current month
	for (let d = 1; d <= dim; d++) {
		cells.push({
			date: new Date(monthStart.getFullYear(), monthStart.getMonth(), d),
			inMonth: true,
			weekIndex: 0, // assigned below
		});
	}
	// Trailing next-month padding to 42 cells
	while (cells.length < 42) {
		const last = cells[cells.length - 1]!.date;
		cells.push({
			date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
			inMonth: false,
			weekIndex: 0,
		});
	}
	// Assign weekIndex 0-5
	for (let i = 0; i < cells.length; i++) {
		cells[i]!.weekIndex = Math.floor(i / 7);
	}
	// Chunk into weeks of 7, trimming the last week if all cells are out-of-month
	const weeks: DayCell[][] = [];
	for (let w = 0; w < 6; w++) {
		const week = cells.slice(w * 7, (w + 1) * 7);
		if (week.every((c) => !c.inMonth)) break;
		weeks.push(week);
	}
	return { weeks, cells, weekStart, monthStart };
}

const NARROW_SUN = ["S", "M", "T", "W", "T", "F", "S"];
const NARROW_MON = ["M", "T", "W", "T", "F", "S", "S"];
const SHORT_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Return 7-element array of weekday labels in the order they appear in the grid.
 * Used by Calendar's column-header row.
 */
export function getWeekDayLabels(
	weekStart: 0 | 1,
	format: "short" | "narrow" = "narrow",
): string[] {
	if (weekStart === 0) return format === "short" ? [...SHORT_SUN] : [...NARROW_SUN];
	return format === "short" ? [...SHORT_MON] : [...NARROW_MON];
}
