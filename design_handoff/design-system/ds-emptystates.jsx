/* ═══ EMPTY STATES — polished ═══ */

function EmptyIllustration({ type }) {
	const s = { width: 88, height: 88 };
	switch (type) {
		case "inbox":
			return (
				<svg viewBox="0 0 88 88" style={s} fill="none">
					<rect
						x="18"
						y="24"
						width="52"
						height="40"
						rx="5"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<path d="M18 48l14-9h24l14 9" stroke="var(--amber)" strokeWidth="1.5" />
					<circle cx="44" cy="38" r="7" stroke="var(--ink-5)" strokeWidth="1.5" />
					<path
						d="M41 38l2.5 2.5L48 36"
						stroke="var(--amber)"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "search":
			return (
				<svg viewBox="0 0 88 88" style={s} fill="none">
					<circle
						cx="38"
						cy="38"
						r="18"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<line
						x1="50"
						y1="50"
						x2="66"
						y2="66"
						stroke="var(--amber)"
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
					<path
						d="M32 35h12M32 41h7"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			);
		case "calendar":
			return (
				<svg viewBox="0 0 88 88" style={s} fill="none">
					<rect
						x="16"
						y="20"
						width="56"
						height="48"
						rx="5"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<line x1="16" y1="34" x2="72" y2="34" stroke="var(--ink-5)" strokeWidth="1.5" />
					<line
						x1="32"
						y1="16"
						x2="32"
						y2="24"
						stroke="var(--amber)"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<line
						x1="56"
						y1="16"
						x2="56"
						y2="24"
						stroke="var(--amber)"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<circle
						cx="44"
						cy="50"
						r="9"
						stroke="var(--amber)"
						strokeWidth="1.5"
						strokeDasharray="3 3"
					/>
					<path
						d="M44 46v4l3 2"
						stroke="var(--amber)"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "error":
			return (
				<svg viewBox="0 0 88 88" style={s} fill="none">
					<circle
						cx="44"
						cy="44"
						r="24"
						stroke="var(--red-vivid)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<line
						x1="36"
						y1="36"
						x2="52"
						y2="52"
						stroke="var(--red-vivid)"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<line
						x1="52"
						y1="36"
						x2="36"
						y2="52"
						stroke="var(--red-vivid)"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
			);
		case "connection":
			return (
				<svg viewBox="0 0 88 88" style={s} fill="none">
					<circle
						cx="30"
						cy="44"
						r="12"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<circle
						cx="58"
						cy="44"
						r="12"
						stroke="var(--ink-5)"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					<path
						d="M42 44h4"
						stroke="var(--amber)"
						strokeWidth="2"
						strokeLinecap="round"
						strokeDasharray="2 3"
					/>
					<circle cx="30" cy="44" r="4" fill="var(--amber)" opacity=".3" />
					<circle cx="58" cy="44" r="4" fill="var(--amber)" opacity=".3" />
				</svg>
			);
		default:
			return null;
	}
}

function EmptyState({ type, title, description, actionLabel, secondaryLabel }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "36px 24px",
				textAlign: "center",
			}}
		>
			<EmptyIllustration type={type} />
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 16,
					marginTop: 14,
					letterSpacing: "-.01em",
				}}
			>
				{title}
			</div>
			<div
				style={{
					fontSize: 13,
					color: "var(--ink-3)",
					marginTop: 6,
					maxWidth: 280,
					lineHeight: 1.5,
				}}
			>
				{description}
			</div>
			<div style={{ display: "flex", gap: 8, marginTop: 18 }}>
				{actionLabel && <button className="ds-btn amber">{actionLabel}</button>}
				{secondaryLabel && <button className="ds-btn ghost">{secondaryLabel}</button>}
			</div>
		</div>
	);
}

function EmptyStatesSection() {
	return (
		<div>
			<DSSubsection title="Empty State Variants">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Used when a view has no data. Each variant has an illustration hint, title, description,
					and optional CTAs.
				</p>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
					<div className="glass" style={{ borderRadius: 14 }}>
						<EmptyState
							type="inbox"
							title="No applications yet"
							description="Start tracking your job search by adding your first application."
							actionLabel="Add Application"
							secondaryLabel="Import"
						/>
					</div>
					<div className="glass" style={{ borderRadius: 14 }}>
						<EmptyState
							type="search"
							title="No results found"
							description="Try adjusting your search or filters to find what you're looking for."
							actionLabel="Clear Filters"
						/>
					</div>
					<div className="glass" style={{ borderRadius: 14 }}>
						<EmptyState
							type="calendar"
							title="No upcoming events"
							description="Your interview calendar is clear. Keep applying!"
							secondaryLabel="Browse Jobs"
						/>
					</div>
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
					<div className="glass" style={{ borderRadius: 14 }}>
						<EmptyState
							type="error"
							title="Something went wrong"
							description="We couldn't load your data. Please try again."
							actionLabel="Retry"
							secondaryLabel="Contact Support"
						/>
					</div>
					<div className="glass" style={{ borderRadius: 14 }}>
						<EmptyState
							type="connection"
							title="No integrations connected"
							description="Connect your email or calendar to auto-import applications."
							actionLabel="Connect"
						/>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { EmptyStatesSection });
