import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export interface DotGridProps extends HTMLAttributes<HTMLDivElement> {
	/** Dot color (any CSS color). @default "var(--cream)" */
	color?: string;
	/** Dot opacity. @default 0.055 */
	opacity?: number;
	/** Tile size in px — controls dot spacing. @default 18 */
	tile?: number;
	/** Dot radius in px. @default 1.4 */
	dotRadius?: number;
}

/**
 * Radial-gradient dot-pattern overlay. Use as an `position: absolute; inset: 0;`
 * decoration on dark hero panels, marketing surfaces, or empty-state backgrounds.
 *
 * Pointer-events disabled so it never blocks content underneath.
 *
 * @example
 * <div style={{ position: "relative" }}>
 *   <DotGrid />
 *   <p>Hero content over dots…</p>
 * </div>
 */
export const DotGrid = forwardRef<HTMLDivElement, DotGridProps>(function DotGrid(
	{
		color = "var(--cream)",
		opacity = 0.055,
		tile = 18,
		dotRadius = 1.4,
		style,
		className,
		...rest
	},
	ref,
) {
	const composed: CSSProperties = {
		position: "absolute",
		inset: 0,
		pointerEvents: "none",
		opacity,
		backgroundImage: `radial-gradient(circle, ${color} ${dotRadius}px, transparent ${dotRadius + 0.2}px)`,
		backgroundSize: `${tile}px ${tile}px`,
		...style,
	};
	return (
		<div
			ref={ref}
			aria-hidden="true"
			className={`ds-atom-dotgrid${className ? ` ${className}` : ""}`}
			style={composed}
			{...rest}
		/>
	);
});
