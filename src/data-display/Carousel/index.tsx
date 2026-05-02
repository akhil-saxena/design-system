/**
 * # Usage Audit — Carousel (DS-65)
 *
 * Consumers (post v0.6):
 * - Marketing hero rotations: image galleries, tutorial steps, testimonial rotators
 *
 * API:
 * - slides: CarouselSlide[]           — array of { id, content, ariaLabel? }
 * - index / defaultIndex / onIndexChange — controlled or uncontrolled position
 * - autoPlayInterval: number           — ms between auto-advances; 0 = disabled
 * - showArrows: boolean                — render Prev/Next arrow buttons (default true)
 * - showDots: boolean                  — render dot indicator tablist (default true)
 * - ariaLabel: string                  — accessible label for the carousel region
 *
 * Implementation:
 * - WAI-ARIA Carousel pattern: <section aria-roledescription="carousel">
 *   with <div role="group" aria-roledescription="slide"> per slide
 * - Dot tablist: role="tablist" + role="tab" buttons with aria-selected
 * - Touch swipe via Pointer Events with setPointerCapture (lifted from BottomSheet)
 *   — touch-only filter via e.pointerType === "touch"
 * - Autoplay gated by useReducedMotion (W3C guidance: skip timer entirely when set)
 * - Pause on hover/focus per WAI-ARIA spec
 * - Keyboard: ArrowLeft/Right when carousel section has focus
 */

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ChevronLeft, ChevronRight } from "../../icons";
// ─── Public types ─────────────────────────────────────────────────────────────

export interface CarouselSlide {
	/** Unique key for React + DOM identity. */
	id: string | number;
	/** Content to render inside the slide. Consumer controls markup and media. */
	content: React.ReactNode;
	/**
	 * Override for the slide's aria-label. Defaults to "{i+1} of {N}".
	 * Use when you have a more descriptive label (e.g. "Product photo: Running shoe").
	 */
	ariaLabel?: string;
}

