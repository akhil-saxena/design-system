# @akhil-saxena/design-system

Accessible React primitives with semantic tokens. Full dark mode, neutral paper + ink + amber editorial design language.

**79 components across 10 categories.** (The badge above tracks the published version.)

[![npm](https://img.shields.io/npm/v/@akhil-saxena/design-system)](https://www.npmjs.com/package/@akhil-saxena/design-system)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://design-system-ed1.pages.dev)

**📖 Live Storybook:** [design-system-ed1.pages.dev](https://design-system-ed1.pages.dev) — browse every component, with controls and dark mode.

## Install

```bash
npm install @akhil-saxena/design-system
```

Peer deps: `react@^19`, `react-dom@^19`.

## Quick Start

Import the CSS layers in your app entry point (order matters):

```ts
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/primitives.css";
import "@akhil-saxena/design-system/utilities.css";
```

Then use components:

```tsx
import { Button, Badge, Card } from "@akhil-saxena/design-system";

export function App() {
  return (
    <Card>
      <Badge tone="success">Active</Badge>
      <Button variant="primary">Apply</Button>
    </Card>
  );
}
```

Toggle dark mode by adding `class="dark"` on `<html>`:

```ts
document.documentElement.classList.toggle("dark");
```

## Subpath imports

```ts
import { Button, Modal, Table, AppShell } from "@akhil-saxena/design-system";

import { useFocusTrap, useReducedMotion } from "@akhil-saxena/design-system/hooks";

import { ChevronDown, Search } from "@akhil-saxena/design-system/icons";
```

Stylesheets are reached the same way. Themes and font layers are imported for their
side effects:

```ts
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/themes/charcoal.css";
import "@akhil-saxena/design-system/fonts/charcoal.css"; // or /fonts/default.css
```

### Per-component imports, and when you need them

Every component also has its own JS entry point:

```ts
import { Chip } from "@akhil-saxena/design-system/components/Chip";
import { Lightbox } from "@akhil-saxena/design-system/components/Lightbox";
```

**The barrel remains the default.** It is the right import for server-rendered pages,
for admin screens, and for anything that is not hydrated — it is more ergonomic and it
ships the same code.

**For a hydrated island, import by `components/<Name>`.** That is the form this package
guarantees, and the form its CI gate defends (`tests/treeshake/subpath.test.ts` fails the
build if a component subpath ever regains ProseMirror, TipTap, lowlight, highlight.js or
dnd-kit). The barrel is deliberately **not** covered by that gate.

The reason the distinction exists: `src/index.ts` re-exports every component, and some of
those components pull in the editor stack (`@tiptap/*`, `lowlight`, `highlight.js`) and
the drag-and-drop stack (`@dnd-kit/*`). When the whole library was emitted as a single
`dist/index.js`, those imports sat at the top level of that one module and a consumer's
bundler could not shake them out — one `import { Chip }` on a hydrated island measured
**570,555 B raw / 176,922 B gzip / 99 modules**, carrying ProseMirror x10, TipTap x23,
lowlight x4, highlight.js x4 and dnd-kit x3. Three configuration fixes were tried
(`sideEffects: false`, removing the `"use client"` directive, marking the module-scope
`createLowlight()` `/* @__PURE__ */`) and every one produced byte-identical output. Astro
7 ships Vite 8, which is Rolldown-based, and Rollup-era tree-shaking advice does not
transfer.

Emitting one entry per component fixed that, and it improved the barrel as a side effect:
splitting the build across ~84 entries turned `dist/index.js` from a 328 KB monolith into
a ~6.7 KB file of re-export lines over per-component chunks, which Rolldown *can* shake.
Measured through a real Astro 7 build, the same `import { Chip }` island now emits
**1,620 B raw / 785 B gzip / 2 modules** with none of those families present, and the
subpath import emits the same thing. So the barrel is no longer a trap — but that outcome
depends on chunking decisions a future build change could quietly reverse, and only the
subpath form is gated. On a hydrated island, use the subpath.

### Why the `exports` patterns carry `.css` inside the wildcard

`package.json` spells these entries `"./themes/*.css"` and `"./fonts/*.css"`, **not**
`"./themes/*"`. This is deliberate and it is load-bearing — do not tidy it.

Node substitutes whatever the `*` captured into the target. With `"./themes/*.css"`,
importing `@akhil-saxena/design-system/themes/charcoal.css` captures `charcoal` and
resolves to `dist/themes/charcoal.css`. Respell the entry `"./themes/*"` and the `*`
captures `charcoal.css` instead, the target becomes `dist/themes/charcoal.css.css`,
and a consumer's build fails on that exact specifier with
`[vite]: Rolldown failed to resolve import`.

`./css/*` predates this and keeps the other convention, so per-component sheets are
written **extensionless** (`css/base`). Because the first spelling a developer reaches
for is `css/base.css`, an additional `"./css/*.css"` entry exists so both forms
resolve. Note that `import.meta.resolve()` will not catch a mistake here: it
substitutes the wildcard and reports a path without checking the file exists, so the
only real verification is a build.

Note the asymmetry with `./components/*`, which is spelled with the extension **outside**
the wildcard (`"./components/*": { "import": "./dist/components/*.js" }`). Both are
correct for their own consumer syntax: a JS consumer writes `components/Chip` with no
extension, so the `*` must capture `Chip`, whereas a CSS consumer writes
`themes/charcoal.css` with one. They look inconsistent and are not — do not "fix" either
to match the other.

## Components

### Inputs (24)

Button, IconButton, OAuthButton, TextInput, Textarea, Badge, Chip, Kbd, Checkbox, Radio, Toggle, NumberStepper, RangeSlider, StarRating, StatusPill, Autocomplete, ColorPicker, DatePicker, DateRangePicker, FileInput, InlineAddRow, InlineEditField, MultiSelect, Select

### Overlays (10)

ActionSheet, Popover, Modal, ConfirmDialog, CommandPalette, BottomSheet, Tooltip, Sheet, HoverCard, Lightbox

### Surfaces (2)

Card, StickyNote

### Data Display (11)

Table, DataGrid, Tabs, Accordion, Carousel, Timeline, InfiniteList, Calendar, Breadcrumbs, Pagination, SegmentedControl

### Feedback (7)

AlertBanner, Toast, Snackbar, Skeleton, ProgressBar, InlineConfirm, EmptyState

### Interaction (7)

CopyToClipboard, RelativeTime, InlineEdit, RichText, SearchAndFilters, Sortable, SplitButton

### Layout (4)

AppShell, AppBar, Footer, SplitHero

### Display (6)

Avatar, RollingNumber, StatCard, Sparkline, MiniDonut, MiniBar

### Patterns (3)

Wizard, FormValidation, Coachmark

### Foundation (6)

Heading, Text, Eyebrow, Link, Divider, DotGrid

## Hooks

From `@akhil-saxena/design-system/hooks`:

- `useFocusTrap(node, active)` - trap focus within an overlay
- `useScrollLock(active)` - reference-counted body scroll lock, safe to nest
- `useDismiss(active, onDismiss, opts)` - Escape closes only the topmost layer
- `useClickOutside(ref, onOutside)` - fire callback on click outside ref
- `useReducedMotion()` - reflects `prefers-reduced-motion`
- `useMatchMedia(query)` - generic matchMedia hook
- `useKeyboardShortcut(combo, handler)` - document-level shortcut binding
- `useLongPress(handler, options)` - touch long-press handlers
- `useComposedRefs(...refs)` - merge multiple refs onto one node
- `useSortableTable(data, options)` - sort state (column + direction)
- `useTableSelection(data, options)` - single + multi-select with indeterminate
- `useResizableColumns(initialWidths)` - pointer events column resize

## Tokens

CSS custom properties in `tokens.css`:

- **Color** - neutral surface/ink ramps + amber accent + AA-tuned blue/purple/green/red status colors
- **Typography** - `--font-body` (Inter), `--font-display` (Archivo), `--font-serif` (Newsreader), `--font-mono` (JetBrains Mono). The original `--font` / `--display` / `--serif` / `--mono` spellings remain as aliases.
- **Spacing** - 4px base, 16-step scale (`--space-1`..`--space-16`, 4..64px)
- **Radius** - sm / md / lg / xl / pill
- **Shadow** - 1 / 2 / 3
- **Motion** - `--ease-out`, `--ease-in-out`, `--ease-spring` + `--dur-1..4`
- **Focus** - `--focus` + `--focus-ring` (solid indicator) and `--focus-ring-soft` (field glow). Every focus state in the system resolves through these, so overriding `--focus` restyles the whole library at once.
- **Layering** - `--z-raised` < `--z-dropdown` < `--z-overlay` < `--z-popover` < `--z-toast` < `--z-tooltip` < `--z-max`. Anything that can open on top of a dialog sits above `--z-overlay`.
- **Scrim** - `--scrim` behind modal surfaces, `--scrim-strong` for full-screen media

### Per-component CSS

`primitives.css` is the whole sheet (~165KB) and remains the simplest default. To
ship only what you render, import `base` plus one file per component:

```ts
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/css/base";     // 4.7KB, always required
import "@akhil-saxena/design-system/css/button";
import "@akhil-saxena/design-system/css/modal";
```

Button-only goes from 165KB to ~8KB. The per-component files are generated from
`primitives.css` at build time and a test asserts the split round-trips
byte-for-byte, so the two paths can never disagree.

**A composed component needs more than one sheet.** The split is by component,
so `DataGrid`'s sheet holds only `DataGrid`'s own rules — not the `Pagination`
it renders, nor the `IconButton` that renders. Importing `css/datagrid` alone
gave a grid with an unstyled 21px pager.

Each generated sheet therefore names its siblings in its own header, so the
answer travels with the file rather than with this document:

```css
/* @akhil-saxena/design-system — datagrid.css
   …
   DataGrid renders other components, and the split is BY component, so their rules
   are not in this file. Import these alongside it or the composed parts render
   unstyled — a DataGrid imported on its own had a 21px unstyled pager:
     import "@akhil-saxena/design-system/css/button";
     import "@akhil-saxena/design-system/css/checkbox";
     …
     import "@akhil-saxena/design-system/css/pagination";
     import "@akhil-saxena/design-system/css/table"; */
```

The list is derived from the component import graph, transitively, and is not
maintained by hand — run `node scripts/split-css.mjs --deps-json` to print the
whole map. **Read the header, not this snippet:** it is regenerated on every
build, and a hand-copied list here would be the thing that goes stale.

### Accessibility notes

- The ink ramp is contrast-budgeted: `--ink` / `--ink-2` / `--ink-3` all clear WCAG AA (4.5:1) for body text on every surface in both themes. `--ink-4` is an alias of `--ink-3`; `--ink-5` is decorative only and must not be used for text.
- `--focus` is keyed to `--amber-d` rather than the brand `--amber`, which measures only 2.09:1 on `--cream` and would fail WCAG 1.4.11.
- All non-essential motion is disabled under `prefers-reduced-motion: reduce`. Loading indicators (button spinner, progress, skeleton) are deliberately exempt so in-progress states stay perceivable.
- `.ds-visually-hidden` is available for screen-reader-only text.
- `IconButton` takes a **required** `label`, so an icon-only control cannot be built without an accessible name.

### Composition

Complex components are built from the primitives, not raw HTML — a hand-rolled
`<input>` silently opts out of the focus ring, error state, `aria-invalid`, label
wiring and dark mode. Tests in `src/primitive-composition.test.ts` enforce this:
no raw `<input>`/`<textarea>` outside the primitives that own one, no bare
`<a href>` in place of `Link`, no hand-rolled icon-only button in place of
`IconButton`, and no reference to a CSS class that does not exist.

Every component spreads its remaining props onto the root element, so
`data-testid` (or `data-cy`, `data-qa`) passes straight through — the library
does not hardcode a convention. Prefer role + accessible name where you can;
`src/test-hooks.test.tsx` pins the passthrough as a contract.

These invariants are enforced by tests in `src/tokens.test.ts`, so a regression fails CI rather than shipping.

## License

MIT © 2026 Akhil Saxena
