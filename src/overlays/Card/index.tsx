import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type CardVariant = "glass" | "amber" | "dark" | "kanban";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** Surface style variant.
	 * - `glass` - translucent glass surface (default).
	 * - `amber` - amber-tinted CTA card.
	 * - `dark` - always-dark surface independent of theme.
	 * - `kanban` - compact glass with hover-lift; use for drag-and-drop boards.
	 * @default "glass"
	 */
	variant?: CardVariant;
	/** Arbitrary JSX content; Card has no compound structure - compose freely. */
	children: ReactNode;
}

const baseStyle: CSSProperties = {
	display: "block",
	boxSizing: "border-box",
	fontFamily: "var(--font)",
};

/**
 * Card - surface primitive with 4 variants (D-300, D-301, D-302).
 *
 *   <Card variant="glass">         // default - translucent glass surface
 *   <Card variant="amber">         // amber-tinted CTA card
 *   <Card variant="dark">          // always-dark surface (handoff invariant)
 *   <Card variant="kanban">        // compact glass card with hover-lift; visual surface only
 *
 * Children are arbitrary JSX - there is no compound API. Compose freely:
 *
 *   <Card variant="glass">
 *     <header>...</header>
 *     <div>...</div>
 *     <footer>...</footer>
 *   </Card>
 *
 * The `kanban` variant ships only the VISUAL surface (12px padding, 10px
 * radius, glass bg, hover shadow lift). Application data binding (logo +
 * role + age + chips + priority dot) is deferred to Wave 7 / DragDropList
 * per D-302.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
	{ variant = "glass", className, style, children, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			className={`ds-atom-card${className ? ` ${className}` : ""}`}
			data-variant={variant}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			{children}
		</div>
	);
});
