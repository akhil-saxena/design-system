# Phase 23: DataGrid - Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/data-display/DataGrid/index.tsx` | component (composed) | CRUD + event-driven | `src/data-display/Table/index.tsx` | exact |
| `src/data-display/DataGrid/DataGrid.stories.tsx` | test/docs | request-response | `src/data-display/Table/Table.stories.tsx` | exact |
| `src/data-display/DataGrid/DataGrid.test.tsx` | test | request-response | `src/data-display/Table/Table.test.tsx` | exact |
| `src/primitives.css` (append) | config/styles | N/A | `src/primitives.css` lines 3342–3503 (Table block) | role-match |
| `src/index.ts` (append export) | config | N/A | `src/index.ts` lines 117–119 (Table + Pagination exports) | exact |

---

## Pattern Assignments

### `src/data-display/DataGrid/index.tsx` (component, CRUD + event-driven)

**Analog:** `src/data-display/Table/index.tsx`

**Imports pattern** (lines 41–48):
```typescript
import { type KeyboardEventHandler, type MouseEventHandler, forwardRef } from "react";
import { Button } from "../../inputs/Button";
import { Checkbox } from "../../inputs/Checkbox";
```
DataGrid adds hooks at the top of its own file:
```typescript
import { useState } from "react";
import { Table } from "../Table";
import { Pagination } from "../Pagination";
import { Badge } from "../../inputs/Badge";
import { Button } from "../../inputs/Button";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useSortableTable } from "../../hooks/useSortableTable";
import { useResizableColumns } from "../../hooks/useResizableColumns";
```

**cls() helper — copy verbatim** (lines 47–49):
```typescript
function cls(base: string, extra?: string): string {
  return extra ? `${base} ${extra}` : base;
}
```

**Compound namespace pattern** (lines 444–454):
```typescript
export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  SelectAllCell: TableSelectAllCell,
  SelectCell: TableSelectCell,
  Pagination: TablePagination,
};
```
DataGrid exposes a single named export (`DataGrid`) rather than a compound object. It composes Table sub-components internally, not re-exporting them.

**Core composition pattern — Pagination OUTSIDE table** (Table.stories.tsx lines 200–235):
```typescript
// Table.Pagination must be a SIBLING of Table.Root, NOT nested inside.
// <nav> inside <table> is invalid HTML.
function PaginationTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.ceil(allRows23.length / pageSize);
  const pageRows = allRows23.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div>
      {wrap(
        <Table.Root ariaLabel="Paginated user list">
          <Table.Header>...</Table.Header>
          <Table.Body>...</Table.Body>
        </Table.Root>,
      )}
      <Table.Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        total={allRows23.length}
      />
    </div>
  );
}
```
DataGrid renders this same pattern: `<div class="ds-atom-datagrid">` wraps `<Table.Root>` plus a sibling footer `<div class="ds-atom-datagrid-footer">` containing `<Pagination>`.

**Selection hook wiring** (Table.stories.tsx lines 82–110):
```typescript
const ids = users.map((u) => u.id);
const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);
// multiSelectable on Root; SelectAllCell in header; SelectCell per row
<Table.Root multiSelectable ariaLabel="Selectable user list">
  <Table.Header>
    <Table.Row>
      <Table.SelectAllCell
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onToggleAll={toggleAll}
      />
      ...
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {users.map((u) => (
      <Table.Row key={u.id} selected={isSelected(u.id)}>
        <Table.SelectCell selected={isSelected(u.id)} onToggle={() => toggle(u.id)} />
        ...
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>
```

**Sort hook wiring** (Table.stories.tsx lines 34–79):
```typescript
const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(users, { defaultCol: "name" });
const cellDir = (col: keyof User) => (sortCol === col ? sortDir : null);
// HeaderCell receives sortable + sortDir + onToggleSort
<Table.HeaderCell
  sortable
  sortDir={cellDir("name")}
  onToggleSort={() => toggleSort("name")}
>
  Name
</Table.HeaderCell>
```

