# @akhil-saxena/design-system

Design System — accessible React primitives with semantic tokens. Warm-cream + ink + amber aesthetic with full light/dark mode.

Status: **v0.1.0 — first publishable release with 13 primitives (Wave 1 + Wave 2).**

Published to **GitHub Packages** (private registry, free under personal account quota). Requires auth to install — see below.

## Install

1. **One-time auth setup.** Generate a GitHub Personal Access Token (PAT) with `read:packages` scope at https://github.com/settings/tokens — copy the token (only shown once).
2. **Add to user-level `~/.npmrc`** (NEVER commit):
   ```
   //npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **In your project** (committed to repo), add a `.npmrc` file with the registry mapping:
   ```
   @akhil-saxena:registry=https://npm.pkg.github.com
   ```
4. **Install:**
   ```bash
   npm install @akhil-saxena/design-system
   ```

Peer deps: `react@^19`, `react-dom@^19`.

## Quick Start

Import the three CSS layers in your app's entry point (cascade order matters):

```ts
import "@akhil-saxena/design-system/tokens.css";       // :root + :root.dark CSS variables
import "@akhil-saxena/design-system/primitives.css";   // .ds-atom-* component styles
import "@akhil-saxena/design-system/utilities.css";    // .glass / .ds-label / .jd-markdown helpers
```

Then components:

```tsx
import { Button, Badge, Card } from "@akhil-saxena/design-system";

export function App() {
  return (
    <Card>
      <Badge tone="amber">Active</Badge>
      <Button variant="primary">Apply</Button>
    </Card>
  );
}
```

Toggle dark mode by adding `class="dark"` on `<html>` (NOT body — `:root.dark` selector targets `documentElement`).

## Primitives shipping in v0.1.0 (13)

Wave 1 — Atoms (8): Button, TextInput, Textarea, Badge, Chip, Avatar (+ AvatarStack), Checkbox, Radio (+ RadioGroup), Toggle.
Wave 2 — Controls (5): NumberStepper, RollingNumber, RangeSlider, StarRating.

Plus 4 hooks via `@akhil-saxena/design-system/hooks`: useFocusTrap, useClickOutside, useReducedMotion, useTokens.

Roadmap: 53 primitives total at v1.0.0 (matches design-handoff/ v1.0).

## Tokens

CSS custom properties in `tokens.css`. Color (cream/ink/amber + AAA-tuned blue/purple/green/red), typography (Inter body / Archivo display / JetBrains Mono), spacing (12-step 4..64px), radius (sm/md/lg/xl/pill), shadow (1/2/3), motion (--ease-out/in-out/spring + --dur-1..4), surface (--surf-1/2/3), focus (--focus + --focus-ring).

## Hooks

From `@akhil-saxena/design-system/hooks`:
- `useFocusTrap(containerRef, active)` — trap focus within an overlay
- `useClickOutside(ref, onOutside)` — fire callback on click outside ref
- `useReducedMotion()` — boolean reflecting prefers-reduced-motion
- `useTokens()` — read computed CSS custom property values at runtime

## Theming

Light is default. Add `class="dark"` to `<html>`:
```ts
document.documentElement.classList.toggle("dark");
```

## License

MIT © 2026 Akhil Saxena
