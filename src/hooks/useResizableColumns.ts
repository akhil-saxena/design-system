import { useCallback, useRef, useState } from "react";
import type React from "react";

/**
 * Column-resize state + Pointer Events drag handle (DS-61, D-17-10).
 *
 * Attach `startResize(col, event)` to a drag handle element's onPointerDown.
 * Pointer is captured via setPointerCapture for reliable tracking on fast drags.
 * onWidthsChange fires on pointerup with the final widths snapshot.
 * Consumer owns persistence (e.g. localStorage) - this hook only emits the event.
 *
 * @example
 *   const { widths, startResize } = useResizableColumns({ name: 120, role: 100 });
 *   <Table.HeaderCell width={widths.name}>
 *     Name
 *     <span onPointerDown={(e) => startResize("name", e)} />
 *   </Table.HeaderCell>
 */
export function useResizableColumns(
	initialWidths: Record<string, number>,
	options?: {
		/** Minimum column width in px. Default: 60. */
		minWidth?: number;
		/** Called on pointerup with the final widths record. */
		onWidthsChange?: (widths: Record<string, number>) => void;
	},
): {
	widths: Record<string, number>;
	setWidth: (col: string, w: number) => void;
	startResize: (col: string, e: React.PointerEvent) => void;
} {
	const minWidth = options?.minWidth ?? 60;
	const [widths, setWidths] = useState<Record<string, number>>(initialWidths);

	// Ref mirrors widths state so closure-captured handlers always see fresh value.
	const widthsRef = useRef(widths);
	widthsRef.current = widths;

	const onWidthsChangeRef = useRef(options?.onWidthsChange);
	onWidthsChangeRef.current = options?.onWidthsChange;

	const setWidth = useCallback(
		(col: string, w: number) => {
			const clamped = Math.max(minWidth, w);
			setWidths((prev) => {
				const next = { ...prev, [col]: clamped };
				widthsRef.current = next;
				return next;
			});
		},
		[minWidth],
	);

	const startResize = useCallback(
		(col: string, e: React.PointerEvent) => {
			const startX = e.clientX;
			const startW = widthsRef.current[col] ?? 0;

			// Capture pointer so we track movement even if cursor leaves the element.
			try {
				(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
			} catch {
				// jsdom and some older browsers may throw; safe to ignore.
			}

			const onMove = (ev: PointerEvent) => {
				const delta = ev.clientX - startX;
				const next = Math.max(minWidth, startW + delta);
				setWidths((prev) => {
					const updated = { ...prev, [col]: next };
					widthsRef.current = updated;
					return updated;
				});
			};

			const onUp = () => {
				document.removeEventListener("pointermove", onMove);
				document.removeEventListener("pointerup", onUp);
				onWidthsChangeRef.current?.({ ...widthsRef.current });
			};

			document.addEventListener("pointermove", onMove);
			document.addEventListener("pointerup", onUp);
		},
		[minWidth],
	);

	return { widths, setWidth, startResize };
}
