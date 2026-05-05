# Phase 17: Wave 6 — Icons + Data Display Primitives - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 17-Wave 6 — Icons + Data Display Primitives
**Areas discussed:** Icon strategy reconciliation, Table primitive scope, RichText editor scope, Calendar vs DatePicker boundary

---

## Icon strategy reconciliation

**Discovered during scout:** lucide-react ^1.8.0 is already a dep in 14 primitives (~25 unique icons used: ChevronDown, Check, X, Star, Search, Plus, Minus, Copy, AlertTriangle, etc). PROJECT.md previously locked "ship our own brand-locked 1.5px stroke set" — but lucide is already in. This had to be reconciled before proceeding.

| Option | Description | Selected |
|--------|-------------|----------|
| Lucide + brand-lock wrapper | Update lucide-react. Add `<Icon>` wrapper with defaults (size=20, strokeWidth=1.5, currentColor). Refactor 14 internal usages. /icons subpath re-exports through wrapper. Tree-shakeable. Zero icon porting. | ✓ |
| Port custom set; drop lucide | Codegen 119 icon components from `ds-iconset.jsx`, drop lucide dep, refactor 14 primitives. Maximum brand control; significant porting work. | |
| Hybrid: ship custom /icons + keep lucide internal | Two icon systems coexist; messy boundary. | |
| Re-export lucide as our /icons subpath | Cheapest; zero brand control; contradicts PROJECT.md intent. | |

**User's choice:** Lucide + brand-lock wrapper (Recommended).
**Notes:** Lucide's 1.5px stroke when configured matches the design intent perfectly. No need to port 119 custom icons just for stroke-width parity. Wrapper enforces visual unity at import time so no callsite can drift.

---

## Table primitive scope

**Question 1: API shape**

| Option | Description | Selected |
|--------|-------------|----------|
| Composable subcomponents | `Table.Root` / `Table.Header` / `Table.Row` / `Table.Cell`. Helper hooks (useSortableTable, useTableSelection). Matches existing Modal/Sheet/Lightbox composability. One primitive covers Data Table and Data Grid via composition. | ✓ |
| Smart Table + headless DataGrid | Two primitives, two API styles. Heavier maintenance. | |
| Single smart Table | One primitive with many props. Easier consumer story, harder to maintain. | |
| TanStack Table wrapper | Best feature coverage; foreign API style; new runtime dep. | |

**User's choice:** Composable subcomponents (Recommended).

**Question 2: Which Data Grid features ship in Phase 17?**

| Option | Description | Selected |
|--------|-------------|----------|
| Sortable headers + density modes | Click-to-sort with chevron-in-header. Three densities. Sticky header via CSS. | ✓ (Required) |
| Row selection with our Checkbox | useTableSelection hook + Table.SelectAllCell + Table.SelectCell. | ✓ |
| Resizable columns | Drag-edge resize, min 60px, persistable via onWidthsChange. | ✓ |
| Built-in pagination footer | Table.Pagination component with prev/next/page-numbers. | ✓ |

**User's choice:** All four — full Data Grid feature set ships in DS-61.
**Notes:** Heavy primitive. Planner may split Table into 2+ plan files. (e.g., 17-02: chrome + sort + density; 17-03: selection + resize + pagination.)

---

## RichText editor scope (TipTap)

| Option | Description | Selected |
|--------|-------------|----------|
| Core formatting | Bold / italic / underline / strike / inline-code. Cmd+B/I/U shortcuts. Markdown shortcuts. | ✓ (Required) |
| Block-level + lists | H2/H3, ul/ol, blockquote, hr. Markdown shortcuts (`## h2`, `- list`, etc). | ✓ |
| Link extension | Cmd+K to insert link, popover with URL input + remove. Auto-link on paste. | ✓ |
| Mentions / slash-commands | TipTap Mention + Suggestion extensions. Real complexity. | |

**User's choice:** Core + Block + Link. Mentions/slash deferred to v1.1.
**Notes:** Output format defaults to HTML string with optional JSON via `outputFormat` prop. Paste behavior is TipTap default rich paste — plain-text-only paste mode deferred.

---

## Calendar vs DatePicker boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Full month/week/day + extract shared month-grid | Three view modes. Extract DatePicker month-grid utility into `_internals/calendarGrid.ts` — both DatePicker and Calendar consume it. Events as chips on cells + popover/Sheet on day-click. AgendaList as consumer slot. | ✓ |
| Month-only + reuse DatePicker grid | Just month view. Defer week/day to v1.1. | |
| Standalone build, all three views | Don't reuse DatePicker; calendar-specific utilities. Slight duplication. | |
| Headless engine + chrome | useCalendar() hook returns grid + helpers. Most flexible, larger API surface. | |

**User's choice:** Full month/week/day + extract shared month-grid (Recommended).
**Notes:** Requires DatePicker + DateRangePicker refactor to consume the extracted utility — assert no visual regression via existing Playwright baselines before merging. Calendar uses SegmentedControl (DS-63) for view toggle — DS-63 must land before DS-68.

---

## Claude's Discretion

The following decisions are delegated to Claude/planner during plan-phase:
- Whether to split lucide refactor into its own PLAN file or fold into 17-01 (Icons setup) — based on diff size estimation.
- tsup multi-entry config layout (single config file with array of entries vs multiple files).
- Whether `useResizableColumns` persists to localStorage automatically or just emits onWidthsChange.
- Whether RichText supports a `className` prop for styling the editor surface.
- Storybook story count per primitive — match existing wave conventions.
- Visual baseline regen strategy — cumulative re-baseline at wave-completion commit.
- Specific lucide-react version to pin — latest stable at planning time; verify React 19 compat.

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. Summary:

**v1.1+ (not Phase 18):**
- RichText: Mentions, slash-commands, plain-text-paste mode, code-block syntax highlighting, task list, collaboration
- Calendar: AgendaList chrome, multi-day event rendering, additional view modes (year, agenda-only)
- Table: Column reordering (drag headers), built-in virtualization wrapper

**Out of scope (already decided in roadmap):**
- Grid responsive card wrapper (consumer CSS Grid is sufficient)
- Custom 119-icon set port (superseded by lucide standardization decision; ds-iconset.jsx remains as reference asset)
