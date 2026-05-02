import {
	type CSSProperties,
	type ChangeEvent,
	type InputHTMLAttributes,
	type ReactNode,
	createContext,
	forwardRef,
	useContext,
	useMemo,
	useState,
} from "react";

interface RadioGroupContextValue {
	readonly name: string;
	readonly value?: string;
	readonly onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
	/** The `name` attribute shared by all Radio children in the group. */
	name: string;
	/** Controlled selected value; the matching Radio renders as checked. Use with `onChange`. */
	value?: string;
	/** Initial selected value when uncontrolled (no `value` prop). */
	defaultValue?: string;
	/** Called when any Radio in the group is selected with the new value and native event. */
	onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
	/** Radio children to render in a vertical flex column. */
	children: ReactNode;
	/** Inline styles applied to the `role="radiogroup"` div. */
	style?: CSSProperties;
	/** Additional className applied to the `role="radiogroup"` div. */
	className?: string;
}

export function RadioGroup({
	name,
	value: controlledValue,
	defaultValue,
	onChange,
	children,
	style,
	className,
}: Readonly<RadioGroupProps>) {
	// Uncontrolled internal state — used when `value` prop is not provided.
	const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : internalValue;

	const handleChange = useMemo(
		() => (val: string, e: ChangeEvent<HTMLInputElement>) => {
			if (!isControlled) setInternalValue(val);
			onChange?.(val, e);
		},
		[isControlled, onChange],
	);

	const ctx = useMemo(() => ({ name, value, onChange: handleChange }), [name, value, handleChange]);

	return (
		<RadioGroupContext.Provider value={ctx}>
			<div
				role="radiogroup"
				className={className}
				style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}
			>
				{children}
			</div>
		</RadioGroupContext.Provider>
	);
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
	/** Visible text label rendered beside the radio button. */
	label?: string;
	/** The value this radio represents; matched against RadioGroup's `value` to determine checked state. */
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

// Box uses separate border properties (NOT shorthand) so the CSS
// :checked rule can override border-color without !important fighting
// inline-style specificity.
const boxStyle: CSSProperties = {
	width: 18,
	height: 18,
	borderRadius: "50%",
	borderWidth: 2,
	borderStyle: "solid",
	borderColor: "var(--ink-4)",
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
			className={["ds-atom-radio-label", disabled ? "is-disabled" : "", className ?? ""]
				.filter(Boolean)
				.join(" ")}
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
					ctx?.onChange(value, e);
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
