import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __resetScrollLock, useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
	beforeEach(() => {
		__resetScrollLock();
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
	});
	afterEach(() => {
		__resetScrollLock();
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
	});

	it("locks the body while active and releases on unmount", () => {
		const { unmount } = renderHook(() => useScrollLock(true));
		expect(document.body.style.overflow).toBe("hidden");
		unmount();
		expect(document.body.style.overflow).toBe("");
	});

	it("does nothing while inactive", () => {
		renderHook(() => useScrollLock(false));
		expect(document.body.style.overflow).toBe("");
	});

	it("locks and unlocks as `active` toggles", () => {
		const { rerender } = renderHook(({ a }) => useScrollLock(a), {
			initialProps: { a: false },
		});
		expect(document.body.style.overflow).toBe("");
		rerender({ a: true });
		expect(document.body.style.overflow).toBe("hidden");
		rerender({ a: false });
		expect(document.body.style.overflow).toBe("");
	});

	// The bug this hook exists to fix: two overlays open at once (an ActionSheet
	// raised from inside a Modal). The inner one closing must not unlock the page
	// while the outer one is still on screen.
	it("stays locked until the last nested consumer releases", () => {
		const outer = renderHook(() => useScrollLock(true));
		const inner = renderHook(() => useScrollLock(true));
		expect(document.body.style.overflow).toBe("hidden");

		inner.unmount();
		expect(document.body.style.overflow).toBe("hidden");

		outer.unmount();
		expect(document.body.style.overflow).toBe("");
	});

	it("restores a pre-existing body overflow rather than clearing it", () => {
		document.body.style.overflow = "scroll";
		const { unmount } = renderHook(() => useScrollLock(true));
		expect(document.body.style.overflow).toBe("hidden");
		unmount();
		expect(document.body.style.overflow).toBe("scroll");
	});

	it("restores the original padding-right after compensating for the scrollbar", () => {
		document.body.style.paddingRight = "7px";
		const { unmount } = renderHook(() => useScrollLock(true));
		unmount();
		expect(document.body.style.paddingRight).toBe("7px");
	});
});
