---
phase: 023-datagrid
plan: 01
subsystem: data-display
tags: [datagrid, table, composition, sortable, resizable, selectable]
requires:
  - "@src/data-display/Table"
  - "@src/data-display/Pagination"
  - "@src/inputs/Badge"
  - "@src/inputs/Button"
  - "@src/hooks/useResizableColumns"
  - "@src/hooks/useSortableTable"
  - "@src/hooks/useTableSelection"
provides:
  - DataGrid component
  - DataGridProps, DataGridColumn, DataGridRow types
  - ds-atom-datagrid CSS atoms
affects:
  - src/primitives.css
tech_stack:
  added: []
  patterns:
    - composition over Table.* compound component
    - roving tabindex for WAI-ARIA grid pattern
    - hook composition (useResizableColumns + useSortableTable + useTableSelection)
key_files:
  created:
    - src/data-display/DataGrid/index.tsx
  modified:
    - src/primitives.css
decisions:
  - DataGrid composes Table.* — does not duplicate sort/resize/selection logic
  - Status mapping (applied→upcoming, interviewing→done, offer→passed, rejected→pending) is hardcoded in component
  - Priority dots use vivid color tokens (red/amber/green) with 6px circle pattern
  - Pagination rendered as sibling div outside Table.Root (nav-in-table is invalid HTML)
  - role="grid" with biome-ignore — intentional WAI-ARIA grid pattern requiring arrow key navigation
  - onSelectionChange optional prop forwards through useTableSelection hook
metrics:
  duration: 9min
  completed: 2026-05-05
  tasks: 2
  files: 2
---

# Phase 23 Plan 01: DataGrid CSS + Component Summary

DataGrid component (composing Table primitive + 3 table hooks) shipped with Badge-based status pills, vivid-color priority dots, and a sibling-div Pagination footer.

## Implementation

### Task 1 — CSS atoms (commit `3a6143c`)

Appended four CSS classes to `src/primitives.css` (line ~5104+):

- `.ds-atom-datagrid` — outer glass wrapper with 14px radius
- `.ds-atom-datagrid-scroll` — `overflow-x: auto` for horizontal column overflow
- `.ds-atom-datagrid-bulkbar` + `.ds-atom-datagrid-bulkbar-count` + `.dark .ds-atom-datagrid-bulkbar` — amber-tinted action bar (5% light, 7% dark)
- `.ds-atom-datagrid-footer` + `.ds-atom-datagrid-footer-count` — flex layout, mono 10px row count

### Task 2 — DataGrid component (commit `da444bf`)

Created `src/data-display/DataGrid/index.tsx` (~310 lines):

- `forwardRef<HTMLDivElement, DataGridProps>` outer div with `ds-atom-datagrid glass`
- Hooks at top: `useSortableTable`, `useResizableColumns(initialWidths, { minWidth: 60 })`, `useTableSelection(rowIds, { onSelectionChange })`
- Roving tabindex via `useState<[number, number]>([0, 1])` — col 0 is checkbox column
- Bulk-action bar (Export/Archive/Clear buttons) renders only when `selectedIds.length > 0`
- Inner `<Table.Root role="grid" multiSelectable ariaLabel="Job applications">`
- `<Table.Header>` maps columns to `<Table.HeaderCell sortable resizable>` — sortDir wired to `sortCol === col.key ? sortDir : null`
- `<Table.Body>` maps `sorted` rows; status column renders `<Badge>`, priority column renders inline 6px dot with `data-part="priority-dot"` + capitalize label
- Footer is a sibling `<div>` of `ds-atom-datagrid-scroll` containing row count + `<Pagination>`
- Arrow key handler on wrapper `div` — ArrowUp/Down/Left/Right move focused cell; Space toggles row selection (uses event target's `<tr>` ancestor for accuracy)

## Exports

```typescript
export { DataGrid, type DataGridProps, type DataGridColumn, type DataGridRow };
```

## Verification Run

| Check | Result |
|-------|--------|
| `grep -c "ds-atom-datagrid-footer-count" src/primitives.css` | 1 |
| `grep -c "ds-atom-datagrid" src/primitives.css` | 7 (5 declarations + 1 count + 1 dark override) |
| `grep -c "export const DataGrid" src/data-display/DataGrid/index.tsx` | 1 |
| `grep -c "ds-atom-datagrid-footer" src/data-display/DataGrid/index.tsx` | 2 (footer div + footer-count span) |
| `grep -c "Pagination" src/data-display/DataGrid/index.tsx` | 4 (import + comment + JSX + ariaLabel) |
| `npx tsc --noEmit` | exit 0 |
| `npx biome check src/data-display/DataGrid/` | clean |

## Deviations from Plan

### Auto-added optional props (Rule 2 — missing critical functionality)

**1. [Rule 2 - API completeness] Added `onSelectionChange` prop**
- **Found during:** Task 2 implementation
- **Issue:** Plan 023-02 (test plan, sibling wave) asserts `onSelectionChange` is called when row checkboxes are clicked — but Plan 023-01 did not list this prop in `DataGridProps`.
- **Fix:** Added `onSelectionChange?: (ids: Array<string | number>) => void` and forwarded to `useTableSelection({ onSelectionChange })`.
- **Files modified:** `src/data-display/DataGrid/index.tsx`
- **Commit:** `da444bf`

**2. [Rule 2 - Test surface] Added `data-part="priority-dot"` attribute**
- **Found during:** Task 2 implementation
- **Issue:** Plan 023-02 tests query `[data-part="priority-dot"]` to assert priority dots render.
- **Fix:** Added `data-part="priority-dot"` to the inline 6px dot span. Aria-hidden remains true (decorative).
- **Files modified:** `src/data-display/DataGrid/index.tsx`
- **Commit:** `da444bf`

**3. [Rule 2 - Optional props] Made `page`, `totalPages`, `onPageChange` optional**
- **Found during:** Task 2 implementation
- **Issue:** Plan 023-02 tests render `<DataGrid columns={COLS} rows={ROWS} />` without pagination props in the Render/Sort/Selection blocks. If those props were required, those tests would fail to typecheck.
- **Fix:** Defaulted `page=1`, `totalPages=1`, `onPageChange` optional with no-op fallback.
- **Files modified:** `src/data-display/DataGrid/index.tsx`
- **Commit:** `da444bf`

### Code-style auto-fixes (lefthook)

The biome lefthook reformatted `src/primitives.css` on Task 1 commit (tab indentation normalization across the file — 81 deletions/129 insertions). Pure formatter output; no semantic CSS change.

The biome-ignore comment for `role="grid"` was initially placed as a JSX comment `{/* ... */}` above the `<Table.Root>` element. Biome flagged it as unused and the underlying `useSemanticElements` rule still fired. Moved to an in-tag `// biome-ignore` comment above the `role="grid"` prop — matches the existing pattern in `src/data-display/Table/index.tsx` (lines 244–245).

## Self-Check: PASSED

- [x] FOUND: `src/data-display/DataGrid/index.tsx`
- [x] FOUND: `src/primitives.css` (modified — 7 ds-atom-datagrid hits)
- [x] FOUND: commit `3a6143c` (CSS)
- [x] FOUND: commit `da444bf` (component)
- [x] tsc --noEmit clean
- [x] biome check clean on `src/data-display/DataGrid/`
