import type { Ref, SVGAttributes } from "react";

export interface MiniDonutProps extends Omit<SVGAttributes<SVGSVGElement>, "color"> {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	/** Accessible label. Defaults to "{percentage}%". */
	ariaLabel?: string;
	/** Ref to the root `<svg>`. */
	ref?: Ref<SVGSVGElement>;
}

export function MiniDonut({
	value,
	max = 100,
	size = 48,
	strokeWidth = 5,
	color = "var(--amber)",
	ariaLabel,
	className,
	style,
	ref,
	...rest
}: MiniDonutProps) {
	const r = (size - strokeWidth) / 2;
	const circ = 2 * Math.PI * r;
	// `max={0}` yields 0/0 = NaN, which reaches both `strokeDashoffset` (the arc
	// vanishes) and the default `aria-label` — a screen reader announcing "NaN
	// percent". A negative `value` drives the offset past the circumference and
	// draws the arc backwards. Both are clamped here, matching the `max <= 0`
	// guard ProgressBar already applies.
	const safeMax = max > 0 ? max : 1;
	const pct = Math.min(Math.max(value, 0) / safeMax, 1);

	return (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={className}
			style={{ display: "block", transform: "rotate(-90deg)", ...style }}
			role="img"
			aria-label={ariaLabel ?? `${Math.round(pct * 100)}%`}
			{...rest}
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke="var(--cream-2)"
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeDasharray={circ}
				strokeDashoffset={circ * (1 - pct)}
				strokeLinecap="round"
				className="ds-atom-minidonut-arc"
			/>
		</svg>
	);
}
