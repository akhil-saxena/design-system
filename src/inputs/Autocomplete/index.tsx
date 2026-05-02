import { type CSSProperties, type ReactNode, useId, useRef, useState } from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { Clock } from "../../icons";
export interface AutocompleteProps<T> {
	/** Controlled text value of the input field. */
	value: string;
	/** Called on every keystroke with the new input string. */
	onValueChange: (q: string) => void;
	/** Consumer-filtered list of items to show; Autocomplete never filters internally. */
	items: T[];
	/** Optional array of recently-used items shown when the input is empty and focused. */
	recentItems?: T[];
	/** Called when the user selects an item from the dropdown. */
	onSelect: (item: T) => void;
	/** When provided, shows a "+ Add …" button when `items` is empty; called with the current query. */
	onCreate?: (query: string) => void;
	/** Extracts a display string from an item for rendering and type-ahead. */
	getItemLabel: (item: T) => string;
	/** Extracts a unique React key string from an item. */
	getItemKey: (item: T) => string;
	/** Custom render function for each option row; receives the item and whether it is keyboard-active. */
	renderItem?: (item: T, isActive: boolean) => ReactNode;
	/** Placeholder text shown in the empty input.
	 * @default "Search…"
	 */
	placeholder?: string;
	/** Additional className applied to the underlying `<input>` element. */
	className?: string;
	/** Inline styles applied to the underlying `<input>` element. */
	style?: CSSProperties;
}

/**
 * Generic combobox primitive (DS-52, D-521). Consumer-filtered items +
 * optional recents + optional create-as-new. Composes DSDropdown helper.
 *
 * Filtering is consumer-controlled: caller filters `items` prop before
 * passing — Autocomplete never filters internally. Recents are also
 * consumer-provided (no internal localStorage) per D-521.
 *
 * Behavior:
 * - Empty input + focus + non-empty `recentItems` → dropdown shows
 *   `RECENT` header + recent items prefixed with a Clock icon.
 * - Empty input + empty/absent `recentItems` → dropdown stays closed.
 * - Non-empty input + items=[] + `onCreate` provided → dropdown shows
 *   a single `+ Add "{query}" as new` button outside the listbox
 *   (plain `<button>`, NOT `role=option` — listbox semantic preserved).
 * - Non-empty input + items=[] + no `onCreate` → "No results" empty state.
 *
 * ARIA per D-501: native `<input>` trigger with `role="combobox"`,
 * `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`.
 * Listbox uses `<ul role="listbox">` + `<li role="option">` items.
 */
export function Autocomplete<T>({
	value,
	onValueChange,
	items,
	recentItems,
	onSelect,
	onCreate,
	getItemLabel,
	getItemKey,
	renderItem,
	placeholder = "Search…",
	className,
	style,
}: AutocompleteProps<T>) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const listId = useId();
	const optionIdBase = useId();
	const optionId = (i: number) => `${optionIdBase}-${i}`;

	const queryEmpty = value.trim() === "";
	const hasRecents = (recentItems?.length ?? 0) > 0;
	const showRecents = open && queryEmpty && hasRecents;
	const displayed = showRecents ? (recentItems as T[]) : items;
	const showCreate = open && !queryEmpty && items.length === 0 && !!onCreate;
	const showNoResults = open && !queryEmpty && items.length === 0 && !onCreate;

	const itemCount = showCreate ? 0 : displayed.length;

	function handleFocus() {
		if (queryEmpty && hasRecents) setOpen(true);
		else if (!queryEmpty) setOpen(true);
	}

	function handleSelect(idx: number) {
		const it = displayed[idx];
		if (it) {
			onSelect(it);
			setOpen(false);
		}
	}

	function handleCreate() {
		if (onCreate) {
			onCreate(value);
			setOpen(false);
		}
	}

	const renderOption = (it: T, i: number) => (
		// biome-ignore lint/a11y/useFocusableInteractive: combobox listbox option is non-tabbable; aria-activedescendant on the input drives active-option focus per D-501
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation centralized at document level in DSDropdown (ArrowUp/Down/Enter/Escape); onClick is the mouse equivalent
		<li
			key={getItemKey(it)}
			id={optionId(i)}
			// biome-ignore lint/a11y/useFocusableInteractive: combobox listbox option is non-tabbable; aria-activedescendant on the input drives active-option focus per D-501
			// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: D-501 mandates <li role="option"> inside listbox
			// biome-ignore lint/a11y/useSemanticElements: native <option> only valid inside <select>; combobox spec requires <li role="option"> per D-501
			role="option"
			aria-selected={i === activeIndex}
			className={`ds-atom-autocomplete-option${i === activeIndex ? " is-active" : ""}`}
			onMouseEnter={() => setActiveIndex(i)}
			onClick={() => handleSelect(i)}
		>
			{showRecents ? (
				<Clock size={13} aria-hidden="true" className="ds-atom-autocomplete-clock" />
			) : null}
			{renderItem ? renderItem(it, i === activeIndex) : <span>{getItemLabel(it)}</span>}
		</li>
	);

	const listbox = (
		// biome-ignore lint/a11y/useFocusableInteractive: combobox listbox is not focusable; aria-activedescendant on the input drives active-option focus per D-501
		<ul
			id={listId}
			className="ds-atom-autocomplete-list"
			// biome-ignore lint/a11y/useFocusableInteractive: combobox listbox is not focusable; aria-activedescendant on the input drives active-option focus per D-501
			// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: D-501 mandates <ul role="listbox"> for combobox semantic
			// biome-ignore lint/a11y/useSemanticElements: native <select> can't host combobox/listbox composition; ARIA listbox is the spec'd path per D-501
			role="listbox"
		>
			{displayed.map((it, i) => renderOption(it, i))}
		</ul>
	);

	return (
		<>
			<input
				ref={inputRef}
				type="text"
				className={`ds-atom-autocomplete${className ? ` ${className}` : ""}`}
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls={listId}
				aria-activedescendant={open && itemCount > 0 ? optionId(activeIndex) : undefined}
				placeholder={placeholder}
				value={value}
				onChange={(e) => {
					onValueChange(e.target.value);
					setOpen(true);
					setActiveIndex(0);
				}}
				onFocus={handleFocus}
				style={style}
			/>
			<DSDropdown
				anchorRef={inputRef}
				open={open}
				onOpenChange={setOpen}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				itemCount={itemCount}
				onSelect={handleSelect}
				typeAheadGetText={(i) => (displayed[i] ? getItemLabel(displayed[i]) : "")}
			>
				{showRecents ? <div className="ds-atom-autocomplete-section-header">RECENT</div> : null}
				{showCreate ? (
					<button type="button" className="ds-atom-autocomplete-create" onClick={handleCreate}>
						+ Add "{value}" as new
					</button>
				) : showNoResults ? (
					<div className="ds-atom-autocomplete-empty">No results</div>
				) : (
					listbox
				)}
			</DSDropdown>
		</>
	);
}
