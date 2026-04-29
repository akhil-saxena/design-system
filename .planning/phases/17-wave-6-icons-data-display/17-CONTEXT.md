# Phase 17: Wave 6 — Icons + Data Display Primitives - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the canonical icon kit (so subsequent primitives stop using ad-hoc inline SVGs) and 10 data-display primitives covering the "Data Display" group of the v1.0 handoff: Icons subpath, Table, Tabs, SegmentedControl, Accordion, Carousel, Timeline, InfiniteList, Calendar, Breadcrumbs, RichText. Cut v0.6.0 at completion. Refactor existing primitives to consume the canonical icon wrapper in the same wave.

**In scope:** DS-60..70 — eleven primitives plus the `/icons` subpath build setup and a refactor sweep across previously-shipped primitives that import lucide directly.

**Out of scope:** Layout primitives (AppShell/AppBar/Footer → Phase 18), patterns (Wizard/FormValidation/Coachmark → Phase 18), interaction primitives (InlineEdit/Sortable/SearchAndFilters → Phase 18), illustrations subpath (DS-81 → Phase 18), v1.0 release itself (Phase 18).

</domain>

<decisions>
## Implementation Decisions

### Icon Strategy (Area 1)
- **D-17-01:** Standardize on `lucide-react` as the icon source. Update from the stale `^1.8.0` pin to the latest stable lucide-react. Do NOT port the 119 custom icons from `ds-iconset.jsx` — lucide already covers the design language at 1.5px stroke when configured.
- **D-17-02:** Ship a brand-lock `<Icon>` wrapper (recommended location: `src/_internals/Icon.tsx`, public re-export from main barrel) with defaults: `size={20}`, `strokeWidth={1.5}`, `color="currentColor"`, `aria-hidden="true"` unless `aria-label` provided. Wrapper accepts a `lucide-react` icon component as the `icon` prop OR renders children for custom-SVG escape hatches.
- **D-17-03:** New subpath export `@akhil-saxena/design-system/icons` re-exports each commonly-used lucide icon as a pre-wrapped component (e.g., `export const ChevronDown = wrap(LucideChevronDown)`). Tree-shakeable. Add tsup multi-entry config; mirror existing `/hooks` setup. Verify with a build that imports a single icon in a sandbox project shows only that one icon in the bundle.
- **D-17-04:** Refactor the 14 primitives currently importing directly from `lucide-react` (`Select`, `MultiSelect`, `Autocomplete`, `Checkbox`, `CopyToClipboard`, `Chip`, `DatePicker`, `Lightbox`, `NumberStepper`, `SplitButton`, `Toast`, `AlertBanner`, `StarRating`, plus any Phase 17 primitive that needs an icon) to import from `_internals/Icon` (or the public Icon component) — eliminates per-primitive size/strokeWidth drift.
- **D-17-05:** Icons land FIRST in Phase 17 commit ordering. All subsequent DS-61..70 primitives use the canonical Icon wrapper from inception.

