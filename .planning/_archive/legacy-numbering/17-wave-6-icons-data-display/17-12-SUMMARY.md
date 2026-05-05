---
phase: 17-wave-6-icons-data-display
plan: 12
subsystem: calendar
tags: [primitive, calendar, compound, segmented-control, popover, month-grid, events]
dependency_graph:
  requires:
    - 17-00 (useMatchMedia hook — reactive mobile breakpoint)
    - 17-02 (calendarGrid utility — buildMonthGrid + getWeekDayLabels)
    - 17-03 (SegmentedControl — view-mode toggle)
    - existing Popover + BottomSheet primitives
  provides:
    - Calendar primitive (DS-68) with month/week/day views
    - Calendar.Agenda compound slot
    - CalendarEvent + CalendarProps types (public)
  affects:
    - src/index.ts (Calendar barrel export)
    - src/primitives.css (Calendar CSS block appended)
tech_stack:
  added: []
  patterns:
    - ARIA grid pattern (div-based, matching DatePicker/react-aria)
    - Compound component pattern (Calendar.Agenda via Object.assign)
    - Controlled/uncontrolled view state (same as SegmentedControl)
    - Reactive mobile breakpoint via useMatchMedia (not window.matchMedia)
key_files:
  created:
    - src/Calendar.tsx
    - src/Calendar.stories.tsx
    - src/Calendar.test.tsx
  modified:
    - src/primitives.css (Calendar CSS block appended)
    - src/index.ts (Calendar export appended)
decisions:
  - "Used div-based ARIA grid (not <table>) matching DatePicker and react-aria patterns; biome-ignore on role='gridcell' <button> per DatePicker precedent"
  - "Month cells are <button role='gridcell'> + overflow is <span role='button'> to avoid nested <button> in <button> HTML spec violation"
  - "Week view uses plain divs (no ARIA grid roles) — inner <button> per day provides keyboard accessibility without biome useSemanticElements conflicts"
  - "useMatchMedia hook (Plan 00) used reactively — never window.matchMedia.matches directly per checker WARNING 5"
  - "Multi-day events render per-day chips (no spanning bars) per RESEARCH deferral"
metrics:
  duration: "875s"
  completed: "2026-04-29"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 2
  tests_added: 26
  tests_total: 624
---

# Phase 17 Plan 12: Calendar (DS-68) Summary

Calendar primitive with month/week/day views, event chips with overflow Popover/BottomSheet, today/selected highlight in amber, Calendar.Agenda compound slot, and full dark-mode CSS parity — built on the extracted `buildMonthGrid` utility and SegmentedControl view toggle.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `7db2a57` | test | Add failing Calendar tests RED — Tasks 1+2+3 (26 tests) |
| `f140053` | feat | Implement Calendar primitive with month/week/day views (DS-68) |

## Tasks Completed

| Task | Description | Status |
|------|-------------|--------|
| 1 | Month view + header nav + SegmentedControl view toggle + today highlight + selectedDate | Done |
| 2 | Event chips on day cells + overflow Popover (BottomSheet on mobile) | Done |
| 3 | Week + Day views (replaced stubs) | Done |

## What Was Built

**src/Calendar.tsx** (530 lines)
- `CalendarEvent` interface: `{ id, date, endDate?, label, color?, meta? }`
- `CalendarProps` interface: events, view/defaultView/onViewChange, selectedDate/onSelectedDateChange, weekStart (default 1), maxVisibleEventsPerDay (default 3)
- `Calendar` compound component with `Calendar.Agenda` slot
- Month view: 6×7 grid via `buildMonthGrid(year, month, weekStart=1)`, `[data-today]` amber highlight, `[data-selected]` amber-tinted, `[data-out-of-month]` muted cells
- Event chips: up to `maxVisibleEventsPerDay` colored chips per cell; overflow via `<span role="button">` "+N more" → Popover (desktop) or BottomSheet (mobile)
- Multi-day events: chip rendered on every day in `[date, endDate]` range
- Week view: 7-day columns with event stacks, reactive ±7-day nav
- Day view: 24-hour grid with all-day section, reactive ±1-day nav
- Mobile breakpoint: `useMatchMedia("(max-width: 640px)")` — reactive, SSR-safe
- XSS-safe: all `event.label` rendered via JSX text interpolation only (T-17-12-01 mitigated)

**src/primitives.css** — 250+ lines appended for `.ds-atom-calendar*` classes including 17 dark-mode rules

**src/index.ts** — `Calendar`, `CalendarProps`, `CalendarEvent` barrel-exported

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Nested `<button>` inside `<button>` HTML spec violation**
- **Found during:** Task 2 implementation (month cell + overflow button)
- **Issue:** Month grid cells were `<button role="gridcell">` containing an overflow `<button>` — invalid HTML per spec, React hydration warning
- **Fix:** Month cells remain `<button role="gridcell">` (matching DatePicker pattern); overflow `+N more` changed to `<span role="button" tabIndex={0}>` with both `onClick` and `onKeyDown` handlers
- **Files modified:** src/Calendar.tsx
- **Commit:** f140053

**2. [Rule 1 - Bug] Biome `useSemanticElements` enforcement on ARIA grid roles**
- **Found during:** Pre-commit hook (multiple attempts)
- **Issue:** Biome v4 enforces `useSemanticElements` broadly — `role="row"` on `<div>` triggers "use `<tr>`", `role="gridcell"` on `<div>` triggers "use `<td>`". The biome-ignore comment must be an inline prop comment (not a line comment before the tag) matching DatePicker's exact pattern
- **Fix:** Month grid: `<div role="grid">` with biome-ignore on outer div, `<button role="gridcell">` with inline prop biome-ignore matching DatePicker; Week view: dropped ARIA roles entirely (inner `<button>` per day provides keyboard access)
- **Files modified:** src/Calendar.tsx
- **Commit:** f140053

**3. [Rule 2 - Missing] Test selector used `role="gridcell"` for `[data-out-of-month]` click test**
- **Found during:** Test design for Task 1
- **Issue:** Original test used `[role='gridcell']` selector; after div→button change, selector still works but `HTMLButtonElement` cast was removed since gridcell cells are now focusable `<button>` elements
- **Fix:** Test updated to use plain `[role='gridcell']:not([data-out-of-month])` — biome linter also auto-removed unused `within` import
- **Files modified:** src/Calendar.test.tsx
- **Commit:** 7db2a57

## Known Stubs

None — all three views are fully implemented. Week view uses plain div layout (no ARIA grid) which is intentional per deviation above.

## Threat Flags

No new threat surface beyond the plan's `<threat_model>`. T-17-12-01 (XSS via event.label) is mitigated: every chip and popover list item renders `{ev.label}` via JSX text interpolation. No `dangerouslySetInnerHTML` anywhere in Calendar.tsx (verified: `grep -c "dangerouslySetInnerHTML" src/Calendar.tsx` returns 0).

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/Calendar.tsx exists | FOUND |
| src/Calendar.stories.tsx exists | FOUND |
| src/Calendar.test.tsx exists | FOUND |
| src/primitives.css modified | FOUND |
| src/index.ts modified | FOUND |
| commit 7db2a57 (RED) exists | FOUND |
| commit f140053 (GREEN) exists | FOUND |
| 26 Calendar tests pass | PASSED |
| 624 total tests pass | PASSED |
| Build succeeds | PASSED |
