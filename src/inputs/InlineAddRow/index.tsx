import { type CSSProperties, type KeyboardEvent, forwardRef, useRef, useState } from "react";

export interface InlineAddRowProps {
	/** Placeholder shown in both the dashed trigger and the active input. */
	placeholder?: string;
	/** Called with the trimmed value when the user commits (Enter). */
	onSave: (value: string) => void;
	/** Keyboard hint rendered at the right edge of the active input. */
	kbdHint?: string;
	className?: string;
	style?: CSSProperties;
}

const wrapStyle: CSSProperties = { width: "100%" };

const triggerStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	width: "100%",
	height: 40,
	border: "1px dashed var(--rule-s)",
	borderRadius: "var(--radius-sm)",
	padding: "0 10px",
	fontFamily: "var(--font)",
	fontSize: 12,
	color: "var(--ink-4)",
	fontStyle: "italic",
	cursor: "text",
	background: "none",
	textAlign: "left",
	boxSizing: "border-box",
};

const activeStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	height: 40,
	border: "1px solid var(--amber)",
	borderRadius: "var(--radius-sm)",
	background: "var(--panel)",
	boxShadow: "var(--focus-ring)",
	boxSizing: "border-box",
	overflow: "hidden",
};

const inputStyle: CSSProperties = {
	flex: 1,
	border: "none",
	background: "transparent",
	outline: "none",
	fontFamily: "var(--font)",
	fontSize: 12,
	padding: "0 10px",
	height: "100%",
	color: "var(--ink)",
};

const hintStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 9,
	color: "var(--ink-4)",
	padding: "0 10px",
	flexShrink: 0,
	letterSpacing: "0.04em",
	whiteSpace: "nowrap",
};

/**
 * InlineAddRow — a dashed "+ add" affordance that expands into an inline text
 * input on click. Enter commits (`onSave` with the trimmed value); Esc or blur
 * discards. Use for "add a question / note / person / row" patterns where a full
 * form is overkill.
 *
 * @example
 * <InlineAddRow placeholder="Add a question…" onSave={(t) => addQuestion(t)} />
 */
export const InlineAddRow = forwardRef<HTMLDivElement, InlineAddRowProps>(function InlineAddRow(
	{ placeholder = "Add…", onSave, kbdHint = "↵ · Esc", className, style },
	ref,
) {
	const [active, setActive] = useState(false);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const save = () => {
		const trimmed = value.trim();
		if (trimmed) onSave(trimmed);
		setValue("");
		setActive(false);
	};
	const discard = () => {
		setValue("");
		setActive(false);
	};
	const activate = () => {
		setActive(true);
		requestAnimationFrame(() => inputRef.current?.focus());
	};
	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			save();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			discard();
		}
	};

	return (
		<div
			ref={ref}
			className={`ds-atom-inline-add${className ? ` ${className}` : ""}`}
			data-active={active}
			style={{ ...wrapStyle, ...style }}
		>
			{active ? (
				<div style={activeStyle}>
					<input
						ref={inputRef}
						type="text"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={onKeyDown}
						onBlur={discard}
						placeholder={placeholder}
						aria-label={placeholder}
						style={inputStyle}
					/>
					<span aria-hidden="true" style={hintStyle}>
						{kbdHint}
					</span>
				</div>
			) : (
				<button type="button" onClick={activate} style={triggerStyle}>
					{placeholder}
				</button>
			)}
		</div>
	);
});
