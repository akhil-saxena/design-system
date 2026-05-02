import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Button } from "../../inputs/Button";
/** Props injected into the trigger element by InlineConfirm. */
export interface InlineConfirmTriggerProps {
	/** Wires the trigger into InlineConfirm's state machine. Spread onto your button. */
	onClick: () => void;
}

export interface InlineConfirmProps {
	/**
	 * Render-prop returning the trigger element (button, icon-button, etc.).
	 * Spread the provided `triggerProps` onto your element to wire the click handler.
	 *
	 * @example
	 * trigger={(p) => <Button variant="danger" {...p}>Delete</Button>}
	 */
	trigger: (triggerProps: InlineConfirmTriggerProps) => ReactNode;
	/** Called when the user clicks the confirm button. */
	onConfirm: () => void;
	/** Called when the user cancels — via No button, Escape, click-outside, or auto-cancel timeout. */
	onCancel?: () => void;
	/**
	 * Label for the confirm button.
	 * @default "Yes"
	 */
	confirmLabel?: string;
	/**
	 * Label for the cancel button.
	 * @default "No"
	 */
	cancelLabel?: string;
	/**
	 * Variant for the confirm button. Use `"danger"` for destructive actions and
	 * `"primary"` for non-destructive confirms (e.g. Send, Submit).
	 * @default "danger"
	 */
	confirmVariant?: "danger" | "primary";
	/**
	 * Milliseconds before the prompt auto-cancels. Hover or focus inside the
	 * prompt row pauses the timer. Pass `Infinity` to disable auto-cancel.
	 * @default 4000
	 */
	autoCancelMs?: number;
	/**
	 * Text shown between the trigger state and the confirm/cancel buttons.
	 * @default "Are you sure?"
	 */
	promptText?: ReactNode;
}

const DEFAULT_AUTO_CANCEL_MS = 4000;

/**
 * InlineConfirm — render-prop trigger replacement for inline destructives (DS-45, D-430).
 *
 *   <InlineConfirm
 *     trigger={(p) => <Button variant="danger" {...p}>Delete</Button>}
 *     onConfirm={handleDelete}
 *     promptText="Delete this application?"
 *   />
 *
 * Idle: renders the trigger function's returned element with `onClick` wired
 * to enter pending state. Pending: replaces trigger with inline-row
 * `[promptText] [No] [Yes]` in the same container — zero layout shift.
 *
 * 4s auto-cancel timer (configurable via `autoCancelMs`; pass Infinity to
 * disable). Mouse-enter prompt OR focus-within pauses timer; un-hover AND
 * blur resumes. Escape, click-outside, and explicit cancel-button click
 * all dismiss immediately.
 *
 * For HIGH-stakes destructives (delete account, mass-delete, irreversible)
 * use ConfirmDialog (Modal variant) instead — InlineConfirm is for LOW-stakes
 * inline confirms in dense lists (D-431).
 *
 * Uncontrolled — manages internal `pending` state. No ref forwarding (the
 * component switches between two different DOM trees).
 */
export function InlineConfirm({
	trigger,
	onConfirm,
	onCancel,
	confirmLabel = "Yes",
	cancelLabel = "No",
	confirmVariant = "danger",
	autoCancelMs = DEFAULT_AUTO_CANCEL_MS,
	promptText = "Are you sure?",
}: InlineConfirmProps) {
	const [pending, setPending] = useState(false);
	const rowRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<number | null>(null);
	const startedAtRef = useRef<number>(0);
	const remainingRef = useRef<number>(autoCancelMs);
	const isHoveringRef = useRef(false);
	const isFocusedRef = useRef(false);

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const cancel = useCallback(() => {
		clearTimer();
		setPending(false);
		onCancel?.();
	}, [clearTimer, onCancel]);

	const startTimer = useCallback(
		(ms: number) => {
			if (!Number.isFinite(ms)) return; // Infinity disables
			clearTimer();
			startedAtRef.current = Date.now();
			remainingRef.current = ms;
			timerRef.current = window.setTimeout(() => {
				timerRef.current = null;
				setPending(false);
				onCancel?.();
			}, ms);
		},
		[clearTimer, onCancel],
	);

	const pauseTimer = useCallback(() => {
		if (timerRef.current === null) return;
		const elapsed = Date.now() - startedAtRef.current;
		remainingRef.current = Math.max(0, remainingRef.current - elapsed);
		clearTimer();
	}, [clearTimer]);

	const resumeTimerIfIdle = useCallback(() => {
		if (!pending) return;
		if (isHoveringRef.current || isFocusedRef.current) return;
		if (timerRef.current !== null) return;
		if (!Number.isFinite(autoCancelMs)) return;
		startTimer(remainingRef.current);
	}, [pending, autoCancelMs, startTimer]);

	const beginPending = useCallback(() => {
		setPending(true);
		remainingRef.current = autoCancelMs;
		startTimer(autoCancelMs);
	}, [autoCancelMs, startTimer]);

	const handleConfirm = useCallback(() => {
		clearTimer();
		setPending(false);
		onConfirm();
	}, [clearTimer, onConfirm]);

	// Escape key handler — only active when pending
	useEffect(() => {
		if (!pending) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				cancel();
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [pending, cancel]);

	// Click-outside dismissal — uses the canonical useClickOutside hook
	// (Popover line 95 pattern). Third arg `pending` gates the listener so
	// it only fires while the prompt is visible.
	useClickOutside(rowRef, () => cancel(), pending);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearTimer();
		};
	}, [clearTimer]);

	if (!pending) {
		return <>{trigger({ onClick: beginPending })}</>;
	}

	return (
		<div
			ref={rowRef}
			className="ds-atom-confirm"
			// biome-ignore lint/a11y/useSemanticElements: <fieldset> implies a form-grouping semantic we don't want for a transient confirm prompt
			role="group"
			aria-label={typeof promptText === "string" ? promptText : "Confirm action"}
			onMouseEnter={() => {
				isHoveringRef.current = true;
				pauseTimer();
			}}
			onMouseLeave={() => {
				isHoveringRef.current = false;
				resumeTimerIfIdle();
			}}
			onFocus={() => {
				isFocusedRef.current = true;
				pauseTimer();
			}}
			onBlur={(e) => {
				// blur fires when focus moves to a child too — only treat focus as lost when
				// the new focus is OUTSIDE the row (relatedTarget is null OR not in row)
				const next = e.relatedTarget as Node | null;
				if (!next || !rowRef.current?.contains(next)) {
					isFocusedRef.current = false;
					resumeTimerIfIdle();
				}
			}}
		>
			<span className="ds-atom-confirm-text">{promptText}</span>
			<Button size="xs" variant="ghost" onClick={cancel}>
				{cancelLabel}
			</Button>
			<Button size="xs" variant={confirmVariant} onClick={handleConfirm}>
				{confirmLabel}
			</Button>
		</div>
	);
}
