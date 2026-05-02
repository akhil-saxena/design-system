import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from ".";
import { Avatar } from "../../display/Avatar";
import { ChevronLeft, ChevronRight } from "../../icons";
import { Button } from "../../inputs/Button";
const meta: Meta<typeof AppShell> = {
	title: "Layout/AppShell",
	component: AppShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"AppShell (DS-71) — top-level CSS Grid layout primitive. Provides topbar, sidebar, main, and optional footer slots. The sidebar collapses to a 48px icon-only rail; collapse state persists in localStorage by default.",
			},
		},
	},
};
export default meta;

type Story = StoryObj<typeof AppShell>;

// ─── MockSidebar ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ label: "Dashboard", initial: "D" },
	{ label: "Projects", initial: "P" },
	{ label: "Team", initial: "T" },
	{ label: "Settings", initial: "S" },
];

function MockSidebar({
	collapsed,
	onToggleCollapse,
}: {
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}) {
	return (
		<div
			style={{
				padding: 8,
				display: "flex",
				flexDirection: "column",
				gap: 4,
				height: "100%",
				background: "var(--surf-2)",
			}}
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={onToggleCollapse}
				aria-label="Toggle sidebar"
				style={{ justifyContent: "center", marginBottom: 4 }}
			>
				{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
			</Button>

			{NAV_ITEMS.map((item, i) => (
				<Button
					key={item.label}
					variant={i === 0 ? "primary" : "ghost"}
					size="sm"
					style={{
						justifyContent: collapsed ? "center" : "flex-start",
						gap: 8,
						overflow: "hidden",
						whiteSpace: "nowrap",
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 10,
							height: 10,
							borderRadius: 2,
							background: i === 0 ? "var(--amber)" : "currentColor",
							opacity: i === 0 ? 1 : 0.4,
							flexShrink: 0,
						}}
					/>
					{!collapsed && item.label}
					{collapsed && <span style={{ fontSize: 11, fontWeight: 700 }}>{item.initial}</span>}
				</Button>
			))}
		</div>
	);
}

// ─── MockTopbar ───────────────────────────────────────────────────────────────

function MockTopbar() {
	return (
		<div
			style={{
				height: 48,
				display: "flex",
				alignItems: "center",
				padding: "0 16px",
				gap: 12,
				background: "var(--surf-3)",
			}}
		>
			<div
				style={{
					width: 24,
					height: 24,
					borderRadius: 6,
					background: "var(--ink)",
					flexShrink: 0,
				}}
			/>
			<span
				style={{
					fontFamily: "var(--font-display)",
					fontSize: 14,
					fontWeight: 700,
					color: "var(--ink)",
					letterSpacing: "0.02em",
				}}
			>
				Acme
			</span>
			<div style={{ flex: 1 }} />
			<Avatar name="Alex Smith" size={28} />
		</div>
	);
}

// ─── MockMain ─────────────────────────────────────────────────────────────────

function MockMain() {
	return (
		<div style={{ padding: 24 }}>
			<h1
				style={{
					fontFamily: "var(--font-display)",
					fontSize: 22,
					fontWeight: 700,
					color: "var(--ink)",
					marginBottom: 8,
				}}
			>
				Page Content
			</h1>
			<p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 20 }}>
				The main slot renders here — add routes, pages, and content as needed.
			</p>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
					gap: 12,
				}}
			>
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						style={{
							height: 80,
							background: "var(--surf-3)",
							border: "1px solid var(--rule)",
							borderRadius: 8,
						}}
					/>
				))}
			</div>
		</div>
	);
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default: Story = {
	render: () => (
		<AppShell
			storageKey="storybook-appshell-default"
			sidebar={<MockSidebar />}
			topbar={<MockTopbar />}
			main={<MockMain />}
		/>
	),
};

export const WithFooter: Story = {
	render: () => (
		<AppShell
			storageKey="storybook-appshell-footer"
			sidebar={<MockSidebar />}
			topbar={<MockTopbar />}
			main={<MockMain />}
			footer={
				<div
					style={{
						gridColumn: "2",
						padding: "10px 24px",
						borderTop: "1px solid var(--rule)",
						background: "var(--surf-3)",
						fontSize: 12,
						color: "var(--ink-3)",
					}}
				>
					&copy; 2026 Acme — All rights reserved.
				</div>
			}
		/>
	),
};

export const CollapsedDefault: Story = {
	render: () => (
		<AppShell
			storageKey="storybook-appshell-collapsed-demo"
			sidebarWidth={240}
			sidebar={<MockSidebar />}
			topbar={<MockTopbar />}
			main={<MockMain />}
		/>
	),
};

export const Dark: Story = {
	render: () => (
		<div className="dark" style={{ height: "100vh" }}>
			<AppShell
				storageKey="storybook-appshell-dark"
				sidebar={<MockSidebar />}
				topbar={<MockTopbar />}
				main={<MockMain />}
			/>
		</div>
	),
};
