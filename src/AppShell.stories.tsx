import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./AppShell";

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

function MockSidebar({
	collapsed,
	onToggleCollapse,
}: {
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}) {
	const NAV_ITEMS = ["Dashboard", "Jobs", "Resume", "Settings"];
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
			<button
				type="button"
				onClick={onToggleCollapse}
				aria-label="Toggle sidebar"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "6px 8px",
					fontSize: 13,
					background: "transparent",
					border: "1px solid var(--rule)",
					borderRadius: 6,
					cursor: "pointer",
					color: "var(--ink)",
					marginBottom: 8,
				}}
			>
				{collapsed ? "→" : "←"}
			</button>
			{NAV_ITEMS.map((label, i) => (
				<div
					key={label}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						padding: "6px 8px",
						borderRadius: 6,
						background: i === 0 ? "var(--ink)" : "transparent",
						color: i === 0 ? "var(--cream)" : "var(--ink)",
						fontSize: 13,
						overflow: "hidden",
						whiteSpace: "nowrap",
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 12,
							height: 12,
							borderRadius: 3,
							background: i === 0 ? "var(--amber)" : "var(--ink-4)",
							flexShrink: 0,
						}}
					/>
					{!collapsed && <span>{label}</span>}
					{collapsed && <span style={{ fontSize: 11, fontWeight: 600 }}>{label[0]}</span>}
				</div>
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
				JobDash
			</span>
			<div style={{ flex: 1 }} />
			<div
				style={{
					width: 28,
					height: 28,
					borderRadius: "50%",
					background: "var(--amber)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 11,
					fontWeight: 600,
					color: "#fff",
				}}
			>
				AS
			</div>
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
					&copy; 2026 JobDash — All rights reserved.
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
