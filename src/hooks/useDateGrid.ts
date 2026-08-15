import {
	type KeyboardEvent as ReactKeyboardEvent,
	type RefObject,
	useEffect,
	useState,
} from "react";
import { addMonths, formatYYYYMMDD, isSameDay } from "../_internals/dateUtils";

export interface UseDateGridOptions {
	/** The grid container. Cells are located inside it by their `data-date`. */
	gridRef: RefObject<HTMLElement | null>;
	/** First day of the displayed month. */
	viewMonth: Date;
	/** Called when navigation crosses out of the displayed month. */
	onViewMonthChange: (next: Date) => void;
	/**
	 * The currently selected date, if any. Used to decide which cell is the
	 * single tab stop before the user has interacted with the grid.
	 */
	selectedDate?: Date | null;
	/** Disables all key handling (e.g. while the surrounding popover is closed). */
	enabled?: boolean;
}

export interface UseDateGrid {
	/** Spread onto the `role="grid"` container. */
	onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
	/**
	 * `tabIndex` for a day cell. Exactly one cell in the grid returns 0, which is
	 * what makes the whole grid a single tab stop.
	 */
	cellTabIndex: (date: Date) => 0 | -1;
	/** `data-date` for a day cell — how the hook finds the node to focus. */
	cellDateAttr: (date: Date) => string;
}

function addDays(d: Date, n: number): Date {
	const next = new Date(d);
	next.setDate(next.getDate() + n);
	return next;
}

/**
 * Keyboard navigation for a calendar month grid, per the WAI-ARIA APG
 * date-picker-dialog pattern.
 *
 * ## The problem this solves
 *
 * Calendar and DatePicker both render every day as a focusable `<button
 * role="gridcell">`. That is operable — you can reach any date — but it makes
 * the grid *42 tab stops*. Reaching the end of a month means pressing Tab forty
 * times, and tabbing past the calendar to the next control means the same. The
 * APG grid pattern exists precisely to avoid this: a grid is one tab stop, and
 * the arrow keys move within it.
 *
 * ## The model
 *
 * A single `focusedDate` is the grid's roving tab stop; every other cell is
 * `tabIndex={-1}`. Movement is computed on **dates, not DOM nodes**, so crossing
 * a month boundary is not a special case — ArrowRight on the 31st simply yields
 * the 1st, and the view pages to follow it. A DOM-walking implementation has to
 * special-case every edge of the grid and still cannot page the month.
 *
 * Keys, matching the APG:
 *
 *   ArrowLeft/Right   ∓1 day        Home/End       start/end of week
 *   ArrowUp/Down      ∓7 days       PageUp/Down    ∓1 month (∓1 year with Shift)
 *
 * ## Why focus moves in an effect
 *
 * The target cell may not exist yet: paging to another month unmounts the whole
 * grid and renders a new one. Focusing in the handler would find nothing, so the
 * effect runs after the new cells commit. It deliberately does *not* focus on
 * first render — that would steal focus from the page on mount — which is what
 * the `moved` flag tracks.
 */
export function useDateGrid({
	gridRef,
	viewMonth,
	onViewMonthChange,
	selectedDate,
	enabled = true,
}: UseDateGridOptions): UseDateGrid {
	const [focusedDate, setFocusedDate] = useState<Date | null>(null);
	// Distinguishes "the user navigated here" from "this is where the tab stop
	// happens to be", so that mounting the grid never pulls focus.
	const [moved, setMoved] = useState(false);

	// The tab stop, in priority order: where the user last navigated, then the
	// selected date, then a date inside the view. Falling back to the 1st keeps
	// the grid reachable even when the selection is in another month.
	const tabStop = focusedDate ?? selectedDate ?? viewMonth;

	useEffect(() => {
		if (!moved || !focusedDate) return;
		const cell = gridRef.current?.querySelector<HTMLElement>(
			`[data-date="${formatYYYYMMDD(focusedDate)}"]`,
		);
		cell?.focus();
	}, [focusedDate, moved, gridRef]);

	function move(next: Date) {
		setFocusedDate(next);
		setMoved(true);
		// Page the view when navigation leaves the displayed month, so the target
		// cell exists for the focus effect to find.
		if (
			next.getMonth() !== viewMonth.getMonth() ||
			next.getFullYear() !== viewMonth.getFullYear()
		) {
			onViewMonthChange(next);
		}
	}

	function onKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
		if (!enabled) return;
		const from = focusedDate ?? tabStop;
		let next: Date | null = null;

		switch (e.key) {
			case "ArrowLeft":
				next = addDays(from, -1);
				break;
			case "ArrowRight":
				next = addDays(from, 1);
				break;
			case "ArrowUp":
				next = addDays(from, -7);
				break;
			case "ArrowDown":
				next = addDays(from, 7);
				break;
			case "Home":
				next = addDays(from, -from.getDay());
				break;
			case "End":
				next = addDays(from, 6 - from.getDay());
				break;
			case "PageUp":
				next = addMonths(from, e.shiftKey ? -12 : -1);
				break;
			case "PageDown":
				next = addMonths(from, e.shiftKey ? 12 : 1);
				break;
			default:
				return;
		}

		// Only claim the key once it is known to be one we handle, so Tab, Enter,
		// Space and Escape still reach the cell button and the surrounding dialog.
		e.preventDefault();
		e.stopPropagation();
		move(next);
	}

	return {
		onKeyDown,
		cellTabIndex: (date) => (isSameDay(date, tabStop) ? 0 : -1),
		cellDateAttr: (date) => formatYYYYMMDD(date),
	};
}
