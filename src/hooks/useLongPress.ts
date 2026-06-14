import { useRef } from "react";

export interface LongPressHandlers {
	onPointerDown: (e: React.PointerEvent) => void;
	onPointerUp: (e: React.PointerEvent) => void;
	onPointerCancel: (e: React.PointerEvent) => void;
	onPointerLeave: (e: React.PointerEvent) => void;
}

/**
 * Fires `onLongPress` when a pointer is held for `ms` (default 600ms). Mouse
 * users release well under the threshold, so it stays inert on desktop — pair
 * it with a hover-reveal affordance there and a long-press → ActionSheet on
 * touch. Spread the returned handlers onto the target element.
 *
 * @example
 * const lp = useLongPress(() => setSheetOpen(true));
 * return <div {...lp}>…</div>;
 */
export function useLongPress(onLongPress: () => void, ms = 600): LongPressHandlers {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const start = () => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			onLongPress();
		}, ms);
	};
	const cancel = () => {
		if (timer.current) {
			clearTimeout(timer.current);
			timer.current = null;
		}
	};

	return {
		onPointerDown: start,
		onPointerUp: cancel,
		onPointerCancel: cancel,
		onPointerLeave: cancel,
	};
}
