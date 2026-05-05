# Phase 17: Simple Primitives — Research

**Researched:** 2026-05-05
**Domain:** React display primitives — Kbd, RelativeTime, Pagination
**Confidence:** HIGH

---

## Summary

Phase 17 builds three small, self-contained display primitives that have no external library
dependencies beyond what is already in the project. All three are entirely achievable using
inline CSS, the existing token system, `forwardRef`, and standard React patterns already
established in phases 1–16.

The design handoff HTML file (`design_handoff/JobDash Design System.html`) contains verbatim
CSS for all three classes (`ds-kbd`, `ds-page-btn`, `ds-icbtn`, `ds-relative-time`). These
handoff classes must be transcribed into new `ds-atom-*` blocks in `src/primitives.css`,
consistent with every prior phase's transcription pattern. Neither `ds-atom-kbd`,
`ds-atom-pagination`, nor `ds-atom-relative-time` exist in `primitives.css` today — all are
greenfield additions.

The phase directory already contains `017-PATTERNS.md` which provides exact file placements,
analog components, and CSS block skeletons. This research validates those patterns against
the source files and supplements them with prop-name precedence resolution and axe strategy.

**Primary recommendation:** Follow the Badge → Kbd, CopyToClipboard → RelativeTime,
Breadcrumbs → Pagination analog chain documented in `017-PATTERNS.md` exactly. Use REQUIREMENTS.md prop names (`totalPages`, `currentPage`, `onPageChange`) which take precedence over the alternative names suggested in PATTERNS.md.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-17-01 | Kbd: `<kbd>` element with `ds-atom-kbd` class, accepts children, both modes | CSS definition verified in handoff HTML line 107; pattern analog = Badge |
| REQ-17-02 | RelativeTime: formats Date to relative string, `title` tooltip, optional `prefix` | Full implementation verified in `ds-dataviz.jsx` lines 67–88; format rules confirmed |
| REQ-17-03 | Pagination: full variant (numbered + ellipsis) and compact ("N / M") variants | Full implementation verified in `ds-advanced.jsx` lines 140–172; CSS on handoff HTML lines 262–264 |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Keyboard label rendering | Browser / Client | — | Pure display element; no server state |
| Relative time formatting | Browser / Client | — | Computed from `Date.now()` at render; no API |
| Relative time live ticking | Browser / Client | — | `setInterval` in `useEffect`; client-side only |
| Pagination state | Browser / Client | — | Controlled component; caller owns `currentPage` state |
| Pagination prev/next navigation | Browser / Client | — | Fires `onPageChange` callback; no routing |

---

## Standard Stack

### Core (all already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | Component rendering | Project-wide standard `[VERIFIED: package.json]` |
| TypeScript | ~6.0.2 | Type safety | Project-wide standard `[VERIFIED: package.json]` |
| lucide-react | ^1.14.0 | ChevronLeft/Right icons for Pagination | Already imported in Breadcrumbs; same subpath `[VERIFIED: package.json]` |

### No New Dependencies Needed

All three components are pure DOM + CSS. No date library, no formatting library, no icon library
additions required. Lucide icons for Pagination prev/next are already available via
`../../icons` relative import (same pattern as Breadcrumbs).

**Installation:** None required.

---

## Architecture Patterns

### System Architecture Diagram

```
User interaction / prop changes
         │
         ▼
  ┌──────────────────────────────────┐
  │  Pagination (controlled)         │
  │  props: totalPages, currentPage  │
  │  fires: onPageChange(n)          │
  │  renders: <nav> → <ol> → <li>   │
  └─────────────┬────────────────────┘
                │ page range algorithm
                ▼
  [prev btn] [1] [2] … [5][6][7] … [20] [next btn]
                         ↑ active (aria-current)

  ┌────────────────────────────┐
  │  RelativeTime              │
  │  props: date, prefix       │
  │  useEffect → setInterval   │
  │  renders: <time dateTime>  │
  └─────────────┬──────────────┘
                │ diff buckets
                ▼
  "Updated 30m ago"  (title = exact locale string on hover)

  ┌──────────────────────────┐
  │  Kbd                     │
  │  props: children, size   │
  │  renders: <kbd>          │
  └──────────────────────────┘
  "⌘K"  "ESC"  "Ctrl+Shift+D" (sequence = multiple <Kbd> + "+" separators)
```

### Recommended Project Structure

