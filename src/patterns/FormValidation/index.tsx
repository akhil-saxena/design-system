import type { CSSProperties } from "react";

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

function labelColor(score: number): string {
	if (score <= 0) return "var(--ink-4)";
	if (score === 1) return "var(--red)";
	if (score <= 3) return "var(--amber-d)";
	return "var(--green-vivid)";
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
	message?: string | null;
	className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
	if (!message) return null;
	return (
		<span role="alert" className={["ds-atom-field-error", className].filter(Boolean).join(" ")}>
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
