---
phase: 18
plan: "08"
primitive: DS-80
subsystem: interaction/dnd
tags: [sortable, dnd-kit, drag-and-drop, cross-list, keyboard, reduced-motion]
dependency_graph:
  requires: [18-06, 18-07]
  provides: [DS-80]
  affects: [src/index.ts, src/primitives.css]
tech_stack:
  added: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
  patterns: ["DndContext + SortableContext", "context sentinel for parent detection", "DragOverlay ghost prevention"]
key_files:
  created:
    - src/Sortable.tsx
    - src/Sortable.test.tsx
    - src/Sortable.stories.tsx
  modified:
    - src/index.ts
    - src/primitives.css
decisions:
  - "ul/li semantic elements instead of div+role — biome lint/a11y/useSemanticElements enforces this"
  - "SortableDndCtx context sentinel: createContext<boolean>(false) — Sortable reads it to skip own DndContext"
  - "Drop indicator driven by overId state — not hard-coded false; ensures D-14 amber line renders correctly"
  - "T-18-08-02 arrayMove index guard: findIndex === -1 returns early before arrayMove call"
metrics:
  completed: "2026-05-02"
  tasks: 2
  tests: 16
  files_created: 3
  files_modified: 2
  lines_written: 742
---

# Phase 18 Plan 08: Sortable (DS-80) Summary

**One-liner:** @dnd-kit/core + @dnd-kit/sortable list reorder with amber drop indicator, SortableDndContext for cross-list drag, and useReducedMotion gate.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sortable + SortableItem + SortableDndContext (TDD) | 2581c54 (RED), 4edbf51 (GREEN) | src/Sortable.tsx, src/Sortable.test.tsx, src/primitives.css |
| 2 | Barrel export + stories | 2d8b3e0 | src/index.ts, src/Sortable.stories.tsx |

## What Was Built

### Sortable.tsx (243 lines)

Three exported components:

**`SortableItem`** — Individual draggable item using `useSortable`. Guards `CSS.Transform.toString(transform)` with `?? undefined` (avoids undefined return when transform is null). When `reducedMotion=true`, both `transform` and `transition` are `undefined` — instant repositioning.

**`SortableDndContext`** — Shared DndContext wrapper for cross-list drag (D-12). Provides `SortableDndCtx.Provider value={true}` so nested `Sortable` instances detect the parent context and skip creating their own DndContext. Calls `onMove(activeId, overId, activeListId, overListId)` on DragEnd when `active.id !== over.id`. Reads `data.current.sortable.containerId` from @dnd-kit's sortable data to identify which list each item belongs to.

**`Sortable`** — Self-contained list. In standalone mode: owns a DndContext, tracks `activeId` + `overId` state, renders drop indicator when `overId === item.id`. In nested mode (`useContext(SortableDndCtx) === true`): renders `SortableContext` only (parent owns DndContext). `DragOverlay` present in both modes to prevent HTML5 ghost drag image.

### CSS additions (primitives.css)

`.ds-atom-sortable` — flex column list container.  
`.ds-atom-sortable-item` — `cursor: grab`, `user-select: none`, amber 3px focus ring on `:focus-visible`.  
`.ds-atom-sortable-item[data-dragging="true"]` — amber 3px ring + `cursor: grabbing`.  
`.ds-atom-sortable-indicator` — 1px `var(--amber)` horizontal line (D-14 drop indicator).  
`.ds-atom-sortable-overlay` — `pointer-events: none` for DragOverlay wrapper.

### Stories (258 lines)

- `SingleList` — 5 task items, stateful reorder
- `CrossList` — Two lists (To Do / Done) inside `SortableDndContext`; items drag between columns
- `ReducedMotion` — Documents no-transition behavior
- `Dark` — List wrapped in `.dark` container

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug / Biome lint] Replaced `div role="list"` and `div role="listitem"` with `ul` and `li`**
- **Found during:** Task 1 commit (pre-commit hook failure)
- **Issue:** Biome `lint/a11y/useSemanticElements` requires native `<ul>` / `<li>` instead of ARIA role overrides on `<div>`
- **Fix:** Changed `<div role="list">` to `<ul>` and `<div role="listitem">` to `<li style={{ listStyle:"none", padding:0, margin:0 }}>`. Updated test selectors from `[role="list"]` / `[role="listitem"]` to `ul.ds-atom-sortable` / `ul.ds-atom-sortable > li`.
- **Files modified:** src/Sortable.tsx, src/Sortable.test.tsx
- **Commits:** 4edbf51 (re-committed after fix)

## Test Results

16 tests, all passing:

| # | Test | Status |
|---|------|--------|
| 1 | Renders all items from items prop | PASS |
| 2 | Renders a ul list container | PASS |
| 3 | Renders li items for each item | PASS |
| 4 | SortableItem renders children content | PASS |
| 5 | ds-atom-sortable class on container | PASS |
| 6 | ds-atom-sortable-item class on each item | PASS |
| 7 | Items with reducedMotion=true have no transform style | PASS |
| 8 | data-list-id set when id prop provided | PASS |
| 9 | Drop indicator does NOT render when overId is null | PASS |
| 10 | className prop applied to container | PASS |
| 11 | Renders empty list when items is empty array | PASS |
| 12 | SortableDndContext renders children without error | PASS |
| 13 | Cross-list — two Sortable lists render inside SortableDndContext | PASS |
| 14 | arrayMove correctly reorders items array | PASS |
| 15 | SortableDndContext accepts onMove as required prop | PASS |
| 16 | Sortable renders with style prop applied to container | PASS |

## TDD Gate Compliance

- RED gate commit: `2581c54` — `test(18-08): add failing tests for Sortable DS-80`
- GREEN gate commit: `4edbf51` — `feat(18-08): implement Sortable DS-80 component`

## Known Stubs

None — all functionality is wired. `onReorder` and `onMove` are consumer-provided callbacks; component does not stub them internally.

## Threat Flags

No new network endpoints, auth paths, or file access patterns introduced. DnD operates entirely in client memory. No threat flags beyond what the plan's STRIDE register already covers.

## Self-Check: PASSED

- [x] src/Sortable.tsx exists and is 243 lines
- [x] src/Sortable.test.tsx exists and is 241 lines (>= 60 line minimum)
- [x] src/Sortable.stories.tsx exists
- [x] src/index.ts exports SortableDndContext
- [x] src/primitives.css contains .ds-atom-sortable-indicator
- [x] Commits 2581c54, 4edbf51, 2d8b3e0 all exist in git log
- [x] 16/16 tests pass
- [x] TypeScript clean (tsc --noEmit exits 0)

---

## PLAN COMPLETE

**Plan:** 18-08
**Tasks:** 2/2
**Tests:** 16 passing

**Commits:**
- `2581c54` test(18-08): add failing tests for Sortable DS-80
- `4edbf51` feat(18-08): implement Sortable DS-80 component
- `2d8b3e0` feat(18-08): Sortable barrel export + stories

**Duration:** ~15 minutes
