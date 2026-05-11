import type { Meta, StoryObj } from "@storybook/react";
import { Link } from ".";

const meta: Meta<typeof Link> = {
	title: "Foundation/Link",
	component: Link,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Text-style hyperlink. Five variants — `default` (neutral, amber hover), `inline` (body-text amber), `footer` (small cross-link), `action` (bold with arrow), `quiet` (no underline until hover). Use `as` to attach link styles to a `<button>` for JS-handled actions.",
			},
		},
	},
	args: { children: "Sign in", href: "/signin" },
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "inline", "footer", "action", "quiet"],
		},
		color: { control: "color" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {};

export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<Link variant="default" href="#">
				Default — neutral, amber on hover
			</Link>
			<Link variant="inline" href="#">
				Inline — body-text amber
			</Link>
			<Link variant="footer" href="#">
				Footer — small cross-link
			</Link>
			<Link variant="action" href="#">
				Action — Sign in →
			</Link>
			<Link variant="quiet" href="#">
				Quiet — hover-only underline
			</Link>
		</div>
	),
};

export const AsButton: Story = {
	render: () => (
		<Link variant="footer" as="button" onClick={() => alert("cleared")}>
			CLEAR
		</Link>
	),
};
