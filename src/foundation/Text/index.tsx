import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type TextVariant = "body" | "small" | "caption" | "legal";
export type TextElement = "p" | "span" | "div";

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** Type-scale token. @default "body" */
	variant?: TextVariant;
	/** Semantic element to render. @default "p" */
	as?: TextElement;
	/** Override color (defaults to tone for variant). */
	color?: string;
	/** Override max-width — caps line length for readability. */
	maxWidth?: number | string;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--font)",
	margin: 0,
	lineHeight: "var(--lh-relaxed)" as unknown as number,
};

const variantStyles: Record<TextVariant, CSSProperties> = {
	body: { fontSize: "var(--text-base)", color: "var(--ink-2)" },
	small: { fontSize: "var(--text-sm)", color: "var(--ink-3)" },
	caption: { fontSize: "var(--text-sm)", color: "var(--ink-3)" },
	legal: {
		fontSize: "var(--text-xs)",
		color: "var(--ink-4)",
		lineHeight: "var(--lh-normal)" as unknown as number,
	},
};

/**
 * Body text primitive. Use for paragraphs, helper copy, footer legal lines,
 * subtitles, body slots inside cards/banners.
 *
 * Renders as `<p>` by default — pass `as="span"` for inline use inside larger
 * blocks, or `as="div"` when nesting block content (e.g. lists, links).
 *
 * @example
 * <Text>Mark every step of your job search.</Text>
 * <Text variant="caption" maxWidth={360}>Sent to alex@example.com…</Text>
 * <Text variant="legal" as="div">By creating an account…</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
	{ variant = "body", as = "p", color, maxWidth, className, style, children, ...rest },
	ref,
) {
	const Tag = as as unknown as React.ElementType;
	const composed: CSSProperties = {
		...baseStyle,
		...variantStyles[variant],
		...(color ? { color } : null),
		...(maxWidth ? { maxWidth } : null),
		...style,
	};
	return (
		<Tag
			ref={ref}
			className={`ds-atom-text${className ? ` ${className}` : ""}`}
			data-variant={variant}
			style={composed}
			{...rest}
		>
			{children}
		</Tag>
	);
});
