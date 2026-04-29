# Phase 17: Wave 6 — Icons + Data Display Primitives — Pattern Map

**Mapped:** 2026-04-29
**Files analyzed:** 56 (1 internal helper, 11 primitive triplets = 33, 3 helper-hook triplets = 9, 1 internal calendar utility + test = 2, 1 subpath barrel, 1 build config, 1 package.json edit, 1 primitives.css edit, 14 refactor targets via grep — counted as 1 sweep operation)
**Analogs found:** 53 / 53 (every file has a strong codebase analog; only RichText has a "novel" classification)

## File Classification

### Net-new source files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `src/_internals/Icon.tsx` | internal/wrapper | render | `src/_internals/DSDropdown.tsx` (internal-only, types + component, consumed by public primitives) | role-match (composition style) |
| `src/_internals/calendarGrid.ts` | internal/utility | pure-transform | `src/_internals/dateUtils.ts` (pure date helpers, no React imports) | exact (same shape, same neighbor) |
| `src/icons/index.ts` | barrel | re-export | `src/hooks/index.ts` (subpath barrel) | exact |
| `src/Table.tsx` | component (compound) | request-response (props → DOM) + sub-component composition | `src/Modal.tsx` (multi-export from one file: `Modal` + `ConfirmDialog`) | role-match (compound API + DSPortal-style chrome reuse) |
| `src/Tabs.tsx` | component | event-driven (selection + ResizeObserver) | `src/Select.tsx` (DSDropdown overflow chrome consumer) | role-match (DSDropdown reuse for overflow menu) |
| `src/SegmentedControl.tsx` | component | request-response | `src/StarRating.tsx` (radiogroup pattern, button-array + data-active state) | exact (same ARIA family) |
| `src/Accordion.tsx` | component | event-driven (toggle expanded) | `src/AlertBanner.tsx` (controlled `open` + tone-icon + `data-variant`) — for chrome; `src/InlineConfirm.tsx` for disclosure pattern | role-match |
| `src/Carousel.tsx` | component | event-driven (timer + swipe + reduced-motion) | `src/BottomSheet.tsx` (Pointer Events for swipe; `prefers-reduced-motion` precedent in existing wave) | role-match |
| `src/Timeline.tsx` | component | render-only | `src/StarRating.tsx` (read-only display variant; ordered-list semantic) | partial (display-only, no exact analog) |
| `src/InfiniteList.tsx` | component | event-driven (IntersectionObserver) | `src/Lightbox.tsx` (window-level event listener + cleanup; controlled callbacks `onIndexChange`) | partial (lifecycle pattern) |
| `src/Calendar.tsx` | component (compound) | event-driven (selection + view toggle) | `src/DatePicker.tsx` (month grid, today highlight, controlled date) | exact (DatePicker is the direct ancestor) |
| `src/Breadcrumbs.tsx` | component | render + DSDropdown overflow | `src/Select.tsx` (DSDropdown overflow chrome consumer; ARIA semantics on `<nav>`) | role-match |
| `src/RichText.tsx` | component | event-driven (TipTap editor sync) | `src/BottomSheet.tsx` (non-trivial primitive owning portal-based subcomponent — link popover); `src/MultiSelect.tsx` (combobox + Popover for "+N more" — link popover analog) | partial — TipTap config is **novel**; see RESEARCH.md § TipTap RichText for the unique controlled-sync logic |

### Helper hooks

| New Hook | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `src/hooks/useSortableTable.ts` | hook | pure transform (rows → sorted) | `src/hooks/useClickOutside.ts` (smallest hook; effect + cleanup pattern); but logically closer to a `useMemo`-driven derivation | partial (no existing pure-derivation hook in repo — pattern is novel-but-shaped-like-existing-hooks) |
| `src/hooks/useTableSelection.ts` | hook | event-driven (controlled set state) | `src/hooks/useFocusTrap.ts` (active flag, controlled callback, scoped behavior) | role-match |
| `src/hooks/useResizableColumns.ts` | hook | event-driven (Pointer Events with capture) | `src/BottomSheet.tsx` swipe-to-close `handleHandlePointerDown/Move/Up` (lines 89-134) — Pointer Events with `setPointerCapture` | exact (same imperative DOM seam) |

### Stories + tests (33 files: 11 primitives × 3)

Each `<Name>.stories.tsx` follows `Select.stories.tsx` analog. Each `<Name>.test.tsx` follows `Select.test.tsx` analog. Calendar/Table inherit DatePicker test patterns. Hook tests follow `useFocusTrap.test.tsx`.

### Build config + barrels + CSS + refactor sweep

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `tsup.config.ts` (modify) | config | build | itself — already has `entry: ["src/index.ts", "src/hooks/index.ts"]` array; just add `"src/icons/index.ts"` and `"lucide-react"` to `external` | exact (in-place edit) |
| `package.json` (modify) | config | publish | itself — `exports` map already has `./hooks` block; clone for `./icons` | exact (in-place edit) |
| `src/index.ts` (modify) | barrel | re-export | itself — append `Icon` re-export + 11 primitive re-exports | exact |
| `src/hooks/index.ts` (modify) | barrel | re-export | itself — append `useSortableTable`, `useTableSelection`, `useResizableColumns` | exact |
| `src/primitives.css` (modify) | stylesheet | render | itself — append `.ds-atom-table`, `.ds-atom-tabs`, etc. blocks following `.ds-atom-datepicker` precedent (lines 1541+) | exact |
| 14 lucide-direct-importers (refactor) | sweep | — | git log v0.5.x patches (atomic refactor commits) — grep + replace import lines | exact (mechanical) |

## Pattern Assignments

### `src/_internals/Icon.tsx` (internal/wrapper, render)

**Analog:** `src/_internals/DSDropdown.tsx` — internal-only, exports types + component, consumed by public primitives, lives under `_internals/` (NOT in barrel).

