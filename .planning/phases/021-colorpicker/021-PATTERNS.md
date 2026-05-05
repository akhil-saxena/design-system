# Phase 21: ColorPicker — Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 5
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/inputs/ColorPicker/index.tsx` | component | event-driven (pointer drag + controlled value) | `src/inputs/DatePicker/index.tsx` | role-match (controlled complex input); `src/hooks/useResizableColumns.ts` for pointer drag |
| `src/inputs/ColorPicker/colorUtils.ts` | utility | transform (pure math) | *(no analog — pure function module)* | none — see No Analog section |
| `src/inputs/ColorPicker/ColorPicker.stories.tsx` | story | request-response | `src/inputs/DatePicker/DatePicker.stories.tsx` | exact |
| `src/inputs/ColorPicker/ColorPicker.test.tsx` | test | — | `src/hooks/useResizableColumns.test.tsx` | exact (pointer-event spy pattern); `src/inputs/DatePicker/DatePicker.test.tsx` for component test structure |
| `src/primitives.css` (append) | config/style | — | `src/primitives.css` lines 453–531 (ds-atom-range block) | role-match (new ds-atom-colorpicker scoped block appended after existing last rule) |

---

## Pattern Assignments

---

### `src/inputs/ColorPicker/index.tsx` (component, event-driven)

**Primary analog:** `src/inputs/DatePicker/index.tsx`
**Secondary analog:** `src/hooks/useResizableColumns.ts` (pointer capture pattern)

---

#### Imports pattern — copy from `src/inputs/DatePicker/index.tsx` lines 1–11

```typescript
import { type HTMLAttributes, forwardRef, useEffect, useMemo, useState } from "react";
// ColorPicker will use: CSSProperties, PointerEvent, KeyboardEvent, forwardRef, useCallback, useRef, useState
// No external color library. colorUtils imported from co-located module:
import { hexToHsv, hsvToHex } from "./colorUtils";
```

The project uses named React imports — never `React.useState`. Follow `DatePicker`'s import block structure.

---

#### forwardRef + displayName pattern — copy from `src/inputs/DatePicker/index.tsx` lines 68–88, 309

```typescript
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    value,
    onChange,
    // ...destructure with defaults
    className,
    style,
    ...rest
  },
  ref,
) {
  // ...
});

DatePicker.displayName = "DatePicker";
```

Apply the same `forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(...))` shape. Always set `.displayName` at the bottom of the file. `ColorInput` follows the same `forwardRef<HTMLInputElement, ColorInputProps>` pattern (ref type is `HTMLInputElement` because the inner `<input>` is the primary focusable element).

---

#### Controlled-value state pattern — copy from `src/inputs/DatePicker/index.tsx` lines 89–105

```typescript
const [viewMonth, setViewMonth] = useState<Date>(() =>
  startOfMonth(value ?? defaultMonth ?? new Date()),
);

