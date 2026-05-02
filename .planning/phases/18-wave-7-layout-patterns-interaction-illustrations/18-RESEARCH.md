# Phase 18: Wave 7 — Layout, Patterns, Interaction + Illustrations — Research

**Researched:** 2026-05-02
**Domain:** React primitive library — layout shell, multi-step patterns, inline interaction, SVG subpath export, drag-and-drop
**Confidence:** HIGH (most claims verified via npm registry, codebase inspection, and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 Sidebar responsive behaviour:** Icon rail collapse — sidebar shrinks from full-width to 48px icon-only rail below 768px. Clicking an icon in the collapsed state expands back to full width.
- **D-02 Slot API:** Props-based slots — `<AppShell sidebar={<Nav/>} topbar={<AppBar/>} main={<Page/>} footer={<Footer/>}>`. AppBar is a standalone primitive passed into the `topbar` slot, NOT rendered internally by AppShell.
- **D-03 Sidebar state persistence:** localStorage by default, opt-out via `storageKey={null}`. Resets to expanded on every reload without it.
- **D-04 AppBar composition:** AppBar is fully standalone — consumer passes it as the `topbar` slot.
- **D-05:** AppBar follows handoff `ds-appbar.jsx` for 4 variants (minimal / withSearch / default/nav / centered). Footer follows `ds-footer.jsx` for compact (1 line) + expanded (4-col) variants.
- **D-06 Illustrations format:** Inline SVG React components — same pattern as `/icons` subpath.
- **D-07 Palette:** Per-illustration accent colours allowed (blue, green, red in addition to cream+ink+amber).
- **D-08 Count:** All 24 illustrations from `ds-illustrations.jsx` ship in v1.0.
- **D-09 Size API:** `width` + `height` props (not a single `size` prop). Default 120×120.
- **D-10 Dark mode:** Planner's discretion — token-flip where CSS custom properties used; hardcode where fixed brand colours.
- **D-11 DnD Library:** `@dnd-kit/core` + `@dnd-kit/sortable` as direct dependencies (not peer deps).
- **D-12 DnD Scope:** List reorder AND cross-list / Kanban-column item reorder. Both ship in v1.0.
- **D-13 Keyboard UX:** Space to lift → Arrow keys to move → Space to drop. Tab exits drag mode.
- **D-14 Drop indicator:** 1px amber line between items showing drop position.
- **D-15 Reduced motion:** `prefers-reduced-motion` respected — skip transform spring/easing, use instant repositioning.
- **D-16 Wave 1:** AppShell + AppBar + Footer (DS-71, 72, 73).
- **D-17 Wave 2:** Illustrations subpath infra + all 24 SVG components (DS-81).
- **D-18 Waves 3-4:** Pattern helpers (Wizard DS-74, FormValidation DS-75, Coachmark DS-76) and Interaction primitives (InlineEdit DS-77, SearchAndFilters DS-78, Presence DS-79). Planner determines exact grouping.
- **D-19 Final wave:** Sortable DS-80.

### Claude's Discretion
- **AppBar search integration:** Whether the AppBar "with search" variant embeds a full SearchAndFilters (DS-78) component or a standalone input — planner decides based on dependency order.
- **Illustration dark mode:** Specific flip behaviour (token-based vs hardcoded) per SVG.
- **Wave 3 vs 4 split:** Exact primitive assignment between waves 3 and 4 for patterns + interaction group.
- **DS-82 reserved slot:** Whether to use it and for what.

### Deferred Ideas (OUT OF SCOPE)
- Kanban column reorder (moving columns left/right) — v1.1+ follow-up.
- URL-synced Wizard steps — component-state only in v1.0.
- Illustration builder / theme tokens — static SVG components only.
- AppShell multi-breakpoint — single breakpoint at 768px for v1.0.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DS-71 | AppShell — sidebar + topbar + main + footer slots; 48px icon-rail collapse at 768px; localStorage persistence | CSS Grid layout, localStorage API, no state-management library needed (useState + useEffect) |
| DS-72 | AppBar — 4 variants (minimal, withSearch, default/nav, centered); sticky scroll-blur behaviour | `position: sticky`, `backdropFilter`, scroll event listener for `scrolled` prop |
| DS-73 | Footer — compact (1-line copyright + links) + expanded (4-column marketing) + sticky-action-bar variants | Pure CSS layout, no dependencies |
| DS-74 | Wizard — horizontal + vertical stepper; multi-step form scaffold with ProgressBar; per-step validation hook; back/next | React state machine, `useFocusTrap` for dialog trapping, ProgressBar reuse |
| DS-75 | FormValidation helpers — PasswordStrength meter + FieldError + FormErrorSummary | Lightweight composable components, no form library |
| DS-76 | Coachmark — first-run hint anchored to a target; dismissible; localStorage key persistence | Popover reuse, DSPortal, localStorage API, `useClickOutside` |
| DS-77 | InlineEdit — click-to-edit text + textarea; optimistic save + error recovery + escape-to-cancel | InlineConfirm pattern reference, controlled/uncontrolled duality |
| DS-78 | SearchAndFilters — search bar + autocomplete dropdown + filter chips (Chip) + clear-all | DSDropdown reuse, Autocomplete pattern reference, Chip reuse |
| DS-79 | Presence — extend Avatar with presence-dot positions (top/bottom × left/right); AvatarStack overflow tuning | Avatar.tsx extension, `presencePosition` prop addition |
| DS-80 | Sortable (DnD) — list reorder + cross-list/Kanban item reorder; keyboard (space/arrow); amber drop indicator; reduced-motion | `@dnd-kit/core@6.3.1` + `@dnd-kit/sortable@10.0.0` install |
| DS-81 | Illustrations subpath — 24 named SVG React components; `/illustrations` subpath export; tree-shakeable | tsup `entry` extension, same pattern as `/icons` subpath already proven |
| DS-82 | Reserved slot — surface during planning if needed | TBD |
</phase_requirements>

---

## Summary

Phase 18 is the final wave to reach v1.0.0. It ships 12 primitives spanning four distinct technical areas: layout shell (AppShell/AppBar/Footer), a new SVG subpath export, multi-step/interaction pattern components, and the drag-and-drop primitive.

The good news is that most complexity is either already solved by existing infrastructure or is straightforward to address with well-known patterns. The `/icons` subpath already proves the tsup multi-entry + tree-shaking approach; the 24 illustrations are drop-in SVG conversions from `ds-illustrations.jsx`. AppShell is a pure CSS Grid layout with no exotic state requirements. Wizard, Coachmark, InlineEdit, and SearchAndFilters all compose from already-shipped primitives (ProgressBar, Popover, DSDropdown, Chip, Avatar). The only genuine unknown is `@dnd-kit/core` + `@dnd-kit/sortable` integration — verified installable, React 19 compatible, and with a well-understood API.

Dark mode for illustrations requires per-SVG analysis: most use `var(--ink)` and `var(--amber)` which flip automatically; `#fff` fills and `rgba(0,0,0,.06)` shadow ellipses will need replacement with `var(--cream)` and a dark-adjusted shadow token respectively.

**Primary recommendation:** Execute waves in the locked order (D-16 through D-19). Get the illustrations subpath infrastructure in place in Wave 2 so EmptyState consumers can start using it immediately. Defer Sortable last as the only primitive requiring a new npm install + iOS Safari testing.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| AppShell layout | Browser / Client | — | Pure CSS Grid + React state for collapse; no SSR concerns; consumer app provides routing |
| AppBar sticky scroll | Browser / Client | — | `position: sticky` + scroll listener; no server involvement |
| Sidebar localStorage | Browser / Client | — | `window.localStorage` read/write; SSR-safe guard needed (`typeof window !== 'undefined'`) |
| Illustrations subpath | CDN / Static (build-time) | — | Static SVG components bundled at build time; tree-shaken by consumer bundler |
| Wizard step state | Browser / Client | — | Component state only (D-CONTEXT: no URL sync in v1.0) |
| Coachmark floating hint | Browser / Client | — | DSPortal-mounted overlay; localStorage for dismiss persistence |
| InlineEdit optimistic save | Browser / Client | API / Backend | Component handles optimistic UI + error rollback; actual save is consumer-provided `onSave` callback |
| SearchAndFilters query | Browser / Client | — | Filter state in component; actual search is consumer-provided |
| Presence dot | Browser / Client | — | CSS positioning extension of existing Avatar |
| Sortable DnD | Browser / Client | — | @dnd-kit handles all pointer/keyboard/touch input; state management is consumer-owned |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@dnd-kit/core` | 6.3.1 | DnD context, sensors, collision detection | Confirmed latest via `npm view` [VERIFIED: npm registry] |
| `@dnd-kit/sortable` | 10.0.0 | `useSortable`, `SortableContext`, `arrayMove` | Peer-depends on `@dnd-kit/core@^6.3.0`; confirmed [VERIFIED: npm registry] |
| `@dnd-kit/utilities` | 3.2.2 | `CSS.Transform.toString()` for transform strings | Utility companion; confirmed [VERIFIED: npm registry] |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^1.14.0 | Icon source for icons subpath | Already dependency; no new install |
| `react` | ^19.2.4 (devDep/peer) | Runtime | Already present |

### No New Installs for Non-DnD Primitives

AppShell, AppBar, Footer, Wizard, FormValidation, Coachmark, InlineEdit, SearchAndFilters, Presence, Illustrations — all composed from existing DS infrastructure or platform APIs (localStorage, CSS). Zero new npm installs required for these 11 primitives.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | `@dnd-kit/react` (v2 alpha) | v2 alpha ships a `DragDropProvider` API that is notably different from v1; locked by D-11 to the stable v1 stack |
| localStorage for sidebar | React context / Zustand | Library adds weight; localStorage + useState is sufficient for single-value persistence |

**Installation (Wave 5 only):**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Version verification:** [VERIFIED: npm registry 2026-05-02]
- `@dnd-kit/core`: 6.3.1
- `@dnd-kit/sortable`: 10.0.0 (peer dep: `@dnd-kit/core@^6.3.0`)
- `@dnd-kit/utilities`: 3.2.2

---

## Architecture Patterns

### System Architecture Diagram

```
Consumer App
│
├── import { AppShell, AppBar, Footer } from '@akhil-saxena/design-system'
│   └── AppShell (CSS Grid: topbar/sidebar/main/footer slots)
│       ├── topbar slot ←── AppBar (standalone, consumer-passed)
│       ├── sidebar slot ←── consumer Nav component
│       ├── main slot ←── consumer page content
│       └── footer slot ←── Footer (standalone, consumer-passed)
│
├── import { Wizard } from '@akhil-saxena/design-system'
│   └── Wizard (step state machine)
│       ├── uses ProgressBar (already shipped DS-42)
│       └── uses useFocusTrap (already shipped hook)
│
├── import { Coachmark } from '@akhil-saxena/design-system'
│   └── Coachmark → Popover (already shipped DS-33)
│       ├── uses DSPortal (body mount)
│       └── reads/writes localStorage[storageKey]
│
├── import { SearchAndFilters } from '@akhil-saxena/design-system'
│   └── SearchAndFilters → DSDropdown (_internal)
│       └── renders Chip (already shipped) for active filters
│
├── import { Sortable, SortableItem } from '@akhil-saxena/design-system'
│   └── DndContext (@dnd-kit/core)
│       ├── PointerSensor + KeyboardSensor
│       ├── SortableContext (@dnd-kit/sortable)
│       │   └── SortableItem (useSortable hook)
│       └── DragOverlay (amber drop indicator 1px line)
│
└── import { EmptyInbox } from '@akhil-saxena/design-system/illustrations'
    └── Static SVG component (120×90 viewBox, width+height props)
        (tree-shaken — bundler strips unused illustrations)
```

### Recommended Project Structure

```
src/
├── AppShell.tsx          # DS-71 — layout shell
├── AppShell.css          # (inline styles preferred; or additions to primitives.css)
├── AppBar.tsx            # DS-72 — standalone topbar primitive
├── Footer.tsx            # DS-73 — compact + expanded variants
├── Wizard.tsx            # DS-74 — multi-step stepper + form scaffold
├── FormValidation.tsx    # DS-75 — PasswordStrength + FieldError + FormErrorSummary
├── Coachmark.tsx         # DS-76 — anchored first-run hint
├── InlineEdit.tsx        # DS-77 — click-to-edit text/textarea
├── SearchAndFilters.tsx  # DS-78 — search bar + filter chips
├── Presence.tsx          # DS-79 — Avatar presence-dot position variants (re-exports Avatar)
├── Sortable.tsx          # DS-80 — DnD list + cross-list
├── illustrations/
│   └── index.ts          # DS-81 — 24 named SVG exports
└── index.ts              # main barrel (add DS-71..80 exports)
```

### Pattern 1: AppShell CSS Grid Layout

**What:** The shell uses a two-dimensional CSS Grid with named areas. The sidebar width animates via CSS transition on a CSS custom property.

**When to use:** Top-level page frame. Consumer passes slot children; AppShell owns only the grid geometry.

```typescript
// Source: codebase pattern (ds-shell.jsx + existing DS Grid patterns) [VERIFIED: ds-shell.jsx]
const AppShell = ({ sidebar, topbar, main, footer, storageKey = 'ds-sidebar-collapsed' }) => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (storageKey === null) return false;
    return localStorage.getItem(storageKey) === 'true';
  });

  useEffect(() => {
    if (storageKey === null) return;
    localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed, storageKey]);

  // CSS Grid: topbar spans full width; sidebar + main share the row below
  // sidebar width: collapsed = 48px, expanded = 240px (from ds-shell.jsx: 200px → use 240px per context)
  return (
    <div
      className="ds-atom-appshell"
      style={{
        '--sidebar-w': collapsed ? '48px' : '240px',
        display: 'grid',
        gridTemplate: '"topbar topbar" auto "sidebar main" 1fr / var(--sidebar-w) 1fr',
        minHeight: '100vh',
      }}
    >
      <header style={{ gridArea: 'topbar' }}>{topbar}</header>
      <aside style={{ gridArea: 'sidebar', transition: 'width 0.25s' }}>{sidebar}</aside>
      <main style={{ gridArea: 'main' }}>{main}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};
