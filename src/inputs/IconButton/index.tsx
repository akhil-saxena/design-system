import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

export type IconButtonVariant = "ghost" | "secondary" | "primary" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
	/**
	 * Accessible name. **Required, deliberately.**
	 *
	 * An icon-only control with no accessible name is the single most common
	 * accessibility defect in a component library — the icon conveys the meaning
	 * visually and nothing conveys it otherwise. Seventeen hand-rolled icon
	 * buttons across ten components each had to remember `aria-label` on their
	 * own. Making it a required prop means an unnamed icon button cannot be
	 * constructed at all, which is a stronger guarantee than a lint rule.
	 */
	label: string;
	/** The glyph. Pass a sized icon — `<X size={16} />`. */
	icon: ReactNode;
	/**
	 * Visual treatment, matching ButtonVariant.
	 *
	 * @default "ghost"
	 */
	variant?: IconButtonVariant;
	/** @default "md" */
	size?: IconButtonSize;
	/** Replaces the icon with a spinner, sets `aria-busy` and blocks interaction. */
	loading?: boolean;
}

/**
 * Square, icon-only action button.
 *
 * Use for close, dismiss and prev/next affordances — anywhere an action is
 * represented by a glyph alone. For an action with a visible text label use
 * `Button`, which also accepts a leading `icon`.
 *
 * All styling lives in `primitives.css` under `.ds-atom-iconbtn`, so a composing
 * component can restyle it through the cascade by passing its own `className`.
 * (Inline styles would silently outrank that — the mistake Button and TextInput
 * both used to make.)
 *
 * @example
 * <IconButton label="Close" icon={<X size={16} />} onClick={close} />
 * <IconButton label="Next page" icon={<ChevronRight size={16} />} variant="secondary" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
	{ label, icon, variant = "ghost", size = "md", loading, disabled, className, ...rest },
	ref,
) {
	return (
		<button
			ref={ref}
			type="button"
			className={`ds-atom-iconbtn${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-size={size}
			data-loading={loading ? "true" : undefined}
			aria-label={label}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			{...rest}
		>
			{loading ? (
				<span className="ds-atom-btn-spinner" aria-hidden="true" />
			) : (
				// The glyph is decorative: `label` is the accessible name, so exposing
				// the icon too would announce the control twice.
				<span className="ds-atom-iconbtn-glyph" aria-hidden="true">
					{icon}
				</span>
			)}
		</button>
	);
});
