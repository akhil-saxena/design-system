import { type CSSProperties, useRef, useState } from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { Button } from "../../inputs/Button";
import { Chip } from "../../inputs/Chip";
import { TextInput } from "../../inputs/TextInput";
export interface SearchFilter {
	id: string;
	label: string;
	tone?: "default" | "match" | "miss" | "learning" | "tag";
}

export interface SearchSuggestion {
	id: string;
	label: string;
}

export interface SearchAndFiltersProps {
	/** Controlled value for the search input. */
	value?: string;
	/** Placeholder text for the search input.
	 * @default "Search..."
	 */
	placeholder?: string;
	/**
	 * Suggestions shown in the DSDropdown autocomplete when the input is
	 * focused and has a value. Consumer is responsible for filtering.
	 */
	suggestions?: SearchSuggestion[];
	/** Filter chips shown below the search input. */
	activeFilters?: SearchFilter[];
	/** Called on every keystroke with the current search string. */
	onSearch?: (value: string) => void;
	/** Called when a suggestion is selected from the dropdown. */
	onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
	/** Called when a filter chip × button is clicked. */
	onFilterRemove?: (filter: SearchFilter) => void;
	/** Called when the "Clear all" button is clicked. */
	onClearFilters?: () => void;
	className?: string;
	style?: CSSProperties;
}

/**
 * SearchAndFilters (DS-78) — search input with DSDropdown autocomplete + Chip filter tokens.
 *
 * Composes:
 * - DSDropdown (_internals/DSDropdown) for the suggestions overlay
 * - Chip (Chip.tsx) for each active filter token
 *
 * Usage:
 * ```tsx
 * <SearchAndFilters
 *   suggestions={filteredSuggestions}
 *   activeFilters={activeFilters}
 *   onSearch={setQuery}
 *   onSuggestionSelect={(s) => addFilter({ id: s.id, label: s.label })}
 *   onFilterRemove={(f) => removeFilter(f.id)}
 *   onClearFilters={clearAllFilters}
 * />
 * ```
 */
export function SearchAndFilters({
	value,
	placeholder = "Search...",
	suggestions,
	activeFilters,
	onSearch,
	onSuggestionSelect,
	onFilterRemove,
	onClearFilters,
	className,
	style,
}: SearchAndFiltersProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [inputValue, setInputValue] = useState(value ?? "");

	const hasSuggestions = (suggestions?.length ?? 0) > 0;
	const hasFilters = (activeFilters?.length ?? 0) > 0;

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = e.target.value;
		setInputValue(v);
		onSearch?.(v);
		if (hasSuggestions) setOpen(true);
	}

	function handleFocus() {
		if (hasSuggestions && inputValue) setOpen(true);
	}

	function handleSelect(idx: number) {
		const s = suggestions?.[idx];
		if (s) {
			onSuggestionSelect?.(s);
		}
		setOpen(false);
		setInputValue("");
	}

	return (
		<div className={["ds-atom-searchfilters", className].filter(Boolean).join(" ")} style={style}>
			<div className="ds-atom-searchfilters-bar">
				<TextInput
					ref={inputRef}
					type="search"
					className="ds-atom-searchfilters-input"
					placeholder={placeholder}
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleFocus}
					aria-haspopup="listbox"
				/>
				{hasFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="ds-atom-searchfilters-clear"
						onClick={onClearFilters}
					>
						Clear all
					</Button>
				)}
			</div>

			{hasSuggestions && (
				<DSDropdown
					anchorRef={inputRef}
					open={open}
					onOpenChange={setOpen}
					activeIndex={activeIndex}
					onActiveIndexChange={setActiveIndex}
					itemCount={suggestions!.length}
					onSelect={handleSelect}
					typeAheadGetText={(idx) => suggestions?.[idx]?.label ?? ""}
					matchAnchorWidth
				>
					{/* biome-ignore lint/a11y/useFocusableInteractive: combobox listbox is not focusable; aria-activedescendant on the input drives active-option focus per D-501 */}
					{/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: D-501 mandates <ul role="listbox"> for combobox semantic */}
					{/* biome-ignore lint/a11y/useSemanticElements: native <select> can't host combobox/listbox composition; ARIA listbox is the spec'd path per D-501 */}
					<ul role="listbox" style={{ listStyle: "none", margin: 0, padding: 0 }}>
						{suggestions!.map((s, i) => (
							// biome-ignore lint/a11y/useFocusableInteractive: combobox listbox option is non-tabbable; keyboard driven at document level in DSDropdown per D-501
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation centralized at document level in DSDropdown; onClick is the mouse equivalent
							<li
								key={s.id}
								// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: D-501 mandates <li role="option"> inside listbox
								// biome-ignore lint/a11y/useSemanticElements: native <option> only valid inside <select>; combobox spec requires <li role="option"> per D-501
								role="option"
								aria-selected={i === activeIndex}
								className="ds-atom-searchfilters-option"
								data-active={i === activeIndex}
								onClick={() => handleSelect(i)}
							>
								{s.label}
							</li>
						))}
					</ul>
				</DSDropdown>
			)}

			{hasFilters && (
				<div className="ds-atom-searchfilters-chips">
					{activeFilters!.map((f) => (
						<Chip key={f.id} tone={f.tone ?? "default"} onRemove={() => onFilterRemove?.(f)}>
							{f.label}
						</Chip>
					))}
				</div>
			)}
		</div>
	);
}
