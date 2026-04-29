---
phase: 17-wave-6-icons-data-display
plan: 10
subsystem: data-display
tags: [primitive, table, compound, sort, density, sticky-header, tdd]
one_liner: "Table compound API (Root/Header/HeaderCell/Body/Row/Cell) with click-to-sort UTF-8 chevrons + aria-sort, three density modes, sticky header opt-in, and useSortableTable hook with stable sort + custom comparator"

dependency_graph:
  requires: ["17-01"]
  provides: ["DS-61-part1", "useSortableTable"]
  affects: ["17-11"]

tech_stack:
  added: []
  patterns:
    - "forwardRef compound namespace object (Table = { Root, Header, ... })"
    - "TDD RED/GREEN cycle — tests written before implementation for both tasks"
    - "data-attribute density + sticky via CSS selectors (no CSS-in-JS)"
    - "UTF-8 ▲/▼ sort indicator (9px monospace, not Lucide icons per D-17-07)"
    - "biome-ignore inline for ARIA-required noNoninteractiveTabindex on sortable <th>"

key_files:
  created:
    - src/Table.tsx
    - src/Table.stories.tsx
    - src/Table.test.tsx
    - src/hooks/useSortableTable.ts
    - src/hooks/useSortableTable.test.tsx
  modified:
    - src/hooks/index.ts
    - src/primitives.css
    - src/index.ts

decisions:
  - "UTF-8 ▲/▼ characters chosen over Lucide icons per D-17-07 — matches handoff ds-data.jsx exactly"
  - "biome-ignore on noNoninteractiveTabindex + useSemanticElements: ARIA WAI-ARIA spec explicitly requires tabIndex=0 on interactive <th> columnheader (Research line 564)"
  - "ariaSort computed as local const (not inline ternary) after biome format required collapse of multi-line ternary to single line"
  - "useSortableTable test used unmount+fresh-render instead of rerender for defaultDir test — useState initial values do not re-apply on rerender"

metrics:
  duration_minutes: 35
  completed_date: "2026-04-29"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 3
  tests_added: 36
  tests_total_after: 539
---

# Phase 17 Plan 10: Table Chrome + Sort + Density + Sticky Header Summary

Table compound primitive (DS-61 part 1) with useSortableTable hook. Compound API via forwardRef namespace object, click-to-sort with UTF-8 chevrons and aria-sort, three density modes via data-attribute, sticky header opt-in, and dark mode CSS block.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | useSortableTable hook + tests + barrel export | 7c70298 | src/hooks/useSortableTable.ts, .test.tsx, index.ts |
| 2 | Table compound primitive + CSS + stories + barrel | 039c4df | src/Table.tsx, .stories.tsx, .test.tsx, primitives.css, src/index.ts |

## TDD Gate Compliance

Both tasks followed the RED/GREEN/REFACTOR cycle:

- **Task 1 RED:** `useSortableTable.test.tsx` written first — failed with "module not found"
- **Task 1 GREEN:** `useSortableTable.ts` written — 10/10 tests passed
- **Task 2 RED:** `Table.test.tsx` written first — failed with "module not found"
- **Task 2 GREEN:** `Table.tsx` written — 26/26 tests passed; 36 total (including hook tests)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] biome lint blocked commit on noNoninteractiveTabindex**
- **Found during:** Task 2 commit (pre-commit hook)
- **Issue:** Biome's `lint/a11y/noNoninteractiveTabindex` and `lint/a11y/useSemanticElements` rules rejected `tabIndex={0}` and `role="columnheader"` on sortable `<th>` — both required by WAI-ARIA spec and explicitly called out in 17-RESEARCH.md line 564
- **Fix:** Added `// biome-ignore` comments with rationale directly before `tabIndex={0}` attribute (matching DatePicker.tsx pattern for inline suppression)
- **Files modified:** `src/Table.tsx`

**2. [Rule 1 - Bug] Test rerender did not re-apply useState initial values**
- **Found during:** Task 1 GREEN phase
- **Issue:** `rerender(<Harness defaultDir="desc" />)` does not reset hook state — `useState` initial values only apply on mount. The test for "asc and desc sort oppositely" was comparing stale state.
- **Fix:** Changed to `unmount()` + fresh `render()` so each call gets a clean hook instance
- **Files modified:** `src/hooks/useSortableTable.test.tsx`

## Known Stubs

None — all compound members are fully implemented. Stories wire real data via `useSortableTable`.

## Threat Flags

None — Table renders consumer-supplied React nodes via children. No network endpoints, auth paths, or file access patterns introduced.

## Self-Check: PASSED

Files created:
- FOUND: src/Table.tsx
- FOUND: src/Table.stories.tsx
- FOUND: src/Table.test.tsx
- FOUND: src/hooks/useSortableTable.ts
- FOUND: src/hooks/useSortableTable.test.tsx

Commits verified:
- FOUND: 7c70298 (useSortableTable hook)
- FOUND: 039c4df (Table compound primitive)

Tests: 539 total passing (up from 503 prior to this plan). Typecheck: clean.
