import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FocalPointPicker } from ".";

/**
 * The three legacy defects G-1 measured are the specification, so each has a
 * case here that fails in the legacy shape:
 *
 *   1. mouse-only        → the touch and pen cases below
 *   2. keyboard-unreachable → the tab-order and arrow-step cases
 *   3. uncleaned listeners  → `unmounting mid-drag`, which asserts on the
 *      AbortSignal every listener was registered with, not on a side effect
 *
 * plus the ONE interaction-model divergence the finding recorded rather than
 * slipped in: the legacy control drags the image with an inverted delta and an
 * arbitrary `/ 2` damping factor, so the same gesture means a different value on
 * a 320px frame than on a 640px one. `frame-size independence` is the assertion
 * that pins the model this component chose instead.
 *
 * WHY THE RECTS ARE STUBBED. jsdom has no layout: every
 * getBoundingClientRect() is 0x0, so a pointer position expressed as a fraction
 * of the frame would divide by zero and every value assertion would read NaN or
 * 50. Stubbing the rect is the only way to make the arithmetic observable here —
 * and it is exactly why `tests/visual/focalpoint.spec.ts` re-measures the same
 * two frame widths in a real browser instead of trusting this file.
 */

const SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";

function stubRect(el: Element, box: { left: number; top: number; width: number; height: number }) {
	vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
		left: box.left,
		top: box.top,
		width: box.width,
		height: box.height,
		right: box.left + box.width,
		bottom: box.top + box.height,
		x: box.left,
		y: box.top,
		toJSON: () => ({}),
	} as DOMRect);
}

/** The single focusable element — the control the keyboard and pointer both drive. */
function frame(): HTMLElement {
	return screen.getByLabelText("Crop focus");
}

interface HarnessProps {
	initial?: { x: number; y: number };
	aspectRatio?: number;
	onChange?: (v: { x: number; y: number }) => void;
	width?: number;
	height?: number;
}

/**
 * A controlled harness, because the component is controlled: an uncontrolled
 * copy would let a test pass while the consumer's own round trip was broken.
 */
function Harness({ initial = { x: 50, y: 25 }, aspectRatio, onChange }: HarnessProps) {
	const [value, setValue] = useState(initial);
	return (
		<FocalPointPicker
			label="Crop focus"
			src={SRC}
			alt="Harbour wall at dusk"
			value={value}
			aspectRatio={aspectRatio}
			onChange={(v) => {
				setValue(v);
				onChange?.(v);
			}}
		/>
	);
}

/**
 * Records the options every document-level listener was registered with, so the
 * cleanup assertion can be made on the mechanism rather than on a symptom.
 *
 * A behavioural check alone ("no onChange after unmount") passes for the wrong
 * reason if the component simply stopped calling onChange; asserting that every
 * registered signal is aborted is the claim the plan actually makes.
 */
function trackDocumentListeners() {
	const seen: { type: string; signal: AbortSignal | undefined }[] = [];
	const original = document.addEventListener.bind(document);
	const spy = vi
		.spyOn(document, "addEventListener")
		.mockImplementation((type: string, listener: never, options?: never) => {
			const opts = options as { signal?: AbortSignal } | boolean | undefined;
			if (/^pointer/.test(type)) {
				seen.push({
					type,
					signal: typeof opts === "object" && opts !== null ? opts.signal : undefined,
				});
			}
			return original(type, listener, options);
		});
	return { seen, restore: () => spy.mockRestore() };
}

beforeEach(() => {
	vi.restoreAllMocks();
});
afterEach(() => {
	vi.restoreAllMocks();
});

describe("FocalPointPicker — pointer (legacy defect 1: mouse-only)", () => {
	it("commits 25%, 75% for a drag to a quarter across and three quarters down", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
		fireEvent.pointerMove(document, { pointerId: 1, clientX: 100, clientY: 150 });
		fireEvent.pointerUp(document, { pointerId: 1 });

		expect(onChange).toHaveBeenCalledWith({ x: 25, y: 75 });
	});

	it.each([
		["touch", "touch"],
		["pen", "pen"],
	])("serves a %s pointer through the same code path", (_name, pointerType) => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 7, pointerType, button: 0, buttons: 1 });
		fireEvent.pointerMove(document, { pointerId: 7, clientX: 100, clientY: 150 });
		fireEvent.pointerUp(document, { pointerId: 7 });

		expect(onChange).toHaveBeenLastCalledWith({ x: 25, y: 75 });
	});

	it("binds no mouse-only path — a bare mousedown moves nothing", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.mouseDown(el, { clientX: 100, clientY: 150 });
		fireEvent.mouseMove(document, { clientX: 100, clientY: 150 });
		fireEvent.mouseUp(document);

		expect(onChange).not.toHaveBeenCalled();
	});
});

