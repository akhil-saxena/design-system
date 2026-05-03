import type { Meta, StoryObj } from "@storybook/react";
import { StickyNote } from ".";
const SRC = {
	Default: `<StickyNote>
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
    Follow up before Thursday. Review project scope with the team.
  </div>
  <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 9.5, color: "rgba(41,37,36,.55)", textTransform: "uppercase" }}>
    Click to expand
  </div>
</StickyNote>`,
	Rotations: `<StickyNote rotation="left">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Left tilt - rotate(-0.6deg).</div>
</StickyNote>
<StickyNote rotation="right">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Right tilt - rotate(0.4deg). Default.</div>
</StickyNote>
<StickyNote rotation="none">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>No tilt - rotate(0deg).</div>
</StickyNote>`,
	Group: `<StickyNote rotation="right">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Follow up before Thursday. Review project scope with the team.</div>
</StickyNote>
<StickyNote rotation="right">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Prep 3 questions for the client.</div>
</StickyNote>
<StickyNote rotation="left">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Follow up if no reply within 3 days.</div>
</StickyNote>`,
	Playground: `<StickyNote rotation="right">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Playground note - tweak rotation in controls.</div>
</StickyNote>`,
	DarkMode: `<StickyNote rotation="left">
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>Sticky notes stay yellow in dark mode - handoff invariant.</div>
</StickyNote>`,
};

const meta: Meta<typeof StickyNote> = {
	title: "Overlays/StickyNote",
	component: StickyNote,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Yellow-gradient note surface with a slight static rotation; always renders with dark text regardless of the active color scheme.",
			},
		},
	},
	argTypes: {
		rotation: {
			control: "select",
			options: ["left", "right", "none"],
			description:
				"Tilts the note surface to mimic a hand-pinned look. `left` = −2°, `right` = +2° (default), `none` = flat. Use mixed rotations when showing multiple notes side-by-side.",
		},
		children: { control: false, description: "Arbitrary JSX content rendered inside the note." },
		className: { control: false },
		style: { control: false },
	},
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
	parameters: { docs: { source: { code: SRC.Default } } },
	args: {
		children: (
			<>
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Follow up before Thursday. Review project scope with the team.
				</div>
				<div style={hintStyle}>Click to expand</div>
			</>
		),
	},
};

export const Rotations: Story = {
	parameters: { docs: { source: { code: SRC.Rotations } } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Left tilt - rotate(-0.6deg).</div>
				<div style={hintStyle}>left</div>
			</StickyNote>
			<StickyNote rotation="right">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Right tilt - rotate(0.4deg). Default.</div>
				<div style={hintStyle}>right (default)</div>
			</StickyNote>
			<StickyNote rotation="none">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>No tilt - rotate(0deg).</div>
				<div style={hintStyle}>none</div>
			</StickyNote>
		</div>
	),
};

export const Group: Story = {
	parameters: { docs: { source: { code: SRC.Group } } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="right">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Follow up before Thursday. Review project scope with the team.
				</div>
				<div style={hintStyle}>Click to expand</div>
			</StickyNote>
			<StickyNote rotation="right" style={{ transform: "rotate(0.4deg)" }}>
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Prep 3 questions for the client:
					<br />- Division scope
					<br />- Trial expectations
					<br />- Mentorship
				</div>
				<div style={hintStyle}>3 items</div>
			</StickyNote>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>Follow up if no reply within 3 days.</div>
				<div style={hintStyle}>Reminder</div>
			</StickyNote>
		</div>
	),
};

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
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 14, padding: 20 }}>
			<StickyNote rotation="left">
				<div style={{ fontSize: 13, lineHeight: 1.5 }}>
					Sticky notes stay yellow in dark mode - handoff invariant.
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
					Identical to light-mode rendering - by design.
				</div>
				<div style={hintStyle}>parity</div>
			</StickyNote>
		</div>
	),
};
