import {
	type CSSProperties,
	type InputHTMLAttributes,
	type ReactNode,
	forwardRef,
	useEffect,
	useRef,
} from "react";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { Check } from "../../icons";
import { Field, useField } from "../Field";
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Visible text label rendered beside the checkbox. */
	label?: string;
	/** When true, sets the native DOM `indeterminate` property (the "some selected" tri-state).
	 * Cannot be expressed as a JSX attribute - set imperatively via a DOM property. */
	indeterminate?: boolean;
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

const boxStyle: CSSProperties = {
	width: 18,
	height: 18,
	borderRadius: 5,
	border: "2px solid var(--ink-4)",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	background: "transparent",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ label, className, disabled, style, indeterminate, hint, error, errorMessage, ...rest },
	ref,
) {
	const innerRef = useRef<HTMLInputElement>(null);
	const composedRef = useComposedRefs(innerRef, ref);

	// `indeterminate` is a DOM property (not an HTML attribute), so it cannot be
	// set via JSX. We imperatively set it via a ref-based useEffect whenever the
	// prop changes.
	useEffect(() => {
		if (innerRef.current) {
			innerRef.current.indeterminate = !!indeterminate;
		}
	}, [indeterminate]);

	const wiring = useField({ error, errorMessage, hint, id: rest.id });

	const control = (
		<label
			className={["ds-atom-checkbox-label", disabled ? "is-disabled" : "", className ?? ""]
				.filter(Boolean)
				.join(" ")}
			style={{
				...labelStyle,
				...(disabled ? { cursor: "not-allowed", opacity: 0.4 } : {}),
			}}
		>
			<input
				ref={composedRef}
				type="checkbox"
				className={`ds-atom-checkbox-input ${VISUALLY_HIDDEN}`}
				disabled={disabled}
				id={wiring.controlId}
				aria-invalid={wiring.invalid || undefined}
				aria-describedby={wiring.describedBy}
				data-error={wiring.invalid ? "true" : undefined}
				{...rest}
			/>
			<span className="ds-atom-checkbox-box" style={boxStyle} aria-hidden="true">
				<Check
					size={12}
					strokeWidth={3}
					color="#1c1917"
					style={{ display: "none" }}
					className="ds-atom-checkbox-check"
				/>
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
