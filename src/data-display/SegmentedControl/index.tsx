/**
 * # Usage Audit - SegmentedControl (DS-63, D-17-20)
 *
 * Consumers (post v0.6):
 * - Calendar (DS-68) - view-mode toggle (month/week/day)
 * - Consumer apps - 2-5 way visual toggles (filter, mode, view)
 *
 * API:
 * - options: SegmentedOption[] (2-5 typical; 6+ should use Select)
 * - value: string (controlled)
 * - onChange: (value) => void
 * - size: "sm" | "md" | "lg" (default md)
 * - disabled: boolean (group-level)
 * - ariaLabel: string (REQUIRED - radiogroup needs accessible name)
 *
 * Implementation:
 * - WAI-ARIA radiogroup pattern with automatic activation
 * - Arrow keys cycle + select; Home/End jump to ends
 * - Pill-shaped wrapper with amber-active option
 * - data-size, data-disabled, data-active for CSS state
 * - Optional per-option `tone` ({ fg, activeBg }) recolors the ACTIVE
 *   segment (e.g. outcome toggles: green / neutral / red). Tone-less
 *   options keep the default amber styling (backward compatible).
 */
import { forwardRef, useCallback, useRef } from "react";

/**
 * Optional per-option active colors. When set, the option uses these
 * foreground/background colors *while active* instead of the default amber
 * pill. Prefer DS CSS-var tokens (e.g. `var(--green)`). Inactive options are
 * unaffected and render with default styling.
 */
export interface SegmentedTone {
	/** Text color of the option while active. */
	fg: string;
	/** Background of the option while active. */
	activeBg: string;
}

export interface SegmentedOption<T extends string = string> {
	value: T;
	label: string;
	disabled?: boolean;
	/**
	 * Optional per-option active tone. When provided, the *active* segment
	 * renders with `tone.fg` / `tone.activeBg` instead of the default amber.
	 * Omit for the standard styling (fully backward compatible).
	 */
	tone?: SegmentedTone;
}

export interface SegmentedControlProps<T extends string = string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	ariaLabel: string;
	className?: string;
	style?: React.CSSProperties;
}

function SegmentedControlInner<T extends string>(
	{
		options,
		value,
		onChange,
		size = "md",
		disabled = false,
		ariaLabel,
		className,
		style,
	}: SegmentedControlProps<T>,
	ref: React.Ref<HTMLDivElement>,
) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	const setRef = (node: HTMLDivElement | null) => {
		wrapperRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
	};

	// Build list of enabled option indices for keyboard navigation
	const enabledIndices = options
		.map((o, i) => (o.disabled ? -1 : i))
		.filter((i): i is number => i !== -1);

	const activeIndex = options.findIndex((o) => o.value === value);

	const move = useCallback(
		(delta: 1 | -1 | "home" | "end") => {
			if (disabled || enabledIndices.length === 0) return;
			const currentEnabledPos = enabledIndices.indexOf(activeIndex);
			let nextPos: number;
			if (delta === "home") nextPos = 0;
			else if (delta === "end") nextPos = enabledIndices.length - 1;
			else if (currentEnabledPos === -1) nextPos = 0;
			else nextPos = (currentEnabledPos + delta + enabledIndices.length) % enabledIndices.length;
			const nextOptionIndex = enabledIndices[nextPos]!;
			const nextOption = options[nextOptionIndex]!;
			onChange(nextOption.value);
			// Focus the newly-selected button (ARIA radiogroup automatic-activation pattern)
			const buttons =
				wrapperRef.current?.querySelectorAll<HTMLButtonElement>("button[role='radio']");
			buttons?.[nextOptionIndex]?.focus();
		},
		[activeIndex, enabledIndices, options, onChange, disabled],
	);

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			move(1);
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			move(-1);
		} else if (e.key === "Home") {
			e.preventDefault();
			move("home");
		} else if (e.key === "End") {
			e.preventDefault();
			move("end");
		}
	};

	// When value matches no option (uncontrolled edge-case), fallback tabIndex=0
	// to the first non-disabled option so the group remains keyboard-reachable.
	const fallbackTabIndex = enabledIndices[0] ?? -1;

	return (
		<div
			ref={setRef}
			role="radiogroup"
			aria-label={ariaLabel}
			className={`ds-atom-segmented${className ? ` ${className}` : ""}`}
			style={style}
			data-size={size}
			data-disabled={disabled ? "true" : undefined}
			onKeyDown={onKeyDown}
		>
			{options.map((opt, i) => {
				const isActive = opt.value === value;
				const tabIndex = activeIndex >= 0 ? (isActive ? 0 : -1) : i === fallbackTabIndex ? 0 : -1;
				// Per-option tone only paints the ACTIVE segment; inactive options keep
				// default styling. Inline styles win over the default
				// .ds-atom-segmented-btn[data-active] CSS rule, so the standard
				// (tone-less) path is left exactly as before.
				const toneStyle: React.CSSProperties | undefined =
					isActive && opt.tone ? { background: opt.tone.activeBg, color: opt.tone.fg } : undefined;
				return (
					<button
						key={opt.value}
						type="button"
						// biome-ignore lint/a11y/useSemanticElements: WAI-ARIA radiogroup pattern - buttons-in-radiogroup required for styled pill segments with data-active state; native <input type="radio"> cannot be pill-shaped without hacks
						role="radio"
						aria-checked={isActive}
						tabIndex={tabIndex}
						disabled={disabled || opt.disabled}
						data-active={isActive ? "true" : undefined}
						data-toned={isActive && opt.tone ? "true" : undefined}
						style={toneStyle}
						onClick={() => {
							if (!disabled && !opt.disabled) onChange(opt.value);
						}}
						className="ds-atom-segmented-btn"
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

// TypeScript cannot propagate generic T through forwardRef's HOC boundary automatically.
// This cast preserves the generic signature in consumers while using forwardRef internally.
export const SegmentedControl = forwardRef(SegmentedControlInner) as <T extends string>(
	props: SegmentedControlProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof SegmentedControlInner>;
