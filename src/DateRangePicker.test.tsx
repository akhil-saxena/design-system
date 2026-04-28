import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

// Helper: pick the in-month cell with given day text from the LEFT calendar
// (the first DatePicker in the wrapper). Uses className filter to skip
// out-of-month padding cells (which would otherwise duplicate the day text).
function leftCellByDay(day: string): HTMLElement {
	const cells = screen.getAllByRole("gridcell");
	// Two calendars × 42 cells = 84; first 42 belong to the left calendar.
	const leftCells = cells.slice(0, 42);
	const target = leftCells.find(
		(c) => c.textContent?.trim().startsWith(day) && !c.className.includes("is-out"),
	);
	if (!target) throw new Error(`No in-month left cell for day ${day}`);
	return target;
}

describe("DateRangePicker", () => {
	it("renders 2 DatePicker instances (84 gridcells total)", () => {
		render(
			<DateRangePicker value={{ start: new Date(2026, 3, 1), end: null }} onChange={() => {}} />,
		);
		const cells = screen.getAllByRole("gridcell");
		// 7×6 grid per calendar × 2 calendars = 84.
		expect(cells.length).toBe(84);
	});

	it("first click sets start, leaves end null", () => {
		const onChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: null, end: null }}
				onChange={onChange}
				// Force April 2026 view by seeding via a non-null start? value=null/null
				// uses `new Date()` for left month. To make day '10' deterministic we
				// instead test by relying on whatever is_in_month for the current month;
				// any in-month cell exercises the same branch.
			/>,
		);
		const cells = screen.getAllByRole("gridcell");
		const target = cells.slice(0, 42).find((c) => !c.className.includes("is-out"));
		expect(target).toBeTruthy();
		fireEvent.click(target!);
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date | null; end: Date | null };
		expect(arg.start).toBeInstanceOf(Date);
		expect(arg.end).toBeNull();
	});

	it("second click after start sets end (forward direction)", () => {
		const onChange = vi.fn();
		render(
			<DateRangePicker value={{ start: new Date(2026, 3, 10), end: null }} onChange={onChange} />,
		);
		// Click cell "20" in the left calendar (April 2026 view because start drives leftMonth init).
		fireEvent.click(leftCellByDay("20"));
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date; end: Date };
		expect(arg.start.getDate()).toBe(10);
		expect(arg.start.getMonth()).toBe(3);
		expect(arg.end.getDate()).toBe(20);
		expect(arg.end.getMonth()).toBe(3);
	});

	it("second click BEFORE start auto-swaps endpoints", () => {
		const onChange = vi.fn();
		render(
			<DateRangePicker value={{ start: new Date(2026, 3, 15), end: null }} onChange={onChange} />,
		);
		fireEvent.click(leftCellByDay("10"));
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date; end: Date };
		// New start became the earlier date; old start became end.
		expect(arg.start.getDate()).toBe(10);
		expect(arg.end.getDate()).toBe(15);
	});

	it("third click resets — sets new start, end:null", () => {
		const onChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 5), end: new Date(2026, 3, 20) }}
				onChange={onChange}
			/>,
		);
		fireEvent.click(leftCellByDay("12"));
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date; end: Date | null };
		expect(arg.start.getDate()).toBe(12);
		expect(arg.end).toBeNull();
	});

	it("between-state cells in left calendar carry .is-in-range class", () => {
		const { container } = render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 10), end: new Date(2026, 3, 15) }}
				onChange={() => {}}
			/>,
		);
		const inRangeCells = container.querySelectorAll(".ds-atom-datepicker-cell.is-in-range");
		// Days 11, 12, 13, 14 = 4 between-state cells per calendar. Both
		// calendars show April 2026 in this scenario: left calendar's
		// value=start syncs to April; right calendar's value=end (April 15)
		// also syncs to April via DatePicker's controlled value. So the
		// between-state cells appear in BOTH calendars → 4 × 2 = 8.
		expect(inRangeCells.length).toBe(8);
	});
});
