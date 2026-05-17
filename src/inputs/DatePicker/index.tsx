import { type HTMLAttributes, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { buildMonthGrid } from "../../_internals/calendarGrid";
import { addMonths, isSameDay, isToday, startOfMonth } from "../../_internals/dateUtils"; // DS-53 - DatePicker primitive (Phase 16 Wave 1 / plan 16-05).
// 7×6 calendar grid with controlled value, optional time picker, event dots.
// Composed by DateRangePicker (16-06) via inRange + defaultMonth backward-
// compatible API additions. NO date-fns dep - uses pure helpers from
// ./_internals/dateUtils (D-510). See design-handoff/design-system/ds-pickers.jsx.
// v0.5.2 - isCellSelected override prop added so DateRangePicker can mark
// BOTH endpoints (start + end) with the amber selected marker.
// v0.5.3 - added isRangeStart/isRangeEnd modifier props for range-edge bg polish.
// v0.6.0 - `variant="popover"` renders a trigger pill that opens the calendar in
// a DS Popover. Backwards-compatible: default variant stays "inline".
import { ChevronLeft, ChevronRight } from "../../icons";
import { Popover } from "../../overlays/Popover";
import { Button } from "../Button";
export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Controlled selected date; pass `null` for no selection. */
	value: Date | null;
	/** Called when the user clicks a calendar day cell with the selected Date. */
	onChange: (d: Date) => void;
	/** Called when the user navigates to a different month, with the first day of that month. */
	onMonthChange?: (d: Date) => void;
	/** Predicate that returns true for dates that should be disabled (unclickable). */
	disabled?: (d: Date) => boolean;
	/** Array of dates that receive an event-dot indicator on their cell. */
	events?: Date[];
	/** When true, all dates before today are disabled.
	 * @default false
	 */
	disablePast?: boolean;
	/** When true, all dates after today are disabled.
	 * @default false
	 */
	disableFuture?: boolean;
	/** When true, renders a 12-hour time picker row below the grid.
	 * @default false
	 */
	showTime?: boolean;
	/** Predicate for cells that fall within an in-progress date range; adds the amber-light between-state bg. Consumed by DateRangePicker. */
	inRange?: (d: Date) => boolean;
	/** Initial month displayed when `value` is null; useful for range-picker right calendar. */
	defaultMonth?: Date;
	/** Override cell-selected detection; DateRangePicker uses this to highlight both range endpoints. */
	isCellSelected?: (d: Date) => boolean;
	/** Marks a cell as the start of a range for edge-pill visual polish; used by DateRangePicker. */
	isRangeStart?: (d: Date) => boolean;
	/** Marks a cell as the end of a range for edge-pill visual polish; used by DateRangePicker. */
	isRangeEnd?: (d: Date) => boolean;
	/** Render mode. `"inline"` (default) shows the calendar grid in flow. `"popover"`
	 * renders a trigger pill that opens the grid in an anchored DS Popover.
	 * @default "inline"
	 */
	variant?: "inline" | "popover";
	/** Placeholder text shown on the trigger pill when `value` is null. Only used when `variant="popover"`. */
	placeholder?: string;
	/** Override the date formatter for the trigger pill label. Only used when `variant="popover"`. */
	formatLabel?: (d: Date, showTime: boolean) => string;
}

