import { Check } from "lucide-react";
import { type CSSProperties, type InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
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

const boxStyle: CSSProperties = {
	width: 18,
	height: 18,
	borderRadius: 5,
	border: "2px solid var(--ink-5)",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	transition: "all .15s",
	flexShrink: 0,
	background: "transparent",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ label, className, disabled, style, ...rest },
	ref,
) {
	return (
		<label
			className={`ds-atom-checkbox-label${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
			style={{
				...labelStyle,
				...(disabled ? { cursor: "not-allowed", opacity: 0.4 } : {}),
			}}
		>
			<input
				ref={ref}
				type="checkbox"
				className="ds-atom-checkbox-input"
				disabled={disabled}
				style={inputStyle}
				{...rest}
			/>
			<span className="ds-atom-checkbox-box" style={boxStyle} aria-hidden="true">
				<Check
					size={12}
					strokeWidth={3}
					color="var(--cream)"
					style={{ display: "none" }}
					className="ds-atom-checkbox-check"
				/>
			</span>
			{label ? <span style={style}>{label}</span> : null}
		</label>
	);
});
