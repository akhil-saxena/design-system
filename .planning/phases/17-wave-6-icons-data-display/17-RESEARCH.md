# Phase 17: Wave 6 — Icons + Data Display Primitives — Research

**Researched:** 2026-04-29
**Domain:** React component library — icon subpath build, headless data-display primitives, headless rich-text editor, multi-entry tsup ESM build
**Confidence:** HIGH on external library findings (lucide-react, TipTap, tsup, ARIA patterns); HIGH on codebase patterns (read every relevant file).

## Summary

- **lucide-react ^1.8.0 is NOT stale.** It was published 2026-04-09 (20 days ago); latest is 1.14.0 (today, 2026-04-29). The CONTEXT.md "stale" framing is incorrect — lucide had a 0.x → 1.0 major in March 2026 with a 32% bundle reduction and a new `LucideProvider` context API. The bump is small (1.8.0 → 1.14.0) and worth doing for `LucideProvider` alone, but it is NOT the rescue-from-an-old-API moment CONTEXT.md implies. [VERIFIED: npm registry]
- **TipTap 3.22.5** (latest, published yesterday 2026-04-28) supports React 19 directly via peer dep `^17 || ^18 || ^19`. Use `immediatelyRender: false` for SSR safety. Controlled-value sync is non-trivial — naive `setContent` in useEffect creates infinite loops; correct pattern uses ref-tracked previous value or skips emit. [VERIFIED: tiptap docs + GitHub issues]
- **tsup multi-entry is the right approach.** Mirror existing `entry: ["src/index.ts", "src/hooks/index.ts"]` → add `"src/icons/index.ts"`. Each entry produces its own `dist/<entry>/index.js` + `.d.ts` when entry is a directory pattern. `package.json` `exports` map adds `./icons` alongside the existing `./hooks` block.
- **Hand-rolled headless table is the right call** (vs TanStack Table) — D-17-06 locks composable subcomponent API which IS the TanStack pattern philosophically; we can ship a 200-line `useSortableTable + useTableSelection + useResizableColumns` triad without adding a 40 KB dep. Project already prefers no-dep helpers (date utils precedent).
- **Calendar shared month-grid utility** lifts cleanly from `DatePicker.tsx` lines 113-141 — one `useMemo` block. The lift creates `_internals/calendarGrid.ts` consumed by both `DatePicker` (Sunday-first 42-cell pad) and new `Calendar` primitive (configurable week-start). Visual regression risk is low — existing baselines in `tests/visual-baselines/pickers-datepicker--*` cover the surface.
- **TipTap StarterKit bundle ≈ 50-70 KB gzipped** (estimated from dependency tree of 23 packages). This is the single largest dep added in Phase 17. RichText is the heaviest primitive in the wave by a wide margin.

**Primary recommendation:** Plan order Icons → Tabs → SegmentedControl (small/independent) → Accordion → Breadcrumbs → InfiniteList → Carousel → Timeline → Calendar (depends on SegmentedControl) → Table (split into 2-3 plans) → RichText (heaviest external dep, ship last). Refactor sweep folds into 17-01 (Icons) plan to avoid a separate boilerplate plan.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Icon Strategy (Area 1)
- **D-17-01:** Standardize on `lucide-react` as the icon source. Update from the stale `^1.8.0` pin to the latest stable lucide-react. Do NOT port the 119 custom icons from `ds-iconset.jsx` — lucide already covers the design language at 1.5px stroke when configured.
- **D-17-02:** Ship a brand-lock `<Icon>` wrapper (recommended location: `src/_internals/Icon.tsx`, public re-export from main barrel) with defaults: `size={20}`, `strokeWidth={1.5}`, `color="currentColor"`, `aria-hidden="true"` unless `aria-label` provided. Wrapper accepts a `lucide-react` icon component as the `icon` prop OR renders children for custom-SVG escape hatches.
- **D-17-03:** New subpath export `@akhil-saxena/design-system/icons` re-exports each commonly-used lucide icon as a pre-wrapped component (e.g., `export const ChevronDown = wrap(LucideChevronDown)`). Tree-shakeable. Add tsup multi-entry config; mirror existing `/hooks` setup. Verify with a build that imports a single icon in a sandbox project shows only that one icon in the bundle.
- **D-17-04:** Refactor the 14 primitives currently importing directly from `lucide-react` (`Select`, `MultiSelect`, `Autocomplete`, `Checkbox`, `CopyToClipboard`, `Chip`, `DatePicker`, `Lightbox`, `NumberStepper`, `SplitButton`, `Toast`, `AlertBanner`, `StarRating`, plus any Phase 17 primitive that needs an icon) to import from `_internals/Icon` (or the public Icon component) — eliminates per-primitive size/strokeWidth drift.
- **D-17-05:** Icons land FIRST in Phase 17 commit ordering. All subsequent DS-61..70 primitives use the canonical Icon wrapper from inception.

#### Table Primitive (Area 2)
- **D-17-06:** Composable subcomponent API. `Table.Root` / `Header` / `HeaderCell` / `Body` / `Row` / `Cell` / `SelectAllCell` / `SelectCell` / `Pagination`. Helper hooks: `useSortableTable`, `useTableSelection`, `useResizableColumns`. No smart `<Table data columns />`.
- **D-17-07:** Sort UX matches handoff `ds-data.jsx` — chevron-in-header ▲/▼ ~9px monospace, click-anywhere-on-header.
- **D-17-08:** Three densities (cozy 32px / comfortable 40px default / spacious 48px) via `data-density` attribute, CSS keyed in `primitives.css`.
- **D-17-09:** Selection ships in Phase 17. Mode `single` | `multi` (default). Reuse existing `Checkbox`.
- **D-17-10:** Resizable columns ship. Min 60px. State managed by `useResizableColumns(initialWidths, onWidthsChange)` — consumer-owned persistence.
- **D-17-11:** Pagination ships as `Table.Pagination`. Renders prev/next + numbered buttons (truncated >7 pages). Built on `Button`. NOT auto-wired — consumer slices data.
- **D-17-12:** Sticky header opt-in via `<Table.Root sticky>` — CSS `position: sticky; top: 0`. No JS scroll-shadow.
- **D-17-13:** Heavy primitive — Table likely splits into 2 plans (chrome+sort+density vs selection+resize+pagination). Planner determines.

#### RichText Editor (Area 3)
- **D-17-14:** `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-placeholder`. Mentions / slash / task-list / code-block / collab DEFERRED.
- **D-17-15:** Toolbar: Bold, Italic, Underline, Strike, Inline Code, Heading H2/H3 dropdown, UL, OL, Blockquote, HR, Link with URL popover. Existing `Button` ghost variant + `DSDropdown`. Toolbar slot overridable.
- **D-17-16:** Keyboard shortcuts = TipTap defaults. Markdown shortcuts enabled.
- **D-17-17:** Output HTML by default; `outputFormat="json"` swaps to TipTap JSON Doc.
- **D-17-18:** Default rich paste from StarterKit. Plain-text-paste deferred.
- **D-17-19:** `<RichText value onChange placeholder readOnly />`. SSR-safe via `immediatelyRender: false`.

#### Calendar (Area 4)
- **D-17-20:** Three views — month (default), week, day. View toggle uses new `SegmentedControl` (DS-63 must land first).
- **D-17-21:** Extract DatePicker month-grid → `src/_internals/calendarGrid.ts`. Refactor DatePicker + DateRangePicker to consume. Visual baseline regression check before merge.
- **D-17-22:** Event chips on day cells (max 2-3 + "+N more"). Click day → `Popover` with all-events list. Sheet/BottomSheet on mobile.
- **D-17-23:** `events: CalendarEvent[]` where `CalendarEvent = { id; date; endDate?; label; color?; meta? }`. Multi-day chrome deferred.
- **D-17-24:** AgendaList exposed as `<Calendar.Agenda />` consumer-rendered slot. Richer agenda chrome deferred.
- **D-17-25:** `selectedDate` + `onSelectedDateChange` controlled. Today-cell amber. Match v0.5.6 dark-mode tokens.

### Claude's Discretion
- Whether to fold the lucide refactor into 17-01 (Icons setup) or split into its own PLAN — planner's call.
- tsup multi-entry layout (single config array vs multiple files) — planner's call.
- `useResizableColumns` persistence — recommend onWidthsChange (consumer-owned).
- RichText `className` for editor surface — yes, expose.
- Storybook story count — match wave conventions.
- Visual baseline regen — cumulative at wave-completion commit.
- Lucide version pin — latest stable; verify React 19 compat.