**Imports / file-header pattern** (DSDropdown.tsx lines 1-12):
```tsx
import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { DSPortal } from "./DSPortal";
```
→ For Icon.tsx: import from `react` + `lucide-react` types only. Pattern shape (typed default-spread + forwardRef) is also visible in `src/Button.tsx` lines 68-102 and `src/StarRating.tsx` lines 75-80 (Star usage with size/fill/stroke/strokeWidth — exactly the props the wrapper centralizes).

**Doc comment style** (DSDropdown.tsx lines 32-44):
```tsx
/**
 * Internal dropdown infrastructure (D-500). Owns:
 * - DSPortal mount to document.body
 * - Anchor-rect positioning (callback-ref-as-state per Popover.tsx line 73)
 * - …
 *
 * NOT exported from the barrel. Consumers (Select, MultiSelect, Autocomplete)
 * import directly from this path.
 */
```
→ Mirror for Icon: "Brand-lock icon wrapper (DS-60). Owns size/strokeWidth/color defaults + aria toggle. NOT exported from main barrel directly — re-exported AS `Icon` so consumers import `import { Icon } from "@akhil-saxena/design-system"` AND `_internals/Icon` is the implementation file."

**Wrap helper export**: Icon.tsx must additionally export a `wrap(LucideIcon): ForwardRefExoticComponent` factory consumed by `src/icons/index.ts`. RESEARCH.md lines 320-334 give the exact shape. No existing analog for `wrap` — it is internal glue.

**Refactor-the-callsites pattern** comes from `src/Select.tsx` line 195:
```tsx
<Check size={14} className="ds-atom-select-check" aria-hidden="true" />
```
→ becomes (after Icon refactor):
```tsx
<Icon icon={Check} size={14} className="ds-atom-select-check" />
```
The wrapper applies `aria-hidden="true"` automatically when no `aria-label` is provided (D-17-02), so the `aria-hidden` attribute can be dropped at every call site.

---

### `src/_internals/calendarGrid.ts` (internal/utility, pure-transform)

**Analog:** `src/_internals/dateUtils.ts` — same neighbor directory; same "pure helpers, no React imports" header comment; consumed by DatePicker today and by Calendar after Phase 17.

**Header comment pattern** (dateUtils.ts lines 1-3):
```ts
// Pure date helpers — no React imports. Consumed by DatePicker (16-05)
// and DateRangePicker (16-06). D-510: NO date-fns / Temporal dep — these
// ~7 helpers cover every Wave 5 + Phase 18 timeline use case.
```
→ Mirror: "Pure month-grid helpers — no React imports. Consumed by DatePicker (16-05) refactor and Calendar (DS-68). Lifted from DatePicker.tsx lines 113-141. Same no-dep policy as dateUtils.ts."

**Function shape** (dateUtils.ts lines 5-12):
```ts
export function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function daysInMonth(d: Date): number {
	// Day 0 of next month = last day of current month.
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
```
→ Pattern for `buildMonthGrid(year, month, weekStart): MonthGrid`: small typed function, single-purpose, returns plain object with named fields. Imports `startOfMonth` and `daysInMonth` from sibling `./dateUtils` rather than reimplementing. Body lifts DatePicker.tsx lines 113-141 verbatim.

**Lift source** (DatePicker.tsx lines 113-141):
```ts
const cells = useMemo(() => {
	const first = startOfMonth(viewMonth);
	const firstWeekday = first.getDay(); // 0=Sun
	const dim = daysInMonth(viewMonth);
	const out: { date: Date; inMonth: boolean }[] = [];
	// Prev-month tail padding
	for (let i = firstWeekday - 1; i >= 0; i--) {
		out.push({ date: new Date(first.getFullYear(), first.getMonth(), -i), inMonth: false });
	}
	// Current month
	for (let d = 1; d <= dim; d++) {
		out.push({ date: new Date(first.getFullYear(), first.getMonth(), d), inMonth: true });
	}
	// Pad to 42 cells (6 rows × 7 cols)
	while (out.length < 42) {
		const last = out[out.length - 1]!.date;
		out.push({
			date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
			inMonth: false,
		});
	}
	return out;
}, [viewMonth]);
```
After lift, DatePicker line 113 becomes `const { cells } = buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), 0)` and the inline algorithm goes away. The `0` is `weekStart=Sunday-first` to preserve backward-compat (DS-53 ships Sunday-first; Calendar passes `1` for Monday-first per D-17-23).

**Test pattern** (dateUtils.test.ts lines 1-25): plain vitest `describe` + `it` blocks, one test per exported function, each with hand-built dates and exact-value assertions. Mirror for `buildMonthGrid`: test February-2026 (28 days), February-2024 (29 days, leap), April-2026 (30 days, both Sunday-first and Monday-first weekStart variants), and verify 42-cell length invariant.

---

### `src/icons/index.ts` (barrel, re-export)

**Analog:** `src/hooks/index.ts` — small re-export barrel for a subpath (`@akhil-saxena/design-system/hooks`).

**Full file** (hooks/index.ts):
```ts
// @akhil-saxena/design-system/hooks — public hooks barrel.
// Consumed via:
//   import { useFocusTrap } from "@akhil-saxena/design-system/hooks";

export { useClickOutside } from "./useClickOutside";
export { useComposedRefs } from "./useComposedRefs";
export { useFocusTrap } from "./useFocusTrap";
export { useKeyboardShortcut } from "./useKeyboardShortcut";
```
→ Mirror for icons/index.ts (header comment + re-export shape):
```ts
// @akhil-saxena/design-system/icons — wrapped lucide-react icons (DS-60).
// Consumed via:
//   import { ChevronDown } from "@akhil-saxena/design-system/icons";
// Each icon is pre-wrapped with the brand-lock defaults (size 20, stroke 1.5,
// currentColor, aria-hidden) from _internals/Icon.tsx via the `wrap()` helper.
import { ChevronDown as L_ChevronDown, /* …24 more */ } from "lucide-react";
import { wrap } from "../_internals/Icon";

export const ChevronDown = wrap(L_ChevronDown);
// …24 more (full inventory in RESEARCH.md lines 286-316)
```

---

