/**
 * # Usage Audit — Button
 *
 * Consumers (post v2.1):
 * - kanban/QuickAddButton — `primary` md, leading `<Plus />`
 * - kanban/StatusActionButton — `amber` sm
 * - detail/EditField — `secondary` xs
 * - modal/ConfirmFooter — `primary` + `ghost` pair
 * - global header/AddApplicationButton — `primary` md
 *
 * API expectations:
 * - variant + size + loading + icon (D-100 inline maps; D-110 ReactNode)
 * - onClick via ...rest pass-through
 *
 * Out of scope: as="a" link rendering (D-140 — would be LinkButton primitive).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
	title: "Atoms/Button",
	component: Button,
	parameters: { layout: "centered" },
	args: { children: "Click me" },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button variant="primary">Primary</Button>
			<Button variant="amber">Amber</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
		</div>
	),
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
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true } };

export const WithIcon: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8 }}>
			<Button variant="primary" icon={<Plus size={13} />}>
				Add Application
			</Button>
			<Button variant="ghost" icon={<X size={13} />}>
				Cancel
			</Button>
			<Button variant="danger" icon={<Trash2 size={13} />}>
				Delete
			</Button>
		</div>
	),
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
			options: ["primary", "amber", "secondary", "ghost", "danger"],
		},
		size: {
			control: { type: "select" },
			options: ["xs", "sm", "md", "lg"],
		},
	},
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button variant="primary">Primary</Button>
			<Button variant="amber">Amber</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
		</div>
	),
	globals: { theme: "dark" },
};
