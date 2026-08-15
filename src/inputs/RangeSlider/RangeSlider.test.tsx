import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { RangeSlider } from ".";
describe("RangeSlider", () => {
	it("renders native range input with current value", () => {
		render(<RangeSlider value={50} onChange={() => {}} ariaLabel="x" />);
		expect(screen.getByRole("slider")).toHaveValue("50");
	});

	it("native input change calls onChange with numeric value", () => {
		const fn = vi.fn();
		render(<RangeSlider value={50} onChange={fn} ariaLabel="x" />);
		fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
		expect(fn).toHaveBeenCalled();
		expect(fn.mock.calls[0]![0]).toBe(75);
	});

	it("pct correctly computed for value=50, min=0, max=100", () => {
		const { container } = render(
			<RangeSlider value={50} min={0} max={100} onChange={() => {}} ariaLabel="x" />,
		);
		const fill = container.querySelector<HTMLElement>(".ds-atom-range-fill");
		const thumb = container.querySelector<HTMLElement>(".ds-atom-range-thumb");
		expect(fill?.style.width).toBe("50%");
		expect(thumb?.style.left).toBe("50%");
	});

	it("valueFormat displays formatted string alongside label", () => {
		render(
			<RangeSlider
				value={120000}
				min={30000}
				max={300000}
				label="Salary"
				valueFormat={(v) => `$${v.toLocaleString()}`}
				onChange={() => {}}
			/>,
		);
		expect(screen.getByText("Salary")).toBeInTheDocument();
		expect(screen.getByText("$120,000")).toBeInTheDocument();
	});

	it("disabled adds data-disabled and disables native input", () => {
		const { container } = render(
			<RangeSlider value={50} onChange={() => {}} disabled ariaLabel="x" />,
		);
		const wrap = container.querySelector(".ds-atom-range");
		expect(wrap?.getAttribute("data-disabled")).toBe("true");
		expect(screen.getByRole("slider")).toBeDisabled();
	});

	it("min / max / step propagate to native input", () => {
		render(<RangeSlider value={50} min={10} max={90} step={5} onChange={() => {}} ariaLabel="x" />);
		const input = screen.getByRole("slider");
		expect(input).toHaveAttribute("min", "10");
		expect(input).toHaveAttribute("max", "90");
		expect(input).toHaveAttribute("step", "5");
	});

	it("forwards ref to native input", () => {
		const ref = createRef<HTMLInputElement>();
		render(<RangeSlider ref={ref} value={50} onChange={() => {}} ariaLabel="x" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
		expect(ref.current?.type).toBe("range");
	});
});

describe("RangeSlider — drag tracking", () => {
	function root(container: HTMLElement) {
		return container.querySelector(".ds-atom-range") as HTMLElement;
	}

	it("suppresses the fill transition while the pointer is down", () => {
		// The thumb is positioned with no transition but the fill animated its
		// width, so the amber trailed the knob for the whole drag — the lag the
		// user sees. The glide is kept for discrete changes, so it is disabled
		// only for the duration of the drag.
		const { container } = render(<RangeSlider value={50} onChange={() => {}} aria-label="Vol" />);
		const input = screen.getByRole("slider");

		expect(root(container).getAttribute("data-dragging")).toBeNull();
		fireEvent.pointerDown(input);
		expect(root(container).getAttribute("data-dragging")).toBe("true");
		fireEvent.pointerUp(input);
		expect(root(container).getAttribute("data-dragging")).toBeNull();
	});

	it("clears the drag flag when the gesture is cancelled", () => {
		// A drag interrupted by a scroll gesture or the pointer leaving the window
		// fires pointercancel, not pointerup. Without this the flag would stick on
		// and the glide would stay disabled for good.
		const { container } = render(<RangeSlider value={50} onChange={() => {}} aria-label="Vol" />);
		const input = screen.getByRole("slider");

		fireEvent.pointerDown(input);
		fireEvent.pointerCancel(input);
		expect(root(container).getAttribute("data-dragging")).toBeNull();
	});
});
