# Phase 17: Simple Primitives — Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 8 (3 components, 3 story files, 1 CSS block, 1 barrel export)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/inputs/Kbd/index.tsx` | component | transform | `src/inputs/Badge/index.tsx` | exact |
| `src/inputs/Kbd/Kbd.stories.tsx` | stories | — | `src/inputs/Badge/Badge.stories.tsx` | exact |
| `src/interaction/RelativeTime/index.tsx` | component | transform | `src/interaction/CopyToClipboard/index.tsx` | role-match |
| `src/interaction/RelativeTime/RelativeTime.stories.tsx` | stories | — | `src/interaction/CopyToClipboard/CopyToClipboard.stories.tsx` | exact |
| `src/data-display/Pagination/index.tsx` | component | request-response | `src/data-display/Breadcrumbs/index.tsx` | role-match |
| `src/data-display/Pagination/Pagination.stories.tsx` | stories | — | `src/inputs/Badge/Badge.stories.tsx` | role-match |
| `src/primitives.css` (new block) | config | — | existing blocks in `src/primitives.css` | exact |
| `src/index.ts` (new export lines) | barrel | — | existing export lines in `src/index.ts` | exact |

---

## Pattern Assignments

### `src/inputs/Kbd/index.tsx` (component, transform)

**Analog:** `src/inputs/Badge/index.tsx`

Badge is the canonical "small stateless inline display primitive": it uses inline `CSSProperties` maps, `forwardRef`, extends an HTML element's attribute interface, spreads `...rest`, and applies a CSS class name with an optional override via the spread `className`-less pattern (Badge uses inline styles only — no className merge needed). Kbd follows the same shape but renders a `<kbd>` element.

**Imports pattern** (`src/inputs/Badge/index.tsx` lines 1):
```typescript
import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";
```

**Props interface pattern** (lines 3–14):
```typescript
export type BadgeTone = "upcoming" | "passed" | "pending" | "done" | "count" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  dotColor?: string;
}
```
For Kbd: replace `HTMLAttributes<HTMLSpanElement>` with `HTMLAttributes<HTMLElement>` (kbd is phrasing content). No tone/dot props — Kbd has no variant enum, just children + optional `size`.

**Inline style map pattern** (lines 16–28):
```typescript
const baseStyle: CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 9.5,
  padding: "3px 8px",
  borderRadius: 999,
  // ...
};
```
Kbd should declare its own `baseStyle` constant using design tokens (`--mono`, `--ink-2`, `--rule`, `--cream-2`).

**forwardRef + spread pattern** (lines 48–69):
```typescript
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", dot, dotColor, children, style, ...rest },
  ref,
) {
  return (
    <span ref={ref} style={{ ...baseStyle, ...toneStyles[tone], ...style }} {...rest}>
      {/* ... */}
    </span>
  );
});
```
For Kbd: use `<kbd>` element, class name `ds-atom-kbd`, merge `{ ...baseStyle, ...style }`. The CSS class enables dark-mode overrides in `primitives.css` (same as `.ds-atom-chip` pattern).

**What to replicate:** forwardRef signature, `HTMLAttributes<HTMLElement>` extension, inline style merging, `...rest` spread, single named export.
**What to change:** element is `<kbd>`, add `className="ds-atom-kbd"` (to allow CSS dark-mode override), no tone/dot — add optional `size?: "sm" | "md"` enum with size style map.

---

### `src/inputs/Kbd/Kbd.stories.tsx` (stories)

**Analog:** `src/inputs/Badge/Badge.stories.tsx`

**Full story file structure** (`src/inputs/Badge/Badge.stories.tsx` lines 1–123):

Key structural elements to replicate verbatim in shape:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const SRC = {
  Default: "<Badge>Label</Badge>",
  // ... one key per exported story
};

