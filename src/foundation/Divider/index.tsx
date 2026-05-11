import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type DividerSpacing = "none" | "sm" | "md" | "lg" | "xl";
export type DividerAccent = "dashed" | "amber";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
	/** Optional centered label between two hairlines (e.g. "OR"). */
	label?: ReactNode;
	/** When true, renders vertically (height: 100%, width: 1px). @default false */
	vertical?: boolean;
	/** Override the hairline color (defaults to var(--rule)). */
	color?: string;
	/** Margin preset — data-attr-driven via primitives.css. When set, overrides
	 * the legacy default (no margin for horizontal, var(--space-3) horizontal
	 * for vertical). */
	spacing?: DividerSpacing;
	/** Accent style — `dashed` uses a dashed top-border, `amber` paints an
	 * amber-tinted 2px hairline. */
	accent?: DividerAccent;
}

/**
 * Hairline rule with an optional centered label.
 *
 * - Horizontal (default): `1px` rule across the row; label centered with
 *   monospace caps if provided (e.g. the "OR" between OAuth and email forms).
 * - Vertical: `1px` rule fills the parent's height.
 *
 * New axes (data-attr driven):
 * - `spacing` adds the bundle's margin presets.
 * - `accent` swaps to dashed or amber-tinted stylings via primitives.css.
 *
 * @example
 * <Divider />
 * <Divider label="OR" spacing="md" />
 * <Divider accent="amber" spacing="lg" />
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
	{ label, vertical = false, color, spacing, accent, className, style, ...rest },
	ref,
) {
	const ruleColor = color ?? "var(--rule)";
	const orient = vertical ? "vertical" : "horizontal";
	// Inline background only applies when the consumer hasn't selected an
	// accent style (since `dashed` swaps to a top-border, `amber` overrides bg).
	const inlineBg = accent ? undefined : ruleColor;

	if (vertical) {
		return (
			<div
				ref={ref}
				className={`ds-atom-divider${className ? ` ${className}` : ""}`}
				data-orient={orient}
				data-spacing={spacing}
				data-style={accent}
				style={{
					width: 1,
					alignSelf: "stretch",
					background: inlineBg,
					...style,
				}}
				{...rest}
			/>
		);
	}

	if (!label) {
		return (
			<div
				ref={ref}
				className={`ds-atom-divider${className ? ` ${className}` : ""}`}
				data-orient={orient}
				data-spacing={spacing}
				data-style={accent}
				style={{
					height: 1,
					width: "100%",
					background: inlineBg,
					...style,
				}}
				{...rest}
			/>
		);
	}

	const baseLabeled: CSSProperties = {
		display: "flex",
		alignItems: "center",
		gap: 12,
		...style,
	};
	const lineStyle: CSSProperties = {
		flex: 1,
		height: 1,
		background: ruleColor,
	};
	const labelStyle: CSSProperties = {
		fontFamily: "var(--mono)",
		fontSize: 9.5,
		fontWeight: 700,
		letterSpacing: "0.1em",
		textTransform: "uppercase",
		color: "var(--ink-4)",
	};

	return (
		<div
			ref={ref}
			className={`ds-atom-divider${className ? ` ${className}` : ""}`}
			data-orient={orient}
			data-spacing={spacing}
			data-labeled="true"
			style={baseLabeled}
			{...rest}
		>
			<span style={lineStyle} />
			<span style={labelStyle}>{label}</span>
			<span style={lineStyle} />
		</div>
	);
});
