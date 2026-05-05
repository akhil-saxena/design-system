# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-05)

**Core value:** A pixel-precise, fully accessible React + TypeScript design system for JobDash — every component passes axe-core with zero violations, covers light and dark mode, and adheres to the cream/ink/amber visual identity.
**Current focus:** Phase 17 — Simple Primitives (Kbd, RelativeTime, Pagination)

## Current Position

Phase: 17 of 27 (Simple Primitives) — COMPLETE
Plan: 5 of 5 in current phase (phase complete)
Status: Phase 17 complete — ready for Phase 18 (ConfirmDialog)
Last activity: 2026-05-05 — 017-05 complete: barrel exports for Kbd + RelativeTime + Pagination, tsc clean, 33 Phase 17 tests green

Progress: [██████░░░░░░░░░░░░░░] ~35% (phases 1–17 of 27 complete)

## Performance Metrics

**Velocity:**
- Total plans completed: unknown (Milestone 1 plans not tracked here)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1–16 (Milestone 1) | — | — | — |
| 17 plan 01 | 1 | ~8 min | ~8 min |
| 17 plan 02 (Kbd) | 1 | ~8 min | ~8 min |
| 17 plan 03 (RelativeTime) | 1 | ~8 min | ~8 min |
| 17 plan 04 (Pagination) | 1 | ~8 min | ~8 min |
| 17 plan 05 (barrel exports) | 1 | ~12 min | ~12 min |

**Recent Trend:** No data yet for Milestone 2

*Updated after each plan completion*

## Accumulated Context

### Decisions

- RelativeTime: `globalThis.setInterval/clearInterval` (not `window.*`) for SSR/jsdom compatibility
- RelativeTime: `diffMin === 0` → `"0m ago"` per spec — no "just now" special case
- RelativeTime: `updateInterval={0}` disables live updates — used in DarkMode story to freeze values
- Pagination: compact variant shows "N / M" text; full variant shows page buttons with ellipsis
- Kbd: renders a semantic `<kbd>` element with `ds-atom-kbd` class
- Barrel exports for new components go immediately after their category peer (not appended at end of src/index.ts)
- Pagination biome fix: pre-tag items before map to avoid array-index keys on ellipsis; `noUncheckedIndexedAccess` requires `!` on bounds-checked array access despite biome S4325 false positive
- Phase 17 (Kbd, RelativeTime, Pagination) fully shipped — all 33 tests pass, tsc clean, barrel exports live
- Phases 24–27 are blocked pending second ingest of: `ds-navigation.jsx`, `ds-notifications.jsx`, `ds-patterns.jsx`, `ds-mediacards.jsx`, `ds-status.jsx`
- ConfirmDialog uses always-light glass surface (rgba(255,255,255,.97)) — NOT body.dark token-driven
- DataGrid depends on Badge, Checkbox, Button from Milestone 1 — confirmed shipped
- DataGrid also depends on Phase 17 Pagination for its footer
- Sparkline and MiniDonut have exact SVG formulas in constraints.md — must reproduce precisely
- CommandPalette uses window-level listeners; must clean up on unmount (CONSTRAINT-014)
- TypeToConfirm comparison is case-sensitive; no trim (CONSTRAINT-013)

### Pending Todos

None yet.

### Blockers/Concerns

- Phases 24–27: Blocked until spec files are ingested. Next ingest manifest must include `ds-navigation.jsx`, `ds-notifications.jsx`, `ds-patterns.jsx`, `ds-mediacards.jsx`, `ds-status.jsx`
- Verify codebase status of: Accordion, Breadcrumbs, Skeleton, EmptyStates, StarRating, ContextMenu (these appear in ds-advanced.jsx but were NOT listed as missing in the ingest context prompt — confirm before routing)
- AlertBanner: RESOLVED — codebase verified to have src/feedback/AlertBanner already shipped (Milestone 1). The SYNTHESIS.md listed it as missing in error — the intel requirement REQ-alertbanner is moot. No phase needed.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Routing gap | AlertBanner — confirmed already shipped in src/feedback/AlertBanner; SYNTHESIS listing was in error | Resolved | 2026-05-05 |

## Session Continuity

Last session: 2026-05-05
Stopped at: 017-05-PLAN.md complete — Phase 17 fully complete. Kbd, RelativeTime, Pagination exported from src/index.ts. tsc clean, 33 Phase 17 tests green. Ready for Phase 18 (ConfirmDialog).
Resume file: None