const meta: Meta<typeof Badge> = {
  title: "Inputs/Badge",         // ← change to "Inputs/Kbd"
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: "..." } },
  },
  args: { children: "Label" },
  argTypes: {
    // one entry per public prop
    className: { control: false },
    style: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  parameters: { docs: { source: { code: SRC.Default } } },
};
```

**DarkMode story decorator** (lines 107–123) — copy exactly, replacing component usage:
```typescript
export const DarkMode: Story = {
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
};
```

**What to replicate:** `SRC` constant map, `Meta<typeof X>` shape, `tags: ["autodocs"]`, `layout: "centered"`, `argTypes` with `className/style` both `{ control: false }`, DarkMode decorator.
**What to change:** title → `"Inputs/Kbd"`, component → `Kbd`, stories show keyboard key examples (`Ctrl`, `⌘K`, etc.), size variant story.

---

### `src/interaction/RelativeTime/index.tsx` (component, transform)

**Analog:** `src/interaction/CopyToClipboard/index.tsx`

CopyToClipboard is the nearest interaction-category component: small, single-concern, `forwardRef`, extends an HTML element interface, uses `useState`/`useEffect`. RelativeTime is simpler — it formats a `Date` to a human-readable relative string, no clipboard side-effects.

**Imports pattern** (`src/interaction/CopyToClipboard/index.tsx` line 1):
```typescript
import { type HTMLAttributes, forwardRef, useCallback, useEffect, useRef, useState } from "react";
```
For RelativeTime: only `HTMLAttributes`, `forwardRef`, `useEffect`, `useState` needed (no `useCallback`, `useRef`).

**Props interface pattern** (lines 3–19):
```typescript
export interface CopyToClipboardProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onCopy" | "onError"> {
  value: string;
  // ...
}
```
For RelativeTime:
```typescript
export interface RelativeTimeProps extends HTMLAttributes<HTMLTimeElement> {
  /** The date to format. */
  date: Date | number | string;
  /** Override locale (default: navigator.language). */
  locale?: string;
  /** Update interval in ms. 0 disables live updates. @default 60000 */
  updateInterval?: number;
}
```

**forwardRef + data-attribute pattern** (lines 28–109):
```typescript
export const CopyToClipboard = forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  function CopyToClipboard({ ..., className, style, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={["ds-atom-copy", className].filter(Boolean).join(" ")}
        data-state={copied ? "copied" : "idle"}
        // ...
        {...rest}
      >
        ...
      </button>
    );
  },
);
```
For RelativeTime: render `<time>` element (semantic HTML), `dateTime` attribute set to ISO string, `className` merged with `"ds-atom-relative-time"`, no `data-state`. Use `useEffect` for the tick interval to recompute the formatted string.

**What to replicate:** `forwardRef` wrapping function named export, `className` array-filter merge, `...rest` spread, `useEffect` cleanup pattern from CopyToClipboard lines 36–43.
**What to change:** element is `<time>`, no click handler, add `dateTime={isoString}` attribute, computed string from `Intl.RelativeTimeFormat`, `useEffect` sets up `setInterval` (not `setTimeout`) keyed on `updateInterval` prop.

---

### `src/interaction/RelativeTime/RelativeTime.stories.tsx` (stories)

**Analog:** `src/interaction/CopyToClipboard/CopyToClipboard.stories.tsx`

**Meta + argTypes structure** (lines 23–54):
```typescript
const meta: Meta<typeof CopyToClipboard> = {
  title: "Interaction/CopyToClipboard",  // ← change to "Interaction/RelativeTime"
  component: CopyToClipboard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",                    // ← use "padded" (same as CopyToClipboard)
    docs: { description: { component: "..." } },
  },
  argTypes: {
    // one entry per public prop
    className: { control: false },
    style: { control: false },
  },
};
```

**Story with description** (lines 64–77):
```typescript
export const WithLabel: Story = {
  args: { ... },
  parameters: {
    docs: {
      description: { story: "..." },
      source: { code: SRC.WithLabel },
    },
  },
};
```

**DarkMode decorator** (lines 147–168) — identical decorator shape as Badge.stories.tsx.

**What to replicate:** `layout: "padded"`, per-story `description.story` pattern, DarkMode decorator.
**What to change:** title → `"Interaction/RelativeTime"`, stories show past/future/just-now dates, args use `date` prop (pass a `Date` object or numeric offset).

---

### `src/data-display/Pagination/index.tsx` (component, request-response)

**Analog:** `src/data-display/Breadcrumbs/index.tsx`

Breadcrumbs is the best match: a `data-display` component that renders a `<nav>` landmark, uses `forwardRef`, extends a typed props interface with `className`/`style`, and contains a list of interactive elements. Pagination is similarly a nav element with page buttons.

**Imports pattern** (`src/data-display/Breadcrumbs/index.tsx` lines 14–16):
```typescript
import { type CSSProperties, forwardRef, useRef, useState } from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { ChevronRight, MoreHorizontal } from "../../icons";
```
For Pagination: import `ChevronLeft`, `ChevronRight` from `../../icons`. No DSDropdown needed. May need `useCallback` if key handler is extracted.

**Props interface + className/style pattern** (lines 22–38):
```typescript
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxVisible?: number;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}
```
For Pagination:
```typescript
export interface PaginationProps {
  /** Total number of pages. */
  pageCount: number;
  /** Currently active page (1-based). */
  page: number;
  /** Called when user navigates to a different page. */
  onChange: (page: number) => void;
  /** Max page buttons shown before truncating with ellipsis. @default 7 */
  siblingCount?: number;
  /** Accessible label for the nav landmark. @default "Pagination" */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}
