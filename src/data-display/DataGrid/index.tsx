/**
 * # Usage Audit - DataGrid (DS-62)
 *
 * Composed component built on Table.* + three table hooks. Provides a
 * higher-level columns/rows API with status badge rendering, priority dots,
 * bulk-action bar, and footer pagination.
 *
 * <DataGrid
 *   columns={cols}
 *   rows={rows}
 *   page={page}
 *   totalPages={n}
 *   onPageChange={setPage}
 *   onSelectionChange={(ids) => setSelected(ids)}
 * />
 *
 * Important: <Pagination> is rendered as a SIBLING of the inner Table.Root,
 * NOT inside it. <nav> inside <table> is invalid HTML.
 *
 * Status mapping:
 *   applied      → Badge tone="upcoming" label="Applied"
 *   interviewing → Badge tone="done"     label="Interview"
 *   offer        → Badge tone="passed"   label="Offer"
 *   rejected     → Badge tone="pending"  label="Rejected"
 *
 * Priority mapping:
 *   high   → red dot   (var(--red-vivid))
 *   medium → amber dot (var(--amber-vivid))
 *   low    → green dot (var(--green-vivid))
 */

import type React from "react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	forwardRef,
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
import { Table } from "../Table";

// ── className helper ──────────────────────────────────────────────────────────

/** Compose a base BEM class with an optional extra className from props. */
function cls(base: string, extra?: string): string {
	return extra ? `${base} ${extra}` : base;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DataGridColumn {
	key: string;
	label: string;
	width: number;
	sortable?: boolean;
	align?: "left" | "right";
}

export type DataGridRow = Record<string, unknown> & { id: string | number };

export interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
	columns: DataGridColumn[];
	rows: DataGridRow[];
	/** Current page (1-based). Optional — defaults to 1 when pagination not used. */
	page?: number;
	/** Total page count. Optional — defaults to 1. */
	totalPages?: number;
	/** Page-change callback wired to <Pagination>. */
	onPageChange?: (page: number) => void;
	/** Fires whenever the selected row IDs change. */
	onSelectionChange?: (ids: Array<string | number>) => void;
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

// ── Component ─────────────────────────────────────────────────────────────────

export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(function DataGrid(
	{
		columns,
		rows,
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

	// 2. Roving tabindex for arrow-key grid navigation
	const [focusedCell, setFocusedCell] = useState<[number, number]>([0, 1]);
	const tableRef = useRef<HTMLTableElement>(null);

	const handleGridKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLDivElement>) => {
			onKeyDown?.(e);
			if (e.defaultPrevented) return;

			const totalRows = sorted.length;
			const totalCols = columns.length + 1; // +1 for checkbox column
			let [r, c] = focusedCell;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				r = Math.min(r + 1, totalRows - 1);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				r = Math.max(r - 1, 0);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				c = Math.min(c + 1, totalCols - 1);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				c = Math.max(c - 1, 0);
			} else if (e.key === " ") {
				// Space toggles row selection. Determine row index from event target if possible,
				// falling back to the focused cell row.
				e.preventDefault();
				const target = e.target as HTMLElement;
				const tr = target.closest("tr");
				let rowIdx = r;
				if (tr) {
					const tbody = tr.parentElement;
					if (tbody) {
						const idx = Array.from(tbody.children).indexOf(tr);
						if (idx >= 0) rowIdx = idx;
					}
				}
				const row = sorted[rowIdx];
				if (row) toggle(row.id);
				return;
			} else {
				return;
			}

			setFocusedCell([r, c]);
			const trs = tableRef.current?.querySelectorAll<HTMLElement>("tbody tr");
			trs?.[r]?.querySelectorAll<HTMLElement>("td")?.[c]?.focus();
		},
		[focusedCell, sorted, columns.length, toggle, onKeyDown],
	);

	const selectionCount = selectedIds.length;

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
					ariaLabel="Job applications"
					density="comfortable"
					style={{ tableLayout: "fixed", width: "100%" }}
				>
					<Table.Header>
						<Table.Row>
							<Table.SelectAllCell
								isAllSelected={isAllSelected}
								isIndeterminate={isIndeterminate}
								onToggleAll={toggleAll}
							/>
							{columns.map((col) => (
								<Table.HeaderCell
									key={col.key}
									sortable={col.sortable}
									sortDir={sortCol === col.key ? sortDir : null}
									onToggleSort={() => col.sortable && toggleSort(col.key as keyof DataGridRow)}
									resizable
									width={widths[col.key]}
									onResizeStart={(e) => startResize(col.key, e)}
									style={{ textAlign: col.align ?? "left" }}
								>
									{col.label}
								</Table.HeaderCell>
							))}
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{sorted.map((row, rowIdx) => (
							<Table.Row key={String(row.id)} selected={isSelected(row.id)}>
								<Table.SelectCell
									selected={isSelected(row.id)}
									onToggle={() => toggle(row.id)}
									tabIndex={focusedCell[0] === rowIdx && focusedCell[1] === 0 ? 0 : -1}
								/>
								{columns.map((col, colIdx) => {
									const cellTabIndex =
										focusedCell[0] === rowIdx && focusedCell[1] === colIdx + 1 ? 0 : -1;

									if (col.key === "status") {
										const entry = STATUS_BADGE[row[col.key] as string];
										return (
											<Table.Cell key={col.key} tabIndex={cellTabIndex}>
												<Badge tone={entry?.tone ?? "neutral"}>
													{entry?.label ?? String(row[col.key])}
												</Badge>
											</Table.Cell>
										);
									}

									if (col.key === "priority") {
										const color = PRIORITY_COLOR[row[col.key] as string] ?? "var(--ink-4)";
										return (
											<Table.Cell key={col.key} tabIndex={cellTabIndex}>
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
														{String(row[col.key])}
													</span>
												</span>
											</Table.Cell>
										);
									}

									return (
										<Table.Cell
											key={col.key}
											tabIndex={cellTabIndex}
											style={{ textAlign: col.align ?? "left" }}
										>
											{String(row[col.key] ?? "")}
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
				<Pagination
					totalPages={totalPages}
					currentPage={page}
					onPageChange={onPageChange ?? (() => {})}
					variant="full"
					ariaLabel="DataGrid pagination"
				/>
			</div>
		</div>
	);
});
