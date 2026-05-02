/* ═══ MOBILE VIEWS — system at 375px ═══ */

function PhoneFrame({ label, children }) {
	return (
		<div
			style={{ display: "inline-block", marginRight: 24, marginBottom: 24, verticalAlign: "top" }}
		>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontSize: 9.5,
					color: "var(--ink-3)",
					letterSpacing: ".08em",
					textTransform: "uppercase",
					fontWeight: 700,
					marginBottom: 10,
				}}
			>
				{label}
			</div>
			<div
				style={{
					width: 375,
					height: 720,
					borderRadius: 36,
					border: "8px solid var(--ink)",
					background: "var(--cream)",
					overflow: "hidden",
					position: "relative",
					boxShadow: "0 8px 28px rgba(0,0,0,.12)",
				}}
			>
				{/* Status bar */}
				<div
					style={{
						height: 32,
						background: "var(--cream)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "0 22px",
						fontFamily: "var(--mono)",
						fontSize: 11,
						fontWeight: 700,
						color: "var(--ink)",
						position: "relative",
						zIndex: 2,
					}}
				>
					<span>9:41</span>
					<div
						style={{
							width: 110,
							height: 22,
							background: "var(--ink)",
							borderRadius: 11,
							position: "absolute",
							left: "50%",
							transform: "translateX(-50%)",
							top: 6,
						}}
					/>
					<span style={{ display: "flex", gap: 4, alignItems: "center" }}>
						<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
							<path d="M5 12.5a8 8 0 0 1 14 0" />
							<path d="M8 16a5 5 0 0 1 8 0" />
							<circle cx="12" cy="19" r="1" />
						</svg>
						<span>100</span>
					</span>
				</div>
				<div style={{ height: "calc(100% - 32px)", overflow: "hidden" }}>{children}</div>
			</div>
		</div>
	);
}

function MobileBoardScreen() {
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<div
				style={{
					padding: "12px 18px 8px",
					borderBottom: "1px solid var(--rule)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					<div
						style={{
							fontFamily: "var(--display)",
							fontSize: 22,
							fontWeight: 800,
							letterSpacing: "-.02em",
						}}
					>
						Applications
					</div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9.5,
							color: "var(--ink-3)",
							letterSpacing: ".08em",
							textTransform: "uppercase",
						}}
					>
						24 active · 6 interviewing
					</div>
				</div>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: "50%",
						background: "var(--amber)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "var(--display)",
						fontWeight: 800,
						fontSize: 11,
					}}
				>
					SM
				</div>
			</div>

			{/* Filter chips */}
			<div style={{ padding: "10px 14px", display: "flex", gap: 6, overflowX: "auto" }}>
				{["All", "Applied", "Interview", "Offer", "Rejected"].map((t, i) => (
					<span
						key={t}
						style={{
							flexShrink: 0,
							padding: "5px 12px",
							borderRadius: 999,
							fontSize: 11.5,
							fontWeight: 600,
							background: i === 0 ? "var(--ink)" : "var(--surf-2)",
							color: i === 0 ? "var(--cream)" : "var(--ink-2)",
							border: "1px solid var(--rule)",
						}}
					>
						{t}
					</span>
				))}
			</div>

			{/* Cards list */}
			<div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 80px" }}>
				{[
					{
						c: "Stripe",
						r: "Senior Frontend Engineer",
						s: "Interview",
						col: "var(--amber)",
						d: "Tue, Oct 28",
					},
					{
						c: "Linear",
						r: "Staff Engineer, UI Platform",
						s: "Applied",
						col: "var(--blue)",
						d: "2h ago",
					},
					{
						c: "Figma",
						r: "Senior Product Designer",
						s: "Offer",
						col: "var(--green)",
						d: "Decide by Oct 28",
					},
					{ c: "Notion", r: "Frontend Engineer", s: "Applied", col: "var(--ink)", d: "2d ago" },
					{
						c: "Vercel",
						r: "Senior Software Engineer",
						s: "Applied",
						col: "var(--ink)",
						d: "3d ago",
					},
					{
						c: "Anthropic",
						r: "Member of Technical Staff",
						s: "Interview",
						col: "var(--amber)",
						d: "Nov 4",
					},
				].map((a, i) => (
					<div
						key={i}
						style={{
							padding: 12,
							borderRadius: 10,
							border: "1px solid var(--rule)",
							background: "var(--surf-2)",
							marginBottom: 8,
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
							<div
								style={{
									width: 26,
									height: 26,
									borderRadius: 5,
									background: "var(--cream-2)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontFamily: "var(--display)",
									fontWeight: 800,
									fontSize: 11,
								}}
							>
								{a.c[0]}
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: 12, fontWeight: 700 }}>{a.c}</div>
							</div>
							<span
								style={{
									fontSize: 10,
									fontWeight: 700,
									color: a.col,
									fontFamily: "var(--mono)",
									letterSpacing: ".05em",
									textTransform: "uppercase",
								}}
							>
								{a.s}
							</span>
						</div>
						<div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
							{a.r}
						</div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-3)",
								textTransform: "uppercase",
								letterSpacing: ".06em",
							}}
						>
							{a.d}
						</div>
					</div>
				))}
			</div>

			{/* FAB */}
			<div
				style={{
					position: "absolute",
					bottom: 80,
					right: 18,
					width: 52,
					height: 52,
					borderRadius: "50%",
					background: "var(--amber)",
					boxShadow: "0 4px 14px rgba(245,158,11,.35)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<svg
					viewBox="0 0 24 24"
					width="22"
					height="22"
					fill="none"
					stroke="var(--ink)"
					strokeWidth="2.5"
					strokeLinecap="round"
				>
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
			</div>

			{/* Tab bar */}
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: 64,
					background: "rgba(255,255,255,.95)",
					backdropFilter: "blur(14px)",
					borderTop: "1px solid var(--rule)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
					paddingBottom: 8,
				}}
			>
				{[
					{ l: "Home", a: false },
					{ l: "Apps", a: true },
					{ l: "Inbox", a: false },
					{ l: "Profile", a: false },
				].map((t) => (
					<div
						key={t.l}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 3,
							color: t.a ? "var(--ink)" : "var(--ink-4)",
						}}
					>
						<div
							style={{
								width: 18,
								height: 18,
								borderRadius: 4,
								background: t.a ? "var(--ink)" : "transparent",
								border: t.a ? "none" : "1.5px solid var(--ink-4)",
							}}
						/>
						<span style={{ fontSize: 10, fontWeight: t.a ? 700 : 500 }}>{t.l}</span>
					</div>
				))}
			</div>
		</div>
	);
}

