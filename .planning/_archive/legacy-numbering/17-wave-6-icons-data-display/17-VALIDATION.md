---
phase: 17
slug: wave-6-icons-data-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-29
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Authoritative test-map derives from `17-RESEARCH.md` § "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + Testing Library (unit/component) + Playwright 1.x (visual baselines) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (Wave 0 — verify spec runner exists; restore if missing) |
| **Quick run command** | `npm run test:run -- <Primitive>` (single primitive, watch off) |
| **Full suite command** | `npm run test:run && npm run test:visual` |
| **Estimated runtime** | ~30 s for unit suite; ~90 s for visual baselines |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:run -- <PrimitiveName>` (touched primitive only)
- **After every plan wave:** Run `npm run test:run && npm run typecheck`
- **Before /gsd-verify-work:** Full suite (unit + visual + typecheck) must be green
- **Max feedback latency:** 60 s

---

## Per-Task Verification Map

> Phase 17 has no `phase_req_ids` from REQUIREMENTS.md (project is spec-driven via design_handoff/). Verification is mapped to DS-NN identifiers and the success criteria in ROADMAP.md § "Phase 17". This table is the canonical map; planner populates the per-task rows from PLAN.md frontmatter.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-00-01 | Wave 0 | 0 | Visual test infra | — | N/A | infra | `npx playwright test --list` | ❌ W0 | ⬜ pending |
| 17-00-02 | Wave 0 | 0 | tsup multi-entry config | — | N/A | build | `npm run build && ls dist/icons/index.js` | ❌ W0 | ⬜ pending |
| 17-01-* | DS-60 Icons | 1 | Brand-lock wrapper + tree-shake | — | N/A | unit + bundle | `npm run test:run -- Icon && node test/tree-shake-check.cjs` | ❌ W0 | ⬜ pending |
| 17-02-* | Lucide refactor | 1 | 14 primitives use Icon wrapper | — | N/A | unit + grep | `! grep -rn 'from \"lucide-react\"' src --include='*.tsx' \| grep -v _internals/Icon` | ✅ | ⬜ pending |
| 17-03-* | calendarGrid extract | 2 | DatePicker visual unchanged | — | N/A | visual | `npm run test:visual -- DatePicker DateRangePicker` | ✅ | ⬜ pending |
| 17-04-* | DS-63 SegmentedControl | 2 | radiogroup ARIA | — | N/A | unit + a11y | `npm run test:run -- SegmentedControl` | ❌ W0 | ⬜ pending |
| 17-05-* | DS-69 Breadcrumbs | 2 | aria-current=page | — | N/A | unit | `npm run test:run -- Breadcrumbs` | ❌ W0 | ⬜ pending |
| 17-06-* | DS-66 Timeline | 2 | static ordered structure | — | N/A | unit | `npm run test:run -- Timeline` | ❌ W0 | ⬜ pending |
| 17-07-* | DS-67 InfiniteList | 2 | IntersectionObserver triggers onLoadMore | — | N/A | unit | `npm run test:run -- InfiniteList` | ❌ W0 | ⬜ pending |
| 17-08-* | DS-64 Accordion | 2 | aria-expanded + button + region | — | N/A | unit + a11y | `npm run test:run -- Accordion` | ❌ W0 | ⬜ pending |
| 17-09-* | DS-65 Carousel | 2 | autoplay pauses on hover/focus; reduced-motion respected | — | N/A | unit + visual | `npm run test:run -- Carousel` | ❌ W0 | ⬜ pending |
| 17-10-* | DS-62 Tabs | 3 | tablist arrow keys + overflow menu | — | N/A | unit + a11y | `npm run test:run -- Tabs` | ❌ W0 | ⬜ pending |
| 17-11-* | DS-61 Table chrome+sort+density | 3 | aria-sort + density modes | — | N/A | unit | `npm run test:run -- Table` | ❌ W0 | ⬜ pending |
| 17-12-* | DS-61 Table selection+resize+pagination | 4 | selection ARIA + width state + pagination truncation | — | N/A | unit | `npm run test:run -- Table` | ❌ W0 | ⬜ pending |
| 17-13-* | DS-68 Calendar | 4 | month/week/day views; events as chips | — | N/A | unit + visual | `npm run test:run -- Calendar` | ❌ W0 | ⬜ pending |
| 17-14-* | DS-70 RichText | 5 | controlled value sync + B/I/U/heading/list/link | — | XSS via paste sanitizer | unit + e2e | `npm run test:run -- RichText` | ❌ W0 | ⬜ pending |
| 17-15-* | Wave 6 release | 5 | v0.6.0 dist correctness | — | N/A | build + visual | `npm run build && npm run test:visual` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> The exact wave assignment, task split, and test commands will be set by the planner during step 8 (gsd-planner). The numbers above are a planning seed; the planner overrides with concrete task IDs in PLAN.md files.

---

## Wave 0 Requirements

- [ ] **Verify visual test runner** — `playwright.config.ts` references `./tests/visual` but the directory currently has no `*.spec.ts` files (lost in the original `.planning/` purge per RESEARCH.md § "Wave 0 Gaps"). Either:
  - Restore the spec files from a git commit history search (check pre-purge tags), OR
  - Write `tests/visual/storybook.spec.ts` that uses Storybook's CSF and Playwright's `chromium-recipe` to capture each story screenshot for cumulative baselines.
- [ ] **tsup multi-entry config** — Add `src/icons/index.ts` entry to `tsup.config.ts` so the new subpath export builds. Verify `dist/icons/index.js` and `dist/icons/index.d.ts` are emitted after `npm run build`.
- [ ] **`exports` stanza in package.json** — Add `"./icons": { "types": "./dist/icons/index.d.ts", "import": "./dist/icons/index.js" }`.
- [ ] **Tree-shake verification harness** — Tiny sandbox in `tests/bundle/icons-tree-shake.test.ts` (or a node script) that imports a single icon, runs `esbuild --bundle --metafile`, and asserts the metafile shows only the imported icon path is included. Documented in RESEARCH.md.
- [ ] **TipTap deps install** — `npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/pm` at recommended pinned versions from RESEARCH.md.
- [ ] **lucide-react bump** — Update `lucide-react` from `^1.8.0` to current latest (~1.14.x at planning time per RESEARCH.md). Confirm React 19 compat after install.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Carousel touch swipe on real iOS Safari | DS-65 carousel touch parity | Playwright headless touch emulation diverges from native momentum scroll | Open Storybook on iOS device → swipe Carousel left/right → confirm no jank, snaps cleanly |
| Calendar event-day Popover on touch | DS-68 mobile UX | Popover positioning on mobile differs from desktop in ways visual baselines won't catch | Open Calendar → tap a day with events → confirm Popover/Sheet appears below cell, dismisses on tap-away |
| RichText paste from real Google Docs | DS-70 paste sanitization | TipTap default sanitizer's behavior with rich-paste is hard to assert in unit tests | Paste a styled paragraph from Google Docs → confirm bold/italic/link preserved, no inline styles or `<font>` tags leaked |
| Reduced-motion across primitives | All animated primitives | `prefers-reduced-motion` media query is OS-level | Set `Reduce Motion` in macOS Accessibility → confirm Carousel autoplay paused, Accordion expand instant, Calendar view-mode transition instant |
| Lucide bump regression sweep | DS-60 + 14 refactored primitives | Visual baselines catch most pixel diffs but icon stroke change is subtle | After lucide bump, eyeball Storybook for all primitives that import icons, compare against pre-bump screenshots |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (visual runner, tsup multi-entry, exports stanza, tree-shake harness, TipTap install, lucide bump)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60 s for unit suite per primitive
- [ ] `nyquist_compliant: true` set in frontmatter (set after planner derives concrete per-task verify commands)

**Approval:** pending — finalize after gsd-planner emits PLAN.md files in step 8 of plan-phase.
