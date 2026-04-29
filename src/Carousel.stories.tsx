import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Carousel } from "./Carousel";
import type { CarouselSlide } from "./Carousel";

const meta: Meta<typeof Carousel> = {
	title: "Primitives/Carousel",
	component: Carousel,
	parameters: { layout: "padded" },
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Carousel>;

// ─── Shared slide data ────────────────────────────────────────────────────────

const HERO_SLIDES: CarouselSlide[] = [
	{
		id: "hero-1",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg, #f59e0b, #b45309)",
					color: "#fff",
					padding: 40,
					textAlign: "center",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 800,
						fontSize: 24,
						marginBottom: 8,
					}}
				>
					Welcome to JobDash
				</div>
				<div style={{ fontSize: 14, opacity: 0.9 }}>The job hunt, with sanity intact</div>
			</div>
		),
		ariaLabel: "Slide 1: Welcome to JobDash",
	},
	{
		id: "hero-2",
		content: (
			<div
				style={{
					background: "var(--ink)",
					color: "var(--cream)",
					padding: 40,
					textAlign: "center",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 800,
						fontSize: 24,
						marginBottom: 8,
					}}
				>
					Track every application
				</div>
				<div style={{ fontSize: 14, opacity: 0.75 }}>Kanban, list, calendar — your call</div>
			</div>
		),
		ariaLabel: "Slide 2: Track applications",
	},
	{
		id: "hero-3",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
					color: "#fff",
					padding: 40,
					textAlign: "center",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 800,
						fontSize: 24,
						marginBottom: 8,
					}}
				>
					Never miss a follow-up
				</div>
				<div style={{ fontSize: 14, opacity: 0.9 }}>Smart reminders for every stage</div>
			</div>
		),
		ariaLabel: "Slide 3: Follow-up reminders",
	},
	{
		id: "hero-4",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg, #059669, #0d9488)",
					color: "#fff",
					padding: 40,
					textAlign: "center",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 800,
						fontSize: 24,
						marginBottom: 8,
					}}
				>
					Land the offer
				</div>
				<div style={{ fontSize: 14, opacity: 0.9 }}>Prep, practice, and persist</div>
			</div>
		),
		ariaLabel: "Slide 4: Land the offer",
	},
];

const CONTENT_SLIDES: CarouselSlide[] = [
	{
		id: "testimonial-1",
		content: (
			<div
				style={{
					padding: 32,
					background: "var(--surface)",
					minHeight: 180,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
						marginBottom: 8,
						color: "var(--ink)",
					}}
				>
					Testimonial
				</div>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 700,
						fontSize: 18,
						marginBottom: 10,
						lineHeight: 1.3,
						color: "var(--ink)",
					}}
				>
					"Got my dream job in 6 weeks."
				</div>
				<div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, color: "var(--ink)" }}>
					JobDash kept me organised through 47 applications and 12 interviews.
				</div>
			</div>
		),
	},
	{
		id: "testimonial-2",
		content: (
			<div
				style={{
					padding: 32,
					background: "var(--surface)",
					minHeight: 180,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
						marginBottom: 8,
						color: "var(--ink)",
					}}
				>
					Case study
				</div>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 700,
						fontSize: 18,
						marginBottom: 10,
						lineHeight: 1.3,
						color: "var(--ink)",
					}}
				>
					"Cut my apply time by 70%"
				</div>
				<div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, color: "var(--ink)" }}>
					Templates, snippets, and a tracking workflow that actually works.
				</div>
			</div>
		),
	},
	{
		id: "testimonial-3",
		content: (
			<div
				style={{
					padding: 32,
					background: "var(--surface)",
					minHeight: 180,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
						marginBottom: 8,
						color: "var(--ink)",
					}}
				>
					Review
				</div>
				<div
					style={{
						fontFamily: "var(--font-display)",
						fontWeight: 700,
						fontSize: 18,
						marginBottom: 10,
						lineHeight: 1.3,
						color: "var(--ink)",
					}}
				>
					"The only tool I needed."
				</div>
				<div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, color: "var(--ink)" }}>
					Replaced my spreadsheet, my Notion docs, and my Google Calendar reminders.
				</div>
			</div>
		),
	},
];

