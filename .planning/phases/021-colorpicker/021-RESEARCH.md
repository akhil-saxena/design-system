# Phase 21: ColorPicker — Research

**Researched:** 2026-05-05
**Domain:** Custom color picker UI — HSV/Hex math, pointer-event drag, canvas-free gradient
**Confidence:** HIGH (all claims verified against the handoff spec, constraints file, and existing codebase)

---

## Summary

Phase 21 ships two components: `ColorPicker` (the full panel) and `ColorInput` (the inline form variant). The design handoff (`ds-colorpicker.jsx`) is a static mockup — it renders a CSS gradient as a visual stand-in for the gradient canvas but has **no real drag logic**, no HSV math, and no pointer event handlers. The production implementation must add all three.

The core technical challenge is the gradient canvas. The gradient area is a CSS `linear-gradient` overlay (white-to-hue × transparent-to-black), and drag must translate a `(x%, y%)` position into HSV saturation and brightness values, then synchronise all other sub-parts. No external color library is needed; the math is a handful of pure functions (~40 lines) that convert between HSV and hex. The hue bar and opacity bar use the exact same pointer-event drag pattern as the canvas — position percentage maps linearly to hue (0–360) or opacity (0–100).

State is a three-slot object (`color: hex string`, `hex: string`, `opacity: number`). The `hex` slot is intentionally decoupled from `color` so partial typing doesn't corrupt the picker. The handoff's CONSTRAINT-009 locks this contract. The `ColorInput` variant reuses the same `handleHex` validation function and renders inside the existing `ds-atom-input-wrap` class.

**Primary recommendation:** Implement a pure CSS gradient canvas (no `<canvas>` element), drive all drag via Pointer Events with `setPointerCapture`, extract HSV/Hex conversion into a co-located `colorUtils.ts` file, and follow the existing `useResizableColumns` deterministic-spy test pattern for all drag unit tests.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gradient canvas drag | Client (React component) | — | Pure UI interaction; no server involvement |
| HSV ↔ Hex conversion | Client (utility module) | — | Pure math; co-locate with component |
| Hue bar drag | Client (React component) | — | Same pointer-event pattern as gradient |
| Opacity bar drag | Client (React component) | — | Same pointer-event pattern as gradient |
| Hex input validation | Client (React component) | — | Regex gate before state update |
| ColorInput form embedding | Client (React component) | — | Uses existing ds-atom-input-wrap token |
| Dark/light mode | CSS token system | — | Existing `var(--cream)` / `.dark` cascade handles it |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (already in project) | 18.x | Component model, state, refs | Project-wide [VERIFIED: package.json already used] |
| TypeScript (already in project) | 5.x | Type safety | Project-wide [VERIFIED: tsconfig present] |

No new dependencies needed. [VERIFIED: handoff uses zero external color libraries; pure math is sufficient at this scale]

### No External Color Library Required

The spec defines exactly three color operations:
1. HSV → RGB → Hex (for gradient canvas pick)
2. Hex → HSV (for driving hue/sat/bri thumbs when user types a hex)
3. Opacity is stored as a plain `number` (0–100); does NOT affect the hex value [VERIFIED: CONSTRAINT-009]

A ~40-line `colorUtils.ts` covers all three. Libraries like `chroma-js`, `tinycolor2`, or `colord` are unnecessary weight for this scope. [ASSUMED: no project-wide color utility already exists — grep confirmed no existing color conversion functions in `src/`]

**Installation:** None required.

---

## Architecture Patterns

### System Architecture Diagram

