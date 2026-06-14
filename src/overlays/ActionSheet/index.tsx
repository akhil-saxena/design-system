"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export interface ActionSheetItem {
	label: string;
	/** `"destructive"` renders the label in `--red`. */
	variant?: "default" | "destructive";
	onSelect: () => void;
}

export interface ActionSheetProps {
	open: boolean;
	onClose: () => void;
	items: ActionSheetItem[];
	/** Dismiss-without-picking label. Default "Close". Backdrop tap + Esc also dismiss. */
	cancelLabel?: string;
	/** Accessible name for the `role="menu"` list.
	 * @default "Actions"
	 */
	"aria-label"?: string;
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
	"aria-label": ariaLabel = "Actions",
}: ActionSheetProps) {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);
	// Callback-ref tracked as state so useFocusTrap re-runs once the portaled
	// menu node commits (same pattern Modal uses for its panel).
	const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);

	useEffect(() => setMounted(true), []);

	// Move focus into the sheet on open and trap Tab inside it; on close the
	// trap's cleanup restores focus to the element that opened the sheet (the
	// trigger). Driven by `open` (not `visible`) so focus is restored before the
	// 260ms exit unmounts the node.
	useFocusTrap(menuEl, open);

	// Hold the node for a 260ms exit before unmounting.
	useEffect(() => {
		if (open) {
			setVisible(true);
			return;
		}
		const t = setTimeout(() => setVisible(false), 260);
		return () => clearTimeout(t);
	}, [open]);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);

	if (!mounted || !visible) return null;

	const fade: CSSProperties = {
		opacity: open ? 1 : 0,
		transition: open ? undefined : "opacity 260ms ease-in",
	};

	return createPortal(
		<>
			<style>{KEYFRAMES}</style>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is aria-hidden; Esc + the Cancel button provide keyboard dismissal */}
			<div
				aria-hidden="true"
				className="ds-actionsheet-backdrop"
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(0,0,0,0.18)",
					zIndex: 60,
					animation: open ? "ds-actionsheet-backdrop 240ms ease-out both" : undefined,
					...fade,
				}}
			/>
			<div
				ref={setMenuEl}
				style={{
					position: "fixed",
					left: 8,
					right: 8,
					bottom: "calc(8px + env(safe-area-inset-bottom))",
					zIndex: 61,
					display: "flex",
					flexDirection: "column",
					gap: 8,
				}}
			>
				<div
					role="menu"
					aria-label={ariaLabel}
					tabIndex={-1}
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
							key={item.label}
							type="button"
							role="menuitem"
							onClick={() => {
								item.onSelect();
								onClose();
							}}
							style={{
								...itemBase,
								borderBottom: idx < items.length - 1 ? "1px solid var(--rule)" : "none",
								color: item.variant === "destructive" ? "var(--red)" : "var(--ink)",
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
		</>,
		document.body,
	);
}
