import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type BadgeTone = "upcoming" | "passed" | "pending" | "done" | "count" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
	/** When true, renders a small leading colored dot inside the badge.
	 * Color defaults to the tone's vivid; override via `dotColor`. */
	dot?: boolean;
	/** Override the dot color (CSS color string). Falls back to tone-mapped vivid. */
	dotColor?: string;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 9.5,
	padding: "3px 8px",
	borderRadius: 999,
	letterSpacing: "0.05em",
	textTransform: "uppercase",
	fontWeight: 700,
	display: "inline-flex",
	alignItems: "center",
	gap: 5,
	whiteSpace: "nowrap",
};

const toneStyles: Record<BadgeTone, CSSProperties> = {
	upcoming: { background: "rgba(59,130,246,.12)", color: "var(--blue)" },
	passed: { background: "rgba(34,197,94,.14)", color: "var(--green)" },
	pending: { background: "var(--cream-2)", color: "var(--ink-3)" },
	done: { background: "rgba(139,92,246,.12)", color: "var(--purple)" },
	count: { background: "var(--cream-3)", color: "var(--ink-2)" },
	neutral: { background: "var(--cream-2)", color: "var(--ink-2)" },
};

const dotColors: Record<BadgeTone, string> = {
	upcoming: "var(--blue-vivid)",
	passed: "var(--green-vivid)",
	pending: "var(--ink-4)",
	done: "var(--purple-vivid)",
	count: "var(--ink-3)",
	neutral: "var(--ink-3)",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
	{ tone = "neutral", dot, dotColor, children, style, ...rest },
	ref,
) {
	return (
		<span ref={ref} style={{ ...baseStyle, ...toneStyles[tone], ...style }} {...rest}>
			{dot ? (
				<span
					style={{
						display: "inline-block",
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: dotColor ?? dotColors[tone],
					}}
					aria-hidden="true"
				/>
			) : null}
			{children}
		</span>
	);
});