const IMAGE_SLIDES: CarouselSlide[] = [
	{
		id: "img-1",
		content: (
			<img
				src="https://picsum.photos/seed/job1/800/400"
				alt="Office workspace with laptop"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
		ariaLabel: "Slide 1: Office workspace",
	},
	{
		id: "img-2",
		content: (
			<img
				src="https://picsum.photos/seed/job2/800/400"
				alt="Team collaboration session"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
		ariaLabel: "Slide 2: Team collaboration",
	},
	{
		id: "img-3",
		content: (
			<img
				src="https://picsum.photos/seed/job3/800/400"
				alt="Developer at standing desk"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
		ariaLabel: "Slide 3: Developer at standing desk",
	},
	{
		id: "img-4",
		content: (
			<img
				src="https://picsum.photos/seed/job4/800/400"
				alt="Coffee shop remote work"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
		ariaLabel: "Slide 4: Remote work",
	},
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
	name: "Default — hero slides, arrows + dots",
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="JobDash feature highlights" />
		</div>
	),
};

export const Autoplay: Story = {
	name: "Autoplay — 3 s interval, pauses on hover/focus",
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<p
				style={{
					fontSize: 12,
					color: "var(--ink-2)",
					marginBottom: 12,
					fontFamily: "var(--font-mono)",
				}}
			>
				Slides advance every 3 s. Hover or focus pauses the timer. Reduced-motion OS preference
				disables autoplay entirely.
			</p>
			<Carousel
				slides={HERO_SLIDES}
				ariaLabel="Auto-advancing feature highlights"
				autoPlayInterval={3000}
			/>
		</div>
	),
};

export const NoArrows: Story = {
	name: "No arrows — dot-only navigation",
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" showArrows={false} />
		</div>
	),
};

export const NoDots: Story = {
	name: "No dots — arrow-only navigation",
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" showDots={false} />
		</div>
	),
};

export const ImageSlides: Story = {
	name: "Image slides — objectFit cover",
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={IMAGE_SLIDES} ariaLabel="Photo gallery" />
		</div>
	),
};

export const ContentSlides: Story = {
	name: "Content slides — testimonials",
	render: () => (
		<div style={{ maxWidth: 560 }}>
			<Carousel slides={CONTENT_SLIDES} ariaLabel="Customer testimonials" autoPlayInterval={4000} />
		</div>
	),
};

export const ReducedMotion: Story = {
	name: "Reduced motion — autoplay disabled, no transition",
	decorators: [
		(Story) => (
			<div>
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-2)",
						marginBottom: 12,
						fontFamily: "var(--font-mono)",
					}}
				>
					When OS "Reduce Motion" preference is active: autoplay timer never starts, and the track
					transition is suppressed (data-reduced-motion="true"). Toggle via System Preferences →
					Accessibility → Display → Reduce Motion to observe.
				</p>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel
				slides={HERO_SLIDES}
				ariaLabel="Feature highlights (reduced motion)"
				autoPlayInterval={2000}
			/>
		</div>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	parameters: { backgrounds: { default: "dark" } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ padding: 24 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" />
		</div>
	),
};

export const Controlled: Story = {
	name: "Controlled — parent owns index",
	render: function ControlledStory() {
		const [idx, setIdx] = useState(0);
		return (
			<div style={{ maxWidth: 640 }}>
				<p
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 12,
						marginBottom: 12,
						color: "var(--ink-2)",
					}}
				>
					Active index: {idx}
				</p>
				<Carousel
					slides={HERO_SLIDES}
					ariaLabel="Controlled carousel"
					index={idx}
					onIndexChange={setIdx}
				/>
				<div style={{ display: "flex", gap: 8, marginTop: 12 }}>
					{HERO_SLIDES.map((slide, i) => (
						<button
							key={slide.id}
							type="button"
							onClick={() => setIdx(i)}
							style={{
								padding: "4px 10px",
								fontSize: 12,
								borderRadius: 4,
								border: "1px solid var(--rule)",
								background: i === idx ? "var(--amber)" : "var(--surface)",
								cursor: "pointer",
							}}
						>
							{i + 1}
						</button>
					))}
				</div>
			</div>
		);
	},
};

export const Playground: Story = {
	name: "Playground",
	args: {
		ariaLabel: "Playground carousel",
		showArrows: true,
		showDots: true,
		autoPlayInterval: 0,
		defaultIndex: 0,
	},
	render: (args) => (
		<div style={{ maxWidth: 640 }}>
			<Carousel {...args} slides={HERO_SLIDES} />
		</div>
	),
};
