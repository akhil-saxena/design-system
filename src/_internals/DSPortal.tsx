import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface DSPortalProps {
	children: ReactNode;
	target?: HTMLElement;
}

/**
 * SSR-safe React.createPortal wrapper.
 *
 * Returns null on the server and during the first client render, then
 * portals `children` to `target` (default: document.body) after the
 * initial useEffect fires. Consumed by Tooltip, Popover, Modal, Sheet,
 * BottomSheet, Lightbox, HoverCard (Wave 3) and Toast (Wave 4).
 *
 * Mount target defaults to document.body to avoid coupling to consumer
 * DOM layout (D-310).
 */
export function DSPortal({ children, target }: DSPortalProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;
	return createPortal(children, target ?? document.body);
}
