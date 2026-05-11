import { type CSSProperties, type ElementType, type HTMLAttributes, forwardRef } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSizeToken =
	| "2xs"
	| "xs"
	| "sm"
	| "base"
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl";
export type HeadingWeightToken = "regular" | "medium" | "bold" | "black";
export type HeadingTone = "ink" | "ink-2" | "ink-3" | "amber";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	/** Semantic heading level. @default 2 */
	level?: HeadingLevel;
	/** Visual size — either a px number (legacy, drives inline style) or a
	 * type-scale token ('2xs'..'4xl') which routes through the CSS data-attr
	 * path. @default 28
	 */
	size?: number | HeadingSizeToken;
	/** Archivo weight — numeric (legacy) or token. @default 900 */
	weight?: 500 | 600 | 700 | 800 | 900 | HeadingWeightToken;
	/** Override color (legacy — defaults to var(--ink)). Use `tone` for the
	 * declarative path. */
	color?: string;
	/** Tone token — emits a data-attr so CSS rules apply the color. */
	tone?: HeadingTone;
	/** Override the rendered tag — useful when the visual size and the semantic
	 * level diverge (e.g. an `<h2>` styled as a small kicker). */
	as?: ElementType;
}

/**
 * Display heading primitive — for hero headlines and form headlines.
 *
 * Two APIs coexist:
 * - **Legacy/inline:** `size={28}` (number) + `weight={900}` (number) drives
 *   inline style. Letter-spacing derives from size.
 * - **Token/data-attr:** `size="2xl"` + `weight="black"` emit data-attrs;
 *   `primitives.css` applies font-size + font-weight from token vars. Use this
 *   for new code where the theme drives sizing.
 *
 * @example
 * <Heading level={1} size={72} weight={900}>Job search, organized.</Heading>
 * <Heading level={2} size="2xl" weight="black" tone="amber">Settings</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
	{ level = 2, size = 28, weight = 900, color, tone, as, className, style, children, ...rest },
	ref,
) {
	const Tag = (as ?? (`h${level}` as unknown as ElementType)) as ElementType;
	const isTokenSize = typeof size === "string";
	const isTokenWeight = typeof weight === "string";
	const dataSize = isTokenSize ? (size as HeadingSizeToken) : undefined;
	const dataWeight = isTokenWeight ? (weight as HeadingWeightToken) : undefined;
	// Numeric size drives inline letter-spacing + line-height per the legacy
	// contract; token-size leaves both to CSS so primitives.css owns them
	// (line-height varies by size — see `data-size` rules).
	const composed: CSSProperties = {
		fontFamily: "var(--display)",
		color: color ?? (tone ? undefined : "var(--ink)"),
		margin: 0,
		...(isTokenSize
			? null
			: {
					fontSize: size as number,
					lineHeight: 1,
					letterSpacing:
						(size as number) > 28
							? "var(--ls-tighter)"
							: (size as number) > 20
								? "var(--ls-tight)"
								: "var(--ls-base)",
				}),
		...(isTokenWeight ? null : { fontWeight: weight as number }),
		...style,
	};
	return (
		<Tag
			ref={ref}
			className={`ds-atom-heading${className ? ` ${className}` : ""}`}
			data-size={dataSize}
			data-weight={dataWeight}
			data-tone={tone}
			style={composed}
			{...rest}
		>
			{children}
		</Tag>
	);
});
