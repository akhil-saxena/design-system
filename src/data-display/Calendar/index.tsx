/**
 * # Usage Audit - Calendar (DS-68, D-17-20..D-17-25)
 *
 * Three views: month (default), week, day.
 * Built on extracted calendarGrid utility (shared with DatePicker after Plan 02 refactor).
 * Event chips on day cells with overflow Popover (desktop) / BottomSheet (mobile ≤640px).
 * Compound: <Calendar.Agenda events={...} /> consumer-rendered slot.
 *
 * API:
 *   <Calendar
 *     events={events}
 *     view="month"
 *     selectedDate={selected}
 *     onSelectedDateChange={setSelected}
 *     weekStart={1}
 *   />
 *
 *   <Calendar.Agenda events={events} />
 *
 * Security: event.label is rendered via JSX text interpolation only.
 * Never dangerouslySetInnerHTML. React escapes all text content. (T-17-12-01)
 */
import { type CSSProperties, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { buildMonthGrid, getWeekDayLabels } from "../../_internals/calendarGrid";
import { useDateGrid } from "../../hooks/useDateGrid";
import { useMatchMedia } from "../../hooks/useMatchMedia";
import { ChevronLeft, ChevronRight } from "../../icons";
import { IconButton } from "../../inputs/IconButton";
import { BottomSheet } from "../../overlays/BottomSheet";
import { HoverCard } from "../../overlays/HoverCard";
import { Popover } from "../../overlays/Popover";
import { SegmentedControl } from "../SegmentedControl";
// ─── Types ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
	id: string;
	date: Date | string; // string interpreted as ISO
	endDate?: Date | string; // multi-day support (per-day rendering, no spanning bars)
	label: string;
	/**
	 * Chip background (default amber).
	 *
	 * Must be a **light** colour: the chip paints `--ink-inverse` (dark) on top, so
	 * the fill carries the contrast. The default `--amber` gives 8.14:1.
	 * `--purple-vivid` reaches only 4.13:1 and the text-tuned `--purple` is 1.95:1
	 * — both too dark. Use a light fill such as `--amber-l` or `--purple-l`.
	 */
	color?: string;
	meta?: unknown; // passthrough for consumer rendering
}

export interface CalendarProps {
	/** Array of events to display as chips on day cells. */
	events?: CalendarEvent[];
	/** Controlled active view; omit for uncontrolled. */
	view?: "month" | "week" | "day";
	/** Initial view when uncontrolled.
	 * @default "month"
	 */
	defaultView?: "month" | "week" | "day";
	/** Called when the user switches views via the SegmentedControl. */
	onViewChange?: (v: "month" | "week" | "day") => void;
	/** Controlled selected date; highlighted in amber on the grid. */
	selectedDate?: Date | null;
	/** Called when a day cell is clicked with the clicked Date. */
	onSelectedDateChange?: (d: Date) => void;
	/** Day the week starts on: 0 = Sunday, 1 = Monday.
	 * @default 1
	 */
	weekStart?: 0 | 1;
	/** Maximum event chips shown per day cell before a "+N more" overflow trigger.
	 * @default 3
	 */
	maxVisibleEventsPerDay?: number;
	/**
	 * Fixed height in px for the day-view time grid (the scrollable 24-hour area).
	 * The all-day row above the grid is unaffected.
	 * When omitted the grid expands to show all 24 hours.
	 * @default 480
	 */
	dayViewHeight?: number;
	/**
	 * Freeze the component's notion of "now".
	 *
	 * The day view draws a live current-time line and scrolls itself to the
	 * current hour, both read from the system clock — which makes the rendered
	 * output time-dependent and its visual baseline permanently unstable. Pass a
	 * fixed Date in tests and stories; omit it in real usage to track real time.
	 */
	nowOverride?: Date;
	/** Accessible label for the calendar region.
	 * @default "Calendar"
	 */
	ariaLabel?: string;
	/** Additional className applied to the root element. */
	className?: string;
	/** Inline styles applied to the root element. */
	style?: CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────

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

// ─── Pure helpers ─────────────────────────────────────────────────────────

function toDate(d: Date | string): Date {
	return d instanceof Date ? d : new Date(d);
}

function sameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function addMonths(d: Date, n: number): Date {
	return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function startOfWeek(date: Date, weekStart: 0 | 1): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = (day - weekStart + 7) % 7;
	d.setDate(d.getDate() - diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

function getWeekDays(start: Date): Date[] {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start);
		d.setDate(d.getDate() + i);
		return d;
	});
}

