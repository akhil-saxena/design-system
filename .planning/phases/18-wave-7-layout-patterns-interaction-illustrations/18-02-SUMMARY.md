---
phase: 18
plan: "02"
subsystem: layout-primitives
tags: [appbar, footer, layout, dark-mode, ds-tokens]
dependency_graph:
  requires: [18-01]
  provides: [DS-72, DS-73]
  affects: [AppShell topbar/footer slots]
tech_stack:
  added: []
  patterns: [forwardRef, data-variant CSS keying, inline-styles+CSS-class, .dark ancestor scoping]
key_files:
  created:
    - src/AppBar.tsx
    - src/AppBar.test.tsx
    - src/Footer.tsx
    - src/Footer.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
key_decisions:
  - "AppBar withSearch uses standalone <input type=search> — DS-78 SearchAndFilters ships later (Wave 3/4)"
  - "Footer expanded grid uses repeat(4,1fr) matching handoff; brand logo column deferred to consumer"
  - "scrolled state driven by inline styles + data-scrolled attr for CSS selectability"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-02T10:36:11Z"
  tasks_completed: 2
  files_changed: 6
---

# Phase 18 Plan 02: AppBar (DS-72) + Footer (DS-73) Summary

AppBar (DS-72) standalone topbar with 4 variants and consumer-driven scrolled frosted-glass state; Footer (DS-73) compact 1-line and expanded 4-column layout footer — both consuming DS tokens throughout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | AppBar — 4 variants + scrolled state | e48f948 | src/AppBar.tsx, src/AppBar.test.tsx, src/primitives.css |
| 2 | Footer — compact + expanded + barrel exports | e9e186a | src/Footer.tsx, src/Footer.test.tsx, src/primitives.css, src/index.ts |

## What Was Built

### AppBar (DS-72) — `src/AppBar.tsx`

- `variant="minimal"` — logo + sign-in button slot (marketing/landing pages)
- `variant="withSearch"` — logo + `<input type="search">` + right actions slot
- `variant="default"` — logo + nav slot + right actions slot (default app chrome)
- `variant="centered"` — centered logo with absolute right actions slot (editorial)
- `scrolled` prop: `false` = `var(--surf-2)` background, transparent border, no shadow; `true` = `rgba(255,255,255,.92)` + `blur(14px)` + amber focus ring + `0 4px 16px` shadow. Dark mode override: `rgba(28,25,23,.92)` when scrolled.
- `logo`, `nav`, `actions` slots; `onSearchChange` callback; `searchPlaceholder`; `className`/`style` forwarded.
- `forwardRef<HTMLElement, AppBarProps>`; `data-variant` + `data-scrolled` attributes on root `<header>`.

### Footer (DS-73) — `src/Footer.tsx`

- `variant="compact"` — `padding: 20px 24px`, flex justify-between; left = copyright span; right = links row.
- `variant="expanded"` — `padding: 32px 28px 20px`; CSS `repeat(4,1fr)` grid of `FooterColumn[]`; each column: uppercase Archivo title + links list; bottom row: copyright text.
- Links render as `<a href>` when href provided, else `<button type="button">` for onClick handlers.
- `copyright`, `links`, `columns` props; `className`/`style` forwarded.
- `forwardRef<HTMLElement, FooterProps>`; `data-variant` attribute on root `<footer>`.

### CSS additions — `src/primitives.css`

- `.ds-atom-appbar` block + `[data-scrolled="true"]` override + `.ds-atom-appbar-search` focus ring
- `.dark .ds-atom-appbar[data-scrolled="true"]` dark frosted override
- `.ds-atom-footer` block + `[data-variant="compact"]` + `[data-variant="expanded"]`
- `.ds-atom-footer-cols`, `.ds-atom-footer-col-title`, `.ds-atom-footer-link` + hover
- `.dark .ds-atom-footer` border-top color override

## Test Results

```
Test Files  2 passed (2)
     Tests  18 passed (18)
```

- AppBar: 10 tests — 4 variant data-attrs, scrolled false/true, className forward, custom logo, onSearchChange callback, searchPlaceholder
- Footer: 8 tests — compact copyright, links array, `<a>` vs `<button>` rendering, expanded column titles + links, className forward, expanded copyright row

## Deviations from Plan

None — plan executed exactly as written. The standalone `<input type="search">` approach for `withSearch` (vs DS-78 SearchAndFilters) was already specified in the plan.

## Known Stubs

None. Both AppBar and Footer are fully wired primitives with no placeholder data. The `DefaultLogo` in AppBar renders "DS" text (not "JobDash") — appropriate for a library primitive; consumers pass their own `logo` prop.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundary crossings introduced. `onSearchChange` passes raw string to consumer callback per threat register T-18-02-01 (accepted disposition).

## Self-Check: PASSED

- src/AppBar.tsx: FOUND
- src/AppBar.test.tsx: FOUND
- src/Footer.tsx: FOUND
- src/Footer.test.tsx: FOUND
- Commit e48f948: FOUND
- Commit e9e186a: FOUND

## PLAN COMPLETE
