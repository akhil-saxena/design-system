# Changelog

All notable changes to `@akhil-saxena/design-system` are documented here.

Format: `## X.Y.Z — Release summary` with subsections per change type.

---

## 2.0.0-beta.1 — The charcoal brand, and a font layer you now import yourself

**A prerelease, published under the `next` dist-tag.** Nothing about
`npm install @akhil-saxena/design-system` changes for anyone: npm caret ranges
never match a prerelease, so `^1.9.0` and `^1.11.0` keep resolving to `1.11.4`
and `latest` has not moved. To try this release, ask for it by name:

```
npm install @akhil-saxena/design-system@2.0.0-beta.1
```

It is a major because of the first item below. Read that one even if you skip
everything else — it is the only change that makes a working page look wrong,
and it does so everywhere at once rather than in one heading three weeks later.

### BREAKING — read before upgrading

**1. `tokens.css` no longer ships `@font-face`. You must import a face layer.**

`tokens.css` used to carry the `@font-face` rules for all four families —
**Inter, Archivo, JetBrains Mono and Newsreader**. Nothing was deleted: all four
are preserved, unchanged, in a new entry point. But the type tokens still *name*
those families, so a build importing only `tokens.css` now names four families
the browser has never heard of, and **every component on the page falls back to a
system font at once**.

The migration is one added line, beside wherever you already import `tokens.css`:

```js
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/fonts/default.css";  // ← add this
```

Adopting the charcoal brand instead? Import `fonts/charcoal.css`, which carries
Playfair Display, DM Sans and IBM Plex Mono.

The failure is deliberately total rather than gradual. Per-family subpaths were
considered and rejected: forgetting one of those degrades a single family while
the page still looks almost right, which is far harder to notice than a page
that is obviously in the wrong font on first load. Splitting the layer took the
token layer's transitive face payload from **73 rules / 128 files / 2,174,132 B
to zero**, so a project that wants its own typeface no longer downloads four
families in order to override them.

**2. `AppShell` no longer writes its sidebar width inline, and no longer hides
the sidebar below 767px.**

- `AppShell` used to put `style="--ds-sidebar-w:240px"` on its root
  unconditionally. It now does that only when you pass `sidebarWidth`. If you
  were reading that inline style, read the computed custom property instead. The
  reason for the change is that an inline declaration cannot be overridden by a
  media query, so the width was never actually themeable.
- The `@media (max-width: 767px)` rule that hid the sidebar is gone — it bisected
  a common tablet range, and a breakpoint cannot be made configurable in CSS at
  all, because a media query cannot read a custom property. Restore the old
  posture with two declarations, which hold with or without the new banner row:

```css
@media (max-width: 672px) {
  .ds-atom-appshell { --ds-sidebar-w: 0px; }
  .ds-atom-appshell-sidebar { display: none; }
}
```

Related, and not breaking, but worth knowing: `collapsed` is now an **input**,
not only an output. Passing it pins the sidebar, and the shell no longer
overwrites a `collapsed` that the sidebar child set on itself. Precedence is
`collapsed` → the sidebar child's own `collapsed` (uncontrolled only) →
`defaultCollapsed` → the persisted value → `false`. A shell counts as controlled
on `collapsed != null` alone; it does not also require `onCollapsedChange`,
because `collapsed={isNarrow}` driven by a media query has nothing to observe.

**3. `DataGrid`'s accessible name changed, and `status` / `priority` columns no
longer render badges by themselves.**

- The grid used to announce itself as **"Job applications"**. It now defaults to
  the generic **"Data grid"**; pass `ariaLabel` for a real one. If you select the
  grid by its accessible name in a test, update the selector. `ariaLabel` was
  deliberately *not* made required: that would break every call site's compile,
  including ones already passing a good name, and a required prop can still be
  filled with `"table"`.
- A column keyed exactly `status` or `priority` used to render a job-application
  `Badge` or a priority dot automatically, triggered by the column's *name*. That
  is gone. Opt in explicitly — and it now works under any key:

```js
{ key: "state",   header: "State",   render: dataGridPresets.statusBadge }
{ key: "urgency", header: "Urgency", render: dataGridPresets.priorityDot }
```

  `render` is `(value, row) => ReactNode`, and any column may now use it.

### Added — the charcoal brand

A second brand alongside the existing cream/ink/amber identity, which is
untouched. Opt in per document:

```js
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/themes/charcoal.css";
import "@akhil-saxena/design-system/fonts/charcoal.css";
```

```html
<html data-brand="charcoal">
```

Every rule in `themes/charcoal.css` is scoped to `:root[data-brand="charcoal"]`
and `:root[data-brand="charcoal"].dark`, so importing it costs nothing until the
attribute is set — which is what lets a brand switch happen without a reload. 49
properties per block, both modes. The seven `--amber*` tokens are bridged to
charcoal's ochre so a component referencing an amber token does not leave a
yellow hole in the page, and five surface tokens that previously had no brand
value are now declared.

- **`fonts/default.css` and `fonts/charcoal.css`** — face layers, carrying
  `@font-face` and no custom properties at all.
- **New export subpaths**: `./themes/*.css`, `./fonts/*.css`, `./css/*.css` and
  per-component `./components/*`. The `.css` sits inside the wildcard on purpose
  — `"./themes/*"` would make `*` capture `charcoal.css` and resolve to
  `dist/themes/charcoal.css.css`, failing a consumer's build on that exact
  specifier. `./css/*` is kept alongside `./css/*.css` so existing extensionless
  spellings keep resolving.

### Added — components

- **`FocalPointPicker`** — pick a focal point on an image by dragging a reticle,
  with an aspect-ratio preview. Previously this was ~269 lines every consumer
  wrote for itself.
- **`FilterNav`** — `SegmentedControl`'s anchor sibling. Computationally the same
  control, rendered as real `<a href>` links, so a category filter is crawlable
  and works with JavaScript disabled. Non-navigable hrefs are rejected rather
  than rendered as a link that goes nowhere.

### Added — props and tokens

- `Modal.closable` — set `false` for a genuinely non-dismissible modal. The close
  button, the Escape handler and the backdrop path are suppressed *together*, so
  a modal cannot end up half-closable. Escape is swallowed rather than leaked to
  the layer beneath.