### Table Primitive (Area 2)
- **D-17-06:** Composable subcomponent API. Public surface: `Table.Root`, `Table.Header`, `Table.HeaderCell`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.SelectAllCell`, `Table.SelectCell`, `Table.Pagination`. Helper hooks for behavior: `useSortableTable`, `useTableSelection`, `useResizableColumns`. Consumer assembles. No `<Table data={...} columns={...} />` smart-component shape.
- **D-17-07:** Sort UX matches handoff `ds-data.jsx` pattern — chevron-in-header (▲ ascending / ▼ descending) inline with the column label, ~9px size, monospace font. Click anywhere on header to toggle. Helper `useSortableTable(rows, { defaultCol, defaultDir })` returns `sorted`, `sortCol`, `sortDir`, `toggleSort(key)`.
- **D-17-08:** Three density modes: `cozy` (32px row), `comfortable` (40px row, default), `spacious` (48px row). Implemented as a `density` prop on `Table.Root` that sets a `data-density` attribute; CSS in `primitives.css` keys off `[data-density="cozy"]` etc. No CSS-in-JS.
- **D-17-09:** Selection ships in Phase 17. `Table.SelectAllCell` + `Table.SelectCell` render the existing `Checkbox` primitive. Hook `useTableSelection({ ids, mode })` returns `selectedIds`, `isAllSelected`, `isIndeterminate`, `toggleAll`, `toggle(id)`. Mode: `single` | `multi` (default).
- **D-17-10:** Resizable columns ship in Phase 17. Per-column drag handle on the right edge of each `Table.HeaderCell` when `resizable` prop is set. Min 60px. State managed by `useResizableColumns(initialWidths, onWidthsChange)` hook so consumers can persist. Documented as a heavier optional feature — skip the hook if not needed.
- **D-17-11:** Pagination ships in Phase 17 as `Table.Pagination` component. Props: `page`, `pageCount`, `onPageChange`, `pageSize`, `total`. Renders prev/next buttons + page numbers (truncated with ellipses for >7 pages). Built on existing `Button` primitive. NOT auto-wired to the table data — consumer slices their data by `page * pageSize` and passes the page in.
- **D-17-12:** Sticky header is opt-in via `<Table.Root sticky>` prop — applies CSS `position: sticky; top: 0` to header row. No JS scroll-shadow.
- **D-17-13:** Heavy primitive — Table will likely be its OWN multi-plan effort within Phase 17 (e.g., 17-02-PLAN: Table chrome + sort + density; 17-03-PLAN: Table selection + resize + pagination). Planner determines plan split.

### RichText Editor (Area 3)
- **D-17-14:** Built on `@tiptap/react` + `@tiptap/starter-kit`. Add `@tiptap/extension-link` and `@tiptap/extension-placeholder` extensions. Feature gate: mentions / slash-commands / task-list / collaboration / code-block-with-syntax-highlighting are DEFERRED to v1.1.
- **D-17-15:** Toolbar buttons ship in DS-70: Bold, Italic, Underline, Strike, Inline Code, Heading (H2/H3 toggle in dropdown), Bulleted List, Ordered List, Blockquote, Horizontal Rule, Link (with URL popover). Toolbar uses existing `Button` primitive in icon-only `ghost` variant + `DSDropdown` for the heading menu. Toolbar slot is also overridable so consumers can supply their own.
- **D-17-16:** Keyboard shortcuts: TipTap defaults (Cmd/Ctrl+B/I/U, Cmd/Ctrl+K for link). Markdown shortcuts enabled (`**bold**`, `*italic*`, `` `code` ``, `## h2`, `- list`, `1. ordered`, `> quote`, `---` for hr).
- **D-17-17:** Output: HTML string by default (`value` prop is HTML; `onChange(html)` returns HTML). Optional `outputFormat="json"` prop swaps to TipTap JSON `Doc`. Document both in Storybook.
- **D-17-18:** Paste: TipTap default rich paste with the StarterKit sanitizer (no extra config). Plain-text-paste mode is NOT a v1.0 prop — defer.
- **D-17-19:** Component shape: `<RichText value={html} onChange={setHtml} placeholder="..." readOnly={false} />`. Internally manages an editor instance via `useEditor`. SSR-safe (pass `immediatelyRender: false` to TipTap).

### Calendar vs DatePicker Boundary (Area 4)
- **D-17-20:** Three view modes ship: `month` (default), `week`, `day`. View toggle in Calendar header (uses the new `SegmentedControl` primitive — DS-63 must land before this).
- **D-17-21:** Extract DatePicker's internal month-grid logic into `src/_internals/calendarGrid.ts` (utilities: `buildMonthGrid(year, month, weekStart)`, `getDayCell(date)`, etc). Both `DatePicker` (DS-53) and `Calendar` (DS-68) consume the same utility. **Refactor pass:** update DatePicker + DateRangePicker to use the extracted utility — assert no visual regression via existing baselines before merging.
- **D-17-22:** Event display: colored chips on day cells (max 2-3 visible per cell + "+N more" overflow), with the chip color sourced from a per-event `color` prop. Click a day → opens a Popover (uses existing `Popover` primitive) listing all events for that day. Sheet/BottomSheet alternative for mobile (auto-detect via existing breakpoint logic, or consumer prop).
- **D-17-23:** Event-data shape: `Calendar` accepts `events: CalendarEvent[]` where `CalendarEvent = { id: string; date: Date | string; endDate?: Date | string; label: string; color?: string; meta?: unknown }`. Multi-day events span by date range; single-day events have only `date`. `meta` is a passthrough for consumer rendering.
- **D-17-24:** AgendaList view is NOT a separate Calendar view mode in v1.0 — exposed as a slot via `<Calendar.Agenda />` consumer-rendered component that takes the same events array. Defer richer agenda chrome to v1.1.
- **D-17-25:** Selection: `selectedDate` + `onSelectedDateChange` props (controlled, like DatePicker). Today-cell highlighted in amber per existing DatePicker tokens. Match dark-mode tokens recently fixed in v0.5.6.

