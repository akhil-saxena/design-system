const MONO = "'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace";
const DISPLAY = "'Archivo', system-ui, sans-serif";
const SANS = "'Inter', system-ui, sans-serif";

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

function CodeBlock({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				background: "#0a0a0a",
				borderRadius: 8,
				padding: "10px 14px",
				fontFamily: MONO,
				fontSize: 13,
				lineHeight: 1.7,
				color: "#f5f3f0",
			}}
		>
			{children}
		</div>
	);
}

function StepLabel({ n, label }: { n: number; label: string }) {
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
					color: "#a8a29e",
				}}
			>
				{label}
			</span>
		</div>
	);
}

export function OverviewPage() {
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
					background: "#1c1917",
					borderRadius: 14,
					padding: "44px 48px 48px",
					marginBottom: 40,
				}}
			>
				<div
					style={{
						fontFamily: DISPLAY,
						fontWeight: 800,
						fontSize: 72,
						letterSpacing: "-0.04em",
						lineHeight: 0.92,
						color: "#f5f3f0",
						marginBottom: 24,
					}}
				>
					Design
					<br />
					System
				</div>
				<div
					style={{
						fontSize: 15,
						color: "#a8a29e",
						lineHeight: 1.7,
						maxWidth: 480,
						marginBottom: 36,
					}}
				>
					A collection of reusable React components built on a consistent token system. Click any
					component below to open its docs.
				</div>

				<div
					style={{
						borderTop: "1px solid #292524",
						paddingTop: 32,
						display: "flex",
						flexDirection: "column",
						gap: 20,
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 11,
							fontWeight: 600,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "#57534e",
							marginBottom: 4,
						}}
					>
						Installation · GitHub Packages
					</div>

					<div>
						<StepLabel n={1} label="Authenticate with GitHub Packages" />
						<CodeBlock>
							<span style={{ color: "#57534e" }}># ~/.npmrc</span>
							<br />
							{"@akhil-saxena:registry=https://npm.pkg.github.com"}
							<br />
							{"//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN"}
						</CodeBlock>
					</div>

					<div>
						<StepLabel n={2} label="Install" />
						<CodeBlock>
							<span style={{ color: "#f59e0b" }}>npm</span>
							{" install @akhil-saxena/design-system"}
						</CodeBlock>
					</div>

					<div>
						<StepLabel n={3} label="Import styles in your app entry" />
						<CodeBlock>
							<span style={{ color: "#a78bfa" }}>import</span>
							{" '@akhil-saxena/design-system/tokens.css';"}
							<br />
							<span style={{ color: "#a78bfa" }}>import</span>
							{" '@akhil-saxena/design-system/primitives.css';"}
						</CodeBlock>
					</div>

					<div>
						<StepLabel n={4} label="Use components" />
						<CodeBlock>
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
							background: "#f5f3f0",
							border: "1px solid #e7e2dc",
						}}
					>
						<div
							style={{
								fontFamily: MONO,
								fontSize: 10,
								fontWeight: 600,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "#78716c",
								marginBottom: 14,
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							{name}
							<span
								style={{
									background: "#e7e2dc",
									color: "#78716c",
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
										style={{
											display: "block",
											fontSize: 13,
											color: "#57534e",
											textDecoration: "none",
											padding: "3px 6px",
											borderRadius: 5,
											margin: "0 -6px",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = "#e7e2dc";
											e.currentTarget.style.color = "#1c1917";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = "transparent";
											e.currentTarget.style.color = "#57534e";
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
