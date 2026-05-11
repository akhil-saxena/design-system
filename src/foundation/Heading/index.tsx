import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	/** Semantic heading level. @default 2 */
	level?: HeadingLevel;
	/** Visual size in px — display headlines use 28/40/44/60/72. @default 28 */
	size?: number;
	/** Archivo weight: 500/600/700/800/900. @default 900 */
	weight?: 500 | 600 | 700 | 800 | 900;
	/** Override color (defaults to var(--ink)). */
	color?: string;
}

/**
 * Display heading primitive — for hero headlines and form headlines.
 * Auto-derives letter-spacing from `size` per the design-system scale:
 * `size > 28` → `-0.038em`, `size > 20` → `-0.024em`, else `-0.005em`.
 *
 * Renders the semantic level via `as`-like `level` prop (`<h1>`..`<h6>`).
 *
 * @example
 * <Heading level={1} size={72} weight={900}>Job search, organized.</Heading>
 * <Heading level={2} size={28} weight={900}>Create your cairn.</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
	{ level = 2, size = 28, weight = 900, color, className, style, children, ...rest },
	ref,
) {
	const Tag = `h${level}` as unknown as React.ElementType;
	// Auto-derive letter-spacing from the type-scale tokens.
	const letterSpacing =
		size > 28 ? "var(--ls-tighter)" : size > 20 ? "var(--ls-tight)" : "var(--ls-base)";
	const composed: CSSProperties = {
		fontFamily: "var(--display)",
		fontSize: size,
		fontWeight: weight,
		letterSpacing,
		color: color ?? "var(--ink)",
		lineHeight: 1,
		margin: 0,
		...style,
	};
	return (
		<Tag
			ref={ref}
			className={`ds-atom-heading${className ? ` ${className}` : ""}`}
			style={composed}
			{...rest}
		>
			{children}
		</Tag>
	);
});
