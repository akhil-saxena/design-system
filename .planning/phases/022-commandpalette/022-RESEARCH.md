# Phase 22: CommandPalette - Research

**Researched:** 2026-05-05
**Domain:** Overlay / keyboard-driven interaction / React component
**Confidence:** HIGH — all findings verified directly from codebase source files

---

## Summary

CommandPalette is a single React component that mounts via DSPortal, manages its own open/close state via a window-level Cmd+K / Ctrl+K listener, and renders grouped items with live substring filtering and Arrow+Enter keyboard navigation. It follows the same architectural pattern as Modal and ConfirmDialog: DSPortal + backdrop div + inner panel + document-level key listeners.

The handoff source (`ds-advanced.jsx → CommandPaletteSection`) is the authoritative visual and behavioral spec. The CSS classes it references (`ds-overlay`, `ds-cmd`, `ds-cmd-input-wrap`, `ds-cmd-input`, `ds-cmd-body`, `ds-cmd-group`, `ds-cmd-item`) are NOT yet present in `src/primitives.css` — they must be added in Wave 0. All existing overlay CSS in this project uses the `ds-atom-*` prefix; Phase 22 must follow that same namespace pattern, meaning the final class names should be `ds-atom-cmd-*` rather than the raw `ds-cmd-*` the handoff uses.

