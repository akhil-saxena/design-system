---
phase: 17-wave-6-icons-data-display
plan: "00"
subsystem: build-infra
tags: [build, tsup, package-json, playwright, hooks, checkbox, dependencies]
dependency_graph:
  requires: []
  provides:
    - tsup multi-entry build (src/icons/index.ts → dist/icons/)
    - package.json ./icons subpath export
    - sideEffects: ['*.css'] declaration
    - lucide-react ^1.14.0
    - "@tiptap/* ^3.22.5 (6 packages)"
    - Checkbox.indeterminate prop
    - useReducedMotion hook
    - useMatchMedia hook
    - Playwright storybook spec runner
    - tree-shake verification harness
  affects:
    - Plan 17-01 (icons barrel — uses src/icons/index.ts placeholder + ./icons export)
    - Plan 17-08 (Carousel — uses useReducedMotion)
    - Plan 17-11 (Table — uses Checkbox.indeterminate)
    - Plan 17-12 (Calendar — uses useMatchMedia)
    - All Phase 17 plans (visual baselines via storybook.spec.ts)
tech_stack:
  added:
    - lucide-react@1.14.0
    - "@tiptap/react@3.22.5"
    - "@tiptap/starter-kit@3.22.5"
    - "@tiptap/extension-link@3.22.5"
    - "@tiptap/extension-placeholder@3.22.5"
    - "@tiptap/extension-underline@3.22.5"
    - "@tiptap/pm@3.22.5"
  patterns:
    - tsup multi-entry array (src/index.ts + src/hooks/index.ts + src/icons/index.ts)
    - package.json subpath exports with ./icons block
    - DOM property set via useEffect + useComposedRefs (Checkbox.indeterminate)
    - matchMedia hook pattern with SSR guard + change listener cleanup
key_files:
  created:
    - src/icons/index.ts (placeholder barrel — populated in Plan 17-01)
    - src/hooks/useReducedMotion.ts
    - src/hooks/useReducedMotion.test.tsx
    - src/hooks/useMatchMedia.ts
    - src/hooks/useMatchMedia.test.tsx
    - tests/visual/storybook.spec.ts
    - tests/treeshake/main.ts
    - tests/treeshake/README.md
  modified:
    - tsup.config.ts (added src/icons/index.ts entry + TipTap externals)
    - package.json (./icons export, sideEffects, lucide bump, TipTap deps)
    - src/Checkbox.tsx (added indeterminate prop + useEffect DOM setter)
    - src/Checkbox.test.tsx (added 2 indeterminate tests)
    - src/hooks/index.ts (appended useMatchMedia + useReducedMotion exports)
decisions:
  - "Used useComposedRefs + inner useRef pattern in Checkbox to set indeterminate imperatively while preserving forwarded ref"
  - "Used Object.defineProperty(globalThis, 'matchMedia', ...) in tests because jsdom does not implement window.matchMedia"
  - "Biome reformatted storybook.spec.ts and Checkbox.test.tsx on commit (inline filter chain); accepted as correct"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-29"
  tasks_completed: 2
  tasks_total: 2
  files_created: 8
  files_modified: 5
---

# Phase 17 Plan 00: Wave-0 Infrastructure Summary

**One-liner:** tsup multi-entry + ./icons subpath + lucide 1.14 + TipTap 3.22.5 + Checkbox.indeterminate + useReducedMotion + useMatchMedia + Playwright spec runner installed.

## What Was Built

### Task 1: Build infrastructure

