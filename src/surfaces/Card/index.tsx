import { type ElementType, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type CardVariant = "glass" | "amber" | "dark" | "kanban";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";
export type CardRadius = "sm" | "md" | "lg" | "xl";

/**
 * Surface wash layered over the `variant` preset.
 *
 * Replaces the old `tone` prop, which was three things at once and collided with
 * `variant`:
 *
 *   tone="amber"   → *also* a variant name, but a flat wash where the variant is
 *                    a gradient. Two different looks under one word.
 *   tone="cream-2" → leaked a token name into the public API.
 *   tone="flat"    → a border style, not a tone at all.
 *
 * The renderings are unchanged; only the names are.
 */
export type CardSurface = "tint" | "subtle" | "outline";

/** @deprecated Use `surface` — see {@link CardSurface}. */
export type CardTone = "amber" | "cream-2" | "flat";

/** @deprecated `hover` is a boolean now; `"elevate"` still works. */
export type CardHover = "elevate";

const SURFACE_ALIAS: Record<CardTone, CardSurface> = {
	amber: "tint",
	"cream-2": "subtle",
	flat: "outline",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Surface preset: the card's base background and border.
	 *
	 * @default "glass"
	 */
	variant?: CardVariant;
	/** Padding scale. Independent of variant. */
	padding?: CardPadding;
	/** Border-radius token. Independent of variant. */
	radius?: CardRadius;
	/**
	 * Wash layered over the variant — `tint` (amber), `subtle` (quiet fill) or
	 * `outline` (transparent with a dashed border).
	 */
	surface?: CardSurface;
	/**
	 * @deprecated Renamed to `surface`. `amber` → `tint`, `cream-2` → `subtle`,
	 * `flat` → `outline`. Still honoured, and ignored when `surface` is set.
	 */
	tone?: CardTone;
	/**
	 * Lift the card on hover — shadow, pointer cursor and a border-colour shift.
	 *
	 * Was a single-member union (`"elevate"`) being used as a boolean. The string
	 * is still accepted.
	 */
	hover?: boolean | CardHover;
	/** Override the rendered element. @default "div" */
	as?: ElementType;
	children: ReactNode;
}

/**
 * Card declares no inline base style at all (E3).
 *
 * Its three unconditional base properties — the box type, the box-sizing model
 * and the font family — now live in `.ds-atom-card` in primitives.css. They have no
 * dynamic input, so nothing was gained by inlining them, and an inline
 * declaration outranks every class rule without `!important`: a consumer
 * writing `.wk-card { display: flex }` got `flex-direction` and not the box
 * type, so a child's `margin-top: auto` silently did nothing. Measured on a
 * real page, not inferred.
 *
 * The `style` prop is still spread last and still wins.
 */

/**
 * Card — surface primitive. Visual is driven by a top-level `variant` plus
 * independent data-attr axes (`padding`, `radius`, `tone`, `hover`).
 *
 *   <Card>...</Card>                                   // glass, default radius/padding
 *   <Card variant="amber">...</Card>                   // amber CTA card
 *   <Card variant="kanban" hover>...</Card>            // hover-lift kanban surface
 *   <Card padding="lg" radius="xl" surface="subtle">    // declarative overrides
 *
 * The axes layer: `variant` sets the base surface, then `surface` washes over it
 * and `padding` / `radius` / `hover` refine the box. See primitives.css for the
 * resolved rules.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
	{
		variant = "glass",
		padding,
		radius,
		surface,
		tone,
		hover,
		as,
		className,
		style,
		children,
		...rest
	},
	ref,
) {
	const Tag = (as ?? "div") as ElementType;
	// `surface` wins when both are supplied; otherwise the deprecated `tone` maps
	// onto it so existing call sites render exactly as before.
	const resolvedSurface = surface ?? (tone ? SURFACE_ALIAS[tone] : undefined);
	return (
		<Tag
			ref={ref}
			className={`ds-atom-card${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-padding={padding}
			data-radius={radius}
			data-surface={resolvedSurface}
			data-hover={hover ? "elevate" : undefined}
			style={style}
			{...rest}
		>
			{children}
		</Tag>
	);
});
