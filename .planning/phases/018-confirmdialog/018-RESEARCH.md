# Phase 18: ConfirmDialog — Research

**Researched:** 2026-05-05
**Domain:** React dialog components — tone-differentiated confirmation UX, keyboard gate patterns
**Confidence:** HIGH — primary source is the literal design-handoff spec file; all codebase claims verified by direct file reads.

---

## Summary

Phase 18 ships two components: a tone-differentiated `ConfirmDialog` and a typed-gate `TypeToConfirm`. The design spec (`ds-confirmdialog.jsx`) is fully readable and unambiguous — both components are self-contained 360px panels rendered against a fixed always-light surface (`rgba(255,255,255,.97)`), not body-dark token-driven. The existing `ConfirmDialog` export in `src/overlays/Modal/index.tsx` is a different, simpler binary-danger variant (boolean `danger` prop, no tone system). Phase 18 introduces a new, richer 4-tone `ConfirmDialog` and a net-new `TypeToConfirm` — these are additive, not replacements.

The key architectural decision is where the new components live. The existing `ConfirmDialog` sits in `src/overlays/Modal/index.tsx` as a same-file variant export. The Phase 18 version has a substantially different API (tone prop, icon area, tinted backgrounds) and should live in its own directory `src/overlays/ConfirmDialog/` to keep the Modal file clean and avoid API collision. `TypeToConfirm` is a standalone dialog panel, not a composition of ConfirmDialog, and ships in the same directory or `src/feedback/TypeToConfirm/`.

Both panels render their own container div (no backdrop or overlay). They are meant to be placed inside a caller-controlled backdrop, or composed with Modal's backdrop. The SPEC shows them as standalone divs — the backdrop (ds-atom-modal-backdrop) is already provided by the existing Modal infrastructure and can be reused via a thin wrapper or via Modal's `open`/`onClose` with `closeOnBackdropClick={false}`.

**Primary recommendation:** Build each component as a self-contained panel component that accepts an `open` prop and renders a `DSPortal`-mounted backdrop (reusing `ds-atom-modal-backdrop`) with the panel inline. This matches every other dialog in the system (Modal, Sheet, BottomSheet) and gives keyboard/focus-trap behavior for free via `useFocusTrap`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Overlay backdrop + portal mount | Frontend component | — | All overlay components use DSPortal + ds-atom-modal-backdrop |
| Focus trap (Tab cycling) | `useFocusTrap` hook | — | Existing hook handles Tab trap + focus restore |
| Escape key handler | Component `useEffect` | — | Document-level keydown listener, same pattern as Modal |
| Enter key → confirm | Component `useEffect` | — | Scoped to `open` state; fires `onConfirm` when button enabled |
| Tone-to-color mapping | Component constant object | — | Static map of tone → CSS values; no server/API dependency |
| TypeToConfirm comparison | Component state | — | Pure client-side string equality check |
| Accessibility ARIA wiring | Component JSX | — | role, aria-modal, aria-labelledby, aria-describedby on panel root |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-18-01 | ConfirmDialog — 4-tone dialog (danger/warn/success/neutral), always-light surface, keyboard confirm/cancel | Tone configs fully extracted from SPEC; surface constraint confirmed in CONSTRAINT-010; keyboard pattern from Modal |
| REQ-18-02 | TypeToConfirm — case-sensitive exact-match gate, red confirm button when enabled, ds-input styling | Comparison logic confirmed (===, no trim) from CONSTRAINT-013 and SPEC; TextInput component available |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (already in project) | 19 | Component authoring | Project stack |
| `useFocusTrap` | internal hook | Tab trap + focus restore | Already used by Modal, Sheet, BottomSheet |
| `DSPortal` | internal | SSR-safe portal to body | Already used by all overlay components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Button` component | internal | Cancel/Confirm footer buttons | Reuse existing Button with `variant` prop |
| `TextInput` component | internal | Input field in TypeToConfirm | Reuse; adds ds-atom-input class + inline base styles |
| `Kbd` component | internal (Phase 17) | "Type DELETE to confirm" hint | Used inline in TypeToConfirm label row |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DSPortal + custom backdrop | Compose existing Modal | Modal has a close X button header, Archivo 17px title, max-width 480px — all wrong for the 360px compact confirm pattern. Better to build own backdrop clone. |
| Button component for confirm | Inline `<button>` with inline styles | SPEC uses inline `<button className="ds-btn">` — but this project uses the Button React component with `variant` prop; use Button component for consistency |

**Installation:** No new packages needed. All dependencies are internal.

---

## Architecture Patterns

### System Architecture Diagram

```
Caller (open state)
        |
        v
