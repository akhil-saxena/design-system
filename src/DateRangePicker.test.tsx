import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

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

	it("third click resets — sets new start, end:null", () => {
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
