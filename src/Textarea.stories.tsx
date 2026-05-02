import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const W = 400; // consistent width for non-playground stories

const SRC = {
	Default: `<Textarea placeholder="Type a note…" rows={4} />`,
	WithValue: `<Textarea defaultValue="Strong technical screen — ask follow-up about scaling story." />`,
	WithCounter: `<Textarea defaultValue="Tracking interview observations." maxLength={200} />`,
	ErrorState: `<Textarea error defaultValue="Required field" />`,
	Disabled: `<Textarea disabled defaultValue="—" />`,
	Playground: `// Textarea always fills its container — set any width on the wrapper
<div style={{ width: 360 }}>
  <Textarea placeholder="Playground" rows={5} />
</div>`,
	DarkMode: `<Textarea placeholder="Default" rows={3} />
<Textarea defaultValue="With value content here." rows={3} />
<Textarea defaultValue="Error" error rows={3} />`,
};

const meta: Meta<typeof Textarea> = {
	title: "Atoms/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Multi-line text area with vertically resizable handle, error state styling, and full pass-through of native textarea attributes. Always fills its parent container width.",
			},
		},
	},
	args: { placeholder: "Type a note…", rows: 4 },
	argTypes: {
		error: { control: "boolean", description: "When true, applies error-state border color." },
		disabled: { control: "boolean", description: "When true, disables the textarea." },
		maxLength: {
			control: "number",
			description: "Activates a bottom-right character counter when set.",
		},
		placeholder: { control: "text", description: "Placeholder text shown when empty." },
		rows: { control: "number", description: "Number of visible text rows." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};
export const WithValue: Story = {
	args: { defaultValue: "Strong technical screen — ask follow-up about scaling story." },
	parameters: { docs: { source: { code: SRC.WithValue } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};
export const WithCounter: Story = {
	args: { defaultValue: "Tracking interview observations.", maxLength: 200 },
	parameters: { docs: { source: { code: SRC.WithCounter } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};
export const ErrorState: Story = {
	args: { error: true, defaultValue: "Required field" },
	parameters: { docs: { source: { code: SRC.ErrorState } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};
export const Disabled: Story = {
	args: { disabled: true, defaultValue: "—" },
	parameters: { docs: { source: { code: SRC.Disabled } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};

// Playground — no width constraint from meta so containerWidth control works freely
type PlaygroundArgs = {
	containerWidth: number;
	placeholder: string;
	rows: number;
	error: boolean;
	disabled: boolean;
	maxLength?: number;
};
export const Playground: StoryObj<PlaygroundArgs> = {
	args: { containerWidth: 360, placeholder: "Playground", rows: 5, error: false, disabled: false },
	parameters: {
		layout: "padded",
		docs: {
			description: {
				story: "Drag `containerWidth` to see how the textarea fills any container size.",
			},
			source: { code: SRC.Playground },
		},
	},
	argTypes: {
		containerWidth: {
			control: { type: "range", min: 120, max: 700, step: 8 },
			description: "Width of the parent container in px.",
		},
		error: { control: "boolean" },
		disabled: { control: "boolean" },
		rows: { control: "number" },
		placeholder: { control: "text" },
		maxLength: { control: "number" },
	},
	render: ({ containerWidth, ...args }) => (
		<div style={{ width: containerWidth }}>
			<Textarea {...args} />
		</div>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{ background: "#1c1917", padding: 16, borderRadius: 8, width: W + 32 }}
			>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, width: W }}>
			<Textarea placeholder="Default" rows={3} />
			<Textarea defaultValue="With value content here." rows={3} />
			<Textarea defaultValue="Error state" error rows={3} />
		</div>
	),
};
