/**
 * # Usage Audit — Radio + RadioGroup
 *
 * Consumers (post v2.1):
 * - settings/ResponseTimeRange — selects a custom range from 4 presets
 * - filters/SortDirection — asc / desc / none mutually exclusive
 * - detail/InterviewRoundOutcome — passed / failed / pending
 *
 * API:
 * - Radio extends native <input type='radio'> attrs (Omit'd 'type' + 'value' to retype value as required string)
 * - RadioGroup provides shared name + onChange context
 * - Standalone <Radio name=… checked=… onChange=…> works without RadioGroup
 *
 * Implementation (D-130/131/133/134): native input visually hidden inside <label>;
 * 18×18 circular box with sibling-selector :checked → amber border + 8×8 inner dot;
 * dot is a CSS-only span (no SVG).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio, RadioGroup } from "./Radio";

const meta: Meta<typeof Radio> = {
	title: "Atoms/Radio",
	component: Radio,
	parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	render: () => (
		<RadioGroup name="status" value="applied" onChange={() => {}}>
			<Radio value="wishlist" label="Wishlist" />
			<Radio value="applied" label="Applied" />
			<Radio value="screening" label="Screening" />
			<Radio value="interviewing" label="Interviewing" />
		</RadioGroup>
	),
};

export const Controlled: Story = {
	render: () => {
		const [v, setV] = useState("applied");
		return (
			<RadioGroup name="status" value={v} onChange={(next) => setV(next)}>
				<Radio value="wishlist" label="Wishlist" />
				<Radio value="applied" label={`Applied (selected=${v === "applied"})`} />
				<Radio value="screening" label="Screening" />
			</RadioGroup>
		);
	},
};

export const Disabled: Story = {
	render: () => (
		<RadioGroup name="status" value="applied">
			<Radio value="wishlist" label="Wishlist" />
			<Radio value="applied" label="Applied (selected)" disabled />
			<Radio value="screening" label="Screening" disabled />
		</RadioGroup>
	),
};

export const Standalone: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Radio value="opt1" name="standalone" label="Standalone Option 1" defaultChecked />
			<Radio value="opt2" name="standalone" label="Standalone Option 2" />
		</div>
	),
};

export const Playground: Story = {
	render: () => (
		<RadioGroup name="play" value="b">
			<Radio value="a" label="Option A" />
			<Radio value="b" label="Option B (selected)" />
			<Radio value="c" label="Option C" />
		</RadioGroup>
	),
};

export const DarkMode: Story = {
	render: () => (
		<RadioGroup name="status-dark" value="applied">
			<Radio value="wishlist" label="Wishlist" />
			<Radio value="applied" label="Applied (selected)" />
			<Radio value="screening" label="Screening" />
			<Radio value="rejected" label="Rejected" disabled />
		</RadioGroup>
	),
	globals: { theme: "dark" },
};
