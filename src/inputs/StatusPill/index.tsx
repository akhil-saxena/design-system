import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { type LegacyTone, type Tone, resolveTone } from "../../foundation/tone";

export type StatusPillStage =
	| "wishlist"
	| "applied"
	| "screening"
	| "interviewing"
	| "offer"
	| "closed";

interface StatusPillShared {
	/** Show trailing chevron (▾) — signals the pill is a dropdown trigger. */
	withChevron?: boolean;
}

interface StatusPillPresetOwn extends StatusPillShared {
	/** Job-application pipeline stage — drives bg/color tinting. */
	stage: StatusPillStage;
	children: ReactNode;
	tone?: never;
	label?: never;
}

interface StatusPillGenericOwn extends StatusPillShared {
	/**
	 * Semantic tone, from the library's ONE tone vocabulary
	 * (`src/foundation/tone.ts`) — the same names `Text`, `Heading` and `Eyebrow`
	 * take. The deprecated raw-token spellings are accepted and normalised.
	 */
	tone: Tone | LegacyTone;
	/** The pill's content. Replaces `children` on this path, so exactly one of
	 * the two paths supplies the text and a reader never has to work out which. */
	label: ReactNode;
	stage?: never;
	children?: never;
	/** Not available on the generic path — see the docstring. */
	interactive?: never;
}

/**
 * Two mutually exclusive paths, discriminated so a call site cannot supply both
 * a preset `stage` and a generic `tone` and leave the reader guessing which one
 * wins — and cannot supply neither, which would be a pill with no content.
 */
export type StatusPillProps =
	| (StatusPillPresetOwn &
			Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { interactive?: true })
	| (StatusPillPresetOwn &
			Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { interactive: false })
	| (StatusPillGenericOwn & Omit<HTMLAttributes<HTMLSpanElement>, "children">);

/**
 * The three-step emphasis ladder, keyed by tone.
 *
 * WHY THREE AND NOT SIX. `primitives.css` paints each step by mixing `--ink`
 * into `--paper`, which is the one derivation that moves AWAY from the surface
 * in every brand and both modes — the hue tokens do not: `--green` is a dark
 * editorial green in light (#2f7a52) and a light pastel in dark (#7fcfa1), so it
 * inverts, and `--ochre` is identical in both modes and therefore changes role.
 * Measured: a single mix percentage that clears 1.2:1 in charcoal light fails in
 * the other three brand × mode cells.
 *
 * Three is also the CEILING, measured rather than chosen. Six pairwise-1.2:1
 * steps span 1.2^6 = 2.99x from the page, which in charcoal dark puts the last
 * step at a fill whose text contrast is 3.76:1 — below AA, at a pill's type
 * size, where the large-text allowance never applies. Three steps hold 7:1 text
 * in all four cells. D-13 and D-45 both need exactly three states, so the
 * ceiling is above the requirement.
 *
 * The consequence to know about: two tones on the same step have the same FILL
 * and differ only by hue. That is deliberate — the neutral triad
 * (muted / secondary / primary) is the one D-45 wants, and the hued triad
 * (success / accent / danger) is the one a semantic surface wants. Pairing
 * ACROSS the two triads (say `success` beside `muted`) gives two identical
 * fills, and a consumer doing that should pick one triad instead.
 */
const TONE_STEP: Record<Tone, "1" | "2" | "3"> = {
	muted: "1",
	success: "1",
	secondary: "2",
	accent: "2",
	primary: "3",
	danger: "3",
};

/**
 * StatusPill - status chip for kanban cards, DataGrid status columns and
 * public status labels.
 *
 * ## Two paths
 *
 * **Preset** — the six job-application stages, unchanged:
 *
 *   <StatusPill stage="screening" withChevron onClick={openMenu}>Screening</StatusPill>
 *   <StatusPill stage="offer" interactive={false}>Offer</StatusPill>
 *
 * **Generic** — any status, in the library's own tone vocabulary (G-5). The
 * stage union was job-domain-locked, so this component appeared on ZERO of the
 * seven admin screens and `Badge` stood in on three separate surfaces, each for
 * a different closed union it could not express:
 *
 *   <StatusPill tone="success" label="Published" />
 *   <StatusPill tone="muted" label="Archived" />
 *
 * The generic path always renders a `<span>`. A status read out of content is
 * not a control — a `Live` / `Maintained` / `Archived` label on a public Work
 * card has nothing to activate. The preset path keeps defaulting to `<button>`,
 * because changing a pipeline stage is what a kanban pill is FOR.
 *
 * ## The marker is not decoration
 *
 * The generic path renders a leading marker whose SHAPE is driven by
 * `data-step`, so the three-way split survives greyscale and colour blindness.
 * F-15-5 measured D-45's three statuses at a 1.02:1 fill separation — "only the
 * words separate them, at 9.5px" — and a fill ladder alone would still be a
 * colour distinction. The preset path renders no marker, so no existing render
 * moves.
 *
 * Visual styling lives in primitives.css under `.ds-atom-statuspill`.
 */
export const StatusPill = forwardRef<HTMLButtonElement | HTMLSpanElement, StatusPillProps>(
	function StatusPill(props, ref) {
		const { withChevron, className } = props;
		const cls = `ds-atom-statuspill${className ? ` ${className}` : ""}`;
		const chevron = withChevron ? (
			<span className="ds-atom-statuspill-chev" aria-hidden="true">
				▾
			</span>
		) : null;

		// Generic path. Narrowed on `tone` rather than on the absence of `stage`,
		// so a runtime object carrying both (which the types forbid) resolves
		// predictably instead of rendering a stage pill with a tone attribute.
		if (props.tone !== undefined) {
			const {
				tone,
				label,
				withChevron: _wc,
				className: _cn,
				stage: _st,
				children: _ch,
				interactive: _in,
				...rest
			} = props;
			// `tone` is required on this path, so resolveTone cannot return
			// undefined; the fallback exists only to keep the type honest.
			const resolved: Tone = resolveTone(tone) ?? "muted";
			return (
				<span
					ref={ref as React.Ref<HTMLSpanElement>}
					className={cls}
					data-tone={resolved}
					data-step={TONE_STEP[resolved]}
					data-interactive="false"
					{...rest}
				>
					<span className="ds-atom-statuspill-marker" aria-hidden="true" />
					{label}
					{chevron}
				</span>
			);
		}

		const {
			stage,
			interactive = true,
			withChevron: _wc,
			className: _cn,
			tone: _to,
			label: _la,
			children,
			...rest
		} = props;
		if (interactive) {
			return (
				<button
					ref={ref as React.Ref<HTMLButtonElement>}
					type="button"
					className={cls}
					data-stage={stage}
					data-interactive="true"
					{...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
				>
					{children}
					{chevron}
				</button>
			);
		}
		return (
			<span
				ref={ref as React.Ref<HTMLSpanElement>}
				className={cls}
				data-stage={stage}
				data-interactive="false"
				{...(rest as HTMLAttributes<HTMLSpanElement>)}
			>
				{children}
				{chevron}
			</span>
		);
	},
);
