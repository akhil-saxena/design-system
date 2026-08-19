import type { CSSProperties, ReactNode } from "react";

// ─── DS-75: FormValidation helpers ────────────────────────────────────────────

export interface PasswordStrengthProps {
	/** 0=empty, 1=weak, 2=fair, 3=good, 4=strong */
	score: 0 | 1 | 2 | 3 | 4;
	className?: string;
	style?: CSSProperties;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;

function segmentColor(index: number, score: number): string {
	if (score === 0 || index >= score) return "var(--ink-5)";
	if (score === 1) return "var(--red)";
	if (score === 4) return "var(--green-vivid)";
	// score 2 or 3 → amber for active segments
	return "var(--amber)";
}

// Label colours must be text-safe. `--green-vivid` is documented decorative-only
// ("never text") and measured 2.05:1 here; `--green` is the text-tuned sibling at
// 5.08:1. The *segment fills* below keep using vivids, which is what they are for.
function labelColor(score: number): string {
	if (score <= 0) return "var(--ink-4)";
	if (score === 1) return "var(--red)";
	if (score <= 3) return "var(--amber-d)";
	return "var(--green)";
}

export function PasswordStrength({ score, className, style }: PasswordStrengthProps) {
	const label = STRENGTH_LABELS[score];
	return (
		<div className={["ds-atom-pwstrength", className].filter(Boolean).join(" ")} style={style}>
			<div className="ds-atom-pwstrength-segs">
				{[0, 1, 2, 3].map((i) => (
					<span
						key={i}
						className="ds-atom-pwstrength-seg"
						style={{ background: segmentColor(i, score) }}
					/>
				))}
			</div>
			{label && (
				<span className="ds-atom-pwstrength-label" style={{ color: labelColor(score) }}>
					{label}
				</span>
			)}
		</div>
	);
}

export interface FieldErrorProps {
	/**
	 * Widened from `string | null` to `ReactNode` so `Field` can route its own
	 * `errorMessage` (already a ReactNode) through this component instead of
	 * hand-rolling a second span. Every existing string call site still compiles.
	 */
	message?: ReactNode;
	/**
	 * Severity (E11). Both severities used to render identically and *both
	 * interrupted*; the interruption was half the defect, so this changes the role
	 * and not only the colour.
	 *
	 * - `"error"`   — `role="alert"`, which preempts the screen reader. D-18's
	 *   STRICT publish block needs this.
	 * - `"warning"` — `role="status"`, which waits for a pause. D-18's LENIENT
	 *   warning must not interrupt a user mid-sentence to tell them their alt text
	 *   is short.
	 *
	 * @default "error"
	 */
	tone?: "error" | "warning";
	/** Set when something points `aria-describedby` at the message. */
	id?: string;
	className?: string;
}

export function FieldError({ message, tone = "error", id, className }: FieldErrorProps) {
	if (!message) return null;
	const warning = tone === "warning";
	return (
		<span
			// See `tone`: role="alert" preempts, role="status" waits. This is the
			// announced half of the severity distinction.
			role={warning ? "status" : "alert"}
			id={id}
			// Emitted only for a warning, so the default markup is byte-identical to
			// what every existing call site rendered before `tone` existed.
			data-tone={warning ? "warning" : undefined}
			className={["ds-atom-field-error", className].filter(Boolean).join(" ")}
		>
			{warning ? (
				// The seen half, and deliberately not colour alone — a monochrome or
				// colour-blind reader perceives nothing from a hue change. A real
				// element rather than a ::before on the message, because generated
				// content cannot be aria-hidden and would be spoken on top of a
				// message that already says "warning".
				<span aria-hidden="true" className="ds-atom-field-error-icon" />
			) : null}
			{message}
		</span>
	);
}

export interface FormErrorSummaryProps {
	errors: string[];
	/** @default "Please fix the following errors:" */
	title?: string;
	className?: string;
}

export function FormErrorSummary({
	errors,
	title = "Please fix the following errors:",
	className,
}: FormErrorSummaryProps) {
	if (errors.length === 0) return null;
	return (
		<div
			role="alert"
			className={["ds-atom-form-error-summary", className].filter(Boolean).join(" ")}
		>
			<strong>{title}</strong>
			<ul>
				{errors.map((err, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static error list - order is stable and no unique IDs available
					<li key={i}>{err}</li>
				))}
			</ul>
		</div>
	);
}
