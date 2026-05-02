/* ═══ INTERACTIONS — Sheet/drawer, inline confirm, split button, copy-to-clipboard, autocomplete ═══ */

/* ─── Sheet / Drawer ─── */
function SheetSection() {
	const [open, setOpen] = React.useState(false);
	const [side, setSide] = React.useState("right");

	return (
		<div>
			<DSSubsection title="Sheet / Slide-over Drawer">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
					Detail panel that slides in from the edge. Used for viewing/editing an application without
					leaving the board.
				</p>
				<div style={{ display: "flex", gap: 8 }}>
					<button
						className="ds-btn dark"
						onClick={() => {
							setSide("right");
							setOpen(true);
						}}
					>
						Open from right
					</button>
					<button
						className="ds-btn"
						onClick={() => {
							setSide("left");
							setOpen(true);
						}}
					>
						Open from left
					</button>
				</div>
			</DSSubsection>

			{open && (
				<div
					className="ds-overlay"
					onClick={() => setOpen(false)}
					style={{ justifyContent: side === "right" ? "flex-end" : "flex-start" }}
				>
					<div className={`ds-sheet ds-sheet-${side}`} onClick={(e) => e.stopPropagation()}>
						<div className="ds-sheet-hd">
							<div style={{ flex: 1 }}>
								<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17 }}>
									Automattic
								</div>
								<div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
									Experienced Software Engineer
								</div>
							</div>
							<button className="ds-icbtn" onClick={() => setOpen(false)}>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="14"
									height="14"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
						<div className="ds-sheet-body">
							<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
								<span className="ds-badge upcoming">Applied</span>
								<span
									className="ds-badge"
									style={{ background: "var(--amber-l)", color: "var(--amber-d)" }}
								>
									Medium
								</span>
							</div>
							{[
								{ k: "Location", v: "Remote" },
								{ k: "Salary", v: "$70K – $170K" },
								{ k: "Source", v: "Company Website" },
								{ k: "Applied", v: "Apr 16, 2026" },
							].map((f) => (
								<div
									key={f.k}
									style={{
										display: "flex",
										justifyContent: "space-between",
										padding: "10px 0",
										borderBottom: "1px dashed var(--rule)",
									}}
								>
									<span
										style={{
											fontFamily: "var(--mono)",
											fontSize: 10,
											color: "var(--ink-3)",
											letterSpacing: ".06em",
											textTransform: "uppercase",
											fontWeight: 600,
										}}
									>
										{f.k}
									</span>
									<span style={{ fontSize: 13, fontWeight: 500 }}>{f.v}</span>
								</div>
							))}
							<div style={{ marginTop: 20 }}>
								<div
									style={{
										fontFamily: "var(--display)",
										fontWeight: 700,
										fontSize: 13,
										marginBottom: 8,
									}}
								>
									Notes
								</div>
								<textarea
									className="ds-textarea"
									rows={3}
									defaultValue="Reach out to David before screening. Research Jetpack vs WP.com split."
									style={{ fontSize: 12 }}
								/>
							</div>
						</div>
						<div className="ds-sheet-ft">
							<button className="ds-btn" onClick={() => setOpen(false)}>
								Close
							</button>
							<button className="ds-btn amber">Advance →</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Inline Confirmation ─── */
function InlineConfirmSection() {
	const [confirming, setConfirming] = React.useState(null);
	const [deleted, setDeleted] = React.useState([]);

	const items = ["Automattic", "Stripe", "Linear"].filter((i) => !deleted.includes(i));

	return (
		<DSSubsection title="Inline Confirmation">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				Destructive actions confirm inline — no disruptive modal. The button transforms into a
				confirmation prompt with a timeout auto-cancel.
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 400 }}>
				{items.map((item) => (
					<div
						key={item}
						className="glass"
						style={{
							padding: "10px 14px",
							borderRadius: 8,
							display: "flex",
							alignItems: "center",
							gap: 12,
						}}
					>
						<div
							style={{
								width: 30,
								height: 30,
								borderRadius: 7,
								background: "var(--ink)",
								color: "var(--cream)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontFamily: "var(--display)",
								fontWeight: 800,
								fontSize: 13,
								flexShrink: 0,
							}}
						>
							{item[0]}
						</div>
						<span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item}</span>
						{confirming === item ? (
							<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
								<span
									style={{
										fontFamily: "var(--mono)",
										fontSize: 10,
										color: "var(--red)",
										fontWeight: 600,
									}}
								>
									Delete?
								</span>
								<button
									className="ds-btn danger"
									style={{ fontSize: 10, padding: "3px 8px" }}
									onClick={() => {
										setDeleted((d) => [...d, item]);
										setConfirming(null);
									}}
								>
									Yes
								</button>
								<button
									className="ds-btn"
									style={{ fontSize: 10, padding: "3px 8px" }}
									onClick={() => setConfirming(null)}
								>
									No
								</button>
							</div>
						) : (
							<button
								className="ds-icbtn"
								style={{ width: 26, height: 26 }}
								onClick={() => {
									setConfirming(item);
									setTimeout(() => setConfirming((c) => (c === item ? null : c)), 4000);
								}}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="12"
									height="12"
								>
									<polyline points="3 6 5 6 21 6" />
									<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
								</svg>
							</button>
						)}
					</div>
				))}
				{items.length === 0 && (
					<div style={{ padding: 20, textAlign: "center", color: "var(--ink-4)", fontSize: 12 }}>
						All items deleted. Refresh to reset.
					</div>
				)}
			</div>
		</DSSubsection>
	);
}

