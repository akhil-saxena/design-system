---
phase: 17-wave-6-icons-data-display
plan: "09"
subsystem: primitives
tags: [primitive, tabs, aria, dropdown-overflow, resize-observer, tdd]
dependency_graph:
  requires:
    - src/_internals/DSDropdown.tsx
    - src/icons/index.ts
  provides:
    - src/Tabs.tsx (Tabs primitive DS-62)
  affects:
    - src/primitives.css (Tabs CSS block appended)
    - src/index.ts (Tabs barrel export appended)
tech_stack:
  added:
    - ResizeObserver (native browser API, first use in this repo)
  patterns:
    - WAI-ARIA tab pattern (tablist/tab/tabpanel)
    - DSDropdown consumer pattern (matching Select.tsx wiring)
    - forwardRef compound primitive
    - TDD (RED test commit → GREEN implementation commit)
key_files:
  created:
    - src/Tabs.tsx
    - src/Tabs.stories.tsx
    - src/Tabs.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "Used div[role=menuitem] instead of li[role=menuitem] in overflow menu (Biome lint/a11y/noNoninteractiveElementToInteractiveRole rejects li+menuitem — div is semantically equivalent for a non-list overflow menu)"
  - "biome-ignore lint/a11y/noNoninteractiveTabindex on tabpanel div — WAI-ARIA APG mandates tabIndex=0 on tabpanel so keyboard users can Tab into panel content; Biome does not recognise role=tabpanel as interactive"
  - "ResizeObserver mock uses vi.fn() as constructor (not vi.fn().mockImplementation) to satisfy jsdom's new ResizeObserver() call pattern"
  - "All 21 tests (Task 1 ARIA/keyboard/variants + Task 2 overflow) implemented in a single TDD cycle: RED commit then GREEN commit"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-29"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
  tests_added: 21
  tests_total_after: 503
---

# Phase 17 Plan 09: Tabs DS-62 Summary

**One-liner:** WAI-ARIA Tabs primitive with underline/pill variants, count badges, manual/auto activation, and ResizeObserver-driven overflow menu via DSDropdown.

## What Was Built

Full DS-62 Tabs implementation in two TDD phases:

**Task 1 — Core Tabs (RED + GREEN):**
- `src/Tabs.tsx` — `forwardRef` component with `TabItem[]` + controlled `value`/`onChange`
- WAI-ARIA: `role="tablist"`, `role="tab"` (aria-selected, aria-controls, tabIndex roving), `role="tabpanel"` (aria-labelledby, hidden)
- Keyboard: ArrowRight/Left cycle with wrap, Home/End jump, skips disabled tabs
- Automatic activation (default): Arrow keys move focus AND select; Manual mode: Arrow moves focus only, Enter/Space selects
- Two visual variants: `underline` (animated amber underline via `::after`) and `pill` (amber background on active)
- Optional count badge per tab (`ds-atom-tabs-count` monospace span)
- `useId()` for stable tab/panel ID pairs

**Task 2 — Overflow Menu (same GREEN commit):**
- `useLayoutEffect` + `ResizeObserver` on tablist measures cumulative tab widths
- When `cumulative + 40px (more button) > containerWidth`, sets `visibleCount`
- Hidden tabs collapse into a `<button class="ds-atom-tabs-more" aria-haspopup="menu">` with `MoreHorizontal` icon placed inside the tablist
- `DSDropdown` portal-mounts overflow menu with `ul[role=menu]` + `div[role=menuitem]` items
- Clicking a hidden tab calls `onChange` and closes the dropdown

**CSS (`src/primitives.css`):** Full block with underline active indicator, pill active state, count badge, overflow More button, overflow menu items, dark mode rules.

**Stories:** Underline, Pill, WithCounts, WithDisabled, ManualActivation, NarrowOverflow (300px container forces overflow), DarkMode, Playground.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ResizeObserver mock pattern**
- **Found during:** GREEN phase (first test run)
- **Issue:** `vi.fn().mockImplementation(cb => {...})` doesn't create a proper constructor, causing `new ResizeObserver()` to throw `TypeError: ... is not a constructor` in jsdom for every test (not just overflow tests)
- **Fix:** Changed to `vi.fn(function(cb) { resizeCallback = cb; return {...}; })` with a `beforeEach` at module scope (covers all tests). Added `globalThis.ResizeObserver = MockRO` instead of `global.ResizeObserver` (Biome prefers globalThis)
- **Files modified:** `src/Tabs.test.tsx`

**2. [Rule 1 - Bug] Biome lint: li[role=menuitem] rejected**
- **Found during:** pre-commit hook
- **Issue:** `lint/a11y/noNoninteractiveElementToInteractiveRole` rejects `<li role="menuitem">`. Biome treats `<li>` as non-interactive and the role assignment as invalid
- **Fix:** Changed overflow menu items from `<li>` to `<div>` — semantically equivalent inside `ul[role=menu]` when the focusable child is the `<button>`
- **Files modified:** `src/Tabs.tsx`

**3. [Rule 1 - Bug] Biome lint: tabIndex=0 on tabpanel div**
- **Found during:** pre-commit hook
- **Issue:** `lint/a11y/noNoninteractiveTabindex` rejects `tabIndex={0}` on `div[role=tabpanel]` — Biome doesn't recognise `role="tabpanel"` as making the element interactive
- **Fix:** Added `// biome-ignore lint/a11y/noNoninteractiveTabindex:` comment directly above the `tabIndex` prop (inline JSX attribute position, matching Carousel.tsx pattern)
- **Files modified:** `src/Tabs.tsx`

**4. [Rule 1 - Bug] Biome format: multi-line count badge expression**
- **Found during:** pre-commit hook
- **Issue:** Biome wanted `{typeof t.count === "number" && <span>…</span>}` inline (not multi-line with parens) for short expressions
- **Fix:** Collapsed to single line
- **Files modified:** `src/Tabs.tsx`

## Self-Check

```
src/Tabs.tsx             ✓ exists (286 lines)
src/Tabs.stories.tsx     ✓ exists
src/Tabs.test.tsx        ✓ exists (21 tests)
src/primitives.css       ✓ ds-atom-tabs block appended (32 matches)
src/index.ts             ✓ Tabs export present
```

```
feat(17-09-01) GREEN commit: 66124f6  ✓ exists
test(17-09-01) RED commit:   b509d65  ✓ exists
```

**503 tests pass (was 482 before this plan, +21 new Tabs tests)**
Typecheck: PASSED
Build: PASSED (ESM + DTS)

## Self-Check: PASSED

## Known Stubs

None — all tabs render real consumer-supplied content via `tab.content`.

## Threat Flags

None — Tabs renders consumer-supplied `ReactNode` via standard JSX; no new network endpoints, auth paths, or trust boundaries introduced.
