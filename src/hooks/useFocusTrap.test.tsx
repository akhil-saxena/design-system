import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function TrapHarness({ active }: { active: boolean }) {
	const [node, setNode] = useState<HTMLDivElement | null>(null);
	useFocusTrap(node, active);
	return (
		<div ref={setNode}>
			<button data-testid="first">First</button>
			<button data-testid="middle">Middle</button>
			<button data-testid="last">Last</button>
		</div>
	);
}

function EmptyTrapHarness({ active }: { active: boolean }) {
	const [node, setNode] = useState<HTMLDivElement | null>(null);
	useFocusTrap(node, active);
	return (
		<div ref={setNode} tabIndex={-1} data-testid="container">
			<p>No focusable children.</p>
		</div>
	);
}

describe("useFocusTrap", () => {
	it("focuses the first focusable child on activation", () => {
		const { getByTestId } = render(<TrapHarness active={true} />);
		expect(document.activeElement).toBe(getByTestId("first"));
	});

	it("Tab from last wraps to first", () => {
		const { getByTestId } = render(<TrapHarness active={true} />);
		const last = getByTestId("last");
		last.focus();
		fireEvent.keyDown(last, { key: "Tab" });
		expect(document.activeElement).toBe(getByTestId("first"));
	});

	it("Shift+Tab from first wraps to last", () => {
		const { getByTestId } = render(<TrapHarness active={true} />);
		const first = getByTestId("first");
		first.focus();
		fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
		expect(document.activeElement).toBe(getByTestId("last"));
	});

	it("does not intercept Tab when active=false", () => {
		const { getByTestId } = render(<TrapHarness active={false} />);
		expect(document.activeElement).not.toBe(getByTestId("first"));
	});

	it("restores focus on unmount", () => {
		const trigger = document.createElement("button");
		trigger.textContent = "Trigger";
		document.body.appendChild(trigger);
		trigger.focus();
		expect(document.activeElement).toBe(trigger);

		const { unmount } = render(<TrapHarness active={true} />);
		unmount();
		expect(document.activeElement).toBe(trigger);
		document.body.removeChild(trigger);
	});

	it("Tab from outside container pulls focus to first focusable", () => {
		const outsideTrigger = document.createElement("button");
		outsideTrigger.textContent = "Outside";
		document.body.appendChild(outsideTrigger);

		const { getByTestId } = render(<TrapHarness active={true} />);
		// Move focus back outside (simulating focus leak)
		outsideTrigger.focus();
		expect(document.activeElement).toBe(outsideTrigger);

		fireEvent.keyDown(outsideTrigger, { key: "Tab" });
		expect(document.activeElement).toBe(getByTestId("first"));

		document.body.removeChild(outsideTrigger);
	});

	it("Shift+Tab from outside container pulls focus to last focusable", () => {
		const outsideTrigger = document.createElement("button");
		outsideTrigger.textContent = "Outside";
		document.body.appendChild(outsideTrigger);

		const { getByTestId } = render(<TrapHarness active={true} />);
		outsideTrigger.focus();

		fireEvent.keyDown(outsideTrigger, { key: "Tab", shiftKey: true });
		expect(document.activeElement).toBe(getByTestId("last"));

		document.body.removeChild(outsideTrigger);
	});

	it("focuses container itself when no focusable children exist", () => {
		const { getByTestId } = render(<EmptyTrapHarness active={true} />);
		expect(document.activeElement).toBe(getByTestId("container"));
	});

	it("Tab does not escape when container has no focusables", () => {
		const outsideTrigger = document.createElement("button");
		outsideTrigger.textContent = "Outside";
		document.body.appendChild(outsideTrigger);

		const { getByTestId } = render(<EmptyTrapHarness active={true} />);
		const container = getByTestId("container");
		// Focus is on container after activation; Tab should be prevented
		const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
		document.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);

		document.body.removeChild(outsideTrigger);
		// container is from getByTestId — leave to RTL cleanup
		void container;
	});
});
