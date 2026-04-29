import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./useReducedMotion";

// Harness component to render the hook output
function ReducedMotionHarness() {
	const reduced = useReducedMotion();
	return <div data-testid="result">{String(reduced)}</div>;
}

function mockMatchMedia(matches: boolean) {
	const listeners: Array<(e: MediaQueryListEvent) => void> = [];
	const mql = {
		matches,
		addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
			listeners.push(handler);
		}),
		removeEventListener: vi.fn(),
	};
	// jsdom does not implement window.matchMedia; assign a mock implementation.
	Object.defineProperty(globalThis, "matchMedia", {
		writable: true,
		configurable: true,
		value: vi.fn(() => mql),
	});
	return { mql, listeners };
}

describe("useReducedMotion", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns true when prefers-reduced-motion matches", () => {
		mockMatchMedia(true);
		render(<ReducedMotionHarness />);
		expect(screen.getByTestId("result").textContent).toBe("true");
	});

	it("returns false when prefers-reduced-motion does not match", () => {
		mockMatchMedia(false);
		render(<ReducedMotionHarness />);
		expect(screen.getByTestId("result").textContent).toBe("false");
	});
});