/** Returns hour (0-23) if event has a specific time, null if all-day (midnight, 00:00). */
function eventHour(ev: CalendarEvent): number | null {
	const d = toDate(ev.date);
	const h = d.getHours();
	const m = d.getMinutes();
	if (h === 0 && m === 0) return null; // all-day
	return h;
}

// ─── CalendarChip - event chip with HoverCard ────────────────────────────

/**
 * A chip that PINS its own background must pin its own foreground.
 *
 * `ev.color` is caller-supplied and lands as an inline `background`, while the
 * chip's ink came from `--ink-inverse` in the stylesheet. That worked only for
 * as long as `--ink-inverse` was a near-black in every brand and mode. It is
 * not: charcoal makes it invert with the accent fill it inks, and the moment it
 * did, seven Calendar stories put a near-white label on a mid-tone event colour
 * — 34 axe violations between 2.18 and 3.60, none of which existed in the CSS
 * that produced them. Same failure family as the pinned highlight mark (G5) and
 * the pinned logo chip (G3): a fixed surface underneath a foreground that is
 * free to move.
 *
 * Chooses by MEASURED ratio rather than by a luminance threshold, so a caller
 * passing a pale event colour gets dark ink rather than the near-white a
 * midpoint rule would hand it.
 *
 * FALLS BACK TO THE DARK INK, not to the stylesheet, for anything it cannot
 * parse — and that path is the common one rather than the exotic one. Every
 * shipped story passes a `var(--blue-vivid, #1d6aff)`-shaped expression, not a
 * hex, and the literal inside such a fallback is NOT what the token resolves to
 * (`--blue-vivid` renders #3b82f6, the fallback claims #1d6aff), so reading it
 * would be measuring the wrong colour. Deferring to the stylesheet instead is
 * what produced the 34 violations in the first place. The dark ink is what the
 * default brand already paints on every one of these chips and what charcoal
 * painted before its accent began to invert, so this is the value the component
 * has always rendered here, now stated where the background is stated.
 *
 * The two candidates are the design system's own pinned inks, so for every
 * event colour the shipped stories use this returns exactly the value the
 * default brand already rendered.
 */
const CHIP_INK_DARK = "#1c1917";
const CHIP_INK_LIGHT = "#fdfdfe";
function chipInk(color: string): string {
	const t = color.trim();
	let rgb: [number, number, number] | null = null;
	const hx = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(t);
	if (hx) {
		const raw = hx[1] as string;
		const h =
			raw.length === 3
				? raw
						.split("")
						.map((c) => c + c)
						.join("")
				: raw;
		const v = Number.parseInt(h, 16);
		rgb = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
	} else {
		const m = /^rgba?\(([^)]*)\)$/.exec(t);
		if (m) {
			const parts = (m[1] ?? "")
				.split(/[,\s/]+/)
				.filter(Boolean)
				.map(Number);
			if (parts.length >= 3 && !parts.slice(0, 3).some(Number.isNaN)) {
				rgb = [parts[0] as number, parts[1] as number, parts[2] as number];
			}
		}
	}
	if (!rgb) return CHIP_INK_DARK;
	const lin = (c: number) => {
		const x = c / 255;
		return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
	};
	const L = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
	// --ink-inverse's two pinned values, measured rather than assumed.
	const onDark = (L + 0.05) / (0.01004 + 0.05);
	const onLight = (0.98289 + 0.05) / (L + 0.05);
	return onDark >= onLight ? CHIP_INK_DARK : CHIP_INK_LIGHT;
}

