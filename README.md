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

## Components

### Inputs (23)

Button, OAuthButton, TextInput, Textarea, Badge, Chip, Kbd, Checkbox, Radio, Toggle, NumberStepper, RangeSlider, StarRating, StatusPill, Autocomplete, ColorPicker, DatePicker, DateRangePicker, FileInput, InlineAddRow, InlineEditField, MultiSelect, Select

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

### Accessibility notes

- The ink ramp is contrast-budgeted: `--ink` / `--ink-2` / `--ink-3` all clear WCAG AA (4.5:1) for body text on every surface in both themes. `--ink-4` is an alias of `--ink-3`; `--ink-5` is decorative only and must not be used for text.
- `--focus` is keyed to `--amber-d` rather than the brand `--amber`, which measures only 2.09:1 on `--cream` and would fail WCAG 1.4.11.
- All non-essential motion is disabled under `prefers-reduced-motion: reduce`. Loading indicators (button spinner, progress, skeleton) are deliberately exempt so in-progress states stay perceivable.
- `.ds-visually-hidden` is available for screen-reader-only text.

These invariants are enforced by tests in `src/tokens.test.ts`, so a regression fails CI rather than shipping.

## License

MIT © 2026 Akhil Saxena