/* ─── Split Button ─── */
function SplitButtonSection() {
	const [dropOpen, setDropOpen] = React.useState(false);
	const [action, setAction] = React.useState("Advance to Screening");
	const ref = React.useRef(null);

	React.useEffect(() => {
		const close = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setDropOpen(false);
		};
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, []);

	return (
		<DSSubsection title="Split Button">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				Primary action on the left, dropdown for alternatives on the right. Last-used action becomes
				the default.
			</p>
			<div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
				<button
					className="ds-btn amber"
					style={{ borderRadius: "7px 0 0 7px", borderRight: "1px solid rgba(255,255,255,.3)" }}
				>
					{action}
				</button>
				<button
					className="ds-btn amber"
					style={{ borderRadius: "0 7px 7px 0", padding: "7px 8px" }}
					onClick={() => setDropOpen(!dropOpen)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						width="12"
						height="12"
						style={{ transform: dropOpen ? "rotate(180deg)" : "", transition: "transform .15s" }}
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				{dropOpen && (
					<div
						className="ds-popover"
						style={{ top: "100%", right: 0, marginTop: 6, minWidth: 220 }}
					>
						{[
							"Advance to Screening",
							"Advance to Interview",
							"Advance to Offer",
							"Move to Wishlist",
							"Archive",
						].map((a) => (
							<div
								key={a}
								className="ds-popover-item"
								onClick={() => {
									setAction(a);
									setDropOpen(false);
								}}
							>
								{a}
								{a === action && (
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="var(--amber)"
										strokeWidth="2.5"
										width="12"
										height="12"
										style={{ marginLeft: "auto" }}
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</DSSubsection>
	);
}

/* ─── Copy to Clipboard ─── */
function CopyClipboardSection() {
	const [copied, setCopied] = React.useState({});

	const doCopy = (key, text) => {
		navigator.clipboard.writeText(text).catch(() => {});
		setCopied((c) => ({ ...c, [key]: true }));
		setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 2000);
	};

	const items = [
		{
			key: "url",
			label: "Job posting URL",
			value: "https://automattic.com/work-with-us/experienced-software-engineer/",
		},
		{ key: "email", label: "Recruiter email", value: "maya.chen@automattic.com" },
		{ key: "ref", label: "Application ID", value: "JD-2026-0417-AUTO" },
	];

	return (
		<DSSubsection title="Copy to Clipboard">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				One-click copy with animated checkmark feedback. Reverts after 2 seconds.
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 500 }}>
				{items.map((item) => (
					<div
						key={item.key}
						className="glass"
						style={{
							padding: "8px 12px",
							borderRadius: 8,
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-4)",
									letterSpacing: ".06em",
									textTransform: "uppercase",
									fontWeight: 700,
								}}
							>
								{item.label}
							</div>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 12,
									color: "var(--ink-2)",
									marginTop: 2,
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{item.value}
							</div>
						</div>
						<button
							className={`ds-icbtn ${copied[item.key] ? "active" : ""}`}
							style={{ width: 28, height: 28, transition: "all .2s" }}
							onClick={() => doCopy(item.key, item.value)}
						>
							{copied[item.key] ? (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--green)"
									strokeWidth="2.5"
									width="13"
									height="13"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							) : (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="13"
									height="13"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
							)}
						</button>
					</div>
				))}
			</div>
		</DSSubsection>
	);
}

/* ─── Autocomplete / Combobox ─── */
function AutocompleteSection() {
	const [query, setQuery] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState(null);
	const companies = [
		"Automattic",
		"Stripe",
		"Linear",
		"Vercel",
		"Supabase",
		"Raycast",
		"Notion",
		"Figma",
		"GitHub",
		"GitLab",
		"Shopify",
		"Netlify",
		"Railway",
		"Planetscale",
		"Neon",
	];
	const recent = ["Automattic", "Stripe", "Linear"];
	const filtered = query
		? companies.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
		: [];
	const ref = React.useRef(null);

	React.useEffect(() => {
		const close = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, []);

	return (
		<DSSubsection title="Autocomplete / Combobox">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				Type to search with suggestions. Shows recent items when empty and focused. Keyboard
				navigable.
			</p>
			<div ref={ref} className="ds-field" style={{ maxWidth: 360, position: "relative" }}>
				<label className="ds-label">Company</label>
				<div className="ds-input-wrap">
					{selected && (
						<div
							style={{
								width: 20,
								height: 20,
								borderRadius: 5,
								background: "var(--ink)",
								color: "var(--cream)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontFamily: "var(--display)",
								fontWeight: 800,
								fontSize: 9,
								flexShrink: 0,
							}}
						>
							{selected[0]}
						</div>
					)}
					<input
						className="ds-input"
						placeholder="Search companies…"
						value={selected || query}
						onFocus={() => setOpen(true)}
						onChange={(e) => {
							setQuery(e.target.value);
							setSelected(null);
							setOpen(true);
						}}
					/>
					{(selected || query) && (
						<span
							style={{ cursor: "pointer", color: "var(--ink-4)", fontSize: 14 }}
							onClick={() => {
								setQuery("");
								setSelected(null);
							}}
						>
							×
						</span>
					)}
				</div>
				{open && (
					<div className="ds-dropdown" style={{ maxHeight: 240, overflowY: "auto" }}>
						{!query && (
							<>
								<div
									style={{
										fontFamily: "var(--mono)",
										fontSize: 9,
										color: "var(--ink-4)",
										letterSpacing: ".08em",
										textTransform: "uppercase",
										fontWeight: 700,
										padding: "8px 10px 4px",
									}}
								>
									Recent
								</div>
								{recent.map((c) => (
									<div
										key={c}
										className="ds-dropdown-item"
										onClick={() => {
											setSelected(c);
											setOpen(false);
											setQuery("");
										}}
									>
										<div
											style={{
												width: 22,
												height: 22,
												borderRadius: 6,
												background: "var(--ink)",
												color: "var(--cream)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "var(--display)",
												fontWeight: 800,
												fontSize: 9,
											}}
										>
											{c[0]}
										</div>
										{c}
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="var(--ink-4)"
											strokeWidth="2"
											width="11"
											height="11"
											style={{ marginLeft: "auto" }}
										>
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</div>
								))}
							</>
						)}
						{query &&
							filtered.length > 0 &&
							filtered.map((c) => (
								<div
									key={c}
									className="ds-dropdown-item"
									onClick={() => {
										setSelected(c);
										setOpen(false);
										setQuery("");
									}}
								>
									<div
										style={{
											width: 22,
											height: 22,
											borderRadius: 6,
											background: "var(--ink)",
											color: "var(--cream)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontFamily: "var(--display)",
											fontWeight: 800,
											fontSize: 9,
										}}
									>
										{c[0]}
									</div>
									{c}
								</div>
							))}
						{query && filtered.length === 0 && (
							<div style={{ padding: "14px 12px", textAlign: "center" }}>
								<div style={{ fontSize: 12, color: "var(--ink-4)" }}>No company found</div>
								<button
									className="ds-btn"
									style={{ marginTop: 8, fontSize: 11 }}
									onClick={() => {
										setSelected(query);
										setOpen(false);
										setQuery("");
									}}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										width="11"
										height="11"
									>
										<path d="M12 5v14M5 12h14" />
									</svg>
									Add "{query}" as new
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</DSSubsection>
	);
}

function InteractionsSection() {
	return (
		<div>
			<SheetSection />
			<InlineConfirmSection />
			<SplitButtonSection />
			<CopyClipboardSection />
			<AutocompleteSection />
		</div>
	);
}

Object.assign(window, { InteractionsSection });
