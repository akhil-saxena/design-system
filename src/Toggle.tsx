import { type CSSProperties, type InputHTMLAttributes, forwardRef } from "react";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string;
}

const labelStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	cursor: "pointer",
	fontFamily: "var(--font)",
	fontSize: 13,
	color: "var(--ink)",
	userSelect: "none",
};

const inputStyle: CSSProperties = {
	position: "absolute",
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0,0,0,0)",
	whiteSpace: "nowrap",
	border: 0,
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
	{ label, className, disabled, style, checked, defaultChecked, ...rest },
	ref,
) {
	const ariaChecked = checked ?? defaultChecked ?? false;
	return (
		<label
			className={`ds-atom-toggle-label${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
			style={{
				...labelStyle,
				...(disabled ? { cursor: "not-allowed", opacity: 0.4 } : {}),
			}}
		>
			<input
				ref={ref}
				type="checkbox"
				role="switch"
				aria-checked={ariaChecked}
				className="ds-atom-toggle-input"
				disabled={disabled}
				checked={checked}
				defaultChecked={defaultChecked}
				style={inputStyle}
				{...rest}
			/>
			<span className="ds-atom-toggle-track" aria-hidden="true">
				<span className="ds-atom-toggle-thumb" />
			</span>
			{label ? <span style={style}>{label}</span> : null}
		</label>
	);
});
