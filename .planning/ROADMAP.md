---
project: "@akhil-saxena/design-system"
milestone: v1.0.0
status: in-progress
last_updated: 2026-04-29
---

# Roadmap — @akhil-saxena/design-system v1.0.0

> **Reconstructed 2026-04-29.** Original ROADMAP.md was lost (never committed). Phases 13.5–16 are recovered from git history and shipped code; Phases 17–18 are forward-planned from `design_handoff/README.md` § "Sections (53)" and the audit of `src/`.

## Goal

Ship v1.0.0 of `@akhil-saxena/design-system` — covering all 53 sections of the JobDash Design System v1.0 handoff spec as either (a) shipping React primitive, (b) documented foundation token in `tokens.css` / `utilities.css`, or (c) explicit-out-of-scope.

## Phase Summary

| Phase | Title | Wave | Version | Primitives | Status |
|---|---|---|---|---|---|
| 13.5 | Import from JobDash | (import) | 0.1.0 | 13 (atoms + controls) + 4 hooks + tokens | ✅ Complete |
| 14 | Surface Primitives | Wave 3 | 0.2.0 | 9 (DS-30..38) | ✅ Complete |
| 15 | Feedback Primitives | Wave 4 | 0.4.0 | 6 (DS-40..45) | ✅ Complete |
| 16 | Compound Input Primitives | Wave 5 | 0.5.0 | 7 + DSDropdown internal (DS-50..56) | ✅ Complete |
| 16.x | Post-release polish | — | 0.5.1 → 0.5.6 | (fixes) | ✅ Complete |
| 17 | Icons + Data Display Primitives | Wave 6 | 0.6.0 (target) | 11 (DS-60..70) | 🟡 Planned |
| 18 | Layout, Patterns, Interaction + Illustrations | Wave 7 | 1.0.0 (target) | 12 (DS-71..82) | 🟡 Planned |

**Currently shipped:** 35 public primitives, 4 hooks (with 2 more added internally), 2 internals (DSPortal, DSDropdown), 3 CSS layers.
**Target at v1.0.0:** 35 + 11 (Phase 17) + 12 (Phase 18) = **58 primitives** + 3 subpath exports (`/hooks`, `/icons`, `/illustrations`). Slightly over the original 53-section count because some sections (Inputs, Surfaces) decompose into multiple primitives, and Sortable + the two subpath exports were added based on resolved scope decisions.

---

## Completed Phases

### Phase 13.5: Import from JobDash → v0.1.0

**Goal:** Lift 13 primitives + 4 hooks + token system out of JobDash into a publishable package.

**Shipped:**
- Atoms (8): Button, TextInput, Textarea, Badge, Chip, Avatar (+ AvatarStack), Checkbox, Radio (+ RadioGroup), Toggle
- Controls (5): NumberStepper, RollingNumber, RangeSlider, StarRating
- Hooks: useFocusTrap, useClickOutside, useReducedMotion, useTokens (later: useComposedRefs, useKeyboardShortcut)
- Tokens, primitives, utilities CSS layers
- Tests + 97 visual baselines

**Anchor commit:** `2b5ddc4 feat(13.5-04): import 13 primitives + 4 hooks + tokens + 97 baselines from jobdash; v0.1.0`

### Phase 14: Wave 3 — Surface Primitives → v0.2.0

**Goal:** Cover the "Surfaces" group (6) plus closely-related anchored-overlay primitives.

**Shipped (DS-30..38):**
- DS-30 Card, DS-31 StickyNote, DS-32 Tooltip, DS-33 Popover (+ ContextMenu), DS-34 Modal (+ ConfirmDialog), DS-35 Sheet, DS-36 BottomSheet, DS-37 Lightbox, DS-38 HoverCard
- DSPortal internal helper introduced (Tooltip first consumer)

**Anchor:** `cc4aec4 feat(14-10): Wave 3 v0.2.0 — 9 surface primitives + cumulative visual baselines`

### Phase 15: Wave 4 — Feedback Primitives → v0.4.0

**Goal:** Cover the "Feedback" + "Patterns/Empty States" groups for non-blocking UI feedback.

**Shipped (DS-40..45):**
- DS-40 Toast (+ ToastProvider + useToast), DS-41 AlertBanner, DS-42 ProgressBar, DS-43 Skeleton, DS-44 EmptyState, DS-45 InlineConfirm

**Anchor:** `d9283b7 feat(15-07): Wave 4 v0.4.0 — 6 feedback primitives + cumulative visual baselines`

