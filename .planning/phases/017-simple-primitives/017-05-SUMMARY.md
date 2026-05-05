---
phase: 017-simple-primitives
plan: "05"
subsystem: ui
tags: [react, typescript, barrel-exports, design-system]

requires:
  - phase: 017-02
    provides: Kbd component with KbdProps and KbdSize types
  - phase: 017-03
    provides: RelativeTime component with RelativeTimeProps type
  - phase: 017-04
    provides: Pagination component with PaginationProps type

provides:
  - Kbd, KbdProps, KbdSize exported from src/index.ts
  - RelativeTime, RelativeTimeProps exported from src/index.ts
  - Pagination, PaginationProps exported from src/index.ts
  - Phase 17 barrel export gate passed (tsc clean, 33 Phase 17 tests green)

affects:
  - All consuming projects that import from @akhil-saxena/design-system

tech-stack:
  added: []
  patterns:
    - "Barrel exports grouped by category peer (inputs/Badge → inputs/Kbd, interaction/CopyToClipboard → interaction/RelativeTime, data-display/Calendar → data-display/Pagination)"

key-files:
  created: []
  modified:
    - src/index.ts
    - src/data-display/Pagination/index.tsx

key-decisions:
  - "Kbd export placed immediately after Badge (both inputs/ category peers)"
  - "RelativeTime export placed immediately after CopyToClipboard (both interaction/ category peers)"
  - "Pagination export placed immediately after Calendar (both data-display/ category peers)"
  - "Pagination biome lint errors fixed as Rule 1 deviation: removed redundant role='list' from <ol>, replaced array-index ellipsis keys with stable tagged-item keys, extracted counter increment out of expression"
  - "noUncheckedIndexedAccess=true in tsconfig requires ! non-null assertion on bounds-checked array access; biome S4325 warning is a false positive here"

patterns-established:
  - "New barrel exports inserted adjacent to category peers — not appended at end of file"

requirements-completed:
  - REQ-17-01
  - REQ-17-02
  - REQ-17-03

duration: 12min
completed: 2026-05-05
---

# Phase 17 Plan 05: Barrel Exports + Verification Gate Summary

**Kbd, RelativeTime, and Pagination wired into src/index.ts with category-grouped placement; tsc clean and all 33 Phase 17 tests pass**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-05T11:58:00Z
- **Completed:** 2026-05-05T12:03:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added 3 barrel exports to src/index.ts with correct placement adjacent to category peers
- Fixed pre-existing biome lint errors in Pagination that blocked the commit hook
- TypeScript build passes clean (tsc --noEmit exits 0)
- All 33 Phase 17 tests pass: 8 Kbd + 11 RelativeTime + 14 Pagination
- Full suite: 784 tests pass; 3 pre-existing failures (calendarGrid, Calendar, CopyToClipboard) confirmed unrelated to this plan

## Task Commits

1. **Task 1: Add barrel exports for Kbd, RelativeTime, Pagination** - `ecf8883` (feat)
2. **Deviation fix: Pagination biome lint errors** - `d31c024` (fix)

**Plan metadata:** _(docs commit — this summary)_

## Files Created/Modified

- `src/index.ts` — added 3 export lines for Phase 17 components
- `src/data-display/Pagination/index.tsx` — fixed biome lint errors (redundant role, array-index key, expression assignment)

## Decisions Made

- Barrel exports grouped with category peers (not appended to end of file) for maintainability
- `noUncheckedIndexedAccess` requires `!` on bounds-checked array access in the Pagination keyboard handler; biome S4325 warning is a false positive and was accepted by biome on commit

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed biome lint errors in Pagination blocking commit hook**
- **Found during:** Task 2 (verification suite / commit attempt)
- **Issue:** Three biome errors prevented commit: `a11y/noRedundantRoles` (redundant `role="list"` on `<ol>`), `suspicious/noArrayIndexKey` (ellipsis key used map index), `S1121` (assignment inside expression)
- **Fix:** Removed `role="list"` from `<ol>`; refactored `pages.map` to pre-tag items as `{ kind: "ellipsis", key }` or `{ kind: "page", page, key }` with stable keys derived from ellipsis count; extracted `ellipsisCount += 1` out of the ternary expression
- **Files modified:** `src/data-display/Pagination/index.tsx`
- **Verification:** `biome check` passes on commit; all 14 Pagination tests still pass; tsc clean
- **Committed in:** `d31c024`

---

**Total deviations:** 1 auto-fixed (Rule 1 — pre-existing biome errors in Pagination component)
**Impact on plan:** Fix was necessary to satisfy the commit hook. No scope creep. All Pagination tests passed before and after.

## Issues Encountered

- The initial tsc run showed `TS2532: Object is possibly 'undefined'` on `buttons[idx - 1]` and `buttons[idx + 1]` in Pagination's keyboard handler. Root cause: `tsconfig.json` has `noUncheckedIndexedAccess: true`. Fix was `!` non-null assertions. Biome's S4325 rule flags these as "unnecessary" (false positive — it doesn't model `noUncheckedIndexedAccess`). The `!` assertions were retained; biome accepted them on commit.
- The 3 failures in `calendarGrid`, `Calendar`, and `CopyToClipboard` are pre-existing — confirmed by running the suite against the stashed state (identical failures before any changes in this plan).

## Known Stubs

None — all three components are fully implemented with real data sources.

## Threat Flags

None — src/index.ts is a static re-export file; no new network endpoints, auth paths, or trust-boundary surfaces introduced.

## Next Phase Readiness

Phase 17 is complete. All three Phase 17 components (Kbd, RelativeTime, Pagination) are:
- Implemented with full accessibility
- Covered by 33 unit tests
- Exported from the package barrel

Next: Phase 18 (DataGrid — depends on Pagination from this phase per STATE.md decisions).

---
*Phase: 017-simple-primitives*
*Completed: 2026-05-05*
