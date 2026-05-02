import { addons } from "@storybook/preview-api";
import { useEffect, useState } from "react";

const MONO = "'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace";
const DISPLAY = "'Archivo', system-ui, sans-serif";
const SANS = "'Inter', system-ui, sans-serif";

const DARK_BG = "#1c1917";

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
		// On a docs-only page the decorator never runs, so we listen to the
		// Storybook channel directly and apply the dark class ourselves.
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

const categories = [
	{
		name: "Inputs",
		components: [
			["Autocomplete", "inputs-autocomplete"],
			["Badge", "inputs-badge"],
			["Button", "inputs-button"],
			["Checkbox", "inputs-checkbox"],
			["Chip", "inputs-chip"],
			["DatePicker", "inputs-datepicker"],
			["DateRangePicker", "inputs-daterangepicker"],
			["MultiSelect", "inputs-multiselect"],
			["NumberStepper", "inputs-numberstepper"],
			["Radio", "inputs-radio"],
			["RangeSlider", "inputs-rangeslider"],
			["Select", "inputs-select"],
			["StarRating", "inputs-starrating"],
			["TextInput", "inputs-textinput"],
			["Textarea", "inputs-textarea"],
			["Toggle", "inputs-toggle"],
		],
	},
	{
		name: "Overlays",
		components: [
			["BottomSheet", "overlays-bottomsheet"],
			["Card", "overlays-card"],
			["HoverCard", "overlays-hovercard"],
			["Lightbox", "overlays-lightbox"],
			["Modal", "overlays-modal"],
			["Popover", "overlays-popover"],
			["Sheet", "overlays-sheet"],
			["StickyNote", "overlays-stickynote"],
			["Tooltip", "overlays-tooltip"],
		],
	},
	{
		name: "Data Display",
		components: [
			["Accordion", "data-display-accordion"],
			["Breadcrumbs", "data-display-breadcrumbs"],
			["Calendar", "data-display-calendar"],
			["Carousel", "data-display-carousel"],
			["InfiniteList", "data-display-infinitelist"],
			["SegmentedControl", "data-display-segmentedcontrol"],
			["Table", "data-display-table"],
			["Tabs", "data-display-tabs"],
			["Timeline", "data-display-timeline"],
		],
	},
	{
		name: "Feedback",
		components: [
			["AlertBanner", "feedback-alertbanner"],
			["EmptyState", "feedback-emptystate"],
			["InlineConfirm", "feedback-inlineconfirm"],
			["ProgressBar", "feedback-progressbar"],
			["Skeleton", "feedback-skeleton"],
			["Toast", "feedback-toast"],
		],
	},
	{
		name: "Interaction",
		components: [
			["CopyToClipboard", "interaction-copytoclipboard"],
			["InlineEdit", "interaction-inlineedit"],
			["RichText", "interaction-richtext"],
			["SearchAndFilters", "interaction-searchandfilters"],
			["Sortable", "interaction-sortable"],
			["SplitButton", "interaction-splitbutton"],
		],
	},
	{
		name: "Layout",
		components: [
			["AppBar", "layout-appbar"],
			["AppShell", "layout-appshell"],
			["Footer", "layout-footer"],
		],
	},
	{
		name: "Display",
		components: [
			["Avatar", "display-avatar"],
			["RollingNumber", "display-rollingnumber"],
		],
	},
	{
		name: "Patterns",
		components: [
			["Coachmark", "patterns-coachmark"],
			["FormValidation", "patterns-formvalidation"],
			["Wizard", "patterns-wizard"],
		],
	},
	{
		name: "Foundation",
		components: [["TokenCheck", "foundation-tokencheck"]],
	},
];

function CodeBlock({
	children,
	bg,
	fg,
}: Readonly<{ children: React.ReactNode; bg: string; fg: string }>) {
	return (
		<div
			style={{
				background: bg,
				borderRadius: 8,
				padding: "10px 14px",
				fontFamily: MONO,
				fontSize: 13,
				lineHeight: 1.7,
				color: fg,
				transition: "background 0.2s, color 0.2s",
			}}
		>
			{children}
		</div>
	);
}

function StepLabel({ n, label, isDark }: Readonly<{ n: number; label: string; isDark: boolean }>) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				marginBottom: 8,
			}}
		>
			<span
				style={{
					fontFamily: MONO,
					fontSize: 10,
					fontWeight: 700,
					color: "#f59e0b",
					background: "rgba(245,158,11,0.15)",
					borderRadius: 99,
					padding: "2px 8px",
				}}
			>
				{n}
			</span>
			<span
				style={{
					fontFamily: MONO,
					fontSize: 12,
					color: isDark ? "#a8a29e" : "#78716c",
				}}
			>
				{label}
			</span>
		</div>
	);
}