### `src/Table.tsx` (component compound, request-response + sub-component composition)

**Analog:** `src/Modal.tsx` — proves the "multi-export from one file" pattern. Modal exports `Modal` + `ConfirmDialog` together (line 53 + line 173). Table will export `Table.Root`, `Table.Header`, `Table.HeaderCell`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.SelectAllCell`, `Table.SelectCell`, `Table.Pagination` from one file via attached sub-components.

**Compound API export pattern** (Modal.tsx lines 53, 173 — TWO `export function`s in same file):
```tsx
// ─── ConfirmDialog — same-file variant export (D-287, D-356) ─────────

export interface ConfirmDialogProps { … }
export function ConfirmDialog({ … }: ConfirmDialogProps) { … }
```
→ For Table, prefer the React idiom of attaching sub-components to a root namespace (e.g., `Table.Root.Header = TableHeader`) so consumers write `<Table.Root>` / `<Table.Header>` / etc. The barrel exports `Table` (which is the namespace object) and the individual prop types. Modal proves the file-locality pattern; the namespace-object attachment is novel for this repo (be explicit in plan).

**Density via data attribute** — pattern from `src/BottomSheet.tsx` line 165 (`data-height={height}`) and CSS at `.ds-atom-bottomsheet[data-height="full"]`. Mirror for Table: `<table className="ds-atom-table" data-density={density} data-sticky={sticky || undefined}>` and CSS in primitives.css gates row-height off `[data-density="cozy" | "comfortable" | "spacious"]`. RESEARCH.md § Sticky Header CSS gives the exact CSS block (lines 530-541).

**Sort chevron / aria-sort** (RESEARCH.md § Sort ARIA, lines 562-564): `<th tabIndex={0} role="columnheader" aria-sort={sortDir} onKeyDown={…Enter|Space → toggleSort}>`. Use `Icon icon={ChevronUp}` and `Icon icon={ChevronDown}` from the canonical wrapper (these icons must be added to `src/icons/index.ts`).

**Ref pattern for Pagination prev/next**: `src/Lightbox.tsx` lines 92-125 (3 buttons in a backdrop, each with aria-label and onClick) is the closest analog for the prev/next/page-number button row.

---

### `src/Tabs.tsx` (component, event-driven)

**Analog:** `src/Select.tsx` — for the DSDropdown-overflow-menu pattern (lines 135-201). Tabs uses DSDropdown identically for the "More" overflow menu.

**DSDropdown consumer pattern** (Select.tsx lines 135-143):
```tsx
<DSDropdown
	anchorRef={triggerRef}
	open={open}
	onOpenChange={handleOpenChange}
	activeIndex={activeIndex}
	onActiveIndexChange={setActiveIndex}
	itemCount={filtered.length}
	onSelect={handleSelect}
	typeAheadGetText={(i) => filtered[i]?.label ?? ""}
>
```
→ For Tabs overflow menu: identical `<DSDropdown anchorRef={moreBtnRef} open={overflowOpen} onOpenChange={setOverflowOpen} activeIndex={…} itemCount={hiddenTabs.length} onSelect={(i) => activate(hiddenTabs[i])} typeAheadGetText={(i) => hiddenTabs[i].label}>`. Inside, render `<ul role="menu">` with `<li role="menuitem">` items (NOT `role="option"` — Tabs is a different ARIA family from combobox; menu role is correct for an overflow tab menu).

**ResizeObserver implementation** (RESEARCH.md § Tabs Overflow Menu, lines 745-768) — pattern is novel for this repo (no existing primitive uses ResizeObserver). New code, but the lifecycle shape mirrors `src/Lightbox.tsx` lines 56-77 — `useEffect(() => { const cleanup = …; return () => cleanup(); }, [deps])`.

**Tab ARIA** (RESEARCH.md § ARIA Patterns / Tabs, lines 695-701):
```tsx
<div role="tablist" aria-orientation="horizontal" aria-label={ariaLabel}>
	<button role="tab" aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} id={tabId}>
<div role="tabpanel" aria-labelledby={tabId} tabIndex={0} id={panelId} hidden={!active}>
```

---

### `src/SegmentedControl.tsx` (component, request-response)

**Analog:** `src/StarRating.tsx` — same `radiogroup` ARIA pattern, button-array under a wrapper, `data-active` (or `aria-checked`) state per child.

**Wrapper + button-array pattern** (StarRating.tsx lines 44-83):
```tsx
<div
	role="radiogroup"
	aria-label={label}
	className={`ds-atom-star${className ? ` ${className}` : ""}`}
	style={style}
	data-size={size}
	data-disabled={disabled ? "true" : undefined}
	onMouseLeave={() => { if (interactive) setHover(null); }}
>
	{[1, 2, 3, 4, 5].map((n) => {
		const isFilled = n <= effective;
		return (
			<button
				key={n}
				type="button"
				role="radio"
				aria-checked={n === value}
				aria-label={`${n} star${n === 1 ? "" : "s"}`}
				disabled={!interactive}
				onClick={() => { if (interactive) onChange?.(n); }}
				className="ds-atom-star-btn"
			>
				…
			</button>
		);
	})}
