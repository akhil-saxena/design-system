/* ═══ BREADCRUMB TRAIL ═══ */

function Breadcrumb({ items, separator = "chevron" }) {
	const sepEl =
		separator === "slash" ? (
			<span style={{ color: "var(--ink-5)", fontSize: 13, margin: "0 2px" }}>/</span>
		) : (
			<svg
				viewBox="0 0 24 24"
				width="12"
				height="12"
				fill="none"
				stroke="var(--ink-5)"
				strokeWidth="2"
				style={{ flexShrink: 0 }}
			>
				<polyline points="9 18 15 12 9 6" />
			</svg>
		);

	return (
		<nav className="ds-breadcrumb">
			{items.map((item, i) => {
				const isLast = i === items.length - 1;
				return (
					<React.Fragment key={i}>
						<span
							className={`ds-bc-item ${isLast ? "active" : ""}`}
							style={{ display: "flex", alignItems: "center", gap: 5 }}
						>
							{item.icon && (
								<span style={{ display: "flex", color: isLast ? "var(--ink)" : "var(--ink-4)" }}>
									{item.icon}
								</span>
							)}
							{item.label}
						</span>
						{!isLast && sepEl}
					</React.Fragment>
				);
			})}
		</nav>
	);
}

function BreadcrumbsSection() {
	const homeIcon = (
		<svg
			viewBox="0 0 24 24"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		</svg>
	);
	const folderIcon = (
		<svg
			viewBox="0 0 24 24"
			width="12"
			height="12"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
		</svg>
	);

	return (
		<div>
			<DSSubsection title="Breadcrumb Trail">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Hierarchical navigation showing the current location within the app. Supports chevron and
					slash separators, with optional icons.
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<StateRow label="Chevron separator">
						<Breadcrumb
							items={[
								{ label: "Home", icon: homeIcon },
								{ label: "Applications" },
								{ label: "Stripe" },
								{ label: "Staff Engineer" },
							]}
						/>
					</StateRow>

					<StateRow label="Slash separator">
						<Breadcrumb
							items={[{ label: "Dashboard" }, { label: "Documents" }, { label: "Resume_v5.pdf" }]}
							separator="slash"
						/>
					</StateRow>

					<StateRow label="With icons">
						<Breadcrumb
							items={[
								{ label: "Home", icon: homeIcon },
								{ label: "Documents", icon: folderIcon },
								{ label: "Resumes", icon: folderIcon },
								{ label: "Resume_v5.pdf" },
							]}
						/>
					</StateRow>

					<StateRow label="Truncated (overflow)">
						<div
							className="glass"
							style={{ borderRadius: 10, padding: "8px 14px", maxWidth: 360, overflow: "hidden" }}
						>
							<Breadcrumb
								items={[
									{ label: "Home", icon: homeIcon },
									{ label: "…" },
									{ label: "Automattic" },
									{ label: "Experienced Software Engineer" },
								]}
							/>
						</div>
					</StateRow>

					<StateRow label="In page header">
						<div
							className="glass"
							style={{ borderRadius: 14, padding: "16px 20px", width: "100%" }}
						>
							<Breadcrumb
								items={[
									{ label: "Applications", icon: homeIcon },
									{ label: "Stripe" },
									{ label: "Staff Engineer" },
								]}
							/>
							<div
								style={{
									fontFamily: "var(--display)",
									fontWeight: 800,
									fontSize: 22,
									marginTop: 10,
									letterSpacing: "-.02em",
								}}
							>
								Staff Engineer
							</div>
							<div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
								Stripe · San Francisco · $210k
							</div>
						</div>
					</StateRow>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { BreadcrumbsSection });
