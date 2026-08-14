import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * Props for the Button primitive.
 *
 * Extends all native `<button>` attributes (`onClick`, `type`, `aria-*`, etc) via spread.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * Visual variant.
	 *
	 * - `primary` - brand amber CTA. Use for the most-prominent action per surface.
	 * - `secondary` - outlined cream surface. Use for second-priority actions.
	 * - `ghost` - transparent, text-only. Use for tertiary, icon-only, or cancel-in-modal.
	 * - `danger` - red destructive. Use for Delete, Remove, Archive, anything irreversible.
	 *
	 * @default "primary"
	 */
	variant?: ButtonVariant;
	/**
	 * Size token. Most contexts use `md`. Use `xs`/`sm` for dense rows or chip-adjacent UI.
	 *
	 * @default "md"
	 */
	size?: ButtonSize;
	/**
	 * When true, replaces the icon with a spinner, sets `aria-busy` and disables
	 * interaction. The label is deliberately left untouched so the button's
	 * accessible name is stable across the loading transition — `getByRole
	 * ("button", { name: "Save" })` keeps matching, and screen readers don't
	 * re-announce a renamed control.
	 */
	loading?: boolean;
	/** Optional icon rendered before the label. Pass a sized `<Icon>` or lucide component. */
	icon?: ReactNode;
}

const baseStyle: CSSProperties = {
	// Type and radius resolve through the token scales rather than raw px. Button
	// was the least token-compliant component in the system despite being the
	// flagship: fontSize 10/11/12/13 and borderRadius 5/7/9, none of which sat on
	// --text-* or --radius-*. The nearest scale steps move each value by at most
	// 0.5px (type) and 1px (radius), so the buttons look the same while becoming
	// re-themable by overriding a token.
	//
	// `padding` and `gap` deliberately stay in px: 7/14 and 6 are not on the 4px
	// spacing grid, and snapping them would change button height and label
	// spacing visibly. Worth revisiting as a deliberate design change.
	fontSize: "var(--text-sm)",
	padding: "7px 14px",
	borderRadius: "var(--radius-md)",
	fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
	border: "1px solid var(--rule)",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "var(--space-1)",
	cursor: "pointer",
	fontFamily: "var(--font-body)",
	whiteSpace: "nowrap",
	outline: "none",
	// `transition` is intentionally absent: .ds-atom-btn in primitives.css owns
	// it, enumerating the exact properties (transform/background/border/color/
	// box-shadow/filter) instead of `all`, and pairs it with a
	// prefers-reduced-motion guard. Declaring `transition: all` inline would win
	// over the stylesheet and silently defeat both.
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
	// Primary = brand amber CTA. Use for the most-prominent action in any context.
	primary: {
		background: "var(--amber)",
		color: "var(--ink-inverse)",
		borderColor: "var(--amber-d)",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
	// Secondary = clean white outlined surface. Use for second-priority actions.
	// Previous translucent glass (var(--g-bg) + backdrop-filter) rendered as a
	// muted grey over cream and looked disabled/greyed-out. Plain white + wire
	// border reads crisply on any background. Dark-mode override in primitives.css
	// flips background to translucent-white over dark surfaces.
	secondary: {
		background: "var(--panel)",
		color: "var(--ink-2)",
		borderColor: "var(--wire)",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
	// Ghost = transparent, text-only. Use for tertiary / icon-only / cancel-in-modal.
	// Color flips via `:root.dark .ds-atom-btn[data-variant="ghost"]` in primitives.css.
	ghost: {
		background: "transparent",
		borderColor: "transparent",
		color: "var(--ink-2)",
	},
	// Danger = rich crimson, deliberately fixed rather than tokenised: --red flips
	// to a pale pink in dark mode (#f0a4a0) because it is tuned as a *text*
	// colour, which would leave the white label at 2.0:1 on the fill. Holding the
	// crimson in both themes keeps the label at 4.83:1. Same rationale as the
	// primary amber fill (8.14:1 against --ink-inverse).
	danger: {
		background: "#dc2626",
		color: "#fff",
		borderColor: "#b91c1c",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
	xs: {
		fontSize: "var(--text-2xs)",
		padding: "3px var(--space-2)",
		borderRadius: "var(--radius-sm)",
	},
	sm: { fontSize: "var(--text-xs)", padding: "5px 10px" },
	md: {},
	// lg aligns with OAuthButton's shape so primary CTAs and OAuth buttons
	// stack at the same height (44px) on auth/onboarding forms. fontSize: 13
	// matches OAuthButton; padding swapped from 10px 20px (~40px implicit
	// height) to explicit 0 20px + height 44px for a deterministic match.
	// Every value here lands exactly on a token step except the radius, which moves
	// 9px → 8px.
	lg: {
		fontSize: "var(--text-base)",
		height: "var(--space-11)",
		padding: "0 var(--space-5)",
		borderRadius: "var(--radius-md)",
		fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
	},
};

/**
 * Primary action element. Use exactly one `primary` per surface as the main CTA;
 * pair with `secondary` or `ghost` for adjacent actions; reserve `danger` for
 * destructive operations that cannot be undone.
 *
 * Accepts all native `<button>` props via spread (including `onClick`, `aria-*`,
 * `type`, `form`). Forwards a ref to the underlying element.
 *
 * @example
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Button variant="danger" icon={<Trash2 size={14} />}>Delete</Button>
 * <Button variant="primary" loading>Saving…</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		variant = "primary",
		size = "md",
		loading,
		icon,
		children,
		style,
		disabled,
		className,
		...rest
	},
	ref,
) {
	return (
		<button
			ref={ref}
			type="button"
			className={`ds-atom-btn${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-loading={loading ? "true" : undefined}
			// aria-busy marks the control as mid-operation. Previously the only
			// signal was a decorative, aria-hidden spinner plus `disabled`, so the
			// transition into a loading state was silent to assistive tech.
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			style={{
				...baseStyle,
				...sizeStyles[size],
				...variantStyles[variant],
				...style,
			}}
			{...rest}
		>
			{loading ? <Spinner /> : icon}
			{children}
		</button>
	);
});

function Spinner() {
	return <span className="ds-atom-btn-spinner" aria-hidden="true" />;
}
