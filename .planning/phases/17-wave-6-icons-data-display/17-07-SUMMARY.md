---
phase: 17-wave-6-icons-data-display
plan: "07"
subsystem: primitives
tags: [primitive, disclosure, aria, accordion, compound-api]
dependency_graph:
  requires: ["17-01"]
  provides: ["DS-64 Accordion compound primitive"]
  affects: ["src/index.ts", "src/primitives.css"]
tech_stack:
  added: []
  patterns:
    - "WAI-ARIA disclosure pattern (button+region, NOT tablist)"
    - "Compound API via Object.assign (Accordion.Item)"
    - "React Context for mode/state sharing between root and items"
    - "useId() for stable header/panel ID pairs"
    - "Lookup table (HEADING_TAGS) for dynamic heading element selection"
    - "useReducedMotion hook gating chevron CSS transition"
    - "data-open attribute for CSS-driven chevron rotation"
key_files:
  created:
    - src/Accordion.tsx
    - src/Accordion.stories.tsx
    - src/Accordion.test.tsx
  modified:
    - src/primitives.css
    - src/index.ts
    - src/test-setup.ts
decisions:
  - "Used <section aria-labelledby> instead of <div role='region'> per S6819 lint rule — semantically equivalent, better device support"
  - "HEADING_TAGS lookup table (Record<2|3|4|5|6, keyof JSX.IntrinsicElements>) avoids template literal cast and nested template literal warning (S4624)"
  - "Added matchMedia stub to test-setup.ts (Rule 3 fix) — jsdom lacks matchMedia; stub returns matches:false so useReducedMotion defaults to false in tests"
  - "Replaced @testing-library/user-event with fireEvent — user-event not installed in project; fireEvent sufficient for click-based toggle tests"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-29"
  tasks_completed: 1
  files_created: 3
  files_modified: 3
---

# Phase 17 Plan 07: Accordion Compound Primitive (DS-64) Summary

**One-liner:** WAI-ARIA disclosure accordion with compound API (Accordion.Item), single/multi-expand modes, controlled/uncontrolled state, configurable heading level, and reduced-motion support.

## What Was Built

`Accordion` + `Accordion.Item` compound primitive implementing the WAI-ARIA disclosure pattern for progressive disclosure UIs (FAQs, settings, doc sections).

### API

```tsx
// Single-expand (default)
<Accordion mode="single">
  <Accordion.Item id="faq-1" title="What is X?">Content...</Accordion.Item>
  <Accordion.Item id="faq-2" title="How does Y work?">Content...</Accordion.Item>
</Accordion>

// Multi-expand + controlled
<Accordion mode="multi" openIds={openIds} onOpenIdsChange={setOpenIds}>
  <Accordion.Item id="a" title="Section A" headingLevel={2}>...</Accordion.Item>
</Accordion>
```

### ARIA Pattern

Each item renders:
- `<h{N} className="ds-atom-accordion-heading">` (level 2–6, default 3)
  - `<button type="button" aria-expanded={open} aria-controls={panelId}>` 
    - Title span + ChevronDown icon with `data-open="true"` when open
- `<section id={panelId} aria-labelledby={headerId} hidden={!open}>` — panel

### Modes

- **single** (default): opening one item closes all others (`next = [id]`)
- **multi**: items toggle independently (`next = [...openIds, id]` or filter out)

### Controlled / Uncontrolled

- Controlled: pass `openIds` + `onOpenIdsChange` — component acts as pure display
- Uncontrolled: pass `defaultOpenIds` (or omit) — internal `useState` manages

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED  | 5c8bf21 | test(17-07): add failing tests |
| GREEN | 1de52d3 | feat(17-07): implement Accordion |
| REFACTOR | n/a — no cleanup needed | skipped |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing `window.matchMedia` in jsdom test environment**
- **Found during:** Task 1, GREEN phase — `useReducedMotion` called `window.matchMedia` which jsdom does not implement
- **Fix:** Added a no-op `matchMedia` stub to `src/test-setup.ts` using `Object.defineProperty(globalThis, "matchMedia", ...)` returning `matches: false`
- **Files modified:** `src/test-setup.ts`
- **Impact:** All future hooks using `matchMedia` (useColorScheme etc.) will work in tests automatically

**2. [Rule 1 - Quality] Replaced template-literal heading cast with lookup table**
- **Found during:** Typecheck + lint (S4624 nested template literal, S4325 unnecessary assertion)
- **Fix:** `HEADING_TAGS: Record<2|3|4|5|6, keyof React.JSX.IntrinsicElements>` lookup table — clean typing, no cast needed
- **Files modified:** `src/Accordion.tsx`

**3. [Rule 1 - Quality] Used `<section>` instead of `<div role="region">`**
- **Found during:** Lint (S6819 — prefer semantic element over role attribute)
- **Fix:** Panel rendered as `<section aria-labelledby={headerId}>` — same ARIA semantics, better device support
- **Files modified:** `src/Accordion.tsx`
- **Note:** `getByRole("region")` in tests still works — `<section>` with `aria-labelledby` has implicit `region` role

**4. [Rule 3 - Blocking] `@testing-library/user-event` not installed**
- **Found during:** Initial test run — import error
- **Fix:** Replaced all `userEvent` calls with `fireEvent` from `@testing-library/react` (already installed)
- **Files modified:** `src/Accordion.test.tsx`

## Known Stubs

None — all props wired to real state, no placeholder content.

## Threat Flags

None — Accordion renders consumer-supplied React nodes via `title` prop and `children`. No HTML string parsing, no network calls, no auth paths.

## Self-Check: PASSED

- src/Accordion.tsx — FOUND
- src/Accordion.stories.tsx — FOUND
- src/Accordion.test.tsx — FOUND
- Commit 5c8bf21 (RED) — FOUND
- Commit 1de52d3 (GREEN) — FOUND
- 15 tests pass, 455 total suite passes
- typecheck exits 0
- build exits 0