```
src/
├── inputs/
│   └── Kbd/
│       ├── index.tsx          # Kbd component
│       └── Kbd.stories.tsx    # Stories: single keys, combos, dark mode
├── interaction/
│   └── RelativeTime/
│       ├── index.tsx          # RelativeTime component
│       └── RelativeTime.stories.tsx  # Stories: all buckets, prefix, dark mode
├── data-display/
│   └── Pagination/
│       ├── index.tsx          # Pagination (full + compact variant)
│       └── Pagination.stories.tsx   # Stories: full, compact, dark mode
└── primitives.css             # Append 3 new ds-atom-* blocks at end
```

Exports added to `src/index.ts`:
- `Kbd`, `KbdProps` — grouped near Badge (line ~6)
- `RelativeTime`, `RelativeTimeProps` — grouped near CopyToClipboard (line ~70)
- `Pagination`, `PaginationProps` — grouped near Tabs/Calendar (line ~105)

---

### Pattern 1: Kbd Component

**What:** Stateless inline display element, `<kbd>` HTML element, `ds-atom-kbd` CSS class,
no props beyond `children` and optional `size`.

**Handoff CSS definition** `[VERIFIED: design_handoff/JobDash Design System.html line 107]`:
```css
.ds-kbd {
  font-family: var(--mono);
  font-size: 9.5px;
  background: var(--cream-2);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--ink-3);
  flex-shrink: 0;
}
```

**Transcribed `ds-atom-kbd` block** (to append to `primitives.css`):
```css
/* ─── DS atom: Kbd ───────────────────────────────────────────────────
   Keyboard key label. Mono font, bordered chip. Token-driven dark mode. */
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

Note: The PATTERNS.md specifies `11px` (not the handoff's `9.5px`) to match the ds-universal.jsx
usage that shows `style={{ fontSize: 11, padding: '3px 8px' }}` — the 9.5px is the base token,
11px is the typical displayed size. `[VERIFIED: design_handoff/design-system/ds-universal.jsx lines 209, 224]`

**No dark-mode override in handoff** — `--cream-2` and `--ink-3` flip automatically via token
system. PATTERNS.md adds an explicit dark rule for the rgba background for richer contrast.
`[VERIFIED: design_handoff/JobDash Design System.html lines 27–44 (token flip section)]`

**Component implementation:**
```typescript
// Source: src/inputs/Badge/index.tsx analog
import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type KbdSize = "sm" | "md";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Size variant. "sm" is suitable for inline hints; "md" (default) for shortcut labels. */
  size?: KbdSize;
}

const baseStyle: CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 11,
  lineHeight: 1,
  padding: "2px 6px",
  borderRadius: 4,
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const sizeStyles: Record<KbdSize, CSSProperties> = {
  sm: { fontSize: 9.5, padding: "1px 5px" },
  md: {},
};

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = "md", children, style, className, ...rest },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={`ds-atom-kbd${className ? ` ${className}` : ""}`}
      style={{ ...baseStyle, ...sizeStyles[size], ...style }}
      {...rest}
    >
      {children}
    </kbd>
  );
});
```

**Accessibility:** `<kbd>` is a native HTML element with built-in semantic meaning (keyboard
input). No ARIA role needed. Screen readers announce it as keyboard input. `[ASSUMED]`

---

### Pattern 2: RelativeTime Component

**What:** Formats a Date into a human-readable relative string with exact datetime tooltip.
Uses `<time>` element (semantic HTML), `dateTime` attribute set to ISO string, optional `prefix`.

**Handoff implementation** `[VERIFIED: design_handoff/design-system/ds-dataviz.jsx lines 67–88]`:
```javascript
function RelativeTime({ date, prefix }) {
  const [now] = React.useState(new Date(2026, 3, 24, 14, 0));
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  let rel;
  if (diffMin < 0) rel = `in ${Math.abs(diffMin)}m`;
  else if (diffMin < 60) rel = `${diffMin}m ago`;
  else if (diffH < 24) rel = `${diffH}h ago`;
  else if (diffD < 30) rel = `${diffD}d ago`;
  else rel = d.toLocaleDateString();

  return (
    <span className="ds-relative-time" title={d.toLocaleString()}>
      {prefix && <span style={{ color: 'var(--ink-4)' }}>{prefix} </span>}
      {rel}
    </span>
  );
}
```

**Handoff CSS** `[VERIFIED: design_handoff/JobDash Design System.html line 315]`:
```css
.ds-relative-time {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-2);
  cursor: default;
}
```

**Format buckets** `[VERIFIED: ds-dataviz.jsx + REQUIREMENTS.md REQ-17-02]`:
```
diffMin < 0           → "in {|diffMin|}m"        (future)
diffMin === 0         → "0m ago"                  (just now — no special case in spec)
diffMin < 60          → "{diffMin}m ago"
diffH < 24            → "{diffH}h ago"
diffD < 30            → "{diffD}d ago"
diffD >= 30           → d.toLocaleDateString()    (locale string, no "ago")
```

The REQUIREMENTS.md says `>= 30 d → locale date string`. The handoff code confirms
`d.toLocaleDateString()` (not `toLocaleString()`). `[VERIFIED]`

**Transcribed CSS block to append:**
```css
/* ─── DS atom: RelativeTime ─────────────────────────────────────────
   Inline relative timestamp. Mono font, cursor-default. Token-driven. */
