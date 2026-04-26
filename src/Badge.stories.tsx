/**
 * # Usage Audit — Badge
 *
 * Consumers (post v2.1):
 * - kanban/CardStatusBadge — tone keyed on application.status
 * - detail/InterviewRoundCard — round status (upcoming/passed/pending/done)
 * - calendar/EventChipCount — "+N more" via tone="count"
 * - filters/CategoryDot — tone + dot for active filters
 *
 * API:
 * - tone: upcoming | passed | pending | done | count | neutral
 * - dot?: boolean — leading 6px colored dot matching tone
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
	title: "Atoms/Badge",
	component: Badge,
	parameters: { layout: "centered" },
	args: { children: "Label" },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming">Upcoming</Badge>
			<Badge tone="passed">Passed</Badge>
			<Badge tone="pending">Pending</Badge>
			<Badge tone="done">Done</Badge>
			<Badge tone="count">+3</Badge>
			<Badge tone="neutral">Neutral</Badge>
		</div>
	),
};

export const WithDot: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming" dot>
				Upcoming
			</Badge>
			<Badge tone="passed" dot>
				Passed
			</Badge>
			<Badge tone="pending" dot>
				Pending
			</Badge>
			<Badge tone="done" dot>
				Done
			</Badge>
		</div>
	),
};

export const Playground: Story = {
	args: { tone: "upcoming", children: "Playground", dot: false },
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Badge tone="upcoming">Upcoming</Badge>
			<Badge tone="passed">Passed</Badge>
			<Badge tone="pending">Pending</Badge>
			<Badge tone="done">Done</Badge>
			<Badge tone="count">+3</Badge>
		</div>
	),
	globals: { theme: "dark" },
};
