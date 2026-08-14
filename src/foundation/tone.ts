/**
 * Shared tone vocabulary for the typographic primitives (Heading, Text,
 * Eyebrow).
 *
 * ## Why this exists
 *
 * The three components each exposed a *different subset of raw token names*:
 *
 *   HeadingTone = "ink" | "ink-2" | "ink-3" | "amber"
 *   TextTone    = "ink" | "ink-2" | "ink-3" | "ink-4" | "amber" | "red" | "green"
 *   EyebrowTone = "ink-3" | "ink-4" | "amber"
 *
 * Two problems. First, the public API leaked the internal ramp: a consumer wrote
 * `tone="ink-3"`, which says nothing about intent and pins the API to a token
 * name we then could not rename — and `ink-4` in particular turned out to be an
 * alias of `ink-3`, so two spellings meant the same thing. Second, the three
 * subsets disagreed, so knowledge did not transfer between components.
 *
 * The semantic names below describe *role*, so the ramp stays an implementation
 * detail. Omitting `tone` keeps each component's own default colour — `tone` is
 * an override, not a required choice.
 */
export type Tone = "primary" | "secondary" | "muted" | "accent" | "danger" | "success";

/**
 * The original raw-token spellings.
 *
 * @deprecated Use the semantic {@link Tone} names. These continue to work and
 * render identically; `"ink-4"` maps to `"muted"` because `--ink-4` is an alias
 * of `--ink-3`.
 */
export type LegacyTone = "ink" | "ink-2" | "ink-3" | "ink-4" | "amber" | "red" | "green";

const LEGACY: Record<LegacyTone, Tone> = {
	ink: "primary",
	"ink-2": "secondary",
	"ink-3": "muted",
	"ink-4": "muted",
	amber: "accent",
	red: "danger",
	green: "success",
};

/**
 * Resolve either spelling to the canonical semantic name used in `data-tone`.
 *
 * Keeping the normalisation in TypeScript rather than duplicating legacy
 * selectors in CSS means `primitives.css` only ever needs the six semantic
 * rules, and the deprecated spellings cost nothing at runtime beyond a lookup.
 */
export function resolveTone(tone: Tone | LegacyTone | undefined): Tone | undefined {
	if (!tone) return undefined;
	return (LEGACY as Record<string, Tone>)[tone] ?? (tone as Tone);
}
