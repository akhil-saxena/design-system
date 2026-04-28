/**
 * # Usage Audit — DateRangePicker (DS-54, DS-87)
 *
 * Consumers (post v2.1):
 * - applications/Filters — "Posted within" date range filter on the kanban /
 *   table view (last 7 days, last 30 days, custom range)
 * - analytics/DateRangeSelector — pipeline metrics over a custom window
 * - dashboard/CalendarFilter — multi-day calendar view scoping
 * - settings/ExportPanel — export applications matching a date range
 *
 * API:
 * - value: { start: Date | null; end: Date | null } (controlled)
 * - onChange: (range) => void
 * - disablePast?: boolean — opacity 0.45 + aria-disabled on past days (both calendars)
 * - disableFuture?: boolean — same treatment for future days
 *
 * Click flow (D-512):
 * 1. First click (no start): sets `start`, leaves `end` null
 * 2. Second click (start set): sets `end` — auto-swaps if before `start` so end is later
 * 3. Third click (full range): resets — new `start`, `end` cleared
 *
 * Between-state styling: cells inside [start, end] (excluding endpoints) get
 * the `.is-in-range` class via DatePicker's `inRange` predicate prop —
 * `var(--amber-l)` background, 0 radius. Endpoints keep DatePicker's
 * `is-selected` styling (`var(--amber)` bg + 6px radius).
 *
 * Hover preview: while picking `end`, hovering a cell shows the would-be
 * range bg via state-tracked `hoverDate`.
 *
 * Layout (D-512):
 * - ≥640px: 2 calendars side-by-side (current month + month+1)
 * - <640px: single calendar; right calendar is hidden via CSS @media — user
 *   navigates with the prev/next stepper that ships from DatePicker itself
 *
 * NO time picker for v2.0 (deferred to v2.1 — typical use cases are
 * deadline-window scheduling where day granularity is sufficient).
 *
 * Implementation: PURELY consumes DatePicker (DS-53, plan 16-05). Does not
 * modify DatePicker.tsx or its CSS — the `inRange?: (d: Date) => boolean`
 * predicate prop, the `defaultMonth?: Date` initial-month prop, and the
 * `.ds-atom-datepicker-cell.is-in-range` CSS rule all shipped via 16-05 as
 * backward-compatible API additions.
 *
 * Visual baselines deferred to 16-09 closeout (D-489 cumulative pattern).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
	title: "Pickers/DateRangePicker",
	component: DateRangePicker,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: new Date(2026, 3, 10),
			end: new Date(2026, 3, 22),
		});
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
					Posted within
				</div>
				<DateRangePicker value={value} onChange={setValue} />
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 11,
						color: "var(--ink-3)",
						marginTop: 12,
					}}
				>
					{value.start ? value.start.toDateString() : "(none)"} →{" "}
					{value.end ? value.end.toDateString() : "(none)"}
				</div>
			</div>
		);
	},
};

export const DisablePast: Story = {
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: null,
			end: null,
		});
		return <DateRangePicker value={value} onChange={setValue} disablePast />;
	},
};

export const MobileStepper: Story = {
	parameters: {
		viewport: { defaultViewport: "mobile1" },
	},
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: new Date(2026, 3, 8),
			end: new Date(2026, 3, 18),
		});
		// At <640px the right calendar is hidden via CSS — navigate the left
		// calendar via its built-in prev/next stepper to reach later months.
		return (
			<div style={{ maxWidth: 320 }}>
				<DateRangePicker value={value} onChange={setValue} />
			</div>
		);
	},
};

export const Playground: Story = {
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: null,
			end: null,
		});
		return (
			<div style={{ display: "grid", gap: 16 }}>
				<DateRangePicker value={value} onChange={setValue} />
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					Click to set start. Click again to set end (auto-swaps if before start). Third click
					resets.
				</div>
				<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
					start: {value.start ? value.start.toDateString() : "(none)"}
					<br />
					end: {value.end ? value.end.toDateString() : "(none)"}
				</div>
			</div>
		);
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: new Date(2026, 3, 10),
			end: new Date(2026, 3, 22),
		});
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
					Posted within (dark)
				</div>
				<DateRangePicker value={value} onChange={setValue} />
			</div>
		);
	},
};
