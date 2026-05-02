/**
 * # Usage Audit — EmptyState (DS-87, DS-44, D-421)
 *
 * Consumers (post v2.1):
 * - kanban/EmptyKanban — `<EmptyState icon={<Inbox/>} title="No applications yet"
 *   description="Add your first job to get started."><Button>Add</Button></EmptyState>`
 *   shown when `applications.length === 0`
 * - search/NoSearchResults — `<EmptyState icon={<SearchX/>} title="No results"
 *   description="Try a different query." />` (no CTA)
 * - filter/NoFilteredResults — `<EmptyState icon={<Filter/>} title="No matches"
 *   description="Clear filters to see all applications."><Button variant="ghost"
 *   onClick={clear}>Clear filters</Button></EmptyState>`
 * - calendar/NoUpcomingEvents — `<EmptyState icon={<CalendarX/>} title="Nothing
 *   scheduled" description="Your week is clear." />`
 * - documents/NoDocuments — `<EmptyState icon={<FileText/>} title="No documents"
 *   description="Drag a file here or use the upload button."><Button>Upload</Button>
 *   <Button variant="ghost">Learn more</Button></EmptyState>` (dual CTA)
 *
 * API (D-421):
 * - `icon?: ReactNode` — optional, typically a lucide icon at 40×40
 * - `title: ReactNode` — REQUIRED; bold display-font header
 * - `description?: ReactNode` — optional secondary line
 * - `children?: ReactNode` — CTA slot; pass any JSX (Button, link, multiple)
 * - extends native <div> attributes via `...rest` spread
 * - forwards ref to root div
 *
 * Patterns:
 * - title only: minimal "no data" state with no icon or CTA
 * - title + description: contextual messaging with no action
 * - title + description + Button: encourage primary action
 * - title + description + Button + Button (variant=ghost): primary + learn-more
 *
 * NO compound API — pass content via structured props + children. This
 * keeps the consumer free to layout CTAs however they like (gap, alignment,
 * variant choice).
 *
 * Implementation:
 * - Root `.ds-atom-empty` is a centered flex column with `var(--space-3)`
 *   gap + `var(--space-8)` padding
 * - Description color uses `var(--ink-3)` token (flips with theme)
 * - Title uses `var(--display)` font weight 600
 * - Each slot renders only if prop/children passed (conditional render —
 *   no empty `<div>`s)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Filter, Inbox, SearchX, Upload } from "lucide-react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

const SRC = {
	default: `<EmptyState
  icon={<Inbox size={40} />}
  title="No applications yet"
  description="Add your first job to start tracking your pipeline."
>
  <Button>Add application</Button>
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
  description="Try removing one or more filters to see more applications."
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
			title="No applications yet"
			description="Add your first job to start tracking your pipeline."
		>
			<Button>Add application</Button>
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
			description="Try removing one or more filters to see more applications."
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
			title="No applications yet"
			description="Add your first job to start tracking your pipeline."
		>
			<Button>Add application</Button>
		</EmptyState>
	),
};
