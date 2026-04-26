/**
 * # Usage Audit — Textarea
 *
 * Consumers (post v2.1):
 * - detail/NotesField — application notes (markdown), no maxLength, controlled
 * - detail/InterviewQA — Q/A bodies, optional maxLength=2000 with counter
 * - settings/CompanyResearchNotes — large markdown, autoresize
 *
 * API expectations:
 * - Same shell as TextInput (D-170 "composes TextInput's shell")
 * - error prop for invalid state
 * - maxLength activates bottom-right character counter
 * - resize: vertical only
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
	title: "Atoms/Textarea",
	component: Textarea,
	parameters: { layout: "centered" },
	args: { placeholder: "Type a note…", rows: 4 },
	decorators: [
		(Story) => (
			<div style={{ width: 360 }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const WithValue: Story = {
	args: { defaultValue: "Strong technical screen — ask follow-up about scaling story." },
};
export const WithCounter: Story = {
	args: {
		defaultValue: "Tracking interview observations.",
		maxLength: 200,
	},
};
export const ErrorState: Story = {
	args: { error: true, defaultValue: "Required field" },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "—" } };
export const Playground: Story = {
	args: { placeholder: "Playground", rows: 5, error: false, disabled: false },
};
export const DarkMode: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, width: 360 }}>
			<Textarea placeholder="Default" rows={3} />
			<Textarea defaultValue="With value content here." rows={3} />
			<Textarea defaultValue="Error" error rows={3} />
		</div>
	),
	globals: { theme: "dark" },
};
