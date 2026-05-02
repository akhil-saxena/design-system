import type { Meta, StoryObj } from "@storybook/react";
import {
	CalendarEvent,
	Celebrate,
	Chart,
	Cloud,
	ConnectionLost,
	Documents,
	EmptyBox,
	GraphUp,
	Idea,
	IllustrationError,
	IllustrationSearch,
	IllustrationSuccess,
	Inbox,
	Lightbulb,
	Lock,
	MailSent,
	PhoneScreen,
	Plant,
	Puzzle,
	Rocket,
	Team,
	Thinking,
	Travel,
	Workflow,
} from "./index";

const ALL_ILLUSTRATIONS = [
	{ Component: MailSent, name: "MailSent", label: "Confirmations, sent actions" },
	{ Component: Documents, name: "Documents", label: "Resume, files, attachments" },
	{ Component: Rocket, name: "Rocket", label: "Launches, send, growth" },
	{ Component: Celebrate, name: "Celebrate", label: "Offers, milestones, wins" },
	{ Component: Lightbulb, name: "Lightbulb", label: "Tips, insights" },
	{ Component: Idea, name: "Idea", label: "New ideas, brainstorming" },
	{ Component: IllustrationSearch, name: "IllustrationSearch", label: "Empty search, discovery" },
	{ Component: Plant, name: "Plant", label: "Onboarding, beginner, growth" },
	{ Component: Cloud, name: "Cloud", label: "Sync, backup, status" },
	{ Component: EmptyBox, name: "EmptyBox", label: "Empty inbox/list" },
	{ Component: ConnectionLost, name: "ConnectionLost", label: "Offline, network error" },
	{ Component: IllustrationError, name: "IllustrationError", label: "Generic error state" },
	{ Component: Inbox, name: "Inbox", label: "Notifications, mailbox" },
	{ Component: GraphUp, name: "GraphUp", label: "Analytics, growth metrics" },
	{ Component: Chart, name: "Chart", label: "Reports, dashboards" },
	{ Component: CalendarEvent, name: "CalendarEvent", label: "Scheduled events, dates" },
	{ Component: Team, name: "Team", label: "Collaboration, sharing" },
	{ Component: Thinking, name: "Thinking", label: "In-progress AI, processing" },
	{ Component: Lock, name: "Lock", label: "Privacy, secure, locked" },
	{ Component: Puzzle, name: "Puzzle", label: "Integrations, fitting together" },
	{ Component: Workflow, name: "Workflow", label: "Pipelines, automation" },
	{ Component: Travel, name: "Travel", label: "Onboarding, journey" },
	{ Component: IllustrationSuccess, name: "IllustrationSuccess", label: "Generic success state" },
	{ Component: PhoneScreen, name: "PhoneScreen", label: "Mobile preview, app" },
];

const meta: Meta = {
	title: "Foundation/Illustrations",
};

export default meta;

type Story = StoryObj;

export const Gallery: Story = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: 24 }}>
			{ALL_ILLUSTRATIONS.map(({ Component, name, label }) => (
				<div
					key={name}
					style={{
						borderRadius: 12,
						padding: 16,
						textAlign: "center",
						background: "var(--cream, #fdf8f0)",
						border: "1px solid var(--rule, rgba(0,0,0,.08))",
					}}
				>
					<div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
						<Component />
					</div>
					<div
						style={{
							fontFamily: "var(--mono, monospace)",
							fontSize: 10,
							fontWeight: 700,
							color: "var(--ink, #1c1917)",
							marginBottom: 4,
						}}
					>
						{name}
					</div>
					<div style={{ fontSize: 11, color: "var(--ink-3, #78716c)", lineHeight: 1.4 }}>
						{label}
					</div>
				</div>
			))}
		</div>
	),
};

export const DarkMode: Story = {
	render: () => (
		<div className="dark" style={{ background: "#1c1917", padding: 24 }}>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
				{ALL_ILLUSTRATIONS.map(({ Component, name, label }) => (
					<div
						key={name}
						style={{
							borderRadius: 12,
							padding: 16,
							textAlign: "center",
							background: "rgba(255,255,255,.05)",
							border: "1px solid rgba(255,255,255,.1)",
						}}
					>
						<div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
							<Component />
						</div>
						<div
							style={{
								fontFamily: "var(--mono, monospace)",
								fontSize: 10,
								fontWeight: 700,
								color: "var(--cream, #fdf8f0)",
								marginBottom: 4,
							}}
						>
							{name}
						</div>
						<div style={{ fontSize: 11, color: "rgba(253,248,240,.5)", lineHeight: 1.4 }}>
							{label}
						</div>
					</div>
				))}
			</div>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "flex-end", gap: 32, padding: 24 }}>
			<div style={{ textAlign: "center" }}>
				<MailSent width={60} height={60} />
				<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3, #78716c)" }}>60×60</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<MailSent width={120} height={120} />
				<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3, #78716c)" }}>
					120×120 (default)
				</div>
			</div>
			<div style={{ textAlign: "center" }}>
				<MailSent width={200} height={200} />
				<div style={{ fontSize: 11, marginTop: 8, color: "var(--ink-3, #78716c)" }}>200×200</div>
			</div>
		</div>
	),
};
