import { type CSSProperties, type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Field, useField } from "../Field";
import { Kbd } from "../Kbd";

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
const affixStyle: CSSProperties = {
	color: "var(--ink-3)",
	fontFamily: "var(--mono)",
	fontSize: 12,
	whiteSpace: "nowrap",
	flexShrink: 0,
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
	{ error, icon, prefix, suffix, kbd, label, hint, errorMessage, className, style, ...rest },
	ref,
) {
	// Shared with every other labelled control — see inputs/Field. An explicit
	// errorMessage implies the error state, and an existing `aria-describedby` is
	// preserved rather than replaced.
	const wiring = useField({
		error,
		errorMessage,
		hint,
		id: rest.id,
		describedBy: rest["aria-describedby"],
	});
	const { controlId: inputId, describedBy, invalid } = wiring;

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
				style={style}
				{...inputProps}
			/>
		) : (
			// Wrapped input when icon/prefix/suffix/kbd is present - wrapper handles
			// border + focus-within ring so the inner <input> inherits.
			<div
				className={`ds-atom-input-wrap${className ? ` ${className}` : ""}`}
				data-error={invalid ? "true" : undefined}
				style={style}
			>
				{icon ? (
					<span style={{ display: "inline-flex", color: "var(--ink-3)" }}>{icon}</span>
				) : null}
				{prefix ? <span style={affixStyle}>{prefix}</span> : null}
				<input ref={ref} className="ds-atom-input-inner" {...inputProps} />
				{suffix ? <span style={affixStyle}>{suffix}</span> : null}
				{/* A plain string is wrapped in the Kbd primitive; an element is rendered
				    as-is so a caller can pass their own <Kbd size="md"> without nesting
				    one <kbd> inside another. Previously this re-implemented Kbd's
				    styling inline. */}
				{kbd ? (
					typeof kbd === "string" || typeof kbd === "number" ? (
						<Kbd size="sm">{kbd}</Kbd>
					) : (
						kbd
					)
				) : null}
			</div>
		);

	// No field chrome requested → render exactly what we always did.
	if (!label && !hint && !errorMessage) return control;

	return (
		<Field label={label} hint={hint} errorMessage={errorMessage} wiring={wiring}>
			{control}
		</Field>
	);
});
