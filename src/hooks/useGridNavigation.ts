import {
	type KeyboardEvent as ReactKeyboardEvent,
	type RefObject,
	useEffect,
	useState,
} from "react";

/** Selector for something inside a cell that should take focus instead of the cell. */
const FOCUSABLE =
	"input:not([type='hidden']):not([disabled]), button:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export interface UseGridNavigationOptions {
	/** The `<table>` element. */
	tableRef: RefObject<HTMLTableElement | null>;
	/**
	 * Off by default. Only a table that actually declares `role="grid"` should
	 * claim the grid keyboard contract — a plain `role="table"` is static content
	 * and arrow keys would fight the screen reader's own reading cursor.
	 */
	enabled: boolean;
}

export interface UseGridNavigation {
	/** Spread onto the `<table>`. */
	onKeyDown: (e: ReactKeyboardEvent<HTMLTableElement>) => void;
}

/**
 * Roving-tabindex arrow-key navigation for a `role="grid"` table.
 *
 * ## Why this exists
 *
 * `Table` sets `role="grid"` whenever `multiSelectable` is on — it has to, since
 * `aria-multiselectable` is invalid on a plain `table` role. But declaring
 * `grid` also promises the grid *keyboard* contract, and Table implemented none
 * of it: the table was one tab stop per focusable cell and nothing responded to
 * an arrow key. DataGrid had the behaviour; Table, which DataGrid is built on,
 * did not.
 *
 * ## Why it reads the DOM instead of a data model
 *
 * DataGrid owns its rows and columns as arrays, so it can index them directly.
 * `Table` is compositional — the consumer supplies `Table.Row` and `Table.Cell`
 * children, and there is no array to consult. Here the rendered DOM *is* the
 * model, so cells are located by querying it. That also means a colspan, a
 * conditionally rendered column or a filtered row set needs no special handling:
 * whatever is on screen is what is navigated.
 *
 * Header and body are treated as one continuous grid, so ArrowUp from the first
 * body row lands on the column header rather than dead-ending.
 *
 * Focus goes to the first focusable control *inside* a cell when there is one —
 * a selection checkbox, a sort button — so Space and Enter reach the control the
 * user expects rather than an inert wrapper.
 */
export function useGridNavigation({
	tableRef,
	enabled,
}: UseGridNavigationOptions): UseGridNavigation {
	const [focused, setFocused] = useState<[number, number]>([0, 0]);

	function rows(): HTMLTableRowElement[] {
		const t = tableRef.current;
		if (!t) return [];
		return [...t.querySelectorAll<HTMLTableRowElement>("thead tr, tbody tr")];
	}

	function cellsIn(row: HTMLTableRowElement): HTMLTableCellElement[] {
		return [...row.querySelectorAll<HTMLTableCellElement>("th, td")];
	}

	// Roving tabindex, applied imperatively because the cells are the consumer's
	// elements — there is no props object to thread a tabIndex through. Running
	// on every render keeps it correct when rows are added, removed or sorted.
	useEffect(() => {
		if (!enabled) return;
		const all = rows();
		for (const [r, row] of all.entries()) {
			for (const [c, cell] of cellsIn(row).entries()) {
				const isStop = r === focused[0] && c === focused[1];
				// A cell containing its own control must not become a tab stop itself,
				// or Tab would land on the wrapper and then again on the control.
				const inner = cell.querySelector<HTMLElement>(FOCUSABLE);
				if (inner) {
					cell.removeAttribute("tabindex");
					inner.tabIndex = isStop ? 0 : -1;
				} else {
					cell.tabIndex = isStop ? 0 : -1;
				}
			}
		}
	});

	function focusCell(r: number, c: number) {
		const row = rows()[r];
		if (!row) return;
		const cell = cellsIn(row)[c];
		if (!cell) return;
		(cell.querySelector<HTMLElement>(FOCUSABLE) ?? cell).focus();
	}

	function onKeyDown(e: ReactKeyboardEvent<HTMLTableElement>) {
		if (!enabled) return;
		const all = rows();
		if (all.length === 0) return;

		let [r, c] = focused;
		// Clamp against the *current* grid: rows may have been removed since the
		// last keypress, which would otherwise index past the end.
		r = Math.min(r, all.length - 1);
		const colCount = cellsIn(all[r] as HTMLTableRowElement).length;
		c = Math.min(c, Math.max(0, colCount - 1));

		switch (e.key) {
			case "ArrowDown":
				r = Math.min(r + 1, all.length - 1);
				break;
			case "ArrowUp":
				r = Math.max(r - 1, 0);
				break;
			case "ArrowRight":
				c = Math.min(c + 1, colCount - 1);
				break;
			case "ArrowLeft":
				c = Math.max(c - 1, 0);
				break;
			case "Home":
				// Ctrl+Home goes to the grid's first cell, plain Home to the row's.
				if (e.ctrlKey) r = 0;
				c = 0;
				break;
			case "End":
				if (e.ctrlKey) r = all.length - 1;
				c = cellsIn(all[e.ctrlKey ? all.length - 1 : r] as HTMLTableRowElement).length - 1;
				break;
			default:
				// Everything else — Tab, Enter, Space, typing — belongs to the cell.
				return;
		}

		e.preventDefault();
		setFocused([r, c]);
		focusCell(r, c);
	}

	return { onKeyDown };
}
