import {
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	type Ref,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useDismiss } from "../../hooks/useDismiss";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { ChevronLeft, ChevronRight, X } from "../../icons";
import { IconButton } from "../../inputs/IconButton";
export interface LightboxItem {
	/** Full-size image URL. Required even alongside `srcSet`: it is the fallback
	 *  for a browser that ignores `srcset`, and it is what `alt` pairs with. */
	src: string;
	alt: string;
	caption?: ReactNode;
	/** Candidate set for the `srcset` attribute, e.g.
	 *  `"/a-600.jpg 600w, /a-1200.jpg 1200w"`. Omit it and no `srcset` attribute
	 *  is emitted at all — an empty `srcset=""` is not the same thing. */
	srcSet?: string;
	/** Companion `sizes` attribute. Optional: with `srcset` but no `sizes` the
	 *  browser assumes `100vw`, which is already correct for a full-bleed
	 *  lightbox, so most callers never need it. */
	sizes?: string;
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
	/**
	 * Ref to the Lightbox panel element. The panel is portaled and only exists
	 * while the overlay is open, so this is `null` when it is closed.
	 */
	ref?: Ref<HTMLDivElement>;
}

/**
 * Maximum pointer travel, in CSS pixels, for a press-and-release to still count
 * as a *click* on the backdrop rather than a drag.
 *
 * Rejects: a drag that both starts and ends on the backdrop. Measured in
 * Chromium, that gesture emits a `click` whose target IS the backdrop and whose
 * originating `pointerdown` target is ALSO the backdrop — so both of the other
 * two guards pass, and without this check a horizontal swipe across empty space
 * would navigate and close the overlay in one gesture.
 */
const BACKDROP_TAP_SLOP_PX = 10;

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
 * Clicking the backdrop closes the overlay, and that is deliberately not
 * suppressible: no finding asks for it, the Lightbox has no fail-closed use, and
 * the analogous "make dismissal opt-out-able" request on Modal is a separate
 * finding (F-15-2) whose API decision belongs to that component, not this one.
 *
 * a11y: role="dialog" + aria-modal + aria-label includes active item.alt;
 * useFocusTrap cycles Tab inside the dialog, lands initial focus on the close
 * button, and restores focus to the opener on close; ArrowLeft/Right + Escape
 * via a global document keydown listener.
 */
export function Lightbox({ open, onClose, items, activeIndex, onIndexChange, ref }: LightboxProps) {
	// Callback-ref pattern: the portal-mounted backdrop materializes one tick
	// after render, so useFocusTrap must receive the live node.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	// The panel already carries an internal callback ref (focus trap and
	// positioning need the live node); composing lets a consumer's ref observe
	// the same element without displacing it.
	const composedPanelRef = useComposedRefs<HTMLDivElement>(setPanel, ref);
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

	// Pointer gesture bookkeeping, shared by backdrop-close and swipe. A ref, not
	// state: nothing here should trigger a render, and a click must read the value
	// the immediately preceding pointerup wrote.
	const gestureRef = useRef<{ x: number; y: number; startedOnBackdrop: boolean } | null>(null);
	const backdropTapRef = useRef(false);

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

	// ── pointer gestures ──────────────────────────────────────────────────────
	// The backdrop and the panel are the SAME element, so `onClick={onClose}`
	// would close on every click inside the overlay, the image included. Three
	// conditions gate the close, each of which was measured in Chromium rather
	// than assumed:
	//   1. the click's target is the backdrop itself (not a descendant)
	//   2. the pointerdown that began the gesture also landed on the backdrop —
	//      a drag from the image released over the backdrop emits a click whose
	//      target IS the backdrop, so condition 1 alone lets it through
	//   3. the pointer barely travelled (BACKDROP_TAP_SLOP_PX) — see that
	//      constant for the gesture conditions 1 and 2 both fail to reject
	//
	// setPointerCapture is deliberately NOT used. Measured in Chromium: capturing
	// on pointerdown retargets the subsequent compatibility mouse events to the
	// capturing element, so the close button's own onClick never fires and every
	// click reports the backdrop as its target — which defeats conditions 1 and 2
	// outright. The backdrop is `position: fixed; inset: 0`, so every pointer
	// event inside the window already bubbles to it and capture buys nothing.
	function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
		gestureRef.current = {
			x: e.clientX,
			y: e.clientY,
			startedOnBackdrop: e.target === e.currentTarget,
		};
		backdropTapRef.current = false;
	}

	function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
		const start = gestureRef.current;
		gestureRef.current = null;
		if (!start) return;
		const dx = e.clientX - start.x;
		const dy = e.clientY - start.y;
		backdropTapRef.current = start.startedOnBackdrop && Math.hypot(dx, dy) <= BACKDROP_TAP_SLOP_PX;
	}

	function onPointerCancel() {
		gestureRef.current = null;
		backdropTapRef.current = false;
	}

	function onBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target !== e.currentTarget) return;
		if (!backdropTapRef.current) return;
		backdropTapRef.current = false;
		onClose();
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
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard equivalent of a backdrop click is Escape, which useDismiss already owns as a stack so nested layers unwind one at a time. A local onKeyDown here would be exactly the second Escape path that hook exists to prevent. */}
			<div
				ref={composedPanelRef}
				className="ds-atom-lightbox-backdrop"
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerCancel}
				onClick={onBackdropClick}
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

				<img
					className="ds-atom-lightbox-image"
					src={current.src}
					srcSet={current.srcSet}
					sizes={current.sizes}
					alt={current.alt}
				/>
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