export function OverviewPage() {
	const isDark = useDarkMode();

	const hero = {
		bg: isDark ? "#1c1917" : "#ffffff",
		border: isDark ? "none" : "1px solid #e7e2dc",
		title: isDark ? "#f5f3f0" : "#1c1917",
		subtitle: isDark ? "#a8a29e" : "#78716c",
		divider: isDark ? "#292524" : "#e7e2dc",
		sectionLabel: isDark ? "#57534e" : "#a8a29e",
		codeBg: isDark ? "#0a0a0a" : "#f5f3f0",
		codeText: isDark ? "#f5f3f0" : "#1c1917",
		codeComment: isDark ? "#57534e" : "#a8a29e",
	};

	const card = {
		bg: isDark ? "#292524" : "#f5f3f0",
		border: isDark ? "1px solid #44403c" : "1px solid #e7e2dc",
		label: isDark ? "#a8a29e" : "#78716c",
		pillBg: isDark ? "#44403c" : "#e7e2dc",
		pillFg: isDark ? "#a8a29e" : "#78716c",
		linkFg: isDark ? "#d6d3d1" : "#57534e",
		linkHoverBg: isDark ? "#44403c" : "#e7e2dc",
		linkHoverFg: isDark ? "#f5f3f0" : "#1c1917",
	};

	return (
		<div
			style={{
				fontFamily: SANS,
				color: "#1c1917",
				maxWidth: 900,
				padding: "8px 0 64px",
			}}
		>
			{/* ── Hero ──────────────────────────────────────────────── */}
			<div
				style={{
					background: hero.bg,
					border: hero.border,
					borderRadius: 14,
					padding: "44px 48px 48px",
					marginBottom: 40,
					transition: "background 0.2s, border-color 0.2s",
				}}
			>
				<div
					style={{
						fontFamily: DISPLAY,
						fontWeight: 800,
						fontSize: 72,
						letterSpacing: "-0.04em",
						lineHeight: 0.92,
						color: hero.title,
						marginBottom: 24,
						transition: "color 0.2s",
					}}
				>
					Design
					<br />
					System
				</div>
				<div
					style={{
						fontSize: 15,
						color: hero.subtitle,
						lineHeight: 1.7,
						maxWidth: 480,
						marginBottom: 36,
						transition: "color 0.2s",
					}}
				>
					A collection of reusable React components built on a consistent token system. Click any
					component below to open its docs.
				</div>

				<div
					style={{
						borderTop: `1px solid ${hero.divider}`,
						paddingTop: 32,
						display: "flex",
						flexDirection: "column",
						gap: 20,
						transition: "border-color 0.2s",
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 11,
							fontWeight: 600,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: hero.sectionLabel,
							marginBottom: 4,
						}}
					>
						Installation · npm
					</div>

					<div>
						<StepLabel n={1} label="Install" isDark={isDark} />
						<CodeBlock bg={hero.codeBg} fg={hero.codeText}>
							<span style={{ color: "#f59e0b" }}>npm</span>
							{" install @akhil-saxena/design-system"}
						</CodeBlock>
					</div>

					<div>
						<StepLabel n={2} label="Import styles in your app entry" isDark={isDark} />
						<CodeBlock bg={hero.codeBg} fg={hero.codeText}>
							<span style={{ color: "#a78bfa" }}>import</span>
							{" '@akhil-saxena/design-system/tokens.css';"}
							<br />
							<span style={{ color: "#a78bfa" }}>import</span>
							{" '@akhil-saxena/design-system/primitives.css';"}
						</CodeBlock>
					</div>

					<div>
						<StepLabel n={3} label="Use components" isDark={isDark} />
						<CodeBlock bg={hero.codeBg} fg={hero.codeText}>
							<span style={{ color: "#a78bfa" }}>import</span>
							{" { Button, TextInput } "}
							<span style={{ color: "#a78bfa" }}>from</span>
							{" '@akhil-saxena/design-system';"}
						</CodeBlock>
					</div>
				</div>
			</div>

			{/* ── Component grid ────────────────────────────────────── */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
					gap: 12,
				}}
			>
				{categories.map(({ name, components }) => (
					<div
						key={name}
						style={{
							padding: "18px 20px 20px",
							borderRadius: 10,
							background: card.bg,
							border: card.border,
							transition: "background 0.2s, border-color 0.2s",
						}}
					>
						<div
							style={{
								fontFamily: MONO,
								fontSize: 10,
								fontWeight: 600,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: card.label,
								marginBottom: 14,
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							{name}
							<span
								style={{
									background: card.pillBg,
									color: card.pillFg,
									borderRadius: 99,
									padding: "1px 6px",
									fontSize: 9,
								}}
							>
								{components.length}
							</span>
						</div>
						<ul
							style={{
								margin: 0,
								padding: 0,
								listStyle: "none",
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							{components.map(([label, id]) => (
								<li key={id}>
									<a
										href={`?path=/docs/${id}--docs`}
										target="_parent"
										style={{
											display: "block",
											fontSize: 13,
											color: card.linkFg,
											textDecoration: "none",
											padding: "3px 6px",
											borderRadius: 5,
											margin: "0 -6px",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = card.linkHoverBg;
											e.currentTarget.style.color = card.linkHoverFg;
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = "transparent";
											e.currentTarget.style.color = card.linkFg;
										}}
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
