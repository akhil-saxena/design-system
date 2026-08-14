# Roadmap: JobDash Design System

## Milestones

- Milestone 1 — Foundation & Core Primitives (Phases 1–16) — SHIPPED
- Milestone 2 — Advanced Components (Phases 17–27) — IN PROGRESS

---

## Phases

**Phase Numbering:**
- Integer phases (17–27): Milestone 2 planned work
- Decimal phases (e.g. 17.1): Urgent insertions via /gsd-insert-phase

<details>
<summary>Milestone 1 — Foundation & Core Primitives (Phases 1–16) — SHIPPED</summary>

35+ of 53 primitives shipped across phases 1–16. Confirmed shipped: Button, Input, Select, Checkbox, Toggle, Badge, Chip, Card, Modal, Toast, AppShell, AppBar, Sidebar, Footer, and more. Full list not re-audited; see git history for exact inventory.

</details>

### Milestone 2 — Advanced Components

- [x] **Phase 17: Simple Primitives** - Kbd, RelativeTime, and Pagination — three small display/interaction primitives
- [x] **Phase 18: ConfirmDialog** - ConfirmDialog (4-tone) and TypeToConfirm gate
- [x] **Phase 19: DataViz Primitives** - Sparkline, MiniDonut, and MiniBar SVG/CSS charts
- [x] **Phase 20: StatCard** - KPI card composing label, value, trend badge, and Sparkline
- [x] **Phase 21: ColorPicker** - Full gradient picker with hue/opacity bars, swatches, and inline variant
- [x] **Phase 22: CommandPalette** - Cmd+K modal search with grouped results and keyboard navigation
- [x] **Phase 23: DataGrid** - Sortable/resizable/selectable table with bulk actions and pagination
- [ ] **Phase 24: Navigation** - TreeItem and CollapsibleSidebar
- [ ] **Phase 25: NotificationCenter** - Notification panel + InlineBanner sibling variant
- [ ] **Phase 26: FileUploadZone** - Drag-and-drop file upload area
- [ ] **Phase 27: MediaCard + StatusPages** - MediaCard + GalleryCard + PlaceholderImg + 4 StatusPages (404/500/Maintenance/Offline)

---

## Phase Details

### Phase 17: Simple Primitives
**Goal**: Developers can use keyboard shortcut labels, human-readable timestamps, and page navigation controls throughout the application
**Depends on**: Phases 1–16 (existing Button, ds-icbtn, ds-page-btn, global ds-kbd CSS)
**Requirements**: REQ-17-01, REQ-17-02, REQ-17-03
**Status**: ready
**Estimated components**: 3 (Kbd, RelativeTime, Pagination)
**Success Criteria** (what must be TRUE):
  1. A `<Kbd>` component renders `⌘K`, `ESC`, `DELETE` and other shortcut strings inside a properly styled `<kbd>` element in both light and dark mode
  2. A `<RelativeTime>` component converts dates to "Nm ago" / "Nh ago" / "Nd ago" / locale string / "in Nm" and shows the exact datetime on hover via `title` attribute
  3. The full Pagination variant displays page number buttons with ellipsis, correct disabled states on first/last page, and an active-page highlight
  4. The compact Pagination variant displays "N / M" text between prev/next arrows
  5. All three components pass axe-core with zero violations in Storybook
**Plans**: 5 plans
- [x] 017-01-PLAN.md — Append CSS blocks for ds-atom-kbd, ds-atom-relative-time, ds-atom-pagination-* to primitives.css
- [x] 017-02-PLAN.md — Implement Kbd component + stories + tests
- [x] 017-03-PLAN.md — Implement RelativeTime component + stories + tests
- [x] 017-04-PLAN.md — Implement Pagination component + stories + tests
- [x] 017-05-PLAN.md — Add barrel exports to src/index.ts + full verification
**UI hint**: yes

