# Manual QA — @akhil-saxena/design-system (full library)

> **Purpose:** Component-by-component manual walkthrough before v0.6.0 release tag. Catch what tests + visual baselines can't: real-browser feel, keyboard flow, screen-reader semantics, light/dark parity, reduced-motion behaviour.
> **Scope:** All 46 shipped primitives across Phases 13.5 → 17 (Wave 6).
> **How to run:** `npm run storybook` → open http://localhost:6006. Toggle theme via Storybook toolbar. Use real keyboard (no mouse) for keyboard rows.
> **Status legend:** ☐ not checked · ✅ pass · ⚠️ minor issue (note in row) · ❌ blocker (file as fix-v0.6.x)

---

## Cross-cutting checks (verify ONCE across the library, not per row)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| C1 | Theme toggle in Storybook flips every story cleanly — no flash, no leftover light/dark classes | ☐ | |
| C2 | Focus ring is amber, ≥2px, and visible on **every** interactive primitive in both themes | ☐ | |
| C3 | Reduced-motion (macOS: System Settings → Accessibility → Display → Reduce motion) — no animations on Carousel autoplay, Accordion expand, Calendar view-swap, Modal/Sheet open | ☐ | |
| C4 | Tab order is logical on any compound component (Modal, Calendar, Table, RichText, DateRangePicker) | ✅ | Modal focus trap fixed (callback-ref race in useFocusTrap) |
| C5 | No CLS (layout shift) when components mount — especially Skeleton, InfiniteList, Lightbox | ☐ | |
| C6 | Tokens (`tokens.css`) — no raw hex colors leaking past the cream/ink/amber palette in dev tools | ☐ | |

---

## Phase 13.5 — Atoms & Controls (v0.1.0)

| # | Component | What to verify | Status |
|---|-----------|---------------|--------|
| 1 | **Button** | All variants (primary/secondary/ghost/destructive) visually distinct · sizes (sm/md/lg) scale type+padding · hover, active, focus, disabled all render · loading state shows spinner without width jump · light + dark | ☐ |
| 2 | **TextInput** | Placeholder readable · focus ring on input border (not double-rung) · error state tone · disabled greyed but readable · prefix/suffix icons aligned to baseline · password reveal toggle if present | ☐ |
| 3 | **Textarea** | Resize handle behaviour matches design (vertical only?) · scroll inside textarea works · focus ring same as TextInput · maxLength counter (if any) updates live | ☐ |
| 4 | **Badge** | All tones (neutral/success/warning/danger/info) AAA-contrast in light AND dark · pill shape consistent · tiny size still legible | ☐ |
| 5 | **Chip** | Removable chip ✕ button has its own focus ring · click ✕ removes · click body fires onClick separately · disabled chip not removable | ☐ |
| 6 | **Avatar** | Image fallback: broken URL → initials show · `deriveInitials("Akhil Saxena")` → "AS" · gradient backgrounds derived from name are stable (same name = same gradient) · presence dot positioned correctly across all sizes | ☐ |
| 7 | **AvatarStack** | Stack overlap correct · `+N` overflow chip rendered when count exceeds max · hover/focus reveals tooltip with full name (if implemented) | ☐ |
| 8 | **Checkbox** | Checked / unchecked / **indeterminate** all render · clicking label toggles · keyboard: Space toggles · disabled blocks click AND keyboard | ☐ |
| 9 | **Radio** | Single radio: Space selects (does not toggle off) | ☐ |
| 10 | **RadioGroup** | Arrow keys move between radios · Tab enters group, Tab leaves group (does not stop on each radio) · only one selected at a time | ☐ |
| 11 | **Toggle** | Click and Space both flip · animation smooth in normal motion, instant in reduced-motion · disabled state visually obvious | ☐ |
| 12 | **NumberStepper** | + / − buttons increment/decrement · holding button does NOT auto-repeat (or does, per design — verify intent) · min/max clamp · keyboard: ArrowUp/Down on the input | ☐ |
| 13 | **RollingNumber** | Digits roll on value change in normal motion · snaps in reduced-motion · negative numbers and decimals render correctly | ☐ |
| 14 | **RangeSlider** | Drag thumb · click track to jump · keyboard: Arrow ±step, Home/End to min/max · two-thumb (range) version: thumbs cannot cross · value tooltip appears on hover/drag | ☐ |
| 15 | **StarRating** | Click sets rating · keyboard: Arrow Left/Right adjusts · half-star support if enabled · readonly mode is non-interactive but still announces value | ☐ |

---

## Phase 14 — Surfaces (Wave 3, v0.2.0)

