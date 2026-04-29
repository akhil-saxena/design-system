---
phase: 17-wave-6-icons-data-display
plan: "02"
subsystem: internals/calendar
tags: [internals, refactor, calendar, datepicker, tdd]
dependency_graph:
  requires: ["17-01"]
  provides: ["src/_internals/calendarGrid.ts", "buildMonthGrid", "getWeekDayLabels"]
  affects: ["src/DatePicker.tsx", "src/DateRangePicker.tsx (transitive)"]
tech_stack:
  added: []
  patterns: ["pure utility module (dateUtils.ts analog)", "TDD RED/GREEN cycle"]
key_files:
  created:
    - src/_internals/calendarGrid.ts
    - src/_internals/calendarGrid.test.ts
  modified:
    - src/DatePicker.tsx
decisions:
  - "weekStart formula: (firstWeekday - weekStart + 7) % 7 handles both Sunday-first (0) and Monday-first (1) without conditional branches"
  - "useMemo preserved in DatePicker — grid calc is memoized on viewMonth to avoid re-computing on every render"
  - "daysInMonth removed from DatePicker imports — calendarGrid utility fully encapsulates the grid logic, DRY via dateUtils"
  - "DayCell.weekIndex is additive to the { date, inMonth } shape DatePicker already destructures — render loop is unchanged"
metrics:
  duration: "~35 minutes"
  completed: "2026-04-29"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
  tests_before: 365
  tests_after: 380
  tests_added: 15
---

# Phase 17 Plan 02: calendarGrid utility extract + DatePicker refactor Summary

**One-liner:** Lifted DatePicker's inline 42-cell month-grid logic into `src/_internals/calendarGrid.ts` (buildMonthGrid + getWeekDayLabels) via TDD, then refactored DatePicker to consume it with zero visual regression.

## What Shipped

### Task 1 — calendarGrid utility (TDD RED/GREEN)

**`src/_internals/calendarGrid.ts`** — Pure month-grid utility, no React imports, same no-dep policy as `dateUtils.ts`.

Exports:
- `interface DayCell { date, inMonth, weekIndex }` — single calendar cell
- `interface MonthGrid { weeks, cells, weekStart, monthStart }` — full 6×7 grid
- `buildMonthGrid(year, month, weekStart=0)` — returns MonthGrid with exactly 42 cells across 6 weeks. Leading-pad formula: `(firstWeekday - weekStart + 7) % 7` handles Sunday-first (weekStart=0) and Monday-first (weekStart=1) without branching.
- `getWeekDayLabels(weekStart, format="narrow")` — 7-element array of day labels for the grid header row. Supports `narrow` ("S","M","T","W","T","F","S") and `short` ("Sun","Mon",...) formats.

**`src/_internals/calendarGrid.test.ts`** — 15 tests covering:
- 42-cell invariant for all 12 months of 2026 (both weekStart variants)
- Feb 2026 (Sunday=Feb 1): 0 leading pad for weekStart=0, 6 leading pad for weekStart=1
- Feb 2024 (leap): 29 in-month cells
- April 2026 (Wednesday=Apr 1): 3 leading pad for weekStart=0
- weekIndex cycles 0–5 across 6 rows
- monthStart, weekStart preservation
- getWeekDayLabels: all 4 combinations (2 weekStarts × 2 formats) + default format

### Task 2 — DatePicker refactor

**`src/DatePicker.tsx`** — Replaced 28-line inline cells useMemo block (3-loop: leading pad, current month, trailing pad) with:
```ts
const { cells } = useMemo(
  () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), 0),
  [viewMonth],
);
```

- `weekStart=0` (Sunday-first) preserves backward-compat with all existing DatePicker baselines
- `daysInMonth` import removed (no longer used directly — calendarGrid encapsulates it)
- `startOfMonth` retained (used for viewMonth init + sync effect outside the cells block)
- `useMemo` retained (still used for `eventSet`)
- Render loop `cells.map(({ date, inMonth }) => ...)` unchanged — `weekIndex` is an additive field that is not destructured

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| calendarGrid.test.ts | 15 | Pass |
| DatePicker.test.tsx | 18 | Pass |
| DateRangePicker.test.tsx | 12 (via DatePicker) | Pass |
| Full suite | 380 (was 365) | Pass |

Typecheck: exit 0. Build: exit 0.

## Visual Regression Check

Playwright visual baselines for DatePicker (6 stories) and DateRangePicker (4 stories) were compared against existing snapshots. No pixel diffs detected for any picker story. The single visual test failure reported was a pre-existing lightbox timeout issue (`surfaces-lightbox--single-image`) unrelated to this refactor — the lightbox dialog from a previous story blocked `#storybook-root` on navigation.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `e0b80d1` | test | Add failing tests for calendarGrid utility (RED) |
| `335e9b2` | feat | Implement calendarGrid utility — buildMonthGrid + getWeekDayLabels (GREEN) |
| `f5d788b` | feat | Refactor DatePicker to consume buildMonthGrid (D-17-21) |

## Deviations from Plan

**1. [Rule 1 - Biome] Fixed forEach lint error in test file**
- **Found during:** RED phase commit
- **Issue:** Biome `lint/complexity/noForEach` rejects `.forEach()` calls — requires `for...of`
- **Fix:** Changed `g.weeks.forEach(w => expect(w.length).toBe(7))` to `for (const w of g.weeks) expect(w.length).toBe(7)`
- **Files modified:** `src/_internals/calendarGrid.test.ts`
- **Commit:** `e0b80d1` (corrected before final commit)

**2. [Biome auto-format] Import order in DatePicker.tsx**
- **Found during:** Task 2 commit
- **Issue:** Biome reformatted the two new import lines to alphabetical order (buildMonthGrid before dateUtils imports)
- **Fix:** Applied automatically by the pre-commit hook
- **Impact:** None — import order does not affect behavior

## Known Stubs

None.

## Threat Flags

None — pure date-arithmetic utility refactor. No new network endpoints, auth paths, file access, or trust boundaries introduced.

## Self-Check: PASSED

- `src/_internals/calendarGrid.ts` exists: FOUND
- `src/_internals/calendarGrid.test.ts` exists: FOUND
- Commit `e0b80d1` exists: FOUND
- Commit `335e9b2` exists: FOUND
- Commit `f5d788b` exists: FOUND
- `grep -c "buildMonthGrid" src/DatePicker.tsx` = 2 (import + call): FOUND
- `grep -c "for (let i = firstWeekday - 1" src/DatePicker.tsx` = 0 (old loop removed): VERIFIED