### Phase 18: ConfirmDialog
**Goal**: Developers can gate irreversible actions behind a confirmation dialog that communicates the severity of the action through its tone
**Depends on**: Phase 17 (Kbd used in ConfirmDialog for ESC hint), Modal (phase 1–16)
**Requirements**: REQ-18-01, REQ-18-02
**Status**: ready
**Estimated components**: 2 (ConfirmDialog, TypeToConfirm)
**Success Criteria** (what must be TRUE):
  1. `ConfirmDialog` with `tone="danger"` renders a red-tinted icon area and a red confirm button; `tone="warn"` renders amber; `tone="success"` renders green tint; `tone="neutral"` renders ink
  2. The dialog is always-light (rgba(255,255,255,.97) surface, blur backdrop) regardless of the app's dark-mode state
  3. Enter triggers confirm when the confirm button is enabled; Escape triggers cancel from anywhere in the dialog
  4. `TypeToConfirm` disables the confirm button until the user types exactly "DELETE" (or the override word); confirm button turns red when enabled
  5. Both components pass axe-core with zero violations in Storybook across both modes
**Plans**: 4 plans
- [x] 018-01-PLAN.md — Remove old ConfirmDialog from Modal/index.tsx + update barrel
- [x] 018-02-PLAN.md — Implement new ConfirmDialog + TypeToConfirm + tests
- [x] 018-03-PLAN.md — Add Storybook stories for ConfirmDialog + TypeToConfirm
- [x] 018-04-PLAN.md — Barrel exports for new location + full tsc + test suite gate
**UI hint**: yes

### Phase 19: DataViz Primitives
**Goal**: Developers have three reusable chart primitives (line, ring, bar) that can be composed into larger dashboard patterns
**Depends on**: Phases 1–16 (CSS token system must be complete)
**Requirements**: REQ-19-01, REQ-19-02, REQ-19-03
**Status**: ready
**Estimated components**: 3 (Sparkline, MiniDonut, MiniBar)
**Success Criteria** (what must be TRUE):
  1. `Sparkline` renders a polyline with a correctly normalized Y axis, optional fill at 10% opacity, and a terminal dot; visually matches the reference for both flat and ranged data sets
  2. `MiniDonut` renders a progress arc starting at 12 o'clock, animates `stroke-dashoffset` to the correct percentage, and the track circle uses `var(--cream-2)`
  3. `MiniBar` renders flex-bottom-aligned bars where bar heights are proportional to their values with a 70% max height, value labels above, and optional category labels below
  4. All three accept any CSS color value or token reference and render correctly in both light and dark mode
  5. All three pass axe-core with zero violations in Storybook
**Plans**: 4 plans
- [x] 019-01-PLAN.md — Sparkline component + stories + tests
- [x] 019-02-PLAN.md — MiniDonut component + stories + tests
- [x] 019-03-PLAN.md — MiniBar component + stories + tests
- [x] 019-04-PLAN.md — Barrel exports to src/index.ts + tsc + full test suite

### Phase 20: StatCard
**Goal**: Developers can drop a single `StatCard` component onto a dashboard and show a KPI with its trend and history in one unit
**Depends on**: Phase 19 (Sparkline), Phases 1–16 (glass surface, token system)
**Requirements**: REQ-20-01
**Status**: ready
**Estimated components**: 1 (StatCard)
**Success Criteria** (what must be TRUE):
  1. `StatCard` renders a metric label in monospace uppercase, a large Archivo numeric value, and a trend badge where positive values show green tint and negative values show red tint
  2. When a `data` array is provided, a Sparkline fills the full card width below the value; Sparkline color matches trend sentiment
  3. The card uses the `glass` surface class with correct padding and border-radius
  4. StatCard renders correctly in both light and dark mode in Storybook
  5. axe-core scan passes with zero violations
**Plans**: 2 plans
- [x] 020-01-PLAN.md — StatCard component (index.tsx) + unit test suite (StatCard.test.tsx)
- [x] 020-02-PLAN.md — StatCard stories (StatCard.stories.tsx) + barrel export to src/index.ts + tsc + full test suite
**UI hint**: yes

### Phase 21: ColorPicker
**Goal**: Developers can place a full-featured color picker into any form and users can select colors via gradient, hue bar, opacity bar, hex input, preset swatches, or tonal strips
**Depends on**: Phases 1–16 (ds-input, ds-input-wrap, focus ring token system)
**Requirements**: REQ-21-01
**Status**: ready
**Estimated components**: 2 (ColorPicker full, ColorInput inline variant)
**Success Criteria** (what must be TRUE):
  1. The gradient area responds to drag and updates the color preview thumb position in real-time
  2. The hue bar and opacity bar each have a draggable thumb that updates the active color
  3. Typing a valid 6-digit hex in the input updates all sub-parts; an invalid partial entry does not corrupt state
  4. Clicking a preset swatch highlights it with a 2.5px ink border and updates all sub-parts
  5. The inline `ColorInput` variant (swatch + hex field) renders inside `ds-input-wrap` and can be embedded in any form field row
  6. All interactive sub-parts (gradient, bars, hex input, swatches, tonal strips) are keyboard-reachable
  7. Both variants pass axe-core with zero violations in light and dark mode
