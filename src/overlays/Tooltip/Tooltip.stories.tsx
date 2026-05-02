import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from ".";
const SRC = {
	Default: `<Tooltip content="Star this item">
  <button type="button" aria-label="Star">★</button>
</Tooltip>`,
	AllPlacements: `<Tooltip content="Top placement" placement="top">
  <button type="button">top</button>
</Tooltip>
<Tooltip content="Right placement" placement="right">
  <button type="button">right</button>
</Tooltip>
<Tooltip content="Bottom placement" placement="bottom">
  <button type="button">bottom</button>
</Tooltip>
<Tooltip content="Left placement" placement="left">
  <button type="button">left</button>
</Tooltip>`,
	WithIcon: `<Tooltip content="Star this item">
  <button type="button" aria-label="Star">★</button>
</Tooltip>
<Tooltip content="Archive">
  <button type="button" aria-label="Archive">📦</button>
</Tooltip>
<Tooltip content="Delete item">
  <button type="button" aria-label="Delete">🗑</button>
</Tooltip>`,
	LongContent: `<Tooltip content="A longer tooltip with more text — wraps if max-width reached, otherwise stays single-line." placement="top">
  <button type="button">top</button>
</Tooltip>`,
	Playground: `<Tooltip content="Playground tooltip" placement="top" delay={150}>
  <button type="button">Hover me</button>
</Tooltip>`,
	DarkMode: `<Tooltip content="Top — dark mode" placement="top">
  <button type="button">top</button>
</Tooltip>
<Tooltip content="Right — dark mode" placement="right">
  <button type="button">right</button>
</Tooltip>`,
};

const meta: Meta<typeof Tooltip> = {
	title: "Overlays/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Lightweight hover/focus overlay that shows a short text label anchored to its trigger, with configurable placement and delay.",
			},
		},
	},
	argTypes: {
		content: {
			control: false,
			description: "Content rendered inside the tooltip surface; accepts any ReactNode.",
		},
		placement: {
			control: "select",
			options: ["auto", "top", "right", "bottom", "left"],
			description:
				"Preferred placement relative to the trigger; auto picks the side with the most viewport room.",
		},
		delay: {
			control: "number",
			description: "Milliseconds to wait after mouseenter/focus before showing the tooltip.",
		},
		children: {
			control: false,
			description: "The single trigger element; Tooltip clones it to attach event handlers.",
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const buttonStyle = {
	background: "var(--surf-1)",
	border: "1px solid var(--rule)",
	borderRadius: 7,
	padding: "7px 14px",
	fontFamily: "var(--font)",
	fontSize: 12,
	cursor: "pointer",
	color: "var(--ink)",
} as const;

/**
 * NOTE on baseline capture: tooltips open on hover/focus, which the
 * test-runner's headless Chromium does NOT trigger automatically. Stories
 * that need the tooltip OPEN in the captured baseline render the tooltip in
 * its open state by wrapping the trigger in a tiny ref-callback that fires a
 * synthetic `mouseenter` on mount with delay={0}, so DSPortal has time to
 * mount and the tooltip surface appears in the captured PNG.
 */
function AlwaysOpenTooltip({
	content,
	placement,
}: {
	content: string;
	placement: "top" | "right" | "bottom" | "left";
}) {
	const ref = (node: HTMLButtonElement | null) => {
		if (node) {
			// 50ms gives DSPortal's useEffect time to flip mounted=true before
			// the synthetic mouseenter fires.
			setTimeout(() => {
				const ev = new MouseEvent("mouseenter", { bubbles: true });
				node.dispatchEvent(ev);
			}, 50);
		}
	};
	return (
		<Tooltip content={content} placement={placement} delay={0}>
			<button type="button" style={buttonStyle} ref={ref}>
				{placement}
			</button>
		</Tooltip>
	);
}

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => (
		<div style={{ padding: 60, display: "inline-block" }}>
			<Tooltip content="Star this item">
				<button type="button" style={buttonStyle} aria-label="Star">
					★
				</button>
			</Tooltip>
		</div>
	),
};

export const AllPlacements: Story = {
	parameters: { docs: { source: { code: SRC.AllPlacements } } },
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: 80,
				padding: 80,
			}}
		>
			<AlwaysOpenTooltip content="Top placement" placement="top" />
			<AlwaysOpenTooltip content="Right placement" placement="right" />
			<AlwaysOpenTooltip content="Bottom placement" placement="bottom" />
			<AlwaysOpenTooltip content="Left placement" placement="left" />
		</div>
	),
};

export const WithIcon: Story = {
	parameters: { docs: { source: { code: SRC.WithIcon } } },
	render: () => (
		<div style={{ display: "flex", gap: 20, padding: 60 }}>
			<Tooltip content="Star this item">
				<button type="button" style={{ ...buttonStyle, padding: "7px 10px" }} aria-label="Star">
					★
				</button>
			</Tooltip>
			<Tooltip content="Archive">
				<button type="button" style={{ ...buttonStyle, padding: "7px 10px" }} aria-label="Archive">
					📦
				</button>
			</Tooltip>
			<Tooltip content="Delete item">
				<button type="button" style={{ ...buttonStyle, padding: "7px 10px" }} aria-label="Delete">
					🗑
				</button>
			</Tooltip>
		</div>
	),
};

export const LongContent: Story = {
	parameters: { docs: { source: { code: SRC.LongContent } } },
	render: () => (
		<div style={{ padding: 80, display: "inline-block" }}>
			<AlwaysOpenTooltip
				content="A longer tooltip with more text — wraps if max-width reached, otherwise stays single-line."
				placement="top"
			/>
		</div>
	),
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: (args) => (
		<div style={{ padding: 80 }}>
			<Tooltip content={args.content} placement={args.placement} delay={args.delay}>
				<button type="button" style={buttonStyle}>
					Hover me
				</button>
			</Tooltip>
		</div>
	),
	args: {
		content: "Playground tooltip",
		placement: "top",
		delay: 150,
	},
	argTypes: {
		placement: {
			control: "select",
			options: ["top", "right", "bottom", "left"],
		},
		delay: { control: { type: "number", min: 0, max: 1000, step: 50 } },
	},
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	// Storybook v8 preview decorator reads context.globals.theme — must be
	// top-level globals (NOT parameters.globals). Matches Wave 1 atom pattern
	// (Card.stories.tsx, StickyNote.stories.tsx) that fixed this in commit 5c1f8ec.
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: 80,
				padding: 80,
			}}
		>
			<AlwaysOpenTooltip content="Top — dark mode" placement="top" />
			<AlwaysOpenTooltip content="Right — dark mode" placement="right" />
			<AlwaysOpenTooltip content="Bottom — dark mode" placement="bottom" />
			<AlwaysOpenTooltip content="Left — dark mode" placement="left" />
		</div>
	),
};
