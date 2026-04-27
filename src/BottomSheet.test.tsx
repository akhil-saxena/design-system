import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./BottomSheet";

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

	it("drag handle is purely visual - touchstart does NOT close (D-340)", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<BottomSheet open onClose={onClose}>
				x
			</BottomSheet>,
		);
		const handle = baseElement.querySelector(".ds-atom-bottomsheet-handle") as HTMLElement;
		expect(handle).toBeInTheDocument();
		fireEvent.touchStart(handle);
		fireEvent.touchEnd(handle);
		fireEvent.mouseDown(handle);
		fireEvent.pointerDown(handle);
		expect(onClose).not.toHaveBeenCalled();
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
