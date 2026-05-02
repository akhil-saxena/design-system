/* ═══ STEPPER / WIZARD — polished ═══ */

function StepperHz({ steps, current = 0 }) {
	return (
		<div style={{ display: "flex", alignItems: "center" }}>
			{steps.map((step, i) => {
				const status = i < current ? "done" : i === current ? "active" : "pending";
				const dotBg =
					status === "done"
						? "var(--green-vivid)"
						: status === "active"
							? "var(--amber)"
							: "var(--cream-2)";
				const dotColor = status === "pending" ? "var(--ink-4)" : "#fff";
				const dotBorder = status === "pending" ? "2px solid var(--ink-5)" : "none";
				return (
					<React.Fragment key={i}>
						<div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
							<div
								style={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background: dotBg,
									color: dotColor,
									border: dotBorder,
									fontSize: 11,
									fontWeight: 700,
									fontFamily: "var(--mono)",
									transition: "all .25s ease",
								}}
							>
								{status === "done" ? (
									<svg
										viewBox="0 0 24 24"
										width="13"
										height="13"
										fill="none"
										stroke="#fff"
										strokeWidth="3"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								) : (
									i + 1
								)}
							</div>
							<div>
								<div
									style={{
										fontFamily: "var(--display)",
										fontWeight: status === "pending" ? 500 : 700,
										fontSize: 12.5,
										color: status === "pending" ? "var(--ink-4)" : "var(--ink)",
										transition: "color .15s",
									}}
								>
									{step.label}
								</div>
								{step.desc && (
									<div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>
										{step.desc}
									</div>
								)}
							</div>
						</div>
						{i < steps.length - 1 && (
							<div
								style={{
									flex: 1,
									height: 2,
									margin: "0 12px",
									minWidth: 20,
									borderRadius: 1,
									background: i < current ? "var(--green-vivid)" : "var(--cream-2)",
									transition: "background .3s",
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
}

function StepperVt({ steps, current = 0 }) {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			{steps.map((step, i) => {
				const status = i < current ? "done" : i === current ? "active" : "pending";
				const dotBg =
					status === "done"
						? "var(--green-vivid)"
						: status === "active"
							? "var(--amber)"
							: "transparent";
				const dotColor = status === "pending" ? "var(--ink-4)" : "#fff";
				const dotBorder = status === "pending" ? "2px solid var(--ink-5)" : "2px solid transparent";
				return (
					<div key={i} style={{ display: "flex", gap: 14 }}>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								flexShrink: 0,
							}}
						>
							<div
								style={{
									width: 24,
									height: 24,
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background: dotBg,
									color: dotColor,
									border: dotBorder,
									fontSize: 10,
									fontWeight: 700,
									fontFamily: "var(--mono)",
									transition: "all .2s",
								}}
							>
								{status === "done" ? (
									<svg
										viewBox="0 0 24 24"
										width="11"
										height="11"
										fill="none"
										stroke="#fff"
										strokeWidth="3"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								) : (
									i + 1
								)}
							</div>
							{i < steps.length - 1 && (
								<div
									style={{
										width: 2,
										flex: 1,
										minHeight: 20,
										background: i < current ? "var(--green-vivid)" : "var(--cream-2)",
										margin: "4px 0",
										borderRadius: 1,
										transition: "background .2s",
									}}
								/>
							)}
						</div>
						<div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
							<div
								style={{
									fontFamily: "var(--display)",
									fontWeight: status === "pending" ? 500 : 700,
									fontSize: 13,
									color: status === "pending" ? "var(--ink-4)" : "var(--ink)",
									paddingTop: 2,
								}}
							>
								{step.label}
							</div>
							{step.desc && (
								<div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>
									{step.desc}
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function WizardSection() {
	const [step, setStep] = React.useState(1);
	const steps = [
		{ label: "Company Info", desc: "Name, role, URL" },
		{ label: "Application", desc: "Resume, cover letter" },
		{ label: "Status", desc: "Stage & priority" },
		{ label: "Review", desc: "Confirm & save" },
	];

	return (
		<div>
			<DSSubsection title="Horizontal Stepper">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Progress indicator for multi-step flows. Green checkmark on completed steps, amber on
					active. Click Next/Back to see transitions.
				</p>
				<div className="glass" style={{ padding: 24, borderRadius: 14 }}>
					<StepperHz steps={steps} current={step} />
					<div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
						<button
							className="ds-btn"
							disabled={step <= 0}
							onClick={() => setStep(Math.max(0, step - 1))}
						>
							← Back
						</button>
						<button
							className="ds-btn amber"
							onClick={() => setStep(Math.min(steps.length, step + 1))}
						>
							{step >= steps.length ? "✓ Done" : "Next →"}
						</button>
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Vertical Stepper">
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
					<div className="glass" style={{ padding: 20, borderRadius: 14 }}>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-4)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 600,
								marginBottom: 14,
							}}
						>
							Form wizard
						</div>
						<StepperVt steps={steps} current={2} />
					</div>
					<div className="glass" style={{ padding: 20, borderRadius: 14 }}>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-4)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 600,
								marginBottom: 14,
							}}
						>
							Pipeline tracker
						</div>
						<StepperVt
							steps={[
								{ label: "Applied", desc: "Mar 12, 2026" },
								{ label: "Phone Screen", desc: "Mar 18, 2026" },
								{ label: "Technical Interview", desc: "Scheduled Mar 25" },
								{ label: "Onsite", desc: "Pending" },
								{ label: "Offer", desc: "Pending" },
							]}
							current={2}
						/>
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Compact Progress Bar">
				<div className="glass" style={{ padding: 20, borderRadius: 14, maxWidth: 480 }}>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-3)",
								textTransform: "uppercase",
								letterSpacing: ".06em",
								fontWeight: 600,
							}}
						>
							Step 2 of 4 — Application
						</span>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--amber-d)",
								fontWeight: 700,
							}}
						>
							50%
						</span>
					</div>
					<div
						style={{ height: 6, background: "var(--cream-2)", borderRadius: 3, overflow: "hidden" }}
					>
						<div
							style={{
								width: "50%",
								height: "100%",
								background: "linear-gradient(90deg, var(--amber), var(--amber-d))",
								borderRadius: 3,
								transition: "width .3s ease",
							}}
						/>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { WizardSection });
