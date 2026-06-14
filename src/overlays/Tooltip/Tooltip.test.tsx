import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from ".";
// Helper: advance fake timers AND flush React state updates / portal mount
// effects in the correct order. Tooltip schedules a setTimeout(setIsOpen,
// delay); then DSPortal's useEffect flips mounted=true on the next tick.
// Wrapping in act() processes both the timer callback and the resulting
// effect chain so portal-rendered DOM is queryable after this returns.
function advanceAndFlush(ms: number) {
	act(() => {
		vi.advanceTimersByTime(ms);
	});
}

describe("Tooltip", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("throws when given multiple children (React.Children.only)", () => {
		// Suppress the React error-boundary log noise during the throw assertion.
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(
				<Tooltip content="Help">
					<button type="button">A</button>
					<button type="button">B</button>
				</Tooltip>,
			),
		).toThrow();
		errorSpy.mockRestore();
	});

	it("opens after 150ms on mouseenter (default delay)", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		expect(screen.queryByRole("tooltip")).toBeNull();
		advanceAndFlush(149);
		expect(screen.queryByRole("tooltip")).toBeNull();
		advanceAndFlush(1);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
		expect(screen.getByRole("tooltip")).toHaveTextContent("Hello");
	});

	it("clears the open timer on mouseleave (no late open)", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(100);
		fireEvent.mouseLeave(trigger);
		advanceAndFlush(200);
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("opens after 150ms on focus (parity with hover - Path A)", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.focus(trigger);
		expect(screen.queryByRole("tooltip")).toBeNull();
		advanceAndFlush(150);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
	});

	it("closes on blur", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.focus(trigger);
		advanceAndFlush(150);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
		fireEvent.blur(trigger);
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("wires aria-describedby on the trigger when open", () => {
		render(
			<Tooltip content="Help text">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		expect(trigger).not.toHaveAttribute("aria-describedby");
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(150);
		const describedBy = trigger.getAttribute("aria-describedby");
		expect(describedBy).toBeTruthy();
		const surfaceById = document.getElementById(describedBy as string);
		expect(surfaceById?.textContent).toBe("Help text");
	});

	it("renders surface with data-placement matching the prop (all 4 placements)", () => {
		const placements = ["top", "right", "bottom", "left"] as const;
		for (const p of placements) {
			const { unmount } = render(
				<Tooltip content={`p=${p}`} placement={p}>
					<button type="button">Trigger</button>
				</Tooltip>,
			);
			fireEvent.mouseEnter(screen.getByRole("button", { name: "Trigger" }));
			advanceAndFlush(150);
			expect(screen.getByRole("tooltip")).toHaveAttribute("data-placement", p);
			unmount();
		}
	});

	it("portals surface to document.body (not inside wrapper container)", () => {
		const { container } = render(
			<Tooltip content="Help">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button", { name: "Trigger" }));
		advanceAndFlush(150);
		// Tooltip is NOT inside the wrapper container...
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
		// ...it IS inside document.body.
		expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull();
	});

	it("preserves consumer's existing onMouseEnter handler (composition)", () => {
		const consumerSpy = vi.fn();
		render(
			<Tooltip content="Help">
				<button type="button" onMouseEnter={consumerSpy}>
					Trigger
				</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button", { name: "Trigger" }));
		expect(consumerSpy).toHaveBeenCalledTimes(1);
		// Tooltip ALSO scheduled itself to open
		advanceAndFlush(150);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
	});

	it("preserves consumer's existing onMouseLeave handler (composition)", () => {
		const consumerSpy = vi.fn();
		render(
			<Tooltip content="Help">
				<button type="button" onMouseLeave={consumerSpy}>
					Trigger
				</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(150);
		fireEvent.mouseLeave(trigger);
		expect(consumerSpy).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("closes on Escape while open (WCAG 1.4.13 dismissible)", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(150);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
		act(() => {
			fireEvent.keyDown(document, { key: "Escape" });
		});
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("hovering the tooltip surface keeps it open (hoverable)", () => {
		render(
			<Tooltip content="Hello">
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(150);
		const surface = screen.getByRole("tooltip");
		// Moving the cursor onto the surface must not dismiss it.
		fireEvent.mouseEnter(surface);
		advanceAndFlush(300);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
		// Leaving the surface closes it.
		fireEvent.mouseLeave(surface);
		expect(screen.queryByRole("tooltip")).toBeNull();
	});

	it("respects custom delay prop", () => {
		render(
			<Tooltip content="Help" delay={500}>
				<button type="button">Trigger</button>
			</Tooltip>,
		);
		const trigger = screen.getByRole("button", { name: "Trigger" });
		fireEvent.mouseEnter(trigger);
		advanceAndFlush(499);
		expect(screen.queryByRole("tooltip")).toBeNull();
		advanceAndFlush(1);
		expect(screen.queryByRole("tooltip")).not.toBeNull();
	});
});
