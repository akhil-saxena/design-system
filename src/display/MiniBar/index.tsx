import type { HTMLAttributes, Ref } from "react";

export interface MiniBarProps extends HTMLAttributes<HTMLDivElement> {
	data: number[];
	labels?: string[];
	height?: number;
	barColor?: string;
	/**
	 * Ref to the root element. Charts are routinely measured, observed for
	 * visibility, or scrolled into view, and this one had no reachable node.
	 */
	ref?: Ref<HTMLDivElement>;
}

export function MiniBar({
	data,
	labels,
	height = 100,
	barColor = "var(--amber)",
	className,
	style,
	ref,
	...rest
}: MiniBarProps) {
	// `Math.max()` of an empty array is -Infinity, and an all-zero series gives a
	// max of 0 — so the bar height became `NaN%` or a negative percentage and the
	// chart silently rendered nothing. An all-zero series is not a degenerate
	// input; it is what "no sales yet this week" looks like. Bars are clamped at
	// zero so a negative datum reads as empty rather than inverting the column.
	const max = data.length > 0 ? Math.max(...data) : 0;
	const scale = max > 0 ? max : 1;

	return (
		<div
			ref={ref}
			className={className}
			// Consumer styles come last so a caller can override the layout defaults.
			style={{ display: "flex", alignItems: "flex-end", gap: 6, height, ...style }}
			{...rest}
		>
			{data.map((v, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: bar-by-position rendering; index is the stable key
					key={i}
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 4,
						height: "100%",
						justifyContent: "flex-end",
					}}
				>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-3)",
							fontWeight: 600,
						}}
					>
						{v}
					</span>
					<div
						className="ds-atom-minibar-bar"
						style={{
							// Only the data-derived values stay inline; the rest is in CSS so
							// the reduced-motion guard and any consumer override apply.
							height: `${(Math.max(v, 0) / scale) * 70}%`,
							background: barColor,
						}}
					/>
					{labels && (
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 8,
								color: "var(--ink-4)",
							}}
						>
							{labels[i]}
						</span>
					)}
				</div>
			))}
		</div>
	);
}