### Deferred Ideas (OUT OF SCOPE)
- Mentions / slash-commands / task-list / code-block-with-syntax-highlighting / collab in RichText
- Plain-text-only paste mode
- AgendaList chrome expansion
- Multi-day event rendering
- Custom Calendar view modes (year, agenda-only)
- Table column reordering
- Built-in Table virtualization
- Grid (responsive card grid wrapper)
- Custom 119-icon set port

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DS-60 | Icons subpath `@akhil-saxena/design-system/icons` with brand-lock wrapper, tsup multi-entry, refactor 14 primitives | § Icon Subpath Build below |
| DS-61 | Table — composable subcomponents, sort, density, selection, resize, pagination, sticky header | § Table Architecture below |
| DS-62 | Tabs — underline + pill variants, count badges, overflow menu via DSDropdown, ARIA tab pattern | § ARIA Patterns + § Tabs Overflow Menu |
| DS-63 | SegmentedControl — pill 2-5 options, radiogroup ARIA, used by Calendar view-mode | § ARIA Patterns |
| DS-64 | Accordion — single + multi-expand, chevron rotation, button + aria-expanded + aria-controls | § ARIA Patterns |
| DS-65 | Carousel — image+content, arrow+dot nav, swipe, autoplay opt-in, prefers-reduced-motion | § Carousel Touch + Reduced-Motion |
| DS-66 | Timeline — horizontal dots/dates/milestones, read-only display | Handoff `ds-timeline2.jsx` |
| DS-67 | InfiniteList — IntersectionObserver sentinel, hasMore + loading + onLoadMore | § InfiniteList |
| DS-68 | Calendar — month/week/day views, event chips + popover, depends on SegmentedControl + extracted month-grid | § Calendar + Shared Month-Grid |
| DS-69 | Breadcrumbs — truncation + collapse-to-dropdown for deep paths, nav + aria-current="page" | § ARIA Patterns |
| DS-70 | RichText — TipTap StarterKit + Link + Placeholder, toolbar, controlled value/onChange, SSR-safe | § TipTap RichText |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Icon rendering & defaults | Library/Component | — | Brand-lock at import time; no runtime context coupling |
| Table state (sort/select/resize) | Hook + Consumer | — | Composable model — consumer owns data + page slicing; hooks are pure derivation |
| Table CSS layout | `primitives.css` | — | Plain CSS per project convention — `[data-density]` attribute selectors |
| RichText editor instance | TipTap (3rd-party) | React useEditor hook | Headless engine; we own only the toolbar + chrome |
| RichText controlled sync | Component | — | We own the value↔editor sync logic — TipTap doesn't natively do controlled |
| Carousel auto-rotate timer | Component (timer in useRef) | `prefers-reduced-motion` media | Skip timer creation when reduced-motion set |
| InfiniteList sentinel detection | IntersectionObserver | useEffect cleanup | Standard browser API; React lifecycle owns observer registration |
| Calendar month-grid math | `_internals/calendarGrid.ts` | DatePicker + Calendar consumers | Pure utility; no React imports — same shape as `dateUtils.ts` |
| Calendar event positioning | Component | CSS grid (no JS measurement) | Day cells own 2-3 chip slots via CSS — overflow chip count computed in render |
| Tabs overflow detection | ResizeObserver + Component | DSDropdown for hidden tabs | Standard DOM measurement — visible-set computed on resize |
| RichText link popover | Component | DSPortal | Reuse existing portal infra |
| Calendar day-events popover | Component | existing Popover | Reuse existing primitive |

## Standard Stack

### Core (new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lucide-react` | `^1.14.0` | Icon set (replaces existing `^1.8.0` pin) | [VERIFIED: npm view lucide-react] Latest stable today, React 19 peer dep, 32% smaller than v0 |
| `@tiptap/react` | `^3.22.5` | Headless rich-text editor (React adapter) | [VERIFIED: npm view] Latest stable, React 19 peer dep `^17 \|\| ^18 \|\| ^19` |
| `@tiptap/starter-kit` | `^3.22.5` | Bundled core extensions (heading/list/bold/italic/etc) | [VERIFIED: npm view] Includes 23 extensions; locked to same minor as @tiptap/react |
| `@tiptap/extension-link` | `^3.22.5` | Link extension | [VERIFIED: npm view] Already in StarterKit's deps; explicit add gives us link config control |
| `@tiptap/extension-placeholder` | `^3.22.5` | Placeholder ghost text | [VERIFIED: npm view] Standard pattern for empty editor |

### Supporting (already in repo, reused)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react` | `^19.0.0` peer | Component runtime | All primitives |
| `_internals/DSPortal` | — | Floating UI mount | RichText link popover, Calendar day-events popover |
| `_internals/DSDropdown` | — | Anchored dropdown chrome | Tabs overflow menu, Table density picker (if any), RichText H2/H3 menu, Breadcrumbs collapsed-items menu |
| `Popover` | — | Existing surface primitive | Calendar day-events popover (preferred over raw DSPortal — gets focus management + animation for free) |
| `Sheet` / `BottomSheet` | — | Mobile day-events list | Calendar mobile breakpoint |
| `Checkbox` | — | Selection cells | Table.SelectAllCell, Table.SelectCell |
| `Button` | — | Action triggers | RichText toolbar (`ghost` variant icon-only), Pagination prev/next, Carousel arrow nav |
| `Chip` | — | Event chips | Calendar day cell event indicators (style only, not the Chip primitive itself unless needed) |
| `useFocusTrap` / `useClickOutside` / `useKeyboardShortcut` | — | Existing public hooks | RichText link popover focus trap; outside-click for any new floating UI |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled Table hooks | `@tanstack/react-table` v8 | TanStack is the ecosystem standard, but adds ~12 KB gzipped + a learning surface. Project's headless API spec (D-17-06) IS the TanStack philosophy; we can ship 3 small focused hooks (~200 LOC total) and keep zero deps. Recommend hand-rolled. |
| `embla-carousel-react` for DS-65 | Hand-rolled Carousel | Embla is the React-friendly carousel standard (~10 KB), gives touch + keyboard + reduced-motion for free. But the user wanted "no jarring" — Embla's spring physics are fine, and it's used by Radix/shadcn. **However**, project ethos is plain hand-rolled where reasonable. Recommend hand-rolled for v1.0; revisit if touch UX feels off. |
| `dompurify` for RichText sanitize | TipTap's built-in extension allowlist | TipTap's StarterKit already filters tags/attrs to those declared in the extension list. For server-side sanitization, that's a CONSUMER responsibility. Recommend NO sanitizer dep in v0.6 — document the policy in RichText Storybook. |
| `react-window` / TanStack Virtual for InfiniteList | None — consumer brings their own | D-17 punts virtualization to consumer (CONTEXT). InfiniteList is just the loading-sentinel + onLoadMore wiring. |

**Installation:**
```bash
npm install lucide-react@^1.14.0 @tiptap/react@^3.22.5 @tiptap/starter-kit@^3.22.5 @tiptap/extension-link@^3.22.5 @tiptap/extension-placeholder@^3.22.5
```

**Version verification (confirmed 2026-04-29 via `npm view`):**
- lucide-react `1.14.0` published 2026-04-29 (today) — peer `react: ^16.5.1 || ^17 || ^18 || ^19` ✓ React 19 compatible
- @tiptap/react `3.22.5` published 2026-04-28 — peer `react: ^17 || ^18 || ^19` ✓
- @tiptap/starter-kit `3.22.5` published 2026-04-28
- @tiptap/extension-link `3.22.5` published 2026-04-28
- @tiptap/extension-placeholder `3.22.5` published 2026-04-28

## Icon Subpath Build (DS-60)

### lucide-react Version Reality Check

CONTEXT.md frames `^1.8.0` as "stale." This is **incorrect** [VERIFIED: npm registry]. Timeline:

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-03-23 | Major release — 32% bundle reduction, removed UMD build, added `LucideProvider` context, removed brand icons (Github, Slack, Figma, etc.) |
| 1.8.0 | 2026-04-09 | Currently pinned in package.json |
| 1.14.0 | 2026-04-29 | Latest, today |

The lock from 1.8.0 → 1.14.0 is six minor versions in 20 days but no major API rupture — patch/minor changes only. React 19 is supported on the peer dep range.

**Recommendation:** Bump to `^1.14.0`. No code changes required for the bump itself; the wrapper component change is independent.

### Brand-lock Wrapper API (D-17-02)

**Recommended TypeScript signature** [CITED: lucide.dev/guide/react/advanced/typescript]:

