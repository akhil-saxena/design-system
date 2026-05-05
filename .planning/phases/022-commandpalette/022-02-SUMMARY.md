---
phase: 022-commandpalette
plan: "02"
subsystem: overlays/CommandPalette (component)
tags: [overlay, command-palette, react, tdd, keyboard-nav]
requires:
  - .ds-atom-cmd-* CSS classes (Plan 022-01)
  - src/_internals/DSPortal
  - src/hooks/useFocusTrap
  - src/inputs/Kbd
  - src/primitives.css (for ds-atom-modal-backdrop reuse)
provides:
  - CommandPalette controlled overlay component
  - CommandPaletteProps, CommandPaletteItem types
affects:
  - src/index.ts (Wave 3 — barrel export)
  - src/overlays/CommandPalette/CommandPalette.stories.tsx (Wave 3)
tech-stack:
  added: []
  patterns:
    - DSPortal + callback-ref-as-state useFocusTrap pattern
    - Document-level keydown listener gated on `open`
    - useMemo substring filter
    - Reused .ds-atom-modal-backdrop with inline alignItems:flex-start + paddingTop:15vh
    - Plan-level TDD (RED → GREEN commits)
key-files:
  created:
    - src/overlays/CommandPalette/index.tsx
    - src/overlays/CommandPalette/CommandPalette.test.tsx
  modified: []
decisions:
  - ArrowUp before any selection stays at -1 (no selection) — diverged from plan's "clamp at 0" wording so the user must opt into navigation by pressing ArrowDown first; matches the test contract
  - Component renders sub-elements with the CSS-aligned class names .ds-atom-cmd-search and .ds-atom-cmd-list (plan body had .ds-atom-cmd-input-wrap and .ds-atom-cmd-body which have no styles in primitives.css — see Deviations)
  - aria-selected mirrored on data-active for items so styling and screen-reader semantics agree
  - Backdrop reuse over a custom .ds-atom-cmd-overlay class — keeps the scrim style consistent with Modal/ConfirmDialog
metrics:
  duration: ~10 min
  completed: 2026-05-05
---

# Phase 022 Plan 02: CommandPalette Component Summary

Shipped the CommandPalette controlled overlay (search input + filtered grouped list + ArrowUp/Down/Enter keyboard nav + DSPortal + focus trap) plus 12 unit tests. Followed plan-level TDD with separate RED and GREEN commits.

## What Shipped

A fully controlled overlay (`open` + `onClose` props) that DSPortal-mounts a focus-trapped panel over a reused `.ds-atom-modal-backdrop` scrim. Substring-filters items by label, groups them under headers in original insertion order, and supports keyboard navigation that clamps at list boundaries (no wrap). Items with `shortcut` render an inline `<Kbd size="sm">`.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1a (RED) | Add 12 failing unit tests | `aaa19f2` | src/overlays/CommandPalette/CommandPalette.test.tsx |
| 1b (GREEN) | Implement CommandPalette component | `5e08dc6` | src/overlays/CommandPalette/index.tsx |

## Verification

| Check | Expected | Actual |
|-------|----------|--------|
| `vitest run src/overlays/CommandPalette` | 12 pass | 12 pass |
| `tsc --noEmit` | exits 0 | exits 0 |
| `grep -c "DSPortal\|useFocusTrap" index.tsx` | ≥2 | 6 |
| `grep -c "ds-atom-modal-backdrop" index.tsx` | 1 | 1 |
| Component exports | CommandPalette, CommandPaletteProps, CommandPaletteItem | all 3 exported |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 – Bug] ArrowUp behavior mismatch between plan prose and test contract**
- **Found during:** Task 1 GREEN (vitest run)
- **Issue:** Plan prose said "ArrowUp → clamp activeIndex-1 to 0", but the test "ArrowUp clamps at 0 (no wrap)" expected zero items to have `data-active="true"` after pressing ArrowUp from the initial closed state. With `Math.max(0, i - 1)` and `i = -1`, the next state is `0`, so item 0 becomes active — violating the test.
- **Fix:** Changed reducer to `i <= 0 ? i : i - 1` so ArrowUp from `-1` stays at `-1` (no selection) and from `0` stays at `0` (clamp). User must press ArrowDown to enter the list — matches the test contract and feels right UX-wise.
- **Files modified:** src/overlays/CommandPalette/index.tsx
- **Commit:** `5e08dc6` (folded into the GREEN commit)

**2. [Rule 1 – Bug] Mismatched class names between plan code and shipped CSS**
- **Found during:** Task 1 GREEN (planning review before implementation)
- **Issue:** Plan's `<action>` snippet used class names `.ds-atom-cmd-input-wrap` and `.ds-atom-cmd-body` for the input row and the scrollable list container. However, Plan 022-01 shipped `.ds-atom-cmd-search` and `.ds-atom-cmd-list` (with proper styling). Using the unstyled names would render the panel without padding, dividers, or scrolling.
- **Fix:** Component renders `.ds-atom-cmd-search` and `.ds-atom-cmd-list` to match the shipped CSS atoms.
- **Files modified:** src/overlays/CommandPalette/index.tsx
- **Commit:** `5e08dc6`

**3. [Rule 2 – Missing functionality] aria-selected on items**
- **Found during:** Task 1 GREEN (a11y review)
- **Issue:** Plan only specified `data-active` for styling. The CSS atom however targets `[aria-selected="true"]` for the active background, and screen readers need `aria-selected` to announce keyboard navigation through a listbox.
- **Fix:** Mirrored `aria-selected={isActive ? "true" : undefined}` alongside `data-active` on each item button.
- **Files modified:** src/overlays/CommandPalette/index.tsx
- **Commit:** `5e08dc6`

## Authentication Gates

None — pure client-side React component.

## TDD Gate Compliance

| Gate | Status | Commit |
|------|--------|--------|
| RED  | Tests added, all failed (import resolution) | `aaa19f2` |
| GREEN | Component implemented, all 12 tests pass | `5e08dc6` |
| REFACTOR | Skipped — no cleanup needed beyond GREEN | — |

## Self-Check: PASSED

- File `src/overlays/CommandPalette/index.tsx` exists with 232 lines.
- File `src/overlays/CommandPalette/CommandPalette.test.tsx` exists with 12 tests.
- Commit `aaa19f2` (RED) exists in `git log`.
- Commit `5e08dc6` (GREEN) exists in `git log`.
- `npx tsc --noEmit` exits 0.
- `npx vitest run src/overlays/CommandPalette` reports 12/12 passing.
