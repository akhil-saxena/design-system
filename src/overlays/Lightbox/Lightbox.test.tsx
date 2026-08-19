import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Lightbox } from ".";

// jsdom 25 implements neither `PointerEvent` nor `setPointerCapture` (probed:
// window.PointerEvent === undefined). testing-library falls back to the plain
// `Event` constructor when the named constructor is missing, and plain `Event`
// drops clientX/clientY — so every swipe assertion below would silently read
// `undefined` coordinates and pass for the wrong reason. Extending MouseEvent,
// which jsdom does implement, restores the coordinates the component reads.
class PointerEventPolyfill extends MouseEvent {
	readonly pointerId: number;
	readonly pointerType: string;
	constructor(type: string, init: PointerEventInit = {}) {
		super(type, init);
		this.pointerId = init.pointerId ?? 1;
		this.pointerType = init.pointerType ?? "touch";
	}
}
if (!("PointerEvent" in window)) {
	(window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill;
}
const oneItem = [{ src: "/a.jpg", alt: "A" }];
const twoItems = [
	{ src: "/a.jpg", alt: "A" },
	{ src: "/b.jpg", alt: "B" },
];
const threeItems = [
	{ src: "/a.jpg", alt: "A" },
	{ src: "/b.jpg", alt: "B" },
	{ src: "/c.jpg", alt: "C" },
];

describe("Lightbox", () => {
	it("renders portaled to document.body when open=true", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-backdrop")).toBeInTheDocument();
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/a.jpg");
	});

	it("returns null when open=false", () => {
		const { baseElement } = render(
			<Lightbox open={false} onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-backdrop")).toBeNull();
	});

	it("ArrowRight calls onIndexChange((activeIndex + 1) % length)", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={1}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		expect(onIndexChange).toHaveBeenCalledWith(2);
	});

	it("ArrowLeft from index 0 wraps around to last (D-350 wrap-around)", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowLeft" });
		expect(onIndexChange).toHaveBeenCalledWith(2);
	});

	it("ArrowRight from last index wraps around to 0", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={twoItems}
				activeIndex={1}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		expect(onIndexChange).toHaveBeenCalledWith(0);
	});

	it("Escape key invokes onClose", () => {
		const onClose = vi.fn();
		render(<Lightbox open onClose={onClose} items={oneItem} activeIndex={0} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("items.length === 1: prev + next buttons NOT rendered", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-prev")).toBeNull();
		expect(baseElement.querySelector(".ds-atom-lightbox-next")).toBeNull();
	});

	it("items.length > 1: prev + next buttons rendered", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={twoItems} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-prev")).toBeInTheDocument();
		expect(baseElement.querySelector(".ds-atom-lightbox-next")).toBeInTheDocument();
	});

	it("aria-label on dialog includes active item alt", () => {
		const items = [{ src: "/a.jpg", alt: "Senior Engineer Resume" }];
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={items} activeIndex={0} />,
		);
		const dialog = baseElement.querySelector('[role="dialog"]');
		expect(dialog?.getAttribute("aria-label")).toContain("Senior Engineer Resume");
	});

	it("caption renders when set on active item", () => {
		const items = [{ src: "/a.jpg", alt: "A", caption: "First slide" }];
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={items} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-caption")?.textContent).toBe("First slide");
	});

	it("close button click invokes onClose", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<Lightbox open onClose={onClose} items={oneItem} activeIndex={0} />,
		);
		const closeBtn = baseElement.querySelector(".ds-atom-lightbox-close");
		expect(closeBtn).not.toBeNull();
		fireEvent.click(closeBtn as Element);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("prev button click calls onIndexChange with prev index (wrap)", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={twoItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		const prevBtn = baseElement.querySelector(".ds-atom-lightbox-prev");
		expect(prevBtn).not.toBeNull();
		fireEvent.click(prevBtn as Element);
		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	// ── uncontrolled mode (no onIndexChange) ──────────────────────────────────

	it("uncontrolled: Next button advances the displayed image without a controlling parent", () => {
		const { baseElement } = render(<Lightbox open onClose={() => {}} items={twoItems} />);
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/a.jpg");
		const nextBtn = baseElement.querySelector(".ds-atom-lightbox-next");
		fireEvent.click(nextBtn as Element);
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/b.jpg");
	});

	it("uncontrolled: ArrowLeft from index 0 wraps to the last image", () => {
		const { baseElement } = render(<Lightbox open onClose={() => {}} items={threeItems} />);
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/a.jpg");
		fireEvent.keyDown(document, { key: "ArrowLeft" });
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/c.jpg");
	});

	it("uncontrolled: activeIndex seeds the initial slide", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={threeItems} activeIndex={2} />,
		);
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/c.jpg");
	});

	it("clamps an out-of-range index to the last item", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={twoItems} activeIndex={99} />,
		);
		// 99 clamped to last valid index (1 → /b.jpg)
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/b.jpg");
	});

	// ── focus trap + restore ──────────────────────────────────────────────────

	it("traps initial focus on the close button when opened", () => {
		const { baseElement } = render(<Lightbox open onClose={() => {}} items={oneItem} />);
		const closeBtn = baseElement.querySelector(".ds-atom-lightbox-close");
		expect(document.activeElement).toBe(closeBtn);
	});

	it("restores focus to the opener when unmounted/closed", () => {
		const opener = document.createElement("button");
		document.body.appendChild(opener);
		opener.focus();
		expect(document.activeElement).toBe(opener);

		const { unmount } = render(<Lightbox open onClose={() => {}} items={oneItem} />);
		// Focus moved into the dialog (close button).
		expect(document.activeElement).not.toBe(opener);
		unmount();
		expect(document.activeElement).toBe(opener);
		document.body.removeChild(opener);
	});

	// ── scroll-lock ───────────────────────────────────────────────────────────

	it("locks body scroll while open and restores it on close", () => {
		document.body.style.overflow = "scroll";
		const { rerender } = render(<Lightbox open onClose={() => {}} items={oneItem} />);
		expect(document.body.style.overflow).toBe("hidden");
		rerender(<Lightbox open={false} onClose={() => {}} items={oneItem} />);
		expect(document.body.style.overflow).toBe("scroll");
		document.body.style.overflow = "";
	});

	// ── backdrop-click close (G-14) ───────────────────────────────────────────
	//
	// The backdrop and the panel are the SAME element, so a bare onClick={onClose}
	// on that div closes on every click inside it — including the image. Two
	// conditions gate the close, and each was measured in Chromium rather than
	// reasoned about (see the component's own comment):
	//   1. the click landed on the backdrop itself, not on a descendant
	//   2. the pointerdown that began the gesture also landed on the backdrop
	// Condition 2 exists because a drag from the image that releases over the
	// backdrop emits a click whose target IS the backdrop.

	function backdropOf(baseElement: Element) {
		const el = baseElement.querySelector(".ds-atom-lightbox-backdrop");
		expect(el).not.toBeNull();
		return el as Element;
	}

	/** Press and release on one element, as a browser sequences it. */
	function tap(el: Element, x = 0, y = 0) {
		fireEvent.pointerDown(el, { clientX: x, clientY: y, pointerId: 1 });
		fireEvent.pointerUp(el, { clientX: x, clientY: y, pointerId: 1 });
		fireEvent.click(el, { clientX: x, clientY: y });
	}

	it("backdrop click invokes onClose exactly once", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		tap(backdropOf(baseElement), 10, 10);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("click on the image does NOT invoke onClose", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as Element;
		expect(img).not.toBeNull();
		tap(img, 400, 300);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("click on the caption does NOT invoke onClose", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<Lightbox open onClose={onClose} items={[{ src: "/a.jpg", alt: "A", caption: "Cap" }]} />,
		);
		const caption = baseElement.querySelector(".ds-atom-lightbox-caption") as Element;
		expect(caption).not.toBeNull();
		tap(caption, 400, 500);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("close button click invokes onClose ONCE, not twice via the backdrop", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		tap(baseElement.querySelector(".ds-atom-lightbox-close") as Element, 780, 28);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("prev/next button clicks navigate and do NOT invoke onClose", () => {
		const onClose = vi.fn();
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={onClose}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		tap(baseElement.querySelector(".ds-atom-lightbox-next") as Element, 770, 300);
		expect(onIndexChange).toHaveBeenCalledWith(1);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("a drag that starts on the image and releases over the backdrop does NOT close", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		const backdrop = backdropOf(baseElement);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as Element;
		// Measured in Chromium: pointerdown target=img, pointerup AND click
		// target=backdrop. A `target === currentTarget` check alone passes here.
		fireEvent.pointerDown(img, { clientX: 400, clientY: 300, pointerId: 1 });
		fireEvent.pointerUp(backdrop, { clientX: 120, clientY: 300, pointerId: 1 });
		fireEvent.click(backdrop, { clientX: 120, clientY: 300 });
		expect(onClose).not.toHaveBeenCalled();
	});

	it("a gesture that begins on the backdrop but whose click lands on a child does NOT close", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		const backdrop = backdropOf(baseElement);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as Element;
		// Isolates the click-time target guard: the pointer bookkeeping says
		// "a tap that began on the backdrop", so only `target === currentTarget`
		// can reject this one.
		fireEvent.pointerDown(backdrop, { clientX: 10, clientY: 10, pointerId: 1 });
		fireEvent.pointerUp(backdrop, { clientX: 10, clientY: 10, pointerId: 1 });
		fireEvent.click(img, { clientX: 10, clientY: 10 });
		expect(onClose).not.toHaveBeenCalled();
	});

	it("a drag that both starts AND ends on the backdrop does NOT close", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		const backdrop = backdropOf(baseElement);
		// Measured in Chromium: pointerdown target=backdrop, click target=backdrop.
		// Both the target guard and the pointerdown-origin guard pass here, so the
		// travel check is the only thing standing between a swipe over empty space
		// and an accidental close.
		fireEvent.pointerDown(backdrop, { clientX: 700, clientY: 550, pointerId: 1 });
		fireEvent.pointerUp(backdrop, { clientX: 300, clientY: 550, pointerId: 1 });
		fireEvent.click(backdrop, { clientX: 300, clientY: 550 });
		expect(onClose).not.toHaveBeenCalled();
	});

	it("a near-stationary press that begins on the image and slips onto the backdrop does NOT close", () => {
		const onClose = vi.fn();
		const { baseElement } = render(<Lightbox open onClose={onClose} items={oneItem} />);
		const backdrop = backdropOf(baseElement);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as Element;
		// Isolates the pointerdown-origin guard. A tap at the very edge of the
		// image that slips 2px past it releases on the backdrop, so the click's
		// target is the backdrop and the travel is well under the slop — the
		// origin check is the only one of the three that rejects it. Without this
		// case the guard is untested: the long drag above is already caught by
		// the travel check, which is what a mutation run showed.
		fireEvent.pointerDown(img, { clientX: 400, clientY: 300, pointerId: 1 });
		fireEvent.pointerUp(backdrop, { clientX: 402, clientY: 301, pointerId: 1 });
		fireEvent.click(backdrop, { clientX: 402, clientY: 301 });
		expect(onClose).not.toHaveBeenCalled();
	});

	// ── srcset / sizes passthrough (G-14) ─────────────────────────────────────

	it("srcSet and sizes reach the rendered img", () => {
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={[
					{
						src: "/a-1200.jpg",
						alt: "A",
						srcSet: "/a-600.jpg 600w, /a-1200.jpg 1200w",
						sizes: "(max-width: 700px) 100vw, 1200px",
					},
				]}
			/>,
		);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as HTMLImageElement;
		expect(img.getAttribute("srcset")).toBe("/a-600.jpg 600w, /a-1200.jpg 1200w");
		expect(img.getAttribute("sizes")).toBe("(max-width: 700px) 100vw, 1200px");
		// src stays required: it is the fallback for a browser that ignores srcset.
		expect(img.getAttribute("src")).toBe("/a-1200.jpg");
	});

	it("an item without srcSet emits NO srcset attribute, not an empty one", () => {
		const { baseElement } = render(<Lightbox open onClose={() => {}} items={oneItem} />);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as HTMLImageElement;
		expect(img.hasAttribute("srcset")).toBe(false);
		expect(img.hasAttribute("sizes")).toBe(false);
	});

	// ── swipe navigation (G-14) ───────────────────────────────────────────────
	//
	// Thresholds live in the component as named constants:
	//   SWIPE_MIN_DISTANCE_PX = 44   rejects a tap (a zero-length swipe)
	//   SWIPE_HORIZONTAL_DOMINANCE = 1.5   rejects a vertical scroll that drifts

	/** Press, travel, release — the gesture a browser emits for a swipe. */
	function swipe(el: Element, from: [number, number], to: [number, number]) {
		fireEvent.pointerDown(el, { clientX: from[0], clientY: from[1], pointerId: 1 });
		fireEvent.pointerUp(el, { clientX: to[0], clientY: to[1], pointerId: 1 });
	}

	it("a leftward horizontal swipe past the threshold advances to the next slide", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		swipe(backdropOf(baseElement), [500, 300], [400, 300]);
		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	it("a rightward swipe goes to the previous slide, preserving wrap-around", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		swipe(backdropOf(baseElement), [300, 300], [420, 300]);
		expect(onIndexChange).toHaveBeenCalledWith(2);
	});

	it("a swipe that starts on the image navigates too", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		const img = baseElement.querySelector(".ds-atom-lightbox-image") as Element;
		swipe(img, [500, 300], [400, 300]);
		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	it("a drag shorter than the threshold does nothing", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		// 40px of travel — under SWIPE_MIN_DISTANCE_PX, over the tap slop, so this
		// is an ambiguous drag and must resolve to no action at all.
		swipe(backdropOf(baseElement), [500, 300], [460, 300]);
		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("a predominantly vertical drag does not steal the scroll gesture", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		// 60px across, 200px down: past the distance threshold but nowhere near
		// horizontally dominant.
		swipe(backdropOf(baseElement), [500, 100], [440, 300]);
		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("a diagonal drag inside the dominance ratio does not navigate", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		// 100px across, 80px down — long enough, but 100 <= 80 * 1.5 so the
		// horizontal component does not dominate.
		swipe(backdropOf(baseElement), [500, 100], [400, 180]);
		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("a swipe on a single-item Lightbox does nothing (showNav is false)", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={oneItem}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		swipe(backdropOf(baseElement), [500, 300], [300, 300]);
		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("a completed swipe navigates WITHOUT also closing the overlay", () => {
		const onClose = vi.fn();
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={onClose}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		const backdrop = backdropOf(baseElement);
		swipe(backdrop, [700, 550], [300, 550]);
		// Chromium emits a click on the backdrop after this gesture; the travel
		// check is what stops one swipe from navigating and closing at once.
		fireEvent.click(backdrop, { clientX: 300, clientY: 550 });
		expect(onIndexChange).toHaveBeenCalledWith(1);
		expect(onClose).not.toHaveBeenCalled();
	});

	// ── screen-reader slide announcements (G-14, informed by G-13) ────────────

	function liveRegionOf(baseElement: Element) {
		return baseElement.querySelector('[role="status"]');
	}

	it("the live region exists from open, before any navigation", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={threeItems} activeIndex={0} />,
		);
		const region = liveRegionOf(baseElement);
		expect(region).not.toBeNull();
		// polite, not assertive: a slide change is not an interruption (G-13).
		expect(region?.getAttribute("aria-live")).toBe("polite");
		// A region inserted at the moment its text changes is frequently never
		// announced, because the screen reader had nothing to observe.
		expect(baseElement.querySelector(".ds-atom-lightbox-backdrop")).toContainElement(
			region as HTMLElement,
		);
		// Present is not the same as perceivable. .ds-visually-hidden takes the
		// region out of the picture but leaves it in the accessibility tree;
		// `hidden` or display:none would take it out of both, and a region the
		// screen reader cannot see is a region it will never announce from.
		expect(region).toBeVisible();
		expect(region).not.toHaveAttribute("hidden");
	});

	it("the live region is empty on first open, so opening announces no slide change", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={threeItems} activeIndex={0} />,
		);
		expect(liveRegionOf(baseElement)?.textContent).toBe("");
	});

	it("navigating announces one-based position, total and the new item's alt", () => {
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={[
					{ src: "/a.jpg", alt: "Cliffs at dawn" },
					{ src: "/b.jpg", alt: "Harbour wall" },
					{ src: "/c.jpg", alt: "Low tide" },
				]}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		// G-13's central measured defect is speaking an identifier and NO position.
		expect(liveRegionOf(baseElement)?.textContent).toBe("Image 2 of 3. Harbour wall");
	});

	it("a swipe announces the slide it moved to", () => {
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={[
					{ src: "/a.jpg", alt: "Cliffs at dawn" },
					{ src: "/b.jpg", alt: "Harbour wall" },
					{ src: "/c.jpg", alt: "Low tide" },
				]}
			/>,
		);
		swipe(backdropOf(baseElement), [500, 300], [400, 300]);
		expect(liveRegionOf(baseElement)?.textContent).toBe("Image 2 of 3. Harbour wall");
	});

	it("a rejected gesture leaves the live region untouched", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={threeItems} activeIndex={0} />,
		);
		// under-threshold drag, then a vertical drag, then an arrow on one item
		swipe(backdropOf(baseElement), [500, 300], [460, 300]);
		swipe(backdropOf(baseElement), [500, 100], [440, 300]);
		expect(liveRegionOf(baseElement)?.textContent).toBe("");
	});

	it("closing and reopening resets the announcement", () => {
		const { baseElement, rerender } = render(
			<Lightbox open onClose={() => {}} items={threeItems} />,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		expect(liveRegionOf(baseElement)?.textContent).toBe("Image 2 of 3. B");
		rerender(<Lightbox open={false} onClose={() => {}} items={threeItems} />);
		rerender(<Lightbox open onClose={() => {}} items={threeItems} />);
		expect(liveRegionOf(baseElement)?.textContent).toBe("");
	});
});
