/**
 * # Usage Audit - DataGrid (DS-62)
 *
 * Composed component built on Table.* + three table hooks. Provides a
 * higher-level columns/rows API with per-column render overrides, a
 * bulk-action bar, and footer pagination.
 *
 * <DataGrid
 *   columns={cols}
 *   rows={rows}
 *   ariaLabel="Photos"
 *   density="cozy"
 *   selectable={false}
 *   pagination={false}
 *   onSelectionChange={(ids) => setSelected(ids)}
 * />
 *
 * Important: <Pagination> is rendered as a SIBLING of the inner Table.Root,
 * NOT inside it. <nav> inside <table> is invalid HTML.
 *
 * ## Cells
 *
 * A cell value may be a string, a number, null/undefined, or a React element.
 * Anything that is not a valid element is coerced with String(v ?? ""), which
 * is what every cell used to get unconditionally — so a <Badge> could not be
 * put in a row at all.
 *
 * For anything richer, give the column a `render`:
 *
 *   { key: "state", label: "State", width: 110, render: (v) => <Chip>{v}</Chip> }
 *
 * ## Presets, and why they are opt-in
 *
 * This component used to switch on the column KEY: a column named exactly
 * `status` was routed through a job-application badge lookup, and one named
 * exactly `priority` through a red/amber/green dot. That is action-at-a-
 * distance on a string — a consumer's `status` column silently became a
 * job-domain badge, and every value outside the four job states collapsed to
 * tone="neutral" (G-5). The two mappings are kept, as presets a column points
 * at deliberately:
 *
 *   { key: "status",   …, render: dataGridPresets.statusBadge }
 *   { key: "priority", …, render: dataGridPresets.priorityDot }
 *
 * They are ordinary `render` functions, so they work under any column key, and
 * a column that does not ask for one renders its value as text.
 *
 *   statusBadge: applied → tone="upcoming" "Applied", interviewing → "done"
 *     "Interview", offer → "passed" "Offer", rejected → "pending" "Rejected";
 *     anything else → tone="neutral" with the raw value as the label.
 *   priorityDot: high → var(--red-vivid), medium → var(--amber-vivid),
 *     low → var(--green-vivid); anything else → var(--ink-4).
 */

import type React from "react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	forwardRef,
	isValidElement,
	useCallback,
	useRef,
	useState,
} from "react";
import { useResizableColumns } from "../../hooks/useResizableColumns";
import { useSortableTable } from "../../hooks/useSortableTable";
import { useTableSelection } from "../../hooks/useTableSelection";
import { Badge, type BadgeTone } from "../../inputs/Badge";
import { Button } from "../../inputs/Button";
import { Pagination } from "../Pagination";
import { Table, type TableRootProps } from "../Table";

// ── className helper ──────────────────────────────────────────────────────────

/** Compose a base BEM class with an optional extra className from props. */
function cls(base: string, extra?: string): string {
	return extra ? `${base} ${extra}` : base;
}

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Row-height density, derived from `Table.Root`'s own union rather than
 * restated, because DataGrid only forwards it. Restating would let the two
 * drift, and a value DataGrid accepted that Table did not would render a
 * `data-density` with no rule behind it.
 *
 * `cozy` 32px · `comfortable` 40px · `spacious` 48px, per table.css.
 */
export type DataGridDensity = NonNullable<TableRootProps["density"]>;

export interface DataGridColumn {
	key: string;
	label: string;
	width: number;
	sortable?: boolean;
	align?: "left" | "right";
	/**
	 * Render this column's cell. Receives the raw `row[key]` value and the whole
	 * row, and may return any ReactNode.
	 *
	 * Without it, the value renders as itself when it is a valid React element
	 * and as `String(value ?? "")` otherwise. `dataGridPresets` holds the two
	 * mappings this component used to apply automatically by column key.
	 */
	render?: (value: unknown, row: DataGridRow) => React.ReactNode;
}

export type DataGridRow = Record<string, unknown> & { id: string | number };

export interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
	columns: DataGridColumn[];
	rows: DataGridRow[];
	/**
	 * Row-height density, forwarded to the inner table.
	 *
	 * This was hardcoded to `"comfortable"`, and it is worth saying what that
	 * cost: `table.css` styles rows through
	 * `.ds-atom-table[data-density="comfortable"] .ds-atom-table-row`, which is
	 * specificity **(0,3,0)**. A consumer writing
	 * `.my-grid .ds-atom-table-row { height: 32px }` is at (0,2,0) and loses, so
	 * the row height was not merely inconvenient to change — it was unreachable.
	 *
	 * Note the height is a **minimum** on a `<tr>`: the row cannot shrink below
	 * its tallest cell's content, and the selection column's 22px checkbox label
	 * is usually what sets that floor. `selectable={false}` is the other half of
	 * reaching a 32px row.
	 *
	 * @default "comfortable"
	 */
	density?: DataGridDensity;
	/**
	 * Render the select-all header cell and a per-row checkbox.
	 *
	 * `true` preserves the original behaviour, in which the column was
	 * unconditional — `onSelectionChange` was optional but the column was not,
	 * so every grid paid for selection whether or not it used it.
	 *
	 * With `false` there is nothing to select: no checkboxes, no bulk-action
	 * bar, `onSelectionChange` is never called, and Space is left to the page.
	 *
	 * @default true
	 */
	selectable?: boolean;
	/**
	 * Accessible name for the grid.
	 *
	 * There is deliberately **no** fallback to `"Job applications"`, which is
	 * what this was hardcoded to — every grid in every product built on this
	 * library announced itself as a job-application table (F-13-1). The default
	 * is generic instead of absent because a `role="grid"` with no name at all
	 * is worse: pass a real one whenever the page has more than one grid.
	 *
	 * @default "Data grid"
	 */
	ariaLabel?: string;
	/**
	 * Render the footer pager.
	 *
	 * Independent of `page` / `totalPages` / `onPageChange` on purpose: a
	 * consumer may own its own pager and still want the callbacks wired. The
	 * footer's row count is unaffected either way.
	 *
	 * @default true
	 */
	pagination?: boolean;
	/** Current page (1-based). Optional — defaults to 1 when pagination not used. */
	page?: number;
	/** Total page count. Optional — defaults to 1. */
	totalPages?: number;
	/** Page-change callback wired to <Pagination>. */
	onPageChange?: (page: number) => void;
	/** Fires whenever the selected row IDs change. Never fires while `selectable` is false. */
	onSelectionChange?: (ids: Array<string | number>) => void;
	/**
	 * Show a loading row instead of the body while rows are being fetched. An
	 * empty grid and a grid that has not loaded look identical otherwise, so the
	 * user cannot tell "no matches" from "not yet".
	 */
	loading?: boolean;
	/** Text shown while `loading`. @default "Loading…" */
	loadingText?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; tone: BadgeTone }> = {
	applied: { label: "Applied", tone: "upcoming" },
	interviewing: { label: "Interview", tone: "done" },
	offer: { label: "Offer", tone: "passed" },
	rejected: { label: "Rejected", tone: "pending" },
};

const PRIORITY_COLOR: Record<string, string> = {
	high: "var(--red-vivid)",
	medium: "var(--amber-vivid)",
	low: "var(--green-vivid)",
};

// ── Cell rendering ────────────────────────────────────────────────────────────

/**
 * A cell value renders as itself when it is a React element, and as its string
 * coercion otherwise.
 *
 * The coercion branch is byte-identical to what every cell used to get, so
 * strings, numbers, `0`, `false`, `null` and `undefined` all render exactly as
 * before — `null`/`undefined` as the empty string, everything else as
 * `String(value)`.
 */
function renderCellValue(value: unknown): React.ReactNode {
	return isValidElement(value) ? value : String(value ?? "");
}

/**
 * The two mappings DataGrid used to apply by matching a column's key, kept as
 * presets a column opts into. See the file docstring for why the key-matching
 * had to go.
 *
 * Both take the same `(value, row)` shape as any `render`, so they can be
 * pointed at from a column of any name.
 */
export const dataGridPresets = {
	/** Job-application status → `<Badge>`. Unknown values keep their own label at tone="neutral". */
	statusBadge: (value: unknown): React.ReactNode => {
		const entry = STATUS_BADGE[value as string];
		return <Badge tone={entry?.tone ?? "neutral"}>{entry?.label ?? String(value ?? "")}</Badge>;
	},

	/** high/medium/low → a coloured dot beside the capitalised value. */
	priorityDot: (value: unknown): React.ReactNode => {
		const color = PRIORITY_COLOR[value as string] ?? "var(--ink-4)";
		return (
			<span
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: 6,
				}}
			>
				<span
					data-part="priority-dot"
					style={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: color,
						flexShrink: 0,
						display: "inline-block",
					}}
					aria-hidden="true"
				/>
				<span
					style={{
						fontSize: 12,
						textTransform: "capitalize",
					}}
				>
					{String(value ?? "")}
				</span>
			</span>
		);
	},
};