// Pill label format mirrors the design handoff (§02 State B): "Sat 17 May" for
// date-only and "Sat 17 May · 3:30 PM" when showTime is on. Locale-aware so
// non-English locales pick up their own short weekday + month name.
function defaultFormatLabel(d: Date, showTime: boolean): string {
	const datePart = d.toLocaleDateString(undefined, {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
	if (!showTime) return datePart;
	const timePart = d.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	return `${datePart} · ${timePart}`;
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
		isRangeStart,
		isRangeEnd,
		variant = "inline",
		placeholder = "Pick a date",
		formatLabel,
		className,
		style,
		...rest
	},
	ref,
) {
	// Popover state lives at the top of the component so hooks fire in stable
	// order regardless of variant (variant can't change between renders but
	// React still calls every hook each render).
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);
	// Snapshot the value at open so Cancel can revert. The committed value
	// only updates the parent on Apply; live edits inside the popover still
	// call onChange so the calendar reflects the in-progress selection.
	const [valueAtOpen, setValueAtOpen] = useState<Date | null>(null);
	useEffect(() => {
		if (popoverOpen) setValueAtOpen(value);
	}, [popoverOpen, value]);
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

	const { cells } = useMemo(
		() => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), 0),
		[viewMonth],
	);

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

	// Time picker uses 12-hour mode with AM/PM toggle (v0.5.1 patch - was 24-hour).
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

	// Body is the calendar grid + (optional) time row — shared by both the
	// inline render and the popover render. Header chrome (month nav) is part
	// of the body. The outer .ds-atom-datepicker wrapper is what differs.
	const body = (
		<>
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
					const isRangeStartCell = !!isRangeStart?.(date);
					const isRangeEndCell = !!isRangeEnd?.(date);
					const hasEvent = eventSet.has(dayKey(date));
					const cls = [
						"ds-atom-datepicker-cell",
						!inMonth && "is-out",
						selected && "is-selected",
						isRangeStartCell && "is-range-start",
						isRangeEndCell && "is-range-end",
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
							<span className="ds-atom-datepicker-cell-num">{date.getDate()}</span>
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
					<Button
						size="sm"
						variant={displayPeriod === "PM" ? "primary" : "secondary"}
						aria-label={`Currently ${displayPeriod} - click to switch`}
						aria-pressed={displayPeriod === "PM"}
						onClick={() => togglePeriod(displayPeriod === "AM" ? "PM" : "AM")}
						style={{
							fontFamily: "var(--mono)",
							fontWeight: 700,
							letterSpacing: "0.04em",
							flexShrink: 0,
							width: 48,
						}}
					>
						{displayPeriod}
					</Button>
				</div>
			) : null}
		</>
	);

	if (variant === "popover") {
		const fmt = formatLabel ?? defaultFormatLabel;
		const triggerLabel = value ? fmt(value, showTime) : placeholder;
		return (
			<>
				<button
					ref={triggerRef}
					type="button"
					className={`ds-atom-datepicker-trigger${popoverOpen ? " is-open" : ""}${className ? ` ${className}` : ""}`}
					aria-haspopup="dialog"
					aria-expanded={popoverOpen}
					onClick={() => setPopoverOpen((o) => !o)}
					style={style}
				>
					<span className={`ds-atom-datepicker-trigger-label${value ? "" : " is-placeholder"}`}>
						{triggerLabel}
					</span>
					<span aria-hidden="true" className="ds-atom-datepicker-trigger-caret">
						▾
					</span>
				</button>
				<Popover
					anchorRef={triggerRef}
					open={popoverOpen}
					onOpenChange={setPopoverOpen}
					placement="bottom-start"
					offset={6}
					className="ds-atom-datepicker-popover"
				>
					<div ref={ref} className="ds-atom-datepicker is-popover" {...rest}>
						{body}
						<div className="ds-atom-datepicker-popover-actions">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => {
									if (valueAtOpen !== value) {
										// Best-effort revert: only call onChange if we have a snapshot
										// AND the parent's value differs from it. If valueAtOpen is null
										// and value isn't, callers using a non-nullable state shape
										// must handle the null case themselves.
										if (valueAtOpen) onChange(valueAtOpen);
									}
									setPopoverOpen(false);
								}}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								variant="primary"
								onClick={() => setPopoverOpen(false)}
								disabled={!value}
							>
								Apply
							</Button>
						</div>
					</div>
				</Popover>
			</>
		);
	}

	return (
		<div
			ref={ref}
			className={`ds-atom-datepicker${className ? ` ${className}` : ""}`}
			style={style}
			{...rest}
		>
			{body}
		</div>
	);
});

DatePicker.displayName = "DatePicker";
