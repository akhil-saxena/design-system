/**
 * # Usage Audit — Tabs (DS-62)
 *
 * Consumers (post v0.6):
 * - Settings sections, profile detail panels, dashboard switching
 *
 * API:
 * - tabs: TabItem[] — { id, label, count?, disabled?, content }
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
import { DSDropdown } from "./_internals/DSDropdown";
import { MoreHorizontal } from "./icons";

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

	// Overflow state
	const [visibleCount, setVisibleCount] = useState(tabs.length);
	const [overflowOpen, setOverflowOpen] = useState(false);
	const [overflowActiveIndex, setOverflowActiveIndex] = useState(0);

	// ResizeObserver — compute how many tabs fit in the available width.
	//
	// Key: we observe the ROOT element (stable container width), NOT the
	// tablist itself. The tablist shrinks when fewer tabs render, which
	// would cause a ResizeObserver feedback loop if observed directly.
	//
	// Two-pass algorithm prevents the "More appears → layout shifts →
	// More disappears" oscillation:
	//   Pass 1 — does every tab fit with no More button?
	//   Pass 2 — if not, reserve MORE_WIDTH before measuring.
	useLayoutEffect(() => {
		if (!rootRef.current || !tablistRef.current) return;
		const root = rootRef.current;
		const tablist = tablistRef.current;
		const MORE_WIDTH = 44;

		const measure = () => {
			const containerWidth = root.clientWidth;
			// Query ALL tab buttons — even hidden ones — by querying original tabs
			// count. We always render all tabs initially then hide via visibleCount.
			// Use stored widths by measuring while all are in DOM on first pass.
			const tabButtons = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[role='tab']"));

			// Total width of all currently-visible tab buttons (may be a subset)
			// Add an estimated width for hidden tabs using average of visible ones.
			const visibleTotal = tabButtons.reduce((s, b) => s + b.offsetWidth, 0);
			const avgWidth = tabButtons.length > 0 ? visibleTotal / tabButtons.length : 0;
			const estimatedTotal = visibleTotal + avgWidth * (tabs.length - tabButtons.length);

			// Pass 1: all tabs fit?
			if (estimatedTotal <= containerWidth) {
				setVisibleCount(tabs.length);
				return;
			}

			// Pass 2: overflow — fit as many as possible within available width
			const available = containerWidth - MORE_WIDTH;
			let cumulative = 0;
			let nextVisible = 0;
			for (const btn of tabButtons) {
				if (cumulative + btn.offsetWidth > available) break;
				cumulative += btn.offsetWidth;
				nextVisible += 1;
			}
			setVisibleCount(nextVisible);
		};

		const ro = new ResizeObserver(measure);
		ro.observe(root);
		return () => ro.disconnect();
	}, [tabs.length]);

	// ID helpers
	const tabId = (id: string) => `${baseId}-tab-${id}`;
	const panelId = (id: string) => `${baseId}-panel-${id}`;

	// Determine enabled (non-disabled) tab indices in the VISIBLE slice
	const activeIndex = tabs.findIndex((t) => t.id === value);

	const moveFocus = useCallback(
		(delta: 1 | -1 | "home" | "end", activate: boolean) => {
			const visibleTabs = tabs.slice(0, visibleCount);
			const enabled = visibleTabs
				.map((t, i) => (t.disabled ? -1 : i))
				.filter((i): i is number => i !== -1);
			if (enabled.length === 0) return;
			const curInEnabled = enabled.indexOf(activeIndex);
			let nextInEnabled: number;
			if (delta === "home") nextInEnabled = 0;
			else if (delta === "end") nextInEnabled = enabled.length - 1;
			else if (curInEnabled === -1) nextInEnabled = 0;
			else nextInEnabled = (curInEnabled + delta + enabled.length) % enabled.length;
			const nextTabIndex = enabled[nextInEnabled]!;
			const nextTab = tabs[nextTabIndex]!;
			// Move DOM focus
			const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
			buttons?.[nextTabIndex]?.focus();
			if (activate) onChange(nextTab.id);
		},
		[activeIndex, tabs, visibleCount, onChange],
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

	const hasOverflow = visibleCount < tabs.length;
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
			{/* Tablist */}
			<div
				ref={tablistRef}
				role="tablist"
				aria-orientation="horizontal"
				aria-label={ariaLabel}
				className="ds-atom-tabs-list"
				onKeyDown={onKeyDown}
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
							{typeof t.count === "number" && <span className="ds-atom-tabs-count">{t.count}</span>}
						</button>
					);
				})}

				{/* More button — part of the tablist keyboard cycle */}
				{hasOverflow && (
					<button
						ref={moreBtnRef}
						type="button"
						className="ds-atom-tabs-more"
						aria-label={`More tabs (${hiddenTabs.length} hidden)`}
						aria-expanded={overflowOpen}
						aria-haspopup="menu"
						onClick={() => setOverflowOpen((o) => !o)}
					>
						<MoreHorizontal size={16} />
					</button>
				)}
			</div>

			{/* Overflow dropdown — portal-mounted via DSDropdown */}
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
							// biome-ignore lint/a11y/useFocusableInteractive: the WAI-ARIA menu pattern delegates focus to the child <button>; the menuitem wrapper div is intentionally not focusable — keyboard activation goes through the button
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

			{/* Tab panels — all kept mounted; hidden attribute controls visibility */}
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
						{isActive ? t.content : null}
					</div>
				);
			})}
		</div>
	);
});
