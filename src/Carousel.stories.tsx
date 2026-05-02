import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Carousel, type CarouselSlide } from "./Carousel";

const meta: Meta<typeof Carousel> = {
	title: "Primitives/Carousel",
	component: Carousel,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"WAI-ARIA carousel. Supports arrows, dots, autoplay, touch swipe, and controlled/uncontrolled index. Autoplay is silently disabled when the OS prefers-reduced-motion.",
			},
		},
	},
	argTypes: {
		showArrows: { control: "boolean", description: "Show Prev/Next arrow buttons." },
		showDots: { control: "boolean", description: "Show dot indicator navigation." },
		autoPlayInterval: {
			control: "number",
			description: "Auto-advance interval in ms. 0 = disabled.",
		},
		defaultIndex: { control: "number", description: "Initial slide index (uncontrolled)." },
		index: { control: false },
		onIndexChange: { control: false },
		slides: { control: false },
		ariaLabel: { control: "text" },
		className: { control: false },
		style: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof Carousel>;

// ─── Slide data ───────────────────────────────────────────────────────────────

const slide = (
	bg: string,
	fg: string,
	title: string,
	sub: string,
): React.CSSProperties & { bg: string; fg: string; title: string; sub: string } =>
	({ bg, fg, title, sub }) as never;

const HERO_SLIDES: CarouselSlide[] = [
	{
		id: "hero-1",
		ariaLabel: "Slide 1: Welcome to JobDash",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg,#f59e0b,#b45309)",
					color: "#fff",
					padding: "40px 0",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
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
	},
	{
		id: "hero-2",
		ariaLabel: "Slide 2: Track applications",
		content: (
			<div
				style={{
					background: "var(--ink)",
					color: "var(--cream)",
					padding: "40px 0",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
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
	},
	{
		id: "hero-3",
		ariaLabel: "Slide 3: Follow-up reminders",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
					color: "#fff",
					padding: "40px 0",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
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
	},
	{
		id: "hero-4",
		ariaLabel: "Slide 4: Land the offer",
		content: (
			<div
				style={{
					background: "linear-gradient(135deg,#059669,#0d9488)",
					color: "#fff",
					padding: "40px 0",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
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
	},
];

const TESTIMONIALS: CarouselSlide[] = [
	{
		id: "t-1",
		content: (
			<div
				style={{
					minHeight: 180,
					padding: "0 64px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					gap: 8,
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
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
		id: "t-2",
		content: (
			<div
				style={{
					minHeight: 180,
					padding: "0 64px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					gap: 8,
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
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
		id: "t-3",
		content: (
			<div
				style={{
					minHeight: 180,
					padding: "0 64px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					gap: 8,
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 9.5,
						letterSpacing: ".08em",
						textTransform: "uppercase",
						opacity: 0.6,
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
						lineHeight: 1.3,
						color: "var(--ink)",
					}}
				>
					"The only tool I needed."
				</div>
				<div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, color: "var(--ink)" }}>
					Replaced my spreadsheet, Notion docs, and Google Calendar reminders.
				</div>
			</div>
		),
	},
];

const IMAGE_SLIDES: CarouselSlide[] = [
	{
		id: "img-1",
		ariaLabel: "Slide 1: Office workspace",
		content: (
			<img
				src="https://picsum.photos/seed/job1/800/400"
				alt="Office workspace"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
	},
	{
		id: "img-2",
		ariaLabel: "Slide 2: Team collaboration",
		content: (
			<img
				src="https://picsum.photos/seed/job2/800/400"
				alt="Team collaboration"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
	},
	{
		id: "img-3",
		ariaLabel: "Slide 3: Developer at desk",
		content: (
			<img
				src="https://picsum.photos/seed/job3/800/400"
				alt="Developer at standing desk"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
	},
	{
		id: "img-4",
		ariaLabel: "Slide 4: Remote work",
		content: (
			<img
				src="https://picsum.photos/seed/job4/800/400"
				alt="Coffee shop remote work"
				style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
			/>
		),
	},
];

// ─── Source snippets ──────────────────────────────────────────────────────────

const SRC = {
	default: `<Carousel
  ariaLabel="JobDash feature highlights"
  slides={[
    { id: "hero-1", ariaLabel: "Slide 1: Welcome to JobDash", content: <HeroSlide title="Welcome to JobDash" sub="The job hunt, with sanity intact" /> },
    { id: "hero-2", ariaLabel: "Slide 2: Track applications", content: <HeroSlide title="Track every application" sub="Kanban, list, calendar — your call" /> },
    { id: "hero-3", ariaLabel: "Slide 3: Follow-up reminders", content: <HeroSlide title="Never miss a follow-up" sub="Smart reminders for every stage" /> },
    { id: "hero-4", ariaLabel: "Slide 4: Land the offer", content: <HeroSlide title="Land the offer" sub="Prep, practice, and persist" /> },
  ]}
/>`,

	autoplay: `<Carousel
  ariaLabel="Auto-advancing feature highlights"
  autoPlayInterval={3000}
  slides={HERO_SLIDES}
/>`,

	noArrows: `<Carousel
  ariaLabel="Feature highlights"
  showArrows={false}
  slides={HERO_SLIDES}
/>`,

	noDots: `<Carousel
  ariaLabel="Feature highlights"
  showDots={false}
  slides={HERO_SLIDES}
/>`,

	images: `// Image slides — set showArrows={false} for full-bleed images
<Carousel
  ariaLabel="Photo gallery"
  showArrows={false}
  slides={[
    { id: "img-1", ariaLabel: "Office workspace", content: <img src="/img/office.jpg" alt="Office workspace" style={{ width: "100%", height: 220, objectFit: "cover" }} /> },
    { id: "img-2", ariaLabel: "Team collaboration", content: <img src="/img/team.jpg" alt="Team collaboration" style={{ width: "100%", height: 220, objectFit: "cover" }} /> },
  ]}
/>`,

	testimonials: `<Carousel
  ariaLabel="Customer testimonials"
  autoPlayInterval={4000}
  slides={[
    {
      id: "t-1",
      content: (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontWeight: 700, fontSize: 18 }}>"Got my dream job in 6 weeks."</p>
          <p style={{ opacity: 0.75 }}>JobDash kept me organised through 47 applications and 12 interviews.</p>
        </div>
      ),
    },
    {
      id: "t-2",
      content: (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontWeight: 700, fontSize: 18 }}>"Cut my apply time by 70%"</p>
          <p style={{ opacity: 0.75 }}>Templates, snippets, and a tracking workflow that actually works.</p>
        </div>
      ),
    },
    {
      id: "t-3",
      content: (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontWeight: 700, fontSize: 18 }}>"The only tool I needed."</p>
          <p style={{ opacity: 0.75 }}>Replaced my spreadsheet, Notion docs, and Google Calendar reminders.</p>
        </div>
      ),
    },
  ]}
/>`,

	controlled: `const [idx, setIdx] = useState(0);

<Carousel
  ariaLabel="Controlled carousel"
  index={idx}
  onIndexChange={setIdx}
  slides={HERO_SLIDES}
/>`,
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
	name: "Default — hero slides",
	parameters: {
		docs: {
			description: {
				story:
					"Arrow + dot navigation, uncontrolled. Slides are centered content with gradient backgrounds.",
			},
			source: { code: SRC.default },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="JobDash feature highlights" />
		</div>
	),
};

export const Autoplay: Story = {
	name: "Autoplay — 3 s interval",
	parameters: {
		docs: {
			description: {
				story:
					"Slides advance every 3 s. Hover or focus pauses the timer. OS Reduce Motion disables autoplay entirely.",
			},
			source: { code: SRC.autoplay },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel
				slides={HERO_SLIDES}
				ariaLabel="Auto-advancing feature highlights"
				autoPlayInterval={3000}
			/>
		</div>
	),
};

export const NoArrows: Story = {
	name: "No arrows — dot navigation only",
	parameters: {
		docs: {
			description: {
				story: "Hides Prev/Next buttons. Useful when arrows would clash with content.",
			},
			source: { code: SRC.noArrows },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" showArrows={false} />
		</div>
	),
};

export const NoDots: Story = {
	name: "No dots — arrow navigation only",
	parameters: {
		docs: {
			description: { story: "Hides the dot tablist. Pair with autoplay or keyboard navigation." },
			source: { code: SRC.noDots },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" showDots={false} />
		</div>
	),
};

export const ImageSlides: Story = {
	name: "Image slides — arrows over image",
	parameters: {
		docs: {
			description: {
				story:
					"Arrow buttons float over the image edges. Correct for visual media where text overlap isn't a concern.",
			},
			source: { code: SRC.images },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={IMAGE_SLIDES} ariaLabel="Photo gallery" />
		</div>
	),
};

export const ContentSlides: Story = {
	name: "Content slides — testimonials",
	parameters: {
		docs: {
			description: {
				story:
					"Text content is centered. The slide reserves 64 px either side so text never overlaps the arrow buttons.",
			},
			source: { code: SRC.testimonials },
		},
	},
	render: () => (
		<div style={{ maxWidth: 560 }}>
			<Carousel slides={TESTIMONIALS} ariaLabel="Customer testimonials" autoPlayInterval={4000} />
		</div>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	globals: { backgrounds: { value: "#1c1917" } },
	parameters: {
		docs: {
			description: { story: "Arrow buttons and dots follow dark tokens." },
			source: { code: SRC.default },
		},
	},
	render: () => (
		<div style={{ maxWidth: 640 }}>
			<Carousel slides={HERO_SLIDES} ariaLabel="Feature highlights" />
		</div>
	),
};

export const ReducedMotion: Story = {
	name: "Reduced motion — no transition",
	parameters: {
		docs: {
			description: {
				story:
					"When OS Reduce Motion is active: autoplay never starts and the track transition is suppressed.",
			},
			source: { code: SRC.autoplay },
		},
	},
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

export const Controlled: Story = {
	name: "Controlled — parent owns index",
	parameters: {
		docs: {
			description: {
				story:
					"Pass `index` + `onIndexChange` to take full control of the active slide from a parent component.",
			},
			source: { code: SRC.controlled },
		},
	},
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
					{HERO_SLIDES.map((s, i) => (
						<button
							key={s.id}
							type="button"
							onClick={() => setIdx(i)}
							style={{
								padding: "4px 10px",
								fontSize: 12,
								borderRadius: 4,
								border: "1px solid var(--rule)",
								background: i === idx ? "var(--amber)" : "var(--surf-1)",
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
	args: {
		ariaLabel: "Playground carousel",
		showArrows: true,
		showDots: true,
		autoPlayInterval: 0,
		defaultIndex: 0,
	},
	parameters: {
		docs: {
			description: { story: "Toggle arrows, dots, and autoplay via the Controls panel." },
			source: { code: SRC.default },
		},
	},
	render: (args) => (
		<div style={{ maxWidth: 640 }}>
			<Carousel {...args} slides={HERO_SLIDES} />
		</div>
	),
};