- `DSPortal.inline`, threaded through `Modal`, `Sheet`, `ConfirmDialog` and
  `TypeToConfirm` — see *Fixed* for what it is for.
- `AppShell.banner` / `bannerLabel` — a labelled `<section>` row between the
  topbar and main, spanning both columns, so DOM order matches visual order and
  landmark navigation agrees with tab order. `bannerLabel` defaults to `"Status"`
  because an unnamed `<section>` is not exposed as a landmark by most screen
  readers.
- `AppShell.collapsed` / `defaultCollapsed` / `onCollapsedChange` — see break 2.
- `DataGrid.density` (`cozy` | `comfortable` | `spacious`), `.selectable`,
  `.pagination`, `.ariaLabel`, and `DataGridColumn.render`. `cozy` is the 32px
  row mode, and it is genuinely reachable only once `selectable` is off.
- `Sortable.announcements` — replace what a reorder says to a screen reader, so
  it can name the item and its new position rather than an opaque index.
- `RichText.allow` — restrict which marks exist, at the extension list rather
  than in the toolbar, so a suppressed mark is unreachable by keyboard shortcut,
  by the browser's own `contenteditable` commands, and by autolink.
  `RichText.onSerializeLoss` reports content the configured output shape cannot
  carry, instead of dropping it silently.
- `Field.required` and `FieldError.tone` — a required marker, and error severity,
  on the field contract rather than reimplemented per form.
- `Lightbox` gained `srcSet`, backdrop close, swipe navigation and announcements.
- `StatusPill` takes a tone and a label, so it expresses any status rather than
  one hardcoded job-application ladder.
- `--text-4xl-plus: 52px` — a display step between the 44px and 60px rungs, the
  one size in the handoff that had no token.

### Changed

- **Text fields, selects and textareas have a visible edge in every theme,
  including the default one.** Control boundaries now come from `--wire`
  (`rgba(0,0,0,0.18)` light, `rgba(255,255,255,0.22)` dark). Under charcoal these
  controls were effectively invisible before — a 1.000:1 fill delta against the
  page with a 1.38:1 hairline. **This visibly darkens the edge of every field in
  the default theme too**, and is the most noticeable non-charcoal change here.
- **Card, Chip and Text no longer outrank your own class.** Their styling moved
  into `:where()` at specificity (0,0,0), so `.my-card { padding: 0 }` wins.
  Previously `.ds-atom-text[data-variant="body"]` weighed (0,2,0) and beat any
  single consumer class.
- **`Badge` emits `ds-atom-badge` and carries no inline styling**, so it can be
  restyled and themed like every other primitive.
- `AppBar` and `Footer` link targets are 44px at coarse pointers. Fine-pointer
  geometry is byte-identical, so nothing moves on a desktop.
- `--ds-appbar-h` and `--ds-sidebar-w` are declared at class level rather than
  inline, so a media query can drive them.
- The component count is **79**, asserted in one place instead of stated as three
  disagreeing numbers.

### Fixed

- **`RichText`'s `toolbar={null}` was ignored** and rendered the default toolbar
  anyway.
- **`RichText`'s code-block syntax highlighter is now opt-in.** It sat on the
  eager path for every consumer, including one editing a single résumé bullet.
  The eager bundle drops from **139,280 B to 131,270 B gzip**, losing `lowlight`
  and `highlight.js` entirely.
- **Four overlays can now server-render, via the new `inline` prop.** `Modal`,
  `ConfirmDialog`, `TypeToConfirm` and `Sheet` each emitted **0 B** of server
  HTML, because they always portalled to `document.body`, which does not exist
  during SSR. With `inline` they emit 1,065 B, 1,902 B, 1,707 B and 1,075 B
  respectively. The default is unchanged at 0 B — portalling is still right for a
  modal over a live app; `inline` is for a dialog that must exist in the server
  payload.
- **`ConfirmDialog`'s panel was completely unstyled** — no surface, no radius, no
  shadow. It had never been painted by a stylesheet. Moving those declarations
  out of a `style` attribute and into the sheet also made the server-rendered
  dialog ~10% smaller.
- **`Tabs` omitted every inactive panel's children from server HTML**, so tab
  content was invisible to a crawler and absent before hydration. All panels now
  render (1,202 B → 1,255 B for a three-panel example); inactive ones are hidden
  presentationally.
- **`Chip` clobbered a caller's `className`** instead of merging it.
- **A keyboard drag in `Sortable` could only be released by a key.** Clicking or
  tabbing away left the drag live, so the list wedged on the first item and every
  later gesture moved that same item. Pointer-down and focus-out now release it.
  This survived 34 tests because every one of them picked up the *first* tile,
  where a wedged drag and a working one are indistinguishable.
- **A plain click on a `Sortable` tile ran a whole drag cycle**, announcing "was
  dropped over…" on every click. The pointer sensor now requires real movement
  before a drag begins.
- **`DatePicker`, `SplitButton` and `DateRangePicker` failed WCAG AA under
  charcoal in both modes**, all measuring exactly **4.402:1**. Each hardcoded
  `#1c1917` for its ink — which *is* the default brand's `--ink-inverse`, so
  charcoal could never override it. Now reading the token: **4.555:1**. Because the
  literal and the token agree in the default brand, this moved **27 charcoal nodes
  and zero default ones** — measured, not assumed.
- **Tinted `StatusPill` stages were unreadable in charcoal dark**, at **1.29:1**
  and **1.53:1**. The cause was `--amber-ink` collapsed to a single dark value
  across both modes and then used on a 10% tint. A census of all five consumers
  found none is a solid fill, so the token was wrong rather than misused, and
  fixing it repaired `Badge` and the open `DatePicker` trigger too. Now **6.31:1**
  and **5.34:1**.
- **A `RichText` `mark` was invisible in both brands** — **1.061:1** under
  charcoal and **1.006:1** in the *default* brand, which was the worse of the two
  and had never been reported, because axe declines to judge a ratio rounding to
  1.00. Now **15.55:1** and **15.03:1**.
- **Charcoal's active tab pill label was below AA**, and the dark pill track was
  translucent, so an inactive tab label's contrast depended on whatever happened
  to be behind the component.

### Per-component import subpaths — worth a look if you hydrate islands

This is the change nobody thinks to look for, and it is the one that decides how
you should import.

`./components/*` gives every component its own entry point:

```js
import { Chip } from "@akhil-saxena/design-system/components/Chip";
```

