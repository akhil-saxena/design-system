import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Kbd } from "../../inputs/Kbd";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CommandPaletteItem {
	/** Stable identity used as the React key. */
	id: string;
	/** Display label; used for case-insensitive substring filtering. */
	label: string;
	/** Group bucket name; items with the same group cluster under a header. */
	group: string;
	/** Optional ReactNode icon (16–18px recommended). */
	icon?: ReactNode;
	/** Optional keyboard shortcut hint, rendered as a Kbd chip. */
	shortcut?: string;
	/** Fires when the item is selected (Enter on active row, or click). */
	onSelect: () => void;
}

export interface CommandPaletteProps {
	/** Controls visibility; component returns null when false. */
	open: boolean;
	/** Called when the user dismisses the palette (Escape, backdrop click, item select). */
	onClose: () => void;
	/** Flat list of items; the component derives groups internally. */
	items: CommandPaletteItem[];
	/** Search input placeholder.
	 * @default "Type a command or search…"
	 */
	placeholder?: string;
	/** Optional override text shown when filter has zero matches. Defaults to `No results for "<query>"`. */
	emptyText?: string;
	/** Optional className appended to the panel. */
	className?: string;
	/** Optional inline style applied to the panel. */
	style?: CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CommandPalette({
	open,
	onClose,
	items,
	placeholder = "Type a command or search…",
	emptyText,
	className,
	style,
}: CommandPaletteProps) {
	// Callback-ref pattern: panel state flips from null to the DOM node when
	// React commits it. Required for portal-mounted nodes — useFocusTrap must
	// receive the node, not a RefObject.
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(-1);

	// Stable ids wiring the combobox/listbox/option ARIA relationships.
	const baseId = useId();
	const listId = `${baseId}-listbox`;
	const optionId = (idx: number) => `${baseId}-option-${idx}`;

	// Live ref to the listbox so we can scrollIntoView the active option.
	const listRef = useRef<HTMLDivElement | null>(null);

	useFocusTrap(panel, open);

	// Body scroll-lock while open (SSR-guarded; restores prior overflow on
	// close/unmount).
	useEffect(() => {
		if (!open || typeof document === "undefined") return;
		const { body } = document;
		const previousOverflow = body.style.overflow;
		body.style.overflow = "hidden";
		return () => {
			body.style.overflow = previousOverflow;
		};
	}, [open]);

	// Filter items by query (case-insensitive substring match on label)
	const filtered = useMemo(() => {
		if (!query.trim()) return items;
		const q = query.toLowerCase();
		return items.filter((i) => i.label.toLowerCase().includes(q));
	}, [items, query]);

	// Reset activeIndex when query changes — prevents stale index pointing past filtered.length
	useEffect(() => {
		setActiveIndex(-1);
	}, [query]);

	// Reset state when palette closes
	useEffect(() => {
		if (!open) {
			setQuery("");
			setActiveIndex(-1);
		}
	}, [open]);

	// Scroll the active option into view whenever it changes (keeps the
	// screen-reader-tracked aria-activedescendant visually in range).
	useEffect(() => {
		if (activeIndex < 0 || !listRef.current) return;
		const el = listRef.current.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`);
		// scrollIntoView is unavailable in some environments (e.g. jsdom) — guard it.
		el?.scrollIntoView?.({ block: "nearest" });
	}, [activeIndex, optionId]);

	// Document-level keyboard handler — only active when open
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				// Stay at -1 (no selection) if user presses ArrowUp before any
				// ArrowDown — clamp at 0 only when there is already a selection.
				setActiveIndex((i) => (i <= 0 ? i : i - 1));
				return;
			}
			if (e.key === "Enter") {
				if (activeIndex >= 0 && activeIndex < filtered.length) {
					e.preventDefault();
					const item = filtered[activeIndex];
					if (item) {
						item.onSelect();
						onClose();
					}
				}
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, filtered, activeIndex, onClose]);

	if (!open) return null;

	function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget) onClose();
	}

	// Group filtered items in original order; each group keeps insertion order
	const groups: { name: string; items: CommandPaletteItem[] }[] = [];
	for (const item of filtered) {
		let g = groups.find((x) => x.name === item.group);
		if (!g) {
			g = { name: item.group, items: [] };
			groups.push(g);
		}
		g.items.push(item);
	}

	// Flat-index counter for keyboard navigation across groups
	let flatIdx = 0;

	return (
		<DSPortal>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
			<div
				className="ds-atom-modal-backdrop"
				style={{ alignItems: "flex-start", paddingTop: "15vh" }}
				onClick={handleBackdropClick}
			>
				<div
					ref={setPanel}
					// biome-ignore lint/a11y/useSemanticElements: role="dialog" + aria-modal is the standard ARIA pattern; native <dialog> conflicts with DSPortal mounting + keyboard navigation
					role="dialog"
					aria-modal="true"
					aria-label="Command palette"
					className={`ds-atom-cmd-panel${className ? ` ${className}` : ""}`}
					style={style}
					tabIndex={-1}
				>
					<div className="ds-atom-cmd-search">
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<input
							// biome-ignore lint/a11y/noAutofocus: command palette is a search-first overlay; focus must land on input when opened
							autoFocus
							className="ds-atom-cmd-input"
							placeholder={placeholder}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							aria-label="Search commands"
							role="combobox"
							aria-expanded={filtered.length > 0}
							aria-controls={listId}
							aria-autocomplete="list"
							aria-activedescendant={
								activeIndex >= 0 && activeIndex < filtered.length
									? optionId(activeIndex)
									: undefined
							}
						/>
						<Kbd size="sm">ESC</Kbd>
					</div>
					{/* biome-ignore lint/a11y/useFocusableInteractive: in the combobox+listbox pattern focus stays on the input via aria-activedescendant; the listbox itself must NOT be focusable */}
					{/* biome-ignore lint/a11y/useSemanticElements: role="listbox" is the ARIA combobox pattern; no native HTML element pairs aria-activedescendant-driven option selection with the existing styled container */}
					<div ref={listRef} id={listId} role="listbox" className="ds-atom-cmd-list">
						{filtered.length === 0 ? (
							<div className="ds-atom-cmd-empty">{emptyText ?? `No results for "${query}"`}</div>
						) : (
							groups.map((g) => (
								// biome-ignore lint/a11y/useSemanticElements: role="group" inside a listbox clusters options under a labelled header per the ARIA listbox pattern; <fieldset> is form-only and cannot live inside role="listbox"
								<div key={g.name} role="group" aria-label={g.name}>
									<div className="ds-atom-cmd-group" aria-hidden="true">
										{g.name}
									</div>
									{g.items.map((item) => {
										const myIndex = flatIdx++;
										const isActive = myIndex === activeIndex;
										return (
											<button
												key={item.id}
												type="button"
												id={optionId(myIndex)}
												// biome-ignore lint/a11y/useSemanticElements: role="option" on a <button> keeps the existing focusable/clickable element while making aria-selected valid for the combobox+listbox pattern
												role="option"
												className="ds-atom-cmd-item"
												data-active={isActive ? "true" : undefined}
												aria-selected={isActive}
												onClick={() => {
													item.onSelect();
													onClose();
												}}
												onMouseEnter={() => setActiveIndex(myIndex)}
											>
												{item.icon ? (
													<span className="ds-atom-cmd-item-icon">{item.icon}</span>
												) : null}
												<span className="ds-atom-cmd-item-label">{item.label}</span>
												{item.shortcut ? (
													<span className="ds-atom-cmd-item-shortcut">
														<Kbd size="sm">{item.shortcut}</Kbd>
													</span>
												) : null}
											</button>
										);
									})}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</DSPortal>
	);
}
