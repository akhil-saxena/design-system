import { type AnchorHTMLAttributes, type CSSProperties, forwardRef } from "react";

export type LinkVariant = "inline" | "footer" | "action";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Style variant.
	 * - `inline` — body-text inline link, underlined.
	 * - `footer` — small footer/cross-link, semi-underlined.
	 * - `action` — bold action link with trailing arrow (e.g. "Sign in →").
	 * @default "inline"
	 */
	variant?: LinkVariant;
	/** Override color. */
	color?: string;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--font)",
	cursor: "pointer",
	transition: "color .15s, text-decoration-color .15s",
};

const variantStyles: Record<LinkVariant, CSSProperties> = {
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
 * Text-style hyperlink primitive. Three variants cover inline body links,
 * small footer cross-links, and bold action links with optional trailing arrows.
 *
 * Renders as `<a>` so it spreads native anchor props (`href`, `target`, etc.).
 *
 * @example
 * <Link href="/signin">Sign in</Link>
 * <Link variant="footer" href="/terms">Terms</Link>
 * <Link variant="action" href="/signin">Back to sign in →</Link>
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{ variant = "inline", color, className, style, children, ...rest },
	ref,
) {
	return (
		<a
			ref={ref}
			className={`ds-atom-link${className ? ` ${className}` : ""}`}
			data-variant={variant}
			style={{
				...baseStyle,
				...variantStyles[variant],
				...(color ? { color } : null),
				...style,
			}}
			{...rest}
		>
			{children}
		</a>
	);
});
