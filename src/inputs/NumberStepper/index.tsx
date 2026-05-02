import { type CSSProperties, type ReactNode, forwardRef, useEffect, useState } from "react";
import { Minus, Plus } from "../../icons";
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
	/** Accessible label for the stepper container used by assistive technology. */
	ariaLabel?: string;
	/** Additional className applied to the root wrapper element. */
	className?: string;
	/** Inline styles applied to the root wrapper element. */
	style?: CSSProperties;
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
			ariaLabel,
			className,
			style,
		},
		ref,
	) {
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

		return (
			<div
				className={`ds-atom-stepper${className ? ` ${className}` : ""}`}
				style={style}
				aria-label={ariaLabel}
			>
				<button
					type="button"
					className="ds-atom-stepper-btn"
					onClick={dec}
					disabled={decDisabled}
					aria-label="Decrement"
				>
					<Minus size={14} strokeWidth={2.5} />
				</button>
				<div className="ds-atom-stepper-display">
					{prefix != null && <span className="ds-atom-stepper-affix">{prefix}</span>}
					<input
						ref={ref}
						className="ds-atom-stepper-input"
						type="text"
						inputMode="decimal"
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
				<button
					type="button"
					className="ds-atom-stepper-btn"
					onClick={inc}
					disabled={incDisabled}
					aria-label="Increment"
				>
					<Plus size={14} strokeWidth={2.5} />
				</button>
			</div>
		);
	},
);