**Resize hook wiring** (Table.stories.tsx lines 138–191):
```typescript
const { widths, startResize } = useResizableColumns({
  name: 160,
  role: 120,
  joinDate: 120,
  status: 100,
});
// Table.Root needs tableLayout="fixed" + width="100%"
// HeaderCell receives resizable + width + onResizeStart
<Table.Root ariaLabel="Resizable column table" style={{ tableLayout: "fixed", width: "100%" }}>
  <Table.HeaderCell
    resizable
    width={widths.name}
    onResizeStart={(e) => startResize("name", e)}
  >
    Name
  </Table.HeaderCell>
```

**Bulk-action bar placement:** Render as a sibling `<div class="ds-atom-datagrid-bulk-bar">` ABOVE `<Table.Root>` when `selectedIds.length > 0`. Use `Button` (variant="ghost") for bulk actions. Pattern mirrors how `Table.Pagination` sits outside the table.

**forwardRef pattern** (Table/index.tsx lines 146–163):
```typescript
export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  { density = "comfortable", sticky, ariaLabel, multiSelectable, className, children, ...rest },
  ref,
) {
  return (
    <table
      ref={ref}
      aria-label={ariaLabel}
      aria-multiselectable={multiSelectable || undefined}
      className={cls("ds-atom-table", className)}
      data-density={density}
      data-sticky={sticky ? "true" : undefined}
      {...rest}
    >
      {children}
    </table>
  );
});
```
DataGrid wraps with `forwardRef<HTMLDivElement, DataGridProps>` on its outer `<div>`.

**Props interface pattern** (Table/index.tsx lines 53–132): Each sub-component has its own exported interface extending the appropriate HTML element type. DataGrid interface should extend `React.HTMLAttributes<HTMLDivElement>` and declare its domain props (columns, rows, density, sticky, selectable, resizable, pagination props, onSelectionChange, bulkActions).

**Badge usage for status cells** (Badge/index.tsx lines 48–69):
```typescript
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", dot, dotColor, children, style, ...rest },
  ref,
) {
  return (
    <span ref={ref} style={{ ...baseStyle, ...toneStyles[tone], ...style }} {...rest}>
      ...
    </span>
  );
});
// Tones: "upcoming" | "passed" | "pending" | "done" | "count" | "neutral"
// Usage: <Badge tone="passed">Active</Badge>
```

**Pagination component API** (Pagination/index.tsx lines 4–23):
```typescript
export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  variant?: "full" | "compact";  // default "full"
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}
```
Note: Phase 17 Pagination uses `totalPages`/`currentPage`, NOT `pageCount`/`page` like Table.Pagination. DataGrid's footer uses `<Pagination>` (the standalone component from `src/data-display/Pagination`), so use the `totalPages`/`currentPage` API.

---

### `src/data-display/DataGrid/DataGrid.stories.tsx` (stories, request-response)

**Analog:** `src/data-display/Table/Table.stories.tsx`

**Meta block pattern** (Table.stories.tsx lines 524–553):
```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof Table.Root> = {
  title: "Data Display/Table",
  component: Table.Root,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "...",
      },
    },
  },
  argTypes: {
    density: {
      control: "select",
      options: ["cozy", "comfortable", "spacious"],
    },
    sticky: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Table.Root>;
```
DataGrid: `title: "Data Display/DataGrid"`, `component: DataGrid`.

**Story render pattern** (Table.stories.tsx lines 557–565):
```typescript
export const Default: Story = {
  parameters: {
    docs: {
      description: { story: "..." },
      source: { code: SRC.default },
    },
  },
  render: () => <SortableTable />,
};
```

**Dark mode decorator pattern** (Table.stories.tsx lines 730–757):
```typescript
export const DarkMode: Story = {
  name: "Dark mode",
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{
          background: "#1c1917",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        <Story />
      </div>
    ),
  ],
  ...
};
```

**wrap() helper pattern** (Table.stories.tsx lines 19–30):
```typescript
const wrap = (children: React.ReactNode, maxHeight?: number) => (
  <div
    style={{
      border: "1px solid var(--rule)",
      borderRadius: 8,
      overflow: maxHeight ? "hidden" : "auto",
      ...(maxHeight ? { maxHeight } : {}),
    }}
  >
    {children}
  </div>
);
```
DataGrid should define similar sample data and sub-story components (DefaultGrid, SelectionGrid, PaginationGrid, CombinedGrid, etc.) before the meta block.

