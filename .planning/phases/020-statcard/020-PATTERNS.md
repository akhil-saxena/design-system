# Phase 20: StatCard - Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 4 (3 new component files + 1 modified barrel)
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/display/StatCard/index.tsx` | component | transform (render-only) | `src/display/RollingNumber/index.tsx` | role-match (display primitive) |
| `src/display/StatCard/StatCard.stories.tsx` | stories | request-response | `src/display/RollingNumber/RollingNumber.stories.tsx` | exact |
| `src/display/StatCard/StatCard.test.tsx` | test | request-response | `src/display/RollingNumber/RollingNumber.test.tsx` | exact |
| `src/index.ts` | config | — | `src/index.ts` lines 24, 10-19 | exact (display section placement) |

---

## Pattern Assignments

### `src/display/StatCard/index.tsx` (component, transform)

**Primary analog:** `src/display/RollingNumber/index.tsx`
**Secondary analog:** `src/overlays/Card/index.tsx` (for glass surface + `data-variant` pattern)
**Design reference:** `design_handoff/design-system/ds-universal.jsx` lines 4–37

**Imports pattern** — copy from `src/overlays/Card/index.tsx` lines 1, `src/display/Avatar/index.tsx` line 1:
```typescript
import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";
```
StatCard uses `forwardRef` (matches Avatar/Card pattern for div-based display components). No hooks needed unless the sparkline data computation is non-trivial.

**No-hook display pattern** — from `src/display/RollingNumber/index.tsx` lines 32–41:
```typescript
export function RollingNumber({
  value,
  format,
  prefix,
  suffix,
  variant = "default",
  ariaLabel,
  className,
  style,
}: RollingNumberProps) {
```
StatCard similarly takes plain props with no side effects. Use a named function export (not `forwardRef`) if no ref forwarding is needed; use `forwardRef` (Card pattern, lines 45–60) if the root `<div>` ref should be forwarded.

**Glass surface pattern** — from `src/overlays/Card/index.tsx` lines 45–60:
```typescript
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "glass", className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`ds-atom-card${className ? ` ${className}` : ""}`}
      data-variant={variant}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});
```
StatCard wraps its content in the same glass surface used by Card. Use `className="ds-atom-card" data-variant="glass"` directly on the root div (or compose `<Card variant="glass">` — planner decides) rather than duplicating CSS.

**CSS class naming convention** — from `src/display/RollingNumber/index.tsx` lines 53–58:
```typescript
className={["ds-atom-rolling", className].filter(Boolean).join(" ")}
data-variant={variant === "default" ? undefined : variant}
```
StatCard's root class should follow the `ds-atom-<name>` prefix, e.g. `ds-atom-statcard`. Sub-elements use `ds-atom-statcard-label`, `ds-atom-statcard-value`, `ds-atom-statcard-change`, `ds-atom-statcard-spark`.

**`data-variant` pattern** — from `src/display/RollingNumber/index.tsx` line 55:
```typescript
data-variant={variant === "default" ? undefined : variant}
```
Omit `data-variant` when it would be the default value, so CSS can rely on attribute presence only.

**Design reference — StatCard props and structure** — from `design_handoff/design-system/ds-universal.jsx` lines 4–37:
```jsx
function StatCard({ label, value, change, changeDir, sparkData, accent }) {
  const up = changeDir === 'up';
  const changeColor = up ? 'var(--green)' : 'var(--red)';
  // sparkline: SVG polyline, 80×28, points derived from sparkData array
  // layout: padding 18px 20px, borderRadius 14, flex 1, minWidth 160
  // label: mono 9.5px, uppercase, letterSpacing .06em, color var(--ink-4)
  // value: display font, 800 weight, 28px, letterSpacing -.02em
  // change row: 11px, 600 weight, chevron SVG rotated 180° for "down"
  // sparkline SVG: opacity 0.5, stroke = accent prop
}
```
TypeScript interface to derive from this:
- `label: string`
- `value: string | number`
- `change?: string`
- `changeDir?: "up" | "down"`
- `sparkData?: number[]`
- `accent?: string`
- `className?: string`
- `style?: CSSProperties`

**`HTMLAttributes` spread pattern** — from `src/overlays/Card/index.tsx` lines 5–6, 57–59 and `src/display/Avatar/index.tsx` lines 7, 149:
```typescript
export interface CardProps extends HTMLAttributes<HTMLDivElement> { ... }
// then in render:
{...rest}
```
StatCard should extend `HTMLAttributes<HTMLDivElement>` and spread `...rest` onto the root div so consumers can attach `onClick`, `data-testid`, etc.

---

### `src/display/StatCard/StatCard.stories.tsx` (stories, request-response)

**Analog:** `src/display/RollingNumber/RollingNumber.stories.tsx`

**Meta block pattern** — lines 197–236:
```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from ".";

