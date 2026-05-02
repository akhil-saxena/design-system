import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from ".";
describe("DatePicker", () => {
	it("renders 42 cells in a 7×6 grid", () => {
		render(<DatePicker value={null} onChange={() => {}} />);
		const cells = screen.getAllByRole("gridcell");
		expect(cells.length).toBe(42);
	});

	it("clicking a cell calls onChange with that Date", () => {
		const onChange = vi.fn();
		const april = new Date(2026, 3, 15); // April 15, 2026 - value drives initial month
		render(<DatePicker value={april} onChange={onChange} />);
		// Find the in-month cell labeled "20" (April 20, 2026)
		const cells = screen.getAllByRole("gridcell");
		const target = cells.find(
			(c) => c.textContent?.trim() === "20" && !c.className.includes("is-out"),
		);
		expect(target).toBeTruthy();
		fireEvent.click(target!);
		expect(onChange).toHaveBeenCalledTimes(1);
		const arg = onChange.mock.calls[0][0] as Date;
		expect(arg.getDate()).toBe(20);
		expect(arg.getMonth()).toBe(3);
		expect(arg.getFullYear()).toBe(2026);
	});

	it("prev button retreats month and fires onMonthChange", () => {
		const onMonthChange = vi.fn();
		render(
			<DatePicker
				value={new Date(2026, 3, 15)}
				onChange={() => {}}
				onMonthChange={onMonthChange}
			/>,
		);
		fireEvent.click(screen.getByLabelText("Previous month"));
		expect(onMonthChange).toHaveBeenCalledTimes(1);
		const arg = onMonthChange.mock.calls[0][0] as Date;
		expect(arg.getMonth()).toBe(2); // March
	});

	it("next button advances month", () => {
		const onMonthChange = vi.fn();
		render(
			<DatePicker
				value={new Date(2026, 3, 15)}
				onChange={() => {}}
				onMonthChange={onMonthChange}
			/>,
		);
		fireEvent.click(screen.getByLabelText("Next month"));
		const arg = onMonthChange.mock.calls[0][0] as Date;
		expect(arg.getMonth()).toBe(4); // May
	});

	it("renders today indicator with aria-current=date", () => {
		render(<DatePicker value={null} onChange={() => {}} />);
		const todayCells = screen
			.getAllByRole("gridcell")
			.filter((c) => c.getAttribute("aria-current") === "date");
		expect(todayCells.length).toBe(1);
		expect(todayCells[0].className).toContain("is-today");
	});

	it("disablePast dims past dates with aria-disabled", () => {
		render(<DatePicker value={new Date()} onChange={() => {}} disablePast />);
		const disabledCells = screen
			.getAllByRole("gridcell")
			.filter((c) => c.getAttribute("aria-disabled") === "true");
		expect(disabledCells.length).toBeGreaterThanOrEqual(1);
	});

	it("inRange callback marks matching cells with is-in-range", () => {
		const inRange = vi.fn(
			(d: Date) => d.getMonth() === 3 && d.getDate() >= 10 && d.getDate() <= 15,
		);
		render(<DatePicker value={new Date(2026, 3, 1)} onChange={() => {}} inRange={inRange} />);
		const cells = screen.getAllByRole("gridcell");
		const inRangeCells = cells.filter((c) => c.className.includes("is-in-range"));
		expect(inRangeCells.length).toBe(6); // April 10-15
		// Predicate invoked at least once per cell (42)
		expect(inRange.mock.calls.length).toBeGreaterThanOrEqual(42);
	});

	it("defaultMonth sets initial uncontrolled month when value is null", () => {
		render(
			<DatePicker
				value={null}
				onChange={() => {}}
				defaultMonth={new Date(2026, 5, 1)} // June 2026
			/>,
		);
		expect(screen.getByText("June 2026")).toBeTruthy();
	});

	it("renders event dots for matching dates", () => {
		const { container } = render(
			<DatePicker
				value={new Date(2026, 3, 1)}
				onChange={() => {}}
				events={[new Date(2026, 3, 5), new Date(2026, 3, 12)]}
			/>,
		);
		const dots = container.querySelectorAll(".ds-atom-datepicker-event-dot");
		expect(dots.length).toBe(2);
	});

	it("isCellSelected override marks all cells where predicate returns true (v0.5.2)", () => {
		render(
			<DatePicker value={new Date(2026, 3, 1)} onChange={() => {}} isCellSelected={() => true} />,
		);
		const cells = screen.getAllByRole("gridcell");
		const selectedCells = cells.filter((c) => c.className.includes("is-selected"));
		// Predicate `() => true` → ALL 42 cells (in-month + out-of-month padding) marked selected.
		expect(selectedCells.length).toBe(42);
	});

	it("isRangeStart predicate adds is-range-start class to matching cell (v0.5.3)", () => {
		render(
			<DatePicker
				value={new Date(2026, 3, 1)}
				onChange={() => {}}
				isRangeStart={(d) => d.getMonth() === 3 && d.getDate() === 5}
			/>,
		);
		const cells = screen.getAllByRole("gridcell");
		const target = cells.find(
			(c) => c.textContent?.trim() === "5" && !c.className.includes("is-out"),
		);
		expect(target).toBeTruthy();
		expect(target!.className).toContain("is-range-start");
	});

	it("v0.5.5 - selected cell retains is-selected class after hover (state preserved)", () => {
		render(<DatePicker value={new Date(2026, 3, 15)} onChange={() => {}} />);
		const cells = screen.getAllByRole("gridcell");
		const selected = cells.find(
			(c) => c.textContent?.trim() === "15" && c.className.includes("is-selected"),
		);
		expect(selected).toBeTruthy();
		fireEvent.mouseEnter(selected!);
		// Hover must not strip the state class - the v0.5.5 explicit hover rules
		// preserve the amber pill instead of allowing the generic :hover to win.
		expect(selected!.className).toContain("is-selected");
	});

	it("v0.5.5 - in-range cell retains is-in-range class after hover (state preserved)", () => {
		const inRange = (d: Date) => d.getMonth() === 3 && d.getDate() >= 10 && d.getDate() <= 15;
		render(<DatePicker value={new Date(2026, 3, 1)} onChange={() => {}} inRange={inRange} />);
		const cells = screen.getAllByRole("gridcell");
		const inRangeCell = cells.find(
			(c) => c.textContent?.trim() === "12" && c.className.includes("is-in-range"),
		);
		expect(inRangeCell).toBeTruthy();
		fireEvent.mouseEnter(inRangeCell!);
		expect(inRangeCell!.className).toContain("is-in-range");
	});

	it("showTime renders HH (12-hour) and MM inputs + AM/PM toggle (v0.5.1)", () => {
		render(<DatePicker value={new Date(2026, 3, 15, 14, 30)} onChange={() => {}} showTime />);
		// 14:30 → 2:30 PM in 12-hour mode
		expect((screen.getByLabelText("Hours") as HTMLInputElement).value).toBe("2");
		expect((screen.getByLabelText("Minutes") as HTMLInputElement).value).toBe("30");
		// Single AM/PM toggle button - shows current period, click to flip
		const toggle = screen.getByRole("button", { name: /Currently PM/i });
		expect(toggle.textContent).toBe("PM");
		expect(toggle.getAttribute("aria-pressed")).toBe("true");
	});
});
