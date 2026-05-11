import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type EyebrowSize = "xs" | "sm" | "md";
export type EyebrowTone = "ink-3" | "ink-4" | "amber";

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
	fontWeight: "var(--weight-bold)" as unknown as number,
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
 * <Eyebrow size="md" tone="amber">WELCOME BACK</Eyebrow>
 */
export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(function Eyebrow(
	{ size = "sm", color, tone, className, style, children, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className={`ds-atom-eyebrow${className ? ` ${className}` : ""}`}
			data-tone={tone}
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