function CalendarChip({ ev, date }: { ev: CalendarEvent; date: Date }) {
	const anchorRef = useRef<HTMLSpanElement>(null);
	const fmt = (d: Date) =>
		d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

	return (
		<>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: chip onClick only stops propagation to the parent cell button; keyboard navigation is handled by the parent grid */}
			<span
				ref={anchorRef}
				className="ds-atom-calendar-chip"
				style={ev.color ? { background: ev.color, color: chipInk(ev.color) } : undefined}
				onClick={(e) => e.stopPropagation()}
			>
				{ev.label}
			</span>
			<HoverCard anchorRef={anchorRef} placement="bottom-start">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 6,
						minWidth: 160,
						maxWidth: 240,
						padding: 4,
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span
							style={{
								width: 10,
								height: 10,
								borderRadius: "50%",
								background: ev.color ?? "var(--amber)",
								flexShrink: 0,
							}}
						/>
						<span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", lineHeight: 1.3 }}>
							{ev.label}
						</span>
					</div>
					<span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
						{fmt(date)}
						{ev.endDate && ev.endDate > date
							? ` – ${fmt(ev.endDate instanceof Date ? ev.endDate : new Date(ev.endDate))}`
							: ""}
					</span>
				</div>
			</HoverCard>
		</>
	);
}

// ─── Overflow state ───────────────────────────────────────────────────────

interface OverflowState {
	open: boolean;
	date: Date | null;
	events: CalendarEvent[];
}

// ─── Calendar root ────────────────────────────────────────────────────────

