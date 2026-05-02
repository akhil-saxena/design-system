/**
 * useResizableColumns (DS-61, D-17-10) - unit tests
 *
 * Hook: returns { widths, setWidth, startResize }
 * Tests: pointer events with capture, min width, onWidthsChange callback
 *
 * PRIMARY test approach: deterministic spy-based pattern (captures registered
 * document.addEventListener handlers and invokes them directly - bypasses
 * jsdom's incomplete PointerEvent surface entirely).
 *
 * Note: jsdom's PointerEvent does not populate clientX from the event init dict,
 * so we call startResize directly with a plain-object fake event rather than via
 * fireEvent.pointerDown. State updates from outside React's event system are
 * wrapped in act().
 */
import { act, fireEvent, render } from "@testing-library/react";
import type React from "react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useResizableColumns } from "./useResizableColumns";

// ── Fake PointerEvent helper ──────────────────────────────────────────────────

function fakePointerEvent(clientX: number, pointerId = 1): React.PointerEvent {
	return {
		clientX,
		pointerId,
		currentTarget: { setPointerCapture: vi.fn() },
	} as unknown as React.PointerEvent;
}

// ── Harness ───────────────────────────────────────────────────────────────────

type HarnessRef = {
	startResize: (col: string, e: React.PointerEvent) => void;
};

function Harness({
	initial,
	min,
	onWidthsChange,
	harnessRef,
}: Readonly<{
	initial: Record<string, number>;
	min?: number;
	onWidthsChange?: (w: Record<string, number>) => void;
	harnessRef?: React.MutableRefObject<HarnessRef | null>;
}>) {
	const { widths, setWidth, startResize } = useResizableColumns(initial, {
		minWidth: min,
		onWidthsChange,
	});

	// Expose startResize to tests via ref
	const ref = useRef<HarnessRef>({ startResize });
	ref.current.startResize = startResize;
	if (harnessRef) harnessRef.current = ref.current;

	return (
		<div>
			<div data-testid="width-name">{widths.name}</div>
			<div data-testid="width-role">{widths.role}</div>
			<button data-testid="set-name-80" onClick={() => setWidth("name", 80)}>
				set 80
			</button>
			<button data-testid="set-name-20" onClick={() => setWidth("name", 20)}>
				set 20 (below min)
			</button>
		</div>
	);
}

// ── Helper: build spy capture object ─────────────────────────────────────────

