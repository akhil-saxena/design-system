import { useCallback, useMemo, useState } from "react";

export type SelectionMode = "single" | "multi";

/**
 * Selection state for Table.SelectAllCell + Table.SelectCell (DS-61, D-17-09).
 * Modes: "single" (at most 1 selected) | "multi" (default).
 * Controlled via selectedIds + onSelectionChange; uncontrolled via defaultSelected.
 *
 * @example
 *   const { selectedIds, isAllSelected, isIndeterminate, toggle, toggleAll, clear } =
 *     useTableSelection(rowIds, { mode: "multi", defaultSelected: [] });
 */
export function useTableSelection<Id extends string | number>(
	ids: Id[],
	options?: {
		mode?: SelectionMode;
		defaultSelected?: Id[];
		/** Controlled selected ids — takes priority over internal state. */
		selectedIds?: Id[];
		onSelectionChange?: (ids: Id[]) => void;
	},
): {
	selectedIds: Id[];
	isAllSelected: boolean;
	isIndeterminate: boolean;
	isSelected: (id: Id) => boolean;
	toggle: (id: Id) => void;
	toggleAll: () => void;
	clear: () => void;
} {
	const mode = options?.mode ?? "multi";
	const isControlled = options?.selectedIds !== undefined;
	const [uncontrolled, setUncontrolled] = useState<Id[]>(options?.defaultSelected ?? []);
	const selectedIds = isControlled ? (options!.selectedIds as Id[]) : uncontrolled;

	const setSelected = useCallback(
		(next: Id[]) => {
			if (!isControlled) setUncontrolled(next);
			options?.onSelectionChange?.(next);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isControlled, options?.onSelectionChange],
	);

	const isSelected = useCallback((id: Id) => selectedIds.includes(id), [selectedIds]);

	const toggle = useCallback(
		(id: Id) => {
			if (mode === "single") {
				setSelected(selectedIds.includes(id) ? [] : [id]);
			} else {
				setSelected(
					selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
				);
			}
		},
		[mode, selectedIds, setSelected],
	);

	const toggleAll = useCallback(() => {
		if (mode === "single") return; // no-op in single mode
		if (selectedIds.length === ids.length) {
			setSelected([]);
		} else {
			setSelected([...ids]);
		}
	}, [mode, selectedIds, ids, setSelected]);

	const clear = useCallback(() => setSelected([]), [setSelected]);

	const isAllSelected = useMemo(
		() => selectedIds.length === ids.length && ids.length > 0,
		[selectedIds.length, ids.length],
	);

	const isIndeterminate = useMemo(
		() => selectedIds.length > 0 && !isAllSelected,
		[selectedIds.length, isAllSelected],
	);

	return { selectedIds, isAllSelected, isIndeterminate, isSelected, toggle, toggleAll, clear };
}
