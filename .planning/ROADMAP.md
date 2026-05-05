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
- [ ] **Phase 20: StatCard** - KPI card composing label, value, trend badge, and Sparkline
- [ ] **Phase 21: ColorPicker** - Full gradient picker with hue/opacity bars, swatches, and inline variant
- [ ] **Phase 22: CommandPalette** - Cmd+K modal search with grouped results and keyboard navigation
- [ ] **Phase 23: DataGrid** - Sortable/resizable/selectable table with bulk actions and pagination
- [ ] **Phase 24: Navigation** *(BLOCKED — awaiting ds-navigation.jsx ingest)* - TreeItem and CollapsibleSidebar
- [ ] **Phase 25: NotificationCenter** *(BLOCKED — awaiting ds-notifications.jsx ingest)* - Notification panel and bell
- [ ] **Phase 26: FileUploadZone** *(BLOCKED — awaiting ds-patterns.jsx ingest)* - Drag-and-drop file upload area
- [ ] **Phase 27: MediaCard + StatusPages** *(BLOCKED — awaiting ds-mediacards.jsx + ds-status.jsx ingest)* - Media card and error/status page templates

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
- [ ] 020-02-PLAN.md — StatCard stories (StatCard.stories.tsx) + barrel export to src/index.ts + tsc + full test suite
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
**Status**: ready
**Estimated components**: 1 (DataGrid)
**Success Criteria** (what must be TRUE):
  1. Clicking a sortable column header toggles asc/desc sort and shows an amber ▲/▼ indicator on the active column
  2. Dragging the 6px resize handle on any column header updates that column's width live with a minimum of 60px
  3. Checking individual row checkboxes or the select-all header checkbox selects rows (highlighted with 4% amber tint); the bulk-action bar slides in when any row is selected
  4. Status cells render the correct `ds-badge` modifier class and priority cells render a correctly-colored 6px dot for each priority level
  5. The footer shows row count in monospace and prev/page/next buttons; the table scrolls horizontally when columns exceed viewport width
  6. Arrow keys navigate between cells and Space bar toggles row selection via keyboard
  7. axe-core scan passes with zero violations in light and dark mode
**Plans**: TBD
**UI hint**: yes

### Phase 24: Navigation
**Goal**: Developers can compose hierarchical tree navigation and a collapsible sidebar from purpose-built components
**Depends on**: Phases 1–16
**Requirements**: REQ-24-01
**Status**: blocked
**Blocker**: Awaiting ingest of `ds-navigation.jsx` — TreeItem and CollapsibleSidebar specs not yet classified
**Estimated components**: 2 (TreeItem, CollapsibleSidebar)
**Success Criteria** (what must be TRUE):
  1. [To be defined after ds-navigation.jsx ingest]
**Plans**: TBD

### Phase 25: NotificationCenter
**Goal**: Users can view, dismiss, and interact with in-app notifications via a notification panel
**Depends on**: Phases 1–16
**Requirements**: REQ-25-01
**Status**: blocked
**Blocker**: Awaiting ingest of `ds-notifications.jsx` — NotificationCenter spec not yet classified
**Estimated components**: 1 (NotificationCenter)
**Success Criteria** (what must be TRUE):
  1. [To be defined after ds-notifications.jsx ingest]
**Plans**: TBD

### Phase 26: FileUploadZone
**Goal**: Users can upload files by dragging and dropping onto a dedicated drop zone
**Depends on**: Phases 1–16
**Requirements**: REQ-26-01
**Status**: blocked
**Blocker**: Awaiting ingest of `ds-patterns.jsx` — FileUploadZone spec not yet classified
**Estimated components**: 1 (FileUploadZone)
**Success Criteria** (what must be TRUE):
  1. [To be defined after ds-patterns.jsx ingest]
**Plans**: TBD

### Phase 27: MediaCard + StatusPages
**Goal**: Developers can render image/media cards with hover overlays and drop-in 404/500/maintenance/offline page templates
**Depends on**: Phases 1–16
**Requirements**: REQ-27-01
**Status**: blocked
**Blocker**: Awaiting ingest of `ds-mediacards.jsx` and `ds-status.jsx` — MediaCard and StatusPages specs not yet classified
**Estimated components**: 2 (MediaCard, StatusPages)
**Success Criteria** (what must be TRUE):
  1. [To be defined after ds-mediacards.jsx + ds-status.jsx ingest]
  2. The 500 StatusPage uses hardcoded `#1c1917` background and `#f5f3f0` text (always-dark DarkSurface, not token-driven)
**Plans**: TBD

---

## Progress

**Execution Order:** Phases execute in numeric order: 17 → 18 → 19 → 20 → 21 → 22 → 23 → (24–27 unblock as specs arrive)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1–16. Foundation & Core | Milestone 1 | — | Complete | Before 2026-05-05 |
| 17. Simple Primitives | Milestone 2 | 5/5 | Complete | 2026-05-05 |
| 18. ConfirmDialog | Milestone 2 | 4/4 | Complete | 2026-05-05 |
| 19. DataViz Primitives | Milestone 2 | 4/4 | Complete | 2026-05-05 |
| 20. StatCard | Milestone 2 | 0/2 | Not started | - |
| 21. ColorPicker | Milestone 2 | 0/TBD | Not started | - |
| 22. CommandPalette | Milestone 2 | 0/TBD | Not started | - |
| 23. DataGrid | Milestone 2 | 0/TBD | Not started | - |
| 24. Navigation | Milestone 2 | 0/TBD | Blocked | - |
| 25. NotificationCenter | Milestone 2 | 0/TBD | Blocked | - |
| 26. FileUploadZone | Milestone 2 | 0/TBD | Blocked | - |
| 27. MediaCard + StatusPages | Milestone 2 | 0/TBD | Blocked | - |
