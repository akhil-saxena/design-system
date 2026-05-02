import type { Meta, StoryObj } from "@storybook/react";
import { Filter, Inbox, SearchX, Upload } from "lucide-react";
import { EmptyState } from ".";
import { Button } from "../../inputs/Button";
const SRC = {
	default: `<EmptyState
  icon={<Inbox size={40} />}
  title="No items yet"
  description="Add your first item to get started."
>
  <Button>Add item</Button>
</EmptyState>`,

	noIcon: `<EmptyState
  title="No results"
  description="Try a different search query or adjust your filters."
/>`,

	noDescription: `<EmptyState
  icon={<SearchX size={40} />}
  title="Nothing matched"
/>`,

	singleCTA: `<EmptyState
  icon={<Inbox size={40} />}
  title="Inbox is empty"
  description="When new notifications arrive, they will appear here."
>
  <Button>Refresh</Button>
</EmptyState>`,

	dualCTA: `<EmptyState
  icon={<Upload size={40} />}
  title="No documents"
  description="Drag a file here or use the upload button to add resumes, cover letters, and offer letters."
>
  <Button>Upload</Button>
  <Button variant="ghost">Learn more</Button>
</EmptyState>`,

	clearFilter: `<EmptyState
  icon={<Filter size={40} />}
  title="No matches for your filters"
  description="Try removing one or more filters to see more items."
>
  <Button variant="ghost">Clear filters</Button>
</EmptyState>`,

	titleOnly: `<EmptyState title="Quiet here." />`,
};

const meta: Meta<typeof EmptyState> = {
	title: "Feedback/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Centered display for empty, no-data, or first-run states; accepts an icon, title, description, and optional CTA slot.",
			},
		},
	},
	argTypes: {
		icon: {
			control: false,
			description:
				"Icon above the title. Pass a lucide icon or SVG at 40×40. Omit for minimal states.",
		},
		title: {
			control: "text",
			description: "Primary heading. Required. Keep to one short sentence.",
		},
		description: {
			control: "text",
			description:
				"Secondary line explaining the state or suggesting next action. Renders in `--ink-3`.",
		},
		children: {
			control: false,
			description:
				"CTA slot — pass one or two `<Button>` elements. Renders as a flex row below the description.",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
	parameters: {
		docs: {
			description: { story: "Icon + title + description + primary CTA. The most common pattern." },
			source: { code: SRC.default },
		},
	},
	render: () => (
		<EmptyState
			icon={<Inbox size={40} />}
			title="No items yet"
			description="Add your first item to get started."
		>
			<Button>Add item</Button>
		</EmptyState>
	),
};

export const NoIcon: Story = {
	name: "No icon",
	parameters: {
		docs: {
			description: {
				story:
					"Title + description only — appropriate for secondary or inline empty states where an icon would add noise.",
			},
			source: { code: SRC.noIcon },
		},
	},
	render: () => (
		<EmptyState
			title="No results"
			description="Try a different search query or adjust your filters."
		/>
	),
};

export const NoDescription: Story = {
	name: "No description",
	parameters: {
		docs: {
			description: {
				story: "Icon + title only — minimal variant for brief, self-explanatory states.",
			},
			source: { code: SRC.noDescription },
		},
	},
	render: () => <EmptyState icon={<SearchX size={40} />} title="Nothing matched" />,
};

export const SingleCTA: Story = {
	name: "Single CTA",
	parameters: {
		docs: {
			description: { story: "One action — use a `primary` Button as the clear next step." },
			source: { code: SRC.singleCTA },
		},
	},
	render: () => (
		<EmptyState
			icon={<Inbox size={40} />}
			title="Inbox is empty"
			description="When new notifications arrive, they will appear here."
		>
			<Button>Refresh</Button>
		</EmptyState>
	),
};

export const DualCTA: Story = {
	name: "Dual CTA",
	parameters: {
		docs: {
			description: {
				story:
					"Two actions — primary + ghost. Children renders them in a row via the actions slot.",
			},
			source: { code: SRC.dualCTA },
		},
	},
	render: () => (
		<EmptyState
			icon={<Upload size={40} />}
			title="No documents"
			description="Drag a file here or use the upload button to add resumes, cover letters, and offer letters."
		>
			<Button>Upload</Button>
			<Button variant="ghost">Learn more</Button>
		</EmptyState>
	),
};

export const ClearFilter: Story = {
	name: "Clear filter",
	parameters: {
		docs: {
			description: {
				story:
					"No-results state caused by active filters — ghost CTA to clear without an aggressive primary.",
			},
			source: { code: SRC.clearFilter },
		},
	},
	render: () => (
		<EmptyState
			icon={<Filter size={40} />}
			title="No matches for your filters"
			description="Try removing one or more filters to see more items."
		>
			<Button variant="ghost">Clear filters</Button>
		</EmptyState>
	),
};

export const TitleOnly: Story = {
	name: "Title only",
	parameters: {
		docs: {
			description: { story: "Absolute minimum — title alone for terse inline placeholders." },
			source: { code: SRC.titleOnly },
		},
	},
	render: () => <EmptyState title="Quiet here." />,
};

export const DarkMode: Story = {
	name: "Dark mode",
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					"`var(--ink-3)` description and `var(--ink)` title both flip with theme automatically.",
			},
			source: { code: SRC.default },
		},
	},
	render: () => (
		<EmptyState
			icon={<Inbox size={40} />}
			title="No items yet"
			description="Add your first item to get started."
		>
			<Button>Add item</Button>
		</EmptyState>
	),
};
