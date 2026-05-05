# Phase 23: DataGrid - Research

**Researched:** 2026-05-05
**Domain:** React compound component — sortable/resizable/selectable data table with bulk actions
**Confidence:** HIGH (all findings verified against live codebase)

---

## Summary

Phase 23 DataGrid is a composition task, not a from-scratch task. The codebase already ships every infrastructure primitive the spec requires: `Table` compound component with sort, resize, and selection support; `useResizableColumns`, `useSortableTable`, and `useTableSelection` hooks; `Badge`, `Checkbox`, and `Button` components; and full CSS for selection tints, resize handles, and sort indicators. The design handoff (`ds-datagrid.jsx`) provides a complete working reference implementation in vanilla React + CSS class names.

The primary architectural question — build on top of `Table` or implement `DataGrid` from scratch — resolves clearly in favour of composing on top of `Table`. The Table compound component already supports every feature the DataGrid spec requires (sorting, resize handles, selection checkboxes, `data-selected` tint). DataGrid's job is to provide a higher-level, job-application-specific abstraction that wires these primitives together with a `columns` array prop API, status badge rendering, priority dot rendering, a bulk-action bar, and the footer row count.

No new CSS atoms are needed for the core table mechanics. Three minor CSS additions are required: the bulk-action bar container, the priority dot + label inline pattern, and the glass container layout for the DataGrid wrapper. All existing `ds-atom-table-*` classes are reused directly through the Table compound component.

**Primary recommendation:** Implement `DataGrid` as a single file at `src/data-display/DataGrid/index.tsx` that composes `Table.*`, `Badge`, `Checkbox`, `Button`, and the three table hooks. No new hook is needed. Keyboard navigation (arrow keys + Space) requires a `useRef` on the table element and a `keydown` handler that queries `[role="gridcell"]` or `td.ds-atom-table-cell` elements.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Column sort state | DataGrid component (React state) | useSortableTable hook | Hook owns state + sorted derivation; DataGrid wires it |
| Column resize state | DataGrid component (React state) | useResizableColumns hook | Hook owns pointer capture + width state; DataGrid passes widths to Table.HeaderCell |
| Row selection state | DataGrid component (React state) | useTableSelection hook | Hook owns selectedIds Set, isAllSelected, isIndeterminate; DataGrid wires checkboxes |
| Bulk-action bar visibility | DataGrid component | — | Derived from `selectedIds.length > 0`; renders as sibling above scroll container |
| Status badge rendering | DataGrid component | Badge component | DataGrid maps status string to BadgeTone; Badge renders the pill |
| Priority dot rendering | DataGrid component | — | Inline span with CSS color token; no separate component needed |
| Pagination footer | DataGrid component | Pagination component (Phase 17) | DataGrid owns page state; Pagination renders the control |
| Keyboard cell navigation | DataGrid component | — | `onKeyDown` on table wrapper; queries td elements by index math |
| CSS layout (glass surface, scroll) | DataGrid component (inline styles / className) | primitives.css (existing) | `className="glass"` + `overflowX: auto` wrapper; no new CSS atoms for structure |
| ARIA grid semantics | Table.Root + DataGrid | — | Table.Root renders `<table>`; DataGrid adds `role="grid"` override or wraps in a labeled region |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-23-01 | DataGrid: sortable columns, column resize, row selection + bulk-action bar, status badges, priority dots, footer pagination, horizontal scroll, keyboard nav, axe-core clean | Table compound component + 3 hooks cover mechanics; Badge covers status; Button covers bulk actions; Pagination covers footer; inline CSS covers dots and tints |
</phase_requirements>

---

## Standard Stack

### Core — all already in repo, no new installs

