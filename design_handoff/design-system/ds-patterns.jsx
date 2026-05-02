/* ═══ PATTERNS — Timeline, stepper wizard, notification inbox, filter bar, file upload ═══ */

function TimelineSection() {
	return (
		<DSSubsection title="Activity Timeline">
			<div className="glass" style={{ padding: "20px 24px", borderRadius: 14 }}>
				<div className="ds-timeline">
					{[
						{
							when: "Apr 24 · 2pm",
							title: "Recruiter intro with Maya Chen",
							desc: "30-min Google Meet. Prep doc attached.",
							status: "upcoming",
							chips: ["Google Meet", "30 min"],
						},
						{
							when: "Apr 18 · 3:14pm",
							title: "Recruiter reached out",
							desc: "Maya Chen emailed to schedule a recruiter screen. Replied same day.",
							status: "done",
						},
						{
							when: "Apr 16 · 9:02am",
							title: "Application submitted",
							desc: "Via Company Website. Resume v5 and Cover letter v3 attached.",
							status: "done",
							chips: ["Resume v5", "Cover v3"],
						},
						{
							when: "Apr 15 · 10:22pm",
							title: "Tailored resume",
							desc: "Emphasized async comms, WP ecosystem familiarity.",
							status: "done",
						},
						{
							when: "Mar 28 · 11:40am",
							title: "Saved to board",
							desc: "Tagged as high priority.",
							status: "done",
						},
					].map((ev, i) => (
						<div key={i} className={`ds-tl-ev ${ev.status}`}>
							<div className="ds-tl-dot" />
							<div className="ds-tl-when">{ev.when}</div>
							<div className="ds-tl-body">
								<div className="ds-tl-title">{ev.title}</div>
								<div className="ds-tl-desc">{ev.desc}</div>
								{ev.chips && (
									<div style={{ display: "flex", gap: 6, marginTop: 6 }}>
										{ev.chips.map((c) => (
											<span
												key={c}
												className="ds-chip"
												style={{ fontSize: 10, padding: "2px 8px" }}
											>
												{c}
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</DSSubsection>
	);
}

function StepperSection() {
	const [step, setStep] = React.useState(1);
	const steps = ["Basic Info", "Job Details", "Documents", "Review"];

	return (
		<DSSubsection title="Stepper / Wizard">
			<div className="glass" style={{ padding: 24, borderRadius: 14 }}>
				{/* Stepper header */}
				<div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
					{steps.map((s, i) => (
						<React.Fragment key={s}>
							{i > 0 && (
								<div
									style={{
										flex: 1,
										height: 2,
										background: i <= step ? "var(--amber)" : "var(--ink-5)",
										transition: "background .3s",
										margin: "0 4px",
									}}
								/>
							)}
							<div
								style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
								onClick={() => setStep(i)}
							>
								<div
									style={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontFamily: "var(--mono)",
										fontSize: 11,
										fontWeight: 700,
										transition: "all .2s",
										background:
											i < step ? "var(--amber)" : i === step ? "var(--ink)" : "var(--cream-2)",
										color: i <= step ? (i < step ? "#fff" : "var(--cream)") : "var(--ink-4)",
									}}
								>
									{i < step ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="#fff"
											strokeWidth="3"
											width="12"
											height="12"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									) : (
										i + 1
									)}
								</div>
								<span
									style={{
										fontFamily: "var(--display)",
										fontSize: 12,
										fontWeight: i === step ? 700 : 500,
										color: i <= step ? "var(--ink)" : "var(--ink-4)",
										whiteSpace: "nowrap",
									}}
								>
									{s}
								</span>
							</div>
						</React.Fragment>
					))}
				</div>

				{/* Step content */}
				<div style={{ padding: "16px 0", minHeight: 100, borderTop: "1px solid var(--rule)" }}>
					{step === 0 && (
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
							<div className="ds-field">
								<label className="ds-label">Company</label>
								<input className="ds-input" placeholder="e.g. Stripe" />
							</div>
							<div className="ds-field">
								<label className="ds-label">Role</label>
								<input className="ds-input" placeholder="e.g. Staff Engineer" />
							</div>
						</div>
					)}
					{step === 1 && (
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
							<div className="ds-field">
								<label className="ds-label">Location</label>
								<input className="ds-input" placeholder="Remote" />
							</div>
							<div className="ds-field">
								<label className="ds-label">Min salary</label>
								<input
									className="ds-input"
									placeholder="$70,000"
									style={{ fontFamily: "var(--mono)" }}
								/>
							</div>
							<div className="ds-field">
								<label className="ds-label">Max salary</label>
								<input
									className="ds-input"
									placeholder="$170,000"
									style={{ fontFamily: "var(--mono)" }}
								/>
							</div>
						</div>
					)}
					{step === 2 && (
						<div style={{ textAlign: "center", padding: 20 }}>
							<FileUploadZone />
						</div>
					)}
					{step === 3 && (
						<div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
							Review all details before saving. Everything looks good — click{" "}
							<b>Save Application</b> below.
						</div>
					)}
				</div>

				{/* Nav */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						paddingTop: 14,
						borderTop: "1px solid var(--rule)",
					}}
				>
					<button className="ds-btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
						← Back
					</button>
					<div style={{ display: "flex", gap: 8 }}>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-4)",
								alignSelf: "center",
							}}
						>
							Step {step + 1} of {steps.length}
						</span>
						{step < steps.length - 1 ? (
							<button className="ds-btn dark" onClick={() => setStep((s) => s + 1)}>
								Next →
							</button>
						) : (
							<button className="ds-btn amber">Save Application</button>
						)}
					</div>
				</div>
			</div>
		</DSSubsection>
	);
}

function FileUploadZone() {
	const [files, setFiles] = React.useState([
		{ name: "Resume_v5.pdf", size: "168 KB", progress: 100 },
	]);
	const [dragging, setDragging] = React.useState(false);

	const addFile = () => {
		const newFile = { name: "Cover_letter_v3.md", size: "8 KB", progress: 0 };
		setFiles((f) => [...f, newFile]);
		// Animate progress
		let p = 0;
		const interval = setInterval(() => {
			p += Math.random() * 25 + 5;
			if (p >= 100) {
				p = 100;
				clearInterval(interval);
			}
			setFiles((f) =>
				f.map((fi) =>
					fi.name === newFile.name ? { ...fi, progress: Math.min(100, Math.round(p)) } : fi,
				),
			);
		}, 200);
	};

	return (
		<div>
			<div
				className={`ds-upload-zone ${dragging ? "dragging" : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					addFile();
				}}
				onClick={addFile}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke={dragging ? "var(--amber)" : "var(--ink-4)"}
					strokeWidth="1.5"
					width="32"
					height="32"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				<div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14, marginTop: 8 }}>
					{dragging ? "Drop to upload" : "Drop files here or click to browse"}
				</div>
				<div
					style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", marginTop: 4 }}
				>
					PDF, DOCX, MD · Max 10MB
				</div>
			</div>

			{files.length > 0 && (
				<div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
					{files.map((f) => (
						<div
							key={f.name}
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
									width: 36,
									height: 44,
									borderRadius: 6,
									background: "#fff",
									border: "1px solid var(--rule)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									position: "relative",
								}}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--ink-3)"
									strokeWidth="1.5"
									width="16"
									height="16"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
								</svg>
								<span
									style={{
										position: "absolute",
										top: -4,
										right: -4,
										fontFamily: "var(--mono)",
										fontSize: 7.5,
										background: "var(--ink)",
										color: "var(--cream)",
										padding: "1px 4px",
										borderRadius: 3,
										fontWeight: 700,
									}}
								>
									{f.name.split(".").pop().toUpperCase()}
								</span>
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: 13,
										fontWeight: 600,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{f.name}
								</div>
								<div
									style={{
										fontFamily: "var(--mono)",
										fontSize: 10,
										color: "var(--ink-3)",
										marginTop: 2,
									}}
								>
									{f.size}
								</div>
								{f.progress < 100 && (
									<div
										style={{
											height: 3,
											background: "var(--cream-2)",
											borderRadius: 2,
											marginTop: 4,
											overflow: "hidden",
										}}
									>
										<div
											style={{
												height: "100%",
												width: `${f.progress}%`,
												background: "var(--amber)",
												borderRadius: 2,
												transition: "width .2s",
											}}
										/>
									</div>
								)}
							</div>
							{f.progress === 100 ? (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--green)"
									strokeWidth="2"
									width="16"
									height="16"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							) : (
								<span
									style={{
										fontFamily: "var(--mono)",
										fontSize: 10,
										color: "var(--amber-d)",
										fontWeight: 600,
									}}
								>
									{f.progress}%
								</span>
							)}
							<button className="ds-icbtn" style={{ width: 24, height: 24 }}>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									width="11"
									height="11"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function NotificationSection() {
	const [notifications, setNotifications] = React.useState([
		{
			id: 1,
			type: "interview",
			title: "Recruiter intro in 30 minutes",
			desc: "Automattic · Maya Chen · Google Meet",
			time: "30m",
			unread: true,
		},
		{
			id: 2,
			type: "update",
			title: "Raycast moved to Screening",
			desc: "Stage updated automatically from email",
			time: "2h",
			unread: true,
		},
		{
			id: 3,
			type: "reminder",
			title: "Follow up on Linear application",
			desc: "No response for 7 days",
			time: "5h",
			unread: false,
		},
		{
			id: 4,
			type: "doc",
			title: "Resume v5 uploaded",
			desc: "Attached to Automattic application",
			time: "1d",
			unread: false,
		},
	]);

	const markRead = (id) =>
		setNotifications((n) => n.map((x) => (x.id === id ? { ...x, unread: false } : x)));
	const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, unread: false })));

	const typeIcon = (type) => {
		switch (type) {
			case "interview":
				return {
					bg: "rgba(59,130,246,.12)",
					color: "var(--blue)",
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="14"
							height="14"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
						</svg>
					),
				};
			case "update":
				return {
					bg: "rgba(139,92,246,.12)",
					color: "var(--purple)",
					icon: (
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
					),
				};
			case "reminder":
				return {
					bg: "var(--amber-l)",
					color: "var(--amber-d)",
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="14"
							height="14"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
					),
				};
			case "doc":
				return {
					bg: "rgba(34,197,94,.1)",
					color: "var(--green)",
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							width="14"
							height="14"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						</svg>
					),
				};
			default:
				return { bg: "var(--cream-2)", color: "var(--ink-3)", icon: null };
		}
	};

	return (
		<DSSubsection title="Notification Inbox">
			<div className="glass" style={{ borderRadius: 14, overflow: "hidden", maxWidth: 440 }}>
				<div
					style={{
						padding: "12px 16px",
						borderBottom: "1px solid var(--rule)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
						Notifications
					</span>
					<button
						className="ds-btn ghost"
						style={{ fontSize: 11, padding: "3px 8px" }}
						onClick={markAllRead}
					>
						Mark all read
					</button>
				</div>
				{notifications.map((n) => {
					const ti = typeIcon(n.type);
					return (
						<div
							key={n.id}
							onClick={() => markRead(n.id)}
							style={{
								padding: "12px 16px",
								display: "flex",
								gap: 12,
								cursor: "pointer",
								borderBottom: "1px solid rgba(0,0,0,.03)",
								background: n.unread ? "rgba(245,158,11,.03)" : "transparent",
								transition: "background .15s",
							}}
							onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.02)")}
							onMouseOut={(e) =>
								(e.currentTarget.style.background = n.unread ? "rgba(245,158,11,.03)" : "")
							}
						>
							<div
								style={{
									width: 32,
									height: 32,
									borderRadius: 8,
									background: ti.bg,
									color: ti.color,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								{ti.icon}
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: 13,
										fontWeight: n.unread ? 600 : 400,
										display: "flex",
										alignItems: "center",
										gap: 6,
									}}
								>
									{n.title}
									{n.unread && (
										<span
											style={{
												width: 6,
												height: 6,
												borderRadius: "50%",
												background: "var(--amber)",
												flexShrink: 0,
											}}
										/>
									)}
								</div>
								<div
									style={{
										fontSize: 11.5,
										color: "var(--ink-3)",
										marginTop: 2,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{n.desc}
								</div>
							</div>
							<span
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9.5,
									color: "var(--ink-4)",
									flexShrink: 0,
									marginTop: 2,
								}}
							>
								{n.time}
							</span>
						</div>
					);
				})}
			</div>
		</DSSubsection>
	);
}

function FilterBarSection() {
	const [filters, setFilters] = React.useState({ stage: "All", prio: "All", remote: false });
	const [search, setSearch] = React.useState("");

	return (
		<DSSubsection title="Filter Bar">
			<div
				className="glass"
				style={{
					padding: "10px 14px",
					borderRadius: 10,
					display: "flex",
					alignItems: "center",
					gap: 10,
					flexWrap: "wrap",
				}}
			>
				{/* Search */}
				<div className="ds-input-wrap" style={{ flex: "1 1 200px", minWidth: 160 }}>
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
					<input
						className="ds-input"
						placeholder="Filter applications…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{ fontSize: 12 }}
					/>
					{search && (
						<span
							style={{ cursor: "pointer", color: "var(--ink-4)", fontSize: 14 }}
							onClick={() => setSearch("")}
						>
							×
						</span>
					)}
				</div>

				<div style={{ width: 1, height: 24, background: "var(--rule)" }} />

				{/* Stage pills */}
				<div
					style={{
						display: "flex",
						gap: 3,
						background: "var(--cream-2)",
						borderRadius: 7,
						padding: 2,
					}}
				>
					{["All", "Applied", "Screening", "Interviewing"].map((s) => (
						<button
							key={s}
							onClick={() => setFilters((f) => ({ ...f, stage: s }))}
							className={`ds-filter-pill ${filters.stage === s ? "active" : ""}`}
						>
							{s}
						</button>
					))}
				</div>

				{/* Priority */}
				<div
					style={{
						display: "flex",
						gap: 3,
						background: "var(--cream-2)",
						borderRadius: 7,
						padding: 2,
					}}
				>
					{["All", "High", "Medium", "Low"].map((p) => (
						<button
							key={p}
							onClick={() => setFilters((f) => ({ ...f, prio: p }))}
							className={`ds-filter-pill ${filters.prio === p ? "active" : ""}`}
						>
							{p}
						</button>
					))}
				</div>

				{/* Remote toggle */}
				<label className="ds-check-label" style={{ fontSize: 11, gap: 6 }}>
					<div
						className={`ds-toggle ${filters.remote ? "on" : ""}`}
						style={{ width: 30, height: 16, padding: 2 }}
						onClick={() => setFilters((f) => ({ ...f, remote: !f.remote }))}
					>
						<div className="ds-toggle-thumb" style={{ width: 12, height: 12 }} />
					</div>
					Remote only
				</label>

				{/* Active filter count */}
				{(filters.stage !== "All" || filters.prio !== "All" || filters.remote || search) && (
					<button
						className="ds-btn ghost"
						style={{ fontSize: 10, padding: "3px 8px", color: "var(--red)" }}
						onClick={() => {
							setFilters({ stage: "All", prio: "All", remote: false });
							setSearch("");
						}}
					>
						Clear all
					</button>
				)}
			</div>
		</DSSubsection>
	);
}

function PatternsSection() {
	return (
		<div>
			<TimelineSection />
			<StepperSection />
			<FilterBarSection />
			<NotificationSection />
		</div>
	);
}

function FileUploadSection() {
	return (
		<DSSubsection title="File Upload with Progress">
			<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>
				Drag and drop or click to upload. Progress bar animates on each new file. File type badge
				auto-detected.
			</p>
			<FileUploadZone />
		</DSSubsection>
	);
}

Object.assign(window, { PatternsSection, FileUploadSection, FileUploadZone });
