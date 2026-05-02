/* ═══ CONFIRMATION DIALOGS ═══ */

function ConfirmDialog({
	tone = "neutral",
	title,
	body,
	confirm,
	cancel = "Cancel",
	onConfirm,
	onCancel,
}) {
	const tones = {
		danger: {
			color: "var(--red)",
			bg: "rgba(239,68,68,.1)",
			icon: (
				<svg
					viewBox="0 0 24 24"
					width="22"
					height="22"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
			),
		},
		warn: {
			color: "var(--amber-d)",
			bg: "rgba(245,158,11,.12)",
			icon: (
				<svg
					viewBox="0 0 24 24"
					width="22"
					height="22"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			),
		},
		success: {
			color: "var(--green)",
			bg: "rgba(34,197,94,.1)",
			icon: (
				<svg
					viewBox="0 0 24 24"
					width="22"
					height="22"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
			),
		},
		neutral: {
			color: "var(--ink)",
			bg: "rgba(0,0,0,.05)",
			icon: (
				<svg
					viewBox="0 0 24 24"
					width="22"
					height="22"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="16" x2="12" y2="12" />
					<line x1="12" y1="8" x2="12.01" y2="8" />
				</svg>
			),
		},
	};
	const t = tones[tone];
	const btnClass =
		tone === "danger" ? "ds-btn" : tone === "success" ? "ds-btn amber" : "ds-btn dark";

	return (
		<div
			style={{
				width: 360,
				background: "rgba(255,255,255,.97)",
				backdropFilter: "blur(14px)",
				borderRadius: 14,
				border: "1px solid var(--rule)",
				padding: 22,
				boxShadow: "0 16px 48px rgba(0,0,0,.18)",
			}}
		>
			<div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
				<div
					style={{
						width: 40,
						height: 40,
						borderRadius: 10,
						background: t.bg,
						color: t.color,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					{t.icon}
				</div>
				<div style={{ flex: 1, paddingTop: 2 }}>
					<div
						style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 5 }}
					>
						{title}
					</div>
					<div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{body}</div>
				</div>
			</div>
			<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
				<button className="ds-btn" onClick={onCancel}>
					{cancel}
				</button>
				<button
					className={btnClass}
					onClick={onConfirm}
					style={
						tone === "danger"
							? { background: "var(--red)", color: "#fff", borderColor: "var(--red)" }
							: {}
					}
				>
					{confirm}
				</button>
			</div>
		</div>
	);
}

function TypeToConfirm() {
	const [v, setV] = React.useState("");
	const target = "DELETE";
	const ok = v === target;
	return (
		<div
			style={{
				width: 360,
				background: "rgba(255,255,255,.97)",
				backdropFilter: "blur(14px)",
				borderRadius: 14,
				border: "1px solid var(--rule)",
				padding: 22,
				boxShadow: "0 16px 48px rgba(0,0,0,.18)",
			}}
		>
			<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
				Delete account?
			</div>
			<div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 14 }}>
				This will permanently delete your account, all 47 applications, and 12 saved searches. This
				cannot be undone.
			</div>
			<div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>
				Type <span className="ds-kbd">{target}</span> to confirm
			</div>
			<input
				className="ds-input"
				value={v}
				onChange={(e) => setV(e.target.value)}
				placeholder="Type DELETE"
				style={{ width: "100%", marginBottom: 14 }}
			/>
			<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
				<button className="ds-btn">Cancel</button>
				<button
					className="ds-btn"
					disabled={!ok}
					style={{
						background: ok ? "var(--red)" : "var(--ink-5)",
						color: "#fff",
						borderColor: "transparent",
						opacity: ok ? 1 : 0.6,
					}}
				>
					Delete forever
				</button>
			</div>
		</div>
	);
}

function ConfirmDialogSection() {
	const noop = () => {};
	return (
		<div>
			<DSSubsection title="Confirmation Dialogs">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Pause-and-confirm patterns. Match the icon, color, and primary-button tone to the
					consequence — destructive in red, neutral in ink.
				</p>

				<StateRow label="Destructive — losing data">
					<ConfirmDialog
						tone="danger"
						title="Withdraw application?"
						body="You'll lose all notes and interview history for this Stripe role. Reapplying later starts a new entry."
						confirm="Yes, withdraw"
						onConfirm={noop}
						onCancel={noop}
					/>
				</StateRow>

				<StateRow label="Warning — caution but not destructive">
					<ConfirmDialog
						tone="warn"
						title="Move 12 applications to archive?"
						body="Archived applications stop receiving follow-up reminders. You can restore them at any time."
						confirm="Archive all"
						onConfirm={noop}
						onCancel={noop}
					/>
				</StateRow>

				<StateRow label="Neutral — confirm an action">
					<ConfirmDialog
						tone="neutral"
						title="Send to recruiter?"
						body="Anya Patel will receive your resume and cover letter at anya@stripe.com."
						confirm="Send"
						onConfirm={noop}
						onCancel={noop}
					/>
				</StateRow>

				<StateRow label="Success-toned — for affirmative actions">
					<ConfirmDialog
						tone="success"
						title="Mark as accepted?"
						body="Congrats! This moves the role to your active stack and pauses other applications."
						confirm="Accept offer"
						onConfirm={noop}
						onCancel={noop}
					/>
				</StateRow>

				<StateRow label="Type-to-confirm — for irreversible high-stakes">
					<TypeToConfirm />
				</StateRow>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { ConfirmDialog, TypeToConfirm, ConfirmDialogSection });
