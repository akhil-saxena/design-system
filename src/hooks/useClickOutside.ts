import { type RefObject, useEffect } from "react";

/**
 * Calls `handler` when a mousedown/touchstart fires outside of `ref`'s element.
 * Used by Popover (Phase 14), Modal close-on-backdrop, Select dropdown dismiss.
 */
export function useClickOutside<T extends HTMLElement>(
	ref: RefObject<T | null>,
	handler: (e: MouseEvent | TouchEvent) => void,
	enabled = true,
): void {
	useEffect(() => {
		if (!enabled) return;
		function listener(e: MouseEvent | TouchEvent) {
			const el = ref.current;
			if (!el || el.contains(e.target as Node)) return;
			handler(e);
		}
		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);
		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [ref, handler, enabled]);
}
