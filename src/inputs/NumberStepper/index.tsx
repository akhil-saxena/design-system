import { type CSSProperties, type ReactNode, forwardRef, useEffect, useState } from "react";
import { Minus, Plus } from "../../icons";
import { Field, useField } from "../Field";
import { IconButton } from "../IconButton";
export interface NumberStepperProps {
	/** Controlled numeric value. */
	value: number;
	/** Called with the clamped next value after each increment, decrement, or manual edit. */
	onChange: (next: number) => void;
	/** Minimum allowed value; decrement button disables at this boundary. */
	min?: number;
	/** Maximum allowed value; increment button disables at this boundary. */
	max?: number;
	/** Amount added or subtracted per button click.
	 * @default 1
	 */
	step?: number;
	/** Optional leading adornment (e.g. currency symbol) rendered before the value. */
	prefix?: ReactNode;
	/** Optional trailing adornment (e.g. unit label) rendered after the value. */
	suffix?: ReactNode;
	/** Custom display formatter called when the input is not focused; raw value shown while editing. */
	formatFn?: (value: number) => string;
	/** When true, disables all interaction including both buttons and the input. */
	disabled?: boolean;
	/**
	 * Accessible label for the numeric field.
	 *
	 * Applied to the `<input>` itself. It previously landed on the wrapping
	 * `<div>`, whose implicit `generic` role prohibits naming — so it was
	 * discarded and the field reached assistive tech with no name at all.
	 *
	 * Defaults to `"Value"` so the field is never *unnamed*; always pass
	 * something meaningful ("Quantity", "Guests", "Price") in real usage.
	 *
	 * @default "Value"
	 */
	ariaLabel?: string;
	/** Additional className applied to the root wrapper element. */
	className?: string;
	/** Inline styles applied to the root wrapper element. */
	style?: CSSProperties;
	/** Helper text under the control, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Applies the error state. Implied by `errorMessage`. */
	error?: boolean;
	/** Validation message under the control; sets `aria-invalid` and is announced. */
	errorMessage?: ReactNode;
}

function clamp(v: number, min?: number, max?: number) {
	let next = v;
	if (typeof min === "number") next = Math.max(min, next);
	if (typeof max === "number") next = Math.min(max, next);
	return next;
}

export const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
	function NumberStepper(
		{
			value,
			onChange,
			min,
			max,
			step = 1,
			prefix,
			suffix,
			formatFn,
			disabled,
			ariaLabel = "Value",
			className,
			style,
			hint,
			error,
			errorMessage,
		},
		ref,
	) {
		const wiring = useField({ error, errorMessage, hint });
		const [focused, setFocused] = useState(false);
		const [buffer, setBuffer] = useState(String(value));

		useEffect(() => {
			if (!focused) setBuffer(String(value));
		}, [value, focused]);

		const display = focused ? buffer : formatFn ? formatFn(value) : String(value);

		const dec = () => {
			if (disabled) return;
			onChange(clamp(value - step, min, max));
		};
		const inc = () => {
			if (disabled) return;
			onChange(clamp(value + step, min, max));
		};

		const commit = () => {
			const parsed = Number.parseFloat(buffer.replace(/[^0-9.\-]/g, ""));
			const next = Number.isNaN(parsed) ? value : clamp(parsed, min, max);
			onChange(next);
			setFocused(false);
			setBuffer(String(next));
		};

		const decDisabled = disabled || (typeof min === "number" && value <= min);
		const incDisabled = disabled || (typeof max === "number" && value >= max);

		const control = (
			// `aria-label` used to sit here, on a role-less <div> — a generic role,
			// which prohibits naming, so it was discarded. The numeric <input> below
			// was therefore completely unnamed. The name now goes on the input, which
			// is the control the user actually lands on.
			<div className={`ds-atom-stepper${className ? ` ${className}` : ""}`} style={style}>
				<IconButton
					size="sm"
					className="ds-atom-stepper-btn"
					onClick={dec}
					disabled={decDisabled}
					label="Decrement"
					icon={<Minus size={14} strokeWidth={2.5} />}
				/>
				<div className="ds-atom-stepper-display">
					{prefix != null && <span className="ds-atom-stepper-affix">{prefix}</span>}
					<input
						ref={ref}
						className="ds-atom-stepper-input"
						type="text"
						inputMode="decimal"
						aria-label={ariaLabel}
						id={wiring.controlId}
						aria-invalid={wiring.invalid || undefined}
						aria-describedby={wiring.describedBy}
						value={display}
						disabled={disabled}
						onFocus={() => {
							setFocused(true);
							setBuffer(String(value));
						}}
						onChange={(e) => setBuffer(e.target.value)}
						onBlur={commit}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								commit();
								(e.currentTarget as HTMLInputElement).blur();
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								inc();
							} else if (e.key === "ArrowDown") {
								e.preventDefault();
								dec();
							}
						}}
					/>
					{suffix != null && <span className="ds-atom-stepper-affix">{suffix}</span>}
				</div>
				<IconButton
					size="sm"
					className="ds-atom-stepper-btn"
					onClick={inc}
					disabled={incDisabled}
					label="Increment"
					icon={<Plus size={14} strokeWidth={2.5} />}
				/>
			</div>
		);

		if (!hint && !errorMessage) return control;

		return (
			<Field hint={hint} errorMessage={errorMessage} wiring={wiring}>
				{control}
			</Field>
		);
	},
);
