import { type CSSProperties, type ChangeEvent, useEffect, useId, useState } from "react";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface ColorInputProps {
	/** Controlled hex value, e.g. '#f59e0b'. Optional — uncontrolled if absent. */
	value?: string;
	/** Called with new hex string when a valid 6-digit hex is typed. */
	onChange?: (hex: string) => void;
	/** Initial hex when uncontrolled. @default '#f59e0b' */
	defaultValue?: string;
	/** Optional label rendered above the input row. */
	label?: string;
	/** Additional className applied to the root wrapper. */
	className?: string;
	/** Inline styles applied to the root wrapper. */
	style?: CSSProperties;
}

/**
 * Compact inline color field — swatch + hex text input.
 * No popover, no full picker — designed to drop into form rows alongside
 * other inline form fields.
 */
export function ColorInput({
	value,
	onChange,
	defaultValue = "#f59e0b",
	label,
	className,
	style,
}: ColorInputProps) {
	// The visible label was rendered as a bare <label> with no `htmlFor`, so it
	// was not associated with the field: clicking it did not focus the input, and
	// the accessible name came from a duplicate aria-label instead. Wiring
	// htmlFor/id makes the visible text the name, which is the preferred source.
	const inputId = useId();
	const initial = value ?? defaultValue;
	const [color, setColor] = useState<string>(initial);
	const [hex, setHex] = useState<string>(initial);

	// Comparing against `color` read a value the dependency list did not declare,
	// so the guard could act on a stale colour. Dropping the comparison removes
	// the stale read entirely: React bails out of a re-render when setState is
	// called with the value it already holds, so the guard was never load-bearing.
	useEffect(() => {
		if (value === undefined) return;
		setColor(value);
		setHex(value);
	}, [value]);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const next = e.target.value;
		setHex(next);
		if (HEX_RE.test(next)) {
			setColor(next);
			onChange?.(next);
		}
	}

	return (
		<div className={["ds-atom-colorinput", className].filter(Boolean).join(" ")} style={style}>
			{label && (
				<label htmlFor={inputId} className="ds-label" style={{ display: "block", marginBottom: 4 }}>
					{label}
				</label>
			)}
			<div className="ds-input-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<div
					aria-hidden="true"
					style={{
						width: 28,
						height: 28,
						borderRadius: 6,
						background: color,
						border: "1px solid var(--rule)",
						flexShrink: 0,
					}}
				/>
				<input
					id={inputId}
					className="ds-input"
					value={hex}
					onChange={handleChange}
					// Only needed when there is no visible label to name the field.
					aria-label={label ? undefined : "Color hex"}
					style={{ fontFamily: "var(--mono)", fontSize: 12, flex: 1 }}
				/>
			</div>
		</div>
	);
}
