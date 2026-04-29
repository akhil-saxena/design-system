# Handoff: JobDash Design System v1.0

## Overview

The **JobDash Design System** is a comprehensive UI kit and visual language for JobDash — a job-application tracking product. It defines tokens, components, patterns, illustrations, icons, and motion for an entire web product, plus mobile views, email templates, and status pages. The system targets **WCAG 2.2 AAA** for body text and AA-or-better for UI elements.

Scope: **53 sections** across 10 groups — Foundation, Layout, Inputs, Surfaces, Data Display, Feedback, Navigation, Patterns, Interaction, and Sample Screens — designed to support an entire product, not just a single feature.

## About the Design Files

The files in this bundle are **design references created in HTML** — interactive prototypes showing the intended look and behavior. They are NOT production code to copy directly.

Your task is to **recreate this design system in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns and component libraries — or, if no environment exists yet, choose the most appropriate framework for the project and implement the system there.

The HTML uses inline `<style type="text/babel">` JSX for fast prototyping; in a real codebase these should become proper components (e.g. `<Button>`, `<Card>`, `<Input>`) with the design tokens lifted into CSS variables, a Tailwind config, a Style Dictionary export, or whatever the codebase prefers.

## Fidelity

**High-fidelity (hifi).** Every section is pixel-precise: final colors, typography scale, spacing, shadows, motion timings, focus rings, hover/active states, and content/copy. Recreate UI pixel-for-pixel using the codebase's existing libraries and patterns. Both **light and dark mode** are fully designed and AAA-contrast tuned.

## Files in This Handoff

```
design_handoff_jobdash_ds/
├── README.md                          ← this file
├── JobDash Design System.html         ← entry point — open in a browser to view all 59 sections
├── screenshots/
│   ├── light/                         ← 59 numbered PNGs of every section in light mode
│   └── dark/                          ← 59 numbered PNGs of every section in dark mode
└── design-system/
    ├── ds-app.jsx                     ← shell, sidebar nav, theme toggle
    ├── ds-cover.jsx                   ← Overview / "What's inside" landing
    ├── ds-tokens.jsx                  ← Token Export (CSS / JSON / JS)
    ├── ds-typespec.jsx                ← Typography Specimens
    ├── ds-iconset.jsx                 ← 119+ icons
    ├── ds-illustrations.jsx           ← 24 illustration tokens
    ├── ds-motion.jsx                  ← motion durations + easings
    ├── ds-responsive.jsx              ← grid, breakpoints, density modes
    ├── ds-appbar.jsx                  ← top app bar variants
    ├── ds-footer.jsx                  ← footers
    ├── ds-shell.jsx                   ← full app shell layout
    ├── ds-pickers.jsx                 ← buttons, chips, badges
    ├── ds-forms.jsx                   ← inputs & selects
    ├── ds-segmented.jsx               ← checkboxes, toggles, radios
    ├── ds-calendar.jsx                ← date & time pickers
    ├── ds-surfaces.jsx                ← cards & containers
    ├── ds-modals.jsx (in ds-app)      ← modals & dialogs
    ├── ds-confirmdialog.jsx           ← confirmation dialogs
    ├── ds-bottomsheet.jsx             ← mobile bottom sheets
    ├── ds-lightbox.jsx                ← lightbox / gallery
    ├── ds-data.jsx                    ← tables, tabs, grids
    ├── ds-richtext.jsx                ← RTE
    ├── ds-carousel.jsx                ← carousel
    ├── ds-accordion.jsx               ← accordion
    ├── ds-timeline2.jsx               ← horizontal timeline
    ├── ds-infinitescroll.jsx          ← infinite/virtualized list
    ├── ds-notifications.jsx           ← toasts, progress, presence
    ├── ds-emptystates.jsx             ← empty/loading/error states
    ├── ds-formvalidation.jsx          ← form errors
    ├── ds-navigation.jsx              ← tabs, navigation, breadcrumbs
    ├── ds-search.jsx                  ← search & filters
    ├── ds-coachmarks.jsx              ← onboarding patterns
    ├── ds-wizard.jsx                  ← multi-step wizard
    ├── ds-editable.jsx                ← inline editing
    ├── ds-copypaste.jsx               ← click-to-copy
    ├── ds-hovercard.jsx               ← hover cards
    ├── ds-screens.jsx                 ← Sample Screens (full app)
    ├── ds-mobile.jsx                  ← Mobile Views
    ├── ds-emails.jsx                  ← Email Templates
    ├── ds-status.jsx                  ← Status / 404 / 500 pages
    ├── ds-accessibility.jsx           ← Accessibility posture + contrast tables
    └── (additional supporting files)
```

