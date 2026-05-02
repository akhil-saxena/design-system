/* ═══ UNIVERSAL — Stat Cards, Skeleton Variants, Dividers, Kbd Shortcuts ═══ */

/* ─── Stat / KPI Cards ─── */
function StatCard({ label, value, change, changeDir, sparkData, accent }) {
	const up = changeDir === "up";
	const changeColor = up ? "var(--green)" : "var(--red)";
	const h = 28;
	const max = Math.max(...sparkData);
	const min = Math.min(...sparkData);
	const range = max - min || 1;
	const points = sparkData
		.map((v, i) => `${(i / (sparkData.length - 1)) * 80},${h - ((v - min) / range) * h}`)
		.join(" ");

	return (
		<div
			className="glass"
			style={{ padding: "18px 20px", borderRadius: 14, flex: 1, minWidth: 160 }}
		>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontSize: 9.5,
					letterSpacing: ".06em",
					textTransform: "uppercase",
					color: "var(--ink-4)",
					fontWeight: 600,
					marginBottom: 8,
				}}
			>
				{label}
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
					gap: 12,
				}}
			>
				<div>
					<div
						style={{
							fontFamily: "var(--display)",
							fontWeight: 800,
							fontSize: 28,
							letterSpacing: "-.02em",
							lineHeight: 1,
						}}
					>
						{value}
					</div>
					{change && (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 4,
								marginTop: 6,
								fontSize: 11,
								fontWeight: 600,
								color: changeColor,
							}}
						>
							<svg
								viewBox="0 0 24 24"
								width="12"
								height="12"
								fill="none"
								stroke={changeColor}
								strokeWidth="2.5"
								style={{ transform: up ? "" : "rotate(180deg)" }}
							>
								<polyline points="18 15 12 9 6 15" />
							</svg>
							{change}
						</div>
					)}
				</div>
				{sparkData && (
					<svg
						width="80"
						height={h}
						viewBox={`0 0 80 ${h}`}
						style={{ opacity: 0.5, flexShrink: 0 }}
					>
						<polyline
							points={points}
							fill="none"
							stroke={accent || "var(--amber)"}
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</div>
		</div>
	);
}

function StatCardsSection() {
	return (
		<DSSubsection title="Stat / KPI Cards">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
				Big number with trend indicator and optional sparkline. Use for dashboard overviews and
				at-a-glance metrics.
			</p>
			<div style={{ display: "flex", gap: 14 }}>
				<StatCard
					label="Applications"
					value="24"
					change="+12% this week"
					changeDir="up"
					sparkData={[4, 6, 5, 8, 10, 9, 12]}
					accent="var(--amber)"
				/>
				<StatCard
					label="Interviews"
					value="7"
					change="+3 scheduled"
					changeDir="up"
					sparkData={[1, 2, 1, 3, 2, 4, 3]}
					accent="var(--blue-vivid)"
				/>
				<StatCard
					label="Response Rate"
					value="62%"
					change="-4% vs last month"
					changeDir="down"
					sparkData={[70, 68, 65, 64, 66, 63, 62]}
					accent="var(--green-vivid)"
				/>
				<StatCard
					label="Avg. Time to Hear"
					value="6d"
					change="1d faster"
					changeDir="up"
					sparkData={[9, 8, 8, 7, 7, 6, 6]}
					accent="var(--purple-vivid)"
				/>
			</div>
		</DSSubsection>
	);
}

/* ─── Skeleton Variants ─── */
function SkeletonBlock({ w, h, r = 6 }) {
	return <div className="ds-skel" style={{ width: w, height: h, borderRadius: r }} />;
}

