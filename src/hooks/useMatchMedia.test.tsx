import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMatchMedia } from "./useMatchMedia";

function MatchMediaHarness({ query }: Readonly<{ query: string }>) {
	const matches = useMatchMedia(query);
	return <div data-testid="result">{String(matches)}</div>;
}

function mockMatchMedia(matches: boolean) {
	const listeners: Array<(e: MediaQueryListEvent) => void> = [];
	const mql = {
		matches,
		addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
			listeners.push(handler);
		}),
		removeEventListener: vi.fn(),
		triggerChange: (newMatches: boolean) => {
			for (const handler of listeners) {
				handler({ matches: newMatches } as MediaQueryListEvent);
			}
		},
	};
	// jsdom does not implement window.matchMedia; assign a mock implementation.
	Object.defineProperty(globalThis, "matchMedia", {
		writable: true,
		configurable: true,
		value: vi.fn(() => mql),
	});
	return { mql, listeners, triggerChange: mql.triggerChange };
}

describe("useMatchMedia", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns true when matchMedia.matches is true", () => {
		mockMatchMedia(true);
		render(<MatchMediaHarness query="(max-width: 640px)" />);
		expect(screen.getByTestId("result").textContent).toBe("true");
	});

	it("returns false when matchMedia.matches is false", () => {
		mockMatchMedia(false);
		render(<MatchMediaHarness query="(max-width: 640px)" />);
		expect(screen.getByTestId("result").textContent).toBe("false");
	});

	it("re-renders when the change listener fires", async () => {
		const { triggerChange } = mockMatchMedia(false);
		render(<MatchMediaHarness query="(max-width: 640px)" />);
		expect(screen.getByTestId("result").textContent).toBe("false");
		act(() => {
			triggerChange(true);
		});
		expect(screen.getByTestId("result").textContent).toBe("true");
	});
});