</div>
```
→ For SegmentedControl: `<div role="radiogroup" aria-label={label} className="ds-atom-segmented" data-size={size}>` containing `{options.map((opt) => <button role="radio" aria-checked={value === opt.value} tabIndex={value === opt.value ? 0 : -1} onClick={() => onChange(opt.value)}>{opt.label}</button>)}`. Add ArrowLeft/Right keyboard handler at the wrapper level (RESEARCH.md § ARIA Patterns / SegmentedControl, lines 723-727: "automatic activation IS expected for radiogroup" — Arrow keys cycle + select).

---

### `src/Accordion.tsx` (component, event-driven)

**Analog:** `src/AlertBanner.tsx` for the **chrome** pattern (controlled `open`, `data-variant` for visual states, conditional Icon, `forwardRef`). For the **disclosure** pattern, the closest is `src/InlineConfirm.tsx` (toggle-to-show). For ARIA: WAI-ARIA disclosure pattern (RESEARCH.md § ARIA Patterns / Accordion, lines 703-710).

**Controlled-open + tone-icon pattern** (AlertBanner.tsx lines 51-80):
```tsx
export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(function AlertBanner(
	{ open, onDismiss, tone = "info", title, description, … }, ref,
) {
	if (!open) return null;
	…
	return (
		<div
			ref={ref}
			className={`ds-atom-banner${className ? ` ${className}` : ""}`}
			data-variant={tone}
			…
		>
			<span className="ds-atom-banner-icon" aria-hidden="true">{TONE_ICON[tone]}</span>
			…
		</div>
	);
});
```
→ For Accordion `<Accordion.Item>`: wrap `<button aria-expanded={open} aria-controls={panelId}><Icon icon={ChevronDown} className="ds-atom-accordion-chevron" data-open={open || undefined} /></button>` and `<div id={panelId} role="region" aria-labelledby={headerId} hidden={!open}>{children}</div>`. Chevron rotation done via CSS `[data-open="true"] { transform: rotate(180deg); }` (matches Select chevron — Select.tsx lines 129-133 + primitives.css `.ds-atom-select-chevron.is-open`).

**Multi-vs-single mode**: top-level `<Accordion mode="single" | "multi">` controls whether activating one item auto-closes others. Implement with internal state map keyed by item id. Pattern is novel — no existing analog — but the `data-` attribute approach (BottomSheet.tsx `data-height`) is the closest stylistic precedent.

---

### `src/Carousel.tsx` (component, event-driven)

**Analog:** `src/BottomSheet.tsx` — for Pointer Events swipe handling (lines 89-134). Carousel touch swipe lifts directly from this seam.

**Pointer Events swipe pattern** (BottomSheet.tsx lines 93-134):
```tsx
function handleHandlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
	const panel = panelRef.current;
	if (!panel) return;
	dragStateRef.current = {
		startY: e.clientY,
		pointerId: e.pointerId,
		panelH: panel.getBoundingClientRect().height,
	};
	setDragging(true);
	try {
		(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
	} catch {
		// jsdom test envs and some older browsers may throw; safe to ignore.
	}
}

function handleHandlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
	const s = dragStateRef.current;
	if (!s || s.pointerId !== e.pointerId) return;
	const delta = Math.max(0, e.clientY - s.startY);
	setDragOffset(delta);
}

function handleHandlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
	const s = dragStateRef.current;
	if (!s || s.pointerId !== e.pointerId) return;
	const delta = Math.max(0, e.clientY - s.startY);
	const threshold = Math.min(120, s.panelH * 0.4);
	try {
		(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
	} catch {}
	dragStateRef.current = null;
	setDragging(false);
	if (delta > threshold) {
		setDragOffset(0);
		onClose();
	} else {
		setDragOffset(0);
	}
}
```
→ For Carousel: track `startX` (not Y) and on pointerup, fire `goNext()` if delta < -40px else `goPrev()` if > 40px (RESEARCH.md § Carousel Touch lines 776-797 has the simpler hand-rolled version).

**Autoplay timer + reduced-motion**: novel for the wave but isolatable to a `useEffect` that `return`s a cleanup. Pattern shape mirrors `src/Lightbox.tsx` lines 56-77 (effect with `if (!open) return;` guard, returns cleanup). Add a `useMediaQuery` or inline `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check before starting the timer (RESEARCH.md § ARIA Patterns / Carousel, lines 712-720).

**Arrow + dot nav** uses `Icon icon={ChevronLeft}` / `ChevronRight` — pattern from `src/Lightbox.tsx` lines 102-125.

---

### `src/Timeline.tsx` (component, render-only)

**Analog:** `src/StarRating.tsx` — read-only display variant uses `[1,2,3,4,5].map(...)` over fixed slots. For Timeline, `events.map((event, i) => …)` over consumer-provided list.

**Pattern**: `<ol className="ds-atom-timeline">` (ordered list — RESEARCH.md § ARIA Patterns / Timeline, lines 736-739) with `<li>` per event containing `<time dateTime={isoDate}>` and a marker dot. No interaction beyond consumer-provided onClick. Lightweight primitive — likely the smallest in the wave (~80 LOC).

---

### `src/InfiniteList.tsx` (component, event-driven)

**Analog:** `src/Lightbox.tsx` for the "useEffect with global listener + cleanup" pattern (lines 56-77).

**Effect-with-cleanup pattern** (Lightbox.tsx lines 56-77):
```tsx
useEffect(() => {
	if (!open) return;
	closeButtonRef.current?.focus();

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			onClose();
		} else if (e.key === "ArrowLeft") {
			…
		}
	}

	document.addEventListener("keydown", onKeyDown);
	return () => document.removeEventListener("keydown", onKeyDown);
}, [open, activeIndex, length, onClose, onIndexChange]);
```
→ For InfiniteList IntersectionObserver:
```tsx
useEffect(() => {
	const sentinel = sentinelRef.current;
	if (!sentinel || !hasMore || loading) return;
	const io = new IntersectionObserver((entries) => {
		if (entries[0]?.isIntersecting) onLoadMore();
	}, { rootMargin: "200px" });
	io.observe(sentinel);
	return () => io.disconnect();
}, [hasMore, loading, onLoadMore]);
```

**Props shape** matches `Lightbox`'s controlled-callbacks style: `<InfiniteList items={…} hasMore={…} loading={…} onLoadMore={…} renderItem={(item) => …}>`.

---

### `src/Calendar.tsx` (component compound, event-driven)

**Analog:** `src/DatePicker.tsx` — direct ancestor. Calendar reuses the lifted-out `buildMonthGrid` utility, the today highlight, the nav header chrome, and the cell-button + ARIA pattern.