```ts
// src/_internals/Icon.tsx
import { forwardRef, type Ref, type ReactNode } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export interface IconProps extends Omit<LucideProps, "ref"> {
  icon?: LucideIcon;
  children?: ReactNode;
}

const ICON_DEFAULTS = {
  size: 20,
  strokeWidth: 1.5,
  color: "currentColor",
} as const;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: IconComponent, children, "aria-label": ariaLabel, ...rest },
  ref,
) {
  const a11y = ariaLabel
    ? { "aria-label": ariaLabel, role: "img" as const }
    : { "aria-hidden": true };
  if (IconComponent) {
    return <IconComponent ref={ref} {...ICON_DEFAULTS} {...rest} {...a11y} />;
  }
  // Escape hatch — consumer SVG children. Apply defaults via wrapper span.
  return (
    <span className="ds-atom-icon" {...a11y}>{children}</span>
  );
});
```

**Why forwardRef + `icon` prop, NOT render-prop:**
- `forwardRef` so consumers can ref the underlying `<svg>` (matches lucide's own pattern).
- `icon: LucideIcon` prop gives clean TypeScript inference — `LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>` [CITED: lucide-react/src/Icon.ts on GitHub].
- Defaults applied via spread BEFORE rest props, so consumer can still override `size={14}` per-call (D-17 specifics: "those callsites should pass `size={14}` to the wrapper").
- `aria-hidden={true}` by default; `aria-label` flips to `role="img"` for decorative-vs-meaningful distinction.

**`LucideProvider` alternative considered, REJECTED.** Lucide v1 introduced `<LucideProvider color size strokeWidth>` for context-based defaults [CITED: lucide.dev/guide/version-1]. We're skipping it because:
1. It only works for direct lucide imports — our wrapper-pre-bound icons would skip the provider since they bind defaults at re-export time.
2. Adding a provider to consumer apps couples them to lucide internals.
3. Brand-lock at import time (per user spec D-17 specifics: "wrapper sets defaults so individual call sites cannot drift") is exactly what the wrapper achieves; provider is redundant.

### Icons Subpath Build (`@akhil-saxena/design-system/icons`)

**tsup config (D-17 Claude's discretion: layout):**

```ts
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/hooks/index.ts",
    "src/icons/index.ts", // NEW
  ],
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "lucide-react"], // NEW: lucide-react external
  onSuccess: "cp src/*.css dist/ 2>/dev/null || true",
});
```

Three notes:
- **`lucide-react` MUST be added to `external`** — otherwise tsup will inline all lucide icons into our bundle, defeating tree-shaking. After this change, consumer must already have `lucide-react` resolved (it's our dep, not a peer dep, so npm hoists it for them automatically).
- **Output structure:** With `entry: ["src/icons/index.ts"]` tsup produces `dist/icons/index.js` + `dist/icons/index.d.ts`. Verify after first build with `ls dist/icons/`. If types land at `dist/icons.d.ts` (flat) rather than `dist/icons/index.d.ts`, tsup auto-routed it; both work for the exports map but the latter matches existing `dist/hooks/index.d.ts` — confirm parity. [VERIFIED: tsup multi-entry guide]
- **`splitting: true` is already on** — shared chunks across the three entries land in `dist/chunk-*.js`; the wrapper `Icon.tsx` will be deduplicated automatically.

**`package.json` exports stanza:**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.js"
    },
    "./icons": {
      "types": "./dist/icons/index.d.ts",
      "import": "./dist/icons/index.js"
    },
    "./tokens.css": "./dist/tokens.css",
    "./primitives.css": "./dist/primitives.css",
    "./utilities.css": "./dist/utilities.css"
  },
  "sideEffects": ["*.css"]
}
```

**Add `"sideEffects": ["*.css"]`** if not present — without this, bundlers may tree-shake out CSS imports. (Currently absent from package.json — flag for the planner.)

### Icons Subpath Barrel (`src/icons/index.ts`)

**Inventory of all 25 lucide icons used today across 14 primitives** (verified by grep on `src/*.tsx`):

| Icon | Used By |
|------|---------|
| AlertTriangle | AlertBanner |
| Briefcase | Avatar (verified: actually in Card.stories.tsx — NOT a primitive) |
| Check | MultiSelect, Select, Autocomplete, Checkbox, CopyToClipboard |
| CheckCircle2 | AlertBanner, Toast (success tone) |
| ChevronDown | Select, MultiSelect, Autocomplete, SplitButton |
| ChevronLeft | DatePicker, Lightbox |
| ChevronRight | DatePicker, Lightbox |
| Clock | (DateRangePicker time picker — TBD) |
| Copy | CopyToClipboard |
| FileText | (EmptyState.stories.tsx — example only) |
| Filter | (EmptyState.stories.tsx) |
| Inbox | (EmptyState.stories.tsx) |
| Info | AlertBanner, Toast |
| Link / LinkIcon | Autocomplete (rename clash — uses `Link as LinkIcon`) |
| MapPin | Avatar (Card.stories.tsx) |
| Minus | NumberStepper |
| Plus | NumberStepper, Chip |
| Save | (InlineConfirm.stories.tsx) |
| Search | Autocomplete |
| SearchX | (EmptyState.stories.tsx) |
| Star | StarRating |
| Trash | SplitButton (split actions) |
| Trash2 | Chip |
| Upload | (EmptyState.stories.tsx) |
| X | AlertBanner, Toast, Chip, Lightbox, MultiSelect (clear), CopyToClipboard, Autocomplete (clear) |
| XCircle | AlertBanner |

Note: some imports come from `*.stories.tsx` and `*.test.tsx` files — those will continue to work after refactor since the stories are not in the primitive runtime, but for consistency they should be updated too (D-17-04 says "the 14 primitives" so stories can be a follow-up if diff is too large).

**Recommended barrel content:**
```ts
// src/icons/index.ts — wrapped re-exports for tree-shaking
import {
  AlertTriangle as L_AlertTriangle,
  Check as L_Check,
  // …all 25 imports
} from "lucide-react";
import { wrap } from "../_internals/Icon";

export const AlertTriangle = wrap(L_AlertTriangle);
export const Check = wrap(L_Check);
// …etc
```

Where `wrap(LucideIcon) → React.ForwardRefExoticComponent` — a thin pre-bound version of `<Icon icon={X} />`. This gives consumers `import { ChevronDown } from "@akhil-saxena/design-system/icons"` with the brand-lock defaults already applied.

**Tree-shaking verification approach:**
- Create `tests/treeshake-fixture/` (or a sandbox under `examples/`) — minimal Vite app:
  ```js
  import { ChevronDown } from "@akhil-saxena/design-system/icons";
  console.log(ChevronDown);
  ```
- Run `vite build` and inspect `dist/assets/index-*.js` — should contain only `ChevronDown` icon path data, not the other 24.
- Acceptance: bundle ≤ 5 KB (gzipped) for the single-icon import case.
- This fixture can be permanent and run in CI as a smoke test.

## TipTap RichText (DS-70)

### Versions + React 19 Compat

[VERIFIED: npm view + tiptap docs]
- `@tiptap/react@3.22.5`, `@tiptap/starter-kit@3.22.5`, `@tiptap/extension-link@3.22.5`, `@tiptap/extension-placeholder@3.22.5`
- React 19 supported on peer dep range `^17.0.0 || ^18.0.0 || ^19.0.0`
- TipTap 2.x → 3.x was a major in 2026-Q1; we're on 3.x cleanly

### SSR-safe Init Pattern

**MANDATORY:** Pass `immediatelyRender: false` to `useEditor`. Without it, TipTap throws "SSR has been detected, please set `immediatelyRender` explicitly to `false`" and causes hydration mismatches [CITED: tiptap GitHub issue #5856].

```tsx
const editor = useEditor({
  extensions: [StarterKit, Link, Placeholder.configure({ placeholder })],
  content: value,
  editable: !readOnly,
  immediatelyRender: false, // SSR-safe per D-17-19
  onUpdate: ({ editor }) => {
    onChange?.(outputFormat === "json" ? editor.getJSON() : editor.getHTML());
  },
});
```

**Storybook implication:** Storybook 8 renders client-side, so `immediatelyRender: false` shows a brief empty editor on first frame. Workaround: render a skeleton placeholder until `editor` is non-null, OR call `editor?.setEditable(true)` after mount. For visual baselines, wait for the editor to render before screenshot — Playwright `page.waitForSelector('.ProseMirror')` is the seam.

### Controlled Value Sync (THE Hard Problem)

TipTap is NOT natively a controlled component. The naive pattern infinite-loops:

**WRONG:**
```tsx
useEffect(() => {
  editor?.commands.setContent(value); // fires onUpdate → calls onChange(html) → parent setState → new value prop → useEffect → ...
}, [value, editor]);
```

**Correct pattern** [CITED: tiptap docs setContent + community pattern]:

```tsx
const lastEmittedRef = useRef<string>(value);
const editor = useEditor({
  extensions: [...],
  content: value,
  immediatelyRender: false,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    lastEmittedRef.current = html;
    onChange?.(html);
  },
});

// Sync external value → editor ONLY when external change differs from what we last emitted
useEffect(() => {
  if (!editor) return;
  if (value === lastEmittedRef.current) return; // we just emitted this; skip
  if (value === editor.getHTML()) return; // already matches; skip
  editor.commands.setContent(value, { emitUpdate: false }); // suppress onUpdate to prevent loop
}, [editor, value]);
```

Three safeguards layered:
1. `lastEmittedRef` — track our own emissions to detect echo
2. `getHTML()` comparison — defensive equality check (cheap on small docs)
3. `{ emitUpdate: false }` on setContent — guarantees no onUpdate fire even if both checks miss

Document this clearly in `src/RichText.tsx` comments — future maintainers will absolutely re-introduce the loop.

### Output Formats

| Output | Method | Use Case |
|--------|--------|----------|
| HTML (default) | `editor.getHTML()` | Render-friendly; persist directly; D-17-17 default |
| JSON | `editor.getJSON()` | Preserves TipTap's internal Doc structure; better for migrations + diffing |

`outputFormat="json"` prop (D-17-17) selects which call onUpdate dispatches.

### Sanitization

**TipTap policy:** The StarterKit extension list defines the allowed tags + attributes; anything pasted that isn't in that allowlist is stripped. This is equivalent to schema-based sanitization. [CITED: tiptap GitHub discussion #2845]

**Decision (per D-17-18 + Standard Stack ruling above):** No DOMPurify dependency in v0.6.

**Document in Storybook:** "Server-side: validate HTML before persisting (recommend `sanitize-html` or `DOMPurify`). Client-side: TipTap's StarterKit allowlist filters input." This is standard practice for TipTap consumers and is the user's responsibility, not the library's.

### Toolbar UI Pattern

Active-format detection [CITED: tiptap docs editor.isActive]:

```tsx
<Button
  variant="ghost"
  data-active={editor?.isActive("bold") || undefined}
  onClick={() => editor?.chain().focus().toggleBold().run()}
  aria-pressed={editor?.isActive("bold") || false}
  aria-label="Bold"
>
  <Icon icon={Bold} />
</Button>
```

`useEditorState` (TipTap 2.5+) provides selective re-renders so toolbar buttons don't re-render on every keystroke — but for a 10-button toolbar, the perf savings are negligible for v0.6. Skip `useEditorState` for now; revisit if perf is a problem.

### Link Popover (D-17-15)

Pattern: subscribe to selection change → if selection has `link` mark or user pressed Cmd+K → render `DSPortal`-mounted popover anchored at selection coordinates (`editor.view.coordsAtPos(selection.from)`).

This is the most novel UI in DS-70. Plan recommendation: ship the popover as part of 17-NN-RichText, not a separate primitive. Estimated 80-120 LOC.

### Bundle Size Estimate

[VERIFIED: dependency tree from npm view @tiptap/starter-kit dependencies] StarterKit pulls in 23 sub-packages (`@tiptap/extension-bold`, `@tiptap/extension-italic`, `@tiptap/extension-list`, etc.) plus `@tiptap/core` + `@tiptap/pm` (ProseMirror). Estimated total RichText cost when imported: **~50-70 KB gzipped**. This is the heaviest single primitive in the wave by 5×.

**Mitigation:** RichText lives in its own primitive file. ESM tree-shaking means consumers that don't import `RichText` don't pay the cost. The `@akhil-saxena/design-system/icons` subpath stays small specifically because RichText's deps are isolated.

## Table Architecture (DS-61)

### Why Hand-Rolled (vs TanStack Table)

Reaffirming: D-17-06 spec ≈ TanStack v8 philosophy. Hand-rolling is the right call here because the Table feature surface is small and well-defined:
- Sort: 1 column at a time (no multi-sort complexity)
- Selection: single + multi modes (TanStack does row groups + nested — out of scope)
- Resize: per-column drag handle (basic case TanStack offers, ours is identical)
- Pagination: just rendering + onPageChange (consumer slices data)

Each behavior is a 30-50 LOC hook — total ≈ 200 LOC vs adding a 12-KB-gzipped dep. Plus, no learning surface for future contributors who hit a TanStack edge case.

### Hook Signatures

```ts
// src/hooks/useSortableTable.ts
export interface SortState<T> {
  col: keyof T | null;
  dir: "asc" | "desc";
}
export function useSortableTable<T>(
  rows: T[],
  options?: { defaultCol?: keyof T; defaultDir?: "asc" | "desc"; comparator?: (a: T, b: T, col: keyof T) => number }
): {
  sorted: T[];
  sortCol: keyof T | null;
  sortDir: "asc" | "desc";
  toggleSort: (col: keyof T) => void;
};
```

Stable sort: use `Array.prototype.sort` (Node 18+ / all modern browsers guarantee TimSort, which is stable per ECMAScript 2019). No need for a custom stable-sort wrapper.

```ts
// src/hooks/useTableSelection.ts
export type SelectionMode = "single" | "multi";
export function useTableSelection<Id extends string | number>(
  ids: Id[],
  options?: { mode?: SelectionMode; defaultSelected?: Id[]; onSelectionChange?: (ids: Id[]) => void }
): {
  selectedIds: Id[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  isSelected: (id: Id) => boolean;
  toggle: (id: Id) => void;
  toggleAll: () => void;
  clear: () => void;
};
```

Controlled vs uncontrolled: support both via `selectedIds`/`onSelectionChange` (controlled) OR `defaultSelected` only (uncontrolled). Pattern matches Checkbox/Toggle.

```ts
// src/hooks/useResizableColumns.ts
export function useResizableColumns(
  initialWidths: Record<string, number>,
  options?: { minWidth?: number; onWidthsChange?: (w: Record<string, number>) => void }
): {
  widths: Record<string, number>;
  setWidth: (col: string, w: number) => void;
  startResize: (col: string, e: React.PointerEvent) => void; // attach to drag handle
};
```

`startResize` returns the imperative seam — pointerdown → pointermove (delta tracking) → pointerup (commit + cleanup). Use `setPointerCapture` on the handle so we don't lose mousemove on fast drags. ResizeObserver NOT needed — manual delta tracking is simpler and what TanStack uses.

### Sticky Header CSS

```css
.ds-atom-table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  /* Required: parent overflow context */
}
.ds-atom-table-root[data-sticky="true"] {
  overflow-y: auto;
  max-height: var(--ds-table-max-height, 70vh);
}
```

**Gotcha:** `position: sticky` on `<thead>` doesn't work in some browsers — apply to `<th>` cells instead. Test: Safari 17+ Chrome 120+ Firefox 120+ all support `<thead>` sticky as of 2025; we can use `<thead>` directly.

**Horizontal scroll:** When table has more columns than viewport, sticky header columns drift on horizontal scroll unless using `position: sticky; left: 0` for the leftmost column too. Out of scope for v0.6 — document as a limitation.

### Pagination Truncation Algorithm

For `pageCount > 7`, render: `[1] [...] [page-1] [page] [page+1] [...] [pageCount]` (always show first + last + ±1 around current).

```ts
function paginationRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
```

ARIA: wrap pagination in `<nav aria-label="Pagination">`. Active page button: `aria-current="page"`. Disabled prev/next: `aria-disabled="true"` + `tabIndex={-1}`.

### Sort ARIA

On `<th>`: `aria-sort="ascending" | "descending" | "none"`. Click target is the entire `<th>`, not a button inside (matches handoff). Handoff has `cursor: pointer; user-select: none`. ARIA-wise this is a "non-button button" — to satisfy AAA we need to also make it keyboard-focusable: render `<th tabIndex={0} role="columnheader" aria-sort=... onKeyDown={Enter|Space → toggleSort}>`.

### Selection ARIA

- `<table aria-multiselectable={mode === "multi"}>`
- `<tr aria-selected={isSelected(row.id)}>`
- `<thead>` row's checkbox cell: `aria-label="Select all rows"`, indeterminate state via `<input type="checkbox" indeterminate={isIndeterminate}>` (Checkbox primitive must support `indeterminate` prop — verify; if not, this is a sub-task).

### Recommended Plan Split (D-17-13)

Two plans:
- **17-02-PLAN: Table chrome + sort + density** — `Table.Root`, `Table.Header`, `Table.HeaderCell` (with sort chevron), `Table.Body`, `Table.Row`, `Table.Cell`, `useSortableTable`, density modes via data attribute, sticky header CSS. ~400 LOC + ~80 LOC tests + 5 stories.
- **17-03-PLAN: Table selection + resize + pagination** — `Table.SelectAllCell`, `Table.SelectCell`, `Table.Pagination`, `useTableSelection`, `useResizableColumns`. Builds on 17-02. ~350 LOC + ~80 LOC tests + 4 stories.

Total Table effort ≈ 750 LOC + 160 LOC tests + 9 stories. This is roughly 2-3× any other primitive in the wave.

## Calendar + Shared Month-Grid (DS-68 + DatePicker refactor)

### Lift-out Boundary

`DatePicker.tsx` lines 113-141 (the `cells = useMemo(...)` block) is the entire grid logic. It computes a 42-cell array (6 rows × 7 cols) with leading-pad days, in-month days, trailing-pad days. This is exactly what Calendar needs.

**Extract to `src/_internals/calendarGrid.ts`:**

```ts
// src/_internals/calendarGrid.ts
import { startOfMonth, daysInMonth } from "./dateUtils";

