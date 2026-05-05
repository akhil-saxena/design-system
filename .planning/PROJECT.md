# Project: JobDash Design System

Updated: 2026-05-05

## Core Value

A pixel-precise, fully accessible React + TypeScript component library that powers the JobDash job-application tracker — every component passes axe-core with zero violations, covers light and dark mode, and adheres to the cream/ink/amber visual identity.

## Product Context

JobDash is a job-application tracking web product. The design system is its sole UI kit. 53 sections across 10 groups: Foundation, Layout, Inputs, Surfaces, Data Display, Feedback, Navigation, Patterns, Interaction, Sample Screens.

**Repo:** ~/Documents/workspace/design-system  
**Stack:** React + TypeScript + CSS custom properties (web, Storybook as dev environment)

## Milestone History

| Milestone | Phases | Status | Shipped |
|-----------|--------|--------|---------|
| Milestone 1 — Foundation & Core Primitives | 1–16 | Complete | Before 2026-05-05 |
| Milestone 2 — Advanced Components | 17–27 | In progress | — |

## Success Metric

All missing components published to Storybook with passing axe-core scans and full light/dark mode coverage.

---

## Locked Design Constraints

These rules define the visual identity. Deviating from any of them corrupts the brand. They are non-negotiable for all phases.

### 1. Cream + Ink + Amber Palette Only

The palette is warm-neutral cream (never pure white), near-black ink (never pure black), and amber as the sole saturated brand accent. No additional accent colors may be introduced as design choices — blue, green, red, and purple exist exclusively as semantic/data-viz tokens, not as brand variants.

Exact light-mode values:
- `--cream: #f5f3f0` — app bg, primary surface
- `--cream-2: #ece8e3` — raised cards, secondary surface
- `--cream-3: #e7e2dc` — subtle wells, tertiary surface
- `--ink: #292524` — primary text, dark accents
- `--ink-2: #4a4641` — body copy
- `--ink-3: #544e48` — captions, tertiary text
- `--ink-4: #8a8380` — hints, quaternary text
- `--ink-5: #d6d3d1` — disabled text, dividers
- `--amber: #f59e0b` — brand primary, CTAs, focus accent
- `--amber-d: #7c2d12` — amber on light bg (AAA-safe)
- `--amber-l: #fef3c7` — amber soft tint, callouts
- `--rule: rgba(0,0,0,.10)` — borders, dividers

Dark-mode overrides (body.dark):
- `--cream: #1c1917` | `--cream-2: #292524` | `--cream-3: #44403c`
- `--ink: #f5f3f0` | `--ink-2: #d6d3d1` | `--ink-3: #b8b3af`
- `--ink-4: #aaa39e` | `--ink-5: #44403c`
- `--amber-d: #fbbf24` | `--rule: rgba(255,255,255,.10)`

Vivid variants (static in both modes — charts, badges, status dots):
- `--amber-vivid: #f59e0b` | `--blue-vivid: #3b82f6` | `--purple-vivid: #8b5cf6`
- `--green-vivid: #22c55e` | `--red-vivid: #ef4444`

### 2. Borders Over Shadows

Cards use a `1px var(--rule)` border plus a `--cream-2` raised background. Drop shadows (`--shadow-3`, deep dialog shadow) are reserved for genuinely-floating elements: modals, popovers, command palette. Never add shadow to a card that could use a border instead.

Shadow scale:
- `--shadow-1: 0 1px 2px rgba(0,0,0,.05)` — subtle lift
- `--shadow-2: 0 4px 12px rgba(0,0,0,.08)` — card hover
- `--shadow-3: 0 12px 32px rgba(0,0,0,.12)` — floating elements
- Deep dialog: `0 16px 48px rgba(0,0,0,.18)` (intentional, exceeds scale)

### 3. Display + Mono Typography Pairing

- `--display: 'Archivo', system-ui, sans-serif` — headlines, card titles
- `--mono: 'JetBrains Mono', ui-monospace, monospace` — eyebrows, codes, numbers, labels
- Body: `'Inter', system-ui, sans-serif` — page default, body copy

Letter-spacing: display text tightened `-0.02em` to `-0.035em`; monospace eyebrows loosened `+0.05em` to `+0.12em`; body/UI text at `0`.

### 4. Always-On-Cream Surfaces

