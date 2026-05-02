# @akhil-saxena/design-system

Accessible React primitive library — 57 primitives, full dark mode, cream+ink+amber design language.

Status: **v1.0.0 — 57 primitives across 7 waves.**

Published to **GitHub Packages** (private registry, free under personal account quota). Requires auth to install — see below.

## Install

1. **One-time auth setup.** Generate a GitHub Personal Access Token (PAT) with `read:packages` scope at https://github.com/settings/tokens — copy the token (only shown once).
2. **Add to user-level `~/.npmrc`** (NEVER commit):
   ```
   //npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **In your project** (committed to repo), add a `.npmrc` file with the registry mapping:
   ```
   @akhil-saxena:registry=https://npm.pkg.github.com
   ```
4. **Install:**
   ```bash
   npm install @akhil-saxena/design-system
   ```

Peer deps: `react@^19`, `react-dom@^19`.

## Quick Start

Import the three CSS layers in your app's entry point (cascade order matters):

```ts
import "@akhil-saxena/design-system/tokens.css";       // :root + :root.dark CSS variables
import "@akhil-saxena/design-system/primitives.css";   // .ds-atom-* component styles
import "@akhil-saxena/design-system/utilities.css";    // .glass / .ds-label / .jd-markdown helpers
```

Then components:

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

Toggle dark mode by adding `class="dark"` on `<html>` (NOT body — `.dark` selector targets an ancestor element).

## Subpath imports

```ts
// Main primitives (57 total)
import { Button, Modal, Table, AppShell, Sortable } from '@akhil-saxena/design-system';

// Hooks
import { useFocusTrap, useClickOutside, useReducedMotion, useTokens } from '@akhil-saxena/design-system/hooks';

// Icons (tree-shakeable lucide wrappers, 1.5px stroke, 20x20)
import { ChevronDown, Search, Check } from '@akhil-saxena/design-system/icons';

