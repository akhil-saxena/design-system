import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "./_internals/DSPortal";
import { useClickOutside } from "./hooks/useClickOutside";

export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export type PopoverVariant = "default" | "contextmenu";

export interface PopoverProps {
	anchorRef: RefObject<HTMLElement | null>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	placement?: PopoverPlacement;
	offset?: number;
	variant?: PopoverVariant;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

function computePosition(
	anchorRect: DOMRect,
	panelRect: DOMRect,
	placement: PopoverPlacement,
	offset: number,
): { top: number; left: number } {
	switch (placement) {
		case "bottom-start":
			return { top: anchorRect.bottom + offset, left: anchorRect.left };
		case "bottom-end":
			return { top: anchorRect.bottom + offset, left: anchorRect.right - panelRect.width };
		case "top-start":
			return { top: anchorRect.top - panelRect.height - offset, left: anchorRect.left };
		case "top-end":
			return {
				top: anchorRect.top - panelRect.height - offset,
				left: anchorRect.right - panelRect.width,
			};
	}
}

/**
 * Anchor-positioned overlay primitive (D-330). DSPortal-mounted to body;
 * positions via `anchorRef.current.getBoundingClientRect()` + placement +
 * offset. Closes on outside click (via `useClickOutside`) and on Escape
 * (document keydown listener installed only while open).
 *
 * 4 fixed placements; auto-flip-on-collision deferred to v2.1.
 */
export function Popover({
	anchorRef,
	open,
	onOpenChange,
	placement = "bottom-start",
	offset = 4,
	variant = "default",
	children,
	className,
	style,
}: PopoverProps) {
	// Callback-ref state: useLayoutEffect must re-run AFTER DSPortal mounts the
	// panel (DSPortal returns null on first render until its useEffect flips
	// mounted=true). With a plain useRef, panelRef.current is null on the first
	// position-calc pass and pos stays at null/(0,0).
	const [panel, setPanel] = useState<HTMLDivElement | null>(null);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const setPanelRef = (node: HTMLDivElement | null) => {
		panelRef.current = node;
		setPanel(node);
	};
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

	// Position computation: read anchor rect on open + after panel mounts.
	useLayoutEffect(() => {
		if (!open) {
			setPos(null);
			return;
		}
		const anchor = anchorRef.current;
		if (!anchor || !panel) return;
		const anchorRect = anchor.getBoundingClientRect();
		const panelRect = panel.getBoundingClientRect();
		setPos(computePosition(anchorRect, panelRect, placement, offset));
	}, [open, anchorRef, placement, offset, panel]);

	// Outside-click dismissal (panelRef only — clicks on anchor handled by consumer).
	useClickOutside(panelRef, () => onOpenChange(false), open);

	// Escape dismissal — listener installed only while open.
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onOpenChange(false);
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onOpenChange]);

	if (!open) return null;

	return (
		<DSPortal>
			<div
				ref={setPanelRef}
				className={`ds-atom-popover${className ? ` ${className}` : ""}`}
				data-placement={placement}
				data-variant={variant === "contextmenu" ? "contextmenu" : undefined}
				// biome-ignore lint/a11y/useSemanticElements: native <dialog> implies modal/inert behavior we don't want for non-modal popovers
				role="dialog"
				style={{
					top: pos?.top ?? -9999,
					left: pos?.left ?? -9999,
					visibility: pos ? "visible" : "hidden",
					...style,
				}}
			>
				{children}
			</div>
		</DSPortal>
	);
}

// ─── ContextMenu — same-file styled variant (D-331) ─────────────────────

export interface ContextMenuItem {
	label: string;
	icon?: ReactNode;
	onSelect: () => void;
	disabled?: boolean;
	variant?: "default" | "danger";
}

export interface ContextMenuProps extends Omit<PopoverProps, "children" | "variant"> {
	items: ContextMenuItem[];
}

/**
 * Curated context-menu variant of Popover (D-331). Same-file export so
 * consumers can import either primitive without an extra path. Renders
 * items as `<button class="ds-atom-popover-item">` rows; danger variant
 * uses `data-tone="danger"`; disabled items short-circuit `onSelect`.
 */
export function ContextMenu({ items, onOpenChange, ...rest }: ContextMenuProps) {
	return (
		<Popover {...rest} variant="contextmenu" onOpenChange={onOpenChange}>
			{items.map((item, idx) => (
				<button
					key={`${item.label}-${idx}`}
					type="button"
					className="ds-atom-popover-item"
					data-tone={item.variant === "danger" ? "danger" : undefined}
					disabled={item.disabled}
					onClick={() => {
						if (item.disabled) return;
						item.onSelect();
						onOpenChange(false);
					}}
				>
					{item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
					{item.label}
				</button>
			))}
		</Popover>
	);
}
