# Changelog

All notable changes to `@akhil-saxena/design-system` are documented here.

Format: `## X.Y.Z — Release summary` with subsections per change type.

---

## 0.6.0 — Wave 6: Data Display Primitives + Canonical Icons

### New primitives (DS-60 through DS-70)

- **Icon** (`DS-60`) — Brand-lock wrapper around lucide-react with built-in size 20, strokeWidth 1.5, `currentColor` defaults. Pre-wrapped icons exported via new subpath `@akhil-saxena/design-system/icons` — tree-shakeable. 14 existing primitives refactored to consume canonical icons; per-callsite drift on stroke-width / size eliminated.
- **Table** (`DS-61`) — Compound primitive: `Table.Root`, `Table.Header`, `Table.HeaderCell`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.SelectAllCell`, `Table.SelectCell`, `Table.Pagination`. Helper hooks: `useSortableTable`, `useTableSelection`, `useResizableColumns`. Three densities (`cozy`/`comfortable`/`spacious`), sticky-header opt-in, click-anywhere sort headers, single+multi selection with indeterminate, drag-to-resize with min 60px, paginated nav with truncation algorithm.
- **Tabs** (`DS-62`) — WAI-ARIA tab pattern with two visual variants (underline default + pill), optional count badges, automatic and manual activation modes, ResizeObserver-driven overflow menu via DSDropdown for narrow viewports.
- **SegmentedControl** (`DS-63`) — Pill-shaped 2-5 option `radiogroup` with full Arrow/Home/End keyboard model. Three sizes via `data-size`. Used by Calendar's view-mode toggle.
- **Accordion** (`DS-64`) — WAI-ARIA disclosure pattern (NOT the deprecated tablist accordion). `Accordion.Item` compound member, single + multi-expand modes, configurable heading level (h2-h6), reduced-motion support.
- **Carousel** (`DS-65`) — Hand-rolled WAI-ARIA carousel with Pointer Events touch swipe, opt-in autoplay (gated on `prefers-reduced-motion`), pause-on-hover/focus, arrow + dot navigation. No external dep (Embla considered, rejected for v0.6).
- **Timeline** (`DS-66`) — Read-only ordered-list display with `<time>` semantic elements, horizontal + vertical orientations, optional click handlers, dot + connector line via CSS pseudo-elements.
- **InfiniteList** (`DS-67`) — IntersectionObserver-driven loading sentinel with `hasMore` + `loading` guards, default Skeleton loading slot, end-of-list slot. Virtualization left to consumer (TanStack Virtual recipe documented).
- **Calendar** (`DS-68`) — Three views (`month`/`week`/`day`) with view-mode toggle via SegmentedControl. Event chips on day cells (max 3 + "+N more" overflow Popover, BottomSheet on mobile breakpoint). `Calendar.Agenda` consumer-rendered slot. Multi-day events render single-day chips per day in range. Today highlight in amber, full dark-mode parity. Built on extracted `_internals/calendarGrid` utility shared with DatePicker.
- **Breadcrumbs** (`DS-69`) — `<nav>` + `<ol>` semantic with `aria-current="page"` on last item. Truncation collapses middle items into a DSDropdown menu beyond `maxVisible`.
- **RichText** (`DS-70`) — TipTap-powered headless editor (StarterKit + Link + Placeholder, ~50-70 KB gzipped, externalized in build). Toolbar (Bold/Italic/Underline/Strike/Code/Heading H2-H3/List/OL/Quote/HR/Link) using Button + canonical Icon. Link popover via DSPortal. Three-layer controlled-sync guard prevents the well-known TipTap infinite-loop trap. HTML output by default; JSON via `outputFormat` prop. SSR-safe via `immediatelyRender: false`. Custom toolbar slot.

### Internals

- **calendarGrid utility** (`src/_internals/calendarGrid.ts`) — Pure month-grid math lifted from DatePicker (lines 113-141 in v0.5.x). DatePicker + DateRangePicker refactored to consume; visual baselines remained byte-identical (no `--update-snapshots`). Calendar uses the same utility with `weekStart=1` (Monday-first per handoff).

### Hooks (added to `@akhil-saxena/design-system/hooks` subpath)

- `useReducedMotion` — matchMedia wrapper for prefers-reduced-motion (used by Carousel)
- `useSortableTable` — pure-derivation sort state for Table
- `useTableSelection` — single + multi mode selection state with indeterminate
- `useResizableColumns` — Pointer Events column-resize state with consumer-owned persistence

### Build

- tsup multi-entry: `src/index.ts`, `src/hooks/index.ts`, `src/icons/index.ts` — produces `dist/icons/index.js` + `.d.ts`.
- `package.json` `exports` extended with `./icons` subpath.
- `sideEffects: ["*.css"]` declared (preserves CSS imports through tree-shaking).
- `lucide-react` bumped from `^1.8.0` to `^1.14.0`.
- New deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-underline`, `@tiptap/pm` (all at `^3.22.5`, all externalized).

