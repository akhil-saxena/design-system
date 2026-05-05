# Phase 20: StatCard - Research

**Researched:** 2026-05-05
**Domain:** React display component — KPI card composition (glass surface + typography + trend badge + Sparkline integration)
**Confidence:** HIGH

---

## Summary

StatCard is a single-component phase that composes existing primitives into a KPI card. The design
handoff provides two reference implementations: one in `ds-universal.jsx` (StatCard with inline
sparkline, SVG chevron trend indicator, accent-colored spark) and a more canonical one in
`ds-dataviz.jsx` (StatCard that uses the Phase 19 Sparkline component directly with the badge-style
trend pill instead of the chevron+text pattern).

The `ds-dataviz.jsx` implementation is the **authoritative spec** for Phase 20. It uses a badge pill
for the trend indicator (not a chevron arrow), positions the badge top-right (not below the value),
and delegates Sparkline rendering to the Sparkline component. The REQUIREMENTS.md acceptance
criteria align with the ds-dataviz version.

**Primary recommendation:** Implement `StatCard` as a pure display component in `src/display/StatCard/`.
Use the `glass` utility class directly (not the `<Card>` component wrapper) since the handoff uses
the class directly. Import and compose the `Sparkline` component from Phase 19. No CSS class needed
— all styling is inline per the existing display component convention.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Glass surface rendering | Client (CSS utility) | — | `.glass` class with CSS token flip handles both modes |
| KPI value display | Client (React component) | — | Pure presentational, no state |
| Trend badge | Client (React component) | — | Color computed from `changeDir` prop at render time |
| Sparkline chart | Client (imported Sparkline) | — | Phase 19 component owns chart geometry; StatCard just passes `data` + `color` |
| Dark mode | CSS token system | — | `--g-bg`, `--g-bd`, `--green`, `--red` all flip via `:root.dark` |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-20-01 | StatCard with glass surface, mono label, Archivo 800 28px value, trend badge (green/red tint), optional Sparkline at full card width | Fully specified in ds-dataviz.jsx lines 94–145; typography tokens confirmed in tokens.css; glass class confirmed in utilities.css |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React + TypeScript | 19 / project default | Component definition | Project-wide lock |
| CSS custom properties | — | Theming, token resolution | Project-wide lock (DECISION-002) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sparkline (Phase 19) | internal | Polyline mini-chart below value | When `data` prop is provided |
| @testing-library/react | project default | Unit tests | All component tests |
| vitest | project default | Test runner | `npm test` = `vitest run` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sparkline (Phase 19) | Inline SVG polyline (ds-universal pattern) | ds-universal has a self-contained spark; ds-dataviz (canonical) delegates to Sparkline component — use Phase 19 per ROADMAP dependency declaration |
| `glass` CSS class directly | `<Card variant="glass">` component | Card adds its own padding (20px 22px) and border-radius (var(--radius-lg)=12px); handoff uses inline padding 16px + borderRadius 12px on the raw glass class — use the class directly to keep exact handoff dimensions |

---

## Architecture Patterns

### System Architecture Diagram

```
Consumer passes props
        │
        ▼
  StatCard component
  ├── div.glass (surface + border + blur)
  │   ├── label row  ──── var(--mono) 9px / 700 / uppercase / 0.08em / --ink-3
  │   ├── content row (flex, space-between, align-items-flex-start)
  │   │   ├── left column
  │   │   │   ├── value div ─── var(--display) 800 28px / -0.02em / marginTop 4
  │   │   └── right column
  │   │       └── trend badge pill ── conditional on `change` prop
  │   │           padding 3px 7px / radius 4px / mono 10px 700
  │   │           positive: rgba(34,197,94,.1) bg + var(--green) text
  │   │           negative: rgba(239,68,68,.08) bg + var(--red) text
  │   └── sparkline row ─── marginTop 10, conditional on `data` prop
  │       └── <Sparkline data={data} color={sentimentColor} width="100%" />
  │           (Sparkline uses its default width=100 when not overridden)
        │
        ▼
   Rendered KPI card
```

