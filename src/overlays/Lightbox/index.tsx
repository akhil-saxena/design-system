import { type ReactNode, useEffect, useRef } from "react";
import { DSPortal } from "../../_internals/DSPortal";
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
 * architecture (DSPortal-mounted, Escape-to-close, initial focus on close).
 *
 * Controlled pattern: caller manages activeIndex + onIndexChange. Lightbox
 * holds no state itself - pairs cleanly with gallery thumbnail-strip selection.
 *
 *   <Lightbox
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     items={[{ src: "/a.jpg", alt: "Resume" }]}
 *     activeIndex={0}
 *   />
 *
 * a11y: role="dialog" + aria-modal + aria-label includes active item.alt;
 * close button gets initial focus (image is non-focusable); ArrowLeft/Right
 * + Escape via global document keydown listener (no useFocusTrap - only 3
 * focusable elements).
 */
export function Lightbox({ open, onClose, items, activeIndex = 0, onIndexChange }: LightboxProps) {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const length = items.length;
	const current = items[activeIndex];
	const showNav = length > 1;

	function goPrev() {
		if (!showNav) return;
		onIndexChange?.((activeIndex - 1 + length) % length);
	}

	function goNext() {
		if (!showNav) return;
		onIndexChange?.((activeIndex + 1) % length);
	}

	useEffect(() => {
		if (!open) return;
		closeButtonRef.current?.focus();

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				if (length <= 1) return;
				onIndexChange?.((activeIndex - 1 + length) % length);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				if (length <= 1) return;
				onIndexChange?.((activeIndex + 1) % length);
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, activeIndex, length, onClose, onIndexChange]);

	if (!open || !current) return null;

	const dialogLabel = `Image lightbox: ${current.alt}`;

	return (
		<DSPortal>
			<div
				className="ds-atom-lightbox-backdrop"
				// biome-ignore lint/a11y/useSemanticElements: role="dialog" + aria-modal is the standard ARIA pattern; native <dialog> behavior conflicts with custom DSPortal mounting + arrow-key navigation
				role="dialog"
				aria-label={dialogLabel}
				aria-modal="true"
			>
				<button
					ref={closeButtonRef}
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