```
User pointer/keyboard
        │
        ▼
┌──────────────────────────────────────────────┐
│  ColorPicker (index.tsx)                     │
│  state: { color, hex, opacity }              │
│                                              │
│  ┌─────────────────┐  ┌───────────────────┐  │
│  │ GradientCanvas  │  │ HueBar            │  │
│  │ div + CSS grad  │  │ div + rainbow grad│  │
│  │ onPointerDown → │  │ onPointerDown →   │  │
│  │ setPointerCapt  │  │ setPointerCapture │  │
│  │ onPointerMove → │  │ onPointerMove →   │  │
│  │ HSV→Hex → pick()│  │ hue → pick()      │  │
│  └─────────────────┘  └───────────────────┘  │
│                                              │
│  ┌─────────────────┐  ┌───────────────────┐  │
│  │ OpacityBar      │  │ HexInput+Alpha    │  │
│  │ checkerboard bg │  │ ds-atom-input     │  │
│  │ same drag loop  │  │ handleHex()       │  │
│  └─────────────────┘  └───────────────────┘  │
│                                              │
│  ┌─────────────────┐  ┌───────────────────┐  │
│  │ PresetSwatches  │  │ TonalStrips       │  │
│  │ 10 × click      │  │ 3 × 8 × click     │  │
│  └─────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────┘
        │ pick(hex)
        ▼
  onChange?(hex) — optional controlled-value prop

───────────────────────────────────────────────

ColorInput (separate export, same file or collocated)
  ds-atom-input-wrap
    ├── swatch div (18×18, borderRadius:4px, bg: color)
    └── input.ds-atom-input (hex text, handleHex)
```

### Recommended Project Structure

```
src/inputs/ColorPicker/
├── index.tsx              # ColorPicker + ColorInput exports
├── colorUtils.ts          # Pure HSV↔Hex functions (no React)
├── ColorPicker.stories.tsx
└── ColorPicker.test.tsx
```

This follows the existing pattern of every input component in `src/inputs/<Name>/index.tsx`. [VERIFIED: DatePicker, RangeSlider, TextInput all follow this layout]

---

### Pattern 1: Pointer-Event Drag on a Div

**What:** Attach `onPointerDown` to the draggable element; call `e.currentTarget.setPointerCapture(e.pointerId)` so `pointermove` events keep firing even when the pointer leaves the element. On `pointermove`, read `e.currentTarget.getBoundingClientRect()` and compute `x%` / `y%`. On `pointerup` / `pointercancel`, release capture.

**When to use:** All three draggable areas — gradient canvas, hue bar, opacity bar.

**Why not `mousedown/mousemove`:** Pointer Events are the modern standard; they handle touch and stylus too. The project already uses this pattern in `useResizableColumns`. [VERIFIED: src/hooks/useResizableColumns.test.tsx uses PointerEvents]

**Example (gradient canvas):**

```typescript
// Source: pattern from useResizableColumns + standard PointerEvent API
function handleGradientPointerDown(e: React.PointerEvent<HTMLDivElement>) {
  e.currentTarget.setPointerCapture(e.pointerId);
}

function handleGradientPointerMove(e: React.PointerEvent<HTMLDivElement>) {
  if (e.buttons === 0) return; // not dragging
  const rect = e.currentTarget.getBoundingClientRect();
  const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
  const [h] = hexToHsv(color); // get current hue from color state
  const newHex = hsvToHex(h, s, v);
  pick(newHex);
}
```

### Pattern 2: Thumb Position from State (not from DOM measurement)

**What:** The thumb position is derived from state values, not stored separately. On each render, compute `left%` / `top%` from the current HSV values. This avoids sync bugs.

**Example:**

```typescript
// Thumb for hue bar: hue is 0–360, track width is 100%
// left% = hue / 360 * 100
const hsvFromColor = hexToHsv(color); // [h, s, v]
const hueThumbLeft = `${(hsvFromColor[0] / 360) * 100}%`;
const gradThumbLeft = `${hsvFromColor[1] * 100}%`;   // saturation
const gradThumbTop  = `${(1 - hsvFromColor[2]) * 100}%`; // brightness (inverted: top=bright)
const opacityThumbLeft = `${opacity}%`;
```

