# Phase 19: DataViz Primitives — Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 10 (7 new component/story/test files + 3 directories + 1 export addition)
**Analogs found:** 10 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/display/Sparkline/index.tsx` | component | transform | `src/display/RollingNumber/index.tsx` | role-match |
| `src/display/Sparkline/Sparkline.stories.tsx` | stories | — | `src/display/RollingNumber/RollingNumber.stories.tsx` | exact |
| `src/display/Sparkline/Sparkline.test.tsx` | test | — | `src/display/RollingNumber/RollingNumber.test.tsx` | exact |
| `src/display/MiniDonut/index.tsx` | component | transform | `src/display/RollingNumber/index.tsx` | role-match |
| `src/display/MiniDonut/MiniDonut.stories.tsx` | stories | — | `src/display/RollingNumber/RollingNumber.stories.tsx` | exact |
| `src/display/MiniDonut/MiniDonut.test.tsx` | test | — | `src/display/RollingNumber/RollingNumber.test.tsx` | exact |
| `src/display/MiniBar/index.tsx` | component | transform | `src/display/RollingNumber/index.tsx` | role-match |
| `src/display/MiniBar/MiniBar.stories.tsx` | stories | — | `src/display/RollingNumber/RollingNumber.stories.tsx` | exact |
| `src/display/MiniBar/MiniBar.test.tsx` | test | — | `src/display/RollingNumber/RollingNumber.test.tsx` | exact |
| `src/index.ts` | barrel export | — | `src/index.ts` lines 9-19 (Avatar block) + line 24 (RollingNumber line) | exact |

---

## Pattern Assignments

### `src/display/Sparkline/index.tsx` (component, transform)

**Analog:** `src/display/RollingNumber/index.tsx`

**Key deviation from analog:** RollingNumber uses `useRef` + `useEffect` for first-render suppression; Sparkline has no internal state — it is a pure render function (no hooks). Avatar uses `forwardRef`; RollingNumber does not. Sparkline follows RollingNumber's simpler no-forwardRef pattern because the consumer has no need to hold a ref to an `<svg>` element.

**Imports pattern** (`src/display/RollingNumber/index.tsx` lines 1-1):
```typescript
import { type CSSProperties } from "react";
// Sparkline has no hooks — omit useEffect/useRef.
// No forwardRef needed (mirrors RollingNumber, not Avatar).
```

**Props interface pattern** (`src/display/RollingNumber/index.tsx` lines 3-28):
```typescript
// Named export for type + function — same as RollingNumber.
// No HTMLAttributes extension — same as RollingNumber (display-only, no DOM event pass-through).
export interface SparklineProps {
  data: number[];
  width?: number;   // default 100
  height?: number;  // default 28
  color?: string;   // default "var(--amber)"
  fill?: boolean;   // default true
}
```

**Core render pattern** (`src/display/RollingNumber/index.tsx` lines 32-97):
```typescript
// Named function export (not default, not forwardRef) — matches RollingNumber line 32.
export function Sparkline({ data, width = 100, height = 28, color = "var(--amber)", fill = true }: SparklineProps) {
  // Guard: fewer than 2 points cannot produce a line.
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;   // clamp — prevents division by zero on flat data

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPath = `M0,${height} L${points} L${width},${height} Z`;

  // Terminal dot: use cx={width} directly (not derived from last index).
  const last = data[data.length - 1];
  const dotY = height - ((last - min) / range) * (height - 4) - 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {fill && <path d={fillPath} fill={color} opacity=".1" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={dotY} r="2.5" fill={color} />
    </svg>
  );
}
```

**No error handling block needed** — pure computation; no async, no try/catch.

---

### `src/display/MiniDonut/index.tsx` (component, transform)

**Analog:** `src/display/RollingNumber/index.tsx` (component shape) + `src/hooks/useReducedMotion.ts` (motion gating)

**Imports pattern** (`src/display/RollingNumber/index.tsx` line 1; `src/hooks/useReducedMotion.ts` line 9):
```typescript
import { useReducedMotion } from "../../hooks/useReducedMotion";
// No CSSProperties needed — all style is SVG attributes except one inline transition.
// No forwardRef — same rationale as Sparkline.
```

**Props interface pattern** (mirrors RollingNumber lines 3-28):
```typescript
export interface MiniDonutProps {
  value: number;
  max?: number;        // default 100
  size?: number;       // default 48
  strokeWidth?: number; // default 5
  color?: string;      // default "var(--amber)"
}
```

**Core render pattern** — reduced-motion hook from `src/hooks/useReducedMotion.ts` lines 9-22:
```typescript
export function MiniDonut({ value, max = 100, size = 48, strokeWidth = 5, color = "var(--amber)" }: MiniDonutProps) {
  const reducedMotion = useReducedMotion();

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);   // clamp — prevents overdraw

  const transition = reducedMotion ? undefined : "stroke-dashoffset 0.6s ease-out";
  // NOTE: use literal "0.6s ease-out" — not a var(--dur-*) token. Spec-explicit value.

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", transform: "rotate(-90deg)" }}
    >
      {/* Track circle — always visible */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--cream-2)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={transition ? { transition } : undefined}
      />
    </svg>
  );
}
```

**useReducedMotion pattern** (`src/hooks/useReducedMotion.ts` lines 9-22):
```typescript
// SSR-safe: initializer returns false when window is undefined.
// Subscribes to matchMedia "change" event for runtime OS preference toggles.
// Import path from src/display/MiniDonut/: ../../hooks/useReducedMotion
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}
```

---

### `src/display/MiniBar/index.tsx` (component, transform)

**Analog:** `src/display/RollingNumber/index.tsx`

**Imports pattern** — no hooks, no forwardRef:
```typescript
import { type CSSProperties } from "react";
// All layout is inline styles — no CSS class names needed.
```

**Props interface pattern**:
```typescript
export interface MiniBarProps {
  data: number[];
  labels?: string[];   // optional category labels below each bar
  height?: number;     // default 100 (container height in px)
  barColor?: string;   // default "var(--amber)"
}
```

**Core render pattern** — inline styles only, no CSS classes:
```typescript
export function MiniBar({ data, labels, height = 100, barColor = "var(--amber)" }: MiniBarProps) {
  const max = Math.max(...data);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((v, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: bar-by-position rendering; index is the stable key
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", fontWeight: 600 }}>
            {v}
          </span>
          <div
            style={{
              width: "100%",
              maxWidth: 32,
              borderRadius: "4px 4px 0 0",
              height: `${(v / max) * 70}%`,   // template literal required — bare number gets px
              minHeight: 4,
              background: barColor,
              opacity: 0.8,
              transition: "height 0.4s ease-out",
            }}
          />
          {labels && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)" }}>
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### `src/display/Sparkline/Sparkline.stories.tsx` (stories)

**Analog:** `src/display/RollingNumber/RollingNumber.stories.tsx`

**Imports pattern** (lines 1-3):
```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from ".";
```

**Meta block pattern** (lines 197-236):
```typescript
const meta: Meta<typeof Sparkline> = {
  title: "Display/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "…one-line description…",
      },
    },
  },
  argTypes: {
    data:   { control: false, description: "Array of numbers to plot." },
    width:  { control: { type: "range", min: 40, max: 300, step: 4 }, description: "SVG width in px." },
    height: { control: { type: "range", min: 16, max: 80, step: 2 }, description: "SVG height in px." },
    color:  { control: "text", description: "Stroke + fill color; any CSS color." },
    fill:   { control: "boolean", description: "Show filled area under line." },
  },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;
```

**Story object pattern** (lines 241-252):
```typescript
export const Default: Story = {
  args: { data: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 18, 16, 20, 19, 24] },
  parameters: {
    docs: {
      description: { story: "…" },
      source: { code: `<Sparkline data={[4, 6, 5, 8, …]} />` },
    },
  },
};
```

**Dark mode decorator pattern** (lines 323-340):
```typescript
decorators: [
  (Story) => (
    <div
      className="dark"
      style={{ background: "#1c1917", padding: 32, borderRadius: 12, overflowX: "auto", minWidth: 0 }}
    >
      <Story />
    </div>
  ),
],
```

**Apply same structure for MiniDonut.stories.tsx and MiniBar.stories.tsx**, substituting component name and appropriate `title: "Display/MiniDonut"` / `title: "Display/MiniBar"`.

---

### `src/display/MiniDonut/MiniDonut.stories.tsx` (stories)

**Analog:** `src/display/RollingNumber/RollingNumber.stories.tsx`

Same meta/Story/decorator structure as Sparkline stories. Specific story shapes:
- `Default` — `args: { value: 65 }`
- `MultiColor` — render() returning four donuts side-by-side in flex row
- `WithLabel` — render() showing caller wrapping in `position: relative` div with centered text
- `EdgeCases` — render() showing value=0, value=100, value=150 (clamped)
- `DarkMode` — `.dark` wrapper decorator (copy lines 323-340 from RollingNumber.stories.tsx)

---

### `src/display/MiniBar/MiniBar.stories.tsx` (stories)

**Analog:** `src/display/RollingNumber/RollingNumber.stories.tsx`

Same meta/Story/decorator structure. Specific story shapes:
- `WithLabels` — `args: { data: [5, 8, 3, 2, 1], labels: ["Wish", "Applied", "Screen", "Interview", "Offer"] }`
- `NoLabels` — `args: { data: [5, 8, 3, 2, 1] }`
- `WeeklyActivity` — `args: { data: [2, 4, 1, 6, 3, 5, 3], labels: ["M", "T", "W", "T", "F", "S", "S"] }`
- `DarkMode` — `.dark` wrapper decorator

---

### `src/display/Sparkline/Sparkline.test.tsx` (test)

**Analog:** `src/display/RollingNumber/RollingNumber.test.tsx`

**Imports pattern** (lines 1-3):
```typescript
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from ".";
```

**Test structure pattern** (lines 4-50):
```typescript
describe("Sparkline", () => {
  it("renders an SVG element", () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders a polyline with normalized points", () => {
    const { container } = render(<Sparkline data={[0, 10]} width={100} height={28} />);
    const polyline = container.querySelector("polyline");
    // y_min = 28 - ((0-0)/10)*(28-4) - 2 = 26; y_max = 28 - ((10-0)/10)*(28-4) - 2 = 2
    expect(polyline?.getAttribute("points")).toBe("0,26 100,2");
  });

  it("renders fill path when fill=true (default)", () => { … });
  it("omits fill path when fill=false", () => { … });
  it("clamps flat data without NaN", () => { … });
  it("renders terminal circle at cx=width", () => { … });
  it("returns null for data.length < 2", () => { … });
});
```

**Query pattern from analog** (lines 7-8): use `container.querySelector` / `container.querySelectorAll` for SVG child elements; use `screen.getByLabelText` only for aria-labeled elements.

**Apply same structure for MiniDonut.test.tsx and MiniBar.test.tsx.**

---

### `src/display/MiniDonut/MiniDonut.test.tsx` (test)

**Analog:** `src/display/RollingNumber/RollingNumber.test.tsx`

Key assertions to cover (from RESEARCH.md validation map):
```typescript
describe("MiniDonut", () => {
  it("renders two circle elements (track + arc)", () => {
    const { container } = render(<MiniDonut value={50} />);
    expect(container.querySelectorAll("circle").length).toBe(2);
  });

  it("track circle has stroke var(--cream-2)", () => {
    const { container } = render(<MiniDonut value={50} />);
    const track = container.querySelectorAll("circle")[0];
    expect(track.getAttribute("stroke")).toBe("var(--cream-2)");
  });

  it("strokeDashoffset = 0 for value=max", () => {
    const { container } = render(<MiniDonut value={100} max={100} size={48} strokeWidth={5} />);
    const arc = container.querySelectorAll("circle")[1];
    const circ = 2 * Math.PI * ((48 - 5) / 2);
    expect(Number(arc.getAttribute("stroke-dashoffset"))).toBeCloseTo(0, 1);
  });

  it("strokeDashoffset = circumference for value=0", () => { … });
  it("clamps value > max to full circle", () => { … });
});
```

---

### `src/display/MiniBar/MiniBar.test.tsx` (test)

**Analog:** `src/display/RollingNumber/RollingNumber.test.tsx`

Key assertions:
```typescript
describe("MiniBar", () => {
  it("renders one bar div per data point", () => {
    const { container } = render(<MiniBar data={[5, 8, 3]} />);
    // Query the bar divs by their specific style: borderRadius "4px 4px 0 0"
    // or by counting direct children of the flex container.
  });

  it("tallest bar gets height close to 70%", () => {
    const { container } = render(<MiniBar data={[5, 10, 3]} />);
    // max=10; bar for 10 → height = (10/10)*70 = "70%"
  });

  it("renders category labels when labels prop is provided", () => { … });
  it("omits category labels when labels prop is absent", () => { … });
  it("renders value label for each bar", () => { … });
});
```

---

### `src/index.ts` (barrel export addition)

**Analog:** `src/index.ts` lines 9-19 (Avatar export block) and line 24 (RollingNumber single-line export)

**Placement:** Add three new export lines in the `display` section, after the existing `RollingNumber` export on line 24. The display section currently contains Avatar (lines 9-19) and RollingNumber (line 24).

**Single-type export pattern** (line 24 — RollingNumber):
```typescript
export { RollingNumber, type RollingNumberProps } from "./display/RollingNumber";
```

**Multi-type export pattern** (lines 9-19 — Avatar, for reference when exporting multiple types):
```typescript
export {
  Avatar,
  AvatarStack,
  deriveGradient,
  deriveInitials,
  type AvatarPresence,
  type AvatarPresencePosition,
  type AvatarProps,
  type AvatarSize,
  type AvatarStackProps,
} from "./display/Avatar";
```

**New export lines to add** (after line 24, simple single-export form matches RollingNumber):
```typescript
export { Sparkline, type SparklineProps } from "./display/Sparkline";
export { MiniDonut, type MiniDonutProps } from "./display/MiniDonut";
export { MiniBar, type MiniBarProps } from "./display/MiniBar";
```

---

## Shared Patterns

### No-CSS-class inline style pattern
**Source:** `src/display/RollingNumber/index.tsx` lines 52-96; `src/display/Avatar/index.tsx` lines 124-140
**Apply to:** All three component files (Sparkline, MiniDonut, MiniBar)

All three new components use inline styles exclusively. No `className` prop is threaded, no `ds-atom-*` CSS class names are added. This is the correct pattern for components that have no pseudo-state (no `:hover`, no `:focus-visible`) and whose visual properties are entirely dynamic. Contrast with ProgressBar (`src/feedback/ProgressBar/index.tsx`) which uses `ds-atom-progress` class names because it has CSS-driven animations in `primitives.css`.

```typescript
// Avatar pattern (lines 124-140): build a CSSProperties object then spread into style={}
const containerStyle: CSSProperties = {
  position: "relative",
  width: size,
  // …
  ...style,  // allow consumer override via style prop
};
return <div ref={ref} style={containerStyle} {...rest} />;

// RollingNumber pattern (line 52): pass style prop directly, no spread-and-merge
return <span … style={style} />;
```

For Sparkline and MiniDonut: use `style={{ display: "block" }}` directly on `<svg>` — no `style` prop accepted from consumer (these are fixed-size widgets controlled by their own dimension props).

### Named function export (not default, not forwardRef)
**Source:** `src/display/RollingNumber/index.tsx` line 32
**Apply to:** Sparkline, MiniDonut, MiniBar

```typescript
export function RollingNumber({ … }: RollingNumberProps) { … }
```

No `export default`. No `forwardRef`. The Avatar pattern (`forwardRef`) applies to components that need a DOM ref for positioning/focus — none of the three dataviz primitives require that.

### biome-ignore lint comment for array index keys
**Source:** `src/display/RollingNumber/index.tsx` lines 65-66 and 86-87
**Apply to:** MiniBar (iterates `data.map((v, i) => …)`; index is the stable key)

```typescript
// biome-ignore lint/suspicious/noArrayIndexKey: bar-by-position rendering; index is the stable key
key={i}
```

Sparkline and MiniDonut do not produce JSX arrays with keys so this does not apply to them.

### Stories dark mode decorator
**Source:** `src/display/RollingNumber/RollingNumber.stories.tsx` lines 323-340
**Apply to:** DarkMode story in all three stories files

```typescript
decorators: [
  (Story) => (
    <div
      className="dark"
      style={{
        background: "#1c1917",
        padding: 32,
        borderRadius: 12,
        overflowX: "auto",
        minWidth: 0,
      }}
    >
      <Story />
    </div>
  ),
],
```

### Test import block
**Source:** `src/display/RollingNumber/RollingNumber.test.tsx` lines 1-3
**Apply to:** All three test files

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComponentName } from ".";
```

`screen` is only needed when using `getByLabelText`/`getByRole` queries. MiniDonut and MiniBar tests may only need `render` + `container` queries — import `screen` only if used.

---

## No Analog Found

None. All ten files have a clear analog in the codebase.

---

## Metadata

**Analog search scope:** `src/display/`, `src/feedback/`, `src/hooks/`, `src/index.ts`, `src/_internals/`
**Files scanned:** 8 source files read directly
**Pattern extraction date:** 2026-05-05
