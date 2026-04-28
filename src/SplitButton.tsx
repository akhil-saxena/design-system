import { ChevronDown } from "lucide-react";
import { type ReactNode, forwardRef, useRef, useState } from "react";
import { Popover } from "./Popover";

export interface SplitButtonAction {
	label: string;
	icon?: ReactNode;
	onClick: () => void;
}

export interface SplitButtonProps {
	actions: [SplitButtonAction, ...SplitButtonAction[]];
	variant?: "primary" | "secondary";
	size?: "sm" | "md" | "lg";
	className?: string;
}

/**
 * Split-action button (DS-56, D-530). Primary face + chevron-divider button
 * exposing a Popover menu of alternative actions. Selecting an alternative
 * makes it the primary face for this instance — re-mount resets to actions[0]
 * (in-instance state only; persistence deferred to v2.1).
 *
 * Composes Popover (Wave 3) — NOT DSDropdown — because SplitButton's menu is
 * a 2–5 item action menu, not a listbox semantic.
 */
export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
	{ actions, variant = "primary", size = "md", className },
	ref,
) {
	const [currentIdx, setCurrentIdx] = useState<number>(0);
	const [open, setOpen] = useState(false);
	const chevronRef = useRef<HTMLButtonElement | null>(null);
	const current = actions[currentIdx] ?? actions[0];

	function handlePrimary() {
		current.onClick();
	}

	function handleSelect(i: number) {
		const next = actions[i];
		if (!next) return;
		setCurrentIdx(i);
		setOpen(false);
		next.onClick();
	}

	return (
		<div
			ref={ref}
			className={`ds-atom-split${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-size={size}
		>
			<button
				type="button"
				className="ds-atom-split-primary"
				data-part="primary"
				data-variant={variant}
				data-size={size}
				onClick={handlePrimary}
			>
				{current.icon ? <span className="ds-atom-split-icon">{current.icon}</span> : null}
				<span>{current.label}</span>
			</button>
			<button
				type="button"
				ref={chevronRef}
				className="ds-atom-split-chevron"
				data-variant={variant}
				data-size={size}
				aria-label="More actions"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
			>
				<ChevronDown size={14} />
			</button>
			<Popover anchorRef={chevronRef} open={open} onOpenChange={setOpen} placement="bottom-end">
				<div role="menu" className="ds-atom-split-menu">
					{actions.map((a, i) => (
						<button
							key={a.label}
							type="button"
							role="menuitem"
							className={`ds-atom-split-menuitem${i === currentIdx ? " is-current" : ""}`}
							onClick={() => handleSelect(i)}
						>
							{a.icon ? <span className="ds-atom-split-icon">{a.icon}</span> : null}
							<span>{a.label}</span>
						</button>
					))}
				</div>
			</Popover>
		</div>
	);
});