To explore the system: open `JobDash Design System.html` in any modern browser. The sidebar navigates between sections; the **Light / Dark toggle** at the top right switches modes (the user's preference is persisted in localStorage).

---

## Design Tokens

All tokens are defined as CSS custom properties in the `<style>` block at the top of `JobDash Design System.html`. They are organized by domain.

### Color — Light Mode

| Token | Value | Role |
|---|---|---|
| `--cream` | `#f5f3f0` | App background, primary surface |
| `--cream-2` | `#ece8e3` | Secondary surface, raised cards |
| `--cream-3` | `#e7e2dc` | Tertiary surface, subtle wells |
| `--ink` | `#292524` | Primary text, dark accents |
| `--ink-2` | `#4a4641` | Secondary text, body copy |
| `--ink-3` | `#544e48` | Tertiary text, captions |
| `--ink-4` | `#8a8380` | Quaternary text, hints |
| `--ink-5` | `#d6d3d1` | Disabled text, dividers |
| `--amber` | `#f59e0b` | Brand primary, CTAs, focus accent |
| `--amber-d` | `#7c2d12` | Amber on light bg (AAA-safe) |
| `--amber-l` | `#fef3c7` | Amber soft tint, callouts |
| `--blue` | `#1e3a8a` | Info accent (AAA on cream) |
| `--purple` | `#5b21b6` | Secondary accent |
| `--green` | `#14532d` | Success accent |
| `--red` | `#991b1b` | Error / destructive accent |
| `--rule` | `rgba(0,0,0,.10)` | Borders, dividers |
| `--surf-1` | `rgba(255,255,255,.4)` | Translucent subtle surface |
| `--surf-2` | `rgba(255,255,255,.55)` | Translucent default surface |
| `--surf-3` | `rgba(255,255,255,.7)` | Translucent prominent surface |

### Color — Dark Mode (auto-applied via `body.dark`)

| Token | Value |
|---|---|
| `--cream` | `#1c1917` |
| `--cream-2` | `#292524` |
| `--cream-3` | `#44403c` |
| `--ink` | `#f5f3f0` |
| `--ink-2` | `#d6d3d1` |
| `--ink-3` | `#b8b3af` |
| `--ink-4` | `#aaa39e` |
| `--ink-5` | `#44403c` |
| `--amber-d` | `#fbbf24` |
| `--blue` | `#7cb8fb` |
| `--purple` | `#bfa3fb` |
| `--green` | `#4ade80` |
| `--red` | `#fb8888` |
| `--rule` | `rgba(255,255,255,.10)` |
| `--surf-1/2/3` | `rgba(255,255,255,.04 / .06 / .10)` |

### Vivid Variants (for charts, badges, status indicators)

`--blue-vivid: #3b82f6`, `--purple-vivid: #8b5cf6`, `--green-vivid: #22c55e`, `--red-vivid: #ef4444`. These are the same in light + dark.

### Typography

| Token | Value |
|---|---|
| `--display` | `'Archivo', system-ui, sans-serif` |
| `--mono` | `'JetBrains Mono', ui-monospace, monospace` |
| (body) | `'Inter', system-ui, sans-serif` (used as page default) |

**Type scale** (display sizes used across the system):
- `60–80px` — hero titles, cover pages
- `36–48px` — section titles
- `22–28px` — page titles
- `15–18px` — UI labels, button text, card titles
- `13–14px` — body copy
- `11–12px` — captions, monospace labels
- `9–10px` — uppercase eyebrows, badges (always with `letter-spacing: .08–.12em`)

**Letter-spacing rules:** display text gets `-0.02em` to `-0.035em` (tightened); monospace eyebrows get `+0.05em` to `+0.12em` (loosened). Body and UI text default `0`.

**Line-height rules:** display `0.95–1.1`; UI `1.4–1.5`; body `1.55–1.65`.

### Spacing

12-step scale (multiples of 4px): `--space-1` (4px) through `--space-16` (64px). Most layouts use `8 / 12 / 16 / 20 / 24 / 32` for component padding and gaps.

### Radius

`--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-xl: 16px`, `--radius-pill: 999px`.

Cards use `12px`; buttons `8px`; chips/badges `999px`; modals `14–16px`.

### Shadow

`--shadow-1: 0 1px 2px rgba(0,0,0,.05)`, `--shadow-2: 0 4px 12px rgba(0,0,0,.08)`, `--shadow-3: 0 12px 32px rgba(0,0,0,.12)`. Used sparingly — JobDash favors borders + cream-tone surfaces over drop shadows.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Default for entrances, hovers |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Reversible transitions |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | Playful pops (sparingly) |
| `--dur-1` | `120ms` | Hover, focus, color shifts |
| `--dur-2` | `180ms` | Component state changes |
| `--dur-3` | `240ms` | Modals, tooltips entering |
| `--dur-4` | `360ms` | Page transitions, large layout shifts |

All motion respects `prefers-reduced-motion: reduce` — animations cap at 200ms or fall back to instant state changes.

### Focus

`--focus: var(--amber)` — `--focus-ring: 0 0 0 3px rgba(245,158,11,.45)` in light mode, `0 0 0 3px rgba(251,191,36,.5)` in dark. Every interactive element MUST have a visible focus ring.

---

## Sections (53)

Listed by group with implementation notes. Open the HTML file and navigate to each section for the full visual reference.

### Start Here (7)
1. **Overview** — Cover page; "One system. Every screen." Stats footer (53 sections, 119+ icons, 24 illustrations, 10 groups). Quick-glance palette swatches.
2. **Sample Screens** — Three full app screens (Dashboard, Pipeline Kanban, Application Detail) demonstrating the system at full scale.
3. **Email Templates** — Welcome, weekly digest, deadline reminder. Table-based HTML for email-client compatibility. Always light-mode regardless of app theme.
4. **Mobile Views** — iOS frame examples: list view, application detail, add note flow.
5. **Status Pages** — 404 and 500 pages. The 500 page is intentionally always-dark (locked `#1c1917` bg) regardless of app theme.
6. **Token Export** — CSS Variables / JSON / JS Module side-by-side, with copy buttons. Covers all 100+ tokens.
7. **Accessibility** — 8 posture cards (color contrast, keyboard, focus, reduced motion, ARIA, screen reader, touch targets, form errors), full contrast tables for light + dark, and code snippet examples.

### Foundation (9)
8. **Design Tokens** — Color, spacing, radius, shadow, type, motion swatches.
9. **Responsive & Layout** — 12-col grid, breakpoints (640 / 768 / 1024 / 1280 / 1536), density modes (cozy / comfortable / spacious).
10. **Motion Tokens** — Easing curves rendered as graphs; duration scale visualized.
11. **Typography Specimens** — Type scale, prose specimen, code specimen.
12. **Icon Set Reference** — 119+ icons in a searchable grid. 1.5px stroke, 24×24 viewBox, currentColor-aware.
13. **Illustration Tokens** — 24 spot illustrations (empty states, success, errors, onboarding scenes).
14. **(implicit)** — Color, spacing, radius covered above.

### Layout (3)
15. **App Bar** — 4 variants: minimal, with search, with user menu, contextual.
16. **Footers** — Compact (1 line) and expanded (4-column).
17. **App Shell** — Full sidebar + topbar + content layout with breakpoint behavior.

### Inputs (5)
18. **Buttons & CTAs** — Primary, secondary, ghost, destructive, icon-only. Sizes sm / md / lg. All states (default / hover / active / disabled / focus / loading).
19. **Inputs & Selects** — Text, email, password, search, textarea, select, multi-select, combobox.
20. **Checkboxes & Toggles** — Single + group, indeterminate, switch.
21. **Date & Time Picker** — Single date, range, time, datetime.
22. **Chips, Badges & Sliders** — Status badges (todo / progress / done / urgent), input chips, range slider, count badge.

### Surfaces (6)
23. **Cards & Containers** — Default, raised, dark, glass, image, list-item card variants.
24. **Modals & Dialogs** — Center modal, side drawer, full-screen on mobile.
25. **Tooltips & Popovers** — Tooltip (small), popover (rich content with pointer).
26. **Bottom Sheet (mobile)** — Half-height + full-height variants with drag handle.
27. **Lightbox** — Full-bleed media viewer with prev/next + caption.
28. **Confirmation Dialogs** — Destructive, info, success patterns.

### Data Display (11)
29. **Tables** — Sortable, sticky header, row actions, density modes.
30. **Tabs & Navigation** — Top tabs, side tabs, segmented control.
31. **Grid** — Card grid with responsive cols.
32. **Calendar** — Month view, week view, year picker.
33. **Rich Text Editor** — Toolbar, formatting menus, mention/link popovers.
34. **Carousel** — Image carousel + content carousel with arrow + dot nav.
35. **Accordion** — Single + multi-expand.
36. **Horizontal Timeline** — Status timeline with dots, dates, milestones.
37. **Infinite / Virtualized List** — Loading sentinels, end-of-list state.

### Feedback (2)
38. **Toasts & Progress** — 4 toast variants (info / success / warning / error), inline + linear + circular progress.
39. **Avatars & Presence** — Single + stacked avatars, presence dot positions, fallback initials.

### Navigation (3)
40. **Search & Filters** — Search bar, autocomplete dropdown, filter chips, clear-all.
41. **Tabs**, **Breadcrumbs** — covered above.

### Patterns (4)
42. **Empty States** — 6 variants (no results, no data yet, error, no permission, success-after-action, end-of-feed).
43. **Form Validation** — Inline errors, summary errors, success states, password strength meter.
44. **Coachmarks** — First-run hints, contextual tooltips with dismissal.
45. **Wizard** — Multi-step form with progress + back/next.

### Interaction (4)
46. **Inline Editing** — Click-to-edit text, optimistic save, error recovery.
47. **Click to Copy** — Inline pill, button + value, tooltip variants.
48. **Hover Cards** — User profile preview, link previews.
49. **Drag & Drop** — Kanban card reorder hint + drop zones (in screens).

---

## Visual Vocabulary (the "why")

The system has a deliberate aesthetic — **don't drift from it**:

- **Cream + ink + amber.** The palette is warm-neutral cream tones (not white), near-black ink (not pure black), with amber as the only saturated brand accent. Avoid introducing additional accent colors — use ink/cream value contrast for hierarchy, save amber for what truly demands attention.
- **Borders over shadows.** Cards use 1px `var(--rule)` borders + a slightly raised cream-2 background. Drop shadows are reserved for genuinely-floating elements (modals, popovers).
- **Display + mono pairing.** Archivo display headlines + JetBrains Mono labels (UPPERCASE eyebrows, codes, numbers) is a signature pairing. Body text is Inter.
- **Generous letter-spacing on display.** Tightened (`-0.02em` to `-0.035em`) for impact.
- **Always-on-cream surfaces.** The page background is cream — never pure white. This warmth is the most-distinctive visual cue.
- **AAA contrast.** Every text/bg pair has been measured. The Accessibility section enumerates them.

---

## Theming Implementation Notes

The light/dark toggle is implemented by adding/removing `class="dark"` on `<body>`. CSS custom properties are redefined under `body.dark { ... }` and inherited through the cascade — no JS recompute needed for color.

**Critical contrast rule** (learned the hard way during development):
- When a surface should **flip** between modes, use `var(--cream-2)` bg with `var(--ink)` text.
- When a surface should **stay dark in both modes** (e.g. code blocks, error pages, dark cards), use **hardcoded** `#1c1917` bg with `#f5f3f0` text — NOT theme tokens. Otherwise dark-mode flips both bg AND text into cream-on-cream.
- Same for badge/pill chrome that intentionally inverts (e.g. dark-pill-on-light-bg in light mode → light-pill-on-dark-bg in dark mode): pair `var(--ink)` bg with `var(--cream)` text. Both flip together → readable in both modes.

In the target codebase, encode this distinction explicitly: a `Surface` component for flipping cards, a `DarkSurface` component for always-dark contexts, an `InvertedPill` component for paired chrome.

---

## Components & Patterns — Common CSS Classes

The HTML uses ad-hoc class names + inline styles. When porting, lift these into proper components. The recurring class names you'll see in the source:

- `ds-btn`, `ds-btn primary | secondary | ghost | destructive`, `ds-btn-sm`
- `ds-input`, `ds-input-wrap`, `ds-label`
- `ds-toggle` (with `.on` modifier), `ds-toggle-thumb`
- `ds-chip`, `ds-badge`, `ds-badge done | progress | todo | urgent`
- `ds-card`, `glass` (translucent surface)
- `ds-dropdown`, `ds-dropdown-item`
- `ds-sidebar-item`
- `ds-section-header`, `ds-subsection`

These map cleanly to component props in any framework.

---

## Assets

**Fonts:** Archivo (display), Inter (body), JetBrains Mono (mono). All free Google Fonts. Embed via `@font-face` or use the codebase's existing font loader.

**Icons:** All 119+ icons are inline SVGs in `ds-iconset.jsx`. They follow Lucide-style conventions (1.5px stroke, 24×24, `stroke="currentColor"`). The codebase can either copy the SVG paths verbatim or substitute Lucide / Heroicons / Phosphor — match the line-weight to maintain visual unity.

**Illustrations:** 24 inline SVG illustrations in `ds-illustrations.jsx`. Cream + ink + amber palette only. Recreate as React components or export as static SVG files.

**No raster images** — every visual is SVG or CSS.

---

## Implementation Recommendations

1. **Start with tokens.** Port `:root` and `body.dark` variables to your codebase's token system (CSS variables, Tailwind config, or Style Dictionary). Get light/dark theming working end-to-end before building components.
2. **Build foundation components next:** `Button`, `Input`, `Select`, `Checkbox`, `Toggle`, `Badge`, `Chip`, `Card`, `Modal`, `Toast`. These are the load-bearing pieces — every screen uses them.
3. **Then layout primitives:** `AppShell`, `AppBar`, `Sidebar`, `Footer`.
4. **Then feature patterns:** `Wizard`, `EmptyState`, `Coachmark`, `HoverCard`, `Lightbox`, `BottomSheet`.
5. **Sample Screens last** — they're the integration test. If the screens look right, the system is correctly assembled.

For each component, reference the matching `ds-*.jsx` file for layout structure, exact spacing/padding, and all states (default / hover / active / disabled / focus / loading / error).

Test in **both light and dark mode** at every step. Test keyboard navigation. Test with `prefers-reduced-motion` enabled. Run an axe-core scan after each screen lands.

---

## Questions?

Anything ambiguous in the HTML — exact pixel values, motion timings, focus behaviors, content/copy — is documented inline in the source files. Search for the section name in `JobDash Design System.html` or open the matching `ds-*.jsx` file.
