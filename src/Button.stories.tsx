import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
	title: "Atoms/Button",
	component: Button,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Primary action element. Pick one `primary` per surface as the main CTA; pair with `secondary` or `ghost` for adjacent actions; reserve `danger` for destructive operations.",
			},
		},
	},
	args: { children: "Click me" },
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "ghost", "danger"],
			description:
				"Visual variant — primary for main CTA, secondary for second-priority, ghost for tertiary, danger for destructive actions.",
		},
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
			description: "Size token; most contexts use md.",
		},
		loading: {
			control: "boolean",
			description: "When true, replaces the icon with a spinner and disables interaction.",
		},
		disabled: { control: "boolean", description: "When true, disables the button." },
		icon: { control: false, description: "Optional icon rendered before the label." },
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Default state — `primary` variant at `md` size with text-only label.",
			},
		},
	},
};

export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"All four variants side-by-side. `primary` is the brand amber CTA; `secondary` is the outlined cream alternative; `ghost` carries text-only weight; `danger` flags destructive actions.",
			},
		},
	},
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<Button size="xs">Extra Small</Button>
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Four size tokens. Most contexts use `md`. Use `xs`/`sm` inside dense rows or chip-adjacent UI; `lg` for hero CTAs.",
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: {
			description: {
				story: "Disabled buttons block both pointer and keyboard input and reduce visual contrast.",
			},
		},
	},
};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					"Loading state replaces icon with a spinner and disables interaction; preserves button width to avoid layout shift.",
			},
		},
	},
};

export const WithIcon: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8 }}>
			<Button variant="primary" icon={<Plus size={13} />}>
				Add item
			</Button>
			<Button variant="ghost" icon={<X size={13} />}>
				Cancel
			</Button>
			<Button variant="danger" icon={<Trash2 size={13} />}>
				Delete
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Pass an `icon` ReactNode to render before the label. Use 13–14px sizing for `md` buttons; the icon inherits `currentColor` so it follows the variant.",
			},
		},
	},
};

export const Playground: Story = {
	args: {
		variant: "primary",
		size: "md",
		children: "Playground",
		loading: false,
		disabled: false,
	},
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["primary", "secondary", "ghost", "danger"],
		},
		size: {
			control: { type: "select" },
			options: ["xs", "sm", "md", "lg"],
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tweak any prop via the Controls panel below.",
			},
		},
	},
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
		</div>
	),
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					"Same gallery rendered with `theme: dark`. Confirms dark-mode token wiring (no cream-on-cream regressions, amber CTA still legible).",
			},
		},
	},
};
