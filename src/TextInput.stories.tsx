import type { Meta, StoryObj } from "@storybook/react";
import { Link as LinkIcon, Search } from "lucide-react";
import { TextInput } from "./TextInput";

const SRC = {
	Default: `<TextInput placeholder="Type here…" />`,
	WithValue: `<TextInput defaultValue="Acme Corp" />`,
	ErrorState: `<TextInput error defaultValue="Invalid email" />`,
	Disabled: `<TextInput disabled defaultValue="—" />`,
	WithIcon: `<TextInput icon={<Search size={14} />} placeholder="Search items…" />`,
	WithPrefix: `<TextInput prefix="$" suffix="USD" placeholder="85000" />`,
	WithUrlIcon: `<TextInput icon={<LinkIcon size={14} />} placeholder="https://acme.com/records/123" />`,
	Playground: `<TextInput placeholder="Playground" />`,
	DarkMode: `<TextInput placeholder="Default" />
<TextInput defaultValue="With value" />
<TextInput error defaultValue="Error" />
<TextInput disabled defaultValue="Disabled" />
<TextInput icon={<Search size={14} />} placeholder="With icon" />`,
};

const meta: Meta<typeof TextInput> = {
	title: "Atoms/TextInput",
	component: TextInput,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Single-line text input with optional leading icon, trailing icon or keyboard shortcut hint, error state, and disabled state.",
			},
		},
	},
	args: { placeholder: "Type here…" },
	decorators: [
		(Story) => (
			<div style={{ width: "100%", maxWidth: 480 }}>
				<Story />
			</div>
		),
	],
	argTypes: {
		error: {
			control: "boolean",
			description: "When true, applies error-state border color to the input or wrapper.",
		},
		icon: {
			control: false,
			description: "Leading icon rendered inside the wrapper (Lucide recommended size 14–16).",
		},
		prefix: { control: false, description: "Static text or node rendered before the input." },
		suffix: { control: false, description: "Static text or node rendered after the input." },
		kbd: {
			control: false,
			description: "Trailing keyboard-shortcut hint styled as a monospace pill.",
		},
		disabled: { control: "boolean", description: "When true, disables the input." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const WithValue: Story = {
	args: { defaultValue: "Acme Corp" },
	parameters: { docs: { source: { code: SRC.WithValue } } },
};

export const ErrorState: Story = {
	args: { error: true, defaultValue: "Invalid email" },
	parameters: { docs: { source: { code: SRC.ErrorState } } },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "—" },
	parameters: { docs: { source: { code: SRC.Disabled } } },
};

export const WithIcon: Story = {
	args: { icon: <Search size={14} />, placeholder: "Search items…" },
	parameters: { docs: { source: { code: SRC.WithIcon } } },
};

export const WithPrefix: Story = {
	args: { prefix: "$", suffix: "USD", placeholder: "85000" },
	parameters: { docs: { source: { code: SRC.WithPrefix } } },
};

export const WithUrlIcon: Story = {
	args: {
		icon: <LinkIcon size={14} />,
		placeholder: "https://acme.com/records/123",
	},
	parameters: { docs: { source: { code: SRC.WithUrlIcon } } },
};

export const Playground: Story = {
	args: { placeholder: "Playground", error: false, disabled: false },
	parameters: { docs: { source: { code: SRC.Playground } } },
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 400 }}>
			<TextInput placeholder="Default" />
			<TextInput defaultValue="With value" />
			<TextInput error defaultValue="Error state" />
			<TextInput disabled defaultValue="Disabled" />
			<TextInput icon={<Search size={14} />} placeholder="With icon" />
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
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
};
