---
phase: 17-wave-6-icons-data-display
plan: "08"
subsystem: ui
tags: [react, carousel, aria, pointer-events, reduced-motion, animation, tdd]

requires:
  - phase: 17-wave-6-icons-data-display
    provides: "useReducedMotion hook (17-00), ChevronLeft/ChevronRight icons (17-01)"

provides:
  - "Carousel primitive (DS-65): <section aria-roledescription=carousel> with controlled/uncontrolled index"
  - "Touch swipe via Pointer Events with setPointerCapture (touch-only filter)"
  - "Autoplay opt-in gated by useReducedMotion + hover/focus pause"
  - "WAI-ARIA carousel pattern: role=group slides + role=tablist dot navigation"
  - ".ds-atom-carousel CSS block in primitives.css with dark-mode rules"
  - "Public export: Carousel, CarouselProps, CarouselSlide from src/index.ts"

affects: [wave-3-data-display, 17-09, 17-10, 17-11, 17-12]

tech-stack:
  added: []
  patterns:
    - "WAI-ARIA Carousel pattern: section+group slides+tablist dots"
    - "Touch swipe via Pointer Events (setPointerCapture, pointerType=touch filter)"
    - "Autoplay blocked by useReducedMotion (W3C guidance: timer not created at all)"
    - "Hover/focus pause state pattern for autoplay"
    - "biome-ignore inline inside JSX attributes (not before element) for useSemanticElements"
    - "firePointerX test helper: MouseEvent + Object.defineProperty for jsdom pointer simulation"
    - "getAllByRole with hidden:true to find aria-hidden non-active slides"

key-files:
  created:
    - src/Carousel.tsx
    - src/Carousel.stories.tsx
    - src/Carousel.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts

key-decisions:
  - "touch-only filter via e.pointerType==='touch' — mouse clicks don't trigger swipe"
  - "autoplay timer NOT created at all when reducedMotion=true (W3C spec: not just paused)"
  - "Non-active slides get aria-hidden=true; tests use getAllByRole({hidden:true}) to find them"
  - "biome-ignore lint/a11y/useSemanticElements placed inline as JSX attribute comment (before the role attr), not before the element"
  - "Touch pointer events simulated in tests via MouseEvent + Object.defineProperty (jsdom PointerEvent constructor doesn't propagate clientX/pointerType)"

patterns-established:
  - "Pattern: WAI-ARIA Carousel — <section aria-roledescription=carousel> + <div role=group aria-roledescription=slide>"
  - "Pattern: Pointer Events swipe adapted from BottomSheet.tsx (startX instead of startY, touch-only filter)"
  - "Pattern: firePointerX test helper for jsdom pointer simulation (same shape as BottomSheet firePointer)"

requirements-completed: [DS-65]

duration: 35min
completed: 2026-04-29
---

# Phase 17 Plan 08: Carousel Summary

**WAI-ARIA Carousel (DS-65) with touch swipe via Pointer Events, opt-in autoplay gated by useReducedMotion, dot + arrow navigation, and dark-mode CSS**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-29T18:00:00Z
- **Completed:** 2026-04-29T18:08:21Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 5

## Accomplishments

- Carousel primitive with full WAI-ARIA pattern: `<section aria-roledescription="carousel">`, `<div role="group" aria-roledescription="slide">`, `role="tablist"` dots
- Touch swipe via Pointer Events (`setPointerCapture`) — touch-only filter preserves mouse click semantics
- Autoplay timer is never created when `prefers-reduced-motion: reduce` is active (W3C spec compliance)
- Hover/focus pause state so autoplay stops while user interacts
- Keyboard navigation via `ArrowLeft`/`ArrowRight` on the section element
- Controlled and uncontrolled index modes with `onIndexChange` callback
- 27 unit tests covering all behaviours; full suite remains 482/482

## Task Commits

1. **Task 1 RED: Carousel tests** - `148f80d` (test)
2. **Task 1 GREEN: Carousel implementation** - `cb55020` (feat)