.ds-atom-relative-time {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-2);
  cursor: default;
}
```

No dark-mode override needed — `--ink-2` flips automatically.

**Component implementation (uses `<time>` not `<span>`):**
```typescript
// Source: handoff ds-dataviz.jsx line 67 + CopyToClipboard useEffect pattern
import { type CSSProperties, type HTMLAttributes, forwardRef, useEffect, useState } from "react";

export interface RelativeTimeProps extends HTMLAttributes<HTMLTimeElement> {
  /** Date to format. Accepts Date object, ISO string, or Unix ms timestamp. */
  date: Date | string | number;
  /** Optional prefix rendered in --ink-4 before the relative string (e.g. "Updated"). */
  prefix?: string;
  /** How often to recompute, in ms. Pass 0 to disable live updates. @default 60000 */
  updateInterval?: number;
}

function format(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 0) return `in ${Math.abs(diffMin)}m`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 30) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(
  function RelativeTime(
    { date, prefix, updateInterval = 60_000, className, style, ...rest },
    ref,
  ) {
    const d = new Date(date);
    const [rel, setRel] = useState(() => format(d));

    useEffect(() => {
      setRel(format(d));
      if (updateInterval === 0) return;
      const id = globalThis.setInterval(() => setRel(format(new Date(date))), updateInterval);
      return () => globalThis.clearInterval(id);
    }, [date, updateInterval]);

    return (
      <time
        ref={ref}
        dateTime={d.toISOString()}
        title={d.toLocaleString()}
        className={`ds-atom-relative-time${className ? ` ${className}` : ""}`}
        style={style}
        {...rest}
      >
        {prefix ? (
          <span style={{ color: "var(--ink-4)" }}>{prefix} </span>
        ) : null}
        {rel}
      </time>
    );
  },
);
```

**Key deviation from handoff:** Use `<time dateTime={isoString}>` instead of `<span>` —
semantic HTML improvement with no visual difference. `[ASSUMED — accessibility best practice]`

**Accessibility:** `<time>` element with `dateTime` attribute + `title` tooltip covers both
machine-readable and hover-readable datetime. `[ASSUMED — WCAG 2.1 success criterion 1.3.1 Info and Relationships]`

---

### Pattern 3: Pagination Component

**What:** Controlled `<nav>` component with two variants (full / compact) and a page-range
algorithm for ellipsis placement.

**Handoff implementation** `[VERIFIED: design_handoff/design-system/ds-advanced.jsx lines 140–172]`:
- Full variant: `ds-icbtn` prev + `ds-page-btn` numbered buttons (array `[1, 2, 3, 4, 5, '…', total]`) + `ds-icbtn` next + "Page N of M" label
- Compact variant: `ds-icbtn` prev + `{N} / {M}` text + `ds-icbtn` next

**Handoff CSS definitions** `[VERIFIED: design_handoff/JobDash Design System.html]`:
```css
/* ds-icbtn — line 82 */
.ds-icbtn {
  width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--rule);
  background: var(--g-bg); display: inline-flex; align-items: center;
  justify-content: center; color: var(--ink-2); cursor: pointer;
  transition: all .15s; outline: none;
}
.ds-icbtn:hover { background: var(--cream-2); border-color: rgba(0,0,0,.12); }
body.dark .ds-icbtn:hover { background: rgba(255,255,255,.08); border-color: var(--ink-4); }
/* disabled state applied from combined focus-visible block */