export interface DayCell {
  date: Date;
  inMonth: boolean;
  weekIndex: number; // 0-5
}

export interface MonthGrid {
  weeks: DayCell[][]; // always 6 weeks
  cells: DayCell[]; // flat 42 cells, same order
  weekStart: 0 | 1; // 0=Sun, 1=Mon
  monthStart: Date;
}

/**
 * Build a 6×7 month grid for the given year/month.
 * weekStart: 0 = Sunday-first (DatePicker default), 1 = Monday-first (Calendar default per handoff)
 */
export function buildMonthGrid(year: number, month: number, weekStart: 0 | 1 = 0): MonthGrid {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const dim = daysInMonth(monthStart);
  const firstWeekday = monthStart.getDay(); // 0=Sun
  const leadingPad = (firstWeekday - weekStart + 7) % 7;
  const cells: DayCell[] = [];
  // …42 cells, same algorithm as DatePicker.tsx 113-141
  // weeks: chunk cells into 6 arrays of 7
  return { weeks, cells, weekStart, monthStart };
}

export function getWeekDayLabels(weekStart: 0 | 1, format: "short" | "narrow" = "narrow"): string[] {
  const sun = ["S", "M", "T", "W", "T", "F", "S"]; // narrow Sunday-first
  const mon = ["M", "T", "W", "T", "F", "S", "S"]; // narrow Monday-first
  const sunLong = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monLong = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return weekStart === 0 ? (format === "short" ? sunLong : sun) : (format === "short" ? monLong : mon);
}
```

### Refactor DatePicker

Replace lines 113-141 with `const { cells } = buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), 0)` (Sunday-first preserves backward compat). All other logic stays. This is a one-import + one-block change.

DateRangePicker doesn't directly compute the grid — it composes DatePicker. So it gets the refactor for free.

**Visual regression check:**
- Existing baselines: `tests/visual-baselines/pickers-datepicker--*` (8 stories), `pickers-daterangepicker--*` (4 stories) — total 12 PNGs in light mode + dark variants.
- After refactor, run `npm run test:visual` against existing baselines. Pixel-identical pass = no regression.
- If baselines diff (which they SHOULDN'T — algorithm is unchanged), the diff IS a regression and must be debugged before merge. Do NOT use `--update-snapshots` for the DatePicker refactor.

### Calendar Primitive API

```tsx
export interface CalendarEvent {
  id: string;
  date: Date | string;
  endDate?: Date | string;
  label: string;
  color?: string;
  meta?: unknown;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  view?: "month" | "week" | "day";
  defaultView?: "month" | "week" | "day";
  onViewChange?: (view: "month" | "week" | "day") => void;
  selectedDate?: Date | null;
  onSelectedDateChange?: (date: Date) => void;
  weekStart?: 0 | 1; // default 1 (Monday) per handoff ds-calendar.jsx
  // …mobile breakpoint + custom slot for Agenda
}