**SRC code string pattern** (Table.stories.tsx lines 375–521): Define a `const SRC = { default: \`...\`, ... }` object with story source snippets for `docs.source.code`.

---

### `src/data-display/DataGrid/DataGrid.test.tsx` (test, request-response)

**Analog:** `src/data-display/Table/Table.test.tsx`

**Import pattern** (Table.test.tsx lines 9–11):
```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody, ... } from ".";
```
DataGrid test:
```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid } from ".";
```

**Describe block structure** (Table.test.tsx lines 14–95): One `describe` per feature area, each with focused `it` strings: "renders a ...", "applies .class-name class", "sets data-attr when prop provided".

**Attribute assertion pattern** (Table.test.tsx lines 33–49):
```typescript
it("sets data-density='comfortable' by default", () => {
  render(<TableRoot><tbody /></TableRoot>);
  expect(document.querySelector("table")).toHaveAttribute("data-density", "comfortable");
});
```
DataGrid: assert `data-density` on the inner `<table>` (rendered by Table.Root), `ds-atom-datagrid` class on the wrapper `<div>`, presence/absence of `.ds-atom-datagrid-bulk-bar`, and pagination rendering as a sibling nav.

**Event + callback pattern** (Table.test.tsx lines 233–248):
```typescript
it("fires onToggleSort on click", () => {
  const handler = vi.fn();
  render(<SortableHeader onToggleSort={handler} />);
  fireEvent.click(document.querySelector("th")!);
  expect(handler).toHaveBeenCalledTimes(1);
});
```

**Namespace shape test pattern** (Table.test.tsx lines 262–278):
```typescript
describe("Table namespace object", () => {
  it("exposes all compound members", () => {
    expect(Table.Root).toBeDefined();
    ...
  });
});
```
DataGrid does not use a compound namespace, so no equivalent needed — but verify `DataGrid` is a function/component at module level.

---

### `src/primitives.css` — append `ds-atom-datagrid-*` CSS

**Analog:** `src/primitives.css` lines 3342–3503 (Table block)

**CSS block header comment pattern** (lines 3339–3341):
```css
/* ─── DS atom: Table (DS-61) ─────────────────────────────────────────────────
   Compound table chrome with density modes + sticky header.
   Selection, resize, pagination ship in DS-61 part 2 (Plan 17-11). */
```
DataGrid block header:
```css
/* ─── DS atom: DataGrid (DS-XX) ─────────────────────────────────────────────
   Composed wrapper: bulk-action bar + footer (pagination) around Table.
   Inner table chrome uses ds-atom-table-* tokens. */
```

**Selected row highlight token** (line 3454–3456):
```css
.ds-atom-table-row[data-selected="true"] {
  background: color-mix(in srgb, var(--amber) 14%, transparent);
}
```
Bulk-action bar should use the same amber accent token `var(--amber)`.

**Dark mode block pattern** (lines 3424–3445, 3496–3502): Place all `.dark .ds-atom-datagrid-*` overrides together at the bottom of the DataGrid CSS block.

**Pagination positioning pattern** (lines 3476–3495): Table pagination uses `display: flex; align-items: center; gap: 4px; padding: 12px 0`. DataGrid footer (`ds-atom-datagrid-footer`) should mirror this flex layout and add `border-top: 1px solid var(--rule)`.

**New classes to define:**
- `.ds-atom-datagrid` — outer wrapper div (position: relative, overflow: hidden or visible)
- `.ds-atom-datagrid-bulk-bar` — bulk-action bar shown when rows selected (flex row, amber tint bg, gap, padding)
- `.ds-atom-datagrid-footer` — footer containing Pagination (flex, border-top, padding)
- `.dark .ds-atom-datagrid-bulk-bar` — dark mode bulk-bar override

