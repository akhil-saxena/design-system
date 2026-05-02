import { act, fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoverCard } from ".";
function TestHarness({
	openDelay,
	closeDelay,
}: {
	openDelay?: number;
	closeDelay?: number;
}) {
	const ref = useRef<HTMLButtonElement>(null);
	return (
		<>
			<button ref={ref} type="button">
				Trigger
			</button>
			<HoverCard anchorRef={ref} openDelay={openDelay} closeDelay={closeDelay}>
				<p>Card content</p>
			</HoverCard>
		</>
	);
}

describe("HoverCard", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("anchor mouseenter + 300ms timer renders portal", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(anchor);
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeNull();
		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
	});

	it("anchor mouseleave + 150ms timer unmounts the panel", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(anchor);
		act(() => {
			vi.advanceTimersByTime(300);
		});
		fireEvent.mouseLeave(anchor);
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeNull();
	});

	it("anchor click pins the card; mouseleave is ignored while pinned", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.click(anchor);
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
		fireEvent.mouseLeave(anchor);
		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
		expect(baseElement.querySelector(".ds-atom-hovercard")?.getAttribute("data-pinned")).toBe(
			"true",
		);
	});

	it("click outside (mousedown on body) unpins + closes the pinned card", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.click(anchor);
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
		fireEvent.mouseDown(document.body);
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeNull();
	});

	it("panel mouseenter cancels pending close timer (cursor-into-card grace)", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(anchor);
		act(() => {
			vi.advanceTimersByTime(300);
		});
		const panel = baseElement.querySelector(".ds-atom-hovercard") as HTMLElement;
		expect(panel).toBeInTheDocument();
		fireEvent.mouseLeave(anchor);
		fireEvent.mouseEnter(panel);
		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
	});

	it("panel mouseleave starts close timer", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(anchor);
		act(() => {
			vi.advanceTimersByTime(300);
		});
		const panel = baseElement.querySelector(".ds-atom-hovercard") as HTMLElement;
		fireEvent.mouseLeave(anchor);
		fireEvent.mouseEnter(panel);
		fireEvent.mouseLeave(panel);
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeNull();
	});

	it("anchor mouseenter cancels pending close (re-entry)", () => {
		const { baseElement, getByRole } = render(<TestHarness />);
		const anchor = getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(anchor);
		act(() => {
			vi.advanceTimersByTime(300);
		});
		fireEvent.mouseLeave(anchor);
		fireEvent.mouseEnter(anchor);
		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(baseElement.querySelector(".ds-atom-hovercard")).toBeInTheDocument();
	});
});
