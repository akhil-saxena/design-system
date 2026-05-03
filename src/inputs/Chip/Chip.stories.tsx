import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from ".";
const SRC = {
	Default: "<Chip>Tag</Chip>",
	Tones: `<Chip tone="default">Default</Chip>
<Chip tone="match">Match</Chip>
<Chip tone="miss">Miss</Chip>
<Chip tone="learning">Learning</Chip>`,
	Removable: `<Chip onRemove={() => {}}>React</Chip>
<Chip tone="match" onRemove={() => {}}>TypeScript</Chip>
<Chip tone="miss" onRemove={() => {}}>Kubernetes</Chip>
<Chip tone="learning" onRemove={() => {}}>Go</Chip>`,
	Playground: `<Chip tone="default">Playground</Chip>`,
	DarkMode: `<Chip>Default</Chip>
<Chip tone="match">Match</Chip>
<Chip tone="miss">Miss</Chip>
<Chip tone="learning">Learning</Chip>
<Chip onRemove={() => {}}>Removable</Chip>`,
};

const meta: Meta<typeof Chip> = {
	title: "Inputs/Chip",
	component: Chip,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Compact inline tag with optional leading icon, tone variants, and a removable (×) button for filter/tag UIs.",
			},
		},
	},
	args: { children: "Tag" },
	argTypes: {
		tone: {
			control: "select",
			options: ["default", "match", "miss", "learning", "tag"],
			description: "Color tone applying semantic background and text colors.",
		},
		onRemove: {
			control: false,
			description: "When provided, renders a small X button that calls this handler on click.",
		},
		icon: { control: false, description: "Optional leading icon rendered before the label text." },
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const Tones: Story = {
	parameters: { docs: { source: { code: SRC.Tones } } },
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip tone="default">Default</Chip>
			<Chip tone="match">Match</Chip>
			<Chip tone="miss">Miss</Chip>
			<Chip tone="learning">Learning</Chip>
		</div>
	),
};

export const Removable: Story = {
	parameters: { docs: { source: { code: SRC.Removable } } },
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip onRemove={() => {}}>React</Chip>
			<Chip tone="match" onRemove={() => {}}>
				TypeScript
			</Chip>
			<Chip tone="miss" onRemove={() => {}}>
				Kubernetes
			</Chip>
			<Chip tone="learning" onRemove={() => {}}>
				Go
			</Chip>
		</div>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip>Default</Chip>
			<Chip tone="match">Match</Chip>
			<Chip tone="miss">Miss</Chip>
			<Chip tone="learning">Learning</Chip>
			<Chip onRemove={() => {}}>Removable</Chip>
		</div>
	),
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
};
