/**
 * # Usage Audit - Tabs (DS-62)
 *
 * Consumers (post v0.6):
 * - Settings sections, profile detail panels, dashboard switching
 *
 * API:
 * - tabs: TabItem[] - { id, label, count?, disabled?, content }
 * - value, onChange (controlled)
 * - variant: "underline" | "pill"
 * - activationMode: "automatic" | "manual"
 *
 * Implementation:
 * - WAI-ARIA tab pattern with auto activation default
 * - Arrow keys cycle focus + select; Home/End jump to ends
 * - Visual variants via data-variant CSS attribute
 * - Overflow menu via DSDropdown when tabs exceed container width (ResizeObserver)
 */
import {
	type CSSProperties,
	type ReactNode,
	forwardRef,
	useCallback,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { MoreHorizontal } from "../../icons";
// ── Public interfaces ─────────────────────────────────────────────────────────

export interface TabItem {
	id: string;
	label: string;
	count?: number;
	disabled?: boolean;
	content: ReactNode;
}

export interface TabsProps {
	/** Array of tab definitions including id, label, optional count badge, disabled flag, and panel content. */
	tabs: TabItem[];
	/** Controlled id of the currently active tab. */
	value: string;
	/** Called with the tab id when the user activates a different tab. */
	onChange: (id: string) => void;
	/** Visual style of the tab triggers.
	 * @default "underline"
	 */
	variant?: "underline" | "pill";
	/** Whether selecting a tab happens on arrow-key press (`"automatic"`) or only on Enter/Space (`"manual"`).
	 * @default "automatic"
	 */
	activationMode?: "automatic" | "manual";
	/** Accessible label for the `role="tablist"` element (required). */
	ariaLabel: string;
	/** Additional className applied to the root wrapper element. */
	className?: string;
	/** Inline styles applied to the root wrapper element. */
	style?: CSSProperties;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
	{
		tabs,
		value,
		onChange,
		variant = "underline",
		activationMode = "automatic",
		ariaLabel,
		className,
		style,
	},
	ref,
) {
	const baseId = useId();
	const rootRef = useRef<HTMLDivElement | null>(null);
	const tablistRef = useRef<HTMLDivElement | null>(null);
	const moreBtnRef = useRef<HTMLButtonElement | null>(null);
	// Hidden measurement host and its two permanent occupants — see the overflow
	// effect below. Neither carries any text.
	const measureHostRef = useRef<HTMLDivElement | null>(null);
	const fontProbeRef = useRef<HTMLElement | null>(null);
	const measureMoreRef = useRef<HTMLButtonElement | null>(null);
	// Latest `tabs`, read from inside the measurement effect. Held in a ref so
	// the effect does NOT depend on the array's identity: consumers routinely
	// pass `tabs={[...]}` inline, and depending on the array itself would tear
	// down and rebuild the ResizeObserver on every single render.
	const tabsRef = useRef(tabs);
	tabsRef.current = tabs;
	// What the effect actually depends on: everything that changes a tab's
	// measured width. `tabs.length` alone was too narrow — renaming a tab
	// changes its width and must re-measure.
	const measureKey = tabs
		.map((t) => `${t.id}\u0000${t.label}\u0000${t.count ?? ""}\u0000${t.disabled ? 1 : 0}`)
		.join("\u0001");

	// Overflow state
	const [visibleCount, setVisibleCount] = useState(tabs.length);
	const [overflowOpen, setOverflowOpen] = useState(false);
	const [overflowActiveIndex, setOverflowActiveIndex] = useState(0);

	// Compute how many tabs fit — measured from the hidden strip, not from the
	// tabs currently on screen.
	//
	// WHY A SEPARATE MEASUREMENT STRIP AND NOT THE RENDERED TABS
	//
	// This used to read `offsetWidth` off the rendered `[role='tab']` buttons.
	// Two defects followed from that, and the second is the reason the first
	// could not be fixed on its own:
	//
	//   1. THE READ HAPPENED ONCE, BEFORE WEBFONTS SETTLED. The observer watched
	//      the ROOT element, whose width is set by the consumer's container and
	//      is invariant to anything inside the component. So it fired on its
	//      initial delivery and never again — and that delivery lands in the
	//      window before the webfont swaps. Measured on the Narrow/Overflow
	//      story: "Reports" is 76.547px on fallback metrics and 75.922px in
	//      DM Sans, and the container sits 0.25px from the boundary, so a
	//      one-pixel font-metric difference decided whether the strip showed two
	//      tabs or three — permanently, for that page load. A visitor on a cold
	//      cache and a visitor on a warm one saw different tab counts.
	//
	//   2. THE MEASUREMENT WAS A FUNCTION OF ITS OWN OUTPUT. Only `visibleCount`
	//      buttons are in the DOM, so the old code measured the subset it had
	//      already chosen and ESTIMATED the hidden ones from the average of the
	//      visible ones. That is a one-way ratchet: once a tab is hidden its real
	//      width is unmeasurable, the estimate is wrong, and the count can shrink
	//      but never grow back.
	//
	// (2) is why simply re-running this on `document.fonts.ready` fixes nothing —
	// verified, not assumed: with that change the story still rendered 2 tabs on
	// the pre-font branch and 3 on the post-font branch, the same two answers to
	// the same decimal. The re-measure sees two buttons, recomputes two, and the
	// ratchet holds.
	//
	// So the input has to be every tab's intrinsic width, independent of what is
	// on screen. That is measured from a throwaway strip built inside a hidden
	// 0x0 host, measured, and torn down inside one synchronous call.
	//
	// WHY THROWAWAY AND NOT A PERMANENT HIDDEN COPY
	//
	// A permanent copy is simpler and was written first. It also puts a second
	// copy of every tab label into the DOM for the lifetime of the component,
	// and `visibility: hidden` does not hide text from `getByText`,
	// `textContent`, or a crawler reading the markup. Every consumer with a
	// `getByText("Settings")` in a test would have started getting "found
	// multiple elements", from a patch release, for an internal implementation
	// detail. Building the strip only for the microsecond it is measured keeps
	// the rendered DOM exactly as it was.
	//
	// The two things that DO live in the hidden host are both text-free: a real
	// More button (so its width is measured rather than assumed — the old code
	// hardcoded 44px for a button that measures 32) and a `ch`/`ex`-sized metric
	// probe, which exists to be observed.
	//
	// biome-ignore lint/correctness/useExhaustiveDependencies: `measureKey` is a deliberate re-run trigger, not a capture. The effect reads `tabs` through `tabsRef` so it does not re-subscribe on every render when a consumer passes `tabs={[...]}` inline; `measureKey` is what re-runs it when a label, count or disabled flag changes the measured width. The rule sees an unused dependency because it cannot see the indirection.
	useLayoutEffect(() => {
		const root = rootRef.current;
		const bar = tablistRef.current;
		const host = measureHostRef.current;
		const fontProbe = fontProbeRef.current;
		if (!root || !bar || !host || !fontProbe) return;

		/**
		 * Build a full-width copy of the tab strip inside the hidden host.
		 *
		 * Constructed from the same class names rather than cloned from a
		 * rendered trigger, because at the first measurement every tab is still
		 * on screen but at later ones some are not — and cloning whichever
		 * happens to be rendered is how the old code ended up measuring its own
		 * output. The host sits inside the root element, so variant-scoped rules
		 * (`[data-variant="pill"] .ds-atom-tabs-trigger`) apply to it too.
		 */
		const buildStrip = (): HTMLElement => {
			const strip = document.createElement("div");
			strip.className = "ds-atom-tabs-tablist";
			strip.style.width = "max-content";
			for (const t of tabsRef.current) {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.tabIndex = -1;
				btn.className = "ds-atom-tabs-trigger";
				if (t.disabled) btn.disabled = true;
				const label = document.createElement("span");
				label.className = "ds-atom-tabs-label";
				label.textContent = t.label;
				btn.appendChild(label);
				if (typeof t.count === "number") {
					const count = document.createElement("span");
					count.className = "ds-atom-tabs-count";
					count.textContent = String(t.count);
					btn.appendChild(count);
				}
				strip.appendChild(btn);
			}
			return strip;
		};

		const measure = () => {
			// Width actually available to the tab strip: the bar's content box.
			// (The pill variant pads the bar by 4px a side; the old code read
			// root.clientWidth and silently spent that padding twice.)
			const barStyle = getComputedStyle(bar);
			const containerWidth =
				bar.clientWidth -
				(Number.parseFloat(barStyle.paddingLeft) || 0) -
				(Number.parseFloat(barStyle.paddingRight) || 0);
			// Detached, or inside a `display: none` ancestor — every box reads 0.
			// Keep the last good answer rather than flashing every tab back in.
			if (containerWidth <= 0) return;

			// Measured and torn down within this synchronous block, so the strip is
			// never visible to a render, a query, or the DOM between frames.
			const strip = buildStrip();
			host.appendChild(strip);
			let cumulative: number[];
			let moreReserve: number;
			try {
				// The right edge of the k-th button, relative to the strip's own
				// left edge, is the exact width of the first k+1 tabs INCLUDING the
				// flex gaps between them. No gap arithmetic and no integer
				// rounding: the old code summed `offsetWidth` (rounded to whole
				// pixels) and ignored the 4px gaps entirely, then compensated with
				// a hardcoded 44px reserve for a More button that measures 32. The
				// two errors happened to cancel to within 8px at three tabs and to
				// diverge in the same direction at five.
				const stripLeft = strip.getBoundingClientRect().left;
				cumulative = Array.from(
					strip.children,
					(el) => el.getBoundingClientRect().right - stripLeft,
				);
				// The real More button, measured rather than assumed. `gap` comes
				// off the bar because that is the gap the button would actually sit
				// behind once rendered.
				const moreEl = measureMoreRef.current;
				const gap = Number.parseFloat(barStyle.columnGap) || 0;
				moreReserve = moreEl ? gap + moreEl.getBoundingClientRect().width : 0;
			} finally {
				strip.remove();
			}

			const totalWidth = cumulative[cumulative.length - 1] ?? 0;
			// A zero-width strip means the host is not being laid out; treating
			// that as "everything fits" would flash every tab back in.
			if (totalWidth <= 0) return;

			// Every tab fits, so no More button is needed and none is reserved.
			if (totalWidth <= containerWidth) {
				setVisibleCount(tabsRef.current.length);
				return;
			}

			const available = containerWidth - moreReserve;
			let nextVisible = 0;
			while (nextVisible < cumulative.length && cumulative[nextVisible]! <= available) {
				nextVisible += 1;
			}
			setVisibleCount(nextVisible);
		};

		// Run once synchronously so the first painted frame is already collapsed,
		// instead of flashing every tab and settling a frame later.
		measure();

		const ro = new ResizeObserver(measure);
		// The container: catches the consumer resizing, zooming, or rotating.
		ro.observe(root);
		// The metric probe: a text-free element sized in `ch` and `ex`, i.e. in the
		// current font's own advance width and x-height. It changes size when, and
		// only when, the metrics the tab widths are computed from change.
		//
		// THIS IS THE FONT TRIGGER, AND IT DOES NOT USE THE FONT LOADING API.
		// A webfont swap reflows the probe and ResizeObserver reports the reflow
		// whatever caused it, so a browser with no `document.fonts` re-measures on
		// the same frame as one that has it. That matters: a Font-Loading-API-only
		// fix would silently never fire for the users whose network makes the race
		// worst, which is the same bug with a longer fuse. It also catches the
		// cases `fonts.ready` cannot see at all — a late `@font-face`, a user font
		// override, a consumer swapping `--font-body` at runtime.
		ro.observe(fontProbe);

		// Secondary font trigger, for the case the probe cannot see: a swap that
		// leaves `ch` and `ex` unchanged while other glyphs move. Rare, but the
		// probe measures two metrics and a font has many.
		//
		// Optional-chained on purpose. Where `document.fonts` does not exist this
		// is a no-op and the strip observer above is doing the whole job — it is
		// an addition to the font handling, never the sole route to it.
		let cancelled = false;
		document.fonts?.ready
			?.then(() => {
				if (!cancelled) measure();
			})
			.catch(() => undefined);

		return () => {
			cancelled = true;
			ro.disconnect();
		};
	}, [measureKey]);

	// ID helpers
	const tabId = (id: string) => `${baseId}-tab-${id}`;
	const panelId = (id: string) => `${baseId}-panel-${id}`;

	// Determine enabled (non-disabled) tab indices in the VISIBLE slice
	const activeIndex = tabs.findIndex((t) => t.id === value);
	const hasOverflow = visibleCount < tabs.length;
	// When the active tab is hidden inside the overflow menu it is NOT in the
	// tablist DOM, so no <button role="tab"> carries tabIndex=0. In that case the
	// "More" button becomes the single roving tab stop so the tablist stays
	// keyboard-reachable.
	const activeInOverflow = hasOverflow && activeIndex >= visibleCount;

	const moveFocus = useCallback(
		(delta: 1 | -1 | "home" | "end", activate: boolean) => {
			// Build the roving model from VISIBLE positions only, then append the
			// "More" button as a final stop when tabs overflow. Indexing by visible
			// position (not the full tabs array) keeps DOM focus aligned with the
			// visible-only [role='tab'] NodeList — the previous code mixed full-array
			// indices with a visible-only NodeList, causing an off-by-N when any tab
			// was hidden.
			const visibleTabs = tabs.slice(0, visibleCount);
			const tabButtons = tablistRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");

			type Stop = { el: HTMLButtonElement | undefined; tabId?: string };
			const stops: Stop[] = [];
			visibleTabs.forEach((t, i) => {
				if (t.disabled) return;
				stops.push({ el: tabButtons?.[i], tabId: t.id });
			});
			// "More" is a roving stop whenever it is rendered (overflow present).
			if (hasOverflow && moreBtnRef.current) {
				stops.push({ el: moreBtnRef.current });
			}
			if (stops.length === 0) return;

			// Current position: the active tab's slot, or the "More" stop when the
			// active tab is hidden in the overflow menu.
			let cur: number;
			if (activeInOverflow) {
				cur = stops.length - 1;
			} else {
				cur = stops.findIndex((s) => s.tabId === value);
			}

			let next: number;
			if (delta === "home") next = 0;
			else if (delta === "end") next = stops.length - 1;
			else if (cur === -1) next = 0;
			else next = (cur + delta + stops.length) % stops.length;

			const target = stops[next]!;
			target.el?.focus();
			// Only activate when landing on a real tab (the "More" button has no id).
			if (activate && target.tabId) onChange(target.tabId);
		},
		[value, tabs, visibleCount, hasOverflow, activeInOverflow, onChange],
	);

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const auto = activationMode === "automatic";
		if (e.key === "ArrowRight") {
			e.preventDefault();
			moveFocus(1, auto);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			moveFocus(-1, auto);
		} else if (e.key === "Home") {
			e.preventDefault();
			moveFocus("home", auto);
		} else if (e.key === "End") {
			e.preventDefault();
			moveFocus("end", auto);
		}
	};

	const hiddenTabs = tabs.slice(visibleCount);

	return (
		<div
			ref={(node) => {
				rootRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
			}}
			className={`ds-atom-tabs${className ? ` ${className}` : ""}`}
			style={style}
			data-variant={variant}
		>
			{/* Hidden measurement host.

			    Two permanent occupants, BOTH TEXT-FREE by design: a real More
			    button, so the overflow reserve is a measurement rather than the
			    hardcoded 44px it used to be, and a metric probe sized in `ch`/`ex`
			    whose box tracks the current font's advance width and x-height.

			    The probe exists to be observed. A ResizeObserver on it fires when
			    a webfont swaps in — which is the trigger the old code had no
			    equivalent of, and the reason the tab count used to depend on
			    whether a font arrived before or after a single measurement.

			    The tab strip itself is NOT here: it is built, measured and torn
			    down inside one synchronous call (see the effect above), so no
			    duplicate label text ever exists in the rendered DOM.

			    Laid out but not painted: `visibility: hidden` inside a 0x0
			    `overflow: hidden` box. Laid out is essential — a `display: none`
			    subtree reports zero width and never fires a ResizeObserver, so it
			    could not be the font trigger. Clipped to 0x0 is the other half:
			    the measured strip is wider than its container by construction, and
			    an unclipped one would extend the page's scroll width and change
			    every full-page screenshot in the store. */}
			<div className="ds-atom-tabs-measure" aria-hidden="true" ref={measureHostRef}>
				<i className="ds-atom-tabs-metric" ref={fontProbeRef} />
				<button ref={measureMoreRef} type="button" tabIndex={-1} className="ds-atom-tabs-more">
					<MoreHorizontal size={16} />
				</button>
			</div>

			{/* Tab bar.
			    `role="tablist"` sits on the inner element, not this one, because an
			    ARIA tablist may only contain `tab` children — and the overflow
			    "More" button below is a menu trigger, not a tab. It used to live
			    inside the tablist (axe: aria-required-children), where it also had
			    to be in the roving-tabindex cycle.

			    This outer element keeps the ref, class, CSS and keydown handler, so
			    overflow measurement and arrow-key navigation are unchanged; only the
			    role moved inward. */}
			<div ref={tablistRef} className="ds-atom-tabs-list" onKeyDown={onKeyDown}>
				<div
					role="tablist"
					aria-orientation="horizontal"
					aria-label={ariaLabel}
					className="ds-atom-tabs-tablist"
				>
					{tabs.slice(0, visibleCount).map((t) => {
						const isActive = t.id === value;
						return (
							<button
								key={t.id}
								type="button"
								role="tab"
								id={tabId(t.id)}
								aria-selected={isActive}
								aria-controls={panelId(t.id)}
								tabIndex={isActive ? 0 : -1}
								disabled={t.disabled}
								onClick={() => {
									if (!t.disabled) onChange(t.id);
								}}
								className="ds-atom-tabs-trigger"
								data-active={isActive || undefined}
							>
								<span className="ds-atom-tabs-label">{t.label}</span>
								{typeof t.count === "number" && (
									<span className="ds-atom-tabs-count">{t.count}</span>
								)}
							</button>
						);
					})}
				</div>

				{/* More button — a sibling of the tablist, still inside the bar so it
				    stays on the same row and inside the keydown handler above. */}
				{hasOverflow && (
					<button
						ref={moreBtnRef}
						type="button"
						className="ds-atom-tabs-more"
						aria-label={`More tabs (${hiddenTabs.length} hidden)`}
						aria-expanded={overflowOpen}
						aria-haspopup="menu"
						// Roving stop: tabbable only when the active tab is hidden in the
						// overflow menu (so the tablist always has exactly one Tab entry).
						tabIndex={activeInOverflow ? 0 : -1}
						onClick={() => setOverflowOpen((o) => !o)}
					>
						<MoreHorizontal size={16} />
					</button>
				)}
			</div>

			{/* Overflow dropdown - portal-mounted via DSDropdown */}
			{hasOverflow && (
				<DSDropdown
					anchorRef={moreBtnRef}
					open={overflowOpen}
					onOpenChange={setOverflowOpen}
					activeIndex={overflowActiveIndex}
					onActiveIndexChange={setOverflowActiveIndex}
					itemCount={hiddenTabs.length}
					onSelect={(i) => {
						const hiddenTab = hiddenTabs[i];
						if (hiddenTab && !hiddenTab.disabled) {
							onChange(hiddenTab.id);
							setOverflowOpen(false);
						}
					}}
					typeAheadGetText={(i) => hiddenTabs[i]?.label ?? ""}
					matchAnchorWidth={false}
				>
					<ul role="menu" className="ds-atom-tabs-overflow-menu">
						{hiddenTabs.map((t, i) => (
							// biome-ignore lint/a11y/useFocusableInteractive: the WAI-ARIA menu pattern delegates focus to the child <button>; the menuitem wrapper div is intentionally not focusable - keyboard activation goes through the button
							// biome-ignore lint/a11y/useSemanticElements: div[role=menuitem] inside ul[role=menu] is the canonical pattern when a focusable child (<button>) exists inside the menuitem
							<div
								key={t.id}
								role="menuitem"
								data-active={overflowActiveIndex === i || undefined}
								className="ds-atom-tabs-overflow-item"
							>
								<button
									type="button"
									disabled={t.disabled}
									onClick={() => {
										onChange(t.id);
										setOverflowOpen(false);
									}}
								>
									<span>{t.label}</span>
									{typeof t.count === "number" && (
										<span className="ds-atom-tabs-count">{t.count}</span>
									)}
								</button>
							</div>
						))}
					</ul>
				</DSDropdown>
			)}

			{/* Tab panels.

			    Every panel renders its CHILDREN, not only the active one (F-15-6).
			    Before this, the inactive `<div role="tabpanel" hidden>` elements were
			    present and EMPTY — the element without the content — so in
			    server-rendered HTML no tab panel but the first existed at all, and a
			    crawler or a reader without JavaScript saw an empty box behind every
			    tab after the first. The comment here used to claim they were "all kept
			    mounted", which is what the conditional below made untrue.

			    Rendering and EXPOSING are different things, and only the second is
			    conditional. `hidden` removes the inactive panels from the accessibility
			    tree AND from the tab order, which is what the WAI-ARIA tabs pattern
			    requires; visibility/opacity would do neither. Exactly one panel is
			    exposed at a time.

			    The cost, accepted deliberately: every panel's subtree now mounts on
			    load, so a heavy component behind tab 3 pays its mount cost immediately.
			    That is the price of a crawlable panel and it is what the finding asks
			    for. No lazy/eager prop was added — that would be a new API decision no
			    finding asked for. */}
			{tabs.map((t) => {
				const isActive = t.id === value;
				return (
					<div
						key={t.id}
						role="tabpanel"
						id={panelId(t.id)}
						aria-labelledby={tabId(t.id)}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabpanel requires tabIndex=0 so keyboard users can Tab into panel content (w3.org/WAI/ARIA/apg/patterns/tabs/)
						tabIndex={0}
						hidden={!isActive}
						className="ds-atom-tabs-panel"
					>
						{t.content}
					</div>
				);
			})}
		</div>
	);
});
