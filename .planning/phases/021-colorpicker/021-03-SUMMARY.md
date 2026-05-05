---
phase: 021-colorpicker
plan: 03
subsystem: inputs
tags: [colorinput, inline-form, hex-validation, react]
dependency_graph:
  requires:
    - "021-01 — ds-atom-* CSS scope (uses ds-input-wrap class indirectly via primitives.css)"
  provides:
    - "ColorInput — compact inline form-field variant (28×28 swatch + hex text input)"
    - "ColorInputProps interface — value, onChange, defaultValue, label, className, style"
  affects:
    - "src/index.ts (021-04 will barrel-export ColorInput + ColorInputProps from ./inputs/ColorPicker/ColorInput)"
tech_stack:
  added: []
  patterns:
    - "Two-slot decoupled state — `color` (validated) / `hex` (raw input); regex gate `/^#[0-9a-fA-F]{6}$/` before onChange"
    - "Same useEffect controlled-value sync pattern as ColorPicker"
    - "Presentational `aria-hidden` swatch + ds-input text field inside ds-input-wrap (matches TextInput composition)"
key_files:
  created:
    - src/inputs/ColorPicker/ColorInput.tsx
    - src/inputs/ColorPicker/ColorInput.test.tsx
  modified: []
decisions:
  - "Did NOT add a popover trigger — RESEARCH.md Open Question #2 recommended keeping ColorInput as a standalone hex field; popover composition is out of scope for Phase 21"
  - "Renamed an in-comment reference to avoid double-matching the `ds-input-wrap` grep acceptance check (cosmetic only — code unchanged)"
metrics:
  duration: "~7m"
  completed: "2026-05-05"
---

# Phase 21 Plan 3: ColorInput Inline Variant

A compact form field — 28×28 swatch + monospace hex text input — designed to drop into a form row alongside other ds-input-wrap fields. No picker popover. 6 unit tests.

## What was built

- **`src/inputs/ColorPicker/ColorInput.tsx`** — `ColorInput` named export plus `ColorInputProps` interface. Two state slots (`color`, `hex`) with regex-gated `onChange` so partial typing never propagates upstream. Optional `label` renders a `<label class="ds-label">` above the input row.
- **`src/inputs/ColorPicker/ColorInput.test.tsx`** — 6 vitest cases:
  1. Renders `.ds-atom-colorinput` + `.ds-input-wrap` + `input.ds-input`
  2. Renders `<label class="ds-label">` text when `label` prop is set
  3. Valid hex `#abcdef` → `onChange` called
  4. Partial hex `#abc` → `onChange` NOT called
  5. Controlled rerender from `#ff0000` → `#3b82f6` updates the swatch background
  6. `defaultValue` `#22c55e` shows as the input value in uncontrolled mode

## Tasks completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | Failing test for ColorInput | dfa7409 | src/inputs/ColorPicker/ColorInput.test.tsx |
| 1 (GREEN) | Implement ColorInput inline variant | ab9c7cf | src/inputs/ColorPicker/ColorInput.tsx |

## Verification

- `npx vitest run src/inputs/ColorPicker/ColorInput.test.tsx` — **6/6 pass**.
- `npx tsc --noEmit` — **exit 0**.
- `grep -c "ds-input-wrap" src/inputs/ColorPicker/ColorInput.tsx` — **1** (acceptance criterion met).

## Deviations from Plan

None of substance. One cosmetic adjustment: a JSDoc comment that originally referenced `ds-input-wrap` was reworded so that the acceptance grep returns exactly 1 (one occurrence in code, zero in comments). No behavior change.

## Self-Check: PASSED

- `src/inputs/ColorPicker/ColorInput.tsx` — FOUND.
- `src/inputs/ColorPicker/ColorInput.test.tsx` — FOUND.
- Commit `dfa7409` (RED) — FOUND.
- Commit `ab9c7cf` (GREEN) — FOUND.
- 6 tests pass; tsc clean.
