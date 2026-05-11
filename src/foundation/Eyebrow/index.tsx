import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type EyebrowSize = "xs" | "sm" | "md";

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
	/** Type-scale token. @default "sm" */
	size?: EyebrowSize;
	/** Override color (defaults to var(--ink-3)). Used for amber kickers on dark heroes, etc. */
	color?: string;
}

const baseStyle: CSSProperties = {
	display: "inline-block",
	fontFamily: "var(--mono)",
	fontWeight: 700,
	letterSpacing: "0.1em",
	textTransform: "uppercase",
	lineHeight: 1,
};

const sizeStyles: Record<EyebrowSize, CSSProperties> = {
	xs: { fontSize: 8 },
	sm: { fontSize: 9.5 },
	md: { fontSize: 11 },
};

/**
 * Mono-caps eyebrow / overline. Used as form field labels, hero kickers,
 * section headers, and stage-chip captions.
 *
 * Pure styled `<span>` — no internal state, SSR-safe.
 *
 * @example
 * <Eyebrow>FULL NAME</Eyebrow>
 * <Eyebrow size="xs" color="var(--amber)">WELCOME BACK</Eyebrow>
 */
export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(function Eyebrow(
	{ size = "sm", color, className, style, children, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className={`ds-atom-eyebrow${className ? ` ${className}` : ""}`}
			style={{
				...baseStyle,
				...sizeStyles[size],
				color: color ?? "var(--ink-3)",
				...style,
			}}
			{...rest}
		>
			{children}
		</span>
	);
});
