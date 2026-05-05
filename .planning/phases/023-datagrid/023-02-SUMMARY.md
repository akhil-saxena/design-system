---
phase: 023-datagrid
plan: 02
subsystem: data-display
tags: [datagrid, tests, vitest, accessibility]
requires:
  - "@src/data-display/DataGrid/index.tsx"
provides:
  - 18 unit tests covering REQ-23-01 acceptance criteria
affects:
  - test suite count (18 new passing tests)
tech_stack:
  added: []
  patterns:
    - testing-library/react render + fireEvent
    - vi.fn spies for callback assertions
    - HTML validity assertion: <nav> is sibling, not descendant of <table>
key_files:
  created:
    - src/data-display/DataGrid/DataGrid.test.tsx
  modified: []
decisions:
  - Test selector for bulk-bar uses `.ds-atom-datagrid-bulkbar` (matches Plan 01 must_haves and shipped CSS), not `.ds-atom-datagrid-bulk-bar` as the test plan draft suggested
  - Tests assert `onSelectionChange` is fired with row IDs — wired through useTableSelection hook option
  - PriorityDot color asserted via inline style.background containing CSS var name (not computed color)
  - Keyboard Space test fires keyDown on `<tr>` element; bubbling reaches wrapper handler
  - Rule 1 fix: tests use the actual class name from the shipped CSS, not the typo from plan draft
metrics:
  duration: 4min
  completed: 2026-05-05
  tasks: 1
  files: 1
---

# Phase 23 Plan 02: DataGrid Tests Summary

18 unit tests covering all 7 REQ-23-01 acceptance criteria — sort indicator, row selection, bulk-bar visibility/count/Clear, status badges, priority dots with vivid color, Pagination as sibling-not-descendant of `<table>`, and keyboard Space-toggle.

## Implementation

### Task 1 — DataGrid test suite (commit `50e3fb8`)

Created `src/data-display/DataGrid/DataGrid.test.tsx` with 18 tests across 8 describe blocks:

| Describe | Test count | Coverage |
|----------|------------|----------|
| Render | 3 | Wrapper class, header count (cols + select-all), body row count |
| Sort | 2 | Sortable header click toggles ▲/▼; non-sortable column does not |
| Selection | 2 | Row checkbox fires onSelectionChange([id]); select-all fires with all ids |
| BulkActions | 4 | Bulk-bar hidden when none selected; visible when ≥1; count text accurate; Clear resets |
| StatusBadges | 1 | All 4 status labels render (Applied, Interview, Offer, Rejected) |
| PriorityDots | 2 | data-part="priority-dot" count = row count; high priority uses var(--red-vivid) |
| Pagination | 2 | `<nav>` is sibling of `<table>` (not descendant); onPageChange fires on page button click |
| Keyboard | 2 | Space on `<tr>` toggles selection via wrapper bubbling; ArrowDown does not throw |

**Critical HTML validity test** (REQ-23-01 truth):
```typescript
const wrapper = container.querySelector(".ds-atom-datagrid");
const table = wrapper?.querySelector("table");
const nav = wrapper?.querySelector("nav");
expect(nav).not.toBeNull();
expect(table?.contains(nav as Node)).toBe(false);  // CRITICAL: nav is NOT inside table
```

## Test Result

```
Test Files  1 passed (1)
     Tests  18 passed (18)
  Duration  909ms
```

## Deviations from Plan

### Auto-fixed selector mismatch (Rule 1)

**1. [Rule 1 - Bug] Bulk-bar class name harmonized**
- **Found during:** Test plan vs. component plan comparison
- **Issue:** Plan 023-02 draft used `.ds-atom-datagrid-bulk-bar` (with hyphen), but Plan 023-01 must_haves and the shipped CSS use `.ds-atom-datagrid-bulkbar` (no hyphen).
- **Fix:** Used the shipped class name `.ds-atom-datagrid-bulkbar` in all test selectors. This is the authoritative source — Plan 01 must_haves explicitly list it.
- **Files modified:** `src/data-display/DataGrid/DataGrid.test.tsx`
- **Commit:** `50e3fb8`

### Auto-added test coverage (Rule 2)

**2. [Rule 2 - Test completeness] Added 4 extra tests beyond plan minimum**
- **Found during:** Implementation
- **Issue:** Plan asked for "12+ tests" — implementing the full coverage matrix produced 18 tests.
- **Added tests:** bulk-bar count text, Clear button hides bulk-bar, priority dot color assertion, ArrowDown smoke test
- **Files modified:** `src/data-display/DataGrid/DataGrid.test.tsx`
- **Commit:** `50e3fb8`

### Code-style auto-fixes (lefthook)

The biome lefthook reformatted some long querySelector lines onto a single line. Pure formatter output; no semantic test change.

## Self-Check: PASSED

- [x] FOUND: `src/data-display/DataGrid/DataGrid.test.tsx`
- [x] FOUND: commit `50e3fb8`
- [x] 18 tests pass (exceeds 12+ requirement)
- [x] Pagination-not-inside-table test present and passing
- [x] All 7 REQ-23-01 acceptance criteria covered
