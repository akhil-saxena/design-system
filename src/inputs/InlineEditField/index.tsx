// InlineEditField — click-to-edit primitive where blur SAVES. Use this when
// the caller already debounces or persists on blur (cairn detail-page inline
// edits). For traditional cancel-on-blur table-cell editing, use InlineEdit.
// Both components coexist intentionally.
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { FieldError } from "../../patterns/FormValidation";
import { TextInput } from "../TextInput";
import { Textarea } from "../Textarea";

type InlineEditFieldState = "idle" | "editing" | "saving" | "error";

export interface InlineEditFieldProps {
	/** Current display value. */
	value: string;
	/**
	 * Called with the new value on commit (Enter, ⌘Enter for multiline, or blur).
	 * Return a Promise to trigger the saving state.
	 * If the Promise rejects, component enters error state with rejection message.
	 */
	onSave: (next: string) => void | Promise<void>;
	/** When true, renders a Textarea instead of a single-line TextInput.
	 * @default false
	 */
	multiline?: boolean;
	/** Placeholder shown in idle state when value is empty.
	 * Rendered as an italic span with `var(--ink-4)` color.
	 */
	placeholder?: string;
	/** When true, the idle span is not clickable.
	 * @default false
	 */
	disabled?: boolean;
	/** Maximum character length passed to the underlying input/textarea. */
	maxLength?: number;
	/**
	 * Accessible label for the trigger element in idle state and the underlying
	 * input in edit state. Required.
	 */
	ariaLabel: string;
	/**
	 * Typography preset for edit-mode input. Controls font-family + matching
	 * size defaults. Does NOT affect idle mode — idle inherits from parent.
	 * - "default" — Inter, 13px, weight 500 (matches existing INPUT style object)
	 * - "mono"    — var(--mono), 10.5px, weight 700, letter-spacing .12em, uppercase
	 * - "serif"   — Newsreader, 14px, line-height 1.55
	 * @default "default"
	 */
	font?: "default" | "mono" | "serif";
	className?: string;
	style?: CSSProperties;
}

const FONT_PRESETS: Record<"default" | "mono" | "serif", CSSProperties> = {
	default: {
		fontSize: 13,
		fontFamily: "var(--font)",
		fontWeight: 500,
		background: "transparent",
		border: "none",
		borderBottom: "1px dashed var(--rule)",
		padding: "2px 0",
	},
	mono: {
		fontFamily: "var(--mono)",
		fontSize: 10.5,
		fontWeight: 700,
		letterSpacing: ".12em",
		textTransform: "uppercase",
		background: "transparent",
		border: "none",
		borderBottom: "1px dashed var(--rule)",
		padding: "4px 0",
	},
	serif: {
		fontFamily: "'Newsreader', Georgia, serif",
		fontSize: 14,
		lineHeight: 1.55,
		background: "var(--panel)",
		border: "1px solid var(--rule)",
		borderRadius: 6,
		padding: "10px 12px",
		resize: "vertical",
		minHeight: 84,
	},
};

export function InlineEditField({
	value,
	onSave,
	multiline = false,
	placeholder,
	disabled = false,
	maxLength,
	ariaLabel,
	font = "default",
	className,
	style,
}: InlineEditFieldProps) {
	const [state, setState] = useState<InlineEditFieldState>("idle");
	const [draft, setDraft] = useState(value);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (state === "idle") setDraft(value);
	}, [value, state]);

	useEffect(() => {
		if (state === "editing" || state === "error") {
			if (multiline) {
				textareaRef.current?.focus();
			} else {
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		}
	}, [state, multiline]);

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
			return;
		}
		if (e.key === "Enter") {
			if (!multiline) {
				e.preventDefault();
				void handleCommit();
				return;
			}
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault();
				void handleCommit();
				return;
			}
		}
	}

	function handleBlur() {
		// InlineEditField saves on blur (NOT cancels). This is the contract that
		// distinguishes us from InlineEdit and matches cairn's persist-on-blur
		// pattern. WHY: every cairn call site (PersonSheet, PinnedCard, etc.)
		// debounces or persists on blur; reverting would lose unsaved keystrokes.
		if (state === "editing" || state === "error") {
			void handleCommit();
		}
	}

	if (state !== "idle") {
		const editStyle: CSSProperties = { ...FONT_PRESETS[font], ...style };
		const sharedProps = {
			className: ["ds-atom-inlineeditfield-input", className].filter(Boolean).join(" "),
			value: draft,
			disabled: state === "saving",
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
				setDraft(e.target.value),
			onKeyDown: handleKeyDown,
			onBlur: handleBlur,
			"data-state": state,
			error: state === "error",
			"aria-label": ariaLabel,
			maxLength,
			style: editStyle,
		};

		return (
			<span className="ds-atom-inlineeditfield-wrap">
				{multiline ? (
					<Textarea ref={textareaRef} {...sharedProps} />
				) : (
					<TextInput ref={inputRef} {...sharedProps} type="text" />
				)}
				<FieldError message={state === "error" ? errorMsg : null} />
			</span>
		);
	}

	return (
		<span
			className={["ds-atom-inlineeditfield", className].filter(Boolean).join(" ")}
			data-state="idle"
			// biome-ignore lint/a11y/useSemanticElements: span role=button preserves inline flow without layout shift between idle/editing — same rationale as InlineEdit
			role="button"
			tabIndex={disabled ? -1 : 0}
			aria-label={ariaLabel}
			aria-disabled={disabled}
			onClick={disabled ? undefined : () => setState("editing")}
			onKeyDown={(e) => {
				if ((e.key === "Enter" || e.key === " ") && !disabled) {
					e.preventDefault();
					setState("editing");
				}
			}}
			style={style}
		>
			{value ||
				(placeholder ? (
					<span style={{ color: "var(--ink-4)", fontStyle: "italic" }}>{placeholder}</span>
				) : null)}
		</span>
	);
}
