import type { ReactNode } from "react";
import { useId } from "react";

export interface FieldWiring {
	/** `id` for the control, and the `htmlFor` target of the label. */
	controlId: string;
	/** `id` of the hint element, or undefined when there is no hint. */
	hintId: string | undefined;
	/** `id` of the error message, or undefined when there is no message. */
	errorId: string | undefined;
	/**
	 * Value for the control's `aria-describedby`, joining the hint and the error
	 * message with anything the caller already passed. Undefined when empty —
	 * `aria-describedby=""` is not the same as omitting it.
	 */
	describedBy: string | undefined;
	/**
	 * Whether the control is in an error state. True when `error` is set *or* an
	 * `errorMessage` is present: a message with no error styling would be
	 * contradictory, so the message implies the state.
	 */
	invalid: boolean;
}

export interface UseFieldOptions {
	error?: boolean;
	errorMessage?: ReactNode;
	hint?: ReactNode;
	/** An id the consumer supplied; a generated one is used when absent. */
	id?: string;
	/** An `aria-describedby` the consumer already passed, preserved rather than replaced. */
	describedBy?: string;
}

/**
 * Compute the id and ARIA wiring that a labelled form control needs.
 *
 * Split from `Field` because the two halves attach to different elements: the
 * ids and `aria-*` belong on the control, the label/hint/error markup wraps it.
 * A single component cannot inject props into an arbitrary child without cloning
 * it, and each control in this library has a different inner element.
 */
export function useField({
	error,
	errorMessage,
	hint,
	id,
	describedBy,
}: UseFieldOptions): FieldWiring {
	const generated = useId();
	const controlId = id ?? generated;
	const hintId = hint ? `${controlId}-hint` : undefined;
	const errorId = errorMessage ? `${controlId}-error` : undefined;
	return {
		controlId,
		hintId,
		errorId,
		describedBy: [describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined,
		invalid: Boolean(error) || Boolean(errorMessage),
	};
}

export interface FieldProps {
	label?: ReactNode;
	hint?: ReactNode;
	errorMessage?: ReactNode;
	/** From `useField`. */
	wiring: FieldWiring;
	/**
	 * Set when the control is not a single labelable element — a radio group, a
	 * segmented control, a star rating. A `<label for>` may only point at a
	 * labelable element, so for those the wrapper becomes a `<fieldset>` with a
	 * `<legend>`, which is the correct grouping label.
	 */
	group?: boolean;
	children: ReactNode;
	className?: string;
}

/**
 * The label / control / hint / error scaffold shared by every form control.
 *
 * TextInput and Textarea each hand-rolled this markup, and the other twelve
 * controls simply had no way to show a validation message at all — you could not
 * build a validated form out of Select, Checkbox or DatePicker without inventing
 * the error affordance yourself, differently each time. Extracting it means the
 * message renders, reads and announces identically everywhere.
 *
 * The error carries `role="alert"` so a message that appears on submit is
 * announced rather than sitting silently in the DOM.
 */
export function Field({
	label,
	hint,
	errorMessage,
	wiring,
	group,
	children,
	className,
}: FieldProps) {
	const body = (
		<>
			{children}
			{hint ? (
				<span className="ds-atom-field-hint" id={wiring.hintId}>
					{hint}
				</span>
			) : null}
			{errorMessage ? (
				<span className="ds-atom-field-error" id={wiring.errorId} role="alert">
					{errorMessage}
				</span>
			) : null}
		</>
	);

	const cls = ["ds-atom-field", className].filter(Boolean).join(" ");

	if (group) {
		return (
			<fieldset className={cls}>
				{label ? <legend className="ds-atom-field-label">{label}</legend> : null}
				{body}
			</fieldset>
		);
	}

	return (
		<div className={cls}>
			{label ? (
				<label className="ds-atom-field-label" htmlFor={wiring.controlId}>
					{label}
				</label>
			) : null}
			{body}
		</div>
	);
}