Measured through a real Astro + Rolldown build, a client island importing one
component went from the barrel's **570,555 B raw / 176,922 B gzip / 99 modules**
at 1.11.4 to **1,620 B raw / 785 B gzip / 2 modules** — 352× smaller raw, 225×
smaller gzip. At 1.11.4 that island shipped ProseMirror, Tiptap, lowlight,
highlight.js, dnd-kit and 43 Lucide icons in order to render a chip.

**The barrel is unchanged and still correct** for server-rendered pages and for
admin code that uses many components — and it improved substantially here too,
because splitting across 84 entry points turned it into re-exports a bundler can
resolve individually. Use the subpath when the import crosses into a hydrated
client island; use the barrel everywhere else.

Per-component stylesheets under `./css/*` now declare the sibling sheets their
component actually renders, derived from the import graph rather than written by
hand — `datagrid` needs `iconbutton` without importing it, so a hand-written list
shipped an unstyled pager.

### Testing

- **Visual baselines are recorded per brand.** Every story is captured under both
  the default brand and charcoal, in both modes — 1,019 baselines — so a charcoal
  token cannot pass a numeric contrast assertion while looking wrong. The suite
  is one test per brand, so a failure names the brand.
- Charcoal has bidirectional token-exhaustiveness gates with a parse floor, 54
  three-surface contrast ratios, and a font-family-to-face agreement check.
- `test:a11y` can sweep either brand: `DS_BRAND=charcoal npm run test:a11y`. The
  default remains the default brand.

### Known issues in this beta

These are why it is a beta. Every figure below was measured in a browser with the
brand asserted at the probed element, not read off a linter.

**Charcoal's own accessibility sweep is not clean, and the honest number is
larger than the gate reports.**

`DS_BRAND=charcoal npm run test:a11y` fails **11 stories**. Two root causes remain,
both deliberately unfixed because each needs a decision rather than an edit:

- **A pale amber flattens onto a mid-tone ochre** (4 stories). Warning-tone
  `AlertBanner` and `Toast` keep a pale `--amber-l` that charcoal maps onto
  `--ochre`, so ratios land between **1.92:1 and 4.46:1**. Every candidate repair
  either adds public token surface or moves default-brand baselines, so it is a
  theme decision, not a one-line fix.
- **`--ochre` used as text on a pinned near-black surface** (7 stories). Charcoal
  has no mode-independent "accent on near-black" token, which is what this needs.
  The clearest instance is `.ds-atom-table-sort-indicator`, which paints `--ochre`
  as **9px text** at **3.775–3.796:1** across 7 stories — and unlike the other
  instances, that is code a real consumer renders.

**The gate under-reports, and this is the part worth reading.** Four separate blind
spots mean a green `test:a11y` is weaker evidence than it looks:

1. `checkA11y` is scoped to `#storybook-root`, so anything portaled to
   `document.body` is invisible — `Toast`'s own log prints *"Found 1 a11y
   violations"* and then prints **PASS**.
2. Backgrounds painted by a `::before` return `incomplete` rather than
   `violation`, and the gate does not fail on `incomplete`.
3. axe refuses to judge a ratio that rounds to 1.00, returning `equalRatio`. That
   is how a **1.006:1** failure in the *default* brand stayed green.
4. Two shipped states are rendered by no story at all, so nothing can measure
   them.

Measured with those holes closed, **21 further stories (28 nodes)** sit below AA
that the gate never fails on, plus an undecidable tail of up to 18 more. So the
pre-release total was **46–64 stories, not 25**. Fixing the scoping is deliberately
not in this beta: it would turn a green gate red across a surface nobody has
triaged yet, and that is a choice to make in daylight rather than in a release.

**`npm run test:a11y` does not cover charcoal unless you ask it to.** The brand
global defaults to `default` and no story overrides it, so an unqualified green run
says nothing about charcoal. Use `DS_BRAND=charcoal`.

## 1.11.4 — Invisible tracks, and a visual suite that was hiding failures

### Fixed

- **Slider and progress tracks, and the skeleton placeholder, were invisible.**
  All three were painted with `--cream-2` — the *raised* surface token — which
  sits **1.06:1** against the page in both themes. A slider showed no groove, and
  a skeleton showed nothing at all. They now use a new `--track` token, which is
  translucent ink rather than an opaque surface so it holds the same contrast on
  the page, on a card, and on any panel between: 1.45:1 light, 1.76:1 dark.
  Dark mode previously had ad-hoc per-component overrides that disagreed with
  each other (progress `0.2`, skeleton `0.06`, slider none); those are gone.
- **A disabled slider was a muddy brown smear.** `opacity: 0.5` on the track,
  fill and thumb — the last of the opacity-dimming cases in the system.
  Multiplying with the track's own alpha dropped the groove below 1.3:1 and faded
  the amber fill into an indeterminate colour instead of reading as inactive.
  Replaced with an explicit `--fill-disabled`, which cannot be `--ink-5` in dark:
  that token is *darker* than the track composites to, so the fill would vanish
  into the groove.

### Fixed — test infrastructure

- **The visual suite was silently checking only part of itself.** It is a single
  test looping over every story with a hard assertion, so the first mismatch
  aborted the run and every story after it went unchecked. Five stories rendered
  from the real clock (`DatePicker`/`DateRangePicker` `disablePast`,
  `RelativeTime`), so a date rollover reliably triggered that abort. The clock is
  now frozen for the suite, and the assertion is `expect.soft`, so one mismatch
  can never hide another.
- `--track` and `--fill-disabled` have token-level contrast guards. The first
  version of that check passed regardless of the token's value, because the
  compositing helper parsed `#f4f4f4` by harvesting its hex digits as channel
  numbers; caught by reverting the token and watching the test still pass.

## 1.11.3 — Visual defects the test suite could not see

Every check was passing while two components rendered visibly wrong. The
screenshot baselines only prove nothing *changed*, and both defects were
recorded into the baseline when it was first taken, so they compared clean for
as long as they existed. Unit tests assert behaviour and axe assesses
accessibility; neither looks at paint. Two rendered-output audits now close that
gap, and they found three more defects than were reported.

### Fixed

- **CommandPalette rows rendered with the browser's default button chrome** — a
  2px outset black border, a grey fill and shrink-to-fit width instead of flush
  full-width rows. The rule was written when the row was a `<div>`; it later
  became a `<button>` so `role="option"` sat on a genuinely focusable element,
  and the UA styles were never reset.