### Refactors (no behavior change)

- 14 primitives migrated from direct `lucide-react` imports to the canonical `Icon` wrapper:
  AlertBanner, Autocomplete, Checkbox, Chip, CopyToClipboard, DatePicker, DateRangePicker, Lightbox, MultiSelect, NumberStepper, Select, SplitButton, StarRating, Toast.
- `Checkbox` extended with `indeterminate?: boolean` prop (Plan 17-00).

### Visual baselines

- Cumulative regen for v0.6.0 — light + dark stories across all 46 shipped primitives. Pre-existing baselines for DatePicker + DateRangePicker remained byte-identical through the calendarGrid extract (verified before regen).

### Out of scope (deferred to v0.7+)

- Mentions / slash-commands / task-list / code-block-with-syntax-highlighting / collab in RichText.
- Plain-text-only paste mode.
- AgendaList chrome expansion in Calendar.
- Multi-day event spanning bars in Calendar.
- Year-view in Calendar.
- Table column reordering.
- Built-in Table virtualization (consumer brings TanStack Virtual).
- Grid (responsive card grid wrapper) — explicitly skipped; CSS Grid suffices.

---

## 0.5.6 — Dark-mode hover specificity fix

- Fix dark-mode hover state specificity on DatePicker cells so hover does not clobber selected, in-range, range-endpoint, and today styles.

## 0.5.5 — SplitButton width + hover state preservation

- Fix SplitButton full-width layout.
- DatePicker cell hover preserves state styling (selected / in-range / range-endpoints / today).

## 0.5.4 — SplitButton chevron width + accent cleanup

- Fix SplitButton chevron button minimum width.
- Clean up amber accent token usage across primitives.

## 0.5.3 — DateRangePicker range-edge polish

- Fix range-edge visual treatment in DateRangePicker calendar cells.

## 0.5.2 — DateRangePicker dual-endpoint selection marker

- Add dual-endpoint selection marker for DateRangePicker's complete ranges.

## 0.5.1 — DateRangePicker + Select + SplitButton + BottomSheet

- DateRangePicker single-calendar mode.
- DateRangePicker dark-mode parity.
- Time picker integration on DatePicker.
- Select search field.
- SplitButton variants.
- BottomSheet swipe-to-dismiss.

## 0.5.0 — Wave 5: Form Inputs

6 compound form-input primitives: DatePicker, DateRangePicker, MultiSelect, Select, SplitButton, CopyToClipboard.
Internal DSDropdown + DSPortal utilities. 14 helper hooks.

## 0.4.0 — Wave 4: Feedback Primitives

6 feedback primitives: AlertBanner, Toast, Skeleton, ProgressBar, Spinner, Lightbox.

## 0.3.0 — Wave 3: Overlay Primitives

Popover, Modal, BottomSheet, Tooltip.

## 0.2.0 — Wave 2: Input Controls

NumberStepper, RollingNumber, RangeSlider, StarRating, Autocomplete.

## 0.1.0 — Wave 1: Foundation Atoms

Button, TextInput, Textarea, Badge, Chip, Avatar (+ AvatarStack), Checkbox, Radio (+ RadioGroup), Toggle.
Hooks subpath: useFocusTrap, useClickOutside, useReducedMotion, useTokens.
Three CSS layers: tokens.css, primitives.css, utilities.css.
