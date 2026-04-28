import { Check, ChevronDown } from "lucide-react";
import {
	type CSSProperties,
	type MutableRefObject,
	forwardRef,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { DSDropdown } from "./_internals/DSDropdown";

export interface SelectOption {
	value: string;
	label: string;
	dotColor?: string;
}

export interface SelectProps {
	value: string | null;
	onChange: (v: string) => void;
	options: SelectOption[];
	placeholder?: string;
	searchable?: boolean;
	disabled?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Single-select dropdown (DS-50). Composes the internal DSDropdown helper
 * for portal/positioning/keyboard while wiring the listbox a11y per D-501:
 * trigger gets role="combobox" + aria-expanded + aria-haspopup="listbox" +
 * aria-controls + aria-activedescendant; panel renders <ul role="listbox">
 * with <li role="option" aria-selected> items.
 *
 * Searchable by default — when `searchable` and the option list >5 (or any),
 * a header search input filters by case-insensitive label substring; an
 * empty filtered result shows a "No results" empty state.
 *
 * Each option may carry an optional `dotColor` rendered as an 8×8 round
 * indicator before the label; the currently-selected option also gets a
 * trailing Check icon.
 *
 * Reuses .ds-atom-dropdown panel chrome from 16-01 — only .ds-atom-select
 * styling is added in this plan's primitives.css block.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{
		value,
		onChange,
		options,
		placeholder = "Select…",
		searchable = true,
		disabled = false,
		className,
		style,
	},
	ref,
) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [query, setQuery] = useState("");
	const listId = useId();
	const optionIdBase = useId();
	const optionId = (i: number) => `${optionIdBase}-${i}`;

	const filtered = useMemo(() => {
		if (!searchable || query.trim() === "") return options;
		const q = query.trim().toLowerCase();
		return options.filter((o) => o.label.toLowerCase().includes(q));
	}, [options, searchable, query]);

	const selected = options.find((o) => o.value === value);

	function combineRefs(node: HTMLButtonElement | null) {
		triggerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
	}

	function handleSelect(idx: number) {
		const opt = filtered[idx];
		if (!opt) return;
		onChange(opt.value);
		setOpen(false);
		setQuery("");
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) setQuery("");
	}

	return (
		<>
			<button
				ref={combineRefs}
				type="button"
				className={`ds-atom-select${className ? ` ${className}` : ""}`}
				// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="combobox" on the <button> trigger so screen readers announce the listbox-popup pattern; native <select> doesn't support our custom panel rendering
				role="combobox"
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={listId}
				aria-activedescendant={open && filtered.length > 0 ? optionId(activeIndex) : undefined}
				disabled={disabled}
				data-state={open ? "open" : "closed"}
				onClick={() => !disabled && setOpen((o) => !o)}
				style={style}
			>
				<span className="ds-atom-select-value">
					{selected ? (
						<>
							{selected.dotColor ? (
								<span
									className="ds-atom-select-dot"
									style={{ background: selected.dotColor }}
									aria-hidden="true"
								/>
							) : null}
							{selected.label}
						</>
					) : (
						<span className="ds-atom-select-placeholder">{placeholder}</span>
					)}
				</span>
				<ChevronDown
					size={14}
					className={`ds-atom-select-chevron${open ? " is-open" : ""}`}
					aria-hidden="true"
				/>
			</button>
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
				{searchable ? (
					<div className="ds-atom-select-search">
						<input
							type="text"
							value={query}
							placeholder="Search…"
							onChange={(e) => {
								setQuery(e.target.value);
								setActiveIndex(0);
							}}
							// biome-ignore lint/a11y/noAutofocus: focus moves to the search input on dropdown open per WAI-ARIA combobox pattern; without it, keyboard users would have to tab into the dropdown after opening
							autoFocus
							aria-label="Search options"
						/>
					</div>
				) : null}
				{filtered.length === 0 ? (
					<div className="ds-atom-select-empty">No results</div>
				) : (
					// biome-ignore lint/a11y/useSemanticElements: D-501 mandates <ul role="listbox"> for the combobox panel — keyboard navigation handled via aria-activedescendant on the trigger, so the list itself is not focusable (matches WAI-ARIA combobox pattern)
					// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: listbox role on a <ul> is the canonical combobox-popup pattern (react-aria, Radix Select)
					// biome-ignore lint/a11y/useFocusableInteractive: listbox is not focusable — the combobox trigger owns focus and uses aria-activedescendant to point at the active option (WAI-ARIA combobox 1.2)
					<ul role="listbox" id={listId} className="ds-atom-select-list">
						{filtered.map((opt, i) => (
							// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="option" per WAI-ARIA combobox; <li> is the canonical container inside <ul role="listbox">
							// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: option role on <li> is the WAI-ARIA combobox pattern; activation happens via Enter on the combobox (forwarded to onSelect) — onClick is a mouse-equivalent affordance
							// biome-ignore lint/a11y/useFocusableInteractive: option is reached via aria-activedescendant from the focused combobox; per WAI-ARIA pattern individual options must NOT be in the tab order
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation lives on the combobox (Enter→onSelect via DSDropdown), not on each option — the option's onClick is a redundant mouse-only affordance
							<li
								key={opt.value}
								id={optionId(i)}
								// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="option" per WAI-ARIA combobox; <li> is the canonical container inside <ul role="listbox">
								// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: option role on <li> is the canonical combobox-popup pattern (react-aria, Radix Select)
								role="option"
								aria-selected={opt.value === value}
								className={`ds-atom-select-option${i === activeIndex ? " is-active" : ""}${
									opt.value === value ? " is-selected" : ""
								}`}
								onMouseEnter={() => setActiveIndex(i)}
								onClick={() => handleSelect(i)}
							>
								{opt.dotColor ? (
									<span
										className="ds-atom-select-dot"
										style={{ background: opt.dotColor }}
										aria-hidden="true"
									/>
								) : null}
								<span className="ds-atom-select-option-label">{opt.label}</span>
								{opt.value === value ? (
									<Check size={14} className="ds-atom-select-check" aria-hidden="true" />
								) : null}
							</li>
						))}
					</ul>
				)}
			</DSDropdown>
		</>
	);
});