**Plans**: TBD
**UI hint**: yes

### Phase 22: CommandPalette
**Goal**: Users can open a search palette with Cmd+K to quickly navigate or trigger actions using keyboard-driven interaction
**Depends on**: Phase 17 (Kbd for shortcut display), Phases 1–16 (ds-overlay, global token system)
**Requirements**: REQ-22-01
**Status**: ready
**Estimated components**: 1 (CommandPalette)
**Success Criteria** (what must be TRUE):
  1. Pressing Cmd+K (Mac) or Ctrl+K (Windows/Linux) opens the palette positioned at 15vh from the top; pressing Escape closes it and clears the query
  2. Typing in the search input live-filters results and "No results for '...'" appears when no items match
  3. Results are visually grouped by category with `ds-cmd-group` headers and items show icon + label + optional `Kbd` shortcut
  4. Clicking an item or pressing Enter on a focused item closes the palette and clears the query
  5. Click-away on the overlay closes the palette
  6. The window-level Cmd+K and Escape listeners are properly removed when the component unmounts
  7. axe-core scan passes with zero violations in light and dark mode
**Plans**: TBD
**UI hint**: yes

### Phase 23: DataGrid
**Goal**: Developers can render a sortable, resizable, and selectable table of job application data with bulk operations and pagination
**Depends on**: Phases 1–16 (Badge, Checkbox, Button, ds-page-btn all already shipped); Phase 17 (Pagination component used in footer)
**Requirements**: REQ-23-01
**Status**: complete
**Estimated components**: 1 (DataGrid)
**Success Criteria** (what must be TRUE):
  1. Clicking a sortable column header toggles asc/desc sort and shows an amber ▲/▼ indicator on the active column
  2. Dragging the 6px resize handle on any column header updates that column's width live with a minimum of 60px
  3. Checking individual row checkboxes or the select-all header checkbox selects rows (highlighted with 4% amber tint); the bulk-action bar slides in when any row is selected
  4. Status cells render the correct `ds-badge` modifier class and priority cells render a correctly-colored 6px dot for each priority level
  5. The footer shows row count in monospace and prev/page/next buttons; the table scrolls horizontally when columns exceed viewport width
  6. Arrow keys navigate between cells and Space bar toggles row selection via keyboard
  7. axe-core scan passes with zero violations in light and dark mode
**Plans**: 3 plans
- [x] 023-01-PLAN.md — DataGrid CSS atoms + component (composes Table + 3 hooks)
- [x] 023-02-PLAN.md — DataGrid unit test suite (18 tests covering REQ-23-01)
- [x] 023-03-PLAN.md — Stories + barrel export + phase gate
**UI hint**: yes

### Phase 24: Navigation
**Goal**: Developers can compose hierarchical tree navigation and a collapsible sidebar from purpose-built components
**Depends on**: Phases 1–16
**Requirements**: REQ-treeitem, REQ-collapsiblesidebar
**Status**: ready
**Estimated components**: 2 (TreeItem, CollapsibleSidebar)
**Source**: design_handoff/design-system/ds-navigation.jsx
**Success Criteria** (what must be TRUE):
  1. TreeItem renders a hierarchical nav row with depth indentation, chevron, optional badge, and count
  2. CollapsibleSidebar toggles between 220px expanded and 56px collapsed widths with logo + items + collapse toggle
  3. Active state visually distinct from hover state
  4. Both pass axe-core with zero violations in light + dark mode
**Plans**: TBD

### Phase 25: NotificationCenter
**Goal**: Users can view, dismiss, and interact with in-app notifications via a notification panel
**Depends on**: Phases 1–16
**Requirements**: REQ-notificationcenter
**Status**: ready
**Estimated components**: 2 (NotificationCenter, InlineBanner)
**Source**: design_handoff/design-system/ds-notifications.jsx
**Success Criteria** (what must be TRUE):
  1. NotificationCenter renders grouped notifications with unread state, mark-all-read action, per-item dismiss
  2. InlineBanner sibling variant renders as a flat in-page banner using shared notification primitives
  3. Both pass axe-core with zero violations in light + dark mode
