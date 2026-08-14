import { useEffect } from "react";

/**
 * Reference count of currently-active locks.
 *
 * Overlays nest in practice — an ActionSheet opened from inside a Modal, a
 * ConfirmDialog raised from a Sheet. Each previously ran its own
 * `body.style.overflow = "hidden"` effect, and whichever unmounted *first*
 * restored scrolling while the other was still open. Counting locks means the
 * body is only released when the last overlay closes.
 */
let lockCount = 0;
/** Inline styles captured from the first lock, restored by the last release. */
let restore: { overflow: string; paddingRight: string } | null = null;

function acquire() {
	if (typeof document === "undefined") return;
	lockCount += 1;
	if (lockCount > 1) return;

	const body = document.body;
	restore = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

	// Hiding the scrollbar reflows the page by its width, which makes fixed
	// headers and the overlay itself jump sideways as the dialog opens. Padding
	// the body by the width we removed holds the layout still.
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	if (scrollbarWidth > 0) {
		const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
		body.style.paddingRight = `${current + scrollbarWidth}px`;
	}
	body.style.overflow = "hidden";
}

function release() {
	if (typeof document === "undefined") return;
	lockCount = Math.max(0, lockCount - 1);
	if (lockCount > 0 || !restore) return;

	document.body.style.overflow = restore.overflow;
	document.body.style.paddingRight = restore.paddingRight;
	restore = null;
}

/**
 * Lock body scrolling while `active` is true.
 *
 * Safe to nest: locks are reference-counted, so scrolling is only restored once
 * every overlay has released. Restores the body's *previous* inline values
 * rather than clearing them, so a consumer that sets its own `overflow` on
 * `<body>` keeps it. SSR-safe (no-ops when `document` is undefined).
 *
 * @example
 * useScrollLock(open);
 */
export function useScrollLock(active: boolean): void {
	useEffect(() => {
		if (!active) return;
		acquire();
		return release;
	}, [active]);
}

/** Test-only: reset module state between cases. */
export function __resetScrollLock() {
	lockCount = 0;
	restore = null;
}
