import { addons } from "@storybook/preview-api";
import { useEffect, useState } from "react";

const MONO = "'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace";
const DISPLAY = "'Archivo', system-ui, sans-serif";
const SANS = "'Inter', system-ui, sans-serif";
const DARK_BG = "#1c1917";
const AMBER = "#f59e0b";

// ─── Theme ────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof makeTokens>;

function makeTokens(isDark: boolean) {
	const d = (dark: string, light: string) => (isDark ? dark : light);
	return {
		heroBg: d("#1c1917", "#ffffff"),
		heroBorder: d("1px solid #292524", "1px solid #e7e2dc"),
		heroTitle: d("#f5f3f0", "#292524"),
		heroSub: d("#a8a29e", "#6b6560"),
		divider: d("#292524", "#e7e2dc"),
		codeComment: d("#44403c", "#a8a29e"),
		codeBg: d("#0a0a0a", "#f5f3f0"),
		codeFg: d("#f5f3f0", "#292524"),
		statBg: d("#1c1917", "#ffffff"),
		statBorder: d("1px solid #292524", "1px solid #e7e2dc"),
		statNum: d("#f5f3f0", "#292524"),
		statLabel: d("#57534e", "#a8a29e"),
		gridBg: d("#1c1917", "#ffffff"),
		gridBorder: d("1px solid #292524", "1px solid #e7e2dc"),
		gridName: d("#f5f3f0", "#292524"),
		gridList: d("#78716c", "#6b6560"),
		princBg: d("#1c1917", "#ffffff"),
		princBorder: d("1px solid #292524", "1px solid #e7e2dc"),
		princTitle: d("#f5f3f0", "#292524"),
		princBody: d("#a8a29e", "#6b6560"),
		swatchBorder: d("transparent", "#e7e2dc"),
		swatchLabel: d("#57534e", "#a8a29e"),
		cardPillBg: d("#292524", "#e7e2dc"),
		cardHoverBg: d("#292524", "#e7e2dc"),
		cardHoverFg: d("#f5f3f0", "#1c1917"),
		sectionHead: d("#44403c", "#a8a29e"),
	};
}

// ─── Dark mode hook ───────────────────────────────────────────────────────────

type GlobalsPayload = { globals: Record<string, unknown> };

function isDarkGlobals(globals: Record<string, unknown>) {
	return (
		globals.theme === "dark" ||
		(globals.backgrounds as { value?: string } | undefined)?.value === DARK_BG
	);
}

function useDarkMode() {
	const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
	useEffect(() => {
		const channel = addons.getChannel();
		const onGlobalsUpdated = ({ globals }: GlobalsPayload) => {
			const dark = isDarkGlobals(globals);
			document.documentElement.classList.toggle("dark", dark);
			setIsDark(dark);
		};
		channel.on("globalsUpdated", onGlobalsUpdated);
		return () => channel.off("globalsUpdated", onGlobalsUpdated);
	}, []);
	return isDark;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
	{
		name: "Inputs",
		id: "inputs",
		components: [
			"Autocomplete",
			"Badge",
			"Button",
			"Checkbox",
			"Chip",
			"DatePicker",
			"DateRangePicker",
			"MultiSelect",
			"NumberStepper",
			"Radio",
			"RangeSlider",
			"Select",
			"StarRating",
			"TextInput",
			"Textarea",
			"Toggle",
		],
	},
	{
		name: "Overlays",
		id: "overlays",
		components: [
			"BottomSheet",
			"Card",
			"HoverCard",
			"Lightbox",
			"Modal",
			"Popover",
			"Sheet",
			"StickyNote",
			"Tooltip",
		],
	},
	{
		name: "Data Display",
		id: "data-display",
		components: [
			"Accordion",
			"Breadcrumbs",
			"Calendar",
			"Carousel",
			"InfiniteList",
			"SegmentedControl",
			"Table",
			"Tabs",
			"Timeline",
		],
	},
	{
		name: "Feedback",
		id: "feedback",
		components: ["AlertBanner", "EmptyState", "InlineConfirm", "ProgressBar", "Skeleton", "Toast"],
	},
	{
		name: "Interaction",
		id: "interaction",
		components: [
			"CopyToClipboard",
			"InlineEdit",
			"RichText",
			"SearchAndFilters",
			"Sortable",
			"SplitButton",
		],
	},
	{ name: "Layout", id: "layout", components: ["AppBar", "AppShell", "Footer"] },
	{ name: "Display", id: "display", components: ["Avatar", "RollingNumber"] },
	{ name: "Patterns", id: "patterns", components: ["Coachmark", "FormValidation", "Wizard"] },
	{ name: "Foundation", id: "foundation", components: ["TokenCheck"] },
];

