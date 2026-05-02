/* ═══ ADVANCED — Command palette, accordion, breadcrumbs, pagination, skeleton, empty states, star rating, context menu ═══ */

function CommandPaletteSection() {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const allItems = [
		{ icon: "add", label: "Add application", shortcut: "⌘N", group: "Actions" },
		{ icon: "search", label: "Search all applications", shortcut: "⌘K", group: "Actions" },
		{ icon: "advance", label: "Advance to next stage", shortcut: "→", group: "Actions" },
		{ icon: "dark", label: "Toggle dark mode", shortcut: "⌘⇧D", group: "Actions" },
		{ icon: "app", label: "Automattic — Experienced Engineer", group: "Recent" },
		{ icon: "app", label: "Stripe — Staff Engineer", group: "Recent" },
		{ icon: "app", label: "Linear — Product Engineer", group: "Recent" },
		{ icon: "nav", label: "Go to Board", group: "Navigation" },
		{ icon: "nav", label: "Go to Calendar", group: "Navigation" },
		{ icon: "nav", label: "Go to Settings", group: "Navigation" },
	];
	const filtered = query
		? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
		: allItems;
	const groups = [...new Set(filtered.map((i) => i.group))];

	React.useEffect(() => {
		const handler = (e) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(true);
			}
			if (e.key === "Escape") {
				setOpen(false);
				setQuery("");
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const cmdIcon = (type) => {
		switch (type) {
			case "add":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				);
			case "search":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<circle cx="11" cy="11" r="8" />
					</svg>
				);
			case "advance":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<polyline points="9 18 15 12 9 6" />
					</svg>
				);
			case "dark":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<circle cx="12" cy="12" r="5" />
						<line x1="12" y1="1" x2="12" y2="3" />
						<line x1="12" y1="21" x2="12" y2="23" />
					</svg>
				);
			case "app":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<rect x="3" y="3" width="18" height="18" rx="3" />
					</svg>
				);
			case "nav":
				return (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="14"
						height="14"
					>
						<polyline points="9 18 15 12 9 6" />
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div>
			<DSSubsection title="Command Palette">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
					Press <span className="ds-kbd">⌘K</span> or click below. Fuzzy search across actions,
					recent items, and navigation.
				</p>
				<button className="ds-btn" onClick={() => setOpen(true)}>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						width="13"
						height="13"
					>
						<circle cx="11" cy="11" r="8" />
					</svg>
					Open Command Palette
					<span className="ds-kbd">⌘K</span>
				</button>
			</DSSubsection>

			{open && (
				<div
					className="ds-overlay"
					onClick={() => {
						setOpen(false);
						setQuery("");
					}}
					style={{ alignItems: "flex-start", paddingTop: "15vh" }}
				>
					<div className="ds-cmd" onClick={(e) => e.stopPropagation()}>
						<div className="ds-cmd-input-wrap">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--ink-3)"
								strokeWidth="2"
								width="16"
								height="16"
							>
								<circle cx="11" cy="11" r="8" />
							</svg>
							<input
								className="ds-cmd-input"
								placeholder="Type a command or search…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							<span
								className="ds-kbd"
								style={{ cursor: "pointer" }}
								onClick={() => {
									setOpen(false);
									setQuery("");
								}}
							>
								ESC
							</span>
						</div>
						<div className="ds-cmd-body">
							{groups.map((g) => (
								<div key={g}>
									<div className="ds-cmd-group">{g}</div>
									{filtered
										.filter((i) => i.group === g)
										.map((i) => (
											<div
												key={i.label}
												className="ds-cmd-item"
												onClick={() => {
													setOpen(false);
													setQuery("");
												}}
											>
												<span style={{ color: "var(--ink-3)" }}>{cmdIcon(i.icon)}</span>
												<span style={{ flex: 1 }}>{i.label}</span>
												{i.shortcut && <span className="ds-kbd">{i.shortcut}</span>}
											</div>
										))}
								</div>
							))}
							{filtered.length === 0 && (
								<div
									style={{
										padding: "20px",
										textAlign: "center",
										color: "var(--ink-4)",
										fontSize: 13,
									}}
								>
									No results for "{query}"
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function AccordionSection() {
	const [openItems, setOpenItems] = React.useState([0]);
	const items = [
		{
			title: "Company Research",
			content:
				"Automattic is the parent company behind WordPress.com, WooCommerce, Jetpack, Tumblr, and more. Fully distributed since founding — ~2000 employees across 97 countries.",
		},
		{
			title: "Interview Prep Notes",
			content:
				"Review the Automattic Creed. Prepare 3 questions about Division structure. Brush up on React Server Components and PHP 8.x features.",
		},
		{
			title: "Compensation Details",
			content:
				"Base: $70K–$170K depending on level and location. Includes home office stipend, co-working allowance, open vacation policy, and sabbatical after 5 years.",
		},
		{
			title: "Cultural Fit Assessment",
			content:
				"Strong async communication culture. Blog posts > meetings. Trial project is a key part of their hiring process — typically paid, 10–40 hours over 2 weeks.",
		},
	];

	const toggle = (i) => setOpenItems((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));

	return (
		<DSSubsection title="Accordion / Collapsible">
			<div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
				{items.map((item, i) => (
					<div
						key={i}
						style={{ borderBottom: i < items.length - 1 ? "1px solid var(--rule)" : "none" }}
					>
						<div className="ds-accordion-hd" onClick={() => toggle(i)}>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								width="13"
								height="13"
								style={{
									transition: "transform .2s",
									transform: openItems.includes(i) ? "rotate(90deg)" : "",
									flexShrink: 0,
								}}
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
							<span
								style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 13, flex: 1 }}
							>
								{item.title}
							</span>
							<span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>
								{openItems.includes(i) ? "COLLAPSE" : "EXPAND"}
							</span>
						</div>
						<div
							style={{
								maxHeight: openItems.includes(i) ? 200 : 0,
								overflow: "hidden",
								transition: "max-height .25s ease-in-out",
							}}
						>
							<div
								style={{
									padding: "0 16px 14px 36px",
									fontSize: 13,
									color: "var(--ink-2)",
									lineHeight: 1.6,
								}}
							>
								{item.content}
							</div>
						</div>
					</div>
				))}
			</div>
		</DSSubsection>
	);
}

function BreadcrumbsSection() {
	return (
		<DSSubsection title="Breadcrumbs">
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<div className="ds-breadcrumb">
					<span className="ds-bc-item">Dashboard</span>
					<span className="ds-bc-sep">/</span>
					<span className="ds-bc-item">Applications</span>
					<span className="ds-bc-sep">/</span>
					<span className="ds-bc-item active">Automattic</span>
				</div>
				<div className="ds-breadcrumb">
					<span className="ds-bc-item">Board</span>
					<span className="ds-bc-sep">›</span>
					<span className="ds-bc-item">Applied</span>
					<span className="ds-bc-sep">›</span>
					<span className="ds-bc-item active">Automattic — Experienced Software Engineer</span>
				</div>
			</div>
		</DSSubsection>
	);
}

function PaginationSection() {
	const [page, setPage] = React.useState(3);
	const total = 12;
	return (
		<DSSubsection title="Pagination">
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
					<button
						className="ds-icbtn"
						style={{ width: 28, height: 28 }}
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="12"
							height="12"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					{[1, 2, 3, 4, 5, "…", total].map((p, i) => (
						<button
							key={i}
							onClick={() => typeof p === "number" && setPage(p)}
							className={`ds-page-btn ${p === page ? "active" : ""}`}
							style={{ pointerEvents: p === "…" ? "none" : "auto" }}
						>
							{p}
						</button>
					))}
					<button
						className="ds-icbtn"
						style={{ width: 28, height: 28 }}
						disabled={page >= total}
						onClick={() => setPage((p) => p + 1)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="12"
							height="12"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-4)",
							marginLeft: 10,
						}}
					>
						Page {page} of {total}
					</span>
				</div>
				{/* Mini pagination */}
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
						Compact:
					</span>
					<button className="ds-icbtn" style={{ width: 24, height: 24 }}>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="11"
							height="11"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					<span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>3 / 12</span>
					<button className="ds-icbtn" style={{ width: 24, height: 24 }}>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="11"
							height="11"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</div>
			</div>
		</DSSubsection>
	);
}

