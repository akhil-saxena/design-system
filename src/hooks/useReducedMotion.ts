import { useEffect, useState } from "react";

/**
 * Returns true when the user has set OS-level "Reduce Motion" preference.
 * Watches matchMedia for changes (e.g., user toggles preference at runtime).
 * SSR-safe — returns false on the server.
 * Used by Carousel (DS-65) autoplay gating, Accordion expand transition, etc.
 */
export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);
	return reduced;
}