describe("FocalPointPicker — keyboard (legacy defect 2: keyboard-unreachable)", () => {
	it("is in the tab order", () => {
		render(<Harness />);
		expect(frame()).toHaveAttribute("tabindex", "0");
	});

	it("moves 1% per arrow press, matching the measured prototype", () => {
		const onChange = vi.fn();
		render(<Harness initial={{ x: 50, y: 25 }} onChange={onChange} />);
		const el = frame();

		fireEvent.keyDown(el, { key: "ArrowUp" });
		fireEvent.keyDown(el, { key: "ArrowUp" });
		fireEvent.keyDown(el, { key: "ArrowRight" });

		expect(onChange).toHaveBeenLastCalledWith({ x: 51, y: 23 });
	});

	it("moves 10% per Shift+arrow press", () => {
		const onChange = vi.fn();
		render(<Harness initial={{ x: 51, y: 23 }} onChange={onChange} />);
		fireEvent.keyDown(frame(), { key: "ArrowDown", shiftKey: true });
		expect(onChange).toHaveBeenLastCalledWith({ x: 51, y: 33 });
	});

	it("resets to the centre on Home", () => {
		const onChange = vi.fn();
		render(<Harness initial={{ x: 51, y: 33 }} onChange={onChange} />);
		fireEvent.keyDown(frame(), { key: "Home" });
		expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 50 });
	});

	it("preventDefaults the arrow keys it handles, so the page does not scroll", () => {
		render(<Harness />);
		const handled = fireEvent.keyDown(frame(), { key: "ArrowDown" });
		// fireEvent returns false when preventDefault was called.
		expect(handled).toBe(false);
	});

	it("leaves keys it does not handle alone", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const notHandled = fireEvent.keyDown(frame(), { key: "Tab" });
		expect(notHandled).toBe(true);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("steals no page-level arrow key — the handler is on the control, not the document", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const notHandled = fireEvent.keyDown(document.body, { key: "ArrowDown" });
		expect(notHandled).toBe(true);
		expect(onChange).not.toHaveBeenCalled();
	});
});

describe("FocalPointPicker — clamping at all three entry paths", () => {
	it("clamps a pointer position outside the frame", () => {
		const onChange = vi.fn();
		render(<Harness onChange={onChange} />);
		const el = frame();
		stubRect(el, { left: 100, top: 100, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
		fireEvent.pointerMove(document, { pointerId: 1, clientX: -900, clientY: -900 });
		expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });

		fireEvent.pointerMove(document, { pointerId: 1, clientX: 9000, clientY: 9000 });
		expect(onChange).toHaveBeenLastCalledWith({ x: 100, y: 100 });
		fireEvent.pointerUp(document, { pointerId: 1 });
	});

	it("clamps a keyboard step at the edge instead of wrapping", () => {
		const onChange = vi.fn();
		render(<Harness initial={{ x: 0, y: 100 }} onChange={onChange} />);
		fireEvent.keyDown(frame(), { key: "ArrowLeft", shiftKey: true });
		expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 100 });
		fireEvent.keyDown(frame(), { key: "ArrowDown", shiftKey: true });
		expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 100 });
	});

	it("clamps an out-of-range controlled value from outside", () => {
		// The third entry path, and the one a component is most tempted to trust.
		render(
			<FocalPointPicker
				label="Crop focus"
				src={SRC}
				alt="Harbour wall at dusk"
				value={{ x: -40, y: 512 }}
				onChange={() => {}}
			/>,
		);
		const img = screen.getByAltText("Harbour wall at dusk");
		expect(img.style.objectPosition).toBe("0% 100%");
	});

	it("rounds a fractional controlled value rather than emitting sub-pixel noise", () => {
		render(
			<FocalPointPicker
				label="Crop focus"
				src={SRC}
				alt="Harbour wall at dusk"
				value={{ x: 33.4, y: 66.6 }}
				onChange={() => {}}
			/>,
		);
		expect(screen.getByAltText("Harbour wall at dusk").style.objectPosition).toBe("33% 67%");
	});
});

