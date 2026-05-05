---
phase: 021-colorpicker
plan: 01
subsystem: inputs
tags: [color, hsv, hex, primitives-css, foundation]
dependency_graph:
  requires:
    - "020 — primitives.css base tokens (var(--focus-ring), var(--rule), var(--ink))"
  provides:
    - "hexToHsv / hsvToHex — pure HSV ↔ Hex math used by ColorPicker drag handlers"
    - "ds-atom-colorpicker-thumb / -canvas / -huebar / -opacitybar / -swatch / -cell CSS"
  affects:
    - src/inputs/ColorPicker/* (Wave 2 plans 021-02 and 021-03 import from this foundation)
tech_stack:
  added: []
  patterns:
    - "Pure-function utility module (no React, no DOM) — co-located with component"
    - "Scoped ds-atom-* CSS block appended to primitives.css (matches DatePicker, RangeSlider precedent)"
key_files:
  created:
    - src/inputs/ColorPicker/colorUtils.ts
    - src/inputs/ColorPicker/colorUtils.test.ts
  modified:
    - src/primitives.css
decisions:
  - "Test colorUtils in a sibling colorUtils.test.ts (not inside ColorPicker.test.tsx) — keeps unit math tests separate from component-render tests"
  - "Defensive fallback in hsvToHex when table[i] is undefined — TypeScript noUncheckedIndexedAccess requires the guard even though valid input cannot trigger it"
  - "Tabs (not spaces) in colorUtils files to match the project's existing TS style (DatePicker / TextInput use tab indent)"
metrics:
  duration: "~10m"
  completed: "2026-05-05"
---

# Phase 21 Plan 1: ColorPicker Foundation — colorUtils + primitives.css

Pure HSV ↔ Hex math (no React, no DOM) plus the ds-atom-colorpicker CSS scope, both validated and ready for the Wave 2 ColorPicker / ColorInput components to import.

## What was built

- **`src/inputs/ColorPicker/colorUtils.ts`** — two named exports:
  - `hexToHsv(hex: string): [number, number, number]` — splits a 6-digit `#rrggbb` into HSV with `h ∈ [0,360]`, `s ∈ [0,1]`, `v ∈ [0,1]`.
  - `hsvToHex(h, s, v): string` — converts HSV back to a lowercase 6-digit `#rrggbb` string, always 7 chars including the leading `#`.
- **`src/inputs/ColorPicker/colorUtils.test.ts`** — 15 vitest cases covering HSV white/black corners, RGB primaries, lowercase output format, amber `#f59e0b` characteristics, and round-trip identity (`hsvToHex(...hexToHsv(c)) === c`) for amber, dodger-blue, and red-500.
- **`src/primitives.css`** — appended a `/* ─── DS atom: ColorPicker ─── */` block at the end of the file:
  - `.ds-atom-colorpicker-thumb` — `pointer-events: none; position: absolute; transform: translate(-50%, -50%);` so thumbs do not intercept pointer events on the gradient canvas / hue bar / opacity bar.
  - `:focus-visible` rule on `.ds-atom-colorpicker-canvas`, `.ds-atom-colorpicker-huebar`, `.ds-atom-colorpicker-opacitybar` — applies `var(--focus-ring)` for keyboard-draggable accessibility.
  - Button-reset + transition + focus ring on `.ds-atom-colorpicker-swatch` and `.ds-atom-colorpicker-cell`.

## Tasks completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | colorUtils.ts — hexToHsv + hsvToHex pure functions (TDD) | a93d3d0 | src/inputs/ColorPicker/colorUtils.ts, colorUtils.test.ts |
| 2 | Append ds-atom-colorpicker block to primitives.css | c966827 | src/primitives.css |

## Verification

- `npx vitest run src/inputs/ColorPicker/` — **15/15 pass** (corners, primaries, lowercase 7-char output, three round-trips).
- `grep -c "ds-atom-colorpicker-thumb" src/primitives.css` — **1**.
- `npx tsc --noEmit` — **exit 0** (no new type errors).
- File length check: `src/primitives.css` 4775 → 4813 lines (+38; matches the appended block size of one comment + four CSS rules).

## Deviations from Plan

None — plan executed exactly as written. The plan referenced `.ds-atom-pagination-count { }` as the expected previous last block in primitives.css, but in this worktree the file ended with `.dark .ds-atom-sortable-item { /* tokens flip automatically */ }`. The plan's instruction was "append at the very end" — done as instructed; no existing rules modified.

## Self-Check: PASSED

- `src/inputs/ColorPicker/colorUtils.ts` — FOUND.
- `src/inputs/ColorPicker/colorUtils.test.ts` — FOUND.
- `src/primitives.css` — modified, contains `ds-atom-colorpicker-thumb`.
- Commit `a93d3d0` — FOUND on branch.
- Commit `c966827` — FOUND on branch.