The component is strictly **controlled from the outside** for open state in the library version (the handoff's `useState` is demo scaffolding, not library API). Consumer passes `open`, `onClose`, `items`, `onSelect`, and optionally `placeholder`. The library component does NOT own the Cmd+K global listener — that belongs in the consumer app so the consumer controls what triggers the palette.

**Primary recommendation:** Implement as a controlled overlay in `src/overlays/CommandPalette/`, using DSPortal + a backdrop div (no reuse of `ds-atom-modal-backdrop` — its `align-items:center` is wrong; CommandPalette uses `align-items:flex-start` + `paddingTop:15vh`). Add all CSS under `ds-atom-cmd-*` in primitives.css. Expose `open` / `onClose` / `items` / `onSelect` as the public API. Arrow key navigation tracks a `focusedIndex` state integer.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Keyboard shortcut (Cmd+K) open trigger | Consumer App | — | Library cannot assume it owns the shortcut; consumer may rebind |
| Overlay mounting / z-index stacking | Frontend / DSPortal | — | All overlays in this system portal to document.body |
| Open/close state | Consumer (controlled prop) | — | Library components in this system never own their own visibility toggle |
| Live filtering of items | Frontend component | — | Pure in-memory filter on `items[]` prop |
| Keyboard navigation (Arrow/Enter/Escape) | Frontend component | — | Document-level listener inside the component, active only when `open` |
| Group header rendering | Frontend component | — | Derived from `item.group` string; no backend needed |
| Shortcut display | Frontend component (Kbd) | — | Uses existing Phase 17 Kbd component |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REQ-22-01 | CommandPalette: Cmd+K modal search with grouped results, live filtering, keyboard navigation | Full handoff source confirmed in ds-advanced.jsx; CSS needs to be authored; component pattern matches Modal/ConfirmDialog |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x (project) | Component + hooks | Project standard [VERIFIED: src/index.ts imports] |
| TypeScript | 5.x (project) | Type safety | Project standard [VERIFIED: tsconfig exists] |
| Vitest + @testing-library/react | project versions | Unit tests | Project test standard [VERIFIED: vitest.config.ts] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Kbd (internal) | Phase 17 | Shortcut chips in items | Required by REQ-22-01 for item shortcut display [VERIFIED: src/inputs/Kbd/index.tsx] |
| DSPortal (internal) | project | SSR-safe portal mount | All overlays use this [VERIFIED: Modal, ConfirmDialog, Lightbox all import DSPortal] |
| useFocusTrap (internal) | project | Tab key trap inside panel | Used by Modal + ConfirmDialog [VERIFIED: src/hooks/useFocusTrap.ts] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom backdrop div | Reuse ds-atom-modal-backdrop | Modal backdrop uses `align-items:center`; CommandPalette needs `align-items:flex-start + paddingTop:15vh` — must use a fresh CSS class |
| Controlled `open` prop | Internal useState + window listener | Library components in this system are always controlled; consumer owns open logic |
| Substring filter | Fuse.js fuzzy | Handoff uses `toLowerCase().includes()` — sufficient for the job tracker use case, no dep needed |

**Installation:** No new packages required. All dependencies already in the project.

---

## Architecture Patterns

### System Architecture Diagram

```
Consumer App
    │
    ├─ window keydown (Cmd+K) → setOpen(true)          [consumer-owned]
    │
    └─ <CommandPalette
           open={open}
           onClose={() => setOpen(false)}
           items={allItems}
           onSelect={(item) => { … }}
         />
              │
              │  when open=true
              ▼
         DSPortal → document.body
              │
              ▼
    <div.ds-atom-cmd-overlay>           ← backdrop: fixed inset-0, click-away = onClose
         │
         └─ <div.ds-atom-cmd>           ← panel: max-w ~560px, glass surface
               │
               ├─ <div.ds-atom-cmd-input-wrap>
               │       [search icon] [input.ds-atom-cmd-input] [Kbd>ESC]
               │
               └─ <div.ds-atom-cmd-body>   ← scrollable
                     │
                     ├─ group "Actions"
                     │   <div.ds-atom-cmd-group>Actions</div>
                     │   <div.ds-atom-cmd-item [data-focused]> icon | label | Kbd </div>
                     │   ...
                     ├─ group "Recent"
                     │   ...
                     └─ (no results) <div.ds-atom-cmd-empty>No results for "…"</div>

document keydown listener (active when open):
    Escape → onClose() + clearQuery
    ArrowDown → focusedIndex = (focusedIndex + 1) % filtered.length
    ArrowUp   → focusedIndex = (focusedIndex - 1 + filtered.length) % filtered.length
    Enter     → onSelect(filtered[focusedIndex]) + onClose() + clearQuery
```

### Recommended Project Structure
```
src/
└── overlays/
    └── CommandPalette/
        ├── index.tsx                  # component + types
        ├── CommandPalette.test.tsx    # vitest unit tests
        └── CommandPalette.stories.tsx # Storybook stories
```

Export added to `src/index.ts` after implementation.

### Pattern 1: Controlled Overlay with DSPortal

All overlays in this codebase are controlled (open prop) and portal-mounted. CommandPalette follows the same shape as ConfirmDialog:

```typescript
// Source: src/overlays/ConfirmDialog/index.tsx (verified)
export function CommandPalette({ open, onClose, items, onSelect, placeholder }: CommandPaletteProps) {
  if (!open) return null;
  return (
    <DSPortal>
      <div className="ds-atom-cmd-overlay" onClick={() => { onClose(); setQuery(''); }}>
        <div className="ds-atom-cmd" onClick={e => e.stopPropagation()}>
          {/* input row + body */}
        </div>
      </div>
    </DSPortal>
  );
}
```

### Pattern 2: Document-level Key Listener (active only when open)

Matches the pattern in Modal (`useEffect` on `[open, onClose]`):

```typescript
// Source: src/overlays/Modal/index.tsx (verified) — adapted for CommandPalette
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); setQuery(''); }
    if (e.key === 'ArrowDown') setFocusedIndex(i => (i + 1) % filteredLength);
    if (e.key === 'ArrowUp')   setFocusedIndex(i => (i - 1 + filteredLength) % filteredLength);
    if (e.key === 'Enter' && focusedIndex >= 0) {
      onSelect(filtered[focusedIndex]);
      onClose();
      setQuery('');
    }
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, [open, onClose, onSelect, filteredLength, focusedIndex, filtered]);
```

Note: `focusedIndex` and `filtered` must be captured via refs or included in deps. The closure-over-stale-state trap is the biggest pitfall here (see Pitfalls section).

### Pattern 3: useFocusTrap

Modal and ConfirmDialog both use `useFocusTrap`. CommandPalette should too — it traps Tab inside the panel and restores focus when closed:

```typescript
// Source: src/overlays/Modal/index.tsx (verified)
const [panel, setPanel] = useState<HTMLDivElement | null>(null);
useFocusTrap(panel, open);
// ...
<div className="ds-atom-cmd" ref={setPanel} tabIndex={-1}>
```

The callback-ref pattern (`useState<HTMLDivElement | null>`) is required (not `useRef`) because portal-mounted nodes don't exist at initial render.

### Pattern 4: Grouping Items

```typescript
// Source: ds-advanced.jsx CommandPaletteSection (verified)
const filtered = query
  ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
  : items;
const groups = [...new Set(filtered.map(i => i.group))];

// Render:
groups.map(g => (
  <div key={g}>
    <div className="ds-atom-cmd-group">{g}</div>
    {filtered.filter(i => i.group === g).map(i => (
      <div key={i.label} className="ds-atom-cmd-item" ...>
        <span>{icon}</span>
        <span style={{ flex: 1 }}>{i.label}</span>
        {i.shortcut && <Kbd size="sm">{i.shortcut}</Kbd>}
      </div>
    ))}
  </div>
))
```

### Pattern 5: focusedIndex Reset on Query Change

When the query changes, reset `focusedIndex` to 0 (or -1 for "no keyboard focus yet"). This prevents Enter firing on a stale index after the list shrinks:

```typescript
useEffect(() => { setFocusedIndex(0); }, [query]);
```

### Anti-Patterns to Avoid

- **Reusing ds-atom-modal-backdrop for the CommandPalette overlay:** Modal backdrop uses `align-items:center` which vertically centers the panel. CommandPalette must use `align-items:flex-start` with `paddingTop:15vh`. These are incompatible; a separate CSS class is required.
- **Using raw `ds-cmd-*` class names from the handoff:** All CSS in this project is namespaced `ds-atom-*`. The handoff uses `ds-cmd`, `ds-cmd-input`, etc., which are design tokens for the handoff viewer, not the library. The shipping CSS must use `ds-atom-cmd-*`.
- **Component owning the Cmd+K global listener:** The library component must not capture Cmd+K itself. Consumer apps may use different keybindings or need to conditionally disable the shortcut. Expose only `open/onClose` controlled props.
- **Filtering inside a `useMemo` with stale `query`:** Derive `filtered` and `groups` directly in the render body (or `useMemo` with `[query, items]` deps). Don't compute them inside a `useEffect`.
- **Stale closure on Enter key:** `focusedIndex` and `filtered` inside the keydown handler must be current. Use a `useRef` to mirror state, or restructure deps carefully.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard key display | Custom `<span>` styling | `<Kbd>` from Phase 17 | Already shipped with dark mode, correct border/shadow, size variants |
| SSR-safe portal mount | `ReactDOM.createPortal` directly | `DSPortal` | Handles server-render null + first-client-render delay [VERIFIED: DSPortal.tsx] |
| Focus trap / Tab cycling | Manual tab listener | `useFocusTrap` | Edge-cases handled: no focusables fallback, focus restore, portal-timing [VERIFIED: useFocusTrap.ts] |
| Substring filter | Fuzzy library (Fuse.js etc.) | `label.toLowerCase().includes(query.toLowerCase())` | Handoff spec is simple substring; no dep needed |

---

## CSS Classes Required (Wave 0)

**None of these exist in `src/primitives.css` today.** [VERIFIED: grep for `ds-cmd`, `ds-overlay` returned zero results]

All must be added in the Wave 0 CSS plan, under the `ds-atom-*` namespace:

| Handoff Class | Library Class | Purpose |
|---|---|---|
| `ds-overlay` | `ds-atom-cmd-overlay` | Full-screen backdrop; `position:fixed; inset:0; z-index:1000`; `align-items:flex-start; paddingTop:15vh` |
| `ds-cmd` | `ds-atom-cmd` | Panel container; glass surface; `max-width:~560px`; `border-radius:14px`; shadow |
| `ds-cmd-input-wrap` | `ds-atom-cmd-input-wrap` | Input row: flex, search icon + input + ESC kbd |
| `ds-cmd-input` | `ds-atom-cmd-input` | Bare text input; no border; `font-family:var(--font); font-size:15px` |
| `ds-cmd-body` | `ds-atom-cmd-body` | Scrollable results area; `max-height:~60vh; overflow-y:auto` |
| `ds-cmd-group` | `ds-atom-cmd-group` | Group header label; `--mono 9px 700 --ink-4 uppercase letter-spacing` |
| `ds-cmd-item` | `ds-atom-cmd-item` | Result row; flex; hover + focused states; `border-radius:8px` |

Note: `ds-overlay` in the handoff is shared with other overlays but NOT in `primitives.css`. The CommandPalette-specific backdrop variant should get its own class (`ds-atom-cmd-overlay`) rather than creating a generic `ds-atom-overlay` that might conflict with future phases.

---

## Common Pitfalls

### Pitfall 1: Stale Closure in Arrow/Enter Key Handler
**What goes wrong:** `focusedIndex` or `filtered` inside the `useEffect` keydown handler reads the value from when the effect last ran, not the current value.
**Why it happens:** `useEffect` closes over state. If `focusedIndex` is missing from the deps array, it's stale.
**How to avoid:** Either (a) include all consumed state in the `useEffect` deps array and accept that the listener re-registers on every change, or (b) store `focusedIndex` in a ref mirrored from state (`useEffect(() => { ref.current = focusedIndex; }, [focusedIndex])`).
**Warning signs:** Enter key always selects the first item regardless of Arrow navigation.

### Pitfall 2: Wrong Backdrop CSS Class
**What goes wrong:** Reusing `ds-atom-modal-backdrop` gives `align-items:center`, vertically centering the palette instead of positioning at 15vh.
**Why it happens:** Copy-paste from Modal.
**How to avoid:** Create `ds-atom-cmd-overlay` with `align-items:flex-start; padding-top:15vh`.

### Pitfall 3: focusedIndex Out of Bounds After Query Change
**What goes wrong:** User types a query that reduces the list from 10 to 2 items. `focusedIndex` is still 5. Enter fires with `filtered[5]` which is `undefined`.
**How to avoid:** Reset `focusedIndex` to 0 (or -1) in a `useEffect` on `[query]`.

### Pitfall 4: Missing Event Propagation Stop on Panel Click
**What goes wrong:** Clicking inside the panel div triggers the backdrop's `onClick`, closing the palette immediately.
**Why it happens:** Backdrop click-away uses `onClick` on the backdrop div. The panel is a child.
**How to avoid:** `<div className="ds-atom-cmd" onClick={e => e.stopPropagation()}>` — exactly as the handoff does.

### Pitfall 5: autoFocus on Input in Portal
**What goes wrong:** `<input autoFocus>` inside a DSPortal sometimes does not focus in testing environments, and `useFocusTrap` may override it.
**Why it happens:** DSPortal renders null on first render, then portals on second. `autoFocus` fires before the portal is mounted.
**How to avoid:** Use a `useEffect` with `inputRef.current?.focus()` gated on `open`. This is what Modal does for `initialFocus`. Alternatively, since `useFocusTrap` focuses the first focusable element (the input), autoFocus can be omitted and the trap handles it.

### Pitfall 6: ARIA for Group Headers
**What goes wrong:** `ds-cmd-group` div rendered as a plain `div` has no ARIA role, so screen readers don't announce it as a group label.
**How to avoid:** Use `role="group"` + `aria-label={groupName}` on the wrapper `div` that contains both the group header and the items within that group. Alternatively, mark the header `div` with `role="presentation"` and give items `aria-label` attributes — but the former is cleaner. The `listbox`/`option` ARIA pattern (combobox) is the most semantically correct for a command palette.

---

## Code Examples

### Consumer Usage Pattern
```typescript
// Source: ds-advanced.jsx CommandPaletteSection (verified pattern, adapted to library API)
const [open, setOpen] = useState(false);

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);

<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  onSelect={(item) => { console.log(item); setOpen(false); }}
  items={[
    { icon: <SearchIcon />, label: 'Search all applications', shortcut: '⌘K', group: 'Actions' },
    { icon: <AppIcon />,    label: 'Automattic — Experienced Engineer', group: 'Recent' },
    { icon: <NavIcon />,    label: 'Go to Board', group: 'Navigation' },
  ]}
/>
```

### Item Type Definition
```typescript
// Derived from ds-advanced.jsx allItems structure (verified)
export interface CommandPaletteItem {
  /** ReactNode icon, 14x14px recommended */
  icon?: ReactNode;
  /** Display label; used for filtering */
  label: string;
  /** Optional keyboard shortcut displayed as <Kbd> chip */
  shortcut?: string;
  /** Group name; items with same group are clustered under a header */
  group: string;
  /** Arbitrary value passed to onSelect */
  value?: unknown;
}
```

### CSS Anchor Points from primitives.css (existing)
```css
/* Source: primitives.css line 803 (verified) */
/* Modal backdrop — NOT reused; reference only for z-index convention */
.ds-atom-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  z-index: 1000;              /* CommandPalette should use same z-index */
}

/* Source: primitives.css line 4805 (verified) */
/* ds-atom-kbd — used by Kbd component, referenced in item shortcut rendering */
.ds-atom-kbd {
  font-family: var(--mono);
  font-size: 11px;
  background: var(--cream-2);
  border: 1px solid var(--rule);
  border-radius: 4px;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `ds-cmd-*` handoff class names | `ds-atom-cmd-*` library namespace | All phases since Phase 17 | Must rename when porting from handoff |
| Internal useState for open | Controlled open prop | Established pattern in Modal/ConfirmDialog | Consumer owns trigger logic |
| Global window listener inside component | Consumer-owned listener; component is controlled | Library design decision | Component does not capture Cmd+K |

---

## Consumer API Decision: Controlled vs. Self-Managed

**Decision: Controlled (open + onClose props).** [VERIFIED by examining Modal, ConfirmDialog, Sheet, BottomSheet, Lightbox — all are controlled]

The handoff's `CommandPaletteSection` uses internal `useState` because it is a **demo wrapper**, not the exported component. Every overlay in this library is controlled. The consumer registers the Cmd+K listener in their app shell and passes `open` down. This is the right pattern for a library because:

1. Consumers may want different triggers (toolbar button, URL routing, etc.)
2. Consumers may want to disable the shortcut conditionally
3. Library components don't own application-level keyboard shortcuts

The Storybook story will include the Cmd+K listener as story-level scaffolding (same pattern as Modal stories that use a useState button trigger).

---

## Open Questions

1. **Arrow key navigation: should items be real `button` elements or `div` with `role="option"`?**
   - What we know: Handoff uses `div.ds-cmd-item` with onClick
   - What's unclear: ARIA combobox pattern (`role="combobox"` on input, `role="listbox"` on results, `role="option"` on items) vs. simpler `role="list"/"listitem"` — both are valid
   - Recommendation: Use `role="combobox"` on the input + `role="listbox"` on the body + `role="option"` on each item for maximum screen-reader compatibility. This is the WCAG-aligned pattern for search-to-select UIs.

2. **Should `onSelect` close the palette automatically, or leave that to the consumer?**
   - What we know: Handoff calls `setOpen(false); setQuery('')` inside the item onClick
   - What's unclear: Library pattern — does onSelect imply close?
   - Recommendation: The component should close and clear query on select (same as item click in handoff). This matches user expectation. If the consumer needs to prevent close, they can conditionally not pass the callback.

3. **`items` prop vs. `groups` prop at the API boundary?**
   - What we know: Handoff uses a flat `items[]` array with a `group` string on each item, then derives groups internally
   - Recommendation: Flat `items[]` is cleaner — it's what the handoff uses and consumers don't need to pre-group. The component groups internally.

---

## Environment Availability

Step 2.6: SKIPPED — CommandPalette is a pure in-browser React component with no external tool, service, CLI, or runtime dependencies beyond the existing project stack (React, TypeScript, Vitest, Storybook). All dependencies already present.

---

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Framework | Vitest 2.x + @testing-library/react |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/overlays/CommandPalette` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| REQ-22-01 | Renders null when open=false | unit | `npx vitest run src/overlays/CommandPalette` | Wave 0 |
| REQ-22-01 | Panel renders with correct ARIA when open=true | unit | same | Wave 0 |
| REQ-22-01 | Typing filters results (substring match) | unit | same | Wave 0 |
| REQ-22-01 | No-results message when filter is empty | unit | same | Wave 0 |
| REQ-22-01 | Escape calls onClose and clears query | unit | same | Wave 0 |
| REQ-22-01 | Arrow keys navigate focusedIndex | unit | same | Wave 0 |
| REQ-22-01 | Enter on focused item calls onSelect | unit | same | Wave 0 |
| REQ-22-01 | Item click calls onSelect and onClose | unit | same | Wave 0 |
| REQ-22-01 | Click on backdrop calls onClose | unit | same | Wave 0 |
| REQ-22-01 | Shortcut rendered as Kbd chip | unit | same | Wave 0 |
| REQ-22-01 | axe-core zero violations (light + dark) | a11y | manual via Storybook | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/overlays/CommandPalette`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `src/overlays/CommandPalette/CommandPalette.test.tsx` — covers all REQ-22-01 behaviors above
- [ ] `src/overlays/CommandPalette/index.tsx` — component file
- [ ] `src/overlays/CommandPalette/CommandPalette.stories.tsx` — Storybook stories
- [ ] CSS block for `ds-atom-cmd-*` in `src/primitives.css`
- [ ] Export in `src/index.ts`

---

## Security Domain

CommandPalette is a pure client-side UI widget with no auth, no data persistence, no HTTP calls, and no user-generated content submitted anywhere. No ASVS categories apply. Security domain: NOT APPLICABLE.

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/design-system/ds-advanced.jsx` lines 3–78 — `CommandPaletteSection` complete source: item schema, CSS classes used, open/close/filter logic, icon rendering, keyboard handler, backdrop pattern
- `src/overlays/Modal/index.tsx` — DSPortal usage, useFocusTrap callback-ref pattern, document-level Escape listener pattern
- `src/overlays/ConfirmDialog/index.tsx` — Controlled overlay pattern with DSPortal, Kbd import pattern
- `src/overlays/Lightbox/index.tsx` — Arrow key navigation pattern in a portal overlay
- `src/_internals/DSPortal.tsx` — SSR-safe portal implementation
- `src/hooks/useFocusTrap.ts` — Focus trap API: `(container: T | null, active: boolean) => void`
- `src/inputs/Kbd/index.tsx` — Kbd component API: `size?: "sm" | "md"`, `children`
- `src/primitives.css` — Confirmed: NO `ds-cmd-*` or `ds-overlay` classes exist; `ds-atom-kbd` and `ds-atom-modal-backdrop` verified at lines 4805 and 803
- `src/index.ts` — All existing exports; CommandPalette not yet exported
- `.planning/REQUIREMENTS.md` — REQ-22-01 acceptance criteria
- `.planning/ROADMAP.md` — Phase 22 success criteria
- `vitest.config.ts` — Test framework: Vitest, jsdom, setupFiles: `src/test-setup.ts`

### Secondary (MEDIUM confidence)
- `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` — Test pattern: fireEvent.keyDown(document, ...), querySelector('.ds-atom-*'), vi.fn() for callbacks

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | `CommandPalette` should live in `src/overlays/` (not `src/interaction/`) | Standard Stack / Location | Low — either location works; overlays is more accurate for a portal-mounted panel |
| A2 | The component should NOT own the Cmd+K window listener; consumer registers it | Consumer API Decision | Medium — if the spec intended self-contained behavior, the API design differs; but all other overlays are controlled |
| A3 | `role="combobox"` + `role="listbox"` + `role="option"` is the correct ARIA pattern | Open Questions | Low — this is the WCAG-aligned pattern for search-to-select; `role="dialog"` is an acceptable fallback |

**Three assumptions.** All are low-to-medium risk and should be confirmed by the planner before execution begins.

---

## Metadata

**Confidence breakdown:**
- CSS classes needed: HIGH — grep of primitives.css confirmed zero existing ds-cmd-* classes
- Component structure: HIGH — all existing overlays are controlled; handoff pattern confirmed
- DSPortal usage: HIGH — Modal, ConfirmDialog, Lightbox all verified as DSPortal consumers
- Filtering approach: HIGH — handoff uses simple substring; confirmed in source
- Keyboard nav pattern: HIGH — Lightbox arrow-key pattern verified as the codebase precedent
- ARIA: MEDIUM — combobox pattern is standard but exact attribute wiring needs implementation validation

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable stack; CSS additions are the only volatile surface)