describe("FocalPointPicker — cleanup (legacy defect 3: uncleaned listeners)", () => {
	it("registers every drag listener with an AbortSignal and aborts it on unmount mid-drag", () => {
		const onChange = vi.fn();
		const tracker = trackDocumentListeners();
		const { unmount } = render(<Harness onChange={onChange} />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
		fireEvent.pointerMove(document, { pointerId: 1, clientX: 100, clientY: 150 });
		expect(onChange).toHaveBeenCalled();

		// Non-vacuity: if the component registered nothing, every assertion below
		// would be trivially true.
		expect(tracker.seen.length).toBeGreaterThan(0);
		for (const l of tracker.seen) {
			expect(l.signal, `${l.type} was registered without a signal`).toBeInstanceOf(AbortSignal);
			expect(l.signal?.aborted, `${l.type} aborted before unmount`).toBe(false);
		}

		unmount();

		for (const l of tracker.seen) {
			expect(l.signal?.aborted, `${l.type} still live after a mid-drag unmount`).toBe(true);
		}

		const callsAtUnmount = onChange.mock.calls.length;
		fireEvent.pointerMove(document, { pointerId: 1, clientX: 300, clientY: 50 });
		fireEvent.pointerUp(document, { pointerId: 1 });
		expect(onChange.mock.calls.length).toBe(callsAtUnmount);
		tracker.restore();
	});

	it("aborts the drag listeners on pointerup too, not only on unmount", () => {
		const tracker = trackDocumentListeners();
		render(<Harness />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
		fireEvent.pointerUp(document, { pointerId: 1 });

		expect(tracker.seen.length).toBeGreaterThan(0);
		for (const l of tracker.seen) expect(l.signal?.aborted).toBe(true);
		tracker.restore();
	});

	it("aborts on pointercancel, which is how a touch drag is interrupted", () => {
		const tracker = trackDocumentListeners();
		render(<Harness />);
		const el = frame();
		stubRect(el, { left: 0, top: 0, width: 400, height: 200 });

		fireEvent.pointerDown(el, { pointerId: 1, pointerType: "touch", button: 0, buttons: 1 });
		fireEvent.pointerCancel(document, { pointerId: 1 });

		expect(tracker.seen.length).toBeGreaterThan(0);
		for (const l of tracker.seen) expect(l.signal?.aborted).toBe(true);
		tracker.restore();
	});
});

describe("FocalPointPicker — frame-size independence (the recorded model divergence)", () => {
	it.each([
		[320, 213],
		[640, 427],
	])(
		"a release a quarter across and three quarters down a %ipx frame commits the same value",
		(width, height) => {
			const onChange = vi.fn();
			render(<Harness onChange={onChange} />);
			const el = frame();
			stubRect(el, { left: 0, top: 0, width, height });

			fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
			fireEvent.pointerMove(document, {
				pointerId: 1,
				clientX: width * 0.25,
				clientY: height * 0.75,
			});
			fireEvent.pointerUp(document, { pointerId: 1 });

			expect(onChange).toHaveBeenLastCalledWith({ x: 25, y: 75 });
		},
	);

	it("is proportional, not a damped pixel delta — the rejected legacy model", () => {
		// The mirror of the assertion above. An IDENTICAL pixel offset must NOT
		// produce an identical value, because the value is a position within the
		// frame and not an accumulated delta. If these two ever agree, the
		// component has drifted back to the legacy model.
		const results: { x: number; y: number }[] = [];
		for (const width of [320, 640]) {
			const onChange = vi.fn();
			const view = render(<Harness onChange={onChange} />);
			const el = frame();
			stubRect(el, { left: 0, top: 0, width, height: Math.round(width / 1.5) });
			fireEvent.pointerDown(el, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 });
			fireEvent.pointerMove(document, { pointerId: 1, clientX: 80, clientY: 40 });
			fireEvent.pointerUp(document, { pointerId: 1 });
			results.push(onChange.mock.calls.at(-1)?.[0]);
			view.unmount();
		}
		expect(results[0]).toEqual({ x: 25, y: 19 });
		expect(results[1]).toEqual({ x: 13, y: 9 });
	});
});

describe("FocalPointPicker — the frame", () => {
	it("defaults to 3:2", () => {
		render(<Harness />);
		expect(frame().style.aspectRatio).toBe("1.5");
	});

	it("honours an aspectRatio prop", () => {
		render(<Harness aspectRatio={1} />);
		expect(frame().style.aspectRatio).toBe("1");
	});
});
