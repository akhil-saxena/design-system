/* ═══ HORIZONTAL TIMELINE ═══ */

function HorizontalTimeline({ events, current = 1 }) {
	return (
		<div style={{ width: "100%", position: "relative", padding: "20px 0" }}>
			<div
				style={{
					position: "absolute",
					top: 32,
					left: "5%",
					right: "5%",
					height: 2,
					background: "var(--ink-5)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 32,
					left: "5%",
					height: 2,
					background: "var(--amber)",
					width: `${(current / (events.length - 1)) * 90}%`,
					transition: "width .4s",
				}}
			/>
			<div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
				{events.map((e, i) => {
					const isPast = i < current;
					const isCurrent = i === current;
					return (
						<div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-3)",
									letterSpacing: ".08em",
									textTransform: "uppercase",
									marginBottom: 8,
									fontWeight: 600,
								}}
							>
								{e.date}
							</div>
							<div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
								<div
									style={{
										width: isCurrent ? 18 : 14,
										height: isCurrent ? 18 : 14,
										borderRadius: "50%",
										background: isPast || isCurrent ? "var(--amber)" : "#fff",
										border: `2px solid ${isPast || isCurrent ? "var(--amber)" : "var(--ink-5)"}`,
										boxShadow: isCurrent ? "0 0 0 4px rgba(245,158,11,.2)" : "none",
										transition: "all .2s",
									}}
								/>
							</div>
							<div
								style={{
									fontWeight: 700,
									fontSize: 12,
									color: isPast || isCurrent ? "var(--ink)" : "var(--ink-3)",
								}}
							>
								{e.label}
							</div>
							{e.detail && (
								<div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{e.detail}</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function MilestoneTimeline() {
	return (
		<div style={{ width: "100%", position: "relative", padding: "24px 0" }}>
			<div
				style={{
					position: "absolute",
					top: 38,
					left: 24,
					right: 24,
					height: 4,
					background: "var(--cream-2)",
					borderRadius: 2,
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 38,
					left: 24,
					height: 4,
					background: "linear-gradient(90deg, var(--amber), var(--amber-d))",
					borderRadius: 2,
					width: "55%",
				}}
			/>
			<div style={{ display: "flex", position: "relative" }}>
				{[
					{ x: "5%", label: "Applied", done: true },
					{ x: "25%", label: "Phone screen", done: true },
					{ x: "50%", label: "Onsite", done: true, current: true },
					{ x: "75%", label: "Offer", done: false },
					{ x: "95%", label: "Hired", done: false, milestone: true },
				].map((m, i) => (
					<div
						key={i}
						style={{
							position: "absolute",
							left: m.x,
							top: 0,
							transform: "translateX(-50%)",
							textAlign: "center",
							width: 80,
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								height: 38,
								alignItems: "flex-end",
							}}
						>
							{m.milestone ? (
								<svg
									viewBox="0 0 24 24"
									width="22"
									height="22"
									style={{ color: m.done ? "var(--amber)" : "var(--ink-5)" }}
								>
									<polygon
										points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9"
										fill="currentColor"
									/>
								</svg>
							) : (
								<div
									style={{
										width: m.current ? 20 : 14,
										height: m.current ? 20 : 14,
										borderRadius: "50%",
										background: m.done ? "var(--amber)" : "#fff",
										border: `2px solid ${m.done ? "var(--amber)" : "var(--ink-5)"}`,
										boxShadow: m.current ? "0 0 0 4px rgba(245,158,11,.2)" : "none",
									}}
								/>
							)}
						</div>
						<div
							style={{
								fontWeight: 700,
								fontSize: 11,
								color: m.done ? "var(--ink)" : "var(--ink-3)",
								marginTop: 8,
							}}
						>
							{m.label}
						</div>
					</div>
				))}
			</div>
			<div style={{ height: 90 }} />
		</div>
	);
}

function HorizontalTimelineSection() {
	return (
		<div>
			<DSSubsection title="Horizontal Timeline">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Time-anchored progressions across the horizontal axis. Use for application stages, project
					phases, or onboarding journeys.
				</p>

				<StateRow label="Stage progression">
					<div style={{ width: "100%" }}>
						<HorizontalTimeline
							current={2}
							events={[
								{ date: "Mar 4", label: "Applied", detail: "via referral" },
								{ date: "Mar 11", label: "Recruiter call" },
								{ date: "Mar 18", label: "Tech screen", detail: "in progress" },
								{ date: "Mar 25", label: "Onsite" },
								{ date: "Apr 2", label: "Decision" },
							]}
						/>
					</div>
				</StateRow>

				<StateRow label="With milestone marker">
					<div style={{ width: "100%" }}>
						<MilestoneTimeline />
					</div>
				</StateRow>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { HorizontalTimeline, MilestoneTimeline, HorizontalTimelineSection });
