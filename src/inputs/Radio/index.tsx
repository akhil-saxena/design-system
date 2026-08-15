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
import { Field, useField } from "../Field";

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
	/** Visible group label, rendered as a `<legend>`. */
	label?: ReactNode;
	/** Helper text under the group, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Applies the error state. Implied by `errorMessage`. */
	error?: boolean;
	/**
	 * Validation message under the group. "You must choose one" is the canonical
	 * case for a radio group, and there was previously no way to express it.
	 */
	errorMessage?: ReactNode;
}

export function RadioGroup({
	name,
	value: controlledValue,
	defaultValue,
	onChange,
	children,
	style,
	className,
	label,
	hint,
	error,
	errorMessage,
}: Readonly<RadioGroupProps>) {
	// Uncontrolled internal state - used when `value` prop is not provided.
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

	const wiring = useField({ error, errorMessage, hint });

	const ctx = useMemo(() => ({ name, value, onChange: handleChange }), [name, value, handleChange]);

	const groupEl = (
		<div
			role="radiogroup"
			className={className}
			aria-invalid={wiring.invalid || undefined}
			aria-describedby={wiring.describedBy}
			style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}
		>
			{children}
		</div>
	);

	return (
		<RadioGroupContext.Provider value={ctx}>
			{/* A radio group has no single labelable control, so `<label for>` cannot
			    name it — Field renders a <fieldset>/<legend> instead, which is the
			    correct grouping label. */}
			{label || hint || errorMessage ? (
				<Field label={label} hint={hint} errorMessage={errorMessage} wiring={wiring} group>
					{groupEl}
				</Field>
			) : (
				groupEl
			)}
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

// The native control stays focusable and hit-testable; only its painting is
// suppressed, so the styled box beside it is a pure visual proxy. Uses the
// shared `.ds-visually-hidden` rule (primitives.css) rather than re-inlining
// the legacy `clip: rect(0,0,0,0)` recipe this file used to carry — that
// property is deprecated, and Checkbox/Radio/Toggle each kept their own copy.
const VISUALLY_HIDDEN = "ds-visually-hidden";

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
				className={`ds-atom-radio-input ${VISUALLY_HIDDEN}`}
				name={resolvedName}
				value={value}
				checked={resolvedChecked}
				disabled={disabled}
				onChange={(e) => {
					ctx?.onChange(value, e);
					onChange?.(e);
				}}
				{...rest}
			/>
			<span className="ds-atom-radio-box" style={boxStyle} aria-hidden="true">
				<span className="ds-atom-radio-dot" />
			</span>
			{label ? <span style={style}>{label}</span> : null}
		</label>
	);
});
