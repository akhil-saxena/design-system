import { type RefObject, useEffect } from "react";

const FOCUSABLE_SELECTOR =
	"a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), " +
	"input:not([disabled]):not([type='hidden']), select:not([disabled]), " +
	"[tabindex]:not([tabindex='-1'])";

/**
 * Trap Tab/Shift+Tab focus inside `ref`'s element while `active` is true.
 * On activation: focuses the first focusable child.
 * On deactivation: restores focus to the previously-focused element.
 * Used by Modal (Phase 14), Sheet (Phase 14), CommandPalette (Phase 17).
 */
export function useFocusTrap<T extends HTMLElement>(
	ref: RefObject<T | null>,
	active: boolean,
): void {
	useEffect(() => {
		if (!active) return;
		const container = ref.current;
		if (!container) return;
		const previouslyFocused = document.activeElement as HTMLElement | null;

		const focusables = () =>
			Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
				(el) => !el.hasAttribute("inert"),
			);

		const first = focusables()[0];
		first?.focus();

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== "Tab") return;
			const list = focusables();
			if (list.length === 0) {
				e.preventDefault();
				return;
			}
			const firstEl = list[0]!;
			const lastEl = list[list.length - 1]!;
			const activeEl = document.activeElement as HTMLElement | null;
			if (e.shiftKey && activeEl === firstEl) {
				e.preventDefault();
				lastEl.focus();
			} else if (!e.shiftKey && activeEl === lastEl) {
				e.preventDefault();
				firstEl.focus();
			}
		}

		container.addEventListener("keydown", handleKeyDown);
		return () => {
			container.removeEventListener("keydown", handleKeyDown);
			previouslyFocused?.focus?.();
		};
	}, [active, ref]);
}
