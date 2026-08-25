import { act, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from ".";
function FireOnMount({
	tone,
	message,
	duration,
	onId,
}: {
	tone: "success" | "error" | "info" | "warning";
	message: string;
	duration?: number;
	onId?: (id: number) => void;
}) {
	const toast = useToast();
	const fired = useRef(false);
	useEffect(() => {
		if (fired.current) return;
		fired.current = true;
		const id = toast[tone](message, duration !== undefined ? { duration } : undefined);
		onId?.(id);
	}, [toast, tone, message, duration, onId]);
	return null;
}

type ToastApi = ReturnType<typeof useToast>;

const INF = { duration: Number.POSITIVE_INFINITY };

/** Hands the imperative api back to the test so toasts can be fired across separate acts. */
function CaptureApi({ onReady }: { onReady: (api: ToastApi) => void }) {
	const toast = useToast();
	useEffect(() => {
		onReady(toast);
	}, [toast, onReady]);
	return null;
}

/**
 * The region as the user sees it: `total` counts rendered nodes, `live` counts only
 * those NOT already sliding out. The cap is on live toasts - a node carrying
 * `data-dismissing` is mid-animation and will remove itself, so it does not occupy a slot.
 */
function regionState() {
	const nodes = Array.from(document.querySelectorAll(".ds-atom-toast"));
	const live = nodes.filter((n) => n.getAttribute("data-dismissing") !== "true");
	return {
		total: nodes.length,
		live: live.length,
		liveMessages: live.map((n) => n.querySelector(".ds-atom-toast-msg")?.textContent ?? ""),
	};
}

describe("Toast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("throws when useToast() is called outside ToastProvider", () => {
		// Suppress React's error boundary console output.
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		function HookCaller() {
			useToast();
			return null;
		}
		expect(() => render(<HookCaller />)).toThrow(/useToast must be used within a <ToastProvider>/);
		errSpy.mockRestore();
	});

	it("toast.success renders a toast with role='status'", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="success" message="Saved" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		const node = screen.getByRole("status");
		expect(node).toHaveAttribute("data-tone", "success");
		expect(node).toHaveTextContent("Saved");
	});

	it("toast.error renders a toast with role='alert' and data-tone='error'", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="error" message="Boom" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		const node = screen.getByRole("alert");
		expect(node).toHaveAttribute("data-tone", "error");
		expect(node).toHaveTextContent("Boom");
	});

	it("warning uses role='alert' and info uses role='status'", () => {
		const { unmount } = render(
			<ToastProvider>
				<FireOnMount tone="warning" message="W" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "warning");
		unmount();

		render(
			<ToastProvider>
				<FireOnMount tone="info" message="I" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		expect(screen.getByRole("status")).toHaveAttribute("data-tone", "info");
	});

	it("auto-dismisses after default 3000ms", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="success" message="Bye" />
			</ToastProvider>,
		);
		expect(screen.getByText("Bye")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		// 200ms slide-out grace
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(screen.queryByText("Bye")).toBeNull();
	});

	it("custom duration override delays auto-dismiss", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="success" message="Late" duration={5000} />
			</ToastProvider>,
		);
		expect(screen.getByText("Late")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(screen.getByText("Late")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(2000 + 250);
		});
		expect(screen.queryByText("Late")).toBeNull();
	});

	it("duration: Infinity disables auto-dismiss", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="warning" message="Stay" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		expect(screen.getByText("Stay")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(10_000);
		});
		expect(screen.getByText("Stay")).toBeInTheDocument();
	});

	it("4th toast drops the oldest (FIFO max=3)", () => {
		function FireFour() {
			const toast = useToast();
			const fired = useRef(false);
			useEffect(() => {
				if (fired.current) return;
				fired.current = true;
				toast.info("one", { duration: Number.POSITIVE_INFINITY });
				toast.success("two", { duration: Number.POSITIVE_INFINITY });
				toast.warning("three", { duration: Number.POSITIVE_INFINITY });
				toast.error("four", { duration: Number.POSITIVE_INFINITY });
			}, [toast]);
			return null;
		}
		render(
			<ToastProvider>
				<FireFour />
			</ToastProvider>,
		);
		// Drop animation grace
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(screen.queryByText("one")).toBeNull();
		expect(screen.getByText("two")).toBeInTheDocument();
		expect(screen.getByText("three")).toBeInTheDocument();
		expect(screen.getByText("four")).toBeInTheDocument();
	});

	// --- F-8: overflow must be computed from LIVE toasts, not from rendered nodes. ---
	// A node already marked `dismissing` is mid-slide-out and removes itself after
	// SLIDE_OUT_MS. Counting it as occupying a slot makes a toast that arrives inside
	// that window evict two live toasts instead of one, settling BELOW the cap.

	it("a toast arriving during a slide-out evicts only one live toast (F-8)", () => {
		let api!: ToastApi;
		const capture = (a: ToastApi) => {
			api = a;
		};
		render(
			<ToastProvider>
				<CaptureApi onReady={capture} />
			</ToastProvider>,
		);

		act(() => {
			api.info("one", INF);
			api.success("two", INF);
			api.warning("three", INF);
		});
		expect(regionState()).toMatchObject({ total: 3, live: 3 });

		// 4th: the oldest starts its 200ms slide-out. 4 nodes / 3 live is the deliberate
		// window the FIFO-drop test above already encodes - it must stay exactly that.
		act(() => {
			api.error("four", INF);
		});
		expect(regionState()).toMatchObject({ total: 4, live: 3 });

		// 5th arrives INSIDE that window, while "one" still carries data-dismissing.
		act(() => {
			vi.advanceTimersByTime(100);
		});
		act(() => {
			api.success("five", INF);
		});
		// Only "two" may be evicted. Counting the dismissing "one" would evict "three" too.
		expect(regionState().live).toBe(3);

		act(() => {
			vi.advanceTimersByTime(400);
		});
		expect(regionState()).toMatchObject({ total: 3, live: 3 });
		expect(regionState().liveMessages).toEqual(["three", "four", "five"]);
	});

	it("a sixth toast during the window still settles at 3 live (F-8 boundary)", () => {
		let api!: ToastApi;
		const capture = (a: ToastApi) => {
			api = a;
		};
		render(
			<ToastProvider>
				<CaptureApi onReady={capture} />
			</ToastProvider>,
		);

		act(() => {
			api.info("one", INF);
			api.success("two", INF);
			api.warning("three", INF);
		});
		act(() => {
			api.error("four", INF);
		});
		act(() => {
			vi.advanceTimersByTime(100);
		});
		act(() => {
			api.success("five", INF);
		});
		// 6th, with two removals still in flight - the case that would compound the defect.
		act(() => {
			vi.advanceTimersByTime(50);
		});
		act(() => {
			api.error("six", INF);
		});
		expect(regionState().live).toBe(3);

		act(() => {
			vi.advanceTimersByTime(400);
		});
		expect(regionState()).toMatchObject({ total: 3, live: 3 });
		expect(regionState().liveMessages).toEqual(["four", "five", "six"]);
	});

	it("a fifth toast after the window closes is unaffected (F-8 control)", () => {
		let api!: ToastApi;
		const capture = (a: ToastApi) => {
			api = a;
		};
		render(
			<ToastProvider>
				<CaptureApi onReady={capture} />
			</ToastProvider>,
		);

		act(() => {
			api.info("one", INF);
			api.success("two", INF);
			api.warning("three", INF);
		});
		act(() => {
			api.error("four", INF);
		});
		// Let the slide-out finish: no dismissing node remains, so prev.length == live.
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(regionState()).toMatchObject({ total: 3, live: 3 });

		act(() => {
			api.success("five", INF);
		});
		expect(regionState().live).toBe(3);

		act(() => {
			vi.advanceTimersByTime(400);
		});
		expect(regionState()).toMatchObject({ total: 3, live: 3 });
		expect(regionState().liveMessages).toEqual(["three", "four", "five"]);
	});

	it("dismiss(id) is callable without throwing", () => {
		let capturedId = -1;
		render(
			<ToastProvider>
				<FireOnMount
					tone="success"
					message="Bye-now"
					duration={Number.POSITIVE_INFINITY}
					onId={(id) => {
						capturedId = id;
					}}
				/>
			</ToastProvider>,
		);
		expect(screen.getByText("Bye-now")).toBeInTheDocument();
		expect(capturedId).toBeGreaterThan(0);
	});

	it("clicking the X button dismisses that toast", () => {
		render(
			<ToastProvider>
				<FireOnMount tone="info" message="closeme" duration={Number.POSITIVE_INFINITY} />
			</ToastProvider>,
		);
		const closeBtn = screen.getByLabelText("Dismiss notification");
		act(() => {
			closeBtn.click();
		});
		// Slide-out grace
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(screen.queryByText("closeme")).toBeNull();
	});
});
