import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../inputs/Button";
import { ActionSheet } from "./index";

const meta: Meta<typeof ActionSheet> = {
	title: "Overlays / ActionSheet",
	component: ActionSheet,
	parameters: {
		docs: {
			description: {
				component:
					"iOS-style bottom-anchored action list — a rounded block of tappable items plus a separate Cancel block. Backdrop tap, Cancel, and Esc dismiss. Pair with useLongPress for touch 'long-press → actions'.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>Open actions</Button>
				<ActionSheet
					open={open}
					onClose={() => setOpen(false)}
					items={[
						{ label: "Edit", onSelect: () => {} },
						{ label: "Duplicate", onSelect: () => {} },
						{ label: "Delete", variant: "destructive", onSelect: () => {} },
					]}
				/>
			</div>
		);
	},
};
