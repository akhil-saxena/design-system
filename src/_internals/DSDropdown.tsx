import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { DSPortal } from "./DSPortal";

export type DSDropdownPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface DSDropdownProps {
	anchorRef: RefObject<HTMLElement | null>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	activeIndex: number;
	onActiveIndexChange: (idx: number) => void;
	itemCount: number;
	onSelect: (idx: number) => void;
	placement?: DSDropdownPlacement;
	matchAnchorWidth?: boolean;
	maxHeight?: number;
	typeAheadGetText?: (idx: number) => string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

/**
 * Internal dropdown infrastructure (D-500). Owns:
 * - DSPortal mount to document.body
 * - Anchor-rect positioning (callback-ref-as-state per Popover.tsx line 73)
 * - Outside-click via useClickOutside(panelRef, onClose, open) — 3-arg form
 * - Keyboard model: ArrowUp/Down/Home/End/Enter/Escape on document while open
 * - Type-ahead buffer (single-char rolling, 500ms reset) when typeAheadGetText provided
 *
 * Does NOT inject ARIA attributes — consumer wires role="listbox"/option per D-501.
 *
 * NOT exported from the barrel. Consumers (Select, MultiSelect, Autocomplete)
 * import directly from this path.
 */
export function DSDropdown({
	anchorRef,
	open,
	onOpenChange,
	activeIndex,
	onActiveIndexChange,
	itemCount,
	onSelect,
	placement = "bottom-start",
	matchAnchorWidth = true,
	maxHeight = 280,
	typeAheadGetText,
	children,
	className,
	style,
}: DSDropdownProps) {
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const setPanelRef = (node: HTMLDivElement | null) => {
		panelRef.current = node;
		setPanel(node);
	};
	const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

	// Position computation — gated on `panel` so it re-runs after DSPortal mounts.
	useLayoutEffect(() => {
		if (!open) {
			setPos(null);
			return;
		}
		const anchor = anchorRef.current;
		if (!anchor || !panel) return;
		const a = anchor.getBoundingClientRect();
		const p = panel.getBoundingClientRect();
		const offset = 4;
		let top = 0;
		let left = 0;
		switch (placement) {
			case "bottom-start":
				top = a.bottom + offset;
				left = a.left;
				break;
			case "bottom-end":
				top = a.bottom + offset;
				left = a.right - p.width;
				break;
			case "top-start":
				top = a.top - p.height - offset;
				left = a.left;
				break;
			case "top-end":
				top = a.top - p.height - offset;
				left = a.right - p.width;
				break;
		}
		setPos({ top, left, width: matchAnchorWidth ? a.width : undefined });
	}, [open, anchorRef, placement, matchAnchorWidth, panel]);

	// Outside-click — close (Popover.tsx line 95 pattern).
	useClickOutside(panelRef, () => onOpenChange(false), open);

	// Keyboard model — listener installed only while open.
	const typeAheadBufferRef = useRef<string>("");
	const typeAheadTimerRef = useRef<number | null>(null);
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onOpenChange(false);
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				onActiveIndexChange((activeIndex + 1) % Math.max(itemCount, 1));
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				onActiveIndexChange((activeIndex - 1 + itemCount) % Math.max(itemCount, 1));
				return;
			}
			if (e.key === "Home") {
				e.preventDefault();
				onActiveIndexChange(0);
				return;
			}
			if (e.key === "End") {
				e.preventDefault();
				onActiveIndexChange(Math.max(itemCount - 1, 0));
				return;
			}
			if (e.key === "Enter") {
				e.preventDefault();
				if (activeIndex >= 0 && activeIndex < itemCount) onSelect(activeIndex);
				return;
			}
			// Type-ahead: single-char rolling buffer with 500ms reset
			if (typeAheadGetText && e.key.length === 1 && /\S/.test(e.key)) {
				typeAheadBufferRef.current += e.key.toLowerCase();
				if (typeAheadTimerRef.current !== null) {
					window.clearTimeout(typeAheadTimerRef.current);
				}
				typeAheadTimerRef.current = window.setTimeout(() => {
					typeAheadBufferRef.current = "";
				}, 500);
				const buf = typeAheadBufferRef.current;
				for (let i = 0; i < itemCount; i++) {
					const text = typeAheadGetText(i).toLowerCase();
					if (text.startsWith(buf)) {
						onActiveIndexChange(i);
						break;
					}
				}
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, activeIndex, itemCount, onActiveIndexChange, onOpenChange, onSelect, typeAheadGetText]);

	if (!open) return null;

	return (
		<DSPortal>
			<div
				ref={setPanelRef}
				className={`ds-atom-dropdown${className ? ` ${className}` : ""}`}
				data-placement={placement}
				style={{
					position: "fixed",
					top: pos?.top ?? -9999,
					left: pos?.left ?? -9999,
					width: pos?.width,
					maxHeight,
					overflowY: "auto",
					visibility: pos ? "visible" : "hidden",
					zIndex: 1100,
					...style,
				}}
			>
				{children}
			</div>
		</DSPortal>
	);
}
