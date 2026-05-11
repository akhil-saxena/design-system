import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useEffect,
	useId,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Button, type ButtonVariant } from "../../inputs/Button";
import { Kbd } from "../../inputs/Kbd";
import { TextInput } from "../../inputs/TextInput";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ConfirmDialogTone = "danger" | "warn" | "success" | "neutral";

// ─── Tone config ─────────────────────────────────────────────────────────────

const tones: Record<ConfirmDialogTone, { color: string; bg: string; icon: ReactNode }> = {
	danger: {
		color: "var(--red)",
		bg: "rgba(239,68,68,.1)",
		icon: (
			<svg
				aria-hidden="true"
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
				aria-hidden="true"
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
				aria-hidden="true"
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
				aria-hidden="true"
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

// ─── Tone → button mapping ────────────────────────────────────────────────────

const toneButtonStyle: Record<
	ConfirmDialogTone,
	{ variant: ButtonVariant; style?: CSSProperties }
> = {
	danger: { variant: "danger", style: { background: "var(--red)", borderColor: "var(--red)" } },
	warn: { variant: "primary", style: undefined },
	success: {
		variant: "primary",
		style: { background: "var(--amber-d)", borderColor: "var(--amber-d)", color: "#fff" },
	},
	neutral: {
		variant: "secondary",
		style: { background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" },
	},
};

// ─── Shared panel style ───────────────────────────────────────────────────────

const panelStyle: CSSProperties = {
	width: 360,
	background: "rgba(255,255,255,.97)", // intentionally NOT the cream token — always-light (CONSTRAINT-010)
	backdropFilter: "blur(14px)",
	WebkitBackdropFilter: "blur(14px)",
	borderRadius: 14,
	border: "1px solid var(--rule)",
	padding: 22,
	boxShadow: "0 16px 48px rgba(0,0,0,.18)",
};

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
	/** Controls visibility; returns null when false. */
	open: boolean;
	/** Called when the user cancels (Escape key or Cancel button). */
	onClose: () => void;
	/** Called when the user confirms (Enter key or Confirm button). */
	onConfirm: () => void;
	/** Visual tone — controls icon, icon bg, and confirm button style. */
	tone?: ConfirmDialogTone;
	/** Dialog heading. */
	title: ReactNode;
	/** Optional body text below the heading. */
	body?: ReactNode;
	/** Label for the confirm button.
	 * @default "Confirm"
	 */
	confirmLabel?: string;
	/** Label for the cancel button.
	 * @default "Cancel"
	 */
	cancelLabel?: string;
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	tone = "danger",
	title,
	body,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
}: ConfirmDialogProps) {
	// Callback-ref pattern: panel state flips from null to the DOM node when
	// React commits it. Passing the node (not a RefObject) into useFocusTrap
	// guarantees the trap engages exactly when the portal commits its child.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = body ? generatedDescId : undefined;

	useFocusTrap(panel, open);

	// Document-level keyboard handler (T-018-02-02: cleanup removes listener on unmount)
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
			if (e.key === "Enter") onConfirm(); // T-018-02-03: no guard needed; ConfirmDialog always allows Enter
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose, onConfirm]);

	if (!open) return null;

	// Backdrop click does NOT close ConfirmDialog (all tones require explicit action)
	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target !== e.currentTarget) return;
		// closeOnBackdropClick=false for all ConfirmDialog tones — explicit Cancel/Confirm required
	}

	const t = tones[tone];
	const btnConfig = toneButtonStyle[tone];

	return (
		<DSPortal>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={setPanel}
					className="ds-atom-confirm-panel"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					tabIndex={-1}
					style={panelStyle}
				>
					{/* Header row: icon area + text block */}
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
								id={titleId}
								style={{
									fontFamily: "var(--display)",
									fontWeight: 700,
									fontSize: 15,
									marginBottom: 5,
								}}
							>
								{title}
							</div>
							{body ? (
								<div id={descId} style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
									{body}
								</div>
							) : null}
						</div>
					</div>

					{/* Footer */}
					<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
						<Button variant="ghost" onClick={onClose}>
							{cancelLabel}
						</Button>
						<Button variant={btnConfig.variant} style={btnConfig.style} onClick={onConfirm}>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</div>
		</DSPortal>
	);
}

// ─── TypeToConfirm ────────────────────────────────────────────────────────────

export interface TypeToConfirmProps {
	/** Controls visibility; returns null when false. */
	open: boolean;
	/** Called when the user cancels (Escape key or Cancel button). */
	onClose: () => void;
	/** Called when the user confirms (Enter key when ok, or Confirm button). */
	onConfirm: () => void;
	/** Dialog heading. */
	title: ReactNode;
	/** Optional body text below the heading. */
	body?: ReactNode;
	/** Word the user must type exactly (case-sensitive, no trim) to enable confirm.
	 * @default "DELETE"
	 */
	guardWord?: string;
	/** Label for the confirm button.
	 * @default "Delete forever"
	 */
	confirmLabel?: string;
	/** Label for the cancel button.
	 * @default "Cancel"
	 */
	cancelLabel?: string;
}

export function TypeToConfirm({
	open,
	onClose,
	onConfirm,
	title,
	body,
	guardWord = "DELETE",
	confirmLabel = "Delete forever",
	cancelLabel = "Cancel",
}: TypeToConfirmProps) {
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const [v, setV] = useState("");
	const ok = v === guardWord; // NO trim, case-sensitive — CONSTRAINT-013
	const generatedTitleId = useId();
	const titleId = title ? generatedTitleId : undefined;

	useFocusTrap(panel, open);

	// Document-level keyboard handler (T-018-02-02: cleanup removes listener on unmount)
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
			if (e.key === "Enter" && ok) onConfirm(); // T-018-02-03: Enter only fires when ok===true
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose, onConfirm, ok]);

	// Reset input value when dialog closes
	useEffect(() => {
		if (!open) setV("");
	}, [open]);

	if (!open) return null;

	// Backdrop click does NOT close TypeToConfirm — explicit action required
	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target !== e.currentTarget) return;
	}

	return (
		<DSPortal>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={setPanel}
					className="ds-atom-confirm-panel"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby={titleId}
					tabIndex={-1}
					style={panelStyle}
				>
					{/* Title */}
					<div
						id={titleId}
						style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 5 }}
					>
						{title}
					</div>

					{/* Body */}
					{body ? (
						<div
							style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 12 }}
						>
							{body}
						</div>
					) : null}

					{/* Hint row */}
					<div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>
						Type <Kbd size="sm">{guardWord}</Kbd> to confirm
					</div>

					{/* Type-to-confirm input */}
					<TextInput
						value={v}
						onChange={(e) => setV(e.target.value)}
						placeholder={`Type ${guardWord}`}
						style={{ width: "100%", marginBottom: 14 }}
					/>

					{/* Footer */}
					<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
						<Button variant="ghost" onClick={onClose}>
							{cancelLabel}
						</Button>
						<Button
							variant="danger"
							disabled={!ok}
							style={
								!ok
									? { background: "var(--ink-5)", opacity: 0.6, borderColor: "transparent" }
									: { background: "var(--red)", borderColor: "transparent" }
							}
							onClick={onConfirm}
						>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</div>
		</DSPortal>
	);
}