### Other Phase 17 Primitives (NOT discussed in detail — planner derives from handoff)
The remaining seven primitives have clear handoff source files and standard ARIA patterns. The planner can proceed without further discussion for:

- **DS-62 Tabs** (`design_handoff/design-system/ds-data.jsx` lines ~70+, `ds-navigation.jsx`): Underline tabs (default) + pill tabs variant. Optional count badge. Overflow menu via `DSDropdown` for narrow widths. ARIA: WAI-ARIA Tab Pattern (arrow keys, Home/End, automatic vs manual activation prop).
- **DS-63 SegmentedControl** (`ds-segmented.jsx`): Pill-shaped 2-5 option group on cream-2 background, amber-active state. Built on `radiogroup` ARIA. Used as the Calendar view-mode toggle.
- **DS-64 Accordion** (`ds-accordion.jsx`): Single + multi-expand variants. Chevron rotates on expand. Standard `<details>` semantics or ARIA disclosure pattern.
- **DS-65 Carousel** (`ds-carousel.jsx`): Image + content variants, arrow + dot nav, swipe on touch, autoplay opt-in. `prefers-reduced-motion` disables autoplay.
- **DS-66 Timeline** (`ds-timeline2.jsx`): Horizontal timeline with dots + dates + milestones. Read-only display (no interaction beyond keyboard scroll).
- **DS-67 InfiniteList** (`ds-infinitescroll.jsx`): Loading sentinel via IntersectionObserver + end-of-list state. Virtualization left to consumer (e.g., TanStack Virtual recipe in docs). `onLoadMore` + `hasMore` + `loading` props.
- **DS-69 Breadcrumbs** (`ds-navigation.jsx`): Truncation behavior for deep paths (max-visible prop, ellipsis collapse, optional dropdown of hidden items).

### Claude's Discretion
The following are NOT explicit user decisions — Claude/planner is empowered to choose:
- Whether to split the lucide refactor into its own PLAN file or fold into 17-01 (Icons setup) — planner's call based on diff size estimation.
- tsup multi-entry config layout (single `tsup.config.ts` array of entries vs multiple files) — planner's call.
- Whether `useResizableColumns` persists to `localStorage` automatically or just emits an `onWidthsChange` event — recommend the latter (consumer owns persistence).
- Whether RichText supports a `class` prop for styling the editor surface — yes, expose `className`.
- Storybook story count per primitive — match existing wave conventions (default + variants + dark-mode + edge-case stories).
- Visual baseline regen strategy — cumulative re-baseline at wave-completion commit, matching prior wave pattern.
- Which lucide-react version to pin — latest stable at planning time; verify React 19 compatibility.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase context (this repo)
- `.planning/PROJECT.md` — overview, aesthetic constraints, tech stack, conventions, resolved scope decisions for Phase 17/18 icons / illustrations / RichText / drag&drop
- `.planning/ROADMAP.md` § "Phase 17" — primitive list, success criteria, out-of-phase scope
- `.planning/STATE.md` — current position; recovery notes

### v1.0 specification (authoritative)
- `design_handoff/README.md` — 53-section spec; § "Visual Vocabulary" has aesthetic anti-drift rules; § "Theming Implementation Notes" has the surface-flip vs always-dark distinction
- `design_handoff/JobDash Design System.html` — interactive prototype with light + dark toggle; navigate to specific sections to see the intended visual

