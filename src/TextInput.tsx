import { type CSSProperties, type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
	error?: boolean;
	icon?: ReactNode;
	prefix?: ReactNode;
	suffix?: ReactNode;
	/** Trailing keyboard-shortcut hint (e.g., '⌘K', '/'), styled as a mono pill. */
	kbd?: ReactNode;
}

const baseInputStyle: CSSProperties = {
	fontSize: 13,
	padding: "8px 10px",
	borderRadius: 8,
	border: "1px solid var(--rule)",
	background: "rgba(255,255,255,.6)",
	color: "var(--ink)",
	fontFamily: "var(--font)",
	outline: "none",
	transition: "border-color .15s",
	width: "100%",
};

const wrapStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 8,
	padding: "0 10px",
	borderRadius: 8,
	border: "1px solid var(--rule)",
	background: "rgba(255,255,255,.6)",
	transition: "border-color .15s",
};

const innerInputStyle: CSSProperties = {
	border: "none",
	background: "none",
	padding: "8px 0",
	boxShadow: "none",
	fontSize: 13,
	color: "var(--ink)",
	fontFamily: "var(--font)",
	outline: "none",
	flex: 1,
	width: "100%",
};

const affixStyle: CSSProperties = {
	color: "var(--ink-3)",
	fontFamily: "var(--mono)",
	fontSize: 12,
	whiteSpace: "nowrap",
	flexShrink: 0,
};

const kbdStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 10,
	fontWeight: 600,
	color: "var(--ink-3)",
	background: "var(--cream-2)",
	border: "1px solid var(--rule)",
	borderRadius: 4,
	padding: "1px 6px",
	whiteSpace: "nowrap",
	flexShrink: 0,
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
	{ error, icon, prefix, suffix, kbd, className, style, ...rest },
	ref,
) {
	// Bare input when no decoration is needed.
	if (!icon && !prefix && !suffix && !kbd) {
		return (
			<input
				ref={ref}
				className={`ds-atom-input${className ? ` ${className}` : ""}`}
				data-error={error ? "true" : undefined}
				style={{ ...baseInputStyle, ...style }}
				{...rest}
			/>
		);
	}
	// Wrapped input when icon/prefix/suffix/kbd is present — wrapper handles
	// border + focus-within ring so the inner <input> inherits.
	return (
		<div
			className={`ds-atom-input-wrap${className ? ` ${className}` : ""}`}
			data-error={error ? "true" : undefined}
			style={{ ...wrapStyle, ...style }}
		>
			{icon ? <span style={{ display: "inline-flex", color: "var(--ink-3)" }}>{icon}</span> : null}
			{prefix ? <span style={affixStyle}>{prefix}</span> : null}
			<input ref={ref} style={innerInputStyle} {...rest} />
			{suffix ? <span style={affixStyle}>{suffix}</span> : null}
			{kbd ? <kbd style={kbdStyle}>{kbd}</kbd> : null}
		</div>
	);
});
