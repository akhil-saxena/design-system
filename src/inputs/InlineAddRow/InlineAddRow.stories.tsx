import type { Meta, StoryObj } from "@storybook/react";
import { InlineAddRow } from "./index";

const meta: Meta<typeof InlineAddRow> = {
	title: "Inputs / InlineAddRow",
	component: InlineAddRow,
	args: {
		placeholder: "Add a question…",
		onSave: () => {},
	},
	parameters: {
		docs: {
			description: {
				component:
					"A dashed '+ add' affordance that expands into an inline input on click. Enter commits the trimmed value; Esc or blur discards.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoteRow: Story = {
	args: { placeholder: "Add a note…", kbdHint: "Enter ↵" },
};

export const PersonRow: Story = {
	args: { placeholder: "Add a person…" },
};