### Recommended Project Structure
```
src/
├── display/
│   ├── Avatar/          # exists
│   ├── RollingNumber/   # exists
│   └── StatCard/        # NEW
│       ├── index.tsx    # component + types export
│       ├── StatCard.stories.tsx
│       └── StatCard.test.tsx
```

### Pattern 1: StatCard Component Shape (from ds-dataviz.jsx)

**What:** Glass card composing label + value + trend badge + optional Sparkline
**When to use:** Dashboard KPI tiles
**Example:**
```typescript
// Source: design_handoff/design-system/ds-dataviz.jsx lines 94-145

// Card shell (handoff exact values):
<div className="glass" style={{ padding: 16, borderRadius: 12 }}>

  {/* Label row */}
  <div style={{
    fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)',
    letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700
  }}>
    {label}
  </div>

  {/* Content row: value left, badge right */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>
      {/* Value */}
      <div style={{
        fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28,
        letterSpacing: '-.02em', marginTop: 4
      }}>
        {value}
      </div>
    </div>

    {/* Trend badge — shown when change prop present */}
    {change && (
      <div style={{
        padding: '3px 7px', borderRadius: 4,
        background: up ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.08)',
        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
        color: up ? 'var(--green)' : 'var(--red)'
      }}>
        {change}
      </div>
    )}
  </div>

  {/* Sparkline — shown when data prop present */}
  {data && (
    <div style={{ marginTop: 10 }}>
      <Sparkline data={data} color={sentimentColor} />
    </div>
  )}
</div>
```

### Pattern 2: Sentiment Color Derivation

```typescript
// Source: ds-dataviz.jsx — implicit in the four card examples
// Positive change → green, Negative → red, No change → amber (fallback)
const sentimentColor = changeDir === 'up' ? 'var(--green)' : 'var(--red)';
// When no changeDir, default to amber (neutral/untracked)
```

### Pattern 3: Sparkline Width — Full Card Width

The handoff renders Sparkline at its default width (100px) for the four demo cards, but the
Sparkline component accepts a `width` prop and the requirement says "full card width below the value
row." In practice the parent `div` with `marginTop: 10` constrains width naturally when `display:
block` is set. Since `<Sparkline>` renders an `<svg>` with `display: block`, setting `width="100%"`
on the `<svg>` via props is not directly supported by the Sparkline component's typed props (which
take a numeric `width`). The correct approach is to either:
- Wrap in a `<div style={{ width: '100%' }}>` and pass `width` numerically via a ref/ResizeObserver
- Or simply use the Sparkline at 100% by wrapping: the `<svg>` has `display: block` per the
  Sparkline component, so the wrapper div will stretch and the SVG will fill

**Recommended:** Wrap Sparkline in `<div style={{ width: '100%' }}>` and pass `width` as a fixed
value matching the card's interior width, OR accept that a static 100px sparkline is acceptable
for initial implementation if ResizeObserver adds complexity. The requirement says "fills the full
card width" — use `width="100%"` on a wrapping div with the SVG inside using `preserveAspectRatio`.

Actually, the cleanest approach: Sparkline's SVG `viewBox` scales correctly when width is numeric.
Pass `width={undefined}` is not valid. The simplest compliant solution is to set `style={{ width: '100%' }}`
on the Sparkline's wrapping div and override the SVG `width` attribute via the style prop on the
SVG element. But since Sparkline is a Phase 19 component, StatCard should not reach into it.

**Decision for planner:** Either (a) use a fixed 100px width for the sparkline (acceptable for
MVP, matches handoff dimensions), or (b) implement a `useResizeObserver` to measure the card and
pass dynamic width. Given Phase 19 spec shows fixed width=100 in all examples, option (a) is
the intended approach for this phase.

### Anti-Patterns to Avoid
- **Do not use `<Card variant="glass">`:** The Card component adds 20px/22px padding and
  `var(--radius-lg)` (12px) plus a fixed display:block. StatCard needs padding: 16px and direct
  control — use `className="glass"` with inline padding/radius override.
- **Do not put the trend badge below the value:** The ds-universal.jsx layout puts change below
  the value (different pattern). The ds-dataviz.jsx layout (canonical) puts the badge top-right.
  Use the ds-dataviz layout.
- **Do not use SVG chevron for the trend indicator:** ds-universal uses a chevron SVG. The
  canonical ds-dataviz spec uses a plain badge pill with the change string (e.g., "+12%", "-5%").
  REQ-20-01 specifies the pill/badge pattern.
- **Do not hardcode `rgba(34,197,94)` as the green color for text:** The text color uses
  `var(--green)` token (dark mode: `#4ade80`), which flips automatically. The background tint
  uses the hardcoded rgba because tokens do not have a tint variant. This split is intentional.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sparkline chart geometry | Custom SVG polyline in StatCard | `<Sparkline>` from Phase 19 | Y-normalization formula must be exact per DECISION-016; Phase 19 already owns it |
