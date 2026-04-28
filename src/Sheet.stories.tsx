/**
 * # Usage Audit — Sheet (DS-87, D-332)
 *
 * Consumers (post v2.1):
 * - kanban/ApplicationDetailSheet — right-side sheet showing application details (compose Sheet + Card content)
 * - settings/PreferencesSheet — right-side sheet with toggles + form fields
 * - profile/EditProfileSheet — left-side sheet (less common; use right by default)
 * - import/CSVPreviewSheet — right-side sheet with table preview + footer Confirm/Cancel
 * - filters/AdvancedFiltersDrawer — right-side sheet with grouped filter inputs
 *
 * API shape consumers expect:
 * - open + onClose — controlled
 * - side: 'right' (default) | 'left'
 * - title, description, footer — slotted ReactNode/string
 * - closeOnBackdropClick: true by default; consumers with destructive forms set false
 * - aria-labelledby + aria-describedby auto-generated via useId() (mirrors Modal pattern)
 * - Mobile (<640px): width auto-flips to 100vw via @media; no prop needed
 * - useFocusTrap traps Tab; Escape closes via document keydown
 * - Swipe-to-close: NOT shipped in v2.0 (D-332 — deferred to v2.1 to avoid @use-gesture/react dep)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./Button";
import { Sheet } from "./Sheet";

const meta: Meta<typeof Sheet> = {
	title: "Surfaces/Sheet",
	component: Sheet,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Sheet>;

function DefaultDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open from right</Button>
			<Sheet open={open} onClose={() => setOpen(false)} title="Application Details">
				<p>Tab cycles focus inside; Escape closes; backdrop click closes.</p>
				<p>Body content uses the slot. Mobile (&lt;640px) auto-flips to full-width.</p>
			</Sheet>
		</>
	);
}
export const Default: Story = { render: () => <DefaultDemo /> };

function LeftSideDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open from left</Button>
			<Sheet open={open} onClose={() => setOpen(false)} side="left" title="Filters">
				<p>Slides in from the left edge via translateX(-100%).</p>
			</Sheet>
		</>
	);
}
export const LeftSide: Story = { render: () => <LeftSideDemo /> };

function WithFooterDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open with footer</Button>
			<Sheet
				open={open}
				onClose={() => setOpen(false)}
				title="Edit Application"
				description="Update the role details below."
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Advance →
						</Button>
					</>
				}
			>
				<p>Form content here. Header + body scroll + footer fixed.</p>
			</Sheet>
		</>
	);
}
export const WithFooter: Story = { render: () => <WithFooterDemo /> };

function MobileFullWidthDemo() {
	const [open, setOpen] = useState(true);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open (preview mobile)</Button>
			<Sheet open={open} onClose={() => setOpen(false)} title="Mobile preview">
				<p>
					On viewports &lt;640px wide, the sheet auto-fills the screen via the CSS media query.
					Visual baseline of this story at a 360px viewport will show full-width.
				</p>
			</Sheet>
		</>
	);
}
export const MobileFullWidth: Story = {
	parameters: { viewport: { defaultViewport: "iphone6" } },
	render: () => <MobileFullWidthDemo />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => <WithFooterDemo />,
};
