import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type TextVariant = "body" | "small" | "caption" | "legal";
export type TextElement = "p" | "span" | "div";
export type TextSizeToken = "2xs" | "xs" | "sm" | "base" | "md" | "lg";
export type TextWeightToken = "regular" | "medium" | "bold" | "black";
export type TextTone = "ink" | "ink-2" | "ink-3" | "ink-4" | "amber" | "red" | "green";
export type TextLeading = "tight" | "snug" | "normal" | "relaxed";

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** Legacy preset — drives inline style. @default "body" */
	variant?: TextVariant;
	/** Semantic element to render. @default "p" */
	as?: TextElement;
	/** Override color (legacy — defaults to tone for variant). Use `tone` for
	 * the declarative path. */
	color?: string;
	/** Override max-width — caps line length for readability. */
	maxWidth?: number | string;
	/** Type-scale token — emits data-attr; CSS applies font-size. */
	size?: TextSizeToken;
	/** Weight token — emits data-attr; CSS applies font-weight. */
	weight?: TextWeightToken;
	/** Color tone token — emits data-attr; CSS applies color. */
	tone?: TextTone;
	/** When true, swaps to var(--mono) family + letter-spacing. */
	mono?: boolean;
	/** Line-height token — overrides the default (relaxed). */
	leading?: TextLeading;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--font)",
	margin: 0,
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
 * Body text primitive. Two APIs coexist:
 * - **Legacy:** `variant` preset drives inline style (body/small/caption/legal).
 * - **Token/data-attr:** `size` + `tone` + `weight` + `mono` + `leading` all
 *   emit data-attrs; `primitives.css` resolves them. Use this for new code.
 *
 * The two are NOT exclusive — pass `variant` for the base + a `size`/`tone`
 * override to tweak one axis.
 *
 * @example
 * <Text>Mark every step of your job search.</Text>
 * <Text size="sm" tone="ink-3">Applied 3d ago</Text>
 * <Text variant="caption" maxWidth={360}>Sent to alex@example.com…</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
	{
		variant = "body",
		as = "p",
		color,
		maxWidth,
		size,
		weight,
		tone,
		mono,
		leading,
		className,
		style,
		children,
		...rest
	},
	ref,
) {
	const Tag = as as unknown as React.ElementType;
	// When token-size or tone is set, let CSS own those properties (don't emit
	// inline overrides that would beat the data-attr rule). Variant's inline
	// style only contributes where data-attrs are absent.
	const variantBase = variantStyles[variant];
	const variantPick: CSSProperties = {
		...(size ? null : { fontSize: variantBase.fontSize }),
		...(tone ? null : { color: variantBase.color }),
		...(variantBase.lineHeight !== undefined && { lineHeight: variantBase.lineHeight }),
	};
	const composed: CSSProperties = {
		...baseStyle,
		lineHeight: leading ? undefined : ("var(--lh-relaxed)" as unknown as number),
		...variantPick,
		...(color ? { color } : null),
		...(maxWidth ? { maxWidth } : null),
		...style,
	};
	return (
		<Tag
			ref={ref}
			className={`ds-atom-text${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-size={size}
			data-weight={weight}
			data-tone={tone}
			data-mono={mono ? "true" : undefined}
			data-leading={leading}
			style={composed}
			{...rest}
		>
			{children}
		</Tag>
	);
});
