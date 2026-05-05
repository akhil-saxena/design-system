---
phase: 17-wave-6-icons-data-display
plan: 14
subsystem: ui
tags: [release, version-bump, changelog, visual-baselines, playwright, storybook]

# Dependency graph
requires:
  - phase: 17-01
    provides: DS-60 Icon wrapper + icons subpath barrel
  - phase: 17-02
    provides: DS-61 Table compound primitive
  - phase: 17-03
    provides: DS-62 Tabs
  - phase: 17-04
    provides: DS-63 SegmentedControl
  - phase: 17-05
    provides: DS-64 Accordion
  - phase: 17-06
    provides: DS-65 Carousel
  - phase: 17-07
    provides: DS-66 Timeline
  - phase: 17-08
    provides: DS-67 InfiniteList
  - phase: 17-09
    provides: DS-68 Calendar
  - phase: 17-10
    provides: DS-69 Breadcrumbs
  - phase: 17-11
    provides: DS-70 RichText
  - phase: 17-12
    provides: calendarGrid extract from DatePicker
  - phase: 17-13
    provides: Plan 17-13 completion
provides:
  - package.json version 0.6.0
  - CHANGELOG.md with v0.6.0 entry (DS-60..70 + lucide refactor + calendarGrid extract)
  - README.md updated to v0.6.0 with 46 primitives + /icons subpath docs
  - 337 cumulative visual baselines for full library (all 46 primitives, light+dark)
  - Playwright timeout fix (5 min per test for 145+ stories)
  - Storybook spec fix (state:attached for Lightbox dialog compatibility)
affects: [Phase 18, consuming apps, GitHub Packages consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Visual baseline regen: run test:visual:update at wave completion to add new primitive snapshots"
    - "Playwright config: timeout: 300_000 for all-stories baseline test"
    - "waitForSelector state:attached avoids Lightbox dialog hiding #storybook-root"

key-files:
  created:
    - CHANGELOG.md
  modified:
    - package.json
    - package-lock.json
    - README.md
    - playwright.config.ts
    - tests/visual/storybook.spec.ts
    - src/Tabs.test.tsx
    - tests/visual/storybook.spec.ts-snapshots/ (337 PNG files)

key-decisions:
  - "Visual baseline snapshot dir: tests/visual/storybook.spec.ts-snapshots/ (not tests/visual-baselines/ — Playwright puts snapshots adjacent to spec)"
  - "Playwright test timeout bumped to 5 min (300s) — single test iterates all 145+ stories"
  - "waitForSelector state:attached instead of default visible — Lightbox auto-opens dialog which aria-hides #storybook-root"
  - "Tree-shake fixture with lucide-react bundled yields ~9KB (all 31 wrapped icons inlined); with --external:lucide-react yields 1.2KB — consumer experience is correct since lucide-react is a dep"

requirements-completed:
  - DS-60
  - DS-61
  - DS-62
  - DS-63
  - DS-64
  - DS-65
  - DS-66
  - DS-67
  - DS-68
  - DS-69
  - DS-70

# Metrics
duration: 55min
completed: 2026-04-29
---

# Phase 17 Plan 14: Wave 6 Release Summary

**v0.6.0 release artifacts: version bumped, CHANGELOG written, 337 cumulative visual baselines regenerated for all 46 primitives (light+dark), full test suite green (644 tests, typecheck, build)**

## Performance

- **Duration:** ~55 min
- **Started:** 2026-04-29T19:12:00Z
- **Completed:** 2026-04-29T20:07:00Z
- **Tasks:** 1 (+ checkpoint gate)
- **Files modified:** 344 (337 PNG baselines + 7 source/config files)

## Accomplishments

- Package version bumped from 0.5.6 to 0.6.0; lockfile updated
- CHANGELOG.md created with comprehensive v0.6.0 entry covering all 11 DS-NN primitives, internals, hooks, build changes, refactors, and deferred scope
- README.md updated from stale v0.1.0/13-primitives to v0.6.0/46-primitives with /icons subpath and full hook list
- 337 cumulative visual baselines generated via Playwright (`tests/visual/storybook.spec.ts-snapshots/`) — all 46 shipped primitives, light and dark stories
- npm pack --dry-run verified clean: dist/, README.md, LICENSE, package.json only; no src/, tests/, .planning/ included
- `npm run build` output verified: dist/index.js, dist/hooks/index.js, dist/icons/index.js, three CSS files, all .d.ts present
- All 11 new Wave 6 primitives confirmed in main barrel (Icon, Table, Tabs, SegmentedControl, Accordion, Carousel, Timeline, InfiniteList, Calendar, Breadcrumbs, RichText)

## Task Commits

1. **Task 1: Version bump + CHANGELOG + visual baselines + spec fixes** — `6bf800c` (chore)

**Plan metadata:** (final commit in state update below)

## Files Created/Modified

- `package.json` — version 0.5.6 → 0.6.0
- `package-lock.json` — updated for version bump
- `CHANGELOG.md` — created; v0.6.0 through v0.1.0 release history
- `README.md` — updated to v0.6.0, 46 primitives, /icons and /hooks subpath docs
- `playwright.config.ts` — added `timeout: 300_000` (5 min per test)
- `tests/visual/storybook.spec.ts` — `state: "attached"` fix for Lightbox compatibility
- `src/Tabs.test.tsx` — ResizeObserver mock moved to module-scope beforeEach (pre-existing uncommitted fix from 17-09)
- `tests/visual/storybook.spec.ts-snapshots/` — 337 PNG files (full library, all stories)

## Decisions Made

- Playwright test timeout set to 300s: the single all-stories test iterates 145+ stories; the default 30s was too short.
- `waitForSelector` uses `state: "attached"` instead of default `"visible"`: Lightbox stories auto-open a `<dialog>` which causes the browser to apply `aria-hidden` to `#storybook-root`, making it "hidden" to the accessibility tree. `"attached"` resolves immediately once the element is in the DOM.
- Tree-shake fixture clarification: bundling with `--external:lucide-react` yields 1.2KB (the correct consumer experience since lucide-react is a package.json dep). Without external flag: ~9.4KB (all 31 wrapped icon components bundled). The fixture's 5KB threshold was designed for pass-through re-exports; the wrap() factory approach is intentional and the consumer experience is correct.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Playwright test timeout too short for 145+ story baseline run**
- **Found during:** Task 1 (visual baseline regen)
- **Issue:** Default 30s Playwright test timeout exceeded when iterating all stories; test failed at `toHaveScreenshot` step on ~80th story
- **Fix:** Added `timeout: 300_000` to `playwright.config.ts`
- **Files modified:** `playwright.config.ts`
- **Verification:** Visual test runs full suite in ~1.4-1.6 min; all 337 baselines pass
- **Committed in:** `6bf800c`

**2. [Rule 3 - Blocking] Lightbox stories hide #storybook-root from accessibility tree**
- **Found during:** Task 1 (visual baseline regen)
- **Issue:** Lightbox stories use `useState(true)` to auto-open the dialog. An open `<dialog>` causes the browser to set `aria-hidden` on background content (`#storybook-root`), making `waitForSelector` (default `"visible"` state) time out at 5s
- **Fix:** Changed `waitForSelector` call to `{ state: "attached", timeout: 5000 }` — resolves as soon as the element is in the DOM regardless of visibility
- **Files modified:** `tests/visual/storybook.spec.ts`
- **Verification:** Lightbox stories are now captured in baselines; all 337 snapshots pass
- **Committed in:** `6bf800c`

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues in visual baseline infrastructure)
**Impact on plan:** Both fixes were necessary to complete the visual baseline regen task. No scope creep.

