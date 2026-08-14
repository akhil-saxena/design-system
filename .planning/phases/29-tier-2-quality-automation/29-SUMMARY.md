# Phase 29 — Tier 2: Quality Automation — SUMMARY

**Status:** Complete (automation), a11y remediation 74% done — residual tracked below
**Verification:** typecheck 0 errors · biome clean with all rules on · 1121 tests · coverage thresholds enforced · visual suite stable across consecutive runs · build clean

## 29a — Disabled lint rules re-enabled

`useExhaustiveDependencies`, `useButtonType`, `noLabelWithoutControl` and
`noExplicitAny` were all `"off"`. Turning them on surfaced findings in waves
(biome caps output at 20, so each fix revealed more). All resolved; only three
suppressions remain, each with a written reason.

Real bugs found, not style noise:

- **`useComposedRefs` had a latent crash.** It passes the rest-array as its
  dependency list. Element-wise comparison makes that correct (and it is what
  Radix does), but the arity must be constant — a caller varying the number of
  refs makes React throw on the changed list size. Documented rather than
  "fixed", since changing it would break the memoisation the hook exists for.
- **`CommandPalette` re-ran an effect on every render.** `optionId` was a plain
  arrow used as a dependency, so the scroll-into-view effect never memoised.
- **`Lightbox`'s document keydown handler closed over a stale `navigateTo`** —
  the function was re-created each render while the dependency list omitted it.
- **Three stale-state reads in value-sync effects** (ColorPicker, ColorInput,
  DatePicker) compared against state the dependency list did not declare.
  Rewritten to use functional updaters, which removes the stale read *and* keeps
  React's bail-out behaviour.
- **`Carousel`'s dot-nav button had no `type`**, so changing slide submitted any
  enclosing form.
- **`ColorPicker` / `ColorInput` labels were never associated** with their
  inputs — clicking "HEX"/"ALPHA" did not focus the field, and the accessible
  name came from a duplicate `aria-label`.
- A dead `eslint-disable react-hooks/exhaustive-deps` in DatePicker: the project
  lints with Biome, so it had been silencing nothing.

## 29b — axe over every story

`@storybook/addon-a11y` + `axe-playwright` in the test-runner. `test-runner.ts`
now switches on `DS_TEST_MODE` (`a11y` default, `visual` for capture), so the
two jobs are independent. New scripts: `test:a11y`, `test:visual:capture`.

The project's stated success criterion was "every component passes axe-core with
zero violations". Nothing had ever verified it. First run: **94 of 476 story
checks failing, 105 violations.** Now **27 failing, 27 violations — a 74%
reduction**, with every structural ARIA bug fixed:

| Rule | Impact | Before | After |
|---|---|---:|---:|
| button-name | critical | 14 | **0** |
| aria-input-field-name | serious | 12 | **0** |
| aria-required-parent | critical | 10 | **0** |
| aria-required-children | critical | 11 | 1 |
| label | critical | 12 | 2 |
| aria-prohibited-attr | serious | 11 | 4 |
| color-contrast | serious | 26 | 11 |
| other | — | 9 | 9 |

Root causes fixed:

- **`Select` and `MultiSelect` were unnameable.** Their triggers carry
  `role="combobox"`, which is `nameFrom: author` — the visible selected value
  cannot name it — and neither component had *any* naming prop. Added
  `ariaLabel` / `ariaLabelledBy`, defaulting to the placeholder so the control is
  never unnamed.
- **`DatePicker` had an invalid ARIA grid**: `role="grid"` containing
  `role="gridcell"` with no `role="row"` between. `DateRangePicker` composes it,
  so both were broken (Calendar had always been correct). Rows now wrap each
  week. Chunked from the flat 42-cell list rather than `buildMonthGrid().weeks`,
  which trims a trailing empty week — using it would have made the popover change
  height between months.