```

**Breakpoint:** `@media (max-width: 767px)` hides the sidebar entirely (D-01 specifies 768px as the collapse boundary). The mobile bottom-tab-bar variant is out-of-scope for v1.0 — the handoff shows it but CONTEXT.md locks single-breakpoint.

### Pattern 2: Illustrations Subpath — tsup Entry Extension

**What:** Add `src/illustrations/index.ts` as a new tsup entry point. Same `wrap`-less pattern as `/icons` — each illustration is a standalone functional component, not a wrapped lucide icon.

**When to use:** The same multi-entry tsup config already works for `/icons`. Adding one line to `tsup.config.ts` is all that's needed.

```typescript
// Source: tsup.config.ts [VERIFIED: codebase read]
// Current:
entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts"],

// After Wave 2:
entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts", "src/illustrations/index.ts"],
```

The `package.json` exports stanza also needs the new entry:
```json
"./illustrations": {
  "types": "./dist/illustrations/index.d.ts",
  "import": "./dist/illustrations/index.js"
}
```

Each illustration component:
```typescript
// Source: ds-illustrations.jsx pattern [VERIFIED: codebase read]
// kebab-case name → PascalCase export
// "mail-sent" → MailSent, "empty-box" → EmptyBox, etc.
export interface IllustrationProps {
  width?: number;  // default 120
  height?: number; // default 120 (handoff viewBox is 120×90 but D-09 says default 120×120)
  className?: string;
  style?: React.CSSProperties;
}

