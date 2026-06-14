import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLongPress } from "./useLongPress";

function Harness({ onLongPress, ms }: { onLongPress: () => void; ms?: number }) {
	const handlers = useLongPress(onLongPress, ms);
	return (
		<div data-testid="target" {...handlers}>
			press me
		</div>
	);
}

describe("useLongPress", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("fires after the hold threshold", () => {
		const onLongPress = vi.fn();
		const { getByTestId } = render(<Harness onLongPress={onLongPress} ms={600} />);
		fireEvent.pointerDown(getByTestId("target"));
		vi.advanceTimersByTime(600);
		expect(onLongPress).toHaveBeenCalledTimes(1);
	});

	it("does not fire if released before the threshold", () => {
		const onLongPress = vi.fn();
		const { getByTestId } = render(<Harness onLongPress={onLongPress} ms={600} />);
		const el = getByTestId("target");
		fireEvent.pointerDown(el);
		vi.advanceTimersByTime(300);
		fireEvent.pointerUp(el);
		vi.advanceTimersByTime(600);
		expect(onLongPress).not.toHaveBeenCalled();
	});

	it("cancels on pointer leave / cancel", () => {
		const onLongPress = vi.fn();
		const { getByTestId } = render(<Harness onLongPress={onLongPress} ms={500} />);
		const el = getByTestId("target");
		fireEvent.pointerDown(el);
		fireEvent.pointerLeave(el);
		vi.advanceTimersByTime(500);
		expect(onLongPress).not.toHaveBeenCalled();
	});
});
