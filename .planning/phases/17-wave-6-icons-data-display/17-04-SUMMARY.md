---
phase: 17-wave-6-icons-data-display
plan: "04"
subsystem: navigation
tags: [primitive, navigation, aria, dropdown-overflow, breadcrumbs, tdd]
dependency_graph:
  requires:
    - "17-01"  # canonical icons subpath (ChevronRight, MoreHorizontal)
  provides:
    - "Breadcrumbs component (DS-69)"
  affects: []
tech_stack:
  added: []
  patterns:
    - "forwardRef<HTMLElement, BreadcrumbsProps> — nav element ref"
    - "DSDropdown with ul[role=menu] for overflow hidden items"
    - "Truncation: first + more-trigger + last (maxVisible-2) items"
key_files:
  created:
    - src/Breadcrumbs.tsx
    - src/Breadcrumbs.stories.tsx
    - src/Breadcrumbs.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "Used ul[role=menu] for the dropdown overflow panel with child <a>/<button> as interactive elements (avoids biome lint/a11y/noNoninteractiveElementToInteractiveRole on li[role=menuitem])"
  - "matchAnchorWidth=false on DSDropdown so the overflow menu can be wider than the small trigger button"
  - "Key for hidden dropdown items uses h.label (not array index) per biome suspicious/noArrayIndexKey"
metrics:
  duration: "~35 minutes"
  completed: "2026-04-29T17:39:42Z"
  tasks_completed: 1
  files_changed: 5
---

# Phase 17 Plan 04: Breadcrumbs (DS-69) Summary

**One-liner:** Breadcrumb nav primitive with `nav+ol` WAI-ARIA structure, `aria-current="page"` on last item, and DSDropdown-based truncation when path exceeds `maxVisible`.

## What Was Built

`Breadcrumbs` is a navigation primitive that renders hierarchical page paths as `<nav aria-label="Breadcrumb"><ol>…</ol></nav>`. When a path exceeds `maxVisible` items (default 4), middle items collapse into a "more" trigger button that opens a `DSDropdown` with `ul[role="menu"]` listing the hidden items.

Key behaviors:
- Items render as `<a href>` when `href` is provided, or `<span>` otherwise
- Last item always receives `aria-current="page"` (on either the `<a>` or `<span>`)
- `ChevronRight` separators appear between items, never after the last
- Truncation layout: `[first] [more-button] [last (maxVisible-2) items]`
- More button: `aria-haspopup="menu"`, `aria-expanded` reflects open state, `aria-label="Show N hidden breadcrumbs"`
- Hidden item links fire `onClick` and close the dropdown

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | 2fda309 | Passed — 18 tests failed (module not found) |
| GREEN (feat) | 10092d8 | Passed — all 18 tests pass |
| REFACTOR | N/A | Not needed |

## Acceptance Criteria — All Passed

| Criterion | Result |
|-----------|--------|
| `src/Breadcrumbs.tsx` exists | PASS |
| `src/Breadcrumbs.stories.tsx` exists | PASS |
| `src/Breadcrumbs.test.tsx` exists | PASS |
| `aria-label={ariaLabel}` present in component | PASS (1 match) |
| `aria-current` present | PASS (3 matches) |
| `DSDropdown` used | PASS (4 matches) |
| `ChevronRight` + `MoreHorizontal` both present | PASS (5 matches) |
| CSS classes (>= 6 non-comment) | PASS (21 matches) |
| Dark mode CSS (`:root.dark .ds-atom-breadcrumbs`) | PASS (5 matches) |
| `Breadcrumbs` in `src/index.ts` | PASS |
| `npm test` exits 0 with 18+ tests passing | PASS (413 total) |
| `npm run typecheck` exits 0 | PASS |
| `npm run build` exits 0 | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed `role="menuitem"` from `<li>` to satisfy biome a11y rules**
- **Found during:** Commit pre-commit hook (biome check)
- **Issue:** `lint/a11y/noNoninteractiveElementToInteractiveRole` fires on `<li role="menuitem">` and `lint/a11y/useFocusableInteractive` requires tabIndex on the role-bearing element
- **Fix:** Removed `role="menuitem"` from `<li>` — the child `<a>` or `<button>` is the actual interactive element. The `<ul role="menu">` container is preserved, maintaining the semantic pairing with `aria-haspopup="menu"` on the trigger button.
- **Files modified:** `src/Breadcrumbs.tsx`
- **Commit:** 10092d8

**2. [Rule 1 - Bug] Fixed `noArrayIndexKey` by using `h.label` as React key**
- **Found during:** Commit pre-commit hook (biome check)
- **Issue:** `lint/suspicious/noArrayIndexKey` on `hidden.map((h, i) => ... key={hidden-${i}}`
- **Fix:** Changed key to `h.label` (labels in a breadcrumb path are unique)
- **Files modified:** `src/Breadcrumbs.tsx`
- **Commit:** 10092d8

**3. [Rule 1 - Bug] Removed unused biome-ignore suppression comments**
- **Found during:** Commit pre-commit hook
- **Issue:** `suppressions/unused` warnings on biome-ignore comments for rules that were no longer triggered after removing `role="menuitem"`
- **Fix:** Removed dead suppression comments
- **Files modified:** `src/Breadcrumbs.tsx`
- **Commit:** 10092d8

## Known Stubs

None — all items render from consumer-supplied `items` array. No hardcoded placeholder data.

## Threat Flags

None — component renders consumer-supplied label strings as JSX text. `href` values pass through to anchor elements (standard React JSX guarantees). No new network endpoints or auth paths introduced.

## Self-Check: PASSED

- `src/Breadcrumbs.tsx` — FOUND
- `src/Breadcrumbs.stories.tsx` — FOUND
- `src/Breadcrumbs.test.tsx` — FOUND
- Commit `2fda309` (RED test) — FOUND in git log
- Commit `10092d8` (GREEN feat) — FOUND in git log
- 413 tests pass — VERIFIED
- typecheck — PASSED
- build — PASSED
