import { type ReactNode, useCallback, useEffect, useState } from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useDismiss } from "../../hooks/useDismiss";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { ChevronLeft, ChevronRight, X } from "../../icons";
import { IconButton } from "../../inputs/IconButton";
export interface LightboxItem {
	src: string;
	alt: string;
	caption?: ReactNode;
}

export interface LightboxProps {
	/** Controls visibility; component returns null when false. */
	open: boolean;
	/** Called when the user clicks the close button or presses Escape. */
	onClose: () => void;
	/** Ordered array of images to display; must be non-empty when open. */
	items: LightboxItem[];
	/** Controlled index of the currently displayed image.
	 * @default 0
	 */
	activeIndex?: number;
	/** Called when the user navigates to a different image with the new index. */
	onIndexChange?: (index: number) => void;
}

/**
 * Lightbox - full-bleed media-display overlay where the image IS the surface.
 * D-350: heavier backdrop rgba(0,0,0,.92), arrow-key navigation with wrap-
 * around, always-dark invariant (NO :root.dark overrides). Modal-adjacent
 * architecture (DSPortal-mounted, Escape-to-close, focus-trapped).
 *
 * Controlled OR uncontrolled:
 * - Controlled: caller supplies BOTH `activeIndex` AND `onIndexChange`; the
 *   Lightbox forwards navigation and renders the caller-owned index.
 * - Uncontrolled: omit `onIndexChange` (and/or `activeIndex`) and the Lightbox
 *   owns its own index, so prev/next + arrow keys work standalone. `activeIndex`
 *   (when given) seeds the initial slide. The index is always clamped to range.
 *
 *   <Lightbox
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     items={[{ src: "/a.jpg", alt: "Resume" }]}
 *   />
 *
 * a11y: role="dialog" + aria-modal + aria-label includes active item.alt;
 * useFocusTrap cycles Tab inside the dialog, lands initial focus on the close
 * button, and restores focus to the opener on close; ArrowLeft/Right + Escape
 * via a global document keydown listener.
 */
export function Lightbox({ open, onClose, items, activeIndex, onIndexChange }: LightboxProps) {
	// Callback-ref pattern: the portal-mounted backdrop materializes one tick
	// after render, so useFocusTrap must receive the live node.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const length = items.length;

	// Controlled when the parent both supplies an index AND a change handler;
	// otherwise the Lightbox owns its own index (uncontrolled) so prev/next +
	// arrows work without a controlling parent.
	const isControlled = activeIndex != null && onIndexChange != null;
	const [internalIndex, setInternalIndex] = useState(activeIndex ?? 0);

	// Resolve + clamp the live index to the valid range (guards out-of-range
	// controlled values and items shrinking underneath us).
	const rawIndex = isControlled ? (activeIndex ?? 0) : internalIndex;
	const safeLength = Math.max(length, 1);
	const index = length > 0 ? Math.min(Math.max(rawIndex, 0), length - 1) : 0;
	const current = items[index];
	const showNav = length > 1;

	// Focus trap (Tab cycling + focus restore on close). The close button is the
	// first focusable child, so it receives initial focus.
	useFocusTrap(panel, open);

	// Body scroll-lock while open — reference-counted so nested overlays
	// (a ConfirmDialog raised from this surface) release correctly.
	useScrollLock(open);
	useDismiss(open, onClose);

	// Keep internal index in sync with the activeIndex prop when uncontrolled
	// (lets a parent set an initial slide without taking over navigation).
	useEffect(() => {
		if (!isControlled && activeIndex != null) setInternalIndex(activeIndex);
	}, [activeIndex, isControlled]);

	// useCallback so the document keydown effect below can declare it. As a plain
	// function it was re-created every render while the effect's dependency list
	// omitted it — the listener therefore closed over whichever `navigateTo` was
	// current when `open`/`index`/`length` last changed.
	const navigateTo = useCallback(
		(next: number) => {
			const wrapped = ((next % safeLength) + safeLength) % safeLength;
			if (!isControlled) setInternalIndex(wrapped);
			onIndexChange?.(wrapped);
		},
		[safeLength, isControlled, onIndexChange],
	);

	function goPrev() {
		if (!showNav) return;
		navigateTo(index - 1);
	}

	function goNext() {
		if (!showNav) return;
		navigateTo(index + 1);
	}

	useEffect(() => {
		if (!open) return;

		// Escape is handled by useDismiss above so nested layers unwind correctly;
		// this listener owns only the navigation keys.
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				if (length <= 1) return;
				navigateTo(index - 1);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				if (length <= 1) return;
				navigateTo(index + 1);
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
		// navigateTo is recreated each render but closes over the latest `index`;
		// re-subscribing on index change keeps the handler current.
	}, [open, index, length, navigateTo]);

	if (!open || !current) return null;

	const dialogLabel = `Image lightbox: ${current.alt}`;

	return (
		<DSPortal>
			<div
				ref={setPanel}
				className="ds-atom-lightbox-backdrop"
				// biome-ignore lint/a11y/useSemanticElements: role="dialog" + aria-modal is the standard ARIA pattern; native <dialog> behavior conflicts with custom DSPortal mounting + arrow-key navigation
				role="dialog"
				aria-label={dialogLabel}
				aria-modal="true"
				tabIndex={-1}
			>
				<IconButton
					className="ds-atom-lightbox-close"
					onClick={onClose}
					label="Close lightbox"
					icon={<X size={20} />}
				/>

				{showNav ? (
					<IconButton
						className="ds-atom-lightbox-prev"
						onClick={goPrev}
						label="Previous image"
						icon={<ChevronLeft size={20} />}
					/>
				) : null}

				<img className="ds-atom-lightbox-image" src={current.src} alt={current.alt} />
				{current.caption ? <div className="ds-atom-lightbox-caption">{current.caption}</div> : null}

				{showNav ? (
					<IconButton
						className="ds-atom-lightbox-next"
						onClick={goNext}
						label="Next image"
						icon={<ChevronRight size={20} />}
					/>
				) : null}
			</div>
		</DSPortal>
	);
}
