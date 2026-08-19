import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";
import { type LegacyTone, type Tone, resolveTone } from "../tone";

export type TextVariant = "body" | "small" | "caption" | "legal";
export type TextElement = "p" | "span" | "div";
export type TextSizeToken = "2xs" | "xs" | "sm" | "base" | "md" | "lg";
export type TextWeightToken = "regular" | "medium" | "bold" | "black";
/**
 * Tone override for Text. Omit for the component's default colour.
 *
 * Semantic names (`primary` | `secondary` | `muted` | `accent` | `danger` | `success`) describe the role; the
 * deprecated raw-token spellings (`ink`, `ink-2`, `ink-3`, `ink-4`, `amber`, …)
 * still work and render identically. See src/foundation/tone.ts for why the
 * vocabulary changed.
 */
export type TextTone =
	| Extract<Tone, "primary" | "secondary" | "muted" | "accent" | "danger" | "success">
	| LegacyTone;
export type TextLeading = "tight" | "snug" | "normal" | "relaxed";

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** Legacy preset — drives inline style. @default "body" */
	variant?: TextVariant;
	/** Semantic element to render. @default "p" */
	as?: TextElement;
	/**
	 * Override colour, inline — the highest-precedence source, above `tone` and
	 * above anything a consumer stylesheet can say. Deprecated: prefer `tone`
	 * for the declarative path, or a class rule to hand the colour to the page.
	 */
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

/**
 * Size and line-height only. The variant colours moved into primitives.css as
 * zero-specificity `:where()` rules keyed on `data-variant`, so a page can
 * recolour a Text from its own stylesheet (E5). Font size stays here: the
 * size-versus-variant interaction is a separate axis and moving it would shift
 * type metrics across every visual baseline.
 */
const variantStyles: Record<TextVariant, CSSProperties> = {
	body: { fontSize: "var(--text-base)" },
	small: { fontSize: "var(--text-sm)" },
	caption: { fontSize: "var(--text-sm)" },
	legal: {
		fontSize: "var(--text-xs)",
		lineHeight: "var(--lh-normal)",
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
 * **Colour precedence**, lowest to highest:
 *
 *   1. the variant default — a `:where()` rule in primitives.css, specificity
 *      (0,0,0), so it yields to anything;
 *   2. a consumer stylesheet — any class rule a page writes;
 *   3. the `tone` prop — `.ds-atom-text[data-tone=…]`, specificity (0,2,0);
 *   4. the `color` prop — inline, and deprecated.
 *
 * The contract that follows from 2 and 3: **passing `tone` means the component
 * owns the colour; omitting it hands the colour to the cascade.** That ordering
 * is decided by specificity, not by which stylesheet loaded last, so it holds
 * whatever order a consumer imports things in.
 *
 * @example
 * <Text>Mark every step of your job search.</Text>
 * <Text size="sm" tone="muted">Applied 3d ago</Text>
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
	// When a token size is set, let CSS own that property rather than emitting an
	// inline override that would beat the data-attr rule. Colour is no longer
	// picked here at all — the stylesheet owns every path to it except the
	// deprecated `color` prop below.
	const variantBase = variantStyles[variant];
	const variantPick: CSSProperties = {
		...(size ? null : { fontSize: variantBase.fontSize }),
		...(variantBase.lineHeight !== undefined ? { lineHeight: variantBase.lineHeight } : null),
	};
	const composed: CSSProperties = {
		...baseStyle,
		lineHeight: leading ? undefined : "var(--lh-relaxed)",
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
			data-tone={resolveTone(tone)}
			data-mono={mono ? "true" : undefined}
			data-leading={leading}
			style={composed}
			{...rest}
		>
			{children}
		</Tag>
	);
});
