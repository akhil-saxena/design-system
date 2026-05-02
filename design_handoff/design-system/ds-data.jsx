/* ═══ TABLES, TABS, NAV, DRAG & DROP, TOASTS, PROGRESS, AVATARS ═══ */

function TablesSection() {
	const [sort, setSort] = React.useState({ col: "company", asc: true });
	const data = [
		{
			company: "Automattic",
			role: "Experienced Software Engineer",
			stage: "Applied",
			stageColor: "var(--blue)",
			prio: "Medium",
			prioColor: "var(--amber)",
			date: "Apr 16",
			days: "8d",
		},
		{
			company: "Stripe",
			role: "Staff Engineer, Payments",
			stage: "Wishlist",
			stageColor: "var(--ink-4)",
			prio: "High",
			prioColor: "var(--red)",
			date: "Apr 12",
			days: "12d",
		},
		{
			company: "Linear",
			role: "Product Engineer",
			stage: "Applied",
			stageColor: "var(--blue)",
			prio: "High",
			prioColor: "var(--red)",
			date: "Apr 14",
			days: "10d",
		},
		{
			company: "Raycast",
			role: "Senior macOS Engineer",
			stage: "Screening",
			stageColor: "var(--purple)",
			prio: "Medium",
			prioColor: "var(--amber)",
			date: "Apr 10",
			days: "14d",
		},
		{
			company: "Supabase",
			role: "Full Stack Engineer",
			stage: "Interviewing",
			stageColor: "var(--amber)",
			prio: "High",
			prioColor: "var(--red)",
			date: "Apr 4",
			days: "20d",
		},
	];
	const sorted = [...data].sort((a, b) => {
		const v = a[sort.col] < b[sort.col] ? -1 : 1;
		return sort.asc ? v : -v;
	});

	const SortHead = ({ col, children }) => (
		<th
			onClick={() => setSort((s) => ({ col, asc: s.col === col ? !s.asc : true }))}
			style={{ cursor: "pointer", userSelect: "none" }}
		>
			<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
				{children}
				{sort.col === col && <span style={{ fontSize: 9 }}>{sort.asc ? "▲" : "▼"}</span>}
			</span>
		</th>
	);

	return (
		<DSSubsection title="Data Table">
			<div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
				<table className="ds-table">
					<thead>
						<tr>
							<SortHead col="company">Company</SortHead>
							<SortHead col="role">Role</SortHead>
							<SortHead col="stage">Stage</SortHead>
							<SortHead col="prio">Priority</SortHead>
							<SortHead col="date">Applied</SortHead>
							<th>Age</th>
						</tr>
					</thead>
					<tbody>
						{sorted.map((r) => (
							<tr key={r.company}>
								<td style={{ fontWeight: 600 }}>{r.company}</td>
								<td>{r.role}</td>
								<td>
									<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
										<span
											style={{ width: 7, height: 7, borderRadius: "50%", background: r.stageColor }}
										/>
										{r.stage}
									</span>
								</td>
								<td>
									<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
										<span
											style={{ width: 6, height: 6, borderRadius: "50%", background: r.prioColor }}
										/>
										{r.prio}
									</span>
								</td>
								<td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{r.date}</td>
								<td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
									{r.days}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</DSSubsection>
	);
}

function TabsSection() {
	const [tab1, setTab1] = React.useState(0);
	const [tab2, setTab2] = React.useState(0);
	const tabs = ["Overview", "Interviews", "JD", "Docs", "Timeline"];
	const counts = [null, 2, null, 3, null];
	const pillTabs = ["All", "Active", "Archived", "Starred"];

	return (
		<div>
			<DSSubsection title="Underline Tabs">
				<div style={{ borderBottom: "1px solid var(--rule)", display: "flex", gap: 2 }}>
					{tabs.map((t, i) => (
						<div
							key={t}
							onClick={() => setTab1(i)}
							style={{
								padding: "10px 16px",
								fontSize: 13,
								fontFamily: "var(--display)",
								fontWeight: tab1 === i ? 700 : 500,
								color: tab1 === i ? "var(--ink)" : "var(--ink-3)",
								cursor: "pointer",
								borderBottom: tab1 === i ? "2px solid var(--amber)" : "2px solid transparent",
								display: "flex",
								alignItems: "center",
								gap: 6,
								transition: "color .15s",
							}}
						>
							{t}
							{counts[i] && (
								<span
									style={{
										fontFamily: "var(--mono)",
										fontSize: 10,
										padding: "1px 5px",
										borderRadius: 4,
										background: tab1 === i ? "var(--amber-l)" : "var(--cream-2)",
										color: tab1 === i ? "var(--amber-d)" : "var(--ink-3)",
										fontWeight: 500,
									}}
								>
									{counts[i]}
								</span>
							)}
						</div>
					))}
				</div>
				<div
					className="glass"
					style={{
						padding: 16,
						borderRadius: "0 0 10px 10px",
						fontSize: 13,
						color: "var(--ink-2)",
					}}
				>
					Content for: <b>{tabs[tab1]}</b>
				</div>
			</DSSubsection>

			<DSSubsection title="Pill Tabs">
				<div
					style={{
						display: "flex",
						gap: 4,
						background: "var(--cream-2)",
						borderRadius: 10,
						padding: 3,
						width: "fit-content",
					}}
				>
					{pillTabs.map((t, i) => (
						<div
							key={t}
							onClick={() => setTab2(i)}
							style={{
								padding: "6px 14px",
								borderRadius: 8,
								fontSize: 12,
								fontWeight: 600,
								cursor: "pointer",
								transition: "all .15s",
								background: tab2 === i ? "var(--ink)" : "transparent",
								color: tab2 === i ? "var(--cream)" : "var(--ink-3)",
							}}
						>
							{t}
						</div>
					))}
				</div>
			</DSSubsection>

			<DSSubsection title="Navigation Rail">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 4,
						width: 56,
						background: "var(--surf-2)",
						borderRadius: 12,
						padding: 8,
						border: "1px solid var(--rule)",
					}}
				>
					{[
						{
							label: "Board",
							active: true,
							icon: (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="16"
									height="16"
								>
									<rect x="3" y="3" width="7" height="7" />
									<rect x="14" y="3" width="7" height="7" />
									<rect x="3" y="14" width="7" height="7" />
									<rect x="14" y="14" width="7" height="7" />
								</svg>
							),
						},
						{
							label: "List",
							icon: (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="16"
									height="16"
								>
									<line x1="8" y1="6" x2="21" y2="6" />
									<line x1="8" y1="12" x2="21" y2="12" />
									<line x1="8" y1="18" x2="21" y2="18" />
								</svg>
							),
						},
						{
							label: "Cal",
							icon: (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="16"
									height="16"
								>
									<rect x="3" y="4" width="18" height="18" rx="2" />
								</svg>
							),
						},
						{
							label: "Stats",
							icon: (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="16"
									height="16"
								>
									<path d="M3 3v18h18" />
									<path d="M7 12l4-4 4 4 6-6" />
								</svg>
							),
						},
					].map((n) => (
						<div
							key={n.label}
							style={{
								width: 40,
								height: 40,
								borderRadius: 9,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								background: n.active ? "var(--ink)" : "transparent",
								color: n.active ? "var(--cream)" : "var(--ink-3)",
							}}
						>
							{n.icon}
						</div>
					))}
				</div>
			</DSSubsection>
		</div>
	);
}

function DragDropSection() {
	const init = [
		{ id: 1, text: "Recruiter intro with Maya Chen", time: "Apr 24 · 2pm" },
		{ id: 2, text: "Technical screen", time: "Apr 29 · TBD" },
		{ id: 3, text: "Trial project kickoff", time: "May 08 · TBD" },
		{ id: 4, text: "Final round panel", time: "May 15 · TBD" },
	];
	const [items, setItems] = React.useState(init);
	const [dragging, setDragging] = React.useState(null);
	const [over, setOver] = React.useState(null);

	const onDragStart = (i) => setDragging(i);
	const onDragOver = (e, i) => {
		e.preventDefault();
		setOver(i);
	};
	const onDrop = (i) => {
		if (dragging === null) return;
		const arr = [...items];
		const [moved] = arr.splice(dragging, 1);
		arr.splice(i, 0, moved);
		setItems(arr);
		setDragging(null);
		setOver(null);
	};

	return (
		<DSSubsection title="Drag & Drop List">
			<div style={{ maxWidth: 440 }}>
				{items.map((item, i) => (
					<div
						key={item.id}
						draggable
						onDragStart={() => onDragStart(i)}
						onDragOver={(e) => onDragOver(e, i)}
						onDrop={() => onDrop(i)}
						onDragEnd={() => {
							setDragging(null);
							setOver(null);
						}}
						className="glass"
						style={{
							padding: "10px 14px",
							borderRadius: 8,
							marginBottom: 6,
							display: "flex",
							alignItems: "center",
							gap: 12,
							cursor: "grab",
							opacity: dragging === i ? 0.5 : 1,
							borderColor: over === i && dragging !== i ? "var(--amber)" : undefined,
							transition: "border-color .1s, opacity .1s",
						}}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--ink-4)"
							strokeWidth="2"
							width="14"
							height="14"
							style={{ flexShrink: 0 }}
						>
							<circle cx="9" cy="6" r="1" />
							<circle cx="15" cy="6" r="1" />
							<circle cx="9" cy="12" r="1" />
							<circle cx="15" cy="12" r="1" />
							<circle cx="9" cy="18" r="1" />
							<circle cx="15" cy="18" r="1" />
						</svg>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: 13, fontWeight: 600 }}>{item.text}</div>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 10,
									color: "var(--ink-3)",
									marginTop: 2,
								}}
							>
								{item.time}
							</div>
						</div>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-4)",
								background: "var(--cream-2)",
								padding: "2px 6px",
								borderRadius: 4,
							}}
						>
							#{i + 1}
						</span>
					</div>
				))}
			</div>
		</DSSubsection>
	);
}

