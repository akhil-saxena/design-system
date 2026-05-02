import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type SkeletonShape = "text" | "circle" | "pill";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	/** Shape of the skeleton placeholder.
	 * - `text` — full-width line at `1.2em` height (default).
	 * - `circle` — disc sized to `width`; use for avatar placeholders.
	 * - `pill` — rounded badge/chip-sized shape at `1.5em` height.
	 * @default "text"
	 */
	shape?: SkeletonShape;
	/** Width of the skeleton; accepts any CSS length or a pixel number.
	 * @default "100%"
	 */
	width?: number | string;
	/** Height override; defaults are shape-aware (text → 1.2em, circle → width, pill → 1.5em). */
	height?: number | string;
}

/**
 * Resolve the shape-aware default height when the consumer omits `height`.
 *
 * - text  → "1.2em" (matches surrounding line-height; consumer doesn't
 *           need to compute pixel heights for inline placeholders)
 * - pill  → "1.5em" (badge/chip-sized)
 * - circle → falls back to `width` so the resulting square renders as
 *            a true circle (e.g., `<Skeleton shape="circle" width={40} />`
 *            yields a 40×40 disc)
 */
function shapeDefaultHeight(
	shape: SkeletonShape,
	width: number | string | undefined,
): string | number | undefined {
	if (shape === "text") return "1.2em";
	if (shape === "pill") return "1.5em";
	// circle: mirror width only when it's a pixel number; percentage widths
	// cannot be mirrored to height without an explicit parent height, so fall
	// back to a sensible avatar-sized default (48px).
	return typeof width === "number" ? width : 48;
}

/**
 * Skeleton — placeholder shape for loading states (DS-43, D-420).
 *
 *   <Skeleton />                                 // default text line, full width
 *   <Skeleton width={120} />                     // 120px text line
 *   <Skeleton shape="circle" width={40} />       // 40x40 circle (avatar placeholder)
 *   <Skeleton shape="pill" width={80} />         // pill (badge / chip placeholder)
 *
 * Single primitive with `shape` prop instead of three separate primitives —
 * keeps barrel small (D-420). Compose multi-line / avatar+name / card
 * placeholders by rendering MULTIPLE Skeletons inside a consumer-controlled
 * flex/grid container — the primitive itself renders ONE node only.
 *
 * Visual: cream-2 background with pulse animation (opacity 0.6 ↔ 1 at
 * 1.2s ease-in-out infinite). Dark mode: rgba(255,255,255,0.06).
 *
 * `aria-hidden="true"` is hard-coded — Skeleton is decorative. Consumers
 * wrap the surrounding region with their own `aria-busy={loading}` or
 * similar to communicate the loading state to assistive tech.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
	{ shape = "text", width = "100%", height, className, style, ...rest },
	ref,
) {
	const resolvedHeight = height ?? shapeDefaultHeight(shape, width);

	const mergedStyle: CSSProperties = { width, height: resolvedHeight, ...style };

	return (
		<div
			ref={ref}
			className={`ds-atom-skeleton${className ? ` ${className}` : ""}`}
			data-shape={shape}
			aria-hidden="true"
			style={mergedStyle}
			{...rest}
		/>
	);
});

Skeleton.displayName = "Skeleton";