- **`Link as="button"` had the same defect**, so the same link looked like two
  different controls depending on which element it rendered. This also affected
  Breadcrumbs, which composes Link.
- **FileInput's dropzone rendered in 13px Arial.** It is a `<button>`, and a
  button does not inherit `font` — the one component in the system that was off
  the type scale entirely. Same root cause as the two above.
- **ColorPicker's swatch floated ~7px above the fields beside it.** The HEX and
  ALPHA fields carry a label above the input, so each column is taller than its
  input; centring aligned the swatch to the column rather than to the inputs.
  The row now aligns to the end, and the swatch matches the field height.
- **Timeline's clickable event had no visible focus indicator.** The trigger uses
  `display: contents` so its children flow into the parent grid, which leaves the
  button with no box for an outline to paint on. The ring moves to the child.
- **Four targets below the WCAG 2.5.8 minimum** — carousel dot (8×8), chip
  dismiss (10×10), multiselect chip dismiss (14×12), rating star (18×18). Each
  now has a 24×24 hit area from a centred pseudo-element, so the painted size is
  unchanged: no visual baseline moved.

### Testing

- `control-chrome.spec.ts` fails any control rendering with UA form chrome,
  detected by both the outset border and the UA font. The border check alone
  missed FileInput.
- `polish-audit.spec.ts` sweeps every story for zero-size interactive elements,
  sub-24px targets and text the same colour as its background.

## 1.11.2 — Table's grid contract, broken Overview links, loading states

### Fixed

- **Eight broken links on the Overview page**, not the one that was reported.
  Each component tile derives its href as `${categoryId}-${name}--docs`, which is
  only correct while the story exists, sits under the matching title prefix, and
  carries the `autodocs` tag that generates a `--docs` entry. Nothing enforced
  any of that, and a wrong link fails silently until someone clicks it.
  ActionSheet, FileInput, InlineAddRow, InlineEditField, Sortable and SplitHero
  had stories but no `autodocs` tag; Card and StickyNote had been relocated to
  the Surfaces category in an earlier release without the Overview being
  updated, so both tiles 404'd. `overview-links.test.ts` now validates every
  link against the built Storybook index.
- **Table declared `role="grid"` and implemented none of the grid keyboard
  contract.** `multiSelectable` promotes the table to `grid` — it must, since
  `aria-multiselectable` is invalid on a plain `table` role — but arrow keys did
  nothing and every focusable cell was its own tab stop. `useGridNavigation`
  gives it one tab stop with arrow, Home/End and Ctrl+Home/End navigation, and
  treats header and body as one continuous grid so ArrowUp from the first row
  reaches the column header. It reads the DOM rather than a data model, because
  `Table` is compositional and has no row array to index — which also means
  colspans, conditional columns and filtered rows need no special handling.
  Gated on `multiSelectable`, so a plain table stays static content where arrow
  keys belong to the screen reader's reading cursor.
- **SegmentedControl and InfiniteList showed as "…Inner" in React DevTools.**
  `forwardRef` inherits its render function's name, which was the internal one.

### Added

- `loading` on Autocomplete and DataGrid, and `Table.StateRow` for the
  compositional table — completing the set started in 1.11.0. `Table` itself
  cannot take a `loading` prop, since the consumer owns the body, so the state
  row is a compound member that spans the row and announces politely.

## 1.11.1 — Completing the validation work 1.11.0 overclaimed

### Fixed

- **1.11.0 said validation was added to "every form control". It was not.** Six
  controls got it; seven did not — Autocomplete, ColorInput, NumberStepper,
  FileInput, DatePicker, SegmentedControl and StarRating still had no `error`
  prop when that release shipped. All seven now have it, and
  `field-contract.test.tsx` exercises all **fifteen** controls rather than the
  eight it covered before, so the claim is now enforced instead of asserted.
- **Autocomplete's `aria-invalid` never reached the DOM.** It was passed to the
  inner TextInput as an attribute, but TextInput builds its own `aria-invalid`
  *after* spreading `...rest`, so the value was silently overridden. It now
  passes `error`, which TextInput folds into that computation.

### Testing

- Panel refs on HoverCard, ActionSheet, CommandPalette, InlineConfirm and
  SearchAndFilters were shipped in 1.11.0 but never asserted — a broken compose
  in any of them would not have been caught. Now covered. Writing the test
  surfaced that HoverCard has no `open` prop at all (it opens on hover), so the
  original assertion would have been vacuous.
- The drag-responsiveness fixes live entirely in CSS, and jsdom applies no
  stylesheet — so the `data-dragging` test proved the hook fired, not that the
  transition was suppressed, and the visual suite captures static screenshots
  which cannot catch a timing property either. `drag-transition.test.ts` now
  asserts the rules themselves.

## 1.11.0 — Validation across every form control, calendar keyboard navigation, drag responsiveness

### Added — validation

- **`Field` and `useField`, and an `error` state on every form control.** Only
  TextInput and Textarea could show a validation message; the other twelve
  controls had no `error` prop at all, so a validated form had to hand-roll the
  affordance per control, differently each time. Select, MultiSelect, Checkbox,
  Toggle, RangeSlider and RadioGroup now take `error` / `errorMessage` / `hint`
  (and `label`, where they had none), and TextInput and Textarea were migrated
  onto the same primitive rather than keeping their hand-rolled copies.

  The message is wired to `aria-describedby`, carries `role="alert"` so it is
  announced when it appears rather than sitting silently in the DOM, and sets
  `aria-invalid` on the control — styling alone conveys nothing to a screen
  reader. An `aria-describedby` the consumer already passed is preserved rather
  than replaced. A control with no label, hint or message emits no wrapper, so
  nothing is inserted into existing layouts.

  A radio group gets a `<fieldset>`/`<legend>` instead of `<label for>`, since
  `for` may only point at a labelable element and a group has no single control
  to point at. `src/field-contract.test.tsx` checks all of this identically
  across every control, because the failure mode here is drift.
- **`loading` on Select and MultiSelect.** An async list that had not arrived
  rendered "No results" — telling the user their query matched nothing when in
  fact nothing had been fetched. The loading row is an `aria-live` region, since
  the listbox is never focused (activedescendant pattern) and nothing else would
  announce the change.

