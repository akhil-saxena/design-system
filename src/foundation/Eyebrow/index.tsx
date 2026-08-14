import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";
import { type LegacyTone, type Tone, resolveTone } from "../tone";

export type EyebrowSize = "xs" | "sm" | "md";
/**
 * Tone override for Eyebrow. Omit for the component's default colour.
 *
 * Semantic names (`muted` | `accent`) describe the role; the
 * deprecated raw-token spellings (`ink`, `ink-2`, `ink-3`, `ink-4`, `amber`, …)
 * still work and render identically. See src/foundation/tone.ts for why the
 * vocabulary changed.
 */
export type EyebrowTone = Extract<Tone, "muted" | "accent"> | LegacyTone;

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
	/** Type-scale token. @default "sm" */
	size?: EyebrowSize;
	/** Override color (legacy — defaults to var(--ink-3)). Use `tone` for the
	 * declarative path. */
	color?: string;
	/** Tone token — emits a data-attr so CSS rules apply the color. */
	tone?: EyebrowTone;
}

const baseStyle: CSSProperties = {
	display: "inline-block",
	fontFamily: "var(--mono)",
	fontWeight: "var(--weight-bold)",
	letterSpacing: "var(--ls-wide)",
	textTransform: "uppercase",
	lineHeight: 1,
};

const sizeStyles: Record<EyebrowSize, CSSProperties> = {
	xs: { fontSize: 8 },
	sm: { fontSize: "var(--text-2xs)" },
	md: { fontSize: "var(--text-xs)" },
};

/**
 * Mono-caps eyebrow / overline. Used as form field labels, hero kickers,
 * section headers, and stage-chip captions.
 *
 * `tone` (declarative, CSS data-attr) is the preferred way to set color in
 * new code; `color` (legacy inline override) still works for one-offs.
 *
 * @example
 * <Eyebrow>FULL NAME</Eyebrow>
 * <Eyebrow size="md" tone="accent">WELCOME BACK</Eyebrow>
 */
export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(function Eyebrow(
	{ size = "sm", color, tone, className, style, children, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className={`ds-atom-eyebrow${className ? ` ${className}` : ""}`}
			data-tone={resolveTone(tone)}
			style={{
				...baseStyle,
				...sizeStyles[size],
				...(color ? { color } : tone ? null : { color: "var(--ink-3)" }),
				...style,
			}}
			{...rest}
		>
			{children}
		</span>
	);
});