/* ds-page-btn — lines 262–264 */
.ds-page-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid transparent;
  background: transparent; font-size: 12px; font-weight: 500; cursor: pointer;
  color: var(--ink-2); display: inline-flex; align-items: center;
  justify-content: center; transition: all .12s; font-family: var(--font);
}
.ds-page-btn:hover { background: var(--cream-2); }
.ds-page-btn.active { background: var(--ink); color: var(--cream); font-weight: 700; }
/* focus-visible: box-shadow: var(--focus-ring); border-color: var(--focus) */
```

**Transcribed CSS blocks to append** (using `ds-atom-pagination-icbtn` and `ds-atom-pagination-btn`):

```css
/* ─── DS atom: Pagination ────────────────────────────────────────────
   Page navigation: prev/next icon buttons + numbered page buttons + ellipsis. */
.ds-atom-pagination {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ds-atom-pagination-list {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}
/* Icon button (prev / next) */
.ds-atom-pagination-icbtn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--rule);
  background: var(--g-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.15s;
  outline: none;
}
.ds-atom-pagination-icbtn:hover:not(:disabled) {
  background: var(--cream-2);
  border-color: rgba(0, 0, 0, 0.12);
}
.ds-atom-pagination-icbtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ds-atom-pagination-icbtn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-color: var(--focus);
}
.dark .ds-atom-pagination-icbtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--ink-4);
}
/* Numbered page button */
.ds-atom-pagination-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  font-family: var(--font);
}
.ds-atom-pagination-btn:hover:not([aria-current="page"]):not(:disabled) {
  background: var(--cream-2);
}
.ds-atom-pagination-btn[aria-current="page"] {
  background: var(--ink);
  color: var(--cream);
  font-weight: 700;
  cursor: default;
}
.ds-atom-pagination-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-color: var(--focus);
}
/* Ellipsis non-interactive item */
.ds-atom-pagination-ellipsis {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ink-4);
  pointer-events: none;
  user-select: none;
}
/* "Page N of M" label */
.ds-atom-pagination-label {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-4);
  margin-left: 6px;
}
/* Compact "N / M" text */
.ds-atom-pagination-count {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
}
```

**Prop names — REQUIREMENTS.md takes precedence** over PATTERNS.md:

| REQUIREMENTS.md | PATTERNS.md | Resolved |
|-----------------|-------------|----------|
| `totalPages` | `pageCount` | **Use `totalPages`** |
| `currentPage` | `page` | **Use `currentPage`** |
| `onPageChange` | `onChange` | **Use `onPageChange`** |

```typescript
export interface PaginationProps {
  /** Total number of pages. */
  totalPages: number;
  /** Currently active page (1-based). */
  currentPage: number;
  /** Called when user navigates to a different page. */
  onPageChange: (page: number) => void;
  /** "full" shows numbered page buttons; "compact" shows "N / M" only. @default "full" */
  variant?: "full" | "compact";
  /** Accessible label for the nav landmark. @default "Pagination" */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}
