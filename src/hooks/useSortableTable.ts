import { useCallback, useMemo, useState } from "react";

export interface SortState<T> {
	col: keyof T | null;
	dir: "asc" | "desc";
}

/**
 * Sortable table state + derived sorted rows.
 * Used by Table primitive (DS-61, D-17-07) header click handlers.
 * Stable sort via Array.prototype.sort (ES2019 guarantee).
 *
 * Usage:
 *   const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(rows, { defaultCol: "name" });
 *   <Table.HeaderCell sortable sortDir={sortCol === "name" ? sortDir : null} onToggleSort={() => toggleSort("name")}>
 *     Name
 *   </Table.HeaderCell>
 *
 * @param rows - The source data array (reference-stable recommended for memo perf).
 * @param options.defaultCol - Initial sort column (default: null = unsorted).
 * @param options.defaultDir - Initial sort direction (default: "asc").
 * @param options.comparator - Custom compare fn `(a, b, col) => number`.
 */
export function useSortableTable<T>(
	rows: T[],
	options?: {
		defaultCol?: keyof T;
		defaultDir?: "asc" | "desc";
		comparator?: (a: T, b: T, col: keyof T) => number;
	},
): {
	sorted: T[];
	sortCol: keyof T | null;
	sortDir: "asc" | "desc";
	toggleSort: (col: keyof T) => void;
} {
	const [sortCol, setSortCol] = useState<keyof T | null>(options?.defaultCol ?? null);
	const [sortDir, setSortDir] = useState<"asc" | "desc">(options?.defaultDir ?? "asc");

	const toggleSort = useCallback((col: keyof T) => {
		setSortCol((prev) => {
			if (prev === col) {
				setSortDir((d) => (d === "asc" ? "desc" : "asc"));
				return prev;
			}
			setSortDir("asc");
			return col;
		});
	}, []);

	const customComparator = options?.comparator;

	const sorted = useMemo(() => {
		if (sortCol == null) return rows;
		const cmp =
			customComparator ??
			((a: T, b: T, col: keyof T) => {
				const av = a[col];
				const bv = b[col];
				if (av == null && bv == null) return 0;
				if (av == null) return -1;
				if (bv == null) return 1;
				if (av < bv) return -1;
				if (av > bv) return 1;
				return 0;
			});
		const dirMul = sortDir === "asc" ? 1 : -1;
		return [...rows].sort((a, b) => cmp(a, b, sortCol) * dirMul);
	}, [rows, sortCol, sortDir, customComparator]);

	return { sorted, sortCol, sortDir, toggleSort };
}
