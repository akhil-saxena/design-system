# Phase 19: DataViz Primitives — Research

**Researched:** 2026-05-05
**Domain:** SVG / CSS chart primitives in React + TypeScript
**Confidence:** HIGH — all formulas extracted directly from SPEC source (ds-dataviz.jsx);
no framework library; all logic is first-party math.

---

## Summary

Phase 19 delivers three zero-dependency chart primitives: `Sparkline` (SVG polyline),
`MiniDonut` (SVG ring arc), and `MiniBar` (CSS flexbox bar chart). The reference
implementation lives in `design_handoff/design-system/ds-dataviz.jsx` and is complete
and unambiguous — every formula, prop name, default value, and style detail is specified
verbatim there. No external charting library is needed or appropriate; the entire
rendering surface is inline SVG or inline JSX styles.

All three components are purely presentational. They hold no internal state beyond
what React inlines during render. MiniDonut is the only one that uses a CSS transition
(`stroke-dashoffset 0.6s ease-out`), which must be gated with `useReducedMotion()` —
the project already has this hook at `src/hooks/useReducedMotion.ts`.

Component placement follows the existing pattern: display-only primitives without
data-wrangling concerns belong in `src/display/`. RollingNumber lives there as the
canonical precedent. These three will join it. `data-display/` is reserved for
components that arrange or paginate data (Breadcrumbs, Table, Pagination, etc.).

**Primary recommendation:** Implement all three as TypeScript functional components in
`src/display/Sparkline/`, `src/display/MiniDonut/`, and `src/display/MiniBar/` — one
plan per component (CSS → component → stories → tests → export).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Sparkline rendering | Browser/Client (SVG) | — | Pure SVG element, no server or API concern |
| MiniDonut arc math | Browser/Client (SVG) | — | Geometry computed in render function, no I/O |
| MiniBar layout | Browser/Client (CSS flex) | — | CSS layout, no data persistence |
| Reduced-motion gating | Browser/Client (hook) | — | matchMedia query, client-only |
| Token-based colors | Design token system | — | CSS custom properties from tokens.css |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-19-01 | Sparkline — SVG polyline with normalized Y, optional fill, terminal dot | Exact formula confirmed in ds-dataviz.jsx line 10; viewBox derived from width/height props |
| REQ-19-02 | MiniDonut — SVG ring arc animated from 12 o'clock, track = var(--cream-2) | Exact formula (r, circumference, strokeDashoffset) confirmed in ds-dataviz.jsx lines 33-43 |
| REQ-19-03 | MiniBar — flex-bottom-aligned bars, 70% max height, value + category labels | Exact CSS structure confirmed in ds-dataviz.jsx lines 47-64 |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | already in project | Component rendering | Project foundation |
| TypeScript | already in project | Props typing | Project foundation |
| SVG (native) | browser-native | Sparkline + MiniDonut rendering | No library needed; geometry is simple |
| CSS flexbox (native) | browser-native | MiniBar layout | Single-row bar chart needs no library |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useReducedMotion` | src/hooks | Gate MiniDonut stroke-dashoffset transition | REQ-19-02 — required by CONSTRAINT-006 |
| `@storybook/react` | already in project | Stories | Standard for all components |
| `vitest` + `@testing-library/react` | already in project | Unit tests | Standard for all components |
| `axe-core` | already in project | Accessibility scan | Required by all phase requirements |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native SVG | Recharts / Chart.js / Victory | Libraries add 40-200 KB and are overkill for sparklines and mini donuts; spec explicitly says "no external charting library" |
| Inline styles for MiniBar | CSS module / CSS class | All three reference implementations use inline styles; CSS-only approach for MiniBar would need primitives.css additions for no benefit since no pseudo-state is needed |

**Installation:** No new packages needed — all dependencies already present.

---

## Architecture Patterns

### System Architecture Diagram

```
Consumer (StatCard, dashboard page)
        │
        │ props (data, color, fill, size, …)
        ▼
