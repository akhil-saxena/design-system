import {
	type CSSProperties,
	type ChangeEvent,
	type InputHTMLAttributes,
	type ReactNode,
	createContext,
	forwardRef,
	useContext,
} from "react";

interface RadioGroupContextValue {
	name: string;
	value?: string;
	onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
	name: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
	children: ReactNode;
	style?: CSSProperties;
	className?: string;
}

export function RadioGroup({ name, value, onChange, children, style, className }: RadioGroupProps) {
	return (
		<RadioGroupContext.Provider value={{ name, value, onChange }}>
			<div
				role="radiogroup"
				className={className}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 8,
					...style,
				}}
			>
				{children}
			</div>
		</RadioGroupContext.Provider>
	);
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
	label?: string;
	value: string;
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
	borderRadius: "50%",
	border: "2px solid var(--ink-5)",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	transition: "all .15s",
	flexShrink: 0,
	background: "transparent",
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
	{ label, className, disabled, value, name, checked, onChange, style, ...rest },
	ref,
) {
	const ctx = useContext(RadioGroupContext);
	const resolvedName = name ?? ctx?.name;
	const resolvedChecked = ctx ? ctx.value === value : checked;
	return (
		<label
			className={`ds-atom-radio-label${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
			style={{
				...labelStyle,
				...(disabled ? { cursor: "not-allowed", opacity: 0.4 } : {}),
			}}
		>
			<input
				ref={ref}
				type="radio"
				className="ds-atom-radio-input"
				name={resolvedName}
				value={value}
				checked={resolvedChecked}
				disabled={disabled}
				onChange={(e) => {
					ctx?.onChange?.(value, e);
					onChange?.(e);
				}}
				style={inputStyle}
				{...rest}
			/>
			<span className="ds-atom-radio-box" style={boxStyle} aria-hidden="true">
				<span className="ds-atom-radio-dot" />
			</span>
			{label ? <span style={style}>{label}</span> : null}
		</label>
	);
});
