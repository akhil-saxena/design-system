/**
 * # Usage Audit — Table (DS-61, D-17-06..D-17-12)
 *
 * Compound API:
 *   <Table.Root density="comfortable" sticky ariaLabel="Users">
 *     <Table.Header>
 *       <Table.Row>
 *         <Table.SelectAllCell isAllSelected={isAll} isIndeterminate={isIndet} onToggleAll={toggleAll} />
 *         <Table.HeaderCell
 *           sortable
 *           sortDir={sortCol === "name" ? sortDir : null}
 *           onToggleSort={() => toggleSort("name")}
 *           resizable
 *           width={widths.name}
 *           onResizeStart={(e) => startResize("name", e)}
 *         >
 *           Name
 *         </Table.HeaderCell>
 *       </Table.Row>
 *     </Table.Header>
 *     <Table.Body>
 *       {sorted.map(row => (
 *         <Table.Row key={row.id} selected={isSelected(row.id)}>
 *           <Table.SelectCell selected={isSelected(row.id)} onToggle={() => toggle(row.id)} />
 *           <Table.Cell>{row.name}</Table.Cell>
 *         </Table.Row>
 *       ))}
 *     </Table.Body>
 *   </Table.Root>
 *   <Table.Pagination page={p} pageCount={n} onPageChange={setP} />
 *
 * Helper hooks:
 *   useSortableTable — plan 17-10 (DS-61 part 1)
 *   useTableSelection / useResizableColumns — plan 17-11 (DS-61 part 2)
 *
 * Sort indicator: UTF-8 ▲/▼ at ~9px monospace per D-17-07 (not Lucide icons).
 * Sticky: Table.Root sticky prop → data-sticky="true" → CSS position:sticky on thead.
 * Density: Table.Root density prop → data-density attr → CSS row-height variants.
 */

import { type KeyboardEventHandler, type MouseEventHandler, forwardRef } from "react";
import { Button } from "../../inputs/Button";
import { Checkbox } from "../../inputs/Checkbox";
// ── className helper ──────────────────────────────────────────────────────────

/** Compose a base BEM class with an optional extra className from props. */
function cls(base: string, extra?: string): string {
	return extra ? `${base} ${extra}` : base;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TableRootProps extends React.TableHTMLAttributes<HTMLTableElement> {
	/** Row height density mode. Default: "comfortable" (40px). */
	density?: "cozy" | "comfortable" | "spacious";
	/** When true, <thead> becomes position:sticky so the header stays visible on scroll. */
	sticky?: boolean;
	/** Accessible label for the table (renders as aria-label). */
	ariaLabel?: string;
	/** When true, sets aria-multiselectable="true" for multi-row selection (D-17-09). */
	multiSelectable?: boolean;
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
	/** Enables click-to-sort behaviour, keyboard activation, and aria-sort. */
	sortable?: boolean;
	/**
	 * Current sort direction for this column.
	 * null (or undefined) → unsorted → aria-sort="none", no chevron.
	 */
	sortDir?: "asc" | "desc" | null;
	/** Callback fired on click or Enter/Space keydown when sortable. */
	onToggleSort?: () => void;
	/** When true, renders a drag handle on the right edge for column resizing (D-17-10). */
	resizable?: boolean;
	/** Called on pointerdown of the resize handle. Wire to useResizableColumns.startResize. */
	onResizeStart?: (e: React.PointerEvent<HTMLSpanElement>) => void;
	/** When provided, sets the column width inline (used with useResizableColumns). */
	width?: number;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
	/** When true, sets aria-selected + data-selected for CSS highlight (D-17-09). */
	selected?: boolean;
}

export interface TableSelectAllCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
	isAllSelected: boolean;
	isIndeterminate: boolean;
	onToggleAll: () => void;
	ariaLabel?: string;
}

export interface TableSelectCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
	selected: boolean;
	onToggle: () => void;
	ariaLabel?: string;
}

/**
 * Render `<Table.Pagination />` as a SIBLING of `<Table.Root>`, NOT as a child.
 * Pagination produces a `<nav>` element, and `<nav>` inside `<table>` (or any of
 * its descendants except `<caption>`) is invalid HTML — browsers will silently
 * hoist or strip it, and assistive tech may report inconsistent landmarks.
 *
 * GOOD:
 *   <div>
 *     <Table.Root>...</Table.Root>
 *     <Table.Pagination page={p} pageCount={n} onPageChange={setP} />
 *   </div>
 *
 * BAD:
 *   <Table.Root>
 *     <Table.Body>
 *       <Table.Row><Table.Cell colSpan={5}>
 *         <Table.Pagination ... />   // invalid: <nav> inside <table>
 *       </Table.Cell></Table.Row>
 *     </Table.Body>
 *   </Table.Root>
 *
 * Demonstrated in the `PaginationOutsideTable` Storybook story.
 */