### Fixed — accessibility

- **Popover rendered `role="dialog"` with no way to name it.** A dialog without
  an accessible name is a *serious* `aria-dialog-name` violation, and Popover
  exposed no `ariaLabel`, so every consumer produced one — it surfaced on the
  three Coachmark stories. Popover now takes `ariaLabel`/`ariaLabelledBy` and
  Coachmark passes its title. Storybook's a11y addon now reports zero warnings,
  where it had reported this on every run.


### Added

- **Arrow-key navigation for calendar grids** (`useDateGrid`, exported from
  `@akhil-saxena/design-system/hooks`). Calendar and DatePicker render every day
  as a focusable `<button role="gridcell">`, which made each month grid *42 tab
  stops*: reaching the end of a month took forty keystrokes, and so did tabbing
  past the calendar to the next control. Both now follow the WAI-ARIA APG
  date-grid pattern — one tab stop, with `ArrowLeft/Right` moving a day,
  `ArrowUp/Down` a week, `Home`/`End` to the week's edges, and `PageUp`/`PageDown`
  a month (a year with `Shift`). Movement is computed on dates rather than DOM
  nodes, so crossing a month boundary pages the view instead of dead-ending.
- **`ref` on `FileInput` and `Autocomplete`.** Both wrap a real `<input>` that was
  previously unreachable, so neither could be registered with a form library or
  reset programmatically. `Autocomplete` takes `ref` as an ordinary prop rather
  than via `forwardRef`, which would erase its generic parameter.
- `data-testid="colorpicker-swatch"`, matching the existing `-hex` and `-alpha`
  hooks. The swatch is the only element painting the committed colour unblended,
  and it had no way to be queried.
- **`ref` on the overlay panels and the remaining composites** — Modal, Sheet,
  BottomSheet, Popover, HoverCard, Lightbox, ActionSheet, CommandPalette,
  ConfirmDialog, StarRating, ColorPicker, Wizard, InlineConfirm and
  SearchAndFilters. Each already kept an *internal* callback ref on that same
  node (the focus trap and the positioning code need the live element), so the
  consumer ref is composed with it rather than replacing it — a test asserts
  focus is still trapped, because a ref that displaced the internal one would
  leave every overlay working and only the consumer's ref silently null. A panel
  ref is `null` while its overlay is closed, since the panel is not mounted; that
  is documented on each prop.
- **`className`, `style`, `ref` and arbitrary `data-*` on the chart primitives.**
  MiniBar, MiniDonut and Sparkline accepted *none* of these, so a consumer could
  not attach a test hook, restyle them, measure them, or observe them for
  visibility — while RollingNumber and StatCard, the same category of component,
  always could. RollingNumber and StatCard had the subtler version of the same
  gap: they took `className` and `style` but dropped every other prop silently,
  so a `data-testid` on either simply vanished. All five now forward a ref and
  spread the rest onto their root. Pinned in `test-hooks.test.tsx`.

### Fixed

- **FileInput ignored the same file chosen twice.** A file input only fires
  `change` when its value differs, and the control never cleared itself — so
  removing an upload and re-adding the same file did nothing at all, as did
  retrying a file that had just been rejected by validation. The value is now
  reset after every pick.
- **ColorPicker diverged from a controlled parent that rejected a change.** The
  committed colour was copied into local state and re-synced only when `value`
  itself changed, so a parent that clamped or vetoed a change — handing back the
  value it already held — produced no sync, and the swatch went on displaying a
  colour the parent had refused. The colour is now derived from `value` when
  controlled, which makes the divergence unrepresentable.
- **The RangeSlider fill lagged behind the thumb during a drag.** The thumb is
  positioned with no transition, but the fill animated its width over 150ms — so
  for the whole drag the amber fill visibly trailed the white knob. The glide is
  still wanted when the value changes discretely (arrow keys, a programmatic set),
  so it is now suppressed only while the pointer is down, via `data-dragging` —
  the same mechanism BottomSheet already used for its swipe. `pointercancel` and
  `lostpointercapture` clear the flag, so a drag interrupted by a scroll gesture
  cannot strand it on.
- **ProgressBar eased its fill over half a second.** A progress value is normally
  updated continuously — an upload, a step count, a slider-driven demo — so 500ms
  of easing left the bar permanently that far behind the number next to it. Now
  200ms, which still smooths a jumpy series without reading as lag.
- **Wizard became permanently unfinishable when its step list shrank.** `current`
  was never bounded by `steps`, and wizard steps are commonly conditional — a
  branch drops out once an earlier answer rules it out. Once the array shrank past
  the active index, `current === steps.length - 1` was false forever: the primary
  button read "Next" permanently, `onComplete` was unreachable, and every further
  click pushed `current` further past the end. An empty `steps` array (reachable
  while steps load or filter) behaved the same way. The index is now clamped.
- **MiniBar rendered `height: NaN%` for an all-zero series.** The bar height was
  `value / Math.max(...data)`, so a series of all zeros — which is simply what "no
  sales yet this week" looks like — divided by zero, and an empty series made the
  max `-Infinity`. Negative data drew inverted bars. All three are now clamped.
- **MiniDonut announced "NaN percent" to screen readers when `max={0}`.** The
  NaN reached both `strokeDashoffset` (the arc vanished) and the default
  `aria-label`. A negative `value` drove the offset past the circumference and
  drew the arc backwards. Both clamped, matching ProgressBar's existing guard.
- **Portaled overlays rendered light inside a scoped dark container.** `DSPortal`
  moves content to `document.body`, escaping any ancestor `.dark`, so each overlay
  re-detects the theme — and all four had drifted apart: Sheet and BottomSheet
  checked `<html>` only and so missed a scoped `.dark` wrapper (the pattern
  Storybook docs pages use), Popover checked only the anchor's ancestors, and
  HoverCard alone checked both. Two of the four also read `document` without an
  SSR guard. Consolidated into one `isDarkContext()` helper.

### Fixed

- **ColorInput: typing a colour did not move the swatch.** The field validated
  against `/^#[0-9a-fA-F]{6}$/`, so the two most natural ways to enter a colour —
  pasting `ff0000` without the hash, and CSS shorthand `#f00` — were silently
  ignored: no swatch change, no `onChange`, no error, no explanation. Input is now
  normalised rather than rejected (`normalizeHex`), covering hash-less, 3-digit,
  4/8-digit-with-alpha, uppercase and padded input. ColorPicker's hex field had
  the same validator and the same bug.
