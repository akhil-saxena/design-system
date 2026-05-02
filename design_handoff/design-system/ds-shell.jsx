/* ═══ APP SHELL LAYOUT ═══ */

function ShellMock({ width, sidebarCollapsed = false, mode = "desktop" }) {
	const showSidebar = mode === "desktop" || mode === "tablet";
	const sidebarWidth = sidebarCollapsed ? 56 : 200;

	return (
		<div
			style={{
				width,
				height: 280,
				borderRadius: 10,
				overflow: "hidden",
				border: "1px solid var(--rule)",
				background: "var(--cream)",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Header */}
			<div
				style={{
					height: 36,
					background: "var(--surf-3)",
					borderBottom: "1px solid var(--rule)",
					display: "flex",
					alignItems: "center",
					padding: "0 12px",
					gap: 8,
				}}
			>
				{mode === "mobile" && (
					<div
						style={{
							width: 14,
							height: 12,
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}
					>
						<div style={{ height: 2, background: "var(--ink-3)", borderRadius: 1 }} />
						<div style={{ height: 2, background: "var(--ink-3)", borderRadius: 1 }} />
						<div style={{ height: 2, background: "var(--ink-3)", borderRadius: 1 }} />
					</div>
				)}
				<div style={{ width: 16, height: 16, borderRadius: 4, background: "var(--ink)" }} />
				<div style={{ flex: 1 }} />
				<div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--amber)" }} />
			</div>
			<div style={{ display: "flex", flex: 1, minHeight: 0 }}>
				{/* Sidebar */}
				{showSidebar && (
					<div
						style={{
							width: sidebarWidth,
							background: "var(--surf-2)",
							borderRight: "1px solid var(--rule)",
							padding: 8,
							transition: "width .25s",
							display: "flex",
							flexDirection: "column",
							gap: 4,
						}}
					>
						{[0, 1, 2, 3, 4].map((i) => (
							<div
								key={i}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									padding: "6px 8px",
									borderRadius: 6,
									background: i === 0 ? "var(--ink)" : "transparent",
								}}
							>
								<div
									style={{
										width: 12,
										height: 12,
										borderRadius: 3,
										background: i === 0 ? "var(--amber)" : "var(--ink-5)",
									}}
								/>
								{!sidebarCollapsed && (
									<div
										style={{
											height: 6,
											flex: 1,
											borderRadius: 2,
											background: i === 0 ? "var(--cream-2)" : "var(--ink-5)",
											opacity: i === 0 ? 1 : 0.5,
										}}
									/>
								)}
							</div>
						))}
					</div>
				)}
				{/* Content */}
				<div
					style={{
						flex: 1,
						padding: 14,
						display: "flex",
						flexDirection: "column",
						gap: 8,
						minHeight: 0,
						overflow: "hidden",
					}}
				>
					<div style={{ height: 14, width: "60%", borderRadius: 3, background: "var(--ink-5)" }} />
					<div
						style={{
							height: 8,
							width: "40%",
							borderRadius: 2,
							background: "var(--ink-5)",
							opacity: 0.5,
						}}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: mode === "mobile" ? "1fr" : "repeat(2, 1fr)",
							gap: 8,
							marginTop: 6,
						}}
					>
						{[0, 1, 2, 3].map((i) => (
							<div
								key={i}
								style={{
									height: 50,
									background: "var(--surf-3)",
									border: "1px solid var(--rule)",
									borderRadius: 6,
								}}
							/>
						))}
					</div>
				</div>
			</div>
			{mode === "mobile" && (
				<div
					style={{
						height: 40,
						background: "var(--surf-3)",
						borderTop: "1px solid var(--rule)",
						display: "flex",
						justifyContent: "space-around",
						alignItems: "center",
					}}
				>
					{[0, 1, 2, 3].map((i) => (
						<div
							key={i}
							style={{
								width: 18,
								height: 18,
								borderRadius: 4,
								background: i === 0 ? "var(--amber)" : "var(--ink-5)",
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function ShellSection() {
	const [collapsed, setCollapsed] = React.useState(false);

	return (
		<div>
			<DSSubsection title="App Shell — responsive layout">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					The page-level frame: header, sidebar, content. At narrower viewports the sidebar
					collapses to icons; on mobile it disappears in favor of a bottom tab bar.
				</p>

				<StateRow label="Desktop — full sidebar">
					<ShellMock width={500} mode="desktop" />
				</StateRow>

				<StateRow label="Tablet — collapsed sidebar (icon-only)">
					<ShellMock width={420} sidebarCollapsed mode="tablet" />
				</StateRow>

				<StateRow label="Mobile — top header + bottom tab bar">
					<ShellMock width={240} mode="mobile" />
				</StateRow>

				<StateRow label="Interactive — toggle sidebar">
					<div style={{ width: "100%" }}>
						<label className="ds-check-label" style={{ marginBottom: 10, fontSize: 12 }}>
							<div
								className={`ds-toggle ${collapsed ? "on" : ""}`}
								onClick={() => setCollapsed(!collapsed)}
							>
								<div className="ds-toggle-thumb" />
							</div>
							Collapsed
						</label>
						<ShellMock width={500} sidebarCollapsed={collapsed} mode="desktop" />
					</div>
				</StateRow>

				<div
					style={{
						marginTop: 20,
						padding: 16,
						background: "rgba(245,158,11,.06)",
						border: "1px solid rgba(245,158,11,.2)",
						borderRadius: 10,
					}}
				>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9.5,
							color: "var(--amber-d)",
							letterSpacing: ".08em",
							textTransform: "uppercase",
							marginBottom: 8,
							fontWeight: 700,
						}}
					>
						Breakpoint behavior
					</div>
					<div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
						<strong>≥1024px</strong> — sidebar 240px, full labels
						<br />
						<strong>768–1023px</strong> — sidebar 56px, icons only
						<br />
						<strong>&lt;768px</strong> — sidebar hidden, bottom tab bar visible, hamburger reveals
						drawer
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { ShellMock, ShellSection });
