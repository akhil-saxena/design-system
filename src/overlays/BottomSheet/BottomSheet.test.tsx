import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from ".";
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
		// pointerDown then pointerUp at the same Y — delta = 0, threshold = 0,
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
});