### Per-primitive handoff sources (Phase 17 primitives)
- `design_handoff/design-system/ds-iconset.jsx` — 119+ icon paths (REFERENCE only; we are using lucide instead per D-17-01)
- `design_handoff/design-system/ds-data.jsx` — Data Table reference (DS-61 simple), Tabs (DS-62 underline + pill variants)
- `design_handoff/design-system/ds-datagrid.jsx` — Data Grid reference (DS-61 with selection + resize + pagination)
- `design_handoff/design-system/ds-segmented.jsx` — SegmentedControl (DS-63)
- `design_handoff/design-system/ds-accordion.jsx` — Accordion (DS-64)
- `design_handoff/design-system/ds-carousel.jsx` — Carousel (DS-65)
- `design_handoff/design-system/ds-timeline2.jsx` — Timeline (DS-66)
- `design_handoff/design-system/ds-infinitescroll.jsx` — InfiniteList (DS-67)
- `design_handoff/design-system/ds-calendar.jsx` — Calendar (DS-68)
- `design_handoff/design-system/ds-navigation.jsx` — Tabs + Breadcrumbs (DS-62, DS-69)
- `design_handoff/design-system/ds-richtext.jsx` — RichText toolbar visual reference (DS-70 — actual editing engine is TipTap, not the handoff JSX)

### Visual baselines (this repo)
- `design_handoff/screenshots/light/` and `screenshots/dark/` — 59 PNGs each, matching section numbers; useful for visual regression target

### Internal infrastructure to reuse
- `src/_internals/DSDropdown.tsx` — D-500 dropdown infrastructure (anchor-rect positioning + ArrowUp/Down/Home/End/Enter/Escape keyboard model + type-ahead). Reuse for Tabs overflow menu, Table density toggle, RichText heading menu.
- `src/_internals/DSPortal.tsx` — D-* portal infrastructure for floating UI. Used by Modal/Sheet/BottomSheet/Tooltip/Popover/HoverCard/Lightbox/Toast — would be consumed by RichText link popover and Calendar event-day popover.
- `src/hooks/useFocusTrap.ts`, `src/hooks/useClickOutside.ts`, `src/hooks/useKeyboardShortcut.ts`, `src/hooks/useComposedRefs.ts` — public hooks reusable in Phase 17 primitives.

### External docs (planner research)
- TipTap React docs: https://tiptap.dev/docs/editor/getting-started — StarterKit, Link extension, Placeholder extension config + React 19 + SSR notes
- lucide-react: https://lucide.dev/guide/packages/lucide-react — current API, peer-dep requirements, React 19 compat
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/patterns/ — Table, Tabs, Accordion, Carousel patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **DSDropdown** (`src/_internals/DSDropdown.tsx`) — Tabs overflow menu, Table density picker, RichText H2/H3 dropdown, Calendar view-mode (if not using SegmentedControl). Already battle-tested in Select/MultiSelect/Autocomplete.
- **DSPortal** (`src/_internals/DSPortal.tsx`) — RichText link popover, Calendar day-events popover. Pattern: portal to `document.body`, anchor positioning via callback ref.
- **Existing Checkbox** (`src/Checkbox.tsx`) — used by `Table.SelectAllCell` and `Table.SelectCell` per D-17-09.
- **Existing Button** (`src/Button.tsx`) — `ghost` variant for RichText toolbar buttons; `Pagination` prev/next buttons.
- **Existing Popover** (`src/Popover.tsx`) — RichText link editor popover; Calendar day-events popover.
- **Existing Sheet / BottomSheet** — Calendar mobile day-events list (auto-pick by viewport).
- **Existing SegmentedControl** (DS-63, ships earlier in Phase 17) — Calendar view-mode toggle (DS-68 depends on DS-63).

### Established Patterns
- **CSS:** Plain CSS in `src/primitives.css` (currently 2398 lines). Each primitive owns a `.ds-atom-<name>` class block. Phase 17 adds ~10 new blocks. Consider whether to keep monolithic or split per-primitive into `src/styles/<name>.css` and concatenate at build — planner's call but lean toward keeping monolithic until file size becomes a real problem.
- **Tokens:** `src/tokens.css` defines `:root` and `:root.dark` variables. ALL color/spacing/radius/shadow values come from tokens — never hardcode hex codes (handoff README has rules for the rare always-dark exception).
- **Dark mode:** Toggled via `class="dark"` on `<html>` (NOT body). Verify dark variant for every new primitive — recent v0.5.6 hotfix shows hover specificity matters.
- **Stories + tests + visual baselines:** Each primitive ships `<Name>.tsx` + `<Name>.stories.tsx` + `<Name>.test.tsx`. Playwright visual baselines in `tests/visual/baselines/` per existing wave pattern.
- **Commit format:** `feat(17-NN): <message>` per-plan; `chore(release): v0.6.0 — <wave summary>` at wave completion.
- **DS-NN identifiers:** Always cite in commits, PRs, and changelog. Reused forever.

