import { describe, expect, it } from "vitest";
import { buildMonthGrid, getWeekDayLabels } from "./calendarGrid";

describe("buildMonthGrid", () => {
	it("returns exactly 42 cells (6 weeks × 7 days)", () => {
		const g = buildMonthGrid(2026, 1, 0); // Feb 2026
		expect(g.cells.length).toBe(42);
		expect(g.weeks.length).toBe(6);
		for (const w of g.weeks) expect(w.length).toBe(7);
	});

	it("Feb 2026 (Sunday=Feb 1) — Sunday-first: 0 leading pad", () => {
		const g = buildMonthGrid(2026, 1, 0);
		// Feb 1, 2026 is a Sunday. With weekStart=0, leadingPad = 0.
		expect(g.cells[0]!.date.getDate()).toBe(1);
		expect(g.cells[0]!.date.getMonth()).toBe(1);
		expect(g.cells[0]!.inMonth).toBe(true);
	});

	it("Feb 2026 (Sunday=Feb 1) — Monday-first: 6 leading pad days", () => {
		const g = buildMonthGrid(2026, 1, 1);
		// weekStart=1, firstWeekday=0 (Sun). leadingPad = (0 - 1 + 7) % 7 = 6.
		expect(g.cells[0]!.inMonth).toBe(false);
		expect(g.cells[6]!.date.getDate()).toBe(1);
		expect(g.cells[6]!.inMonth).toBe(true);
	});

	it("Feb 2024 leap year produces 29 in-month cells", () => {
		const g = buildMonthGrid(2024, 1, 0);
		const inMonthCount = g.cells.filter((c) => c.inMonth).length;
		expect(inMonthCount).toBe(29);
	});

	it("Feb 2026 non-leap produces 28 in-month cells", () => {
		const g = buildMonthGrid(2026, 1, 0);
		const inMonthCount = g.cells.filter((c) => c.inMonth).length;
		expect(inMonthCount).toBe(28);
	});

	it("April 2026 (Wed=Apr 1) — Sunday-first: 3 leading pad", () => {
		const g = buildMonthGrid(2026, 3, 0);
		// Apr 1, 2026 is a Wednesday (day 3). leadingPad = 3.
		expect(g.cells[2]!.inMonth).toBe(false);
		expect(g.cells[3]!.date.getDate()).toBe(1);
		expect(g.cells[3]!.inMonth).toBe(true);
	});

	it("weekIndex cycles 0-5 across 6 rows", () => {
		const g = buildMonthGrid(2026, 1, 0);
		expect(g.cells[0]!.weekIndex).toBe(0);
		expect(g.cells[6]!.weekIndex).toBe(0);
		expect(g.cells[7]!.weekIndex).toBe(1);
		expect(g.cells[41]!.weekIndex).toBe(5);
	});

	it("42-cell invariant holds for all months of a year", () => {
		for (let m = 0; m < 12; m++) {
			const g0 = buildMonthGrid(2026, m, 0);
			const g1 = buildMonthGrid(2026, m, 1);
			expect(g0.cells.length).toBe(42);
			expect(g1.cells.length).toBe(42);
		}
	});

	it("monthStart reflects the first day of the requested month", () => {
		const g = buildMonthGrid(2026, 3, 0); // April 2026
		expect(g.monthStart.getFullYear()).toBe(2026);
		expect(g.monthStart.getMonth()).toBe(3);
		expect(g.monthStart.getDate()).toBe(1);
	});

	it("weekStart is preserved in the returned grid", () => {
		expect(buildMonthGrid(2026, 1, 0).weekStart).toBe(0);
		expect(buildMonthGrid(2026, 1, 1).weekStart).toBe(1);
	});
});

describe("getWeekDayLabels", () => {
	it("Sunday-first narrow", () => {
		expect(getWeekDayLabels(0, "narrow")).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
	});
	it("Monday-first narrow", () => {
		expect(getWeekDayLabels(1, "narrow")).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
	});
	it("Sunday-first short", () => {
		expect(getWeekDayLabels(0, "short")).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
	});
	it("Monday-first short", () => {
		expect(getWeekDayLabels(1, "short")).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
	});
	it("default format is narrow", () => {
		expect(getWeekDayLabels(0)).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
	});
});
