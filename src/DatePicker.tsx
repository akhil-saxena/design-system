// DS-53 — DatePicker primitive (Phase 16 Wave 1 / plan 16-05).
// 7×6 calendar grid with controlled value, optional time picker, event dots.
// Composed by DateRangePicker (16-06) via inRange + defaultMonth backward-
// compatible API additions. NO date-fns dep — uses pure helpers from
// ./_internals/dateUtils (D-510). See design-handoff/design-system/ds-pickers.jsx.
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

	function updateTime(field: "h" | "m", n: number) {
		const base = value ?? new Date();
		const out = new Date(base);
		if (field === "h") out.setHours(Math.max(0, Math.min(23, n)));
		else out.setMinutes(Math.max(0, Math.min(59, n)));
		onChange(out);
	}

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
					const selected = !!(value && isSameDay(date, value));
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
						min={0}
						max={23}
						value={value?.getHours() ?? 0}
						onChange={(e) => updateTime("h", Number(e.target.value))}
					/>
					<span>:</span>
					<input
						type="number"
						aria-label="Minutes"
						min={0}
						max={59}
						value={value?.getMinutes() ?? 0}
						onChange={(e) => updateTime("m", Number(e.target.value))}
					/>
				</div>
			) : null}
		</div>
	);
});

DatePicker.displayName = "DatePicker";
