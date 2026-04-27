import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "./_internals/DSPortal";
import { useClickOutside } from "./hooks/useClickOutside";

export type HoverCardPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface HoverCardProps {
	/**
	 * The trigger element. Consumer owns the trigger; HoverCard does NOT clone
	 * or wrap it (distinct from Tooltip's cloneElement pattern). The ref must
	 * be attached to a real DOM element so HoverCard can install
	 * mouseenter/mouseleave/click listeners and read getBoundingClientRect on
	 * open. (D-355)
	 */
	anchorRef: RefObject<HTMLElement | null>;
	/** Card content — arbitrary ReactNode (avatars, charts, action buttons). */
	children: ReactNode;
	/** Default `"bottom-start"`. End variants align right edge; top variants align bottom edge (CSS transform). */
	placement?: HoverCardPlacement;
	/** Pixels between anchor edge and panel. Default 8 (slightly more than Popover's 4 for richer content breathing room). */
	offset?: number;
	/** ms to wait after mouseenter before opening. Default 300 — filters cursor pass-throughs. */
	openDelay?: number;
	/** ms to wait after mouseleave before closing. Default 150 — cursor-into-card grace window. */
	closeDelay?: number;
	/** Optional extra class on the panel root. */
	className?: string;
}

interface Position {
	top: number;
	left: number;
}

/**
 * HoverCard — rich-content popover-on-hover with click-to-pin (DS-38, D-355).
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
	const panelRef = useRef<HTMLDivElement>(null);
	const openTimerRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);

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

	const computePosition = useCallback((): Position | null => {
		const a = anchorRef.current;
		if (!a) return null;
		const r = a.getBoundingClientRect();
		switch (placement) {
			case "bottom-end":
				return { top: r.bottom + offset, left: r.right };
			case "top-start":
				return { top: r.top - offset, left: r.left };
			case "top-end":
				return { top: r.top - offset, left: r.right };
			default:
				return { top: r.bottom + offset, left: r.left };
		}
	}, [anchorRef, placement, offset]);

	useEffect(() => {
		const anchor = anchorRef.current;
		if (!anchor) return;

		function scheduleOpen() {
			clearCloseTimer();
			if (openTimerRef.current !== null) return; // open already pending
			openTimerRef.current = window.setTimeout(() => {
				openTimerRef.current = null;
				setPosition(computePosition());
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
			}, closeDelay);
		}
		function openNow() {
			clearOpenTimer();
			clearCloseTimer();
			setPosition(computePosition());
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

		anchor.addEventListener("mouseenter", handleEnter);
		anchor.addEventListener("mouseleave", handleLeave);
		anchor.addEventListener("click", handleClick);
		return () => {
			anchor.removeEventListener("mouseenter", handleEnter);
			anchor.removeEventListener("mouseleave", handleLeave);
			anchor.removeEventListener("click", handleClick);
		};
	}, [anchorRef, pinned, openDelay, closeDelay, computePosition, clearOpenTimer, clearCloseTimer]);

	// Cleanup any pending timers on full unmount.
	useEffect(
		() => () => {
			clearOpenTimer();
			clearCloseTimer();
		},
		[clearOpenTimer, clearCloseTimer],
	);

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

	if (!open || !position) return null;

	const xShift =
		placement === "bottom-end" || placement === "top-end" ? "translateX(-100%)" : undefined;
	const yShift =
		placement === "top-start" || placement === "top-end" ? "translateY(-100%)" : undefined;
	const combinedTransform = [xShift, yShift].filter(Boolean).join(" ") || undefined;

	const style: CSSProperties = {
		top: position.top,
		left: position.left,
		transform: combinedTransform,
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

	return (
		<DSPortal>
			<div
				ref={panelRef}
				// biome-ignore lint/a11y/useSemanticElements: native <dialog> implies modal/inert behavior we don't want for non-modal hovercards
				role="dialog"
				className={`ds-atom-hovercard${className ? ` ${className}` : ""}`}
				data-placement={placement}
				data-pinned={pinned ? "true" : "false"}
				style={style}
				onMouseEnter={onPanelEnter}
				onMouseLeave={onPanelLeave}
			>
				{children}
			</div>
		</DSPortal>
	);
}
