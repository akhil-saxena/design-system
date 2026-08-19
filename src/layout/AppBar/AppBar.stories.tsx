import type { Meta, StoryObj } from "@storybook/react";
import { AppBar } from ".";
import { Avatar } from "../../display/Avatar";
import { Link } from "../../foundation/Link";
import { Button } from "../../inputs/Button";
const meta: Meta<typeof AppBar> = {
	title: "Layout/AppBar",
	component: AppBar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Standalone sticky topbar primitive (DS-72). Pass as the `topbar` slot to AppShell. Provides 4 variants: `minimal`, `default`, `withSearch`, `centered`. Consumer drives the `scrolled` prop via a scroll listener.",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "minimal", "withSearch", "centered"],
			description: "Visual layout variant.",
		},
		scrolled: {
			control: "boolean",
			description: "Activates frosted-glass background + shadow.",
		},
	},
};

export default meta;
type Story = StoryObj<typeof AppBar>;

const NavLinks = () => (
	<>
		{["Dashboard", "Projects", "Team", "Settings"].map((label) => (
			<Button key={label} variant="ghost" size="sm">
				{label}
			</Button>
		))}
	</>
);

const Actions = () => (
	<>
		<Button variant="ghost" size="sm">
			Docs
		</Button>
		<Avatar name="Alex Park" size={28} />
	</>
);

export const Default: Story = {
	args: { variant: "default" },
	render: (args) => <AppBar {...args} nav={<NavLinks />} actions={<Actions />} />,
};

export const Minimal: Story = {
	args: { variant: "minimal" },
	render: (args) => <AppBar {...args} />,
};

export const WithSearch: Story = {
	args: { variant: "withSearch" },
	render: (args) => <AppBar {...args} actions={<Actions />} />,
};

export const Centered: Story = {
	args: { variant: "centered" },
	render: (args) => <AppBar {...args} nav={<NavLinks />} actions={<Actions />} />,
};

export const Scrolled: Story = {
	args: { variant: "default", scrolled: true },
	render: (args) => <AppBar {...args} nav={<NavLinks />} actions={<Actions />} />,
};

/**
 * The shape that produced D-16-1 / E13, and the one the library's own stories did
 * not cover.
 *
 * Every other AppBar story fills `nav` and `actions` with Buttons, so the bar was
 * only ever measured with button-shaped children. A real consumer's top-level
 * navigation is LINKS — a brand mark that goes home and two route links — and an
 * audit of a site built this way found three anchors in this bar at **20px**
 * against a 44px coarse-pointer floor.
 *
 * AppBar itself contains no anchors at all: `logo`, `nav` and `actions` are
 * ReactNode slots, so those 20px targets were consumer children living inside
 * `.ds-atom-appbar`. That is why the touch floor is a descendant rule on the
 * bar's own class rather than anything in AppBar.tsx — the component cannot
 * reach children it does not render, but its stylesheet can.
 *
 * Composed from `Link` rather than a bare `<a>`: Link owns anchor styling, the
 * focus ring and the variants. `quiet` is used because it is stylesheet-only —
 * the default `inline` variant sets its colour as an inline style, which a
 * consumer cannot then override from a sheet.
 */
export const AnchorNavigation: Story = {
	args: { variant: "default" },
	render: (args) => (
		<AppBar
			{...args}
			logo={
				<Link variant="quiet" href="#home">
					akhil saxena
				</Link>
			}
			nav={
				<>
					<Link variant="quiet" href="#work">
						work
					</Link>
					<Link variant="quiet" href="#photographs">
						photographs
					</Link>
				</>
			}
		/>
	),
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
	args: { variant: "default" },
	render: (args) => <AppBar {...args} nav={<NavLinks />} actions={<Actions />} />,
};
