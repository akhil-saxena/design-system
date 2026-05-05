# Requirements: JobDash Design System — Milestone 2

Milestone 2 covers phases 17–27. Every phase below has at least one requirement with UAT-grade acceptance criteria. Phases 24–27 are blocked pending spec ingest.

---

## REQ-17-01: Kbd Component
**Phase:** 17  
**Source:** ds-advanced.jsx (SPEC) + ds-confirmdialog.jsx (SPEC)  
**Description:** Implement a `Kbd` React component that wraps the `<kbd>` HTML element with the `ds-kbd` CSS class for keyboard shortcut display. Used in CommandPalette, ConfirmDialog, and inline documentation.

**Acceptance Criteria:**
- Renders a `<kbd>` element with `ds-kbd` class applied
- Accepts `children` as the shortcut string (e.g. "⌘K", "ESC", "DELETE")
- Inherits all font and visual styling from the `ds-kbd` CSS class defined in global styles
- Usable standalone or inline within a text flow without layout breakage
- Storybook story shows common shortcut strings in both light and dark mode
- axe-core scan passes with zero violations

---

## REQ-17-02: RelativeTime Component
**Phase:** 17  
**Source:** ds-dataviz.jsx (SPEC)  
**Description:** Implement a `RelativeTime` React component that formats a date as a human-readable relative string with a native browser tooltip showing the exact datetime.

**Acceptance Criteria:**
- Props: `date` (string | Date), `prefix` (string, optional)
- Format rules: < 60 min → "Nm ago"; < 24 h → "Nh ago"; < 30 d → "Nd ago"; >= 30 d → locale date string; future → "in Nm"
- `title` attribute on root `<span>` contains the exact locale datetime string for hover tooltip
- Optional `prefix` text renders in `--ink-4` color with a trailing space before the relative string
- Storybook story demonstrates all format branches in both modes
- axe-core scan passes with zero violations

---

## REQ-17-03: Pagination Component
**Phase:** 17  
**Source:** ds-advanced.jsx (SPEC)  
**Description:** Implement a `Pagination` component with two display variants: full (page numbers + prev/next) and compact (prev/current/next only).

**Acceptance Criteria:**
- Required props: `totalPages` (number), `currentPage` (number), `onPageChange` (callback)
- Full variant: prev `ds-icbtn` (disabled on page 1) + numbered `ds-page-btn` elements + ellipsis (non-interactive, appears as needed) + next `ds-icbtn` (disabled on last page) + "Page N of M" label in `--mono 10px --ink-4`
- Active page button carries the `active` CSS modifier class
- Compact variant: prev `ds-icbtn` + "N / M" text in `--mono 11px 600` + next `ds-icbtn`
- Keyboard: arrow keys navigate between page buttons; Enter selects focused page
- Both variants tested in light and dark mode in Storybook
- axe-core scan passes with zero violations

---

## REQ-18-01: ConfirmDialog Component
**Phase:** 18  
**Source:** ds-confirmdialog.jsx (SPEC)  
**Description:** Implement a `ConfirmDialog` React component composing the existing `Modal` with four tone variants (danger, warn, success, neutral) that govern icon, icon background tint, and confirm button style.

**Acceptance Criteria:**
- `tone` prop accepts: `"danger" | "warn" | "success" | "neutral"`
- Container: 360px fixed width, `rgba(255,255,255,.97)` background (always-light), `blur(14px)` backdrop-filter, `14px` border-radius, `0 16px 48px rgba(0,0,0,.18)` shadow
- Icon area: 40×40px, `border-radius: 10px`, tone-matched tinted background, tone-matched icon (22px)
- Tone-to-button mapping: danger → `var(--red)` confirm button; warn → amber confirm; success → amber-dark confirm; neutral → dark confirm
- Title: Archivo 700 15px; body: 12.5px `--ink-2`, `line-height: 1.5`
- Footer: Cancel (`ds-btn default`) + Confirm (tone-matched class)
- `onConfirm` and `onCancel` are required props
- Keyboard: Enter triggers confirm when button is enabled; Escape triggers cancel
- Storybook story shows all four tone variants in light and dark mode
- axe-core scan passes with zero violations