const meta: Meta<typeof StatCard> = {
  title: "Display/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "...",
      },
    },
  },
  argTypes: {
    // one entry per prop
  },
};
export default meta;
type Story = StoryObj<typeof StatCard>;
```

**SRC snippet map pattern** — lines 159–193: define a `const SRC = { ... }` object with raw source strings for each story, then reference via `parameters.docs.source.code`. This keeps story JSX clean and source blocks accurate.

**Static story pattern** — lines 241–252:
```typescript
export const Default: Story = {
  args: { label: "Applications", value: "24", change: "+12% this week", changeDir: "up", sparkData: [4,6,5,8,10,9,12] },
  parameters: {
    docs: {
      description: { story: "..." },
      source: { code: SRC.Default },
    },
  },
};
```

**Dark mode decorator pattern** — lines 323–340:
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
Include one `DarkMode` story using this decorator to verify glass surface adapts.

**Suggested story set for StatCard:**
- `Default` — single card with all props (args-driven, Playground)
- `Variants` — all four design reference instances side by side (`display: flex, gap: 14`)
- `NoSparkline` — `sparkData` omitted
- `TrendDown` — `changeDir="down"` with red chevron
- `DarkMode` — dark decorator wrapping a row of cards

---

### `src/display/StatCard/StatCard.test.tsx` (test, request-response)

**Analog:** `src/display/RollingNumber/RollingNumber.test.tsx`

**Imports pattern** — lines 1–4:
```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from ".";
```

**Test structure pattern** — lines 4–50: single `describe("StatCard", () => { ... })` block. Each `it()` tests one behavioral contract (rendering, class presence, conditional rendering). No mocking required for a pure display component.

**Selector strategy** — tests use `container.querySelector` for BEM-style class selectors (`".ds-atom-rolling-cell"`) and `screen.getByLabelText` for ARIA. StatCard tests should use:
- `container.querySelector(".ds-atom-statcard-label")` — verifies label renders
- `container.querySelector(".ds-atom-statcard-spark")` — verifies conditional SVG
- `screen.getByText(value)` — verifies value string renders
- `container.querySelector("[aria-hidden]")` on chevron SVG (matches RollingNumber `aria-hidden` pattern for decorative elements)

**Conditional render tests** — from lines 31–36 (suffix test, analogous):
```typescript
it("does not render sparkline when sparkData is omitted", () => {
  const { container } = render(<StatCard label="Applications" value="24" />);
  expect(container.querySelector(".ds-atom-statcard-spark")).toBeNull();
});
```

---

### `src/index.ts` (barrel export, display section)

**Analog:** `src/index.ts` existing display section, lines 10–19 and 24.

**Export placement** — StatCard export goes in the display section, immediately after `RollingNumber` (line 24):
```typescript
// current line 24:
export { RollingNumber, type RollingNumberProps } from "./display/RollingNumber";
// new line 25 (insert after):
export { StatCard, type StatCardProps, type StatCardChangeDir } from "./display/StatCard";
```

**Export style** — match the named-export + named-type pattern used by the display section:
```typescript
export { Avatar, AvatarStack, deriveGradient, deriveInitials, type AvatarPresence, ... } from "./display/Avatar";
export { RollingNumber, type RollingNumberProps } from "./display/RollingNumber";
// StatCard analogously:
export { StatCard, type StatCardProps, type StatCardChangeDir } from "./display/StatCard";
```
Only export types that consumers need at call sites. Internal sub-types (sparkline helpers) stay unexported.

---

## Shared Patterns

### Glass Surface CSS
**Source:** `src/primitives.css` lines 624–631
```css
.ds-atom-card[data-variant="glass"] {
  background: var(--surf-1);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
```
**Apply to:** `StatCard/index.tsx` root element. StatCard uses the same glass surface as Card. The planner must decide whether to reuse the `ds-atom-card` class directly (composing with Card) or define a new `ds-atom-statcard` class. Given that StatCard has a fixed layout (not freely-composed children), a dedicated class is preferable — but the CSS token values (`var(--surf-1)`, `var(--rule)`, `var(--radius-lg)`) are the correct references.

### CSS Token Vocabulary
**Source:** `design_handoff/design-system/ds-universal.jsx` lines 14–32; `src/primitives.css` (glass block above)
- Label: `var(--mono)` font, `var(--ink-4)` color
- Value: `var(--display)` font, weight 800, size 28px, `letter-spacing: -.02em`
- Trend up: `var(--green)` (or `var(--green-vivid)` for saturated)
- Trend down: `var(--red)` (or `var(--red-vivid)`)
- Sparkline stroke: consumer-supplied `accent` prop (defaults to `var(--amber)`)
**Apply to:** `StatCard/index.tsx` inline styles or new CSS rules in `primitives.css`.

### `data-variant` Attribute Convention
**Source:** `src/display/RollingNumber/index.tsx` line 55; `src/overlays/Card/index.tsx` line 53
```typescript
data-variant={variant === "default" ? undefined : variant}
// Card:
data-variant={variant}  // always set because no "default" sentinel
```
**Apply to:** `StatCard/index.tsx` if variant support is added (e.g., future `accent` preset variants).

### `forwardRef` + `HTMLAttributes` spread
**Source:** `src/display/Avatar/index.tsx` lines 96–109; `src/overlays/Card/index.tsx` lines 45–59
```typescript
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { ..., style, ...rest },
  ref,
) {
  return <div ref={ref} style={containerStyle} {...rest}>
```
**Apply to:** `StatCard/index.tsx` — use this pattern so ref and arbitrary HTML attributes are forwarded.

### Storybook Dark Mode Decorator
**Source:** `src/display/RollingNumber/RollingNumber.stories.tsx` lines 323–340
```typescript
decorators: [
  (Story) => (
    <div className="dark" style={{ background: "#1c1917", padding: 32, borderRadius: 12, overflowX: "auto", minWidth: 0 }}>
      <Story />
    </div>
  ),
],
```
**Apply to:** `StatCard.stories.tsx` `DarkMode` story.

### Vitest + Testing Library import block
**Source:** `src/display/RollingNumber/RollingNumber.test.tsx` lines 1–3
```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComponentName } from ".";
```
**Apply to:** `StatCard.test.tsx` — identical import block, replace component name.

---

## No Analog Found

All four files have close analogs. No entries here.

---

## Metadata

**Analog search scope:** `src/display/`, `src/overlays/`, `src/index.ts`, `design_handoff/design-system/`
**Files scanned:** 8 source files read, 2 grep searches
**Pattern extraction date:** 2026-05-05
