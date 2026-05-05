---
phase: 017-simple-primitives
plan: "02"
subsystem: inputs
tags: [kbd, component, tdd, storybook]
dependency_graph:
  requires: ["017-01"]
  provides: ["Kbd component", "KbdProps", "KbdSize"]
  affects: []
tech_stack:
  added: []
  patterns: ["forwardRef<HTMLElement>", "inline-style size map", "TDD RED/GREEN"]
key_files:
  created:
    - src/inputs/Kbd/index.tsx
    - src/inputs/Kbd/Kbd.stories.tsx
    - src/inputs/Kbd/Kbd.test.tsx
  modified: []
decisions:
  - "Used HTMLElement (not HTMLKbdElement) for forwardRef type — no DOM type exists for kbd"
  - "Size styles stored as Record<KbdSize, CSSProperties> mirroring Badge toneStyles pattern"
metrics:
  duration: "~2 minutes"
  completed: "2026-05-05"
  tasks_completed: 2
  files_created: 3
---

# Phase 017 Plan 02: Kbd Component + Stories + Tests Summary

Semantic `<kbd>` keyboard-label primitive with two size variants (sm/md), forwardRef, and 6 Storybook stories including DarkMode.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Add failing tests for Kbd | 992e2da | src/inputs/Kbd/Kbd.test.tsx |
| 1 (GREEN) | Implement Kbd component | 012e4d2 | src/inputs/Kbd/index.tsx |
| 2 | Add Kbd Storybook stories | 54786af | src/inputs/Kbd/Kbd.stories.tsx |

## Implementation Details

**index.tsx** — `forwardRef<HTMLElement, KbdProps>` pattern; renders `<kbd>` with `className="ds-atom-kbd"`. Size variants via `sizeStyles` record: `sm` overrides fontSize to 9.5 and padding to `"1px 5px"`, `md` is empty (falls through to baseStyle). Custom `className` prop is appended after the base class. Rest props spread to `<kbd>` element.

**Kbd.stories.tsx** — 6 stories: Default (args-driven), ModifierKeys (flex-wrap grid of 12 symbols), Combinations (3 key-combo rows), SmSize (same grid with `size="sm"`), InlineInText (prose context), DarkMode (dark decorator with modifier grid + one combo row).

**Kbd.test.tsx** — 8 unit tests covering element type, base className, children text, size="md" fontSize, size="sm" fontSize, ref forwarding, rest-prop spread (data-testid), and custom className merging.

## TDD Gate Compliance

- RED gate: commit `992e2da` — test file added, all 8 tests failed (module not found)
- GREEN gate: commit `012e4d2` — component implemented, all 8 tests pass
- REFACTOR gate: not needed (implementation was clean as specified)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. Kbd is a pure display primitive; no network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- src/inputs/Kbd/index.tsx: FOUND
- src/inputs/Kbd/Kbd.test.tsx: FOUND
- src/inputs/Kbd/Kbd.stories.tsx: FOUND
- Commit 992e2da: FOUND (test RED)
- Commit 012e4d2: FOUND (feat GREEN)
- Commit 54786af: FOUND (feat stories)
- All 8 vitest tests: PASSED