// CSS layers
import "@akhil-saxena/design-system/tokens.css";
import "@akhil-saxena/design-system/primitives.css";
import "@akhil-saxena/design-system/utilities.css";
```

## Primitives (57 total at v1.0.0)

**Wave 1 — Atoms (9):** Button, TextInput, Textarea, Badge, Chip, Avatar (+ AvatarStack), Checkbox, Radio (+ RadioGroup), Toggle.

**Wave 2 — Controls (5):** NumberStepper, RollingNumber, RangeSlider, StarRating, Autocomplete.

**Wave 3 — Overlays (7):** Popover, Modal, BottomSheet, Tooltip, Sheet, HoverCard, ContextMenu.

**Wave 4 — Feedback (7):** AlertBanner, Toast, Skeleton, ProgressBar, InlineConfirm, Lightbox, EmptyState.

**Wave 5 — Form Inputs (7):** DatePicker, DateRangePicker, MultiSelect, Select, SplitButton, CopyToClipboard, SegmentedControl.

**Wave 6 — Data Display (11, DS-60..70):** Icon, Table, Tabs, SegmentedControl, Accordion, Carousel, Timeline, InfiniteList, Calendar, Breadcrumbs, RichText.

**Wave 7 — Layout, Patterns, Interaction (11, DS-71..80):**
- *Layout Shell:* AppShell, AppBar, Footer
- *Patterns:* Wizard, PasswordStrength / FieldError / FormErrorSummary (FormValidation), Coachmark
- *Interaction:* InlineEdit, SearchAndFilters, Presence (Avatar extension)
- *Drag and Drop:* Sortable (+ SortableItem, SortableDndContext)

**Internal (not exported):** DSDropdown, DSPortal, calendarGrid utility.

## Primitive Reference

| DS   | Name               | Category      | Description |
|------|--------------------|---------------|-------------|
| —    | Button             | Atom          | Primary/secondary/ghost/danger variants, 3 sizes |
| —    | TextInput          | Atom          | Text input with label, hint, error states |
| —    | Textarea           | Atom          | Auto-resize textarea |
| —    | Badge              | Atom          | Status indicator, 5 tones |
| —    | Chip               | Atom          | Dismissible filter chip, interactive or static |
| —    | Avatar             | Atom          | Image/initials/fallback + gradient + presence dot |
| —    | AvatarStack        | Atom          | Overlap stack with +N overflow |
| —    | Checkbox           | Atom          | Controlled + indeterminate state |
| —    | Radio / RadioGroup | Atom          | Accessible radio group |
| —    | Toggle             | Atom          | On/off switch |
| —    | NumberStepper      | Control       | +/- stepper with min/max/step |
| —    | RollingNumber      | Control       | Animated digit counter |
| —    | RangeSlider        | Control       | Min-max range slider |
| —    | StarRating         | Control       | 1-5 star rating, read-only or interactive |
| —    | Autocomplete       | Control       | Type-ahead combo box |
| —    | Popover            | Overlay       | Anchored floating panel |
| —    | ContextMenu        | Overlay       | Right-click / trigger menu |
| —    | Modal              | Overlay       | Dialog + ConfirmDialog |
| —    | BottomSheet        | Overlay       | Mobile sheet with snap heights |
| —    | Tooltip            | Overlay       | Hover/focus tooltip |
| —    | Sheet              | Overlay       | Side panel (left/right/top/bottom) |
| —    | HoverCard          | Overlay       | Hover-reveal card |
| —    | AlertBanner        | Feedback      | Full-width alert (info/success/warning/danger) |
| —    | Toast              | Feedback      | Toast queue via useToast hook |
| —    | Skeleton           | Feedback      | Loading placeholder (text/rect/circle shapes) |
| —    | ProgressBar        | Feedback      | Determinate + indeterminate progress |
| —    | InlineConfirm      | Feedback      | Inline destructive confirmation |
| —    | Lightbox           | Feedback      | Image lightbox |
| —    | EmptyState         | Feedback      | Zero-state with icon + CTA |
| —    | DatePicker         | Form          | Calendar date picker |
| —    | DateRangePicker    | Form          | Start + end date range |
| —    | MultiSelect        | Form          | Tag-style multi-select |
| —    | Select             | Form          | Styled native select |
| —    | SplitButton        | Form          | Button + dropdown action |
| —    | CopyToClipboard    | Form          | Copy text with confirm feedback |
| —    | SegmentedControl   | Form          | 2-5 option pill selector |
| DS-60 | Icon              | Data Display  | Lucide wrapper, 20px/1.5stroke canonical |
| DS-61 | Table             | Data Display  | Compound table with sort, select, resize, pagination |
| DS-62 | Tabs              | Data Display  | Underline + pill tab variants, overflow menu |
| DS-63 | SegmentedControl  | Data Display  | (see Form) |
| DS-64 | Accordion         | Data Display  | Single + multi expand disclosure |
| DS-65 | Carousel          | Data Display  | Touch swipe + autoplay carousel |
| DS-66 | Timeline          | Data Display  | Ordered event timeline |
| DS-67 | InfiniteList      | Data Display  | IntersectionObserver infinite scroll |
| DS-68 | Calendar          | Data Display  | Month/week/day views with events |
| DS-69 | Breadcrumbs       | Data Display  | Nav breadcrumbs with overflow collapse |
| DS-70 | RichText          | Data Display  | TipTap-powered rich text editor |
| DS-71 | AppShell          | Layout        | CSS Grid layout shell, collapsible sidebar |
| DS-72 | AppBar            | Layout        | Topbar, 4 variants, scrolled blur |
| DS-73 | Footer            | Layout        | Compact (1-line) + expanded (4-column) |
| DS-74 | Wizard            | Pattern       | Multi-step form with stepper + validation gate |
| DS-75 | FormValidation    | Pattern       | PasswordStrength, FieldError, FormErrorSummary |
| DS-76 | Coachmark         | Pattern       | First-run hint anchored to target |
| DS-77 | InlineEdit        | Interaction   | Click-to-edit text/textarea |
| DS-78 | SearchAndFilters  | Interaction   | Search + autocomplete + chip filter tokens |
| DS-79 | Presence          | Interaction   | Avatar presencePosition 4-corner extension |
| DS-80 | Sortable          | Interaction   | @dnd-kit list + cross-list drag and drop |
## Hooks

From `@akhil-saxena/design-system/hooks`:

**Foundation:**
- `useFocusTrap(containerRef, active)` — trap focus within an overlay
- `useClickOutside(ref, onOutside)` — fire callback on click outside ref
- `useReducedMotion()` — boolean reflecting `prefers-reduced-motion`
- `useMatchMedia(query)` — generic matchMedia hook
- `useTokens()` — read computed CSS custom property values at runtime

**Table helpers (v0.6.0):**
- `useSortableTable(data, options)` — pure-derivation sort state (column + direction)
- `useTableSelection(data, options)` — single + multi-select state with indeterminate
- `useResizableColumns(initialWidths)` — Pointer Events column-resize with consumer persistence

## Tokens

CSS custom properties in `tokens.css`. Color (cream/ink/amber + AAA-tuned blue/purple/green/red), typography (Inter body / Archivo display / JetBrains Mono), spacing (12-step 4..64px), radius (sm/md/lg/xl/pill), shadow (1/2/3), motion (--ease-out/in-out/spring + --dur-1..4), surface (--surf-1/2/3), focus (--focus + --focus-ring).

## Dark Mode

Light is default. Add `class="dark"` to `<html>` (or any ancestor element — `.dark` selector scopes all overrides):

```ts
document.documentElement.classList.toggle("dark");
```

## License

MIT © 2026 Akhil Saxena
