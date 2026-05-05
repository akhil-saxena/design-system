# Phase 18: Wave 7 — Layout, Patterns, Interaction + Illustrations — Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the 12 remaining v1.0 primitives (DS-71..82) and cut v1.0.0:
- **Layout shell:** AppShell (DS-71), AppBar (DS-72), Footer (DS-73)
- **Illustrations subpath:** `/illustrations` export (DS-81) — 24 named SVG components
- **Patterns:** Wizard (DS-74), FormValidation helpers (DS-75), Coachmark (DS-76)
- **Interaction:** InlineEdit (DS-77), SearchAndFilters (DS-78), Presence/Avatar extension (DS-79)
- **DnD:** Sortable (DS-80) on `@dnd-kit/core` — list reorder + cross-list (Kanban)
- **Reserved:** DS-82 (any v1.0 finishing primitive surfaced during planning)

Phase completes with v1.0.0 release: full CHANGELOG.md, README updated with three-subpath
import map, dist/ types clean, Storybook deploying all primitives.

</domain>

<decisions>
## Implementation Decisions

### AppShell (DS-71)

- **D-01 Sidebar responsive behaviour:** Icon rail collapse — sidebar shrinks from full-width
  to a 48px icon-only rail below the breakpoint (default 768px). Clicking an icon in the
  collapsed state expands the sidebar back to full width.

- **D-02 Slot API:** Props-based slots — `<AppShell sidebar={<Nav/>} topbar={<AppBar/>}
  main={<Page/>} footer={<Footer/>}>`. AppBar (DS-72) is a standalone primitive passed into
  the `topbar` slot, NOT rendered internally by AppShell.

- **D-03 Sidebar state persistence:** localStorage by default, opt-out via `storageKey` prop.
  Pass `storageKey={null}` to disable persistence. Resets to expanded on every reload without it.

- **D-04 AppBar composition:** AppBar (DS-72) is fully standalone — consumer passes it as the
  `topbar` slot. Follows our compose-don't-inherit pattern (same as how Button is passed into
  Modal footer).

### AppBar (DS-72) + Footer (DS-73)

- **D-05:** No additional decisions locked — planner follows handoff `ds-appbar.jsx` for the
  4 variants (minimal / with search / with user menu / contextual) and `ds-footer.jsx` for
  compact (1 line) + expanded (4-col) variants. These inherit all existing DS tokens and patterns.

### Illustrations subpath (DS-81)

- **D-06 Format:** Inline SVG React components — same pattern as `/icons` subpath. Each of the
  24 illustrations exports as a named component:
  `import { EmptyInbox } from '@akhil-saxena/design-system/illustrations'`

- **D-07 Palette:** Allow per-illustration accent colours (blue, green, red allowed in addition
  to the cream+ink+amber base). Not strictly monochrome — illustrations can be expressive.

- **D-08 Count:** All 24 illustrations from `design_handoff/design-system/ds-illustrations.jsx`
  ship in v1.0. No curation — ship them all.

- **D-09 Size API:** `width` + `height` props (not a single `size` prop). Default `120×120`.
  Pattern mirrors Icon wrapper: `<EmptyInbox width={160} height={120} />`.

- **D-10 Dark mode:** Left to planner's discretion based on SVG source analysis. Use token-flip
  where SVGs use CSS custom properties; hardcode where they use fixed brand colours.

### Sortable / DnD (DS-80)

