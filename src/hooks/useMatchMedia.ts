import { useEffect, useState } from "react";

/**
 * Returns the `matches` boolean for an arbitrary CSS media query, reactive
 * to viewport changes (resize, rotation, prefers-* toggles at runtime).
 * SSR-safe - returns false on the server.
 * Used by Calendar (DS-68) for the mobile breakpoint switch between Popover
 * and BottomSheet at `(max-width: 640px)`. Generic over any media query string.
 */
export function useMatchMedia(query: string): boolean {
	const [matches, setMatches] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(query).matches;
	});
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia(query);
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
		// Sync once after subscription in case query changed between mount and effect.
		setMatches(mql.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [query]);
	return matches;
}