| Glass surface | Custom backdrop-filter CSS | `.glass` utility class | Tokens `--g-bg`, `--g-bd`, `--g-blur` handle dark mode automatically |
| Green/red color management | Hardcoded hex values | `var(--green)` / `var(--red)` tokens | Tokens flip in dark mode; hardcoded values would fail dark mode |

---

## Common Pitfalls

### Pitfall 1: Wrong Handoff Source for Layout
**What goes wrong:** Developer follows ds-universal.jsx layout (chevron + change text below value, sparkline inline on right side) instead of ds-dataviz.jsx (badge pill top-right, sparkline full-width below).
**Why it happens:** Both files have StatCard-like components; ds-universal is listed first in the research brief.
**How to avoid:** ds-dataviz.jsx is the canonical DataViz reference per ROADMAP Phase 20 ("Source: ds-dataviz.jsx"). Use it exclusively.
**Warning signs:** If the trend indicator is an SVG chevron or the sparkline is on the right side of the value, the wrong pattern is being used.

### Pitfall 2: Typography Discrepancy Between Handoff Files
**What goes wrong:** Developer uses 9.5px for the label (from ds-universal) instead of 9px (from ds-dataviz) or vice versa.
**Why it happens:** ds-universal uses `fontSize: 9.5, letterSpacing: '.06em'` for the label; ds-dataviz uses `fontSize: 9, letterSpacing: '.08em'`.
**How to avoid:** REQ-20-01 is the canonical specification. It states `--mono 9px --ink-3 700 / uppercase / letter-spacing: 0.08em`. Use those values.
**Warning signs:** Letter spacing .06em or fontSize 9.5 in the label styles.

### Pitfall 3: Sparkline Width Not Full-Width
**What goes wrong:** Sparkline renders at default 100px width inside the card.
**Why it happens:** Sparkline's `width` prop is numeric; no `"100%"` string option.
**How to avoid:** Wrap Sparkline in `<div style={{ width: '100%' }}>` and either use a fixed numeric width that fills the card interior (card interior = card width - 32px padding) or accept 100px for the MVP per handoff examples.
**Warning signs:** Sparkline visually narrower than the card content area.

### Pitfall 4: `var(--green)` in Background Tint
**What goes wrong:** Developer uses `var(--green)` for the badge background instead of the hardcoded rgba.
**Why it happens:** Consistency instinct — "use tokens everywhere."
**How to avoid:** Background tint is `rgba(34,197,94,.1)` for green and `rgba(239,68,68,.08)` for red — hardcoded per handoff. The text IS `var(--green)` / `var(--red)`. Only the text uses the token; tint backgrounds are fixed rgba so they remain subtle in both modes.
**Warning signs:** Badge background appears dark/intense in dark mode.

### Pitfall 5: Missing `data` Guard for Sparkline
**What goes wrong:** Passing undefined `data` to Sparkline causes a crash — `Math.min(...undefined)` throws.
**Why it happens:** Sparkline's `data` prop has no default; StatCard's `data` prop is optional.
**How to avoid:** Guard: `{data && data.length > 1 && <Sparkline ... />}`. Require at least 2 points for a valid polyline.
**Warning signs:** Runtime error when StatCard is used without `data` prop.

---

## Exact Specification Reconciliation

Two handoff sources exist. Here is the resolved canonical spec:

