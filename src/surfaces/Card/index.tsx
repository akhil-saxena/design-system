import {
	type CSSProperties,
	type ElementType,
	type HTMLAttributes,
	type ReactNode,
	forwardRef,
} from "react";

export type CardVariant = "glass" | "amber" | "dark" | "kanban";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";
export type CardRadius = "sm" | "md" | "lg" | "xl";
export type CardTone = "amber" | "cream-2" | "flat";
export type CardHover = "elevate";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** Top-level preset (legacy). One of glass / amber / dark / kanban. Adds
	 * its own bg + border treatment via `data-variant`. @default "glass" */
	variant?: CardVariant;
	/** Padding scale. Independent of variant. */
	padding?: CardPadding;
	/** Border-radius token. Independent of variant. */
	radius?: CardRadius;
	/** Surface tone (separate axis from variant). `amber` tints the bg, `flat`
	 * uses a dashed neutral border, `cream-2` switches to the cream-2 surface. */
	tone?: CardTone;
	/** Interactive elevation on hover. Adds shadow + cursor + border-color shift. */
	hover?: CardHover;
	/** Override the rendered element. @default "div" */
	as?: ElementType;
	children: ReactNode;
}

const baseStyle: CSSProperties = {
	display: "block",
	boxSizing: "border-box",
	fontFamily: "var(--font)",
};

/**
 * Card — surface primitive. Visual is driven by a top-level `variant` plus
 * independent data-attr axes (`padding`, `radius`, `tone`, `hover`).
 *
 *   <Card>...</Card>                                   // glass, default radius/padding
 *   <Card variant="amber">...</Card>                   // amber CTA card
 *   <Card variant="kanban" hover="elevate">...</Card>  // hover-lift kanban surface
 *   <Card padding="lg" radius="xl" tone="cream-2">     // declarative overrides
 *
 * The four axes layer on top of each other — variant sets the baseline, the
 * data-attr axes refine padding/radius/tone/hover. See primitives.css for
 * the resolved rules.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
	{ variant = "glass", padding, radius, tone, hover, as, className, style, children, ...rest },
	ref,
) {
	const Tag = (as ?? "div") as ElementType;
	return (
		<Tag
			ref={ref}
			className={`ds-atom-card${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-padding={padding}
			data-radius={radius}
			data-tone={tone}
			data-hover={hover}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			{children}
		</Tag>
	);
});
