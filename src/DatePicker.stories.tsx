/**
 * # Usage Audit — DatePicker (DS-53, DS-87)
 *
 * Consumers (post v2.1):
 * - applications/ApplicationForm — application date input (single Date, no time)
 * - applications/DeadlineEditor — deadline date input (showTime opt-in for cutoff hour)
 * - interviews/InterviewScheduler — interview slot input (showTime=true; HH/MM picker)
 * - dashboard/CalendarFilter — single-date filter for calendar view
 * - composes-into: DateRangePicker (16-06) — two DatePicker instances with shared
 *   range state via inRange + defaultMonth backward-compatible API additions
 *
 * API:
 * - value: Date | null (controlled)
 * - onChange: (d: Date) => void
 * - onMonthChange?: (d: Date) => void — fires on prev/next nav
 * - disabled?: (d: Date) => boolean — predicate for arbitrary disabled days
 * - events?: Date[] — single dot under matching dates (max 1 dot per day)
 * - disablePast?: boolean — opacity 0.45 + aria-disabled on past days
 * - disableFuture?: boolean — same treatment for future days
 * - showTime?: boolean — opt-in HH/MM number inputs below grid (D-512)
 * - inRange?: (d: Date) => boolean — between-state amber-light bg (16-06 consumer)
 * - defaultMonth?: Date — initial view month when uncontrolled (16-06 consumer)
 *
 * Visual spec (D-511, handoff design-handoff/design-system/ds-pickers.jsx):
 * - 7×6 grid (always 42 cells; prev/next month padding dimmed via .is-out)
 * - 34×34px cells; column headers `S M T W T F S` in var(--mono) 9.5px uppercase
 * - Today: amber-dot top-right via ::after + bolder text
 * - Selected: var(--amber) bg + ink text + 6px radius
 * - In-range: var(--amber-l) bg + 0 radius (between-state)
 * - Past dates: opacity 0.45 + cursor not-allowed when disablePast
 *
 * Implementation: NO date-fns dep; imports pure helpers from
 * `./_internals/dateUtils` (D-510). forwardRef + ...rest spread + style
 * last-wins per Button/Card convention.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
	title: "Pickers/DatePicker",
	component: DatePicker,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
		return (
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Application date
				</div>
				<DatePicker value={value} onChange={setValue} />
			</div>
		);
	},
};

export const WithEvents: Story = {
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 15));
		const events = [
			new Date(2026, 3, 7),
			new Date(2026, 3, 14),
			new Date(2026, 3, 21),
			new Date(2026, 3, 28),
		];
		return <DatePicker value={value} onChange={setValue} events={events} />;
	},
};

export const DisablePast: Story = {
	render: () => {
		const [value, setValue] = useState<Date | null>(null);
		return <DatePicker value={value} onChange={setValue} disablePast />;
	},
};

export const WithTimePicker: Story = {
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22, 14, 30));
		return (
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Interview date &amp; time
				</div>
				<DatePicker value={value} onChange={setValue} showTime />
			</div>
		);
	},
};

export const Playground: Story = {
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
		return (
			<div style={{ display: "grid", gap: 16 }}>
				<DatePicker
					value={value}
					onChange={setValue}
					events={[new Date(2026, 3, 10), new Date(2026, 3, 18)]}
					disablePast
					inRange={(d) => d.getMonth() === 3 && d.getDate() >= 10 && d.getDate() <= 22}
				/>
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					Selected: {value ? value.toDateString() : "(none)"}
				</div>
			</div>
		);
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => {
		const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
		return (
			<div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--ink-3)",
						marginBottom: 8,
					}}
				>
					Application date (dark)
				</div>
				<DatePicker
					value={value}
					onChange={setValue}
					events={[new Date(2026, 3, 14), new Date(2026, 3, 21)]}
				/>
			</div>
		);
	},
};
