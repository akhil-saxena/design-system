import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { type TabItem, Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
	title: "Primitives/Tabs",
	component: Tabs,
	parameters: {
		layout: "padded",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// ── Sample content ────────────────────────────────────────────────────────────

const sampleTabs: TabItem[] = [
	{
		id: "overview",
		label: "Overview",
		content: (
			<div>
				<h3>Overview</h3>
				<p>This is the overview panel content.</p>
			</div>
		),
	},
	{
		id: "analytics",
		label: "Analytics",
		content: (
			<div>
				<h3>Analytics</h3>
				<p>This is the analytics panel content.</p>
			</div>
		),
	},
	{
		id: "settings",
		label: "Settings",
		content: (
			<div>
				<h3>Settings</h3>
				<p>This is the settings panel content.</p>
			</div>
		),
	},
];

// ── Controlled wrapper ────────────────────────────────────────────────────────

function ControlledTabs(
	props: Omit<React.ComponentProps<typeof Tabs>, "value" | "onChange"> & { defaultValue?: string },
) {
	const { defaultValue, tabs, ...rest } = props;
	const [value, setValue] = useState(defaultValue ?? tabs[0]?.id ?? "");
	return <Tabs tabs={tabs} value={value} onChange={setValue} {...rest} />;
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Underline: Story = {
	render: () => <ControlledTabs tabs={sampleTabs} ariaLabel="Example tabs" variant="underline" />,
};

export const Pill: Story = {
	render: () => <ControlledTabs tabs={sampleTabs} ariaLabel="Pill tabs" variant="pill" />,
};

export const WithCounts: Story = {
	render: () => {
		const tabsWithCounts: TabItem[] = [
			{
				id: "inbox",
				label: "Inbox",
				count: 12,
				content: <p>12 unread messages</p>,
			},
			{
				id: "sent",
				label: "Sent",
				count: 0,
				content: <p>No sent messages</p>,
			},
			{
				id: "drafts",
				label: "Drafts",
				count: 3,
				content: <p>3 drafts</p>,
			},
			{
				id: "spam",
				label: "Spam",
				count: 99,
				content: <p>99 spam messages</p>,
			},
		];
		return <ControlledTabs tabs={tabsWithCounts} ariaLabel="Mailbox tabs" variant="underline" />;
	},
};

export const WithDisabled: Story = {
	render: () => {
		const tabs: TabItem[] = [
			{ id: "a", label: "Active", content: <p>Active tab content</p> },
			{ id: "b", label: "Disabled", disabled: true, content: <p>Disabled</p> },
			{ id: "c", label: "Also Active", content: <p>Also Active content</p> },
		];
		return <ControlledTabs tabs={tabs} ariaLabel="Tabs with disabled" />;
	},
};

export const ManualActivation: Story = {
	name: "Manual Activation (Enter/Space to select)",
	render: () => (
		<div>
			<p style={{ marginBottom: 12, fontSize: 13, color: "var(--ink-2)" }}>
				Arrow keys move focus only. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to activate the
				focused tab.
			</p>
			<ControlledTabs
				tabs={sampleTabs}
				ariaLabel="Manual activation tabs"
				activationMode="manual"
			/>
		</div>
	),
};

export const NarrowOverflow: Story = {
	name: "Narrow — Overflow Menu",
	render: () => {
		const manyTabs: TabItem[] = [
			{ id: "1", label: "Dashboard", content: <p>Dashboard content</p> },
			{ id: "2", label: "Analytics", content: <p>Analytics content</p> },
			{ id: "3", label: "Reports", content: <p>Reports content</p> },
			{ id: "4", label: "Settings", count: 2, content: <p>Settings content</p> },
			{ id: "5", label: "Team", content: <p>Team content</p> },
			{ id: "6", label: "Billing", content: <p>Billing content</p> },
		];
		return (
			<div style={{ width: 300, border: "1px dashed var(--rule)", padding: 8 }}>
				<p style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>
					Container fixed at 300px — tabs that don't fit collapse into More button
				</p>
				<ControlledTabs tabs={manyTabs} ariaLabel="Overflow tabs" />
			</div>
		);
	},
};

export const DarkMode: Story = {
	parameters: {
		backgrounds: { default: "dark" },
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ padding: 24 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			<ControlledTabs tabs={sampleTabs} ariaLabel="Dark underline tabs" variant="underline" />
			<ControlledTabs tabs={sampleTabs} ariaLabel="Dark pill tabs" variant="pill" />
		</div>
	),
};

export const Playground: Story = {
	args: {
		tabs: sampleTabs,
		value: "overview",
		onChange: () => {},
		ariaLabel: "Playground tabs",
		variant: "underline",
		activationMode: "automatic",
	},
	argTypes: {
		variant: { control: "select", options: ["underline", "pill"] },
		activationMode: { control: "select", options: ["automatic", "manual"] },
	},
};