function FeedbackSection() {
	const [toasts, setToasts] = React.useState([]);
	const addToast = (type) => {
		const id = Date.now();
		const msgs = {
			success: "Application saved successfully",
			error: "Failed to update stage",
			info: "Recruiter intro in 30 minutes",
			warning: "Trial project deadline approaching",
		};
		setToasts((t) => [...t, { id, type, msg: msgs[type] }]);
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
	};

	return (
		<div>
			<DSSubsection title="Toast Notifications">
				<div style={{ display: "flex", gap: 8 }}>
					<button
						className="ds-btn"
						onClick={() => addToast("success")}
						style={{ borderColor: "rgba(34,197,94,.3)" }}
					>
						✓ Success
					</button>
					<button
						className="ds-btn"
						onClick={() => addToast("error")}
						style={{ borderColor: "rgba(239,68,68,.3)" }}
					>
						✕ Error
					</button>
					<button className="ds-btn" onClick={() => addToast("info")}>
						ℹ Info
					</button>
					<button
						className="ds-btn"
						onClick={() => addToast("warning")}
						style={{ borderColor: "rgba(245,158,11,.3)" }}
					>
						⚠ Warning
					</button>
				</div>
				<div
					style={{
						position: "fixed",
						top: 16,
						right: 16,
						zIndex: 200,
						display: "flex",
						flexDirection: "column",
						gap: 8,
						width: 320,
					}}
				>
					{toasts.map((t) => (
						<div key={t.id} className={`ds-toast ds-toast-${t.type}`}>
							<span className="ds-toast-icon">
								{t.type === "success" && "✓"}
								{t.type === "error" && "✕"}
								{t.type === "info" && "ℹ"}
								{t.type === "warning" && "⚠"}
							</span>
							<span style={{ flex: 1 }}>{t.msg}</span>
							<span
								style={{ cursor: "pointer", color: "var(--ink-4)" }}
								onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
							>
								×
							</span>
						</div>
					))}
				</div>
			</DSSubsection>

			<DSSubsection title="Progress & Loading">
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								marginBottom: 6,
								letterSpacing: ".05em",
								textTransform: "uppercase",
							}}
						>
							Application completeness
						</div>
						<div
							style={{
								height: 6,
								background: "var(--cream-2)",
								borderRadius: 3,
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: "72%",
									height: "100%",
									background: "linear-gradient(90deg,var(--amber),var(--amber-d))",
									borderRadius: 3,
									transition: "width .5s",
								}}
							/>
						</div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--amber-d)",
								marginTop: 4,
							}}
						>
							72% complete
						</div>
					</div>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								marginBottom: 6,
								letterSpacing: ".05em",
								textTransform: "uppercase",
							}}
						>
							Fit score
						</div>
						<div
							style={{
								height: 6,
								background: "var(--cream-2)",
								borderRadius: 3,
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: "78%",
									height: "100%",
									background: "linear-gradient(90deg,#22c55e,#16a34a)",
									borderRadius: 3,
								}}
							/>
						</div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--green)",
								marginTop: 4,
							}}
						>
							78% · strong
						</div>
					</div>
					<div style={{ display: "flex", gap: 20, alignItems: "center" }}>
						<div className="ds-spinner-lg" />
						<span className="spinner" />
						<div style={{ display: "flex", gap: 4 }}>
							<div className="ds-dot-pulse" />
							<div className="ds-dot-pulse" style={{ animationDelay: ".2s" }} />
							<div className="ds-dot-pulse" style={{ animationDelay: ".4s" }} />
						</div>
						<span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
							Loading states
						</span>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

