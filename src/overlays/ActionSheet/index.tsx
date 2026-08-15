"use client";

import { type CSSProperties, type Ref, useCallback, useEffect, useRef, useState } from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useDismiss } from "../../hooks/useDismiss";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";

export interface ActionSheetItem {
	/** Stable identity. Falls back to `label` when omitted — set it explicitly if
	 * two items can share a label, otherwise React reuses the wrong node. */
	id?: string;
	label: string;
	/** `"destructive"` renders the label in `--red`. */
	variant?: "default" | "destructive";
	/** Renders the item non-interactive and skips it during arrow-key roving. */
	disabled?: boolean;
	onSelect: () => void;
}

export interface ActionSheetProps {
	open: boolean;
	onClose: () => void;
	items: ActionSheetItem[];
	/** Dismiss-without-picking label. Default "Close". Backdrop tap + Esc also dismiss. */
	cancelLabel?: string;
	/**
	 * Accessible name for the `role="menu"` list.
	 *
	 * 26 components in the library spell this prop `ariaLabel` and 3 spelled it
	 * `"aria-label"`; the majority spelling is canonical.
	 *
	 * @default "Actions"
	 */
	ariaLabel?: string;
	/** @deprecated Use `ariaLabel`. */
	"aria-label"?: string;
	/**
	 * Ref to the ActionSheet panel element. The panel is portaled and only exists
	 * while the overlay is open, so this is `null` when it is closed.
	 */
	ref?: Ref<HTMLDivElement>;
}

const KEYFRAMES = `
@keyframes ds-actionsheet-backdrop { from { opacity: 0 } to { opacity: 1 } }
@keyframes ds-actionsheet-enter { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes ds-actionsheet-enter-delayed { 0% { transform: translateY(30px); opacity: 0 } 8.3% { transform: translateY(30px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
	.ds-actionsheet-backdrop, .ds-actionsheet-items, .ds-actionsheet-cancel { animation: none !important }
}
`;

const blockStyle: CSSProperties = {
	borderRadius: "var(--radius-lg)",
	background: "var(--panel)",
	overflow: "hidden",
	boxShadow: "var(--shadow-3)",
};

const itemBase: CSSProperties = {
	display: "block",
	width: "100%",
	minHeight: 56,
	background: "var(--panel)",
	border: "none",
	fontFamily: "var(--font)",
	fontSize: 17,
	textAlign: "center",
	cursor: "pointer",
	padding: "0 16px",
};

/**
 * ActionSheet — an iOS-style bottom-anchored action list: a rounded block of
 * tappable items plus a separate Cancel block. Backdrop tap, the Cancel button,
 * and Esc all dismiss; body scroll locks while open. Pair with `useLongPress`
 * for the touch "long-press → actions" pattern.
 *
 * @example
 * <ActionSheet
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={[
 *     { label: "Edit", onSelect: edit },
 *     { label: "Delete", variant: "destructive", onSelect: remove },
 *   ]}
 * />
 */
