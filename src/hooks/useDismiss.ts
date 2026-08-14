import { useEffect } from "react";

/**
 * Stack of currently-open dismissable layers, innermost last.
 *
 * Fifteen components each installed their own `document.addEventListener
 * ("keydown", …)` Escape handler. Because every listener fired on the same
 * event, one Escape press closed *every* open layer at once — press Escape in a
 * ConfirmDialog raised from a Sheet and both vanished. Keeping a stack means only
 * the topmost layer reacts, which is what the ARIA dialog pattern requires.
 */
const stack: symbol[] = [];

/** Test-only: assert the stack unwinds cleanly. */
export function __dismissStackSize() {
	return stack.length;
}

export interface UseDismissOptions {
	/**
	 * Set false for a *non-modal* layer that should not participate in the
	 * topmost-only stack — a tooltip or hover card, which may be open alongside a
	 * dialog and should still respond to its own Escape.
	 *
	 * @default true
	 */
	modal?: boolean;
}

/**
 * Close the topmost open layer on Escape.
 *
 * Replaces the per-component `document` keydown handler that Modal, Sheet,
 * BottomSheet, ActionSheet, ConfirmDialog, CommandPalette, Lightbox, Popover and
 * others each carried. Listens at `document` (not `window`) so a real key press
 * bubbling up from the focused element is caught, and calls `preventDefault` so
 * the same press does not also reach a parent layer or the browser.
 *
 * @example
 * useDismiss(open, onClose);
 * useDismiss(open, close, { modal: false }); // tooltip: not part of the stack
 */
export function useDismiss(
	active: boolean,
	onDismiss: () => void,
	{ modal = true }: UseDismissOptions = {},
): void {
	useEffect(() => {
		if (!active) return;

		const id = Symbol("ds-layer");
		if (modal) stack.push(id);

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== "Escape") return;
			// Only the innermost modal layer responds. Non-modal layers always do.
			if (modal && stack[stack.length - 1] !== id) return;
			e.preventDefault();
			onDismiss();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (modal) {
				const i = stack.lastIndexOf(id);
				if (i !== -1) stack.splice(i, 1);
			}
		};
	}, [active, onDismiss, modal]);
}
