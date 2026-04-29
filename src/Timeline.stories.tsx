/**
 * # Usage Audit — Timeline (DS-66)
 *
 * Consumers (post v0.6):
 * - JobDash app — application status timeline (Submitted → Interview → Offer)
 * - Project history views — phase sequence with dates and milestone labels
 *
 * API shape consumers expect:
 * - events: TimelineEvent[] (id + date + label + optional description/color/onClick)
 * - orientation: "horizontal" | "vertical" (default horizontal)
 * - ariaLabel: string (default "Timeline")
 * - className / style passthrough
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Timeline, type TimelineEvent } from "./Timeline";

const meta: Meta<typeof Timeline> = {
	title: "Atoms/Timeline",
	component: Timeline,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Timeline>;

// ─── Shared fixtures ───────────────────────────────────────────────────────

const APPLICATION_EVENTS: TimelineEvent[] = [
	{ id: 1, date: "2026-03-04T00:00:00.000Z", label: "Applied", description: "via referral" },
	{ id: 2, date: "2026-03-11T00:00:00.000Z", label: "Recruiter call" },
	{ id: 3, date: "2026-03-18T00:00:00.000Z", label: "Tech screen", description: "in progress" },
	{ id: 4, date: "2026-03-25T00:00:00.000Z", label: "Onsite" },
	{ id: 5, date: "2026-04-02T00:00:00.000Z", label: "Decision" },
];

const MILESTONE_EVENTS: TimelineEvent[] = [
	{
		id: "m1",
		date: "2026-01-15T00:00:00.000Z",
		label: "Kickoff",
		description: "Project start",
		color: "var(--amber)",
	},
	{
		id: "m2",
		date: "2026-02-01T00:00:00.000Z",
		label: "Discovery",
		description: "Research & wireframes",
		color: "var(--amber-d)",
	},
	{
		id: "m3",
		date: "2026-03-01T00:00:00.000Z",
		label: "Design",
		description: "High-fidelity handoff",
		color: "#6366f1",
	},
	{
		id: "m4",
		date: "2026-04-01T00:00:00.000Z",
		label: "Build",
		description: "Engineering sprint",
		color: "#0ea5e9",
	},
	{
		id: "m5",
		date: "2026-05-01T00:00:00.000Z",
		label: "Launch",
		description: "v1.0 release",
		color: "#22c55e",
	},
];

// ─── Stories ───────────────────────────────────────────────────────────────

/** Default horizontal timeline — 5 application stages with dates */
export const Horizontal: Story = {
	render: () => <Timeline events={APPLICATION_EVENTS} orientation="horizontal" />,
};

/** Vertical orientation — events stack column with left-aligned dots */
export const Vertical: Story = {
	render: () => (
		<div style={{ maxWidth: 400 }}>
			<Timeline events={APPLICATION_EVENTS} orientation="vertical" />
		</div>
	),
};

/** Milestones — events with descriptions and custom dot colors */
export const Milestones: Story = {
	render: () => <Timeline events={MILESTONE_EVENTS} />,
};

/** Clickable — events with onClick handlers (fires action in Storybook panel) */
export const Clickable: Story = {
	render: () => {
		const clickableEvents: TimelineEvent[] = APPLICATION_EVENTS.map((ev) => ({
			...ev,
			onClick: () => console.log(`Clicked: ${ev.label}`),
		}));
		return <Timeline events={clickableEvents} ariaLabel="Clickable application stages" />;
	},
};

/** Dark mode */
export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			<Timeline events={APPLICATION_EVENTS} />
			<Timeline events={MILESTONE_EVENTS} orientation="vertical" />
		</div>
	),
};

/** Empty — events array is empty; renders <ol> with no children, no errors */
export const Empty: Story = {
	render: () => <Timeline events={[]} ariaLabel="Empty timeline" />,
};

/** Playground — use controls panel to experiment with props */
export const Playground: Story = {
	args: {
		events: APPLICATION_EVENTS,
		orientation: "horizontal",
		ariaLabel: "Timeline",
	},
	argTypes: {
		orientation: { control: { type: "radio" }, options: ["horizontal", "vertical"] },
		ariaLabel: { control: "text" },
	},
	render: (args) => <Timeline {...args} />,
};
