---
phase: 20
slug: statcard
created: 2026-05-05
---

# Phase 20 — Validation Strategy

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Quick run | `npx vitest run src/display/StatCard` |
| Full suite | `npx vitest run` |
| TypeScript gate | `npx tsc --noEmit` |

## Phase Requirements → Test Map

| Req ID | Behavior | Type | Command | Covered By |
|--------|----------|------|---------|------------|
| REQ-20-01 | Label renders mono uppercase 9px .08em ink-3 | unit | `npx vitest run src/display/StatCard` | 020-01 T1 |
| REQ-20-01 | Value renders Archivo 800 28px -0.02em | unit | same | 020-01 T1 |
| REQ-20-01 | changeDir="up" → green badge bg + green Sparkline | unit | same | 020-01 T1 |
| REQ-20-01 | changeDir="down" → red badge bg + red Sparkline | unit | same | 020-01 T1 |
| REQ-20-01 | No change prop → no badge rendered | unit | same | 020-01 T1 |
| REQ-20-01 | data prop → Sparkline rendered | unit | same | 020-01 T1 |
| REQ-20-01 | No data → no Sparkline | unit | same | 020-01 T1 |
| REQ-20-01 | glass class on root | unit | same | 020-01 T1 |
| REQ-20-01 | axe-core zero violations | a11y | Manual Storybook check | 020-02 T1 (manual UAT) |

## Sampling Rate

- Per task commit: `npx vitest run src/display/StatCard/StatCard.test.tsx`
- Per wave merge: `npx vitest run`
- Phase gate: full suite green + tsc clean before `/gsd-verify-work`

## Wave 0 Gaps

Tests created in Plan 020-01 Task 1 (TDD RED phase):
- [ ] `src/display/StatCard/StatCard.test.tsx`

Stories created in Plan 020-02 Task 1:
- [ ] `src/display/StatCard/StatCard.stories.tsx`

## Notes

- axe-core is not installed as a project dependency. Accessibility gate is manual Storybook inspection (consistent with Phases 17–19).
- Sparkline is mocked in tests via `vi.mock("../Sparkline")` to allow Phase 20 tests to run independently of Phase 19 completion.
