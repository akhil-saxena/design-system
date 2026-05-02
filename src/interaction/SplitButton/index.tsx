import { type ReactNode, forwardRef, useRef, useState } from "react";
import { ChevronDown } from "../../icons";
import type { ButtonVariant } from "../../inputs/Button";
import { Popover } from "../../overlays/Popover";
export interface SplitButtonAction {
	/** Display label for this action. */
	label: string;
	/** Optional icon rendered before the label. */
	icon?: ReactNode;
	/** Handler called when this action is selected. */
	onClick: () => void;
	/**
	 * Per-action variant override. Drives the primary face appearance when selected
	 * AND adds a left-border color hint in the menu. Defaults to the SplitButton-level `variant`.
	 */
	variant?: ButtonVariant;
	/**
	 * Semantic tone applied to this menu item. Overrides the variant color in the dropdown only —
	 * does not affect the primary face. Use for signalling intent (e.g. `"danger"` for Delete).
	 * - `"danger"` → red text
	 * - `"warning"` → amber text
	 * - `"success"` → green text
	 */
	tone?: "danger" | "warning" | "success";
}

export interface SplitButtonProps {
	/** Non-empty array of actions; the first element is shown as the primary face on mount. */
	actions: [SplitButtonAction, ...SplitButtonAction[]];
	/** Default visual variant applied to actions that don't set their own `variant`.
	 * @default "primary"
	 */
	variant?: ButtonVariant;
	/** Size token applied to both the primary face and the chevron trigger.
	 * @default "md"
	 */
	size?: "sm" | "md" | "lg";
	/** Additional className applied to the root wrapper element. */
	className?: string;
}

/**
 * Split-action button (DS-56, D-530). Primary face + chevron-divider button
 * exposing a Popover menu of alternative actions. Selecting an alternative
 * makes it the primary face for this instance — re-mount resets to actions[0]
 * (in-instance state only; persistence deferred to v2.1).
 *
 * v0.5.1 patch — full Button variant set (primary | secondary | ghost |
 * danger) on the SplitButton level AND per-action. The currently-selected
 * action's variant drives the primary face's appearance; menu items render
 * with their own variants as visual hints.
 *
 * v0.5.4 — menu item accent only renders for explicit per-action variant
 * overrides; inherited variants show no left-border accent (cleans the
 * default-only case where every item was getting an amber edge via the
 * primary fallback, defeating the differentiation intent).
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

	// Effective variant for the primary face:
	//   1. explicit per-action variant wins
	//   2. tone maps to a variant so the face reflects the selected action's intent:
	//      danger → "danger" (red), warning/success → "secondary" (neutral, not amber CTA)
	//   3. falls back to SplitButton-level variant
	const toneVariantMap: Record<NonNullable<typeof current.tone>, ButtonVariant> = {
		danger: "danger",
		warning: "secondary",
		success: "secondary",
	};
	const toneVariant = current.tone ? toneVariantMap[current.tone] : undefined;
	const primaryVariant: ButtonVariant = current.variant ?? toneVariant ?? variant;

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
			data-variant={primaryVariant}
			data-size={size}
		>
			<button
				type="button"
				className="ds-atom-split-primary"
				data-part="primary"
				data-variant={primaryVariant}
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
				data-variant={primaryVariant}
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
					{actions.map((a, i) => {
						// v0.5.4 — only set data-action-variant when the action has an
						// EXPLICIT per-action override that differs from the SplitButton-
						// level default. Items that inherit (a.variant === undefined) get
						// NO accent — keeps the menu clean when all actions share the same
						// variant. When undefined, React omits the attribute entirely so
						// the [data-action-variant=...] CSS rules don't fire.
						const explicitVariant: ButtonVariant | undefined =
							a.variant && a.variant !== variant ? a.variant : undefined;
						return (
							<button
								key={a.label}
								type="button"
								role="menuitem"
								className={`ds-atom-split-menuitem${i === currentIdx ? " is-current" : ""}`}
								data-action-variant={explicitVariant}
								data-tone={a.tone}
								onClick={() => handleSelect(i)}
							>
								{a.icon ? <span className="ds-atom-split-icon">{a.icon}</span> : null}
								<span>{a.label}</span>
							</button>
						);
					})}
				</div>
			</Popover>
		</div>
	);
});
