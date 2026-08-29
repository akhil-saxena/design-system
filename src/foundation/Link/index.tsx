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
};

// Inline styles only for variants that already shipped this way. New variants
// (`default`, `quiet`) live entirely in primitives.css under data-variant.
//
// D-4 — `footer` and `action` NO LONGER SET THEIR COLOUR PAIR HERE.
//
// Both used to inline `color: var(--ink)` and `textDecorationColor: "rgba(0, 0,
// 0, 0.25)"`. The second is a fixed black, and a consumer rendering these links
// on a #0d0d0f page measured exactly that value on every one of them, at all six
// device classes and both pointers — an underline three parts in 255 from the
// surface it sat on, which is to say none.
//
// The value could have been swapped for a token in place and the bug would have
// gone; the reason it moved to the stylesheet instead is the second half of the
// finding. primitives.css ALREADY declared the right dark value for these two
// variants, and that rule had never applied a single time, because an inline
// declaration outranks every stylesheet rule at every specificity. Leaving the
// declaration here would have left the next override just as dead. `color` and
// `text-decoration-color` for both variants now live in primitives.css beside the
// rest of the variant, and the mode difference lives in --link-underline-quiet.
//
// `textDecoration` and `textUnderlineOffset` went with them because `.ds-atom-link`
// already declares both, identically — they were duplicates, and removing a
// duplicate moves no pixel.
//
// fontSize and fontWeight STAY. They are not the finding, no stylesheet rule
// competes for them, and moving type metrics into a (0,2,0) rule would open a
// cascade contest this change has no reason to have.
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
	},
	action: {
		fontSize: 12.5,
		fontWeight: 700,
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
