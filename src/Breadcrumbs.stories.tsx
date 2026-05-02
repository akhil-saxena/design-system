import type { Meta, StoryObj } from "@storybook/react";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

const SRC = {
	Default: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Section", href: "/section" },
    { label: "Current Page" },
  ]}
/>`,
	ShortPath: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Current Page" },
  ]}
/>`,
	DeepPath: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Projects", href: "/workspace/projects" },
    { label: "2024 Q4", href: "/workspace/projects/2024-q4" },
    { label: "Sprint 12", href: "/workspace/projects/2024-q4/sprint-12" },
    { label: "Tasks", href: "/workspace/projects/2024-q4/sprint-12/tasks" },
    { label: "Fix breadcrumb truncation" },
  ]}
  maxVisible={4}
/>`,
	DeepPathMaxVisible3: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Projects", href: "/workspace/projects" },
    { label: "2024 Q4", href: "/workspace/projects/2024-q4" },
    { label: "Sprint 12", href: "/workspace/projects/2024-q4/sprint-12" },
    { label: "Tasks", href: "/workspace/projects/2024-q4/sprint-12/tasks" },
    { label: "Fix breadcrumb truncation" },
  ]}
  maxVisible={3}
/>`,
	AllLinks: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Laptops", href: "/products/electronics/laptops" },
  ]}
/>`,
	MixedLinkPlain: `<Breadcrumbs
  items={[
    { label: "Home" },
    { label: "Section", href: "/section" },
    { label: "Subsection", href: "/section/sub" },
    { label: "Current Page" },
  ]}
/>`,
	DarkMode: `<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Section", href: "/section" }, { label: "Current Page" }]} />
<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />`,
	Playground: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Section", href: "/section" },
    { label: "Current Page" },
  ]}
  maxVisible={4}
  ariaLabel="Breadcrumb"
/>`,
};

const meta: Meta<typeof Breadcrumbs> = {
	title: "Atoms/Breadcrumbs",
	component: Breadcrumbs,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Hierarchical navigation trail with configurable max-visible items and automatic ellipsis collapse for deep paths.",
			},
		},
	},
	argTypes: {
		items: {
			control: false,
			description: "Ordered list of breadcrumb items; last item is the current page.",
		},
		maxVisible: {
			control: "number",
			description: "Maximum items shown before collapsing middle items into a '…' overflow menu.",
		},
		ariaLabel: { control: "text", description: "Accessible label for the nav landmark." },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

// ─── Shared fixtures ───────────────────────────────────────────────────────

const THREE_ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Section", href: "/section" },
	{ label: "Current Page" },
];

const TWO_ITEMS: BreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current Page" }];

const SEVEN_ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Workspace", href: "/workspace" },
	{ label: "Projects", href: "/workspace/projects" },
	{ label: "2024 Q4", href: "/workspace/projects/2024-q4" },
	{ label: "Sprint 12", href: "/workspace/projects/2024-q4/sprint-12" },
	{ label: "Tasks", href: "/workspace/projects/2024-q4/sprint-12/tasks" },
	{ label: "Fix breadcrumb truncation" },
];

const ALL_LINKS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Products", href: "/products" },
	{ label: "Electronics", href: "/products/electronics" },
	{ label: "Laptops", href: "/products/electronics/laptops" },
];

const MIXED_ITEMS: BreadcrumbItem[] = [
	{ label: "Home" },
	{ label: "Section", href: "/section" },
	{ label: "Subsection", href: "/section/sub" },
	{ label: "Current Page" },
];

// ─── Stories ───────────────────────────────────────────────────────────────

/** Default 3-item path — Home / Section / Current Page */
export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <Breadcrumbs items={THREE_ITEMS} />,
};

/** Short 2-item path — Home / Current Page */
export const ShortPath: Story = {
	parameters: { docs: { source: { code: SRC.ShortPath } } },
	render: () => <Breadcrumbs items={TWO_ITEMS} />,
};

/** 7-item deep path with maxVisible=4 — first + ellipsis + last 2 visible */
export const DeepPath: Story = {
	parameters: { docs: { source: { code: SRC.DeepPath } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div>
				<p
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-4)",
						fontWeight: 600,
						marginBottom: 8,
					}}
				>
					maxVisible=4 (default)
				</p>
				<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />
			</div>
		</div>
	),
};

/** 7-item path with maxVisible=3 — tighter truncation */
export const DeepPathMaxVisible3: Story = {
	parameters: { docs: { source: { code: SRC.DeepPathMaxVisible3 } } },
	render: () => (
		<div>
			<p
				style={{
					fontFamily: "var(--mono)",
					fontSize: 10,
					color: "var(--ink-4)",
					fontWeight: 600,
					marginBottom: 8,
				}}
			>
				maxVisible=3 — first + ellipsis + last 1
			</p>
			<Breadcrumbs items={SEVEN_ITEMS} maxVisible={3} />
		</div>
	),
};

/** All items have href — fully-linked path */
export const AllLinks: Story = {
	parameters: { docs: { source: { code: SRC.AllLinks } } },
	render: () => <Breadcrumbs items={ALL_LINKS} />,
};

/** Mixed — first and last are spans, middle items have hrefs */
export const MixedLinkPlain: Story = {
	parameters: { docs: { source: { code: SRC.MixedLinkPlain } } },
	render: () => <Breadcrumbs items={MIXED_ITEMS} />,
};

/** Dark mode variant */
export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<Breadcrumbs items={THREE_ITEMS} />
			<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />
		</div>
	),
};

/** Interactive playground — use controls to adjust props */
export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	args: {
		items: THREE_ITEMS,
		maxVisible: 4,
		ariaLabel: "Breadcrumb",
	},
	argTypes: {
		maxVisible: { control: { type: "number", min: 2, max: 10, step: 1 } },
		ariaLabel: { control: "text" },
	},
	render: (args) => <Breadcrumbs {...args} />,
};
