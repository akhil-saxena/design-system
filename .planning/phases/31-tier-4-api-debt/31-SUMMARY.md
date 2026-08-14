# Phase 31 — Tier 4: API Debt — COMPLETE

**Verification:** 1163 tests · typecheck 0 errors · biome clean · axe 25 violations (from 105) · visual baselines regenerated and stable · build clean

Every rename ships a working deprecated alias, so **no consumer breaks**. The old
spellings are marked `@deprecated` and resolve to the new ones at runtime.

## 1. Semantic typography tones ✅

The three typographic primitives exposed three *different subsets of raw token
names*, which leaked the internal ramp into the public API — meaning the ramp
could never be renamed — and `ink-4` was an alias of `ink-3`, so two spellings
meant one colour.

All three now share `primary | secondary | muted | accent | danger | success`
(`src/foundation/tone.ts`), normalised in TypeScript so `primitives.css` needs
only one rule per role.

Worth noting: `primary` on Heading and `secondary` on Text previously had **no CSS
rule at all** — their colour came from an inline base applied only when `tone` was
absent. Emitting those tones without adding rules would have dropped the text to
its inherited colour. Caught by working through the mechanism rather than pattern-
matching the rename.

## 2. Card's overlapping axes ✅

`variant` and `tone` both accepted `amber` but rendered *differently* (gradient vs
flat wash); `tone="cream-2"` leaked a token name; `tone="flat"` was a border style.
`tone` → `surface` (`amber → tint`, `cream-2 → subtle`, `flat → outline`).
Renderings unchanged; the collision is gone.

## 3. Button on the token scales ✅

Previously `fontSize` 10/11/12/13 and `borderRadius` 5/7/9 — none on `--text-*` or
`--radius-*`, so the flagship component could not be re-themed by token override.
Measured the shift before committing: ≤0.5px on type, ≤1px on radius.

`padding` and `gap` deliberately stay in px. 7/14 and 6 are off the 4px grid and
snapping them would change button height and label spacing visibly — a design
decision, not a refactor.

## 4. Snackbar tones ✅ / 5. Card + StickyNote relocated ✅

Snackbar widened to `info | warning` for parity with Toast and AlertBanner. Card
and StickyNote moved to a new `surfaces/` category — `exports` has no
`./overlays/*` subpath, so this is internal only.

## 6. Field props + naming spelling ✅

`TextInput` and `Textarea` gained `label`, `hint` and `errorMessage`. Both now set
`aria-invalid`; previously only `data-error`, which is styling-only and invisible
to assistive tech. `errorMessage` implies `error` and is announced via
`role="alert"`.

Two back-compat details that needed deciding rather than defaulting:
`className`/`style` stay on the *control*, not the new field wrapper, so adding a
label never moves a consumer's styling target; and a consumer's own
`aria-describedby` is preserved and ours appended.

`BottomSheet` gained `description` (aria-describedby parity with Modal/Sheet) —
its argTypes had documented this prop while it did not exist. `ActionSheet` now
takes `ariaLabel`, the spelling 26 of 29 components already used.

## Follow-on contrast fixes

Regenerating the axe sweep after these changes surfaced two more real failures in
Calendar, both fixed:

- **Out-of-month days at 2.08:1.** The dimming came from `opacity: 0.5`, which
  silently destroyed the contrast of a compliant colour — `--ink-3` (5.6:1) at 50%
  renders as `#b4b1ae`. These are interactive buttons, so WCAG's
  inactive-component exemption does not apply.
- **Event chips on `--purple-vivid` at 4.13:1** — and white text on it reaches only
  4.23:1, so neither text direction passes. Chips need the text-tuned siblings;
  `CalendarEvent.color` now says so.

## Left as-is, deliberately

- **11 inline `transition` declarations** remain, tracked as a shrink-only ratchet
  in `src/styling-boundary.test.ts`. Not bugs (the global reduced-motion guard uses
  `!important`), and migrating each needs a per-component selector and specificity
  check — better done component by component than in a sweep.
- **Badge's legacy JobDash domain tones** (`upcoming`/`passed`/`pending`/`done`)
  stay alongside the semantic set. They are app vocabulary in a library API, but
  removing them is a real break with no automatic migration, and the semantic
  tones now give new code the right default.
