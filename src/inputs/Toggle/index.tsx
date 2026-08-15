import { type CSSProperties, type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Field, useField } from "../Field";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Visible text label rendered beside the toggle track. */
	label?: string;
	/** Helper text under the control, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Applies the error-state styling. Implied by `errorMessage`. */
	error?: boolean;
	/**
	 * Validation message rendered under the control — "you must accept the terms"
	 * is the canonical case. Wired to `aria-describedby`, carries `role="alert"`,
	 * and sets `aria-invalid` on the input.
	 */
	errorMessage?: ReactNode;
}

const labelStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	cursor: "pointer",
	fontFamily: "var(--font)",
	fontSize: 13,
	color: "var(--ink)",
	userSelect: "none",
};

// The native control stays focusable and hit-testable; only its painting is
// suppressed, so the styled box beside it is a pure visual proxy. Uses the
// shared `.ds-visually-hidden` rule (primitives.css) rather than re-inlining
// the legacy `clip: rect(0,0,0,0)` recipe this file used to carry — that
// property is deprecated, and Checkbox/Radio/Toggle each kept their own copy.
const VISUALLY_HIDDEN = "ds-visually-hidden";

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
	{
		label,
		className,
		disabled,
		style,
		checked,
		defaultChecked,
		hint,
		error,
		errorMessage,
		...rest
	},
	ref,
) {
	const ariaChecked = checked ?? defaultChecked ?? false;
	const wiring = useField({ error, errorMessage, hint, id: rest.id });

	const control = (
		<label
			className={`ds-atom-toggle-label${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
			style={{
				...labelStyle,
				...(disabled ? { cursor: "not-allowed", opacity: 0.4 } : {}),
			}}
		>
			<input
				ref={ref}
				type="checkbox"
				role="switch"
				aria-checked={ariaChecked}
				className={`ds-atom-toggle-input ${VISUALLY_HIDDEN}`}
				disabled={disabled}
				checked={checked}
				defaultChecked={defaultChecked}
				id={wiring.controlId}
				aria-invalid={wiring.invalid || undefined}
				aria-describedby={wiring.describedBy}
				data-error={wiring.invalid ? "true" : undefined}
				{...rest}
			/>
			<span className="ds-atom-toggle-track" aria-hidden="true">
				<span className="ds-atom-toggle-thumb" />
			</span>
			{label ? <span style={style}>{label}</span> : null}
		</label>
	);

	// The visible label stays inside the control's own <label>, so Field supplies
	// only the message row here — a second <label htmlFor> would nest labels.
	if (!hint && !errorMessage) return control;

	return (
		<Field hint={hint} errorMessage={errorMessage} wiring={wiring}>
			{control}
		</Field>
	);
});