**Header + nav-button pattern** (DatePicker.tsx lines 221-241):
```tsx
<div className="ds-atom-datepicker-header">
	<button
		type="button"
		aria-label="Previous month"
		onClick={() => step(-1)}
		className="ds-atom-datepicker-nav"
	>
		<ChevronLeft size={14} />
	</button>
	<div className="ds-atom-datepicker-label">
		{MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
	</div>
	<button
		type="button"
		aria-label="Next month"
		onClick={() => step(1)}
		className="ds-atom-datepicker-nav"
	>
		<ChevronRight size={14} />
	</button>
</div>
```
→ Calendar adds a `<SegmentedControl options={[{value:"month",label:"Month"},{value:"week",label:"Week"},{value:"day",label:"Day"}]} value={view} onChange={setView} />` to the right of the label (D-17-20). DS-63 must ship before DS-68 — confirmed in plan ordering.

**Cell-button pattern** (DatePicker.tsx lines 252-295) — verbatim. Calendar adds an event-chips slot inside each cell:
```tsx
<button …>
	<span>{date.getDate()}</span>
	<div className="ds-atom-calendar-cell-events">
		{visibleEvents.map((e) => <span className="ds-atom-calendar-chip" style={{ background: e.color }}>{e.label}</span>)}
		{overflowCount > 0 ? <span className="ds-atom-calendar-chip-more">+{overflowCount} more</span> : null}
	</div>
</button>
```

**Day-events Popover** uses existing `src/Popover.tsx` (D-17-22). Pattern from `src/MultiSelect.tsx` lines 124-139 (Popover anchored to a button ref, controlled open):
```tsx
<Popover anchorRef={moreChipRef} open={moreOpen} onOpenChange={setMoreOpen}>
	<div className="ds-atom-multiselect-more-list">
		{selectedOpts.map((o) => …)}
	</div>
</Popover>
```

**Mobile breakpoint Sheet/BottomSheet** for day-events (D-17-22): use `src/BottomSheet.tsx` directly. Inline `window.matchMedia('(max-width: 640px)').matches` check before choosing Popover-vs-BottomSheet.

**Compound API**: `Calendar.Agenda` is a consumer-rendered slot — same pattern as Modal exporting `ConfirmDialog`, but `Agenda` is attached as `Calendar.Agenda = AgendaList` after the function definition. Pure render component (events.map).

---

### `src/Breadcrumbs.tsx` (component, render + DSDropdown overflow)

**Analog:** `src/Select.tsx` — for the DSDropdown overflow chrome (showing hidden items in a dropdown when path is too deep).

**Pattern**: `<nav aria-label="Breadcrumb"><ol>…<li><a href={href}>Page</a></li></ol></nav>` (RESEARCH.md § ARIA Patterns / Breadcrumbs, lines 729-734). Last item gets `aria-current="page"`.

**Truncation collapse**: when items exceed `maxVisible`, render the first item, an overflow trigger button, the last few items. Trigger button opens a DSDropdown listing the hidden items. Reuse the Select.tsx DSDropdown wiring pattern (lines 135-201) but with `<ul role="menu">` semantic (not listbox).

---

### `src/RichText.tsx` (component, event-driven — TipTap)

**Status:** **Novel pattern — see RESEARCH.md § TipTap RichText (lines 346-461) for guidance.**

**Closest partial analogs:**
- `src/BottomSheet.tsx` for "non-trivial primitive owning its own portal-based subcomponent" (link popover via DSPortal).
- `src/MultiSelect.tsx` lines 124-139 for "Popover-anchored-to-a-trigger-ref-inside-the-component" (used for the Link URL popover).
- `src/Modal.tsx` lines 80-98 for "useEffect-managed document-keydown listener with mount gating" (used for keyboard shortcuts beyond TipTap defaults).
- `src/AlertBanner.tsx` lines 51-80 for the surrounding chrome (toolbar `<div role="toolbar">` + ghost-variant Buttons via canonical Icon).

**Toolbar button pattern** (RESEARCH.md lines 437-446):
```tsx
<Button
	variant="ghost"
	data-active={editor?.isActive("bold") || undefined}
	onClick={() => editor?.chain().focus().toggleBold().run()}
	aria-pressed={editor?.isActive("bold") || false}
	aria-label="Bold"
>
	<Icon icon={Bold} />
</Button>
```
→ Button + canonical Icon. `data-active` flag mirrors the `is-open`/`is-active` state pattern used across the codebase (Select chevron, Tabs active tab).

**Heading H2/H3 dropdown** uses `_internals/DSDropdown.tsx` — same wiring as Select/MultiSelect.

**SSR-safe init + controlled-sync** (RESEARCH.md lines 357-411): pattern is novel and has TWO infinite-loop traps. Document in plan + in-file comment.

**No direct codebase analog for TipTap config** — point planner to RESEARCH.md and the TipTap docs cited there.

---

### `src/hooks/useSortableTable.ts` (hook, pure transform)

**Analog:** `src/hooks/useClickOutside.ts` — smallest hook in repo, exemplifies file-size + JSDoc style.

**Header docblock pattern** (useClickOutside.ts lines 1-7):
```ts
import { type RefObject, useEffect } from "react";

/**
 * Calls `handler` when a mousedown/touchstart fires outside of `ref`'s element.
 * Used by Popover (Phase 14), Modal close-on-backdrop, Select dropdown dismiss.
 */
export function useClickOutside<T extends HTMLElement>(…)
```
→ Mirror for useSortableTable: 2-line description + "Used by Table (DS-61) sort headers." Hook signature in RESEARCH.md lines 477-491.

**Implementation hint**: `useSortableTable` is `useMemo`-driven (no effects). Body is `const sorted = useMemo(() => sortCol == null ? rows : [...rows].sort(comparator), [rows, sortCol, sortDir])` plus a `useState` for sortCol/sortDir. Stable sort guaranteed by spec (RESEARCH.md line 493).

**Test pattern** (useFocusTrap.test.tsx): `Harness` component using the hook, vitest `describe` + `it` with assertions on rendered output. Mirror for `useSortableTable`: `Harness` renders a `<table>` of sorted rows; tests assert order before and after `toggleSort('age')`.

---

### `src/hooks/useTableSelection.ts` (hook, event-driven)

