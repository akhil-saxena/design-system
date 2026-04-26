import { Minus, Plus } from "lucide-react";
import { type CSSProperties, type ReactNode, forwardRef, useEffect, useState } from "react";

export interface NumberStepperProps {
	value: number;
	onChange: (next: number) => void;
	min?: number;
	max?: number;
	step?: number;
	prefix?: ReactNode;
	suffix?: ReactNode;
	formatFn?: (value: number) => string;
	disabled?: boolean;
	ariaLabel?: string;
	className?: string;
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
