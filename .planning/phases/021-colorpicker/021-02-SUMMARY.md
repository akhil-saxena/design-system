---
phase: 021-colorpicker
plan: 02
subsystem: inputs
tags: [colorpicker, react, pointer-events, hsv, controlled-input, a11y]
dependency_graph:
  requires:
    - "021-01 — colorUtils.ts (hexToHsv, hsvToHex) + ds-atom-colorpicker CSS"
  provides:
    - "ColorPicker — full picker panel (canvas + hue + opacity + hex + alpha + presets + tonal strips)"
    - "ColorPickerProps interface — value, onChange, defaultValue, presets, className, style"
  affects:
    - "src/index.ts (021-04 will barrel-export ColorPicker + ColorPickerProps)"
tech_stack:
  added: []
  patterns:
    - "Pointer-event drag with setPointerCapture + document pointermove/pointerup listeners (matches useResizableColumns)"
    - "Three-slot decoupled state — `color` (validated) / `hex` (raw input) / `hue` (independent, prevents gradient self-reference loop per RESEARCH Pitfall 1)"
    - "useEffect controlled-value sync — does NOT touch hue (preserves user drag position)"
    - "<button>-rendered swatches and tonal cells with aria-label + aria-pressed for keyboard reachability"
    - "role=\"slider\" + tabIndex=0 on canvas, hue bar, opacity bar (CONSTRAINT-012)"
key_files:
  created:
    - src/inputs/ColorPicker/index.tsx
    - src/inputs/ColorPicker/ColorPicker.test.tsx
  modified: []
decisions:
  - "Used a function declaration `export function ColorPicker(...)` instead of `forwardRef` — none of the 13 spec'd tests depend on a ref handle; matches the plan's exact code template; can be wrapped in forwardRef later if a downstream consumer needs it"
  - "Added aria-pressed to swatches and cells (not in plan's snippet but called out in PATTERNS — Rule 2 a11y improvement, makes selection state announceable)"
  - "Added aria-label to hex and alpha inputs (plan's snippet only had a <label> sibling — but those <label>s are not connected via htmlFor, so screen readers needed an aria-label on the input itself; Rule 2)"
  - "Used Number.parseInt instead of parseInt in colorUtils for biome lint compliance (existing project style)"
metrics:
  duration: "~15m"
  completed: "2026-05-05"
---

# Phase 21 Plan 2: ColorPicker Component

The full ColorPicker panel — gradient saturation/value canvas, hue bar, opacity bar, hex/alpha row, 10 preset swatches, and 3 tonal strips — implemented as a single React component with three-slot decoupled state and pointer-event drag. 13 unit tests cover all interaction paths.

## What was built

- **`src/inputs/ColorPicker/index.tsx`** — `ColorPicker` named export plus `ColorPickerProps` interface (value, onChange, defaultValue, presets, className, style). Internally tracks `color`, `hex`, `hue`, and `opacity` as four separate state slots so partial typing in the hex field cannot corrupt the canvas, and so the gradient does not feed back on itself when the user drags it.
- **`src/inputs/ColorPicker/ColorPicker.test.tsx`** — 13 vitest cases:
  1. Renders root with `.ds-atom-colorpicker` class
  2. 10 preset swatches rendered
  3. 24 tonal cells (3 strips × 8) rendered
  4. Preset click fires `onChange` with hex
  5. Tonal cell click fires `onChange` with hex
  6. Hex input shows current color
  7. Partial hex (5 chars) does NOT call `onChange`
  8. Valid hex updates color via `onChange`
  9. Alpha input shows `100%` and is `readOnly`
  10. Active preset shows `2.5px solid var(--ink)` border
  11. Gradient canvas has `role="slider"` and `tabIndex="0"`
  12. Three `role="slider"` elements (canvas + hue + opacity)
  13. Controlled rerender propagates the new selection ring

## Tasks completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Failing test for ColorPicker | 0c5a902 | src/inputs/ColorPicker/ColorPicker.test.tsx |
| 1 (GREEN) | Implement ColorPicker component | 546562e | src/inputs/ColorPicker/index.tsx |

## Verification

- `npx vitest run src/inputs/ColorPicker/ColorPicker.test.tsx` — **13/13 pass**.
- `npx tsc --noEmit` — **exit 0**.
- `grep -c "ds-atom-colorpicker" src/inputs/ColorPicker/index.tsx` — **9** (≥5 required).
- `grep -c 'role="slider"' src/inputs/ColorPicker/index.tsx` — **3** (≥3 required).
- `grep -c "<button" src/inputs/ColorPicker/index.tsx` — **2** (≥2 required).

## Deviations from Plan

### Auto-added (Rule 2 — a11y critical functionality)

**1. aria-pressed on preset swatches and tonal cells**
- **Issue:** Plan's snippet rendered swatches and cells as `<button>` elements with `aria-label` only. Without `aria-pressed`, screen readers cannot announce which preset is currently selected.
- **Fix:** Added `aria-pressed={color === c}` on every preset swatch and tonal cell button.
- **Why:** Pattern map (021-PATTERNS.md) explicitly calls for this on swatch buttons; CONSTRAINT-012 requires keyboard reachability AND state announcement. Selection state is a correctness requirement for an accessible color picker.
- **Commit:** 546562e.

**2. aria-label on hex and alpha inputs**
- **Issue:** Plan's snippet rendered `<label>` siblings for "HEX" and "ALPHA" but did not connect them via `htmlFor` / `id`. Screen readers therefore announced the inputs as unlabeled.
- **Fix:** Added `aria-label="Hex color"` on the hex input and `aria-label="Alpha opacity"` on the alpha input.
- **Why:** Rule 2 — basic input accessibility is a correctness requirement. Re-labeling is no-cost.
- **Commit:** 546562e.

### Stylistic adjustments (not deviations)

- Used `function ColorPicker(...) { ... }` instead of `forwardRef` — none of the 13 specified tests need a ref. The plan's full code snippet uses the function form too. (forwardRef can be retrofitted in a follow-up if a consumer needs a ref handle on the root div.)
- Used `Number.parseInt` (already done in colorUtils.ts) — matches biome / TS strict project style.

## Self-Check: PASSED

- `src/inputs/ColorPicker/index.tsx` — FOUND.
- `src/inputs/ColorPicker/ColorPicker.test.tsx` — FOUND.
- Commit `0c5a902` (RED) — FOUND.
- Commit `546562e` (GREEN) — FOUND.
- 13 tests pass against current source.
