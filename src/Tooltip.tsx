import {
	type CSSProperties,
	Children,
	type HTMLAttributes,
	type ReactElement,
	type FocusEvent as ReactFocusEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	cloneElement,
	isValidElement,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DSPortal } from "./_internals/DSPortal";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
	content: ReactNode;
	placement?: TooltipPlacement;
	delay?: number;
	children: ReactElement;
}

const GAP = 6;

/**
 * Tooltip — overlay micro-primitive (DS-32).
 *
 *   <Tooltip content="Star this application">
 *     <button aria-label="Star">★</button>
 *   </Tooltip>
 *
 * - Wraps EXACTLY ONE child element (React.Children.only — throws on multiple).
 * - Clones the child to attach onMouseEnter / onMouseLeave / onFocus / onBlur +
 *   aria-describedby={tooltipId} (D-311).
 * - Mounts the tooltip surface via DSPortal to document.body.
 * - Position computed from trigger.getBoundingClientRect() per `placement`
 *   (D-312, manual calc — no Floating-UI dep).
 * - Open delay default 150ms (D-311 — handoff 0ms feels twitchy, 700ms feels broken).
 * - Hover and focus both open with the SAME 150ms delay (Path A from the plan
 *   behavior block — keeps timing consistent for assistive-tech and pointer
 *   users; mouseleave + blur close immediately by clearing the timer).
 * - aria-describedby is wired on the trigger when open (assistive-tech surface).
 *
 * v2.0 simplifications (deferred to v2.1):
 * - Consumer ref on trigger is NOT preserved (Tooltip's internal triggerRef
 *   wins). Most leaf-button triggers don't pass refs, so this is acceptable.
 * - No auto-flip on viewport collision — caller is responsible for placing
 *   tooltips with adequate viewport room.
 * - No re-position on scroll/resize while open (most tooltips open + close
 *   within a frame anyway). Re-opens recompute fresh.
 * - No exit animation — surface hard-unmounts on close.
 */
export function Tooltip({ content, placement = "top", delay = 150, children }: TooltipProps) {
	// React.Children.only runs synchronously and THROWS on misuse — this is
	// the tested error path (single-child enforcement, see Tooltip.test.tsx).
	const childAsElement = Children.only(children);
	if (!isValidElement(childAsElement)) {
		throw new Error("Tooltip child must be a valid React element");
	}
	// Cast for prop-merging — we know it's a host element / forwardRef.
	const child = childAsElement as ReactElement<HTMLAttributes<HTMLElement>>;

	const tooltipId = useId();
	const triggerRef = useRef<HTMLElement | null>(null);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const timerRef = useRef<number | null>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const scheduleOpen = useCallback(() => {
		clearTimer();
		timerRef.current = window.setTimeout(() => {
			setIsOpen(true);
			timerRef.current = null;
		}, delay);
	}, [delay, clearTimer]);

	const close = useCallback(() => {
		clearTimer();
		setIsOpen(false);
	}, [clearTimer]);

	// Compose event handlers — consumer's existing handlers run FIRST, then ours.
	const handleMouseEnter = (e: ReactMouseEvent<HTMLElement>) => {
		child.props.onMouseEnter?.(e);
		scheduleOpen();
	};
	const handleMouseLeave = (e: ReactMouseEvent<HTMLElement>) => {
		child.props.onMouseLeave?.(e);
		close();
	};
	const handleFocus = (e: ReactFocusEvent<HTMLElement>) => {
		child.props.onFocus?.(e);
		scheduleOpen();
	};
	const handleBlur = (e: ReactFocusEvent<HTMLElement>) => {
		child.props.onBlur?.(e);
		close();
	};

	// Position calc — read trigger rect after open + on placement change.
	// useLayoutEffect fires synchronously before paint, so the surface never
	// visibly "jumps" from (0,0) to its computed position.
	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current || !surfaceRef.current) return;
		const tRect = triggerRef.current.getBoundingClientRect();
		const sRect = surfaceRef.current.getBoundingClientRect();
		let top = 0;
		let left = 0;
		switch (placement) {
			case "top":
				top = window.scrollY + tRect.top - sRect.height - GAP;
				left = window.scrollX + tRect.left + tRect.width / 2 - sRect.width / 2;
				break;
			case "bottom":
				top = window.scrollY + tRect.bottom + GAP;
				left = window.scrollX + tRect.left + tRect.width / 2 - sRect.width / 2;
				break;
			case "right":
				top = window.scrollY + tRect.top + tRect.height / 2 - sRect.height / 2;
				left = window.scrollX + tRect.right + GAP;
				break;
			case "left":
				top = window.scrollY + tRect.top + tRect.height / 2 - sRect.height / 2;
				left = window.scrollX + tRect.left - sRect.width - GAP;
				break;
		}
		setPos({ top, left });
	}, [isOpen, placement]);

	// Cleanup any pending open-timer on unmount.
	useEffect(() => () => clearTimer(), [clearTimer]);

	const surfaceStyle: CSSProperties = {
		position: "absolute",
		top: pos.top,
		left: pos.left,
		zIndex: 9999,
		pointerEvents: "none",
	};

	const trigger = cloneElement(child, {
		// v2.0 simplification: consumer's ref is NOT preserved (deferred to v2.1
		// via useComposedRefs integration). Most leaf-button triggers don't pass
		// refs, so this is acceptable for the 90% case.
		ref: (node: HTMLElement | null) => {
			triggerRef.current = node;
		},
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		onFocus: handleFocus,
		onBlur: handleBlur,
		// When open, our id wins; when closed, preserve consumer's existing one.
		"aria-describedby": isOpen ? tooltipId : child.props["aria-describedby"],
	} as Partial<HTMLAttributes<HTMLElement>> & { ref: (node: HTMLElement | null) => void });

	return (
		<>
			{trigger}
			{isOpen ? (
				<DSPortal>
					<div
						ref={surfaceRef}
						id={tooltipId}
						role="tooltip"
						className="ds-atom-tooltip"
						data-placement={placement}
						data-state="open"
						style={surfaceStyle}
					>
						{content}
					</div>
				</DSPortal>
			) : null}
		</>
	);
}
