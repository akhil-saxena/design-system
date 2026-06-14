import { act, render, screen } from "@testing-library/react";
import { type ReactNode, useEffect, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type SnackbarOptions, SnackbarProvider, useSnackbar } from ".";

function FireOnMount({
	message,
	opts,
	onId,
}: {
	message: ReactNode;
	opts?: SnackbarOptions;
	onId?: (id: number) => void;
}) {
	const snack = useSnackbar();
	const fired = useRef(false);
	useEffect(() => {
		if (fired.current) return;
		fired.current = true;
		const id = snack.show(message, opts);
		onId?.(id);
	}, [snack, message, opts, onId]);
	return null;
}

describe("Snackbar", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("throws when useSnackbar() is called outside SnackbarProvider", () => {
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		function HookCaller() {
			useSnackbar();
			return null;
		}
		expect(() => render(<HookCaller />)).toThrow(
			/useSnackbar must be used within a <SnackbarProvider>/,
		);
		errSpy.mockRestore();
	});

	it("renders the message with role='status' for neutral tone", () => {
		render(
			<SnackbarProvider>
				<FireOnMount message="Application deleted." opts={{ duration: Number.POSITIVE_INFINITY }} />
			</SnackbarProvider>,
		);
		const node = screen.getByRole("status");
		expect(node).toHaveAttribute("data-tone", "neutral");
		expect(node).toHaveTextContent("Application deleted.");
	});

	it("renders an action button that fires onClick then dismisses", () => {
		const onClick = vi.fn();
		render(
			<SnackbarProvider>
				<FireOnMount
					message="Deleted."
					opts={{ duration: Number.POSITIVE_INFINITY, action: { label: "UNDO", onClick } }}
				/>
			</SnackbarProvider>,
		);
		const btn = screen.getByRole("button", { name: "UNDO" });
		act(() => {
			btn.click();
		});
		expect(onClick).toHaveBeenCalledTimes(1);
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(screen.queryByText("Deleted.")).toBeNull();
	});

	it("renders the progress bar when progress=true AND duration is finite", () => {
		render(
			<SnackbarProvider>
				<FireOnMount message="Deleting…" opts={{ progress: true, duration: 4000 }} />
			</SnackbarProvider>,
		);
		const bar = screen.getByTestId("ds-atom-snackbar-progress");
		expect(bar).toBeInTheDocument();
		expect(bar).toHaveClass("ds-atom-snackbar-progress");
		// Bar animation references the depletion keyframe over the duration.
		expect(bar.style.animation).toContain("ds-atom-snackbar-progress");
		expect(bar.style.animation).toContain("4000ms");
	});

	it("does NOT render the progress bar when progress is omitted", () => {
		render(
			<SnackbarProvider>
				<FireOnMount message="No bar" opts={{ duration: 4000 }} />
			</SnackbarProvider>,
		);
		expect(screen.queryByTestId("ds-atom-snackbar-progress")).toBeNull();
	});

	it("does NOT render the progress bar when duration is Infinity even if progress=true", () => {
		render(
			<SnackbarProvider>
				<FireOnMount
					message="Persistent"
					opts={{ progress: true, duration: Number.POSITIVE_INFINITY }}
				/>
			</SnackbarProvider>,
		);
		expect(screen.queryByTestId("ds-atom-snackbar-progress")).toBeNull();
	});

	it("auto-dismisses after duration", () => {
		render(
			<SnackbarProvider>
				<FireOnMount message="Bye" opts={{ progress: true, duration: 4000 }} />
			</SnackbarProvider>,
		);
		expect(screen.getByText("Bye")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(4000 + 250);
		});
		expect(screen.queryByText("Bye")).toBeNull();
	});
});