function buildSpyCapture() {
	const handlers: Record<string, ((e: PointerEvent) => void)[]> = {
		pointermove: [],
		pointerup: [],
	};
	const addSpy = vi
		.spyOn(document, "addEventListener")
		.mockImplementation((type: string, fn: EventListenerOrEventListenerObject) => {
			if (type === "pointermove" || type === "pointerup") {
				handlers[type].push(fn as (e: PointerEvent) => void);
			}
		});
	const removeSpy = vi
		.spyOn(document, "removeEventListener")
		.mockImplementation((type: string, fn: EventListenerOrEventListenerObject) => {
			if (type === "pointermove" || type === "pointerup") {
				handlers[type] = handlers[type].filter((h) => h !== fn);
			}
		});
	return {
		handlers,
		restore() {
			addSpy.mockRestore();
			removeSpy.mockRestore();
		},
	};
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useResizableColumns", () => {
	// ── Initial state ──────────────────────────────────────────────────────

	it("initialises widths from initialWidths object", () => {
		const { getByTestId } = render(<Harness initial={{ name: 100, role: 200 }} />);
		expect(getByTestId("width-name").textContent).toBe("100");
		expect(getByTestId("width-role").textContent).toBe("200");
	});

	// ── setWidth ───────────────────────────────────────────────────────────

	it("setWidth updates a single column", () => {
		const { getByTestId } = render(<Harness initial={{ name: 100, role: 200 }} />);
		fireEvent.click(getByTestId("set-name-80"));
		expect(getByTestId("width-name").textContent).toBe("80");
		// Other column unchanged
		expect(getByTestId("width-role").textContent).toBe("200");
	});

	it("setWidth clamps to default minWidth (60) when below minimum", () => {
		const { getByTestId } = render(<Harness initial={{ name: 100, role: 200 }} />);
		fireEvent.click(getByTestId("set-name-20"));
		expect(getByTestId("width-name").textContent).toBe("60");
	});

	it("setWidth respects custom minWidth option", () => {
		const { getByTestId } = render(<Harness initial={{ name: 100 }} min={80} />);
		// setWidth(20) with min=80 → should clamp to 80
		fireEvent.click(getByTestId("set-name-20"));
		expect(getByTestId("width-name").textContent).toBe("80");
	});

	// ── startResize: deterministic spy-based PRIMARY approach ──────────────
	// jsdom's PointerEvent does not populate clientX from event init, so we
	// call startResize directly via a ref with a fabricated plain-object event.

	it("startResize updates width on pointermove (deterministic spy)", () => {
		const spy = buildSpyCapture();
		const harnessRef = { current: null as HarnessRef | null };

		try {
			const { getByTestId } = render(<Harness initial={{ name: 100 }} harnessRef={harnessRef} />);

			// Call startResize directly with a fake event (clientX=0, startW=100)
			act(() => {
				harnessRef.current!.startResize("name", fakePointerEvent(0));
			});

			expect(spy.handlers.pointermove).toHaveLength(1);
			expect(spy.handlers.pointerup).toHaveLength(1);

			// Invoke captured pointermove handler: delta = 50 → new width = 150
			act(() => {
				spy.handlers.pointermove[0]({ clientX: 50, pointerId: 1 } as PointerEvent);
			});
			expect(getByTestId("width-name").textContent).toBe("150");
		} finally {
			spy.restore();
		}
	});

	it("startResize: pointerup fires onWidthsChange with final widths", () => {
		const spy = buildSpyCapture();
		const harnessRef = { current: null as HarnessRef | null };

		try {
			const onWidthsChange = vi.fn();
			render(
				<Harness initial={{ name: 100 }} onWidthsChange={onWidthsChange} harnessRef={harnessRef} />,
			);

			act(() => {
				harnessRef.current!.startResize("name", fakePointerEvent(0));
			});
			act(() => {
				spy.handlers.pointermove[0]({ clientX: 50, pointerId: 1 } as PointerEvent);
			});
			act(() => {
				spy.handlers.pointerup[0]({ clientX: 50, pointerId: 1 } as PointerEvent);
			});

			expect(onWidthsChange).toHaveBeenCalledWith({ name: 150 });
		} finally {
			spy.restore();
		}
	});

	it("startResize: cleanup removes document listeners after pointerup", () => {
		const spy = buildSpyCapture();
		const harnessRef = { current: null as HarnessRef | null };

		try {
			render(<Harness initial={{ name: 100 }} harnessRef={harnessRef} />);

			act(() => {
				harnessRef.current!.startResize("name", fakePointerEvent(0));
			});
			expect(spy.handlers.pointermove).toHaveLength(1);

			// Fire pointerup - listeners should be removed
			act(() => {
				spy.handlers.pointerup[0]({ clientX: 50, pointerId: 1 } as PointerEvent);
			});
			expect(spy.handlers.pointermove).toHaveLength(0);
			expect(spy.handlers.pointerup).toHaveLength(0);
		} finally {
			spy.restore();
		}
	});

	it("startResize: minWidth is enforced during drag (clamped to default 60)", () => {
		const spy = buildSpyCapture();
		const harnessRef = { current: null as HarnessRef | null };

		try {
			const { getByTestId } = render(<Harness initial={{ name: 100 }} harnessRef={harnessRef} />);

			// Start from clientX=0, move to clientX=-200 → startW(100) + delta(-200) = -100 → clamp to 60
			act(() => {
				harnessRef.current!.startResize("name", fakePointerEvent(0));
			});
			act(() => {
				spy.handlers.pointermove[0]({ clientX: -200, pointerId: 1 } as PointerEvent);
			});
			expect(getByTestId("width-name").textContent).toBe("60");
		} finally {
			spy.restore();
		}
	});
});
