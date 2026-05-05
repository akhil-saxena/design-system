# Phase 22: CommandPalette - Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 5 (3 new source files + 1 CSS append + 1 barrel edit)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/overlays/CommandPalette/index.tsx` | component (overlay) | event-driven + request-response | `src/overlays/ConfirmDialog/index.tsx` | exact — DSPortal + useFocusTrap + document keydown |
| `src/overlays/CommandPalette/CommandPalette.stories.tsx` | story | — | `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` | exact — overlay story shape |
| `src/overlays/CommandPalette/CommandPalette.test.tsx` | test | — | `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` | exact — controlled overlay test shape |
| `src/primitives.css` | config (CSS append) | — | `src/primitives.css` lines 803–885 (`ds-atom-modal-*` block) | exact — overlay backdrop + panel block pattern |
| `src/index.ts` | config (barrel) | — | `src/index.ts` lines 49–55 (ConfirmDialog export block) | exact — overlays section export placement |

---

## Pattern Assignments

### `src/overlays/CommandPalette/index.tsx` (component, event-driven)

**Primary analog:** `src/overlays/ConfirmDialog/index.tsx`
**Secondary analog:** `src/overlays/Modal/index.tsx` (for `role="dialog"` variant)
**Keyboard-list analog:** `src/_internals/DSDropdown.tsx` lines 112–169 (ArrowUp/Down/Enter loop)

#### Imports pattern
Source: `src/overlays/ConfirmDialog/index.tsx` lines 1–13, `src/overlays/Modal/index.tsx` lines 1–13.
```typescript
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Kbd } from "../../inputs/Kbd";
```
Notes:
- `DSPortal` and `useFocusTrap` are mandatory for every controlled overlay in this repo.
- `Kbd` (`src/inputs/Kbd/index.tsx`) is already used inside `ConfirmDialog` for the TypeToConfirm hint row; import it the same way for item shortcut display.
- No `forwardRef` — ConfirmDialog and Modal both use the callback-ref-as-state pattern (`useState<HTMLDivElement | null>(null)`) instead.

#### Controlled overlay pattern (open prop + early return)
Source: `src/overlays/ConfirmDialog/index.tsx` lines 159–191, `src/overlays/Modal/index.tsx` lines 65–106.
```typescript
export function CommandPalette({ open, onClose, ...}: CommandPaletteProps) {
  // Callback-ref pattern: panel state flips from null to DOM node when React
  // commits it. Passing the node (not a RefObject) into useFocusTrap guarantees
  // the trap engages exactly when the portal commits its child.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const generatedLabelId = useId();

  useFocusTrap(panel, open);

  // ... keyboard useEffect ...

  if (!open) return null;

  return (
    <DSPortal>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX;
          keyboard close is via the document Escape handler installed above on `document` */}
      <div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
        <div
          ref={setPanel}
          className="ds-atom-cmd-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={generatedLabelId}
          tabIndex={-1}
        >
          {/* ... */}
        </div>
      </div>
    </DSPortal>
  );
}
```
Key rules enforced by analogs:
- `if (!open) return null;` — gates the entire render, same line in ConfirmDialog (191) and Modal (106).
- Reuse the existing `ds-atom-modal-backdrop` class for the scrim — ConfirmDialog does this at line 205; it is already defined in primitives.css (line 803). Do NOT invent a new backdrop class.
- The panel gets its own `ds-atom-cmd-panel` class for sizing overrides; the backdrop is shared.

