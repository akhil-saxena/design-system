import {
	type CSSProperties,
	type FocusEvent as ReactFocusEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { smartAnchorPos } from "../../_internals/floatingPos";
import { useClickOutside } from "../../hooks/useClickOutside";
export type HoverCardPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface HoverCardProps {
	/** Ref attached to the trigger element; HoverCard installs mouse/click listeners on it directly. */
	anchorRef: RefObject<HTMLElement | null>;
	/** Rich card content - arbitrary ReactNode such as avatars, charts, or action buttons. */
	children: ReactNode;
	/** Panel placement relative to the anchor.
	 * @default "bottom-start"
	 */
	placement?: HoverCardPlacement;
	/** Gap in pixels between the anchor edge and the panel.
	 * @default 8
	 */
	offset?: number;
	/** Milliseconds to wait after mouseenter before opening; filters accidental cursor pass-throughs.
	 * @default 300
	 */
	openDelay?: number;
	/** Milliseconds to wait after mouseleave before closing; gives the cursor time to move into the card.
	 * @default 150
	 */
	closeDelay?: number;
	/** Additional className applied to the panel root element. */
	className?: string;
}

interface Position {
	top: number;
	left: number;
}

/**
 * HoverCard - rich-content popover-on-hover with click-to-pin (DS-38, D-355).
 *
 * Behavior:
 * - mouseenter on anchor → openDelay timer → render via DSPortal
 * - mouseleave on anchor OR panel → closeDelay timer → unmount
 * - panel mouseenter cancels pending close (cursor-into-card grace window)
 * - click on anchor pins the card open; mouseleave is ignored while pinned
 * - click outside both anchor + panel (via useClickOutside) unpins + closes
 * - non-modal: NO focus trap; Tab from anchor moves into panel children naturally
 *
 * Position is computed once at the moment of `setOpen(true)` from
 * `anchorRef.current.getBoundingClientRect()`. Scrolling-while-open is NOT
 * tracked in v0.2 (acceptable for a hover preview that closes when cursor
 * leaves anyway). v0.3 may add a ResizeObserver/scroll listener.
 */
export function HoverCard({
	anchorRef,
	children,
	placement = "bottom-start",
	offset = 8,
	openDelay = 300,
	closeDelay = 150,
	className,
}: HoverCardProps) {
	const [open, setOpen] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [position, setPosition] = useState<Position | null>(null);
	// Callback-ref so we know panel dimensions for smartAnchorPos
	const [panelEl, setPanelEl] = useState<HTMLDialogElement | null>(null);
	const panelRef = useRef<HTMLDialogElement | null>(null);
	const setPanelRef = (node: HTMLDialogElement | null) => {
		panelRef.current = node;
		setPanelEl(node);
	};
	const openTimerRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);
	// Set briefly after an Escape dismiss so restoring focus to the anchor does
	// not immediately re-open the card via the focusin path.
	const suppressFocusOpenRef = useRef(false);

	const clearOpenTimer = useCallback(() => {
		if (openTimerRef.current !== null) {
			window.clearTimeout(openTimerRef.current);
			openTimerRef.current = null;
		}
	}, []);
	const clearCloseTimer = useCallback(() => {
		if (closeTimerRef.current !== null) {
			window.clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
	}, []);

	// Compute position via smartAnchorPos after panel mounts - gives us real panel rect.
	useLayoutEffect(() => {
		if (!open || !panelEl || !anchorRef.current) return;
		const a = anchorRef.current.getBoundingClientRect();
		const p = panelEl.getBoundingClientRect();
		const side = placement.startsWith("top") ? "top" : "bottom";
		const align = placement.endsWith("end") ? "end" : "start";
		const { top, left } = smartAnchorPos(
			a,
			{ width: p.width, height: p.height },
			side,
			align,
			offset,
		);
		setPosition({ top, left });
	}, [open, panelEl, anchorRef, placement, offset]);

	useEffect(() => {
		const anchor = anchorRef.current;
		if (!anchor) return;

		function scheduleOpen() {
			clearCloseTimer();
			if (openTimerRef.current !== null) return;
			openTimerRef.current = window.setTimeout(() => {
				openTimerRef.current = null;
				setOpen(true);
			}, openDelay);
		}
		function scheduleClose() {
			if (pinned) return;
			clearOpenTimer();
			if (closeTimerRef.current !== null) return;
			closeTimerRef.current = window.setTimeout(() => {
				closeTimerRef.current = null;
				setOpen(false);
				setPosition(null);
			}, closeDelay);
		}
		function openNow() {
			clearOpenTimer();
			clearCloseTimer();
			setOpen(true);
		}

		function handleEnter() {
			scheduleOpen();
		}
		function handleLeave() {
			scheduleClose();
		}
		function handleClick() {
			if (pinned) {
				setPinned(false);
				scheduleClose();
			} else {
				setPinned(true);
				openNow();
			}
		}
		// A11y: keyboard users reach the anchor via Tab. focusin opens the card so
		// its interactive content becomes reachable; focusout closes it once focus
		// leaves both the anchor and the panel (relatedTarget check below).
		function handleFocusIn() {
			// Skip re-opening when focus is being restored to the anchor right after
			// an Escape dismiss.
			if (suppressFocusOpenRef.current) return;
			openNow();
		}
		function handleFocusOut(e: FocusEvent) {
			if (pinned) return;
			const next = e.relatedTarget as Node | null;
			// Keep open while focus moves into the panel or stays within the anchor.
			if (next && (panelRef.current?.contains(next) || anchorRef.current?.contains(next))) return;
			scheduleClose();
		}

		anchor.addEventListener("mouseenter", handleEnter);
		anchor.addEventListener("mouseleave", handleLeave);
		anchor.addEventListener("click", handleClick);
		anchor.addEventListener("focusin", handleFocusIn);
		anchor.addEventListener("focusout", handleFocusOut);
		return () => {
			anchor.removeEventListener("mouseenter", handleEnter);
			anchor.removeEventListener("mouseleave", handleLeave);
			anchor.removeEventListener("click", handleClick);
			anchor.removeEventListener("focusin", handleFocusIn);
			anchor.removeEventListener("focusout", handleFocusOut);
		};
	}, [anchorRef, pinned, openDelay, closeDelay, clearOpenTimer, clearCloseTimer]);

	// Cleanup any pending timers on full unmount.
	useEffect(
		() => () => {
			clearOpenTimer();
			clearCloseTimer();
		},
		[clearOpenTimer, clearCloseTimer],
	);

	// A11y: Escape dismisses the card (whether hovered or pinned) and returns
	// focus to the anchor so keyboard users are not stranded inside the portal.
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key !== "Escape") return;
			setPinned(false);
			setOpen(false);
			setPosition(null);
			clearOpenTimer();
			clearCloseTimer();
			// Return focus to the anchor only if focus is currently inside the
			// portaled panel — otherwise the anchor already holds focus. Suppress
			// the focusin-reopen that restoring focus would otherwise trigger.
			const active = document.activeElement;
			if (active && panelRef.current?.contains(active)) {
				suppressFocusOpenRef.current = true;
				anchorRef.current?.focus?.();
				suppressFocusOpenRef.current = false;
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, anchorRef, clearOpenTimer, clearCloseTimer]);

	useClickOutside(
		panelRef,
		(e) => {
			if (anchorRef.current?.contains(e.target as Node)) return;
			setPinned(false);
			setOpen(false);
			clearOpenTimer();
			clearCloseTimer();
		},
		open,
	);

	if (!open) return null;

	// Hide until smartAnchorPos has computed a real position.
	const style: CSSProperties = {
		top: position?.top ?? -9999,
		left: position?.left ?? -9999,
		visibility: position ? "visible" : "hidden",
	};

	function onPanelEnter() {
		clearCloseTimer();
	}
	function onPanelLeave() {
		if (pinned) return;
		clearOpenTimer();
		if (closeTimerRef.current !== null) return;
		closeTimerRef.current = window.setTimeout(() => {
			closeTimerRef.current = null;
			setOpen(false);
		}, closeDelay);
	}
	// A11y: when focus leaves the panel (Tab past the last item) and does not land
	// back on the anchor or within the panel, close the card.
	function onPanelBlur(e: ReactFocusEvent<HTMLDialogElement>) {
		if (pinned) return;
		const next = e.relatedTarget as Node | null;
		if (next && (panelRef.current?.contains(next) || anchorRef.current?.contains(next))) return;
		scheduleCloseFromPanel();
	}
	function scheduleCloseFromPanel() {
		clearOpenTimer();
		if (closeTimerRef.current !== null) return;
		closeTimerRef.current = window.setTimeout(() => {
			closeTimerRef.current = null;
			setOpen(false);
			setPosition(null);
		}, closeDelay);
	}

	const isDark =
		anchorRef.current?.closest(".dark") != null ||
		document.documentElement.classList.contains("dark");

	const cardEl = (
		<dialog
			ref={setPanelRef}
			open
			className={["ds-atom-hovercard", className].filter(Boolean).join(" ")}
			data-placement={placement}
			data-pinned={pinned ? "true" : "false"}
			style={style}
			onMouseEnter={onPanelEnter}
			onMouseLeave={onPanelLeave}
			onBlur={onPanelBlur}
		>
			{children}
		</dialog>
	);

	return <DSPortal>{isDark ? <div className="dark">{cardEl}</div> : cardEl}</DSPortal>;
}
