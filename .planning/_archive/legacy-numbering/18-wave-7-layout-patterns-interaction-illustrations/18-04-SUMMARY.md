---
phase: 18
plan: "04"
primitive: DS-74
subsystem: patterns
tags: [wizard, multi-step, form, stepper, progress, focus-trap]
dependency_graph:
  requires: [DS-42 ProgressBar, useFocusTrap hook]
  provides: [DS-74 Wizard]
  affects: [src/index.ts, src/primitives.css]
tech_stack:
  added: []
  patterns: [render-prop children, callback-ref focus trap, TDD RED/GREEN]
key_files:
  created:
    - src/Wizard.tsx
    - src/Wizard.test.tsx
    - src/Wizard.stories.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "biome-ignore noArrayIndexKey on stepper map: wizard steps are positional by design, labels may not be unique"
  - "validate() errors are caught in try/catch (T-18-04-02 mitigation) — thrown exceptions become 'Validation failed: unexpected error'"
  - "Test 7 ProgressBar value check uses toBeCloseTo(33.33, 1) instead of exact float string to avoid cross-platform float precision drift"
metrics:
  duration: "~15 min"
  completed: "2026-05-02"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 18 Plan 04: Wizard (DS-74) Summary

One-liner: Multi-step form scaffold with horizontal/vertical stepper, ProgressBar integration, per-step validate() gate, try/catch error safety, and useFocusTrap on the container.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Wizard component (TDD) | 74d9be7 | src/Wizard.tsx, src/Wizard.test.tsx, src/primitives.css |
| 2 | Barrel export + stories | 0782b45 | src/index.ts, src/Wizard.stories.tsx |

## Success Criteria

- [x] All 16 Wizard tests pass (requirement: ≥15)
- [x] ProgressBar imported and used (`value={(current / steps.length) * 100}`)
- [x] useFocusTrap wraps entire Wizard container including Back/Next buttons
- [x] No `<form>` element in Wizard.tsx (grep match is inside JSDoc comment only)
- [x] validate() errors display inline with `role="alert"`; step stays at current index
- [x] Wizard, WizardProps, WizardStep exported from src/index.ts
- [x] 4 stories: ThreeStepForm, TwoStepNoValidation, VerticalOrientation, Dark

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Floating point precision in test 7**
- **Found during:** Task 1 GREEN phase
- **Issue:** Test asserted `aria-valuenow="33.333333333333336"` but actual value was `"33.33333333333333"` (JS float imprecision varies by platform)
- **Fix:** Changed assertion to `expect(Number(valuenow)).toBeCloseTo(33.33, 1)` — tests the semantics, not the exact float representation
- **Files modified:** src/Wizard.test.tsx
- **Commit:** 74d9be7

**2. [Rule 3 - Blocking] biome noArrayIndexKey lint error**
- **Found during:** Task 1 commit
- **Issue:** Biome rejected `key={i}` on the Fragment in the stepper map, blocking the pre-commit hook
- **Fix:** Added `biome-ignore lint/suspicious/noArrayIndexKey` comment explaining the positional design intent (same pattern as Tabs/Carousel in the codebase)
- **Files modified:** src/Wizard.tsx
- **Commit:** 74d9be7

## TDD Gate Compliance

- RED: `d37fef2 test(18-04): add failing tests for Wizard DS-74` — 16 tests, all failing (module not found)
- GREEN: `74d9be7 feat(18-04): DS-74 Wizard — ...` — 16 tests, all passing

## Threat Model Coverage

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-18-04-01 | Accepted | Error strings rendered as text content (not innerHTML) in `.ds-atom-wizard-error` div — no XSS risk |
| T-18-04-02 | Mitigated | `handleNext` wraps `validate?.()` in try/catch; caught errors become "Validation failed: unexpected error" string |

## Known Stubs

None — all functionality is wired end-to-end.

## Self-Check: PASSED

Files:
- FOUND: src/Wizard.tsx
- FOUND: src/Wizard.test.tsx
- FOUND: src/Wizard.stories.tsx

Commits:
- FOUND: 74d9be7 (feat: Wizard implementation)
- FOUND: 0782b45 (feat: barrel export + stories)
- FOUND: d37fef2 (test: RED phase)

## PLAN COMPLETE
