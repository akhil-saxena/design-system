import { Check, ChevronDown, X } from "lucide-react";
import { type CSSProperties, forwardRef, useId, useMemo, useRef, useState } from "react";
import { Popover } from "./Popover";
import { DSDropdown } from "./_internals/DSDropdown";

export interface MultiSelectOption {
	value: string;
	label: string;
}

export interface MultiSelectProps {
	value: string[];
	onChange: (vs: string[]) => void;
	options: MultiSelectOption[];
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Multi-select dropdown (DS-51). Chips-in-trigger layout (D-520) with
 * cap-3 + "+N more" Popover expansion. ARIA: combobox + listbox with
 * aria-multiselectable=true per D-501. Composes DSDropdown (16-01) +
 * Popover (Wave 3). Mini-checkbox per option in the dropdown panel.
 */
export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(function MultiSelect(
	{ value, onChange, options, placeholder = "Select…", disabled = false, className, style },
	ref,
) {
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const moreChipRef = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const listId = useId();
	const optionIdBase = useId();
	const optionId = (i: number) => `${optionIdBase}-${i}`;

	const selectedSet = useMemo(() => new Set(value), [value]);
	const selectedOpts = useMemo(
		() => options.filter((o) => selectedSet.has(o.value)),
		[options, selectedSet],
	);
	const visibleChips = selectedOpts.slice(0, 3);
	const hiddenCount = Math.max(selectedOpts.length - 3, 0);

	function combineRefs(node: HTMLButtonElement | null) {
		triggerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
	}

	function toggle(idx: number) {
		const opt = options[idx];
		if (!opt) return;
		if (selectedSet.has(opt.value)) onChange(value.filter((v) => v !== opt.value));
		else onChange([...value, opt.value]);
	}

	function removeChip(v: string, e: React.MouseEvent) {
		e.stopPropagation();
		onChange(value.filter((x) => x !== v));
	}

	return (
		<>
			<button
				ref={combineRefs}
				type="button"
				className={`ds-atom-multiselect${className ? ` ${className}` : ""}`}
				// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="combobox" on the <button> trigger so screen readers announce the listbox-popup pattern; native <select> doesn't support multi-value chip rendering
				role="combobox"
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={listId}
				aria-activedescendant={open ? optionId(activeIndex) : undefined}
				disabled={disabled}
				data-state={open ? "open" : "closed"}
				onClick={() => !disabled && setOpen((o) => !o)}
				style={style}
			>
				<span className="ds-atom-multiselect-chips">
					{selectedOpts.length === 0 ? (
						<span className="ds-atom-multiselect-placeholder">{placeholder}</span>
					) : (
						<>
							{visibleChips.map((o) => (
								<span key={o.value} className="ds-atom-multiselect-chip">
									<span>{o.label}</span>
									<button
										type="button"
										aria-label={`Remove ${o.label}`}
										className="ds-atom-multiselect-chip-x"
										onClick={(e) => removeChip(o.value, e)}
									>
										<X size={12} />
									</button>
								</span>
							))}
							{hiddenCount > 0 ? (
								<button
									ref={moreChipRef}
									type="button"
									className="ds-atom-multiselect-chip ds-atom-multiselect-chip-more"
									onClick={(e) => {
										e.stopPropagation();
										setMoreOpen(true);
									}}
								>
									+{hiddenCount} more
								</button>
							) : null}
						</>
					)}
				</span>
				<ChevronDown
					size={14}
					className={`ds-atom-multiselect-chevron${open ? " is-open" : ""}`}
					aria-hidden="true"
				/>
			</button>

			<Popover anchorRef={moreChipRef} open={moreOpen} onOpenChange={setMoreOpen}>
				<div className="ds-atom-multiselect-more-list">
					{selectedOpts.map((o) => (
						<div key={o.value} className="ds-atom-multiselect-more-item">
							<span>{o.label}</span>
							<button
								type="button"
								aria-label={`Remove ${o.label}`}
								onClick={() => onChange(value.filter((x) => x !== o.value))}
							>
								<X size={12} />
							</button>
						</div>
					))}
				</div>
			</Popover>

			<DSDropdown
				anchorRef={triggerRef}
				open={open}
				onOpenChange={setOpen}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				itemCount={options.length}
				onSelect={toggle}
				typeAheadGetText={(i) => options[i]?.label ?? ""}
			>
				{/* biome-ignore lint/a11y/useFocusableInteractive: listbox is not focusable — the combobox trigger owns focus and uses aria-activedescendant per WAI-ARIA combobox 1.2 */}
				{/* biome-ignore lint/a11y/useSemanticElements: D-501 mandates <ul role="listbox" aria-multiselectable> for the combobox panel — keyboard handled via aria-activedescendant on the trigger */}
				<ul
					// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: listbox role on a <ul> is the canonical combobox-popup pattern (react-aria, Radix MultiSelect)
					role="listbox"
					id={listId}
					aria-multiselectable="true"
					className="ds-atom-multiselect-list"
				>
					{options.map((opt, i) => {
						const sel = selectedSet.has(opt.value);
						return (
							// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="option" per WAI-ARIA combobox; <li> is canonical container inside <ul role="listbox">
							// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: option role on <li> is the WAI-ARIA combobox pattern; activation happens via Enter on the combobox (forwarded to onSelect) — onClick is a mouse-equivalent affordance
							// biome-ignore lint/a11y/useFocusableInteractive: option is reached via aria-activedescendant from the focused combobox; per WAI-ARIA pattern individual options must NOT be in the tab order
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation lives on the combobox (Enter→onSelect via DSDropdown), not on each option — the option's onClick is a redundant mouse-only affordance
							<li
								key={opt.value}
								id={optionId(i)}
								// biome-ignore lint/a11y/useSemanticElements: D-501 mandates role="option" per WAI-ARIA combobox; <li> is canonical container inside <ul role="listbox">
								// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: option role on <li> is the canonical combobox-popup pattern (react-aria, Radix MultiSelect)
								role="option"
								aria-selected={sel}
								className={`ds-atom-multiselect-option${i === activeIndex ? " is-active" : ""}${sel ? " is-selected" : ""}`}
								onMouseEnter={() => setActiveIndex(i)}
								onClick={() => toggle(i)}
							>
								<span
									className={`ds-atom-multiselect-checkbox${sel ? " is-checked" : ""}`}
									aria-hidden="true"
								>
									{sel ? <Check size={11} /> : null}
								</span>
								<span className="ds-atom-multiselect-option-label">{opt.label}</span>
							</li>
						);
					})}
				</ul>
			</DSDropdown>
		</>
	);
});
