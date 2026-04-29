// DS-54 — DateRangePicker primitive (Phase 16 Wave 2 / plan 16-06).
// v0.5.1 patch — single-calendar redesign per user feedback.
// Composes ONE DatePicker instance; click flow stays identical:
// 1st = start (clear end); 2nd = end (auto-swap if before start);
// 3rd = reset to new start. Hover preview between selected start and
// current hover via inRange prop on the inner DatePicker (between-state
// cells get .is-in-range class). Overrides the original D-512 two-cal
// layout — see .planning/phases/16-wave-5-compound-inputs/v0.5.1-feedback.md.
// Source: design-handoff/design-system/ds-pickers.jsx (single-cal range).
// v0.5.2 — both range endpoints (start + end) now render with the amber
// selected marker via DatePicker.isCellSelected; previously only `end`
// was marked, leaving start visually identical to in-range cells. Also
// makes 1-day range (start === end) visually obvious as a single amber cell.
// v0.5.3 — light-amber range bg now wraps under start/end pills via
// isRangeStart/isRangeEnd modifier props (resolves notch artifact at endpoints).
import { type CSSProperties, forwardRef, useState } from "react";
import { DatePicker } from "./DatePicker";
import { isSameDay, isWithinRange } from "./_internals/dateUtils";

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
 * Date-range picker (DS-54). Single calendar with click-twice flow:
 * 1st click = start (end cleared); 2nd click = end (auto-swap if before
 * start); 3rd click = reset to new start. Hover preview between selected
 * start and current hover styled via DatePicker's inRange predicate prop.
 * NO time picker for v2.0 (deferred to v2.1).
 *
 * Single-calendar redesign (v0.5.1) overrides the original D-512 two-cal
 * layout — matches handoff `ds-pickers.jsx` and user preference.
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
	function DateRangePicker(
		{ value, onChange, disablePast = false, disableFuture = false, className, style },
		ref,
	) {
		const [hoverDate, setHoverDate] = useState<Date | null>(null);

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

		// Drive controlled value to whichever endpoint is "active" — when end is
		// set, show end; otherwise show start (or null). The single calendar
		// renders all interaction.
		const activeValue = value.end ?? value.start;

		return (
			<div
				ref={ref}
				className={`ds-atom-daterangepicker${className ? ` ${className}` : ""}`}
				style={style}
				onMouseLeave={() => setHoverDate(null)}
			>
				<DatePicker
					value={activeValue}
					onChange={handleSelect}
					disablePast={disablePast}
					disableFuture={disableFuture}
					inRange={inRange}
					isCellSelected={(d) => {
						const { start, end } = value;
						if (start && isSameDay(d, start)) return true;
						if (end && isSameDay(d, end)) return true;
						return false;
					}}
					isRangeStart={(d) => {
						const { start, end } = value;
						if (!start || !end) return false;
						if (isSameDay(start, end)) return false; // 1-day range — no edge polish needed
						return isSameDay(d, start);
					}}
					isRangeEnd={(d) => {
						const { start, end } = value;
						if (!start || !end) return false;
						if (isSameDay(start, end)) return false;
						return isSameDay(d, end);
					}}
				/>
			</div>
		);
	},
);

DateRangePicker.displayName = "DateRangePicker";
