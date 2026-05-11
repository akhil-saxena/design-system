import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
	/** Optional centered label between two hairlines (e.g. "OR"). */
	label?: ReactNode;
	/** When true, renders vertically (height: 100%, width: 1px). @default false */
	vertical?: boolean;
	/** Override the hairline color (defaults to var(--rule)). */
	color?: string;
}

/**
 * Hairline rule with an optional centered label.
 *
 * - Horizontal (default): `1px` rule across the row; label centered with
 *   monospace caps if provided (e.g. the "OR" between OAuth and email forms).
 * - Vertical: `1px` rule fills the parent's height.
 *
 * @example
 * <Divider />
 * <Divider label="OR" />
 * <Divider vertical />
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
	{ label, vertical = false, color, className, style, ...rest },
	ref,
) {
	const ruleColor = color ?? "var(--rule)";

	if (vertical) {
		return (
			<div
				ref={ref}
				className={`ds-atom-divider${className ? ` ${className}` : ""}`}
				style={{
					width: 1,
					alignSelf: "stretch",
					background: ruleColor,
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
				style={{
					height: 1,
					width: "100%",
					background: ruleColor,
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
