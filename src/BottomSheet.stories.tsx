/**
 * # Usage Audit - BottomSheet (DS-87, D-340)
 *
 * Consumers (post v2.1):
 * - mobile/QuickActionsSheet - application card long-press > action menu (5-6 actions)
 * - mobile/FilterSheet - kanban filter UI on phones (full-height variant)
 * - mobile/StageMoveSheet - pick destination column when dragging is not feasible (touch)
 * - mobile/InterviewNotesSheet - capture quick notes during a call (half-height with footer save button)
 *
 * API shape consumers expect:
 * - open + onClose: controlled visibility (no internal state - caller manages)
 * - title (optional ReactNode): renders as <header> with aria-labelledby auto-wired via useId
 * - footer (optional ReactNode): pinned-bottom slot for Save/Cancel buttons
 * - height: "half" (default, max-height 60vh) | "full" (100vh, no top corners)
 * - closeOnBackdropClick: default true; pass false for destructive-confirm flows
 *
 * a11y notes:
 * - role="dialog" + aria-modal="true" on the panel
 * - useFocusTrap installs Tab cycling + focus restore on close
 * - Escape key closes (handled on the document via keydown listener - same as Modal/Sheet)
 * - Drag handle is purely visual (D-340: no swipe gesture in v0.2; deferred to v2.1)
 * - Backdrop click outside the panel closes (default; opt out for destructive)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

const meta: Meta<typeof BottomSheet> = {
	title: "Surfaces/BottomSheet",
	component: BottomSheet,
	parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

function PreviewFrame({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				width: "100%",
				minHeight: "100vh",
				background: "var(--cream)",
				padding: "24px",
				color: "var(--ink)",
				fontFamily: "var(--font)",
			}}
		>
			<p style={{ color: "var(--ink-3)", fontSize: 12 }}>
				Background content. Sheet renders via DSPortal at the bottom edge.
			</p>
			{children}
		</div>
	);
}

function HalfDemo() {
	const [open, setOpen] = useState(true);
	return (
		<PreviewFrame>
			<Button onClick={() => setOpen(true)}>Open half</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Application actions">
				<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>
						Edit application
					</li>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>
						Open job posting
					</li>
					<li style={{ padding: "12px 0", borderBottom: "1px solid var(--rule)" }}>
						Mark as priority
					</li>
					<li style={{ padding: "12px 0", color: "var(--red)" }}>Withdraw</li>
				</ul>
			</BottomSheet>
		</PreviewFrame>
	);
}
export const Half: Story = { render: () => <HalfDemo /> };

function FullDemo() {
	const [open, setOpen] = useState(true);
	return (
		<PreviewFrame>
			<Button onClick={() => setOpen(true)}>Open full</Button>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Filter jobs" height="full">
				<p>Status</p>
				<p>Location</p>
				<p>Salary range</p>
				<p>Remote-only</p>
				<p>Posted within</p>
			</BottomSheet>
		</PreviewFrame>
	);
}
export const Full: Story = { render: () => <FullDemo /> };

function WithTitleDemo() {
	const [open, setOpen] = useState(true);
	return (
		<PreviewFrame>
			<BottomSheet open={open} onClose={() => setOpen(false)} title="Notifications">
				<p>You have 3 unread digests.</p>
			</BottomSheet>
		</PreviewFrame>
	);
}
export const WithTitle: Story = { render: () => <WithTitleDemo /> };

function WithFooterDemo() {
	const [open, setOpen] = useState(true);
	return (
		<PreviewFrame>
			<BottomSheet
				open={open}
				onClose={() => setOpen(false)}
				title="Quick note"
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Save
						</Button>
					</>
				}
			>
				<textarea style={{ width: "100%", minHeight: 80 }} placeholder="Add a note..." />
			</BottomSheet>
		</PreviewFrame>
	);
}
export const WithFooter: Story = { render: () => <WithFooterDemo /> };

function MobileFiltersDemo() {
	const [open, setOpen] = useState(true);
	const [salary, setSalary] = useState(120);
	const [remote, setRemote] = useState(true);
	return (
		<PreviewFrame>
			<BottomSheet
				open={open}
				onClose={() => setOpen(false)}
				title="Filter applications"
				height="half"
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Reset
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Apply filters
						</Button>
					</>
				}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--ink-3)",
								marginBottom: 6,
							}}
						>
							Min salary
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<input
								type="range"
								min={50}
								max={300}
								value={salary}
								onChange={(e) => setSalary(Number(e.target.value))}
								style={{ flex: 1 }}
							/>
							<span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>${salary}k</span>
						</div>
					</div>
					<label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
						<input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
						Remote-friendly only
					</label>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--ink-3)",
								marginBottom: 6,
							}}
						>
							Status
						</div>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
							{["Wishlist", "Applied", "Screening", "Interview", "Offer", "Rejected"].map((s) => (
								<button
									key={s}
									type="button"
									style={{
										padding: "5px 11px",
										borderRadius: 999,
										border: "1px solid var(--rule)",
										background: "transparent",
										fontSize: 11,
										color: "var(--ink-2)",
										cursor: "pointer",
									}}
								>
									{s}
								</button>
							))}
						</div>
					</div>
				</div>
			</BottomSheet>
		</PreviewFrame>
	);
}
export const MobileFilters: Story = { render: () => <MobileFiltersDemo /> };

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => <HalfDemo />,
};
