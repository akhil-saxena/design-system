import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "./_internals/DSPortal";
import { smartAnchorPos } from "./_internals/floatingPos";
import { useClickOutside } from "./hooks/useClickOutside";

export type HoverCardPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface HoverCardProps {
	/** Ref attached to the trigger element; HoverCard installs mouse/click listeners on it directly. */
	anchorRef: RefObject<HTMLElement | null>;
	/** Rich card content — arbitrary ReactNode such as avatars, charts, or action buttons. */
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
	// Callback-ref so we know panel dimensions for smartAnchorPos
	const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const setPanelRef = (node: HTMLDivElement | null) => {
		panelRef.current = node;
		setPanelEl(node);
	};
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

	// Compute position via smartAnchorPos after panel mounts — gives us real panel rect.
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

		anchor.addEventListener("mouseenter", handleEnter);
		anchor.addEventListener("mouseleave", handleLeave);
		anchor.addEventListener("click", handleClick);
		return () => {
			anchor.removeEventListener("mouseenter", handleEnter);
			anchor.removeEventListener("mouseleave", handleLeave);
			anchor.removeEventListener("click", handleClick);
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

	const isDark =
		anchorRef.current?.closest(".dark") != null ||
		document.documentElement.classList.contains("dark");

	// biome-ignore lint/a11y/useSemanticElements: HoverCard uses <dialog open> for non-modal semantics; showModal() not used so it behaves as inline dialog without blocking
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
		>
			{children}
		</dialog>
	);

	return <DSPortal>{isDark ? <div className="dark">{cardEl}</div> : cardEl}</DSPortal>;
}
