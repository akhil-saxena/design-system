import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from ".";
const W = 400; // consistent width for non-playground stories

const SRC = {
	Default: `<Textarea placeholder="Type a note…" rows={4} />`,
	WithValue: `<Textarea defaultValue="Strong presentation - ask follow-up about the approach used." />`,
	WithCounter: `<Textarea defaultValue="Tracking review notes." maxLength={200} />`,
	ErrorState: `<Textarea error defaultValue="Required field" />`,
	Disabled: `<Textarea disabled defaultValue="-" />`,
	Playground: `// Textarea always fills its container - set any width on the wrapper
<div style={{ maxWidth: 360, width: "100%" }}>
  <Textarea placeholder="Playground" rows={5} />
</div>`,
	DarkMode: `<Textarea placeholder="Default" rows={3} />
<Textarea defaultValue="With value content here." rows={3} />
<Textarea defaultValue="Error" error rows={3} />`,
};

const meta: Meta<typeof Textarea> = {
	title: "Inputs/Textarea",
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
	// "aria-label" so every story inherits an accessible name: a bare field
	// with no label is an axe `label` violation, and a story is the one place
	// a component should be shown used correctly.
	args: { placeholder: "Type a note…", rows: 4, "aria-label": "Example field" },
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
	args: { defaultValue: "Strong presentation - ask follow-up about the approach used." },
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
	args: { defaultValue: "Tracking review notes.", maxLength: 200 },
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
	args: { disabled: true, defaultValue: "-" },
	parameters: { docs: { source: { code: SRC.Disabled } } },
	decorators: [
		(S) => (
			<div style={{ width: W }}>
				<S />
			</div>
		),
	],
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div style={{ background: "var(--cream-2)", padding: 16, borderRadius: 8, width: W + 32 }}>
				<Story />
			</div>
		),
	],
	// `render` bypasses the meta-level args, so each field needs its own name.
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, width: W }}>
			<Textarea label="Default" placeholder="Default" rows={3} />
			<Textarea label="With value" defaultValue="With value content here." rows={3} />
			<Textarea label="Error state" defaultValue="Error state" error rows={3} />
		</div>
	),
};
