---
phase: 18
slug: wave-7-layout-patterns-interaction-illustrations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x + @testing-library/react 16.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run <PrimitiveName>` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~7–10 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run <PrimitiveName>` (~2s)
- **After every plan wave:** Run `npm test -- --run` (full suite)
- **Before `/gsd-verify-work`:** Full suite must be green (target: ~800+ tests)
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-00-01 | 18-00 | 0 | DS-80 infra | build | `node -e "require('./dist/index.js')"` | ❌ W0 | ⬜ pending |
| 18-00-02 | 18-00 | 0 | DS-81 infra | build | verify tsup entry + exports stanza | ❌ W0 | ⬜ pending |
| 18-01-01 | 18-01 | 1 | DS-71 | unit | `npm test -- --run AppShell` | ❌ W0 | ⬜ pending |
| 18-01-02 | 18-01 | 1 | DS-71 | unit | same | ❌ W0 | ⬜ pending |
| 18-02-01 | 18-02 | 1 | DS-72 | unit | `npm test -- --run AppBar` | ❌ W0 | ⬜ pending |
| 18-02-02 | 18-02 | 1 | DS-73 | unit | `npm test -- --run Footer` | ❌ W0 | ⬜ pending |
| 18-03-01 | 18-03 | 2 | DS-81 | unit | `npm test -- --run illustrations` | ❌ W0 | ⬜ pending |
| 18-03-02 | 18-03 | 2 | DS-81 | build | tree-shake fixture | ❌ W0 | ⬜ pending |
| 18-04-01 | 18-04 | 3 | DS-74 | unit | `npm test -- --run Wizard` | ❌ W0 | ⬜ pending |
| 18-04-02 | 18-04 | 3 | DS-74 | unit | same | ❌ W0 | ⬜ pending |
| 18-05-01 | 18-05 | 3 | DS-75 | unit | `npm test -- --run FormValidation` | ❌ W0 | ⬜ pending |
| 18-05-02 | 18-05 | 3 | DS-76 | unit | `npm test -- --run Coachmark` | ❌ W0 | ⬜ pending |
| 18-06-01 | 18-06 | 4 | DS-77 | unit | `npm test -- --run InlineEdit` | ❌ W0 | ⬜ pending |
| 18-06-02 | 18-06 | 4 | DS-78 | unit | `npm test -- --run SearchAndFilters` | ❌ W0 | ⬜ pending |
| 18-07-01 | 18-07 | 4 | DS-79 | unit | `npm test -- --run Presence` | ❌ W0 | ⬜ pending |
| 18-07-02 | 18-07 | 4 | DS-79 | unit | same | ❌ W0 | ⬜ pending |
| 18-08-01 | 18-08 | 5 | DS-80 | unit | `npm test -- --run Sortable` | ❌ W0 | ⬜ pending |
| 18-08-02 | 18-08 | 5 | DS-80 | unit | same | ❌ W0 | ⬜ pending |
| 18-09-01 | 18-09 | 6 | release | build | `npm run build && ls dist/` | ✅ exists | ⬜ pending |
| 18-09-02 | 18-09 | 6 | release | manual | human visual smoke check | N/A | ⬜ pending |
| 18-09-03 | 18-09 | 6 | release | build | `npm pack --dry-run` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

New test files that must be created (one per primitive):
- [ ] `src/AppShell.test.tsx` — DS-71: collapse + localStorage + slot rendering
- [ ] `src/AppBar.test.tsx` — DS-72: 4 variants + scrolled state
- [ ] `src/Footer.test.tsx` — DS-73: compact + expanded + sticky variants
- [ ] `src/Wizard.test.tsx` — DS-74: step machine + validate gate + ProgressBar value
- [ ] `src/FormValidation.test.tsx` — DS-75: PasswordStrength segments + FieldError + summary
- [ ] `src/Coachmark.test.tsx` — DS-76: dismiss + localStorage + storageKey=null
- [ ] `src/InlineEdit.test.tsx` — DS-77: click→edit→commit/cancel + error recovery
- [ ] `src/SearchAndFilters.test.tsx` — DS-78: dropdown + filter chip add/remove + clear-all
- [ ] `src/Sortable.test.tsx` — DS-80: reorder + keyboard + reduced-motion gate
- [ ] `src/illustrations/index.test.ts` — DS-81: 24 named exports render without error

**Note for jsdom + @dnd-kit:** Mock `element.setPointerCapture = vi.fn()` in test setup. Test keyboard-only reordering (Space/Arrow events) which jsdom handles without pointer capture.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sortable touch drag on iOS Safari | DS-80 | jsdom doesn't simulate touch with setPointerCapture | Test on real device: drag item on iPhone Safari |
| AppShell icon rail visual | DS-71 | Pixel-exact collapse animation | Open Storybook, toggle collapse, verify 48px width |
| Illustrations render correctly | DS-81 | SVG colour accuracy in dark mode | Open Storybook DarkMode story for each illustration |
| Coachmark anchor positioning | DS-76 | Requires visible DOM layout | Open Storybook, verify hint aligns to anchor element |

---

## Phase Gate

Before marking Phase 18 complete:
- [ ] All 11 test files exist and pass (target: ~800+ total tests)
- [ ] `npm run build` produces `dist/illustrations/index.js` + `dist/illustrations/index.d.ts`
- [ ] `package.json` exports stanza includes `"./illustrations"` entry
- [ ] Manual verifications above completed
- [ ] v1.0.0 git tag applied
