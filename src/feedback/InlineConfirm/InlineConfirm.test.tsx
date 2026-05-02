import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InlineConfirm } from ".";
import { Button } from "../../inputs/Button";
describe("InlineConfirm", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders trigger initially (idle state)", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				promptText="Are you sure?"
			/>,
		);
		expect(screen.getByText("Delete")).toBeInTheDocument();
		expect(screen.queryByText("Are you sure?")).toBeNull();
	});

	it("clicking trigger reveals prompt + Yes/No buttons", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				promptText="Delete it?"
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(screen.getByText("Delete it?")).toBeInTheDocument();
		expect(screen.getByText("Yes")).toBeInTheDocument();
		expect(screen.getByText("No")).toBeInTheDocument();
		expect(screen.queryByText("Delete")).toBeNull();
	});

	it("clicking confirm fires onConfirm and reverts to idle", () => {
		const onConfirm = vi.fn();
		render(<InlineConfirm trigger={(p) => <Button {...p}>Delete</Button>} onConfirm={onConfirm} />);
		fireEvent.click(screen.getByText("Delete"));
		fireEvent.click(screen.getByText("Yes"));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Delete")).toBeInTheDocument(); // back to idle
		expect(screen.queryByText("Yes")).toBeNull();
	});

	it("clicking cancel fires onCancel and reverts", () => {
		const onCancel = vi.fn();
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				onCancel={onCancel}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		fireEvent.click(screen.getByText("No"));
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(screen.queryByText("Yes")).toBeNull();
	});

	it("auto-cancels after default 4000ms", () => {
		const onCancel = vi.fn();
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				onCancel={onCancel}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(screen.getByText("Yes")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(onCancel).toHaveBeenCalled();
		expect(screen.queryByText("Yes")).toBeNull();
	});

	it("custom autoCancelMs={10000} delays auto-cancel", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				autoCancelMs={10000}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(screen.getByText("Yes")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(6000);
		});
		expect(screen.queryByText("Yes")).toBeNull();
	});

	it("autoCancelMs={Infinity} disables auto-cancel", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				autoCancelMs={Number.POSITIVE_INFINITY}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		act(() => {
			vi.advanceTimersByTime(30_000);
		});
		expect(screen.getByText("Yes")).toBeInTheDocument();
	});

	it("Escape key reverts to idle", () => {
		const onCancel = vi.fn();
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				onCancel={onCancel}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onCancel).toHaveBeenCalled();
		expect(screen.queryByText("Yes")).toBeNull();
	});

	it("mouse-enter pauses the auto-cancel timer", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Delete</Button>}
				onConfirm={() => {}}
				autoCancelMs={4000}
			/>,
		);
		fireEvent.click(screen.getByText("Delete"));
		// Advance 1500ms with no hover
		act(() => {
			vi.advanceTimersByTime(1500);
		});
		// Hover the prompt row (by group)
		const row = screen.getByRole("group");
		fireEvent.mouseEnter(row);
		// Advance another 4000ms - timer should be paused so prompt stays
		act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(screen.getByText("Yes")).toBeInTheDocument();
	});

	it("confirmVariant='primary' uses Button data-variant='primary' for the Yes button", () => {
		render(
			<InlineConfirm
				trigger={(p) => <Button {...p}>Send</Button>}
				onConfirm={() => {}}
				confirmVariant="primary"
			/>,
		);
		fireEvent.click(screen.getByText("Send"));
		const yes = screen.getByText("Yes");
		// Yes is a <Button>, which sets data-variant on its root <button>
		expect(yes.closest("button")).toHaveAttribute("data-variant", "primary");
	});
});
