import { type CSSProperties, type HTMLAttributes, type Ref, useEffect, useRef } from "react";

export type RollingNumberVariant = "default" | "dark" | "light";

export interface RollingNumberProps extends HTMLAttributes<HTMLSpanElement> {
	/** Numeric value to display; digit columns animate vertically when the value changes. */
	value: number;
	/** Custom formatter applied before splitting into individual characters; defaults to `String(value)`. */
	format?: (value: number) => string;
	/** Static text prepended before the formatted number (e.g. `"$"`). */
	prefix?: string;
	/** Static text appended after the formatted number (e.g. `" pts"`). */
	suffix?: string;
	/**
	 * Visual background treatment.
	 * - `"default"` - no background, inherits from parent (current behaviour).
	 * - `"dark"` - black background per digit cell with white text; ideal for counters and clocks.
	 * - `"light"` - cream background per digit cell with dark text; for use on dark surfaces.
	 * @default "default"
	 */
	variant?: RollingNumberVariant;
	/** Accessible label for the `aria-live` region; defaults to the full rendered display string. */
	ariaLabel?: string;
	/** Additional className applied to the root `<span>` element. */
	/** Ref to the root `<span>`. */
	ref?: Ref<HTMLSpanElement>;
	className?: string;
	/** Inline styles applied to the root `<span>` element. */
	style?: CSSProperties;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function RollingNumber({
	value,
	format,
	prefix,
	suffix,
	variant = "default",
	ariaLabel,
	className,
	style,
	ref,
	...rest
}: RollingNumberProps) {
	const core = format ? format(value) : String(value);
	const display = `${prefix ?? ""}${core}${suffix ?? ""}`;

	const firstRender = useRef(true);
	useEffect(() => {
		firstRender.current = false;
	}, []);

	return (
		<span
			className={["ds-atom-rolling", className].filter(Boolean).join(" ")}
			// Suppresses the roll animation on the very first paint, so the digits do
			// not animate in from zero on mount. In CSS rather than an inline style so
			// it does not outrank the stylesheet.
			data-first-render={firstRender.current ? "true" : undefined}
			data-variant={variant === "default" ? undefined : variant}
			style={style}
			ref={ref}
			{...rest}
			// role="status" makes this a live region that *can* carry a name. As a
			// bare <span> the element was role `generic`, which prohibits aria-label,
			// so the label was discarded (axe: aria-prohibited-attr).
			//
			// The `?? display` fallback is gone: the rendered digits already are the
			// announcement, and duplicating them into aria-label overrode the content
			// with an identical string. aria-label now only applies when a consumer
			// supplies a genuinely different one.
			// biome-ignore lint/a11y/useSemanticElements: <output> carries form-association semantics (it pairs with inputs via `for`), which is wrong for a standalone animated counter; role="status" gives the same live-region mapping without that implication
			role="status"
			aria-live="polite"
			aria-label={ariaLabel}
		>
			{display.split("").map((char, i) => {
				if (/[0-9]/.test(char)) {
					const digit = Number.parseInt(char, 10);
					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: digit-by-position rendering, key by index is correct
							key={`d-${i}`}
							className="ds-atom-rolling-cell"
							aria-hidden="true"
						>
							<span
								className="ds-atom-rolling-strip"
								style={{
									transform: `translateY(${-digit * 22}px)`,
								}}
							>
								{DIGITS.map((n) => (
									<span key={n}>{n}</span>
								))}
							</span>
						</span>
					);
				}
				return (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: char-by-position rendering, key by index is correct
						key={`s-${i}`}
						className="ds-atom-rolling-static"
						aria-hidden="true"
					>
						{char}
					</span>
				);
			})}
		</span>
	);
}