function SkeletonSection() {
	return (
		<DSSubsection title="Skeleton Loading States">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
				Placeholder shimmer while data loads. Card, row, profile, and stat variants.
			</p>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
				{/* Card skeleton */}
				<div className="glass" style={{ padding: 18, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 10,
						}}
					>
						CARD SKELETON
					</div>
					<div style={{ display: "flex", gap: 12 }}>
						<SkeletonBlock w={40} h={40} r={10} />
						<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
							<SkeletonBlock w="60%" h={12} />
							<SkeletonBlock w="80%" h={10} />
						</div>
					</div>
					<div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
						<SkeletonBlock w="100%" h={10} />
						<SkeletonBlock w="90%" h={10} />
						<SkeletonBlock w="40%" h={10} />
					</div>
					<div style={{ marginTop: 14, display: "flex", gap: 8 }}>
						<SkeletonBlock w={70} h={28} r={7} />
						<SkeletonBlock w={70} h={28} r={7} />
					</div>
				</div>

				{/* Table row skeleton */}
				<div className="glass" style={{ padding: 18, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 10,
						}}
					>
						TABLE ROW SKELETON
					</div>
					{[0, 1, 2, 3].map((i) => (
						<div
							key={i}
							style={{
								display: "flex",
								gap: 14,
								alignItems: "center",
								padding: "8px 0",
								borderBottom: "1px solid var(--rule)",
								opacity: 1 - i * 0.15,
							}}
						>
							<SkeletonBlock w={16} h={16} r={4} />
							<SkeletonBlock w={100} h={10} />
							<SkeletonBlock w={140} h={10} />
							<SkeletonBlock w={60} h={20} r={10} />
							<div style={{ marginLeft: "auto" }}>
								<SkeletonBlock w={50} h={10} />
							</div>
						</div>
					))}
				</div>

				{/* Profile skeleton */}
				<div className="glass" style={{ padding: 18, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 10,
						}}
					>
						PROFILE SKELETON
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 10,
							padding: 12,
						}}
					>
						<SkeletonBlock w={56} h={56} r={28} />
						<SkeletonBlock w={120} h={14} />
						<SkeletonBlock w={80} h={10} />
						<div style={{ display: "flex", gap: 8, marginTop: 4 }}>
							<SkeletonBlock w={60} h={24} r={12} />
							<SkeletonBlock w={60} h={24} r={12} />
							<SkeletonBlock w={60} h={24} r={12} />
						</div>
					</div>
				</div>

				{/* Stat skeleton */}
				<div className="glass" style={{ padding: 18, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 10,
						}}
					>
						STAT CARD SKELETON
					</div>
					<div style={{ display: "flex", gap: 12 }}>
						{[0, 1].map((i) => (
							<div
								key={i}
								style={{ flex: 1, padding: 14, borderRadius: 10, border: "1px solid var(--rule)" }}
							>
								<SkeletonBlock w={80} h={8} />
								<div style={{ marginTop: 10 }}>
									<SkeletonBlock w={60} h={24} r={4} />
								</div>
								<div style={{ marginTop: 8 }}>
									<SkeletonBlock w={100} h={8} />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</DSSubsection>
	);
}

/* ─── Dividers ─── */
function DividerSection() {
	return (
		<DSSubsection title="Dividers & Separators">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
				Horizontal rules, labeled dividers, and section breaks for content separation.
			</p>
			<div
				className="glass"
				style={{ padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 20 }}
			>
				{/* Simple */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						SOLID
					</div>
					<div style={{ height: 1, background: "var(--rule)" }} />
				</div>

				{/* Dashed */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						DASHED
					</div>
					<div style={{ borderBottom: "1px dashed var(--rule)" }} />
				</div>

				{/* Labeled center */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						LABELED (CENTER)
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-4)",
								fontWeight: 600,
								textTransform: "uppercase",
								letterSpacing: ".06em",
							}}
						>
							Or continue with
						</span>
						<div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
					</div>
				</div>

				{/* Labeled left */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						LABELED (LEFT)
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-4)",
								fontWeight: 600,
								textTransform: "uppercase",
								letterSpacing: ".06em",
							}}
						>
							Section title
						</span>
						<div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
					</div>
				</div>

				{/* Thick accent */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						ACCENT
					</div>
					<div
						style={{
							height: 2,
							background: "linear-gradient(90deg, var(--amber), transparent)",
							borderRadius: 1,
						}}
					/>
				</div>

				{/* Vertical */}
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
						}}
					>
						VERTICAL
					</div>
					<div style={{ display: "flex", gap: 16, alignItems: "center", height: 40 }}>
						<span style={{ fontSize: 12, color: "var(--ink-2)" }}>Item A</span>
						<div style={{ width: 1, height: "100%", background: "var(--rule)" }} />
						<span style={{ fontSize: 12, color: "var(--ink-2)" }}>Item B</span>
						<div style={{ width: 1, height: "100%", background: "var(--rule)" }} />
						<span style={{ fontSize: 12, color: "var(--ink-2)" }}>Item C</span>
					</div>
				</div>
			</div>
		</DSSubsection>
	);
}

