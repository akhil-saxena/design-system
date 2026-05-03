import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { type TabItem, Tabs } from ".";
const SRC = {
	Underline: `const [value, setValue] = useState("overview");
return (
  <Tabs
    tabs={[
      { id: "overview", label: "Overview", content: <p>Overview content</p> },
      { id: "analytics", label: "Analytics", content: <p>Analytics content</p> },
      { id: "settings", label: "Settings", content: <p>Settings content</p> },
    ]}
    value={value}
    onChange={setValue}
    ariaLabel="Example tabs"
    variant="underline"
  />
);`,
	Pill: `const [value, setValue] = useState("overview");
return (
  <Tabs
    tabs={[
      { id: "overview", label: "Overview", content: <p>Overview content</p> },
      { id: "analytics", label: "Analytics", content: <p>Analytics content</p> },
      { id: "settings", label: "Settings", content: <p>Settings content</p> },
    ]}
    value={value}
    onChange={setValue}
    ariaLabel="Pill tabs"
    variant="pill"
  />
);`,
	WithCounts: `const [value, setValue] = useState("inbox");
return (
  <Tabs
    tabs={[
      { id: "inbox", label: "Inbox", count: 12, content: <p>12 unread messages</p> },
      { id: "sent", label: "Sent", count: 0, content: <p>No sent messages</p> },
      { id: "drafts", label: "Drafts", count: 3, content: <p>3 drafts</p> },
      { id: "spam", label: "Spam", count: 99, content: <p>99 spam messages</p> },
    ]}
    value={value}
    onChange={setValue}
    ariaLabel="Mailbox tabs"
    variant="underline"
  />
);`,
	WithDisabled: `const [value, setValue] = useState("a");
return (
  <Tabs
    tabs={[
      { id: "a", label: "Active", content: <p>Active tab content</p> },
      { id: "b", label: "Disabled", disabled: true, content: <p>Disabled</p> },
      { id: "c", label: "Also Active", content: <p>Also Active content</p> },
    ]}
    value={value}
    onChange={setValue}
    ariaLabel="Tabs with disabled"
  />
);`,
	ManualActivation: `const [value, setValue] = useState("overview");
return (
  <Tabs
    tabs={tabs}
    value={value}
    onChange={setValue}
    ariaLabel="Manual activation tabs"
    activationMode="manual"
  />
);`,
	NarrowOverflow: `const [value, setValue] = useState("1");
return (
  <div style={{ maxWidth: 300, width: "100%" }}>
    <Tabs
      tabs={[
        { id: "1", label: "Dashboard", content: <p>Dashboard</p> },
        { id: "2", label: "Analytics", content: <p>Analytics</p> },
        { id: "3", label: "Reports", content: <p>Reports</p> },
        { id: "4", label: "Settings", count: 2, content: <p>Settings</p> },
        { id: "5", label: "Team", content: <p>Team</p> },
        { id: "6", label: "Billing", content: <p>Billing</p> },
      ]}
      value={value}
      onChange={setValue}
      ariaLabel="Overflow tabs"
    />
  </div>
);`,
	DarkMode: `const [value, setValue] = useState("overview");
return (
  <>
    <Tabs tabs={tabs} value={value} onChange={setValue} ariaLabel="Dark underline tabs" variant="underline" />
    <Tabs tabs={tabs} value={value} onChange={setValue} ariaLabel="Dark pill tabs" variant="pill" />
  </>
);`,
	Playground: `<Tabs
  tabs={tabs}
  value="overview"
  onChange={() => {}}
  ariaLabel="Playground tabs"
  variant="underline"
  activationMode="automatic"
/>`,
};

const meta: Meta<typeof Tabs> = {
	title: "Data Display/Tabs",
	component: Tabs,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"WAI-ARIA tab panel with underline and pill variants, automatic or manual activation, and an overflow menu for wide tab sets.\n\n**Keyboard model (WAI-ARIA tablist):** `Tab` moves focus *into* the tablist and then *out* to the active panel - it does not cycle between tab buttons. Use `ArrowRight` / `ArrowLeft` to move between tabs, `Home` / `End` to jump to the first or last tab.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		tabs: {
			control: false,
			description:
				"Array of tab definitions including id, label, optional count badge, disabled flag, and panel content.",
		},
		value: { control: false, description: "Controlled id of the currently active tab." },
		onChange: {
			control: false,
			description: "Called with the tab id when the user activates a different tab.",
		},
		variant: {
			control: "select",
			options: ["underline", "pill"],
			description: "Visual style of the tab triggers.",
		},
		activationMode: {
			control: "select",
			options: ["automatic", "manual"],
			description:
				"Whether selecting a tab happens on arrow-key press (automatic) or only on Enter/Space (manual).",
		},
		ariaLabel: {
			control: "text",
			description: "Accessible label for the role='tablist' element (required).",
		},
		className: { control: false },
		style: { control: false },
	},
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
	parameters: { docs: { source: { code: SRC.Underline } } },
	render: () => <ControlledTabs tabs={sampleTabs} ariaLabel="Example tabs" variant="underline" />,
};

export const Pill: Story = {
	parameters: { docs: { source: { code: SRC.Pill } } },
	render: () => <ControlledTabs tabs={sampleTabs} ariaLabel="Pill tabs" variant="pill" />,
};

export const WithCounts: Story = {
	parameters: { docs: { source: { code: SRC.WithCounts } } },
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
	parameters: { docs: { source: { code: SRC.WithDisabled } } },
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
	parameters: { docs: { source: { code: SRC.ManualActivation } } },
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
	name: "Narrow - Overflow Menu",
	parameters: { docs: { source: { code: SRC.NarrowOverflow } } },
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
			<div style={{ maxWidth: 300, width: "100%", border: "1px dashed var(--rule)", padding: 8 }}>
				<p style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>
					Container fixed at 300px - tabs that don't fit collapse into More button
				</p>
				<ControlledTabs tabs={manyTabs} ariaLabel="Overflow tabs" />
			</div>
		);
	},
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
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
	parameters: { docs: { source: { code: SRC.Playground } } },
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
