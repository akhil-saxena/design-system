import { type CSSProperties, type ChangeEvent, type ReactNode, useEffect, useState } from "react";
import { TextInput } from "../TextInput";
import { isPartialHex, normalizeHex } from "./normalizeHex";

export interface ColorInputProps {
	/** Controlled hex value, e.g. '#f59e0b'. Optional — uncontrolled if absent. */
	value?: string;
	/**
	 * Called with the canonical 6-digit hex whenever the typed text resolves to a
	 * colour. Shorthand and hash-less input are normalised first, so a consumer
	 * always receives `#rrggbb`.
	 */
	onChange?: (hex: string) => void;
	/** Initial hex when uncontrolled. @default '#f59e0b' */
	defaultValue?: string;
	/** Visible label, wired to the field via `htmlFor`/`id`. */
	label?: ReactNode;
	/** Supporting text under the field. */
	hint?: ReactNode;
	/** Additional className applied to the root wrapper. */
	className?: string;
	/** Inline styles applied to the root wrapper. */
	style?: CSSProperties;
	/** Test hook on the root element. */
	"data-testid"?: string;
}

/**
 * Compact inline colour field — swatch plus a hex text field. No popover and no
 * full picker; designed to sit in a form row beside other inline fields.
 *
 * Composes the design system's own TextInput rather than a bare `<input>`, so it
 * inherits the field chrome, focus ring, error state and label wiring instead of
 * reimplementing them. (It previously rendered a raw input carrying
 * `className="ds-input"` — a class that does not exist in the stylesheet, the
 * real one being `.ds-atom-input` — so the field was completely unstyled.)
 */
export function ColorInput({
	value,
	onChange,
	defaultValue = "#f59e0b",
	label,
	hint,
	className,
	style,
	"data-testid": testId,
}: ColorInputProps) {
	const initial = normalizeHex(value ?? defaultValue) ?? "#f59e0b";
	// `color` is the resolved swatch colour; `text` is exactly what the user typed,
	// so the field never fights the cursor while a partial value is in flight.
	const [color, setColor] = useState<string>(initial);
	const [text, setText] = useState<string>(initial);

	useEffect(() => {
		if (value === undefined) return;
		const next = normalizeHex(value);
		if (!next) return;
		setColor(next);
		setText(next);
	}, [value]);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const next = e.target.value;
		setText(next);
		const parsed = normalizeHex(next);
		if (!parsed) return;
		setColor(parsed);
		onChange?.(parsed);
	}

	// Only flag an error once the value can no longer become a colour — otherwise
	// every intermediate keystroke ("#f") would render as invalid.
	const invalid = text.trim() !== "" && !normalizeHex(text) && !isPartialHex(text);

	return (
		<div
			className={["ds-atom-colorinput", className].filter(Boolean).join(" ")}
			style={style}
			data-testid={testId}
		>
			<TextInput
				label={label}
				hint={hint}
				value={text}
				onChange={handleChange}
				error={invalid}
				spellCheck={false}
				autoComplete="off"
				// Swatch as a leading affix, so it sits inside the field chrome and
				// inherits the focus ring rather than floating beside it.
				icon={
					<span
						className="ds-atom-colorinput-swatch"
						style={{ background: color }}
						// The hex text beside it already conveys the value; announcing the
						// swatch too would just repeat it.
						aria-hidden="true"
						data-testid={testId ? `${testId}-swatch` : undefined}
					/>
				}
				aria-label={label ? undefined : "Colour hex"}
				data-testid={testId ? `${testId}-input` : undefined}
			/>
		</div>
	);
}