**Plans**: TBD

### Phase 26: FileUploadZone
**Goal**: Users can upload files by dragging and dropping onto a dedicated drop zone
**Depends on**: Phases 1–16
**Requirements**: REQ-fileuploadzone
**Status**: ready
**Estimated components**: 1 (FileUploadZone)
**Source**: design_handoff/design-system/ds-patterns.jsx (FileUploadZone section only — Timeline/Stepper/NotificationInbox/FilterBar deferred)
**Success Criteria** (what must be TRUE):
  1. Drop zone accepts file drag-and-drop with click-to-browse fallback
  2. Per-file animated progress bar during upload
  3. File list shows thumbnail + extension badge + remove button per entry
  4. Validation behavior to be pinned in plan (CONSTRAINT-019)
  5. Passes axe-core with zero violations in light + dark mode
**Plans**: TBD

### Phase 27: MediaCard + StatusPages
**Goal**: Developers can render image/media cards with hover overlays, mosaic gallery layouts, and drop-in 404/500/maintenance/offline page templates
**Depends on**: Phases 1–16
**Requirements**: REQ-mediacard, REQ-gallerycard, REQ-statuspages
**Status**: ready
**Estimated components**: 4 (MediaCard, GalleryCard, PlaceholderImg, StatusPages)
**Source**: design_handoff/design-system/ds-mediacards.jsx + ds-status.jsx
**Success Criteria** (what must be TRUE):
  1. MediaCard renders glass card with cover, optional badge, hover overlay action, and body
  2. GalleryCard renders a 2x2 mosaic with overflow count tile when more than 4 images
  3. PlaceholderImg renders a CSS-only diagonal stripe pattern (no raster, design-time primitive — CONSTRAINT-022)
  4. StatusPages ships 4 templates (NotFound 404, ServerError 500, Maintenance, Offline) sharing a StatusFrame wrapper
  5. ServerError 500 page uses hardcoded `#1c1917` background and `#f5f3f0` text (always-dark per CONSTRAINT-020 — never theme-flipped)
  6. All components pass axe-core with zero violations in light + dark mode
**Plans**: TBD

### Phase 28: Tier 1 — Packaging & Typecheck Correctness

**Goal**: The package is consumable from a React Server Component tree, and `npm run typecheck` actually covers every TypeScript file in the repo.
**Depends on**: Phases 1–27 (all shipped components)
**Requirements**: REQ-hardening-rsc, REQ-hardening-typecheck
**Status**: ready
**Source**: Production-readiness audit (2026-08-14)
**Success Criteria** (what must be TRUE):
  1. `grep -c 'use client' dist/index.js` returns > 0 — the directive currently does not survive tsup/esbuild bundling at all (0 occurrences), so all 46 stateful components are undeclared client components
  2. Importing any interactive component from a Next.js App Router server component does not throw a "useState only works in Client Components" build error
  3. `tsc --noEmit` type-checks the 179 previously-excluded `*.test.tsx` / `*.stories.tsx` files
  4. All type errors surfaced by (3) are fixed, not suppressed
  5. Full suite still green: tests, lint, build
**Plans**: TBD

### Phase 29: Tier 2 — Quality Automation

**Goal**: The classes of defect found by hand in the audit are caught automatically on every run.
**Depends on**: Phase 28
**Requirements**: REQ-hardening-lint, REQ-hardening-axe, REQ-hardening-coverage
**Status**: ready
**Source**: Production-readiness audit (2026-08-14)
**Success Criteria** (what must be TRUE):
  1. `useExhaustiveDependencies` is re-enabled in biome.json and all resulting findings are resolved (this rule guards the stale-closure class across ~50 hook-using components)
  2. `useButtonType`, `noLabelWithoutControl` and `noExplicitAny` are re-enabled and clean
  3. `@storybook/addon-a11y` is installed and axe runs over every story via `@storybook/test-runner`
  4. Zero axe violations across all stories in light mode, or every accepted exception is documented inline with a reason
  5. Vitest coverage thresholds are configured and met, so coverage cannot silently regress
  6. Playwright visual baselines are regenerated for the intentional focus-ring / scrim / Avatar-palette changes from the hardening pass
