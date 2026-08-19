import type { ReactNode } from "react";
import { useId } from "react";
import { FieldError } from "../../patterns/FormValidation";

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
	/**
	 * Renders the required marker (E15). Requiredness used to live in the label
	 * string — `"Alt text (required)"` — and got repeated in the hint, so every
	 * screen invented its own marker and they did not match. There is now exactly
	 * one.
	 *
	 * **This is the marker, not the semantics.** It does NOT set the native
	 * `required` attribute on the child: `Field` wraps an arbitrary subtree and
	 * does not own the control, so it cannot. Pass `required` to the control too —
	 * that attribute is what assistive technology actually announces, and it
	 * already passes through TextInput. A `Field` that appeared to enforce
	 * validation it cannot see would be worse than one that does not try.
	 */
	required?: boolean;
	/**
	 * Severity of `errorMessage` (E11). Forwarded to `FieldError`; `"warning"`
	 * announces through `role="status"` instead of `role="alert"`, so it does not
	 * interrupt.
	 * @default "error"
	 */
	errorTone?: "error" | "warning";
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
 * The error is rendered by `FieldError`, which carries `role="alert"` so a
 * message that appears on submit is announced rather than sitting silently in the
 * DOM — or `role="status"` at `errorTone="warning"`, which does not interrupt.
 */
export function Field({
	label,
	hint,
	errorMessage,
	wiring,
	group,
	required,
	errorTone,
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
			{/* Delegated rather than hand-rolled. This span used to be declared here
			    AND in FormValidation, two copies of the same markup that agreed by
			    coincidence — so the severity axis would have had to be added twice and
			    would have drifted. field-contract.test.tsx pins the delegation. */}
			<FieldError message={errorMessage} tone={errorTone} id={wiring.errorId} />
		</>
	);

	// The glyph itself lives in primitives.css keyed off this class, not as a
	// literal here, so a consumer can restyle it and a locale can change it.
	// aria-hidden because the control's own native `required` attribute is what
	// announces requiredness — a marker inside the accessible name says it twice.
	const marker = required ? <span aria-hidden="true" className="ds-atom-field-required" /> : null;

	const cls = ["ds-atom-field", className].filter(Boolean).join(" ");

	if (group) {
		return (
			<fieldset className={cls}>
				{label ? (
					// The marker goes INSIDE the legend for the same reason `group` exists
					// at all: a <label for> cannot name a group, so the grouping label is
					// the legend, and a marker outside it marks nothing.
					<legend className="ds-atom-field-label">
						{label}
						{marker}
					</legend>
				) : null}
				{body}
			</fieldset>
		);
	}

	return (
		<div className={cls}>
			{label ? (
				<label className="ds-atom-field-label" htmlFor={wiring.controlId}>
					{label}
					{marker}
				</label>
			) : null}
			{body}
		</div>
	);
}
