import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
	/** Current progress value; clamped to [0, max] internally.
	 * @default 0
	 */
	value?: number;
	/** Maximum value used to compute the fill percentage.
	 * @default 100
	 */
	max?: number;
	/** When true, renders an animated 3-dot pulse instead of a determinate fill bar.
	 * @default false
	 */
	loading?: boolean;
	/** Accessible label; string values also render visually above the bar. */
	label?: ReactNode;
}

const baseStyle: CSSProperties = {
	boxSizing: "border-box",
	display: "block",
	width: "100%",
	fontFamily: "var(--font)",
};

/**
 * ProgressBar — determinate progress indicator + loading variant (DS-42).
 *
 *   <ProgressBar value={50} />                          // determinate, 50%
 *   <ProgressBar value={3} max={10} label="Upload" />   // 3 of 10 (30%)
 *   <ProgressBar loading />                              // 3-dot pulse
 *
 * Determinate: track + amber gradient fill (linear-gradient from var(--amber)
 * to var(--amber-d)); fill width transitions over 500ms ease-out. role="progressbar"
 * with aria-valuenow / aria-valuemin / aria-valuemax wired.
 *
 * Loading: 3-dot pulse animation (handoff visual). role="status"; aria-live="polite";
 * defaults aria-label to "Loading" if no `label` passed.
 *
 * Value clamped to [0, max] internally so callers can pass anything.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
	{ value = 0, max = 100, loading = false, label, className, style, ...rest },
	ref,
) {
	const safeMax = max <= 0 ? 100 : max;
	const clamped = Math.max(0, Math.min(safeMax, value));
	const pct = (clamped / safeMax) * 100;

	if (loading) {
		return (
			<div
				ref={ref}
				className={`ds-atom-progress${className ? ` ${className}` : ""}`}
				data-loading="true"
				// biome-ignore lint/a11y/useSemanticElements: native <output> is for form result values bound to inputs; ARIA "status" role on a <div> is the standard live-region pattern for indeterminate loading announcements
				role="status"
				aria-live="polite"
				aria-label={typeof label === "string" ? label : "Loading"}
				style={{ ...baseStyle, ...style }}
				{...rest}
			>
				<span className="ds-atom-progress-dots" aria-hidden="true">
					<span className="ds-atom-progress-dot" />
					<span className="ds-atom-progress-dot" />
					<span className="ds-atom-progress-dot" />
				</span>
			</div>
		);
	}

	return (
		// biome-ignore lint/a11y/useFocusableInteractive: progressbar is a live region (not an interactive control) per ARIA APG; aria-valuenow updates are announced without needing keyboard focus, and a tab-stop on a non-interactive bar would harm keyboard UX
		<div
			ref={ref}
			className={`ds-atom-progress${className ? ` ${className}` : ""}`}
			role="progressbar"
			aria-valuenow={clamped}
			aria-valuemin={0}
			aria-valuemax={safeMax}
			aria-label={typeof label === "string" ? label : "Progress"}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			<div className="ds-atom-progress-track">
				<div className="ds-atom-progress-fill" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
});