Page background is always `--cream` — never pure white (`#ffffff`). This warmth is the most distinctive visual cue of the system.

### 5. Always-Dark Surfaces Use Hardcoded Values

Surfaces that must remain dark in both light and dark mode (code blocks, 500 error pages, dark cards) MUST use hardcoded `#1c1917` bg with `#f5f3f0` text — NOT `var(--cream)` / `var(--ink)`. This prevents dark-mode from producing cream-on-cream unreadability.

### 6. Inverted Badge/Pill Chrome

Badge/pill chrome that inverts between modes: pair `var(--ink)` bg with `var(--cream)` text. Both tokens flip together in dark mode, maintaining readability without separate dark-mode overrides.

### 7. Icon Conventions

All icons: `1.5px` stroke, `24x24` viewBox, `stroke="currentColor"`. Lucide / Heroicons / Phosphor are acceptable substitutes provided line-weight matches. No raster icons or images anywhere in the component library.

### 8. CSS Class Name Protocol

The `ds-*` class namespace is a cross-component contract. Components must apply the correct class to remain visually consistent across the system. Key classes: `ds-btn`, `ds-input`, `ds-badge`, `ds-checkbox`, `ds-overlay`, `ds-cmd`, `ds-kbd`, `ds-relative-time`, `ds-page-btn`, `glass` — see constraints.md CONSTRAINT-007 for the full list.

### 9. Accessibility Gate

WCAG 2.2 AAA for body text; AA-or-better for all UI elements. Every interactive element must show a visible focus ring using `--focus-ring: 0 0 0 3px rgba(245,158,11,.45)` (light) / `0 0 0 3px rgba(251,191,36,.5)` (dark). axe-core must pass with zero violations on every component before it is considered shipped.

### 10. Reduced Motion Contract

All animations respect `prefers-reduced-motion: reduce`. Animations cap at 200ms or fall back to instant state changes.

---

## Key Decisions Log

| Phase | Decision | Source |
|-------|----------|--------|
| All | React + TypeScript only; no other framework | DECISION-001 |
| All | CSS custom properties for theming; no JS recompute | DECISION-002 |
| All | body.dark class toggle; localStorage persistence | DECISION-003 |
| All | Always-dark surfaces hardcode #1c1917 / #f5f3f0 | DECISION-004 |
| All | Icon stroke 1.5px / 24x24 / currentColor | DECISION-006 |
| All | No raster assets anywhere | DECISION-007 |
| All | WCAG AAA body / AA UI; axe-core zero violations | DECISION-008 |
| All | prefers-reduced-motion cap at 200ms | DECISION-009 |
| 21 | ColorPicker: 6 sub-parts, 10 preset swatches, 3 tonal strips | DECISION-010, 011 |
| 18 | ConfirmDialog 4-tone system (danger/warn/success/neutral) | DECISION-012 |
| 18 | TypeToConfirm: default guard word "DELETE", case-sensitive | DECISION-013 |
| 23 | DataGrid column schema + interaction model | DECISION-014 |
| 23 | DataGrid status-to-badge and priority-to-dot mapping | DECISION-015 |
| 19 | Sparkline SVG geometry formulas (exact, not approximate) | DECISION-016 |
| 19 | MiniDonut SVG arc formula (exact) | DECISION-017 |
| 19 | MiniBar flexbox layout model | DECISION-018 |
| 22 | CommandPalette Cmd+K / Ctrl+K, window-level listeners, unmount cleanup | DECISION-019 |
| 17 | Pagination: full (numbered) + compact (N/M) variants | DECISION-020 |

---

## Technical Constraints Summary

- Theming: `body.dark` class + CSS cascade; no JS color recompute
- DataGrid depends on Badge, Checkbox, Button already being shipped (phases 1–16)
- ConfirmDialog is always-light glass surface (rgba(255,255,255,.97)) — not token-driven internally
- Sparkline Y formula: `y = height - ((v - min) / range) * (height - 4) - 2`
- MiniDonut arc: `strokeDashoffset = circumference * (1 - Math.min(value/max, 1))`
- CommandPalette: Cmd+K listener on `window`; must remove on unmount
- TypeToConfirm comparison is case-sensitive, no trim
- Phases 24–27 are blocked pending second ingest of spec files
