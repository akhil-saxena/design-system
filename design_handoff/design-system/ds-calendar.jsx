/* ═══ CALENDAR VIEW — polished ═══ */

const CAL_EVENTS = [
	{ day: 3, label: "Stripe phone call", color: "var(--blue-vivid)", time: "10:00 AM" },
	{ day: 7, label: "Linear onsite", color: "var(--purple-vivid)", time: "1:00 PM" },
	{ day: 12, label: "Figma panel", color: "var(--green-vivid)", time: "3:30 PM" },
	{ day: 15, label: "Take-home due", color: "var(--red-vivid)", time: "EOD" },
	{ day: 18, label: "Automattic chat", color: "var(--amber-vivid)", time: "11:00 AM" },
	{ day: 22, label: "Offer deadline", color: "var(--green-vivid)", time: "EOD" },
	{ day: 25, label: "Team lunch", color: "var(--blue-vivid)", time: "12:30 PM" },
];

function CalendarViewSection() {
	const [selectedDay, setSelectedDay] = React.useState(12);
	const [viewMode, setViewMode] = React.useState("month");

	// April 2026 starts on Wednesday (index 3 in Mon-first grid)
	const startOffset = 2; // 0=Mon start, Wed = 2 blanks
	const daysInMonth = 30;
	const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
	const cells = Array.from({ length: totalCells }, (_, i) => {
		const d = i - startOffset + 1;
		return d >= 1 && d <= daysInMonth ? d : null;
	});

	const eventsFor = (d) => CAL_EVENTS.filter((e) => e.day === d);

	return (
		<div>
			<DSSubsection title="Month Calendar">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Interactive month grid with event chips. Click a day to select. Today is highlighted in
					amber. View mode toggle for month/week/day.
				</p>
				<div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
					{/* Header */}
					<div
						style={{
							padding: "14px 20px",
							borderBottom: "1px solid var(--rule)",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<button className="ds-icbtn" style={{ width: 28, height: 28 }}>
								<svg
									viewBox="0 0 24 24"
									width="14"
									height="14"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polyline points="15 18 9 12 15 6" />
								</svg>
							</button>
							<span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16 }}>
								April 2026
							</span>
							<button className="ds-icbtn" style={{ width: 28, height: 28 }}>
								<svg
									viewBox="0 0 24 24"
									width="14"
									height="14"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
						</div>
						<div
							style={{
								display: "flex",
								gap: 2,
								background: "var(--cream-2)",
								borderRadius: 7,
								padding: 2,
							}}
						>
							{["month", "week", "day"].map((m) => (
								<button
									key={m}
									className={`ds-filter-pill ${viewMode === m ? "active" : ""}`}
									onClick={() => setViewMode(m)}
									style={{ textTransform: "capitalize" }}
								>
									{m}
								</button>
							))}
						</div>
					</div>

					{/* Weekday headers */}
					<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
						{weekDays.map((d) => (
							<div
								key={d}
								style={{
									padding: "8px",
									textAlign: "center",
									fontFamily: "var(--mono)",
									fontSize: 9.5,
									color: "var(--ink-4)",
									letterSpacing: ".06em",
									textTransform: "uppercase",
									fontWeight: 600,
									borderBottom: "1px solid var(--rule)",
								}}
							>
								{d}
							</div>
						))}
					</div>

					{/* Day grid */}
					<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
						{cells.map((d, i) => {
							const events = d ? eventsFor(d) : [];
							const isToday = d === 25;
							const isSel = d === selectedDay;
							return (
								<div
									key={i}
									style={{
										minHeight: 76,
										padding: "4px 5px",
										borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--rule)" : "none",
										borderBottom: i < totalCells - 7 ? "1px solid var(--rule)" : "none",
										cursor: d ? "pointer" : "default",
										background: isSel ? "rgba(245,158,11,.04)" : "transparent",
										opacity: d ? 1 : 0.15,
										transition: "background .12s",
									}}
									onClick={() => d && setSelectedDay(d)}
									onMouseOver={(e) => {
										if (d && !isSel) e.currentTarget.style.background = "rgba(0,0,0,.015)";
									}}
									onMouseOut={(e) => {
										if (d && !isSel) e.currentTarget.style.background = "";
									}}
								>
									{d && (
										<>
											<div
												style={{
													width: 24,
													height: 24,
													borderRadius: "50%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontSize: 11,
													fontWeight: isToday || isSel ? 700 : 500,
													background: isToday
														? "var(--amber)"
														: isSel
															? "var(--ink)"
															: "transparent",
													color: isToday || isSel ? "#fff" : "var(--ink-2)",
													fontFamily: "var(--mono)",
													transition: "all .15s",
												}}
											>
												{d}
											</div>
											{events.map((ev, j) => (
												<div
													key={j}
													style={{
														fontSize: 9.5,
														fontWeight: 600,
														padding: "2px 5px",
														borderRadius: 4,
														background: `${ev.color}15`,
														borderLeft: `2px solid ${ev.color}`,
														marginTop: 3,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
														color: "var(--ink-2)",
													}}
												>
													{ev.label}
												</div>
											))}
										</>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Mini Calendar + Event List">
				<div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
					{/* Mini */}
					<div className="glass" style={{ borderRadius: 14, padding: 14 }}>
						<div
							style={{
								fontFamily: "var(--display)",
								fontWeight: 700,
								fontSize: 13,
								marginBottom: 10,
								textAlign: "center",
							}}
						>
							April 2026
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(7, 1fr)",
								gap: 1,
								textAlign: "center",
							}}
						>
							{weekDays.map((d) => (
								<div
									key={d}
									style={{
										fontFamily: "var(--mono)",
										fontSize: 8,
										color: "var(--ink-4)",
										padding: 2,
										fontWeight: 600,
									}}
								>
									{d[0]}
								</div>
							))}
							{/* offset blanks */}
							{Array.from({ length: startOffset }, (_, i) => (
								<div key={`b${i}`} />
							))}
							{Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
								const hasEv = CAL_EVENTS.some((e) => e.day === d);
								const isSel = d === selectedDay;
								return (
									<div
										key={d}
										onClick={() => setSelectedDay(d)}
										style={{
											width: 24,
											height: 24,
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 10,
											fontWeight: isSel ? 700 : 400,
											cursor: "pointer",
											position: "relative",
											margin: "0 auto",
											background: isSel ? "var(--amber)" : "transparent",
											color: isSel ? "#fff" : "var(--ink-2)",
											transition: "all .12s",
										}}
									>
										{d}
										{hasEv && !isSel && (
											<span
												style={{
													position: "absolute",
													bottom: 1,
													width: 3,
													height: 3,
													borderRadius: "50%",
													background: "var(--amber)",
												}}
											/>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* Event list */}
					<div className="glass" style={{ borderRadius: 14, padding: 16 }}>
						<div
							style={{
								fontFamily: "var(--display)",
								fontWeight: 700,
								fontSize: 14,
								marginBottom: 14,
							}}
						>
							Upcoming Events
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{CAL_EVENTS.map((ev, i) => (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 12,
										padding: "8px 10px",
										borderRadius: 8,
										borderLeft: `3px solid ${ev.color}`,
										transition: "background .12s",
										background: ev.day === selectedDay ? "rgba(245,158,11,.05)" : "transparent",
									}}
									onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.02)")}
									onMouseOut={(e) =>
										(e.currentTarget.style.background =
											ev.day === selectedDay ? "rgba(245,158,11,.05)" : "")
									}
									onClick={() => setSelectedDay(ev.day)}
								>
									<div
										style={{
											fontFamily: "var(--mono)",
											fontSize: 20,
											fontWeight: 800,
											color: "var(--ink-3)",
											width: 30,
											textAlign: "center",
										}}
									>
										{ev.day}
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontWeight: 600, fontSize: 12.5 }}>{ev.label}</div>
										<div
											style={{
												fontFamily: "var(--mono)",
												fontSize: 10,
												color: "var(--ink-4)",
												marginTop: 1,
											}}
										>
											Apr {ev.day} · {ev.time}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { CalendarViewSection });