| Library / Module | Location | Purpose | Status |
|-----------------|----------|---------|--------|
| `Table` compound component | `src/data-display/Table/index.tsx` | HTML table structure, sort indicators, resize handles, selection cells | VERIFIED: shipped Phase 17 |
| `useResizableColumns` | `src/hooks/useResizableColumns.ts` | Pointer-capture column drag with min-width clamp | VERIFIED: shipped Phase 17 |
| `useSortableTable` | `src/hooks/useSortableTable.ts` | Sort state + derived sorted array via useMemo | VERIFIED: shipped Phase 17 |
| `useTableSelection` | `src/hooks/useTableSelection.ts` | selectedIds array, isAllSelected, isIndeterminate, toggle, toggleAll, clear | VERIFIED: shipped Phase 17 |
| `Badge` | `src/inputs/Badge/index.tsx` | Status badge rendering via `tone` prop | VERIFIED: shipped Milestone 1 |
| `Button` | `src/inputs/Button/index.tsx` | Bulk-action bar buttons; supports `variant="danger"` and `size="xs"` | VERIFIED: shipped Milestone 1 |
| `Pagination` | `src/data-display/Pagination/index.tsx` | Footer page nav | VERIFIED: shipped Phase 17 |
| `Checkbox` | `src/inputs/Checkbox/index.tsx` | Used internally by `Table.SelectAllCell` and `Table.SelectCell` | VERIFIED: shipped Milestone 1 |

### No new npm installs required

All dependencies are already in `package.json`. The DataGrid is a pure composition.

---

## Architecture Patterns

### Build on Table — Not From Scratch

The `ds-datagrid.jsx` handoff uses raw `<table className="ds-table">`, raw `<div className="ds-checkbox">`, and inline `mousemove` listeners on `document`. The existing `Table` compound component already provides all of those as proper React components with pointer capture, accessibility attributes, and CSS atoms. DataGrid should use `Table.*` components rather than repeating the handoff's raw HTML pattern.

**Decision: `DataGrid` composes `Table.*` + hooks. It does NOT implement its own resize, sort, or checkbox logic.**

### System Architecture Diagram

```
DataGrid props (columns, rows, page, onPageChange)
        │
        ├── useSortableTable(rows)  →  sorted[]
        ├── useResizableColumns(initialWidths)  →  widths{}
        ├── useTableSelection(rowIds)  →  selectedIds[], toggleAll, toggle
        │
        ├── [sel.length > 0] BulkActionBar
        │     └── Button xs (Export) | Button xs danger (Archive) | Button xs ghost (Clear)
        │
        ├── overflowX: auto wrapper
        │   └── Table.Root (className="ds-atom-table", role="grid" via ariaLabel)
        │       ├── Table.Header
        │       │   └── Table.Row
        │       │       ├── Table.SelectAllCell (isAllSelected, isIndeterminate, toggleAll)
        │       │       └── [each col] Table.HeaderCell (sortable, sortDir, width, onResizeStart)
        │       └── Table.Body
        │           └── [each row] Table.Row (selected=isSelected(row.id))
        │               ├── Table.SelectCell (selected, onToggle)
        │               ├── Table.Cell – company (fontWeight 600)
        │               ├── Table.Cell – role
        │               ├── Table.Cell – <Badge tone={STATUS_MAP[row.status].tone}>
        │               ├── Table.Cell – salary (mono 12px, textAlign right)
        │               ├── Table.Cell – applied date (mono 11px)
        │               └── Table.Cell – priority dot + label
        │
        └── Footer (borderTop, flexbox)
              ├── <span> mono 10px --ink-4 "{rows.length} rows"
              └── <Pagination> (compact variant, page, totalPages, onPageChange)
```

### Recommended Project Structure

```
src/data-display/DataGrid/
├── index.tsx          # DataGrid component — only public export
├── DataGrid.test.tsx  # vitest unit tests
└── DataGrid.stories.tsx  # Storybook stories
```

### Pattern 1: Column Schema Type

The REQ-23-01 spec mandates this exact column type:

