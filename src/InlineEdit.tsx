import { type CSSProperties, useEffect, useRef, useState } from "react";

type InlineEditState = "idle" | "editing" | "saving" | "error";

export interface InlineEditProps {
	/** Current display value. */
	value: string;
	/**
	 * Called with the new value when the user commits (Enter key or blur).
	 * Return a Promise to trigger the saving state. If the Promise rejects,
	 * the component enters error state with the rejection message.
	 */
	onSave: (value: string) => Promise<void> | void;
	/** When true, renders a textarea instead of a single-line input.
	 * @default false
	 */
	multiline?: boolean;
	/** Placeholder shown in idle state when value is empty. */
	placeholder?: string;
	/** When true, the idle span is not clickable (no editing allowed).
	 * @default false
	 */
	disabled?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * InlineEdit (DS-77) — click-to-edit pattern with optimistic save + error recovery.
 *
 * State machine:
 *   idle     → click / Enter / Space → editing
 *   editing  → Enter                 → saving
 *   editing  → Escape / blur         → idle (restored original)
 *   saving   → onSave resolves       → idle
 *   saving   → onSave rejects        → error (input re-enabled with last draft)
 *   error    → Escape / blur         → idle (restored original)
 *   error    → Enter                 → saving (retry)
 *
 * Blur always cancels (reverts), matching the handoff spec for click-to-edit
 * in table cells and inline fields.
 */
export function InlineEdit({
	value,
	onSave,
	multiline = false,
	placeholder,
	disabled = false,
	className,
	style,
}: InlineEditProps) {
	const [state, setState] = useState<InlineEditState>("idle");
	const [draft, setDraft] = useState(value);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

	// Sync draft with external value changes when in idle state
	useEffect(() => {
		if (state === "idle") setDraft(value);
	}, [value, state]);

	// Auto-focus when entering editing state
	useEffect(() => {
		if ((state === "editing" || state === "error") && inputRef.current) {
			inputRef.current.focus();
			// Select all text for convenience
			if (inputRef.current instanceof HTMLInputElement) {
				inputRef.current.select();
			}
		}
	}, [state]);

	async function handleCommit() {
		setState("saving");
		setErrorMsg(null);
		try {
			await onSave(draft);
			setState("idle");
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : typeof err === "string" ? err : "Save failed";
			setState("error");
			setErrorMsg(msg);
		}
	}

	function handleCancel() {
		setDraft(value);
		setState("idle");
		setErrorMsg(null);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
		if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		} else if (e.key === "Enter") {
			// For textarea, Shift+Enter inserts a newline; plain Enter commits
			if (!multiline || !e.shiftKey) {
				e.preventDefault();
				handleCommit();
			}
		}
	}

	function handleBlur() {
		// Blur always cancels (reverts to original value)
		if (state === "editing" || state === "error") {
			handleCancel();
		}
	}

	// Editing, saving, or error state: show input / textarea
	if (state !== "idle") {
		const inputProps = {
			ref: inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>,
			className: "ds-atom-inlineedit-input",
			value: draft,
			disabled: state === "saving",
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
				setDraft(e.target.value),
			onKeyDown: handleKeyDown,
			onBlur: handleBlur,
			"data-state": state,
		};

		return (
			<span
				className={["ds-atom-inlineedit-wrap", className].filter(Boolean).join(" ")}
				style={style}
			>
				{multiline ? <textarea {...inputProps} rows={3} /> : <input {...inputProps} type="text" />}
				{state === "error" && errorMsg ? (
					<span className="ds-atom-inlineedit-error" role="alert">
						{errorMsg}
					</span>
				) : null}
			</span>
		);
	}

	// Idle state — <span role="button"> is intentional: switching to a native <button> would
	// introduce block-level layout and cause a size shift when toggling between idle and editing
	// states. Keyboard and ARIA wiring is fully in place (tabIndex, onKeyDown, aria-disabled).
	return (
		<>
			<span
				className={["ds-atom-inlineedit", className].filter(Boolean).join(" ")}
				data-state="idle"
				onClick={disabled ? undefined : () => setState("editing")}
				tabIndex={disabled ? -1 : 0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						if (!disabled) setState("editing");
					}
				}}
				// biome-ignore lint/a11y/useSemanticElements: span role=button is required here to keep inline flow; a native <button> causes layout shift between idle/editing states
				role="button"
				aria-label="Click to edit"
				aria-disabled={disabled}
				style={style}
			>
				{value ? (
					value
				) : placeholder ? (
					<span style={{ color: "var(--ink-4)" }}>{placeholder}</span>
				) : null}
			</span>
		</>
	);
}
