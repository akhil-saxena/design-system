---
phase: 018-confirmdialog
plan: "02"
subsystem: overlays
tags: [confirm-dialog, type-to-confirm, overlay, portal, focus-trap, keyboard, tones]
dependency_graph:
  requires:
    - "018-01"  # ConfirmDialog namespace cleared from Modal
    - "src/_internals/DSPortal"
    - "src/hooks/useFocusTrap"
    - "src/inputs/Button"
    - "src/inputs/TextInput"
    - "src/inputs/Kbd"
  provides:
    - "src/overlays/ConfirmDialog/index.tsx"
    - "src/overlays/ConfirmDialog/ConfirmDialog.test.tsx"
  affects:
    - "src/index.ts"  # new barrel exports
    - "src/overlays/Modal/Modal.test.tsx"  # old ConfirmDialog tests removed
tech_stack:
  added: []
  patterns:
    - "DSPortal + useFocusTrap callback-ref (useState, not useRef)"
    - "document.addEventListener keydown in useEffect with cleanup"
    - "Inline style always-light surface (rgba, not CSS token)"
    - "Tone config object → icon + button variant mapping"
    - "TypeToConfirm: v === guardWord (no trim, case-sensitive)"
key_files:
  created:
    - src/overlays/ConfirmDialog/index.tsx
    - src/overlays/ConfirmDialog/ConfirmDialog.test.tsx
  modified:
    - src/index.ts
    - src/overlays/Modal/Modal.test.tsx
decisions:
  - "Panel background is always rgba(255,255,255,.97) — never var(--cream) — ensures light surface in dark-mode contexts"
  - "backdrop click does nothing (no closeOnBackdropClick) — all tones require explicit Cancel or Confirm"
  - "SVG icons use aria-hidden=true + biome-ignore comment — they are decorative; panel carries all semantic context via aria-labelledby"
  - "TypeToConfirm comparison: v === guardWord with no trim (CONSTRAINT-013)"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-05"
  tasks_completed: 2
  files_count: 4
---

# Phase 18 Plan 02: ConfirmDialog + TypeToConfirm Summary

**One-liner:** 4-tone ConfirmDialog and TypeToConfirm overlay components with DSPortal + useFocusTrap, always-light glass panel, document-level keyboard handlers, and 15-test suite covering all REQ-18-01 and REQ-18-02 behaviors.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement ConfirmDialog + TypeToConfirm | b681986 | src/overlays/ConfirmDialog/index.tsx, src/overlays/Modal/Modal.test.tsx |
| 2 | Write ConfirmDialog.test.tsx | ab87558 | src/overlays/ConfirmDialog/ConfirmDialog.test.tsx |
| — | Barrel export update | 6e58009 | src/index.ts |

## What Was Built

### ConfirmDialog (`src/overlays/ConfirmDialog/index.tsx`)

- **4 tones:** danger (red triangle-warning), warn (amber circle-info), success (green checkmark), neutral (ink circle-info-variant)
- **Tone → button mapping:** danger→variant="danger", warn→variant="primary", success→variant="primary" with amber-d override, neutral→variant="secondary" with ink override
- **Panel:** `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` + `aria-describedby` wired via `useId()`
- **Panel style:** `rgba(255,255,255,.97)` background — never a CSS token — always-light glass surface
- **Focus trap:** `useFocusTrap(panel, open)` via `useState` callback-ref pattern (not `useRef`)
- **Keyboard:** `document.addEventListener("keydown")` in `useEffect` with cleanup; Escape→onClose, Enter→onConfirm
- **Backdrop:** `ds-atom-modal-backdrop` class reused; click handler is no-op (all tones require explicit action)

### TypeToConfirm (`src/overlays/ConfirmDialog/index.tsx`)

- Same DSPortal + backdrop + always-light panel structure
- `const ok = v === guardWord` — no `.trim()`, case-sensitive (CONSTRAINT-013)
- Confirm button: `disabled={!ok}`, style toggles between ink-5@60% (disabled) and red (enabled)
- Enter only fires `onConfirm()` when `ok === true` (T-018-02-03)
- `useEffect` resets `v` to `""` when `open` flips to false
- Kbd hint row: `"Type <Kbd size="sm">{guardWord}</Kbd> to confirm"`

### Barrel Export (`src/index.ts`)

Exports: `ConfirmDialog`, `TypeToConfirm`, `ConfirmDialogProps`, `ConfirmDialogTone`, `TypeToConfirmProps`

## Verification

```
vitest run src/overlays/ConfirmDialog  →  15/15 passed
tsc --noEmit                           →  0 errors
grep -c "var(--cream)" index.tsx       →  0
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 5 broken tests in Modal.test.tsx**
- **Found during:** Task 1 pre-flight
- **Issue:** Modal.test.tsx still imported and tested the old `ConfirmDialog` from `./overlays/Modal` — which was removed in 018-01. This caused 5 test failures.
- **Fix:** Removed the old `ConfirmDialog` import and the entire `describe("ConfirmDialog")` block from Modal.test.tsx. Added a one-line comment noting tests moved to the new file.
- **Files modified:** src/overlays/Modal/Modal.test.tsx
- **Commit:** b681986

**2. [Rule 2 - Missing] Added `aria-hidden="true"` + biome-ignore to all 4 tone SVG icons**
- **Found during:** Task 1 first commit attempt (biome pre-commit hook blocked with `noSvgWithoutTitle`)
- **Issue:** Inline SVG icons in the tones config lacked accessibility annotations. Biome rejected the commit.
- **Fix:** Added `aria-hidden="true"` to each SVG (correct: they are decorative, panel has `aria-labelledby`) and a `biome-ignore lint/a11y/noSvgWithoutTitle` comment explaining the rationale.
- **Files modified:** src/overlays/ConfirmDialog/index.tsx
- **Commit:** b681986 (fixed before commit)

**3. [Rule 1 - Bug] Fixed always-light panel background test assertion**
- **Found during:** Task 2 test run
- **Issue:** `panel.style.background` returns `"rgba(255, 255, 255, 0.97)"` (jsdom-normalized form) not `"rgba(255,255,255,.97)"` (source form). Test failed with string equality.
- **Fix:** Changed assertion to `toMatch(/^rgba\(255,\s*255,\s*255,\s*0\.97\)$/)` — still guards against accidental `var(--cream)` substitution.
- **Files modified:** src/overlays/ConfirmDialog/ConfirmDialog.test.tsx
- **Commit:** ab87558 (fixed before commit)

## Known Stubs

None. All component behavior is fully wired.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. TypeToConfirm input value is compared client-side only and never transmitted (T-018-02-01 accepted). Keyboard listener cleanup verified in tests (T-018-02-02 mitigated). Enter gate verified in tests (T-018-02-03 mitigated).

## Self-Check: PASSED
