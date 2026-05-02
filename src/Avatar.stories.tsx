import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, type AvatarPresencePosition, AvatarStack } from "./Avatar";

const SRC = {
	Default: `// Solid colour derived from name by default
<Avatar name="Alex Morgan" />`,

	Image: `// Pass src to show a photo — initials/bg are hidden
<Avatar name="Alex Morgan" src="https://i.pravatar.cc/80?u=akhil" size={40} />
<Avatar name="Sam Chen"   src="https://i.pravatar.cc/80?u=maya"  size={40} />`,

	Sizes: `<Avatar name="Sam Chen"     size={24} />
<Avatar name="David Swanson" size={28} />
<Avatar name="Jake Kim"      size={32} />
<Avatar name="Alex Park"     size={36} />
<Avatar name="Sam Patel"     size={40} />`,

	Presence: `<Avatar name="Sam Chen"     presence="online"  />
<Avatar name="David Swanson" presence="away"    />
<Avatar name="Jake Kim"      presence="offline" />
<Avatar name="Alex Park"     presence="dnd"     />`,

	Gradient: `// Pass gradient={true} to use auto-derived gradient
<Avatar name="Alex Morgan" gradient />

// Or pass custom stops
<Avatar name="Custom" gradient={["#7c3aed", "#1d4ed8"]} />`,

	Stack: `<AvatarStack
  avatars={[
    { name: "Sam Chen" },
    { name: "David Swanson" },
    { name: "Jake Kim" },
    { name: "Alex Park" },
    { name: "Sam Patel" },
  ]}
  max={4}
  size={32}
/>`,

	Playground: `<Avatar name="Alex Morgan" size={32} />`,

	DarkMode: `<Avatar name="Sam Chen"     size={32} />
<Avatar name="David Swanson" size={32} presence="online" />
<Avatar name="Jake Kim"      size={32} src="https://i.pravatar.cc/80?u=jake" />
<AvatarStack avatars={[{ name: "A" }, { name: "B" }, { name: "C" }]} max={3} />`,
};

const meta: Meta<typeof Avatar> = {
	title: "Atoms/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"User avatar with deterministic solid-color initials, optional photo (`src`), presence indicator, and five sizes. Pass `gradient` or `gradient={[from, to]}` to use gradient backgrounds.",
			},
		},
	},
	args: { name: "Alex Morgan" },
	argTypes: {
		name: { control: "text", description: "Full name — drives initials and background colour." },
		initials: {
			control: "text",
			description: "Override auto-derived initials (1–2 uppercase letters).",
		},
		src: {
			control: "text",
			description: "Image URL. When provided, fills the circle and hides initials.",
		},
		alt: { control: "text", description: "Alt text for the image; falls back to `name`." },
		gradient: {
			control: false,
			description:
				"`true` uses the auto-derived gradient; `[from, to]` uses custom stops. Default is a solid colour.",
		},
		size: { control: "select", options: [24, 28, 32, 36, 40], description: "Diameter in px." },
		presence: {
			control: "select",
			options: ["online", "away", "offline", "dnd"],
			description: "Presence dot at bottom-right edge.",
		},
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Solid colour derived from the name hash. Same name always produces the same colour.",
			},
			source: { code: SRC.Default },
		},
	},
};

export const WithImage: Story = {
	name: "With image",
	parameters: {
		docs: {
			description: {
				story:
					"Pass `src` to show a photo. The circle clips to the image; initials and background are hidden.",
			},
			source: { code: SRC.Image },
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="Alex Morgan" src="https://i.pravatar.cc/80?u=akhil" size={40} />
			<Avatar name="Sam Chen" src="https://i.pravatar.cc/80?u=maya" size={40} />
			<Avatar
				name="David Swanson"
				src="https://i.pravatar.cc/80?u=david"
				size={40}
				presence="online"
			/>
		</div>
	),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: "Five size tokens from 24 to 40 px." },
			source: { code: SRC.Sizes },
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="Sam Chen" size={24} />
			<Avatar name="David Swanson" size={28} />
			<Avatar name="Jake Kim" size={32} />
			<Avatar name="Alex Park" size={36} />
			<Avatar name="Sam Patel" size={40} />
		</div>
	),
};

