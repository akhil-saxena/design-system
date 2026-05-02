---
phase: 18
plan: "03"
primitive: DS-81
subsystem: illustrations
tags: [illustrations, svg, react, dark-mode, tree-shaking]
dependency_graph:
  requires: [18-00]
  provides: [DS-81 illustrations subpath]
  affects: [dist/illustrations/index.js, dist/illustrations/index.d.ts]
tech_stack:
  added: []
  patterns: [inline-svg-react-components, css-custom-property-dark-mode]
key_files:
  created:
    - src/illustrations/index.tsx
    - src/illustrations/index.test.tsx
    - src/illustrations/index.stories.tsx
  modified:
    - src/primitives.css
    - tsup.config.ts
decisions:
  - "D-06 (locked): Inline SVG React components — same pattern as /icons subpath"
  - "D-07 (locked): Accent colours per illustration allowed — var(--blue), var(--red) kept as-is"
  - "D-08 (locked): All 24 illustrations ship"
  - "D-09 (locked): width + height props, default 120x120"
  - "D-10 (locked): Dark mode — #fff → var(--cream); ground ellipses use --ds-illust-shadow token"
  - "Auto-fix: renamed index.ts → index.tsx — TypeScript requires .tsx for JSX syntax"
metrics:
  duration: "12 minutes"
  completed: "2026-05-02T10:41:08Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 18 Plan 03: DS-81 Illustrations Subpath Summary

**One-liner:** 24 inline-SVG React illustration components with dark-mode CSS token, all-cream fills, and full viewBox/aria conformance.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Convert all 24 illustrations to TypeScript React components | 3884d22 | Done |
| 2 | Illustrations smoke tests + stories | 3884d22 | Done |

## What Was Built

`src/illustrations/index.tsx` exports 24 named React components from the design handoff switch-case JSX. Each component:

- `viewBox="0 0 120 90"`, `aria-hidden="true"`
- Accepts `{ width = 120, height = 120, className, style }`
- All `fill="#fff"` / `stroke="#fff"` replaced with `var(--cream)` for dark-mode compatibility
- Ground ellipses use `fill="var(--ds-illust-shadow, rgba(0,0,0,.06))"` — flips to `rgba(255,255,255,.06)` in `.dark` scope
- Expressive accents (`var(--blue)`, `var(--red)`) kept as-is per D-07

**Named exports (24):** MailSent, Documents, Rocket, Celebrate, Lightbulb, Idea, IllustrationSearch, Plant, Cloud, EmptyBox, ConnectionLost, IllustrationError, Inbox, GraphUp, Chart, CalendarEvent, Team, Thinking, Lock, Puzzle, Workflow, Travel, IllustrationSuccess, PhoneScreen

**Naming conflicts resolved:**
- `search` → `IllustrationSearch` (avoids conflict with lucide Search icon)
- `error` → `IllustrationError` (avoids conflict with JS Error built-in)
- `success` → `IllustrationSuccess` (disambiguates from status semantics)

## Verification Results

- TypeScript: clean (0 errors)
- Tests: 49/49 pass — 24 render tests (viewBox + aria-hidden), 24 prop tests (width/height), 1 count test
- Build: `dist/illustrations/index.js` + `dist/illustrations/index.d.ts` generated
- `grep 'fill="#fff"' src/illustrations/index.tsx` → 0 matches
- `grep ds-illust-shadow src/primitives.css` → token present in `.dark` scope

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed index.ts → index.tsx for JSX compatibility**
- **Found during:** Task 1
- **Issue:** Plan specified `src/illustrations/index.ts` but TypeScript requires `.tsx` extension for files containing JSX syntax. TSC reported parse errors on every `<svg>` element.
- **Fix:** Renamed file to `index.tsx`; updated `tsup.config.ts` entry from `src/illustrations/index.ts` to `src/illustrations/index.tsx`
- **Files modified:** `tsup.config.ts`
- **Impact:** `dist/illustrations/index.js` output path unchanged; package.json exports unchanged

**2. [Rule 1 - Bug] Replaced forEach with for...of in test file**
- **Found during:** Task 2 (pre-commit Biome hook)
- **Issue:** Biome `noForEach` lint rule rejects `.forEach()` in test loops
- **Fix:** Replaced `ALL_ILLUSTRATIONS.forEach(...)` with `for (const Illust of ALL_ILLUSTRATIONS)` — semantically identical
- **Files modified:** `src/illustrations/index.test.tsx`
- **Commit:** 3884d22

## Known Stubs

None — all 24 illustrations are fully wired with their SVG paths from the design handoff.

## Threat Flags

None — static decorative SVGs with no user input; `aria-hidden="true"` on all elements as designed.

## Self-Check: PASSED

- [x] `src/illustrations/index.tsx` exists
- [x] `src/illustrations/index.test.tsx` exists
- [x] `src/illustrations/index.stories.tsx` exists
- [x] commit `3884d22` exists in git log
- [x] `dist/illustrations/index.js` exists
- [x] `dist/illustrations/index.d.ts` exists
- [x] 0 `#fff` fill/stroke attributes remain in index.tsx
- [x] `--ds-illust-shadow` token present in primitives.css
- [x] 49 tests pass
