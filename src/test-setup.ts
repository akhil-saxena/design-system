import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia - provide a no-op stub so that
// hooks like useReducedMotion (and future useColorScheme etc.) do not crash.
// Tests that specifically test reduced-motion behavior can override this stub
// per-test with vi.spyOn / Object.defineProperty.
Object.defineProperty(globalThis, "matchMedia", {
	writable: true,
	value: (query: string): MediaQueryList => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});
