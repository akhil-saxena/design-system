import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

function Harness({
	combo,
	handler,
	enabled = true,
	preventDefault = false,
}: {
	combo: string | string[];
	handler: (e: KeyboardEvent) => void;
	enabled?: boolean;
	preventDefault?: boolean;
}) {
	useKeyboardShortcut(combo, handler, { enabled, preventDefault });
	return <div data-testid="root">harness</div>;
}

describe("useKeyboardShortcut", () => {
	it("fires handler when matching key is pressed", () => {
		const handler = vi.fn();
		render(<Harness combo="Escape" handler={handler} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("does NOT fire on non-matching key", () => {
		const handler = vi.fn();
		render(<Harness combo="Escape" handler={handler} />);
		fireEvent.keyDown(window, { key: "a" });
		expect(handler).not.toHaveBeenCalled();
	});

	it("does NOT fire when disabled", () => {
		const handler = vi.fn();
		render(<Harness combo="Escape" handler={handler} enabled={false} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(handler).not.toHaveBeenCalled();
	});

	it("'mod+k' matches the OS-appropriate modifier", () => {
		const handler = vi.fn();
		render(<Harness combo="mod+k" handler={handler} />);
		// jsdom navigator.platform is empty → isMac false → ctrlKey path matches
		// On macOS dev machines navigator.platform = 'MacIntel' → metaKey path matches
		const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
		fireEvent.keyDown(window, isMac ? { key: "k", metaKey: true } : { key: "k", ctrlKey: true });
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("supports an array of combos (alternative bindings)", () => {
		const handler = vi.fn();
		render(<Harness combo={["mod+k", "ctrl+k"]} handler={handler} />);
		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		expect(handler).toHaveBeenCalledTimes(1);
	});
});
