import type { CSSProperties } from "react";
import { Sparkline } from "../Sparkline";

export type StatCardChangeDir = "up" | "down";

export interface StatCardProps {
	/** Monospace uppercase label, e.g. "Total Applications" */
	label: string;
	/** Primary metric value as string or number, e.g. "24", "42%", "4.2d" */
	value: string | number;
	/** Change string displayed in trend badge, e.g. "+12%", "-5%" */
	change?: string;
	/** Trend direction — determines badge and sparkline color */
	changeDir?: StatCardChangeDir;
	/** Sparkline data points — renders chart when provided (min 2 points) */
	data?: number[];
	/** Additional className forwarded to the root div */
	className?: string;
	/** Additional inline styles for the root div */
	style?: CSSProperties;
}

export function StatCard({
	label,
	value,
	change,
	changeDir,
	data,
	className,
	style,
}: StatCardProps) {
	const up = changeDir === "up";
	const sentimentColor =
		changeDir === "up" ? "var(--green)" : changeDir === "down" ? "var(--red)" : "var(--amber)";

	return (
		<div
			className={["glass", className].filter(Boolean).join(" ")}
			style={{ padding: 16, borderRadius: 12, ...style }}
		>
			{/* Label */}
			<div
				data-part="label"
				style={{
					fontFamily: "var(--mono)",
					fontSize: 9,
					color: "var(--ink-3)",
					letterSpacing: ".08em",
					textTransform: "uppercase",
					fontWeight: 700,
				}}
			>
				{label}
			</div>

			{/* Value + badge row */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<div
					style={{
						fontFamily: "var(--display)",
						fontWeight: 800,
						fontSize: 28,
						letterSpacing: "-.02em",
						marginTop: 4,
					}}
				>
					{value}
				</div>

				{change && (
					<div
						data-part="badge"
						style={{
							padding: "3px 7px",
							borderRadius: 4,
							background: up ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.08)",
							fontFamily: "var(--mono)",
							fontSize: 10,
							fontWeight: 700,
							color: up ? "var(--green)" : "var(--red)",
						}}
					>
						{change}
					</div>
				)}
			</div>

			{/* Sparkline */}
			{data && data.length >= 2 && (
				<div style={{ marginTop: 10 }}>
					<Sparkline data={data} color={sentimentColor} />
				</div>
			)}
		</div>
	);
}
