import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InlineEdit } from ".";
const meta: Meta<typeof InlineEdit> = {
	title: "Interaction/InlineEdit",
	component: InlineEdit,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Click-to-edit text field with optimistic save and error recovery (DS-77). Click or press Space/Enter to enter edit mode. Enter commits, Escape cancels. Blur always reverts. Supports async `onSave` - a rejected Promise surfaces an inline error.",
			},
		},
	},
	argTypes: {
		value: { control: "text" },
		placeholder: { control: "text" },
		disabled: { control: "boolean" },
		multiline: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof InlineEdit>;

function InlineEditDemo({ multiline = false }: { multiline?: boolean }) {
	const [value, setValue] = useState(
		multiline ? "Edit this text.\nIt supports multiple lines." : "Click to edit this title",
	);
	return (
		<InlineEdit
			value={value}
			multiline={multiline}
			onSave={(v) => setValue(v)}
			placeholder="Enter value…"
		/>
	);
}

export const Default: Story = {
	render: () => <InlineEditDemo />,
};

export const Multiline: Story = {
	render: () => <InlineEditDemo multiline />,
};

function AsyncSaveDemo() {
	const [value, setValue] = useState("Async save - takes 1s");
	return (
		<InlineEdit
			value={value}
			onSave={(v) =>
				new Promise((resolve) => {
					setTimeout(() => {
						setValue(v);
						resolve();
					}, 1000);
				})
			}
		/>
	);
}

export const AsyncSave: Story = {
	name: "Async save (1s delay)",
	render: () => <AsyncSaveDemo />,
};

function ErrorDemo() {
	const [value, setValue] = useState("Try saving - it will fail");
	return (
		<InlineEdit
			value={value}
			onSave={() =>
				new Promise((_, reject) => {
					setTimeout(() => reject(new Error("Network error - save failed")), 800);
				})
			}
			placeholder="Enter value…"
		/>
	);
}

export const SaveError: Story = {
	name: "Save error (always fails)",
	render: () => <ErrorDemo />,
};

export const Disabled: Story = {
	render: () => <InlineEdit value="Read-only value" onSave={() => {}} disabled />,
};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <InlineEditDemo />,
};
