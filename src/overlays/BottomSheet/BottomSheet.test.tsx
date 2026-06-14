import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BottomSheet } from ".";

// Minimal stand-in for the VisualViewport API (absent in jsdom). Tracks
// listeners so tests can assert wiring/cleanup and trigger a synthetic resize.
function mockVisualViewport(height: number, offsetTop = 0) {
	const listeners = new Map<string, Set<() => void>>();
	const vv = {
		height,
		offsetTop,
		addEventListener: vi.fn((type: string, cb: () => void) => {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)?.add(cb);
		}),
		removeEventListener: vi.fn((type: string, cb: () => void) => {
			listeners.get(type)?.delete(cb);
		}),
		dispatch(type: string) {
			for (const cb of listeners.get(type) ?? []) cb();
		},
		listenerCount(type: string) {
			return listeners.get(type)?.size ?? 0;
		},
	};
	Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });
	return vv;
}
// Helper: dispatch a pointer event with clientY + pointerId populated. jsdom
// doesn't natively support PointerEvent so we synthesize one as a MouseEvent
// and manually pin the pointer-specific fields React reads off the event.
function firePointer(
	type: "pointerdown" | "pointermove" | "pointerup",
	target: HTMLElement,
	init: { clientY: number; pointerId?: number },
) {
	const evt = new MouseEvent(type, { bubbles: true, cancelable: true, clientY: init.clientY });
	Object.defineProperty(evt, "pointerId", { value: init.pointerId ?? 1, configurable: true });
	target.dispatchEvent(evt);
}

afterEach(() => {
	// Restore jsdom's default (no visualViewport) between tests.
	Object.defineProperty(window, "visualViewport", { value: undefined, configurable: true });
});