function CalendarRoot(props: CalendarProps, ref: React.Ref<HTMLDivElement>) {
	const {
		events = [],
		view: controlledView,
		defaultView = "month",
		onViewChange,
		selectedDate,
		onSelectedDateChange,
		weekStart = 1,
		maxVisibleEventsPerDay = 3,
		dayViewHeight = 480,
		nowOverride,
		ariaLabel = "Calendar",
		className,
		style,
	} = props;

	// ── View state (controlled / uncontrolled) ──
	const [uncontrolledView, setUncontrolledView] = useState<"month" | "week" | "day">(defaultView);
	const isViewControlled = controlledView !== undefined;
	const view = isViewControlled ? controlledView : uncontrolledView;

	const setView = (v: "month" | "week" | "day") => {
		if (!isViewControlled) setUncontrolledView(v);
		onViewChange?.(v);
	};

	// ── Viewport month anchor (drives navigation) ──
	const [viewMonth, setViewMonth] = useState<Date>(() => {
		return selectedDate ?? new Date();
	});

	// Also honours nowOverride: the "today" ring is clock-derived, so without this
	// every Calendar visual baseline silently rots the next day — the highlighted
	// cell moves even though nothing in the component changed.
	const today = useMemo(() => nowOverride ?? new Date(), [nowOverride]);

	// ── Mobile breakpoint - reactive via useMatchMedia hook (SSR-safe, subscribes to change events) ──
	const isMobile = useMatchMedia("(max-width: 640px)");

	// ── Overflow popover state ──
	const [overflowState, setOverflowState] = useState<OverflowState>({
		open: false,
		date: null,
		events: [],
	});
	const overflowAnchorRef = useRef<HTMLButtonElement | null>(null);
	const dayGridRef = useRef<HTMLElement | null>(null);
	const monthGridRef = useRef<HTMLDivElement | null>(null);

	// Live current time - updates every minute so the "now" line stays accurate.
	//
	// `nowOverride` freezes the clock. Without it the day view is untestable: the
	// "now" line position and the initial scroll below both derive from wall-clock
	// time, so the DayView story rendered at a different height on every run and
	// its visual baseline could never be stable.
	const [now, setNow] = useState(() => nowOverride ?? new Date());
	useEffect(() => {
		if (nowOverride) {
			setNow(nowOverride);
			return;
		}
		const id = window.setInterval(() => setNow(new Date()), 60_000);
		return () => window.clearInterval(id);
	}, [nowOverride]);
	const HOUR_HEIGHT = 40; // must match .ds-atom-calendar-dayview-hour min-height
	const nowOffsetPx = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;
	const isToday_dayView = sameDay(viewMonth, today);

	// Scroll day view to current hour when it first opens (once, not on every tick).
	// Reads the resolved `now` rather than calling new Date() again, so a frozen
	// clock also freezes the scroll position.
	useEffect(() => {
		if (view !== "day" || !dayGridRef.current) return;
		dayGridRef.current.scrollTop = Math.max(0, (now.getHours() - 1) * HOUR_HEIGHT);
	}, [view, now]);

	// ── Navigation ──
	const navigate = (delta: 1 | -1) => {
		if (view === "month") setViewMonth(addMonths(viewMonth, delta));
		else if (view === "week") setViewMonth(addDays(viewMonth, delta * 7));
		else setViewMonth(addDays(viewMonth, delta));
	};

	// ── Header label (adapts by view) ──
	const headerLabel =
		view === "month"
			? `${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`
			: view === "week"
				? `Week of ${viewMonth.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
				: viewMonth.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					});

	// ── Month grid ──
	const grid = useMemo(
		() => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), weekStart),
		[viewMonth, weekStart],
	);

	// Roving tabindex + arrow keys for the month grid — one tab stop instead of
	// up to 42. Only the month view renders a grid, so the hook is inert in the
	// week and day views.
	const dateGrid = useDateGrid({
		gridRef: monthGridRef,
		viewMonth,
		onViewMonthChange: setViewMonth,
		selectedDate,
		enabled: view === "month",
	});
	const weekdayLabels = useMemo(() => getWeekDayLabels(weekStart, "narrow"), [weekStart]);
	const weekdayShortLabels = useMemo(() => getWeekDayLabels(weekStart, "short"), [weekStart]);

	// ── Events per date ──
	function eventsForDate(date: Date): CalendarEvent[] {
		return events
			.filter((ev) => {
				const start = toDate(ev.date);
				if (sameDay(start, date)) return true;
				if (!ev.endDate) return false;
				const end = toDate(ev.endDate);
				// Inclusive range, day-resolution
				const dateNorm = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				const startNorm = new Date(start.getFullYear(), start.getMonth(), start.getDate());
				const endNorm = new Date(end.getFullYear(), end.getMonth(), end.getDate());
				return dateNorm >= startNorm && dateNorm <= endNorm;
			})
			.sort((a, b) => +toDate(a.date) - +toDate(b.date));
	}

	// ── Week view data ──
	const weekStartDate = useMemo(() => startOfWeek(viewMonth, weekStart), [viewMonth, weekStart]);
	const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);

	// ── Day view data ──
	const focusDate = selectedDate ?? viewMonth;

	return (
		<div
			ref={ref}
			className={`ds-atom-calendar${className ? ` ${className}` : ""}`}
			style={style}
			data-view={view}
			aria-label={ariaLabel}
		>
			{/* ── Header ── */}
			<div className="ds-atom-calendar-header">
				<div className="ds-atom-calendar-nav">
					<IconButton
						label="Previous month"
						icon={<ChevronLeft size={16} />}
						onClick={() => navigate(-1)}
						className="ds-atom-calendar-navbtn"
					/>
					<div className="ds-atom-calendar-label">{headerLabel}</div>
					<IconButton
						label="Next month"
						icon={<ChevronRight size={16} />}
						onClick={() => navigate(1)}
						className="ds-atom-calendar-navbtn"
					/>
				</div>
				<SegmentedControl
					options={[
						{ value: "month", label: "Month" },
						{ value: "week", label: "Week" },
						{ value: "day", label: "Day" },
					]}
					value={view}
					onChange={(v) => setView(v as "month" | "week" | "day")}
					size="sm"
					ariaLabel="Calendar view"
				/>
			</div>

			{/* ── Body ── */}
			<div className="ds-atom-calendar-body">
				{/* ── Month view ── */}
				{view === "month" && (
					<div
						ref={monthGridRef}
						// biome-ignore lint/a11y/useSemanticElements: ARIA grid role on <div> is the standard interactive-calendar pattern (APG, react-aria, Radix) - <table> implies static tabular data, not keyboard-navigable grid
						role="grid"
						className="ds-atom-calendar-month"
						onKeyDown={dateGrid.onKeyDown}
					>
						{/* biome-ignore lint/a11y/useSemanticElements: role="row" on <div> groups the column-header cells into a logical grid row per APG */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: header row is a grouping element - individual <th>-equivalent cells are not keyboard targets */}
						<div role="row" className="ds-atom-calendar-weekdays">
							{weekdayLabels.map((d, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: weekday headers are a static 7-element array - index is stable
								// biome-ignore lint/a11y/useSemanticElements: role="columnheader" on <div> within an ARIA grid pattern - semantic <th> belongs to <table>, not an ARIA-role grid
								<div key={i} role="columnheader" className="ds-atom-calendar-weekday">
									{d}
								</div>
							))}
						</div>
						{grid.weeks.map((week, wi) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: week rows are a stable 6-element array - index maps directly to week position
							// biome-ignore lint/a11y/useSemanticElements: role="row" on <div> required by ARIA grid pattern - see outer grid biome-ignore
							// biome-ignore lint/a11y/useFocusableInteractive: row is a grouping container; the gridcell buttons inside carry focusability
							<div key={wi} role="row" className="ds-atom-calendar-week">
								{week.map((cell) => {
									const isToday = sameDay(cell.date, today);
									const isSelected = selectedDate ? sameDay(cell.date, selectedDate) : false;
									const cellEvents = eventsForDate(cell.date);
									const visible = cellEvents.slice(0, maxVisibleEventsPerDay);
									const overflow = cellEvents.length - maxVisibleEventsPerDay;

									return (
										<button
											key={cell.date.toISOString()}
											type="button"
											// biome-ignore lint/a11y/useSemanticElements: <td> is for tabular data; gridcell role on <button> makes each calendar day keyboard-focusable (matches DatePicker + react-aria + Radix)
											role="gridcell"
											data-date={dateGrid.cellDateAttr(cell.date)}
											tabIndex={dateGrid.cellTabIndex(cell.date)}
											className="ds-atom-calendar-cell"
											data-today={isToday || undefined}
											data-selected={isSelected || undefined}
											data-out-of-month={!cell.inMonth || undefined}
											aria-label={cell.date.toDateString()}
											aria-current={isToday ? "date" : undefined}
											onClick={() => onSelectedDateChange?.(cell.date)}
										>
											<span className="ds-atom-calendar-cell-num">{cell.date.getDate()}</span>
											{cellEvents.length > 0 && (
												<div className="ds-atom-calendar-cell-events">
													{visible.map((ev) => (
														<CalendarChip key={ev.id} ev={ev} date={cell.date} />
													))}
													{overflow > 0 && (
														// biome-ignore lint/a11y/useSemanticElements: role="button" on <span> prevents nesting <button> inside <button> (HTML spec); keyboard handler below makes it fully accessible
														// biome-ignore lint/a11y/useKeyWithClickEvents: onKeyDown handler provided on same span
														<span
															role="button"
															tabIndex={0}
															className="ds-atom-calendar-chip-more"
															onClick={(e) => {
																e.stopPropagation();
																overflowAnchorRef.current =
																	e.currentTarget as unknown as HTMLButtonElement;
																setOverflowState({
																	open: true,
																	date: cell.date,
																	events: cellEvents,
																});
															}}
															onKeyDown={(e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.preventDefault();
																	e.stopPropagation();
																	overflowAnchorRef.current =
																		e.currentTarget as unknown as HTMLButtonElement;
																	setOverflowState({
																		open: true,
																		date: cell.date,
																		events: cellEvents,
																	});
																}
															}}
														>
															+{overflow} more
														</span>
													)}
												</div>
											)}
										</button>
									);
								})}
							</div>
						))}
					</div>
				)}

				{/* ── Week view ── */}
				{view === "week" && (
					<div className="ds-atom-calendar-weekview">
						<div className="ds-atom-calendar-week-row">
							{weekDays.map((d) => {
								const dayEvents = eventsForDate(d);
								const isToday = sameDay(d, today);
								const isSelected = selectedDate ? sameDay(d, selectedDate) : false;
								const dayIndex = (d.getDay() - weekStart + 7) % 7;
								return (
									<div
										key={d.toISOString()}
										className="ds-atom-calendar-weekcell"
										data-today={isToday || undefined}
										data-selected={isSelected || undefined}
									>
										<button
											type="button"
											className="ds-atom-calendar-weekcell-header"
											onClick={() => onSelectedDateChange?.(d)}
										>
											<span className="ds-atom-calendar-weekcell-name">
												{weekdayShortLabels[dayIndex]}
											</span>
											<span className="ds-atom-calendar-weekcell-date">{d.getDate()}</span>
										</button>
										<ul className="ds-atom-calendar-weekcell-events">
											{dayEvents.map((ev) => (
												<li
													key={ev.id}
													className="ds-atom-calendar-chip"
													style={
														ev.color
															? { background: ev.color, color: chipInk(ev.color) }
															: undefined
													}
												>
													{ev.label}
												</li>
											))}
										</ul>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* ── Day view ── */}
				{view === "day" &&
					(() => {
						const dayEvents = eventsForDate(focusDate);
						const allDayEvents = dayEvents.filter((ev) => eventHour(ev) === null);
						const hourlyEvents = dayEvents.filter((ev) => eventHour(ev) !== null);
						const hours = Array.from({ length: 24 }, (_, i) => i);
						return (
							<div className="ds-atom-calendar-dayview">
								{allDayEvents.length > 0 && (
									<div className="ds-atom-calendar-dayview-allday">
										<div className="ds-atom-calendar-dayview-alldaylabel">All day</div>
										<ul className="ds-atom-calendar-dayview-alldayevents">
											{allDayEvents.map((ev) => (
												<li
													key={ev.id}
													className="ds-atom-calendar-chip"
													style={
														ev.color
															? { background: ev.color, color: chipInk(ev.color) }
															: undefined
													}
												>
													{ev.label}
												</li>
											))}
										</ul>
									</div>
								)}
								{/* <section> rather than a div with role="group": a named section maps to
								    role="region" natively, so the scroll container gets an accessible name
								    without an ARIA role. */}
								<section
									ref={dayGridRef}
									className="ds-atom-calendar-dayview-grid"
									style={{ height: dayViewHeight, overflowY: "auto" }}
									// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be focusable, or keyboard-only users cannot scroll it (axe: scrollable-region-focusable)
									tabIndex={0}
									aria-label="Day schedule"
								>
									{/* Current-time indicator - amber line with dot, only for today */}
									{isToday_dayView && (
										<div
											aria-hidden="true"
											className="ds-atom-calendar-nowline"
											style={{ top: nowOffsetPx }}
										>
											<span className="ds-atom-calendar-nowdot" />
										</div>
									)}
									{hours.map((h) => {
										const hourEvents = hourlyEvents.filter((ev) => eventHour(ev) === h);
										return (
											<div key={h} className="ds-atom-calendar-dayview-hour">
												<div className="ds-atom-calendar-dayview-hourlabel">
													{String(h).padStart(2, "0")}:00
												</div>
												<div className="ds-atom-calendar-dayview-hourslot">
													{hourEvents.map((ev) => (
														<div
															key={ev.id}
															className="ds-atom-calendar-chip"
															style={
																ev.color
																	? { background: ev.color, color: chipInk(ev.color) }
																	: undefined
															}
														>
															{ev.label}
														</div>
													))}
												</div>
											</div>
										);
									})}
								</section>
							</div>
						);
					})()}
			</div>

			{/* ── Overflow popover (Popover on desktop, BottomSheet on mobile) ── */}
			{overflowState.open &&
				overflowState.date &&
				(isMobile ? (
					<BottomSheet
						open={overflowState.open}
						onClose={() => setOverflowState((s) => ({ ...s, open: false }))}
						title={overflowState.date.toLocaleDateString()}
					>
						<ul className="ds-atom-calendar-events-list">
							{overflowState.events.map((ev) => (
								<li key={ev.id} className="ds-atom-calendar-events-item">
									<span
										className="ds-atom-calendar-events-dot"
										style={
											ev.color ? { background: ev.color, color: chipInk(ev.color) } : undefined
										}
										aria-hidden="true"
									/>
									<span>{ev.label}</span>
								</li>
							))}
						</ul>
					</BottomSheet>
				) : (
					<Popover
						anchorRef={overflowAnchorRef as React.RefObject<HTMLElement | null>}
						open={overflowState.open}
						onOpenChange={(o) => setOverflowState((s) => ({ ...s, open: o }))}
					>
						<div className="ds-atom-calendar-events-popover">
							<div className="ds-atom-calendar-events-header">
								{overflowState.date.toLocaleDateString()}
							</div>
							<ul className="ds-atom-calendar-events-list">
								{overflowState.events.map((ev) => (
									<li key={ev.id} className="ds-atom-calendar-events-item">
										<span
											className="ds-atom-calendar-events-dot"
											style={
												ev.color ? { background: ev.color, color: chipInk(ev.color) } : undefined
											}
											aria-hidden="true"
										/>
										<span>{ev.label}</span>
									</li>
								))}
							</ul>
						</div>
					</Popover>
				))}
		</div>
	);
}

// ─── Calendar.Agenda consumer slot ────────────────────────────────────────

function AgendaList({
	events,
	ariaLabel = "Agenda",
}: {
	events: CalendarEvent[];
	ariaLabel?: string;
}) {
	const sorted = useMemo(
		() => [...events].sort((a, b) => +toDate(a.date) - +toDate(b.date)),
		[events],
	);
	return (
		<ol aria-label={ariaLabel} className="ds-atom-calendar-agenda">
			{sorted.map((ev) => (
				<li key={ev.id} className="ds-atom-calendar-agenda-item">
					<span
						className="ds-atom-calendar-agenda-dot"
						style={ev.color ? { background: ev.color, color: chipInk(ev.color) } : undefined}
						aria-hidden="true"
					/>
					<time dateTime={toDate(ev.date).toISOString()} className="ds-atom-calendar-agenda-time">
						{toDate(ev.date).toLocaleDateString()}
					</time>
					<span className="ds-atom-calendar-agenda-label">{ev.label}</span>
				</li>
			))}
		</ol>
	);
}

// ─── Public export (compound component) ──────────────────────────────────

const CalendarRootForward = forwardRef(CalendarRoot);

/**
 * Calendar primitive (DS-68).
 * Three views: month (default), week, day.
 * Compound: <Calendar.Agenda events={...} /> for consumer-rendered agenda list.
 */
export const Calendar = Object.assign(CalendarRootForward, { Agenda: AgendaList });