// Compound API
Calendar.Agenda; // consumer-rendered slot — receives events, renders list
```

Three views — month grid (use `buildMonthGrid`), week (single row of 7 cells), day (single cell + hourly time slots). Week + day views are NEW logic not in DatePicker; not part of the calendarGrid utility. They're internal to `Calendar.tsx`.

### Event Positioning

Day cell layout:
```
┌─────────────┐
│ 12          │ ← day number (top-left)
│ ● Stripe    │ ← event chip 1 (max 2-3 visible)
│ ● Linear    │ ← event chip 2
│ +2 more     │ ← overflow indicator
└─────────────┘
```

Implementation: per cell, `events.filter(e => sameDay(e.date, cell.date))`. Render up to N (default 3, configurable via prop later); if `events.length > N`, render "+(events.length - N) more" link → on click, opens `Popover` with full list.

**Multi-day events:** Per D-17-23 + deferred list, multi-day events have `endDate` but render as single-day chips on EACH day in the range. Spanning bars are deferred. Document the limitation in Storybook.

### Visual Baseline Cumulative Strategy

Per D-17 Claude's discretion: cumulative re-baseline at wave-completion commit. No new baselines per-PR during the phase.

Wave-completion commit (`chore(release): v0.6.0`) runs `npm run test:visual:update` once across all 11 new primitives + 2 refactored (DatePicker, DateRangePicker — should be byte-identical, so won't actually generate new bytes). Total new PNGs: ≈ 45 (avg 4 stories per primitive × 11 primitives + dark-mode variants). Verify reproducibility by running visual tests before commit on a clean branch.

## ARIA Patterns Reference

[CITED: w3.org/WAI/ARIA/apg/patterns/]

### Tabs (DS-62)

- Wrapper: `<div role="tablist" aria-orientation="horizontal" aria-label="...">`
- Tab: `<button role="tab" aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} id={tabId}>`
- Panel: `<div role="tabpanel" aria-labelledby={tabId} tabIndex={0} id={panelId} hidden={!active}>`
- Keys: ArrowLeft/Right (or Up/Down for vertical) move focus + activate (automatic) OR move focus only (manual). Home/End jump to first/last.
- **Recommend automatic activation** (default) — panels are pre-rendered (we can keep them mounted), no async cost. Allow opt-in `activationMode="manual"` if consumer wants to defer panel rendering.

### Accordion (DS-64)

- Pattern is ARIA disclosure (button-controlled show/hide), NOT the deprecated `role="tablist"` accordion antipattern.
- Wrapper: just a `<div>` (no special role needed; content semantics carry).
- Header: `<button aria-expanded={open} aria-controls={panelId} id={headerId}>{title}</button>` wrapped in a `<h3>` (or appropriate heading level).
- Panel: `<div id={panelId} role="region" aria-labelledby={headerId} hidden={!open}>`
- Keys: Enter/Space toggles. Tab to next header (browsers handle this for free).
- Single + multi-expand modes: just internal state — single closes others on open.

### Carousel (DS-65)

- WAI-ARIA Carousel pattern with previous/next buttons.
- Wrapper: `<section aria-roledescription="carousel" aria-label="...">`
- Slides container: `<div aria-live="off"|"polite">` — `off` while autoplay, `polite` when paused.
- Slide: `<div role="group" aria-roledescription="slide" aria-label="N of M">`
- Controls: `<button aria-label="Previous slide">`, `<button aria-label="Next slide">`, optional `<button aria-label="Stop auto-rotation">`.
- **Reduced-motion:** [CITED: w3.org carousel pattern] If `prefers-reduced-motion: reduce`, autoplay is paused on load and the start button is the only enabling path.
- Pause-on-hover + pause-on-focus standard.

### SegmentedControl (DS-63)

NOT a tablist — different semantics.
- Wrapper: `<div role="radiogroup" aria-label="...">`
- Option: `<button role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1}>`
- Keys: ArrowLeft/Right cycle + select (automatic activation IS expected for radiogroup).

### Breadcrumbs (DS-69)

- Wrapper: `<nav aria-label="Breadcrumb">`
- List: `<ol>` (ordered — sequence matters)
- Item: `<li><a href="...">Page</a></li>`, last item: `<li><a href="..." aria-current="page">Current</a></li>` (or `<span aria-current="page">` if not a link).
- Truncation: hidden middle items in a DSDropdown — the dropdown trigger is a button labeled "Show N hidden breadcrumbs".

### Timeline (DS-66)

- Read-only display; no special ARIA pattern.
- Use `<ol>` for sequence. Each item `<li>` with `time` element for date.
- If interactive (focusable items), each `<li>` becomes `<button>` with descriptive aria-label.

## Tabs Overflow Menu (DS-62)

Pattern: ResizeObserver on tablist → on resize, measure each tab's `offsetLeft + offsetWidth`. Tabs whose right edge exceeds container width minus the "more" button width go into the overflow menu (DSDropdown).

```ts
useLayoutEffect(() => {
  if (!tablistRef.current) return;
  const tablist = tablistRef.current;
  const ro = new ResizeObserver(() => {
    const containerWidth = tablist.clientWidth;
    let visibleCount = tabs.length;
    let cumulativeWidth = 0;
    const moreButtonWidth = 40;
    for (let i = 0; i < tabs.length; i++) {
      const tab = tablist.children[i] as HTMLElement;
      cumulativeWidth += tab.offsetWidth;
      if (cumulativeWidth + moreButtonWidth > containerWidth) {
        visibleCount = i;
        break;
      }
    }
    setVisibleCount(visibleCount);
  });
  ro.observe(tablist);
  return () => ro.disconnect();
}, [tabs.length]);
```

**Keyboard model conflict — flag:** When tabs overflow into DSDropdown, the parent tablist's ArrowLeft/Right keyboard model needs to know to skip overflow tabs (or wrap into the dropdown menu). Simplest: the "More" button itself is the last tab in the keyboard cycle; pressing Enter on it opens the dropdown, which has its own ArrowUp/Down keyboard model courtesy of DSDropdown.

DSDropdown's keyboard model (verified by reading `_internals/DSDropdown.tsx`) is ArrowUp/Down/Home/End/Enter/Escape on `document` while open. This does NOT conflict with the parent tablist because tabs are visible-only in tablist; once overflow tabs move into the dropdown, they're keyboard-driven by DSDropdown. Clean handoff.

## Carousel Touch + Reduced-Motion (DS-65)

### Touch Swipe (Hand-Rolled)

```ts
function useSwipe(ref: RefObject<HTMLElement>, onSwipeLeft: () => void, onSwipeRight: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0]!.clientX; };
    const onEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0]!.clientX - startX;
      if (Math.abs(deltaX) < 40) return; // threshold
      if (deltaX > 0) onSwipeRight(); else onSwipeLeft();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