// ── Component ─────────────────────────────────────────────────────────────────

export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(function DataGrid(
	{
		columns,
		rows,
		loading = false,
		loadingText = "Loading…",
		density = "comfortable",
		selectable = true,
		ariaLabel = "Data grid",
		pagination = true,
		page = 1,
		totalPages = 1,
		onPageChange,
		onSelectionChange,
		className,
		onKeyDown,
		...rest
	},
	ref,
) {
	// 1. Hooks
	const rowIds = rows.map((r) => r.id);
	const { sorted, sortCol, sortDir, toggleSort } = useSortableTable<DataGridRow>(rows);
	const initialWidths = Object.fromEntries(columns.map((c) => [c.key, c.width]));
	const { widths, startResize } = useResizableColumns(initialWidths, { minWidth: 60 });
	const { selectedIds, isAllSelected, isIndeterminate, isSelected, toggle, toggleAll, clear } =
		useTableSelection(rowIds, { onSelectionChange });

	// 2. Roving tabindex for arrow-key grid navigation.
	//    Row index -1 represents the sortable columnheader row; 0..N-1 are body
	//    rows. Column 0 is the checkbox column WHEN selectable; data columns are
	//    offset by `selCols` so that turning selection off shifts the whole model
	//    left by one rather than leaving every arrow key one column out.
	const HEADER_ROW = -1;
	const selCols = selectable ? 1 : 0;
	const [focusedCell, setFocusedCell] = useState<[number, number]>([HEADER_ROW, selCols]);
	const tableRef = useRef<HTMLTableElement>(null);

	// Focus the inner interactive control of a cell (selection checkbox, sortable
	// header button) so Space/Enter reach it; fall back to the cell wrapper when
	// the cell has no inner control (plain data cells, columnheader <th> which is
	// itself interactive via role="columnheader").
	const focusCell = useCallback((r: number, c: number) => {
		const table = tableRef.current;
		if (!table) return;
		let cell: HTMLElement | null | undefined;
		if (r === HEADER_ROW) {
			const headerRow = table.querySelector<HTMLElement>("thead tr");
			cell = headerRow?.querySelectorAll<HTMLElement>("th")?.[c];
		} else {
			const trs = table.querySelectorAll<HTMLElement>("tbody tr");
			cell = trs?.[r]?.querySelectorAll<HTMLElement>("td")?.[c];
		}
		if (!cell) return;
		// Delegate to the first focusable inner control when present.
		const inner = cell.querySelector<HTMLElement>(
			"input:not([type='hidden']), button, a[href], select, textarea, [tabindex]:not([tabindex='-1'])",
		);
		(inner ?? cell).focus();
	}, []);

	const handleGridKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLDivElement>) => {
			onKeyDown?.(e);
			if (e.defaultPrevented) return;

			const totalRows = sorted.length;
			const totalCols = columns.length + selCols;
			let [r, c] = focusedCell;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				// Header row (-1) → first body row (0) → … → last body row.
				r = Math.min(r + 1, totalRows - 1);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				// Allow stepping up into the header row (-1).
				r = Math.max(r - 1, HEADER_ROW);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				c = Math.min(c + 1, totalCols - 1);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				c = Math.max(c - 1, 0);
			} else if (e.key === " ") {
				// Space toggles row selection. With no selection column there is
				// nothing to toggle, so the key is left to the page — swallowing it
				// would break Space-to-scroll on a grid that cannot be selected.
				if (!selectable) return;
				// Determine row index from event target if possible, falling back to
				// the focused cell row. Header row (-1) is not selectable.
				e.preventDefault();
				const target = e.target as HTMLElement;
				const tr = target.closest("tr");
				let rowIdx = r;
				if (tr) {
					const tbody = tr.parentElement;
					if (tbody?.tagName === "TBODY") {
						const idx = Array.from(tbody.children).indexOf(tr);
						if (idx >= 0) rowIdx = idx;
					}
				}
				const row = rowIdx >= 0 ? sorted[rowIdx] : undefined;
				if (row) toggle(row.id);
				return;
			} else {
				return;
			}

			// Clamp in case `selectable` changed after mount: the stored column can
			// otherwise point one past the last cell.
			c = Math.min(Math.max(c, 0), totalCols - 1);
			setFocusedCell([r, c]);
			focusCell(r, c);
		},
		[focusedCell, sorted, columns.length, selCols, selectable, toggle, onKeyDown, focusCell],
	);

	const selectionCount = selectable ? selectedIds.length : 0;

	// 3. Render
	return (
		<div
			ref={ref}
			className={cls("ds-atom-datagrid glass", className)}
			onKeyDown={handleGridKeyDown}
			{...rest}
		>
			{/* Bulk-action bar — only when rows are selected */}
			{selectionCount > 0 && (
				<div className="ds-atom-datagrid-bulkbar">
					<span className="ds-atom-datagrid-bulkbar-count">{selectionCount} selected</span>
					<Button variant="secondary" size="xs">
						Export
					</Button>
					<Button variant="danger" size="xs">
						Archive
					</Button>
					<Button variant="ghost" size="xs" style={{ marginLeft: "auto" }} onClick={clear}>
						Clear
					</Button>
				</div>
			)}

			{/* Scrollable table */}
			<div className="ds-atom-datagrid-scroll">
				<Table.Root
					ref={tableRef}
					// biome-ignore lint/a11y/useSemanticElements: role="grid" is intentional — DataGrid implements WAI-ARIA grid pattern requiring arrow key navigation
					role="grid"
					multiSelectable
					ariaLabel={ariaLabel}
					density={density}
					style={{ tableLayout: "fixed", width: "100%" }}
				>
					<Table.Header>
						<Table.Row>
							{selectable ? (
								<Table.SelectAllCell
									isAllSelected={isAllSelected}
									isIndeterminate={isIndeterminate}
									onToggleAll={toggleAll}
									tabIndex={focusedCell[0] === HEADER_ROW && focusedCell[1] === 0 ? 0 : -1}
								/>
							) : null}
							{columns.map((col, colIdx) => {
								// Sortable header cells are interactive (role="columnheader"
								// carries its own tabIndex inside Table.HeaderCell); join them to
								// the roving model so the header row participates in arrow nav.
								const headerTabIndex =
									focusedCell[0] === HEADER_ROW && focusedCell[1] === colIdx + selCols ? 0 : -1;
								return (
									<Table.HeaderCell
										key={col.key}
										sortable={col.sortable}
										sortDir={sortCol === col.key ? sortDir : null}
										onToggleSort={() => col.sortable && toggleSort(col.key as keyof DataGridRow)}
										resizable
										width={widths[col.key]}
										onResizeStart={(e) => startResize(col.key, e)}
										style={{ textAlign: col.align ?? "left" }}
										tabIndex={col.sortable ? headerTabIndex : undefined}
									>
										{col.label}
									</Table.HeaderCell>
								);
							})}
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{loading ? (
							<Table.Row>
								{/* aria-live so the transition out of loading is announced; the
								    cell spans every visible column, selection column included
								    when there is one. */}
								<Table.Cell colSpan={columns.length + selCols} aria-live="polite">
									{loadingText}
								</Table.Cell>
							</Table.Row>
						) : null}
						{loading
							? null
							: sorted.map((row, rowIdx) => (
									<Table.Row key={String(row.id)} selected={isSelected(row.id)}>
										{selectable ? (
											<Table.SelectCell
												selected={isSelected(row.id)}
												onToggle={() => toggle(row.id)}
												tabIndex={focusedCell[0] === rowIdx && focusedCell[1] === 0 ? 0 : -1}
											/>
										) : null}
										{columns.map((col, colIdx) => {
											const cellTabIndex =
												focusedCell[0] === rowIdx && focusedCell[1] === colIdx + selCols ? 0 : -1;
											const value = row[col.key];
											return (
												<Table.Cell
													key={col.key}
													tabIndex={cellTabIndex}
													style={{ textAlign: col.align ?? "left" }}
												>
													{col.render ? col.render(value, row) : renderCellValue(value)}
												</Table.Cell>
											);
										})}
									</Table.Row>
								))}
					</Table.Body>
				</Table.Root>
			</div>

			{/* Footer — sibling of scroll div, NOT inside Table.Root */}
			<div className="ds-atom-datagrid-footer">
				<span className="ds-atom-datagrid-footer-count">{rows.length} rows</span>
				{pagination ? (
					<Pagination
						totalPages={totalPages}
						currentPage={page}
						onPageChange={onPageChange ?? (() => {})}
						variant="full"
						ariaLabel="DataGrid pagination"
					/>
				) : null}
			</div>
		</div>
	);
});
