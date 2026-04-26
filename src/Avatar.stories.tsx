/**
 * # Usage Audit — Avatar / AvatarStack
 *
 * Consumers (post v2.1):
 * - kanban/CardOwnerAvatar — 24px, just the user
 * - detail/HeroAvatar — 40px with name (used as company/recruiter face)
 * - detail/InterviewAttendeesStack — AvatarStack of recruiters/interviewers (max 4 + "+N")
 * - settings/UserMenu — 32px with presence dot
 *
 * API:
 * - name + initials + gradient (override-or-derive); size 24-40
 * - presence: online/away/offline/dnd
 * - AvatarStack: avatars[], max, size — overlap with -8px margin + descending z-index
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarStack } from "./Avatar";

const meta: Meta<typeof Avatar> = {
	title: "Atoms/Avatar",
	component: Avatar,
	parameters: { layout: "centered" },
	args: { name: "Akhil Saxena" },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="Maya Chen" size={24} />
			<Avatar name="David Swanson" size={28} />
			<Avatar name="Jake Kim" size={32} />
			<Avatar name="Alex Park" size={36} />
			<Avatar name="Sam Patel" size={40} />
		</div>
	),
};

export const Deterministic: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="Maya Chen" />
			<Avatar name="Maya Chen" />
			<Avatar name="Akhil Saxena" />
			<Avatar name="Akhil Saxena" />
		</div>
	),
};

export const WithPresence: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="Maya Chen" presence="online" />
			<Avatar name="David Swanson" presence="away" />
			<Avatar name="Jake Kim" presence="offline" />
			<Avatar name="Alex Park" presence="dnd" />
		</div>
	),
};

export const CustomGradient: Story = {
	args: { name: "Custom", gradient: ["#000000", "#444444"] },
};

export const Stack: Story = {
	render: () => (
		<AvatarStack
			avatars={[
				{ name: "Maya Chen" },
				{ name: "David Swanson" },
				{ name: "Jake Kim" },
				{ name: "Alex Park" },
				{ name: "Sam Patel" },
				{ name: "Lin Wong" },
				{ name: "Priya Patel" },
			]}
			max={4}
			size={32}
		/>
	),
};

export const Playground: Story = {
	args: { name: "Playground User", size: 32, presence: undefined },
};

export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="Maya Chen" size={32} />
			<Avatar name="David Swanson" size={32} presence="online" />
			<AvatarStack
				avatars={[{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }]}
				max={3}
			/>
		</div>
	),
	globals: { theme: "dark" },
};