export function MailSent({ width = 120, height = 120, ...rest }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 90" width={width} height={height} {...rest}>
      {/* SVG paths from ds-illustrations.jsx */}
    </svg>
  );
}
```

**Dark mode for illustrations:** The SVGs use a mix of hardcoded values and CSS custom properties. Strategy:
- `var(--ink)`, `var(--amber)`, `var(--cream-2)`, `var(--cream-3)` — flip automatically with `.dark` scope
- `#fff` fills — replace with `var(--cream)` so they flip in dark mode
- `rgba(0,0,0,.06)` ground shadow ellipses — replace with `var(--shadow-sm)` or a dedicated token; in dark mode these would look correct as-is if dark bg is dark anyway (planner to decide per D-10)
- `var(--blue)`, `var(--red)` (in `celebrate`, `connection-lost`, `error`) — expressive accent colours, leave as-is per D-07

### Pattern 3: @dnd-kit/core + @dnd-kit/sortable Integration

**What:** The stable v1 API (`DndContext` + `SortableContext` + `useSortable`). The DS `Sortable` primitive wraps this with amber drop indicator and reduced-motion gate.

**When to use:** DS-80. Do NOT use the new `@dnd-kit/react` v2 alpha — that is a different package with a different API.

```typescript
// Source: official dndkit.com docs [CITED: https://dndkit.com/presets/sortable]
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// The keyboard sensor handles Space-to-lift + Arrow-to-move + Space-to-drop
// (default keyboardCodes: start: ['Space', 'Enter'], end: ['Space', 'Enter'],
//  up: ['ArrowUp'], down: ['ArrowDown']) [CITED: https://dndkit.com/extend/sensors/keyboard-sensor]

// Cross-list drag: multiple SortableContext inside one DndContext.
// onDragOver fires as item crosses container boundaries — update state optimistically.
// onDragEnd commits the final position.
```

```typescript
// SortableItem with drop indicator and reduced-motion
function SortableItem({ id, reducedMotion }: { id: string; reducedMotion: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: reducedMotion ? undefined : CSS.Transform.toString(transform),
    transition: reducedMotion ? undefined : transition,
    opacity: isDragging ? 0 : 1, // hide source; DragOverlay shows the dragged clone
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* content */}
    </div>
  );
}
```

**Drop indicator pattern (D-14):** A 1px `var(--amber)` line between items is implemented as a conditional element rendered BEFORE the item at the target drop index, NOT as a shadow on the item. The `activeId` and `overId` from `DndContext` identify where to render the indicator.

**Reduced motion (D-15):** Use existing `useReducedMotion()` hook already in `src/hooks/`. Pass result to item components; when true, skip `CSS.Transform.toString(transform)` and set `transition: undefined`.

### Pattern 4: Wizard State Machine