/* ─── Keyboard Shortcuts ─── */
function KbdSection() {
	return (
		<DSSubsection title="Keyboard Shortcuts">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
				Kbd token component and a reference sheet pattern. Use in tooltips, menus, and standalone
				shortcut overlays.
			</p>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
				{/* Tokens */}
				<div className="glass" style={{ padding: 20, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 12,
						}}
					>
						KEY TOKENS
					</div>
					<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
						{[
							"⌘",
							"⇧",
							"⌥",
							"⌃",
							"Enter",
							"Esc",
							"Tab",
							"Space",
							"↑",
							"↓",
							"←",
							"→",
							"K",
							"N",
							"D",
						].map((k) => (
							<span key={k} className="ds-kbd" style={{ fontSize: 11, padding: "3px 8px" }}>
								{k}
							</span>
						))}
					</div>

					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 8,
							marginTop: 20,
						}}
					>
						COMBINATIONS
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						{[
							{ keys: ["⌘", "K"], label: "Search" },
							{ keys: ["⌘", "⇧", "D"], label: "Dark mode" },
							{ keys: ["⌘", "N"], label: "New application" },
						].map((c, i) => (
							<div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<div style={{ display: "flex", gap: 3 }}>
									{c.keys.map((k, j) => (
										<React.Fragment key={j}>
											<span className="ds-kbd" style={{ fontSize: 11, padding: "3px 7px" }}>
												{k}
											</span>
											{j < c.keys.length - 1 && (
												<span style={{ color: "var(--ink-5)", fontSize: 11, lineHeight: "22px" }}>
													+
												</span>
											)}
										</React.Fragment>
									))}
								</div>
								<span style={{ fontSize: 12, color: "var(--ink-2)" }}>{c.label}</span>
							</div>
						))}
					</div>
				</div>

				{/* Reference sheet */}
				<div className="glass" style={{ padding: 20, borderRadius: 14 }}>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 600,
							marginBottom: 12,
						}}
					>
						SHORTCUT REFERENCE
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						{[
							{
								section: "Navigation",
								shortcuts: [
									["⌘ K", "Search"],
									["⌘ /", "Command palette"],
									["G B", "Go to board"],
									["G C", "Go to calendar"],
								],
							},
							{
								section: "Actions",
								shortcuts: [
									["⌘ N", "New application"],
									["⌘ ⇧ D", "Toggle dark mode"],
									["→", "Advance stage"],
									["Del", "Archive"],
								],
							},
						].map((group, gi) => (
							<div key={gi} style={{ marginBottom: gi < 1 ? 16 : 0 }}>
								<div
									style={{
										fontFamily: "var(--mono)",
										fontSize: 9,
										color: "var(--amber-d)",
										fontWeight: 700,
										letterSpacing: ".06em",
										textTransform: "uppercase",
										marginBottom: 6,
									}}
								>
									{group.section}
								</div>
								{group.shortcuts.map(([key, desc], si) => (
									<div
										key={si}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "6px 0",
											borderBottom:
												si < group.shortcuts.length - 1 ? "1px dashed var(--rule)" : "none",
										}}
									>
										<span style={{ fontSize: 12, color: "var(--ink-2)" }}>{desc}</span>
										<span className="ds-kbd" style={{ fontSize: 10, padding: "2px 7px" }}>
											{key}
										</span>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</DSSubsection>
	);
}

function UniversalSection() {
	return (
		<div>
			<StatCardsSection />
			<SkeletonSection />
			<DividerSection />
			<KbdSection />
		</div>
	);
}

Object.assign(window, { UniversalSection });