**Analog:** `src/hooks/useFocusTrap.ts` — has the controlled "active" flag + scoped behavior pattern.

**Header pattern** (useFocusTrap.ts lines 8-13):
```ts
/**
 * Trap Tab/Shift+Tab focus inside `ref`'s element while `active` is true.
 * On activation: focuses the first focusable child.
 * On deactivation: restores focus to the previously-focused element.
 * Used by Modal (Phase 14), Sheet (Phase 14), CommandPalette (Phase 17).
 */
export function useFocusTrap<T extends HTMLElement>(
	ref: RefObject<T | null>,
	active: boolean,
): void {
```
→ Mirror for useTableSelection: docblock + signature from RESEARCH.md lines 496-509. Internal state via `useState<Set<Id>>` (or array — array is simpler for downstream comparisons and matches existing primitives' value types).

**Controlled-vs-uncontrolled hybrid** (RESEARCH.md line 511): "Pattern matches Checkbox/Toggle." Look at `src/Checkbox.tsx` for the controlled-vs-defaultValue precedent.

---

### `src/hooks/useResizableColumns.ts` (hook, event-driven Pointer Events)

**Analog:** `src/BottomSheet.tsx` lines 89-134 — exact-match for Pointer Events with `setPointerCapture` and pointerdown/move/up cleanup.

**Pattern** (already extracted above in Carousel section — same lift). The hook returns `{ widths, setWidth, startResize }` where `startResize` accepts a column id + the React.PointerEvent and installs document-level pointermove/pointerup listeners that clean themselves up:

```ts
function startResize(col: string, e: React.PointerEvent) {
	const startX = e.clientX;
	const startW = widths[col] ?? 0;
	const target = e.currentTarget as HTMLElement;
	target.setPointerCapture?.(e.pointerId);

	function onMove(ev: PointerEvent) {
		const delta = ev.clientX - startX;
		const next = Math.max(minWidth, startW + delta);
		setWidths((prev) => ({ ...prev, [col]: next }));
	}

	function onUp() {
		document.removeEventListener("pointermove", onMove);
		document.removeEventListener("pointerup", onUp);
		onWidthsChange?.(/* current widths */);
	}

	document.addEventListener("pointermove", onMove);
	document.addEventListener("pointerup", onUp);
}
```

---

### Stories files (`<Name>.stories.tsx`, 11 new + edits)

**Analog:** `src/Select.stories.tsx` for compound-component stories; `src/StarRating.stories.tsx` for atomic-component stories.

**Story file structure pattern** (Select.stories.tsx lines 1-90):
```tsx
/**
 * # Usage Audit — Select (DS-50, DS-87, D-500, D-501)
 *
 * Consumers (post v2.1):
 * - kanban/StatusFilter — single-select with status pipeline options + dotColor
 * - …
 *
 * API:
 * - value: string | null (controlled)
 * - …
 *
 * Implementation:
 * - Composes _internals/DSDropdown (D-500) — …
 * - …
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select, type SelectOption } from "./Select";

const STATUS_OPTIONS: SelectOption[] = [ … ];

function ControlledSelect({ … }) { … }

const meta: Meta<typeof Select> = {
	title: "Compound/Select",
	component: Select,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = { … };
export const WithDots: Story = { … };
export const Searchable: Story = { … };
export const NonSearchable: Story = { … };
export const NoResults: Story = { … };
export const Disabled: Story = { … };
export const Playground: Story = { … };
```
→ Mirror for every Phase 17 primitive: usage-audit docblock at top, controlled wrapper component, `Meta` with `title: "Compound/<Name>"` (or "Atoms/<Name>" for SegmentedControl/Timeline — see StarRating.stories.tsx line 25), 5-7 stories covering `Default`, named-variant stories, and `Playground`. Add Dark Mode stories where dark-mode hover-state matters (per CONTEXT.md "verify in Storybook dark mode after building" — D-17-25).

---

### Test files (`<Name>.test.tsx`, 11 new)

**Analog:** `src/Select.test.tsx` for compound primitives; `src/hooks/useFocusTrap.test.tsx` for hook tests.

**Test file structure** (Select.test.tsx lines 1-50):
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./Select";

const STATUS_OPTIONS: SelectOption[] = [ … ];

function Harness({ onChange, initialValue = null, searchable = true }: { … }) {
	const [value, setValue] = useState<string | null>(initialValue);
	return (
		<Select value={value} onChange={(v) => { setValue(v); onChange?.(v); }} …/>
	);
}

describe("Select", () => {
	it("renders placeholder when value is null", () => { … });
	it("trigger has correct ARIA: …", () => { … });
	it("clicking trigger opens the listbox …", () => { … });
	it("ArrowDown then Enter selects the next option …", () => { … });
	it("search filters options by case-insensitive label substring", () => { … });
	it("empty filter result shows the No results empty state", () => { … });
	it("Escape closes the dropdown …", () => { … });
});
```
→ Each Phase 17 primitive ships ≈5-8 unit tests covering: render (props → DOM), ARIA correctness, keyboard navigation, controlled value flow, edge cases (empty list, disabled, etc.).

## Shared Patterns

### Pattern 1: Canonical Icon Wrapper (DS-60 — applies to ALL primitives that render icons)

**Source:** `src/_internals/Icon.tsx` (NEW — to be created)
**Apply to:** All 14 existing lucide-direct importers (D-17-04 sweep) + every Phase 17 primitive that renders an icon (Tabs overflow, Accordion chevron, Carousel arrows, Calendar nav, Breadcrumbs separator, RichText toolbar — minimum ~15 net new call sites).

**Before** (Select.tsx line 1, lines 129-133, 195):
```tsx
import { Check, ChevronDown } from "lucide-react";
…
<ChevronDown
	size={14}
	className={`ds-atom-select-chevron${open ? " is-open" : ""}`}
	aria-hidden="true"
/>
…
<Check size={14} className="ds-atom-select-check" aria-hidden="true" />
```

**After:**
```tsx
import { ChevronDown, Check } from "../icons"; // public canonical icons
// OR for private use:
// import { Icon } from "./_internals/Icon";
// import { Check, ChevronDown } from "lucide-react";
…
<ChevronDown
	size={14}
	className={`ds-atom-select-chevron${open ? " is-open" : ""}`}
/>
…
<Check size={14} className="ds-atom-select-check" />
```
The wrapper applies `aria-hidden="true"` by default + locks `strokeWidth={1.5}` (D-17-02). Per-callsite `size` overrides still work (CONTEXT.md specifics: "those callsites should pass `size={14}` to the wrapper").

**Refactor scope (D-17-04):** AlertBanner, Autocomplete, Checkbox, Chip, CopyToClipboard, DatePicker, Lightbox, MultiSelect, NumberStepper, Select, SplitButton, StarRating, Toast — verified by `grep -l "lucide-react" src/*.tsx` (16 files including stories). Stories files also touch lucide; CONTEXT.md leaves stories as a "follow-up if diff is too large."

### Pattern 2: DSPortal-mounted floating UI

**Source:** `src/_internals/DSPortal.tsx` lines 20-27
**Apply to:** RichText link popover, Calendar day-events popover (via existing `Popover` primitive — preferred), Tabs overflow menu (via existing `DSDropdown`).

**Pattern:**
```tsx
return (
	<DSPortal>
		<div ref={panelRef} className="…" role="dialog" aria-modal="…" style={{ position: "fixed", … }}>
			{children}
		</div>
	</DSPortal>
);
```

**Position-after-mount gotcha** (Popover.tsx lines 73-78, DSDropdown.tsx lines 61-66):
```tsx
const [panel, setPanel] = useState<HTMLDivElement | null>(null);
const panelRef = useRef<HTMLDivElement | null>(null);
const setPanelRef = (node: HTMLDivElement | null) => {
	panelRef.current = node;
	setPanel(node);
};
```
DSPortal returns null on first render, so `panelRef.current` is null until the second commit. The callback-ref-as-state trick re-runs `useLayoutEffect` once the portal commits. Required for any new DSPortal-mounted floating panel.

### Pattern 3: Document-level keydown for Escape

**Source:** `src/Modal.tsx` lines 91-98, `src/Sheet.tsx` lines 73-80, `src/Lightbox.tsx` lines 56-77
**Apply to:** Calendar day-events popover (Escape closes), RichText link popover (Escape closes), any new floating UI in Phase 17.

```tsx
useEffect(() => {
	if (!open) return;
	function onKey(e: KeyboardEvent) {
		if (e.key === "Escape") onClose();
	}
	document.addEventListener("keydown", onKey);
	return () => document.removeEventListener("keydown", onKey);
}, [open, onClose]);
```

### Pattern 4: Controlled `open` + return-null short-circuit

**Source:** `src/AlertBanner.tsx` line 66, `src/Modal.tsx` line 100, `src/Sheet.tsx` (similar), `src/BottomSheet.tsx` line 146

```tsx
if (!open) return null;
```
Apply to: Carousel autoplay-paused state (skip timer), Calendar day-events popover, RichText readOnly state (just toggle editor.editable, don't unmount).

### Pattern 5: `data-*` attribute for visual variants (instead of class concatenation for state)

**Source:** Pervasive — `src/Button.tsx` line 87 (`data-variant`), `src/BottomSheet.tsx` line 165 (`data-height`), `src/AlertBanner.tsx` line 73 (`data-variant`), `src/StarRating.tsx` line 50 (`data-size`)
**Apply to:** Table density (`data-density="cozy"|"comfortable"|"spacious"`), Table sticky (`data-sticky="true"`), Tabs variant (`data-variant="underline"|"pill"`), SegmentedControl size (`data-size`), Accordion expanded chevron (`data-open="true"`).

CSS in primitives.css keys off `[data-*]` selectors — see Button.tsx + primitives.css lines 23-37 for the pattern.

### Pattern 6: forwardRef for primitives whose ref is plausibly useful

**Source:** `src/Button.tsx` lines 68-102, `src/AlertBanner.tsx` lines 51-80, `src/DatePicker.tsx` lines 72-93, `src/MultiSelect.tsx` lines 27-30, `src/Select.tsx` lines 48-60
**Apply to:** Table.Root, Tabs root, SegmentedControl, Accordion, Carousel, Timeline, Calendar, Breadcrumbs, RichText. Skip for hooks (obviously) and pure-render primitives (Timeline ARIA list).

```tsx
export const Foo = forwardRef<HTMLDivElement, FooProps>(function Foo({ … }, ref) {
	return <div ref={ref} … />;
});
```

### Pattern 7: ARIA wiring with `useId()` for label/describedby

**Source:** `src/Modal.tsx` lines 67-70, `src/BottomSheet.tsx` lines 70-71, `src/Sheet.tsx` lines 60-63, `src/MultiSelect.tsx` lines 36-38

```tsx
const generatedTitleId = useId();
const titleId = title ? generatedTitleId : undefined;
…
<header id={titleId}>{title}</header>
…
aria-labelledby={titleId}
```
Apply to: Tabs (panel ←→ tab labelling), Accordion (button ←→ panel labelling), Calendar (day-events Popover labelled by day cell), RichText (toolbar buttons labelled).

### Pattern 8: Storybook usage-audit JSDoc at top of `<Name>.stories.tsx`

**Source:** `src/Select.stories.tsx` lines 1-34, `src/StarRating.stories.tsx` lines 1-17

Pattern is mandatory per repo convention (every existing primitive has it). Apply to all 11 new stories files. Sections: `Consumers`, `API`, `Implementation`. Reference DS-NN identifier and any Phase 17 D-NN decisions.

### Pattern 9: CSS in `primitives.css` keyed by `.ds-atom-<name>`

**Source:** `src/primitives.css` lines 1-60 (Button block), lines 1541-1620+ (DatePicker block — closest analog for Calendar)
**Apply to:** Append ~10 new `.ds-atom-table`, `.ds-atom-tabs`, `.ds-atom-segmented`, `.ds-atom-accordion`, `.ds-atom-carousel`, `.ds-atom-timeline`, `.ds-atom-infinitelist`, `.ds-atom-calendar`, `.ds-atom-breadcrumbs`, `.ds-atom-richtext` blocks.

**Block header convention** (primitives.css lines 6-9):
```css
/* ─── DS atom: Button ────────────────────────────────────────────────────
   Pseudo-class states that inline style={{}} cannot express (D-103).
   Variant-specific hover states keyed off data-variant attribute.
   Source: original handoff `.ds-btn` rules transcribed verbatim. */
```

**Dark-mode flip pattern** (primitives.css lines 43-50):
```css
:root.dark .ds-atom-btn[data-variant="ghost"] {
	color: var(--ink);
}
:root.dark .ds-atom-btn[data-variant="ghost"]:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.06);
}
```
Apply for every new primitive. Per CONTEXT.md "Verify dark variant for every new primitive — recent v0.5.6 hotfix shows hover specificity matters" (D-17-25).

### Pattern 10: tsup multi-entry build

**Source:** `tsup.config.ts` (current state):
```ts
export default defineConfig({
	entry: ["src/index.ts", "src/hooks/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: ["react", "react-dom"],
	onSuccess: "cp src/*.css dist/ 2>/dev/null || true",
});
```
**Modification (RESEARCH.md lines 232-249):**
```ts
entry: ["src/index.ts", "src/hooks/index.ts", "src/icons/index.ts"],
external: ["react", "react-dom", "lucide-react"],
```
Add `"sideEffects": ["*.css"]` to package.json (RESEARCH.md line 282 — currently absent).

### Pattern 11: package.json exports map (subpath addition)

**Source:** `package.json` lines 20-32 — current `./hooks` block
**Modification:** Add `./icons` block mirroring `./hooks`:
```json
"./icons": {
	"types": "./dist/icons/index.d.ts",
	"import": "./dist/icons/index.js"
}
```

### Pattern 12: Mechanical refactor sweep across 14 primitives (D-17-04)

**Source:** Recent v0.5.x hotfixes — `git log --oneline --grep="^fix(v0.5"` shows the atomic-refactor commit shape.
**Approach:** Single plan (or first plan after Icons setup) does grep-based mechanical replacement:
```bash
# Find all callsites:
grep -n "from \"lucide-react\"" src/*.tsx
# Replace per file: import block + each <Icon /> JSX use site.
```
14 files affected per CONTEXT.md D-17-04 list. Not a code-quality refactor — a brand-lock refactor. Plan should ship as one atomic commit per file or one big commit with a clear `feat(17-NN): canonical Icon wrapper rollout — DS-60` message.

## No Analog Found / Novel Patterns

| File / Pattern | Reason | Guidance |
|----------------|--------|----------|
| `src/RichText.tsx` TipTap config + controlled-sync | No existing TipTap (or any rich-text editor) primitive in repo | RESEARCH.md § TipTap RichText (lines 346-461) — controlled-sync trap, SSR-safe init, toolbar pattern, link popover. Plan should over-cite this section. |
| `src/Tabs.tsx` ResizeObserver overflow detection | No existing primitive uses ResizeObserver (existing primitives use IntersectionObserver, scroll listeners, but not ResizeObserver) | RESEARCH.md § Tabs Overflow Menu (lines 745-768) — full implementation. Lifecycle shape mirrors Lightbox.tsx lines 56-77 (effect with cleanup return). |
| `src/Carousel.tsx` autoplay timer + `prefers-reduced-motion` | No existing primitive runs a recurring timer | RESEARCH.md § Carousel Touch + Reduced-Motion (lines 774-797 + § ARIA Patterns / Carousel lines 712-720). `setInterval` in `useRef` + cleanup; gate creation on `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. |
| `src/Table.tsx` namespace-object compound API (`Table.Root`, `Table.Header`, etc.) | Modal.tsx exports two top-level functions; this repo has not yet shipped a namespace-attached compound API | Use the React idiom: `function TableRoot(...) {…}; function TableHeader(...) {…}; …; export const Table = { Root: TableRoot, Header: TableHeader, … }`. Plan must explicitly call out the deviation from Modal's two-export shape. Cite Radix / Reach UI as design-precedent. |
| `useSortableTable` pure-derivation hook | Existing hooks in repo are all effect-driven (useFocusTrap, useClickOutside, useKeyboardShortcut, useComposedRefs) | The hook is essentially `useState + useMemo` — internal pattern is novel for the hooks/ directory but trivial. RESEARCH.md lines 477-493 give the full signature. |
| `Calendar` week-view + day-view layouts | DatePicker + the lifted `buildMonthGrid` only cover month view. Week (single 7-cell row) and day (single cell + hourly slots) layouts are NEW. | Internal to Calendar.tsx — not part of `_internals/calendarGrid.ts`. RESEARCH.md § Calendar Primitive API line 667 explicitly notes this. |

## Metadata

**Analog search scope:** `/Users/temp/Documents/workspace/design-system/src/` (35 primitives + 4 hooks + 2 _internals files), `/Users/temp/Documents/workspace/design-system/tsup.config.ts`, `/Users/temp/Documents/workspace/design-system/package.json`, `/Users/temp/Documents/workspace/design-system/src/primitives.css`.
**Files scanned (Read or Grep):** 18 source files (DSDropdown, DSPortal, dateUtils, dateUtils.test, Modal, Select, MultiSelect, Autocomplete (head), Lightbox, BottomSheet, Sheet (head), DatePicker, Button, AlertBanner (head), StarRating, Popover (head), useFocusTrap, useClickOutside, useKeyboardShortcut, useFocusTrap.test, Select.stories (head), Select.test (head), StarRating.stories (head), primitives.css (head + DatePicker block grep), index.ts, hooks/index.ts, tsup.config.ts, package.json) + grep across all `src/*.tsx` for `lucide-react`.
**Pattern extraction date:** 2026-04-29
