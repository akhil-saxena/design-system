---
phase: 17-wave-6-icons-data-display
plan: "06"
subsystem: primitives
tags: [primitive, infinite-list, intersection-observer, ds-67]
dependency_graph:
  requires: [17-01]
  provides: [InfiniteList]
  affects: [src/index.ts, src/primitives.css]
tech_stack:
  added: []
  patterns: [IntersectionObserver sentinel, forwardRef generic, TDD RED/GREEN]
key_files:
  created:
    - src/InfiniteList.tsx
    - src/InfiniteList.stories.tsx
    - src/InfiniteList.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
decisions:
  - "Use <ul>/<li> semantic HTML instead of div+role attributes (biome a11y/useSemanticElements rule)"
  - "Class-based IntersectionObserver mock — biome rewrites bare function expressions to arrow functions on pre-commit, breaking newable mocks"
  - "buildClassName() helper avoids nested template literal (biome S4624)"
  - "Rely on consumer loading prop as StrictMode double-effect guard (simpler than loadingRef)"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-29"
  tasks_completed: 1
  files_created: 3
  files_modified: 2
  tests_added: 11
  tests_total: 440
---

# Phase 17 Plan 06: InfiniteList (DS-67) Summary

InfiniteList primitive with IntersectionObserver sentinel — fires `onLoadMore` when bottom sentinel enters the viewport (rootMargin 200px), guarded by `hasMore` + `loading` props, React 19 strict-mode safe via `io.disconnect()` cleanup.

## What Was Built

`InfiniteList` — a generic `forwardRef` component rendering a `<ul>` of consumer-provided items with a hidden `<li>` sentinel at the bottom. An `IntersectionObserver` watches the sentinel and calls `onLoadMore` on intersection. The observer is only created when `hasMore && !loading`, making it naturally safe against double-trigger in React 19 strict mode.

### Component API

```ts
interface InfiniteListProps<T = unknown> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  loadingSlot?: ReactNode;   // default: 3 Skeleton rows
  endSlot?: ReactNode;       // default: "End of list" text
  rootMargin?: string;       // default "200px"
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}
```

### Key behaviors

- `hasMore=false` — observer NOT created; end slot renders
- `loading=true` — observer NOT created; loading slot renders (default 3 `<Skeleton shape="text">`)
- Consumer slot overrides accepted for both `loadingSlot` and `endSlot`
- `rootMargin` defaults to `"200px"` — pre-fetches before sentinel reaches viewport edge
- Cleanup via `io.disconnect()` on each effect teardown (covers unmount + dep changes)

### Stories (7)

Default, LoadingInProgress, EndOfList, LongList (200 items), CustomSlots, DarkMode, Playground

### Tests (11)

Observer creation, hasMore guard, loading guard, onLoadMore fires on intersection, no-fire on non-intersection, end-of-list slot, endSlot consumer override, renderItem mapping, disconnect on unmount, default Skeleton rendering, loadingSlot consumer override.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED — failing tests | `9984559` | PASS |
| GREEN — implementation | `1fb8d98` | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Biome rewrites bare `function` expressions to arrow functions**
- **Found during:** Task 1 GREEN commit pre-commit hook
- **Issue:** The plan specified `global.IntersectionObserver = vi.fn().mockImplementation(cb => ...)` and then a plain `function` expression. Biome's formatter converts function expressions assigned to variables to arrow functions on pre-commit. Arrow functions are not newable, so `new IntersectionObserver()` threw "not a constructor" in the post-commit test run.
- **Fix:** Changed mock to a `class MockIntersectionObserver` — class syntax is biome-stable and correctly satisfies `new IntersectionObserver()`.
- **Files modified:** `src/InfiniteList.test.tsx`
- **Commit:** `c555124`

**2. [Rule 1 - Bug] Biome a11y/useSemanticElements rejects `role="list"` on `<div>`**
- **Found during:** Task 1 GREEN commit pre-commit hook
- **Issue:** `<div role="list">` and `<div role="listitem">` fail biome's `useSemanticElements` lint rule, which requires native `<ul>`/`<li>` elements.
- **Fix:** Changed container to `<ul>`, items to `<li>`, sentinel and loading wrapper to `<li>`. Updated `ref` types throughout to `HTMLUListElement` / `HTMLLIElement`. Extracted `buildClassName()` helper to avoid nested template literals (biome S4624).
- **Files modified:** `src/InfiniteList.tsx`
- **Commit:** `1fb8d98`

**3. [Rule 1 - Bug] `global` → `globalThis`**
- **Found during:** Task 1 initial test write
- **Issue:** IDE diagnostics flagged `global.IntersectionObserver` (prefer `globalThis`).
- **Fix:** Changed to `globalThis.IntersectionObserver`.
- **Files modified:** `src/InfiniteList.test.tsx`
- **Commit:** `9984559`

## Known Stubs

None — `onLoadMore` is consumer-controlled; no hardcoded data or placeholder content.

## Threat Flags

None — component renders consumer-supplied React nodes via `renderItem`. No network endpoints, auth paths, or file access patterns introduced.

## Self-Check: PASSED

- src/InfiniteList.tsx — FOUND
- src/InfiniteList.stories.tsx — FOUND
- src/InfiniteList.test.tsx — FOUND
- commit 9984559 (RED) — FOUND
- commit 1fb8d98 (GREEN) — FOUND
- commit c555124 (fix mock) — FOUND