export interface TablePaginationProps {
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	pageSize?: number;
	total?: number;
	ariaLabel?: string;
	className?: string;
	style?: React.CSSProperties;
}

// ── Pagination truncation ─────────────────────────────────────────────────────

function paginationRange(current: number, total: number): (number | "ellipsis")[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
	if (current >= total - 3)
		return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
	return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

// ── TableRoot ─────────────────────────────────────────────────────────────────

export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
	{ density = "comfortable", sticky, ariaLabel, multiSelectable, className, children, ...rest },
	ref,
) {
	return (
		<table
			ref={ref}
			aria-label={ariaLabel}
			aria-multiselectable={multiSelectable || undefined}
			className={cls("ds-atom-table", className)}
			data-density={density}
			data-sticky={sticky ? "true" : undefined}
			{...rest}
		>
			{children}
		</table>
	);
});

// ── TableHeader ───────────────────────────────────────────────────────────────

export const TableHeader = forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
	return <thead ref={ref} className={cls("ds-atom-table-header", className)} {...props} />;
});

// ── TableHeaderCell ───────────────────────────────────────────────────────────

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
	function TableHeaderCell(
		{
			sortable,
			sortDir,
			onToggleSort,
			resizable,
			onResizeStart,
			width,
			children,
			className,
			onKeyDown,
			onClick,
			style,
			...rest
		},
		ref,
	) {
		const widthStyle: React.CSSProperties =
			width != null ? { width: `${width}px`, minWidth: `${width}px`, ...style } : (style ?? {});
		const resolvedStyle = Object.keys(widthStyle).length > 0 ? widthStyle : undefined;

		// Resize handle: visual affordance only — aria-hidden keeps it out of the
		// accessibility tree. role="separator" is intentionally omitted: biome's
		// a11y/useSemanticElements would require <hr>, which is wrong for a drag target.
		const resizeHandle = resizable ? (
			<span
				className="ds-atom-table-resize-handle"
				onPointerDown={onResizeStart}
				aria-hidden="true"
			/>
		) : null;

		if (sortable) {
			let ariaSort: "ascending" | "descending" | "none";
			if (sortDir === "asc") {
				ariaSort = "ascending";
			} else if (sortDir === "desc") {
				ariaSort = "descending";
			} else {
				ariaSort = "none";
			}

			let indicator: string;
			if (sortDir === "asc") {
				indicator = "▲";
			} else if (sortDir === "desc") {
				indicator = "▼";
			} else {
				indicator = "";
			}

			const handleKeyDown: KeyboardEventHandler<HTMLTableCellElement> = (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggleSort?.();
				}
				onKeyDown?.(e);
			};

			const handleClick: MouseEventHandler<HTMLTableCellElement> = (e) => {
				onToggleSort?.();
				onClick?.(e);
			};

			return (
				<th
					ref={ref}
					// biome-ignore lint/a11y/noNoninteractiveTabindex: ARIA spec requires tabIndex=0 on sortable <th> for keyboard activation (D-17-07; WAI-ARIA columnheader pattern)
					// biome-ignore lint/a11y/useSemanticElements: scope="col" cannot carry aria-sort + tabIndex; explicit role="columnheader" is required for the interactive sort pattern
					tabIndex={0}
					role="columnheader"
					aria-sort={ariaSort}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					className={cls("ds-atom-table-headercell ds-atom-table-headercell-sortable", className)}
					style={resolvedStyle}
					{...rest}
				>
					<span className="ds-atom-table-headercell-label">{children}</span>
					<span className="ds-atom-table-sort-indicator" aria-hidden="true">
						{indicator}
					</span>
					{resizeHandle}
				</th>
			);
		}

		return (
			<th
				ref={ref}
				className={cls("ds-atom-table-headercell", className)}
				style={resolvedStyle}
				{...rest}
			>
				{children}
				{resizeHandle}
			</th>
		);
	},
);

// ── TableBody ─────────────────────────────────────────────────────────────────

export const TableBody = forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
	return <tbody ref={ref} className={cls("ds-atom-table-body", className)} {...props} />;
});

