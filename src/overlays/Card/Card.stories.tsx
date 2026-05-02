import type { Meta, StoryObj } from "@storybook/react";
import { Briefcase, Check, MapPin, Star } from "lucide-react";
import { Card } from ".";
import { RollingNumber } from "../../display/RollingNumber";
import { Badge } from "../../inputs/Badge";
import { Button } from "../../inputs/Button";
const SRC = {
	Default: `<Card>
  <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
    Standard Glass
  </div>
  <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
    Default card with backdrop blur and translucent border.
  </div>
</Card>`,
	Variants: `<Card variant="glass">Glass — default surface with backdrop blur.</Card>
<Card variant="amber">Amber — CTA highlight surface.</Card>
<Card variant="dark">Dark — always-dark surface.</Card>
<Card variant="kanban">Kanban — hover-lift compact card.</Card>`,
	Composed: `<Card variant="glass" style={{ padding: 0, maxWidth: 480 }}>
  <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)" }}>
    Section Header
  </div>
  <div style={{ padding: "16px 20px", fontSize: 13, color: "var(--ink-2)" }}>
    Freely-composed body content.
  </div>
  <div style={{ padding: "12px 20px", borderTop: "1px solid var(--rule)" }}>
    Footer slot — also just a child div.
  </div>
</Card>`,
	KanbanCard: `<Card variant="kanban">
  <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Acme Corp</div>
  <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>Staff Engineer</div>
</Card>`,
	ApplicationCard: `<Card variant="glass" style={{ maxWidth: 360, padding: 20 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
    <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #635bff, #4338ca)" }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 }}>Acme Corp</div>
      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Staff Engineer</div>
    </div>
    <Badge tone="amber">In Progress</Badge>
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <Button variant="primary" size="sm">Mark Approved</Button>
    <Button variant="ghost" size="sm">Pin</Button>
  </div>
</Card>`,
	StatCard: `<Card variant="glass">
  <div>Total Records</div>
  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32 }}>
    <RollingNumber value={42} />
  </div>
  <div style={{ fontSize: 11, color: "var(--green)" }}>+8 this week</div>
</Card>`,
	Playground: `<Card variant="glass">
  Playground card content. Tweak the variant via the controls panel.
</Card>`,
	DarkMode: `<Card variant="glass">Glass (dark mode)</Card>
<Card variant="amber">Amber (dark mode)</Card>
<Card variant="dark">Dark (always)</Card>
<Card variant="kanban">Kanban (dark)</Card>`,
};

const meta: Meta<typeof Card> = {
	title: "Overlays/Card",
	component: Card,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Surface primitive with glass, amber, dark, and kanban variants; accepts arbitrary children and forwards its ref to the root div.",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["glass", "amber", "dark", "kanban"],
			description: "Surface style variant controlling background, border, and hover behavior.",
		},
		children: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
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
	parameters: { docs: { source: { code: SRC.Variants } } },
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
	parameters: { docs: { source: { code: SRC.Composed } } },
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
	parameters: { docs: { source: { code: SRC.KanbanCard } } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 12 }}>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Acme Corp</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>Staff Engineer</div>
			</Card>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Globex</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>Software Engineer</div>
			</Card>
			<Card variant="kanban">
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13 }}>Initech</div>
				<div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>
					Full Stack Engineer
				</div>
			</Card>
		</div>
	),
};

export const ApplicationCard: Story = {
	parameters: { docs: { source: { code: SRC.ApplicationCard } } },
	render: () => (
		<Card variant="glass" style={{ maxWidth: 360, padding: 20 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
				<div
					style={{
						width: 40,
						height: 40,
						borderRadius: 8,
						background: "linear-gradient(135deg, #635bff, #4338ca)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#fff",
						fontFamily: "var(--display)",
						fontWeight: 800,
					}}
				>
					S
				</div>
				<div style={{ flex: 1 }}>
					<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 }}>
						Acme Corp
					</div>
					<div style={{ fontSize: 12, color: "var(--ink-3)" }}>Staff Engineer</div>
				</div>
				<Badge tone="amber">In Progress</Badge>
			</div>

			<div
				style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-2)", marginBottom: 14 }}
			>
				<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
					<MapPin size={13} /> Remote · SF
				</span>
				<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
					<Briefcase size={13} /> 5-10 yrs
				</span>
			</div>

			<div style={{ display: "flex", gap: 8 }}>
				<Button variant="primary" size="sm" icon={<Check size={13} />}>
					Mark Approved
				</Button>
				<Button variant="ghost" size="sm" icon={<Star size={13} />}>
					Pin
				</Button>
			</div>
		</Card>
	),
};

export const StatCard: Story = {
	parameters: { docs: { source: { code: SRC.StatCard } } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 220px)", gap: 12 }}>
			<Card variant="glass">
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
					Total Records
				</div>
				<div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32 }}>
					<RollingNumber value={42} />
				</div>
				<div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>+8 this week</div>
			</Card>
			<Card variant="amber">
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
					Interviews
				</div>
				<div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32 }}>
					<RollingNumber value={7} />
				</div>
				<div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 4 }}>3 scheduled</div>
			</Card>
			<Card variant="dark">
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9.5,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#aaa39e",
						marginBottom: 6,
					}}
				>
					Offers
				</div>
				<div
					style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32, color: "#f5f3f0" }}
				>
					<RollingNumber value={2} />
				</div>
				<div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4 }}>1 active</div>
			</Card>
		</div>
	),
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
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