### Phase 16: Wave 5 — Compound Input Primitives → v0.5.0

**Goal:** Cover the "Inputs" group's combobox-class primitives (anything that wraps an input + dropdown).

**Shipped (DS-50..56):**
- DS-50 Select, DS-51 MultiSelect, DS-52 Autocomplete, DS-53 DatePicker, DS-54 DateRangePicker, DS-55 CopyToClipboard, DS-56 SplitButton
- DSDropdown internal helper introduced (shared chrome for Select/MultiSelect/Autocomplete)
- dateUtils internal

**Anchor:** `a8d5695 feat(16-09): Wave 5 v0.5.0 — 7 compound input primitives + DSDropdown internal`

**Post-release patches (v0.5.1–v0.5.6):**
- DateRangePicker single-calendar redesign + dual-endpoint marker + range-edge polish
- SplitButton variants + width fix + chevron padding
- DatePicker dark-mode color tokens, isCellSelected/isRangeStart/isRangeEnd override props
- Time picker AM/PM toggle always shown
- Select inner-search width overflow
- BottomSheet swipe-to-close gesture
- Dark-mode hover specificity for date cells

---

## Planned Phases

### Phase 17: Wave 6 — Icons + Data Display Primitives → v0.6.0 (target)

**Goal:** Ship the canonical icon kit (so subsequent primitives stop using ad-hoc inline SVGs) and cover the "Data Display" group of the handoff spec — primitives for collections, sequences, and complex tabular content.

**Depends on:** Phase 16 (DSDropdown chrome reused for Tabs overflow menu, Table density toggle, RichText toolbar). Icons land first within the phase so all later DS-61..70 primitives can import the canonical components.

**Primitives (DS-60..70):**

| ID | Primitive | Handoff source | Notes |
|---|---|---|---|
| **DS-60** | **Icons (subpath)** | `ds-iconset.jsx` (119+ icons) | New `@akhil-saxena/design-system/icons` subpath export. Each icon a tiny named export (24×24, 1.5px stroke, `currentColor`). Tree-shakeable. tsup multi-entry config. Refactor existing primitives to use these instead of inline SVG. |
| DS-61 | Table | `ds-data.jsx`, `ds-datagrid.jsx` | Sortable headers, sticky header, row actions, density modes (cozy/comfortable/spacious) |
| DS-62 | Tabs | `ds-data.jsx`, `ds-navigation.jsx` | Top tabs + side tabs; overflow menu for narrow widths (uses DSDropdown) |
| DS-63 | SegmentedControl | `ds-segmented.jsx` | Distinct from Tabs — pill-shaped, 2-5 options |
| DS-64 | Accordion | `ds-accordion.jsx` | Single + multi-expand variants; chevron uses Icons subpath |
| DS-65 | Carousel | `ds-carousel.jsx` | Image + content variants, arrow + dot nav, swipe on touch, autoplay opt-in |
| DS-66 | Timeline | `ds-timeline2.jsx` | Horizontal timeline with dots/dates/milestones |
| DS-67 | InfiniteList | `ds-infinitescroll.jsx` | Loading sentinel + end-of-list state; virtualization left to consumer (e.g. TanStack Virtual) |
| DS-68 | Calendar | `ds-calendar.jsx` | Month view (full-page, distinct from DatePicker dropdown), week view, year picker |
| DS-69 | Breadcrumbs | `ds-navigation.jsx` | Truncation behavior for deep paths |
| **DS-70** | **RichText (TipTap)** | `ds-richtext.jsx` | Headless TipTap StarterKit + Link + Placeholder. Toolbar built from Button + DSDropdown chrome. Output: HTML or JSON. |

**Out of phase scope (kept as discussion items but excluded from this phase):**
- Grid (responsive card grid wrapper) — skipped; `display: grid` in consumer code is sufficient and a primitive adds no value.

**Success Criteria:**
1. Each primitive has stories, tests, and visual baselines (light + dark)
2. AAA contrast verified for all text/bg pairs (focus rings, hover states, active states)
3. Keyboard navigation matches WAI-ARIA pattern for the role (Tabs = arrow keys, Accordion = enter/space, Carousel = arrow + home/end)
4. Reduced-motion respected for any animated transitions (Carousel autoplay, Accordion expand, Timeline scroll)
5. Dark mode visually tuned — surfaces flip cleanly, no cream-on-cream regressions
6. `@akhil-saxena/design-system/icons` subpath publishes alongside main entry; verified to tree-shake (consumer importing `{ ChevronDown }` only pulls that one icon)
7. RichText: keyboard shortcuts (Cmd/Ctrl+B/I/U), markdown shortcuts (`**bold**`, `## h2`), focus ring on toolbar, dark-mode tuned editor surface
8. All previously-shipped primitives that contained inline SVG icons are refactored to import from `/icons` (no orphan inline SVGs in `src/*.tsx`)

