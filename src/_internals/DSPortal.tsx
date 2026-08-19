import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface DSPortalProps {
	children: ReactNode;
	target?: HTMLElement;
	/**
	 * Render `children` in place instead of through a portal.
	 *
	 * The default path returns null until a mount effect runs, so it produces
	 * **nothing** under `react-dom/server` — measured at 0 B for Modal,
	 * ConfirmDialog, TypeToConfirm and Sheet (F-15-1). This prop is the escape:
	 * it exists for **server-rendered and no-JS reachability**, so an overlay's
	 * content exists in the initial HTML for a crawler or a reader without
	 * JavaScript.
	 *
	 * ## The tradeoff, which is real
	 *
	 * An inline overlay lives inside the consumer's DOM, so it becomes subject to
	 * ancestor `overflow`, `transform` and `z-index` — exactly the coupling D-310
	 * chose `document.body` to avoid. A `transform` on any ancestor makes the
	 * backdrop's `position: fixed` resolve against that ancestor rather than the
	 * viewport, and an ancestor `overflow: hidden` can clip the panel.
	 *
	 * **A normal client-side dialog should not use this.** Reach for it only when
	 * the overlay's content has to be in the server-rendered HTML, and check the
	 * ancestors of the place you render it.
	 *
	 * `target` is ignored when this is set: there is no portal to aim.
	 *
	 * @default false
	 */
	inline?: boolean;
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
 *
 * Pass `inline` to opt out of the portal entirely — see the prop, which is where
 * the tradeoff that opt-out reintroduces is written down.
 */
export function DSPortal({ children, target, inline = false }: DSPortalProps) {
	// Hooks stay unconditional: `inline` is read only after they have run, so
	// toggling it across renders cannot change the hook order.
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	// No `mounted` gate and no createPortal — the gate exists only because
	// createPortal needs a real `document`, and in place there is nothing to
	// portal to. This is what makes the output non-empty on the server.
	if (inline) return <>{children}</>;
	if (!mounted) return null;
	return createPortal(children, target ?? document.body);
}
