import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from ".";
const SRC = {
	Default: "<Skeleton />",
	Shapes: `<Skeleton shape="text" width="100%" />
<Skeleton shape="circle" width={48} />
<Skeleton shape="pill" width={80} />`,
	MultipleLines: `<Skeleton shape="text" width="100%" />
<Skeleton shape="text" width="100%" />
<Skeleton shape="text" width="80%" />`,
	AvatarAndName: `<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <Skeleton shape="circle" width={40} />
  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
    <Skeleton width={140} height={14} />
    <Skeleton width={90} height={11} />
  </div>
</div>`,
	CardPlaceholder: `<div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <Skeleton shape="circle" width={32} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <Skeleton width={120} height={13} />
      <Skeleton width={80} height={10} />
    </div>
  </div>
  <Skeleton shape="text" width="100%" />
  <Skeleton shape="text" width="100%" />
  <Skeleton shape="text" width="75%" />
  <div style={{ display: "flex", gap: 6 }}>
    <Skeleton shape="pill" width={60} />
    <Skeleton shape="pill" width={50} />
  </div>
</div>`,
	Playground: `<Skeleton shape="text" width="100%" />`,
	DarkMode: `<Skeleton width="100%" />
<Skeleton shape="circle" width={48} />
<Skeleton shape="pill" width={80} />
<Skeleton shape="text" width="100%" />
<Skeleton shape="text" width="80%" />`,
};

const meta: Meta<typeof Skeleton> = {
	title: "Feedback/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Shape-aware loading placeholder with text, rect, and circle variants; animates a shimmer sweep until real content is ready.",
			},
		},
	},
	argTypes: {
		shape: {
			control: "select",
			options: ["text", "circle", "pill"],
			description:
				"Shape of the skeleton placeholder - text, circle (disc), or pill (badge/chip-sized).",
		},
		width: {
			control: "text",
			description: "Width of the skeleton; accepts any CSS length or a pixel number.",
		},
		height: {
			control: "text",
			description:
				"Height override; defaults are shape-aware (text → 1.2em, circle → width, pill → 1.5em).",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	args: {},
	parameters: { docs: { source: { code: SRC.Default } } },
	render: (args) => (
		<div style={{ maxWidth: 360 }}>
			<Skeleton {...args} />
		</div>
	),
};

export const Shapes: Story = {
	parameters: { docs: { source: { code: SRC.Shapes } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					TEXT
				</div>
				<Skeleton shape="text" width="100%" />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					CIRCLE
				</div>
				<Skeleton shape="circle" width={48} />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						marginBottom: 4,
						fontFamily: "var(--mono)",
					}}
				>
					PILL
				</div>
				<Skeleton shape="pill" width={80} />
			</div>
		</div>
	),
};

export const MultipleLines: Story = {
	parameters: { docs: { source: { code: SRC.MultipleLines } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
			<Skeleton shape="text" width="100%" />
			<Skeleton shape="text" width="100%" />
			<Skeleton shape="text" width="80%" />
		</div>
	),
};

export const AvatarAndName: Story = {
	parameters: { docs: { source: { code: SRC.AvatarAndName } } },
	render: () => (
		<div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 360 }}>
			<Skeleton shape="circle" width={40} />
			<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
				<Skeleton width={140} height={14} />
				<Skeleton width={90} height={11} />
			</div>
		</div>
	),
};

export const CardPlaceholder: Story = {
	parameters: { docs: { source: { code: SRC.CardPlaceholder } } },
	render: () => (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 12,
				padding: 16,
				maxWidth: 320,
				border: "1px solid var(--rule)",
				borderRadius: "var(--radius-md)",
				background: "var(--surf-1)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<Skeleton shape="circle" width={32} />
				<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
					<Skeleton width={120} height={13} />
					<Skeleton width={80} height={10} />
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="75%" />
			</div>
			<div style={{ display: "flex", gap: 6 }}>
				<Skeleton shape="pill" width={60} />
				<Skeleton shape="pill" width={50} />
			</div>
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
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
			<Skeleton width="100%" />
			<Skeleton shape="circle" width={48} />
			<Skeleton shape="pill" width={80} />
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="100%" />
				<Skeleton shape="text" width="80%" />
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<Skeleton shape="circle" width={40} />
				<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
					<Skeleton width={140} height={14} />
					<Skeleton width={90} height={11} />
				</div>
			</div>
		</div>
	),
};