```typescript
// Source: REQUIREMENTS.md REQ-23-01
export interface DataGridColumn {
  key: string;
  label: string;
  width: number;
  sortable?: boolean;
  align?: "left" | "right";
}
```

The `rows` prop should accept `Record<string, unknown>[]` with a required `id: number | string` field. Use a generic or intersection type:

```typescript
export type DataGridRow = Record<string, unknown> & { id: string | number };

export interface DataGridProps {
  columns: DataGridColumn[];
  rows: DataGridRow[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### Pattern 2: Status Badge Mapping

```typescript
// Source: ds-datagrid.jsx DG_STATUS + REQ-23-01 acceptance criteria
// VERIFIED: BadgeTone type in src/inputs/Badge/index.tsx includes all four tones
const STATUS_BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  applied:      { label: "Applied",   tone: "upcoming" },
  interviewing: { label: "Interview", tone: "done"     },
  offer:        { label: "Offer",     tone: "passed"   },
  rejected:     { label: "Rejected",  tone: "pending"  },
};
```

**Verified:** `BadgeTone = "upcoming" | "passed" | "pending" | "done" | "count" | "neutral"` — all four required tones exist. [VERIFIED: src/inputs/Badge/index.tsx line 3]

### Pattern 3: Priority Dot Rendering

```typescript
// Source: ds-datagrid.jsx DG_PRIO
// VERIFIED: --red-vivid, --amber-vivid, --green-vivid defined in tokens.css lines 56-60
const PRIORITY_COLOR: Record<string, string> = {
  high:   "var(--red-vivid)",
  medium: "var(--amber-vivid)",
  low:    "var(--green-vivid)",
};

// Rendered inline (no separate component needed):
<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_COLOR[row.priority as string] ?? "var(--ink-4)" }} aria-hidden="true" />
  <span style={{ fontSize: 12, textTransform: "capitalize" }}>{String(row.priority)}</span>
</span>
```

**Verified:** All three vivid tokens exist in `tokens.css` (light: lines 56–60, dark: lines 163–167 — same values per handoff comment "vivids are identical"). [VERIFIED: src/tokens.css]

### Pattern 4: Column Resize with Hooks

```typescript
// Source: src/hooks/useResizableColumns.ts
// useResizableColumns uses Pointer Events (setPointerCapture) — NOT mousemove on document
// The handoff uses mousemove; the hook is the correct implementation.
const initialWidths = Object.fromEntries(columns.map(c => [c.key, c.width]));
const { widths, startResize } = useResizableColumns(initialWidths, { minWidth: 60 });

// In header render:
<Table.HeaderCell
  key={col.key}
  sortable={col.sortable}
  sortDir={sortCol === col.key ? sortDir : null}
  onToggleSort={() => col.sortable && toggleSort(col.key as keyof DataGridRow)}
  resizable
  width={widths[col.key]}
  onResizeStart={(e) => startResize(col.key, e)}
  style={{ textAlign: col.align ?? "left" }}
>
  {col.label}
</Table.HeaderCell>
```

### Pattern 5: Bulk-Action Bar

```typescript
// Source: ds-datagrid.jsx lines 62-69
// Uses amber tint background, flex row, xs buttons
{selectedIds.length > 0 && (
  <div style={{
    padding: "8px 16px",
    background: "rgba(245,158,11,.05)",
    borderBottom: "1px solid var(--rule)",
    display: "flex", alignItems: "center", gap: 10, fontSize: 12
  }}>
    <span style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 11 }}>
      {selectedIds.length} selected
    </span>
    <Button variant="secondary" size="xs">Export</Button>
    <Button variant="danger" size="xs">Archive</Button>
    <Button variant="ghost" size="xs" onClick={clear} style={{ marginLeft: "auto" }}>
      Clear
    </Button>
  </div>
)}
```

**Note on "Archive" button:** The spec says `ds-btn danger`. The React Button component uses `variant="danger"`. [VERIFIED: src/inputs/Button/index.tsx line 3]

### Pattern 6: Arrow Key Cell Navigation

The `Table.Root` does not implement arrow key navigation — it only manages `aria-sort` and `aria-selected`. DataGrid must add a `keydown` listener on the table wrapper div.

Strategy: maintain a `[rowIdx, colIdx]` state for the focused cell. On `ArrowUp/Down/Left/Right`, compute next indices and imperatively call `.focus()` on the target `td` element. Cells need `tabIndex={-1}` (except the currently focused one, which gets `tabIndex={0}`).

```typescript
// Roving tabindex pattern — standard for grid widget (WAI-ARIA 1.2 grid pattern)
// focusedCell: [rowIndex, colIdx] (0-based, colIdx 0 = checkbox column)
const [focusedCell, setFocusedCell] = React.useState<[number, number]>([0, 1]);

function handleGridKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  const rows = sorted.length;
  const cols = columns.length + 1; // +1 for checkbox column
  let [r, c] = focusedCell;

  if (e.key === "ArrowDown")  { e.preventDefault(); r = Math.min(r + 1, rows - 1); }
  if (e.key === "ArrowUp")    { e.preventDefault(); r = Math.max(r - 1, 0); }
  if (e.key === "ArrowRight") { e.preventDefault(); c = Math.min(c + 1, cols - 1); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); c = Math.max(c - 1, 0); }
  if (e.key === " ") {
    e.preventDefault();
    toggle(sorted[r]!.id as string | number);
    return;
  }

  setFocusedCell([r, c]);
  // Imperatively focus the td
  const tableEl = tableRef.current;
  const tds = tableEl?.querySelectorAll<HTMLElement>("tbody tr");
  tds?.[r]?.querySelectorAll<HTMLElement>("td")?.[c]?.focus();
}
```

**ARIA note:** Add `role="grid"` to the `Table.Root` via the `aria-label` prop is insufficient — `Table.Root` renders `<table aria-label="...">` but not `role="grid"`. The Table component does not add `role="grid"` (verified: it uses the native `<table>` element which has implicit `role="table"`). For the full WAI-ARIA grid pattern (arrow key nav), either:
- Pass `role="grid"` explicitly via spread: `<Table.Root role="grid" ...>` — `TableRootProps extends React.TableHTMLAttributes<HTMLTableElement>` so this works.
- Or wrap the table in a div with `role="grid"` (less clean).

**Recommended:** `<Table.Root role="grid" multiSelectable ariaLabel="Job applications">` — spreads cleanly. [VERIFIED: TableRootProps extends React.TableHTMLAttributes so custom role overrides are accepted]

### Pattern 7: Pagination in Footer

The REQ spec says the footer uses `ds-page-btn` prev/pages/next. The handoff uses raw `<button className="ds-page-btn">`. For the React component, use the `Pagination` component from Phase 17:

```typescript
// Source: src/data-display/Pagination/index.tsx
// Pagination renders as <nav> — must NOT be inside <table>
// Footer is rendered OUTSIDE the table, inside the glass container:

<div style={{ /* glass wrapper */ overflow: "hidden" }}>
  {/* bulk action bar */}
  <div style={{ overflowX: "auto" }}>
    <Table.Root role="grid" ...>
      ...
    </Table.Root>
  </div>
  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>
      {rows.length} rows
    </span>
    <Pagination
      totalPages={totalPages}
      currentPage={page}
      onPageChange={onPageChange}
      variant="full"
    />
  </div>
