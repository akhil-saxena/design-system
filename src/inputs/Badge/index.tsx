import { type HTMLAttributes, forwardRef } from "react";

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
 *
 * For a status with three or more values that must be told apart at a glance,
 * prefer `StatusPill`'s generic tone path: its fills are a measured 1.2:1
 * ladder with a non-colour marker, where these tones are 12–15% alpha washes
 * that all land within 1.15:1 of a light page (F-15-5).
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

/**
 * Badge - small uppercase label chip.
 *
 * ## F-15-4: it used to emit no class at all
 *
 * Every declaration below now lives in `primitives.css` under
 * `.ds-atom-badge`, reachable as `dist/css/badge.css`. Before this change the
 * component rendered `<span style="font-family:var(--mono);font-size:9.5px;…">`
 * with **no `className` on the element**, and there was no `badge.css` to
 * import — on a component that appears on all seven admin screens, in the
 * sidebar, in the topbar and in every list. A contrast or reflow audit had to
 * select it as `span:not([class])`.
 *
 * **Deleting the inline object is the load-bearing part, not adding the class.**
 * An inline style beats a class rule without `!important`, so a `ds-atom-badge`
 * added *beside* the old `baseStyle` would have satisfied a grep and left the
 * hardcoded type just as unreachable. The type step is now `--text-2xs`, which
 * is 9.5px in the scale, so nothing moves visually while the size becomes
 * overridable.
 *
 * `dotColor` is the one surviving inline style, because it is a runtime colour
 * string with nowhere else to live. The tone-mapped default is not: it resolves
 * from `[data-tone]` in CSS like everything else.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
	{ tone = "neutral", dot, dotColor, children, className, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className={`ds-atom-badge${className ? ` ${className}` : ""}`}
			data-tone={tone}
			{...rest}
		>
			{dot ? (
				<span
					className="ds-atom-badge-dot"
					style={dotColor ? { background: dotColor } : undefined}
					aria-hidden="true"
				/>
			) : null}
			{children}
		</span>
	);
});