```

**forwardRef + nav landmark pattern** (lines 44–195):
```typescript
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxVisible = 4, ariaLabel = "Breadcrumb", className, style },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={`ds-atom-breadcrumbs${className ? ` ${className}` : ""}`}
      style={style}
    >
      <ol className="ds-atom-breadcrumbs-list">
        ...
      </ol>
    </nav>
  );
});
```
For Pagination: same `<nav ref={ref} aria-label={ariaLabel} className={\`ds-atom-pagination${className ? \` ${className}\` : ""}\`} style={style}>`. Inner element is `<ol>` with `<li>` per page button. Prev/Next are `<button type="button">` with `aria-label="Previous page"` / `"Next page"`. Current page button gets `aria-current="page"`. Ellipsis items render as `<li aria-hidden="true">`.

**Button interaction pattern** from Breadcrumbs (lines 103–115):
```typescript
<button
  ref={moreBtnRef}
  type="button"
  className="ds-atom-breadcrumbs-more"
  aria-label={...}
  aria-expanded={overflowOpen}
  aria-haspopup="menu"
  onClick={() => { ... }}
>
```
For Pagination: each page button uses `type="button"`, `aria-label="Page N"`, `aria-current={isActive ? "page" : undefined}`, `disabled={isActive}` (current page not re-clickable), `onClick={() => onChange(n)}`.

**What to replicate:** `forwardRef<HTMLElement, Props>`, `<nav>` landmark with `aria-label`, `<ol>`/`<li>` list, className template literal merge, `style` passthrough, button `type="button"` pattern.
**What to change:** no overflow dropdown, no useState for open/close, add `page`/`onChange`/`pageCount` controlled API, implement page-range computation (1 … 4 5 6 … 20), add `data-variant` for compact vs full if needed.

---

### `src/data-display/Pagination/Pagination.stories.tsx` (stories)

**Analog:** `src/inputs/Badge/Badge.stories.tsx` (structure) + `src/interaction/CopyToClipboard/CopyToClipboard.stories.tsx` (controlled args pattern)

Pagination is controlled (has `page` + `onChange`), so stories need `useState`. Storybook controlled stories use `render: () => <StatefulWrapper />` (see CopyToClipboard's `ErrorFallbackDemo` pattern — a local function component that holds state).

**Controlled story wrapper pattern** (CopyToClipboard lines 100–132):
```typescript
function ErrorFallbackDemo() {
  // local state here
  return <CopyToClipboard ... />;
}
export const ErrorFallback: Story = {
  render: () => <ErrorFallbackDemo />,
};
```
For Pagination controlled story:
```typescript
function PaginationDemo(props: Partial<PaginationProps>) {
  const [page, setPage] = useState(props.page ?? 1);
  return <Pagination pageCount={props.pageCount ?? 20} page={page} onChange={setPage} />;
}
export const Default: Story = {
  render: () => <PaginationDemo />,
};
```

**What to replicate:** `Meta<typeof Pagination>` with `title: "Data Display/Pagination"`, `tags: ["autodocs"]`, `layout: "centered"`, `SRC` constant map, DarkMode decorator, `render:` wrapper for controlled stories.
**What to change:** Playground story can use Storybook `args` with `render: (args) => <PaginationDemo {...args} />`.

---

## Shared Patterns

### className merge pattern
**Source:** `src/data-display/Breadcrumbs/index.tsx` lines 92–93
**Apply to:** Pagination (`ds-atom-pagination`), RelativeTime (`ds-atom-relative-time`)
```typescript
className={`ds-atom-breadcrumbs${className ? ` ${className}` : ""}`}
```

Alternative filter-join form from CopyToClipboard (`src/interaction/CopyToClipboard/index.tsx` line 87) — both are valid, pick one per file and be consistent:
```typescript
className={["ds-atom-copy", className].filter(Boolean).join(" ")}
```

### Dark mode decorator (all story files)
**Source:** `src/inputs/Badge/Badge.stories.tsx` lines 107–123
**Apply to:** All three new `*.stories.tsx` files
```typescript
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
```

### argTypes boilerplate (all story files)
**Source:** `src/inputs/Badge/Badge.stories.tsx` lines 37–51
**Apply to:** All three new `*.stories.tsx` files
Always add `className: { control: false }` and `style: { control: false }` to `argTypes`.

### forwardRef named-function pattern
**Source:** `src/inputs/Badge/index.tsx` line 48; `src/inputs/Button/index.tsx` line 104
**Apply to:** All three new component `index.tsx` files
```typescript
export const Foo = forwardRef<HTMLXxxElement, FooProps>(function Foo(
  { prop1, prop2, children, style, className, ...rest },
  ref,
) { ... });
```
Always use a named inner function (not arrow function) — avoids anonymous display names in DevTools.

---

### `src/primitives.css` — new CSS blocks

**Source:** `src/primitives.css` — section header + block pattern

Existing section header format (lines 6–9, lines 140–141, lines 2680–2681):
```css
/* ─── DS atom: ComponentName ─────────────────────────────────────────
   One-line description of what this block handles. */
.ds-atom-component-root { ... }
.dark .ds-atom-component-root { ... }
```

**New blocks to append at end of file (after line 4802):**

**ds-atom-kbd block** — model on `.ds-atom-chip` (lines 140–170): inline element, mono font, border, dark-mode override:
```css
/* ─── DS atom: Kbd ───────────────────────────────────────────────────
   Keyboard key label. Mono font, bordered pill. */
.ds-atom-kbd {
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--rule);
  background: var(--cream-2);
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  box-shadow: 0 1px 0 var(--rule);
}
.dark .ds-atom-kbd {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  color: var(--ink);
}
```

**ds-atom-pagination block** — model on `.ds-atom-breadcrumbs` (lines 2682–2773):
```css
/* ─── DS atom: Pagination ────────────────────────────────────────────
   Page navigation. Prev / numbered pages / Next row. */
.ds-atom-pagination { ... }
.ds-atom-pagination-list { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0; }
.ds-atom-pagination-btn { ... }
.ds-atom-pagination-btn[aria-current="page"] { ... }
.ds-atom-pagination-btn:disabled { ... }
.ds-atom-pagination-ellipsis { ... }
.dark .ds-atom-pagination-btn { ... }
```

---

### `src/index.ts` — new export lines

**Source:** `src/index.ts` — existing export pattern (lines 1–138)

Each component gets one `export { ... }` line grouped with its category. Model on existing lines:

```typescript
// After line 105 (Tabs export), add:
export { Pagination, type PaginationProps } from "./data-display/Pagination";

// After line 70 (CopyToClipboard export), add:
export { RelativeTime, type RelativeTimeProps } from "./interaction/RelativeTime";

// After line 6 (Badge export), add:
export { Kbd, type KbdProps } from "./inputs/Kbd";
```

Named exports must match what the component file exports. No default exports anywhere in this codebase.

---

## No Analog Found

All files have close analogs. No entries here.

---

## Metadata

**Analog search scope:** `src/inputs/`, `src/data-display/`, `src/interaction/`, `src/primitives.css`, `src/index.ts`
**Files scanned:** 8 source files read + primitives.css structure sampled
**Pattern extraction date:** 2026-05-05
