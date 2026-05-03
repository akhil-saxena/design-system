import type { Meta, StoryObj } from "@storybook/react";
import { AppBar } from ".";
import { Avatar } from "../../display/Avatar";
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

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
	args: { variant: "default" },
	render: (args) => <AppBar {...args} nav={<NavLinks />} actions={<Actions />} />,
};