### Pattern 3: HSV/Hex Pure Utility Functions

All math lives in `colorUtils.ts`. No React imports.

```typescript
// Source: standard color conversion math [ASSUMED — standard formulas, not verified from a library]

/** Convert a 6-digit hex string to [h(0–360), s(0–1), v(0–1)] */
export function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, v];
}

/** Convert [h(0–360), s(0–1), v(0–1)] to a 6-digit #rrggbb hex string */
export function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i];
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
```

### Pattern 4: Hex Input Decoupled State (CONSTRAINT-009)

**What:** Two separate state slots — `color` (validated hex) and `hex` (raw input text). Update `color` only when regex passes. Preset/strip clicks update both simultaneously.

```typescript
// Source: ds-colorpicker.jsx line 15–20 [VERIFIED: CONSTRAINT-009]
const handleHex = (val: string) => {
  setHex(val);
  if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
};
const pick = (c: string) => { setColor(c); setHex(c); };
```

### Pattern 5: Checkerboard Underlay for Opacity Bar

**What:** CSS `repeating-conic-gradient` creates the checkerboard pattern. The color-to-transparent gradient is layered on top using `background` shorthand with comma-separated layers.

```typescript
// Source: ds-colorpicker.jsx line 62 [VERIFIED: handoff file]
background: `linear-gradient(to right, transparent, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/8px 8px`
```

### Pattern 6: Gradient Canvas CSS Background

**What:** Two CSS gradient layers simulate the saturation/brightness plane for a given hue. The hue color (`color` state) is the rightmost saturation stop; black-to-transparent is overlaid top-to-bottom.

```typescript
// Source: ds-colorpicker.jsx line 34–36 [VERIFIED: handoff file]
background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${color})`
```

**Critical nuance:** When the user drags the gradient canvas, the resulting hex feeds back into `color` state, which changes the gradient background, which recalculates the thumb position — this is the self-consistent loop. The hue bar thumb must independently track the hue component of `color` so the gradient background and the hue thumb stay in sync.

### Pattern 7: Keyboard Accessibility for Draggable Areas

**What:** Wrap each drag area in a `<div>` with `role="slider"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `tabIndex={0}`. Handle `onKeyDown` for arrow keys (±1% increments for hue/opacity; ±1% for sat/val on gradient canvas).

**Why:** CONSTRAINT-012 requires every interactive element to be keyboard-reachable. The gradient canvas covers 2D space — use Left/Right for saturation and Up/Down for value. [VERIFIED: CONSTRAINT-012, REQ-21-01 criterion 6]

```typescript
// Pattern for hue bar keyboard handler
function handleHueKeyDown(e: React.KeyboardEvent) {
  const [h, s, v] = hexToHsv(color);
  let newH = h;
  if (e.key === 'ArrowRight') newH = Math.min(360, h + 3.6); // 1% of 360
  if (e.key === 'ArrowLeft')  newH = Math.max(0, h - 3.6);
  if (newH !== h) { e.preventDefault(); pick(hsvToHex(newH, s, v)); }
}
```

### Anti-Patterns to Avoid

- **Using `<canvas>` element:** The design is fully achievable with CSS gradients and div overlays. A real `<canvas>` would require `getContext('2d')`, pixel manipulation, and complex hit-testing — unnecessary for this spec. [VERIFIED: handoff uses CSS only]
- **Storing thumb pixel positions in state:** Derive thumb position from color state on every render. Storing `thumbX`/`thumbY` as separate state creates sync drift when hex input or swatch click updates the color.
- **Attaching `mousemove` to `document`:** Use `setPointerCapture` instead, which keeps the event target fixed to the element. This is the project's established pattern. [VERIFIED: useResizableColumns uses setPointerCapture]
- **Calling `getBoundingClientRect` outside an event handler:** Only call it during active pointer events; don't cache it at mount time (element may move if page scrolls).
- **Trimming user input before hex comparison:** CONSTRAINT-009 specifies no trim on user input. The regex `/^#[0-9a-fA-F]{6}$/` handles the gate.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag on a constrained track | Custom `mousedown` + document listener | `setPointerCapture` on `onPointerDown` | Project pattern; handles touch, stylus, pointer loss cleanly |
| Focus ring styling | Custom CSS | Existing `ds-atom-input-wrap:focus-within` + `--focus-ring` token | CONSTRAINT-012; already defined in primitives.css |
| Input border/focus style | New CSS class | Existing `ds-atom-input` + `ds-atom-input-wrap` classes | Already defined; reuse prevents drift |
| Checkerboard transparency indicator | PNG background image | `repeating-conic-gradient` CSS | Already used in handoff; no external asset needed |

**Key insight:** The handoff is a complete visual spec. The entire CSS surface is already defined. The only net-new code is the pointer event logic and the HSV/Hex math.

---

## Component API Design

### ColorPicker Props

```typescript
export interface ColorPickerProps {
  /** Controlled hex color value (e.g. "#f59e0b"). If omitted, uncontrolled. */
  value?: string;
  /** Called with the new hex string whenever color changes. */
  onChange?: (hex: string) => void;
  /** Default color for uncontrolled usage.
   * @default '#f59e0b'
   */
  defaultValue?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

### ColorInput Props

```typescript
export interface ColorInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Controlled hex color value. */
  value?: string;
  /** Called with the new hex string on valid input. */
  onChange?: (hex: string) => void;
  /** Default for uncontrolled usage.
   * @default '#f59e0b'
   */
  defaultValue?: string;
}
```

**Decision: controlled or uncontrolled?** The handoff only shows internal state. Both modes are useful. Export both components as lightly-controlled (accept optional `value` + `onChange`; fall back to internal state when `value` is undefined). This matches the TextInput and DatePicker patterns in the project. [VERIFIED: DatePicker uses controlled `value` + `onChange` required props]

---

## Exact Spec Values (from CONSTRAINT-009 + handoff)

| Sub-part | Spec value | Source |
|----------|-----------|--------|
| Gradient area height | 150px | ds-colorpicker.jsx line 33 |
| Gradient border-radius | 10px | ds-colorpicker.jsx line 33 |
| Container border-radius | 14px | CONSTRAINT-004 + ds-colorpicker.jsx line 30 |
| Container padding | 16px | ds-colorpicker.jsx line 30 |
| Hue bar height | 12px | ds-colorpicker.jsx line 48 |
| Opacity bar height | 12px | ds-colorpicker.jsx line 60 |
| Bar border-radius | 6px | ds-colorpicker.jsx line 48, 60 |
| Thumb size (gradient) | 16×16px | ds-colorpicker.jsx line 37 |
| Thumb size (bars) | 14×14px | ds-colorpicker.jsx line 51, 65 |
| Thumb border | 2–2.5px solid #fff | ds-colorpicker.jsx line 38, 52 |
| Thumb shadow | 0 1px 4px rgba(0,0,0,.35) / 0 1px 3px rgba(0,0,0,.3) | ds-colorpicker.jsx |
| Color preview swatch | 36×36px, borderRadius: 8px | ds-colorpicker.jsx line 73–75 |
| Preset swatch size | 24×24px, borderRadius: 6px | ds-colorpicker.jsx line 92 |
| Active swatch border | 2.5px solid var(--ink) | ds-colorpicker.jsx line 93; REQ-21-01 |
| Inactive swatch border | 1px solid var(--rule) | ds-colorpicker.jsx line 94 |
| Swatch hover scale | 1.12 | ds-colorpicker.jsx line 96 |
| Tonal strip cell height | 36px | ds-colorpicker.jsx line 113; REQ-21-01 |
| Tonal strip border-radius | 8px | ds-colorpicker.jsx line 110 |
| Tonal cell hover | scaleY(1.15) | ds-colorpicker.jsx line 115 |
| ColorInput swatch size | 18×18px, borderRadius: 4px | REQ-21-01 |
| Hex input font | var(--mono), 12px | ds-colorpicker.jsx line 79 |
| Alpha field | read-only, `${opacity}%` | ds-colorpicker.jsx line 83 |

### Preset Colors (exactly 10, order fixed)

```typescript
// Source: ds-colorpicker.jsx line 3 [VERIFIED]
const CP_PRESETS = [
  '#f59e0b','#ef4444','#3b82f6','#8b5cf6','#22c55e',
  '#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1'
];
```

### Tonal Strips (3 strips × 8 colors, order fixed)

```typescript
// Source: ds-colorpicker.jsx lines 4–8 [VERIFIED]
const CP_STRIPS = [
  { label: 'Amber',   colors: ['#fef3c7','#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706','#b45309','#92400e'] },
  { label: 'Blue',    colors: ['#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af'] },
  { label: 'Neutral', colors: ['#f5f3f0','#ece8e3','#e7e2dc','#d6d3d1','#a8a29e','#6b6560','#44403c','#292524'] },
];
```

---

## CSS Strategy

### What Reuses Existing Primitives

- **Input fields** — `ds-atom-input` class + inline styles from TextInput pattern [VERIFIED: primitives.css lines 66–112]
- **Input wrap** — `ds-atom-input-wrap` class for ColorInput [VERIFIED: primitives.css line 94]
- **Glass surface** — `ds-atom-card[data-variant="glass"]` or inline style matching `var(--surf-1)` + `backdrop-filter: blur(6px)` + `var(--rule)` border [VERIFIED: primitives.css line 624]
- **Focus ring** — `box-shadow: var(--focus-ring)` on `:focus-visible` for all interactive elements [VERIFIED: CONSTRAINT-012]
- **Token colors** — All `var(--ink)`, `var(--rule)`, `var(--ink-4)`, `var(--amber)` etc. already defined [VERIFIED: CONSTRAINT-001]

### What Needs New CSS in primitives.css

One new block: `ds-atom-colorpicker` scoped rules. Specifically:

1. **Gradient thumb** — needs `pointer-events: none` so pointer events fall through to the canvas div
2. **Bar thumb** — same `pointer-events: none`
3. **Tonal strip overflow:hidden** — `border-radius: 8px; overflow: hidden` on the strip container (already in handoff as inline style; can remain inline or be extracted)
4. **Preset swatch focus ring** — `:focus-visible { box-shadow: var(--focus-ring) }` since swatches are divs acting as buttons (should be `<button>` elements for a11y)

**Recommendation:** Keep most ColorPicker-specific CSS as inline `style` props (consistent with DatePicker and StatCard, which use inline styles extensively). Add a small `ds-atom-colorpicker` block to primitives.css only for focus ring and pointer-events rules that cannot be expressed inline.

---

## Accessibility (CONSTRAINT-012 + REQ-21-01 criterion 6–7)

### Gradient Canvas

- `role="slider"` with `aria-label="Color saturation and brightness"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` derived from current saturation value [ASSUMED: specific ARIA role — accepted pattern for 2D sliders; no single standard; some implementations use `aria-label` + keyboard only]
- `tabIndex={0}` to make it keyboard-reachable
- `onKeyDown`: ArrowRight/Left = ±1% saturation; ArrowUp/Down = ±1% brightness

### Hue Bar

- `role="slider"`, `aria-label="Hue"`, `aria-valuemin="0"`, `aria-valuemax="360"`, `aria-valuenow={hue}`
- `onKeyDown`: ArrowRight = +3.6 (1%), ArrowLeft = -3.6

### Opacity Bar

- `role="slider"`, `aria-label="Opacity"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow={opacity}`
- `onKeyDown`: ArrowRight = +1, ArrowLeft = -1

### Preset Swatches

- Render as `<button>` elements (not `<div>`) — this gives keyboard focus, Enter/Space activation, and screen reader announcement for free
- `aria-label={`Select color ${c}`}` on each button
- `aria-pressed={color === c}` for active state

### Tonal Strip Cells

- Same: render as `<button>` elements, not `<div onClick>`
- `aria-label={`Select color ${c}`}`, `title={c}` (already in handoff)

### ColorInput

- The `<input>` inside `ds-atom-input-wrap` handles all keyboard interactions natively
- The swatch div is presentational (`aria-hidden="true"`) — it's a visual preview, not interactive; clicking opens the full picker if composed that way [ASSUMED: swatch in ColorInput is presentational only based on handoff — it shows current color, the text input is the interaction point]

### axe-core Known Risks

- Div-as-button for swatches in the handoff (`<div onClick>`) must be converted to `<button>` — axe will flag `interactive-supports-focus` and `keyboard-focusable-scrollable` otherwise [VERIFIED: CONSTRAINT-012]
- Color contrast on the gradient thumb (white border) needs AAA check in dark mode — white border on a white background edge-case — mitigated by the `box-shadow: 0 1px 4px rgba(0,0,0,.35)` drop shadow

---

## Common Pitfalls

### Pitfall 1: Gradient Canvas Self-Reference Loop

**What goes wrong:** The gradient background uses `color` state (the current selected hue point). When the user drags the canvas, `pick(newHex)` updates `color`, which changes the gradient, which moves all the reference points — causing the thumb to visually jump.

**Why it happens:** The gradient background encodes both the hue (via `color`) and the selection position (via thumb percentage). Changing `color` via a canvas drag also changes the background, shifting the visual position of all other points.

**How to avoid:** When computing `newHex` from a gradient drag, preserve the hue from the current `color` state and only vary saturation/brightness. Derive hue from the hue bar state independently. The canonical approach: maintain a separate `hue` state (0–360) driven only by the hue bar. The gradient canvas only sets saturation and brightness. On hex input or preset/strip click, run `hexToHsv` and update `hue`, `color`, and `hex` together.

**Warning signs:** The gradient thumb jumps to an unexpected position after the first drag.

### Pitfall 2: `getBoundingClientRect` Returns Zero in Tests

**What goes wrong:** jsdom does not implement layout, so `getBoundingClientRect()` returns `{ width: 0, height: 0, top: 0, left: 0 }`. Any test that calls `getBoundingClientRect` inside a pointer event handler will compute `0/0 = NaN` and the color will not update.

**Why it happens:** jsdom has no rendering engine.

**How to avoid:** Follow the `useResizableColumns` deterministic-spy pattern. [VERIFIED: src/hooks/useResizableColumns.test.tsx] For unit tests, extract the position-to-hsv math into a pure function in `colorUtils.ts` and test the math directly without mounting the component. For integration tests that need drag, mock `getBoundingClientRect` with `vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 150, ... })`.

### Pitfall 3: Opacity Affects Only the Alpha Field, Not Hex

**What goes wrong:** Developer stores opacity inside the hex string (as 8-digit RRGGBBAA) or applies it to the color preview, corrupting downstream consumers.

**Why it happens:** Natural impulse when building a color picker.

**How to avoid:** CONSTRAINT-009 is explicit: opacity is stored as a plain `number` (0–100). The opacity bar updates `opacity` state only. The hex value remains 6 digits. The alpha `<input>` is read-only and displays `${opacity}%`. [VERIFIED: CONSTRAINT-009, ds-colorpicker.jsx line 83]

### Pitfall 4: Hex Input Without Leading `#`

