/**
 * # Usage Audit — Chip
 *
 * Consumers (post v2.1):
 * - kanban/CardTags — application tags, removable when in edit mode
 * - detail/InterviewSkillChips — match/miss/learning tones for skill matrix
 * - filters/ActiveFilters — removable filter chips with onRemove
 *
 * API:
 * - tone: default | match | miss | learning
 * - onRemove?: () => void — when present, renders × button (Lucide X size=10)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
	title: "Atoms/Chip",
	component: Chip,
	parameters: { layout: "centered" },
	args: { children: "Tag" },
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip tone="default">Default</Chip>
			<Chip tone="match">Match</Chip>
			<Chip tone="miss">Miss</Chip>
			<Chip tone="learning">Learning</Chip>
		</div>
	),
};

export const Removable: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip onRemove={() => {}}>React</Chip>
			<Chip tone="match" onRemove={() => {}}>
				TypeScript
			</Chip>
			<Chip tone="miss" onRemove={() => {}}>
				Kubernetes
			</Chip>
			<Chip tone="learning" onRemove={() => {}}>
				Go
			</Chip>
		</div>
	),
};

export const Playground: Story = {
	args: { tone: "default", children: "Playground" },
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip>Default</Chip>
			<Chip tone="match">Match</Chip>
			<Chip tone="miss">Miss</Chip>
			<Chip tone="learning">Learning</Chip>
			<Chip onRemove={() => {}}>Removable</Chip>
		</div>
	),
	globals: { theme: "dark" },
};
