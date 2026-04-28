import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyToClipboard } from "./CopyToClipboard";

function mockClipboard(impl: (value: string) => Promise<void>) {
	const writeText = vi.fn(impl);
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText },
		configurable: true,
		writable: true,
	});
	return writeText;
}

describe("CopyToClipboard", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("calls navigator.clipboard.writeText with value on click", async () => {
		const writeText = mockClipboard(() => Promise.resolve());
		render(<CopyToClipboard value="sk_live_test" />);
		const btn = screen.getByRole("button");
		fireEvent.click(btn);
		await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
		expect(writeText).toHaveBeenCalledWith("sk_live_test");
	});

	it("invokes onCopy after successful write and swaps to Check icon", async () => {
		mockClipboard(() => Promise.resolve());
		const onCopy = vi.fn();
		render(<CopyToClipboard value="abc123" onCopy={onCopy} />);
		const btn = screen.getByRole("button");
		fireEvent.click(btn);
		await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
		expect(btn.getAttribute("data-state")).toBe("copied");
		expect(btn.querySelector(".ds-atom-copy-icon-check")).not.toBeNull();
	});

	it("calls onError and keeps Copy icon when clipboard rejects", async () => {
		mockClipboard(() => Promise.reject(new Error("denied")));
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const onError = vi.fn();
		render(<CopyToClipboard value="x" onError={onError} />);
		const btn = screen.getByRole("button");
		fireEvent.click(btn);
		await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
		expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(btn.getAttribute("data-state")).toBe("idle");
		expect(btn.querySelector(".ds-atom-copy-icon-check")).toBeNull();
		expect(warn).toHaveBeenCalled();
	});

	it("reverts icon back to Copy after 2s", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: false });
		mockClipboard(() => Promise.resolve());
		render(<CopyToClipboard value="value" />);
		const btn = screen.getByRole("button");
		await act(async () => {
			fireEvent.click(btn);
			// Flush the awaited writeText microtask + setState
			await vi.advanceTimersByTimeAsync(0);
		});
		expect(btn.getAttribute("data-state")).toBe("copied");
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2000);
		});
		expect(btn.getAttribute("data-state")).toBe("idle");
		expect(btn.querySelector(".ds-atom-copy-icon-check")).toBeNull();
	});
});