</div>
```

**Critical:** `<nav>` inside `<table>` is invalid HTML. The Table component's own JSDoc (line 101–122) documents this explicitly. Footer must be a sibling of the table, inside the outer glass `<div>`. [VERIFIED: src/data-display/Table/index.tsx lines 101-122]

### Anti-Patterns to Avoid

- **Do not add `mousemove` on `document` for resize.** The handoff does this. `useResizableColumns` uses `setPointerCapture` on the handle element instead — this is more correct because pointer capture continues tracking even when the cursor leaves the window. [VERIFIED: src/hooks/useResizableColumns.ts lines 60-62]
- **Do not render `<Pagination>` inside `<Table.Root>`.** Nav inside table is invalid HTML and causes AT issues. The Table JSDoc documents this with a "GOOD / BAD" example. [VERIFIED: src/data-display/Table/index.tsx lines 101-122]
- **Do not implement a custom checkbox div.** The handoff uses `<div className="ds-checkbox checked">` with inline SVG. The `Checkbox` component (used by `Table.SelectAllCell` / `Table.SelectCell`) handles this correctly including the `indeterminate` state. [VERIFIED: src/inputs/Checkbox/index.tsx]
- **Do not add `position: relative` to `<th>` for the resize handle.** This is already provided by `.ds-atom-table-headercell-sortable, .ds-atom-table-headercell { position: relative; }` in primitives.css lines 3472-3474. [VERIFIED: src/primitives.css lines 3472-3474]
- **Do not create a new `useDataGridKeyboard` hook.** The nav logic is tightly coupled to the column/row count of this specific component. Inline it with a `useCallback` or `useRef`-based handler in the DataGrid component itself.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Column resize with pointer tracking | Custom `mousemove` on `document` (as in handoff) | `useResizableColumns` hook | Hook uses `setPointerCapture` — tracks correctly on fast drags; handles cleanup on `pointerup` |
| Sort state + sorted rows | Custom `useState` + `Array.sort` inline | `useSortableTable` hook | Hook provides `toggleSort`, stable sort (ES2019), `null` → unsorted state, and custom comparator support |
| Row selection with indeterminate | Manual `Set` state (as in handoff) | `useTableSelection` hook | Hook provides `isIndeterminate`, controlled/uncontrolled modes, single/multi mode, `onSelectionChange` callback |
| Checkbox with indeterminate state | `<div className="ds-checkbox">` (as in handoff) | `Table.SelectAllCell` + `Table.SelectCell` (use `Checkbox` internally) | Native `indeterminate` DOM property set correctly via `useEffect`; handles `ref` composition |
| Status pill rendering | Custom `<span>` with inline background | `Badge` component with `tone` prop | Badge already ships all four required tones (upcoming/done/passed/pending) with correct typography |
| Pagination footer | Raw `<button className="ds-page-btn">` (as in handoff) | `Pagination` component (`variant="full"`) | Pagination handles ellipsis, aria-current, disabled prev/next, keyboard arrow navigation |

**Key insight:** The handoff (`ds-datagrid.jsx`) was written to demonstrate visual output in a browser without a build step. The React component should use the proper abstraction layer already built in the prior phases. Every raw CSS class in the handoff corresponds to an existing React component.

---

## Common Pitfalls

### Pitfall 1: `<Pagination>` Inside `<table>`
**What goes wrong:** Rendering `<Pagination>` (which renders a `<nav>`) as a child of `Table.Root` or inside a `Table.Cell`. Browsers silently hoist `<nav>` out of `<table>`, breaking layout. Screen readers may report inconsistent landmarks.
**Why it happens:** The footer "feels" like it belongs inside the table structure.
**How to avoid:** The glass `<div>` wraps `[bulk bar] + [overflowX div with table] + [footer div with Pagination]`. Pagination is always a sibling of the scroll container, never a descendant of the table.
**Warning signs:** Storybook console showing "The tag `nav` cannot be a child of `table`."

### Pitfall 2: `userSelect: none` Missing During Resize
**What goes wrong:** Text in the table gets selected while dragging a column resize handle, producing a visual glitch.
**Why it happens:** `mousemove` / `pointermove` during drag triggers browser text selection.
**How to avoid:** The `ds-atom-table-resize-handle` CSS already sets `user-select: none; touch-action: none`. The `useResizableColumns` hook uses pointer capture so the browser suppresses default selection during captured pointer events. No extra work needed if you use the hook and the `Table.HeaderCell` with `resizable` prop.
**Warning signs:** Blue text-selection highlight appearing on table cells during column drag in Storybook.

### Pitfall 3: Missing `tabIndex` on `<td>` for Arrow Key Nav
**What goes wrong:** Arrow key handler calls `.focus()` on a `<td>` but nothing happens because the cell is not focusable.
**Why it happens:** `<td>` is not focusable by default. `tabIndex={-1}` is required for imperative focus to work.
**How to avoid:** Pass `tabIndex={focusedCell[0] === rowIdx && focusedCell[1] === colIdx ? 0 : -1}` on each `Table.Cell` and `Table.SelectCell`. The currently focused cell gets `0`, all others get `-1` (roving tabindex pattern).
**Warning signs:** Arrow keys appear to do nothing; no cell focus ring is visible.

### Pitfall 4: `sortCol` Type Mismatch with Generic Hook
**What goes wrong:** `useSortableTable<DataGridRow>` infers `keyof DataGridRow` as `string | number | symbol` (since `DataGridRow = Record<string, unknown> & { id: ... }`). Passing `col.key` (a `string`) to `toggleSort` produces a TypeScript error.
**Why it happens:** `Record<string, unknown>` keys include `symbol` via `keyof`.
**How to avoid:** Cast: `toggleSort(col.key as keyof DataGridRow)`. Alternatively, define a specific row type for the job-application use case and pass it as the generic.
**Warning signs:** `tsc` error: "Argument of type 'string' is not assignable to parameter of type 'keyof DataGridRow'."

### Pitfall 5: Amber Tint Percentages — spec vs CSS atom
**What goes wrong:** The spec says selected rows get "4% amber tint." The existing `ds-atom-table-row[data-selected="true"]` CSS uses `color-mix(in srgb, var(--amber) 14%, transparent)` — not 4%. [VERIFIED: src/primitives.css line 3454-3456]
**Why it happens:** The CSS atom was likely calibrated to look right at 14%, not 4%. The handoff uses `rgba(245,158,11,.04)` (4%).
**How to avoid:** Use `Table.Row` with `selected` prop which applies `data-selected="true"` and therefore uses the CSS atom (14%). This is the correct approach — the CSS atom is the source of truth for the design system, not the handoff's raw rgba value. Document this intentional difference in the component's JSDoc.
**Warning signs:** If the planner uses inline `style={{ background: "rgba(245,158,11,.04)" }}` instead of the `selected` prop, the dark mode override (line 3497) won't apply.

### Pitfall 6: `role="grid"` on `<table>` Element
**What goes wrong:** Biome lint rule `lint/a11y/useSemanticElements` may flag `role="grid"` on `<table>` because `<table>` already has an implicit `role="table"`, and overriding it with `role="grid"` changes semantics.
**Why it happens:** `grid` and `table` are different ARIA roles with different interaction model expectations (grid expects arrow key nav, table does not).
**How to avoid:** Add a `// biome-ignore lint/a11y/useSemanticElements: role="grid" is intentional — DataGrid implements WAI-ARIA grid pattern requiring arrow key navigation` comment above the `<Table.Root>` element. See existing biome-ignore patterns in `Table/index.tsx` lines 244-245 for the correct format.
**Warning signs:** Biome CI failure in the lint step.

