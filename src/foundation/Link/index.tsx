import { type AnchorHTMLAttributes, type CSSProperties, type ElementType, forwardRef } from "react";

export type LinkVariant = "default" | "inline" | "footer" | "action" | "quiet";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Style variant.
	 * - `default` — neutral inline link, amber on hover.
	 * - `inline` — body-text inline link, amber underline.
	 * - `footer` — small footer/cross-link.
	 * - `action` — bold action link with trailing arrow (e.g. "Sign in →").
	 * - `quiet` — muted, no underline until hover.
	 * @default "inline"
	 */
	variant?: LinkVariant;
	/** Override color (inline). */
	color?: string;
	/** Override the rendered element. Use to attach Link styles to a `<button>`
	 * or any custom element. @default "a"
	 */
	as?: ElementType;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--font)",
	cursor: "pointer",
	transition: "color .15s, text-decoration-color .15s",
};

// Inline styles only for variants that already shipped this way. New variants
// (`default`, `quiet`) live entirely in primitives.css under data-variant.
const variantStyles: Partial<Record<LinkVariant, CSSProperties>> = {
	inline: {
		color: "var(--amber-d)",
		textDecoration: "underline",
		textDecorationColor: "var(--amber-d)",
		textUnderlineOffset: 2,
	},
	footer: {
		fontSize: 12.5,
		fontWeight: 600,
		color: "var(--ink)",
		textDecoration: "underline",
		textDecorationColor: "rgba(0, 0, 0, 0.25)",
		textUnderlineOffset: 2,
	},
	action: {
		fontSize: 12.5,
		fontWeight: 700,
		color: "var(--ink)",
		textDecoration: "underline",
		textDecorationColor: "rgba(0, 0, 0, 0.25)",
		textUnderlineOffset: 2,
	},
};

/**
 * Text-style hyperlink primitive. Five variants cover the common surfaces:
 * default (neutral), inline (body-text amber), footer (small cross-link),
 * action (bold with arrow), quiet (muted, hover-only underline).
 *
 * `as` overrides the rendered element — useful when the visual contract is
 * "link" but the semantic is "button" (e.g. JS-handled actions).
 *
 * @example
 * <Link href="/signin">Sign in</Link>
 * <Link variant="quiet" href="/legal">Legal</Link>
 * <Link variant="footer" as="button" onClick={clear}>CLEAR</Link>
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{ variant = "inline", color, as, className, style, children, ...rest },
	ref,
) {
	const Tag = (as ?? "a") as ElementType;
	const variantInline = variantStyles[variant];
	return (
		<Tag
			ref={ref}
			className={`ds-atom-link${className ? ` ${className}` : ""}`}
			data-variant={variant}
			style={{
				...baseStyle,
				...(variantInline ?? null),
				...(color ? { color } : null),
				...style,
			}}
			{...rest}
		>
			{children}
		</Tag>
	);
});