function SkeletonSection() {
	return (
		<DSSubsection title="Skeleton Loading">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				Pulsing placeholders that match the shape of real content.
			</p>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
				{/* Card skeleton */}
				<div className="glass" style={{ padding: 16, borderRadius: 12 }}>
					<div style={{ display: "flex", gap: 12 }}>
						<div className="ds-skel" style={{ width: 44, height: 44, borderRadius: 10 }} />
						<div style={{ flex: 1 }}>
							<div
								className="ds-skel"
								style={{ width: "60%", height: 14, borderRadius: 4, marginBottom: 8 }}
							/>
							<div className="ds-skel" style={{ width: "80%", height: 10, borderRadius: 4 }} />
						</div>
					</div>
					<div style={{ display: "flex", gap: 8, marginTop: 14 }}>
						<div className="ds-skel" style={{ width: 60, height: 22, borderRadius: 999 }} />
						<div className="ds-skel" style={{ width: 40, height: 22, borderRadius: 999 }} />
					</div>
				</div>
				{/* Table skeleton */}
				<div className="glass" style={{ padding: 16, borderRadius: 12 }}>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "center" }}
						>
							<div className="ds-skel" style={{ width: 28, height: 28, borderRadius: "50%" }} />
							<div className="ds-skel" style={{ flex: 1, height: 10, borderRadius: 4 }} />
							<div className="ds-skel" style={{ width: 50, height: 10, borderRadius: 4 }} />
						</div>
					))}
				</div>
			</div>
		</DSSubsection>
	);
}

