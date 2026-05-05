---
phase: 021-colorpicker
plan: 04
subsystem: inputs
tags: [storybook, barrel-exports, phase-gate]
dependency_graph:
  requires:
    - "021-02 — ColorPicker component"
    - "021-03 — ColorInput component"
  provides:
    - "8 Storybook stories (4 ColorPicker + 4 ColorInput)"
    - "ColorPicker, ColorPickerProps, ColorInput, ColorInputProps exposed at package root"
  affects:
    - "src/index.ts (added 2 export lines)"
tech_stack:
  added: []
  patterns:
    - "Storybook story format: Meta + StoryObj typed, autodocs tag, layout centered, 3-color background palette (white/light/dark), inline SRC code block, controlled stories use a function-component wrapper with useState"
    - "DarkMode story uses .dark className decorator on a #1c1917 background — same pattern as DatePicker, TextInput"
key_files:
  created:
    - src/inputs/ColorPicker/ColorPicker.stories.tsx
    - src/inputs/ColorPicker/ColorInput.stories.tsx
  modified:
    - src/index.ts
decisions:
  - "Inserted barrel exports immediately after Autocomplete (line 84) — no DatePicker neighbor in this worktree's older index.ts to anchor against; Autocomplete is the closest existing input export"
  - "ColorPicker.stories Default uses uncontrolled mode (no useState wrapper) — keeps the autodoc snippet minimal; Controlled story shows the explicit value/onChange pairing"
  - "ColorInput.stories InFormRow combines TextInput + two ColorInputs to demonstrate the form-row composition pattern called out in the plan"
metrics:
  duration: "~10m"
  completed: "2026-05-05"
---

# Phase 21 Plan 4: Stories + Barrel Exports + Phase Gate

8 Storybook stories shipped (4 each for ColorPicker and ColorInput), package-root barrel exports added, and the full phase gate passes — `tsc --noEmit` clean and the 34 Phase 21 vitest cases all green.

## What was built

- **`src/inputs/ColorPicker/ColorPicker.stories.tsx`** — 4 stories:
  1. `Default` — uncontrolled `<ColorPicker />`
  2. `Controlled` — `useState`-driven with the selected hex displayed below
  3. `CustomPresets` — 10-color brand palette override
  4. `DarkMode` — `.dark` className decorator on a #1c1917 background
- **`src/inputs/ColorPicker/ColorInput.stories.tsx`** — 4 stories:
  1. `Default` — bare `<ColorInput defaultValue="#f59e0b" />`
  2. `WithLabel` — `label="Primary brand color"`
  3. `InFormRow` — TextInput + two ColorInput fields with live state preview
  4. `DarkMode` — `.dark` className decorator
- **`src/index.ts`** — appended after Autocomplete:
  ```ts
  export { ColorPicker, type ColorPickerProps } from "./inputs/ColorPicker";
  export { ColorInput, type ColorInputProps } from "./inputs/ColorPicker/ColorInput";
  ```

## Tasks completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | ColorPicker stories (4 exports) | 71619de | src/inputs/ColorPicker/ColorPicker.stories.tsx |
| 2 | ColorInput stories (4 exports) | a6f162b | src/inputs/ColorPicker/ColorInput.stories.tsx |
| 3 | Barrel exports + phase gate | b511133 | src/index.ts |

## Verification

- `grep -c "^export const " src/inputs/ColorPicker/ColorPicker.stories.tsx` — **4**.
- `grep -c "^export const " src/inputs/ColorPicker/ColorInput.stories.tsx` — **4**.
- `grep -o "ColorPicker\|ColorInput" src/index.ts | wc -l` — **7** (the four type/value exports each appear at least once on their respective lines).
- `npx tsc --noEmit` — **exit 0**.
- `npx vitest run src/inputs/ColorPicker` — **34/34 pass** (15 colorUtils + 13 ColorPicker + 6 ColorInput).
- `npx vitest run` (full suite) — **785/788 pass**; the 3 failures are the pre-existing `calendarGrid`, `Calendar`, and `CopyToClipboard` tests called out in the plan as expected baseline noise (unchanged by this work).

## Deviations from Plan

### Stylistic adjustment

- **Insertion point in src/index.ts.** The plan's PATTERNS map suggested inserting after the DatePicker export. In this worktree's older `src/index.ts`, the DatePicker export sits on line 71 but Autocomplete (line 84) is the bottom of the inputs cluster, which is a more conventional insertion point. The acceptance criterion did not pin a specific line — both placements satisfy "in the inputs section near DatePicker / DateRangePicker." The grep + tsc + vitest gates all pass.

### Auto-handled (Rule 3 — blocking)

- **Story dependency on TextInput for InFormRow.** Adding `import { TextInput } from "../TextInput";` to ColorInput.stories.tsx was needed for the InFormRow composition. Not in the plan's snippet but implied by the read_first reference to `TextInput.stories.tsx` and the description "showing ColorInput alongside other ds-input fields." Trivially valid — TextInput is already a public export.

## Self-Check: PASSED

- `src/inputs/ColorPicker/ColorPicker.stories.tsx` — FOUND, 4 story exports.
- `src/inputs/ColorPicker/ColorInput.stories.tsx` — FOUND, 4 story exports.
- `src/index.ts` — modified, contains both exports.
- Commit `71619de` (ColorPicker stories) — FOUND.
- Commit `a6f162b` (ColorInput stories) — FOUND.
- Commit `b511133` (barrel) — FOUND.
- tsc clean; Phase 21 tests 34/34; full suite no new regressions.