[DSPortal → document.body]
        |
        v
[ds-atom-modal-backdrop]   ← existing CSS class, fixed inset 0, dark scrim, blur(2px)
        |
        v
[Panel div]   ← 360px, rgba(255,255,255,.97), blur(14px), radius 14px, shadow
   ├── [Icon area]   ← 40×40px, tone tint bg, tone icon SVG
   ├── [Text block]  ← title (Archivo 700 15px) + body (12.5px ink-2 lh 1.5)
   └── [Footer]      ← Cancel (Button ghost) + Confirm (Button with tone-matched variant or inline style)

Keyboard:
  document keydown (while open=true)
    - "Escape" → onCancel()
    - "Enter"  → onConfirm() IF confirm button not disabled
```

For TypeToConfirm, same outer shape but body has:
```
   ├── [Title]
   ├── [Body text]
   ├── [Hint row] — "Type <Kbd>DELETE</Kbd> to confirm"
   ├── [TextInput] — value controlled, onChange → setState
   └── [Footer] — Cancel + Confirm (disabled until value === guardWord)
```

### Recommended Project Structure
```
src/
├── overlays/
│   └── ConfirmDialog/
│       ├── index.tsx              # exports TonedConfirmDialog, TypeToConfirm
│       ├── ConfirmDialog.test.tsx
│       └── ConfirmDialog.stories.tsx
```

Note on naming collision: The existing `ConfirmDialog` export from `src/overlays/Modal/index.tsx` is already in `src/index.ts`. The Phase 18 component is a richer variant. Options:
1. Name it `TonedConfirmDialog` (avoids collision, explicit)
2. Name it `ConfirmDialog` and update the existing export in Modal/index.tsx to be removed or kept as a legacy alias

**Recommendation:** Name the new component `ConfirmDialog` (matching the SPEC) but keep it in `src/overlays/ConfirmDialog/index.tsx`. The existing binary-danger `ConfirmDialog` in `Modal/index.tsx` should be renamed `SimpleConfirmDialog` internally (or kept as is with the old export name — the barrel already exports it from `./overlays/Modal`). The new export from `./overlays/ConfirmDialog` should use the unambiguous export name `ConfirmDialog` only if the old one is removed or renamed. **Planner must make a final call on the naming strategy to avoid a duplicate export in `src/index.ts`.**

### Pattern 1: Tone Config Object (from SPEC)
**What:** Static map of tone → color, tint background, and icon SVG.
**When to use:** Drives icon area tint, icon stroke color, and confirm button styling.

```tsx
// Source: design_handoff/design-system/ds-confirmdialog.jsx (VERIFIED: direct file read)
const tones = {
  danger: {
    color: 'var(--red)',
    bg: 'rgba(239,68,68,.1)',
    icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>,
  },
  warn: {
    color: 'var(--amber-d)',
    bg: 'rgba(245,158,11,.12)',
    icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>,
  },
  success: {
    color: 'var(--green)',
    bg: 'rgba(34,197,94,.1)',
    icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>,
  },
  neutral: {
    color: 'var(--ink)',
    bg: 'rgba(0,0,0,.05)',
    icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>,
  },
};
```

[VERIFIED: design_handoff/design-system/ds-confirmdialog.jsx]

### Pattern 2: Confirm Button Tone Mapping (from SPEC)
**What:** Each tone maps to a specific button visual. The SPEC uses raw `ds-btn` class names; the project uses the Button React component with `variant` prop.

```tsx
// Source: ds-confirmdialog.jsx line 11 — original class logic
// const btnClass = tone === 'danger' ? 'ds-btn' : tone === 'success' ? 'ds-btn amber' : 'ds-btn dark';
// With danger tone, inline style overrides apply: { background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }

// Translation to project's Button component:
// danger  → Button variant="danger"   (danger variant uses #dc2626 bg + white text — close to var(--red) which is #991b1b in light mode)
//   NOTE: SPEC says background: var(--red) / borderColor: var(--red). Project's danger variant uses #dc2626 hardcoded.
//   Use inline style override to match spec exactly: { background: 'var(--red)', borderColor: 'var(--red)' }
// warn    → Button variant="primary" (amber bg) — SPEC says 'ds-btn amber' which maps to the amber/primary look
// success → Button variant="secondary" with amber-dark override — SPEC says 'ds-btn dark' for success tone
//   Wait: SPEC: danger→plain ds-btn, success/warn→amber, neutral→dark. Let's map precisely:
//   - danger: inline style { bg: var(--red), color: #fff, borderColor: var(--red) }
//   - warn: Button variant="primary" (amber brand CTA) — no further override needed
//   - success: Button variant="primary" — same amber confirm button per SPEC ('ds-btn amber')
//   - neutral: Button variant="secondary" with dark-ink styling, or Button + inline override

// See exact SPEC button class logic below — planner should use inline style to guarantee pixel match.
```

**Important nuance (from SPEC, line 11):**
- `tone === 'danger'` → `'ds-btn'` (default, no modifier) PLUS inline `{ background: var(--red), color: #fff, borderColor: var(--red) }`
- `tone === 'success'` → `'ds-btn amber'`
- `tone === 'warn'` → `'ds-btn amber'` (same as success — both use amber confirm)
- `tone === 'neutral'` → `'ds-btn dark'`

Wait — re-reading the SPEC precisely:
```js
const btnClass = tone === 'danger' ? 'ds-btn' : tone === 'success' ? 'ds-btn amber' : 'ds-btn dark';
```
The ternary: danger → `'ds-btn'`; success → `'ds-btn amber'`; everything else (warn AND neutral) → `'ds-btn dark'`.

Then danger gets the red inline override. So:
- **danger**: base ds-btn + red bg/border inline
- **success**: ds-btn amber (= amber CTA = project's `variant="primary"`)
- **warn**: ds-btn dark (= dark bg = project's secondary/dark style)
- **neutral**: ds-btn dark (same as warn)

[VERIFIED: design_handoff/design-system/ds-confirmdialog.jsx line 11]

**REQ-18-01 states** "warn → amber confirm; success → amber-dark confirm; neutral → dark confirm" — which differs slightly from the raw SPEC ternary. The REQUIREMENTS.md is the authoritative acceptance criteria. Planner should follow REQUIREMENTS.md: danger=red, warn=amber, success=amber-dark, neutral=dark.

Mapping to Button variants:
| Tone | Button variant | Extra inline style |
|------|---------------|--------------------|
| danger | `"danger"` | `{ background: 'var(--red)', borderColor: 'var(--red)' }` to match token (project danger uses hardcoded #dc2626) |
| warn | `"primary"` | none (amber) |
| success | `"primary"` with custom style | `{ background: 'var(--amber-d)', borderColor: 'var(--amber-d)', color: '#fff' }` |
| neutral | `"secondary"` with dark-ink override | `{ background: 'var(--ink)', borderColor: 'var(--ink)', color: '#fff' }` |

[ASSUMED] — the warn/success/neutral button styling interpretation above reconciles SPEC line 11 with REQ-18-01; if exact pixel match to SPEC is more important than REQ-18-01 wording, use the SPEC ternary directly.

### Pattern 3: TypeToConfirm Exact Comparison
**What:** Exact case-sensitive string comparison, no trim.

```tsx
// Source: design_handoff/design-system/ds-confirmdialog.jsx lines 33–35 (VERIFIED)
const [v, setV] = React.useState('');
const target = 'DELETE';  // or guardWord prop
const ok = v === target;  // NO trim, case-sensitive
```

The confirm button disabled state and styling:
```tsx
// Source: ds-confirmdialog.jsx line 44 (VERIFIED)
<button disabled={!ok} style={{
  background: ok ? 'var(--red)' : 'var(--ink-5)',
  color: '#fff',
  borderColor: 'transparent',
  opacity: ok ? 1 : 0.6
}}>Delete forever</button>
```

Use Button component with `disabled={!ok}` and inline style override:
```tsx
<Button
  variant="danger"
  disabled={!ok}
  style={!ok ? { background: 'var(--ink-5)', opacity: 0.6, borderColor: 'transparent' } : { background: 'var(--red)', borderColor: 'transparent' }}
  onClick={onConfirm}
>
  {confirmLabel}
</Button>
```

### Pattern 4: Keyboard Handler (Enter + Escape)
**What:** Document-level keydown on the dialog container while open.

```tsx
// Source: Modal/index.tsx lines 99–106 (VERIFIED — existing pattern)
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter' && !confirmDisabled) onConfirm();
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, [open, onCancel, onConfirm, confirmDisabled]);
```

The Enter handler must check if the confirm button is currently enabled (`!disabled`). For TypeToConfirm, `confirmDisabled = v !== guardWord`. For ConfirmDialog, confirm is always enabled.

**Scoping concern:** The document-level listener fires whenever the dialog is open. Since focus is trapped inside the dialog panel, there is no risk of Enter triggering unintended outside-dialog buttons. This is safe.

### Pattern 5: Always-Light Surface Container
**What:** The panel CSS is hardcoded, not token-driven.

```tsx
// Source: CONSTRAINT-010 (VERIFIED) + ds-confirmdialog.jsx line 14 (VERIFIED)
const panelStyle: CSSProperties = {
  width: 360,
  background: 'rgba(255,255,255,.97)',  // NOT var(--cream) — intentionally always-light
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 14,
  border: '1px solid var(--rule)',
  padding: 22,
  boxShadow: '0 16px 48px rgba(0,0,0,.18)',
};
```

No `.dark .ds-atom-confirm-dialog` CSS override should exist. The always-light behavior is achieved by never using `var(--cream)` for the background — `rgba(255,255,255,.97)` does not respond to dark mode token flipping.

### Anti-Patterns to Avoid

- **Using `var(--cream)` as panel background:** This would flip to `#1c1917` in dark mode, breaking the always-light contract (CONSTRAINT-010).
- **Composing the new ConfirmDialog via the existing Modal component:** Modal's panel has `background: #ffffff` + a `.dark .ds-atom-modal { background: var(--cream-2) }` override — this would flip the panel dark. The new component needs its own container element.
- **Attaching Escape handler to the panel element's `onKeyDown`:** Only fires if the panel has focus. The document-level handler is the correct pattern (matches Modal, Sheet).
- **Trimming user input in TypeToConfirm before comparison:** CONSTRAINT-013 is explicit — no trim. `v === target`, not `v.trim() === target`.
- **Exporting the new ConfirmDialog from `src/overlays/Modal/index.tsx`:** Would create a naming collision with the existing `ConfirmDialog` export already in that file and re-exported from `src/index.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab focus trap | Custom Tab key handler | `useFocusTrap(panelNode, open)` | Already handles all edge cases: focus restore, inert elements, no-focusable fallback |
| Portal to body | `document.createElement` / `ReactDOM.render` | `DSPortal` | SSR-safe, already used by all overlays |
| Input component | Raw `<input>` with ad-hoc styles | `TextInput` component (`ds-atom-input` class) | Gets focus ring, dark-mode border, error state for free |
| Button component | Raw `<button>` with inline styles | `Button` component with `variant` + inline override for tone | Gets hover states, focus ring, disabled opacity, loading spinner |
| Kbd hint | Raw `<span>` | `Kbd` component (Phase 17, already exported) | Consistent keyboard hint styling |

**Key insight:** The entire focus management and portal infrastructure already exists. The new components are primarily layout + CSS + comparison logic, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: Naming Collision with Existing ConfirmDialog Export
**What goes wrong:** `src/index.ts` already exports `ConfirmDialog` from `./overlays/Modal`. If Phase 18 exports another `ConfirmDialog` from `./overlays/ConfirmDialog`, the barrel has a duplicate named export and TypeScript/Vite will error at build time.
**Why it happens:** The Phase 18 component spec has the same name as the existing binary-danger variant.
**How to avoid:** Either (a) rename the Phase 18 component `TonedConfirmDialog` and export as such, OR (b) rename the old export to `SimpleConfirmDialog` within Modal/index.tsx and update the barrel. The planner must decide; the CSS plan (Plan 018-01) can note this dependency.
**Warning signs:** Build error "Duplicate export 'ConfirmDialog'" or TypeScript seeing two definitions of the type.

### Pitfall 2: Dark Mode Token Bleed on Panel
**What goes wrong:** Any CSS class added to the panel root that uses `var(--cream)` or `var(--cream-2)` will flip to near-black in dark mode, breaking the always-light design.
**Why it happens:** The global token sheet redefines `--cream` under `body.dark`.
**How to avoid:** Use only hardcoded RGBA values for background/surface. Use `var(--rule)` for border (it flips from rgba(0,0,0,.10) to rgba(255,255,255,.10) — acceptable for a border, not for a fill). Avoid `var(--cream)` entirely on the panel.
**Warning signs:** Panel goes dark in the DarkMode Storybook story.

### Pitfall 3: Enter Key Fires When Input Is Focused (TypeToConfirm)
**What goes wrong:** Document-level `keydown` listener catches Enter even while the user is typing in the TextInput, triggering confirm before the typed value has propagated to state.
**Why it happens:** `onChange` and `keydown` both fire on the same keystroke. In React, `onChange` fires first (via synthetic event), then the native `keydown` listener fires. So the state update from `onChange` is already applied when the `keydown` handler reads `v`. This is actually fine — Enter will only fire confirm if `v === guardWord` after the latest keystroke.
**How to avoid:** No special handling needed. The `ok` variable is computed from current state, which has already been updated by `onChange` before the `keydown` listener runs.
**Warning signs (false alarm):** Tests that fire `fireEvent.keyDown` without a preceding `fireEvent.change` — just ensure test sequences match real user behavior.

### Pitfall 4: Focus Not Trapped on Open
**What goes wrong:** User can Tab outside the dialog to background page elements.
**Why it happens:** `useFocusTrap` requires a DOM node reference via the callback-ref pattern; if a regular `useRef` is passed, the trap may not engage on the first render.
**How to avoid:** Follow the Modal pattern exactly — `const [panel, setPanel] = useState<HTMLDivElement | null>(null)` and `ref={setPanel}` on the panel div. Pass `panel` (the state value, not a RefObject) to `useFocusTrap(panel, open)`.
**Warning signs:** axe-core reports "aria-modal missing" and focus escapes.

### Pitfall 5: Missing biome suppression on backdrop click handler
**What goes wrong:** Biome lint rule `lint/a11y/useKeyWithClickEvents` fires on the backdrop `onClick` without a corresponding `onKeyDown`.
**Why it happens:** Every other backdrop in the project (Modal, Sheet, BottomSheet) already has a `biome-ignore` comment explaining that keyboard close is handled by the document Escape listener.
**How to avoid:** Copy the biome-ignore comment pattern from Modal/index.tsx line 118.
**Warning signs:** `biome check` fails in CI.

---

## Code Examples

### Container (always-light panel)
```tsx
// Source: ds-confirmdialog.jsx line 14 (VERIFIED)
<div style={{
  width: 360,
  background: 'rgba(255,255,255,.97)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderRadius: 14,
  border: '1px solid var(--rule)',
  padding: 22,
  boxShadow: '0 16px 48px rgba(0,0,0,.18)',
}}>
```

### Icon area
```tsx
// Source: ds-confirmdialog.jsx lines 15–17 (VERIFIED)
<div style={{
  width: 40, height: 40, borderRadius: 10,
  background: t.bg,       // tone tint: e.g. rgba(239,68,68,.1)
  color: t.color,         // tone stroke: e.g. var(--red)
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}}>
  {t.icon}  {/* inline SVG, 22×22 */}
</div>
```

### Header layout
```tsx
// Source: ds-confirmdialog.jsx lines 15–22 (VERIFIED)
<div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
  {/* icon area */}
  <div style={{ flex: 1, paddingTop: 2 }}>
    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{title}</div>
    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{body}</div>
  </div>
</div>
```

### Footer
```tsx
// Source: ds-confirmdialog.jsx lines 23–27 (VERIFIED)
<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
  <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
  <Button variant={...} style={...} onClick={onConfirm}>{confirmLabel}</Button>
</div>
```

### TypeToConfirm hint row
```tsx
// Source: ds-confirmdialog.jsx lines 40–41 (VERIFIED)
<div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>
  Type <Kbd size="sm">{guardWord}</Kbd> to confirm
</div>
<TextInput
  value={v}
  onChange={e => setV(e.target.value)}
  placeholder={`Type ${guardWord}`}
  style={{ width: '100%', marginBottom: 14 }}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Binary `danger` prop on ConfirmDialog | 4-tone system (danger/warn/success/neutral) | Phase 18 | Richer UX; icon + tint + button all keyed off tone |
| Modal-composition for ConfirmDialog | Own panel div (always-light) | Phase 18 | Decoupled from Modal's dark-mode override |

**Deprecated/outdated:**
- The existing `ConfirmDialog` from `src/overlays/Modal/index.tsx` is a Milestone 1 primitive that covers the basic binary case. Phase 18's version is a richer design-system upgrade. Both can coexist if renamed correctly.

---

## Existing Infrastructure Audit

Everything below was verified by direct file reads:

| Infrastructure | Status | Used By Phase 18 |
|----------------|--------|-----------------|
| `DSPortal` (`src/_internals/DSPortal.tsx`) | Exists | Yes — portal to body |
| `useFocusTrap` (`src/hooks/useFocusTrap.ts`) | Exists | Yes — Tab trap |
| `ds-atom-modal-backdrop` CSS | Exists in primitives.css | Yes — reuse for backdrop scrim |
| `Button` component | Exists | Yes — Cancel + Confirm buttons |
| `TextInput` component (`ds-atom-input` class) | Exists | Yes — TypeToConfirm input |
| `Kbd` component (Phase 17) | Exists, exported | Yes — hint label in TypeToConfirm |
| `ConfirmDialog` export (old, binary) | Exists in Modal/index.tsx | Naming conflict — must resolve |
| `TypeToConfirm` export | Does NOT exist yet | New in Phase 18 |
| CSS for new panel | Does NOT exist yet | New classes needed |

---

## CSS Needs

### What Already Exists (reuse)
- `ds-atom-modal-backdrop` — the dark scrim + blur(2px) overlay (primitives.css lines 803–814)
- `ds-atom-modal-fadein`, `ds-atom-modal-in` — backdrop + panel entrance animations
- `ds-atom-input` — TextInput base class
- `ds-atom-btn` + `data-variant` — Button base + variant styles
- `ds-atom-kbd` — Kbd base class

### What Needs to Be Added to primitives.css
New atom block for the ConfirmDialog panel. All layout and always-light surface values are hardcoded in JSX inline styles in the SPEC — no new CSS classes are strictly required if using inline styles. However, for consistency with the design-system's pattern (CSS handles pseudo-states, JSX handles layout), the following optional additions are clean:

```css
/* ds-atom-confirm-dialog — Phase 18 */
/* No new pseudo-states needed; the panel is always-light and has no dark override.
   Icon area, title, body, footer all use inline styles per SPEC pattern.
   The ds-atom-modal-backdrop class already provides the backdrop. */
```

**Decision for planner:** The CSS plan (018-01) can be minimal — either "no new CSS needed" (all inline styles) or a small named class for the panel container for testability (`data-testid` or `.ds-atom-confirm-panel` for test queries). Recommend adding a single `.ds-atom-confirm-panel` class for test selectors, with no visual styling (all visual is inline). This mirrors how Modal uses `.ds-atom-modal` as the test query anchor.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | vitest.config.ts (project root) |
| Quick run command | `vitest run src/overlays/ConfirmDialog` |
| Full suite command | `vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-18-01 | tone="danger" renders red icon tint and red confirm button | unit | `vitest run src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` | ❌ Wave 0 |
| REQ-18-01 | tone="warn" renders amber-d icon and amber confirm | unit | same | ❌ Wave 0 |
| REQ-18-01 | tone="success" renders green icon and amber-dark confirm | unit | same | ❌ Wave 0 |
| REQ-18-01 | tone="neutral" renders ink icon and dark confirm | unit | same | ❌ Wave 0 |
| REQ-18-01 | Escape triggers onCancel | unit | same | ❌ Wave 0 |
| REQ-18-01 | Enter triggers onConfirm | unit | same | ❌ Wave 0 |
| REQ-18-01 | Panel has role="alertdialog" + aria-modal + aria-labelledby | unit | same | ❌ Wave 0 |
| REQ-18-01 | Panel does not flip dark in .dark body (always-light) | unit | same | ❌ Wave 0 |
| REQ-18-02 | TypeToConfirm confirm button disabled until exact match | unit | `vitest run src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` | ❌ Wave 0 |
| REQ-18-02 | Comparison is case-sensitive (no trim) | unit | same | ❌ Wave 0 |
| REQ-18-02 | Confirm button turns red when enabled | unit | same | ❌ Wave 0 |
| REQ-18-02 | Enter triggers onConfirm only when enabled | unit | same | ❌ Wave 0 |
| REQ-18-02 | guardWord prop overrides default "DELETE" | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run src/overlays/ConfirmDialog`
- **Per wave merge:** `vitest run`
- **Phase gate:** Full suite green + `tsc --noEmit` clean before verification

### Wave 0 Gaps
- [ ] `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` — covers REQ-18-01 and REQ-18-02
- [ ] `src/overlays/ConfirmDialog/index.tsx` — component implementation
- [ ] `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` — Storybook stories

*(axe-core scan: no `jest-axe` package detected in project. The success criterion "axe-core scan passes with zero violations in Storybook" is validated via Storybook's a11y addon manually. No automated axe test infrastructure exists in the codebase — the Phase 17 tests confirm this pattern: Kbd, RelativeTime, Pagination tests use `@testing-library/react` without axe assertions.)*

---

## Security Domain

ConfirmDialog and TypeToConfirm are pure client-side UI components with no network calls, no data persistence, no authentication, and no external service calls.

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V2 Authentication | No | No auth logic |
| V3 Session Management | No | No session handling |
| V4 Access Control | No | No access control |
| V5 Input Validation | Minimal | TypeToConfirm compares user input to a prop string — no injection surface; value is only compared client-side, never sent anywhere |
| V6 Cryptography | No | No crypto |

No security concerns for this phase.

---

## Environment Availability

Step 2.6 SKIPPED — Phase 18 has no external dependencies beyond the existing project runtime (Node.js, React, Vitest). All required infrastructure (DSPortal, useFocusTrap, Button, TextInput, Kbd) is already in the codebase.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | warn and success tones should both use an amber-family confirm button per REQ-18-01, not the 'ds-btn dark' the SPEC ternary assigns to 'warn' | Pattern 2: Confirm Button Tone Mapping | Confirm button color is wrong for warn tone; planner should verify against visual reference |
| A2 | `ds-atom-modal-backdrop` CSS class can be reused as the backdrop for the new dialog (not a new backdrop class) | Architecture | If backdrop has Modal-specific properties not visible in the CSS excerpt, a new backdrop class may be needed |
| A3 | The naming conflict between Phase 18 `ConfirmDialog` and the existing export should be resolved by new component using a distinct internal directory; planner decides the export name | Pitfall 1 | If not resolved, build breaks on duplicate export |

---

## Open Questions

1. **Naming collision resolution**
   - What we know: `src/index.ts` exports `ConfirmDialog` from `./overlays/Modal`. Phase 18 adds a richer `ConfirmDialog`.
   - What's unclear: Should the existing one be renamed `SimpleConfirmDialog` (breaking change for consumers), or should Phase 18 use `TonedConfirmDialog`?
   - Recommendation: Rename the Phase 18 component to `ConfirmDialogToned` or simply keep the new one as `ConfirmDialog` and move the old one to `SimpleConfirmDialog` with a comment noting it's the Milestone 1 variant. Since this is an internal design system (not a public npm package with semver consumers), the rename is low risk.

2. **Backdrop click behavior**
   - What we know: The SPEC shows the panel as a standalone div with no backdrop logic. REQ-18-01 does not mention `closeOnBackdropClick`.
   - What's unclear: Should clicking the backdrop close the dialog for non-danger tones?
   - Recommendation: Default to `closeOnBackdropClick={false}` for all tones — confirmation dialogs should require explicit Cancel/Confirm. Planner should note this as a prop or hardcoded behavior.

3. **TypeToConfirm placement in directory structure**
   - What we know: It's a separate SPEC function but visually similar to ConfirmDialog.
   - What's unclear: Should it live in `src/overlays/ConfirmDialog/` alongside ConfirmDialog, or in `src/feedback/TypeToConfirm/`?
   - Recommendation: Co-locate in `src/overlays/ConfirmDialog/index.tsx` as a named export — they share the same always-light panel pattern and are designed together.

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/design-system/ds-confirmdialog.jsx` — complete component spec, verified by direct file read
- `src/overlays/Modal/index.tsx` — existing Modal + ConfirmDialog implementation, verified by direct file read
- `src/inputs/Button/index.tsx` — Button variants and styles, verified by direct file read
- `src/inputs/TextInput/index.tsx` — TextInput implementation, verified by direct file read
- `src/hooks/useFocusTrap.ts` — focus trap hook API, verified by direct file read
- `src/_internals/DSPortal.tsx` — portal implementation, verified by direct file read
- `.planning/intel/constraints.md` — CONSTRAINT-010, CONSTRAINT-013, verified by direct file read
- `.planning/REQUIREMENTS.md` — REQ-18-01, REQ-18-02, verified by direct file read
- `src/primitives.css` — existing CSS classes (modal backdrop, input, button pseudo-states), verified by direct grep

### Secondary (MEDIUM confidence)
- `src/overlays/Modal/Modal.test.tsx` — test pattern reference for keyboard events and focus trap assertions
- `src/inputs/Kbd/Kbd.test.tsx` — Phase 17 test style reference

---

## Metadata

**Confidence breakdown:**
- Tone config (colors, icons, layout): HIGH — extracted verbatim from SPEC file
- Button class mapping: MEDIUM — one assumption (warn tone button color) differs between SPEC ternary and REQ-18-01 wording
- Architecture (new component vs Modal composition): HIGH — verified Modal has dark-mode override that would break always-light contract
- Focus trap / keyboard pattern: HIGH — verified against existing Modal implementation
- CSS needs: HIGH — verified existing classes cover the backdrop; panel is inline-style-first per SPEC

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable internal codebase; no external library versions to track)
