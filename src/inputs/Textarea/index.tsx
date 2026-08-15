import {
	type CSSProperties,
	type ReactNode,
	type TextareaHTMLAttributes,
	forwardRef,
	useState,
} from "react";
import { Field, useField } from "../Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** When true, applies error-state border color to the textarea. */
	error?: boolean;
	/**
	 * Visible label, wired via `htmlFor`/`id`. Mirrors TextInput so the two text
	 * controls take the same field props — they previously diverged, with neither
	 * offering a label at all.
	 */
	label?: ReactNode;
	/** Supporting text under the field, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Validation message under the field; implies `error` and is announced. */
	errorMessage?: ReactNode;
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
	width: "100%",
	boxSizing: "border-box",
	lineHeight: 1.5,
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{
		error,
		label,
		hint,
		errorMessage,
		className,
		style,
		maxLength,
		value,
		defaultValue,
		onChange,
		...rest
	},
	ref,
) {
	const [internalLength, setInternalLength] = useState(
		typeof defaultValue === "string" ? defaultValue.length : 0,
	);
	const length = typeof value === "string" ? value.length : internalLength;
	const showCount = typeof maxLength === "number";

	const wiring = useField({
		error,
		errorMessage,
		hint,
		id: rest.id,
		describedBy: rest["aria-describedby"],
	});
	const { controlId: fieldId, describedBy, invalid } = wiring;

	const control = (
		<div style={{ position: "relative", width: "100%" }}>
			<textarea
				ref={ref}
				className={["ds-atom-textarea", className].filter(Boolean).join(" ")}
				data-error={invalid ? "true" : undefined}
				style={{ ...baseTextareaStyle, ...style }}
				id={fieldId}
				aria-describedby={describedBy}
				aria-invalid={invalid || undefined}
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

	if (!label && !hint && !errorMessage) return control;

	return (
		<Field label={label} hint={hint} errorMessage={errorMessage} wiring={wiring}>
			{control}
		</Field>
	);
});
