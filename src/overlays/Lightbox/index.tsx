import { type ReactNode, useEffect, useState } from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { ChevronLeft, ChevronRight, X } from "../../icons";
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

	// Body scroll-lock while open (SSR-guarded; restores prior overflow on
	// close/unmount).
	useEffect(() => {
		if (!open || typeof document === "undefined") return;
		const { body } = document;
		const previousOverflow = body.style.overflow;
		body.style.overflow = "hidden";
		return () => {
			body.style.overflow = previousOverflow;
		};
	}, [open]);

	// Keep internal index in sync with the activeIndex prop when uncontrolled
	// (lets a parent set an initial slide without taking over navigation).
	useEffect(() => {
		if (!isControlled && activeIndex != null) setInternalIndex(activeIndex);
	}, [activeIndex, isControlled]);

	function navigateTo(next: number) {
		const wrapped = ((next % safeLength) + safeLength) % safeLength;
		if (isControlled) {
			onIndexChange?.(wrapped);
		} else {
			setInternalIndex(wrapped);
			onIndexChange?.(wrapped);
		}
	}

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

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			} else if (e.key === "ArrowLeft") {
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
	}, [open, index, length, onClose]);

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
				<button
					type="button"
					className="ds-atom-lightbox-close"
					onClick={onClose}
					aria-label="Close lightbox"
				>
					<X size={20} aria-hidden="true" />
				</button>

				{showNav ? (
					<button
						type="button"
						className="ds-atom-lightbox-prev"
						onClick={goPrev}
						aria-label="Previous image"
					>
						<ChevronLeft size={20} aria-hidden="true" />
					</button>
				) : null}

				<img className="ds-atom-lightbox-image" src={current.src} alt={current.alt} />
				{current.caption ? <div className="ds-atom-lightbox-caption">{current.caption}</div> : null}

				{showNav ? (
					<button
						type="button"
						className="ds-atom-lightbox-next"
						onClick={goNext}
						aria-label="Next image"
					>
						<ChevronRight size={20} aria-hidden="true" />
					</button>
				) : null}
			</div>
		</DSPortal>
	);
}
