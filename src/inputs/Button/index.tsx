import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "tertiary" | "danger";
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
	/** When true, replaces the icon with a spinner and disables interaction. */
	loading?: boolean;
	/** Optional icon rendered before the label. Pass a sized `<Icon>` or lucide component. */
	icon?: ReactNode;
}

const baseStyle: CSSProperties = {
	fontSize: 12,
	padding: "7px 14px",
	borderRadius: 7,
	fontWeight: 500,
	border: "1px solid var(--rule)",
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
	cursor: "pointer",
	fontFamily: "var(--font)",
	whiteSpace: "nowrap",
	transition: "all .15s",
	outline: "none",
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
	// Primary = brand amber CTA. Use for the most-prominent action in any context.
	primary: {
		background: "var(--amber)",
		color: "#1c1917",
		borderColor: "var(--amber-d)",
		fontWeight: 600,
	},
	// Secondary = outlined cream surface. Use for second-priority actions.
	secondary: {
		background: "var(--g-bg)",
		backdropFilter: "blur(6px)",
		WebkitBackdropFilter: "blur(6px)",
		color: "var(--ink-2)",
	},
	// Ghost = transparent, text-only. Use for tertiary / icon-only / cancel-in-modal.
	// Color flips via `:root.dark .ds-atom-btn[data-variant="ghost"]` in primitives.css.
	ghost: {
		background: "transparent",
		borderColor: "transparent",
		color: "var(--ink-2)",
	},
	// Tertiary = transparent bg with visible border. Use when ghost is too invisible
	// but secondary is too heavy — e.g. inline secondary actions alongside content.
	tertiary: {
		background: "transparent",
		borderColor: "var(--ink-5)",
		color: "var(--ink-2)",
	},
	// Danger = rich crimson, stays vivid in both themes (no pink flip in dark mode).
	// Same pattern as primary amber: fixed colour, dark border, always-dark text on bg.
	danger: {
		background: "#dc2626",
		color: "#fff",
		borderColor: "#b91c1c",
		fontWeight: 600,
	},
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
	xs: { fontSize: 10, padding: "3px 8px", borderRadius: 5 },
	sm: { fontSize: 11, padding: "5px 10px" },
	md: {},
	lg: { fontSize: 14, padding: "10px 20px", borderRadius: 9 },
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
