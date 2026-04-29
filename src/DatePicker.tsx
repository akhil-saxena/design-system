// DS-53 — DatePicker primitive (Phase 16 Wave 1 / plan 16-05).
// 7×6 calendar grid with controlled value, optional time picker, event dots.
// Composed by DateRangePicker (16-06) via inRange + defaultMonth backward-
// compatible API additions. NO date-fns dep — uses pure helpers from
// ./_internals/dateUtils (D-510). See design-handoff/design-system/ds-pickers.jsx.
// v0.5.2 — isCellSelected override prop added so DateRangePicker can mark
// BOTH endpoints (start + end) with the amber selected marker.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type HTMLAttributes, forwardRef, useEffect, useMemo, useState } from "react";
import { addMonths, daysInMonth, isSameDay, isToday, startOfMonth } from "./_internals/dateUtils";

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	value: Date | null;
	onChange: (d: Date) => void;
	onMonthChange?: (d: Date) => void;
	disabled?: (d: Date) => boolean;
	events?: Date[];
	disablePast?: boolean;
	disableFuture?: boolean;
	showTime?: boolean;
	/**
	 * Optional predicate. When provided, cells where `inRange(d)` returns true
	 * carry the `is-in-range` modifier class (between-state amber-light bg).
	 * Backward-compatible API addition consumed by DateRangePicker (16-06).
	 */
	inRange?: (d: Date) => boolean;
	/**
	 * Initial month to display when uncontrolled (i.e. `value` is null).
	 * Consumed by DateRangePicker (16-06) right calendar to default to month+1.
	 */
	defaultMonth?: Date;
	/**
	 * Optional override for cell-selected detection. When provided, replaces
	 * the default `value && isSameDay(date, value)` logic. Use case:
	 * DateRangePicker marks BOTH start AND end as selected. v0.5.2.
	 */
	isCellSelected?: (d: Date) => boolean;
}

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"]; // Sunday-first per D-510
const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function dayKey(d: Date): string {
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
	{
		value,
		onChange,
		onMonthChange,
		disabled,
		events,
		disablePast = false,
		disableFuture = false,
		showTime = false,
		inRange,
		defaultMonth,
		isCellSelected,
		className,
		style,
		...rest
	},
	ref,
) {
	const [viewMonth, setViewMonth] = useState<Date>(() =>
		startOfMonth(value ?? defaultMonth ?? new Date()),
	);

	// Sync viewMonth when caller swaps `value` to a different month while controlled.
	useEffect(() => {
		if (value) {
			const target = startOfMonth(value);
			if (
				target.getFullYear() !== viewMonth.getFullYear() ||
				target.getMonth() !== viewMonth.getMonth()
			) {
				setViewMonth(target);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const today = new Date();

	const cells = useMemo(() => {
		const first = startOfMonth(viewMonth);
		const firstWeekday = first.getDay(); // 0=Sun
		const dim = daysInMonth(viewMonth);
		const out: { date: Date; inMonth: boolean }[] = [];
		// Prev-month tail padding
		for (let i = firstWeekday - 1; i >= 0; i--) {
			out.push({
				date: new Date(first.getFullYear(), first.getMonth(), -i),
				inMonth: false,
			});
		}
		// Current month
		for (let d = 1; d <= dim; d++) {
			out.push({
				date: new Date(first.getFullYear(), first.getMonth(), d),
				inMonth: true,
			});
		}
		// Pad to 42 cells (6 rows × 7 cols)
		while (out.length < 42) {
			const last = out[out.length - 1]!.date;
			out.push({
				date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
				inMonth: false,
			});
		}
		return out;
	}, [viewMonth]);

	function step(n: number) {
		const next = addMonths(viewMonth, n);
		setViewMonth(next);
		onMonthChange?.(next);
	}

	function isPastDisabled(d: Date) {
		if (!disablePast) return false;
		const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
		return d.getTime() < t0;
	}

	function isFutureDisabled(d: Date) {
		if (!disableFuture) return false;
		const t0 = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			23,
			59,
			59,
			999,
		).getTime();
		return d.getTime() > t0;
	}

	function handleSelect(d: Date) {
		if (disabled?.(d) || isPastDisabled(d) || isFutureDisabled(d)) return;
		const out = new Date(d);
		if (showTime && value) {
			out.setHours(value.getHours(), value.getMinutes());
		}
		onChange(out);
	}

	// Time picker uses 12-hour mode with AM/PM toggle (v0.5.1 patch — was 24-hour).
	// Internal Date object stays in 24-hour for caller consumption.
	function updateHour12(h12: number) {
		const base = value ?? new Date();
		const out = new Date(base);
		const isPm = base.getHours() >= 12;
		const clamped = Math.max(1, Math.min(12, h12));
		const h24 = isPm ? (clamped === 12 ? 12 : clamped + 12) : clamped === 12 ? 0 : clamped;
		out.setHours(h24);
		onChange(out);
	}

	function updateMinute(n: number) {
		const base = value ?? new Date();
		const out = new Date(base);
		out.setMinutes(Math.max(0, Math.min(59, n)));
		onChange(out);
	}

	function togglePeriod(period: "AM" | "PM") {
		const base = value ?? new Date();
		const currentHours = base.getHours();
		const currentIsPm = currentHours >= 12;
		const targetIsPm = period === "PM";
		if (currentIsPm === targetIsPm) return;
		const out = new Date(base);
		out.setHours(targetIsPm ? currentHours + 12 : currentHours - 12);
		onChange(out);
	}

	const displayHour24 = value?.getHours() ?? 0;
	const displayHour12 = displayHour24 % 12 === 0 ? 12 : displayHour24 % 12;
	const displayPeriod: "AM" | "PM" = displayHour24 >= 12 ? "PM" : "AM";

	const eventSet = useMemo(() => new Set((events ?? []).map((e) => dayKey(e))), [events]);

	return (
		<div
			ref={ref}
			className={`ds-atom-datepicker${className ? ` ${className}` : ""}`}
			style={style}
			{...rest}
		>
			<div className="ds-atom-datepicker-header">
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => step(-1)}
					className="ds-atom-datepicker-nav"
				>
					<ChevronLeft size={14} />
				</button>
				<div className="ds-atom-datepicker-label">
					{MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
				</div>
				<button
					type="button"
					aria-label="Next month"
					onClick={() => step(1)}
					className="ds-atom-datepicker-nav"
				>
					<ChevronRight size={14} />
				</button>
			</div>

			<div className="ds-atom-datepicker-weekdays">
				{WEEKDAY_HEADERS.map((w, i) => (
					<div key={`wd-${i}-${w}`} className="ds-atom-datepicker-weekday">
						{w}
					</div>
				))}
			</div>

			{/* biome-ignore lint/a11y/useSemanticElements: <table> is form-tabular semantic; ARIA grid role on a div is the standard pattern for interactive calendars where each cell is a focusable button (matches react-aria + Radix Calendar) */}
			<div className="ds-atom-datepicker-grid" role="grid">
				{cells.map(({ date, inMonth }) => {
					const selected = isCellSelected
						? isCellSelected(date)
						: !!(value && isSameDay(date, value));
					const todayCell = isToday(date);
					const isDisabled = !!disabled?.(date) || isPastDisabled(date) || isFutureDisabled(date);
					const inRangeMatch = !!inRange?.(date);
					const hasEvent = eventSet.has(dayKey(date));
					const cls = [
						"ds-atom-datepicker-cell",
						!inMonth && "is-out",
						selected && "is-selected",
						todayCell && "is-today",
						isDisabled && "is-disabled",
						inRangeMatch && "is-in-range",
					]
						.filter(Boolean)
						.join(" ");
					return (
						<button
							key={dayKey(date)}
							type="button"
							// biome-ignore lint/a11y/useSemanticElements: <td> is for tabular form data; gridcell role on a <button> is required so each calendar day is keyboard-focusable + clickable via Enter/Space (matches react-aria + Radix Calendar pattern)
							role="gridcell"
							aria-selected={selected ? true : undefined}
							aria-current={todayCell ? "date" : undefined}
							aria-disabled={isDisabled || undefined}
							className={cls}
							disabled={isDisabled}
							onClick={() => handleSelect(date)}
						>
							<span>{date.getDate()}</span>
							{hasEvent ? (
								<span className="ds-atom-datepicker-event-dot" aria-hidden="true" />
							) : null}
						</button>
					);
				})}
			</div>

			{showTime ? (
				<div className="ds-atom-datepicker-time">
					<input
						type="number"
						aria-label="Hours"
						min={1}
						max={12}
						value={displayHour12}
						onChange={(e) => updateHour12(Number(e.target.value))}
					/>
					<span className="ds-atom-datepicker-time-sep">:</span>
					<input
						type="number"
						aria-label="Minutes"
						min={0}
						max={59}
						value={value?.getMinutes() ?? 0}
						onChange={(e) => updateMinute(Number(e.target.value))}
					/>
					{/* biome-ignore lint/a11y/useSemanticElements: <fieldset> would inject default browser legend/border styling that conflicts with our segmented-control look; role="group" + aria-label is the WAI-ARIA equivalent for a 2-button toggle (matches Radix Toggle Group pattern) */}
					<div className="ds-atom-datepicker-time-period" role="group" aria-label="AM or PM">
						<button
							type="button"
							className={`ds-atom-datepicker-time-period-btn${
								displayPeriod === "AM" ? " is-active" : ""
							}`}
							aria-pressed={displayPeriod === "AM"}
							onClick={() => togglePeriod("AM")}
						>
							AM
						</button>
						<button
							type="button"
							className={`ds-atom-datepicker-time-period-btn${
								displayPeriod === "PM" ? " is-active" : ""
							}`}
							aria-pressed={displayPeriod === "PM"}
							onClick={() => togglePeriod("PM")}
						>
							PM
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
});

DatePicker.displayName = "DatePicker";
