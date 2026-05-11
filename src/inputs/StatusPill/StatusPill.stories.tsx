import type { Meta, StoryObj } from "@storybook/react";
import { StatusPill } from ".";

const meta: Meta<typeof StatusPill> = {
	title: "Inputs/StatusPill",
	component: StatusPill,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Per-stage tinted pipeline chip for Cairn-style kanban + DataGrid status columns. Six locked stages — `wishlist`, `applied`, `screening`, `interviewing`, `offer`, `closed`. Renders as `<button>` by default; pass `interactive={false}` for decorative read-only contexts.",
			},
		},
	},
	args: { stage: "applied", children: "Applied" },
	argTypes: {
		stage: {
			control: "select",
			options: ["wishlist", "applied", "screening", "interviewing", "offer", "closed"],
			description: "Pipeline stage — drives bg/color tinting.",
		},
		withChevron: {
			control: "boolean",
			description: "Show trailing chevron — signals the pill is a dropdown trigger.",
		},
		interactive: {
			control: "boolean",
			description: "Render as <button> (true) or decorative <span> (false).",
		},
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof StatusPill>;

export const Default: Story = {};

export const AllStages: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<StatusPill stage="wishlist">Wishlist</StatusPill>
			<StatusPill stage="applied">Applied</StatusPill>
			<StatusPill stage="screening">Screening</StatusPill>
			<StatusPill stage="interviewing">Interviewing</StatusPill>
			<StatusPill stage="offer">Offer</StatusPill>
			<StatusPill stage="closed">Closed</StatusPill>
		</div>
	),
};

export const WithChevron: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<StatusPill stage="screening" withChevron>
				Screening
			</StatusPill>
			<StatusPill stage="interviewing" withChevron>
				Interviewing
			</StatusPill>
			<StatusPill stage="offer" withChevron>
				Offer
			</StatusPill>
		</div>
	),
};

export const NonInteractive: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<StatusPill stage="applied" interactive={false}>
				Applied
			</StatusPill>
			<StatusPill stage="offer" interactive={false}>
				Offer
			</StatusPill>
			<StatusPill stage="closed" interactive={false}>
				Closed
			</StatusPill>
		</div>
	),
};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<StatusPill stage="wishlist">Wishlist</StatusPill>
			<StatusPill stage="applied">Applied</StatusPill>
			<StatusPill stage="screening">Screening</StatusPill>
			<StatusPill stage="interviewing">Interviewing</StatusPill>
			<StatusPill stage="offer">Offer</StatusPill>
			<StatusPill stage="closed">Closed</StatusPill>
		</div>
	),
};
