import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useComposedRefs } from "./useComposedRefs";

describe("useComposedRefs", () => {
	it("forwards node to a function ref", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useComposedRefs(fn));
		const node = document.createElement("div");
		result.current(node);
		expect(fn).toHaveBeenCalledWith(node);
	});

	it("assigns node to an object ref's current", () => {
		const obj = createRef<HTMLDivElement>();
		const { result } = renderHook(() => useComposedRefs(obj));
		const node = document.createElement("div");
		result.current(node);
		expect(obj.current).toBe(node);
	});

	it("forwards to BOTH function and object refs", () => {
		const fn = vi.fn();
		const obj = createRef<HTMLDivElement>();
		const { result } = renderHook(() => useComposedRefs(fn, obj));
		const node = document.createElement("div");
		result.current(node);
		expect(fn).toHaveBeenCalledWith(node);
		expect(obj.current).toBe(node);
	});

	it("tolerates undefined refs without crashing", () => {
		const fn = vi.fn();
		const { result } = renderHook(() => useComposedRefs(undefined, fn, undefined));
		const node = document.createElement("div");
		expect(() => result.current(node)).not.toThrow();
		expect(fn).toHaveBeenCalledWith(node);
	});
});