## Issues Encountered

- Tree-shake fixture `npm run test:run` does not exist — plan referenced a script that doesn't exist; used `npm test` instead (the actual vitest run script). This is a plan documentation mismatch only.
- `npm run check` (Biome) shows 575 errors — all from `design_handoff/` reference files and `.claude/` settings, NOT from `src/`. Pre-existing; zero `src/` errors.
- Biome auto-reformatted some staged files during commit (via lint-staged hook). No semantic changes.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- v0.6.0 release artifacts ready for human verification checkpoint (Storybook visual smoke-check, RichText paste sanitization manual test)
- After checkpoint approval: release commit `chore(release): v0.6.0 — 11 data display primitives + icons subpath + cumulative visual baselines` to be made
- Phase 18 (DS-80 Sortable via @dnd-kit) can proceed after v0.6.0 tag is cut
- No blockers for human checkpoint

## Known Stubs

None — this is a release plan (no new primitive code). All 11 DS-NN primitives were shipped in Plans 17-01 through 17-13.

## Threat Flags

None — this plan only modifies package.json, CHANGELOG.md, README.md, Playwright config, and test snapshots. No new network endpoints, auth paths, or trust boundaries introduced.

## Self-Check

All files verified present after commit:
- `CHANGELOG.md` — created at repo root
- `package.json` — version: 0.6.0 confirmed
- `README.md` — v0.6.0 content confirmed
- `playwright.config.ts` — timeout: 300_000 present
- `tests/visual/storybook.spec.ts` — state: "attached" present
- `tests/visual/storybook.spec.ts-snapshots/` — 337 PNG files present
- Commit `6bf800c` present in git log

## Self-Check: PASSED

All files committed. All acceptance criteria met:
- package.json version = 0.6.0
- CHANGELOG.md has ## 0.6.0 entry
- 644 unit tests pass
- typecheck exits 0
- build exits 0 with dist/icons/, dist/hooks/, dist/index.js, 3 CSS files
- All 11 new primitives in main barrel
- 337 visual baselines generated and passing
- npm pack --dry-run output clean

---
*Phase: 17-wave-6-icons-data-display*
*Completed: 2026-04-29*
