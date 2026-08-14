# Phase 28 — Tier 1: Packaging & Typecheck Correctness — SUMMARY

**Status:** Complete
**Verification:** typecheck (both projects) clean · 1121 tests pass · biome clean · build clean

## 28a — `use client` now survives the build

`grep -c "use client" dist/*.js` returned **0** before this phase, even though
ActionSheet declared it in source. Two separate causes:

1. esbuild hoists/strips module directives when merging modules into chunks.
2. `banner: { js: '"use client";' }` in tsup *is* injected — and then removed
   again, because `treeshake: true` pipes the output through rollup, which warns
   `Module level directives cause errors when bundled ... was ignored`.

Fix: `scripts/postbuild.mjs` stamps the directive after the whole pipeline, and
throws if it stamps zero files. All 11 emitted JS files now carry it.

All three entrypoints are genuinely client-only — including `./icons`, whose Icon
wrapper is built on `forwardRef`, which a Server Component cannot use. There is
no server-safe subset to carve out until the presentational components
(Heading/Text/Divider/Eyebrow) drop `forwardRef`.

Also folded the CSS copy into the same script, so a failed copy throws instead of
publishing a package whose documented stylesheet entrypoints 404.

## 28b — typecheck extended to 179 previously-invisible files

`tsconfig.json` excluded `**/*.test.tsx` and `**/*.stories.tsx`, so 97 test files
and 81 story files were never type-checked. New `tsconfig.test.json` covers them;
`npm run typecheck` now runs both projects.

**104 errors surfaced across 36 files. All fixed, none suppressed** (one narrow
`@ts-expect-error` retained where a test deliberately passes invalid input to
assert a runtime guard).

### Real bugs found, not just test noise

- **3 Modal stories used a ConfirmDialog API deleted in Phase 18** — `description`
  became `body`, and the `danger` boolean became `tone`. React silently dropped
  the unknown prop, so all three docs pages rendered a title-only dialog.
- **`Badge tone` was invalid in the README and 4 stories.** `BadgeTone` was the
  JobDash domain set (`upcoming/passed/pending/done/count/neutral`) while
  everything reached for semantic status (`amber/info/success/warning`). The
  README's *first* code sample did not type-check. Added the four semantic tones
  (`info/success/warning/error`), spelled exactly as AlertBanner and Toast spell
  them, with contrast verified — `error` uses a .10 tint because --red on .12
  measures 4.40:1, just under AA for the 9.5px label.
- **`Button.test.tsx` iterated a non-existent `"amber"` variant.** It passed:
  `variantStyles["amber"]` is undefined and spreading undefined is a no-op, so it
  rendered an unstyled button and asserted nothing. The matrix is now type-locked
  in both directions (`satisfies` + an exhaustiveness alias).
- **`SplitHero` showcase form had no accessible names.** It passed `label` to
  TextInput, which has no such prop, so React dropped it onto the DOM — both
  fields in the system's sign-in example were unlabelled.
- **Two argTypes documented props that do not exist**: SegmentedControl
  `defaultValue` (the component is controlled-only) and BottomSheet `description`
  (Modal and Sheet both have it — BottomSheet does not).
- **`SplitButton.stories` had a circular type annotation** referencing the binding
  it annotated.
- **`InfiniteList` story args were unchecked** because `Meta<typeof InfiniteList>`
  resolved the generic to `unknown`.
- **A stale `@ts-expect-error`** in Tabs.test.tsx (TS2578) and an invalid
  `Avatar size="xs"` (AvatarSize is pixels).
- **One of my own tests** from the previous pass used `onCancel` where the prop is
  `onClose` — it had slipped through precisely because tests were unchecked.

Three story files also imported `Meta`/`StoryObj` from `@storybook/react-vite`,
which does not export them; the other 78 use `@storybook/react`.

## Carried forward

- TextInput should take a first-class `label` prop → Phase 31.
- BottomSheet should take `description` for aria-describedby parity → Phase 31.
- Badge's legacy domain tones are app vocabulary in a library API → Phase 31.