// Sync viewMonth when caller swaps `value` to a different month while controlled.
useEffect(() => {
  if (value) {
    const target = startOfMonth(value);
    if (
      target.getFullYear() !== viewMonth.getFullYear() ||
      target.getMonth() !== viewMonth.getMonth()
    ) {
      setViewMonth(target);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);
```

For `ColorPicker`: the internal `color` state initialises from `value ?? defaultValue ?? '#f59e0b'`. Add a `useEffect` that syncs internal state when the controlled `value` prop changes — same pattern as `DatePicker`'s `viewMonth` sync. The `hex` state and `hue` state are always internal (never controlled directly).

---

#### Pointer-event drag pattern (setPointerCapture) — copy from `src/hooks/useResizableColumns.ts` lines 54–86

```typescript
const startResize = useCallback(
  (col: string, e: React.PointerEvent) => {
    const startX = e.clientX;
    const startW = widthsRef.current[col] ?? 0;

    // Capture pointer so we track movement even if cursor leaves the element.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // jsdom and some older browsers may throw; safe to ignore.
    }

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(minWidth, startW + delta);
      setWidths((prev) => {
        const updated = { ...prev, [col]: next };
        widthsRef.current = updated;
        return updated;
      });
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      onWidthsChangeRef.current?.({ ...widthsRef.current });
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  },
  [minWidth],
);
```

**Adapt for ColorPicker gradient canvas:** Replace `clientX`/`startX` delta math with `getBoundingClientRect()` percentage math. Each draggable area (gradient canvas, hue bar, opacity bar) gets its own handler trio: `onPointerDown` (captures pointer), `onPointerMove` (reads rect, computes %, calls `pick`/`setOpacity`), attached via `document.addEventListener` to match this pattern. Wrap the `setPointerCapture` call in try/catch (jsdom does not implement it).

**Key difference from useResizableColumns:** ColorPicker drag uses `getBoundingClientRect` to get percentage position, not a delta. The `onMove` handler body is:

```typescript
const onMove = (ev: PointerEvent) => {
  const rect = (dragEl.current as HTMLElement).getBoundingClientRect();
  const s = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
  const v = Math.max(0, Math.min(1, 1 - (ev.clientY - rect.top) / rect.height));
  pick(hsvToHex(hue, s, v));
};
```

Store the drag target element in a `useRef` (set in `onPointerDown` via `e.currentTarget`) so the `onMove` closure can call `.getBoundingClientRect()` on it without DOM queries.

---

#### CSS class naming — copy from `src/inputs/DatePicker/index.tsx` lines 186–191

```typescript
<div
  ref={ref}
  className={`ds-atom-datepicker${className ? ` ${className}` : ""}`}
  style={style}
  {...rest}
>
```

Apply the same pattern for ColorPicker:

```typescript
<div
  ref={ref}
  className={`ds-atom-colorpicker${className ? ` ${className}` : ""}`}
  style={style}
  {...rest}
>
```

---

#### Hex input decoupled state (CONSTRAINT-009) — copy from `design_handoff/design-system/ds-colorpicker.jsx` lines 15–20

```typescript
const [color, setColor] = useState('#f59e0b');
const [hex,   setHex]   = useState('#f59e0b');
const [opacity, setOpacity] = useState(100);

const handleHex = (val: string) => {
  setHex(val);
  if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
};
const pick = (c: string) => { setColor(c); setHex(c); };
```

The `hex` state is intentionally a separate raw-input slot. The regex `/^#[0-9a-fA-F]{6}$/` is the exact gate — do not trim. Add a fourth `hue` state `(0–360)` to avoid Pitfall 1 (gradient self-reference loop): only the hue bar updates `hue`; gradient canvas drag preserves `hue` and varies saturation/brightness.

---

#### ColorInput wrapping pattern — copy from `src/inputs/TextInput/index.tsx` lines 94–107

```typescript
// Wrapped input when icon/prefix/suffix/kbd is present — wrapper handles
// border + focus-within ring so the inner <input> inherits.
return (
  <div
    className={`ds-atom-input-wrap${className ? ` ${className}` : ""}`}
    data-error={error ? "true" : undefined}
    style={{ ...wrapStyle, ...style }}
  >
    {icon ? <span style={{ display: "inline-flex", color: "var(--ink-3)" }}>{icon}</span> : null}
    {prefix ? <span style={affixStyle}>{prefix}</span> : null}
    <input ref={ref} style={innerInputStyle} {...rest} />
    {suffix ? <span style={affixStyle}>{suffix}</span> : null}
    {kbd ? <kbd style={kbdStyle}>{kbd}</kbd> : null}
  </div>
);
```

For `ColorInput`, the swatch takes the place of `icon`. Render a `<div>` swatch (presentational, `aria-hidden="true"`) before the `<input>` inside `ds-atom-input-wrap`:

```typescript
<div className="ds-atom-input-wrap" style={{ ...wrapStyle }}>
  <div
    aria-hidden="true"
    style={{ width: 18, height: 18, borderRadius: 4, background: color,
             border: '1px solid var(--rule)', flexShrink: 0 }}
  />
  <input
    ref={ref}
    value={hex}
    onChange={(e) => handleHex(e.target.value)}
    style={{ ...innerInputStyle, fontFamily: 'var(--mono)', fontSize: 12 }}
    {...rest}
  />
</div>
```

---

#### Data attributes for state — copy from `src/inputs/DatePicker/index.tsx` lines 225–244

```typescript
const cls = [
  "ds-atom-datepicker-cell",
  !inMonth && "is-out",
  selected && "is-selected",
  isRangeStartCell && "is-range-start",
  todayCell && "is-today",
  isDisabled && "is-disabled",
  inRangeMatch && "is-in-range",
]
  .filter(Boolean)
  .join(" ");
```

Use the same filter-and-join pattern for ColorPicker's preset swatch `className`:

```typescript
const cls = [
  "ds-atom-colorpicker-swatch",
  color === c && "is-selected",
].filter(Boolean).join(" ");
```

---

#### aria-label / aria-pressed on buttons — copy from `src/inputs/DatePicker/index.tsx` lines 247–265

```typescript
<button
  type="button"
  role="gridcell"
  aria-selected={selected ? true : undefined}
  aria-current={todayCell ? "date" : undefined}
  aria-disabled={isDisabled || undefined}
  className={cls}
  disabled={isDisabled}
  onClick={() => handleSelect(date)}
>
```

Apply same pattern to preset swatch buttons and tonal strip cell buttons:

```typescript
<button
  key={c}
  type="button"
  aria-label={`Select color ${c}`}
  aria-pressed={color === c}
  className={cls}
  onClick={() => pick(c)}
>
```

---

### `src/inputs/ColorPicker/colorUtils.ts` (utility, transform)

**Analog:** None — greenfield pure-math module.

Use the formulas from RESEARCH.md Pattern 3. No React imports. Export two named functions:

```typescript
/** Convert a 6-digit hex string to [h(0–360), s(0–1), v(0–1)] */
export function hexToHsv(hex: string): [number, number, number] { ... }

/** Convert [h(0–360), s(0–1), v(0–1)] to a 6-digit #rrggbb hex string */
export function hsvToHex(h: number, s: number, v: number): string { ... }
```

See No Analog section below for detail.

---

### `src/inputs/ColorPicker/ColorPicker.stories.tsx` (story)

**Analog:** `src/inputs/DatePicker/DatePicker.stories.tsx` — exact match.

---

#### Meta block pattern — copy from `src/inputs/DatePicker/DatePicker.stories.tsx` lines 39–95

```typescript
const meta: Meta<typeof DatePicker> = {
  title: "Inputs/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "light", value: "#f5f3f0" },
        { name: "dark", value: "#1c1917" },
      ],
    },
    docs: {
      description: {
        component: "...",
      },
    },
  },
  argTypes: {
    value: { control: false, description: "..." },
    onChange: { control: false, description: "..." },
    className: { control: false },
    style: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;
```

For ColorPicker: use `title: "Inputs/ColorPicker"`, same backgrounds block, argTypes for `value`, `onChange`, `defaultValue`, `className`, `style` all `{ control: false }`.

---

#### SRC inline-code object pattern — copy from `src/inputs/DatePicker/DatePicker.stories.tsx` lines 4–37

```typescript
const SRC = {
  Default: `const [value, setValue] = useState(new Date(2026, 3, 22));
return <DatePicker value={value} onChange={setValue} />;`,
  // ...
};
```

Populate the SRC object with ColorPicker-specific snippets for each named export story. Reference `SRC.Default` etc. in each story's `parameters.docs.source.code`.

---

#### DarkMode story decorator — copy from `src/inputs/DatePicker/DatePicker.stories.tsx` lines 185–208

```typescript
export const DarkMode: Story = {
  parameters: { docs: { source: { code: SRC.DarkMode } } },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{
          background: "#1c1917",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => { ... },
};
```

Copy this decorator block verbatim for the ColorPicker DarkMode story.

---

#### Controlled-state render function — copy from `src/inputs/DatePicker/DatePicker.stories.tsx` lines 100–122

```typescript
export const Default: Story = {
  parameters: { docs: { source: { code: SRC.Default } } },
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 3, 22));
    return (
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
          Selected date
        </div>
        <DatePicker value={value} onChange={setValue} />
      </div>
    );
  },
};
```

For ColorPicker stories: use `useState<string>` with a hex default. Show the selected hex value below the picker using the same mono-label style. Suggested story set: `Default`, `Uncontrolled`, `WithColorInput`, `DarkMode`.

---

### `src/inputs/ColorPicker/ColorPicker.test.tsx` (test)

**Primary analog:** `src/hooks/useResizableColumns.test.tsx` — pointer-event spy pattern.
**Secondary analog:** `src/inputs/DatePicker/DatePicker.test.tsx` — component test structure.

---

#### Test file header + imports — copy from `src/hooks/useResizableColumns.test.tsx` lines 1–20

```typescript
import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from ".";
import { hexToHsv, hsvToHex } from "./colorUtils";
```

---

#### fakePointerEvent helper — copy from `src/hooks/useResizableColumns.test.tsx` lines 24–30

```typescript
function fakePointerEvent(clientX: number, pointerId = 1): React.PointerEvent {
  return {
    clientX,
    pointerId,
    currentTarget: { setPointerCapture: vi.fn() },
  } as unknown as React.PointerEvent;
}
```

Extend for 2D events (gradient canvas needs `clientX` + `clientY`):

```typescript
function fakePointerEvent2D(clientX: number, clientY: number, pointerId = 1): React.PointerEvent {
  return {
    clientX,
    clientY,
    pointerId,
    currentTarget: { setPointerCapture: vi.fn() },
  } as unknown as React.PointerEvent;
}
```

---

#### buildSpyCapture helper — copy from `src/hooks/useResizableColumns.test.tsx` lines 75–101

```typescript
function buildSpyCapture() {
  const handlers: Record<string, ((e: PointerEvent) => void)[]> = {
    pointermove: [],
    pointerup: [],
  };
  const addSpy = vi
    .spyOn(document, "addEventListener")
    .mockImplementation((type: string, fn: EventListenerOrEventListenerObject) => {
      if (type === "pointermove" || type === "pointerup") {
        handlers[type].push(fn as (e: PointerEvent) => void);
      }
    });
  const removeSpy = vi
    .spyOn(document, "removeEventListener")
    .mockImplementation((type: string, fn: EventListenerOrEventListenerObject) => {
      if (type === "pointermove" || type === "pointerup") {
        handlers[type] = handlers[type].filter((h) => h !== fn);
      }
    });
  return {
    handlers,
    restore() {
      addSpy.mockRestore();
      removeSpy.mockRestore();
    },
  };
}
```

Copy this block verbatim — it is the exact pattern for ColorPicker drag tests.

---

#### getBoundingClientRect mock for drag tests

jsdom returns `{ width: 0, height: 0, ... }` from `getBoundingClientRect`. Mock it before triggering `pointermove`:

```typescript
// Before calling the captured pointermove handler:
vi.spyOn(dragEl, 'getBoundingClientRect').mockReturnValue({
  left: 0, top: 0, width: 200, height: 150,
  right: 200, bottom: 150, x: 0, y: 0,
  toJSON: () => ({}),
} as DOMRect);
```

This pattern is called out in RESEARCH.md Pitfall 2. It is the project-required approach since there is no real layout in jsdom.

---

#### Component test structure — copy from `src/inputs/DatePicker/DatePicker.test.tsx` lines 1–10

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from ".";

describe("DatePicker", () => {
  it("renders 42 cells in a 7×6 grid", () => {
    render(<DatePicker value={null} onChange={() => {}} />);
    const cells = screen.getAllByRole("gridcell");
    expect(cells.length).toBe(42);
  });
  // ...
```

For ColorPicker: use `describe("ColorPicker", () => { ... })`. Required test cases per RESEARCH.md REQ-21-01 map:

1. Renders gradient canvas, hue bar, opacity bar with correct `role="slider"` + `aria-label`
2. Valid hex input updates displayed color
3. Invalid hex (no leading `#`, 5 chars) does not update internal `color` state
4. Preset swatch click calls `onChange` with correct hex
5. Active swatch has `aria-pressed={true}`
6. Tonal strip cell click sets color
7. Hue bar keyboard ArrowRight increments hue
8. Opacity bar keyboard ArrowRight increments opacity
9. Gradient drag (spy-based): `getBoundingClientRect` mocked → `pointermove` → `onChange` called with new hex
10. `ColorInput` renders swatch div + input inside `.ds-atom-input-wrap`
11. `hexToHsv` / `hsvToHex` round-trip: `hsvToHex(...hexToHsv('#f59e0b'))` equals `'#f59e0b'`

---

### `src/primitives.css` (append — ds-atom-colorpicker block)

**Analog:** `src/primitives.css` lines 453–531 (ds-atom-range block) — same scoped CSS block pattern.

---

#### Block header comment style — copy from `src/primitives.css` lines 453 area (ds-atom-range comment above line 453)

```css
/* ─── DS atom: ColorPicker ──────────────────────────────────────────────
   Most ColorPicker styles are inline (consistent with DatePicker).
   This block covers only what cannot be expressed inline:
   pointer-events passthrough on thumbs and focus-ring on swatch buttons. */
```

---

#### Thumb pointer-events rule — copy structure from `src/primitives.css` lines 510–522

```css
/* RangeSlider thumb: pointer-events: none so input captures events through it */
.ds-atom-range-thumb {
  /* ... */
  pointer-events: none;
}
```

Apply same pattern:

```css
.ds-atom-colorpicker-thumb {
  pointer-events: none;
}
```

---

#### Focus ring on slider areas — copy from `src/primitives.css` lines 94–97 (ds-atom-input-wrap:focus-within)

```css
.ds-atom-input-wrap:focus-within {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
}
```

Equivalent for keyboard-focusable drag areas:

```css
.ds-atom-colorpicker-canvas:focus-visible,
.ds-atom-colorpicker-huebar:focus-visible,
.ds-atom-colorpicker-opacitybar:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

#### Dark mode overrides — copy from `src/primitives.css` lines 82–92 (dark .ds-atom-input pattern)

```css
.dark .ds-atom-input {
  border-color: var(--rule);
}
.dark .ds-atom-input:focus {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.28);
}
```

Add a single dark-mode override for the container background if needed (the `glass` surface token handles most of it via existing CSS variables).

---

### `src/index.ts` (export line)

**Location to insert:** After line 82 (`export { DatePicker, ... } from "./inputs/DatePicker";`) since DatePicker is the closest sibling component.

**Pattern to copy** (line 82):

```typescript
export { DatePicker, type DatePickerProps } from "./inputs/DatePicker";
```

New line:

```typescript
export { ColorPicker, type ColorPickerProps, ColorInput, type ColorInputProps } from "./inputs/ColorPicker";
```

---

## Shared Patterns

### Pointer-event capture (all drag areas in index.tsx)

**Source:** `src/hooks/useResizableColumns.ts` lines 54–86
**Apply to:** All three drag areas in `ColorPicker/index.tsx` (gradient canvas, hue bar, opacity bar)

The project's canonical drag pattern:
1. `onPointerDown` → `setPointerCapture` (in try/catch) → `document.addEventListener("pointermove", onMove)` + `document.addEventListener("pointerup", onUp)`
2. `onMove` → compute new value → call state setter
3. `onUp` → `removeEventListener` for both → optional callback

Never use `mousemove` or attach to the React element's `onPointerMove` prop — always use `document.addEventListener` after `setPointerCapture`. This is the established project pattern.

---

### CSS token usage (all CSS values in index.tsx and primitives.css)

**Source:** `src/inputs/TextInput/index.tsx` lines 16–74
**Apply to:** All inline `style` props in ColorPicker and ColorInput

Token reference for this component:
- `var(--cream)` — container and input background
- `var(--rule)` — borders (swatch outline, strip border, container border)
- `var(--ink)` — active swatch border (`2.5px solid var(--ink)`)
- `var(--ink-3)` / `var(--ink-4)` — label text (Hex, HUE, OPACITY, PRESETS labels)
- `var(--mono)` — monospace font for hex labels and input
- `var(--font)` — body font
- `var(--amber)` — focus ring color
- `var(--focus-ring)` — box-shadow value for `:focus-visible`

---

### forwardRef + displayName (both ColorPicker and ColorInput)

**Source:** `src/inputs/DatePicker/index.tsx` lines 68–88, 309
**Apply to:** Both component exports in `ColorPicker/index.tsx`

Every component uses `forwardRef<ElementType, PropsType>(function Name(...))` — never arrow functions passed to `forwardRef`. Set `.displayName` explicitly at the bottom of the file.

---

### className merge pattern (all component root divs)

**Source:** `src/inputs/DatePicker/index.tsx` line 188; `src/inputs/RangeSlider/index.tsx` line 62

```typescript
className={`ds-atom-datepicker${className ? ` ${className}` : ""}`}
```

This project does not use `clsx` or `classnames` — always use this template literal pattern. Apply to both `ColorPicker` root div and `ColorInput` wrapper div.

---

### data-* attributes for state

**Source:** `src/inputs/RangeSlider/index.tsx` line 64; `src/inputs/DatePicker/index.tsx` line 256

```typescript
data-disabled={disabled ? "true" : undefined}
aria-disabled={isDisabled || undefined}
```

Use `data-*="true"` (string) for CSS selector targeting, `aria-*` for accessibility. Do not use boolean `true` for data attributes — use the string `"true"` or `undefined`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/inputs/ColorPicker/colorUtils.ts` | utility | transform | No existing color conversion module in `src/`. Greenfield pure-math module. Implement the two functions (`hexToHsv`, `hsvToHex`) using standard formulas from RESEARCH.md Pattern 3. No React imports. No side effects. Export only the two named functions. |

---

## Metadata

**Analog search scope:** `src/inputs/`, `src/hooks/`, `src/primitives.css`, `design_handoff/design-system/ds-colorpicker.jsx`
**Files scanned:** 8 source files + 1 handoff file + 1 CSS file
**Pattern extraction date:** 2026-05-05
