/**
 * Smart floating-element positioning utilities.
 *
 * After computing an initial position for a floating element (dropdown,
 * popover, tooltip, hover-card), these helpers check viewport bounds and:
 *   1. Flip to the opposite axis if the preferred side overflows.
 *   2. Clamp both axes so the panel never exits the viewport.
 *
 * All values are in CSS `position: fixed` coordinates (viewport-relative).
 */

const MARGIN = 8; // px clearance from every viewport edge

export interface FloatRect {
	width: number;
	height: number;
}

/** Clamp a fixed-position element inside the viewport with MARGIN clearance. */
export function clampToViewport(
	top: number,
	left: number,
	panel: FloatRect,
): { top: number; left: number } {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	return {
		top: Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN)),
		left: Math.max(MARGIN, Math.min(left, vw - panel.width - MARGIN)),
	};
}

export type VerticalSide = "bottom" | "top";
export type HorizontalAlign = "start" | "end";

/**
 * Compute a fixed position for a panel anchored to `anchorRect`.
 * Automatically flips the vertical side when the preferred side doesn't fit,
 * then clamps both axes to the viewport.
 */
export function smartAnchorPos(
	anchorRect: DOMRect,
	panel: FloatRect,
	side: VerticalSide,
	align: HorizontalAlign,
	offset: number,
): { top: number; left: number; side: VerticalSide } {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	// Resolve vertical side with auto-flip
	const spaceBelow = vh - anchorRect.bottom;
	const spaceAbove = anchorRect.top;
	let resolvedSide = side;
	if (side === "bottom" && spaceBelow < panel.height + offset + MARGIN && spaceAbove > spaceBelow) {
		resolvedSide = "top";
	} else if (
		side === "top" &&
		spaceAbove < panel.height + offset + MARGIN &&
		spaceBelow > spaceAbove
	) {
		resolvedSide = "bottom";
	}

	const top =
		resolvedSide === "bottom" ? anchorRect.bottom + offset : anchorRect.top - panel.height - offset;

	// Resolve horizontal alignment with auto-flip
	let left = align === "start" ? anchorRect.left : anchorRect.right - panel.width;

	// Flip alignment if it overflows the opposite edge
	if (align === "start" && left + panel.width > vw - MARGIN) {
		left = anchorRect.right - panel.width;
	} else if (align === "end" && left < MARGIN) {
		left = anchorRect.left;
	}

	return {
		...clampToViewport(top, left, panel),
		side: resolvedSide,
	};
}
