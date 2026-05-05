---
phase: 17-wave-6-icons-data-display
plan: "03"
subsystem: primitives
tags: [primitive, atom, radiogroup, aria, segmented-control, keyboard-nav]
dependency_graph:
  requires: ["17-01"]
  provides: ["DS-63", "SegmentedControl radiogroup primitive"]
  affects: ["DS-68 Calendar view-mode toggle (Wave 3 Plan 12)"]
tech_stack:
  added: []
  patterns:
    - "WAI-ARIA radiogroup with automatic activation (arrow-key cycles)"
    - "forwardRef + generic T cast workaround for TypeScript HOC boundary"
    - "data-active / data-size / data-disabled attribute CSS state machine"
    - "enabledIndices array for skip-disabled keyboard navigation"
key_files:
  created:
    - src/SegmentedControl.tsx
    - src/SegmentedControl.stories.tsx
    - src/SegmentedControl.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "Used cream-2 (not surface-2) for wrapper background — matches token.css definition as warm background; surface-2 is an alias that resolves to the same value but cream-2 is the explicit name in the handoff"
  - "Active option color is #000 (not ink-inverse token which doesn't exist) — amber vivid background reads well with pure black"
  - "data-active set to string 'true' not boolean to avoid HTML attribute serialization quirks in tests"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-29"
  tasks_completed: 1
  tests_added: 15
  files_created: 3
  files_modified: 2
---

# Phase 17 Plan 03: SegmentedControl Radiogroup Primitive Summary

Pill-shaped 2-5 option group built on WAI-ARIA radiogroup with automatic activation, amber active state, three sizes, and full dark-mode support — ready for Calendar DS-68 view-mode toggle.

## What Was Built

`SegmentedControl` is a fully accessible, controlled radiogroup primitive that replaces the design-handoff `SegCtrl` reference with a production-ready component following the project's CSS + ARIA patterns.

**Key design decisions:**
- `role="radiogroup"` wrapper with `aria-label` (required prop) — not tablist
- Each option is `role="radio"` button with `aria-checked` + `tabIndex` roving-index pattern
- `ArrowRight/Left/Up/Down` cycle selection with automatic activation (WAI-ARIA radiogroup pattern)
- `Home/End` jump to first/last enabled option
- Disabled options are skipped during keyboard navigation via `enabledIndices` array
- `forwardRef` with generic `<T extends string>` preserved via cast workaround (standard React+TS limitation)
- CSS in `primitives.css` uses data-attribute selectors — no class concatenation needed

## Task Completion

| Task | Name | Commit | Files |
|------|------|--------|-------|
| RED  | Failing tests for SegmentedControl | 103779e | src/SegmentedControl.test.tsx |
| GREEN | SegmentedControl implementation + stories + CSS + barrel | 9b4ecdb | src/SegmentedControl.tsx, src/SegmentedControl.stories.tsx, src/primitives.css, src/index.ts |

## Test Results

- 15 new tests (SegmentedControl) — all passing
- 395 total tests passing (was 380 before this plan)
- `npm run typecheck` — clean (0 errors)
- `npm run build` — clean (ESM + DTS success)

## Stories

8 stories in `Atoms/SegmentedControl`:
1. `Default` — 3-option Day/Week/Month, value=Week
2. `TwoOptions` — Active/Archived binary toggle
3. `FiveOptions` — 1D/1W/1M/3M/1Y time period
4. `Sizes` — sm/md/lg stacked with labels
5. `Disabled` — entire group disabled
6. `WithDisabledOption` — Board option individually disabled
7. `DarkMode` — three controls under dark theme globals
8. `Playground` — full argTypes controls

## Deviations from Plan

None — plan executed exactly as written.

Token `--ink-inverse` referenced in plan's CSS block does not exist in tokens.css. Used `#000` directly (Rule 1: auto-fix). Amber on black is the correct accessible pairing per the design handoff.

## Threat Flags

None — primitive renders structured `options` props only. No user-input rendering path beyond standard React JSX text rendering of option labels.

## Known Stubs

None.

## Self-Check: PASSED

- src/SegmentedControl.tsx: FOUND
- src/SegmentedControl.stories.tsx: FOUND
- src/SegmentedControl.test.tsx: FOUND
- Commit 103779e (RED tests): FOUND
- Commit 9b4ecdb (GREEN implementation): FOUND
- 395 tests passing, typecheck clean, build clean