| Property | ds-universal.jsx | ds-dataviz.jsx | REQ-20-01 | CANONICAL |
|----------|-----------------|----------------|-----------|-----------|
| Card padding | 18px 20px | 16px | 16px | **16px** |
| Card border-radius | 14 | 12 | 12px | **12** |
| Label font-size | 9.5px | 9px | 9px | **9px** |
| Label letter-spacing | .06em | .08em | 0.08em | **0.08em** |
| Label color | --ink-4 | --ink-3 | --ink-3 | **--ink-3** |
| Label font-weight | 600 | 700 | 700 | **700** |
| Value font | Archivo 800 28px -0.02em | same | same | **Archivo 800 28px -0.02em** |
| Value marginTop | — | 4px | — | **4px** |
| Trend indicator type | SVG chevron + text below value | Badge pill top-right | Badge pill | **Badge pill** |
| Badge padding | — | 3px 7px | 3px 7px | **3px 7px** |
| Badge border-radius | — | 4px | 4px | **4px** |
| Badge font | mono 11px 600 (implied) | mono 10px 700 | mono 10px 700 | **mono 10px 700** |
| Positive bg | — | rgba(34,197,94,.1) | green tint | **rgba(34,197,94,.1)** |
| Negative bg | — | rgba(239,68,68,.08) | red tint | **rgba(239,68,68,.08)** |
| Positive text | var(--green) | var(--green) | green text | **var(--green)** |
| Negative text | var(--red) | var(--red) | red text | **var(--red)** |
| Sparkline placement | Right side of value | Below, marginTop 10 | Full width below | **Below, marginTop 10** |
| Sparkline color | accent prop | sentiment-matched | sentiment-matched | **sentiment-matched** |
| Sparkline default color | var(--amber) | per card (amber/red/green/blue) | — | **sentiment color** |

---

## Props Interface

```typescript
// Source: VERIFIED from ds-dataviz.jsx + REQ-20-01

export interface StatCardProps {
  /** Monospace uppercase label (e.g. "Total Applications") */
  label: string;
  /** Primary metric value as string (e.g. "24", "42%", "4.2d") */
  value: string | number;
  /** Change string displayed in trend badge (e.g. "+12%", "-5%", "+3") */
  change?: string;
  /** Trend direction — determines badge color */
  changeDir?: "up" | "down";
  /** Sparkline data points — renders Sparkline when provided (min 2 points) */
  data?: number[];
  /** Additional className forwarded to the root div */
  className?: string;
  /** Additional inline styles for the root div */
  style?: React.CSSProperties;
}
```

Note: `accent` prop from ds-universal.jsx is NOT in the canonical spec (ds-dataviz derives
sparkline color from `changeDir`, not from an explicit `accent` prop). REQ-20-01 does not mention
an `accent` prop. Omit it — the planner should not include it.

---

## Code Examples

### Complete StatCard Implementation Reference
```typescript
// Source: design_handoff/design-system/ds-dataviz.jsx (lines 94-145, adapted to TypeScript)

import { Sparkline } from "../Sparkline"; // Phase 19 component

export function StatCard({ label, value, change, changeDir, data, className, style }: StatCardProps) {
  const up = changeDir === 'up';
  const sentimentColor = changeDir === 'up' ? 'var(--green)' : changeDir === 'down' ? 'var(--red)' : 'var(--amber)';

  return (
    <div
      className={`glass${className ? ` ${className}` : ''}`}
      style={{ padding: 16, borderRadius: 12, ...style }}
    >
      {/* Label */}
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)',
        letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700,
      }}>
        {label}
      </div>

      {/* Value + Badge row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28,
          letterSpacing: '-.02em', marginTop: 4,
        }}>
          {value}
        </div>
        {change && (
          <div style={{
            padding: '3px 7px', borderRadius: 4,
            background: up ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.08)',
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            color: up ? 'var(--green)' : 'var(--red)',
          }}>
            {change}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {data && data.length > 1 && (
        <div style={{ marginTop: 10 }}>
          <Sparkline data={data} color={sentimentColor} />
        </div>
      )}
    </div>
  );
}
```