**What:** A multi-step form container with step index state, validation gate, horizontal/vertical stepper display.

**When to use:** DS-74. The handoff shows both horizontal (StepperHz) and vertical (StepperVt) orientation. Combine into one `Wizard` primitive with `orientation` prop.

```typescript
// Source: ds-wizard.jsx [VERIFIED: codebase read]
interface WizardStep {
  label: string;
  desc?: string;
  /** Called on Next; return error string to block advance, undefined/null to proceed */
  validate?: () => string | null | undefined;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  orientation?: 'horizontal' | 'vertical'; // default 'horizontal'
  children: ReactNode | ((step: number) => ReactNode);
}
```

The ProgressBar (DS-42, `src/ProgressBar.tsx`) provides the compact progress variant. The wizard also renders the full stepper dots independently. Use `useFocusTrap` from `src/hooks/useFocusTrap.ts` when the Wizard is rendered in a dialog context (consumer's choice).

### Pattern 5: Coachmark as Popover Extension

**What:** Coachmark is a positioned `Popover` variant with step counter, dismiss button, localStorage persistence.

```typescript
// Source: Popover.tsx + ds-coachmarks.jsx [VERIFIED: codebase read]
// Coachmark is NOT a new floating layer — it delegates to <Popover> for positioning.
// localStorage key: consumer passes storageKey; dismissed state persists.

function Coachmark({ anchorRef, storageKey, step, total, title, desc, onNext, onDone, ...rest }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return false;
    return localStorage.getItem(storageKey) === 'dismissed';
  });

  const dismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, 'dismissed');
    setDismissed(true);
  };

  if (dismissed) return null;
  return (
    <Popover anchorRef={anchorRef} open={!dismissed} onOpenChange={() => dismiss()} ...>
      {/* Coach mark content: amber step dot, title, desc, dots nav, Next/Done button */}
    </Popover>
  );
}
```

### Pattern 6: InlineEdit — Click-to-Edit

**What:** A display span that becomes an `<input>` or `<textarea>` on click. Optimistic save — caller provides `onSave(value): Promise<void>`. Escape cancels and restores original value. Error is shown inline if `onSave` rejects.

The `InlineConfirm.tsx` (DS-45, shipped) informs the design: both follow the "trigger → editing → confirm/cancel" state machine pattern. InlineEdit is simpler (no confirm prompt) but adds async save + error.

```typescript
// Source: InlineConfirm.tsx + ds-editable.jsx [VERIFIED: codebase read]
type InlineEditState = 'idle' | 'editing' | 'saving' | 'error';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  multiline?: boolean;      // false=input, true=textarea
  placeholder?: string;
  disabled?: boolean;
}
// Controlled/uncontrolled duality not required here — InlineEdit always shows the
// committed value in display mode; the editing value is transient internal state.
```

### Pattern 7: Presence (DS-79) — Avatar Extension

**What:** The current `Avatar` has a hardcoded `presence` dot at `bottom-right`. DS-79 adds configurable `presencePosition`: `'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'`.

```typescript
// Source: Avatar.tsx [VERIFIED: codebase read]
// Current: presence dot always at bottom-right (presenceOffset = -presenceSize*0.3)
// Add: presencePosition prop that controls which corner gets the dot

export type AvatarPresencePosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

// Avatar receives presencePosition?: AvatarPresencePosition (default 'bottom-right')
// The presence dot style computes right/left/top/bottom based on position value
```

This is a backward-compatible extension — `presencePosition` is optional and defaults to `'bottom-right'`, matching current behaviour.

### Anti-Patterns to Avoid

- **Importing `@dnd-kit/react` instead of `@dnd-kit/core`:** The `@dnd-kit/react` package is a v2 alpha with a completely different API (`DragDropProvider` instead of `DndContext`). Do not install it. Use `@dnd-kit/core@6.3.1`. [VERIFIED: npm registry]
- **Using `transform: translate()` strings directly from dnd-kit:** Always use `CSS.Transform.toString(transform)` from `@dnd-kit/utilities`. Raw transform objects are not CSS strings.
- **Body-level overflow hidden for AppShell on mobile:** This causes iOS scroll lock issues. Instead, let the `.ds-atom-appshell` container hold `overflow: hidden` with `height: 100vh`.
- **AppBar "withSearch" depending on SearchAndFilters (DS-78):** AppBar ships in Wave 1; SearchAndFilters ships in Wave 3/4. The AppBar "withSearch" variant uses a standalone `<input>` (same as handoff ds-appbar.jsx shows), NOT the full DS-78 component. Claude's discretion (see CONTEXT.md).
- **Wizard inside a `<form>` element:** Do not wrap Wizard in a `<form>` — the step navigation buttons would submit accidentally. Each step's form fields are the consumer's responsibility. Wizard manages step state only.
- **Illustration viewBox mismatch:** The handoff SVGs use `viewBox="0 0 120 90"` (120×90 aspect) but D-09 specifies default `width=120 height=120`. This means illustrations render with letterboxing by default. This is intentional — consumers can override width/height.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DnD keyboard navigation | Custom keydown handler | `@dnd-kit/core` KeyboardSensor | Handles focus management, announcements, Tab-to-exit, cross-browser quirks |
| DnD touch support | `onTouchStart`/`onTouchMove` | `@dnd-kit/core` PointerSensor | Pointer events unify mouse + touch; PointerSensor handles iOS Safari momentum scroll conflict |
| DnD transform strings | Manual `translate()` CSS | `CSS.Transform.toString()` from `@dnd-kit/utilities` | Handles null transform correctly; avoids NaN in CSS |
| DnD sortable index tracking | Custom index reconciliation | `arrayMove` from `@dnd-kit/sortable` | One-liner; battle-tested for edge cases |
| Floating positioning | Manual `getBoundingClientRect` calcs | Existing `smartAnchorPos` from `src/_internals/floatingPos.ts` | Already handles viewport clamping + scroll tracking |
| Popover Chrome | New overlay component | `src/Popover.tsx` + `src/_internals/DSPortal.tsx` | Coachmark IS a Popover; don't re-implement |
| Focus management | Custom tabindex manipulation | `useFocusTrap` from `src/hooks/useFocusTrap.ts` | Handles all Wizard + dialog focus trap cases |
| Click-outside detection | Custom event listener | `useClickOutside` from `src/hooks/useClickOutside.ts` | Already handles mousedown + touchstart |
| Reduced-motion detection | `window.matchMedia` directly | `useReducedMotion` from `src/hooks/useReducedMotion.ts` | SSR-safe, subscribes to changes |
| SVG subpath tree-shaking | Manual code-splitting | tsup `entry` + `package.json` `exports` | Already proven with `/icons` subpath; just add one entry |

**Key insight:** 11 of the 12 primitives have zero new external dependencies. The entire DS infrastructure — DSPortal, DSDropdown, Popover, useFocusTrap, useClickOutside, useReducedMotion, ProgressBar, Chip, Avatar — was built to be composed exactly this way.

---

## Common Pitfalls

### Pitfall 1: @dnd-kit CSS Transform Causes Flash of Mispositioned Content

**What goes wrong:** On first render with an active drag, the item appears at position (0,0) before the transform is computed.

**Why it happens:** `CSS.Transform.toString(null)` returns `undefined`, not `""`. If you spread a style with `transform: undefined`, the element uses its natural position, then jumps.

**How to avoid:** Always guard: `transform: CSS.Transform.toString(transform) ?? undefined`. The element will stay in natural position (correct) until the first transform update.

**Warning signs:** Items "snap" on drag start.

### Pitfall 2: DragOverlay Missing Causes Invisible Drag Ghost

**What goes wrong:** The native HTML5 drag ghost (a grey semi-transparent clone) appears instead of the styled amber indicator.

**Why it happens:** Without `DragOverlay`, @dnd-kit falls back to opacity-dim on the source, but some browsers show an additional HTML5 ghost.

**How to avoid:** Always include a `<DragOverlay>` component inside `<DndContext>`. For the DS amber-line drop indicator, the overlay renders the 1px amber line, not a card clone.

**Warning signs:** Ugly browser-default ghost image during drag.

### Pitfall 3: Illustration Dark Mode — #fff Fills on Dark Background

**What goes wrong:** Several illustrations use `fill="#fff"` for interior surfaces (envelopes, document pages, etc.). In dark mode, these render as white patches on a dark card background.

**Why it happens:** `#fff` is hardcoded, not a CSS custom property, so `.dark` scope override has no effect.

**How to avoid:** In the TypeScript conversion, replace `#fff` with `var(--cream)` (which flips to `#1c1917` in dark mode). The ground shadow ellipses use `rgba(0,0,0,.06)` — this may need to become `rgba(255,255,255,.06)` in dark mode or use a dedicated token.

**Warning signs:** White shapes on near-black backgrounds in dark Storybook stories.

### Pitfall 4: AppShell Grid with Missing `footer` Slot

**What goes wrong:** If `footer` is undefined and the CSS grid area `"footer"` is defined, some browsers insert an empty grid row causing unexpected layout.

**Why it happens:** CSS Grid named areas always reserve space.

**How to avoid:** Make the footer row height conditional: use `grid-template-rows: auto 1fr ${footer ? 'auto' : ''}`. Or conditionally include the footer area in `gridTemplateAreas`.

**Warning signs:** Extra whitespace at page bottom when no footer is passed.

### Pitfall 5: Coachmark localStorage Read on SSR

**What goes wrong:** `localStorage.getItem()` throws in a Next.js SSR context.

**Why it happens:** `localStorage` is a browser-only API.

**How to avoid:** Always guard: `typeof window !== 'undefined' && localStorage.getItem(key)`. This pattern is already in the `AppShell` sidebar persistence code.

**Warning signs:** `ReferenceError: localStorage is not defined` during SSR builds.

### Pitfall 6: Wizard Focus Trap Prevents Step Navigation

**What goes wrong:** `useFocusTrap` traps Tab key inside the active step's content. If the step has no focusable elements, Tab loops on the container.

**Why it happens:** `useFocusTrap` focuses the container itself when no focusable children exist. The Wizard's Back/Next buttons must be INSIDE the trap boundary, not outside it.

**How to avoid:** Include Back/Next/Submit buttons in the trapped region. The Wizard container (including its button row) is the trap target, not just the step's field content.

**Warning signs:** User can't Tab to Back or Next button.

### Pitfall 7: SortableContext Items Must Match Rendered IDs

**What goes wrong:** `arrayMove` updates the items array, but if SortableContext's `items` prop lags by one render, the sort animation glitches.

**Why it happens:** React batching: if `onDragEnd` calls `setState` which triggers a new render, the `SortableContext` items prop from the *previous* render is used for the animation frame.

**How to avoid:** Use functional state updates (`setItems(prev => arrayMove(prev, oi, ni))`). This ensures the SortableContext re-renders synchronously with the new order.

**Warning signs:** Items "snap back" briefly after drop before settling.

---

## Code Examples

### Illustration Component Conversion Pattern

```typescript
// Source: ds-illustrations.jsx [VERIFIED: codebase read] + Icon.tsx pattern [VERIFIED: codebase read]
// Convert kebab-case name to PascalCase; replace #fff with var(--cream);
// replace `const stroke = "var(--amber)"; const ink = "var(--ink)"` with direct token refs

import type { SVGProps } from 'react';

export interface IllustrationProps {
  width?: number;
  height?: number;
  className?: string;
  style?: SVGProps<SVGSVGElement>['style'];
}

export function MailSent({ width = 120, height = 120, className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 90"
      width={width}
      height={height}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="60" cy="80" rx="40" ry="4" fill="rgba(0,0,0,.06)" />
      <rect x="30" y="32" width="60" height="40" rx="3" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M30 32 L60 56 L90 32" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="60" cy="20" r="6" fill="var(--amber)" />
      <path d="M48 18 L60 14 L72 18" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
```

### @dnd-kit Sortable List with Drop Indicator

```typescript
// Source: dndkit.com docs [CITED: https://dndkit.com/presets/sortable] + useReducedMotion hook [VERIFIED: codebase]
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReducedMotion } from './hooks/useReducedMotion';

// The DS Sortable wrapper component
export function Sortable({ items, onReorder, renderItem }) {
  const reducedMotion = useReducedMotion();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  // ...
}

// SortableItem: respects reduced-motion by zeroing out transform/transition
function DSortableItem({ id, reducedMotion }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: reducedMotion ? undefined : CSS.Transform.toString(transform),
        transition: reducedMotion ? undefined : transition,
        opacity: isDragging ? 0 : 1,
      }}
      {...attributes}
      {...listeners}
    />
  );
}
```

### AppShell with localStorage Sidebar Persistence

```typescript
// Source: ds-shell.jsx handoff + D-01..D-03 decisions [VERIFIED: codebase + CONTEXT.md]
const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { sidebar, topbar, main, footer, storageKey = 'ds-sidebar-collapsed', ...rest },
  ref
) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (storageKey === null) return false;
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(storageKey) === 'true';
  });

  useEffect(() => {
    if (storageKey === null) return;
    window.localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed, storageKey]);

  // CSS custom property drives sidebar width transition in primitives.css
  return (
    <div
      ref={ref}
      className="ds-atom-appshell"
      data-sidebar-collapsed={collapsed}
      style={{ '--ds-sidebar-w': collapsed ? '48px' : '240px' } as React.CSSProperties}
      {...rest}
    >
      <header className="ds-atom-appshell-topbar">{topbar}</header>
      <aside className="ds-atom-appshell-sidebar">
        {/* Consumer Nav; AppShell provides the container */}
        {React.cloneElement(sidebar as React.ReactElement, {
          collapsed,
          onToggleCollapse: () => setCollapsed(c => !c),
        })}
      </aside>
      <main className="ds-atom-appshell-main">{main}</main>
      {footer && <footer className="ds-atom-appshell-footer">{footer}</footer>}
    </div>
  );
});
```

Note on `cloneElement`: injecting `collapsed` + `onToggleCollapse` into the sidebar slot is a convenience. An alternative is exposing `collapsed`/`onToggleCollapse` via a context or just passing them as a separate render prop.

### tsup Entry Extension for /illustrations

```typescript
// Source: tsup.config.ts [VERIFIED: codebase read]
// Add one entry line — that's all that's needed.
entry: [
  "src/index.ts",
  "src/hooks/index.ts",
  "src/icons/index.ts",
  "src/illustrations/index.ts",  // NEW
],
```

```json
// package.json exports stanza addition
"./illustrations": {
  "types": "./dist/illustrations/index.d.ts",
  "import": "./dist/illustrations/index.js"
}
```

---

## Illustration Name → Component Name Map

The 24 kebab-case names from `ds-illustrations.jsx` converted to PascalCase exports:

| Handoff name | Export name | Notes |
|---|---|---|
| `mail-sent` | `MailSent` | |
| `documents` | `Documents` | |
| `rocket` | `Rocket` | |
| `celebrate` | `Celebrate` | Uses `var(--blue)` + `var(--red)` per D-07 |
| `lightbulb` | `Lightbulb` | |
| `idea` | `Idea` | |
| `search` | `IllustrationSearch` | Avoid naming conflict with lucide Search icon |
| `plant` | `Plant` | |
| `cloud` | `Cloud` | |
| `empty-box` | `EmptyBox` | |
| `connection-lost` | `ConnectionLost` | Uses `var(--red)` per D-07 |
| `error` | `IllustrationError` | Avoid naming conflict with Error built-in |
| `inbox` | `Inbox` | |
| `graph-up` | `GraphUp` | |
| `chart` | `Chart` | |
| `calendar-event` | `CalendarEvent` | |
| `team` | `Team` | |
| `thinking` | `Thinking` | |
| `lock` | `Lock` | |
| `puzzle` | `Puzzle` | |
| `workflow` | `Workflow` | |
| `travel` | `Travel` | |
| `success` | `IllustrationSuccess` | Avoid naming conflict with possible future |
| `phone-screen` | `PhoneScreen` | |

**Naming note:** `search`, `error`, and `success` risk conflicts. Using `IllustrationSearch`, `IllustrationError`, `IllustrationSuccess` avoids the issue cleanly. The planner should decide the final names.

---

## SVG Dark Mode Analysis

Based on inspection of `ds-illustrations.jsx` [VERIFIED: codebase read]:

| Value type | Count | Action |
|---|---|---|
| `var(--ink)` | 2+ usages per SVG | Flips automatically |
| `var(--amber)` | Most SVGs | Flips automatically |
| `var(--cream-2)` | 5 usages | Flips automatically |
| `var(--cream-3)` | 1 usage | Flips automatically |
| `var(--amber-d)` | 1 usage | Flips automatically |
| `var(--red)` | 3 usages | Expressive accent, leave as D-07 |
| `var(--blue)` | 1 usage | Expressive accent, leave as D-07 |
| `#fff` fill | Many (document pages, surfaces) | Replace with `var(--cream)` |
| `rgba(0,0,0,.06)` | All 24 ground ellipses | Needs dark-mode treatment — either `var(--shadow-xs)` token or `.dark` CSS class override |
| `stroke="#fff"` | Checkmarks, highlights | Replace with `var(--cream)` or keep if stroke is on a dark-fill shape |

Two illustrations with special care:
- `celebrate`: uses `var(--blue)` and `var(--red)` accent circles (confetti) — intentional per D-07
- `connection-lost`: uses `var(--red)` for the strike-through line — intentional per D-07

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 native drag (draggable attr) | `@dnd-kit/core` PointerSensor | ~2021 | Keyboard + touch + screen reader support |
| `@dnd-kit/react` (v2 alpha DragDropProvider) | `@dnd-kit/core` + `@dnd-kit/sortable` (stable v1) | 2024-present | v2 is still alpha/beta; locked by D-11 to v1 stable |
| CSS position absolute for sidebars | CSS Grid named areas | ~2020 | Cleaner layout with grid-template-areas |
| SVG sprites / img tags for illustrations | Inline SVG React components | ~2019 | CSS custom properties work inside inline SVG; tree-shaking possible |

**Deprecated/outdated:**
- `document.execCommand("bold")` (in ds-editable.jsx RichText section): Deprecated browser API. RichText DS-70 already shipped on TipTap in Phase 17. The InlineEdit primitive is NOT a rich text editor — it's a plain text `<input>` or `<textarea>`.
- HTML5 `draggable` attribute: Do not use; @dnd-kit/core's PointerSensor provides proper cross-browser DnD.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The AppShell sidebar width is 240px expanded (CONTEXT says "48px collapsed") | Architecture Patterns | Planner should verify 200px vs 240px vs 260px from ds-shell.jsx; it says 200px, CONTEXT says 48px collapsed only | Low — planner can adjust |
| A2 | `IllustrationSearch`, `IllustrationError`, `IllustrationSuccess` naming avoids conflicts | Illustration Name Map | If the planner uses a different naming scheme (e.g., namespace prefix), the barrel exports need updating | Low |
| A3 | Dark mode ground ellipses `rgba(0,0,0,.06)` will need a CSS override in `.dark` scope | SVG Dark Mode Analysis | If the design intent is "ground shadows look fine in dark mode" (they'd be invisible on dark bg), no override needed | Low |
| A4 | AppShell cloneElement for injecting collapsed/onToggleCollapse | Code Examples | Consumer might prefer context-based injection; cloneElement is fragile if sidebar is wrapped | Low |

**If this table is empty:** Not the case — 4 assumptions documented.

---

## Open Questions

1. **AppShell sidebar expanded width**
   - What we know: ds-shell.jsx uses `200px` expanded; CONTEXT.md only specifies `48px` collapsed; VS Code / Linear use ~240px.
   - What's unclear: Is 200px or 240px the canonical expanded width?
   - Recommendation: Planner uses 240px (closer to Linear aesthetic which is cited in CONTEXT.md specifics) but exposes as a `sidebarWidth` prop defaulting to 240.

2. **AppShell mobile behaviour**
   - What we know: Single breakpoint at 768px (D-01/CONTEXT deferred). ds-shell.jsx shows a bottom tab bar on mobile but CONTEXT.md defers it.
   - What's unclear: Below 768px, does the sidebar become hidden (display:none) or stay as 48px icon rail?
   - Recommendation: Below 768px, hide sidebar entirely (`display: none`). Bottom tab bar is deferred per CONTEXT.md.

3. **Coachmark SpotlightOverlay**
   - What we know: ds-coachmarks.jsx includes an SVG-mask SpotlightOverlay component that dims the page and highlights the target.
   - What's unclear: Is the SpotlightOverlay in scope for DS-76 v1.0, or is it just the anchored hint bubble?
   - Recommendation: Planner decides. The SVG mask spotlight is visually impressive but requires `getBoundingClientRect` + DOM measurement + portal. The hint bubble alone (anchored Popover) is the simpler v1.0 scope.

4. **DS-82 reserved slot**
   - What we know: One slot reserved for any v1.0 finishing primitive surfaced during planning.
   - What's unclear: What v1.0 gaps exist after DS-71..81 are complete?
   - Recommendation: Leave as open slot. After planning all 11 known primitives, use DS-82 if any critical finishing work surfaces (e.g., a missing Storybook story baseline, a CSS token gap, a test harness fix).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ | ≥20 (engines spec) | — |
| npm | Package install | ✓ | — | — |
| `@dnd-kit/core` | DS-80 | ✗ (not yet installed) | 6.3.1 available | No fallback — required |
| `@dnd-kit/sortable` | DS-80 | ✗ (not yet installed) | 10.0.0 available | No fallback — required |
| `@dnd-kit/utilities` | DS-80 | ✗ (not yet installed) | 3.2.2 available | No fallback — required |
| `localStorage` | AppShell, Coachmark | ✓ (browser) | Platform API | `storageKey={null}` prop disables |
| Vitest + jsdom | All tests | ✓ | Confirmed via test run: 648 tests pass | — |
| Storybook 8 | Visual baselines | ✓ | 8.6.x | — |
| Playwright | Visual regression | ✓ | 1.59.x | — |

**Missing dependencies with no fallback:**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — must be installed before Wave 5 (DS-80 wave).

**Missing dependencies with fallback:**
- None of the non-DnD primitives need new installs.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x + @testing-library/react 16.x |
| Config file | `vitest.config.ts` at repo root |
| Setup file | `src/test-setup.ts` (matchMedia stub + jest-dom matchers) |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

**Current baseline:** 648 tests in 60 test files. Phase 18 target: add ~11 new test files (one per primitive), ~15-20 tests each. Estimated total: ~800+ tests.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DS-71 | AppShell renders grid slots; sidebar collapses to 48px; localStorage persists | unit | `npm test -- --run AppShell` | ❌ Wave 1 |
| DS-72 | AppBar renders all 4 variants; `scrolled` prop changes className/style | unit | `npm test -- --run AppBar` | ❌ Wave 1 |
| DS-73 | Footer renders compact + expanded + sticky variants | unit | `npm test -- --run Footer` | ❌ Wave 1 |
| DS-74 | Wizard advances/retreats steps; validate() blocks advance; ProgressBar receives correct value | unit | `npm test -- --run Wizard` | ❌ Wave 3/4 |
| DS-75 | PasswordStrength renders correct segment count; FieldError renders message; FormErrorSummary lists errors | unit | `npm test -- --run FormValidation` | ❌ Wave 3/4 |
| DS-76 | Coachmark renders anchored hint; dismiss sets localStorage; storageKey=null disables persistence | unit | `npm test -- --run Coachmark` | ❌ Wave 3/4 |
| DS-77 | InlineEdit enters edit mode on click; Enter commits; Escape cancels; error state on rejected onSave | unit | `npm test -- --run InlineEdit` | ❌ Wave 3/4 |
| DS-78 | SearchAndFilters shows dropdown on focus; filter chips render + are removable; clear-all removes all chips | unit | `npm test -- --run SearchAndFilters` | ❌ Wave 3/4 |
| DS-79 | Presence dot renders at all 4 positions; default is bottom-right (backward compatible) | unit | `npm test -- --run Presence` | ❌ Wave 3/4 |
| DS-80 | Sortable reorders items on dragEnd; keyboard Space+Arrow triggers reorder; reduced-motion disables transitions | unit | `npm test -- --run Sortable` | ❌ Wave 5 |
| DS-81 | Each illustration renders an SVG with correct viewBox; tree-shaking fixture produces ~1KB for single import | unit + build | `npm test -- --run illustrations` + build check | ❌ Wave 2 |

### Sampling Rate
- **Per task commit:** `npm test -- --run <PrimitiveName>` (quick, ~5s for single file)
- **Per wave merge:** `npm test` (full 60+ file suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/AppShell.test.tsx` — DS-71, covers collapse + localStorage + slot rendering
- [ ] `src/AppBar.test.tsx` — DS-72, covers 4 variants + scrolled state
- [ ] `src/Footer.test.tsx` — DS-73, covers compact + expanded + sticky
- [ ] `src/Wizard.test.tsx` — DS-74, covers step machine + validate gate + ProgressBar value
- [ ] `src/FormValidation.test.tsx` — DS-75, covers PasswordStrength segments + FieldError + summary
- [ ] `src/Coachmark.test.tsx` — DS-76, covers dismiss + localStorage + storageKey=null
- [ ] `src/InlineEdit.test.tsx` — DS-77, covers click→edit→commit/cancel + error recovery
- [ ] `src/SearchAndFilters.test.tsx` — DS-78, covers dropdown + filter chip add/remove + clear
- [ ] `src/Presence.test.tsx` — DS-79, covers 4 positions + backward-compat default
- [ ] `src/Sortable.test.tsx` — DS-80, covers reorder + keyboard + reduced-motion gate
- [ ] `src/illustrations/index.test.ts` — DS-81, smoke-tests 24 named exports render without error

No new framework installs needed — all existing vitest + @testing-library infrastructure applies.

**@dnd-kit testing in jsdom note:** `@dnd-kit/core` PointerSensor requires PointerEvents. jsdom supports PointerEvent but not `setPointerCapture`. Tests should mock `element.setPointerCapture = vi.fn()` and `element.releasePointerCapture = vi.fn()` in test setup, OR test keyboard-only reordering (which uses keyboard events that jsdom handles fine). [ASSUMED — based on common dnd-kit testing patterns in open-source repos]

---

## Security Domain

The security domain is minimal for a client-side React primitive library with no authentication, no server calls, and no user-generated content processing at the library level. The relevant ASVS categories:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Library does not handle auth |
| V3 Session Management | No | Library does not manage sessions |
| V4 Access Control | No | Consumer-controlled |
| V5 Input Validation | Partial | InlineEdit and SearchAndFilters expose user-typed values via callbacks — sanitization is consumer's responsibility. Library does not render `dangerouslySetInnerHTML` from user input. |
| V6 Cryptography | No | No cryptographic operations |

**localStorage data:** AppShell sidebar state and Coachmark dismiss flags contain no sensitive information (boolean values / strings). No security concern.

---

## Sources

### Primary (HIGH confidence)
- `design_handoff/design-system/ds-shell.jsx` — AppShell visual spec [VERIFIED: codebase read]
- `design_handoff/design-system/ds-appbar.jsx` — AppBar 4 variants [VERIFIED: codebase read]
- `design_handoff/design-system/ds-footer.jsx` — Footer 3 variants [VERIFIED: codebase read]
- `design_handoff/design-system/ds-wizard.jsx` — Stepper H+V patterns [VERIFIED: codebase read]
- `design_handoff/design-system/ds-coachmarks.jsx` — Coachmark + SpotlightOverlay [VERIFIED: codebase read]
- `design_handoff/design-system/ds-editable.jsx` — InlineEdit table pattern [VERIFIED: codebase read]
- `design_handoff/design-system/ds-search.jsx` — SearchAndFilters pattern [VERIFIED: codebase read]
- `design_handoff/design-system/ds-formvalidation.jsx` — FormValidation pattern [VERIFIED: codebase read]
- `design_handoff/design-system/ds-illustrations.jsx` — All 24 illustration SVGs [VERIFIED: codebase read]
- `src/Avatar.tsx` — current presence dot implementation [VERIFIED: codebase read]
- `src/Popover.tsx` — Coachmark base primitive [VERIFIED: codebase read]
- `src/ProgressBar.tsx` — Wizard step indicator [VERIFIED: codebase read]
- `src/hooks/useFocusTrap.ts` — Wizard trapping [VERIFIED: codebase read]
- `src/hooks/useReducedMotion.ts` — Sortable motion gate [VERIFIED: codebase read]
- `src/hooks/useClickOutside.ts` — Coachmark dismiss [VERIFIED: codebase read]
- `src/icons/index.ts` — /icons subpath pattern to replicate [VERIFIED: codebase read]
- `src/_internals/Icon.tsx` — wrap() helper pattern [VERIFIED: codebase read]
- `src/_internals/DSDropdown.tsx` — SearchAndFilters dropdown [VERIFIED: codebase read]
- `src/InlineConfirm.tsx` — InlineEdit state machine reference [VERIFIED: codebase read]
- `tsup.config.ts` — current multi-entry build config [VERIFIED: codebase read]
- `package.json` — exports stanza + current deps [VERIFIED: codebase read]
- npm registry: `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2` [VERIFIED: npm view 2026-05-02]

### Secondary (MEDIUM confidence)
- dndkit.com sortable docs — useSortable API, SortableContext, arrayMove, CSS.Transform pattern [CITED: https://dndkit.com/presets/sortable]
- dndkit.com keyboard sensor docs — default key bindings (Space=lift, Arrow=move, Space=drop) [CITED: https://dndkit.com/extend/sensors/keyboard-sensor]

### Tertiary (LOW confidence)
- @dnd-kit jsdom testing patterns (setPointerCapture mock) — [ASSUMED] based on general knowledge of dnd-kit + jsdom compatibility issues in open-source projects

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry verified, peer deps confirmed, tsup pattern proven in codebase
- Architecture: HIGH — all handoff files read, all existing infrastructure verified
- DnD API: MEDIUM-HIGH — official docs cited, API verified against npm package; no test run yet
- Illustration dark mode: MEDIUM — SVG inspection done, strategy is clear but per-SVG judgment remains for planner
- Pitfalls: MEDIUM-HIGH — all based on verified codebase patterns + dnd-kit documented behavior

**Research date:** 2026-05-02
**Valid until:** 2026-06-01 (30 days; @dnd-kit v6 is stable, unlikely to change)