---

## REQ-18-02: TypeToConfirm Component
**Phase:** 18  
**Source:** ds-confirmdialog.jsx (SPEC)  
**Description:** Implement a `TypeToConfirm` React component that gates an irreversible action behind the user manually typing a confirmation word.

**Acceptance Criteria:**
- Default guard word is `"DELETE"` (all caps); accepts a prop to override for localization
- String comparison is case-sensitive and exact (no trim applied to user input)
- Text input matches `ds-input` styling
- Confirm button is disabled until typed value exactly equals guard word
- Confirm button background: `var(--red)` when enabled; `var(--ink-5)` at 60% opacity when disabled
- `onConfirm` and `onCancel` callbacks are required props
- Keyboard: Enter triggers confirm when button is enabled; Escape triggers cancel
- axe-core scan passes with zero violations

---

## REQ-19-01: Sparkline Component
**Phase:** 19  
**Source:** ds-dataviz.jsx (SPEC)  
**Description:** Implement `Sparkline` as a pure SVG polyline mini-chart with optional fill area and terminal dot.

**Acceptance Criteria:**
- Props: `data` (number[]), `width` (default 100), `height` (default 28), `color` (default `"var(--amber)"`), `fill` (boolean, default true)
- Y normalization formula: `y = height - ((v - min) / range) * (height - 4) - 2` (range clamped to 1 for flat data)
- Stroke: 1.5px, `strokeLinecap="round"`, `strokeLinejoin="round"`
- Fill area: path from `x=0/y=height` through polyline to `x=width/y=height`, fill = color at 10% opacity
- Terminal dot: filled circle `r=2.5`, color matches line
- No axes, labels, or tooltips
- Accepts any CSS color value or token reference as `color` prop
- Storybook story shows multiple data sets and the `fill=false` variant
- axe-core scan passes with zero violations

---

## REQ-19-02: MiniDonut Component
**Phase:** 19  
**Source:** ds-dataviz.jsx (SPEC)  
**Description:** Implement `MiniDonut` as an SVG ring chart with animated arc indicating a percentage value.

**Acceptance Criteria:**
- Props: `value` (number), `max` (default 100), `size` (default 48), `strokeWidth` (default 5), `color` (default `"var(--amber)"`)
- Track circle: `var(--cream-2)`, same `strokeWidth`
- Arc formula: `r = (size - strokeWidth) / 2`; `circumference = 2 * Math.PI * r`; `strokeDashoffset = circumference * (1 - Math.min(value/max, 1))`
- `strokeLinecap="round"` on progress arc
- SVG globally rotated `-90deg` so 0% starts at 12 o'clock
- Arc transition: `stroke-dashoffset 0.6s ease-out`
- Caller places value label absolutely centered; component does not render label
- Respects `prefers-reduced-motion` (disables transition when active)
- axe-core scan passes with zero violations

---

## REQ-19-03: MiniBar Component
**Phase:** 19  
**Source:** ds-dataviz.jsx (SPEC)  
**Description:** Implement `MiniBar` as a CSS flexbox bar chart with value labels and optional category labels.

**Acceptance Criteria:**
- Props: `data` (number[]), `labels` (string[], optional), `height` (default 100), `barColor` (default `"var(--amber)"`)
- Layout: `flexbox`, `align-items: flex-end`, `gap: 6px`
- Each bar: `maxWidth: 32px`, `border-radius: 4px 4px 0 0`, height = `(value/max) * 70%`, `minHeight: 4px`, `opacity: 0.8`, `height transition: 0.4s ease-out`
- Value label above bar: `--mono 9px --ink-3 700`
- Category label below bar (only when `labels` prop present): `--mono 8px --ink-4`
- Storybook story shows both labeled and unlabeled variants
- axe-core scan passes with zero violations

---

