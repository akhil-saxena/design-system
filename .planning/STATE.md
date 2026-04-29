---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: milestone
status: Phase 17 complete — awaiting v0.6.0 release checkpoint approval
stopped_at: Completed 17-14 — v0.6.0 release preflight (version bump, CHANGELOG, 337 visual baselines, all 644 tests green). Awaiting human checkpoint approval for release commit + tag.
last_updated: "2026-04-29T20:07:00Z"
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 15
  completed_plans: 15
  percent: 100
---

# Project State — @akhil-saxena/design-system

## Project Reference

See: `.planning/PROJECT.md`
See: `.planning/ROADMAP.md`
See: `design_handoff/README.md` (un-tracked, lives in repo) — authoritative 53-section v1.0 spec

## Current Position

Phase: 17 (wave-6-icons-data-display) — COMPLETE (awaiting checkpoint approval)
Plan: 15 of 15 (ALL DONE)
**Phase:** Phase 17 — All 15 plans complete; v0.6.0 release preflight done
**Last shipped:** v0.5.6 → **v0.6.0 pending release commit** (awaiting human checkpoint)
**Last anchor commit:** `6bf800c chore(17-14-01): v0.6.0 preflight` on `main`
**Working tree:** clean

**Progress:** [██████████] 100%

## Recovery Notes (2026-04-29)

The original `.planning/` was never committed and is lost. This `.planning/` directory was reconstructed from:

1. **`design_handoff/README.md`** (intact in repo, un-tracked) — the 53-section spec authored before implementation began
2. **`design_handoff/JobDash Design System.html`** + 49 `ds-*.jsx` files — visual reference + source-of-truth JSX per section
3. **Git history** of this repo (DS-NN identifiers in commit messages, wave pattern) and sibling `job-dash` repo (phase 1-10 conventions to mirror)
4. **Live `src/` audit** — barrel exports in `src/index.ts` enumerate the 35 shipped primitives

**What is recovered:** PROJECT.md, ROADMAP.md, STATE.md (this file), coverage map.
**What is NOT recovered:** Per-phase PLAN / RESEARCH / CONTEXT / DISCUSSION-LOG / VALIDATION docs for phases 13.5, 14, 15, 16. The work is committed and visible in code; the rationale documents are gone.

For phases 13.5–16, treat the git log + commit messages + the `design_handoff/` files as the historical record. For Phase 17 onward, run the normal GSD workflow (`/gsd-discuss-phase`, `/gsd-plan-phase`, etc) to generate fresh per-phase docs.

## Recent Releases

| Version | Date | Summary |
|---|---|---|
| 0.6.0 | 2026-04-29 | Wave 6: 11 data display primitives (DS-60..70) + /icons subpath + lucide refactor + calendarGrid extract — PENDING RELEASE COMMIT |
| 0.5.6 | recent | Dark-mode hover specificity fix for DatePicker cells |
| 0.5.5 | recent | SplitButton width + DatePicker hover state preservation |
| 0.5.4 | recent | SplitButton chevron width + accent cleanup |
| 0.5.3 | recent | DateRangePicker range-edge polish + isRangeStart/isRangeEnd props |
| 0.5.2 | recent | DateRangePicker dual-endpoint selection marker |
| 0.5.1 | recent | DateRangePicker single-cal redesign + dark-mode + time picker + Select search + SplitButton variants + BottomSheet swipe |
| 0.5.0 | Phase 16 | 7 compound input primitives + DSDropdown internal |
| 0.4.0 | Phase 15 | 6 feedback primitives |
| 0.2.0 | Phase 14 | 9 surface primitives |
| 0.1.0 | Phase 13.5 | Initial publishable scaffold from JobDash |

## Pending Work

**Immediate:** Execute Phase 17 plan set via `/gsd-execute-phase 17`. Wave 0 (17-00) is the gate — every other wave depends on its infra changes.

**Resolved 2026-04-29 (see PROJECT.md "Resolved Scope Decisions"):**

