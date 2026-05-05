import { useReducedMotion } from "../../hooks/useReducedMotion";

export interface MiniDonutProps {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}

export function MiniDonut({
	value,
	max = 100,
	size = 48,
	strokeWidth = 5,
	color = "var(--amber)",
}: MiniDonutProps) {
	const reducedMotion = useReducedMotion();

	const r = (size - strokeWidth) / 2;
	const circ = 2 * Math.PI * r;
	const pct = Math.min(value / max, 1);

	const arcStyle = reducedMotion
		? undefined
		: { transition: "stroke-dashoffset 0.6s ease-out" };

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={{ display: "block", transform: "rotate(-90deg)" }}
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
				style={arcStyle}
			/>
		</svg>
	);
}