export const Presence: Story = {
	parameters: {
		docs: {
			description: {
				story: "Presence dot positioned at the bottom-right edge, straddling the avatar border.",
			},
			source: { code: SRC.Presence },
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Sam Chen" presence="online" size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>online</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<Avatar name="David Swanson" presence="away" size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>away</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Jake Kim" presence="offline" size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>offline</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Alex Park" presence="dnd" size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>dnd</div>
			</div>
		</div>
	),
};

export const GradientOption: Story = {
	name: "Gradient (opt-in)",
	parameters: {
		docs: {
			description: {
				story:
					"`gradient` is opt-in. Pass `gradient` (auto-derived) or `gradient={[from, to]}` (custom stops).",
			},
			source: { code: SRC.Gradient },
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Alex Morgan" size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>solid (default)</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Alex Morgan" gradient size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>gradient={"{true}"}</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<Avatar name="Custom" gradient={["#7c3aed", "#1d4ed8"]} size={40} />
				<div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>custom stops</div>
			</div>
		</div>
	),
};

export const Stack: Story = {
	parameters: {
		docs: {
			description: {
				story: "Overlapping stack with `+N` overflow badge when count exceeds `max`.",
			},
			source: { code: SRC.Stack },
		},
	},
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<AvatarStack
				avatars={[
					{ name: "Sam Chen" },
					{ name: "David Swanson" },
					{ name: "Jake Kim" },
					{ name: "Alex Park" },
					{ name: "Sam Patel" },
				]}
				max={4}
				size={32}
			/>
			<AvatarStack
				avatars={[{ name: "Sam Chen" }, { name: "David Swanson" }, { name: "Jake Kim" }]}
				max={4}
				size={24}
			/>
		</div>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	parameters: {
		docs: {
			description: { story: "Solid colours and presence dots follow dark tokens automatically." },
			source: { code: SRC.DarkMode },
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 24, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Avatar name="Sam Chen" size={40} />
			<Avatar name="David Swanson" size={40} presence="online" />
			<Avatar name="Jake Kim" size={40} src="https://i.pravatar.cc/80?u=jake" presence="away" />
			<AvatarStack
				avatars={[{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }]}
				max={3}
				size={32}
			/>
		</div>
	),
};

const PRESENCE_POSITIONS: AvatarPresencePosition[] = [
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right",
];

export const PresencePositions: Story = {
	name: "Presence — 4 corners (DS-79)",
	parameters: {
		docs: {
			description: {
				story:
					"The `presencePosition` prop (default `bottom-right`) places the dot at any of the four corners.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
			{PRESENCE_POSITIONS.map((pos) => (
				<div key={pos} style={{ textAlign: "center" }}>
					<Avatar name="Sam Chen" size={40} presence="online" presencePosition={pos} />
					<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3)" }}>{pos}</div>
				</div>
			))}
		</div>
	),
};

export const PresenceAllStatuses: Story = {
	name: "Presence — all statuses",
	parameters: {
		docs: {
			description: {
				story:
					"All four presence statuses rendered at `size=40` with the default `bottom-right` position.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
			{(["online", "away", "offline", "dnd"] as const).map((status) => (
				<div key={status} style={{ textAlign: "center" }}>
					<Avatar name="Alex Park" size={40} presence={status} />
					<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3)" }}>{status}</div>
				</div>
			))}
		</div>
	),
};

export const PresenceDark: Story = {
	name: "Presence — dark mode corners",
	parameters: {
		docs: {
			description: {
				story: "All four corner positions shown in dark mode.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 24, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
			{PRESENCE_POSITIONS.map((pos) => (
				<div key={pos} style={{ textAlign: "center" }}>
					<Avatar name="Sam Chen" size={40} presence="online" presencePosition={pos} />
					<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3)" }}>{pos}</div>
				</div>
			))}
		</div>
	),
};