- `tsup.config.ts` updated: added `src/icons/index.ts` as third entry; expanded `external` array to include `lucide-react` and all 6 `@tiptap/*` packages (prevents TipTap's 23-package tree from being inlined into the bundle).
- `package.json` updated:
  - New `./icons` export block (mirrors `./hooks` pattern, placed before CSS exports)
  - `"sideEffects": ["*.css"]` added at top level (prevents bundlers tree-shaking CSS imports)
  - `lucide-react` bumped from `^1.8.0` to `^1.14.0`
  - 6 TipTap packages added at `^3.22.5`: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-underline`, `@tiptap/pm`
- `src/icons/index.ts` created as placeholder (`export {}`) so `npm run build` succeeds before Plan 17-01 populates the barrel.
- Build verified: `dist/icons/index.{js,d.ts}` emitted; `dist/hooks/index.js` and `dist/index.js` continue to be emitted (no regression).

### Task 2: Spec runner, hooks, Checkbox extension

- `tests/visual/storybook.spec.ts`: Playwright test that hits `localhost:6006/index.json`, enumerates all story entries, navigates to each `iframe.html?id=...` URL, and calls `toHaveScreenshot()`. Requires Storybook running (playwright.config.ts `webServer` handles this automatically).
- `tests/treeshake/main.ts` + `README.md`: esbuild fixture for post-Plan-01 bundle size verification (threshold: < 5 KB minified for a single-icon import).
- `src/Checkbox.tsx`: Added `indeterminate?: boolean` prop. Uses `useComposedRefs(innerRef, forwardedRef)` to compose refs; `useEffect` sets `innerRef.current.indeterminate = !!indeterminate` imperatively (HTML spec: `indeterminate` is a DOM property, not an attribute).
- `src/Checkbox.test.tsx`: 2 new tests verify `input.indeterminate` DOM property reflects the prop value.
- `src/hooks/useReducedMotion.ts`: Reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches`; subscribes to `change` events; SSR-safe (`typeof window === 'undefined'` guard).
- `src/hooks/useMatchMedia.ts`: Generic matchMedia subscriber (query is consumer-supplied); same SSR guard + change listener pattern; syncs once in effect to handle query changes between mount and effect run.
- Tests for both hooks use `Object.defineProperty(globalThis, 'matchMedia', ...)` since jsdom does not implement `window.matchMedia`.
- `src/hooks/index.ts`: Appended `useMatchMedia` and `useReducedMotion` exports (alphabetical order maintained).

## Commits

| Hash | Message |
|------|---------|
| `0f166ea` | feat(17-00): Wave-0 build infra — tsup multi-entry + icons subpath + lucide 1.14 + TipTap 3.22.5 |
| `e4501c9` | feat(17-00): Playwright spec + tree-shake harness + Checkbox indeterminate + useReducedMotion + useMatchMedia |

## Verification Results

- `npm run build`: exits 0; emits `dist/icons/`, `dist/hooks/`, `dist/index.js`
- `npm test`: 356 tests pass (0 failures); includes 2 new Checkbox + 2 useReducedMotion + 3 useMatchMedia tests
- `npm run typecheck`: exits 0 (no type regressions)
- `npx playwright test --list`: reports 1 test from `tests/visual/storybook.spec.ts`
- lucide-react: 1.14.0 installed
- All 6 @tiptap/* packages: 3.22.5 installed

## Deviations from Plan

**1. [Rule 3 - Blocking] `npm run test:run` script does not exist**

- **Found during:** Task 2 verify step
- **Issue:** Plan's `<verify>` block references `npm run test:run` but package.json only has `npm run test` (vitest run). No `test:run` script exists.
- **Fix:** Used `npm test` (equivalent) for all test verification. All tests pass.
- **Impact:** Zero — same test runner, same results. No test was skipped.

**2. [Rule 2 - Style] `window` vs `globalThis` in test mocks**

- **Found during:** Task 2 — IDE diagnostic after writing useReducedMotion.test.tsx
- **Issue:** `Object.defineProperty(window, ...)` triggers Biome/TS warning S7764 ("Prefer globalThis over window")
- **Fix:** Changed to `Object.defineProperty(globalThis, 'matchMedia', ...)` in both hook test files.

## Known Stubs

- `src/icons/index.ts`: Contains only `export {}` — intentional placeholder. Plan 17-01 populates this with lucide-react icon re-exports. The `./icons` subpath export and tsup entry are wired; only the barrel content is deferred.

## Threat Surface

No new network endpoints, auth paths, or file access patterns introduced. Supply-chain threat T-17-00-01 addressed by pinning at `^MAJOR.MINOR` (lucide-react ^1.14.0, @tiptap/* ^3.22.5) with package-lock.json committing exact resolutions. Build-bloat threat T-17-00-02 addressed by explicit tsup `external` array covering all TipTap packages.

## Self-Check: PASSED

- `src/icons/index.ts`: FOUND
- `src/hooks/useReducedMotion.ts`: FOUND
- `src/hooks/useMatchMedia.ts`: FOUND
- `tests/visual/storybook.spec.ts`: FOUND
- `tests/treeshake/main.ts`: FOUND
- Commit `0f166ea`: FOUND
- Commit `e4501c9`: FOUND

## Next Steps

Plan 17-01 (Icons barrel) can now proceed:
- `src/icons/index.ts` placeholder is in place — replace `export {}` with named re-exports from `lucide-react`
- `tests/treeshake/main.ts` is staged — run the esbuild size assertion during Plan 01 verification
- The `./icons` subpath resolves from `dist/icons/index.js` once tsup builds the populated barrel
