import {
	type CSSProperties,
	type InputHTMLAttributes,
	type ReactNode,
	forwardRef,
	useId,
} from "react";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
	/** When true, applies error-state border color to the input or wrapper. */
	error?: boolean;
	/** Leading icon rendered inside the wrapper (Lucide recommended size 14–16). */
	icon?: ReactNode;
	/** Static text or node rendered before the input (e.g. `"https://"`). */
	prefix?: ReactNode;
	/** Static text or node rendered after the input (e.g. `".com"`). */
	suffix?: ReactNode;
	/** Trailing keyboard-shortcut hint (e.g. `"⌘K"`) styled as a monospace pill. */
	kbd?: ReactNode;
	/**
	 * Visible label, wired to the input via `htmlFor`/`id`.
	 *
	 * Until now TextInput had no label prop at all, so every consumer hand-rolled
	 * `<label htmlFor>` + `id` — and the ones that forgot shipped an unnamed
	 * field. (The system's own SplitHero showcase passed `label="Email"`, which
	 * React silently dropped onto the DOM, leaving both sign-in fields unnamed.)
	 *
	 * An `id` is generated when you do not supply one.
	 */
	label?: ReactNode;
	/** Supporting text under the field, wired to `aria-describedby`. */
	hint?: ReactNode;
	/**
	 * Validation message under the field. Rendered in the error tone, wired to
	 * `aria-describedby`, and announced politely. Implies `error`.
	 */
	errorMessage?: ReactNode;
}

// Locked at 36px so the input sits at the same baseline as MultiSelect /
// Select / Button at their default size — keeps any filter row visually
// homogeneous instead of one element looking taller than the others.
const baseInputStyle: CSSProperties = {
	fontSize: 13,
	height: 36,
	padding: "0 10px",
	borderRadius: 8,
	border: "1px solid var(--rule)",
	background: "var(--cream)",
	color: "var(--ink)",
	fontFamily: "var(--font)",
	outline: "none",
	transition: "border-color .15s, box-shadow .15s",
	width: "100%",
	boxSizing: "border-box",
};

const wrapStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 8,
	height: 36,
	padding: "0 10px",
	borderRadius: 8,
	border: "1px solid var(--rule)",
	background: "var(--cream)",
	transition: "border-color .15s, box-shadow .15s",
	boxSizing: "border-box",
};

const innerInputStyle: CSSProperties = {
	border: "none",
	background: "none",
	padding: "8px 0",
	boxShadow: "none",
	fontSize: 13,
	color: "var(--ink)",
	fontFamily: "var(--font)",
	outline: "none",
	flex: 1,
	width: "100%",
};

const affixStyle: CSSProperties = {
	color: "var(--ink-3)",
	fontFamily: "var(--mono)",
	fontSize: 12,
	whiteSpace: "nowrap",
	flexShrink: 0,
};

const kbdStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 10,
	fontWeight: 600,
	color: "var(--ink-3)",
	background: "var(--cream-2)",
	border: "1px solid var(--rule)",
	borderRadius: 4,
	padding: "1px 6px",
	whiteSpace: "nowrap",
	flexShrink: 0,
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
	{ error, icon, prefix, suffix, kbd, label, hint, errorMessage, className, style, ...rest },
	ref,
) {
	const generatedId = useId();
	const inputId = rest.id ?? generatedId;
	const hintId = hint ? `${generatedId}-hint` : undefined;
	const errorId = errorMessage ? `${generatedId}-error` : undefined;
	// An explicit errorMessage implies the error state — a message with no visual
	// error styling would be contradictory.
	const invalid = error || Boolean(errorMessage);

	// Existing `aria-describedby` is preserved and ours appended, so a consumer
	// pointing at their own description does not lose it.
	const describedBy =
		[rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

	const inputProps = {
		...rest,
		id: inputId,
		"aria-describedby": describedBy,
		// aria-invalid is what actually tells assistive tech the field is in error.
		// Previously only `data-error` was set, which is styling-only.
		"aria-invalid": invalid || undefined,
	};

	// `className`/`style` stay on the control (or its decoration wrapper), exactly
	// as before this prop existed — the new field wrapper takes its own class, so
	// adding a label never moves a consumer's styling target.
	const control =
		!icon && !prefix && !suffix && !kbd ? (
			<input
				ref={ref}
				className={`ds-atom-input${className ? ` ${className}` : ""}`}
				data-error={invalid ? "true" : undefined}
				style={{ ...baseInputStyle, ...style }}
				{...inputProps}
			/>
		) : (
			// Wrapped input when icon/prefix/suffix/kbd is present - wrapper handles
			// border + focus-within ring so the inner <input> inherits.
			<div
				className={`ds-atom-input-wrap${className ? ` ${className}` : ""}`}
				data-error={invalid ? "true" : undefined}
				style={{ ...wrapStyle, ...style }}
			>
				{icon ? (
					<span style={{ display: "inline-flex", color: "var(--ink-3)" }}>{icon}</span>
				) : null}
				{prefix ? <span style={affixStyle}>{prefix}</span> : null}
				<input ref={ref} style={innerInputStyle} {...inputProps} />
				{suffix ? <span style={affixStyle}>{suffix}</span> : null}
				{kbd ? <kbd style={kbdStyle}>{kbd}</kbd> : null}
			</div>
		);

	// No field chrome requested → render exactly what we always did.
	if (!label && !hint && !errorMessage) return control;

	return (
		<div className="ds-atom-field">
			{label ? (
				<label className="ds-atom-field-label" htmlFor={inputId}>
					{label}
				</label>
			) : null}
			{control}
			{hint ? (
				<span className="ds-atom-field-hint" id={hintId}>
					{hint}
				</span>
			) : null}
			{errorMessage ? (
				// role="alert" so a validation message that appears after submit is
				// announced rather than sitting silently in the DOM.
				<span className="ds-atom-field-error" id={errorId} role="alert">
					{errorMessage}
				</span>
			) : null}
		</div>
	);
});