**Plans:** 3/15 plans executed

Plans:
- [x] 17-00-PLAN.md — Wave 0 infrastructure (tsup multi-entry + exports stanza + visual runner + tree-shake harness + Checkbox indeterminate + useReducedMotion + lucide bump + TipTap install)
- [x] 17-01-PLAN.md — DS-60 Icon wrapper + /icons subpath barrel + 14-primitive lucide refactor sweep
- [x] 17-02-PLAN.md — calendarGrid utility extract + DatePicker refactor (visual-byte-identical)
- [ ] 17-03-PLAN.md — DS-63 SegmentedControl (radiogroup, Calendar dependency)
- [ ] 17-04-PLAN.md — DS-69 Breadcrumbs (truncation via DSDropdown)
- [ ] 17-05-PLAN.md — DS-66 Timeline (read-only ordered list)
- [ ] 17-06-PLAN.md — DS-67 InfiniteList (IntersectionObserver sentinel)
- [ ] 17-07-PLAN.md — DS-64 Accordion (disclosure pattern, single + multi modes)
- [ ] 17-08-PLAN.md — DS-65 Carousel (touch swipe + autoplay + reduced-motion gate)
- [ ] 17-09-PLAN.md — DS-62 Tabs (underline + pill variants + ResizeObserver overflow menu)
- [ ] 17-10-PLAN.md — DS-61 Table chrome + sort + density + sticky header (part 1)
- [ ] 17-11-PLAN.md — DS-61 Table selection + resize + pagination (part 2)
- [ ] 17-12-PLAN.md — DS-68 Calendar (month/week/day views + event chips + Calendar.Agenda)
- [ ] 17-13-PLAN.md — DS-70 RichText (TipTap with controlled-sync three-layer guard)
- [ ] 17-14-PLAN.md — Wave 6 release: v0.6.0 version bump + cumulative visual baselines + CHANGELOG

---

### Phase 18: Wave 7 — Layout, Patterns, Interaction + Illustrations → v1.0.0 (target)

**Goal:** Ship the remaining v1.0 sections — app-shell layout, multi-step pattern primitives, inline-interaction helpers, the drag-and-drop primitive, the illustrations subpath — and cut v1.0.0.

**Depends on:** Phase 17 (Tabs reused inside AppBar; Wizard reuses ProgressBar; Icons subpath used throughout)

**Primitives (DS-71..82):**

| ID | Primitive | Handoff source | Notes |
|---|---|---|---|
| DS-71 | AppShell | `ds-shell.jsx`, `ds-app.jsx` | Sidebar + topbar + content layout; breakpoint behavior; collapsible sidebar; persists collapsed state |
| DS-72 | AppBar | `ds-appbar.jsx` | 4 variants — minimal / with search / with user menu / contextual |
| DS-73 | Footer | `ds-footer.jsx` | Compact (1 line) + expanded (4-col) |
| DS-74 | Wizard | `ds-wizard.jsx` | Multi-step form scaffold with progress (uses ProgressBar) + back/next; per-step validation hook |
| DS-75 | FormValidation helpers | `ds-formvalidation.jsx` | PasswordStrength meter + FieldError + FormErrorSummary helpers (composable into TextInput / Textarea / Select) |
| DS-76 | Coachmark | `ds-coachmarks.jsx` | First-run hint anchored to a target; dismissible; persisted via localStorage key |
| DS-77 | InlineEdit | `ds-editable.jsx` | Click-to-edit text + textarea variants with optimistic save + error recovery + escape-to-cancel |
| DS-78 | SearchAndFilters | `ds-search.jsx` | Search bar + autocomplete dropdown + filter chips (Chip primitive) + clear-all |
| DS-79 | Presence (Avatar extension) | `ds-data.jsx` (Avatars & Presence) | Extend Avatar with presence-dot positions (top/bottom × left/right); AvatarStack overflow tuning |
| **DS-80** | **Sortable (Drag & Drop)** | `ds-screens.jsx` (kanban reorder) | New primitive on `@dnd-kit/core`. Keyboard (arrow keys + space to lift) + touch + pointer parity. Amber focus ring during drag. Drop indicator with 1px rule border. Respects `prefers-reduced-motion` (skips transform spring). Variants: `Sortable` (list reorder) + `DropZone` (anywhere-to-anywhere). |
| **DS-81** | **Illustrations (subpath)** | `ds-illustrations.jsx` (24 spot SVGs) | New `@akhil-saxena/design-system/illustrations` subpath export. Each illustration a named export. Cream + ink + amber palette only. Used by EmptyState consumers (and standalone). |
| DS-82 | (reserved) | — | Reserved slot for any v1.0 finishing primitive surfaced during Phase 18 planning. |