**Plans**: TBD

### Phase 30: Tier 3 — Shared Primitives & Styling Architecture

**Goal**: Overlay dismissal is one primitive rather than 15 copies, the inline-vs-CSS boundary is explicit and enforced, and consumers only download the CSS they use.
**Depends on**: Phase 29
**Requirements**: REQ-hardening-dismiss, REQ-hardening-style-boundary, REQ-hardening-css-split
**Status**: ready
**Source**: Production-readiness audit (2026-08-14)
**Success Criteria** (what must be TRUE):
  1. A shared dismiss hook replaces the document-level Escape handler duplicated across 15 files
  2. With nested overlays open, Escape closes only the topmost — today every open overlay responds to a single Escape
  3. The inline-vs-CSS boundary is documented and enforced by a test: no inline style may declare a property that `primitives.css` also declares for the same component (the failure mode that let Button's inline `transition: all .15s` silently override its own reduced-motion guard)
  4. `primitives.css` is split per component with `exports` subpaths, so importing only Button no longer ships 160KB of CSS
  5. The existing single-file CSS entrypoints keep working for current consumers
**Plans**: TBD

### Phase 31: Tier 4 — API Debt

**Goal**: The public API stops leaking internals and stops contradicting itself, in one deliberate breaking release.
**Depends on**: Phase 30
**Requirements**: REQ-hardening-api
**Status**: ready
**Source**: Production-readiness audit (2026-08-14)
**Success Criteria** (what must be TRUE):
  1. Heading/Text/Eyebrow take semantic tones (e.g. `default | muted | accent`) instead of leaking raw token names like `tone="ink-3"`
  2. Button's sizes resolve through `--text-*` and `--radius-*` instead of arbitrary px (fontSize 10/11/12/13, borderRadius 5/7/9)
  3. Card's overlapping `variant` and `tone` axes are resolved into one coherent model (both currently accept `amber`; `variant` is self-documented as "legacy")
  4. Snackbar's tone set matches Toast and AlertBanner rather than being narrower
  5. Card and StickyNote no longer live under `overlays/`, since neither is an overlay
  6. Every breaking change ships with a deprecation alias or a codemod, and CHANGELOG.md documents the hardening pass including the visible focus-ring change
**Plans**: TBD

---

## Progress

**Execution Order:** Phases execute in numeric order: 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27, then the hardening track 28 → 29 → 30 → 31. Phases 28–31 come from the production-readiness audit and do not depend on 24–27 (which remain blocked on spec ingest), so the hardening track can proceed independently. All phases now have spec-level intel; phases 24–27 are ready to plan.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1–16. Foundation & Core | Milestone 1 | — | Complete | Before 2026-05-05 |
| 17. Simple Primitives | Milestone 2 | 5/5 | Complete | 2026-05-05 |
| 18. ConfirmDialog | Milestone 2 | 4/4 | Complete | 2026-05-05 |
| 19. DataViz Primitives | Milestone 2 | 4/4 | Complete | 2026-05-05 |
| 20. StatCard | Milestone 2 | 2/2 | Complete | 2026-05-05 |
| 21. ColorPicker | Milestone 2 | 0/TBD | Not started | - |
| 22. CommandPalette | Milestone 2 | 0/TBD | Not started | - |
| 23. DataGrid | Milestone 2 | 0/TBD | Not started | - |
| 24. Navigation | Milestone 2 | 0/TBD | Blocked | - |
| 25. NotificationCenter | Milestone 2 | 0/TBD | Blocked | - |
| 26. FileUploadZone | Milestone 2 | 0/TBD | Blocked | - |
| 27. MediaCard + StatusPages | Milestone 2 | 0/TBD | Blocked | - |
| 28. Tier 1 — Packaging & Typecheck | Hardening | 2/2 | Complete | 2026-08-14 |
| 29. Tier 2 — Quality Automation | Hardening | 4/4 | Complete | 2026-08-14 |
| 30. Tier 3 — Primitives & Styling | Hardening | 3/3 | Complete | 2026-08-14 |
| 31. Tier 4 — API Debt | Hardening | 6/6 | Complete | 2026-08-14 |
