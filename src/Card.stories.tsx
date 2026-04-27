/**
 * # Usage Audit — Card (D-87, D-300, D-301)
 *
 * Consumers (post v2.1):
 * - kanban/ApplicationCard — variant="kanban"; composes Avatar + Badge + Chip + RollingNumber children (Wave 7 wires data)
 * - dashboard/StatCard — variant="glass"; composes RollingNumber + Badge children
 * - settings/PreferencesCard — variant="glass"; composes Toggle + Radio children
 * - onboarding/CTACard — variant="amber"; composes Button + text children
 * - detail/MetadataCard — variant="dark"; inverted-context content surface
 *
 * API:
 * - extends native <div> attributes (HTMLAttributes<HTMLDivElement>)
 * - variant: 'glass' | 'amber' | 'dark' | 'kanban' — default 'glass'
 * - children: arbitrary JSX (NO compound .Header / .Body / .Footer slots — D-301)
 * - style prop merges LAST so consumers can override padding/border/etc.
 * - forwards ref to root div for measurement / focus / portal-anchor use
 *
 * Implementation (D-300): single .tsx with `data-variant` attribute; CSS
 * attribute selectors in primitives.css drive visuals per variant. Mirrors
 * Button + Chip data-variant pattern.
 *
 * Variant intent:
 * - glass:  default content surface; matches handoff `.glass` recipe
 * - amber:  CTA / next-action highlight; amber-tinted gradient bg + amber border
 * - dark:   ALWAYS-DARK surface (does NOT flip in :root.dark — handoff invariant)
 * - kanban: compact glass with hover lift; visual surface only — data binding
 *           composition (logo + role + age + chips) ships in Wave 7 / DragDropList (D-302)
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
	title: "Surfaces/Card",
	component: Card,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
	args: {
		children: (
			<>
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Standard Glass
				</div>
				<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
					Default card with backdrop blur and translucent border.
				</div>
			</>
		),
	},
};

export const Variants: Story = {
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: 14,
				maxWidth: 720,
			}}
		>
			<Card variant="glass">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Glass
				</div>
				<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
					Default surface with backdrop blur.
				</div>
			</Card>
			<Card variant="amber">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Amber
				</div>
				<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
					CTA highlight surface.
				</div>
			</Card>
			<Card variant="dark">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Dark
				</div>
				<div style={{ fontSize: 13, color: "#aaa39e", lineHeight: 1.5 }}>
					Always-dark surface (does not flip in dark mode).
				</div>
			</Card>
			<Card variant="kanban">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 13,
						marginBottom: 2,
					}}
				>
					Kanban
				</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>Hover-lift compact card.</div>
			</Card>
		</div>
	),
};

export const Composed: Story = {
	render: () => (
		<Card variant="glass" style={{ padding: 0, maxWidth: 480 }}>
			<div
				style={{
					padding: "14px 20px",
					borderBottom: "1px solid var(--rule)",
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<span style={{ width: 4, height: 14, background: "var(--amber)", borderRadius: 2 }} />
				<span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
					Section Header
				</span>
				<span
					style={{
						marginLeft: "auto",
						fontFamily: "var(--mono)",
						fontSize: 9.5,
						color: "var(--ink-3)",
						letterSpacing: "0.08em",
						textTransform: "uppercase",
					}}
				>
					3 items
				</span>
			</div>
			<div style={{ padding: "16px 20px", fontSize: 13, color: "var(--ink-2)" }}>
				Freely-composed body content. The header bar is a <code>div</code> child, not a compound
				component slot. Consumers control the layout entirely.
			</div>
			<div
				style={{
					padding: "12px 20px",
					borderTop: "1px solid var(--rule)",
					display: "flex",
					justifyContent: "flex-end",
					gap: 8,
					fontSize: 12,
					color: "var(--ink-3)",
				}}
			>
				Footer slot — also just a child div.
			</div>
		</Card>
	),
};

export const KanbanCard: Story = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 12 }}>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Stripe</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>Staff Engineer</div>
			</Card>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>
					Automattic
				</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>Software Engineer</div>
			</Card>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Supabase</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>
					Full Stack Engineer
				</div>
			</Card>
		</div>
	),
};

export const Playground: Story = {
	args: {
		variant: "glass",
		children: "Playground card content. Tweak the variant via the controls panel.",
	},
	argTypes: {
		variant: { control: "select", options: ["glass", "amber", "dark", "kanban"] },
	},
};

export const DarkMode: Story = {
	parameters: { globals: { theme: "dark" } },
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: 14,
				maxWidth: 720,
			}}
		>
			<Card variant="glass">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Glass (dark mode)
				</div>
				<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
					Surface flips with :root.dark.
				</div>
			</Card>
			<Card variant="amber">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Amber (dark mode)
				</div>
				<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
					Amber-tinted gradient.
				</div>
			</Card>
			<Card variant="dark">
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 700,
						fontSize: 15,
						marginBottom: 4,
					}}
				>
					Dark (always)
				</div>
				<div style={{ fontSize: 13, color: "#aaa39e", lineHeight: 1.5 }}>
					Identical visual whether :root.dark is set or not — handoff invariant.
				</div>
			</Card>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>
					Kanban (dark)
				</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>Hover-lift compact card.</div>
			</Card>
		</div>
	),
};
