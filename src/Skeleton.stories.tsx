/**
 * # Usage Audit — Skeleton (DS-87, DS-43, D-420)
 *
 * Consumers (post v2.1):
 * - kanban/CardLoadingState — 3 Skeletons (avatar circle 32px + 2 text
 *   line siblings) shown while initial application list fetches
 * - table/RowLoadingState — render 5 sibling `<Skeleton />` nodes inside
 *   a flex-column container for 5 placeholder rows
 * - detail/HeaderLoadingState — circle avatar + title text + meta-pill
 *   skeleton siblings while application detail loads
 * - calendar/MonthLoadingState — grid of 35 Skeleton squares (text shape
 *   with explicit width + height) for placeholder day cells
 * - analytics/ChartLoadingState — single large Skeleton (e.g., `width="100%" height={300}`)
 *   while chart data fetches
 *
 * API (D-420):
 * - `shape?: 'text' | 'circle' | 'pill'` — default 'text'
 * - `width?: number | string` — default '100%'; numbers coerce to px
 * - `height?: number | string` — shape-dependent default (text: '1.2em',
 *   circle: matches width, pill: '1.5em')
 * - extends native <div> attributes via `...rest` spread
 * - forwards ref to root div (single render path; no wrapper)
 * - NO `count` prop. Compose multi-line / multi-element placeholders by
 *   rendering N siblings inside a consumer-controlled flex/grid container.
 *
 * A11y:
 * - `aria-hidden="true"` always — Skeleton is decorative
 * - Consumer wraps the surrounding region with `aria-busy={loading}` or
 *   similar to announce the loading state to assistive tech
 *
 * Composition:
 * - To mock an avatar+name pair: place a `<Skeleton shape="circle" width={40} />`
 *   next to a `<Skeleton width={120} />` in a flex row
 * - To mock a card placeholder: nest Skeletons inside a Card or any
 *   layout container; Skeleton has no built-in layout
 *
 * Implementation:
 * - Single primitive with `data-shape` (StickyNote `data-rotation` pattern)
 * - Pulse animation: opacity 0.6 ↔ 1 at 1.2s ease-in-out infinite
 * - Cream-2 bg in light, rgba(255,255,255,0.06) in dark
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
	title: "Feedback/Skeleton",
	component: Skeleton,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	args: {},
	render: (args) => (
		<div style={{ maxWidth: 360 }}>
			<Skeleton {...args} />
		</div>
	),
};

export const Shapes: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					TEXT
				</div>
				<Skeleton shape="text" width="100%" />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					CIRCLE
				</div>
				<Skeleton shape="circle" width={48} />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					PILL
				</div>
				<Skeleton shape="pill" width={80} />
			</div>
		</div>
	),
};

export const MultipleLines: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
			<Skeleton shape="text" width="100%" />
			<Skeleton shape="text" width="100%" />
			<Skeleton shape="text" width="80%" />
		</div>
	),
};

export const AvatarAndName: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 360 }}>
			<Skeleton shape="circle" width={40} />
			<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
				<Skeleton width={140} height={14} />
				<Skeleton width={90} height={11} />
			</div>
		</div>
	),
};

export const CardPlaceholder: Story = {
	render: () => (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 12,
				padding: 16,
				maxWidth: 320,
				border: "1px solid var(--rule)",
				borderRadius: "var(--radius-md)",
				background: "var(--surf-1)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<Skeleton shape="circle" width={32} />
				<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
					<Skeleton width={120} height={13} />
					<Skeleton width={80} height={10} />
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="75%" />
			</div>
			<div style={{ display: "flex", gap: 6 }}>
				<Skeleton shape="pill" width={60} />
				<Skeleton shape="pill" width={50} />
			</div>
		</div>
	),
};

export const Playground: Story = {
	args: { shape: "text", width: "100%" },
	argTypes: {
		shape: { control: "select", options: ["text", "circle", "pill"] },
	},
	render: (args) => (
		<div style={{ maxWidth: 360 }}>
			<Skeleton {...args} />
		</div>
	),
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
			<Skeleton width="100%" />
			<Skeleton shape="circle" width={48} />
			<Skeleton shape="pill" width={80} />
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="80%" />
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<Skeleton shape="circle" width={40} />
				<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
					<Skeleton width={140} height={14} />
					<Skeleton width={90} height={11} />
				</div>
			</div>
		</div>
	),
};