const componentStoryId = (categoryId: string, name: string) =>
	`${categoryId}-${name.toLowerCase().replaceAll(" ", "")}`;

const TOTAL = categories.reduce((s, c) => s + c.components.length, 0);

const SWATCHES = [
	{ name: "cream", value: "#f5f3f0", light: true },
	{ name: "cream-2", value: "#ece8e3", light: true },
	{ name: "cream-3", value: "#e7e2dc", light: true },
	{ name: "amber", value: "#f59e0b", light: false },
	{ name: "amber-d", value: "#b45309", light: false },
	{ name: "ink", value: "#292524", light: false },
	{ name: "ink-2", value: "#57534e", light: false },
	{ name: "ink-3", value: "#6b6560", light: false },
];

const PRINCIPLES = [
	{
		n: "01",
		title: "Calm by default",
		body: "Cream backgrounds, ink text, amber only when something needs attention. The interface should feel like a notebook, not a dashboard.",
	},
	{
		n: "02",
		title: "Editorial type",
		body: "Archivo for display, system sans for body, JetBrains Mono for data and labels. Use weight, not color, to create hierarchy.",
	},
	{
		n: "03",
		title: "Considered motion",
		body: "120–280ms, custom easing, never gratuitous. Animation explains state changes — it never decorates them.",
	},
];

const INSTALL_STEPS = [
	{
		n: 1,
		label: "Install",
		code: () => (
			<>
				<span style={{ color: AMBER }}>npm</span>
				{" install @akhil-saxena/design-system"}
			</>
		),
	},
	{
		n: 2,
		label: "Import styles",
		code: () => (
			<>
				<span style={{ color: "#a78bfa" }}>import</span>
				{" '@akhil-saxena/design-system/tokens.css';"}
				<br />
				<span style={{ color: "#a78bfa" }}>import</span>
				{" '@akhil-saxena/design-system/primitives.css';"}
			</>
		),
	},
	{
		n: 3,
		label: "Use components",
		code: () => (
			<>
				<span style={{ color: "#a78bfa" }}>import</span>
				{" { Button } "}
				<span style={{ color: "#a78bfa" }}>from</span>
				{" '@akhil-saxena/design-system';"}
			</>
		),
	},
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, color }: Readonly<{ label: string; color: string }>) {
	return (
		<div
			style={{
				fontFamily: MONO,
				fontSize: 11,
				fontWeight: 700,
				letterSpacing: "0.1em",
				textTransform: "uppercase",
				color,
				marginBottom: 16,
			}}
		>
			{label}
		</div>
	);
}

function HeroInstall({ t }: Readonly<{ t: T }>) {
	return (
		<div
			style={{
				borderTop: `1px solid ${t.divider}`,
				paddingTop: 28,
				display: "flex",
				flexDirection: "column",
				gap: 16,
			}}
		>
			<div
				style={{
					fontFamily: MONO,
					fontSize: 11,
					fontWeight: 600,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					color: t.codeComment,
				}}
			>
				Installation · npm
			</div>
			{INSTALL_STEPS.map(({ n, label, code }) => (
				<div key={n}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
						<span
							style={{
								fontFamily: MONO,
								fontSize: 10,
								fontWeight: 700,
								color: AMBER,
								background: "rgba(245,158,11,0.15)",
								borderRadius: 99,
								padding: "2px 8px",
							}}
						>
							{n}
						</span>
						<span style={{ fontFamily: MONO, fontSize: 12, color: t.heroSub }}>{label}</span>
					</div>
					<div
						style={{
							background: t.codeBg,
							borderRadius: 8,
							padding: "10px 14px",
							fontFamily: MONO,
							fontSize: 13,
							lineHeight: 1.7,
							color: t.codeFg,
							transition: "background 0.2s, color 0.2s",
						}}
					>
						{code()}
					</div>
				</div>
			))}
		</div>
	);
}

function StatsStrip({ t }: Readonly<{ t: T }>) {
	const stats = [
		{ value: TOTAL, label: "Components" },
		{ value: categories.length, label: "Categories" },
		{ value: 3, label: "Patterns" },
		{ value: "1.1.0", label: "Version" },
	] as const;
	return (
		<div
			style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 48 }}
		>
			{stats.map(({ value, label }) => (
				<div
					key={label}
					style={{
						background: t.statBg,
						border: t.statBorder,
						borderRadius: 12,
						padding: "20px 24px",
						transition: "background 0.2s",
					}}
				>
					<div
						style={{
							fontFamily: DISPLAY,
							fontWeight: 800,
							fontSize: 36,
							letterSpacing: "-0.03em",
							color: t.statNum,
							lineHeight: 1,
						}}
					>
						{value}
					</div>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 10,
							fontWeight: 600,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: t.statLabel,
							marginTop: 6,
						}}
					>
						{label}
					</div>
				</div>
			))}
		</div>
	);
}