---

## CSS Needs

### No New `ds-atom-*` Classes Required for Table Mechanics

All table CSS atoms already exist in `primitives.css`:
- `.ds-atom-table-row[data-selected="true"]` — 14% amber tint (light) / 18% (dark) [VERIFIED: lines 3454-3498]
- `.ds-atom-table-resize-handle` — 6px wide, `col-resize` cursor [VERIFIED: lines 3457-3470]
- `.ds-atom-table-sort-indicator` — amber color, 9px mono [VERIFIED: lines 3386-3392]
- `.ds-atom-table-selectcell` — 40px width, centred padding [VERIFIED: lines 3449-3453]

### New CSS Additions Required

Three small blocks belong in `primitives.css` before implementation:

**1. DataGrid glass container + scroll wrapper**
```css
/* DS-62 DataGrid — outer container */
.ds-atom-datagrid {
  border-radius: 14px;
  overflow: hidden;
}
.ds-atom-datagrid-scroll {
  overflow-x: auto;
}
```

**2. DataGrid bulk-action bar**
```css
.ds-atom-datagrid-bulkbar {
  padding: 8px 16px;
  background: rgba(245, 158, 11, 0.05);
  border-bottom: 1px solid var(--rule);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}
.ds-atom-datagrid-bulkbar-count {
  font-weight: 600;
  font-family: var(--mono);
  font-size: 11px;
}
.dark .ds-atom-datagrid-bulkbar {
  background: rgba(245, 158, 11, 0.07);
}
```

