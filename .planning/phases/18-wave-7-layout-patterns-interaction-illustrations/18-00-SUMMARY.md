---
phase: 18
plan: "00"
subsystem: infra
tags: [dnd-kit, tsup, illustrations, build]
dependency_graph:
  requires: []
  provides: ["@dnd-kit packages in node_modules", "src/illustrations/index.ts barrel", "dist/illustrations/index.{js,d.ts}"]
  affects: ["18-01", "18-02", "18-03", "18-04", "18-05", "18-06", "18-07", "18-08", "18-09"]
tech_stack:
  added: ["@dnd-kit/core@6.3.1", "@dnd-kit/sortable@10.0.0", "@dnd-kit/utilities@3.2.2"]
  patterns: ["tsup 4-entry config", "package.json subpath exports"]
key_files:
  created: ["src/illustrations/index.ts"]
  modified: ["tsup.config.ts", "package.json", "package-lock.json"]
decisions:
  - "@dnd-kit installed as production dependencies (not devDependencies) so consumers of DS-80 Sortable have them bundled"
  - "@dnd-kit/react v2 alpha intentionally skipped — different API, forbidden per RESEARCH.md"
  - "src/illustrations/index.ts is a placeholder comment-only file; exports added in 18-03"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-02"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 3
---

# Phase 18 Plan 00: Infra Gate — @dnd-kit + /illustrations Entry Summary

Wave 0 infra gate: @dnd-kit/core@6.3.1 + @dnd-kit/sortable@10.0.0 + @dnd-kit/utilities@3.2.2 installed as prod deps; tsup extended to 4 entries with src/illustrations/index.ts; package.json exports wired for ./illustrations subpath.

## PLAN COMPLETE

### What Was Done

**Task 1 — Install @dnd-kit packages**

Ran `npm install @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 @dnd-kit/utilities@3.2.2`.
All three packages now appear in `package.json` dependencies and resolve from node_modules.

**Task 2 — Add illustrations tsup entry + package.json exports + placeholder index**

1. `tsup.config.ts` entry array extended from 3 to 4 items: `src/illustrations/index.ts` added.
2. `package.json` exports stanza now includes `"./illustrations"` pointing to `dist/illustrations/index.{d.ts,js}`, inserted after `./icons` and before `./tokens.css`.
3. `src/illustrations/index.ts` created as a comment-only placeholder (DS-81 plan 18-03 will populate the 24 named SVG components).
4. `npm run build` confirmed green — `dist/illustrations/index.js` (68 B) and `dist/illustrations/index.d.ts` (13 B) generated.

### Tests Result

```
Test Files  60 passed (60)
      Tests  648 passed (648)
   Duration  6.81s
```

648/648 tests pass. No regressions from @dnd-kit install or tsup config change.

### Build Output

```
ESM dist/illustrations/index.js     68.00 B
DTS dist/illustrations/index.d.ts   13.00 B
ESM ⚡️ Build success in 619ms
DTS ⚡️ Build success in 3787ms
```

### Commit

`bb27f18` — feat(18-00): @dnd-kit install + /illustrations tsup entry

### Issues Encountered

None. The lint-staged biome hook ran on commit and normalised `package.json` formatting (arrays back to single-line); this is expected behaviour and does not affect functionality.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/illustrations/index.ts` exists
- [x] `tsup.config.ts` entry array has 4 items
- [x] `package.json` exports contains `"./illustrations"`
- [x] `dist/illustrations/index.js` exists
- [x] `dist/illustrations/index.d.ts` exists
- [x] All 3 @dnd-kit packages in `package.json` dependencies
- [x] Commit `bb27f18` verified in git log
- [x] 648 tests pass
