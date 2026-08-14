# Phase 30 — Tier 3: Shared Primitives & Styling Architecture — COMPLETE

**Verification:** 1163 tests · typecheck 0 errors (src + tests + stories) · biome clean · axe 25 violations (from 105) · visual suite green on consecutive runs · build clean

## 30a — `useDismiss` ✅

Fifteen files each installed their own `document` keydown Escape handler, so one
press closed **every** open layer — Escape in a ConfirmDialog raised from a Sheet
dismissed both. `useDismiss(active, onDismiss, { modal })` keeps a layer stack so
only the innermost responds.

`modal: false` opts a layer out of the stack (Tooltip, HoverCard), because those
can legitimately be open above a dialog and should answer their own Escape.

Adopted in all 11 overlay layers: Modal, Sheet, BottomSheet, ActionSheet,
ConfirmDialog, CommandPalette, Lightbox, Popover, Tooltip, HoverCard,
InlineConfirm. For Lightbox, CommandPalette and TypeToConfirm the Escape branch
was lifted out of a mixed handler that still owns arrows/Enter.

The four remaining `Escape` handlers (InlineEdit, InlineEditField, InlineAddRow,
RichText's link input) are element-level `onKeyDown` "cancel this edit" handlers on
inputs, not overlay layers — they correctly stay out of the stack.

Removing Escape from two mixed handlers also exposed two now-stale `onClose`
dependencies, which the re-enabled `useExhaustiveDependencies` rule caught.

## 30b — Styling boundary ✅

`src/styling-boundary.test.ts` pins the boundary for the properties where an
inline declaration silently wins over the stylesheet:

- **`transition`** — the Button bug: an inline `transition: all .15s` beat both the
  enumerated transition in `primitives.css` and its `prefers-reduced-motion`
  block, so a guard that read correctly did nothing. 11 components still declare
  one; they are a **shrink-only ratchet**, and the test also fails if an entry is
  fixed without being removed. No longer reduced-motion bugs (the global guard
  uses `!important`), but still latent override conflicts.
- **`animation`** — a component injecting its own `<style>` must ship a
  reduced-motion guard. Clean.
- **`zIndex`** — must resolve through `--z-*`. Clean.

## 30c — CSS code-splitting ✅

`primitives.css` was a single 165KB sheet, so importing one component shipped
styling for all 79. The build now also emits `dist/css/<component>.css` — 71 files
including a 4.7KB shared `base` — exposed as `./css/*`.

**Button-only: 165KB → ~8KB.**

Generated at build time from the same source rather than hand-maintained as 79
files. That was the deciding call: hand-maintained files would trade a payload
problem for a drift problem, where a rule gets edited in one place and goes stale
in another. Generating means the cascade order is preserved by construction.

The contract is that the split is **lossless**. `scripts/split-css.mjs --check`
and `src/css-split.test.ts` both assert that concatenating the parts reproduces
`primitives.css` byte for byte, and further tests assert `base` stays under 10% of
the sheet and that no component's rules leak into it. `primitives.css` is
untouched and remains the documented default.
