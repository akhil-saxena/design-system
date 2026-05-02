/**
 * # Usage Audit — StarRating (D-87, D-151, D-240)
 *
 * Consumers (post v2.1):
 * - interview/RoundRating — review form star rating after each interview round
 * - companies/OverallRating — read-only compact stars in company list (size=compact, readOnly)
 * - search/RelevanceFeedback — thumbs-up/down replacement (1=strongly negative, 5=strongly positive)
 * - applications/Excitement — quick "how excited are you about this role" rating in detail panel
 *
 * API shape consumers expect:
 * - value (controlled) + onChange(next: number) — controlled callback
 * - size: 'default' (24px) for forms, 'compact' (14px) for inline list display
 * - readOnly: prevents click + hover preview; useful for displaying stored ratings
 * - disabled: also prevents interaction + visually dims
 * - label: accessible label for the whole radiogroup
 * - Self-contained — does NOT use Phase 12 RadioGroup (D-240)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StarRating } from "./StarRating";

const SRC = {
	Interactive: `const [v, setV] = useState(3);
return <StarRating value={v} onChange={setV} label="Interview round rating" />;`,
	Compact: `const [v, setV] = useState(4);
return <StarRating value={v} onChange={setV} size="compact" label="Compact rating" />;`,
	AllValues: `<StarRating value={0} onChange={() => {}} label="Rating 0" />
<StarRating value={1} onChange={() => {}} label="Rating 1" />
<StarRating value={2} onChange={() => {}} label="Rating 2" />
<StarRating value={3} onChange={() => {}} label="Rating 3" />
<StarRating value={4} onChange={() => {}} label="Rating 4" />
<StarRating value={5} onChange={() => {}} label="Rating 5" />`,
	ReadOnly: `<StarRating value={4} readOnly label="Read-only rating (default)" />
<StarRating value={3} size="compact" readOnly label="Read-only rating (compact)" />`,
	Disabled: `<StarRating value={3} onChange={() => {}} disabled label="Disabled rating" />`,
	Playground: `const [v, setV] = useState(3);
return <StarRating value={v} onChange={setV} size="default" label="Playground" />;`,
	DarkMode: `const [a, setA] = useState(3);
const [b, setB] = useState(4);
return (
  <>
    <StarRating value={a} onChange={setA} label="Interactive (default)" />
    <StarRating value={b} onChange={setB} size="compact" label="Interactive (compact)" />
    <StarRating value={5} readOnly label="Read-only" />
    <StarRating value={2} onChange={() => {}} disabled label="Disabled" />
  </>
);`,
};

const meta: Meta<typeof StarRating> = {
	title: "Atoms/StarRating",
	component: StarRating,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Star rating widget with configurable max stars, orthogonal size and readOnly props, half-star display, and hover preview.",
			},
		},
	},
	argTypes: {
		value: { control: "number", description: "Controlled rating value (1–5)." },
		onChange: {
			control: false,
			description:
				"Called when the user clicks a star with the new rating; omit for read-only display.",
		},
		size: {
			control: "select",
			options: ["default", "compact"],
			description: "Icon size token; compact uses 14px stars for dense list contexts.",
		},
		label: {
			control: "text",
			description: "Accessible label for the role='radiogroup' container.",
		},
		readOnly: {
			control: "boolean",
			description:
				"When true, disables hover preview and click interaction without the disabled visual.",
		},
		disabled: {
			control: "boolean",
			description: "When true, disables all interaction and dims the stars.",
		},
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof StarRating>;

export const Interactive: Story = {
	parameters: { docs: { source: { code: SRC.Interactive } } },
	render: () => {
		const [v, setV] = useState(3);
		return <StarRating value={v} onChange={setV} label="Interview round rating" />;
	},
};

export const Compact: Story = {
	parameters: { docs: { source: { code: SRC.Compact } } },
	render: () => {
		const [v, setV] = useState(4);
		return <StarRating value={v} onChange={setV} size="compact" label="Compact rating" />;
	},
};

export const AllValues: Story = {
	parameters: { docs: { source: { code: SRC.AllValues } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
			{[0, 1, 2, 3, 4, 5].map((n) => (
				<div key={n} style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 11,
							color: "var(--ink-3)",
							width: 20,
						}}
					>
						{n}
					</span>
					<StarRating value={n} onChange={() => {}} label={`Rating ${n}`} />
				</div>
			))}
		</div>
	),
};

export const ReadOnly: Story = {
	parameters: { docs: { source: { code: SRC.ReadOnly } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<StarRating value={4} readOnly label="Read-only rating (default)" />
			<StarRating value={3} size="compact" readOnly label="Read-only rating (compact)" />
		</div>
	),
};

export const Disabled: Story = {
	parameters: { docs: { source: { code: SRC.Disabled } } },
	render: () => <StarRating value={3} onChange={() => {}} disabled label="Disabled rating" />,
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	args: { value: 3, size: "default", readOnly: false, disabled: false, label: "Playground" },
	argTypes: {
		value: { control: { type: "range", min: 0, max: 5, step: 1 } },
		size: { control: { type: "select", options: ["default", "compact"] } },
		readOnly: { control: "boolean" },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [v, setV] = useState(args.value);
		return <StarRating {...args} value={v} onChange={setV} />;
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
		const [a, setA] = useState(3);
		const [b, setB] = useState(4);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
				<StarRating value={a} onChange={setA} label="Interactive (default)" />
				<StarRating value={b} onChange={setB} size="compact" label="Interactive (compact)" />
				<StarRating value={5} readOnly label="Read-only" />
				<StarRating value={2} onChange={() => {}} disabled label="Disabled" />
			</div>
		);
	},
};
