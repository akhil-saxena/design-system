# Cairn → Design System consolidation

Goal: pull everything Cairn hand-built (components + colors) **into** this design
system, publish a new package version, then refactor Cairn to consume it so the
app is built entirely on the DS.

Direction is **Cairn → DS** (Cairn is the source of truth for the editorial
palette + the missing primitives).

---

## Landed in v1.5.0 (this pass)

- **Colors merged** (additive, light + dark) into `src/tokens.css` — net-new
  token names, no existing token clobbered:
  `--page-bg --bg --panel --panel2 --paper --paper-warm --paper-deep --pg`,
  `--rule-s`, `--amber-ink --amber-soft --amber-warm`, `--green-bg --red-bg`.
- **`useLongPress`** hook added (`src/hooks/useLongPress.ts` + test + barrel
  export) — long-press → action surface; inert on desktop (pairs with
  hover-reveal).
- **Version** bumped 1.4.2 → 1.5.0 (`package.json`, `tokens.css` header,
  Storybook `OverviewPage.tsx` ×2).

---

## Decisions still needed (color value-collisions)

These three tokens exist in BOTH systems with different values. Not changed —
reskinning the DS core affects every component + story:

| Token | DS (current) | Cairn | Options |
|---|---|---|---|
| `--ink` | `#292524` | `#1c1c1a` | (a) Cairn keeps a local `--ink` override, or (b) reskin DS to Cairn's value |
| `--green` | `#14532d` | `#2f7a52` | same |
| `--red` | `#991b1b` | `#b8463f` | same |

Also: Cairn shadows `--sh-1..4 / --sh-warm / --sh-fab / --sh-sheet /
--backdrop-dim` are not yet in the DS (the DS ships `--shadow-1..3`). Decide
whether to (a) add Cairn's `--sh-*` set to the DS, or (b) alias Cairn's `--sh-*`
to the DS `--shadow-*` in the app.

---

## Components to ADD (net-new in the DS)

Source = Cairn. Follow the DS pattern: `src/{category}/{Name}/index.tsx` +
`.stories.tsx` + `.test.tsx`, export from `src/index.ts`, register in
`OverviewPage.tsx` `categories`, add pseudo-state CSS to `primitives.css`.

| Component | Cairn source | DS category | Notes |
|---|---|---|---|
| `useLongPress` ✅ | `src/hooks/useLongPress.ts` | hooks | DONE |
| `InlineAddRow` | `detail/InlineAddRow.tsx` | inputs | dashed "+ add" row → inline input (Enter saves / Esc cancels / blur). Recurs 4× in Cairn (Open Qs, prep-Qs, Q&A, People). |
| `ActionSheet` | `mobile/ActionSheet.tsx` | overlays | iOS-style action list (`{label, onSelect, variant}[]`) over a bottom sheet; swipe-down + backdrop dismiss. Compose over the existing `BottomSheet`. |
| `SelectChip` (opt.) | `detail/StageChip.tsx` | inputs | a `Chip` that opens a `Popover` picker. Composable from Chip + Popover — could ship as a documented pattern instead. |

## Components to ENHANCE (existing DS gains a mode)

Cairn rolled its own only because the DS primitive lacked a mode:

| DS component | Enhancement | Cairn consumer |
|---|---|---|
| `SegmentedControl` | per-option `tone`/color | `RoundCard` OutcomeToggle (green/ink/red) |
| `Snackbar` | optional countdown progress bar (undo already supported via `action`) | `SoftConfirmToast`, `AcceptedToast` |
| `BottomSheet` | `visualViewport` keyboard-aware footer | Cairn mobile `BottomSheet` |
| `Avatar` | custom/WCAG-tuned palette + explicit seed (already derives initials + color from `name`) | `CompanyLogo`, `PersonCard`, TopNav avatar |
| `RichText` | inline/borderless mode + keyboard-hint-strip slot | Stance, Pinned body, Q&A, prep-Q editors |

## Adopt-as-is in Cairn (refactor only — no DS work)

The DS already covers these; Cairn should drop its hand-rolled versions:
`Avatar` (← CompanyLogo/PersonCard avatar), `Toggle` (← Shell ToggleSwitch),
`Badge` (← section-count/rail chips), `Kbd` (← hand-rolled kbd), `EmptyState`
(← EmptySectionStub), `Card` (← note/person/QA containers), `Tooltip`
(← hover hints), `Snackbar`/`useSnackbar` (← SoftConfirm/AcceptedToast),
`AlertBanner` (← HintStrip).

## Stays app-specific (compositions, keep in Cairn)

`Masthead`, `RoundCard`, `SectionHeading`, `DetailIsland`, `TocSidebar`,
`DetailFooter`, `SideSheet`, `AppsIsland`, `KanbanCard`, `MobileKanban`,
`TopNav`, Shell sections, `StanceCard`.

---

## Release + adoption sequence

1. Finish the **ADD** components + **ENHANCE** modes in this repo → `npm run
   build && npm test && npm run typecheck && npm run check` → Storybook stories
   for each.
2. Resolve the 3 color value-collisions + the shadow naming (above).
3. Publish: `npm publish` (or `npm link` / `file:` for local iteration before a
   real release).
4. In Cairn: bump `@akhil-saxena/design-system` to the new version (Cairn pins
   ~1.2.0 today; jumping to 1.5.0 alone unlocks Avatar/Toggle/Badge/etc.).
5. Refactor Cairn: drop local token defs in `detail.css` that now live in the DS
   (`--paper*`, `--amber-ink/soft/warm`, `--green-bg/red-bg`, `--rule-s`),
   replace hand-rolled primitives with DS imports (Group "Adopt-as-is"), wire the
   new DS components (`InlineAddRow`, `ActionSheet`, `useLongPress`).
6. Verify Cairn: `npm run build && npm test && npm run lint:all`.
