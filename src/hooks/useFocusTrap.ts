import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
	"a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), " +
	"input:not([disabled]):not([type='hidden']), select:not([disabled]), " +
	"[tabindex]:not([tabindex='-1'])";

/**
 * Trap Tab/Shift+Tab focus inside `container` while `active` is true.
 *
 * Pass the actual DOM node (use a callback ref + useState pattern in the
 * caller). This guarantees the effect re-runs as soon as the node attaches,
 * which is necessary for portal-mounted containers (Modal, Sheet, BottomSheet)
 * where the node materializes one tick after the parent renders.
 *
 * On activation: focuses the first focusable child, OR the container itself
 * when it has no focusable descendants (container must have `tabIndex={-1}`).
 * On deactivation: restores focus to the previously-focused element.
 *
 * Listens at `document` level so the trap engages even when focus is currently
 * outside the container (e.g., focus leaked to background, or content has no
 * focusables and initial focus didn't land inside).
 */
export function useFocusTrap<T extends HTMLElement>(container: T | null, active: boolean): void {
	useEffect(() => {
		if (!active || !container) return;
		// Capture as non-null local — TypeScript loses narrowing across closure boundaries.
		const c = container;
		const previouslyFocused = document.activeElement as HTMLElement | null;

		const focusables = () =>
			Array.from(c.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
				(el) => !el.hasAttribute("inert"),
			);

		const initial = focusables()[0];
		if (initial) {
			initial.focus();
		} else {
			c.focus();
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== "Tab") return;
			const list = focusables();
			const activeEl = document.activeElement as HTMLElement | null;
			const activeInside = activeEl ? c.contains(activeEl) : false;

			if (list.length === 0) {
				e.preventDefault();
				if (!activeInside) c.focus();
				return;
			}

			const firstEl = list[0]!;
			const lastEl = list.at(-1)!;

			if (!activeInside) {
				e.preventDefault();
				(e.shiftKey ? lastEl : firstEl).focus();
				return;
			}
			if (e.shiftKey && activeEl === firstEl) {
				e.preventDefault();
				lastEl.focus();
			} else if (!e.shiftKey && activeEl === lastEl) {
				e.preventDefault();
				firstEl.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			previouslyFocused?.focus?.();
		};
	}, [active, container]);
}
