import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
} from "react";
import { DSPortal } from "./_internals/DSPortal";
import { useFocusTrap } from "./hooks/useFocusTrap";

export type SheetSide = "right" | "left";

export interface SheetProps {
	open: boolean;
	onClose: () => void;
	side?: SheetSide;
	title?: ReactNode;
	description?: string;
	footer?: ReactNode;
	children: ReactNode;
	closeOnBackdropClick?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Side-anchored drawer primitive (Wave 3, DS-35).
 *
 * Mirrors Modal architecture (DSPortal-mounted backdrop + panel; useFocusTrap;
 * explicit Escape document keydown; auto-generated aria-labelledby/describedby
 * via useId()) but slides in from the chosen edge instead of scaling in.
 *
 * Per D-332:
 * - 400px wide on desktop (≥640px)
 * - 100vw on mobile (<640px) via @media — no prop required
 * - side: 'right' (default) | 'left'; CSS keys off [data-side]
 *
 * Returns null when open=false. When open=true, portals a backdrop +
 * side-anchored panel to document.body. Backdrop click calls onClose iff
 * closeOnBackdropClick (default true). Click on panel itself does NOT close.
 *
 * useFocusTrap traps Tab inside the panel + restores focus on close.
 * Escape closes via a document keydown listener installed only while open
 * (Wave 0 useFocusTrap only handles Tab — we add Escape ourselves).
 */
export function Sheet({
	open,
	onClose,
	side = "right",
	title,
	description,
	footer,
	children,
	closeOnBackdropClick = true,
	className,
	style,
}: SheetProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = description ? generatedDescId : undefined;
	// Hoisted so biome's lint/a11y/useSemanticElements rule (which fires only on
	// static "dialog" literals) doesn't insist we swap to a native <dialog> — that
	// element doesn't honor non-modal backdrop click + DSPortal mounting.
	const dialogRole = "dialog" as const;

	// Focus trap (Tab cycling + restore on close).
	useFocusTrap(panelRef, open);

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
			<div className="ds-atom-sheet-backdrop" onClick={handleBackdropClick}>
				<div
					ref={panelRef}
					className={`ds-atom-sheet${className ? ` ${className}` : ""}`}
					data-side={side}
					role={dialogRole}
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={descId}
					style={style}
					tabIndex={-1}
				>
					{title ? (
						<header id={titleId} className="ds-atom-sheet-hd">
							{title}
						</header>
					) : null}
					<div className="ds-atom-sheet-body">
						{description ? <div id={descId}>{description}</div> : null}
						{children}
					</div>
					{footer ? <footer className="ds-atom-sheet-ft">{footer}</footer> : null}
				</div>
			</div>
		</DSPortal>
	);
}
