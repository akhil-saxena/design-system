import {
	type CSSProperties,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { smartAnchorPos } from "../../_internals/floatingPos";
import { useClickOutside } from "../../hooks/useClickOutside";
export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export type PopoverVariant = "default" | "contextmenu";

export interface PopoverProps {
	/** Ref to the anchor element; the popover positions itself relative to this element's bounding box. */
	anchorRef: RefObject<HTMLElement | null>;
	/** Controls visibility; the popover returns null when false. */
	open: boolean;
	/** Called when the popover requests to close (Escape key or outside click). */
	onOpenChange: (open: boolean) => void;
	/** Which edge of the anchor the panel appears on.
	 * @default "bottom-start"
	 */
	placement?: PopoverPlacement;
	/** Gap in pixels between the anchor edge and the panel.
	 * @default 4
	 */
	offset?: number;
	/** Visual variant; `"contextmenu"` applies tighter padding and narrower width.
	 * @default "default"
	 */
	variant?: PopoverVariant;
	/** Content rendered inside the popover panel. */
	children: ReactNode;
	/** Additional className applied to the panel element. */
	className?: string;
	/** Inline styles applied to the panel element. */
	style?: CSSProperties;
}

// computePosition replaced by smartAnchorPos from floatingPos — auto-flips + clamps.

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

	// Position computation: auto-flip + viewport clamp via smartAnchorPos.
	// Also closes when the anchor scrolls fully out of the viewport.
	const recompute = useCallback(() => {
		const anchor = anchorRef.current;
		if (!anchor || !panel) return;
		const a = anchor.getBoundingClientRect();
		// Anchor is fully outside the viewport — close.
		if (a.bottom < 0 || a.top > window.innerHeight || a.right < 0 || a.left > window.innerWidth) {
			onOpenChange(false);
			return;
		}
		const p = panel.getBoundingClientRect();
		const side = placement.startsWith("top") ? "top" : "bottom";
		const align = placement.endsWith("end") ? "end" : "start";
		const { top, left } = smartAnchorPos(
			a,
			{ width: p.width, height: p.height },
			side,
			align,
			offset,
		);
		setPos({ top, left });
	}, [anchorRef, panel, placement, offset, onOpenChange]);

	useLayoutEffect(() => {
		if (!open) {
			setPos(null);
			return;
		}
		recompute();
	}, [open, recompute]);

	// Track scroll/resize — recomputes position or closes if anchor left viewport.
	useEffect(() => {
		if (!open) return;
		window.addEventListener("scroll", recompute, true);
		window.addEventListener("resize", recompute);
		return () => {
			window.removeEventListener("scroll", recompute, true);
			window.removeEventListener("resize", recompute);
		};
	}, [open, recompute]);

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

	const isDarkCtx = anchorRef.current?.closest(".dark") != null;

	const popoverEl = (
		<div
			ref={setPanelRef}
			className={["ds-atom-popover", className].filter(Boolean).join(" ")}
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
	);

	return <DSPortal>{isDarkCtx ? <div className="dark">{popoverEl}</div> : popoverEl}</DSPortal>;
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
