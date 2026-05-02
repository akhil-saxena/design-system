/* ═══ COVER / TITLE PAGE — system landing ═══ */

function CoverSection() {
	const counts = {
		sections: 53,
		tokens: "Tokens, type, motion, color",
		components: "Buttons, inputs, modals, sheets, grids",
		icons: typeof ICONS !== "undefined" ? ICONS.length : 120,
		illustrations: typeof ILLUST_LIST !== "undefined" ? ILLUST_LIST.length : 24,
	};

	const groups = [
		{
			name: "Foundation",
			count: 9,
			items: "Tokens, Type, Motion, Color, Icons, Illustrations, Responsive",
		},
		{ name: "Layout", count: 3, items: "App Bar, Footer, App Shell" },
		{ name: "Inputs", count: 5, items: "Buttons, Inputs, Controls, Date Picker, Chips" },
		{
			name: "Surfaces",
			count: 6,
			items: "Cards, Modals, Tooltips, Bottom Sheet, Lightbox, Confirms",
		},
		{
			name: "Data Display",
			count: 11,
			items: "Tables, Tabs, Grid, Calendar, RTE, Carousel, Accordion, Timeline",
		},
		{ name: "Feedback", count: 2, items: "Toasts & Progress, Avatars & Presence" },
		{
			name: "Navigation",
			count: 5,
			items: "Sidebar/Tree, Wizard, Empty States, Notifications, Search",
		},
		{
			name: "Interaction",
			count: 5,
			items: "Sheets, Editable, Click-to-Copy, Hover Cards, Drag & Drop",
		},
		{ name: "Universal", count: 5, items: "Stats, Coach Marks, Media, Validation, Breadcrumbs" },
		{ name: "Advanced", count: 2, items: "Command Palette, Patterns & Flows" },
	];

	return (
		<div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 12 }}>
			{/* Hero */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 220px",
					gap: 40,
					alignItems: "start",
					marginBottom: 56,
				}}
			>
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--amber-d)",
							letterSpacing: ".18em",
							textTransform: "uppercase",
							fontWeight: 700,
							marginBottom: 16,
						}}
					>
						JobDash · Design System · v1.0
					</div>
					<h1
						style={{
							fontFamily: "var(--display)",
							fontSize: 64,
							fontWeight: 900,
							letterSpacing: "-.03em",
							lineHeight: 1,
							color: "var(--ink)",
							marginBottom: 20,
							textWrap: "balance",
						}}
					>
						One system.
						<br />
						Every screen.
					</h1>
					<p
						style={{
							fontSize: 17,
							color: "var(--ink-2)",
							lineHeight: 1.55,
							maxWidth: 560,
							textWrap: "pretty",
						}}
					>
						A complete kit for building JobDash — tokens, components, patterns, icons, and motion.
						Built to be opinionated where it matters, flexible where it counts.
					</p>
					<div style={{ display: "flex", gap: 10, marginTop: 28 }}>
						<span className="ds-btn dark" style={{ padding: "10px 18px", fontSize: 13 }}>
							Start with Tokens
						</span>
						<span className="ds-btn" style={{ padding: "10px 18px", fontSize: 13 }}>
							Browse Components
						</span>
					</div>
				</div>

				{/* Logo mark */}
				<div
					style={{
						aspectRatio: "1",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg viewBox="0 0 200 200" width="180" height="180">
						<defs>
							<pattern id="cover-dots" width="12" height="12" patternUnits="userSpaceOnUse">
								<circle cx="2" cy="2" r="1" fill="rgba(41,37,36,.18)" />
							</pattern>
						</defs>
						<rect
							x="10"
							y="10"
							width="180"
							height="180"
							rx="20"
							fill="url(#cover-dots)"
							stroke="var(--ink)"
							strokeWidth="2"
						/>
						<rect x="30" y="30" width="140" height="140" rx="14" fill="var(--amber)" />
						<text
							x="100"
							y="120"
							textAnchor="middle"
							fontFamily="var(--display)"
							fontSize="64"
							fontWeight="900"
							fill="var(--ink)"
						>
							JD
						</text>
						<circle cx="160" cy="40" r="8" fill="var(--red)" stroke="var(--ink)" strokeWidth="2" />
					</svg>
				</div>
			</div>

			{/* Stats strip */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: 0,
					border: "1px solid var(--rule)",
					borderRadius: 14,
					overflow: "hidden",
					marginBottom: 56,
					background: "var(--surf-1)",
				}}
			>
				{[
					{ k: "53", l: "Sections" },
					{ k: `${counts.icons}+`, l: "Icons" },
					{ k: counts.illustrations.toString(), l: "Illustrations" },
					{ k: "10", l: "Groups" },
				].map((s, i) => (
					<div
						key={i}
						style={{ padding: "24px 22px", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}
					>
						<div
							style={{
								fontFamily: "var(--display)",
								fontSize: 38,
								fontWeight: 800,
								lineHeight: 1,
								color: "var(--ink)",
								letterSpacing: "-.02em",
							}}
						>
							{s.k}
						</div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 600,
								marginTop: 6,
							}}
						>
							{s.l}
						</div>
					</div>
				))}
			</div>

			{/* What's inside */}
			<div style={{ marginBottom: 56 }}>
				<h2
					style={{
						fontFamily: "var(--display)",
						fontSize: 13,
						fontWeight: 700,
						color: "var(--ink-3)",
						letterSpacing: ".08em",
						textTransform: "uppercase",
						marginBottom: 18,
					}}
				>
					What's inside
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
					{groups.map((g) => (
						<div
							key={g.name}
							style={{
								display: "grid",
								gridTemplateColumns: "90px 36px 1fr",
								gap: 14,
								padding: "14px 16px",
								border: "1px solid var(--rule)",
								borderRadius: 10,
								background: "var(--surf-1)",
								alignItems: "center",
							}}
						>
							<div
								style={{
									fontFamily: "var(--display)",
									fontSize: 14,
									fontWeight: 700,
									color: "var(--ink)",
								}}
							>
								{g.name}
							</div>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 11,
									fontWeight: 700,
									color: "var(--amber-d)",
									textAlign: "right",
								}}
							>
								{g.count}
							</div>
							<div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>
								{g.items}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Principles */}
			<div style={{ marginBottom: 56 }}>
				<h2
					style={{
						fontFamily: "var(--display)",
						fontSize: 13,
						fontWeight: 700,
						color: "var(--ink-3)",
						letterSpacing: ".08em",
						textTransform: "uppercase",
						marginBottom: 18,
					}}
				>
					Principles
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
					{[
						{
							n: "01",
							t: "Calm by default",
							d: "Cream backgrounds, ink text, amber only when something needs attention. The interface should feel like a notebook, not a dashboard.",
						},
						{
							n: "02",
							t: "Editorial type",
							d: "Archivo for display, system sans for body, JetBrains Mono for data and labels. Use weight, not color, to create hierarchy.",
						},
						{
							n: "03",
							t: "Considered motion",
							d: "120–280ms, custom easing, never gratuitous. Animation explains state changes; it never decorates them.",
						},
					].map((p) => (
						<div
							key={p.n}
							style={{
								padding: 18,
								border: "1px solid var(--rule)",
								borderRadius: 12,
								background: "var(--surf-1)",
							}}
						>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 10,
									color: "var(--amber-d)",
									fontWeight: 700,
									letterSpacing: ".1em",
									marginBottom: 10,
								}}
							>
								{p.n}
							</div>
							<div
								style={{
									fontFamily: "var(--display)",
									fontSize: 18,
									fontWeight: 700,
									color: "var(--ink)",
									marginBottom: 8,
								}}
							>
								{p.t}
							</div>
							<div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{p.d}</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick swatches */}
			<div style={{ marginBottom: 32 }}>
				<h2
					style={{
						fontFamily: "var(--display)",
						fontSize: 13,
						fontWeight: 700,
						color: "var(--ink-3)",
						letterSpacing: ".08em",
						textTransform: "uppercase",
						marginBottom: 18,
					}}
				>
					At a glance
				</h2>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(8, 1fr)",
						gap: 6,
						marginBottom: 14,
					}}
				>
					{[
						["cream", "#f5f3f0"],
						["cream-2", "#ece8e3"],
						["cream-3", "#e7e2dc"],
						["amber", "#f59e0b"],
						["amber-d", "#b45309"],
						["ink", "#292524"],
						["ink-2", "#57534e"],
						["ink-3", "#6b6560"],
					].map(([n, h]) => (
						<div
							key={n}
							style={{
								aspectRatio: "1.2",
								borderRadius: 8,
								background: h,
								border: "1px solid rgba(0,0,0,.06)",
								position: "relative",
							}}
						>
							<div
								style={{
									position: "absolute",
									bottom: 6,
									left: 8,
									fontFamily: "var(--mono)",
									fontSize: 9,
									fontWeight: 700,
									color: ["ink", "ink-2", "ink-3", "amber-d"].includes(n) ? "#fff" : "#292524",
								}}
							>
								{n}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					borderTop: "1px solid var(--rule)",
					paddingTop: 18,
					display: "flex",
					justifyContent: "space-between",
					fontFamily: "var(--mono)",
					fontSize: 10.5,
					color: "var(--ink-4)",
					letterSpacing: ".05em",
				}}
			>
				<div>JobDash Design System · v1.0 · {new Date().getFullYear()}</div>
				<div>Built for product teams · Ship faster, ship together</div>
			</div>
		</div>
	);
}

Object.assign(window, { CoverSection });
