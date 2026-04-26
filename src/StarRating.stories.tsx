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

const meta: Meta<typeof StarRating> = {
	title: "Atoms/StarRating",
	component: StarRating,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof StarRating>;

export const Interactive: Story = {
	render: () => {
		const [v, setV] = useState(3);
		return <StarRating value={v} onChange={setV} label="Interview round rating" />;
	},
};

export const Compact: Story = {
	render: () => {
		const [v, setV] = useState(4);
		return <StarRating value={v} onChange={setV} size="compact" label="Compact rating" />;
	},
};

export const AllValues: Story = {
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
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<StarRating value={4} readOnly label="Read-only rating (default)" />
			<StarRating value={3} size="compact" readOnly label="Read-only rating (compact)" />
		</div>
	),
};

export const Disabled: Story = {
	render: () => <StarRating value={3} onChange={() => {}} disabled label="Disabled rating" />,
};

export const Playground: Story = {
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
	globals: { theme: "dark" },
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
