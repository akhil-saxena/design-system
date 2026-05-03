import type { Meta, StoryObj } from "@storybook/react";
import { Timeline, type TimelineEvent } from ".";
const SRC = {
	Horizontal: `<Timeline
  events={[
    { id: 1, date: "2026-03-04T00:00:00.000Z", label: "Kickoff", description: "project start" },
    { id: 2, date: "2026-03-11T00:00:00.000Z", label: "Planning" },
    { id: 3, date: "2026-03-18T00:00:00.000Z", label: "Review", description: "in progress" },
    { id: 4, date: "2026-03-25T00:00:00.000Z", label: "Build" },
    { id: 5, date: "2026-04-02T00:00:00.000Z", label: "Release" },
  ]}
  orientation="horizontal"
/>`,
	Vertical: `<Timeline
  events={[
    { id: 1, date: "2026-03-04T00:00:00.000Z", label: "Kickoff", description: "project start" },
    { id: 2, date: "2026-03-11T00:00:00.000Z", label: "Planning" },
    { id: 3, date: "2026-03-18T00:00:00.000Z", label: "Review" },
    { id: 4, date: "2026-03-25T00:00:00.000Z", label: "Build" },
    { id: 5, date: "2026-04-02T00:00:00.000Z", label: "Release" },
  ]}
  orientation="vertical"
/>`,
	Milestones: `<Timeline
  events={[
    { id: "m1", date: "2026-01-15T00:00:00.000Z", label: "Kickoff", description: "Project start", color: "var(--amber)" },
    { id: "m2", date: "2026-02-01T00:00:00.000Z", label: "Discovery", description: "Research & wireframes", color: "var(--amber-d)" },
    { id: "m3", date: "2026-03-01T00:00:00.000Z", label: "Design", description: "High-fidelity handoff", color: "#6366f1" },
    { id: "m4", date: "2026-04-01T00:00:00.000Z", label: "Build", description: "Engineering sprint", color: "#0ea5e9" },
    { id: "m5", date: "2026-05-01T00:00:00.000Z", label: "Launch", description: "v1.0 release", color: "#22c55e" },
  ]}
/>`,
	Clickable: `<Timeline
  events={events.map((ev) => ({
    ...ev,
    onClick: () => console.log(\`Clicked: \${ev.label}\`),
  }))}
  ariaLabel="Clickable project stages"
/>`,
	DarkMode: `<Timeline events={projectEvents} />
<Timeline events={milestoneEvents} orientation="vertical" />`,
	Empty: `<Timeline events={[]} ariaLabel="Empty timeline" />`,
	Playground: `<Timeline events={events} orientation="horizontal" ariaLabel="Timeline" />`,
};

const meta: Meta<typeof Timeline> = {
	title: "Data Display/Timeline",
	component: Timeline,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Ordered sequence of dated events rendered as a horizontal or vertical track with amber dots, connector lines, and optional click handlers.",
			},
		},
	},
	argTypes: {
		events: {
			control: false,
			description: "Ordered array of events rendered as dots connected by a line.",
		},
		orientation: {
			control: "select",
			options: ["horizontal", "vertical"],
			description: "Layout direction of the timeline.",
		},
		ariaLabel: { control: "text", description: "Accessible label for the ol list." },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Timeline>;

// ─── Shared fixtures ───────────────────────────────────────────────────────

const APPLICATION_EVENTS: TimelineEvent[] = [
	{ id: 1, date: "2026-03-04T00:00:00.000Z", label: "Kickoff", description: "project start" },
	{ id: 2, date: "2026-03-11T00:00:00.000Z", label: "Planning" },
	{ id: 3, date: "2026-03-18T00:00:00.000Z", label: "Review", description: "in progress" },
	{ id: 4, date: "2026-03-25T00:00:00.000Z", label: "Build" },
	{ id: 5, date: "2026-04-02T00:00:00.000Z", label: "Release" },
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

/** Default horizontal timeline - 5 project stages with dates */
export const Horizontal: Story = {
	parameters: { docs: { source: { code: SRC.Horizontal } } },
	render: () => <Timeline events={APPLICATION_EVENTS} orientation="horizontal" />,
};

/** Vertical orientation - events stack column with left-aligned dots */
export const Vertical: Story = {
	parameters: { docs: { source: { code: SRC.Vertical } } },
	render: () => (
		<div style={{ maxWidth: 400 }}>
			<Timeline events={APPLICATION_EVENTS} orientation="vertical" />
		</div>
	),
};

/** Milestones - events with descriptions and custom dot colors */
export const Milestones: Story = {
	parameters: { docs: { source: { code: SRC.Milestones } } },
	render: () => <Timeline events={MILESTONE_EVENTS} />,
};

/** Clickable - events with onClick handlers (fires action in Storybook panel) */
export const Clickable: Story = {
	parameters: { docs: { source: { code: SRC.Clickable } } },
	render: () => {
		const clickableEvents: TimelineEvent[] = APPLICATION_EVENTS.map((ev) => ({
			...ev,
			onClick: () => console.log(`Clicked: ${ev.label}`),
		}));
		return <Timeline events={clickableEvents} ariaLabel="Clickable project stages" />;
	},
};

/** Dark mode */
export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			<Timeline events={APPLICATION_EVENTS} />
			<Timeline events={MILESTONE_EVENTS} orientation="vertical" />
		</div>
	),
};

/** Empty - events array is empty; renders <ol> with no children, no errors */
export const Empty: Story = {
	parameters: { docs: { source: { code: SRC.Empty } } },
	render: () => <Timeline events={[]} ariaLabel="Empty timeline" />,
};

/** Playground - use controls panel to experiment with props */
export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
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