### Integration Points
- **Public barrel** (`src/index.ts`): every new primitive needs an `export { Foo, type FooProps } from "./Foo"` entry.
- **Public hooks barrel** (`src/hooks/index.ts`): new helper hooks like `useSortableTable`, `useTableSelection`, `useResizableColumns` go here.
- **Subpath barrel** (NEW — `src/icons/index.ts`): every wrapped lucide icon re-export.
- **tsup.config.ts**: add a second/third entry for `src/hooks/index.ts` (already there) and `src/icons/index.ts` (new). Verify type emit produces `dist/icons/index.d.ts`.
- **package.json `exports`**: add the new `./icons` subpath alongside existing `./hooks`. Keep ESM-only.
- **Existing 14 primitives importing from lucide-react directly:** AlertBanner, Autocomplete, Checkbox, Chip, CopyToClipboard, DatePicker, Lightbox, MultiSelect, NumberStepper, Select, SplitButton, StarRating, Toast — and any others that grep for `lucide-react` finds. Refactor sweep is part of D-17-04.

</code_context>

<specifics>
## Specific Ideas

- "Functional and clean, not jarring" — phrase from the user describing the drag-and-drop preference (Phase 18, but applies as ethos for all interaction in Phase 17 too: Carousel touch swipe, Accordion expand animation, Table sort flip, Calendar day-click popover).
- The user wants the canonical icon wrapper to enforce visual unity at import time, not at render time — i.e., the wrapper sets defaults so individual call sites cannot drift on stroke-width or size.
- All current 14 lucide imports should pass through the wrapper after refactor — no exceptions for "this one wanted size 14" — those callsites should pass `size={14}` to the wrapper, not bypass it.
- Calendar must work with the existing dark-mode token fixes from v0.5.5 / v0.5.6 (hover specificity for date cells); verify in Storybook dark mode after building.

</specifics>

<deferred>
## Deferred Ideas

### Deferred to v1.1+
- **Mentions / slash-commands in RichText** — TipTap Mention + Suggestion extensions, dropdown rendering, async data hooks. Significant feature surface; users explicitly punted from v1.0.
- **Plain-text-only paste mode in RichText** — niche; consumer can implement via `editorProps.transformPastedHTML` if needed before v1.1 ships official prop.
- **Code-block with syntax highlighting** — TipTap CodeBlockLowlight extension. Inline code is in v1.0; full code blocks deferred.
- **Task list in RichText** — TipTap TaskList + TaskItem extensions.
- **Collaboration / multi-cursor in RichText** — TipTap Collaboration + Yjs.
- **AgendaList chrome for Calendar** — exposed as a consumer-rendered slot in v1.0; richer built-in agenda view deferred.
- **Multi-day event rendering in Calendar** — events spanning a date range render as bars across cells. Single-day events ship in v1.0; multi-day spanning chrome deferred until consumer demand surfaces.
- **Custom Calendar view modes** — only `month`/`week`/`day` ship; year/agenda-only views deferred.
- **Table column reordering (drag headers)** — resize ships; reorder defers.
- **Table virtualization wrapper** — consumer-side via TanStack Virtual recipe in docs; built-in virtualization deferred.

### From Phase 17 ROADMAP scope dialogue
- **Grid (responsive card grid wrapper)** — explicitly skipped; consumer CSS Grid is sufficient.
- **Custom 119-icon set port** — superseded by D-17-01 (lucide standardization). The handoff `ds-iconset.jsx` paths remain in the repo as a reference asset; if branding ever requires divergence from lucide, this is the source.

### Reviewed Todos (not folded)
None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-Wave 6 — Icons + Data Display Primitives*
*Context gathered: 2026-04-29*
