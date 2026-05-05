---
phase: 020-statcard
verified: 2026-05-05T14:10:00Z
status: human_needed
score: 13/14 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Sparkline fills full card width"
    expected: "The Sparkline SVG visually spans the full width of the StatCard below the value row"
    why_human: "The Sparkline wrapper div has no width:100% and the Sparkline component defaults to width=100 (100px). Whether this satisfies REQ-20-01 'Sparkline occupies full card width' depends on typical card sizing in the dashboard context. Cannot confirm programmatically."
  - test: "axe-core accessibility passes with zero violations"
    expected: "Rendering StatCard with axe-core reports no accessibility violations"
    why_human: "REQ-20-01 acceptance criteria requires axe-core scan to pass. No axe test exists in the test suite. No automated accessibility test was authored as part of this phase."
---

# Phase 20: StatCard Verification Report

**Phase Goal:** Developers can drop a single StatCard component onto a dashboard and show a KPI with its trend and history in one unit.
**Verified:** 2026-05-05T14:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | StatCard renders a mono uppercase label in --ink-3 at 9px with 0.08em letter-spacing | VERIFIED | `data-part="label"` div has `fontFamily: "var(--mono)"`, `fontSize: 9`, `color: "var(--ink-3)"`, `letterSpacing: ".08em"`, `textTransform: "uppercase"` at index.tsx:43-51. Test "label element has correct inline styles" passes. |
| 2 | StatCard renders a value using var(--display) Archivo at 800 weight 28px with -0.02em letter-spacing | VERIFIED | Value div has `fontFamily: "var(--display)"`, `fontWeight: 800`, `fontSize: 28`, `letterSpacing: "-.02em"` at index.tsx:64-70. Test "renders the value text" passes. |
| 3 | When changeDir='up' the badge background is rgba(34,197,94,.1) and text color is var(--green) | VERIFIED | Badge div conditionally sets `background: up ? "rgba(34,197,94,.1)"` and `color: "var(--green)"` at index.tsx:82-86. Test "positive changeDir renders green badge" passes (browser normalises to rgba(34, 197, 94, 0.1) — test expectation was updated to match). |
| 4 | When changeDir='down' the badge background is rgba(239,68,68,.08) and text color is var(--red) | VERIFIED | Badge div sets `background: "rgba(239,68,68,.08)"` and `color: "var(--red)"` when `up === false` at index.tsx:82-86. Test "negative changeDir renders red badge" passes. |
| 5 | When change prop is absent no badge element is rendered | VERIFIED | Badge wrapped in `{change && ...}` at index.tsx:76. Test "does not render badge when change prop is absent" passes. |
| 6 | When data prop is present and length >= 2 a Sparkline is rendered inside a full-width wrapper | VERIFIED (partial — see human verification #1) | Sparkline rendered when `data && data.length >= 2` (index.tsx:95). Wrapper div exists with `marginTop: 10`. However no `width: "100%"` is set on wrapper, and Sparkline defaults to 100px width. Tests confirm SVG presence; full-width claim needs human verification. |
| 7 | When data prop is absent or has < 2 points no Sparkline is rendered | VERIFIED | Guard at index.tsx:95: `data && data.length >= 2`. Tests "does not render Sparkline when data is absent" and "does not render Sparkline when data has fewer than 2 points" both pass. |
| 8 | Root element carries className='glass' and inline style padding:16, borderRadius:12 | VERIFIED | Root div: `className={["glass", className].filter(Boolean).join(" ")}` and `style={{ padding: 16, borderRadius: 12, ...style }}` at index.tsx:38-39. Both tests "root element carries the glass class" and "root element has borderRadius 12 inline style" pass. |
| 9 | Storybook shows Default, TrendDown, NoSparkline, and DarkMode stories | VERIFIED | Five named stories exported: Default, Variants, TrendDown, NoSparkline, DarkMode at StatCard.stories.tsx:65,84,115,134,150. |
| 10 | StatCard is importable from the package root | VERIFIED | `export { StatCard, type StatCardProps, type StatCardChangeDir } from "./display/StatCard";` at src/index.ts:25. |
| 11 | All 11 unit tests pass | VERIFIED | `npx vitest run src/display/StatCard/StatCard.test.tsx` exits 0 — 11/11 tests passed. |
| 12 | tsc --noEmit exits 0 | VERIFIED | `npx tsc --noEmit` exits with no output (clean). |
| 13 | No badge when change prop absent; no Sparkline when data absent or length < 2 | VERIFIED | Covered by tests 6, 8, 9 above. Confirmed passing. |
| 14 | axe-core scan passes with zero violations | UNCERTAIN | REQ-20-01 acceptance criteria requires this. No axe-core test exists in the StatCard test file. Human verification required. |

**Score:** 13/14 truths verified (1 uncertain — axe-core)

### Deferred Items

None.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/display/StatCard/index.tsx` | StatCard component and StatCardProps type export | VERIFIED | Exports `StatCard` (function), `StatCardProps` (interface), `StatCardChangeDir` (type). 102 lines, substantive implementation. |
| `src/display/StatCard/StatCard.test.tsx` | Unit tests covering all behavioral contracts | VERIFIED | 11 tests in `describe("StatCard"` — all passing. Covers label, value, badge (up/down/absent), Sparkline (data/absent/short), glass class, borderRadius. |
| `src/display/StatCard/StatCard.stories.tsx` | Five Storybook stories | VERIFIED | Contains `export const DarkMode`. Five exports: Default, Variants, TrendDown, NoSparkline, DarkMode. |
| `src/index.ts` | Barrel export for StatCard, StatCardProps, StatCardChangeDir | VERIFIED | Line 25: `export { StatCard, type StatCardProps, type StatCardChangeDir } from "./display/StatCard"` — placed immediately after RollingNumber export. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/display/StatCard/index.tsx` | `src/display/Sparkline/index.tsx` | `import { Sparkline } from '../Sparkline'` | WIRED | Line 2 of index.tsx imports Sparkline; used at line 97 inside conditional render. Sparkline dependency exists at `src/display/Sparkline/index.tsx`. |
| `src/display/StatCard/index.tsx` | `.glass` CSS class | `className="glass"` | WIRED | Line 38: `className={["glass", className].filter(Boolean).join(" ")}` — glass class always included as first array element. |
| `src/index.ts` | `src/display/StatCard/index.tsx` | `export { StatCard, type StatCardProps, type StatCardChangeDir } from './display/StatCard'` | WIRED | Confirmed at src/index.ts:25. |

### Data-Flow Trace (Level 4)

StatCard is a pure display component with no async data fetching — it renders props directly. No API calls, no store queries, no useEffect. All data flows from caller props to JSX. Level 4 is not applicable (no upstream data source to trace).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 11 unit tests pass | `npx vitest run src/display/StatCard/StatCard.test.tsx` | 11 passed, 0 failed | PASS |
| TypeScript clean | `npx tsc --noEmit` | No output (exit 0) | PASS |
| StatCard barrel export present | `grep -v '^//' src/index.ts \| grep StatCard` | Line matched | PASS |
| Five story exports | `grep -c '^export const' StatCard.stories.tsx` | 5 | PASS |
| DarkMode decorator present | `grep -c 'className="dark"' StatCard.stories.tsx` | 1 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-20-01 | 020-01, 020-02 | StatCard: metric label, value display, trend badge, Sparkline, glass surface, Storybook stories, axe-core pass | PARTIAL | All visual/structural criteria met and tested. Storybook stories complete. Barrel export in place. axe-core criterion not tested — no automated accessibility test authored. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TODO/FIXME/placeholder comments found. No stub return patterns found. Implementation is substantive and fully wired.

### Human Verification Required

#### 1. Sparkline fills full card width

**Test:** Render a StatCard with `data={[4,6,5,8,10]}` in Storybook or a browser. Inspect the rendered SVG element's width relative to the card.
**Expected:** The Sparkline SVG visually spans the full width of the card interior below the value row (REQ-20-01: "Sparkline occupies full card width below value row").
**Why human:** The wrapper div at index.tsx:96 has only `marginTop: 10` — no `width: "100%"`. The Sparkline component defaults to `width=100` (100px). Whether 100px visually covers the card depends on card sizing. If the card is wider than 100px in the actual dashboard, the Sparkline will not span full width, violating the requirement. If this is acceptable, an override can be added.

#### 2. axe-core accessibility scan passes with zero violations

**Test:** Run axe-core against a rendered StatCard (all props populated, including badge and sparkline). Example using `@axe-core/react` or `vitest-axe`:
```tsx
const { container } = render(<StatCard label="Applications" value="24" change="+12%" changeDir="up" data={[1,2,3]} />);
const results = await axe(container);
expect(results.violations).toHaveLength(0);
```
**Expected:** Zero accessibility violations.
**Why human:** No axe-core test exists in the test file. REQ-20-01 explicitly requires "axe-core scan passes with zero violations." This criterion cannot be verified programmatically without running the test; and the test does not currently exist.

### Gaps Summary

No hard blockers were found. The component is fully implemented, all 11 unit tests pass, TypeScript is clean, stories cover all required variants, and the barrel export is wired correctly.

Two items need human decision:

1. **Sparkline width**: The Sparkline wrapper has no `width: "100%"` override. The Sparkline defaults to 100px. REQ-20-01 states it should "occupy full card width." This may be a visual gap or may be acceptable depending on intended card sizing. If cards are wider than 100px in production dashboards (very likely), the Sparkline will appear narrow rather than full-width.

2. **axe-core test missing**: REQ-20-01 requires an axe-core scan with zero violations. No such test was written in this phase. This is a gap in the test coverage, not necessarily in the component itself.

---

_Verified: 2026-05-05T14:10:00Z_
_Verifier: Claude (gsd-verifier)_
