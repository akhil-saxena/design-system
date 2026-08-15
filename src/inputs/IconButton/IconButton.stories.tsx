import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from ".";
import { ChevronLeft, ChevronRight, Copy, Search, Trash2, X } from "../../icons";

const SRC = {
	Default: '<IconButton label="Close" icon={<X size={16} />} onClick={close} />',
	Variants: `<IconButton label="Close"   icon={<X size={16} />} />
<IconButton label="Search"  icon={<Search size={16} />} variant="secondary" />
<IconButton label="Copy"    icon={<Copy size={16} />} variant="primary" />
<IconButton label="Delete"  icon={<Trash2 size={16} />} variant="danger" />`,
	Sizes: `<IconButton label="Close" icon={<X size={12} />} size="sm" />
<IconButton label="Close" icon={<X size={16} />} size="md" />
<IconButton label="Close" icon={<X size={20} />} size="lg" />`,
};

const meta: Meta<typeof IconButton> = {
	title: "Inputs/IconButton",
	component: IconButton,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: [
					"Square, icon-only action button — close, dismiss, prev/next.",
					"",
					"`label` is a **required** prop rather than an optional `aria-label`. An icon-only",
					"control with no accessible name is the most common accessibility defect in a",
					"component library: the glyph carries the meaning visually and nothing carries it",
					"otherwise. Seventeen hand-rolled icon buttons across ten components each had to",
					"remember it individually. Making it required means an unnamed icon button cannot",
					"be constructed at all.",
					"",
					"For an action with visible text use `Button`, which also accepts a leading `icon`.",
					"",
					"All styling lives in `primitives.css`, so a composing component can restyle it",
					"through the cascade with its own `className` — which is how Lightbox, Pagination,",
					"Calendar and DatePicker keep their bespoke treatment while sharing the primitive.",
				].join("\n"),
			},
		},
	},
	argTypes: {
		label: {
			control: "text",
			description: "Accessible name. Required — the icon alone cannot name the control.",
			table: { type: { summary: "string" } },
		},
		icon: { control: false, table: { type: { summary: "ReactNode" } } },
		variant: {
			control: { type: "select" },
			options: ["ghost", "secondary", "primary", "danger"],
			table: { defaultValue: { summary: "ghost" } },
		},
		size: {
			control: { type: "select" },
			options: ["sm", "md", "lg"],
			table: { defaultValue: { summary: "md" } },
		},
		loading: { control: "boolean" },
		disabled: { control: "boolean" },
	},
	args: { label: "Close", icon: <X size={16} /> },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

const Row = ({ children }: { children: React.ReactNode }) => (
	<div style={{ display: "flex", gap: 12, alignItems: "center" }}>{children}</div>
);

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const Variants: Story = {
	parameters: { docs: { source: { code: SRC.Variants } } },
	render: () => (
		<Row>
			<IconButton label="Close" icon={<X size={16} />} />
			<IconButton label="Search" icon={<Search size={16} />} variant="secondary" />
			<IconButton label="Copy" icon={<Copy size={16} />} variant="primary" />
			<IconButton label="Delete" icon={<Trash2 size={16} />} variant="danger" />
		</Row>
	),
};

export const Sizes: Story = {
	parameters: { docs: { source: { code: SRC.Sizes } } },
	render: () => (
		<Row>
			<IconButton label="Close small" icon={<X size={12} />} size="sm" />
			<IconButton label="Close medium" icon={<X size={16} />} size="md" />
			<IconButton label="Close large" icon={<X size={20} />} size="lg" />
		</Row>
	),
};

export const States: Story = {
	render: () => (
		<Row>
			<IconButton label="Next" icon={<ChevronRight size={16} />} />
			<IconButton label="Previous, unavailable" icon={<ChevronLeft size={16} />} disabled />
			{/* The label stays the accessible name while loading, so a name-based
			    query keeps matching across the transition. */}
			<IconButton label="Saving" icon={<Copy size={16} />} loading />
		</Row>
	),
};

export const DarkMode: Story = {
	render: () => (
		<div className="dark" style={{ background: "#1c1917", padding: 24, borderRadius: 8 }}>
			<Row>
				<IconButton label="Close" icon={<X size={16} />} />
				<IconButton label="Search" icon={<Search size={16} />} variant="secondary" />
				<IconButton label="Copy" icon={<Copy size={16} />} variant="primary" />
				<IconButton label="Delete" icon={<Trash2 size={16} />} variant="danger" />
			</Row>
		</div>
	),
};
