/* ═══ HOVER CARDS / PREVIEW POPOVERS ═══ */

function HoverCard({ trigger, children, side = "bottom" }) {
	const [open, setOpen] = React.useState(false);
	const timer = React.useRef(null);

	const onEnter = () => {
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setOpen(true), 350);
	};
	const onLeave = () => {
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setOpen(false), 150);
	};

	const sideStyles = {
		bottom: { top: "100%", left: 0, marginTop: 8 },
		top: { bottom: "100%", left: 0, marginBottom: 8 },
		right: { left: "100%", top: 0, marginLeft: 8 },
	};

	return (
		<span
			style={{ position: "relative", display: "inline-block" }}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
		>
			{trigger}
			<div
				style={{
					position: "absolute",
					...sideStyles[side],
					opacity: open ? 1 : 0,
					transform: open ? "translateY(0)" : "translateY(-4px)",
					pointerEvents: open ? "auto" : "none",
					transition: "opacity .15s, transform .15s",
					zIndex: 50,
					width: 280,
				}}
			>
				<div
					style={{
						background: "rgba(255,255,255,.97)",
						backdropFilter: "blur(14px)",
						borderRadius: 12,
						border: "1px solid var(--rule)",
						boxShadow: "0 12px 32px rgba(0,0,0,.12)",
						padding: 14,
					}}
				>
					{children}
				</div>
			</div>
		</span>
	);
}

function HoverCardSection() {
	return (
		<div>
			<DSSubsection title="Hover Cards & Preview Popovers">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Rich content on hover — more than a tooltip. Use a 350ms open delay to filter out
					passing-through cursors; close instantly when the cursor leaves both trigger and card.
				</p>

				<StateRow label="User card — preview on @mention">
					<div
						style={{
							fontSize: 13,
							color: "var(--ink-2)",
							padding: 12,
							background: "var(--surf-1)",
							borderRadius: 8,
							border: "1px solid var(--rule)",
							minHeight: 200,
						}}
					>
						Anya brought this candidate in — hover over{" "}
						<HoverCard
							trigger={
								<span
									style={{
										color: "var(--amber-d)",
										fontWeight: 600,
										cursor: "pointer",
										borderBottom: "1px dashed var(--amber)",
									}}
								>
									@anya.patel
								</span>
							}
						>
							<div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
								<div
									style={{
										width: 44,
										height: 44,
										borderRadius: "50%",
										background: "linear-gradient(135deg, #f59e0b, #b45309)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#fff",
										fontWeight: 700,
										fontSize: 16,
									}}
								>
									AP
								</div>
								<div>
									<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
										Anya Patel
									</div>
									<div style={{ fontSize: 11, color: "var(--ink-3)" }}>Recruiter · Stripe</div>
								</div>
							</div>
							<div
								style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 10 }}
							>
								Senior recruiter focused on staff+ engineering. Met at SF Tech Mixer in Feb.
							</div>
							<div style={{ display: "flex", gap: 6 }}>
								<button className="ds-btn dark" style={{ fontSize: 11, padding: "4px 10px" }}>
									Message
								</button>
								<button className="ds-btn" style={{ fontSize: 11, padding: "4px 10px" }}>
									Profile
								</button>
							</div>
						</HoverCard>{" "}
						to see her details. Click for full profile.
					</div>
				</StateRow>

				<StateRow label="Job card — preview on link">
					<div
						style={{
							fontSize: 13,
							color: "var(--ink-2)",
							padding: 12,
							background: "var(--surf-1)",
							borderRadius: 8,
							border: "1px solid var(--rule)",
							minHeight: 240,
						}}
					>
						Applied to{" "}
						<HoverCard
							trigger={
								<span
									style={{
										color: "var(--blue)",
										fontWeight: 600,
										cursor: "pointer",
										textDecoration: "underline",
									}}
								>
									Staff Engineer at Stripe
								</span>
							}
						>
							<div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
								<div
									style={{
										width: 36,
										height: 36,
										borderRadius: 8,
										background: "#635bff",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#fff",
										fontFamily: "var(--display)",
										fontWeight: 800,
										fontSize: 14,
									}}
								>
									S
								</div>
								<div>
									<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
										Staff Engineer
									</div>
									<div style={{ fontSize: 11, color: "var(--ink-3)" }}>Stripe · San Francisco</div>
								</div>
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: 8,
									marginBottom: 10,
									padding: 10,
									background: "var(--cream-2)",
									borderRadius: 8,
								}}
							>
								<div>
									<div
										style={{
											fontSize: 9.5,
											color: "var(--ink-3)",
											fontFamily: "var(--mono)",
											textTransform: "uppercase",
											letterSpacing: ".06em",
										}}
									>
										Salary
									</div>
									<div style={{ fontWeight: 700, fontSize: 12, marginTop: 2 }}>$210–280k</div>
								</div>
								<div>
									<div
										style={{
											fontSize: 9.5,
											color: "var(--ink-3)",
											fontFamily: "var(--mono)",
											textTransform: "uppercase",
											letterSpacing: ".06em",
										}}
									>
										Stage
									</div>
									<div style={{ fontWeight: 700, fontSize: 12, marginTop: 2 }}>Onsite</div>
								</div>
								<div>
									<div
										style={{
											fontSize: 9.5,
											color: "var(--ink-3)",
											fontFamily: "var(--mono)",
											textTransform: "uppercase",
											letterSpacing: ".06em",
										}}
									>
										Posted
									</div>
									<div style={{ fontWeight: 700, fontSize: 12, marginTop: 2 }}>5d ago</div>
								</div>
							</div>
							<div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
								Lead infrastructure team building payments primitives. Remote OK with quarterly
								onsites.
							</div>
						</HoverCard>{" "}
						two weeks ago.
					</div>
				</StateRow>

				<StateRow label="Stat preview — chart in hover">
					<div
						style={{
							fontSize: 13,
							color: "var(--ink-2)",
							padding: 12,
							background: "var(--surf-1)",
							borderRadius: 8,
							border: "1px solid var(--rule)",
							minHeight: 200,
						}}
					>
						Your{" "}
						<HoverCard
							trigger={
								<span
									style={{
										color: "var(--green)",
										fontWeight: 700,
										cursor: "pointer",
										borderBottom: "1px dashed var(--green)",
									}}
								>
									response rate (28%)
								</span>
							}
						>
							<div
								style={{
									fontFamily: "var(--display)",
									fontWeight: 700,
									fontSize: 14,
									marginBottom: 4,
								}}
							>
								Response rate trend
							</div>
							<div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 10 }}>
								Last 8 weeks · ↑ 6pp vs prior period
							</div>
							<svg viewBox="0 0 240 60" width="100%" height="60" style={{ display: "block" }}>
								<polyline
									points="0,45 30,42 60,38 90,40 120,32 150,28 180,22 210,18 240,15"
									fill="none"
									stroke="var(--green)"
									strokeWidth="2"
								/>
								<polyline
									points="0,45 30,42 60,38 90,40 120,32 150,28 180,22 210,18 240,15 240,60 0,60"
									fill="rgba(34,197,94,.12)"
									stroke="none"
								/>
							</svg>
						</HoverCard>{" "}
						is 12pp above category average — keep pushing on cold outreach.
					</div>
				</StateRow>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { HoverCard, HoverCardSection });