- **ColorInput and ColorPicker rendered unstyled fields.** Both applied
  `className="ds-input"` / `"ds-input-wrap"` — classes that exist nowhere in the
  stylesheet; the real ones are `.ds-atom-input` / `.ds-atom-input-wrap`. The
  fields had no border, height, background or focus ring at all.
- A test now asserts that every `ds-*` class a component references actually
  exists, so a typo like that cannot ship silently again.

### Changed — composition

Complex components are now built from the design system's own primitives instead
of raw HTML. A hand-rolled control silently opts out of everything the primitive
guarantees, and the failure is invisible until someone looks closely.

- **`TextInput` now backs every text field in the library** — CommandPalette's
  search, Select's option filter, Autocomplete's combobox, DatePicker's time
  fields, RichText's link popover, InlineAddRow, ColorInput and ColorPicker.
- Prerequisite for that: **TextInput's base styles moved from inline objects into
  `primitives.css`**. Inline styles outrank every class rule, so while they lived
  on the component no composing component could restyle a field — which is why
  `.ds-atom-cmd-input` had been silently doing nothing.
- **`Link` replaces bare `<a href>`** in Breadcrumbs and Footer.
- **`Kbd` now backs TextInput's `kbd` affix**, which previously re-implemented
  Kbd's styling inline.

### Added

- **`IconButton`** — square icon-only action button, for close/dismiss/prev/next.
  Seventeen hand-rolled versions existed across ten components, each re-deriving
  the accessible name, focus ring and disabled state. `label` is a **required**
  prop rather than an optional `aria-label`: an icon-only control with no
  accessible name is the most common defect of its kind, and a required prop
  makes it unconstructable. Adopted across Lightbox, Toast, Snackbar,
  AlertBanner, Carousel, Pagination, Calendar, DatePicker and NumberStepper,
  each keeping its own class so the visual treatment is unchanged.
- `ColorInput` gains `hint` and forwards `data-testid` (including a
  `-swatch` hook, since the swatch is `aria-hidden` and has no queryable name).

### Tests

- `primitive-composition.test.ts` enforces the composition rules above, with a
  documented allowlist of the primitives that legitimately own a native control
  (TextInput, Textarea, Checkbox, Radio, Toggle, RangeSlider, NumberStepper and
  FileInput — a visually-hidden `<input type=file>` is the only way to open the
  OS file picker).
- `test-hooks.test.tsx` pins `data-*` passthrough as a contract — the kind of
  thing a refactor breaks silently, since the component still renders correctly
  and only the consumer's suite fails.

## 1.10.0 — Production-hardening pass

A systematic audit and remediation pass. No component was removed and no
published API was broken; the visible changes are the focus ring and a handful of
status colours, all driven by measured contrast failures.

### Fixed — visible