```

40px threshold is industry-standard (matches Embla, Swiper). Don't use Pointer Events here — touchstart/touchend is sufficient and avoids click-vs-swipe ambiguity.

### Reduced-Motion

```ts
const reducedMotion = useReducedMotion(); // existing public hook!
useEffect(() => {
  if (autoplay && !reducedMotion) {
    const id = setInterval(() => next(), interval);
    return () => clearInterval(id);
  }
}, [autoplay, reducedMotion, interval]);
```

Existing `useReducedMotion` hook in `src/hooks/useReducedMotion.ts` — verify it's there (was in 13.5 import). If not exported, expose it via `hooks/index.ts`.

CSS animation also respects reduced-motion via `@media (prefers-reduced-motion: reduce)` block — disable transition on slide change.

## InfiniteList IntersectionObserver (DS-67)

```tsx
export function InfiniteList({ hasMore, loading, onLoadMore, children }: InfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]!.isIntersecting) onLoadMore?.();
      },
      { rootMargin: "200px" } // pre-fetch when 200px from viewport bottom
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="ds-atom-infinitelist">
      {children}
      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true">
          {loading && <Spinner />}
        </div>
      )}
      {!hasMore && <div className="ds-atom-infinitelist-end">End of list</div>}
    </div>
  );
}
```

`rootMargin: "200px"` triggers fetch slightly before sentinel scrolls into view — eliminates loading-spinner flash for users with fast networks. React 19 handles the strict-mode double-effect cleanup correctly because we disconnect on cleanup.

## Build + Distribution

### tsup Multi-Entry — Final Recommended Config

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "lucide-react", "@tiptap/react", "@tiptap/starter-kit", "@tiptap/extension-link", "@tiptap/extension-placeholder"],
  onSuccess: "cp src/*.css dist/ 2>/dev/null || true",
});
```

Notes:
- All TipTap packages MUST be `external` — otherwise the 23-package dependency tree gets inlined.
- After build, verify `dist/` structure:
  ```
  dist/
    index.js
    index.d.ts
    hooks/index.js
    hooks/index.d.ts
    icons/index.js
    icons/index.d.ts
    chunk-XXX.js  (shared Icon wrapper, helpers)
    tokens.css
    primitives.css
    utilities.css
  ```
- If `dts: true` produces flat `dist/icons.d.ts` instead of nested `dist/icons/index.d.ts`, update `package.json` `exports` accordingly. (Both are valid; just be consistent.)

### Tree-Shaking Verification

Acceptance test fixture (place in `tests/treeshake/` or a top-level sandbox):

```ts
// fixture/main.ts
import { ChevronDown } from "../../dist/icons/index.js";
console.log(ChevronDown);
```

```bash
npx esbuild fixture/main.ts --bundle --minify --format=esm | wc -c
# Expected: < 5000 bytes (< 5 KB)
```

If output > 10 KB, tree-shaking is broken — likely `sideEffects` missing in package.json or barrel re-exports preventing static analysis.

### Subpath Exports — Node Resolution

`exports` map IS the modern resolution mechanism. With `"type": "module"` in package.json (already set), Node 22 + Vite + Webpack 5 + Rollup all resolve `./icons` correctly.

**Verify with:** `node -e 'console.log(require.resolve("@akhil-saxena/design-system/icons"))'` — should resolve to `dist/icons/index.js`. (After publish; for local dev use `npm link` or workspace.)

## Pitfalls

### lucide-react `^1.8.0` Reframe

CONTEXT.md says "stale ^1.8.0 may be wrong package." It is NOT wrong — lucide-react had a 0.x → 1.0 major in March 2026. `^1.8.0` is 20 days old as of today. **The bump to ^1.14.0 is recommended for the `LucideProvider` context API and minor bugfixes, but it is NOT a "fix the wrong package" emergency.** Update CONTEXT.md mental model accordingly.

### TipTap React 19 Known Issues

