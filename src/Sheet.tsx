import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useEffect,
	useId,
	useState,
} from "react";
import { Button } from "./Button";
import { DSPortal } from "./_internals/DSPortal";
import { useFocusTrap } from "./hooks/useFocusTrap";
import { X } from "./icons";

export type SheetSide = "right" | "left";

export interface SheetProps {
	/** Controls visibility; returns null when false. */
	open: boolean;
	/** Called when the user closes the sheet via Escape or backdrop click. */
	onClose: () => void;
	/** Which edge the panel slides in from.
	 * @default "right"
	 */
	side?: SheetSide;
	/** Heading rendered in the sheet header; auto-wired to `aria-labelledby`. */
	title?: ReactNode;
	/** Short description rendered above children; auto-wired to `aria-describedby`. */
	description?: string;
	/** Content for the footer slot (typically action buttons). */
	footer?: ReactNode;
	/** Main body content of the sheet. */
	children: ReactNode;
	/** Whether clicking the backdrop calls `onClose`.
	 * @default true
	 */
	closeOnBackdropClick?: boolean;
	/** Additional className applied to the sheet panel. */
	className?: string;
	/** Inline styles applied to the sheet panel. */
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
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const generatedTitleId = useId();
	const generatedDescId = useId();
	const titleId = title ? generatedTitleId : undefined;
	const descId = description ? generatedDescId : undefined;
	// Hoisted so biome's lint/a11y/useSemanticElements rule (which fires only on
	// static "dialog" literals) doesn't insist we swap to a native <dialog> — that
	// element doesn't honor non-modal backdrop click + DSPortal mounting.
	const dialogRole = "dialog" as const;

	// Focus trap (Tab cycling + restore on close). Pass the live node (not a
	// RefObject) so the trap engages exactly when the portal commits the panel.
	useFocusTrap(panel, open);

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

	const isDark = document.documentElement.classList.contains("dark");

	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget && closeOnBackdropClick) {
			onClose();
		}
	}

	const sheetEl = (
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close via document Escape handler
		<div className="ds-atom-sheet-backdrop" onClick={handleBackdropClick}>
			<div
				ref={setPanel}
				className={["ds-atom-sheet", className].filter(Boolean).join(" ")}
				data-side={side}
				role={dialogRole}
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descId}
				style={style}
				tabIndex={-1}
			>
				<header id={titleId} className="ds-atom-sheet-hd">
					<span className="ds-atom-sheet-hd-title">{title}</span>
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
				<div className="ds-atom-sheet-body">
					{description ? <div id={descId}>{description}</div> : null}
					{children}
				</div>
				{footer ? <footer className="ds-atom-sheet-ft">{footer}</footer> : null}
			</div>
		</div>
	);

	return <DSPortal>{isDark ? <div className="dark">{sheetEl}</div> : sheetEl}</DSPortal>;
}
