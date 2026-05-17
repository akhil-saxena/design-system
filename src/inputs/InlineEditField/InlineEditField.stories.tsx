import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InlineEditField } from ".";

const meta: Meta<typeof InlineEditField> = {
	title: "Inputs/InlineEditField",
	component: InlineEditField,
};

export default meta;

type Story = StoryObj<typeof InlineEditField>;

function Wrap({
	initial = "",
	multiline = false,
	font = "default" as const,
	placeholder,
	ariaLabel = "Field",
	disabled = false,
}: {
	initial?: string;
	multiline?: boolean;
	font?: "default" | "mono" | "serif";
	placeholder?: string;
	ariaLabel?: string;
	disabled?: boolean;
}) {
	const [v, setV] = useState(initial);
	return (
		<InlineEditField
			value={v}
			onSave={(next) => {
				setV(next);
			}}
			multiline={multiline}
			font={font}
			placeholder={placeholder}
			ariaLabel={ariaLabel}
			disabled={disabled}
		/>
	);
}

export const Default: Story = { render: () => <Wrap initial="Click to edit" /> };
export const Multiline: Story = {
	render: () => <Wrap initial="Long-form prose here." multiline font="serif" ariaLabel="Notes" />,
};
export const MonoHeading: Story = {
	render: () => <Wrap initial="SECTION HEADING" font="mono" ariaLabel="Heading" />,
};
export const Empty: Story = {
	render: () => <Wrap initial="" placeholder="Click to add…" ariaLabel="Empty field" />,
};
export const Disabled: Story = {
	render: () => <Wrap initial="Locked value" disabled ariaLabel="Locked" />,
};
