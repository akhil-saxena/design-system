import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from ".";
// Helper: pick the in-month cell with given day text from the single calendar.
// Uses className filter to skip out-of-month padding cells (which would
// otherwise duplicate the day text).
function cellByDay(day: string): HTMLElement {
	const cells = screen.getAllByRole("gridcell");
	const target = cells.find(
		(c) => c.textContent?.trim().startsWith(day) && !c.className.includes("is-out"),
	);
	if (!target) throw new Error(`No in-month cell for day ${day}`);
	return target;
}

describe("DateRangePicker", () => {
	it("renders a single DatePicker (42 gridcells)", () => {
		render(
			<DateRangePicker value={{ start: new Date(2026, 3, 1), end: null }} onChange={() => {}} />,
		);
		const cells = screen.getAllByRole("gridcell");
		// 7×6 grid × 1 calendar = 42 (v0.5.1 single-cal redesign).
		expect(cells.length).toBe(42);
	});

	it("first click sets start, leaves end null", () => {
		const onChange = vi.fn();
		render(<DateRangePicker value={{ start: null, end: null }} onChange={onChange} />);
		const cells = screen.getAllByRole("gridcell");
		const target = cells.find((c) => !c.className.includes("is-out"));
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
		// Click cell "20" in the calendar (April 2026 view because start drives the view).
		fireEvent.click(cellByDay("20"));
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
		fireEvent.click(cellByDay("10"));
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date; end: Date };
		// New start became the earlier date; old start became end.
		expect(arg.start.getDate()).toBe(10);
		expect(arg.end.getDate()).toBe(15);
	});

	it("third click resets - sets new start, end:null", () => {
		const onChange = vi.fn();
		render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 5), end: new Date(2026, 3, 20) }}
				onChange={onChange}
			/>,
		);
		fireEvent.click(cellByDay("12"));
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as { start: Date; end: Date | null };
		expect(arg.start.getDate()).toBe(12);
		expect(arg.end).toBeNull();
	});

	it("v0.5.2 - start cell carries is-selected class when only start is set", () => {
		render(
			<DateRangePicker value={{ start: new Date(2026, 3, 10), end: null }} onChange={() => {}} />,
		);
		const startCell = cellByDay("10");
		expect(startCell.className).toContain("is-selected");
	});

	it("v0.5.2 - both start AND end cells carry is-selected class when range is complete", () => {
		const { container } = render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 10), end: new Date(2026, 3, 15) }}
				onChange={() => {}}
			/>,
		);
		const startCell = cellByDay("10");
		const endCell = cellByDay("15");
		expect(startCell.className).toContain("is-selected");
		expect(endCell.className).toContain("is-selected");
		// Exactly 2 in-month selected cells (excluding any out-of-month padding overlap).
		const selectedInMonth = Array.from(
			container.querySelectorAll(".ds-atom-datepicker-cell.is-selected"),
		).filter((c) => !c.className.includes("is-out"));
		expect(selectedInMonth.length).toBe(2);
	});

	it("v0.5.2 - 1-day range (start === end) renders as single is-selected cell", () => {
		const sameDay = new Date(2026, 3, 12);
		const { container } = render(
			<DateRangePicker value={{ start: sameDay, end: sameDay }} onChange={() => {}} />,
		);
		const cell = cellByDay("12");
		expect(cell.className).toContain("is-selected");
		const selectedInMonth = Array.from(
			container.querySelectorAll(".ds-atom-datepicker-cell.is-selected"),
		).filter((c) => !c.className.includes("is-out"));
		expect(selectedInMonth.length).toBe(1);
		// No is-in-range cells (predicate excludes endpoints).
		const inRangeCells = container.querySelectorAll(".ds-atom-datepicker-cell.is-in-range");
		expect(inRangeCells.length).toBe(0);
	});

	it("v0.5.3 - real range marks start with is-range-start and end with is-range-end", () => {
		render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 5), end: new Date(2026, 3, 10) }}
				onChange={() => {}}
			/>,
		);
		const startCell = cellByDay("5");
		const endCell = cellByDay("10");
		expect(startCell.className).toContain("is-range-start");
		expect(startCell.className).toContain("is-selected");
		expect(endCell.className).toContain("is-range-end");
		expect(endCell.className).toContain("is-selected");
		// Between cell sanity check
		const betweenCell = cellByDay("7");
		expect(betweenCell.className).toContain("is-in-range");
	});

	it("v0.5.3 - 1-day range (start === end) does NOT add is-range-start/is-range-end", () => {
		const sameDay = new Date(2026, 3, 5);
		render(<DateRangePicker value={{ start: sameDay, end: sameDay }} onChange={() => {}} />);
		const cell = cellByDay("5");
		expect(cell.className).toContain("is-selected");
		expect(cell.className).not.toContain("is-range-start");
		expect(cell.className).not.toContain("is-range-end");
	});

	it("between-state cells carry .is-in-range class", () => {
		const { container } = render(
			<DateRangePicker
				value={{ start: new Date(2026, 3, 10), end: new Date(2026, 3, 15) }}
				onChange={() => {}}
			/>,
		);
		const inRangeCells = container.querySelectorAll(".ds-atom-datepicker-cell.is-in-range");
		// Days 11, 12, 13, 14 = 4 between-state cells (single calendar).
		expect(inRangeCells.length).toBe(4);
	});
});
