import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

/**
 * Colour tone of the badge.
 *
 * The first four are the **semantic status tones**, spelled exactly as
 * AlertBanner and Toast spell them, so one vocabulary covers status across the
 * system. Badge previously offered only the domain set below, which is why the
 * README and four stories all reached for tones that did not exist
 * (`tone="amber"`, `tone="info"`, `tone="success"`, `tone="warning"`) — none of
 * which type-checked, because story files were excluded from `tsc`.
 *
 * The remaining tones are the original JobDash job-application states. They are
 * kept for backwards compatibility, but they are *domain* vocabulary rather than
 * design-system vocabulary — prefer the semantic tones in new code, and model
 * application-specific states in the application.
 */
export type BadgeTone =
	// Semantic status — shared with AlertBanner and Toast.
	| "info"
	| "success"
	| "warning"
	| "error"
	// Neutral / quantity.
	| "neutral"
	| "count"
	// Domain-specific (legacy).
	| "upcoming"
	| "passed"
	| "pending"
	| "done";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	/** Color tone of the badge, mapping to a semantic status.
	 * @default "neutral"
	 */
	tone?: BadgeTone;
	/** When true, renders a small leading colored dot inside the badge; color defaults to the tone's vivid value. */
	dot?: boolean;
	/** Override the dot color with any CSS color string; falls back to the tone-mapped vivid color. */
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

// Tinted tones pair their hue's tint with the matching `*-ink` text token, which
// is darkened specifically for this composite. The plain --green / --red are
// tuned for a neutral surface and fall to ~4.2:1 once their own tint sits
// underneath — under AA for this 9.5px label, which is too small for the
// large-text allowance.
const toneStyles: Record<BadgeTone, CSSProperties> = {
	// Semantic status.
	info: { background: "rgba(59,130,246,.12)", color: "var(--blue)" }, // 8.82:1
	success: { background: "rgba(34,197,94,.14)", color: "var(--green-ink)" },
	warning: { background: "rgba(245,158,11,.15)", color: "var(--amber-ink)" }, // 6.18:1
	error: { background: "rgba(239,68,68,.12)", color: "var(--red-ink)" },
	// Neutral / quantity.
	neutral: { background: "var(--cream-2)", color: "var(--ink-2)" },
	count: { background: "var(--cream-3)", color: "var(--ink-2)" },
	// Domain-specific (legacy) — unchanged values.
	upcoming: { background: "rgba(59,130,246,.12)", color: "var(--blue)" },
	passed: { background: "rgba(34,197,94,.14)", color: "var(--green-ink)" },
	pending: { background: "var(--cream-2)", color: "var(--ink-3)" },
	done: { background: "rgba(139,92,246,.12)", color: "var(--purple)" },
};

const dotColors: Record<BadgeTone, string> = {
	info: "var(--blue-vivid)",
	success: "var(--green-vivid)",
	warning: "var(--amber-vivid)",
	error: "var(--red-vivid)",
	neutral: "var(--ink-3)",
	count: "var(--ink-3)",
	upcoming: "var(--blue-vivid)",
	passed: "var(--green-vivid)",
	pending: "var(--ink-4)",
	done: "var(--purple-vivid)",
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
