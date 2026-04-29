---
phase: 17-wave-6-icons-data-display
plan: 13
subsystem: richtext
tags: [primitive, richtext, tiptap, editor, novel, ds-70]
dependency_graph:
  requires:
    - 17-00 (TipTap packages installed + externalized in tsup.config.ts)
    - 17-01 (icons/index.ts — Bold, Italic, Underline, Strikethrough, Code, Heading2, Heading3, Quote, List, ListOrdered, Minus, Link2, ChevronDown)
  provides:
    - RichText component (DS-70)
    - RichTextProps interface
  affects:
    - src/index.ts (barrel export added)
    - src/primitives.css (ds-atom-richtext CSS block appended)
tech_stack:
  added:
    - "@tiptap/react@3.22.5 (externalized — not bundled)"
    - "@tiptap/starter-kit@3.22.5 (externalized)"
    - "@tiptap/extension-link@3.22.5 (externalized)"
    - "@tiptap/extension-placeholder@3.22.5 (externalized)"
    - "@tiptap/extension-underline@3.22.5 (externalized)"
  patterns:
    - TipTap useEditor controlled-sync three-layer guard (lastEmittedRef + getHTML equality + emitUpdate:false)
    - DSPortal-mounted <dialog open> for link popover (semantic element vs div+role)
    - DSDropdown for heading H2/H3/Paragraph menu
    - StarterKit.configure({ link: false, underline: false }) to opt-out bundled extensions before adding configured versions
key_files:
  created:
    - src/RichText.tsx (479 lines)
    - src/RichText.stories.tsx (298 lines)
    - src/RichText.test.tsx (257 lines)
  modified:
    - src/primitives.css (appended ds-atom-richtext block — 40 class rules, 11 dark-mode rules)
    - src/index.ts (barrel export)
decisions:
  - "StarterKit v3.22 includes Link + Underline by default; opted them out via StarterKit.configure({ link: false, underline: false }) then re-added configured versions to avoid duplicate extension warnings"
  - "Link popover uses <dialog open> (semantic element) instead of <div role='dialog'> — satisfies biome useSemanticElements lint rule; inline style resets browser dialog UA stylesheet"
  - "UnderlineExtension import alias avoids collision with Underline icon from ./icons"
  - "role='presentation' on heading menu <li> items (WAI-ARIA: neutralizes native li role inside ul[role=menu])"
metrics:
  duration: "~35 minutes"
  completed: "2026-04-29T19:09:52Z"
  tasks_completed: 1
  tasks_total: 1
  files_created: 3
  files_modified: 2
  tests_added: 20
  tests_total: 644
---

# Phase 17 Plan 13: RichText (DS-70) Summary

**One-liner:** TipTap 3.22 RichText editor with StarterKit + Link + Placeholder + Underline, three-layer controlled-sync guard, full formatting toolbar, DSPortal link popover, HTML/JSON output, 20 unit tests.

## What Was Built

`RichText` is a forwardRef component wrapping TipTap's `useEditor` hook with a full formatting toolbar and link URL popover. It is the heaviest single primitive in Phase 17 (~50–70 KB gzipped TipTap deps, all externalized in `tsup.config.ts` from Plan 00).

### Component surface (D-17-19)

```tsx
<RichText
  value={html}                 // HTML string by default; TipTap JSON Doc when outputFormat="json"
  onChange={setHtml}
  placeholder="Start writing…"
  readOnly={false}
  outputFormat="html"          // "json" emits editor.getJSON() instead
  toolbar={<CustomToolbar />}  // override default toolbar
  className="my-surface"
  ariaLabel="Cover letter editor"
  style={{ maxWidth: 680 }}
/>
```

### Toolbar (D-17-15)

Default toolbar renders 11 Button (ghost) + 1 DSDropdown (heading menu) + 1 link popover trigger:
Bold · Italic · Underline · Strikethrough · Inline Code | [Heading H2/H3/Paragraph ▾] | Bulleted List · Ordered List · Blockquote · HR · Link

### Extensions loaded

| Extension | Source | Why separate |
|-----------|--------|--------------|
| StarterKit | @tiptap/starter-kit | Base marks/nodes, markdown shortcuts |
| Link | @tiptap/extension-link | openOnClick:false, autolink, javascript: filtering |
| Placeholder | @tiptap/extension-placeholder | Empty-editor placeholder via data-placeholder CSS |
| UnderlineExtension | @tiptap/extension-underline | StarterKit v3.22 bundles it but we opt-out + re-add configured |

### Controlled-sync three-layer guard (DO NOT BREAK)

```tsx
// Layer 1: track last emitted value
const lastEmittedRef = useRef<string>(…);

// In onUpdate:
lastEmittedRef.current = html;  // record before emitting
onChange(html);

// In useEffect([editor, value]):
if (value === lastEmittedRef.current) return;  // Layer 1: echo detection
if (value === editor.getHTML()) return;        // Layer 2: defensive equality
editor.commands.setContent(value, { emitUpdate: false });  // Layer 3: suppress loop
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] StarterKit v3.22 includes Link + Underline — duplicate extension warnings**
- **Found during:** Initial test run
- **Issue:** TipTap logged "Duplicate extension names found: ['link', 'underline']" because StarterKit 3.22 already bundles both extensions internally, and we added them again to configure them
- **Fix:** `StarterKit.configure({ link: false, underline: false })` opts out the bundled versions; our own configured `Link` and `UnderlineExtension` are then added cleanly
- **Files modified:** src/RichText.tsx
- **Commit:** 845f523

**2. [Rule 2 - Lint] biome useSemanticElements: `<div role="dialog">` → `<dialog open>`**
- **Found during:** Pre-commit biome hook
- **Issue:** biome `useSemanticElements` lint rule requires using `<dialog>` instead of `<div role="dialog">`
- **Fix:** Replaced link popover `<div role="dialog">` with `<dialog open>` (non-modal, in-flow). Added inline `margin:0; padding:0; border:none; background:none` to reset browser UA dialog styles; `.ds-atom-richtext-linkpopover` class still controls visuals
- **Files modified:** src/RichText.tsx, src/RichText.test.tsx (updated selector from `[role="dialog"]` to `dialog.ds-atom-richtext-linkpopover`)
- **Commit:** 845f523

**3. [Rule 1 - Bug] biome noUnusedTemplateLiteral: INITIAL_HTML backtick string**
- **Found during:** Pre-commit biome hook
- **Fix:** Changed template literal to regular double-quoted string
- **Files modified:** src/RichText.stories.tsx
- **Commit:** 845f523

## Known Stubs

None. All toolbar buttons are wired to real TipTap commands. Placeholder extension is fully connected. Link popover operates on the actual editor selection/marks.

## Threat Flags

No new threat surface beyond what is documented in the plan threat model. All four threats (T-17-13-01 through T-17-13-04) are addressed:
- XSS via paste: TipTap StarterKit allowlist mitigates
- Server-side persistence: documented as caller responsibility in file header JSDoc
- Crafted initial value: same schema parse on setContent
- `javascript:` links: TipTap Link extension defaults filter these out

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/RichText.tsx exists | FOUND |
| src/RichText.stories.tsx exists | FOUND |
| src/RichText.test.tsx exists | FOUND |
| commit 845f523 exists | FOUND |
| barrel export in src/index.ts | FOUND |
| ≥12 ds-atom-richtext CSS rules | FOUND (40) |
| ≥4 :root.dark rules | FOUND (11) |
| 20 tests pass | PASS |
| typecheck clean | PASS |
| build succeeds | PASS |
| @tiptap/* externalized in dist | PASS (import statements, not inlined) |
