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

const meta: Meta<typeof EmptyState> = {
	title: "Feedback/EmptyState",
	component: EmptyState,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
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
	render: () => (
		<EmptyState
			title="No results"
			description="Try a different search query or adjust your filters."
		/>
	),
};

export const NoDescription: Story = {
	render: () => <EmptyState icon={<SearchX size={40} />} title="Nothing matched" />,
};

export const SingleCTA: Story = {
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
	render: () => <EmptyState title="Quiet here." />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<EmptyState
			icon={<Inbox size={40} />}
			title="No applications yet (dark)"
			description="Description uses var(--ink-3) which flips with theme."
		>
			<Button>Add application</Button>
		</EmptyState>
	),
};
