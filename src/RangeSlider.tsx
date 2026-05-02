import { type ChangeEvent, type InputHTMLAttributes, forwardRef } from "react";

export interface RangeSliderProps
	extends Omit<
		InputHTMLAttributes<HTMLInputElement>,
		"type" | "value" | "onChange" | "min" | "max" | "step" | "disabled"
	> {
	/** Controlled numeric value of the slider thumb position. */
	value: number;
	/** Called on every thumb movement with the new numeric value and the native event. */
	onChange: (value: number, e: ChangeEvent<HTMLInputElement>) => void;
	/** Minimum selectable value.
	 * @default 0
	 */
	min?: number;
	/** Maximum selectable value.
	 * @default 100
	 */
	max?: number;
	/** Increment between selectable values.
	 * @default 1
	 */
	step?: number;
	/** Optional text label rendered above the track on the left side. */
	label?: string;
	/** Formats the current value displayed on the right side of the label row. */
	valueFormat?: (value: number) => string;
	/** When true, disables the slider and grays it out. */
	disabled?: boolean;
	/** Accessible label for the underlying `<input type="range">`; falls back to `label`. */
	ariaLabel?: string;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(function RangeSlider(
	{
		value,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		label,
		valueFormat,
		disabled,
		ariaLabel,
		className,
		style,
		...rest
	},
	ref,
) {
	const range = max - min;
	const pct = range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const next = Number(e.target.value);
		onChange(next, e);
	};

	return (
		<div
			className={`ds-atom-range${className ? ` ${className}` : ""}`}
			style={style}
			data-disabled={disabled ? "true" : undefined}
		>
			{(label != null || valueFormat) && (
				<div className="ds-atom-range-label-row">
					{label != null && <span className="ds-atom-range-label">{label}</span>}
					{valueFormat && <span className="ds-atom-range-value">{valueFormat(value)}</span>}
				</div>
			)}
			<div className="ds-atom-range-track-wrap">
				<input
					ref={ref}
					type="range"
					className="ds-atom-range-input"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleChange}
					disabled={disabled}
					aria-label={ariaLabel ?? label}
					{...rest}
				/>
				<div className="ds-atom-range-track" aria-hidden="true">
					<div className="ds-atom-range-fill" style={{ width: `${pct}%` }} />
				</div>
				<div className="ds-atom-range-thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
			</div>
		</div>
	);
});
