import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatePicker } from "../inputs/DatePicker";

/**
 * The APG date-grid contract, exercised through DatePicker because that is where
 * a consumer meets it. Calendar composes the same hook.
 */
describe("useDateGrid — calendar keyboard navigation", () => {
	const JUNE_15 = new Date(2024, 5, 15);

	function grid() {
		return screen.getByRole("grid");
	}
	function cell(iso: string) {
		return grid().querySelector<HTMLElement>(`[data-date="${iso}"]`);
	}

	it("is a single tab stop, not one per day", () => {
		// The whole point of the pattern: 42 focusable cells must expose exactly
		// one tabIndex=0, or tabbing past a calendar takes forty keystrokes.
		render(<DatePicker value={JUNE_15} onChange={() => {}} />);
		const tabbable = grid().querySelectorAll('[role="gridcell"][tabindex="0"]');
		expect(tabbable).toHaveLength(1);
		expect(tabbable[0]).toHaveAttribute("data-date", "2024-06-15");
	});

	it("moves the tab stop by a day, a week, and to the week's edges", () => {
		render(<DatePicker value={JUNE_15} onChange={() => {}} />);
		const cases: Array<[string, Record<string, unknown>, string]> = [
			["ArrowRight", {}, "2024-06-16"],
			["ArrowDown", {}, "2024-06-23"],
			["ArrowLeft", {}, "2024-06-22"],
			["ArrowUp", {}, "2024-06-15"],
			// 2024-06-15 is a Saturday, so it is already the end of its week.
			["Home", {}, "2024-06-09"],
			["End", {}, "2024-06-15"],
		];
		for (const [key, opts, expected] of cases) {
			fireEvent.keyDown(grid(), { key, ...opts });
			expect(cell(expected), `${key} should land on ${expected}`).toHaveAttribute("tabindex", "0");
			expect(document.activeElement).toBe(cell(expected));
		}
	});

	it("pages the month when navigation crosses a boundary", () => {
		// Date arithmetic rather than DOM walking is what makes this work: the
		// grid the target cell lives in does not exist until the view re-renders.
		render(<DatePicker value={new Date(2024, 5, 30)} onChange={() => {}} />);
		fireEvent.keyDown(grid(), { key: "ArrowRight" });
		expect(screen.getByText(/July/i)).toBeTruthy();
		expect(document.activeElement).toBe(cell("2024-07-01"));
	});

	it("pages by month and year with PageUp/PageDown", () => {
		render(<DatePicker value={JUNE_15} onChange={() => {}} />);
		fireEvent.keyDown(grid(), { key: "PageDown" });
		expect(document.activeElement).toBe(cell("2024-07-15"));
		fireEvent.keyDown(grid(), { key: "PageUp", shiftKey: true });
		expect(document.activeElement).toBe(cell("2023-07-15"));
	});

	it("leaves keys it does not own alone, so Enter still selects", () => {
		// A grid handler that swallowed everything would break activation and
		// trap focus — Tab, Enter and Escape must still reach their handlers.
		const picked: Date[] = [];
		render(<DatePicker value={JUNE_15} onChange={(d) => d && picked.push(d)} />);
		const target = cell("2024-06-15") as HTMLElement;
		target.focus();
		fireEvent.click(target);
		expect(picked).toHaveLength(1);
	});

	it("does not steal focus on mount", () => {
		// The tab stop exists from the first render, but focusing it there would
		// yank the page to the calendar whenever one is rendered.
		render(<DatePicker value={JUNE_15} onChange={() => {}} />);
		expect(document.activeElement).toBe(document.body);
	});
});
