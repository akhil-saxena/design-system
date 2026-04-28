import { describe, expect, it } from "vitest";
import {
	addMonths,
	daysInMonth,
	formatYYYYMMDD,
	isSameDay,
	isToday,
	isWithinRange,
	startOfMonth,
} from "./dateUtils";

describe("dateUtils", () => {
	it("startOfMonth zeroes day + time", () => {
		const r = startOfMonth(new Date(2026, 3, 28, 14, 30));
		expect(r.getFullYear()).toBe(2026);
		expect(r.getMonth()).toBe(3);
		expect(r.getDate()).toBe(1);
		expect(r.getHours()).toBe(0);
		expect(r.getMinutes()).toBe(0);
	});

	it("daysInMonth handles leap years", () => {
		expect(daysInMonth(new Date(2026, 1, 15))).toBe(28);
		expect(daysInMonth(new Date(2024, 1, 15))).toBe(29);
		expect(daysInMonth(new Date(2026, 3, 1))).toBe(30); // April
		expect(daysInMonth(new Date(2026, 0, 1))).toBe(31); // Jan
	});

	it("isSameDay ignores time-of-day", () => {
		expect(isSameDay(new Date(2026, 3, 28, 9), new Date(2026, 3, 28, 17))).toBe(true);
		expect(isSameDay(new Date(2026, 3, 28), new Date(2026, 3, 29))).toBe(false);
		expect(isSameDay(new Date(2026, 3, 28), new Date(2027, 3, 28))).toBe(false);
	});

	it("isWithinRange is inclusive", () => {
		const start = new Date(2026, 3, 1);
		const end = new Date(2026, 3, 30);
		expect(isWithinRange(new Date(2026, 3, 15), start, end)).toBe(true);
		expect(isWithinRange(new Date(2026, 3, 1), start, end)).toBe(true);
		expect(isWithinRange(new Date(2026, 3, 30), start, end)).toBe(true);
		expect(isWithinRange(new Date(2026, 2, 31), start, end)).toBe(false);
		expect(isWithinRange(new Date(2026, 4, 1), start, end)).toBe(false);
	});

	it("isToday returns true for now", () => {
		expect(isToday(new Date())).toBe(true);
	});

	it("addMonths handles year rollover", () => {
		const r = addMonths(new Date(2026, 11, 15), 2);
		expect(r.getFullYear()).toBe(2027);
		expect(r.getMonth()).toBe(1);
		expect(r.getDate()).toBe(15);
	});

	it("formatYYYYMMDD zero-pads", () => {
		expect(formatYYYYMMDD(new Date(2026, 3, 5))).toBe("2026-04-05");
		expect(formatYYYYMMDD(new Date(2026, 11, 31))).toBe("2026-12-31");
	});
});