**Success Criteria:**
1. All v1.0 sections from `design_handoff/README.md` are accounted for (shipped, deferred, or explicit out-of-scope)
2. v1.0.0 published to GitHub Packages with full CHANGELOG.md
3. README.md updated: full primitive count, three-subpath import map (`/icons`, `/illustrations`, `/hooks`), migration notes from 0.x
4. Storybook deployed (or visually browsable) — every primitive viewable in light + dark
5. No `// TODO` markers in primitive source files
6. `dist/index.d.ts` (and the three subpath `.d.ts` files) export every public type cleanly — no `any` leakage
7. Sortable primitive: keyboard reordering verified with screen-reader announcement; drag-and-drop works on iOS Safari touch
8. Illustrations subpath: tree-shaking verified (consumer importing one illustration doesn't pull all 24)
9. Visual regression: cumulative Playwright baselines pass for the entire library in both modes

**Out-of-scope for v1.0 (deferred to v1.1+ or kept app-level):**
- Sample Screens, Mobile Views, Email Templates, Status Pages — JobDash-specific demo material, not library primitives
- Custom theming beyond cream/ink/amber — opinionated by design; v1.x stays single-theme

---

## Numbering & Wave Pattern

- **Phase 13.5 → Wave 1+2 (atoms + controls):** lifted from JobDash imports
- **Phase 14 → Wave 3 (surfaces, DS-30s)**
- **Phase 15 → Wave 4 (feedback, DS-40s)**
- **Phase 16 → Wave 5 (compound inputs, DS-50s)**
- **Phase 17 → Wave 6 (data display, DS-60s)** [planned]
- **Phase 18 → Wave 7 (layout + patterns + interaction, DS-70s)** [planned]

Wave-completion commit always bundles a version bump and cumulative visual-baseline regen.

## Coverage Audit (53 sections → status)

Maintained for traceability against `design_handoff/README.md` § "Sections (53)".

**Foundation (9):** ✅ Tokens shipped in `tokens.css`. Icons → DS-60 in Phase 17. Illustrations → DS-81 in Phase 18. Typography specimens / Motion tokens / Responsive grid documented in tokens.

**Layout (3):** 🟡 Phase 18 — AppShell (DS-71), AppBar (DS-72), Footer (DS-73)

**Inputs (5):** ✅ All shipped — Button, TextInput/Textarea/Select/MultiSelect/Autocomplete, Checkbox/Toggle/Radio, DatePicker/DateRangePicker, Chip/Badge/RangeSlider

**Surfaces (6):** ✅ All shipped — Card, Modal+ConfirmDialog, Tooltip+Popover+ContextMenu, BottomSheet, Lightbox, Sheet

**Data Display (11):** 🟡 Phase 17 — Table (DS-61), Tabs (DS-62), SegmentedControl (DS-63), Accordion (DS-64), Carousel (DS-65), Timeline (DS-66), InfiniteList (DS-67), Calendar (DS-68), RichText (DS-70). Grid → skipped (consumer CSS).

**Feedback (2):** ✅ Toast + ProgressBar shipped. Avatar shipped; Presence-dot extension → DS-79 in Phase 18.

**Navigation (3):** 🟡 Tabs (DS-62) + Breadcrumbs (DS-69) in Phase 17. SearchAndFilters (DS-78) in Phase 18.

**Patterns (4):** ✅ EmptyState shipped. 🟡 FormValidation (DS-75), Coachmark (DS-76), Wizard (DS-74) → Phase 18.

**Interaction (4):** ✅ CopyToClipboard, HoverCard shipped. 🟡 InlineEdit (DS-77) → Phase 18. Sortable / Drag-and-Drop (DS-80) → Phase 18 on `@dnd-kit/core`.

**Start Here (7):** Out-of-scope for library (Sample Screens, Mobile Views, Email Templates, Status Pages, Token Export tool, Accessibility doc page, Cover) — JobDash-app-level concerns.