- **Focus indicator now meets WCAG 1.4.11.** `--focus` was the brand `--amber`
  (#f59e0b), which measures **2.09:1** on `--cream` against a required 3:1 — the
  system's focus ring was not a compliant indicator anywhere in light mode. It is
  now keyed to `--amber-d`: 4.57–5.02:1 across the light surface ramp, 9.9–11.4:1
  in dark. **Focus rings therefore render a deeper amber than before.** Override
  `--focus` to restyle every focus state in the library at once.
- **28 font declarations were being dropped by the browser.** A wave of components
  (SegmentedControl → RichText, including Tabs, Table, Calendar, Timeline) was
  authored against `--font-body` / `--font-display` / `--font-mono`, which the
  token layer never defined — it defines `--font` / `--display` / `--mono`. 28 of
  31 had no fallback, so the declarations were invalid at computed-value time and
  the text silently inherited the body font. Every "monospace" data cell in the
  system was rendering in Inter. `--font-*` is now the canonical vocabulary, with
  the short names kept as aliases.
- **Dark-mode muted text failed AA.** `--ink-4` was used as a text colour in ~28
  places and measured **1.96:1** in dark mode — invisible in review because light
  mode had `--ink-4` and `--ink-3` set to the identical value, so the bug existed
  in only one theme. `--ink-4` is now an explicit alias of `--ink-3`, and dark
  `--ink-3` was raised to #919191 (was 3.44:1).
- **Avatar palette.** Three of six default swatches failed AA for their white
  initials (amber 3.19:1, green 3.30:1, sky 4.10:1). Since the swatch is chosen by
  hashing the user's name, whether a given user's initials were legible was
  effectively random. Darkened to the nearest compliant shade of the same hue.
- **Three components used *surface* tokens as text colours**, so they inverted
  with the theme while their pair did not: OAuthButton `dark` (1.19:1 in dark
  mode), AppBar's logo chip (1.83:1 in dark), FormValidation's strength label
  (2.05:1, using a `--*-vivid` token the token layer documents as never-for-text).

### Fixed — behaviour

- **Overlays rendered behind each other.** z-index was unscaled (0, 10, 60, 100,
  1000, 1500, 9999): ActionSheet at 61 and Popover at 100 sat *below* Modal at
  1000, so either one opened from inside a dialog was invisible. Added a `--z-*`
  layering scale.
- **Modal, ConfirmDialog and BottomSheet never locked body scroll**, and
  ActionSheet's version cleared `overflow` outright — unlocking the page beneath a
  still-open Modal. Replaced five divergent copies with a reference-counted
  `useScrollLock`.
- **One Escape press closed every open overlay.** Fifteen components each
  installed their own document keydown listener. `useDismiss` keeps a layer stack
  so only the topmost responds.
- **ActionSheet declared `role="menu"` with no keyboard support** — no arrow keys,
  Home or End. The role promised an interaction model the component did not
  implement. Now follows the WAI-ARIA menu pattern, and skips disabled items.
- **DatePicker's ARIA grid was invalid**: `role="grid"` containing
  `role="gridcell"` with no `role="row"` between. DateRangePicker composes it, so
  both were affected.
- **Select and MultiSelect were unnameable.** Their triggers carry
  `role="combobox"`, which is `nameFrom: author`, and neither component had any
  naming prop. Added `ariaLabel` / `ariaLabelledBy`.
- **Avatar's accessible name never reached assistive tech** — `aria-label` sat on a
  bare `<div>`, whose `generic` role does not support naming, so screen readers
  read the initials instead ("Akhil Saxena" announced as "A S"). Presence is now
  part of the name rather than `aria-hidden`.
- **RichText's editable surface and NumberStepper's input were unnamed**, for the
  same reason — the label was on a role-less wrapper.
- **`prefers-reduced-motion` was almost entirely unimplemented**: 20 keyframes and
  ~74 transition rules with 2 guards. Worse, Button's inline `transition: all
  .15s` overrode both the stylesheet's transition *and* its reduced-motion block.
  Added a system-wide guard, with loading indicators deliberately exempt.
- **The package could not be used from a React Server Component.** `use client`
  did not survive the build at all (esbuild strips module directives; tsup's
  `treeshake` runs rollup, which strips them again), so all 46 stateful components
  were undeclared client components.
- Carousel's dot-nav button had no `type`, so changing slide submitted any
  enclosing form. Three Modal stories still used a ConfirmDialog API deleted in
  Phase 18. ColorPicker's "HEX"/"ALPHA" labels were never associated with their
  fields.

### Added

- `useScrollLock(active)` — reference-counted body scroll lock, safe to nest.
- `useDismiss(active, onDismiss, { modal })` — topmost-only Escape handling.
- `--z-*` layering scale, `--scrim` / `--scrim-strong`, `--focus-ring-soft`,
  `--error-ring`, `--wire`, `--ink-inverse`, `--green-ink` / `--red-ink`
  (on-tint text colours; `--amber-ink` already existed), light-mode
  `--rule-strong`.
- `.ds-visually-hidden` utility. Checkbox/Radio/Toggle previously each inlined the
  deprecated `clip: rect(0,0,0,0)` recipe.
- `Badge` gains the semantic status tones `info` / `success` / `warning` / `error`,
  matching AlertBanner and Toast. The README's own first example used
  `tone="amber"`, which was never a valid `BadgeTone`.
- `Snackbar` tones widened to `info` / `warning` for parity with Toast and
  AlertBanner.
- `ConfirmDialog` accepts `tone="warning"`; the original `"warn"` spelling still
  works and resolves identically.
- `Calendar` gains `nowOverride` so its clock-derived rendering is testable.

### Changed — API (deprecations, no removals)

Every rename below keeps the old spelling working, so no consumer breaks. The old
names are marked `@deprecated` and resolve to the new ones at runtime.

- **Heading / Text / Eyebrow tones are semantic.** They exposed three *different
  subsets of raw token names* — `HeadingTone` had `ink | ink-2 | ink-3 | amber`,
  `TextTone` added `ink-4 | red | green`, `EyebrowTone` had only three. That
  leaked the internal ramp into the public API (so the ramp could never be
  renamed), and `ink-4` was an alias of `ink-3`, meaning two spellings for one
  colour. All three now share one vocabulary:
  `primary | secondary | muted | accent | danger | success`. The raw names still
  work — see `src/foundation/tone.ts`.
- **`Card`'s two style axes are untangled.** `variant` and `tone` both accepted
  `amber` while rendering *differently* (gradient vs flat wash); `tone="cream-2"`
  leaked a token name; `tone="flat"` was a border style, not a tone. `tone` is
  replaced by `surface`: `amber → tint`, `cream-2 → subtle`, `flat → outline`.
  Renderings are unchanged.
- **`Card`'s `hover` is a boolean.** It was a single-member union (`"elevate"`)
  used as one. The string still works.
- **`ActionSheet` takes `ariaLabel`.** 26 components spell this prop `ariaLabel`
  and 3 spelled it `"aria-label"`; the majority now wins. The old spelling is
  still accepted.
- **Card and StickyNote moved from `overlays/` to a new `surfaces/` category.**
  Neither is an overlay. `exports` has no `./overlays/*` subpath, so this is
  internal only — imports from the package root are unaffected.

### Added — API

- **`TextInput` and `Textarea` take `label`, `hint` and `errorMessage`.**
  Neither had a label prop, so every consumer hand-wired `<label htmlFor>` + `id`
  — and the ones that forgot shipped an unnamed field. The system's own SplitHero
  showcase passed `label="Email"`, which React silently dropped onto the DOM,
  leaving both sign-in fields unnamed. `errorMessage` implies `error`, and both
  components now set `aria-invalid` (previously only `data-error`, which is
  styling-only and invisible to assistive tech).
- **`BottomSheet` takes `description`**, auto-wired to `aria-describedby`, for
  parity with Modal and Sheet. Its Storybook argTypes had documented this prop
  for some time; it did not exist.
- **`useDismiss(active, onDismiss, { modal })`** — Escape closes only the topmost
  layer. Fifteen components each installed their own document keydown listener, so
  a single Escape closed *every* open layer: press it in a ConfirmDialog raised
  from a Sheet and both vanished. Eleven overlays now share the primitive; the
  four remaining Escape handlers are field-level "cancel this edit" handlers on
  inputs, which correctly stay out of the layer stack.
- **Per-component stylesheets.** `@akhil-saxena/design-system/css/<component>`
  plus a 4.7KB `css/base`, so a Button-only consumer ships ~8KB instead of 165KB.
  Generated from `primitives.css` at build time — a test asserts the split
  round-trips byte-for-byte, so the granular and whole-sheet paths cannot diverge.
  `primitives.css` is unchanged and remains the default.

### Fixed — more contrast

- **`Button` now resolves type, radius and weight through the token scales.** It
  was the least token-compliant component in the system despite being the
  flagship: `fontSize` 10/11/12/13 and `borderRadius` 5/7/9, none on `--text-*` or
  `--radius-*`, so it could not be re-themed by overriding a token. The nearest
  scale steps move each value by at most 0.5px (type) and 1px (radius). `padding`
  and `gap` deliberately stay in px — 7/14 and 6 are off the 4px grid and snapping
  them would change button height visibly.
- **Calendar's out-of-month days failed AA at 2.08:1.** The dimming came from
  `opacity: 0.5`, which silently destroyed the contrast of an otherwise-compliant
  colour: `--ink-3` (5.6:1) composited at 50% renders as `#b4b1ae`. These cells
  are interactive buttons, so WCAG's inactive-component exemption does not apply.
- **Calendar event chips using `--purple-vivid` failed at 4.13:1** — andwhite
  text on it only reaches 4.23:1, so neither direction passes. Chips must use the
  text-tuned siblings; `CalendarEvent.color` now documents that.
- **`Snackbar` tones widened** to `info | warning` for parity with Toast and
  AlertBanner.

### Removed

- `src/_tokens.ts` — 40 lines of dead code with zero imports, encoding a sixth
  contradictory focus ring and glass values with no dark-mode handling.

### Tooling

- `npm run typecheck` now covers the 179 test and story files that `tsconfig.json`
  excluded. This surfaced **104 type errors across 36 files**, all fixed.
- axe-core runs over every story (`npm run test:a11y`). Violations went from
  **105 to 27 (-74%)**, with every structural ARIA bug resolved.
- Coverage thresholds enforced as a ratchet; `npm run test:coverage`.
- Visual-regression suite made deterministic. It had never been stable — no
  animation freezing, 11 live network image fetches, and clock-derived rendering
  meant each re-record produced a different flaky story.
- Token-layer guardrail tests: no dark-only tokens, no undefined `var()`
  references, all focus states routed through tokens, no bare z-index, and
  computed WCAG ratios for the ink ramp and focus ring.
- Re-enabled the Biome rules that were switched off (`useExhaustiveDependencies`,
  `useButtonType`, `noLabelWithoutControl`, `noExplicitAny`).

---

## 1.0.0 — Wave 7: Layout Shell, Patterns, Interaction + Illustrations

### New primitives (DS-71 through DS-81)

#### Layout Shell

- **AppShell** (`DS-71`) — CSS Grid layout shell; sidebar collapsible to 48px icon rail; localStorage persistence (opt-out via `storageKey={null}`); props-based slots: `sidebar`, `topbar`, `main`, `footer`. Controlled + uncontrolled collapsed state via `collapsed` / `defaultCollapsed`.
- **AppBar** (`DS-72`) — Standalone topbar primitive; 4 variants (`minimal` / `withSearch` / `default` / `centered`); scrolled blur/shadow effect via IntersectionObserver sentinel; slots for logo, center content, and actions.
- **Footer** (`DS-73`) — `compact` (1-line copyright) and `expanded` (4-column link grid) variants; accepts typed `FooterColumn[]` for expanded layout.

#### Patterns

- **Wizard** (`DS-74`) — Multi-step form scaffold; `horizontal` + `vertical` stepper layout; ProgressBar integration for completion percentage; per-step `validate()` async gate; `useFocusTrap` boundary wraps the active step; `WizardStep` compound member.
- **FormValidation** (`DS-75`) — Three composable helpers: `PasswordStrength` (4-segment animated score bar, zxcvbn-compatible strength 0-4 prop), `FieldError` (accessible `role="alert"` inline error), `FormErrorSummary` (linked error list, scrolls to first error on mount).
- **Coachmark** (`DS-76`) — First-run contextual hint anchored to a target element via Popover; dismissible via close button or click-outside; `storageKey` prop persists dismiss in localStorage; optional step counter dots for multi-step tours.

#### Interaction

- **InlineEdit** (`DS-77`) — Click-to-edit `text` or `textarea`; optimistic save with `onSave` async callback; error recovery (restores original value on rejection); Escape-to-cancel; `aria-label` for the trigger.
- **SearchAndFilters** (`DS-78`) — Search input with debounce + DSDropdown suggestion list; Chip filter tokens with clear-per-chip and clear-all; controlled `filters` + `onFiltersChange`; `suggestions` prop for autocomplete options; fully keyboard navigable.
- **Presence** (`DS-79`) — Avatar extended with `presencePosition` prop: `top-right` (default) / `bottom-right` / `top-left` / `bottom-left`. Exported `AvatarPresencePosition` type. Additive — no existing Avatar API changes.

#### Drag and Drop

- **Sortable** (`DS-80`) — `@dnd-kit/core` + `@dnd-kit/sortable`; list reorder + cross-list (Kanban) drag; keyboard Space-to-lift / Arrow-to-move / Space-to-drop (WAI-ARIA sortable); 1px `var(--amber)` drop indicator between items; `prefers-reduced-motion` respected (instant reposition, no spring easing); exports: `Sortable`, `SortableItem`, `SortableDndContext`.

#### Illustrations subpath

- **Illustrations** (`DS-81`) — `/illustrations` subpath export (`@akhil-saxena/design-system/illustrations`); 24 named SVG React components (tree-shakeable); uses CSS custom property tokens for theme-aware colour; `width` + `height` props default `120×120`. Components: `MailSent`, `Documents`, `Rocket`, `Celebrate`, `Lightbulb`, `Idea`, `IllustrationSearch`, `Plant`, `Cloud`, `EmptyBox`, `ConnectionLost`, `IllustrationError`, `Inbox`, `GraphUp`, `Chart`, `CalendarEvent`, `Team`, `Thinking`, `Lock`, `Puzzle`, `Workflow`, `Travel`, `IllustrationSuccess`, `PhoneScreen`.

### Infrastructure

- Added `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, `@dnd-kit/utilities@^3.2.2` as production dependencies.
- Added `@akhil-saxena/design-system/illustrations` subpath export in `package.json` and tsup config.
- tsup now builds 4 entries: `index`, `hooks`, `icons`, `illustrations`.

### Migration from 0.x

No breaking changes. All v0.x exports are preserved at their original import paths. The `/illustrations` subpath is new — no existing import paths changed.

```typescript
// New in v1.0.0 — layout shell
import { AppShell, AppBar, Footer } from '@akhil-saxena/design-system';

// New in v1.0.0 — patterns
import { Wizard, Coachmark } from '@akhil-saxena/design-system';
import { PasswordStrength, FieldError, FormErrorSummary } from '@akhil-saxena/design-system';

// New in v1.0.0 — interaction
import { InlineEdit, SearchAndFilters } from '@akhil-saxena/design-system';
import { Avatar } from '@akhil-saxena/design-system'; // Presence position extended, non-breaking

// New in v1.0.0 — drag and drop
import { Sortable, SortableItem, SortableDndContext } from '@akhil-saxena/design-system';

// New in v1.0.0 — illustrations subpath
import { EmptyBox, MailSent, Rocket, IllustrationSearch } from '@akhil-saxena/design-system/illustrations';
```

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
