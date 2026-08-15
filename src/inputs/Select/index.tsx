import {
	type CSSProperties,
	type MutableRefObject,
	type ReactNode,
	forwardRef,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { Search } from "../../icons";
import { Check, ChevronDown } from "../../icons";
import { Field, useField } from "../Field";
import { TextInput } from "../TextInput";
export interface SelectOption {
	value: string;
	label: string;
	dotColor?: string;
}

export interface SelectProps {
	/** Controlled selected option value; pass `null` for no selection. */
	value: string | null;
	/** Called with the value string of the option the user selected. */
	onChange: (v: string) => void;
	/** Full list of options rendered in the dropdown. */
	options: SelectOption[];
	/** Placeholder text shown in the trigger when no option is selected.
	 * @default "Select…"
	 */
	placeholder?: string;
	/**
	 * Accessible name for the trigger. **Required in practice**: the trigger
	 * carries `role="combobox"`, and combobox is `nameFrom: author` — the visible
	 * selected value does *not* name it. Without this (or `ariaLabelledBy`) the
	 * control reaches assistive tech unnamed, which axe reports as a critical
	 * `button-name` violation.
	 */
	ariaLabel?: string;
	/** Id of a visible label element, when the form already renders one. */
	ariaLabelledBy?: string;
	/** When true, renders a search input at the top of the dropdown that filters options.
	 * @default true
	 */
	searchable?: boolean;
	/** Visual tone of the trigger surface.
	 * - `"default"` — cream surface with ink text + a thin rule border.
	 * - `"solid"`  — ink fill with cream text, no visible border. Pairs with
	 *   MultiSelect's matching tone for filter-bar consistency.
	 *
	 * @default "default"
	 */
	tone?: "default" | "solid";
	/** Trigger height + padding scale.
	 * - `"md"` (default) — 36px height, standard form-input rhythm.
	 * - `"sm"`           — 28px height, smaller padding + 12px text. Use in
	 *   dense filter rows alongside MultiSelect at the same size.
	 *
	 * @default "md"
	 */
	size?: "sm" | "md";
	/** When true, disables the trigger button and prevents interaction.
	 * @default false
	 */
	disabled?: boolean;
	/** Additional className applied to the trigger button. */
	className?: string;
	/** Inline styles applied to the trigger button. */
	style?: CSSProperties;
	/** Visible label rendered above the control and wired to it. */
	label?: ReactNode;
	/** Helper text under the control, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Applies the error-state ring. Implied by `errorMessage`. */
	error?: boolean;
	/**
	 * Validation message under the control. Wired to `aria-describedby`, carries
	 * `role="alert"` so it is announced when it appears, and sets `aria-invalid`.
	 */
	errorMessage?: ReactNode;
	/**
	 * Show a loading row in place of the options while the list is being fetched.
	 * Async-populated dropdowns previously had only the "No results" empty state
	 * to fall back on, which tells the user their query matched nothing when in
	 * fact nothing has arrived yet.
	 */
	loading?: boolean;
	/** Text shown while `loading`. @default "Loading…" */
	loadingText?: string;
}

/**
 * Single-select dropdown (DS-50). Composes the internal DSDropdown helper
 * for portal/positioning/keyboard while wiring the listbox a11y per D-501:
 * trigger gets role="combobox" + aria-expanded + aria-haspopup="listbox" +
 * aria-controls + aria-activedescendant; panel renders <ul role="listbox">
 * with <li role="option" aria-selected> items.
 *
 * Searchable by default - when `searchable` and the option list >5 (or any),
 * a header search input filters by case-insensitive label substring; an
 * empty filtered result shows a "No results" empty state.
 *
 * Each option may carry an optional `dotColor` rendered as an 8×8 round
 * indicator before the label; the currently-selected option also gets a
 * trailing Check icon.
 *
 * Reuses .ds-atom-dropdown panel chrome from 16-01 - only .ds-atom-select
 * styling is added in this plan's primitives.css block.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{
		value,
		onChange,
		options,
		placeholder = "Select…",
		ariaLabel,
		ariaLabelledBy,
		searchable = true,
		tone = "default",
		size = "md",
		disabled = false,
		className,
		style,
		loading = false,
		loadingText = "Loading…",
		label,
		hint,
		error,
		errorMessage,
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

	// Shared label / hint / error scaffold — see inputs/Field. `errorMessage`
	// implies the error state and sets aria-invalid on the trigger.
	const wiring = useField({ error, errorMessage, hint });

	const content = (
		<>
			<button
				ref={combineRefs}
				type="button"
				className={`ds-atom-select${className ? ` ${className}` : ""}`}
				// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="combobox" on the <button> trigger so screen readers announce the listbox-popup pattern; native <select> doesn't support our custom panel rendering
				role="combobox"
				// Falls back to the placeholder so the trigger is never *unnamed*.
				// "Select…" is a weak name — pass ariaLabel/ariaLabelledBy for a real
				// one — but an approximate name beats none, and it keeps the default
				// configuration free of a critical violation.
				aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? placeholder)}
				aria-labelledby={ariaLabelledBy}
				id={wiring.controlId}
				aria-invalid={wiring.invalid || undefined}
				aria-describedby={wiring.describedBy}
				data-error={wiring.invalid ? "true" : undefined}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={listId}
				aria-activedescendant={open && filtered.length > 0 ? optionId(activeIndex) : undefined}
				disabled={disabled}
				data-state={open ? "open" : "closed"}
				data-tone={tone}
				data-size={size}
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
						<TextInput
							type="text"
							value={query}
							placeholder="Search…"
							onChange={(e) => {
								setQuery(e.target.value);
								setActiveIndex(0);
							}}
							// autoFocus is deliberate: the WAI-ARIA combobox pattern moves focus to
							// the search field when the dropdown opens. (The lint rule no longer
							// fires here because the prop now goes through TextInput.)
							autoFocus
							aria-label="Search options"
							icon={<Search size={14} />}
							data-testid="select-search"
						/>
					</div>
				) : null}
				{loading ? (
					// aria-live alone rather than role="status": the listbox is not
					// focused (activedescendant pattern) so nothing else would announce
					// the change, and role="status" on a <div> is what the semantic-element
					// lint objects to — the live region does the announcing either way.
					<div className="ds-atom-select-empty" aria-live="polite">
						{loadingText}
					</div>
				) : filtered.length === 0 ? (
					<div className="ds-atom-select-empty">No results</div>
				) : (
					// biome-ignore lint/a11y/useSemanticElements: D-501 mandates <ul role="listbox"> for the combobox panel - keyboard navigation handled via aria-activedescendant on the trigger, so the list itself is not focusable (matches WAI-ARIA combobox pattern)
					// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: listbox role on a <ul> is the canonical combobox-popup pattern (react-aria, Radix Select)
					// biome-ignore lint/a11y/useFocusableInteractive: listbox is not focusable - the combobox trigger owns focus and uses aria-activedescendant to point at the active option (WAI-ARIA combobox 1.2)
					<ul role="listbox" id={listId} className="ds-atom-select-list">
						{filtered.map((opt, i) => (
							// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="option" per WAI-ARIA combobox; <li> is the canonical container inside <ul role="listbox">
							// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: option role on <li> is the WAI-ARIA combobox pattern; activation happens via Enter on the combobox (forwarded to onSelect) - onClick is a mouse-equivalent affordance
							// biome-ignore lint/a11y/useFocusableInteractive: option is reached via aria-activedescendant from the focused combobox; per WAI-ARIA pattern individual options must NOT be in the tab order
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation lives on the combobox (Enter→onSelect via DSDropdown), not on each option - the option's onClick is a redundant mouse-only affordance
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

	// Same guard TextInput uses: with no label, hint or message there is nothing
	// for the wrapper to render, and emitting one anyway would insert a div into
	// every existing consumer's layout.
	if (!label && !hint && !errorMessage) return content;

	return (
		<Field label={label} hint={hint} errorMessage={errorMessage} wiring={wiring}>
			{content}
		</Field>
	);
});