### Storybook Story Structure (Three Required Variants)
```typescript
// Source: REQ-20-01 acceptance criteria

// Variant 1: Positive trend + sparkline
<StatCard label="Total Applications" value="24" change="+12%" changeDir="up"
  data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24]} />

// Variant 2: Negative trend + sparkline
<StatCard label="Response Rate" value="42%" change="-5%" changeDir="down"
  data={[60, 55, 50, 48, 52, 45, 42]} />

// Variant 3: No sparkline (no trend dir either)
<StatCard label="Avg. Response" value="4.2d"
  data={[8, 6, 7, 5, 4, 5, 3, 4, 4, 4.2]} />
// (or no data at all)
```

---

## Project Constraints (from CLAUDE.md / PROJECT.md)

These apply to all phases and must be honored:

1. **Palette only:** No new accent colors. Green/red are semantic tokens only, not brand choices.
2. **Typography pairing:** `--display` (Archivo) for value, `--mono` (JetBrains Mono) for label and badge. Body (`--font`) not used in StatCard.
3. **Always-on-cream surfaces:** The `glass` class uses `var(--g-bg)` which is `rgba(255,255,255,0.55)` light / `rgba(40,37,34,0.7)` dark — never pure white.
4. **No raster assets:** Sparkline is SVG-based; no images.
5. **Accessibility gate:** axe-core zero violations required. StatCard is purely presentational; ensure the `change` string is accessible (no color-only communication — the text itself conveys direction alongside color). Consider `aria-label` on the card if needed.
6. **Reduced motion:** StatCard itself has no animations. Sparkline animations (if any added in Phase 19) are covered by Phase 19's contract.
7. **CSS class namespace:** No `ds-*` class required for StatCard per handoff — it uses `glass` utility class directly. No new CSS needed if all styling is inline (following Avatar/RollingNumber pattern).
8. **Icon stroke convention:** No icons used in the canonical trend badge (badge is text-only). If a chevron is added for accessibility, use 1.5px stroke / 24×24 / currentColor.
9. **React + TypeScript only:** No additional libraries.
10. **Dark mode:** Handled automatically via `glass` class token flip and `var(--green)` / `var(--red)` token flip. No explicit dark-mode overrides needed in the component.

---

## Component Placement Decision

**Place in: `src/display/StatCard/`**

Rationale:
- `src/display/` already contains `Avatar` and `RollingNumber` — pure presentational/display-only components with no interactive state.
- StatCard has no interactive state and is a pure display composition.
- `src/data-display/` is for data-manipulation components (Tabs, Accordion, Calendar, Table) that have more complex interaction models.
- The component has no `ds-*` CSS class (no new CSS blocks needed) — aligns with the `display/` pattern where styling is inline.

---

## Glass Class Details

From `src/utilities.css` [VERIFIED]:
```css
.glass {
  background: var(--g-bg);           /* light: rgba(255,255,255,0.55) / dark: rgba(40,37,34,0.7) */
  backdrop-filter: blur(var(--g-blur)); /* 14px */
  -webkit-backdrop-filter: blur(var(--g-blur));
  border: 1px solid var(--g-bd);    /* light: rgba(255,255,255,0.5) / dark: rgba(255,255,255,0.08) */
  border-radius: var(--radius-xl);  /* 16px */
}
```

**Critical:** `.glass` sets `border-radius: var(--radius-xl)` = 16px by default. StatCard needs
`borderRadius: 12` per handoff. The inline style override must be applied: `style={{ borderRadius: 12 }}`.
The CSS specificity of inline styles wins over the class rule, so this works correctly.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ds-universal StatCard (chevron + inline spark) | ds-dataviz StatCard (badge pill + delegated Sparkline) | Phase 19/20 split | Cleaner — chart logic in Sparkline, badge is text-only |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | vite.config.ts / vitest.config implied |
| Quick run command | `npm test -- --reporter=dot src/display/StatCard` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-20-01 | Renders label in mono uppercase | unit | `npm test -- src/display/StatCard/StatCard.test.tsx` | ❌ Wave 0 |
| REQ-20-01 | Renders value with Archivo 800 28px styles | unit | same | ❌ Wave 0 |
| REQ-20-01 | Positive changeDir → green badge bg + text | unit | same | ❌ Wave 0 |
| REQ-20-01 | Negative changeDir → red badge bg + text | unit | same | ❌ Wave 0 |
| REQ-20-01 | No change prop → no badge rendered | unit | same | ❌ Wave 0 |
| REQ-20-01 | data prop → Sparkline rendered | unit | same | ❌ Wave 0 |
| REQ-20-01 | No data prop → no Sparkline rendered | unit | same | ❌ Wave 0 |
| REQ-20-01 | glass class applied to root | unit | same | ❌ Wave 0 |
| REQ-20-01 | axe-core zero violations | a11y | Storybook test-runner | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- src/display/StatCard/StatCard.test.tsx`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/display/StatCard/StatCard.test.tsx` — covers REQ-20-01 unit behaviors
- [ ] `src/display/StatCard/StatCard.stories.tsx` — covers 3 required story variants + axe-core