1. ✅ Icons → tree-shakeable `/icons` subpath export (DS-60, Phase 17)
2. ✅ Illustrations → `/illustrations` subpath in same repo (DS-81, Phase 18)
3. ✅ RichText → in Phase 17 on TipTap (DS-70)
4. ✅ Drag & Drop → functional primitive on `@dnd-kit/core` (DS-80, Phase 18)

**Phase 17 commit ordering:** Icons (DS-60) lands first within the phase so DS-61..70 primitives can import canonical components instead of inline SVGs, and previously-shipped primitives can be refactored to use them in the same wave-completion sweep.

## Key Decisions (17-01)

- Brand-lock defaults: size=20, strokeWidth=1.5, color=currentColor applied via spread BEFORE rest props (consumer overrides win)
- 31 icons in barrel (18 current-use + 13 future-Phase-17); stories/*.stories.tsx deferred per D-17-04
- DateRangePicker confirmed zero lucide imports — deferred to 17-02 as designed
- Per-primitive import path: `from "./icons"` (relative from src/ root)

## Key Decisions (17-03)

- WAI-ARIA radiogroup (not tablist) — semantically correct for "one-selected-at-a-time" toggle groups
- `--ink-inverse` token absent from tokens.css; used `#000` directly for amber active text (amber on black is accessible per design handoff)
- `data-active="true"` string value (not boolean) for reliable DOM attribute matching in tests
- Generic `<T extends string>` preserved via `forwardRef` cast — standard TS+React HOC limitation

## Key Decisions (17-06)

- `<ul>`/`<li>` semantic HTML used (not div+role) — biome a11y/useSemanticElements enforcement
- Class-based IntersectionObserver mock in tests — biome reformats bare function expressions to arrow functions, breaking newable mocks
- Consumer `loading` prop is the StrictMode double-effect guard (simpler than a loadingRef)
- `rootMargin: "200px"` default pre-fetches before sentinel reaches viewport edge

## Key Decisions (17-05)

- Connector line between events implemented as CSS `::after` pseudo-element on each `li` (not an extra DOM span) to keep markup clean
- Date formatting via `Intl.DateTimeFormat` — no external date library required
- Event `onClick` wraps inner content in `<button class="ds-atom-timeline-trigger">` — read-only events are bare `li` children

## Key Decisions (17-07)

- `<section aria-labelledby>` used for panels instead of `<div role="region">` — semantic HTML per S6819 lint; identical ARIA role, better device support
- `HEADING_TAGS` lookup table for dynamic heading levels — avoids template-literal cast and nested-template lint warning (S4624)
- `matchMedia` stub added to `test-setup.ts` (Rule 3) — jsdom lacks matchMedia; all future hooks (useColorScheme etc.) benefit automatically
- `fireEvent` used in place of `@testing-library/user-event` — latter not installed; fireEvent sufficient for synchronous click toggle tests

## Key Decisions (17-08)

- touch-only swipe filter: `e.pointerType === "touch"` — mouse drags do not trigger slide advances
- autoplay timer NOT created at all when reducedMotion=true (W3C spec: not just paused)
- Non-active slides get `aria-hidden=true`; tests use `getAllByRole("group", { hidden: true })` to find all slides
- biome-ignore lint/a11y/useSemanticElements placed inline as JSX attribute comment (before the role attr), not before the element opening tag
- Touch pointer events simulated via `MouseEvent + Object.defineProperty` (jsdom PointerEvent init dict limitation)
- No `loop` prop in v0.6 — bounds-clamped only per DS-65 spec

## Key Decisions (17-09)

- `div[role=menuitem]` instead of `li[role=menuitem]` in overflow menu — Biome lint/a11y/noNoninteractiveElementToInteractiveRole rejects li+menuitem; div is semantically equivalent when button is the focusable child
- `biome-ignore lint/a11y/noNoninteractiveTabindex` on tabpanel — WAI-ARIA APG requires tabIndex=0 on tabpanel; placed as inline JSX attribute comment (matching Carousel.tsx pattern)
- ResizeObserver mock uses `vi.fn(function(cb){...})` constructor pattern — `vi.fn().mockImplementation()` does not produce a constructable mock in jsdom
- All 21 tests (core ARIA + overflow) in single TDD cycle; Tasks 1 and 2 share one GREEN commit

## Key Decisions (17-11)

- `role="separator"` omitted from resize handle — biome S6819 requires `<hr>` for separator role; visual drag affordance uses `aria-hidden="true"` only
- `fakePointerEvent()` helper in resize tests — jsdom PointerEvent does not set `clientX` from init dict; `startResize` called directly via `harnessRef` with plain-object cast
- `Table.Pagination` must be sibling of `Table.Root` (not nested) — `<nav>` inside `<table>` is invalid HTML; enforced via doc comment + `PaginationOutsideTable` story
- `paginationRange()` 4-branch algorithm: ≤7 pages (all), current≤4 (near-start), current≥total-3 (near-end), else (both ellipses)

## Key Decisions (17-13)

- StarterKit v3.22 bundles Link + Underline by default; opted them out via `StarterKit.configure({ link: false, underline: false })` then re-added with custom config — eliminates "Duplicate extension" warnings
- Link popover uses `<dialog open>` (non-modal, in-flow) instead of `<div role="dialog">` — satisfies biome `useSemanticElements`; inline style resets UA dialog stylesheet so `.ds-atom-richtext-linkpopover` class controls visuals
- `UnderlineExtension` import alias prevents collision with `Underline` icon imported from `./icons`
- Three-layer controlled-sync guard (lastEmittedRef + getHTML equality + emitUpdate:false) is mandatory — documented in file header JSDoc for future maintainers

## Key Decisions (17-12)

- Month cells are `<button role="gridcell">` (matching DatePicker) + overflow `+N more` is `<span role="button" tabIndex={0}>` to avoid nested button HTML violation
- Week view uses plain divs without ARIA grid roles — inner `<button>` per day provides keyboard accessibility; avoids biome `useSemanticElements` conflicts
- biome-ignore for `role="gridcell"` on `<button>` must be an inline prop comment (before the `role=` attribute line), not a line comment before the tag — matches Carousel.tsx pattern per Key Decisions 17-08
- `useMatchMedia("(max-width: 640px)")` used reactively (not `window.matchMedia.matches` directly) — SSR-safe, subscribes to change events
- Multi-day events render per-day chips only (no spanning bars) — deferred per RESEARCH

## Key Decisions (17-14)

- Playwright test timeout set to 300s — single all-stories test iterates 145+ stories; default 30s was too short for full baseline regen
- `waitForSelector` uses `state: "attached"` — Lightbox stories auto-open a dialog which aria-hides `#storybook-root`; "attached" resolves immediately once in DOM
- Tree-shake fixture with `--external:lucide-react` yields 1.2KB (correct consumer experience); without external yields ~9.4KB (all 31 wrapped icons bundled). Fixture threshold is consumer-context dependent
- Visual baselines now in `tests/visual/storybook.spec.ts-snapshots/` (Playwright default adjacent to spec); `tests/visual-baselines/` is separate directory with sample PNGs from planning phase

## Blockers / Concerns

- None. Release commit pending human checkpoint approval (visual smoke check + RichText paste test).

## Session Continuity

**Last session:** 2026-04-29T20:07:00Z
**Stopped at:** Completed 17-14 — v0.6.0 preflight (version bump, CHANGELOG, 337 baselines, 644 tests green). Human checkpoint: type "approved" to make release commit.
**Resume file:** None
**Next command:** After checkpoint approval — release commit `chore(release): v0.6.0 — 11 data display primitives + icons subpath + cumulative visual baselines`, then `git tag v0.6.0`, then Phase 18 planning.
