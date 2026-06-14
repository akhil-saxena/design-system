import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { Star } from "../../icons";
export type StarRatingSize = "default" | "compact";

/**
 * Deliberate deviation from D-240: D-240 specified `variant?: 'interactive' | 'compact'` which
 * conflated icon size with interaction mode. We split into orthogonal `size` (icon dimensions)
 * and `readOnly` (interaction mode) props because (a) consumers may want a compact yet still-
 * interactive rating in dense list views, and (b) read-only at default size is the common
 * "display existing rating" case. Documented as the public StarRating API of v2.0.
 */
export interface StarRatingProps {
	/** Controlled rating value (1–5). */
	value: number;
	/** Called when the user clicks a star with the new rating; omit for read-only display. */
	onChange?: (value: number) => void;
	/** Icon size token; `"compact"` uses 14px stars for dense list contexts.
	 * @default "default"
	 */
	size?: StarRatingSize;
	/** Accessible label for the `role="radiogroup"` container. */
	label?: string;
	/** When true, disables hover preview and click interaction without the disabled visual.
	 * @default false
	 */
	readOnly?: boolean;
	/** When true, disables all interaction and dims the stars.
	 * @default false
	 */
	disabled?: boolean;
	/** Additional className applied to the root element. */
	className?: string;
	/** Inline styles applied to the root element. */
	style?: CSSProperties;
}

const STAR_SIZES: Record<StarRatingSize, number> = {
	default: 24,
	compact: 14,
};

export function StarRating({
	value,
	onChange,
	size = "default",
	label,
	readOnly,
	disabled,
	className,
	style,
}: StarRatingProps) {
	const [hover, setHover] = useState<number | null>(null);
	const interactive = !readOnly && !disabled;
	const effective = interactive && hover != null ? hover : value;
	const iconSize = STAR_SIZES[size];

	// Roving tabindex: exactly one star is a tab stop. The selected star owns it;
	// when nothing is selected (value outside 1–5) the first star does.
	const rovingStar = value >= 1 && value <= 5 ? value : 1;

	/**
	 * Radiogroup keyboard pattern (WCAG / WAI-ARIA). Left/Down decrease, Right/Up
	 * increase (and select on move), Home/End jump to min/max, Space/Enter select the
	 * focused star. No-ops when not interactive.
	 */
	function handleKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, n: number) {
		if (!interactive) return;
		let next: number | null = null;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowUp":
				next = Math.min(5, value < 1 ? 1 : value + 1);
				break;
			case "ArrowLeft":
			case "ArrowDown":
				next = Math.max(1, value < 1 ? 1 : value - 1);
				break;
			case "Home":
				next = 1;
				break;
			case "End":
				next = 5;
				break;
			case " ":
			case "Enter":
				next = n;
				break;
			default:
				return; // let other keys (e.g. Tab) behave normally
		}
		e.preventDefault();
		if (next !== value) onChange?.(next);
	}

	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={`ds-atom-star${className ? ` ${className}` : ""}`}
			style={style}
			data-size={size}
			data-disabled={disabled ? "true" : undefined}
			onMouseLeave={() => {
				if (interactive) setHover(null);
			}}
		>
			{[1, 2, 3, 4, 5].map((n) => {
				const isFilled = n <= effective;
				return (
					<button
						key={n}
						type="button"
						// biome-ignore lint/a11y/useSemanticElements: D-240 - buttons-in-radiogroup needed for click-to-select-N + hover-preview-1..N semantics; native <input type="radio"> can't render Lucide icons or support the hover preview cleanly
						role="radio"
						aria-checked={n === value}
						aria-label={`${n} star${n === 1 ? "" : "s"}`}
						disabled={!interactive}
						tabIndex={n === rovingStar ? 0 : -1}
						onClick={() => {
							if (interactive) onChange?.(n);
						}}
						onKeyDown={(e) => handleKeyDown(e, n)}
						onMouseEnter={() => {
							if (interactive) setHover(n);
						}}
						className="ds-atom-star-btn"
					>
						<Star
							size={iconSize}
							fill={isFilled ? "var(--amber-vivid)" : "transparent"}
							stroke={isFilled ? "var(--amber-vivid)" : "var(--ink-5)"}
							strokeWidth={2}
						/>
					</button>
				);
			})}
		</div>
	);
}
