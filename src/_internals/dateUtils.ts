// Pure date helpers — no React imports. Consumed by DatePicker (16-05)
// and DateRangePicker (16-06). D-510: NO date-fns / Temporal dep — these
// ~7 helpers cover every Wave 5 + Phase 18 timeline use case.

export function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function daysInMonth(d: Date): number {
	// Day 0 of next month = last day of current month.
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function isWithinRange(d: Date, start: Date, end: Date): boolean {
	const t = d.getTime();
	return t >= startOfDayMs(start) && t <= endOfDayMs(end);
}

export function isToday(d: Date): boolean {
	return isSameDay(d, new Date());
}

export function addMonths(d: Date, n: number): Date {
	return new Date(
		d.getFullYear(),
		d.getMonth() + n,
		d.getDate(),
		d.getHours(),
		d.getMinutes(),
		d.getSeconds(),
		d.getMilliseconds(),
	);
}

export function formatYYYYMMDD(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function startOfDayMs(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

function endOfDayMs(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}
