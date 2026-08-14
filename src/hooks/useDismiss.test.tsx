import { fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { __dismissStackSize, useDismiss } from "./useDismiss";

const pressEscape = () => fireEvent.keyDown(document, { key: "Escape" });

describe("useDismiss", () => {
	afterEach(() => {
		expect(__dismissStackSize(), "layer stack leaked between tests").toBe(0);
	});

	it("calls onDismiss on Escape while active", () => {
		const onDismiss = vi.fn();
		const { unmount } = renderHook(() => useDismiss(true, onDismiss));
		pressEscape();
		expect(onDismiss).toHaveBeenCalledTimes(1);
		unmount();
	});

	it("does nothing while inactive", () => {
		const onDismiss = vi.fn();
		const { unmount } = renderHook(() => useDismiss(false, onDismiss));
		pressEscape();
		expect(onDismiss).not.toHaveBeenCalled();
		unmount();
	});

	it("ignores keys other than Escape", () => {
		const onDismiss = vi.fn();
		const { unmount } = renderHook(() => useDismiss(true, onDismiss));
		fireEvent.keyDown(document, { key: "Enter" });
		fireEvent.keyDown(document, { key: "a" });
		expect(onDismiss).not.toHaveBeenCalled();
		unmount();
	});

	it("detaches its listener on unmount", () => {
		const onDismiss = vi.fn();
		const { unmount } = renderHook(() => useDismiss(true, onDismiss));
		unmount();
		pressEscape();
		expect(onDismiss).not.toHaveBeenCalled();
	});

	// The bug this hook exists to fix: every overlay installed its own document
	// listener, so one Escape closed all of them simultaneously.
	describe("nested layers", () => {
		it("dismisses only the topmost layer", () => {
			const outer = vi.fn();
			const inner = vi.fn();
			const outerLayer = renderHook(() => useDismiss(true, outer));
			const innerLayer = renderHook(() => useDismiss(true, inner));

			pressEscape();
			expect(inner).toHaveBeenCalledTimes(1);
			expect(outer).not.toHaveBeenCalled();

			// Closing the inner layer hands control back to the outer one.
			innerLayer.unmount();
			pressEscape();
			expect(outer).toHaveBeenCalledTimes(1);
			expect(inner).toHaveBeenCalledTimes(1);
			outerLayer.unmount();
		});

		it("unwinds correctly when layers close out of order", () => {
			const a = vi.fn();
			const b = vi.fn();
			const layerA = renderHook(() => useDismiss(true, a));
			const layerB = renderHook(() => useDismiss(true, b));

			// The *outer* layer closes first (e.g. a route change).
			layerA.unmount();
			pressEscape();
			expect(b).toHaveBeenCalledTimes(1);
			expect(a).not.toHaveBeenCalled();
			layerB.unmount();
		});

		it("lets a non-modal layer respond even under a modal one", () => {
			// A tooltip inside a dialog should still close on its own Escape.
			const dialog = vi.fn();
			const tooltip = vi.fn();
			const d = renderHook(() => useDismiss(true, dialog));
			const t = renderHook(() => useDismiss(true, tooltip, { modal: false }));

			pressEscape();
			expect(tooltip).toHaveBeenCalledTimes(1);
			// The dialog is still the topmost *modal* layer, so it also responds.
			expect(dialog).toHaveBeenCalledTimes(1);
			t.unmount();
			d.unmount();
		});
	});
});