**3. DataGrid footer**
```css
.ds-atom-datagrid-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ds-atom-datagrid-footer-count {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-4);
}
```

**Alternative:** These are simple enough to implement as inline `style` objects in the component (as the handoff does), avoiding a CSS plan step. Inline styles are appropriate for one-off structural containers that aren't reused elsewhere. The planner may choose either approach; using CSS atoms is more consistent with the codebase convention but adds a plan step.

---

## State of the Art

| Old Approach (handoff) | Current Approach (codebase) | Impact |
|------------------------|----------------------------|--------|
| `document.addEventListener("mousemove")` for resize | `setPointerCapture` + `document.addEventListener("pointermove")` via `useResizableColumns` | Resize works correctly when cursor leaves browser window |
| Raw `<div className="ds-checkbox checked">` | `Table.SelectAllCell` + `Table.SelectCell` using `Checkbox` component | Indeterminate state, accessible label, `ref` forwarding |
| `<button className="ds-page-btn">` inline HTML | `<Pagination>` component | Full keyboard nav, ellipsis, aria-current |
| Inline `style={{ background: "rgba(245,158,11,.04)" }}` for row selection | `Table.Row selected={true}` → `data-selected="true"` → CSS atom | Dark mode override fires correctly |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The footer uses `<Pagination variant="full">` matching the handoff's prev/pages/next layout | Architecture Patterns | If compact variant is intended, planner changes `variant="full"` to `variant="compact"`; no structural impact |
| A2 | `role="grid"` spread on `Table.Root` is accepted by TypeScript (via `React.TableHTMLAttributes`) | Architecture Patterns | TypeScript would error; fallback is a wrapper `<div role="grid">` around `Table.Root` |
| A3 | Inline styles are acceptable for the bulk-action bar / footer (vs. CSS atoms) | CSS Needs | If codebase convention requires CSS atoms for all layout, one additional CSS plan step is needed |

---

## Open Questions

1. **Pagination state: internal or external?**
   - What we know: The spec says "footer shows row count + prev/page/next buttons." The REQ accepts `page` + `totalPages` + `onPageChange` as external props — suggesting the consumer controls pagination.
   - What's unclear: Should DataGrid internally paginate `rows` (slicing by `page * pageSize`), or does the consumer pre-slice and pass the already-paginated data? The handoff shows 7 static rows with no slicing.
   - Recommendation: Accept `page`/`totalPages`/`onPageChange` as props; let the consumer manage data fetching/slicing. DataGrid renders whatever `rows` it receives. This is the standard pattern for server-side pagination compatibility.