## Files Created/Modified

- `src/Carousel.tsx` — 260 lines, Carousel primitive (DS-65)
- `src/Carousel.stories.tsx` — 9 stories (Default, Autoplay, NoArrows, NoDots, ImageSlides, ContentSlides, ReducedMotion, DarkMode, Controlled, Playground)
- `src/Carousel.test.tsx` — 27 tests; TDD RED commit then GREEN
- `src/primitives.css` — `.ds-atom-carousel` CSS block appended (~100 lines)
- `src/index.ts` — `Carousel`, `CarouselProps`, `CarouselSlide` export appended

## Decisions Made

- **touch-only swipe filter:** `e.pointerType === "touch"` prevents mouse drags from accidentally triggering slide advances. Desktop users use arrow buttons or keyboard.
- **autoplay gating:** `useReducedMotion` returning `true` skips `setInterval` creation entirely — not just a pause flag — per W3C WAI-ARIA carousel guidance.
- **aria-hidden on non-active slides:** Non-active slides get `aria-hidden={i !== index}` so screen readers only announce the visible slide; tests that count all slides use `getAllByRole("group", { hidden: true })`.
- **No `loop` prop in v0.6:** Prev is disabled at index 0, Next at last index. Wrapping loop opt-in deferred per DS-17 spec.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test helper for jsdom pointer simulation**
- **Found during:** Task 1 GREEN (touch swipe tests failing)
- **Issue:** jsdom's `PointerEvent` constructor does not propagate `clientX`, `pointerType`, or `pointerId` from the init dict — `fireEvent.pointerDown(el, { clientX: 200 })` delivers `clientX=undefined` to handlers.
- **Fix:** Added `firePointerX` helper (pattern lifted directly from `BottomSheet.test.tsx`'s `firePointer`) that constructs a `MouseEvent` and pins pointer-specific properties via `Object.defineProperty`. Touch swipe tests wrapped in `act()` to flush React state synchronously.
- **Files modified:** `src/Carousel.test.tsx`
- **Verification:** All 27 tests pass including both swipe directions.
- **Committed in:** `cb55020`

**2. [Rule 1 - Bug] biome-ignore placement for role=group**
- **Found during:** Task 1 GREEN (pre-commit hook failure)
- **Issue:** `biome-ignore lint/a11y/useSemanticElements` comment placed before `<div>` (line-before-element style) was flagged as "unused suppression" — biome treats the diagnostic as belonging to the attribute, not the element opening tag.
- **Fix:** Moved biome-ignore comment inline inside the JSX element's attribute list, directly before `role="group"` (same pattern as `Lightbox.tsx` line 87).
- **Files modified:** `src/Carousel.tsx`
- **Verification:** `npx biome check src/Carousel.tsx` → "No fixes applied."
- **Committed in:** `cb55020`

---

**Total deviations:** 2 auto-fixed (both Rule 1 — implementation bugs discovered during testing)
**Impact on plan:** Both fixes required to get tests passing and pre-commit hooks green. No scope creep.

## Issues Encountered

- jsdom's `PointerEvent` limitation requires the `firePointerX` helper pattern for any test that exercises pointer swipe behaviour. This is now an established test pattern for this project (alongside BottomSheet's `firePointer` helper).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- DS-65 Carousel is complete and publicly exported from `@akhil-saxena/design-system`
- Wave 2 (17-02 through 17-08) is complete
- Ready for Wave 3 (data-display components: 17-09 onward)

## Known Stubs

None — all slides accept consumer-provided `React.ReactNode` content; no hardcoded placeholder data flows to the rendered output.

## Threat Flags

None — Carousel renders consumer-supplied `React.ReactNode` via `slide.content`. No HTML string parsing, no user-input rendering paths owned by this primitive. Same model as Card/Modal/Lightbox.

---

*Phase: 17-wave-6-icons-data-display*
*Completed: 2026-04-29*
