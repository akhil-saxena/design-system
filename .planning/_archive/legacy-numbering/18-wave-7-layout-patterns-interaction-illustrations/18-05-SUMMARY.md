---
phase: 18
plan: 05
subsystem: patterns
tags: [form-validation, coachmark, popover, localStorage, tdd]
dependency_graph:
  requires: [18-01, 18-02]
  provides: [DS-75, DS-76]
  affects: [src/index.ts, src/primitives.css]
tech_stack:
  added: []
  patterns: [tdd-red-green, biome-ignore-positional-keys, localStorage-ssr-guard, Popover-composition]
key_files:
  created:
    - src/FormValidation.tsx
    - src/FormValidation.test.tsx
    - src/Coachmark.tsx
    - src/Coachmark.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "PasswordStrength uses inline style for segment color (token CSS vars as strings) — CSS class alone cannot express dynamic score-based coloring without generating per-score classes"
  - "biome-ignore lint/suspicious/noArrayIndexKey used for score segment dots and coachmark step dots — both are purely positional UI elements with no stable IDs"
  - "Coachmark renders null via Popover open=false rather than conditional rendering at root — keeps Popover's Escape/click-outside dismiss wired consistently"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-02"
  tasks_completed: 2
  files_count: 6
---

# Phase 18 Plan 05: DS-75 FormValidation helpers + DS-76 Coachmark Summary

**One-liner:** Three composable form-validation helpers (PasswordStrength, FieldError, FormErrorSummary) and a Popover-based localStorage-dismissible Coachmark with step indicator.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | FormValidation — PasswordStrength + FieldError + FormErrorSummary | 2028c04 | src/FormValidation.tsx, src/FormValidation.test.tsx, src/primitives.css |
| 2 | Coachmark — anchored first-run hint + barrel exports | 2028c04 | src/Coachmark.tsx, src/Coachmark.test.tsx, src/index.ts |

## Test Results

```
Test Files  2 passed (2)
     Tests  18 passed (18)
             9 FormValidation (PasswordStrength × 5, FieldError × 2, FormErrorSummary × 2)
             9 Coachmark (render, dismiss, null, localStorage write/read/guard, onNext, onDone, step indicator)
```

## Artifacts

- **src/FormValidation.tsx** — `PasswordStrength` (4-segment score meter), `FieldError` (role=alert), `FormErrorSummary` (role=alert list)
- **src/Coachmark.tsx** — Popover-based anchored hint; `storageKey` prop controls localStorage persistence; `typeof window` SSR guard
- **src/FormValidation.test.tsx** — 9 tests covering all segment colors, labels, falsy render paths
- **src/Coachmark.test.tsx** — 9 tests covering render, dismiss, null-after-dismiss, localStorage write, mount-reads-dismissed, no-storage-key guard, onNext, onDone, step indicator

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome pre-commit hook blocked on array index key lint errors**
- **Found during:** Task 1 + 2 commit
- **Issue:** `biome check --write` run by lint-staged raised `noArrayIndexKey` errors in FormValidation.tsx (FormErrorSummary `<li>` map) and Coachmark.tsx (step dots `Array.from` map). Pre-commit hook reverted stash, wiping new files.
- **Fix:** Added `// biome-ignore lint/suspicious/noArrayIndexKey: <rationale>` comment to both positional render lists. Re-ran `biome check --write` on all 4 new files before staging; second commit passed cleanly.
- **Files modified:** src/FormValidation.tsx, src/Coachmark.tsx, src/Coachmark.test.tsx (biome auto-reformatted one JSX expression)
- **Commit:** 2028c04

## Known Stubs

None — all three FormValidation helpers and Coachmark render real data from props with no hardcoded placeholder values.

## Self-Check: PASSED

- [x] `src/FormValidation.tsx` exists
- [x] `src/Coachmark.tsx` exists
- [x] `src/FormValidation.test.tsx` exists
- [x] `src/Coachmark.test.tsx` exists
- [x] Commit 2028c04 exists
- [x] 18 tests pass
- [x] Barrel exports present in src/index.ts (pre-committed by 18-04 docs commit)
- [x] CSS atoms present in src/primitives.css (pre-committed by 18-04 docs commit)

## PLAN COMPLETE