[CITED: tiptap GitHub issues + discussions]
- **SSR detection error:** Without `immediatelyRender: false`, throws on SSR. SOLVED by D-17-19 spec.
- **`onUpdate` stale closure** [issue #2403, #7417]: `useEditor`'s onUpdate is captured at first render. If it depends on changing parent state, use `useCallback` with stable deps OR call `editor.on("update", handler)` in a useEffect.
- **`setContent` infinite loop:** Documented above in § TipTap. Use `{ emitUpdate: false }`.
- **TipTap v3.x is NEW (March 2026 major).** Migration from v2 was non-trivial; if any consumer was on v2 they'll need to migrate. We're greenfield so this is not our problem.
- **Drag handle PRO + SSR** [issue #5602]: PRO extension has issues with `immediatelyRender: false`. We're not using PRO extensions; non-issue.

### tsup Multi-Entry Type Emit

[CITED: tsup discussions #942] When using array-form entry, the output structure may not match expectations. If you see `dist/icons.js` (flat) instead of `dist/icons/index.js`, tsup is treating `src/icons/index.ts` as an entry whose output name is just `icons`. To force nesting: use object form `entry: { index: "src/index.ts", "hooks/index": "src/hooks/index.ts", "icons/index": "src/icons/index.ts" }`. **The current tsup.config.ts (using array form) DOES produce `dist/hooks/index.js` correctly** — verified by inspecting the existing build pattern, which means tsup is auto-detecting the directory structure. Keep array form.

### DSDropdown + Tabs Overflow Keyboard

Already addressed in § Tabs Overflow Menu. No conflict expected. Plan validation: write a test that opens overflow dropdown via Tab → Enter on "More" button, confirms ArrowDown moves focus into dropdown options (NOT to next tab in tablist).

### DatePicker Refactor — Visual Regression

Risk: any difference in cell ordering, padding, or modulo arithmetic between old code and `buildMonthGrid()` produces a 1-pixel shift in the calendar grid → visual baseline diff → false-positive failure.

**Mitigation:**
1. The lifted code in `_internals/calendarGrid.ts` MUST match `DatePicker.tsx` lines 113-141 byte-for-byte in algorithm (only the encapsulation changes).
2. Run `npm run test:visual` against existing baselines BEFORE making any other changes in the PR. If green, proceed. If red, debug the diff in the lift before continuing.
3. NEVER use `--update-snapshots` in the DatePicker refactor commit. Baselines should be unchanged.
4. Cumulative re-baseline at wave-completion is fine for NEW primitives; NOT fine for refactored existing ones — they must reproduce existing baselines exactly.

### CSS File Size

`primitives.css` is 2398 lines today. Phase 17 adds ~10 new `.ds-atom-*` blocks. Estimated +600-900 lines → ~3000-3300 lines total. Still well within "monolithic is fine" territory; no need to split per D-17 specifics.

### IntersectionObserver in StrictMode

React 19's strict-mode double-effect could fire IntersectionObserver creation twice and trigger `onLoadMore` twice on initial render. Our cleanup function `io.disconnect()` handles the first observer correctly, but the `useEffect` may register the second observer before the first's effect cleanup. Add a ref guard:

```ts
const loadingRef = useRef(false);
const onIntersect = () => {
  if (loadingRef.current || !hasMore) return;
  loadingRef.current = true;
  Promise.resolve(onLoadMore?.()).finally(() => { loadingRef.current = false; });
};
```

Or rely on consumer's `loading` prop (preferred — simpler).

### React 19 `forwardRef` Deprecation Warning

React 19 deprecates `forwardRef`; `ref` is now a regular prop. We have ~30 existing primitives using `forwardRef` and they continue to work (deprecation, not removal). New Phase 17 primitives can choose:
- Stay with `forwardRef` for consistency with existing 30 primitives. RECOMMENDED.
- Use the new `ref` prop directly. This creates inconsistency.

**Recommendation:** Keep `forwardRef` for all Phase 17 primitives. A library-wide migration can happen in a future minor (not Phase 17).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Unit framework | Vitest 4.1.4 + @testing-library/react 16.3 + jsdom 25 |
| Visual framework | Playwright 1.59.1 + Storybook 8.6 (`storybook dev` server, baselines in `tests/visual-baselines/`) |
| Lint/format | Biome 1.9.4 |
| Typecheck | tsc 6.0.2 (`tsc --noEmit`) |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test && npm run typecheck && npm run check && npm run test:visual` |
| Visual baseline regen | `npm run test:visual:update` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DS-60 | Icon wrapper applies defaults (size 20, strokeWidth 1.5) | unit | `vitest run src/_internals/Icon.test.tsx` | Wave 0 — file to create |
| DS-60 | `<Icon icon={ChevronDown} />` renders SVG with correct attrs | unit | same | Wave 0 |
| DS-60 | `<Icon icon={X} aria-label="close" />` adds role=img + label | unit | same | Wave 0 |
| DS-60 | `aria-hidden=true` when no aria-label | unit | same | Wave 0 |
| DS-60 | Icons subpath barrel re-exports work in build | smoke (build artifact) | `npm run build && node -e "console.log(require('./dist/icons/index.js'))"` | Wave 0 — script to write |
| DS-60 | Tree-shake fixture: single icon import < 5 KB minified | smoke | `npx esbuild tests/treeshake/main.ts --bundle --minify --format=esm \| wc -c` | Wave 0 — fixture to create |
| DS-60 | 14 primitives no longer import lucide-react directly | lint check | `! grep -r "from \"lucide-react\"" src/*.tsx \| grep -v _internals/Icon.tsx` | Wave 0 — script |
| DS-61 | Sortable header toggles asc/desc/asc on click | unit | `vitest run src/Table.test.tsx` | Wave 0 |
| DS-61 | Density attribute applies CSS row-height | visual baseline | Playwright story `data-display-table--density-cozy` | Wave 0 |
| DS-61 | Multi-selection with select-all + indeterminate | unit | `vitest run src/Table.test.tsx` | Wave 0 |
| DS-61 | Resize handle drags column width, respects min 60px | unit (mock pointer events) | same | Wave 0 |
| DS-61 | Pagination truncation algorithm 7-page edge cases | unit | `vitest run src/hooks/useSortableTable.test.ts` (or adjacent) | Wave 0 |
| DS-61 | Sticky header keeps visual on scroll | visual baseline | Playwright story | Wave 0 |
| DS-62 | Tab arrow-key navigation cycles + activates | unit | `vitest run src/Tabs.test.tsx` | Wave 0 |
| DS-62 | Overflow menu shows hidden tabs at narrow viewport | visual baseline | Playwright story narrow viewport | Wave 0 |
| DS-63 | Radiogroup keyboard navigation + aria-checked | unit | `vitest run src/SegmentedControl.test.tsx` | Wave 0 |
| DS-64 | aria-expanded toggles on accordion button | unit | `vitest run src/Accordion.test.tsx` | Wave 0 |
| DS-64 | Single-mode closes others on open | unit | same | Wave 0 |
| DS-65 | Autoplay paused when prefers-reduced-motion | unit (mock matchMedia) | `vitest run src/Carousel.test.tsx` | Wave 0 |
| DS-65 | Touch swipe left advances slide | unit (mock TouchEvent) | same | Wave 0 |
| DS-66 | Timeline renders ordered list | unit | `vitest run src/Timeline.test.tsx` | Wave 0 |
| DS-67 | IntersectionObserver triggers onLoadMore | unit (mock IO) | `vitest run src/InfiniteList.test.tsx` | Wave 0 |
| DS-68 | calendarGrid utility produces correct 42 cells for known months | unit | `vitest run src/_internals/calendarGrid.test.ts` | Wave 0 |
| DS-68 | DatePicker refactor produces no visual baseline diff | visual baseline (regression) | `npm run test:visual` against unchanged baselines | EXISTS — pickers-datepicker--* |
| DS-68 | Calendar event chip overflow shows "+N more" | unit | `vitest run src/Calendar.test.tsx` | Wave 0 |
| DS-68 | View-mode toggle switches month/week/day | unit | same | Wave 0 |
| DS-69 | Breadcrumbs nav + aria-current="page" | unit | `vitest run src/Breadcrumbs.test.tsx` | Wave 0 |
| DS-69 | Truncation collapses to dropdown above maxVisible | unit | same | Wave 0 |
| DS-70 | RichText renders TipTap surface, immediatelyRender false | unit (jsdom) | `vitest run src/RichText.test.tsx` | Wave 0 |
| DS-70 | Toolbar Bold button toggles editor's bold mark | unit | same | Wave 0 |
| DS-70 | Controlled value sync no infinite loop | unit (rerender with new value) | same | Wave 0 |
| DS-70 | onChange emits HTML by default, JSON when outputFormat=json | unit | same | Wave 0 |
| DS-70 | Markdown shortcut `**bold**` triggers bold mark | unit | same | Wave 0 |
| All | Dark-mode visual snapshot per primitive | visual baseline | Playwright story `*--dark-mode` per primitive | Wave 0 — stories to write |

### Sampling Rate

- **Per task commit:** `npm test` (vitest, ~30s for full suite at current scale).
- **Per wave merge:** `npm test && npm run typecheck && npm run check && npm run test:visual` (visual takes ~2-3 min, depends on Storybook startup).
- **Phase gate (v0.6.0 release):** Full suite green + cumulative visual baseline regen + `npm run build` artifact inspection (verify dist/icons/ structure).

### Wave 0 Gaps

Test infra needs:
- [ ] **Playwright spec file in `tests/visual/`** — currently MISSING. The `playwright.config.ts` points to `./tests/visual` but the directory has no spec files; only `tests/visual-baselines/` exists with PNGs. Phase 17 must include a Wave 0 sub-task to write the actual visual test runner (likely `tests/visual/storybook.spec.ts` that iterates Storybook story IDs and screenshots each into `visual-baselines/`). Without this, `npm run test:visual` cannot execute. **CRITICAL — flag as Wave 0 work.**
- [ ] `tests/treeshake/` fixture for icon subpath bundle-size verification — new
- [ ] `src/_internals/Icon.test.tsx` — new
- [ ] `src/_internals/Icon.stories.tsx` — new
- [ ] `src/_internals/calendarGrid.test.ts` — new
- [ ] All 11 primitive `*.test.tsx` + `*.stories.tsx` — new
- [ ] Confirm `useReducedMotion` hook is exported from `src/hooks/index.ts` — verify; if absent, add (Carousel needs it)
- [ ] Confirm Checkbox supports `indeterminate` prop — verify in `src/Checkbox.tsx`; if absent, add (Table SelectAll needs it)

### CSS / Token Validation Gaps

- [ ] No automated test verifies dark-mode token coverage. Visual baselines per primitive (`*--dark-mode` stories) are the only regression check. Recommendation: every Phase 17 primitive ships a `*--dark-mode` story.
- [ ] No AAA contrast automated test. Manual review per handoff README § Accessibility for new primitives. Recommendation: include a `<details>` block in each primitive's Storybook docs page listing the tested foreground/background pairs.

## Project Constraints (no CLAUDE.md found in repo root)

A `CLAUDE.md` file does NOT exist at the repository root [VERIFIED: Read tool returned "File does not exist"]. Project conventions are encoded in `.planning/PROJECT.md` instead:

- Plain CSS only (no CSS-in-JS, no Tailwind, no styled-components)
- One `.ds-atom-<name>` class block per primitive in `src/primitives.css`
- ESM-only build (no CJS dual)
- `:root.dark` selector for dark-mode (NOT `body.dark`)
- React 19 peer dep — no internal React
- Tokens-only colors (no hardcoded hex except always-dark exceptions)
- DSPortal + DSDropdown stay in `_internals/`, NOT exported
- Each primitive ships `<Name>.tsx` + `<Name>.stories.tsx` + `<Name>.test.tsx`
- Cumulative Playwright visual baselines per wave-completion commit
- Commit format: `feat(<phase>-<plan>): <message>`, `chore(release): vX.Y.Z`
- DS-NN identifiers cited in commits + PRs + changelog
- **No Co-Authored-By trailers** (system rule per PROJECT.md)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | TipTap StarterKit gzipped is ~50-70 KB | TipTap Bundle Size | Low — number is informative, not a budget. Bundlephobia did not return numeric data; estimate from 23-pkg dep tree. |
| A2 | `<thead>` sticky positioning works in all modern browsers | Table Sticky Header | Medium — verify with manual test in Safari. If broken, fall back to `<th>` sticky. |
| A3 | `useReducedMotion` hook is already in `src/hooks/` (was in 13.5 import) | Carousel | Low — verify in `src/hooks/index.ts`; if missing, add as Wave 0 sub-task. |
| A4 | Existing `Checkbox` primitive supports an `indeterminate` prop | Table Selection | Medium — Table SelectAllCell needs it. If missing, must extend Checkbox in Wave 0 (could leak into 17-02 plan). |
| A5 | Calendar `weekStart` default = 1 (Monday) per handoff `ds-calendar.jsx` line 19; DatePicker stays Sunday-first for backward compat | Calendar | Low — verified in handoff source; both modes are configurable. |
| A6 | tsup array-form entry produces `dist/<dir>/index.js` for `src/<dir>/index.ts` (auto-nesting) | tsup config | Low — based on existing `src/hooks/index.ts` → `dist/hooks/index.js` working today. Verify after first build of Phase 17. |
| A7 | TipTap StarterKit's tag/attr allowlist is sufficient client-side sanitization | RichText sanitization | Medium — TipTap discussion #2845 says yes. Server-side responsibility documented in Storybook. |
| A8 | The 25-icon inventory in this doc is complete | Icon refactor | Low — produced by `grep` over `src/*.tsx`. Stories/tests files have additional usages but not in primitive runtime. |

## Open Questions

1. **Should the icon refactor (D-17-04) be its own plan?**
   - What we know: 14 primitives + ~5 stories/tests files use lucide-react directly.
   - What's unclear: Diff size — likely 14 × 1-line import + maybe 1-2 callsite tweaks ≈ 30-50 line diff total. Probably foldable into 17-01.
   - Recommendation: **Fold into 17-01-PLAN-icons-setup.** One commit for the wrapper + subpath build + the refactor sweep. Single revert point if anything goes wrong.

2. **Is there a missing `tests/visual/*.spec.ts` file?**
   - What we know: Playwright config points to `./tests/visual`, baselines exist at `tests/visual-baselines/`, but no spec runner found.
   - What's unclear: Does the spec runner exist somewhere unexpected, or was it lost in the same `.planning` purge that nuked the original docs?
   - Recommendation: **Flag for Wave 0 audit.** First task in 17-01 should run `npm run test:visual` against existing baselines and either verify it works (file exists somewhere) or add a Wave 0 sub-task to write `tests/visual/storybook.spec.ts`.

3. **Should `LucideProvider` be used in addition to / instead of the wrapper?**
   - What we know: Lucide v1 added `LucideProvider` for context-based defaults.
   - What's unclear: Does it apply to icons IMPORTED FROM `lucide-react` directly inside our wrapped re-exports?
   - Recommendation: **Skip LucideProvider for v0.6.** Brand-lock at re-export time is what the user asked for ("at import time, not at render time"). LucideProvider could be added in v0.7+ for consumer apps that want to override, but it's redundant for our internal use.

4. **Carousel: Embla vs hand-rolled — final call?**
   - What we know: Embla is the React ecosystem standard, ~10 KB, gives all the touch+keyboard+reduced-motion behaviors.
   - What's unclear: User's "no jarring" preference — Embla's spring physics might or might not feel jarring.
   - Recommendation: **Hand-roll for v0.6** (matches no-deps ethos in the project — see dateUtils precedent). Revisit in v0.7 if touch UX is bad.

5. **Should Icon be public or `_internals`?**
   - What we know: D-17-02 says "public re-export from main barrel" — i.e., public.
   - What's unclear: Is the public Icon useful to consumers, or only the pre-wrapped icons in `/icons` subpath?
   - Recommendation: **Both.** Public `<Icon icon={X} />` for consumers who want to wrap a custom lucide icon not in our pre-wrap list. Pre-wrapped icons in `/icons` for the common case. (This is the spec.)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| node | All builds | ✓ | local Node — engines requires `>=20` | — |
| npm | Install | ✓ | bundled with Node | — |
| TypeScript compiler | Type emit | ✓ | `~6.0.2` (devDep) | — |
| Storybook | Visual baselines | ✓ | `^8.6.18` (devDep) | — |
| Playwright | Visual regression | ✓ | `^1.59.1` (devDep) | — |
| `lucide-react` | DS-60 | ✓ | currently `^1.8.0`, bumping to `^1.14.0` | — |
| `@tiptap/*` | DS-70 | ✗ — NEW | `^3.22.5` | None — Plan must include `npm install` step |

**Missing dependencies with no fallback:** None blocking — all TipTap packages install cleanly.

**Missing dependencies with fallback:** None.

## Sources

### Primary (HIGH confidence)
- Internal codebase reads (verbatim): `tsup.config.ts`, `package.json`, `src/index.ts`, `src/hooks/index.ts`, `src/_internals/DSDropdown.tsx`, `src/_internals/DSPortal.tsx`, `src/_internals/dateUtils.ts`, `src/DatePicker.tsx`, `src/DateRangePicker.tsx`, `src/Select.tsx`, `vitest.config.ts`, `playwright.config.ts`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/phases/17-wave-6-icons-data-display/17-CONTEXT.md`, `design_handoff/design-system/ds-data.jsx`, `design_handoff/design-system/ds-richtext.jsx`, `design_handoff/design-system/ds-calendar.jsx` (head)
- npm registry verification (today, 2026-04-29): `lucide-react@1.14.0`, `@tiptap/react@3.22.5`, `@tiptap/starter-kit@3.22.5`, `@tiptap/extension-link@3.22.5`, `@tiptap/extension-placeholder@3.22.5`
- TipTap official docs: https://tiptap.dev/docs/editor/getting-started/install/react
- TipTap setContent docs: https://tiptap.dev/docs/editor/api/commands/content/set-content
- TipTap output guide: https://tiptap.dev/docs/guides/output-json-html
- TipTap GitHub issue #5856 (SSR detection): https://github.com/ueberdosis/tiptap/issues/5856
- TipTap GitHub discussion #2845 (sanitization): https://github.com/ueberdosis/tiptap/discussions/2845
- Lucide React docs: https://lucide.dev/guide/packages/lucide-react
- Lucide v1 release notes: https://lucide.dev/guide/version-1
- Lucide TypeScript guide: https://lucide.dev/guide/react/advanced/typescript
- Lucide React 19 issue #2134 (closed): https://github.com/lucide-icons/lucide/issues/2134
- WAI-ARIA APG Tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- WAI-ARIA APG Carousel pattern: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
- WAI-ARIA APG Accordion pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
- tsup docs: https://tsup.egoist.dev/

### Secondary (MEDIUM confidence)
- Tree-shaking with tsup blog post: https://dorshinar.me/posts/treeshaking-with-tsup
- TanStack Table v8 sorting guide: https://tanstack.com/table/v8/docs/guide/sorting (used as reference for hand-rolled hook signatures)
- TipTap onUpdate stale closure issue #2403: https://github.com/ueberdosis/tiptap/issues/2403

### Tertiary (LOW confidence)
- TipTap StarterKit bundle-size estimate (BundlePhobia returned no numeric data — estimate derived from 23-package dependency tree size manually).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via `npm view` today; React 19 peer compat confirmed
- Architecture (TipTap controlled pattern, Table hooks, calendarGrid lift): HIGH — TipTap pattern verified via official docs + community issues; Table hooks are straightforward derivations; calendarGrid is a 1:1 lift of working code
- Pitfalls: HIGH — each pitfall traces to a specific GitHub issue or codebase observation
- Bundle size estimates: LOW — BundlePhobia did not return numeric data; numbers are informed estimates

**Research date:** 2026-04-29
**Valid until:** ~2026-05-29 (30 days). lucide-react and TipTap are publishing weekly; verify versions if planning slips past May.

## RESEARCH COMPLETE
