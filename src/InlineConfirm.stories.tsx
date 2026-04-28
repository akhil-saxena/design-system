/**
 * # Usage Audit — InlineConfirm (DS-87, DS-45, D-430, D-431)
 *
 * Consumers (post v2.1):
 * - kanban/CardActions — `<InlineConfirm trigger={(p) => <Button variant="ghost"
 *   icon={<Trash/>} {...p}>Delete</Button>} onConfirm={delete} />` on each kanban
 *   card's quick-actions row
 * - interview/QACard — Remove a Q&A pair from a round
 * - tag/ChipManager — Remove a tag from an application (chip-with-X is
 *   instant; this is for "delete tag definition" with confirm)
 * - filter/ClearFilters — Confirm clearing all active filters when many
 *   are set
 * - draft/DiscardDraft — "Discard draft?" inline confirm before tossing
 *   unsaved input
 *
 * vs ConfirmDialog (DS-34, Modal variant — D-431):
 *
 * | Use case                          | Use this primitive   |
 * | --------------------------------- | -------------------- |
 * | Delete a comment / Q&A pair       | InlineConfirm        |
 * | Remove a chip / tag               | InlineConfirm        |
 * | Clear a filter                    | InlineConfirm        |
 * | Withdraw a single application     | InlineConfirm        |
 * | Cancel a draft note               | InlineConfirm        |
 * | Delete account                    | ConfirmDialog        |
 * | Mass-delete (multi-select N items)| ConfirmDialog        |
 * | "Type DELETE to confirm"          | ConfirmDialog        |
 * | Actions blocking other UI         | ConfirmDialog        |
 *
 * Rule of thumb: InlineConfirm wins for 80% of in-list destructives;
 * ConfirmDialog reserved for the 20% high-stakes case.
 *
 * API (D-430):
 * - `trigger: (triggerProps: { onClick: () => void }) => ReactNode` —
 *   REQUIRED render-prop returning the original button/element. We pass
 *   `{ onClick }` so the consumer wires it into our state machine.
 * - `onConfirm: () => void` — REQUIRED handler invoked when user clicks Yes
 * - `onCancel?: () => void` — invoked when user clicks No, ESC, click-outside,
 *   or auto-cancels
 * - `confirmLabel?: string` — default "Yes"
 * - `cancelLabel?: string` — default "No"
 * - `confirmVariant?: 'danger' | 'primary'` — default 'danger' (red); use
 *   'primary' (amber) for non-destructive confirms (e.g., Send/Submit)
 * - `autoCancelMs?: number` — default 4000; pass Infinity to disable
 * - `promptText?: ReactNode` — default "Are you sure?"
 *
 * Behavior:
 * - Idle: renders `trigger({ onClick: beginPending })`
 * - Click trigger → swap to inline row `[promptText] [No] [Yes]` in SAME
 *   container; 4s auto-cancel starts
 * - Hover row OR focus inside row → pause timer; un-hover AND blur → resume
 * - Click No / ESC / click outside / 4s timeout → cancel + revert
 * - Click Yes → onConfirm + revert
 *
 * Caveats:
 * - NO ref forwarding — switches between trigger DOM and prompt DOM
 * - Uncontrolled — caller does NOT pass `open` (different from Modal/Sheet/
 *   AlertBanner)
 * - Inline-flex layout — assumes trigger was also inline (most Buttons are)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Trash } from "lucide-react";
import { Button } from "./Button";
import { InlineConfirm } from "./InlineConfirm";

const meta: Meta<typeof InlineConfirm> = {
	title: "Feedback/InlineConfirm",
	component: InlineConfirm,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof InlineConfirm>;

export const Default: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" icon={<Trash size={14} />} {...p}>
					Delete
				</Button>
			)}
			onConfirm={() => {
				console.log("confirmed");
			}}
			promptText="Delete this application?"
		/>
	),
};

export const DangerVariant: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="danger" {...p}>
					Remove tag
				</Button>
			)}
			onConfirm={() => {}}
			confirmVariant="danger"
			promptText="Remove this tag?"
		/>
	),
};

export const PrimaryVariant: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="primary" {...p}>
					Send
				</Button>
			)}
			onConfirm={() => {}}
			confirmVariant="primary"
			confirmLabel="Send now"
			cancelLabel="Wait"
			promptText="Send the email?"
		/>
	),
};

export const CustomLabels: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => <Button {...p}>Discard draft</Button>}
			onConfirm={() => {}}
			confirmLabel="Discard"
			cancelLabel="Keep"
			promptText="Discard your unsaved changes?"
		/>
	),
};

export const CustomAutoCancel: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" {...p}>
					Click me (10s timeout)
				</Button>
			)}
			onConfirm={() => {}}
			autoCancelMs={10000}
			promptText="10s to decide"
		/>
	),
};

export const DisabledAutoCancel: Story = {
	render: () => (
		<InlineConfirm
			trigger={(p) => <Button {...p}>Click me (no timeout)</Button>}
			onConfirm={() => {}}
			autoCancelMs={Number.POSITIVE_INFINITY}
			promptText="Persists until explicit cancel/confirm"
		/>
	),
};

export const InListContext: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
			{["Stripe", "Linear", "Anthropic"].map((name) => (
				<div
					key={name}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: "10px 12px",
						border: "1px solid var(--rule)",
						borderRadius: "var(--radius-md)",
						background: "var(--surf-1)",
					}}
				>
					<span
						style={{
							flex: 1,
							fontFamily: "var(--display)",
							fontWeight: 600,
							fontSize: 13,
						}}
					>
						{name}
					</span>
					<InlineConfirm
						trigger={(p) => (
							<Button size="xs" variant="ghost" icon={<Trash size={12} />} {...p}>
								Delete
							</Button>
						)}
						onConfirm={() => {}}
						promptText="Delete?"
					/>
				</div>
			))}
		</div>
	),
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" icon={<Trash size={14} />} {...p}>
					Delete (dark)
				</Button>
			)}
			onConfirm={() => {}}
			promptText="Delete this application?"
		/>
	),
};