function MobileApplicationDetail() {
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<div
				style={{
					padding: "8px 14px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>← Back</span>
				<span style={{ fontSize: 18, color: "var(--ink-3)", cursor: "pointer" }}>⋯</span>
			</div>
			<div style={{ flex: 1, overflowY: "auto", padding: "0 18px 20px" }}>
				<div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
					<div
						style={{
							width: 48,
							height: 48,
							borderRadius: 10,
							background: "var(--ink)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--cream)",
							fontFamily: "var(--display)",
							fontWeight: 800,
							fontSize: 22,
						}}
					>
						S
					</div>
					<div>
						<div
							style={{
								fontFamily: "var(--display)",
								fontSize: 22,
								fontWeight: 800,
								letterSpacing: "-.02em",
								lineHeight: 1.1,
							}}
						>
							Stripe
						</div>
						<div style={{ fontSize: 12, color: "var(--ink-3)" }}>stripe.com · 5,000+ employees</div>
					</div>
				</div>
				<div
					style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 4 }}
				>
					Senior Frontend Engineer
				</div>
				<div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14 }}>
					Remote · Full-time · $180–220k
				</div>

				{/* Status bar */}
				<div
					style={{
						padding: 12,
						background: "rgba(245,158,11,.08)",
						border: "1px solid rgba(245,158,11,.3)",
						borderRadius: 10,
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9.5,
							color: "var(--amber-d)",
							letterSpacing: ".08em",
							textTransform: "uppercase",
							fontWeight: 700,
							marginBottom: 4,
						}}
					>
						Current stage · Tech screen
					</div>
					<div style={{ fontWeight: 700, fontSize: 13.5 }}>Tomorrow at 11:00 with Maya Chen</div>
				</div>

				{/* Stages */}
				<div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
					{["Applied", "Screen", "Tech", "Onsite", "Offer"].map((s, i) => (
						<div key={s} style={{ flex: 1 }}>
							<div
								style={{
									height: 4,
									borderRadius: 2,
									background: i <= 2 ? "var(--amber)" : "var(--cream-3)",
									marginBottom: 5,
								}}
							/>
							<div
								style={{
									fontSize: 9,
									fontFamily: "var(--mono)",
									textAlign: "center",
									color: i <= 2 ? "var(--ink)" : "var(--ink-4)",
									fontWeight: 700,
									letterSpacing: ".04em",
									textTransform: "uppercase",
								}}
							>
								{s}
							</div>
						</div>
					))}
				</div>

				{/* Timeline */}
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9.5,
						color: "var(--ink-3)",
						letterSpacing: ".08em",
						textTransform: "uppercase",
						fontWeight: 700,
						marginBottom: 10,
					}}
				>
					Timeline
				</div>
				{[
					["Oct 22", "Tech screen scheduled", "Maya confirmed for 11:00"],
					["Oct 19", "Recruiter screen passed", "30 min with Jordan"],
					["Oct 14", "Application sent", "Via referral — Jamie K."],
				].map(([d, t, sub], i) => (
					<div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								fontWeight: 700,
								color: "var(--ink-3)",
								width: 50,
								paddingTop: 1,
							}}
						>
							{d}
						</div>
						<div style={{ flex: 1, paddingLeft: 12, borderLeft: "2px solid var(--cream-3)" }}>
							<div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
							<div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>
						</div>
					</div>
				))}
			</div>
			{/* Bottom action */}
			<div
				style={{
					padding: 14,
					background: "var(--cream)",
					borderTop: "1px solid var(--rule)",
					display: "flex",
					gap: 8,
				}}
			>
				<span
					style={{
						flex: 1,
						padding: "11px",
						textAlign: "center",
						borderRadius: 8,
						background: "var(--ink)",
						color: "var(--cream)",
						fontWeight: 700,
						fontSize: 13,
					}}
				>
					Add note
				</span>
				<span
					style={{
						width: 44,
						height: 44,
						borderRadius: 8,
						background: "var(--surf-2)",
						border: "1px solid var(--rule)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg
						viewBox="0 0 24 24"
						width="18"
						height="18"
						fill="none"
						stroke="var(--ink-2)"
						strokeWidth="2"
						strokeLinecap="round"
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
				</span>
			</div>
		</div>
	);
}

