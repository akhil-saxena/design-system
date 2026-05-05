---
phase: 017-simple-primitives
plan: "03"
subsystem: ui
tags: [react, typescript, vitest, storybook, relative-time, forwardRef]

requires:
  - phase: 017-01
    provides: ds-atom-relative-time CSS block in primitives.css

provides:
  - RelativeTime component (src/interaction/RelativeTime/index.tsx)
  - 11 unit tests covering all format buckets, prefix, ref, and HTML attributes
  - 7 Storybook stories including DarkMode

affects:
  - 017-04-barrel (needs export line for RelativeTime/RelativeTimeProps)
  - Phase 23 DataGrid (applied-date column consumer)

tech-stack:
  added: []
  patterns:
    - "forwardRef<HTMLTimeElement> with semantic <time> element"
    - "5-bucket relative time format: future/minutes/hours/days/locale-date"
    - "globalThis.setInterval + clearInterval in useEffect for live-update with cleanup"
    - "prefix prop pattern: inline span with CSS custom property color"

key-files:
  created:
    - src/interaction/RelativeTime/index.tsx
    - src/interaction/RelativeTime/RelativeTime.stories.tsx
    - src/interaction/RelativeTime/RelativeTime.test.tsx
  modified: []

key-decisions:
  - "Used globalThis.setInterval (not window.setInterval) for SSR/Node compatibility in tests"
  - "diffMin === 0 maps to '0m ago' per spec — no special 'just now' case"
  - "updateInterval=0 disables live updates — used in DarkMode story to freeze values in docs"
  - "Prefix rendered with trailing space inside the <span> so it visually separates from relative string"

patterns-established:
  - "RelativeTime: semantic <time dateTime={iso} title={locale}> element with computed relative string"
  - "Live-update: useEffect with setInterval keyed on [date, updateInterval] dependencies"

requirements-completed:
  - REQ-17-02

duration: 8min
completed: 2026-05-05
---

# Phase 017 Plan 03: RelativeTime Summary

**RelativeTime forwardRef component on semantic `<time>` with 5-bucket format, setInterval live-updates, prefix prop, and 11 vitest tests all green**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-05T11:49:00Z
- **Completed:** 2026-05-05T11:50:30Z
- **Tasks:** 2 (Task 1: component + tests TDD; Task 2: stories)
- **Files created:** 3

## Accomplishments

- RelativeTime component renders semantic `<time>` element with `dateTime` (ISO) and `title` (locale) attributes
- 5-bucket format function: future "in Nm", <60m "Nm ago", <24h "Nh ago", <30d "Nd ago", else `toLocaleDateString()`
- setInterval live-updates every 60 s (configurable) with proper `clearInterval` cleanup on unmount
- Optional `prefix` prop rendered in `var(--ink-4)` span before relative string
- 11 vitest tests all passing — covers all format branches, HTML attributes, prefix, and ref forwarding
- 7 Storybook stories covering all 5 format buckets, WithPrefix, and DarkMode with frozen values

## Task Commits

1. **Task 1 RED: failing tests** - `de49ea5` (test)
2. **Task 1 GREEN: implement RelativeTime** - `91de70a` (feat)
3. **Task 2: Storybook stories** - `283363e` (feat)

## Files Created/Modified

- `src/interaction/RelativeTime/index.tsx` - RelativeTime component; exports `RelativeTime` and `RelativeTimeProps`
- `src/interaction/RelativeTime/RelativeTime.test.tsx` - 11 unit tests covering all format buckets and HTML attributes
- `src/interaction/RelativeTime/RelativeTime.stories.tsx` - 7 stories: RecentMinutes, RecentHours, RecentDays, OlderThan30Days, Future, WithPrefix, DarkMode

## Decisions Made

- Used `globalThis.setInterval` / `globalThis.clearInterval` instead of `window.*` for compatibility with jsdom test environment and potential SSR contexts
- `diffMin === 0` → `"0m ago"` per spec — no "just now" edge case to keep the format function simple and deterministic
- `updateInterval={0}` in DarkMode story freezes the displayed time string in Storybook docs, preventing stale values on page load
- Prefix trailing space included inside the `<span>` element (not as a text node sibling) to keep the rendered output predictable in tests

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — component renders live computed data from the passed `date` prop with no placeholder values.

## Threat Flags

None — date prop passed to `new Date()` produces `Invalid Date` on bad input (renders "NaN ago"); display-only component with no security surface.

## TDD Gate Compliance

- RED gate commit: `de49ea5` (test(017-03): add failing tests for RelativeTime component)
- GREEN gate commit: `91de70a` (feat(017-03): implement RelativeTime component)
- REFACTOR gate: not required — implementation was clean on first pass

## Next Phase Readiness

- RelativeTime component ready for barrel export in plan 017-04 (or equivalent)
- Requires: `export { RelativeTime, type RelativeTimeProps } from "./interaction/RelativeTime"` added to `src/index.ts`
- No blockers

## Self-Check

- [x] `src/interaction/RelativeTime/index.tsx` — exists, exports RelativeTime and RelativeTimeProps
- [x] `src/interaction/RelativeTime/RelativeTime.test.tsx` — exists, 11 tests all pass
- [x] `src/interaction/RelativeTime/RelativeTime.stories.tsx` — exists, 7 story exports
- [x] Commits de49ea5, 91de70a, 283363e all present in git log

## Self-Check: PASSED

---
*Phase: 017-simple-primitives*
*Completed: 2026-05-05*
