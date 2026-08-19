import type { Meta, StoryObj } from "@storybook/react";
import { Footer, type FooterColumn } from ".";
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

/**
 * The `href` form of a footer link, which no story covered until now — and which
 * renders a DIFFERENT element from the one every other story here renders.
 *
 * `Footer.renderLink` branches on `href`: with one it returns
 * `<Link variant="footer" className="ds-atom-footer-link">` (an `<a>` carrying
 * BOTH `.ds-atom-link` and `.ds-atom-footer-link`); without one it returns a bare
 * `<button className="ds-atom-footer-link">`. The LINKS fixture above uses
 * `onClick`, so every pre-existing story exercised only the button branch.
 *
 * That gap hid a real divergence, measured in Chromium: `.ds-atom-link` and
 * `.ds-atom-footer-link` are both single-class selectors, so they tie on
 * specificity and source order decides — and `.ds-atom-link` is declared ~900
 * lines later. Its `padding: 0` and `text-decoration: underline` therefore beat
 * `.ds-atom-footer-link`'s `padding: 5px 0` and `text-decoration: none`, so the
 * two branches of one function paint at different heights (16px vs 22.5px) with
 * different underlines. This story is what makes that visible to a test.
 */
export const CompactWithLinks: Story = {
	args: {
		variant: "compact",
		copyright: "© 2026 Acme Inc. All rights reserved.",
		links: [
			{ label: "Privacy", href: "#privacy" },
			{ label: "Terms", href: "#terms" },
			{ label: "Status", href: "#status" },
		],
	},
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
			<div
				className="dark"
				style={{
					background: "#1c1917",
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	args: { variant: "expanded", copyright: "© 2026 Acme Inc.", columns: COLUMNS },
};
