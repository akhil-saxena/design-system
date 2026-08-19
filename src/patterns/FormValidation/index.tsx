import type { CSSProperties, ReactNode } from "react";
import { Link } from "../../foundation/Link";

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

/**
 * One entry in a `FormErrorSummary`.
 *
 * The bare string is the original shape and still works. The object form adds
 * `href` (G-6): without it, the two surfaces that needed a link — the D-18
 * publish modal and the inline publish block — had to render their actions as
 * separate elements *beside* the summary, in a second ordered list whose only
 * binding to the first was that the two arrays happened to be in the same order.
 * Reordering or renumbering either one desynchronised them with nothing to catch
 * it. So the link belongs ON the item that names the failure.
 */
export type FormErrorSummaryEntry = string | { message: string; href?: string };

/**
 * The subset of href shapes that become anchors (T-11-01).
 *
 * A consumer-supplied href is a real elevation-of-privilege vector here: React
 * does NOT block `javascript:` in `href` the way it blocks some attributes, so
 * an unfiltered value would execute on click. Only in-app link shapes are
 * rendered as anchors — a leading `/`, `#` or `.` — which is all D-18 needs,
 * since every real entry deep-links to a route on this site.
 *
 * `//host` is excluded explicitly: it passes a naive leading-slash test but is
 * protocol-relative and leaves the application. The test is on the FIRST
 * character, so a leading-whitespace smuggle (`" javascript:…"`) fails too.
 *
 * Anything rejected renders as plain text. The failure is still named — it just
 * is not clickable, which is a strictly better outcome than a live hostile URL.
 */
function inAppHref(href: string | undefined): string | undefined {
	if (!href || href.startsWith("//")) return undefined;
	return /^[/#.]/.test(href) ? href : undefined;
}

export interface FormErrorSummaryProps {
	/**
	 * Widened from `string[]` rather than replaced by the object form (G-6). The
	 * finding proposed `Array<{ message, href? }>`, but accepting the string
	 * alongside it costs one normaliser and keeps every existing call site
	 * compiling — and the finding records that the component "was not forked to add
	 * an href", so an additive widening is truest to how it was measured.
	 */
	errors: FormErrorSummaryEntry[];
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
			// role="alert" is kept, and is deliberately NOT symmetric with FieldError's
			// warning tone above: a summary only appears after a failed submit, so
			// preempting is correct here and wrong there. Do not "make these
			// consistent" — the asymmetry is the point.
			role="alert"
			className={["ds-atom-form-error-summary", className].filter(Boolean).join(" ")}
		>
			<strong>{title}</strong>
			<ul>
				{errors.map((entry, i) => {
					const message = typeof entry === "string" ? entry : entry.message;
					const href = inAppHref(typeof entry === "string" ? undefined : entry.href);
					return (
						// The index key survives the widening on purpose. `href ?? message` looks
						// stable but collides whenever two fields fail with the same message, and
						// a wrong key is worse than an acknowledged one.
						// biome-ignore lint/suspicious/noArrayIndexKey: static error list - order is stable and no unique IDs available
						<li key={i}>
							{/* The anchor's accessible text IS the message. Not "Go to Résumé"
							    beside "Résumé is missing a role" — that is a navigation aside;
							    this is a deep link, and nothing renders outside the <ul>. */}
							{href ? (
								// Link, not a bare <a>: primitive-composition.test.ts enforces it, and
								// the primitive owns the focus ring. `variant="default"` specifically —
								// the `inline` default sets `color` as an INLINE style, which would beat
								// any stylesheet rule without !important, so the link would render amber
								// inside a red summary box. `default` lives entirely in primitives.css,
								// where the summary's own rule can compose with it.
								<Link href={href} variant="default">
									{message}
								</Link>
							) : (
								message
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