2. **Column-specific cell renderers (company bold, salary mono, applied mono)**
   - What we know: The REQ-23-01 spec lists specific typography per column: salary = `--mono 12px right-aligned`, applied = `--mono 11px`. The handoff hardcodes these per column key.
   - What's unclear: Should columns support a `render?: (value: unknown, row: DataGridRow) => React.ReactNode` prop for custom cell rendering, or should DataGrid hardcode the job-application-specific columns?
   - Recommendation: Hardcode the job-application specific columns for this phase (it's a design system demo component, not a generic data table). The column schema type from the spec does not include a `render` prop.

---

## Environment Availability

Step 2.6: SKIPPED — DataGrid is a pure React composition. No external tools, services, CLIs, or databases required beyond the already-installed npm dependencies.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` |
| Full suite command | `npx vitest run` |

**Note on axe-core:** No `jest-axe` or `vitest-axe` package is installed. [VERIFIED: package.json — no axe dependency found]. The ROADMAP and REQ say "axe-core passes with zero violations in Storybook" — this means the Storybook a11y addon, not automated unit test assertions. The `@storybook/addon-essentials` is installed but does not include the a11y addon. [VERIFIED: .storybook/main.ts]. Prior phases (17–22) follow the same pattern: no axe in unit tests, a11y verified manually in Storybook. DataGrid tests should follow the same pattern.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-23-01-sort | Click sortable header toggles asc/desc; amber indicator shown | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-resize | Drag handle updates column width, min 60px | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-select | Checkbox toggles row selection; select-all toggles all | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-bulkbar | Bulk bar visible when selection > 0; Clear resets selection | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-badge | Status "interviewing" → Badge tone="done"; "offer" → tone="passed" | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-priority | High priority → red dot rendered; color token applied | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-pagination | Pagination component renders in footer; onPageChange fires | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-keyboard | ArrowDown moves focus; Space toggles row selection | unit | `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx` | ❌ Wave 0 |
| REQ-23-01-a11y | axe-core zero violations | manual (Storybook) | — | manual-only |

### Sampling Rate
- **Per task commit:** `npx vitest run src/data-display/DataGrid/DataGrid.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/data-display/DataGrid/DataGrid.test.tsx` — all REQ-23-01 unit tests
- [ ] `src/data-display/DataGrid/DataGrid.stories.tsx` — sorting/selection/bulk-bar/pagination stories

---

## Sources

### Primary (HIGH confidence — verified against live codebase)
- `src/data-display/Table/index.tsx` — compound Table API, TableRootProps, resize handle, sort indicator, selection cells
- `src/hooks/useResizableColumns.ts` — pointer capture resize implementation
- `src/hooks/useSortableTable.ts` — sort state + useMemo derived sorted array
- `src/hooks/useTableSelection.ts` — multi-selection state, indeterminate support
- `src/inputs/Badge/index.tsx` — BadgeTone type, all four required tones verified
- `src/inputs/Button/index.tsx` — ButtonVariant, ButtonSize, danger + xs verified
- `src/data-display/Pagination/index.tsx` — full variant, compact variant, PaginationProps
- `src/primitives.css` lines 3342-3503 — all ds-atom-table-* CSS atoms
- `src/tokens.css` lines 56-60, 163-167 — `--red-vivid`, `--amber-vivid`, `--green-vivid` defined in both light and dark mode
- `.planning/REQUIREMENTS.md` REQ-23-01 — column schema type, status badge mapping, accepted criteria

### Secondary (HIGH confidence — design reference)
- `design_handoff/design-system/ds-datagrid.jsx` — `DataGridSection` function, complete reference implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in repo at exact file paths
- Architecture: HIGH — Table compound component API read in full; all hook signatures verified
- CSS needs: HIGH — primitives.css scanned for all relevant classes; token definitions confirmed
- Pitfalls: HIGH — each pitfall is grounded in a specific code observation (line numbers cited)
- Keyboard nav: MEDIUM — WAI-ARIA grid pattern is well-established; specific `tabIndex` roving implementation is standard but not yet in a prior phase component to copy verbatim

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable codebase; no external dependencies)