function AvatarsSection() {
	const avatars = [
		{
			initials: "MC",
			bg: "linear-gradient(145deg,#3b82f6,#1d4ed8)",
			name: "Maya Chen",
			role: "Recruiter",
		},
		{
			initials: "DS",
			bg: "linear-gradient(145deg,#8b5cf6,#6d28d9)",
			name: "David Swanson",
			role: "Eng Manager",
		},
		{
			initials: "JK",
			bg: "linear-gradient(145deg,#22c55e,#15803d)",
			name: "Jake Kim",
			role: "Senior Engineer",
		},
		{
			initials: "AP",
			bg: "linear-gradient(145deg,#c4a484,#a0826d)",
			name: "Alex Park",
			role: "You",
		},
	];

	return (
		<div>
			<DSSubsection title="Avatars">
				<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
					{[40, 32, 28, 24].map((s, i) => (
						<div
							key={s}
							style={{
								width: s,
								height: s,
								borderRadius: "50%",
								background: avatars[i].bg,
								color: "#fff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: s * 0.35,
								fontWeight: 700,
							}}
						>
							{avatars[i].initials}
						</div>
					))}
				</div>
			</DSSubsection>

			<DSSubsection title="Avatar Stack">
				<div style={{ display: "flex" }}>
					{avatars.map((a, i) => (
						<div
							key={a.initials}
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								background: a.bg,
								color: "#fff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 11,
								fontWeight: 700,
								marginLeft: i > 0 ? -8 : 0,
								border: "2px solid var(--cream)",
								position: "relative",
								zIndex: avatars.length - i,
							}}
						>
							{a.initials}
						</div>
					))}
					<div
						style={{
							width: 32,
							height: 32,
							borderRadius: "50%",
							background: "var(--cream-2)",
							color: "var(--ink-3)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 10,
							fontWeight: 700,
							marginLeft: -8,
							border: "2px solid var(--cream)",
						}}
					>
						+3
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Contact Row">
				<div style={{ maxWidth: 320 }}>
					{avatars.slice(0, 3).map((a) => (
						<div
							key={a.initials}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "8px 10px",
								borderRadius: 8,
								cursor: "pointer",
							}}
							onMouseOver={(e) => (e.currentTarget.style.background = "var(--surf-1)")}
							onMouseOut={(e) => (e.currentTarget.style.background = "")}
						>
							<div
								style={{
									width: 32,
									height: 32,
									borderRadius: "50%",
									background: a.bg,
									color: "#fff",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontWeight: 700,
									fontSize: 11,
								}}
							>
								{a.initials}
							</div>
							<div>
								<div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
								<div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{a.role}</div>
							</div>
						</div>
					))}
				</div>
			</DSSubsection>

			<DSSubsection title="Presence Indicator">
				<div style={{ display: "flex", gap: 16 }}>
					{[
						{ ...avatars[0], status: "online", color: "#22c55e" },
						{ ...avatars[1], status: "away", color: "#f59e0b" },
						{ ...avatars[2], status: "offline", color: "var(--ink-5)" },
					].map((a) => (
						<div key={a.initials} style={{ position: "relative", display: "inline-block" }}>
							<div
								style={{
									width: 36,
									height: 36,
									borderRadius: "50%",
									background: a.bg,
									color: "#fff",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontWeight: 700,
									fontSize: 12,
								}}
							>
								{a.initials}
							</div>
							<div
								style={{
									position: "absolute",
									bottom: -1,
									right: -1,
									width: 12,
									height: 12,
									borderRadius: "50%",
									background: a.color,
									border: "2px solid var(--cream)",
								}}
							/>
							<div
								style={{
									textAlign: "center",
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-3)",
									marginTop: 4,
								}}
							>
								{a.status}
							</div>
						</div>
					))}
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, {
	TablesSection,
	TabsSection,
	DragDropSection,
	FeedbackSection,
	AvatarsSection,
});