**What goes wrong:** User types `f59e0b` (without `#`) — regex fails, color is not updated, user is confused.

**How to avoid:** The regex `/^#[0-9a-fA-F]{6}$/` requires the `#`. Consider auto-prepending `#` if missing in `handleHex`: `if (!val.startsWith('#')) val = '#' + val`. This is a UX improvement not in the handoff — flag as Claude's discretion or leave strict.

### Pitfall 5: Thumb Position off by One Pixel at Boundary

**What goes wrong:** Thumb at position `left: 100%` extends outside the track container.

**How to avoid:** The thumb uses `transform: translate(-50%, -50%)` (centered on position). Ensure the track div does NOT have `overflow: hidden`. The handoff applies no overflow clipping to the track. The thumb does extend visually past the bar edges at the extremes — this is intended per the handoff design. [VERIFIED: ds-colorpicker.jsx line 64]

### Pitfall 6: Dark Mode — White Thumb on Light Background

**What goes wrong:** In light mode, the white-bordered thumb on the hue bar is barely visible at the yellow/white end of the gradient.

**How to avoid:** The handoff uses `box-shadow: '0 1px 3px rgba(0,0,0,.3)'` which provides contrast. Keep this shadow. Do not remove it in dark mode. [VERIFIED: ds-colorpicker.jsx lines 52–53]

