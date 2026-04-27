/**
 * # Usage Audit — StickyNote (D-87, DS-31)
 *
 * Consumers (post v2.1):
 * - detail/QuickReminderNote — StickyNote with reminder text + "Reminder" hint child
 * - detail/PrepQuestionsList — StickyNote with bulleted questions + "3 items" hint child
 * - detail/FollowUpNote — StickyNote with follow-up date in bold + "Reminder" hint child
 * - dashboard/PinnedNotes — small grid of StickyNotes with mixed rotations for visual variety
 *
 * API:
 * - extends native <div> attributes (HTMLAttributes<HTMLDivElement>)
 * - rotation: 'left' | 'right' | 'none' — default 'right' (slight +0.4deg tilt)
 * - children: arbitrary JSX (mirrors Card freely-composed pattern; the
 *   handoff's `.ds-sticky-hint` mini-line is consumer's responsibility)
 * - style prop merges LAST so consumers can override transform / padding
 *   if they need a custom rotation beyond the 3 enum values
 * - forwards ref to root div for measurement / focus / portal-anchor use
 *
 * Implementation: single .tsx with `data-rotation` attribute; CSS attribute
 * selectors in primitives.css drive rotation per value. Mirrors Card's
 * data-variant pattern (D-300).
 *
 * Visual invariants (handoff):
 * - Yellow gradient `linear-gradient(145deg, #fef3c7, #fde68a)`
 * - Amber-tinted drop shadow `0 2px 8px rgba(245,158,11,.15)`
 * - ALWAYS DARK TEXT (color: #292524) — does NOT flip in :root.dark
 */
import type { Meta, StoryObj } from "@storybook/react";
import { StickyNote } from "./StickyNote";

const meta: Meta<typeof StickyNote> = {
	title: "Surfaces/StickyNote",
	component: StickyNote,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof StickyNote>;

const hintStyle = {
	marginTop: 10,
	fontFamily: "var(--mono)",
	fontSize: 9.5,
	color: "rgba(41, 37, 36, 0.55)",
	letterSpacing: "0.06em",
	textTransform: "uppercase" as const,
};

export const Default: Story = {
	args: {
		children: (
			<>
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Reach out to David before screening. Research Jetpack vs WP.com split.
				</div>
				<div style={hintStyle}>Click to expand</div>
			</>
		),
	},
};

export const Rotations: Story = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Left tilt — rotate(-0.6deg).</div>
				<div style={hintStyle}>left</div>
			</StickyNote>
			<StickyNote rotation="right">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Right tilt — rotate(0.4deg). Default.</div>
				<div style={hintStyle}>right (default)</div>
			</StickyNote>
			<StickyNote rotation="none">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>No tilt — rotate(0deg).</div>
				<div style={hintStyle}>none</div>
			</StickyNote>
		</div>
	),
};

export const Group: Story = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="right">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Reach out to David before screening. Research Jetpack vs WP.com split.
				</div>
				<div style={hintStyle}>Click to expand</div>
			</StickyNote>
			<StickyNote rotation="right" style={{ transform: "rotate(0.4deg)" }}>
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Prep 3 questions for Maya:
					<br />- Division scope
					<br />- Trial expectations
					<br />- Mentorship
				</div>
				<div style={hintStyle}>3 items</div>
			</StickyNote>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Follow up if no reply by May 2.</div>
				<div style={hintStyle}>Reminder</div>
			</StickyNote>
		</div>
	),
};

export const Playground: Story = {
	args: {
		rotation: "right",
		children: (
			<>
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Playground note — tweak rotation in controls.
				</div>
				<div style={hintStyle}>playground</div>
			</>
		),
	},
	argTypes: {
		rotation: { control: "select", options: ["left", "right", "none"] },
	},
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Sticky notes stay yellow in dark mode — handoff invariant.
				</div>
				<div style={hintStyle}>invariant check</div>
			</StickyNote>
			<StickyNote rotation="right">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Text stays dark (#292524) even when surrounding chrome flips dark.
				</div>
				<div style={hintStyle}>always-dark text</div>
			</StickyNote>
			<StickyNote rotation="none">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Identical to light-mode rendering — by design.
				</div>
				<div style={hintStyle}>parity</div>
			</StickyNote>
		</div>
	),
};
