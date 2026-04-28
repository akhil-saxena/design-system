import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
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
	// Danger = red destructive. Use for Delete, Remove, Archive — anything irreversible.
	// In ConfirmDialog: `<ConfirmDialog danger />` swaps the confirm button to this variant.
	danger: {
		background: "var(--red)",
		color: "#fff",
		borderColor: "var(--red)",
		fontWeight: 600,
	},
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
	xs: { fontSize: 10, padding: "3px 8px", borderRadius: 5 },
	sm: { fontSize: 11, padding: "5px 10px" },
	md: {},
	lg: { fontSize: 14, padding: "10px 20px", borderRadius: 9 },
};

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