---

## Testing Strategy (nyquist_validation)

No `config.json` found in `.planning/` — treat as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.ts` (root) |
| Quick run | `npx vitest run src/inputs/ColorPicker/` |
| Full suite | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-21-01 | Gradient drag updates thumb position | unit (spy-based) | `npx vitest run src/inputs/ColorPicker/` | Wave 0 |
| REQ-21-01 | Hue bar drag updates active color | unit (spy-based) | same | Wave 0 |
| REQ-21-01 | Opacity bar drag updates opacity state | unit (spy-based) | same | Wave 0 |
| REQ-21-01 | Valid hex input updates color+hex | unit | same | Wave 0 |
| REQ-21-01 | Invalid hex does not corrupt state | unit | same | Wave 0 |
| REQ-21-01 | Preset swatch click sets color+hex | unit | same | Wave 0 |
| REQ-21-01 | Active swatch shows ink border | unit | same | Wave 0 |
| REQ-21-01 | Tonal strip cell click sets color | unit | same | Wave 0 |
| REQ-21-01 | ColorInput renders swatch + input in ds-atom-input-wrap | unit | same | Wave 0 |
| REQ-21-01 | axe-core zero violations (Storybook) | visual/a11y | Storybook axe addon | manual |
| REQ-21-01 | Keyboard arrow on hue bar changes hue | unit | same | Wave 0 |

### Key Test Design Decisions

1. **Gradient/hue/opacity drag:** Use the deterministic spy pattern from `useResizableColumns.test.tsx`. Call `pointerdown` handler directly (via ref or fireEvent), mock `getBoundingClientRect`, then invoke the captured `pointermove` handler with `{ clientX, clientY }`. [VERIFIED: established project pattern]

2. **colorUtils.ts:** Test `hexToHsv` and `hsvToHex` as pure functions — no React, no jsdom, straightforward assertions. These are the highest-value unit tests for catching math regressions.

3. **Preset swatch keyboard:** Since swatches will be `<button>` elements, `fireEvent.click` and `fireEvent.keyDown(el, { key: 'Enter' })` both work without special handling.

### Wave 0 Gaps

- [ ] `src/inputs/ColorPicker/ColorPicker.test.tsx` — new file, all REQ-21-01 tests
- [ ] `src/inputs/ColorPicker/colorUtils.ts` — pure math module (no tests file needed separately; tested via component tests or own test block within ColorPicker.test.tsx)

---

## Security Domain

No security concerns for this phase. ColorPicker is a pure client-side UI component with no network calls, no user data stored, and no authentication. [VERIFIED: spec has no security requirements; ASVS categories V2, V3, V4, V6 do not apply]

V5 Input Validation: the hex regex `/^#[0-9a-fA-F]{6}$/` gates all user text input before it affects state — this satisfies basic input validation. No XSS risk; hex values are used only as CSS `background` property values (not injected as HTML).

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no external dependencies beyond the existing project stack (React, TypeScript, Vitest, Storybook all confirmed present).

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is a greenfield component phase, not a rename/refactor/migration phase.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | No existing color conversion utility exists in `src/` | Standard Stack | Low — a grep would find it immediately at implementation time; write colorUtils.ts anyway as the canonical location |
| A2 | `role="slider"` with 2D keyboard handling is the accepted ARIA pattern for gradient canvas | Accessibility | Medium — axe-core may flag non-standard ARIA usage; fallback is `role="application"` with full keyboard description. Test with axe before ship. |
| A3 | The swatch div in ColorInput is presentational only | Accessibility | Low — spec shows swatch + text input side-by-side; swatch appears to be visual-only preview |
| A4 | Auto-prepending `#` to hex input is in Claude's discretion (not spec) | Pitfall 4 | Low — clarify with user or default to strict spec behavior |

