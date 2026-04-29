/**
 * # Usage Audit — Table (DS-61, D-17-06..D-17-12)
 *
 * Compound API:
 *   <Table.Root density="comfortable" sticky ariaLabel="Users">
 *     <Table.Header>
 *       <Table.Row>
 *         <Table.HeaderCell
 *           sortable
 *           sortDir={sortCol === "name" ? sortDir : null}
 *           onToggleSort={() => toggleSort("name")}
 *         >
 *           Name
 *         </Table.HeaderCell>
 *         <Table.HeaderCell>Role</Table.HeaderCell>
 *       </Table.Row>
 *     </Table.Header>
 *     <Table.Body>
 *       {sorted.map(row => (
 *         <Table.Row key={row.id}>
 *           <Table.Cell>{row.name}</Table.Cell>
 *           <Table.Cell>{row.role}</Table.Cell>
 *         </Table.Row>
 *       ))}
 *     </Table.Body>
 *   </Table.Root>
 *
 * Helper hooks:
 *   useSortableTable — this plan (DS-61 part 1)
 *   useTableSelection / useResizableColumns — Plan 17-11 (DS-61 part 2)
 *
 * Sort indicator: UTF-8 ▲/▼ at ~9px monospace per D-17-07 (not Lucide icons).
 * Sticky: Table.Root sticky prop → data-sticky="true" → CSS position:sticky on thead.
 * Density: Table.Root density prop → data-density attr → CSS row-height variants.
 */

import { type KeyboardEventHandler, type MouseEventHandler, forwardRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TableRootProps extends React.TableHTMLAttributes<HTMLTableElement> {
	/** Row height density mode. Default: "comfortable" (40px). */
	density?: "cozy" | "comfortable" | "spacious";
	/** When true, <thead> becomes position:sticky so the header stays visible on scroll. */
	sticky?: boolean;
	/** Accessible label for the table (renders as aria-label). */
	ariaLabel?: string;
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
}

// ── TableRoot ─────────────────────────────────────────────────────────────────

export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
	{ density = "comfortable", sticky, ariaLabel, className, children, ...rest },
	ref,
) {
	return (
		<table
			ref={ref}
			aria-label={ariaLabel}
			className={`ds-atom-table${className ? ` ${className}` : ""}`}
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
	return (
		<thead
			ref={ref}
			className={`ds-atom-table-header${className ? ` ${className}` : ""}`}
			{...props}
		/>
	);
});

// ── TableHeaderCell ───────────────────────────────────────────────────────────

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
	function TableHeaderCell(
		{ sortable, sortDir, onToggleSort, children, className, onKeyDown, onClick, ...rest },
		ref,
	) {
		if (!sortable) {
			return (
				<th
					ref={ref}
					className={`ds-atom-table-headercell${className ? ` ${className}` : ""}`}
					{...rest}
				>
					{children}
				</th>
			);
		}

		const ariaSort = sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none";

		const indicator = sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "";

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
				className={`ds-atom-table-headercell ds-atom-table-headercell-sortable${className ? ` ${className}` : ""}`}
				{...rest}
			>
				<span className="ds-atom-table-headercell-label">{children}</span>
				<span className="ds-atom-table-sort-indicator" aria-hidden="true">
					{indicator}
				</span>
			</th>
		);
	},
);

// ── TableBody ─────────────────────────────────────────────────────────────────

export const TableBody = forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
	return (
		<tbody
			ref={ref}
			className={`ds-atom-table-body${className ? ` ${className}` : ""}`}
			{...props}
		/>
	);
});

// ── TableRow ──────────────────────────────────────────────────────────────────

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	function TableRow({ className, ...props }, ref) {
		return (
			<tr ref={ref} className={`ds-atom-table-row${className ? ` ${className}` : ""}`} {...props} />
		);
	},
);

// ── TableCell ─────────────────────────────────────────────────────────────────

export const TableCell = forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...props }, ref) {
	return (
		<td ref={ref} className={`ds-atom-table-cell${className ? ` ${className}` : ""}`} {...props} />
	);
});

// ── Compound namespace ────────────────────────────────────────────────────────

/**
 * Table — compound primitive (DS-61 part 1).
 *
 * Members: Table.Root, Table.Header, Table.HeaderCell, Table.Body, Table.Row, Table.Cell
 * Part 2 (Plan 17-11) adds: Table.SelectAllCell, Table.SelectCell, Table.Pagination
 */
export const Table = {
	Root: TableRoot,
	Header: TableHeader,
	HeaderCell: TableHeaderCell,
	Body: TableBody,
	Row: TableRow,
	Cell: TableCell,
};
