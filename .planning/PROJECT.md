---
project: "@akhil-saxena/design-system"
status: in-progress
milestone: v1.0.0
created: 2026-04-29
last_updated: 2026-04-29
---

# @akhil-saxena/design-system

> **Reconstructed planning context** — original `.planning/` was lost (never committed) when the previous laptop was decommissioned. This rebuild was synthesized on 2026-04-29 from:
> - `design_handoff/README.md` and `design_handoff/JobDash Design System.html` (the 53-section v1.0 spec, intact in repo but un-tracked)
> - `design_handoff/design-system/ds-*.jsx` (49 source-of-truth section files)
> - Git history of this repo + sibling `job-dash` repo (phase numbering, wave pattern, commit conventions)
> - Live `src/*.tsx` audit (35 shipped primitives at v0.5.6)

## Project Overview

A reusable React primitive library — accessible, AAA-contrast, with full light + dark theming. Extracted from JobDash so that the same visual system can power additional apps. Distributed via GitHub Packages as `@akhil-saxena/design-system`.

**Core value:** A complete, opinionated UI kit a single developer can drop into any React 19 app and get the JobDash visual language — cream + ink + amber, Inter / Archivo / JetBrains Mono — without re-deriving spacing, focus rings, motion tokens, or dark-mode contrast logic for every component.

**Target:** v1.0.0 with 53 sections of the design_handoff spec covered (where "covered" means: shippable React primitive OR documented foundation token OR explicitly out-of-scope-for-library).

## Aesthetic Constraints (do not drift)

From `design_handoff/README.md` § "Visual Vocabulary":

- **Cream + ink + amber.** Warm-neutral cream surfaces (never pure white), near-black ink (never pure black), amber as the *only* saturated brand accent. Hierarchy through value contrast, not extra hues.
- **Borders over shadows.** 1px `var(--rule)` borders on cream-2 surfaces. Drop shadows reserved for genuinely-floating UI (modals, popovers).
- **Display + mono pairing.** Archivo headlines + JetBrains Mono UPPERCASE eyebrows is signature. Body is Inter.
- **AAA contrast everywhere.** Light + dark both tuned. The accessibility section enumerates pairings.
- **Surface-flip vs always-dark distinction.** Encoded in the dark-mode token redefinition under `:root.dark`. Hardcode `#1c1917`/`#f5f3f0` only for genuinely-always-dark UI (code blocks, error pages); use tokens elsewhere so flipping works.

## Tech Stack

- **Build:** tsup (ESM-only, type emit)
- **Component runtime:** React 19 peer dep (no internal React; consumer brings it)
- **Styling:** Plain CSS in three layers — `tokens.css` (`:root` + `:root.dark` custom props), `primitives.css` (`.ds-atom-*` component styles), `utilities.css` (`.glass`, `.ds-label`, `.jd-markdown`)
- **Tests:** vitest + Testing Library; Storybook 8 for visual baselines; Playwright for visual regression
- **Lint/format:** Biome
- **Distribution:** GitHub Packages (private under personal-account quota)
- **Versioning:** SemVer with hand-curated CHANGELOG via `chore(release): vX.Y.Z` commits

## Repository Conventions

- **Phase numbering** continues from JobDash app (which used phases 1-10). Design-system phases start at 13.5 (initial import wave).
- **Commit format:** `feat(<phase>-<plan>): <message>`, `fix(vX.Y.Z): <message>`, `chore(release): vX.Y.Z — <summary>`. Wave-completion commits include version bump.
- **DS-NN identifiers** label individual primitives (DS-30 = Card, DS-40 = Toast, DS-50 = Select, etc) — these stay attached to the primitive forever; cite them in PRs and changelog.
- **One CSS class per primitive** following `.ds-atom-<name>` pattern. No CSS-in-JS, no Tailwind, no styled-components.
- **No Co-Authored-By trailers** in any commit (system rule).

## Key Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-? | Continue JobDash phase numbering rather than reset to 1 | Single mental timeline — phases 13.5-18 are the "extract design-system" milestone of JobDash's broader trajectory |
| 2026-? | Three CSS layers (tokens / primitives / utilities) instead of bundled | Consumers can opt out of utilities; tokens can be used standalone for app-level styling |
| 2026-? | `:root.dark` selector (NOT `body.dark`) | Cascade-friendly — works with portaled overlays mounted at root |
| 2026-? | DSPortal + DSDropdown as `_internals/` not exported | Keep public API minimal; consumers build with composed primitives |
| 2026-? | GitHub Packages over npm | Free private hosting under personal account quota |
| 2026-? | tsup ESM-only (no CJS) | React 19 + modern bundlers; simpler types |
| 2026-04 | Wave 5 v0.5.0 ships 7 compound input primitives + DSDropdown | Round out form-input coverage before moving to data-display work |
| 2026-04 | Post-Phase-16 hotfixes (v0.5.1-v0.5.6) for DateRangePicker, SplitButton, dark-mode hover specificity | User feedback during JobDash adoption surfaced edge cases |
| 2026-04-29 | Icons ship as tree-shakeable `/icons` subpath, not BYO | Locks 1.5px stroke + 24×24 visual unity; tree-shaking means zero cost when unused; internal primitives can stop using ad-hoc inline SVGs |
| 2026-04-29 | Illustrations ship as `/illustrations` subpath in same repo (not split package) | Solo-dev maintenance; same tree-shaking pattern; no second repo to release |
| 2026-04-29 | Rich Text Editor in Phase 17 on TipTap StarterKit | Avoids Lexical's complexity; TipTap's headless model fits our token-driven styling |
| 2026-04-29 | Drag & Drop on `@dnd-kit/core` as DS-80 Sortable primitive | HTML5 native is jarring (no keyboard, no touch); @dnd-kit gives accessibility for free; aligns with "functional and clean, not jarring" |

## What's Out of Scope for Library

These belong in JobDash (or the consuming app), not the library:

- Sample Screens, Mobile Views (full app screens — demo material, not primitives)
- Email Templates (table-based HTML, separate concern)
- Status pages (404 / 500 — app-specific routing)
- Token Export tool (the tokens themselves ship; the export *page* is documentation)

## Resolved Scope Decisions (2026-04-29)

1. **Icons (119+) → tree-shakeable subpath export** `@akhil-saxena/design-system/icons`. Same pattern as `/hooks`. Internal primitives reference the canonical icon components (no scattered inline SVGs). Tree-shaking means consumers pay only for what they import. Each icon: 24×24 viewBox, 1.5px stroke, `currentColor`.
2. **Illustrations (24 spot SVGs) → subpath export** `@akhil-saxena/design-system/illustrations`. Stays inside this repo, not split into a separate package. Same tree-shaking approach as icons.
3. **Rich Text Editor → in Phase 17 (DS-70).** Built on TipTap (StarterKit + Link + Placeholder extensions). Toolbar uses Button + DSDropdown chrome.
4. **Drag & Drop → functional primitive on `@dnd-kit/core`** (DS-80 Sortable in Phase 18). Full keyboard support (arrow keys + space to lift), touch + pointer parity, amber focus ring during drag, `prefers-reduced-motion` respected. Real primitive, not a doc recipe.
