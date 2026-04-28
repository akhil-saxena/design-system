// DS-54 — DateRangePicker primitive (Phase 16 Wave 2 / plan 16-06).
// Composes 2 DatePicker instances with shared range state per D-512.
// Click flow: 1st = start (clear end); 2nd = end (auto-swap if before
// start); 3rd = reset to new start. Between-state cells use the inRange
// predicate prop on inner DatePicker → cells get .is-in-range class
// (var(--amber-l) bg) — that CSS rule + the inRange/defaultMonth props
// shipped via 16-05 (commit e875555); 16-06 PURELY consumes them.
// Mobile <640px collapses to single calendar via CSS @media. NO time
// picker for v2.0 per D-512 (deferred to v2.1).
// Source: design-handoff/design-system/ds-pickers.jsx.
import { type CSSProperties, forwardRef, useState } from "react";
import { DatePicker } from "./DatePicker";
import { addMonths, isSameDay, isWithinRange } from "./_internals/dateUtils";

export interface DateRange {
	start: Date | null;
	end: Date | null;
}

export interface DateRangePickerProps {
	value: DateRange;
	onChange: (r: DateRange) => void;
	disablePast?: boolean;
	disableFuture?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Date-range picker (DS-54, D-512). Composes 2 DatePicker instances
 * side-by-side; mobile <640px collapses to single calendar via CSS.
 * Click flow: 1st = start (clear end); 2nd = end (auto-swap if before
 * start); 3rd = reset. Between-state cells styled via DatePicker's
 * inRange predicate prop. NO time picker for v2.0.
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
	function DateRangePicker(
		{ value, onChange, disablePast = false, disableFuture = false, className, style },
		ref,
	) {
		const [hoverDate, setHoverDate] = useState<Date | null>(null);
		const [leftMonth, setLeftMonth] = useState<Date>(() => value.start ?? new Date());

		function handleSelect(d: Date) {
			const { start, end } = value;
			// 3rd click — full range exists → reset to new start.
			if (start && end) {
				onChange({ start: d, end: null });
				setHoverDate(null);
				return;
			}
			// 1st click — no start → set start.
			if (!start) {
				onChange({ start: d, end: null });
				return;
			}
			// 2nd click — start exists, no end → set end (auto-swap if before start).
			if (d.getTime() < start.getTime()) {
				onChange({ start: d, end: start });
			} else {
				onChange({ start, end: d });
			}
			setHoverDate(null);
		}

		function inRange(d: Date): boolean {
			const { start, end } = value;
			if (start && end) {
				return isWithinRange(d, start, end) && !isSameDay(d, start) && !isSameDay(d, end);
			}
			// Hover preview while picking end.
			if (start && !end && hoverDate) {
				const lo = start.getTime() < hoverDate.getTime() ? start : hoverDate;
				const hi = start.getTime() < hoverDate.getTime() ? hoverDate : start;
				return isWithinRange(d, lo, hi) && !isSameDay(d, lo) && !isSameDay(d, hi);
			}
			return false;
		}

		const rightMonth = addMonths(leftMonth, 1);

		return (
			<div
				ref={ref}
				className={`ds-atom-daterangepicker${className ? ` ${className}` : ""}`}
				style={style}
				onMouseLeave={() => setHoverDate(null)}
			>
				<DatePicker
					value={value.start}
					onChange={handleSelect}
					onMonthChange={setLeftMonth}
					disablePast={disablePast}
					disableFuture={disableFuture}
					inRange={inRange}
				/>
				<DatePicker
					key={`right-${rightMonth.getFullYear()}-${rightMonth.getMonth()}`}
					value={value.end}
					onChange={handleSelect}
					disablePast={disablePast}
					disableFuture={disableFuture}
					inRange={inRange}
					defaultMonth={rightMonth}
				/>
			</div>
		);
	},
);

DateRangePicker.displayName = "DateRangePicker";