export function ActionSheet({
	open,
	onClose,
	items,
	cancelLabel = "Close",
	ariaLabel,
	"aria-label": ariaLabelLegacy,
	ref,
}: ActionSheetProps) {
	const menuLabel = ariaLabel ?? ariaLabelLegacy ?? "Actions";
	const [visible, setVisible] = useState(false);
	// Callback-ref tracked as state so useFocusTrap re-runs once the portaled
	// menu node commits (same pattern Modal uses for its panel).
	const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
	// The panel already carries an internal callback ref (focus trap and
	// positioning need the live node); composing lets a consumer's ref observe
	// the same element without displacing it.
	const composedPanelRef = useComposedRefs<HTMLDivElement>(setMenuEl, ref);
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Move focus into the sheet on open and trap Tab inside it; on close the
	// trap's cleanup restores focus to the element that opened the sheet (the
	// trigger). Driven by `open` (not `visible`) so focus is restored before the
	// 260ms exit unmounts the node.
	useFocusTrap(menuEl, open);
	// Reference-counted: an ActionSheet raised from inside a Modal used to clear
	// `body.overflow` outright on close, unlocking the page under the still-open
	// Modal.
	useScrollLock(open);

	// Hold the node for a 260ms exit before unmounting.
	useEffect(() => {
		if (open) {
			setVisible(true);
			return;
		}
		const t = setTimeout(() => setVisible(false), 260);
		return () => clearTimeout(t);
	}, [open]);

	// Escape closes only the *topmost* layer — see useDismiss. Each overlay
	// previously installed its own document listener, so one press closed every
	// open layer at once.
	useDismiss(open, onClose);

	// `role="menu"` is a promise to screen readers that arrow keys move between
	// items — WAI-ARIA APG treats Up/Down/Home/End as required for the pattern.
	// Without them the role was announcing an interaction model the component
	// did not implement.
	const enabled = items.map((it, i) => ({ it, i })).filter(({ it }) => !it.disabled);
	const onMenuKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
			if (!keys.includes(e.key)) return;
			if (enabled.length === 0) return;
			e.preventDefault();

			const active = document.activeElement;
			const pos = enabled.findIndex(({ i }) => itemRefs.current[i] === active);

			let next: number;
			if (e.key === "Home") next = 0;
			else if (e.key === "End") next = enabled.length - 1;
			else if (e.key === "ArrowDown") next = pos < 0 ? 0 : (pos + 1) % enabled.length;
			else next = pos < 0 ? enabled.length - 1 : (pos - 1 + enabled.length) % enabled.length;

			itemRefs.current[enabled[next]!.i]?.focus();
		},
		[enabled],
	);

	if (!visible) return null;

	const fade: CSSProperties = {
		opacity: open ? 1 : 0,
		transition: open ? undefined : "opacity 260ms ease-in",
	};

	return (
		<DSPortal>
			<style>{KEYFRAMES}</style>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is aria-hidden; Esc + the Cancel button provide keyboard dismissal */}
			<div
				aria-hidden="true"
				className="ds-actionsheet-backdrop"
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					background: "var(--scrim)",
					zIndex: "var(--z-overlay)",
					animation: open ? "ds-actionsheet-backdrop 240ms ease-out both" : undefined,
					...fade,
				}}
			/>
			<div
				ref={composedPanelRef}
				style={{
					position: "fixed",
					left: "var(--space-2)",
					right: "var(--space-2)",
					bottom: "calc(var(--space-2) + env(safe-area-inset-bottom))",
					// Was 61, i.e. below Modal (1000) — an ActionSheet opened from
					// inside a dialog rendered behind it.
					zIndex: "calc(var(--z-overlay) + 1)",
					display: "flex",
					flexDirection: "column",
					gap: "var(--space-2)",
				}}
			>
				<div
					role="menu"
					aria-label={menuLabel}
					tabIndex={-1}
					onKeyDown={onMenuKeyDown}
					className="ds-actionsheet-items"
					style={{
						...blockStyle,
						animation: open
							? "ds-actionsheet-enter 240ms cubic-bezier(0.32,0.72,0,1) both"
							: undefined,
						...fade,
					}}
				>
					{items.map((item, idx) => (
						<button
							key={item.id ?? item.label}
							ref={(el) => {
								itemRefs.current[idx] = el;
							}}
							type="button"
							role="menuitem"
							disabled={item.disabled}
							onClick={() => {
								item.onSelect();
								onClose();
							}}
							style={{
								...itemBase,
								borderBottom: idx < items.length - 1 ? "1px solid var(--rule)" : "none",
								color: item.variant === "destructive" ? "var(--red)" : "var(--ink)",
								...(item.disabled ? { opacity: 0.4, cursor: "not-allowed" } : null),
							}}
						>
							{item.label}
						</button>
					))}
				</div>
				<div
					className="ds-actionsheet-cancel"
					style={{
						...blockStyle,
						animation: open
							? "ds-actionsheet-enter-delayed 240ms cubic-bezier(0.32,0.72,0,1) both"
							: undefined,
						...fade,
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...itemBase, fontWeight: 600, color: "var(--ink)" }}
					>
						{cancelLabel}
					</button>
				</div>
			</div>
		</DSPortal>
	);
}