export interface CarouselProps {
	/** Array of slides to display. */
	slides: CarouselSlide[];
	/** Controlled current index. When provided, component is fully controlled. */
	index?: number;
	/** Initial index when uncontrolled. Defaults to 0. */
	defaultIndex?: number;
	/** Called when the active index changes (both controlled and uncontrolled). */
	onIndexChange?: (i: number) => void;
	/** Auto-advance interval in ms. 0 or undefined = no autoplay. Autoplay is
	 *  silently disabled when the OS prefers-reduced-motion preference is set. */
	autoPlayInterval?: number;
	/** Show Prev/Next arrow buttons. Defaults to true. */
	showArrows?: boolean;
	/** Show dot indicator navigation. Defaults to true. */
	showDots?: boolean;
	/** Accessible label for the carousel region (required). */
	ariaLabel: string;
	/** Additional className for the root section element. */
	className?: string;
	/** Inline style for the root section element. */
	style?: React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
	{
		slides,
		index: controlledIndex,
		defaultIndex = 0,
		onIndexChange,
		autoPlayInterval = 0,
		showArrows = true,
		showDots = true,
		ariaLabel,
		className,
		style,
	},
	ref,
) {
	const reducedMotion = useReducedMotion();

	// ─── Controlled / uncontrolled state ──────────────────────────────────────
	const [uncontrolled, setUncontrolled] = useState(defaultIndex);
	const isControlled = controlledIndex !== undefined;
	const index = isControlled ? controlledIndex : uncontrolled;

	// ─── Hover/focus pause state for autoplay ─────────────────────────────────
	const [paused, setPaused] = useState(false);

	// ─── Navigation ──────────────────────────────────────────────────────────
	const setIndex = useCallback(
		(i: number) => {
			const clamped = Math.max(0, Math.min(slides.length - 1, i));
			if (!isControlled) setUncontrolled(clamped);
			onIndexChange?.(clamped);
		},
		[slides.length, isControlled, onIndexChange],
	);

	const next = useCallback(() => setIndex(index + 1), [setIndex, index]);
	const prev = useCallback(() => setIndex(index - 1), [setIndex, index]);

	// Autoplay advance wraps to 0 at the end
	const advance = useCallback(() => {
		setIndex(index >= slides.length - 1 ? 0 : index + 1);
	}, [setIndex, index, slides.length]);

	// ─── Autoplay timer ───────────────────────────────────────────────────────
	// W3C WAI-ARIA carousel guidance: if prefers-reduced-motion is set,
	// do NOT start the timer at all. Hover/focus pauses it.
	useEffect(() => {
		if (!autoPlayInterval || reducedMotion || paused) return;
		const id = window.setInterval(advance, autoPlayInterval);
		return () => window.clearInterval(id);
	}, [autoPlayInterval, reducedMotion, paused, advance]);

	// ─── Touch swipe via Pointer Events ──────────────────────────────────────
	// Pattern lifted from BottomSheet.tsx (handleHandlePointerDown/Up).
	// Only fires for touch pointer type — preserves mouse click semantics.
	const dragRef = useRef<{ startX: number; pointerId: number } | null>(null);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		if (e.pointerType !== "touch") return;
		dragRef.current = { startX: e.clientX, pointerId: e.pointerId };
		try {
			(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
		} catch {
			// jsdom test envs and some older browsers may throw; safe to ignore.
		}
	}, []);

	const onPointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const s = dragRef.current;
			if (!s || s.pointerId !== e.pointerId) return;
			const delta = e.clientX - s.startX;
			try {
				(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
			} catch {
				// pointer may already be released; ignore
			}
			dragRef.current = null;
			if (delta < -40) next();
			else if (delta > 40) prev();
		},
		[next, prev],
	);

	// ─── Keyboard handler ────────────────────────────────────────────────────
	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLElement>) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				prev();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				next();
			}
		},
		[prev, next],
	);

	// ─── Render ───────────────────────────────────────────────────────────────
	return (
		<section
			ref={ref}
			aria-roledescription="carousel"
			aria-label={ariaLabel}
			className={`ds-atom-carousel${className ? ` ${className}` : ""}`}
			style={style}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			onKeyDown={onKeyDown}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: section must be focusable for keyboard ArrowLeft/Right navigation per WAI-ARIA Carousel pattern
			tabIndex={0}
		>
			{/* Viewport — intercepts touch pointer events */}
			<div
				className="ds-atom-carousel-viewport"
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				aria-live={autoPlayInterval && !reducedMotion && !paused ? "off" : "polite"}
			>
				<div
					className="ds-atom-carousel-track"
					style={{ transform: `translateX(-${index * 100}%)` }}
					data-reduced-motion={reducedMotion ? "true" : undefined}
				>
					{slides.map((slide, i) => (
						<div
							key={slide.id}
							// biome-ignore lint/a11y/useSemanticElements: role="group" on <div> is the correct WAI-ARIA Carousel slide pattern; <fieldset> is semantically incorrect here
							role="group"
							aria-roledescription="slide"
							aria-label={slide.ariaLabel ?? `${i + 1} of ${slides.length}`}
							aria-hidden={i !== index}
							className="ds-atom-carousel-slide"
						>
							{slide.content}
						</div>
					))}
				</div>
			</div>

			{/* Arrow navigation */}
			{showArrows && (
				<>
					<button
						type="button"
						aria-label="Previous slide"
						onClick={prev}
						disabled={index === 0}
						className="ds-atom-carousel-arrow ds-atom-carousel-arrow-prev"
					>
						<ChevronLeft size={20} aria-hidden="true" />
					</button>
					<button
						type="button"
						aria-label="Next slide"
						onClick={next}
						disabled={index === slides.length - 1}
						className="ds-atom-carousel-arrow ds-atom-carousel-arrow-next"
					>
						<ChevronRight size={20} aria-hidden="true" />
					</button>
				</>
			)}

			{/* Dot indicator navigation */}
			{showDots && (
				<div
					role="tablist"
					aria-label={`${ariaLabel} pagination`}
					className="ds-atom-carousel-dots"
				>
					{slides.map((_, i) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for dot nav — slides order is fixed during render
							key={i}
							role="tab"
							aria-selected={i === index}
							aria-label={`Go to slide ${i + 1}`}
							onClick={() => setIndex(i)}
							className="ds-atom-carousel-dot"
							data-active={i === index || undefined}
						/>
					))}
				</div>
			)}
		</section>
	);
});