function MobileNavDrawer() {
	return (
		<div style={{ height: "100%", position: "relative", background: "rgba(0,0,0,.4)" }}>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					bottom: 0,
					width: 280,
					background: "var(--cream)",
					borderRight: "1px solid var(--rule)",
					padding: 18,
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* User */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: 12,
						background: "var(--surf-2)",
						borderRadius: 12,
						marginBottom: 18,
					}}
				>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							background: "var(--amber)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontFamily: "var(--display)",
							fontWeight: 800,
							fontSize: 14,
						}}
					>
						SM
					</div>
					<div>
						<div style={{ fontWeight: 700, fontSize: 13.5 }}>Sarah Marshall</div>
						<div style={{ fontSize: 11, color: "var(--ink-3)" }}>Pro plan</div>
					</div>
				</div>
				{/* Nav */}
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9,
						color: "var(--ink-4)",
						letterSpacing: ".1em",
						textTransform: "uppercase",
						fontWeight: 700,
						padding: "0 8px 6px",
					}}
				>
					Workspace
				</div>
				{[
					["Home", false],
					["Applications", true],
					["Calendar", false],
					["Inbox", false],
					["Notes", false],
				].map(([l, a]) => (
					<div
						key={l}
						style={{
							padding: "10px 12px",
							borderRadius: 8,
							fontSize: 13.5,
							fontWeight: a ? 600 : 500,
							color: a ? "var(--cream)" : "var(--ink-2)",
							background: a ? "var(--ink)" : "transparent",
							marginBottom: 2,
						}}
					>
						{l}
					</div>
				))}
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9,
						color: "var(--ink-4)",
						letterSpacing: ".1em",
						textTransform: "uppercase",
						fontWeight: 700,
						padding: "14px 8px 6px",
					}}
				>
					Tools
				</div>
				{["AI cover letter", "Salary insights", "Interview prep"].map((l) => (
					<div
						key={l}
						style={{
							padding: "10px 12px",
							borderRadius: 8,
							fontSize: 13.5,
							fontWeight: 500,
							color: "var(--ink-2)",
						}}
					>
						{l}
					</div>
				))}
				<div
					style={{
						marginTop: "auto",
						padding: 12,
						background: "rgba(245,158,11,.1)",
						borderRadius: 10,
					}}
				>
					<div style={{ fontWeight: 700, fontSize: 12 }}>Invite a friend</div>
					<div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
						Get a free month of Pro
					</div>
				</div>
			</div>
		</div>
	);
}

function MobileViewsSection() {
	return (
		<div>
			<DSSubsection title="Mobile Views">
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-3)",
						marginBottom: 18,
						lineHeight: 1.5,
						maxWidth: 640,
					}}
				>
					The system at 375px. Note: chips become a horizontal scroll, the kanban becomes a single
					column with status pills, and primary actions move into a thumb-reachable FAB or bottom
					bar.
				</p>
				<div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
					<PhoneFrame label="01 · Application list">
						<MobileBoardScreen />
					</PhoneFrame>
					<PhoneFrame label="02 · Application detail">
						<MobileApplicationDetail />
					</PhoneFrame>
					<PhoneFrame label="03 · Nav drawer">
						<MobileNavDrawer />
					</PhoneFrame>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { MobileViewsSection });