## REQ-20-01: StatCard Component
**Phase:** 20  
**Source:** ds-dataviz.jsx (SPEC)  
**Description:** Implement `StatCard` as a composition combining metric label, numeric value, trend badge, and optional Sparkline into a glass surface card.

**Acceptance Criteria:**
- Metric label: `--mono 9px --ink-3 700`, uppercase, `letter-spacing: 0.08em`
- Value display: Archivo 800 28px, `letter-spacing: -0.02em`
- Trend badge: `padding: 3px 7px`, `border-radius: 4px`, `--mono 10px 700`; positive value = green tint bg + green text; negative value = red tint bg + red text
- Sparkline occupies full card width below value row; color matches trend sentiment (green if positive, red if negative)
- Glass surface: `className="glass"`, `padding: 16px`, `border-radius: 12px`
- Storybook story shows positive trend, negative trend, and no-sparkline variants in both modes
- axe-core scan passes with zero violations

---

## REQ-21-01: ColorPicker Component
**Phase:** 21  
**Source:** ds-colorpicker.jsx (SPEC)  
**Description:** Implement `ColorPicker` as a full-featured gradient color picker with hue/opacity bars, hex input, preset swatches, tonal scale strips, and a separate inline `ColorInput` field variant.

**Acceptance Criteria:**
- Gradient area: 150px tall, crosshair cursor, color preview thumb at active pick position
- Hue bar: 12px tall, rainbow gradient, draggable thumb
- Opacity bar: 12px tall, checkerboard underlay + color-to-transparent overlay, draggable thumb
- Hex input: validates `/^#[0-9a-fA-F]{6}$/` before updating color state; updates `color` and `hex` state simultaneously on valid entry
- Alpha field: read-only display of opacity percentage
- Preset swatches: exactly 10 colors (`#f59e0b`, `#ef4444`, `#3b82f6`, `#8b5cf6`, `#22c55e`, `#ec4899`, `#06b6d4`, `#f97316`, `#14b8a6`, `#6366f1`); active swatch highlighted with 2.5px `var(--ink)` border
- Tonal strips: Amber (8 stops), Blue (8 stops), Neutral (8 stops); cells are 36px tall, `scaleY` on hover, clickable
- Inline `ColorInput` variant: 18×18px swatch (`border-radius: 4px`) + hex text input side-by-side within `ds-input-wrap`
- Full keyboard navigation across all sub-parts
- Both light and dark mode tested in Storybook
- axe-core scan passes with zero violations

---

## REQ-22-01: CommandPalette Component
**Phase:** 22  
**Source:** ds-advanced.jsx (SPEC)  
**Description:** Implement `CommandPalette` as a Cmd+K modal search interface with grouped results, live fuzzy filtering, and keyboard navigation.

**Acceptance Criteria:**
- Opens on `Cmd+K` (Mac) and `Ctrl+K` (Windows/Linux); listener attached to `window`; listener removed on unmount
- Overlay uses `ds-overlay` class; click-away closes palette; `paddingTop: 15vh` positions it near screen top
- Container uses `ds-cmd` class; contains input row + scrollable result body
- Input uses `ds-cmd-input` class; autofocuses on open; live-filters results as user types
- Group headers use `ds-cmd-group` class
- Result items use `ds-cmd-item` class: icon (14px) + label (flex 1) + optional shortcut displayed as `<Kbd>` / `ds-kbd`
- ESC key and ESC label button both close the palette and clear the query
- "No results" state: centered 13px `--ink-4` message
- Item click closes palette and clears query
- Storybook story shows populated state, empty query state, no-results state
- axe-core scan passes with zero violations

---

## REQ-23-01: DataGrid Component
**Phase:** 23  
**Source:** ds-datagrid.jsx (SPEC)  
**Description:** Implement `DataGrid` as a feature-complete sortable, column-resizable, row-selectable table with bulk-action toolbar and paginated footer. Depends on Badge, Checkbox, and Button from phases 1–16.