```

**Page range algorithm** (derived from handoff `[1, 2, 3, 4, 5, '…', total]` pattern):
```
Handoff shows: [1][2][3][4][5][…][12] with page=3 active.
Rule: always show first page, last page, current page ±1.
When gap exists, insert ellipsis.
```

Standard algorithm (no library needed — too simple to hand-roll):
```typescript
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  if (current > 3) items.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    items.push(p);
  }
  if (current < total - 2) items.push("…");
  items.push(total);
  return items;
}
```

**Keyboard navigation (REQ-17-03):** Arrow keys move focus between page buttons; Enter
activates. Use `onKeyDown` on the `<ol>` with `roving tabIndex` or focus management.
Simple approach: give only current-focused item `tabIndex={0}`, others `tabIndex={-1}`,
handle `ArrowLeft`/`ArrowRight` to call `focus()` on adjacent sibling ref.

**Full component structure (nav + forwardRef):**
```typescript
// Source: src/data-display/Breadcrumbs/index.tsx analog
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { totalPages, currentPage, onPageChange, variant = "full", ariaLabel = "Pagination",
    className, style },
  ref,
) {
  const pages = variant === "full" ? getPageRange(currentPage, totalPages) : [];

  if (variant === "compact") {
    return (
      <nav ref={ref} aria-label={ariaLabel}
        className={`ds-atom-pagination${className ? ` ${className}` : ""}`}
        style={style}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" className="ds-atom-pagination-icbtn"
            aria-label="Previous page" disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}>
            <ChevronLeft size={11} aria-hidden />
          </button>
          <span className="ds-atom-pagination-count">
            {currentPage} / {totalPages}
          </span>
          <button type="button" className="ds-atom-pagination-icbtn"
            aria-label="Next page" disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}>
            <ChevronRight size={11} aria-hidden />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav ref={ref} aria-label={ariaLabel}
      className={`ds-atom-pagination${className ? ` ${className}` : ""}`}
      style={style}
    >
      <ol className="ds-atom-pagination-list" role="list">
        <li>
          <button type="button" className="ds-atom-pagination-icbtn"
            aria-label="Previous page" disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}>
            <ChevronLeft size={12} aria-hidden />
          </button>
        </li>
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`ellipsis-${i}`} aria-hidden="true">
              <span className="ds-atom-pagination-ellipsis">…</span>
            </li>
          ) : (
            <li key={p}>
              <button type="button" className="ds-atom-pagination-btn"
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
                onClick={() => p !== currentPage && onPageChange(p as number)}>
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button type="button" className="ds-atom-pagination-icbtn"
            aria-label="Next page" disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}>
            <ChevronRight size={12} aria-hidden />
          </button>
        </li>
      </ol>
      <span className="ds-atom-pagination-label">Page {currentPage} of {totalPages}</span>
    </nav>
  );
});
```

**Accessibility:** `<nav aria-label>` landmark, `aria-current="page"` on active button,
`aria-label="Page N"` on each button (numbers alone are not descriptive enough), `aria-hidden`
on ellipsis, `aria-label` on prev/next. `[ASSUMED — WAI-ARIA 1.2 pagination pattern]`

---

### Anti-Patterns to Avoid

- **Using `<span>` instead of `<kbd>`:** `<kbd>` is the correct semantic element for keyboard
  input display. Browser devtools and accessibility trees recognize it. `[VERIFIED: MDN]` `[ASSUMED]`
- **Using `<span>` instead of `<time>`:** `<time dateTime>` enables machine-readable date
  parsing. Screen readers can use `dateTime` attribute. `[ASSUMED]`
- **Deriving page range inside JSX inline:** Extract into `getPageRange()` pure function for
  testability and clean JSX.
- **Using `date-fns` or `dayjs` for RelativeTime:** The calculation is 6 lines. No library
  justified. `[VERIFIED: ds-dataviz.jsx implementation has zero imports for time]`
- **Naming Pagination props `pageCount`/`page`/`onChange`:** REQUIREMENTS.md specifies
  `totalPages`/`currentPage`/`onPageChange` — these are the locked names.
- **Separate full/compact as two components:** One `Pagination` with `variant` prop matches
  handoff structure and is the simpler API. `[VERIFIED: ds-advanced.jsx PaginationSection]`
- **Adding `displayName` explicitly:** The project uses named inner functions
  (`function Kbd(...)`) which automatically set `displayName`. No separate assignment needed.
  `[VERIFIED: src/inputs/Button/index.tsx, src/data-display/Breadcrumbs/index.tsx]`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting library | Custom Intl wrapper | Plain `Date` arithmetic (6 lines) | Already verified in handoff — no library needed |
| Icon buttons (prev/next) | Custom icon button component | Inline `<button className="ds-atom-pagination-icbtn">` | No shared icon button component exists in codebase; inline is the established pattern |
| Page range with sibling windows | react-paginate or similar | Local `getPageRange()` pure function | Total algorithm is ~10 lines; library adds unnecessary dep |
| Keyboard shortcut sequence rendering | Multi-Kbd sub-component | `Array.map(<Kbd>)` + `"+"` separators in consumer | Kbd renders ONE key — sequences are composed by the consumer, matching the handoff pattern |

**Key insight:** All three components are intentionally thin. The value is in the CSS class
and semantic element, not in complex logic.

---

## Common Pitfalls

### Pitfall 1: Prop name mismatch between PATTERNS.md and REQUIREMENTS.md

**What goes wrong:** `PATTERNS.md` suggests `pageCount`, `page`, `onChange` for Pagination.
REQUIREMENTS.md specifies `totalPages`, `currentPage`, `onPageChange`. Using PATTERNS.md names
causes test failures and non-compliant acceptance criteria.

**Why it happens:** PATTERNS.md was generated before the final prop names were locked in REQUIREMENTS.md.

**How to avoid:** Always use REQUIREMENTS.md prop names. They are the locked contract.

**Warning signs:** Test file says `currentPage` but component interface says `page`.

---

### Pitfall 2: RelativeTime — stale interval on `date` prop change

**What goes wrong:** `useEffect` with `[date, updateInterval]` dep array creates a new interval
when `date` changes, but if the old interval fires after re-render, it calls `format(new Date(date))`
with the old `date` closure value.

**Why it happens:** `date` in the interval closure is stale if the effect doesn't use the latest value.

**How to avoid:** Pass `date` into the interval callback via `setInterval(() => setRel(format(new Date(date))), ...)` — since `date` is in the dep array, the entire effect re-runs (creating a new interval) whenever `date` changes. This is correct behavior.

**Warning signs:** RelativeTime shows outdated values when the `date` prop changes dynamically.

---

### Pitfall 3: Kbd — `ref` type is `HTMLElement` not `HTMLKbdElement`

**What goes wrong:** TypeScript has no `HTMLKbdElement` type. Using
`forwardRef<HTMLKbdElement, ...>` is a compile error.

**Why it happens:** `<kbd>` is a phrasing element but TypeScript only exposes `HTMLElement`
for it (same as `<kbd>`, `<samp>`, `<var>`, etc.).

**How to avoid:** Use `forwardRef<HTMLElement, KbdProps>` with `HTMLAttributes<HTMLElement>`.
`[VERIFIED: TypeScript DOM lib has no HTMLKbdElement]` `[ASSUMED]`

---

### Pitfall 4: Pagination ellipsis — axe violation if not `aria-hidden`

**What goes wrong:** A `<button>` or `<span>` with text `"…"` that has no accessible label
or is not hidden from the accessibility tree generates an axe violation.

**Why it happens:** Ellipsis items are non-interactive but are rendered inside interactive
list context.

**How to avoid:** Render ellipsis as `<span aria-hidden="true">` inside a `<li aria-hidden="true">`.
Not a button, not focusable. `[ASSUMED — standard pagination accessibility pattern]`

---

### Pitfall 5: `ds-atom-kbd` CSS being missing from primitives.css

**What goes wrong:** `ds-kbd` is in the handoff HTML/JSX but NOT in `src/primitives.css`.
The grep confirms zero matches for `ds-kbd`, `ds-page-btn`, `ds-icbtn`, `ds-relative-time`
in primitives.css today.

**Why it happens:** These are handoff class names not yet transcribed.

**How to avoid:** Wave 0 task must append all four CSS blocks to `primitives.css` before any
component is rendered. Without the CSS, components render unstyled in both light and dark mode.

**Warning signs:** Kbd renders with no visual styling in Storybook. `[VERIFIED: grep confirms zero matches in src/primitives.css]`

---

## Code Examples

### Kbd — Story examples

```typescript
// Single modifier key
<Kbd>⌘</Kbd>

