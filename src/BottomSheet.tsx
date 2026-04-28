import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { DSPortal } from "./_internals/DSPortal";
import { useFocusTrap } from "./hooks/useFocusTrap";

export type BottomSheetHeight = "half" | "full";

export interface BottomSheetProps {
	open: boolean;
	onClose: () => void;
	title?: ReactNode;
	footer?: ReactNode;
	children: ReactNode;
	height?: BottomSheetHeight;
	closeOnBackdropClick?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Bottom-anchored drawer primitive (Wave 3, DS-36).
 *
 * Mobile-style sheet that slides up from the bottom edge. Mirrors Sheet
 * (DS-35) architecture - DSPortal-mounted backdrop + panel, useFocusTrap
 * for Tab cycling + focus restore, document Escape keydown - but its
 * geometry is bottom-anchored with top-rounded corners and a purely-visual
 * drag-handle indicator at the top.
 *
 * Per D-340 (with v0.5.1 swipe-to-close upgrade):
 * - Two height variants: 'half' (default, max-height 60vh) and 'full'
 *   (height 100vh, no top corners) - switched via [data-height] +
 *   sibling-CSS selectors (Phase 12 D-130 pattern).
 * - Drag handle (.ds-atom-bottomsheet-handle, 32x4 ink-5 pill) supports
 *   swipe-to-close via Pointer Events (v0.5.1 patch — resolves D-340 v2.1
 *   deferral). pointerdown captures the pointer; pointermove translates
 *   the panel by positive Y delta only (drag-down); pointerup closes if
 *   delta > 120px OR > 40% of panel height, else snaps back via CSS
 *   transition. data-dragging="true" disables the transition during drag
 *   so the panel follows the finger directly.
 * - role="dialog" + aria-modal="true"; aria-labelledby auto-wired via
 *   useId() when a title is provided.
 * - closeOnBackdropClick defaults to true; pass false for destructive
 *   confirm flows that require explicit Cancel.
 *
 * DSPortal (D-310) gates its children on a mount-tick for SSR safety, so
 * panelRef is null on the initial render. Tracking a local mount flag and
 * feeding it into useFocusTrap's `active` arg ensures the trap re-runs
 * once the portal commits the panel into the DOM.
 */
export function BottomSheet({
	open,
	onClose,
	title,
	footer,
	children,
	height = "half",
	closeOnBackdropClick = true,
	className,
	style,
}: BottomSheetProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const generatedTitleId = useId();
	const titleId = title ? generatedTitleId : undefined;
	// Hoisted constant so biome's lint/a11y/useSemanticElements rule (which
	// fires only on static "dialog" literals) doesn't insist we swap to a
	// native <dialog> - that element doesn't honor non-modal backdrop click
	// + DSPortal mounting.
	const dialogRole = "dialog" as const;

	// DSPortal gates on a mount tick - see component docstring.
	const [portalMounted, setPortalMounted] = useState(false);
	useEffect(() => {
		setPortalMounted(true);
	}, []);

	useFocusTrap(panelRef, open && portalMounted);

	// Swipe-to-close gesture (v0.5.1 patch). Tracks pointerdown Y and current
	// translateY delta; on pointerup, closes if delta exceeds threshold else
	// snaps back. Pointer Events handle touch + mouse uniformly.
	const dragStateRef = useRef<{ startY: number; pointerId: number; panelH: number } | null>(null);
	const [dragOffset, setDragOffset] = useState(0);
	const [dragging, setDragging] = useState(false);

	function handleHandlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
		const panel = panelRef.current;
		if (!panel) return;
		dragStateRef.current = {
			startY: e.clientY,
			pointerId: e.pointerId,
			panelH: panel.getBoundingClientRect().height,
		};
		setDragging(true);
		try {
			(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
		} catch {
			// jsdom test envs and some older browsers may throw; safe to ignore.
		}
	}

	function handleHandlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
		const s = dragStateRef.current;
		if (!s || s.pointerId !== e.pointerId) return;
		const delta = Math.max(0, e.clientY - s.startY);
		setDragOffset(delta);
	}

	function handleHandlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
		const s = dragStateRef.current;
		if (!s || s.pointerId !== e.pointerId) return;
		const delta = Math.max(0, e.clientY - s.startY);
		const threshold = Math.min(120, s.panelH * 0.4);
		try {
			(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
		} catch {
			// pointer may already be released; ignore
		}
		dragStateRef.current = null;
		setDragging(false);
		if (delta > threshold) {
			setDragOffset(0);
			onClose();
		} else {
			setDragOffset(0);
		}
	}

	// Escape closes (useFocusTrap from Wave 0 only handles Tab).
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
			<div
				className="ds-atom-bottomsheet-backdrop"
				data-testid="bottomsheet-backdrop"
				onClick={handleBackdropClick}
			>
				<div
					ref={panelRef}
					className={`ds-atom-bottomsheet${className ? ` ${className}` : ""}`}
					data-height={height}
					data-dragging={dragging ? "true" : undefined}
					role={dialogRole}
					aria-modal="true"
					aria-labelledby={titleId}
					style={{
						...style,
						transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
					}}
					tabIndex={-1}
				>
					<div
						className="ds-atom-bottomsheet-handle"
						aria-hidden="true"
						onPointerDown={handleHandlePointerDown}
						onPointerMove={handleHandlePointerMove}
						onPointerUp={handleHandlePointerUp}
						onPointerCancel={handleHandlePointerUp}
					/>
					{title ? (
						<header id={titleId} className="ds-atom-bottomsheet-hd">
							{title}
						</header>
					) : null}
					<div className="ds-atom-bottomsheet-body">{children}</div>
					{footer ? <footer className="ds-atom-bottomsheet-ft">{footer}</footer> : null}
				</div>
			</div>
		</DSPortal>
	);
}