**Acceptance Criteria:**
- Column schema type: `{ key: string; label: string; width: number; sortable: boolean; align: "left" | "right" }`
- Sorting: single-column, click header toggles asc/desc; active sort shown with amber triangle indicator (▲/▼)
- Column resize: 6px drag handle at right edge of each column header; `min-width: 60px`; width updates live via `mousemove` on `document`
- Row checkbox column: 16×16px `ds-checkbox`; header checkbox triggers select-all
- Selected row background: 4% amber tint
- Bulk-action bar: visible when `selection.size > 0`; shows count, Export button, Archive (`ds-btn danger`), Clear button; background 5% amber tint
- Status cells: `ds-badge` with modifier per mapping (applied → "upcoming"; interviewing → "done"; offer → "passed"; rejected → "pending")
- Priority cells: 6px colored dot + capitalized label (high → `--red-vivid`; medium → `--amber-vivid`; low → `--green-vivid`)
- Salary column: `--mono 12px`, right-aligned
- Applied-date column: `--mono 11px`
- Footer: row count in `--mono 10px --ink-4` + page button group (`ds-page-btn` prev/pages/next)
- Table wrapped in horizontal scroll container; overall container uses glass surface
- Keyboard: arrow keys navigate cells; Space bar toggles row selection
- Storybook story demonstrates sorting, selection, bulk-action bar, and pagination
- axe-core scan passes with zero violations

---

## REQ-24-01: Navigation — TreeItem + CollapsibleSidebar [PENDING SPEC]
**Phase:** 24  
**Status:** BLOCKED — awaiting ingest of `ds-navigation.jsx`  
**Description:** Hierarchical tree nav item and full collapsible sidebar navigation component.

**Acceptance Criteria:** [PENDING SPEC — to be defined after ds-navigation.jsx ingest]

---

## REQ-25-01: NotificationCenter [PENDING SPEC]
**Phase:** 25  
**Status:** BLOCKED — awaiting ingest of `ds-notifications.jsx`  
**Description:** Notification panel and bell trigger component.

**Acceptance Criteria:** [PENDING SPEC — to be defined after ds-notifications.jsx ingest]

---

## REQ-26-01: FileUploadZone [PENDING SPEC]
**Phase:** 26  
**Status:** BLOCKED — awaiting ingest of `ds-patterns.jsx`  
**Description:** Drag-and-drop file upload area pattern.

**Acceptance Criteria:** [PENDING SPEC — to be defined after ds-patterns.jsx ingest]

---

## REQ-27-01: MediaCard + StatusPages [PENDING SPEC]
**Phase:** 27  
**Status:** BLOCKED — awaiting ingest of `ds-mediacards.jsx` and `ds-status.jsx`  
**Description:** Image/media card with hover overlay, and 404/500/maintenance/offline page templates.

**Acceptance Criteria:** [PENDING SPEC — to be defined after ds-mediacards.jsx + ds-status.jsx ingest]

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-17-01 (Kbd) | Phase 17 | Pending |
| REQ-17-02 (RelativeTime) | Phase 17 | Pending |
| REQ-17-03 (Pagination) | Phase 17 | Pending |
| REQ-18-01 (ConfirmDialog) | Phase 18 | Pending |
| REQ-18-02 (TypeToConfirm) | Phase 18 | Pending |
| REQ-19-01 (Sparkline) | Phase 19 | Pending |
| REQ-19-02 (MiniDonut) | Phase 19 | Pending |
| REQ-19-03 (MiniBar) | Phase 19 | Pending |
| REQ-20-01 (StatCard) | Phase 20 | Complete |
| REQ-21-01 (ColorPicker) | Phase 21 | Pending |
| REQ-22-01 (CommandPalette) | Phase 22 | Pending |
| REQ-23-01 (DataGrid) | Phase 23 | Pending |
| REQ-24-01 (Navigation) | Phase 24 | Blocked |
| REQ-25-01 (NotificationCenter) | Phase 25 | Blocked |
| REQ-26-01 (FileUploadZone) | Phase 26 | Blocked |
| REQ-27-01 (MediaCard + StatusPages) | Phase 27 | Blocked |