- **`RichText`'s editable surface was unnamed.** TipTap renders a contenteditable
  with an implicit `textbox` role; `ariaLabel` was applied to the outer wrapper,
  whose `generic` role cannot carry a name.
- **`NumberStepper`'s numeric input was unnamed** for the same reason — the label
  sat on the wrapping `<div>`.
- **`RollingNumber` labelled a bare `<span>`** (generic role prohibits naming).
- **Three components used *surface* tokens as text colours**, so they inverted
  with the theme while their pair did not: `OAuthButton` dark (`--cream` → 1.19:1
  in dark mode), `AppBar`'s logo chip (`--ink` background → amber at 1.83:1 in
  dark), and `FormValidation` (`--green-vivid` as label text at 2.05:1, against
  the token layer's own "vivids are never text" rule).
- **Added `--green-ink` / `--red-ink`.** Eight tinted-pill violations shared one
  cause: `--green` / `--red` are tuned for text on a *neutral* surface and fall to
  ~4.2:1 once a 12–15% tint of their own hue composites underneath. `--amber-ink`
  already existed for exactly this role; these are its missing siblings, solved
  numerically (4.87–4.88:1 across the full light surface ramp).

## 29c — Coverage thresholds

Pinned just under measured values (statements 86 / branches 79 / functions 85 /
lines 88) as a ratchet. Stories, barrels and the standalone Overview page are
excluded so the number reflects logic, not boilerplate. New `test:coverage`.

## 29d — Visual baselines

Regenerating them exposed that **the suite had never been stable**: each
re-record produced a *different* flaky story. Four separate causes:

1. **No animation freezing.** The Playwright spec did none — only the Storybook
   test-runner path did — so any of the system's 20 keyframes could be captured
   mid-flight. Now killed via injected CSS. (Playwright's own
   `animations: "disabled"` is unusable here: it waits for animations to
   *finish*, and the spinner/progress/skeleton animations are infinite.)
2. **Live network images.** 11 `<img src>` pointed at picsum.photos and
   pravatar.cc, so whether the image had loaded was a race — and Storybook needed
   public network access to render correctly. Replaced with deterministic local
   SVG data URIs (`_internals/storyImage.ts`).
3. **Clock-derived rendering.** Calendar's day view drew a live "now" line and
   auto-scrolled to the current hour, and its month view rings "today" — so every
   Calendar baseline silently rotted the next day. Added an injectable
   `nowOverride` clock and pinned it in the stories.
4. **Genuinely time-driven stories.** Four RollingNumber stories are a live clock
   or a `setInterval` counter; pixel baselines cannot describe them. Excluded
   explicitly, with an assertion that the exclusion list cannot silently grow.

Also added a `document.fonts.ready` wait — web fonts change metrics, so the
capture was racing font loading.

Result: **472 baselines, 4 excluded, green on two consecutive runs.**

## Residual — 27 axe violations, tracked

- **11 color-contrast.** Mostly disabled-state text (RangeSlider disabled labels,
  Calendar out-of-month days), which WCAG 1.4.3 explicitly exempts as "inactive
  user interface components" but axe cannot judge. Two are real and need a design
  decision: Calendar's event chip (`--ink-inverse` on `--purple-vivid`, 4.13:1)
  and a Carousel caption at 4.33:1.
- **4 aria-prohibited-attr** — 2 in TokenCheck (a foundation demo page), 2 in
  RichText read-only mode.
- **3 scrollable-region-focusable** — scroll containers in Calendar/InfiniteList
  need `tabIndex={0}`.
- **2 list** (InfiniteList `<ul>` children), **2 landmark-unique** (Breadcrumbs
  and Pagination stories render several same-named `<nav>` landmarks in one
  canvas), **2 aria-allowed-attr** (Table), **1 aria-required-children** (Tabs),
  **2 label**.

Deliberately not suppressed with per-story `a11y.disable` — leaving them visible
keeps the count honest.