- **D-11 Library:** `@dnd-kit/core` + `@dnd-kit/sortable` confirmed. Install both as
  dependencies (not peer deps — consumer shouldn't need to install separately).

- **D-12 Scope:** List reorder **and** cross-list / Kanban-column reorder. Both `Sortable`
  (list) and a way to move items between lists ship in v1.0.

- **D-13 Keyboard UX:** Space to lift → Arrow keys to move → Space to drop. Tab exits drag
  mode. Matches @dnd-kit standard keyboard sensor + WAI-ARIA sortable pattern.

- **D-14 Drop indicator:** 1px amber line between items showing where the item will land.
  Consistent with our border-over-shadow aesthetic and amber brand accent.

- **D-15 Reduced motion:** `prefers-reduced-motion` respected — skip transform spring/easing,
  use instant repositioning. Already spec'd in ROADMAP.md; planner enforces it.

### Phase wave ordering

- **D-16 Wave 1:** AppShell + AppBar + Footer (DS-71, 72, 73) — the layout shell first.
- **D-17 Wave 2:** Illustrations subpath infra + all 24 SVG components (DS-81) — get
  `/illustrations` subpath build in place early; EmptyState consumers can adopt immediately.
- **D-18 Waves 3-4:** Pattern helpers (Wizard DS-74, FormValidation DS-75, Coachmark DS-76)
  and Interaction primitives (InlineEdit DS-77, SearchAndFilters DS-78, Presence DS-79) — mixed
  between waves based on dependencies. Planner determines exact grouping.
- **D-19 Final wave:** Sortable DS-80 — last wave, most unknowns (@dnd-kit install, keyboard +
  touch + iOS Safari testing).

### Claude's Discretion

- **AppBar search integration:** Whether the AppBar "with search" variant embeds a full
  SearchAndFilters (DS-78) component or a standalone input — planner decides based on
  dependency order (DS-78 ships in a later wave than AppBar).
- **Illustration dark mode:** Specific flip behaviour (token-based vs hardcoded) per SVG.
- **Wave 3 vs 4 split:** Exact primitive assignment between waves 3 and 4 for patterns +
  interaction group.
- **DS-82 reserved slot:** Whether to use it and for what — surface during planning if needed.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design handoff sources (authoritative for each primitive's API + visuals)
- `design_handoff/design-system/ds-shell.jsx` — AppShell (DS-71) source of truth
- `design_handoff/design-system/ds-appbar.jsx` — AppBar (DS-72) source of truth; 4 variants defined
- `design_handoff/design-system/ds-wizard.jsx` — Wizard (DS-74) source of truth
- `design_handoff/design-system/ds-formvalidation.jsx` — FormValidation (DS-75) source
- `design_handoff/design-system/ds-coachmarks.jsx` — Coachmark (DS-76) source of truth
- `design_handoff/design-system/ds-editable.jsx` — InlineEdit (DS-77) source of truth
- `design_handoff/design-system/ds-search.jsx` — SearchAndFilters (DS-78) source
- `design_handoff/design-system/ds-illustrations.jsx` — All 24 illustration SVGs (DS-81)
- `design_handoff/README.md` §"Sections (53)" — master coverage map; use for v1.0 audit

### Existing DS infrastructure to reuse / extend
- `src/_internals/DSPortal.tsx` — SSR-safe portal; use for Coachmark floating hint
- `src/_internals/DSDropdown.tsx` — dropdown chrome; SearchAndFilters dropdown reuses this
- `src/hooks/useFocusTrap.ts` — Wizard modal step trapping; already handles callback-ref pattern
- `src/hooks/useClickOutside.ts` — Coachmark dismiss on outside click
- `src/hooks/useReducedMotion.ts` — Sortable animation gating
- `src/ProgressBar.tsx` — Wizard uses ProgressBar for step progress indicator
- `src/Avatar.tsx` — Presence (DS-79) extends Avatar with new dot-position variants
- `src/Chip.tsx` — SearchAndFilters filter chips reuse Chip primitive
- `src/Popover.tsx` — Coachmark anchored hint built on Popover
- `src/icons/index.ts` — Subpath export pattern to replicate for /illustrations

### Phase 17 patterns to mirror exactly
- `src/Calendar.tsx` — see `_internals/floatingPos.ts` import for smart positioning pattern
- `.storybook/main.ts` — stories glob includes `*.mdx`; /illustrations stories follow same pattern
- `src/primitives.css` — `.dark .ds-atom-*` scoping (not `:root.dark`); established in Phase 17 QA

### Roadmap + project
- `.planning/ROADMAP.md` §"Phase 18" — full primitive table, success criteria, depends-on spec
- `.planning/PROJECT.md` — aesthetic constraints (cream+ink+amber, borders over shadows, AAA contrast)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DSPortal` — Coachmark anchors float to `document.body` via this
- `DSDropdown` — SearchAndFilters' autocomplete dropdown inherits its chrome
- `useFocusTrap(node, active)` — callback-ref pattern; Wizard dialog steps use this
- `ProgressBar` — Wizard step indicator; already has determinate + indeterminate modes
- `Avatar` (with `presence` prop) — DS-79 extends the existing presence dot system
- `Chip` (with `tone` + interactive pattern) — SearchAndFilters filter chips
- `Popover` — Coachmark is an anchored Popover variant with dismiss + localStorage key
- `/icons` subpath — exact build pattern to replicate for `/illustrations` subpath

### Established Patterns
- **Inline styles + CSS class** — no CSS-in-JS; all DS primitives use `ds-atom-*` CSS classes
- **`.dark` ancestor scoping** — all dark mode overrides use `.dark .ds-atom-*` (not `:root.dark`)
- **Callback ref for panel mounting** — `useState<HTMLDivElement | null>(null)` + `setPanel` ref
- **`data-variant` keying** — CSS selects on `[data-variant="X"]` not class variants
- **Controlled/uncontrolled duality** — `value` + `onChange` for controlled; `defaultValue` for uncontrolled

### Integration Points
- AppShell consumes AppBar (as `topbar` slot), Sidebar (consumer-provided), Footer (DS-73)
- Wizard internally uses ProgressBar (already shipped) for step indicator
- SearchAndFilters composes Chip (already shipped) for filter tokens
- EmptyState can accept an illustration component as `icon` prop
- `/illustrations` subpath mirrors `/icons` subpath export structure in tsup config

</code_context>

<specifics>
## Specific Ideas

- AppShell icon rail: 48px collapsed width (matches VS Code / Linear aesthetic)
- Sortable drop indicator: 1px solid `var(--amber)` line between items — not a shadow, not a ghost
- Illustrations: width+height default `120×120`, same as we do for large icons in EmptyState
- All 24 illustrations from `ds-illustrations.jsx` — no curation needed, they're already designed
- Cross-list DnD scope: covers the JobDash kanban column use case

</specifics>

<deferred>
## Deferred Ideas

- **Kanban column reorder** (moving columns left/right, not items between columns) — DS-80 ships
  item reorder within and between columns, not column-level reorder. That's a follow-up.
- **URL-synced Wizard steps** — Wizard is component-state only in v1.0. URL routing integration
  is consumer responsibility.
- **Illustration builder / theme tokens** — keeping illustrations as static SVG components;
  a token-driven illustration customisation system would be v2.
- **AppShell breakpoint theming** — single breakpoint at 768px for v1.0. Multi-breakpoint
  (tablet-mid, desktop-wide) deferred.

</deferred>

---

*Phase: 18-wave-7-layout-patterns-interaction-illustrations*
*Context gathered: 2026-05-02*