**CSS append location:** Append immediately after the last line of the Pagination CSS block at the end of the file (after `.ds-atom-pagination-count { ... }`).

---

### `src/index.ts` — add DataGrid export

**Analog:** `src/index.ts` lines 117–119 (Table + Pagination):
```typescript
export { Table, type TableRootProps, type TableHeaderCellProps } from "./data-display/Table";
export { Calendar, type CalendarProps, type CalendarEvent } from "./data-display/Calendar";
export { Pagination, type PaginationProps } from "./data-display/Pagination";
```

**Export line to add** (insert after the `Pagination` export line, line 119):
```typescript
export { DataGrid, type DataGridProps } from "./data-display/DataGrid";
```

Export the `DataGrid` named export plus `DataGridProps` interface. If DataGrid exposes additional types (e.g., `DataGridColumn`, `DataGridBulkAction`), add them to the same export line following the established comma-separated pattern.

---

## Shared Patterns

### `cls()` utility
**Source:** `src/data-display/Table/index.tsx` lines 47–49
**Apply to:** `DataGrid/index.tsx`
```typescript
function cls(base: string, extra?: string): string {
  return extra ? `${base} ${extra}` : base;
}
```
Copy verbatim into DataGrid — it is a file-local helper, not exported from Table.

### `forwardRef` component pattern
**Source:** `src/data-display/Table/index.tsx` lines 146–163
**Apply to:** `DataGrid/index.tsx` outer div wrapper
```typescript
export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(function DataGrid(
  { ..., className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cls("ds-atom-datagrid", className)} {...rest}>
      {/* bulk-action bar, Table.Root, footer */}
    </div>
  );
});
```

### Pagination placed outside `<table>`
**Source:** `src/data-display/Table/index.tsx` lines 100–122 (JSDoc), Table.stories.tsx lines 200–235
**Apply to:** `DataGrid/index.tsx`, `DataGrid.stories.tsx`, `DataGrid.test.tsx`
```
CORRECT: <div class="ds-atom-datagrid">
           <Table.Root>...</Table.Root>
           <div class="ds-atom-datagrid-footer">
             <Pagination ... />
           </div>
         </div>

WRONG:   <Table.Root>
           <Table.Body>
             <Table.Row><Table.Cell><Pagination /></Table.Cell></Table.Row>
           </Table.Body>
         </Table.Root>
```

### Hook imports
**Source:** `src/data-display/Table/Table.stories.tsx` lines 4–6
**Apply to:** `DataGrid/index.tsx` (hooks are instantiated inside DataGrid), `DataGrid.stories.tsx`
```typescript
import { useResizableColumns } from "../../hooks/useResizableColumns";
import { useSortableTable } from "../../hooks/useSortableTable";
import { useTableSelection } from "../../hooks/useTableSelection";
```

### CSS variable tokens in use
**Source:** `src/primitives.css` lines 3342–3503
**Apply to:** `ds-atom-datagrid-*` CSS rules
- Row heights: `32px` (cozy) / `40px` (comfortable) / `48px` (spacious)
- Selection highlight: `color-mix(in srgb, var(--amber) 14%, transparent)` (light), `18%` (dark)
- Border color: `var(--rule)`
- Resize handle: `var(--amber)` at 0.5 opacity
- Header background: `var(--surf-2)`
- Header text: `var(--ink-2)`, active `var(--ink)`
- Font: `var(--font-body)` (cells), `var(--font-mono)` (headers, pagination)

### Test assertion helpers
**Source:** `src/data-display/Table/Table.test.tsx` lines 9–10
**Apply to:** `DataGrid/DataGrid.test.tsx`
```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
```
Use `document.querySelector` for class/attribute assertions; `screen.getByLabelText` for interactive elements.

---

## No Analog Found

All files have close analogs. No entries required here.

---

## Metadata

**Analog search scope:** `src/data-display/Table/`, `src/data-display/Pagination/`, `src/inputs/Badge/`, `src/inputs/Checkbox/`, `src/hooks/`, `src/index.ts`, `src/primitives.css`
**Files scanned:** 10 source files read
**Pattern extraction date:** 2026-05-05