#### Backdrop click pattern
Source: `src/overlays/Modal/index.tsx` lines 108–112.
```typescript
function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
  if (e.target === e.currentTarget) onClose(); // CommandPalette closes on backdrop click (unlike ConfirmDialog)
}
```
CommandPalette should close on backdrop click (same as Modal's default `closeOnBackdropClick=true`), unlike ConfirmDialog which blocks it.

#### Document-level keyboard handler (Escape + ArrowUp/Down/Enter)
Source: `src/overlays/ConfirmDialog/index.tsx` lines 181–189 (Escape/Enter pattern) + `src/_internals/DSDropdown.tsx` lines 115–169 (full ArrowUp/Down/Enter/Home/End loop). The CommandPalette owns its own `document.addEventListener` because it is a full-screen modal (not an anchored dropdown), matching ConfirmDialog's direct `document` approach.
```typescript
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filteredItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredItems.length) {
        filteredItems[activeIndex].onSelect();
        onClose();
      }
      return;
    }
  }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open, onClose, activeIndex, filteredItems]);
```
Note: DSDropdown uses wrapping modulo (`(i + 1) % count`); CommandPalette should clamp instead (no wrap-around on a flat list), matching typical command-palette UX.

#### activeIndex state and reset
Source pattern: `src/inputs/Autocomplete/index.tsx` line 70 (`useState(0)`), `src/overlays/ConfirmDialog/index.tsx` lines 325–327 (reset on close).
```typescript
const [activeIndex, setActiveIndex] = useState(0);

// Reset activeIndex and query when palette closes
useEffect(() => {
  if (!open) {
    setActiveIndex(0);
    setQuery("");
  }
}, [open]);
```

#### aria-activedescendant wiring
Source: `src/inputs/Autocomplete/index.tsx` line 150.
```typescript
// On the search <input>:
aria-activedescendant={filteredItems.length > 0 ? `ds-cmd-item-${activeIndex}` : undefined}

// On each item <button>:
id={`ds-cmd-item-${i}`}
aria-selected={i === activeIndex}
```

#### Kbd usage for shortcut display
Source: `src/overlays/ConfirmDialog/index.tsx` line 368 (TypeToConfirm hint row), `src/inputs/Kbd/index.tsx`.
```typescript
import { Kbd } from "../../inputs/Kbd";

// Inside item row:
{item.shortcut && (
  <Kbd size="sm">{item.shortcut}</Kbd>
)}
```
`Kbd` renders a `<kbd>` with `ds-atom-kbd` className, `var(--mono)` font, `size="sm"` gives `fontSize: 9.5, padding: "1px 5px"`.

#### Item scroll-into-view on activeIndex change
No existing analog in this repo — this is a "no analog" pattern. Use `useRef` on the list container and call `activeItemRef.current?.scrollIntoView({ block: "nearest" })` inside a `useEffect([activeIndex])`.

---

### `src/overlays/CommandPalette/CommandPalette.stories.tsx` (story)

**Analog:** `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx`

#### Meta block pattern
Source: `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` lines 103–117.
```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CommandPalette } from ".";
import { Button } from "../../inputs/Button";

const meta: Meta<typeof CommandPalette> = {
  title: "Overlays/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "...",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;
```

#### Demo function pattern (controlled open state in a wrapper)
Source: `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` lines 122–140.
```typescript
function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open Command Palette
      </Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={SAMPLE_ITEMS}
      />
    </>
  );
}

export const Default: Story = {
  parameters: { docs: { source: { code: SRC.Default } } },
  render: () => <DefaultDemo />,
};
```

#### Dark mode decorator pattern
Source: `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` lines 244–264.
```typescript
export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{
          background: "#1c1917",
          padding: 32,
          borderRadius: 8,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => <DefaultDemo />,
};
```

---

### `src/overlays/CommandPalette/CommandPalette.test.tsx` (test)

**Analog:** `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx`

#### Test file imports and describe block
Source: `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` lines 1–4.
```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from ".";
```

#### Null render when closed
Source: `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` lines 6–18.
```typescript
it("renders null when open=false", () => {
  render(<CommandPalette open={false} onClose={() => {}} items={[]} />);
  const panel = document.body.querySelector(".ds-atom-cmd-panel");
  expect(panel).toBeNull();
});
```

#### ARIA attributes when open
Source: `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` lines 20–34. Query by CSS class (`.ds-atom-cmd-panel`), then assert `getAttribute("role")` and `getAttribute("aria-modal")`.

#### Escape keydown calls onClose
Source: `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` lines 36–49.
```typescript
it("calls onClose on Escape", () => {
  const onClose = vi.fn();
  render(<CommandPalette open={true} onClose={onClose} items={ITEMS} />);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
});
```

#### ArrowDown/ArrowUp/Enter navigation test pattern
No direct analog exists for the item-navigation tests — write fresh. Use `fireEvent.keyDown(document, { key: "ArrowDown" })` and assert `aria-selected` attribute on items, consistent with how Autocomplete wires `aria-selected` (line 114 of Autocomplete `index.tsx`).

#### Backdrop click closes
Source: `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` lines 66–80. Query `.ds-atom-modal-backdrop`, `fireEvent.click(backdrop)`, assert `onClose` called (CommandPalette DOES close on backdrop, unlike ConfirmDialog).

---

### `src/primitives.css` — append `ds-atom-cmd-*` block

**Analog:** `src/primitives.css` lines 803–885 (the `ds-atom-modal-*` block).

**Append point:** After line 4931 (current last line, inside `.ds-atom-pagination-count`). Add a closing `}` for that rule first if needed, then append the new block.

**Confirmed:** No `ds-cmd` or `ds-atom-cmd` classes exist anywhere in `primitives.css` (grep returned empty).

#### CSS block structure to copy from (modal block, lines 803–885)
```css
/* ─── DS atom: CommandPalette ────────────────────────────────────────────────
   DSPortal-mounted backdrop (reuses ds-atom-modal-backdrop) + search panel.
   Focus-trapped via useFocusTrap. Keyboard: Escape closes, ArrowUp/Down moves
   activeIndex, Enter selects. Animations namespaced ds-atom-cmd-* to avoid
   colliding with consumer-defined keyframes. */
.ds-atom-cmd-panel {
  background: rgba(255, 255, 255, 0.97);
  backdropFilter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  width: 560px;
  max-width: calc(100% - var(--space-4));
  max-height: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ds-atom-cmd-in 0.18s ease-out;
  font-family: var(--font);
  color: var(--ink);
}
.dark .ds-atom-cmd-panel {
  background: var(--cream-2);
}
/* search input row */
.ds-atom-cmd-search { ... }
/* scrollable results list */
.ds-atom-cmd-list { ... }
/* individual item */
.ds-atom-cmd-item { ... }
.ds-atom-cmd-item[aria-selected="true"],
.ds-atom-cmd-item:hover { ... }
/* empty state */
.ds-atom-cmd-empty { ... }
@keyframes ds-atom-cmd-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: none; }
}
```
Rules copied from the modal block:
- `background: rgba(255, 255, 255, 0.97)` — always-light glass surface (matches ConfirmDialog `panelStyle` inline, but promoted to CSS for the palette; CONSTRAINT-010 in ConfirmDialog comments: "intentionally NOT the cream token — always-light").
- `.dark .ds-atom-cmd-panel` override uses `var(--cream-2)` (same as `.dark .ds-atom-modal` at line 832–834).
- Animation keyframe name prefixed `ds-atom-cmd-` (same namespacing discipline as `ds-atom-modal-in` at line 876, `ds-atom-sheet-in-*` at line 967).
- `box-shadow: var(--shadow-3)` — same as `.ds-atom-modal` line 827.
- `var(--radius-lg)`, `var(--rule)`, `var(--font)`, `var(--ink)` — same tokens used throughout modal/sheet blocks.

---

### `src/index.ts` — add CommandPalette export

**Analog:** `src/index.ts` lines 49–55 (ConfirmDialog export block).

**Insert after:** line 55 (the closing `}` of the ConfirmDialog export block), before line 57 (`Sheet` export). This keeps all overlays grouped contiguously.

```typescript
export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandPaletteItem,
} from "./overlays/CommandPalette";
```
Shape copied from ConfirmDialog block (lines 49–55):
```typescript
export {
  ConfirmDialog,
  TypeToConfirm,
  type ConfirmDialogProps,
  type ConfirmDialogTone,
  type TypeToConfirmProps,
} from "./overlays/ConfirmDialog";
```

---

## Shared Patterns

### DSPortal mount
**Source:** `src/overlays/ConfirmDialog/index.tsx` line 203, `src/overlays/Modal/index.tsx` line 115.
**Apply to:** `CommandPalette/index.tsx`
```typescript
return (
  <DSPortal>
    <div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
      <div ref={setPanel} className="ds-atom-cmd-panel" ...>
        {/* content */}
      </div>
    </div>
  </DSPortal>
);
```
The backdrop class `ds-atom-modal-backdrop` is reused — it already provides `position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(2px); z-index: 1000; display: flex; align-items: center; justify-content: center;` (primitives.css lines 803–814). No new backdrop CSS needed.

### useFocusTrap (callback-ref-as-state)
**Source:** `src/overlays/ConfirmDialog/index.tsx` lines 172–178, `src/overlays/Modal/index.tsx` lines 81–87.
**Apply to:** `CommandPalette/index.tsx`
```typescript
const [panel, setPanel] = useState<HTMLDivElement | null>(null);
useFocusTrap(panel, open);
// ...
<div ref={setPanel} ...>
```
Both analogs use the same `useState<HTMLDivElement | null>(null)` + `ref={setPanel}` pattern. The hook signature is `useFocusTrap(element: HTMLElement | null, active: boolean)`.

### biome-ignore comment for backdrop click
**Source:** `src/overlays/ConfirmDialog/index.tsx` line 204, `src/overlays/Modal/index.tsx` line 116.
**Apply to:** `CommandPalette/index.tsx` backdrop div.
```typescript
{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX;
    keyboard close is via the document Escape handler installed above on `document` */}
<div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
```
This biome suppression comment appears identically in both ConfirmDialog and Modal — copy it verbatim.

### document.addEventListener cleanup pattern
**Source:** `src/overlays/ConfirmDialog/index.tsx` lines 181–189, `src/overlays/Modal/index.tsx` lines 97–104.
**Apply to:** `CommandPalette/index.tsx`
```typescript
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) { /* ... */ }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open, onClose, /* other deps */]);
```
Both analogs guard with `if (!open) return;` at the top of the effect, not in a conditional around the effect call. Cleanup always runs on deps change.

### State reset on close
**Source:** `src/overlays/ConfirmDialog/index.tsx` lines 325–327 (TypeToConfirm resets `v` on close).
**Apply to:** `CommandPalette/index.tsx` — reset `query` and `activeIndex` when `open` becomes false.
```typescript
useEffect(() => {
  if (!open) {
    setQuery("");
    setActiveIndex(0);
  }
}, [open]);
```

### Kbd for shortcut hints
**Source:** `src/overlays/ConfirmDialog/index.tsx` line 368, `src/inputs/Kbd/index.tsx`.
**Apply to:** `CommandPalette/index.tsx` item rows.
```typescript
import { Kbd } from "../../inputs/Kbd";
// ...
{item.shortcut && <Kbd size="sm">{item.shortcut}</Kbd>}
```
`size="sm"` gives `fontSize: 9.5px`, appropriate for inline shortcut hints.

---

## No Analog Found

| File / Pattern | Role | Data Flow | Reason |
|---|---|---|---|
| scroll-active-item into view | utility logic | — | No existing component does `scrollIntoView` on keyboard nav; use `useEffect([activeIndex])` + `itemRef.scrollIntoView({ block: "nearest" })` |
| ArrowDown/ArrowUp tests | test assertion | — | Autocomplete/MultiSelect don't have direct tests for keyboard item navigation; write fresh using `fireEvent.keyDown(document, { key: "ArrowDown" })` + query `aria-selected` |

---

## Metadata

**Analog search scope:** `src/overlays/`, `src/inputs/`, `src/_internals/`, `src/index.ts`, `src/primitives.css`
**Files scanned:** 9 source files read, 4 grep passes
**Pattern extraction date:** 2026-05-05
