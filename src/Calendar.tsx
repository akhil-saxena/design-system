/**
 * # Usage Audit — Calendar (DS-68, D-17-20..D-17-25)
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
import { type CSSProperties, forwardRef, useMemo, useRef, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Popover } from "./Popover";
import { SegmentedControl } from "./SegmentedControl";
import { buildMonthGrid, getWeekDayLabels } from "./_internals/calendarGrid";
import { useMatchMedia } from "./hooks/useMatchMedia";
import { ChevronLeft, ChevronRight } from "./icons";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
	id: string;
	date: Date | string; // string interpreted as ISO
	endDate?: Date | string; // multi-day support (per-day rendering, no spanning bars)
	label: string;
	color?: string; // chip color (default amber)
	meta?: unknown; // passthrough for consumer rendering
}

export interface CalendarProps {
	events?: CalendarEvent[];
	view?: "month" | "week" | "day"; // controlled
	defaultView?: "month" | "week" | "day"; // uncontrolled (default "month")
	onViewChange?: (v: "month" | "week" | "day") => void;
	selectedDate?: Date | null; // controlled
	onSelectedDateChange?: (d: Date) => void;
	weekStart?: 0 | 1; // default 1 (Monday) per handoff
	maxVisibleEventsPerDay?: number; // default 3
	ariaLabel?: string;
	className?: string;
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

	const today = useMemo(() => new Date(), []);

	// ── Mobile breakpoint — reactive via useMatchMedia hook (SSR-safe, subscribes to change events) ──
	const isMobile = useMatchMedia("(max-width: 640px)");

	// ── Overflow popover state ──
	const [overflowState, setOverflowState] = useState<OverflowState>({
		open: false,
		date: null,
		events: [],
	});
	const overflowAnchorRef = useRef<HTMLButtonElement | null>(null);

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
					<button
						type="button"
						aria-label="Previous month"
						onClick={() => navigate(-1)}
						className="ds-atom-calendar-navbtn"
					>
						<ChevronLeft size={16} />
					</button>
					<div className="ds-atom-calendar-label">{headerLabel}</div>
					<button
						type="button"
						aria-label="Next month"
						onClick={() => navigate(1)}
						className="ds-atom-calendar-navbtn"
					>
						<ChevronRight size={16} />
					</button>
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
					// biome-ignore lint/a11y/useSemanticElements: ARIA grid role on <div> is the standard interactive-calendar pattern (APG, react-aria, Radix) — <table> implies static tabular data, not keyboard-navigable grid
					<div role="grid" className="ds-atom-calendar-month">
						{/* biome-ignore lint/a11y/useSemanticElements: role="row" on <div> groups the column-header cells into a logical grid row per APG */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: header row is a grouping element — individual <th>-equivalent cells are not keyboard targets */}
						<div role="row" className="ds-atom-calendar-weekdays">
							{weekdayLabels.map((d, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: weekday headers are a static 7-element array — index is stable
								// biome-ignore lint/a11y/useSemanticElements: role="columnheader" on <div> within an ARIA grid pattern — semantic <th> belongs to <table>, not an ARIA-role grid
								<div key={i} role="columnheader" className="ds-atom-calendar-weekday">
									{d}
								</div>
							))}
						</div>
						{grid.weeks.map((week, wi) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: week rows are a stable 6-element array — index maps directly to week position
							// biome-ignore lint/a11y/useSemanticElements: role="row" on <div> required by ARIA grid pattern — see outer grid biome-ignore
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
														<span
															key={ev.id}
															className="ds-atom-calendar-chip"
															style={ev.color ? { background: ev.color } : undefined}
														>
															{ev.label}
														</span>
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
													style={ev.color ? { background: ev.color } : undefined}
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
													style={ev.color ? { background: ev.color } : undefined}
												>
													{ev.label}
												</li>
											))}
										</ul>
									</div>
								)}
								<div className="ds-atom-calendar-dayview-grid">
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
															style={ev.color ? { background: ev.color } : undefined}
														>
															{ev.label}
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
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
										style={ev.color ? { background: ev.color } : undefined}
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
											style={ev.color ? { background: ev.color } : undefined}
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
						style={ev.color ? { background: ev.color } : undefined}
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
