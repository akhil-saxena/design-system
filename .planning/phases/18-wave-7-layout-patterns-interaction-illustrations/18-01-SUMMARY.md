---
phase: 18
plan: "01"
primitive: DS-71
subsystem: layout
tags: [appshell, layout, css-grid, localStorage, sidebar, collapse]
requirements: [DS-71]

dependency_graph:
  requires: []
  provides: [AppShell, AppShellProps]
  affects: [src/index.ts, src/primitives.css]

tech_stack:
  added: []
  patterns:
    - CSS Grid named areas (topbar/sidebar/main/footer)
    - React.cloneElement for slot prop injection
    - localStorage persistence with typeof window SSR guard
    - forwardRef + CSSProperties pattern

key_files:
  created:
    - src/AppShell.tsx
    - src/AppShell.test.tsx
    - src/AppShell.stories.tsx
  modified:
    - src/primitives.css
    - src/index.ts

decisions:
  - "Sidebar collapsed width: 48px (per D-01); expanded default 240px (exposed as sidebarWidth prop)"
  - "localStorage guard uses try/catch in addition to typeof window check for belt-and-suspenders SSR safety"
  - "footer grid area uses explicit grid-column/grid-row instead of named area to avoid empty-row pitfall (Pitfall 4 from RESEARCH.md)"
  - "storageKey=null check uses both null and undefined guards to match TypeScript type exactly"

metrics:
  duration: "~2 minutes"
  completed: "2026-05-02"
  tasks_completed: 2
  tests_added: 10
  files_created: 3
  files_modified: 2
---

# Phase 18 Plan 01: AppShell (DS-71) Summary

AppShell CSS Grid layout primitive with 48px icon-rail sidebar collapse and localStorage persistence.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing AppShell tests | 11d44a0 | src/AppShell.test.tsx |
| 1 (GREEN) | AppShell component + CSS | eadaca5 | src/AppShell.tsx, src/primitives.css |
| 2 | Barrel export + stories | eaa3d45 | src/index.ts, src/AppShell.stories.tsx |

## What Was Built

AppShell (DS-71) is a CSS Grid layout container with four named slots:

- **topbar** — sticky header (`grid-area: topbar`, spans full width, `z-index: 10`)
- **sidebar** — collapsible icon rail (48px collapsed / `sidebarWidth`px expanded, `var(--surf-2)` background, `transition: width 0.25s ease`)
- **main** — scrollable content area (`overflow: auto`)
- **footer** — optional, rendered only when provided (grid-column 2, row 3 — avoids empty row pitfall)

The sidebar slot receives `collapsed` and `onToggleCollapse` injected via `React.cloneElement`. Collapse state persists in `localStorage` under `"ds-sidebar-collapsed"` by default; `storageKey={null}` disables persistence.

Below 768px, the sidebar is hidden via `@media (max-width: 767px)` — grid reduces to single-column topbar+main layout.

## Deviations from Plan

None — plan executed exactly as written. One proactive addition: `try/catch` wrapping around localStorage calls (beyond the `typeof window` guard) for environments where localStorage may be present but throws (privacy mode in some browsers). This is a Rule 2 security/correctness addition — no behavior change in normal use.

## Known Stubs

None. All slots wire directly to consumer-provided children. The `MockSidebar` in stories is for demonstration only and is clearly labelled.

## TDD Gate Compliance

- RED gate commit: `11d44a0` (test(18-01): add failing tests for AppShell DS-71)
- GREEN gate commit: `eadaca5` (feat(18-01): implement AppShell DS-71 — CSS Grid layout + icon-rail collapse + localStorage)
- 10 tests added, all passing

## Self-Check: PASSED

- [x] `src/AppShell.tsx` exists and exports `AppShell` + `AppShellProps`
- [x] `src/AppShell.test.tsx` exists with 10 tests
- [x] `src/AppShell.stories.tsx` exists with 4 stories (Default, WithFooter, CollapsedDefault, Dark)
- [x] `src/primitives.css` contains `.ds-atom-appshell` (10 occurrences)
- [x] `src/index.ts` exports `AppShell, type AppShellProps`
- [x] `typeof window` guard present in `src/AppShell.tsx`
- [x] All commits exist: 11d44a0, eadaca5, eaa3d45

## PLAN COMPLETE