describe("BottomSheet", () => {
	it("renders portaled to document.body when open=true", () => {
		const { baseElement } = render(
			<BottomSheet open onClose={() => {}}>
				content
			</BottomSheet>,
		);
		expect(baseElement.querySelector(".ds-atom-bottomsheet")).toBeInTheDocument();
		expect(baseElement.querySelector(".ds-atom-bottomsheet-backdrop")).toBeInTheDocument();
	});

	it("returns null when open=false", () => {
		const { baseElement } = render(
			<BottomSheet open={false} onClose={() => {}}>
				content
			</BottomSheet>,
		);
		expect(baseElement.querySelector(".ds-atom-bottomsheet")).toBeNull();
		expect(baseElement.querySelector(".ds-atom-bottomsheet-backdrop")).toBeNull();
	});

	it("height defaults to 'half' (data-height='half')", () => {
		const { baseElement } = render(
			<BottomSheet open onClose={() => {}}>
				x
			</BottomSheet>,
		);
		expect(baseElement.querySelector(".ds-atom-bottomsheet")?.getAttribute("data-height")).toBe(
			"half",
		);
	});

	it("height='full' applies data-height='full'", () => {
		const { baseElement } = render(
			<BottomSheet open height="full" onClose={() => {}}>
				x
			</BottomSheet>,
		);
		expect(baseElement.querySelector(".ds-atom-bottomsheet")?.getAttribute("data-height")).toBe(
			"full",
		);
	});

	it("backdrop click invokes onClose by default", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		const backdrop = baseElement.querySelector(
			'[data-testid="bottomsheet-backdrop"]',
		) as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("backdrop click ignored when closeOnBackdropClick=false", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open closeOnBackdropClick={false} onClose={onClose}>
				x
			</BottomSheet>,
		);
		const backdrop = baseElement.querySelector(
			'[data-testid="bottomsheet-backdrop"]',
		) as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("Escape key invokes onClose", () => {
		const onClose = vi.fn();
		render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("drag handle exists and is decorative for screen readers (aria-hidden)", () => {
		const { baseElement } = render(
			<BottomSheet open onClose={() => {}}>
				x
			</BottomSheet>,
		);
		const handle = baseElement.querySelector(".ds-atom-bottomsheet-handle") as HTMLElement;
		expect(handle).toBeInTheDocument();
		expect(handle.getAttribute("aria-hidden")).toBe("true");
	});

	it("v0.5.1 swipe-to-close: drag down past threshold closes the sheet", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		const handle = baseElement.querySelector(".ds-atom-bottomsheet-handle") as HTMLElement;
		// jsdom panel.getBoundingClientRect().height = 0 → threshold = min(120, 0) = 0
		// so any positive delta triggers close.
		firePointer("pointerdown", handle, { clientY: 100 });
		firePointer("pointermove", handle, { clientY: 250 });
		firePointer("pointerup", handle, { clientY: 250 });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("v0.5.1 swipe-to-close: zero-delta release does NOT close + no lingering transform", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		const handle = baseElement.querySelector(".ds-atom-bottomsheet-handle") as HTMLElement;
		const panel = baseElement.querySelector(".ds-atom-bottomsheet") as HTMLElement;
		// pointerDown then pointerUp at the same Y - delta = 0, threshold = 0,
		// so 0 > 0 is false → snap-back path.
		firePointer("pointerdown", handle, { clientY: 100 });
		firePointer("pointerup", handle, { clientY: 100 });
		expect(onClose).not.toHaveBeenCalled();
		expect(panel.style.transform).toBe("");
	});

	it("title prop renders in header slot with aria-labelledby wired", () => {
		const { baseElement } = render(
			<BottomSheet open title="Filter" onClose={() => {}}>
				x
			</BottomSheet>,
		);
		const panel = baseElement.querySelector(".ds-atom-bottomsheet")!;
		const header = panel.querySelector(".ds-atom-bottomsheet-hd")!;
		expect(header.textContent).toBe("Filter");
		const titleId = header.getAttribute("id")!;
		expect(panel.getAttribute("aria-labelledby")).toBe(titleId);
	});

	it("footer prop renders in footer slot", () => {
		const { baseElement } = render(
			<BottomSheet open footer={<button type="button">Save</button>} onClose={() => {}}>
				x
			</BottomSheet>,
		);
		expect(baseElement.querySelector(".ds-atom-bottomsheet-ft")?.textContent).toBe("Save");
	});

	it("click on the panel itself does NOT close (target===currentTarget guard)", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		const panel = baseElement.querySelector(".ds-atom-bottomsheet") as HTMLElement;
		fireEvent.click(panel);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("panel exposes role='dialog' and aria-modal='true'", () => {
		const { baseElement } = render(
			<BottomSheet open onClose={() => {}}>
				x
			</BottomSheet>,
		);
		const panel = baseElement.querySelector(".ds-atom-bottomsheet")!;
		expect(panel.getAttribute("role")).toBe("dialog");
		expect(panel.getAttribute("aria-modal")).toBe("true");
	});

	it("keyboard tracking: wires a visualViewport resize listener while open and cleans it up on unmount", () => {
		const vv = mockVisualViewport(800);
		const { unmount } = render(
			<BottomSheet open footer={<button type="button">Save</button>} onClose={() => {}}>
				x
			</BottomSheet>,
		);
		expect(vv.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(vv.listenerCount("resize")).toBe(1);
		unmount();
		expect(vv.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(vv.listenerCount("resize")).toBe(0);
	});

	it("keyboard tracking: footer gets padding-bottom equal to the keyboard offset on resize", () => {
		// window.innerHeight is 768 in jsdom; shrink the visual viewport to 500
		// → kbOffset = 768 - 500 - 0 = 268.
		const vv = mockVisualViewport(500);
		const { baseElement } = render(
			<BottomSheet open footer={<button type="button">Save</button>} onClose={() => {}}>
				x
			</BottomSheet>,
		);
		act(() => {
			vv.dispatch("resize");
		});
		const footer = baseElement.querySelector(".ds-atom-bottomsheet-ft") as HTMLElement;
		expect(footer.style.paddingBottom).toBe(`${window.innerHeight - 500}px`);
	});

	it("keyboard tracking: opt-out via trackKeyboard={false} attaches no listener", () => {
		const vv = mockVisualViewport(800);
		render(
			<BottomSheet open trackKeyboard={false} footer={<span>f</span>} onClose={() => {}}>
				x
			</BottomSheet>,
		);
		expect(vv.addEventListener).not.toHaveBeenCalled();
	});

	it("keyboard tracking: no crash and footer renders when visualViewport is absent", () => {
		// afterEach guarantees window.visualViewport is undefined here.
		expect(window.visualViewport).toBeUndefined();
		const { baseElement } = render(
			<BottomSheet open footer={<button type="button">Save</button>} onClose={() => {}}>
				x
			</BottomSheet>,
		);
		const footer = baseElement.querySelector(".ds-atom-bottomsheet-ft") as HTMLElement;
		expect(footer.textContent).toBe("Save");
		expect(footer.style.paddingBottom).toBe("");
	});
});