| # | Component | What to verify | Status |
|---|-----------|---------------|--------|
| 16 | **Card** | All variants (default/elevated/outlined?) render · hover lift on interactive cards only · focus ring on whole card when interactive | ☐ |
| 17 | **StickyNote** | Rotation prop applied (≈±2°) · readable on cream and dark backgrounds · multi-line content doesn't break paper effect | ☐ |
| 18 | **Tooltip** | Appears on hover (after delay) AND keyboard focus · positioned correctly (top/bottom/left/right) · flips when near viewport edge · disappears on Esc · does not trap focus | ☐ |
| 19 | **Popover** | Click trigger opens · Esc closes · click outside closes · positioning + flip · arrow points to trigger · focus moves into popover content · returns focus to trigger on close | ☐ |
| 20 | **ContextMenu** | Right-click opens at cursor · keyboard menu key opens · arrow keys navigate items · Enter selects · Esc closes · positioned within viewport (no clipping at edges) | ☐ |
| 21 | **Modal** | Opens with focus trap · Tab cycles within modal · Esc closes · backdrop click closes (or doesn't, per role) · scroll lock on body · returns focus to opener on close | ☐ |
| 22 | **ConfirmDialog** | Two-button layout · destructive action visually distinct · Enter triggers default action · Esc cancels · async onConfirm shows loading | ☐ |
| 23 | **Sheet** | Slides in from left/right · backdrop click closes · Esc closes · focus trap inside · keyboard scroll inside sheet works | ☐ |
| 24 | **BottomSheet** | Slides up from bottom · drag/swipe-down closes (touch) · respects height variants · backdrop click closes · safe-area-inset on mobile (iPhone notch) | ☐ |
| 25 | **Lightbox** | Image opens fullscreen · Arrow keys navigate prev/next · Esc closes · pinch/zoom works on touch · captions render · backdrop is opaque enough | ☐ |
| 26 | **HoverCard** | Appears on hover after delay · stays open when moving cursor onto card · keyboard focus equivalent · positioning + flip · inner links/buttons clickable | ☐ |

---

## Phase 15 — Feedback (Wave 4, v0.4.0)

| # | Component | What to verify | Status |
|---|-----------|---------------|--------|
| 27 | **Toast** | `ToastProvider` mounted at app root · `useToast()` shows toast · all tones render (success/error/info/warning) · auto-dismiss timing · dismiss button works · stacks correctly when multiple fired · positioned in viewport corner | ☐ |
| 28 | **AlertBanner** | All tones AAA-contrast · dismissible variant has working ✕ · icon matches tone (AlertCircle / CheckCircle / etc) · multi-line content wraps cleanly | ☐ |
| 29 | **ProgressBar** | Determinate fills correctly 0→100% · indeterminate animates in normal motion, static bar in reduced-motion · accessible role="progressbar" with aria-valuenow | ☐ |
| 30 | **Skeleton** | Shape variants (line/circle/rect) render · shimmer animation in normal motion · solid in reduced-motion · width/height props honored | ☐ |
| 31 | **EmptyState** | Icon + heading + body + action button stack · CTA is real Button (focus ring etc) · centered correctly within container | ☐ |
| 32 | **InlineConfirm** | Trigger ("Delete") → swaps to two buttons ("Confirm" / "Cancel") in place · keyboard Esc cancels · focus moves to Confirm so Enter commits · rolls back to trigger after action | ☐ |

---

## Phase 16 — Compound Inputs (Wave 5, v0.5.0–0.5.6)

| # | Component | What to verify | Status |
|---|-----------|---------------|--------|
| 33 | **Select** | Click opens dropdown · keyboard: ArrowDown opens, Up/Down navigates, Enter selects, Esc closes · type-ahead jumps to matching option · search field (if enabled) filters · selected option highlighted · long lists scroll inside dropdown | ☐ |
| 34 | **MultiSelect** | Multiple selections render as chips · click chip ✕ removes · `Select all` / `Clear all` if present · keyboard navigation between options · search filter · max-height with scroll | ☐ |
| 35 | **Autocomplete** | Typing filters options live · ArrowDown opens · Enter selects highlighted · click outside closes without selecting · empty-state when no matches · loading state if async | ☐ |
| 36 | **DatePicker** | Calendar opens on click · arrow keys navigate days · Enter selects · today indicator · disabled dates not selectable · **dark-mode hover specificity (the v0.5.6 fix)** — hovered cell stays distinguishable from selected · time picker (if enabled) | ☐ |
| 37 | **DateRangePicker** | Single calendar (post-0.5.1 redesign) · click start, then end — range fills · isRangeStart/isRangeEnd visual markers · range edges polished (rounded outer, square inner) · dual-endpoint marker visible · time picker per endpoint | ☐ |
| 38 | **CopyToClipboard** | Click copies value to clipboard · success state ("Copied!") shown for ~2s · revert to default state · works with long values · failure (clipboard API blocked) shows error state | ☐ |
| 39 | **SplitButton** | Main button fires primary action · chevron opens menu of secondary actions · variants render distinctly · chevron width consistent across variants (post-0.5.4 fix) · keyboard: ArrowDown on main → opens menu | ☐ |

---

## Phase 17 — Icons + Data Display (Wave 6, v0.6.0 — pending release)

| # | Component | What to verify | Status |
|---|-----------|---------------|--------|
| 40 | **Icon (wrapper)** | Default size 20, stroke 1.5, currentColor · consumer can override size/strokeWidth via props · 31 pre-wrapped icons in `/icons` subpath all render · tree-shake works (single icon import → small bundle) | ☐ |
| 41 | **SegmentedControl** | All segments visible · click selects · keyboard: arrows move selection (radiogroup semantics) · amber-on-black active text contrast OK · sizes (sm/md) | ☐ |
| 42 | **Breadcrumbs** | Deep path collapses with `…` when over `maxVisible` · click crumb navigates · current page non-link · separator chevron in correct direction (LTR ›) · long crumb text truncates not wraps | ☐ |
| 43 | **Timeline** | Horizontal AND vertical orientations · connector lines render between events (CSS ::after) · clickable events have button focus ring · date format via Intl · empty timeline graceful | ☐ |
| 44 | **InfiniteList** | Loads more when sentinel near viewport · loading indicator at bottom while fetching · stops fetching when no more pages · `loading` prop guards StrictMode double-fetch · works with rootMargin pre-fetch | ☐ |
| 45 | **Accordion** | Click header expands/collapses · keyboard: Space/Enter on header · single-vs-multiple-open mode honored · chevron rotates in normal motion, instant in reduced-motion · panel content keyboard-reachable when open | ☐ |
| 46 | **Carousel** | Arrow buttons navigate · keyboard arrows on focused carousel · touch swipe (touch-only — mouse drag should NOT advance, per Key Decision 17-08) · autoplay pauses on hover/focus · autoplay does NOT run at all in reduced-motion (not just paused) · non-active slides aria-hidden | ☐ |
| 47 | **Tabs** | Underline AND pill variants · click tab switches panel · arrow keys move tabs (radiogroup) · Home/End jump to first/last · narrow container → overflow `…` menu shows hidden tabs · panel role=region with aria-labelledby | ☐ |
| 48 | **Table** | Sticky header on scroll · sortable columns · pagination component is **sibling** of Table.Root, not nested (HTML validity) · resize handle drag works · pagination range algorithm: ≤7 all, near-start, near-end, both-ellipses · empty state | ☐ |
| 49 | **Calendar** | Month / week / day views · view switcher · event chips on day cells · `+N more` overflow · **desktop click event-day → Popover** · **resize <640px → swaps to BottomSheet live** (useMatchMedia reactive) · resize back → Popover returns · multi-day events render as per-day chips (no spanning bars in v0.6) | ☐ |
| 50 | **RichText** | **Markdown shortcuts:** `**bold**`, `*italic*`, `` `code` ``, `## h2 + space`, `### h3 + space`, `- list + space`, `1. + space`, `> + space`, `--- + Enter` · **Keyboard:** Cmd/Ctrl + B/I/U/K · **Link popover** opens via Cmd+K · **Paste sanitization:** Google Docs / Word paste keeps bold/italic/links but strips inline `style=""` and `<font>` · `<script>alert(1)</script>` paste must NOT execute · controlled-sync guard works (typing fast doesn't lose chars) | ☐ |

---

## Refactored-to-Icon-wrapper visual smoke (Phase 17 side-effect)

13 primitives had inline lucide SVGs swapped for the new `<Icon>` wrapper. Eyeball each — icons should be 1.5px stroke, 20px default, currentColor. Catch any oversize/undersize/wrong-stroke regressions.

| # | Component | Status |
|---|-----------|--------|
| 51 | AlertBanner — tone icons | ☐ |
| 52 | Autocomplete — search/clear icons | ☐ |
| 53 | Checkbox — check / indeterminate glyphs | ☐ |
| 54 | Chip — remove ✕ | ☐ |
| 55 | CopyToClipboard — copy / check | ☐ |
| 56 | DatePicker — calendar / chevrons | ☐ |
| 57 | Lightbox — close / prev / next | ☐ |
| 58 | MultiSelect — chevron / chip ✕ | ☐ |
| 59 | NumberStepper — + / − | ☐ |
| 60 | Select — chevron · search icon · check on selected | ☐ |
| 61 | SplitButton — chevron | ☐ |
| 62 | StarRating — star (filled / empty / half) | ☐ |
| 63 | Toast — tone icons + close | ☐ |

---

## When done

1. Tick all rows above
2. Note any ⚠️/❌ in row "Notes" column
3. If clean → approve v0.6.0 release: `chore(release): v0.6.0 — 11 data display primitives + icons subpath + cumulative visual baselines`, then `git tag v0.6.0`
4. If issues → triage: file `fix(v0.6.x)` for blockers OR open Phase 18 backlog item for non-blocking polish
5. Update `STATE.md` "Pending Work" → "Phase 17 manual verification complete"
6. Commit this doc with status: `docs: complete library-wide manual QA pre-v0.6.0`
