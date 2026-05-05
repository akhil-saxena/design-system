---
phase: 020-statcard
plan: "01"
subsystem: ui
tags: [react, typescript, display, statcard, glass, sparkline, vitest]

# Dependency graph
requires:
  - phase: 019-dataviz
    provides: Sparkline component at src/display/Sparkline/index.tsx
provides:
  - StatCard component at src/display/StatCard/index.tsx
  - StatCardProps and StatCardChangeDir type exports
  - 11 unit tests covering all behavioral contracts
affects:
  - 020-02 (StatCard stories)
  - src/index.ts barrel export

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Named function export (no forwardRef) for pure display component
    - glass utility class with inline borderRadius override (12px vs 16px default)
    - data-part attributes for test selectors (label, badge)
    - vi.mock('../Sparkline') to isolate Phase 19 dependency in unit tests
    - DOM-normalized rgba test expectations (rgba(34, 197, 94, 0.1) not rgba(34,197,94,.1))

key-files:
  created:
    - src/display/StatCard/index.tsx
    - src/display/StatCard/StatCard.test.tsx
  modified: []

key-decisions:
  - "Named function export (not forwardRef) — pure display component with no ref forwarding needed, matches RollingNumber pattern"
  - "glass class directly on root div with inline borderRadius:12 override — avoids Card component's 20px/22px padding and 16px radius"
  - "data-part attributes (label, badge) used as test selectors instead of ds-* class names — inline-only styling convention for display components"
  - "vi.mock('../Sparkline') in tests so Phase 20 unit tests compile independently of Phase 19"
  - "Test badge background expectations use browser-normalized rgba form: rgba(34, 197, 94, 0.1) not rgba(34,197,94,.1)"

patterns-established:
  - "Pattern 1: glass surface with inline override — className='glass' + style={{ borderRadius: 12 }} wins over .glass border-radius rule"
  - "Pattern 2: TDD RED/GREEN with vi.mock for cross-phase dependencies — tests fail on missing import, then pass once component created"

requirements-completed:
  - REQ-20-01

# Metrics
duration: 4min
completed: 2026-05-05
---

# Phase 20 Plan 01: StatCard Component Summary

**StatCard KPI card with glass surface, mono label, Archivo 800 value, green/red trend badge pill, and conditional Sparkline — 11 unit tests all passing**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-05T08:24:38Z
- **Completed:** 2026-05-05T08:28:38Z
- **Tasks:** 2 (TDD: RED then GREEN)
- **Files modified:** 2

## Accomplishments
- Implemented StatCard with glass surface (className="glass" + inline borderRadius:12), mono label (9px 700 uppercase .08em ink-3), Archivo 800 28px value, conditional badge pill (green/red sentiment), and conditional Sparkline (data.length >= 2)
- Wrote 11 behavioral unit tests covering all plan contracts — label text, label styles, value render, green badge, red badge, no-badge guard, Sparkline with data, no Sparkline, Sparkline short-data guard, glass class, borderRadius style
- All 11 tests pass; tsc exits 0; full suite at 823/826 (same 3 pre-existing failures as before)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write StatCard test suite (RED)** - `9424ff1` (test)
2. **Task 2: Implement StatCard component (GREEN)** - `230613a` (feat)

**Plan metadata:** (docs commit below)

_TDD: RED commit (test only) → GREEN commit (component + test fix)_

## Files Created/Modified
- `src/display/StatCard/index.tsx` — StatCard component, StatCardProps interface, StatCardChangeDir type
- `src/display/StatCard/StatCard.test.tsx` — 11 unit tests with vi.mock('../Sparkline') isolation

## Decisions Made
- Named function export (not forwardRef) — pure display component with no ref forwarding needed
- glass class directly on root div; inline borderRadius:12 overrides .glass default 16px
- data-part attributes on label and badge divs for stable test selectors
- vi.mock('../Sparkline') so tests run regardless of Phase 19 availability at test time

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed badge background test assertions for DOM-normalized rgba**
- **Found during:** Task 2 (GREEN — running test suite after implementing component)
- **Issue:** Test expectations used compact shorthand `rgba(34,197,94,.1)` but `element.style.background` returns browser-normalized `rgba(34, 197, 94, 0.1)`. Both assertions (green and red badge) failed.
- **Fix:** Updated test assertions to use normalized form: `rgba(34, 197, 94, 0.1)` and `rgba(239, 68, 68, 0.08)`
- **Files modified:** src/display/StatCard/StatCard.test.tsx
- **Verification:** npm test passes all 11 tests
- **Committed in:** 230613a (part of Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — incorrect test assertion)
**Impact on plan:** Necessary correctness fix. The component inline style values are unchanged; only the test expectation strings were adjusted to match browser normalization. No scope creep.

## Issues Encountered
- DOM normalizes `rgba(34,197,94,.1)` to `rgba(34, 197, 94, 0.1)` — compact alpha `.1` becomes `0.1` and spaces are inserted. Test expectations must use the normalized form.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- StatCard component fully implemented and tested
- Ready for Phase 20 Plan 02 (StatCard stories — Storybook variants + axe-core)
- Barrel export (src/index.ts) is not yet updated — that is typically handled in the phase gate plan

---
*Phase: 020-statcard*
*Completed: 2026-05-05*