function EmptyStatesSection() {
	return (
		<DSSubsection title="Empty States">
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
				<div className="glass" style={{ padding: 40, borderRadius: 14, textAlign: "center" }}>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 14,
							background: "var(--amber-l)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto 14px",
						}}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--amber-d)"
							strokeWidth="1.5"
							width="28"
							height="28"
						>
							<rect x="3" y="3" width="7" height="7" />
							<rect x="14" y="3" width="7" height="7" />
							<rect x="3" y="14" width="7" height="7" />
							<rect x="14" y="14" width="7" height="7" />
						</svg>
					</div>
					<div
						style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}
					>
						No applications yet
					</div>
					<div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 16 }}>
						Start tracking your job search by adding your first application.
					</div>
					<button className="ds-btn amber">Add your first application</button>
				</div>
				<div className="glass" style={{ padding: 40, borderRadius: 14, textAlign: "center" }}>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 14,
							background: "var(--cream-2)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto 14px",
						}}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--ink-3)"
							strokeWidth="1.5"
							width="28"
							height="28"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
					</div>
					<div
						style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}
					>
						No results
					</div>
					<div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 16 }}>
						Try adjusting your filters or search query.
					</div>
					<button className="ds-btn">Clear filters</button>
				</div>
			</div>
		</DSSubsection>
	);
}

function StarRatingSection() {
	const [rating, setRating] = React.useState(3);
	const [hover, setHover] = React.useState(0);
	return (
		<DSSubsection title="Star Rating">
			<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
				<div style={{ display: "flex", gap: 4, alignItems: "center" }}>
					{[1, 2, 3, 4, 5].map((s) => (
						<svg
							key={s}
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill={(hover || rating) >= s ? "var(--amber)" : "none"}
							stroke={(hover || rating) >= s ? "var(--amber)" : "var(--ink-5)"}
							strokeWidth="2"
							style={{ cursor: "pointer", transition: "all .1s" }}
							onMouseEnter={() => setHover(s)}
							onMouseLeave={() => setHover(0)}
							onClick={() => setRating(s)}
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
					))}
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 12,
							color: "var(--amber-d)",
							fontWeight: 600,
							marginLeft: 8,
						}}
					>
						{rating}/5
					</span>
				</div>
				{/* Small inline */}
				<div style={{ display: "flex", gap: 2, alignItems: "center" }}>
					{[1, 2, 3, 4, 5].map((s) => (
						<svg
							key={s}
							viewBox="0 0 24 24"
							width="14"
							height="14"
							fill={rating >= s ? "var(--amber)" : "var(--ink-5)"}
							stroke="none"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
					))}
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 10,
							color: "var(--ink-3)",
							marginLeft: 4,
						}}
					>
						Compact variant
					</span>
				</div>
			</div>
		</DSSubsection>
	);
}

function ContextMenuSection() {
	const [pos, setPos] = React.useState(null);
	const ref = React.useRef(null);

	React.useEffect(() => {
		const close = () => setPos(null);
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, []);

	return (
		<DSSubsection title="Context Menu (Right-click)">
			<div
				ref={ref}
				className="glass"
				style={{
					padding: 40,
					borderRadius: 12,
					textAlign: "center",
					cursor: "context-menu",
					position: "relative",
					userSelect: "none",
				}}
				onContextMenu={(e) => {
					e.preventDefault();
					const rect = ref.current.getBoundingClientRect();
					setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
				}}
			>
				<div style={{ fontSize: 13, color: "var(--ink-3)" }}>Right-click anywhere in this area</div>
				{pos && (
					<div
						className="ds-popover"
						style={{ top: pos.y, left: pos.x, position: "absolute" }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="ds-popover-item">Edit application</div>
						<div className="ds-popover-item">Move to stage…</div>
						<div className="ds-popover-item">Duplicate</div>
						<div style={{ height: 1, background: "var(--rule)", margin: "4px 0" }} />
						<div className="ds-popover-item">Copy link</div>
						<div className="ds-popover-item">Export as PDF</div>
						<div style={{ height: 1, background: "var(--rule)", margin: "4px 0" }} />
						<div className="ds-popover-item" style={{ color: "var(--red)" }}>
							Delete
						</div>
					</div>
				)}
			</div>
		</DSSubsection>
	);
}

function AdvancedSection() {
	return (
		<div>
			<CommandPaletteSection />
			<AccordionSection />
			<BreadcrumbsSection />
			<PaginationSection />
			<SkeletonSection />
			<EmptyStatesSection />
			<StarRatingSection />
			<ContextMenuSection />
		</div>
	);
}

Object.assign(window, { AdvancedSection });
