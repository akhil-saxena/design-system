import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, forwardRef } from "react";

export type ButtonVariant = "primary" | "amber" | "secondary" | "ghost" | "danger";
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
	fontWeight: 600,
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
	primary: {
		background: "var(--ink)",
		color: "var(--cream)",
		borderColor: "var(--ink)",
	},
	amber: {
		background: "var(--amber-vivid)",
		color: "#292524",
		borderColor: "var(--amber-d)",
		fontWeight: 700,
	},
	secondary: {
		background: "var(--g-bg)",
		backdropFilter: "blur(6px)",
		WebkitBackdropFilter: "blur(6px)",
		color: "var(--ink-2)",
	},
	ghost: {
		background: "transparent",
		borderColor: "transparent",
	},
	danger: {
		background: "rgba(239,68,68,.1)",
		color: "#dc2626",
		borderColor: "rgba(239,68,68,.25)",
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
