import {
	type CSSProperties,
	type FormEvent as ReactFormEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type Ref,
	useEffect,
	useId,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useDismiss } from "../../hooks/useDismiss";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Button, type ButtonVariant } from "../../inputs/Button";
import { Kbd } from "../../inputs/Kbd";
import { TextInput } from "../../inputs/TextInput";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Semantic tone of the confirmation.
 *
 * `"warning"` is the system-wide spelling — AlertBanner and Toast both use it.
 * This component shipped `"warn"`, so that spelling is retained as a deprecated
 * alias and behaves identically; prefer `"warning"` in new code.
 *
 * `"danger"` is deliberately *not* renamed to `"error"`: this tone selects the
 * confirm button's appearance, and it maps onto `ButtonVariant["danger"]`. An
 * irreversible action is a danger, not a reported error.
 */
export type ConfirmDialogTone = "danger" | "warning" | "success" | "neutral" | "warn";

/** The tones the lookup tables are keyed by, once the `"warn"` alias is folded in. */
type CanonicalTone = Exclude<ConfirmDialogTone, "warn">;

const normalizeTone = (tone: ConfirmDialogTone): CanonicalTone =>
	tone === "warn" ? "warning" : tone;

// ─── Tone config ─────────────────────────────────────────────────────────────

const tones: Record<CanonicalTone, { color: string; bg: string; icon: ReactNode }> = {
	danger: {
		color: "var(--red)",
		// --red is inherited by monochrome deliberately ("Destructive is inherited,
		// not redefined"), so the ink was already token-driven; the WASH was the
		// hardcoded half. --red-bg is a real tint in both modes (#f4e0dd / #2e1a18).
		bg: "var(--red-bg)",
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
	warning: {
		color: "var(--amber-d)",
		// No amber TINT token survives monochrome: --amber-l, --amber-soft and
		// --amber-warm all collapse to the solid --ochre accent there, which would
		// paint a solid ochre block behind ochre text. (Token names are written bare
		// here on purpose. src/tokens.test.ts scans src for the var-reference syntax
		// and requires every name it finds to be declared in the base token layer —
		// comments included — and --ochre is declared only in monochrome.css. Writing
		// the reference syntax in this comment fails that gate, twice: once for
		// --ochre and once for whatever placeholder the explanation used.) So this
		// uses primitives.css's own
		// existing idiom for the same problem (five color-mix washes on --amber in
		// the Calendar and RichText sections) rather than inventing a token.
		bg: "color-mix(in srgb, var(--amber) 12%, transparent)",
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
		bg: "var(--green-bg)",
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
		// A black alpha is invisible on monochrome dark (#161616); --panel2 is the
		// neutral chip surface in both modes and both brands.
		bg: "var(--panel2)",
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

const toneButtonStyle: Record<CanonicalTone, { variant: ButtonVariant; style?: CSSProperties }> = {
	danger: { variant: "danger", style: { background: "var(--red)", borderColor: "var(--red)" } },
	warning: { variant: "primary", style: undefined },
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
//
// There is no longer an inline style object here, and that is the fix (F-15-3).
// `.ds-atom-confirm-panel` was on both panels already, but NO rule for it existed
// anywhere under dist/css/ — the splitter derives sheets from primitives.css
// banners and ConfirmDialog had no banner — so the whole surface was painted by
// this object instead. Inline styles beat class rules without !important, so the
// declarations had to move rather than be duplicated; the rule now lives under
// the `DS atom: ConfirmDialog` banner in src/primitives.css and ships as
// dist/css/confirmdialog.css.
//
// SUPERSEDES a recorded decision. The sibling repo's own .planning/PROJECT.md
// says, under Technical Constraints Summary: "ConfirmDialog is always-light glass
// surface (rgba(255,255,255,.97)) — not token-driven internally" (CONSTRAINT-010).
// That was a correct single-brand decision and a second brand invalidates it: a
// near-white card floating on a monochrome page is not a glass surface, it is a
// hole. The panel is now token-driven, and the 97%-plus-blur glass job is kept as
// a color-mix against --panel so the effect is preserved rather than
// reconstructed. That PROJECT.md line is not edited from here (it belongs to that
// repository's own workflow); this comment is the counter-record.

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
	/**
	 * Render in place instead of through a portal, so the dialog exists in
	 * server-rendered HTML (F-15-1). Opt-in, and it reintroduces coupling to
	 * ancestor `overflow` / `transform` / `z-index` — see `DSPortal`'s own
	 * `inline` prop, which documents the tradeoff in full.
	 *
	 * @default false
	 */
	inline?: boolean;
	/** Ref to the ConfirmDialog root element. */
	ref?: Ref<HTMLDivElement>;
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
	inline = false,
	ref,
}: ConfirmDialogProps) {
	// Callback-ref pattern: panel state flips from null to the DOM node when
	// React commits it. Passing the node (not a RefObject) into useFocusTrap
	// guarantees the trap engages exactly when the portal commits its child.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	// Composed, not replaced: the internal ref drives the focus trap and must keep
	// receiving the node.
	const composedRootRef = useComposedRefs<HTMLDivElement>(setPanel, ref);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = body ? generatedDescId : undefined;

	useFocusTrap(panel, open);
	// Background must not scroll behind a modal surface.
	useScrollLock(open);

	// Document-level keyboard handler — Escape cancels.
	// A11y fix: Enter no longer confirms globally. A global Enter handler fired
	// onConfirm() regardless of focus, so Enter while focused on Cancel (or any
	// element) triggered the possibly-destructive confirm. Confirm is now driven
	// by the confirm button / form submit, so Enter on Cancel cancels instead.
	// Escape closes only the *topmost* layer — see useDismiss. Each overlay
	// previously installed its own document listener, so one press closed every
	// open layer at once.
	useDismiss(open, onClose);

	if (!open) return null;

	// Backdrop click does NOT close ConfirmDialog (all tones require explicit action)
	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target !== e.currentTarget) return;
		// closeOnBackdropClick=false for all ConfirmDialog tones — explicit Cancel/Confirm required
	}

	// Form submit drives confirm: Enter on the default (confirm) submit button
	// fires onConfirm, while Enter on the Cancel button activates Cancel.
	function handleSubmit(e: ReactFormEvent<HTMLFormElement>) {
		e.preventDefault();
		onConfirm();
	}

	const canonicalTone = normalizeTone(tone);
	const t = tones[canonicalTone];
	const btnConfig = toneButtonStyle[canonicalTone];

	return (
		<DSPortal inline={inline}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={composedRootRef}
					className="ds-atom-confirm-panel"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					tabIndex={-1}
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

					{/* Footer — wrapped in a form so Enter submits (confirm). The Cancel
					    button is type="button", so Enter while focused on it activates
					    Cancel rather than confirming. */}
					<form
						onSubmit={handleSubmit}
						style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}
					>
						<Button type="button" variant="ghost" onClick={onClose}>
							{cancelLabel}
						</Button>
						<Button type="submit" variant={btnConfig.variant} style={btnConfig.style}>
							{confirmLabel}
						</Button>
					</form>
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
	/**
	 * Render in place instead of through a portal, so the dialog exists in
	 * server-rendered HTML (F-15-1). Opt-in, and it reintroduces coupling to
	 * ancestor `overflow` / `transform` / `z-index` — see `DSPortal`'s own
	 * `inline` prop, which documents the tradeoff in full.
	 *
	 * @default false
	 */
	inline?: boolean;
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
	inline = false,
}: TypeToConfirmProps) {
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const [v, setV] = useState("");
	const ok = v === guardWord; // NO trim, case-sensitive — CONSTRAINT-013
	const generatedTitleId = useId();
	const titleId = title ? generatedTitleId : undefined;

	useFocusTrap(panel, open);
	// Background must not scroll behind a modal surface.
	useScrollLock(open);

	// Document-level keyboard handler (T-018-02-02: cleanup removes listener on unmount)
	useEffect(() => {
		if (!open) return;
		// Escape is handled by useDismiss above; this listener owns only Enter.
		function onKey(e: KeyboardEvent) {
			if (e.key === "Enter" && ok) onConfirm(); // T-018-02-03: Enter only fires when ok===true
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onConfirm, ok]);

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
		<DSPortal inline={inline}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={setPanel}
					className="ds-atom-confirm-panel"
					role="alertdialog"
					aria-modal="true"
					aria-labelledby={titleId}
					tabIndex={-1}
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