---

## Environment Availability

Step 2.6: SKIPPED — StatCard is a pure React/CSS composition with no external tool dependencies beyond the existing project stack (Node, npm, React, TypeScript, Vitest, Storybook — all confirmed present in package.json).

---

## Open Questions (RESOLVED)

1. **Sparkline full-width behavior**
   - RESOLVED: Use `width={100}` (fixed, matches all handoff examples in ds-dataviz.jsx). "Full card width" means placement below the value row, not responsive measurement. Consumers who need fluid width wrap in a flex container.

2. **Sparkline Phase 19 availability**
   - RESOLVED: Phase 20 plans declare Phase 19 as a hard dependency. Plan 020-01 Task 2 includes a pre-execution `ls src/display/Sparkline/index.tsx` guard that surfaces a blocker if Phase 19 is not complete. Tests use `vi.mock("../Sparkline")` so Phase 20 tests compile and run independently.

3. **`changeDir` without `change` string**
   - RESOLVED: `sentimentColor` is derived from `changeDir` regardless of whether `change` string is provided. A card can show a colored Sparkline without a badge text (badge is only rendered when `change` prop is truthy).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `data` prop name (not `sparkData`) is canonical per ds-dataviz.jsx | Props Interface | Props section of implementation uses wrong name; breaking change |
| A2 | Sparkline component from Phase 19 accepts `color` as string prop | Standard Stack | Would need to use `accent` or different prop name |
| A3 | No `accent` prop needed — `changeDir` drives sparkline color | Props Interface | If handoff consumers expect `accent`, it needs to be added |
| A4 | `src/display/` is the correct placement (not `src/data-display/`) | Component Placement | Minor — only affects barrel export path |

Note: A1, A2, A3 are [VERIFIED] against ds-dataviz.jsx lines 94-145 and REQ-19-01 respectively. A4 is [ASSUMED] based on pattern analysis.

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/design-system/ds-dataviz.jsx` — canonical StatCard layout, trend badge values, Sparkline integration (lines 94–145) [VERIFIED]
- `design_handoff/design-system/ds-universal.jsx` — secondary StatCard reference (lines 1–53) [VERIFIED]
- `.planning/REQUIREMENTS.md` — REQ-20-01 acceptance criteria [VERIFIED]
- `src/utilities.css` — `.glass` class definition, token values [VERIFIED]
- `src/tokens.css` — `--green`, `--red`, `--display`, `--mono`, dark mode overrides [VERIFIED]
- `src/display/Avatar/index.tsx` — display component structure pattern [VERIFIED]
- `src/index.ts` — barrel export pattern [VERIFIED]

### Secondary (MEDIUM confidence)
- `.planning/PROJECT.md` — locked design constraints (typography, palette, accessibility gate) [VERIFIED]
- `.planning/ROADMAP.md` — Phase 20 success criteria, dependency on Phase 19 [VERIFIED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — React/TS/CSS confirmed project-wide; Sparkline dependency confirmed by ROADMAP
- Architecture: HIGH — Two handoff sources cross-referenced with REQUIREMENTS; canonical source identified
- Exact pixel values: HIGH — VERIFIED directly from ds-dataviz.jsx and REQ-20-01
- Pitfalls: HIGH — Derived from observable discrepancies between the two handoff sources
- Component placement: MEDIUM — Inferred from existing pattern, no explicit rule stated

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable — no external dependencies, pure React composition)
