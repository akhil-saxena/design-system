# Phase 17 — Manual Verification Checklist

> **Purpose:** Knock out the 3 verifier-flagged manual items that automated tests can't cover.
> **Status:** TODO — pending real-browser walkthrough.
> **How to run:** `npm run storybook` → open http://localhost:6006

---

## Check 1 — AAA contrast & dark-mode tuning

Walk each story in **light + dark** (theme toggle in Storybook toolbar). Look for: text legibility, amber focus rings, no cream-on-cream regressions in dark mode.

### 11 new primitives (Phase 17)

- [ ] `Internals/Icon` — Default + Sizes + DarkMode
- [ ] `Components/SegmentedControl` — Default + Sizes + DarkMode
- [ ] `Components/Breadcrumbs` — DeepPath, MaxVisible3, DarkMode
- [ ] `Components/Timeline` — Horizontal, Vertical, DarkMode
- [ ] `Components/InfiniteList` — Default, LoadingInProgress, DarkMode
- [ ] `Components/Accordion` — Default + DarkMode
- [ ] `Components/Carousel` — Default, ImageSlides, DarkMode
- [ ] `Components/Tabs` — Underline, Pill, NarrowOverflow, DarkMode
- [ ] `Components/Table` — Default, StickyHeader, DarkMode
- [ ] `Components/Calendar` — covered in Check 3 below
- [ ] `Components/RichText` — covered in Check 2 below

### 13 refactored primitives (lucide → Icon wrapper)

Quick eyeball that icons still look right (1.5px stroke, no oversize/undersize, currentColor inherits):

- [ ] AlertBanner
- [ ] Autocomplete
- [ ] Checkbox
- [ ] Chip
- [ ] CopyToClipboard
- [ ] DatePicker
- [ ] Lightbox
- [ ] MultiSelect
- [ ] NumberStepper
- [ ] Select
- [ ] SplitButton
- [ ] StarRating
- [ ] Toast

---

## Check 2 — RichText markdown shortcuts (DS-70)

Story: `Components/RichText/Default`. Type each and confirm formatting kicks in.

### Markdown shortcuts (StarterKit defaults)

- [ ] `**bold**` → bold
- [ ] `*italic*` → italic
- [ ] `` `code` `` → inline code
- [ ] `## h2` then space → H2 heading
- [ ] `### h3` then space → H3 heading
- [ ] `- list` then space → bulleted list
- [ ] `1. item` then space → ordered list
- [ ] `> quote` then space → blockquote
- [ ] `---` then enter → horizontal rule

### Keyboard shortcuts

- [ ] Cmd/Ctrl+B → toggle bold
- [ ] Cmd/Ctrl+I → toggle italic
- [ ] Cmd/Ctrl+U → toggle underline
- [ ] Cmd/Ctrl+K → opens link popover

### Paste sanitization (XSS threat from plan threat model)

- [ ] Paste a styled paragraph from Google Docs / Word — confirm bold/italic/links survive
- [ ] Confirm NO inline `style=""` or `<font>` tags leak through
- [ ] Paste `<script>alert(1)</script>` — must NOT execute; should drop or text-render

---

## Check 3 — Calendar mobile breakpoint (DS-68 + D-17-22)

Story: `Components/Calendar/Default`.

- [ ] Click a day cell with events — desktop opens a **Popover** anchored to cell
- [ ] Resize browser window narrower than **640px**
- [ ] Click event-day cell at ≤640px → swaps to **BottomSheet** (drawer from bottom, swipe-to-close)
- [ ] Resize back wider — switches back to Popover **live** (useMatchMedia is reactive)
- [ ] Multiple events on one day render as chips with overflow `+N more` button

---

## Reduced-motion (cross-cutting)

System: `System Preferences → Accessibility → Display → Reduce motion` (macOS) or equivalent.

- [ ] `Components/Carousel/Autoplay` — autoplay should pause when reduced-motion enabled
- [ ] `Components/Carousel/Default` — slide transition should snap (no animated translate)
- [ ] `Components/Accordion/Default` — chevron rotation should be instant, panel expand should be instant
- [ ] `Components/Calendar` — view-mode transitions should be instant

---

## Known-out-of-scope (do NOT verify here — deferred to Phase 18 or v1.1)

- Mentions / slash-commands in RichText (deferred to v1.1)
- Multi-day event rendering as bars in Calendar (deferred to v1.1)
- Sortable / drag-and-drop primitive (Phase 18, DS-80)
- Illustrations subpath (Phase 18, DS-81)

---

## When done

When all three checks pass:

1. Tick all the boxes above
2. Mark `17-VERIFICATION.md` items as PASS
3. Update STATE.md `Pending Work` section: "Phase 17 manual verification complete"
4. Commit: `docs(17): complete manual verification — Phase 17 fully shipped`

If any check fails:

1. Capture the symptom (screenshot, repro steps)
2. Either file as a `fix(v0.6.x)` patch in current milestone, or defer to next phase if non-urgent
3. Re-run failing check after fix