// ── TableRow ──────────────────────────────────────────────────────────────────

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
	{ className, selected, ...props },
	ref,
) {
	return (
		<tr
			ref={ref}
			className={cls("ds-atom-table-row", className)}
			aria-selected={selected ? true : undefined}
			data-selected={selected ? "true" : undefined}
			{...props}
		/>
	);
});

// ── TableCell ─────────────────────────────────────────────────────────────────

export const TableCell = forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...props }, ref) {
	return <td ref={ref} className={cls("ds-atom-table-cell", className)} {...props} />;
});

// ── TableSelectAllCell ────────────────────────────────────────────────────────

export const TableSelectAllCell = forwardRef<HTMLTableCellElement, TableSelectAllCellProps>(
	function TableSelectAllCell(
		{
			isAllSelected,
			isIndeterminate,
			onToggleAll,
			ariaLabel = "Select all rows",
			className,
			...rest
		},
		ref,
	) {
		return (
			<th
				ref={ref}
				className={cls("ds-atom-table-headercell ds-atom-table-selectcell", className)}
				{...rest}
			>
				<Checkbox
					checked={isAllSelected}
					indeterminate={isIndeterminate}
					onChange={() => onToggleAll()}
					aria-label={ariaLabel}
				/>
			</th>
		);
	},
);

// ── TableSelectCell ───────────────────────────────────────────────────────────

export const TableSelectCell = forwardRef<HTMLTableCellElement, TableSelectCellProps>(
	function TableSelectCell(
		{ selected, onToggle, ariaLabel = "Select row", className, ...rest },
		ref,
	) {
		return (
			<td
				ref={ref}
				className={cls("ds-atom-table-cell ds-atom-table-selectcell", className)}
				{...rest}
			>
				<Checkbox checked={selected} onChange={() => onToggle()} aria-label={ariaLabel} />
			</td>
		);
	},
);

// ── TablePagination ───────────────────────────────────────────────────────────

export const TablePagination = forwardRef<HTMLElement, TablePaginationProps>(
	function TablePagination(
		{ page, pageCount, onPageChange, pageSize, total, ariaLabel = "Pagination", className, style },
		ref,
	) {
		const range = paginationRange(page, pageCount);
		// Build stable keys for ellipsis items: "ellipsis-start" vs "ellipsis-end"
		// based on whether it appears before or after the midpoint of the range.
		let ellipsisCount = 0;
		return (
			<nav
				ref={ref}
				aria-label={ariaLabel}
				className={cls("ds-atom-table-pagination", className)}
				style={style}
			>
				<Button
					variant="ghost"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="Previous page"
				>
					←
				</Button>
				{range.map((entry) => {
					if (entry === "ellipsis") {
						ellipsisCount += 1;
						const ellipsisKey = `ellipsis-${ellipsisCount}`;
						return (
							<span
								key={ellipsisKey}
								className="ds-atom-table-pagination-ellipsis"
								aria-hidden="true"
							>
								…
							</span>
						);
					}
					return (
						<Button
							key={entry}
							variant={entry === page ? "primary" : "ghost"}
							aria-current={entry === page ? "page" : undefined}
							aria-label={`Page ${entry}`}
							onClick={() => onPageChange(entry)}
						>
							{entry}
						</Button>
					);
				})}
				<Button
					variant="ghost"
					disabled={page >= pageCount}
					onClick={() => onPageChange(page + 1)}
					aria-label="Next page"
				>
					→
				</Button>
				{total != null && pageSize != null && (
					<span className="ds-atom-table-pagination-summary">
						{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
					</span>
				)}
			</nav>
		);
	},
);

// ── Compound namespace ────────────────────────────────────────────────────────

/**
 * Table — compound primitive (DS-61, parts 1 + 2).
 *
 * Members: Table.Root, Table.Header, Table.HeaderCell, Table.Body, Table.Row, Table.Cell
 *          Table.SelectAllCell, Table.SelectCell, Table.Pagination
 *
 * Important: render <Table.Pagination /> as a sibling of <Table.Root>, NOT a child.
 * <nav> inside <table> is invalid HTML. See TablePaginationProps JSDoc for details.
 */
export const Table = {
	Root: TableRoot,
	Header: TableHeader,
	HeaderCell: TableHeaderCell,
	Body: TableBody,
	Row: TableRow,
	Cell: TableCell,
	SelectAllCell: TableSelectAllCell,
	SelectCell: TableSelectCell,
	Pagination: TablePagination,
};
