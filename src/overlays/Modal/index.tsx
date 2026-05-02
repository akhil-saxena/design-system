import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { X } from "../../icons";
import { Button } from "../../inputs/Button";
export type ModalRole = "dialog" | "alertdialog";

export interface ModalProps {
	/** Controls visibility; returns null when false. */
	open: boolean;
	/** Called when the user closes the modal via Escape or backdrop click. */
	onClose: () => void;
	/** Heading rendered in the modal header; auto-wired to `aria-labelledby`. */
	title?: ReactNode;
	/** Short description rendered above children; auto-wired to `aria-describedby`. */
	description?: string;
	/** Content for the footer slot (typically action buttons). */
	footer?: ReactNode;
	/** Main body content of the modal. */
	children?: ReactNode;
	/** Whether clicking the backdrop calls `onClose`.
	 * @default true
	 */
	closeOnBackdropClick?: boolean;
	/** ARIA role - use `"alertdialog"` for destructive confirmations.
	 * @default "dialog"
	 */
	role?: ModalRole;
	/** Ref to the element that should receive focus when the modal opens; defaults to the panel itself. */
	initialFocus?: RefObject<HTMLElement | null>;
	/** Additional className applied to the modal panel. */
	className?: string;
	/** Inline styles applied to the modal panel. */
	style?: CSSProperties;
}

/**
 * Modal - DSPortal-mounted dialog with focus trap, Escape close, backdrop close.
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
	// Callback-ref pattern: panel state flips from null to the DOM node when
	// React commits it. Passing the node (not a RefObject) into useFocusTrap
	// guarantees the trap engages exactly when the portal commits its child.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = description ? generatedDescId : undefined;

	useFocusTrap(panel, open);

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
					ref={setPanel}
					className={`ds-atom-modal${className ? ` ${className}` : ""}`}
					role={role}
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					style={style}
					tabIndex={-1}
				>
					<header id={titleId} className="ds-atom-modal-hd">
						<span className="ds-atom-modal-hd-title">{title}</span>
						<Button
							variant="ghost"
							size="sm"
							aria-label="Close"
							onClick={onClose}
							style={{ marginLeft: "auto", flexShrink: 0 }}
						>
							<X size={16} />
						</Button>
					</header>
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

// ─── ConfirmDialog - same-file variant export (D-287, D-356) ─────────

export interface ConfirmDialogProps {
	/** Controls visibility; returns null when false. */
	open: boolean;
	/** Called when the user dismisses or cancels the dialog. */
	onClose: () => void;
	/** Heading text for the confirmation dialog. */
	title: ReactNode;
	/** Supplemental explanation shown below the title; string gets `aria-describedby`, ReactNode renders as children. */
	description?: ReactNode;
	/** Label for the confirm action button.
	 * @default "Confirm"
	 */
	confirmLabel?: string;
	/** Label for the cancel action button.
	 * @default "Cancel"
	 */
	cancelLabel?: string;
	/** When true, uses `role="alertdialog"`, disables backdrop close, and styles confirm as `danger`.
	 * @default false
	 */
	danger?: boolean;
	/** Called when the user clicks the confirm button. */
	onConfirm: () => void;
}

/**
 * ConfirmDialog - Modal-as-confirmation variant (D-287, D-356).
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