┌────────────────────────────────────────┐
│           Display Tier                 │
│  src/display/Sparkline/index.tsx       │
│  src/display/MiniDonut/index.tsx       │
│  src/display/MiniBar/index.tsx         │
│                                        │
│  Sparkline: pure SVG  ─────────────── SVG viewBox, polyline, path, circle
│  MiniDonut: pure SVG + hook ────────── SVG circle x2, useReducedMotion
│  MiniBar:   pure JSX/CSS ──────────── div flex container + bar divs
└────────────────────────────────────────┘
        │
        │ CSS custom properties (--amber, --cream-2, --ink-3, --ink-4)
        ▼
   tokens.css  ──── resolves in both light and dark mode
```

### Recommended Project Structure
```
src/
├── display/
│   ├── Avatar/
│   ├── RollingNumber/
│   ├── Sparkline/         ← NEW
│   │   ├── index.tsx
│   │   ├── Sparkline.stories.tsx
│   │   └── Sparkline.test.tsx
│   ├── MiniDonut/         ← NEW
│   │   ├── index.tsx
│   │   ├── MiniDonut.stories.tsx
│   │   └── MiniDonut.test.tsx
│   └── MiniBar/           ← NEW
│       ├── index.tsx
│       ├── MiniBar.stories.tsx
│       └── MiniBar.test.tsx
└── index.ts               ← add three export lines
```

### Pattern 1: Sparkline SVG Math (VERIFIED from ds-dataviz.jsx)

**What:** Normalizes an array of numbers onto a fixed-height SVG canvas using a
min/max/range formula. Handles flat data (all equal values) via `range = max - min || 1`.

**X coordinate:** evenly spaced — `x = (i / (data.length - 1)) * width`

**Y coordinate:** `y = height - ((v - min) / range) * (height - 4) - 2`
- The `- 2` and `height - 4` provide a 2px top/bottom margin so the terminal dot
  (r=2.5) is never clipped by the SVG edge.

**Fill path:** `M0,${height} L${points} L${width},${height} Z`
- Starts at bottom-left, draws along the polyline, returns to bottom-right, closes.
- Fill opacity is 0.1 (10%) — do NOT apply transparency via rgba; the spec uses
  `fill={color}` + `opacity=".1"` as separate SVG attributes on the `<path>`.

**Terminal dot:** positioned at `(width, y_last)` — `cx={width}` not `cx={x_last}`.
The reference derives x from `width` directly (last point = rightmost edge).

**viewBox:** `0 0 ${width} ${height}` — matches the width/height props exactly.
`display: block` on `<svg>` prevents inline-block gap below the element.

```tsx
// Source: design_handoff/design-system/ds-dataviz.jsx lines 4-29
function Sparkline({ data, width = 100, height = 28, color = 'var(--amber)', fill = true }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `M0,${height} L${points} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={fillPath} fill={color} opacity=".1" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = data[data.length - 1];
        const x = width;
        const y = height - ((last - min) / range) * (height - 4) - 2;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}
```

### Pattern 2: MiniDonut Arc Math (VERIFIED from ds-dataviz.jsx)

**What:** Two concentric `<circle>` elements on the same SVG. Track circle is always
visible with `var(--cream-2)`. Progress arc clips itself via `strokeDasharray` /
`strokeDashoffset`. Global `-90deg` rotation moves the 3 o'clock SVG zero-point to
12 o'clock.

**Formulas (exact — do not approximate):**
```
r              = (size - strokeWidth) / 2
circumference  = 2 * Math.PI * r
pct            = Math.min(value / max, 1)
strokeDasharray   = circumference          // full circle length
strokeDashoffset  = circumference * (1 - pct)  // gap = undrawn portion
```

**Center:** `cx = cy = size / 2`

**Transition:** `stroke-dashoffset 0.6s ease-out` on the progress circle.
When `useReducedMotion()` is true, omit the transition style entirely (set to `none`
or remove the property). Do not use `var(--dur-*)` tokens for this value — the spec
gives an explicit `0.6s` that does not map to any token.

**Label placement:** The component does NOT render a label. Callers wrap MiniDonut in a
relative-positioned div and absolutely center the label text themselves (see reference
donut demo pattern in ds-dataviz.jsx lines 155-165).

```tsx
// Source: design_handoff/design-system/ds-dataviz.jsx lines 32-44
function MiniDonut({ value, max = 100, size = 48, strokeWidth = 5, color = 'var(--amber)' }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--cream-2)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s ease-out' }} />
    </svg>
  );
}
```

### Pattern 3: MiniBar CSS Flex Layout (VERIFIED from ds-dataviz.jsx)

**What:** A single flex row where each column is `flex: 1` with internal
`flex-direction: column; justify-content: flex-end`. The bar div's height is a
percentage of the column height: `(v / max) * 70%`.

**Key dimensions:**
- Container: `display: flex; align-items: flex-end; gap: 6px; height: {height}px`
- Column: `flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4; height: 100%; justify-content: flex-end`
- Bar: `width: 100%; maxWidth: 32px; border-radius: 4px 4px 0 0; height: (v/max)*70%; minHeight: 4px; opacity: 0.8; transition: height 0.4s ease-out`
- Value label: `font-family: var(--mono); font-size: 9px; color: var(--ink-3); font-weight: 600`
- Category label (optional): `font-family: var(--mono); font-size: 8px; color: var(--ink-4)`

**Max derivation:** `max = Math.max(...data)` — computed inside the component, not a prop.

```tsx
// Source: design_handoff/design-system/ds-dataviz.jsx lines 47-64
function MiniBar({ data, labels, height = 100, barColor = 'var(--amber)' }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', fontWeight: 600 }}>{v}</span>
          <div style={{ width: '100%', maxWidth: 32, borderRadius: '4px 4px 0 0',
            height: `${(v / max) * 70}%`, minHeight: 4,
            background: barColor, opacity: .8, transition: 'height .4s ease-out' }}></div>
          {labels && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-4)' }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Using a charting library:** The spec explicitly prohibits external charting libraries. Recharts, Victory, Chart.js are all out of scope.
- **Rounding SVG coordinates:** CONSTRAINT-011 states formulas must be reproduced exactly. Do not round x/y to integers — floating-point precision is required.
- **Rendering the value label inside MiniDonut:** The component renders no label. The caller wraps the SVG with `position: relative` and absolutely centers a `<div>`.
- **Applying fill opacity via rgba on the color prop:** The fill is `fill={color}` + `opacity=".1"` as separate SVG props, not `fill="rgba(...)"`. This lets any CSS color (including `var(--amber)`) work without parsing.
- **Using `var(--dur-4)` for MiniDonut transition:** The transition is `0.6s ease-out` — a spec-explicit value, not a motion token. Use the literal string.
- **Placing these in `src/data-display/`:** RollingNumber is the canonical precedent for display-only primitives with no data-arrangement logic — it lives in `src/display/`. These three follow suit.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection | Custom matchMedia listener | `useReducedMotion` from `src/hooks/useReducedMotion.ts` | Already ships in the project; SSR-safe; subscribes to runtime changes |
| Axe accessibility testing | Manual DOM inspection | `@axe-core/react` via existing Storybook axe addon | Already part of Storybook setup |
| SVG arc for ring chart | Hand-rolled `<path d="M...A...">` | Two `<circle>` elements with `strokeDasharray/strokeDashoffset` | Spec explicitly uses circles — simpler math, no arc sweep flags |

**Key insight:** All three charts avoid anything that could fail in an edge case
(arc sweep direction, arc overflow) by using the simplest possible SVG primitives.
Circles with dash offsets for donuts; polylines for sparklines; divs for bars.

---

## Common Pitfalls

### Pitfall 1: Flat/Single-Point Data Crashes Sparkline
**What goes wrong:** If all data values are equal, `range = max - min = 0`, causing
division-by-zero and producing `NaN` coordinates in the SVG `points` attribute.
**Why it happens:** The normalization formula divides by range.
**How to avoid:** Clamp: `const range = max - min || 1`. This is already in the
reference; transcribe it exactly.
**Warning signs:** SVG renders as a blank element; browser console shows `NaN` in SVG
attribute values.

### Pitfall 2: Single-Data-Point Sparkline Division Error
**What goes wrong:** `x = (i / (data.length - 1)) * width` — when `data.length === 1`,
denominator is 0. Result is `NaN` for x coordinate.
**Why it happens:** The formula assumes at least 2 points.
**How to avoid:** Guard: if `data.length < 2`, render a flat horizontal line or nothing.
A simple guard is `if (data.length < 2) return null;` or clamp denominator to 1.
**Warning signs:** Same NaN symptoms as Pitfall 1.

### Pitfall 3: MiniDonut Value Exceeds Max
**What goes wrong:** `strokeDashoffset` becomes negative, drawing more than a full circle.
**Why it happens:** No clamping on `value/max`.
**How to avoid:** `pct = Math.min(value / max, 1)` — already in the reference; preserve it.
**Warning signs:** Arc visually overdraws the track circle.

### Pitfall 4: Terminal Dot Uses Wrong X Coordinate
**What goes wrong:** Setting `cx` to the last calculated x from `data.length - 1` instead
of `width` produces a dot that doesn't sit at the right edge of the SVG.
**Why it happens:** The reference explicitly uses `const x = width` not
`x = (data.length-1) / (data.length-1) * width`. They are mathematically equal but
semantically clearer as `width`.
**How to avoid:** Use `cx={width}` exactly as in the reference.
**Warning signs:** Terminal dot appears slightly left of the SVG edge for floating-point
precision reasons with certain widths.

### Pitfall 5: MiniDonut Transition Fires on First Mount
**What goes wrong:** The `stroke-dashoffset` transition animates from 0 to the final
value on initial render, which looks like the arc is "filling up" on every page load.
**Why it happens:** CSS transitions trigger whenever the property changes, including the
initial value assignment.
**How to avoid:** This behavior is actually expected per spec ("animates stroke-dashoffset
to correct percentage"). No mitigation needed for phase 19; if suppression is desired
in a future iteration, use a `firstRender` ref pattern (see RollingNumber for precedent).
**Warning signs:** Not a bug — document for consumer awareness.

### Pitfall 6: MiniBar Height String Missing `%` Unit
**What goes wrong:** Setting `height: (v/max)*70` (a bare number) instead of
`height: \`${(v/max)*70}%\`` produces pixel heights, not percentage heights.
**Why it happens:** Inline style `height` without a unit is treated as pixels in React
(React adds `px` to bare numbers for height, but the formula result is a decimal).
**How to avoid:** Always use template literal: `` `${(v / max) * 70}%` ``.
**Warning signs:** Bars render at ~1-2px regardless of value.

---

## Code Examples

### Storybook Story Structure (modeled on RollingNumber.stories.tsx)

```tsx
// Source: pattern from src/display/RollingNumber/RollingNumber.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from ".";

const meta: Meta<typeof Sparkline> = {
  title: "Display/Sparkline",
  component: Sparkline,
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Default: Story = {
  args: { data: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24] },
};
export const NoFill: Story = {
  args: { data: [4, 6, 5, 8, 7, 10], fill: false },
};
export const FlatData: Story = {
  args: { data: [5, 5, 5, 5, 5] }, // tests range-clamp guard
};
export const CustomColor: Story = {
  args: { data: [60, 55, 50, 48, 42], color: "var(--red)" },
};
```

### Test Structure (modeled on RollingNumber.test.tsx)

```tsx
// Source: pattern from src/display/RollingNumber/RollingNumber.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from ".";

describe("Sparkline", () => {
  it("renders an SVG element", () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders a polyline with normalized points", () => {
    const { container } = render(<Sparkline data={[0, 10]} width={100} height={28} />);
    const polyline = container.querySelector("polyline");
    expect(polyline?.getAttribute("points")).toBe("0,26 100,2");
    // y_min = 28 - ((0-0)/10)*(28-4) - 2 = 26
    // y_max = 28 - ((10-0)/10)*(28-4) - 2 = 2
  });

  it("renders fill path when fill=true (default)", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />);
    expect(container.querySelector("path")).not.toBeNull();
  });

  it("omits fill path when fill=false", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} fill={false} />);
    expect(container.querySelector("path")).toBeNull();
  });

  it("clamps flat data without NaN", () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} />);
    const polyline = container.querySelector("polyline");
    expect(polyline?.getAttribute("points")).not.toContain("NaN");
  });

  it("renders terminal circle at x=width", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} width={80} />);
    const circle = container.querySelector("circle");
    expect(circle?.getAttribute("cx")).toBe("80");
  });
});
```

### MiniDonut Arc Verification Test

```tsx
describe("MiniDonut", () => {
  it("sets strokeDashoffset to 0 for value=max", () => {
    const { container } = render(<MiniDonut value={100} max={100} size={48} strokeWidth={5} />);
    const circles = container.querySelectorAll("circle");
    const arc = circles[1]; // second circle is the progress arc
    const circ = 2 * Math.PI * ((48 - 5) / 2); // 133.52...
    expect(Number(arc.getAttribute("stroke-dashoffset"))).toBeCloseTo(0, 1);
  });

  it("sets strokeDashoffset to circumference for value=0", () => {
    const { container } = render(<MiniDonut value={0} max={100} />);
    const circles = container.querySelectorAll("circle");
    const arc = circles[1];
    const r = (48 - 5) / 2;
    const circ = 2 * Math.PI * r;
    expect(Number(arc.getAttribute("stroke-dashoffset"))).toBeCloseTo(circ, 1);
  });
});
```

---

## Component Placement Decision

**`src/display/` — confirmed correct.**

Evidence:
- `RollingNumber` (animated number display, no data arrangement) → `src/display/`
- `Avatar` (profile image rendering, no data arrangement) → `src/display/`
- `Breadcrumbs`, `Table`, `Pagination`, `Calendar` (arrange/paginate data) → `src/data-display/`

Sparkline, MiniDonut, and MiniBar are rendering primitives that accept pre-processed
`number[]` data and paint it. They do not sort, paginate, or arrange data. They belong
in `src/display/`.

---

## Props Specification (from REQUIREMENTS.md + ds-dataviz.jsx)

### Sparkline
| Prop | Type | Default | Source |
|------|------|---------|--------|
| `data` | `number[]` | required | REQ-19-01 |
| `width` | `number` | `100` | ds-dataviz.jsx line 4 |
| `height` | `number` | `28` | ds-dataviz.jsx line 4 |
| `color` | `string` | `"var(--amber)"` | ds-dataviz.jsx line 4 |
| `fill` | `boolean` | `true` | REQ-19-01 |

### MiniDonut
| Prop | Type | Default | Source |
|------|------|---------|--------|
| `value` | `number` | required | REQ-19-02 |
| `max` | `number` | `100` | ds-dataviz.jsx line 32 |
| `size` | `number` | `48` | ds-dataviz.jsx line 32 |
| `strokeWidth` | `number` | `5` | ds-dataviz.jsx line 32 |
| `color` | `string` | `"var(--amber)"` | ds-dataviz.jsx line 32 |

### MiniBar
| Prop | Type | Default | Source |
|------|------|---------|--------|
| `data` | `number[]` | required | REQ-19-03 |
| `labels` | `string[]` | optional | ds-dataviz.jsx line 47 |
| `height` | `number` | `100` | ds-dataviz.jsx line 47 |
| `barColor` | `string` | `"var(--amber)"` | ds-dataviz.jsx line 47 |

---

## CSS Needs

**No new CSS classes in `primitives.css` are required.**

All three components use inline styles exclusively. The rationale:
- SVG attributes (`stroke`, `fill`, `strokeWidth`) cannot be expressed in CSS classes.
- The bar heights in MiniBar are dynamic percentages — incompatible with static CSS.
- There are no pseudo-state requirements for any of the three primitives (no `:hover`,
  no `:focus-visible`, no `:active`) — the components are purely presentational and
  non-interactive.

The `stroke-dashoffset` transition for MiniDonut is applied via inline `style={{}}`,
consistent with how Carousel and Accordion apply reduced-motion-contingent transitions
through data attributes + CSS in those files. For MiniDonut, since there's no CSS class
to hook into, the transition will be applied inline and conditionally omitted via
`useReducedMotion()`.

---

## Dark Mode

All three components inherit dark mode automatically through CSS custom property
resolution:
- `color` prop defaults to `"var(--amber)"` — `--amber` is defined identically in both
  modes (light `#f59e0b`, dark mode does not override `--amber`).
- MiniDonut track: `var(--cream-2)` — flips from `#ece8e3` (light) to `#292524` (dark)
  automatically.
- MiniBar value labels: `var(--ink-3)` — flips from `#544e48` to `#b8b3af` automatically.
- MiniBar category labels: `var(--ink-4)` — flips from `#8a8380` to `#aaa39e` automatically.

No dark-mode-specific code is needed in any component. Token usage alone covers it.

---

## Story Structure

### Sparkline Stories
1. **Default** — 16-point upward trend data, amber color, fill on
2. **NoFill** — same data, `fill={false}`
3. **FlatData** — `[5, 5, 5, 5, 5]` — tests the `range || 1` guard visually
4. **CustomColors** — same data shown in red, green, blue variants
5. **DarkMode** — wrapper with `body.dark` class showing all above on dark surface

### MiniDonut Stories
1. **Default** — `value={65}`, default amber
2. **MultiColor** — four donuts side-by-side: green 78%, amber 65%, blue 42%, purple 90%
   (mirrors reference in ds-dataviz.jsx lines 150-165)
3. **WithLabel** — caller wraps in relative div with centered label text
4. **EdgeCases** — value=0, value=100, value=150 (clamped to 100)
5. **DarkMode** — same with `.dark` wrapper

### MiniBar Stories
1. **WithLabels** — `data={[5, 8, 3, 2, 1]}`, `labels={['Wish', 'Applied', 'Screen', 'Interview', 'Offer']}`
2. **NoLabels** — same data, no `labels` prop
3. **WeeklyActivity** — `data={[2, 4, 1, 6, 3, 5, 3]}` with day labels
4. **DarkMode** — same with `.dark` wrapper

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SVG `<path>` arcs for donut | Two circles + strokeDasharray | Long-standing SVG pattern | Simpler — no arc sweep direction math |
| External chart libs for mini charts | Native SVG + CSS | Design system constraint | Zero bundle cost, full token integration |

**No deprecated APIs in scope.** All SVG attributes used (`strokeDasharray`, `strokeDashoffset`,
`strokeLinecap`, `strokeLinejoin`, `polyline`, `viewBox`) are stable across all modern browsers.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | MiniDonut `stroke-dashoffset` transition should be conditionally removed (not just paused) when `useReducedMotion()` returns true | Common Pitfalls / MiniDonut pattern | Low — if wrong, motion is still disabled; CONSTRAINT-006 says "cap at 200ms or instant" and instant = no transition property |

**All other claims are VERIFIED against ds-dataviz.jsx (SPEC source) or CITED from
REQUIREMENTS.md / constraints.md / codebase inspection.**

---

## Open Questions

1. **Edge case: `data.length === 1` for Sparkline**
   - What we know: Formula uses `data.length - 1` as denominator for x coordinate.
   - What's unclear: Spec doesn't address single-point arrays.
   - Recommendation: Return `null` (renders nothing) for arrays with fewer than 2 points. Add a console.warn in development.

2. **MiniDonut transition on first mount**
   - What we know: CSS transition fires on initial render — the arc animates from 0 on page load.
   - What's unclear: Whether this is intentional or unwanted.
   - Recommendation: Treat as intentional per spec ("animates stroke-dashoffset to correct percentage"). If unwanted, a `firstRender` ref (see RollingNumber pattern) can suppress it — but that's a phase 19 decision, not a blocker.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 19 is purely SVG/JSX code changes with no external services,
CLIs, databases, or runtime tools beyond the existing project dev environment.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/display/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-19-01 | Sparkline renders normalized SVG polyline with correct point math | unit | `npx vitest run src/display/Sparkline/Sparkline.test.tsx` | ❌ Wave 0 |
| REQ-19-01 | Fill path present/absent based on `fill` prop | unit | same | ❌ Wave 0 |
| REQ-19-01 | Terminal dot at `cx={width}` | unit | same | ❌ Wave 0 |
| REQ-19-01 | Flat data does not produce NaN | unit | same | ❌ Wave 0 |
| REQ-19-02 | MiniDonut strokeDashoffset = 0 at value=max | unit | `npx vitest run src/display/MiniDonut/MiniDonut.test.tsx` | ❌ Wave 0 |
| REQ-19-02 | MiniDonut strokeDashoffset = circumference at value=0 | unit | same | ❌ Wave 0 |
| REQ-19-02 | Track circle uses var(--cream-2) | unit | same | ❌ Wave 0 |
| REQ-19-02 | Value > max is clamped | unit | same | ❌ Wave 0 |
| REQ-19-03 | MiniBar renders correct number of bar divs | unit | `npx vitest run src/display/MiniBar/MiniBar.test.tsx` | ❌ Wave 0 |
| REQ-19-03 | Bar height uses (v/max)*70% formula | unit | same | ❌ Wave 0 |
| REQ-19-03 | Category labels render only when `labels` prop present | unit | same | ❌ Wave 0 |
| REQ-19-01/02/03 | axe-core zero violations | Storybook axe scan | Storybook axe addon (manual run) | ❌ — covered by existing axe setup |

### Sampling Rate
- **Per task commit:** `npx vitest run src/display/Sparkline` (or MiniDonut or MiniBar)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/display/Sparkline/Sparkline.test.tsx` — covers REQ-19-01
- [ ] `src/display/MiniDonut/MiniDonut.test.tsx` — covers REQ-19-02
- [ ] `src/display/MiniBar/MiniBar.test.tsx` — covers REQ-19-03
- [ ] `src/display/Sparkline/index.tsx` — component file
- [ ] `src/display/MiniDonut/index.tsx` — component file
- [ ] `src/display/MiniBar/index.tsx` — component file

*(No framework install needed — Vitest + Testing Library already present)*

---

## Security Domain

These are rendering-only primitives. They accept `number[]` and `string` props and
emit SVG/DOM. No authentication, sessions, access control, cryptography, or
user-supplied HTML is involved.

ASVS categories V2, V3, V4, V6 do not apply.

V5 (Input Validation): `color`/`barColor` is a CSS string passed directly to SVG `stroke`
or CSS `background`. No sanitization is performed. This is consistent with all other
design system components that accept CSS color strings — injection via `style` props in
React is safe against XSS because React does not interpret style values as executable code.
No additional input validation is required.

---

## Sources

### Primary (HIGH confidence — VERIFIED from codebase)
- `design_handoff/design-system/ds-dataviz.jsx` — complete reference implementations of all three components; all formulas, props, and defaults transcribed verbatim
- `.planning/REQUIREMENTS.md` — REQ-19-01, REQ-19-02, REQ-19-03 acceptance criteria
- `.planning/intel/constraints.md` — CONSTRAINT-011 (dataviz precision), CONSTRAINT-006 (motion), CONSTRAINT-001 (token values)
- `src/display/RollingNumber/index.tsx` — component file pattern for display primitives
- `src/display/RollingNumber/RollingNumber.test.tsx` — test pattern
- `src/display/RollingNumber/RollingNumber.stories.tsx` — story pattern
- `src/hooks/useReducedMotion.ts` — confirmed hook available for MiniDonut
- `src/index.ts` — confirmed export location and `src/display/` pattern
- `src/primitives.css` — confirmed no dataviz CSS classes exist; no additions needed

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` — phase dependencies and success criteria (cross-verified with REQUIREMENTS.md)

---

## Metadata

**Confidence breakdown:**
- Sparkline formula: HIGH — copied verbatim from SPEC source
- MiniDonut formula: HIGH — copied verbatim from SPEC source
- MiniBar layout: HIGH — copied verbatim from SPEC source
- Component placement (display/ not data-display/): HIGH — verified against src/index.ts + directory structure
- Dark mode behavior: HIGH — verified token definitions in constraints.md
- CSS needs (none): HIGH — verified primitives.css has no dataviz classes; all components use inline styles
- Reduced motion pattern: HIGH — verified useReducedMotion hook exists and is used by Accordion and Carousel

**Research date:** 2026-05-05
**Valid until:** 2026-08-05 (stable — no external dependencies; all formulas are first-party)
