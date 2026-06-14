# @akhil-saxena/design-system

Accessible React primitives with semantic tokens. Full dark mode, neutral paper + ink + amber editorial design language.

**v1.8.0 — 79 components across 9 categories.**

[![npm](https://img.shields.io/npm/v/@akhil-saxena/design-system)](https://www.npmjs.com/package/@akhil-saxena/design-system)

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
      <Badge tone="amber">Active</Badge>
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

### Inputs (22)

Button, OAuthButton, TextInput, Textarea, Badge, Chip, Kbd, Checkbox, Radio, Toggle, NumberStepper, RangeSlider, StarRating, StatusPill, Autocomplete, ColorPicker, DatePicker, DateRangePicker, FileInput, InlineEditField, MultiSelect, Select

### Overlays (11)

Popover, Modal, ConfirmDialog, CommandPalette, BottomSheet, Tooltip, Sheet, HoverCard, Card, StickyNote, Lightbox

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

- `useFocusTrap(ref, active)` - trap focus within an overlay
- `useClickOutside(ref, onOutside)` - fire callback on click outside ref
- `useReducedMotion()` - reflects `prefers-reduced-motion`
- `useMatchMedia(query)` - generic matchMedia hook
- `useTokens()` - read computed CSS custom property values at runtime
- `useSortableTable(data, options)` - sort state (column + direction)
- `useTableSelection(data, options)` - single + multi-select with indeterminate
- `useResizableColumns(initialWidths)` - pointer events column resize

## Tokens

CSS custom properties in `tokens.css`:

- **Color** - neutral surface/ink ramps + amber accent + AAA-tuned blue/purple/green/red status colors
- **Typography** - Inter (body), Archivo (display), Newsreader (editorial serif), JetBrains Mono (code/data)
- **Spacing** - 4px base, 12-step scale (4..64px)
- **Radius** - sm / md / lg / xl / pill
- **Shadow** - 1 / 2 / 3
- **Motion** - `--ease-out`, `--ease-in-out`, `--ease-spring` + `--dur-1..4`

## License

MIT © 2026 Akhil Saxena
