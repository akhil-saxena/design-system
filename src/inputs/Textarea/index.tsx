import { type CSSProperties, type TextareaHTMLAttributes, forwardRef, useState } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** When true, applies error-state border color to the textarea. */
	error?: boolean;
}

const baseTextareaStyle: CSSProperties = {
	fontSize: 13,
	padding: "10px 12px",
	borderRadius: 8,
	border: "1px solid var(--rule)",
	background: "var(--cream)",
	color: "var(--ink)",
	fontFamily: "var(--font)",
	outline: "none",
	resize: "both",
	transition: "border-color .15s, box-shadow .15s",
	width: "100%",
	boxSizing: "border-box",
	lineHeight: 1.5,
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ error, className, style, maxLength, value, defaultValue, onChange, ...rest },
	ref,
) {
	const [internalLength, setInternalLength] = useState(
		typeof defaultValue === "string" ? defaultValue.length : 0,
	);
	const length = typeof value === "string" ? value.length : internalLength;
	const showCount = typeof maxLength === "number";

	return (
		<div style={{ position: "relative", width: "100%" }}>
			<textarea
				ref={ref}
				className={["ds-atom-textarea", className].filter(Boolean).join(" ")}
				data-error={error ? "true" : undefined}
				style={{ ...baseTextareaStyle, ...style }}
				maxLength={maxLength}
				value={value}
				defaultValue={defaultValue}
				onChange={(e) => {
					setInternalLength(e.target.value.length);
					onChange?.(e);
				}}
				{...rest}
			/>
			{showCount ? (
				<span
					style={{
						position: "absolute",
						right: 10,
						bottom: 8,
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-3)",
						pointerEvents: "none",
					}}
				>
					{length}/{maxLength}
				</span>
			) : null}
		</div>
	);
});
