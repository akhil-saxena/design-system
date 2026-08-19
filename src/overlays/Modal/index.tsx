import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type Ref,
	type RefObject,
	useEffect,
	useId,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useDismiss } from "../../hooks/useDismiss";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { X } from "../../icons";
import { Button } from "../../inputs/Button";
export type ModalRole = "dialog" | "alertdialog";

/**
 * Passed to useDismiss when `closable` is false: the layer occupies the top of
 * the dismiss stack and swallows Escape. Module-level so the identity is stable
 * across renders — useDismiss keys its effect on the callback, and a fresh arrow
 * would unregister and re-register the layer on every render.
 */
const IGNORE_DISMISS = () => {};

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
	/**
	 * Whether the user may dismiss the dialog at all.
	 *
	 * `false` suppresses **all three** exits together — the header Close button,
	 * the Escape key and the backdrop click path. It overrides
	 * `closeOnBackdropClick`, because a fail-closed dialog that is one default
	 * away from being dismissable is not fail-closed. Suppressing only the visible
	 * button would leave two silent exits and merely *look* solved (F-15-2).
	 *
	 * Escape is **swallowed**, not passed through: the layer still registers in
	 * the dismiss stack and ignores the key, so a press cannot close whatever
	 * surface is open beneath the trap — a surface the user can neither see behind
	 * the scrim nor reach through the focus trap.
	 *
	 * ## This makes the dialog a keyboard trap by design
	 *
	 * That is the point — a re-auth prompt or an expired-session dialog is the one
	 * dialog whose entire purpose is that you may not dismiss it. It also means
	 * **the consumer must provide its own way out**: a re-auth form, a sign-out
	 * button, a link. An undismissable dialog with no action inside it is an
	 * accessibility failure, not a security feature. Do not reach for this prop to
	 * make a dialog feel important.
	 *
	 * @default true
	 */
	closable?: boolean;
	/**
	 * Render in place instead of through a portal, so the dialog exists in
	 * server-rendered HTML (F-15-1). Opt-in, and it reintroduces coupling to
	 * ancestor `overflow` / `transform` / `z-index` — see `DSPortal`'s own
	 * `inline` prop, which documents the tradeoff in full.
	 *
	 * @default false
	 */
	inline?: boolean;
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
	/**
	 * Ref to the Modal panel element. The panel is portaled and only exists
	 * while the overlay is open, so this is `null` when it is closed.
	 */
	ref?: Ref<HTMLDivElement>;
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
 * - closable defaults to true; false suppresses button + Escape + backdrop together
 * - Animations namespaced (ds-atom-modal-fadein, ds-atom-modal-in) to avoid
 *   colliding with consumer-defined keyframes
 */
export function Modal({
	open,
	onClose,
	title,
	description,
	footer,
	children,
	closeOnBackdropClick = true,
	closable = true,
	inline = false,
	role = "dialog",
	initialFocus,
	className,
	style,
	ref,
}: ModalProps) {
	// Callback-ref pattern: panel state flips from null to the DOM node when
	// React commits it. Passing the node (not a RefObject) into useFocusTrap
	// guarantees the trap engages exactly when the portal commits its child.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	// The panel already carries an internal callback ref (focus trap and
	// positioning need the live node); composing lets a consumer's ref observe
	// the same element without displacing it.
	const composedPanelRef = useComposedRefs<HTMLDivElement>(setPanel, ref);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = description ? generatedDescId : undefined;

	useFocusTrap(panel, open);
	// Background must not scroll behind a modal surface.
	useScrollLock(open);

	useEffect(() => {
		if (!open) return;
		if (initialFocus?.current) {
			const id = window.setTimeout(() => initialFocus.current?.focus(), 0);
			return () => window.clearTimeout(id);
		}
	}, [open, initialFocus]);

	// Escape closes only the *topmost* layer — see useDismiss. Each overlay
	// previously installed its own document listener, so one press closed every
	// open layer at once.
	//
	// A non-closable Modal REGISTERS and ignores the key rather than declining to
	// register. Declining would leave the topmost registered layer as the one
	// *below* the trap, so Escape would close a surface hidden behind the scrim
	// and unreachable through the focus trap. Registering keeps the press
	// swallowed. IGNORE_DISMISS is module-level so its identity is stable and the
	// effect does not re-register on every render.
	useDismiss(open, closable ? onClose : IGNORE_DISMISS);

	if (!open) return null;

	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		// `closable` gates before `closeOnBackdropClick`, so the two props cannot
		// disagree into a dismissable trap.
		if (e.target === e.currentTarget && closable && closeOnBackdropClick) {
			onClose();
		}
	}

	return (
		<DSPortal inline={inline}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` (handles all focus contexts, including the panel) */}
			<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
				<div
					ref={composedPanelRef}
					className={`ds-atom-modal${className ? ` ${className}` : ""}`}
					role={role}
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					style={style}
					tabIndex={-1}
				>
					<header className="ds-atom-modal-hd">
						<span id={titleId} className="ds-atom-modal-hd-title">
							{title}
						</span>
						{closable ? (
							<Button
								variant="ghost"
								size="sm"
								aria-label="Close"
								onClick={onClose}
								style={{ marginLeft: "auto", flexShrink: 0 }}
							>
								<X size={16} />
							</Button>
						) : null}
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
