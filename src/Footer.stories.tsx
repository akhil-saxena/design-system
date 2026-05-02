import type { Meta, StoryObj } from "@storybook/react";
import { Footer, type FooterColumn } from "./Footer";

const meta: Meta<typeof Footer> = {
	title: "Layout/Footer",
	component: Footer,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Standalone page footer primitive (DS-73). Pass as the `footer` slot to AppShell. Two variants: `compact` (1-line copyright + links) and `expanded` (4-column grid with titles + links).",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["compact", "expanded"],
		},
		copyright: { control: "text" },
	},
};

export default meta;
type Story = StoryObj<typeof Footer>;

const LINKS = [
	{ label: "Privacy", onClick: () => {} },
	{ label: "Terms", onClick: () => {} },
	{ label: "Status", onClick: () => {} },
];

const COLUMNS: FooterColumn[] = [
	{
		title: "Product",
		links: [
			{ label: "Features", onClick: () => {} },
			{ label: "Pricing", onClick: () => {} },
			{ label: "Changelog", onClick: () => {} },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", onClick: () => {} },
			{ label: "Blog", onClick: () => {} },
			{ label: "Careers", onClick: () => {} },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Docs", onClick: () => {} },
			{ label: "API Reference", onClick: () => {} },
			{ label: "Community", onClick: () => {} },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy", onClick: () => {} },
			{ label: "Terms", onClick: () => {} },
			{ label: "Cookie Policy", onClick: () => {} },
		],
	},
];

export const Compact: Story = {
	args: { variant: "compact", copyright: "© 2026 Acme Inc. All rights reserved.", links: LINKS },
};

export const Expanded: Story = {
	args: {
		variant: "expanded",
		copyright: "© 2026 Acme Inc. All rights reserved.",
		columns: COLUMNS,
	},
};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917" }}>
				<Story />
			</div>
		),
	],
	args: { variant: "expanded", copyright: "© 2026 Acme Inc.", columns: COLUMNS },
};
