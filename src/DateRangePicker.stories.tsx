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
 * Layout (v0.5.1 single-cal redesign):
 * - Single calendar at all viewports — overrides original D-512 two-cal layout
 *   per user feedback + handoff `ds-pickers.jsx`. User navigates between months
 *   with DatePicker's built-in prev/next stepper.
 *
 * NO time picker for v2.0 (deferred to v2.1 — typical use cases are
 * deadline-window scheduling where day granularity is sufficient).
 *
 * Implementation: PURELY consumes DatePicker (DS-53, plan 16-05). Does not
 * modify DatePicker.tsx or its CSS — the `inRange?: (d: Date) => boolean`
 * predicate prop and the `.ds-atom-datepicker-cell.is-in-range` CSS rule
 * shipped via 16-05 as backward-compatible API additions.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";

const SRC = {
	Default: `const [value, setValue] = useState({
  start: new Date(2026, 3, 10),
  end: new Date(2026, 3, 22),
});
return <DateRangePicker value={value} onChange={setValue} />;`,
	DisablePast: `const [value, setValue] = useState({ start: null, end: null });
return <DateRangePicker value={value} onChange={setValue} disablePast />;`,
	Playground: `const [value, setValue] = useState({ start: null, end: null });
return <DateRangePicker value={value} onChange={setValue} />;`,
	DarkMode: `const [value, setValue] = useState({
  start: new Date(2026, 3, 10),
  end: new Date(2026, 3, 22),
});
return <DateRangePicker value={value} onChange={setValue} />;`,
};

const meta: Meta<typeof DateRangePicker> = {
	title: "Pickers/DateRangePicker",
	component: DateRangePicker,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Date-range picker with a single calendar and a click-twice flow: first click sets the start date, second click sets the end date.",
			},
		},
	},
	argTypes: {
		value: {
			control: false,
			description: "Controlled range with start and end dates (either may be null while picking).",
		},
		onChange: {
			control: false,
			description: "Called on every click with the updated { start, end } range object.",
		},
		disablePast: {
			control: "boolean",
			description: "When true, all dates before today are disabled.",
		},
		disableFuture: {
			control: "boolean",
			description: "When true, all dates after today are disabled.",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
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
	parameters: { docs: { source: { code: SRC.DisablePast } } },
	render: () => {
		const [value, setValue] = useState<{ start: Date | null; end: Date | null }>({
			start: null,
			end: null,
		});
		return <DateRangePicker value={value} onChange={setValue} disablePast />;
	},
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
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
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
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
