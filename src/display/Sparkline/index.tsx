export interface SparklineProps {
	data: number[];
	width?: number;
	height?: number;
	color?: string;
	fill?: boolean;
}

export function Sparkline({
	data,
	width = 100,
	height = 28,
	color = "var(--amber)",
	fill = true,
}: SparklineProps) {
	if (data.length < 2) {
		if (process.env.NODE_ENV !== "production") {
			console.warn("Sparkline: data must have at least 2 points; received", data.length);
		}
		return null;
	}

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;

	const points = data
		.map((v, i) => {
			const x = (i / (data.length - 1)) * width;
			const y = height - ((v - min) / range) * (height - 4) - 2;
			return `${x},${y}`;
		})
		.join(" ");

	const fillPath = `M0,${height} L${points} L${width},${height} Z`;

	const last = data[data.length - 1]!;
	const dotY = height - ((last - min) / range) * (height - 4) - 2;

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			style={{ display: "block" }}
		>
			{fill && <path d={fillPath} fill={color} opacity=".1" />}
			<polyline
				points={points}
				fill="none"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx={width} cy={dotY} r="2.5" fill={color} />
		</svg>
	);
}
