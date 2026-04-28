/**
 * # Usage Audit — SplitButton (D-87, D-530)
 *
 * Consumers (post v2.1):
 * - kanban/CardSaveActions — SplitButton with [Save, Save as draft, Save and close]
 *   on the application detail editor footer.
 * - applications/BulkActions — SplitButton with [Apply now, Apply later, Discard]
 *   when user opts into a wishlist row's quick-action.
 * - settings/ExportActions — SplitButton with [Export as CSV, Export as JSON,
 *   Export as PDF]; default action becomes whichever the user last picked
 *   for that session.
 *
 * API shape consumers expect:
 * - actions: tuple `[SplitButtonAction, ...SplitButtonAction[]]` (≥1 enforced
 *   at the type level)
 * - SplitButtonAction: `{ label, icon?, onClick }` — onClick fires both for
 *   the primary face and when the matching menu item is selected
 * - variant: 'primary' | 'secondary' (mirrors Button)
 * - size: 'sm' | 'md' | 'lg' (mirrors Button)
 *
 * Behavior (D-530): the chevron opens a Popover (NOT DSDropdown — this menu is
 * 2–5 actions, not a listbox). Selecting an alternative re-binds the primary
 * face for this instance; re-mounting the component resets to actions[0].
 * Persistence across reloads is deferred to v2.1.
 *
 * Visual baselines: deferred to 16-09 closeout (cumulative capture).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Save, X } from "lucide-react";
import { SplitButton } from "./SplitButton";

const meta: Meta<typeof SplitButton> = {
	title: "Compound/SplitButton",
	component: SplitButton,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SplitButton>;

const saveActions: [
	{ label: string; onClick: () => void },
	...{ label: string; onClick: () => void }[],
] = [
	{ label: "Save", onClick: () => console.log("save") },
	{ label: "Save as draft", onClick: () => console.log("draft") },
	{ label: "Save and close", onClick: () => console.log("save-close") },
];

export const Default: Story = {
	render: () => (
		<div style={{ padding: 80 }}>
			<SplitButton actions={saveActions} />
		</div>
	),
};

export const Variants: Story = {
	render: () => (
		<div style={{ padding: 80, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
			<SplitButton actions={saveActions} variant="primary" />
			<SplitButton actions={saveActions} variant="secondary" />
			<SplitButton actions={saveActions} variant="ghost" />
			<SplitButton actions={saveActions} variant="danger" />
		</div>
	),
};

export const MixedVariants: Story = {
	render: () => (
		<div style={{ padding: 80, display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
				Each action has its own variant — selecting "Discard" turns the primary face red.
			</div>
			<SplitButton
				actions={[
					{ label: "Save", onClick: () => console.log("save"), variant: "primary" },
					{
						label: "Save as draft",
						onClick: () => console.log("draft"),
						variant: "secondary",
					},
					{ label: "Discard", onClick: () => console.log("discard"), variant: "danger" },
				]}
			/>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div style={{ padding: 80, display: "flex", gap: 24, alignItems: "center" }}>
			<SplitButton actions={saveActions} size="sm" />
			<SplitButton actions={saveActions} size="md" />
			<SplitButton actions={saveActions} size="lg" />
		</div>
	),
};

export const WithIcons: Story = {
	render: () => (
		<div style={{ padding: 80 }}>
			<SplitButton
				actions={[
					{ label: "Save", icon: <Save size={13} />, onClick: () => console.log("save") },
					{
						label: "Save as draft",
						icon: <FileText size={13} />,
						onClick: () => console.log("draft"),
					},
					{ label: "Discard", icon: <X size={13} />, onClick: () => console.log("discard") },
				]}
			/>
		</div>
	),
};

export const Playground: Story = {
	render: () => (
		<div style={{ padding: 80, display: "flex", flexDirection: "column", gap: 16 }}>
			<SplitButton
				actions={[
					{ label: "Apply now", onClick: () => console.log("apply-now") },
					{ label: "Apply later", onClick: () => console.log("apply-later") },
					{ label: "Discard", onClick: () => console.log("discard") },
				]}
				variant="secondary"
				size="md"
			/>
		</div>
	),
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => (
		<div style={{ padding: 80, display: "flex", gap: 24, alignItems: "center" }}>
			<SplitButton actions={saveActions} variant="primary" />
			<SplitButton actions={saveActions} variant="secondary" />
		</div>
	),
};
