import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type KbdSize = "sm" | "md";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
	/** Size variant. "sm" for inline hints (9.5px); "md" default (11px). */
	size?: KbdSize;
}

const baseStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 11,
	lineHeight: 1,
	padding: "2px 6px",
	borderRadius: 4,
	display: "inline-flex",
	alignItems: "center",
	whiteSpace: "nowrap",
	flexShrink: 0,
};

const sizeStyles: Record<KbdSize, CSSProperties> = {
	sm: { fontSize: 9.5, padding: "1px 5px" },
	md: {},
};

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
	{ size = "md", children, style, className, ...rest },
	ref,
) {
	return (
		<kbd
			ref={ref}
			className={`ds-atom-kbd${className ? ` ${className}` : ""}`}
			style={{ ...baseStyle, ...sizeStyles[size], ...style }}
			{...rest}
		>
			{children}
		</kbd>
	);
});