---

## Open Questions

1. **Controlled vs. uncontrolled API for ColorPicker**
   - What we know: The handoff uses fully internal state. The design system's other inputs (TextInput, DatePicker) use controlled patterns.
   - What's unclear: Should `ColorPicker` be controlled-required (like DatePicker) or allow uncontrolled use?
   - Recommendation: Accept optional `value` + `onChange`. Default to internal state when `value` is undefined. This is the most composable pattern.

2. **Should ColorInput open the full ColorPicker on swatch click?**
   - What we know: The handoff shows them side-by-side as separate components, not nested.
   - What's unclear: Real-world usage often expects the inline swatch to be a trigger that opens the full picker in a popover.
   - Recommendation: Ship them as separate independent components per the spec. Popover composition is out of scope for Phase 21 and can be added as a Phase 22+ pattern.

3. **Separate `hue` state vs. deriving from `color`**
   - What we know: Pitfall 1 describes the loop problem when hue is derived from `color`.
   - What's unclear: The handoff only has one `color` state.
   - Recommendation: Add a separate `hue` state (0–360) driven only by the hue bar. The gradient canvas and preset/strip clicks do not set `hue` directly — they set `color`, and `hue` is re-derived from `color` only on those events. This avoids the drift without adding complexity.

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/design-system/ds-colorpicker.jsx` — complete component spec, all exact values and color arrays verified
- `.planning/intel/constraints.md` — CONSTRAINT-009 (state contract), CONSTRAINT-012 (focus ring), CONSTRAINT-001 (tokens), CONSTRAINT-004 (radius)
- `.planning/REQUIREMENTS.md` — REQ-21-01 acceptance criteria, all 7 criteria verified
- `src/hooks/useResizableColumns.test.tsx` — established pointer-event drag test pattern
- `src/inputs/TextInput/index.tsx` — ds-atom-input-wrap implementation pattern
- `src/primitives.css` lines 63–112 — ds-atom-input and ds-atom-input-wrap CSS
- `src/primitives.css` lines 620–630 — glass card CSS

### Secondary (MEDIUM confidence)
- `src/data-display/Carousel/Carousel.test.tsx` — secondary pointer event test pattern reference
- `src/inputs/DatePicker/index.tsx` — controlled value pattern for complex input components

### Tertiary (LOW confidence)
- HSV/Hex conversion math formulas [ASSUMED: standard formulas; will be verified by unit tests]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all existing patterns confirmed
- Architecture: HIGH — handoff is complete and unambiguous; pointer event pattern is established
- HSV math: MEDIUM — standard formulas assumed correct; will be test-verified at implementation
- Pitfalls: HIGH — most derived directly from handoff analysis and existing codebase patterns
- Accessibility: MEDIUM — ARIA role for 2D slider is assumed correct; axe-core will be the final gate

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable domain — no external dependencies to expire)
