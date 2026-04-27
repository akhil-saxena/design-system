import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Button } from "./Button";
import { DSPortal } from "./_internals/DSPortal";
import { useFocusTrap } from "./hooks/useFocusTrap";

export type ModalRole = "dialog" | "alertdialog";

export interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: ReactNode;
	description?: string;
	footer?: ReactNode;
	children?: ReactNode;
	closeOnBackdropClick?: boolean;
	role?: ModalRole;
	initialFocus?: RefObject<HTMLElement | null>;
	className?: string;
	style?: CSSProperties;
}

/**
 * Modal — DSPortal-mounted dialog with focus trap, Escape close, backdrop close.
 *
 *   <Modal open={open} onClose={close} title="Edit profile">
 *     <form>...</form>
 *   </Modal>
 *
 * A11y wiring (D-321):
 * - role defaults to "dialog"; pass "alertdialog" for destructive confirms
 * - aria-labelledby auto-generated from `title` via useId()
 * - aria-describedby auto-generated from `description` via useId()
 * - aria-modal="true" always
 * - useFocusTrap traps Tab inside panel + restores focus to trigger on close
 * - Document-level keydown listener for Escape (useFocusTrap handles only Tab)
 *
 * Behavior (D-320, D-322):
 * - closeOnBackdropClick defaults to true; click on backdrop only (not panel) closes
 * - Animations namespaced (ds-atom-modal-fadein, ds-atom-modal-in) to avoid
 *   colliding with consumer-defined keyframes
 *
 * ConfirmDialog ships from this same file as a named variant export (D-287, D-356).
 */
export function Modal({
	open,
	onClose,
	title,
	description,
	footer,
	children,
	closeOnBackdropClick = true,
	role = "dialog",
	initialFocus,
	className,
	style,
}: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = description ? generatedDescId : undefined;

	// DSPortal gates its children on a mount tick (SSR-safety) — so panelRef
	// is null on the initial render. Tracking a local mount flag and feeding
	// it into useFocusTrap's `active` arg ensures the trap re-runs once the
	// portal commits the panel into the DOM and panelRef.current is populated.
	const [portalMounted, setPortalMounted] = useState(false);
	useEffect(() => {
		setPortalMounted(true);
	}, []);

	useFocusTrap(panelRef, open && portalMounted);

	useEffect(() => {
		if (!open) return;
		if (initialFocus?.current) {
			const id = window.setTimeout(() => initialFocus.current?.focus(), 0);
			return () => window.clearTimeout(id);
		}
	}, [open, initialFocus]);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget && closeOnBackdropClick) {
			onClose();
		}
	}

	return (
		<DSPortal>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` (handles all focus contexts, including the panel) */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={panelRef}
					className={`ds-atom-modal${className ? ` ${className}` : ""}`}
					role={role}
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					style={style}
					tabIndex={-1}
				>
					{title ? (
						<header id={titleId} className="ds-atom-modal-hd">
							{title}
						</header>
					) : null}
					<div className="ds-atom-modal-body">
						{description ? <div id={descId}>{description}</div> : null}
						{children}
					</div>
					{footer ? <footer className="ds-atom-modal-ft">{footer}</footer> : null}
				</div>
			</div>
		</DSPortal>
	);
}

// ─── ConfirmDialog — same-file variant export (D-287, D-356) ─────────

export interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	title: ReactNode;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	onConfirm: () => void;
}

/**
 * ConfirmDialog — Modal-as-confirmation variant (D-287, D-356).
 *
 *   <ConfirmDialog
 *     open={open}
 *     onClose={close}
 *     onConfirm={doDelete}
 *     title="Delete application?"
 *     description="This cannot be undone."
 *     confirmLabel="Yes, delete"
 *     danger
 *   />
 *
 * When `danger=true`:
 * - role="alertdialog"
 * - closeOnBackdropClick=false (forces explicit Cancel/Confirm)
 * - Confirm button uses Button variant="danger"
 *
 * `description` accepts string or ReactNode. Strings flow to Modal's
 * `description` prop (gets aria-describedby wiring); ReactNode renders
 * inline as Modal children (no auto aria-describedby).
 */
export function ConfirmDialog({
	open,
	onClose,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	danger = false,
	onConfirm,
}: ConfirmDialogProps) {
	const descriptionString = typeof description === "string" ? description : undefined;
	const descriptionNode = typeof description !== "string" && description ? description : null;

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			description={descriptionString}
			role={danger ? "alertdialog" : "dialog"}
			closeOnBackdropClick={!danger}
			footer={
				<>
					<Button variant="ghost" onClick={onClose}>
						{cancelLabel}
					</Button>
					<Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</>
			}
		>
			{descriptionNode}
		</Modal>
	);
}
