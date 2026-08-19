import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { Sparkline } from "../Sparkline";

export type StatCardChangeDir = "up" | "down";

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
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
	/** Ref to the root element. */
	ref?: Ref<HTMLDivElement>;
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
	ref,
	...rest
}: StatCardProps) {
	const up = changeDir === "up";
	const sentimentColor =
		changeDir === "up" ? "var(--green)" : changeDir === "down" ? "var(--red)" : "var(--amber)";

	return (
		<div
			ref={ref}
			// `ds-atom-statcard` FIRST, `glass` kept. `glass` is a shared
			// cross-component class in the ds-* namespace contract — it is declared in
			// utilities.css and other surfaces wear it too — so it was never a hook for
			// *this* component: a consumer selecting `.glass` selected every glass
			// surface on the page. The defect was the absence of a component-specific
			// class, not the presence of the shared one, so the fix is additive.
			className={["ds-atom-statcard", "glass", className].filter(Boolean).join(" ")}
			// `padding` moved to .ds-atom-statcard so a consumer can override it.
			// `borderRadius` deliberately did NOT: `.glass` declares
			// `border-radius: var(--radius-xl)` (16px) in utilities.css, which is
			// imported AFTER primitives.css — so a (0,1,0) rule there would tie with
			// `.glass` and lose on source order, silently changing these corners from
			// 12px to 16px. Same trap as plan 01-09's Text variant colours, one layer
			// over. Moving it needs `.glass` to stop setting a radius, which is a
			// utilities.css change and not this plan's.
			style={{ borderRadius: 12, ...style }}
			{...rest}
		>
			{/* Label */}
			<div data-part="label">{label}</div>

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
