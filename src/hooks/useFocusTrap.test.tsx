import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function TrapHarness({ active }: { active: boolean }) {
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, active);
	return (
		<div ref={ref}>
			<button data-testid="first">First</button>
			<button data-testid="middle">Middle</button>
			<button data-testid="last">Last</button>
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
});
