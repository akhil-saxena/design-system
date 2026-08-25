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
					"Status chip with two paths. **Preset** — the six job-application stages (`wishlist`, `applied`, `screening`, `interviewing`, `offer`, `closed`), rendered as `<button>` by default; pass `interactive={false}` for read-only contexts. **Generic** — any status, as a `tone` from the library's own tone vocabulary plus a `label`, rendered as a `<span>` with a measured 1.2:1 fill ladder and a non-colour marker. Use the generic path for product statuses: the stage union is job-domain vocabulary and cannot express draft/ready/published or Live/Maintained/Archived (G-5).",
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
		tone: {
			control: "select",
			options: ["primary", "secondary", "muted", "accent", "danger", "success"],
			description:
				"Generic path: semantic tone, mutually exclusive with `stage`. Drives the fill ladder step and the marker shape.",
		},
		label: {
			control: "text",
			description: "Generic path: the pill's content. Replaces `children` on that path.",
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
	globals: { theme: "dark" },
	decorators: [
		(Story) => (
			<div style={{ background: "var(--cream-2)", padding: 16, borderRadius: 8 }}>
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

/**
 * F-15-5's fix, and the story the measurement is taken from.
 *
 * **It deliberately carries no scoped dark wrapper** — and as of plan 01-19.1 no
 * story in this library does. A probe inside such a wrapper measures the WRONG
 * BRAND: `tokens.css` targets `:root.dark, .dark`, so a scoped wrapper
 * re-declares roughly fifty neutral dark tokens, while `monochrome.css` is
 * root-scoped and does not reach inside it. A probe in one of those stories read
 * 31,31,31 where monochrome declares 30,30,29 — it was rendering the default
 * brand. The mode is driven from the Storybook theme global instead, so `<html>`
 * carries both `data-brand` and `.dark` and the cascade is the real one.
 * `src/story-mode.test.ts` enforces that across every story file, and
 * `tests/visual/status-ladder.spec.ts` asserts the brand at the point of
 * measurement for exactly this reason.
 *
 * Two triads, because two tones share each ladder step:
 *
 *   NEUTRAL  muted / secondary / primary   — what D-45's Live/Maintained/Archived
 *                                            wants; three neutral statuses that
 *                                            are actually told apart
 *   HUED     success / accent / danger     — what a semantic surface wants
 *
 * Within a triad the fills clear 1.2:1 against each other and against the page,
 * in both modes and both brands, and the marker shape (ring / disc / square)
 * repeats the same split without using colour. Set the display to greyscale and
 * all three should still read as three states.
 */
export const StatusLadder: Story = {
	parameters: { layout: "padded" },
	render: () => (
		<div style={{ display: "grid", gap: 20 }}>
			<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
				<StatusPill tone="muted" label="Archived" />
				<StatusPill tone="secondary" label="Maintained" />
				<StatusPill tone="primary" label="Live" />
			</div>
			<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
				<StatusPill tone="success" label="Published" />
				<StatusPill tone="accent" label="Ready" />
				<StatusPill tone="danger" label="Draft" />
			</div>
		</div>
	),
};
