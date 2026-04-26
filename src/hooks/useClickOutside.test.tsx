import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useClickOutside } from "./useClickOutside";

function Harness({
	handler,
	enabled = true,
}: {
	handler: () => void;
	enabled?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useClickOutside(ref, handler, enabled);
	return (
		<>
			<div ref={ref} data-testid="inside">
				<span data-testid="child">child</span>
			</div>
			<div data-testid="outside">outside</div>
		</>
	);
}

describe("useClickOutside", () => {
	it("fires handler on mousedown outside the ref", () => {
		const handler = vi.fn();
		const { getByTestId } = render(<Harness handler={handler} />);
		fireEvent.mouseDown(getByTestId("outside"));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("does NOT fire handler on mousedown inside the ref", () => {
		const handler = vi.fn();
		const { getByTestId } = render(<Harness handler={handler} />);
		fireEvent.mouseDown(getByTestId("inside"));
		fireEvent.mouseDown(getByTestId("child"));
		expect(handler).not.toHaveBeenCalled();
	});

	it("does NOT fire handler when disabled", () => {
		const handler = vi.fn();
		const { getByTestId } = render(<Harness handler={handler} enabled={false} />);
		fireEvent.mouseDown(getByTestId("outside"));
		expect(handler).not.toHaveBeenCalled();
	});
});
