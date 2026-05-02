/* ═══ SEARCH & AUTOCOMPLETE — polished ═══ */

const SEARCH_SUGGESTIONS = [
	{ type: "recent", label: "Stripe — Staff Engineer" },
	{ type: "recent", label: "Linear — Product Engineer" },
	{ type: "recent", label: "Figma — Design Engineer" },
	{ type: "company", label: "Automattic" },
	{ type: "company", label: "Vercel" },
	{ type: "skill", label: "React" },
	{ type: "skill", label: "TypeScript" },
	{ type: "skill", label: "Node.js" },
];

const SEARCH_GROUP_LABELS = { recent: "Recent Searches", company: "Companies", skill: "Skills" };
const SEARCH_GROUP_ICONS = {
	recent: (
		<svg
			viewBox="0 0 24 24"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	),
	company: (
		<svg
			viewBox="0 0 24 24"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<rect x="3" y="3" width="18" height="18" rx="3" />
		</svg>
	),
	skill: (
		<svg
			viewBox="0 0 24 24"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	),
};

function SearchAutocompleteSection() {
	const [query, setQuery] = React.useState("");
	const [focused, setFocused] = React.useState(false);

	const filtered = query
		? SEARCH_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
		: SEARCH_SUGGESTIONS;

	const groups = {};
	filtered.forEach((s) => {
		if (!groups[s.type]) groups[s.type] = [];
		groups[s.type].push(s);
	});

	return (
		<div>
			<DSSubsection title="Search with Autocomplete">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Global search with grouped suggestions. Shows recent items when empty, filters as you
					type. Supports keyboard shortcut hint and filter chips.
				</p>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
					{/* Live search */}
					<div style={{ position: "relative" }}>
						<div className="ds-search-input-wrap" data-focused={focused || undefined}>
							<svg
								viewBox="0 0 24 24"
								width="15"
								height="15"
								fill="none"
								stroke={focused ? "var(--amber)" : "var(--ink-3)"}
								strokeWidth="2"
								style={{ transition: "stroke .15s" }}
							>
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
							<input
								className="ds-search-input"
								placeholder="Search applications, companies, skills…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => setFocused(true)}
								onBlur={() => setTimeout(() => setFocused(false), 200)}
							/>
							{query && (
								<button
									style={{
										background: "none",
										border: "none",
										cursor: "pointer",
										color: "var(--ink-4)",
										fontSize: 16,
										padding: 0,
										lineHeight: 1,
									}}
									onClick={() => setQuery("")}
								>
									×
								</button>
							)}
							<span className="ds-kbd">⌘K</span>
						</div>

						{focused && filtered.length > 0 && (
							<div className="ds-search-dropdown glass">
								{Object.keys(groups).map((g) => (
									<React.Fragment key={g}>
										<div className="ds-cmd-group">{SEARCH_GROUP_LABELS[g]}</div>
										{groups[g].map((item, i) => (
											<div
												key={i}
												className="ds-cmd-item"
												onMouseDown={() => {
													setQuery(item.label);
													setFocused(false);
												}}
											>
												<span style={{ color: "var(--ink-4)", display: "flex" }}>
													{SEARCH_GROUP_ICONS[g]}
												</span>
												<span>{item.label}</span>
											</div>
										))}
									</React.Fragment>
								))}
							</div>
						)}
					</div>

					{/* States showcase */}
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<StateRow label="States">
							<div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
								<div className="ds-search-input-wrap">
									<svg
										viewBox="0 0 24 24"
										width="15"
										height="15"
										fill="none"
										stroke="var(--ink-3)"
										strokeWidth="2"
									>
										<circle cx="11" cy="11" r="8" />
										<line x1="21" y1="21" x2="16.65" y2="16.65" />
									</svg>
									<input className="ds-search-input" placeholder="Default" readOnly />
								</div>
								<div className="ds-search-input-wrap" data-focused="true">
									<svg
										viewBox="0 0 24 24"
										width="15"
										height="15"
										fill="none"
										stroke="var(--amber)"
										strokeWidth="2"
									>
										<circle cx="11" cy="11" r="8" />
										<line x1="21" y1="21" x2="16.65" y2="16.65" />
									</svg>
									<input
										className="ds-search-input"
										defaultValue="stripe"
										readOnly
										style={{ color: "var(--ink)" }}
									/>
									<span style={{ color: "var(--ink-4)", fontSize: 16, lineHeight: 1 }}>×</span>
								</div>
								<div
									className="ds-search-input-wrap"
									style={{ opacity: 0.45, pointerEvents: "none" }}
								>
									<svg
										viewBox="0 0 24 24"
										width="15"
										height="15"
										fill="none"
										stroke="var(--ink-4)"
										strokeWidth="2"
									>
										<circle cx="11" cy="11" r="8" />
										<line x1="21" y1="21" x2="16.65" y2="16.65" />
									</svg>
									<input className="ds-search-input" placeholder="Disabled" disabled />
								</div>
							</div>
						</StateRow>

						<StateRow label="With filter chips">
							<div className="ds-search-input-wrap" style={{ width: "100%" }}>
								<svg
									viewBox="0 0 24 24"
									width="15"
									height="15"
									fill="none"
									stroke="var(--ink-3)"
									strokeWidth="2"
								>
									<circle cx="11" cy="11" r="8" />
									<line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
								<span className="ds-chip" style={{ padding: "2px 8px", fontSize: 10 }}>
									Remote
									<span className="ds-chip-x" style={{ fontSize: 12 }}>
										×
									</span>
								</span>
								<span className="ds-chip" style={{ padding: "2px 8px", fontSize: 10 }}>
									Engineering
									<span className="ds-chip-x" style={{ fontSize: 12 }}>
										×
									</span>
								</span>
								<input
									className="ds-search-input"
									placeholder="Add filter…"
									readOnly
									style={{ minWidth: 80 }}
								/>
							</div>
						</StateRow>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { SearchAutocompleteSection });