function InsideGrid({ t }: Readonly<{ t: T }>) {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 48 }}>
			{categories.map(({ name, id, components }) => (
				<div
					key={name}
					style={{
						background: t.gridBg,
						border: t.gridBorder,
						borderRadius: 10,
						padding: "16px 20px 18px",
						transition: "background 0.2s",
					}}
				>
					<div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
						<div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: t.gridName }}>
							{name}
						</div>
						<div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: AMBER }}>
							{components.length}
						</div>
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
						{components.map((label) => (
							<a
								key={label}
								href={`/?path=/docs/${componentStoryId(id, label)}--docs`}
								target="_parent"
								style={{
									fontSize: 12,
									color: t.gridList,
									textDecoration: "none",
									background: t.cardPillBg,
									borderRadius: 5,
									padding: "2px 7px",
									transition: "background 0.15s, color 0.15s",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = t.cardHoverBg;
									e.currentTarget.style.color = t.cardHoverFg;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = t.cardPillBg;
									e.currentTarget.style.color = t.gridList;
								}}
							>
								{label}
							</a>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function PrinciplesGrid({ t }: Readonly<{ t: T }>) {
	return (
		<div
			style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 48 }}
		>
			{PRINCIPLES.map(({ n, title, body }) => (
				<div
					key={n}
					style={{
						background: t.princBg,
						border: t.princBorder,
						borderRadius: 12,
						padding: "22px 24px 26px",
						transition: "background 0.2s",
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 11,
							fontWeight: 700,
							color: AMBER,
							marginBottom: 10,
						}}
					>
						{n}
					</div>
					<div
						style={{
							fontFamily: DISPLAY,
							fontWeight: 700,
							fontSize: 15,
							color: t.princTitle,
							marginBottom: 8,
							letterSpacing: "-0.01em",
						}}
					>
						{title}
					</div>
					<div style={{ fontSize: 13, color: t.princBody, lineHeight: 1.65 }}>{body}</div>
				</div>
			))}
		</div>
	);
}

function SwatchRow({ t }: Readonly<{ t: T }>) {
	return (
		<div style={{ display: "flex", gap: 10, marginBottom: 56, flexWrap: "wrap" }}>
			{SWATCHES.map(({ name, value, light }) => (
				<div
					key={name}
					style={{ flex: "1 1 72px", display: "flex", flexDirection: "column", gap: 6 }}
				>
					<div
						style={{
							height: 60,
							borderRadius: 8,
							background: value,
							border: light ? `1px solid ${t.swatchBorder}` : "none",
						}}
					/>
					<div style={{ fontFamily: MONO, fontSize: 10, color: t.swatchLabel }}>{name}</div>
				</div>
			))}
		</div>
	);
}

// ─── OverviewPage ─────────────────────────────────────────────────────────────

export function OverviewPage() {
	const isDark = useDarkMode();
	const t = makeTokens(isDark);

	return (
		<div style={{ fontFamily: SANS, color: t.heroTitle, maxWidth: 960, padding: "8px 0 80px" }}>
			{/* Hero */}
			<div
				style={{
					background: t.heroBg,
					border: t.heroBorder,
					borderRadius: 14,
					padding: "44px 48px 48px",
					marginBottom: 12,
					transition: "background 0.2s",
				}}
			>
				<div
					style={{
						fontFamily: MONO,
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.1em",
						textTransform: "uppercase",
						color: AMBER,
						marginBottom: 20,
					}}
				>
					@akhil-saxena · design system · v1.1.0
				</div>
				<div
					style={{
						fontFamily: DISPLAY,
						fontWeight: 800,
						fontSize: 64,
						letterSpacing: "-0.04em",
						lineHeight: 0.95,
						color: t.heroTitle,
						marginBottom: 20,
					}}
				>
					{TOTAL} components.
					<br />
					One system.
				</div>
				<div
					style={{
						fontSize: 15,
						color: t.heroSub,
						lineHeight: 1.7,
						maxWidth: 480,
						marginBottom: 36,
					}}
				>
					A complete kit for building React UIs — tokens, primitives, patterns, and interactions.
					Consistent where it matters, flexible where it counts.
				</div>
				<HeroInstall t={t} />
			</div>

			<StatsStrip t={t} />

			<SectionLabel label="What's inside" color={t.sectionHead} />
			<InsideGrid t={t} />

			<SectionLabel label="Principles" color={t.sectionHead} />
			<PrinciplesGrid t={t} />

			<SectionLabel label="At a glance" color={t.sectionHead} />
			<SwatchRow t={t} />
		</div>
	);
}