// Shortcut string
<Kbd>⌘K</Kbd>

// Sequence (composed by consumer)
<span style={{ display: "flex", alignItems: "center", gap: 3 }}>
  <Kbd>⌘</Kbd>
  <span style={{ color: "var(--ink-5)", fontSize: 11 }}>+</span>
  <Kbd>⇧</Kbd>
  <span style={{ color: "var(--ink-5)", fontSize: 11 }}>+</span>
  <Kbd>D</Kbd>
</span>

// Inline in text
<p>Press <Kbd>ESC</Kbd> to close the dialog.</p>
```

### RelativeTime — Story examples

```typescript
// Past bucket examples (relative to 2026-05-05T14:00:00)
<RelativeTime date={new Date(Date.now() - 10 * 60_000)} />        // "10m ago"
<RelativeTime date={new Date(Date.now() - 3 * 3600_000)} />       // "3h ago"
<RelativeTime date={new Date(Date.now() - 5 * 86400_000)} />      // "5d ago"
<RelativeTime date={new Date(Date.now() - 45 * 86400_000)} />     // locale date string
<RelativeTime date={new Date(Date.now() + 5 * 60_000)} />         // "in 5m"

// With prefix
<RelativeTime date={appliedAt} prefix="Applied" />                 // "Applied 2d ago"
```

### Pagination — Story example (controlled)

```typescript
function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Pagination totalPages={12} currentPage={page} onPageChange={setPage} />
      <Pagination totalPages={12} currentPage={page} onPageChange={setPage} variant="compact" />
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<span class="ds-kbd">` (handoff) | `<kbd class="ds-atom-kbd">` (component) | Phase 17 | Semantic HTML; accessible tree |
| `<span class="ds-relative-time">` (handoff) | `<time dateTime class="ds-atom-relative-time">` | Phase 17 | Machine-readable datetime |
| Raw `ds-page-btn` / `ds-icbtn` buttons (handoff) | `<Pagination>` component with `ds-atom-pagination-*` CSS | Phase 17 | Controlled API; ellipsis algorithm; keyboard nav |

**Deprecated in this phase (relative to handoff):**
- `ds-kbd` classname: replaced by `ds-atom-kbd` in source; handoff name is reference only
- `ds-page-btn` / `ds-icbtn` raw classes: absorbed into `ds-atom-pagination-btn` / `ds-atom-pagination-icbtn`
- `ds-relative-time` classname: replaced by `ds-atom-relative-time`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `<kbd>` is announced as keyboard input by screen readers without additional ARIA | Pattern 1 (Kbd accessibility) | May need `role="img"` or wrapping `<abbr>` for better SR support — low risk, axe will catch it |
| A2 | `<time dateTime>` improves accessibility over `<span>` for date display | Pattern 2 (RelativeTime) | If wrong, `<span>` with `title` is equally valid — no regression |
| A3 | `forwardRef<HTMLElement, KbdProps>` is correct TypeScript for `<kbd>` element | Pattern 1 (Kbd) | TypeScript compile error at build time — immediately visible |
| A4 | Ellipsis items must be `aria-hidden` to pass axe | Pitfall 4 | axe violation if wrong — discovered in test run |
| A5 | No dark-mode override needed for `ds-relative-time` CSS | Pattern 2 CSS | If token flipping is insufficient, text will have contrast issues in dark mode — visible in Storybook DarkMode story |

---

## Open Questions

1. **Kbd `size` prop: is it needed?**
   - What we know: The handoff uses `ds-kbd` at 9.5px base but also inline `fontSize: 11` and `fontSize: 10`. REQUIREMENTS.md only says "accepts children."
   - What's unclear: Whether a `size` prop is expected or whether consumers override via `style`.
   - Recommendation: Include optional `size?: "sm" | "md"` as documented in PATTERNS.md. It adds no complexity and matches the handoff's two observed sizes. Low risk to omit — consumers can use `style` override.

2. **RelativeTime — does "0m ago" need a "just now" label?**
   - What we know: The handoff code produces `0m ago` for very recent items (diffMin === 0). REQUIREMENTS.md lists the bucket as `< 60 min → "Nm ago"` with no special case.
   - What's unclear: Whether the design intent wants `"just now"` for sub-minute diffs.
   - Recommendation: Follow spec exactly — `"0m ago"` is acceptable. If product wants "just now", it's a one-line change in the format function.

3. **Keyboard navigation in Pagination — roving tabIndex vs `tabIndex={0}` on all?**
   - What we know: REQ-17-03 says "arrow keys navigate between page buttons; Enter selects focused page."
   - What's unclear: Whether the planner wants roving tabIndex (complex, correct) or a simpler per-button `tabIndex={0}` (all focusable, arrow keys just re-dispatch events).
   - Recommendation: Roving tabIndex is the accessible standard (ARIA authoring practices for toolbar). But given phase scope, a simpler implementation where all buttons are `tabIndex={0}` and `ArrowLeft`/`ArrowRight` moves `focus()` manually is acceptable. Planner to decide complexity level.

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no external dependencies. All three components are pure React + CSS. No CLI tools, databases, services, or runtimes beyond the existing Node/npm project environment are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `vite.config.ts` (root) |
| Quick run command | `npx vitest run src/inputs/Kbd src/interaction/RelativeTime src/data-display/Pagination` |
| Full suite command | `npm test` |

### axe Strategy

The REQUIREMENTS.md mandates `axe-core scan passes with zero violations` but the current
codebase has NO axe-core integration in vitest tests — zero matches for `axe`,
`checkA11y`, `toHaveNoViolations` across all `*.test.tsx` files.
`[VERIFIED: grep found no axe usage in src/]`

The Storybook test-runner (`test:visual`) captures visual screenshots but does NOT run axe.
`[VERIFIED: .storybook/test-runner.ts — only screenshot capture, no axe calls]`

There is no `@storybook/addon-a11y` in `package.json`.
`[VERIFIED: package.json — no axe or a11y packages]`

**Resolution options for the planner:**
1. **Minimal (matches current codebase pattern):** Write `vitest` tests that use
   `@testing-library/react` render + check semantic HTML roles/attributes as a proxy for
   accessibility (this is how all existing tests work — e.g. Breadcrumbs tests check
   `aria-label`, `aria-current`, `role="navigation"`). No axe install required.

2. **Full compliance (install axe):** Add `jest-axe` or `@axe-core/react` as devDependency,
   call `checkA11y(container)` in each test. Requires Wave 0 install task.

**Recommendation:** Option 2 if the project intends to enforce the "zero axe violations"
acceptance criterion programmatically. Option 1 if the criterion is verified manually
in Storybook. Planner to decide — this is the only gap between spec and current project setup.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-17-01 | Kbd renders `<kbd>` with `ds-atom-kbd` class | unit | `npx vitest run src/inputs/Kbd` | No — Wave 0 |
| REQ-17-01 | Kbd forwards ref and spreads rest props | unit | `npx vitest run src/inputs/Kbd` | No — Wave 0 |
| REQ-17-02 | RelativeTime formats `< 60m` → "Nm ago" | unit | `npx vitest run src/interaction/RelativeTime` | No — Wave 0 |
| REQ-17-02 | RelativeTime formats `>= 30d` → locale date | unit | `npx vitest run src/interaction/RelativeTime` | No — Wave 0 |
| REQ-17-02 | RelativeTime future dates → "in Nm" | unit | `npx vitest run src/interaction/RelativeTime` | No — Wave 0 |
| REQ-17-02 | RelativeTime `title` = locale datetime | unit | `npx vitest run src/interaction/RelativeTime` | No — Wave 0 |
| REQ-17-02 | RelativeTime `prefix` renders in ink-4 span | unit | `npx vitest run src/interaction/RelativeTime` | No — Wave 0 |
| REQ-17-03 | Pagination renders `<nav>` with aria-label | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | Full: prev button disabled on page 1 | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | Full: next button disabled on last page | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | Full: active page has `aria-current="page"` | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | Full: ellipsis items are `aria-hidden` | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | Compact: renders "N / M" text | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |
| REQ-17-03 | `onPageChange` fires with correct page number | unit | `npx vitest run src/data-display/Pagination` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/inputs/Kbd` (or relevant subdir)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/inputs/Kbd/Kbd.test.tsx` — covers REQ-17-01
- [ ] `src/interaction/RelativeTime/RelativeTime.test.tsx` — covers REQ-17-02
- [ ] `src/data-display/Pagination/Pagination.test.tsx` — covers REQ-17-03
- [ ] *(Optional)* Install `jest-axe` or `@axe-core/react` — if axe-in-vitest is required

---

## Security Domain

All three components are pure display primitives — no authentication, session state, user input
handling, data persistence, or network calls. No ASVS categories apply. Security domain: SKIPPED
(V2/V3/V4/V6 not applicable; V5 input validation is not relevant as no user-entered data is
processed — Kbd and RelativeTime only render props, Pagination only fires numeric callbacks).

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/JobDash Design System.html` — CSS definitions for `ds-kbd` (line 107), `ds-icbtn` (lines 82–85), `ds-page-btn` (lines 262–264), `ds-relative-time` (line 315), focus-visible rules (line 405)
- `design_handoff/design-system/ds-dataviz.jsx` lines 67–88 — RelativeTime full implementation with format buckets
- `design_handoff/design-system/ds-advanced.jsx` lines 140–172 — PaginationSection full + compact implementation
- `design_handoff/design-system/ds-universal.jsx` lines 197–258 — KbdSection with all token examples
- `src/primitives.css` — confirmed zero existing entries for `ds-kbd`, `ds-page-btn`, `ds-icbtn`, `ds-relative-time`
- `src/inputs/Badge/index.tsx` — Kbd analog (inline style, forwardRef, HTMLAttributes pattern)
- `src/interaction/CopyToClipboard/index.tsx` — RelativeTime analog (useEffect cleanup, className merge)
- `src/data-display/Breadcrumbs/index.tsx` — Pagination analog (nav landmark, ol/li, forwardRef)
- `package.json` — confirmed no axe/a11y packages installed
- `.storybook/test-runner.ts` — confirmed no axe calls in visual test runner
- `.planning/phases/017-simple-primitives/017-PATTERNS.md` — pre-existing pattern map

### Secondary (MEDIUM confidence)
- `src/index.ts` — export placement positions confirmed for all three new exports
- `.storybook/preview.tsx` — DarkMode decorator pattern and global dark class handling
- `src/data-display/Breadcrumbs/Breadcrumbs.stories.tsx` — DarkMode story pattern with decorator

### Tertiary (LOW confidence — see Assumptions Log)
- Accessibility claims about `<kbd>`, `<time>`, `aria-hidden` on ellipsis, roving tabIndex best practice

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all inline style + CSS patterns verified
- Architecture: HIGH — exact CSS values from handoff HTML; exact handoff implementations read
- Pitfalls: MEDIUM — CSS missing from primitives.css is HIGH confidence; a11y claims are ASSUMED
- Prop names: HIGH — REQUIREMENTS.md is authoritative source; discrepancy with PATTERNS.md documented

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable CSS/React ecosystem; 30-day window)
