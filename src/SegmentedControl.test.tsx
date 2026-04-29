import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const VIEW_OPTIONS: SegmentedOption[] = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
];

const TWO_OPTIONS: SegmentedOption[] = [
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
];

const WITH_DISABLED: SegmentedOption[] = [
	{ value: "a", label: "A" },
	{ value: "b", label: "B", disabled: true },
	{ value: "c", label: "C" },
];

describe("SegmentedControl", () => {
	it("renders all options as role=radio inside role=radiogroup", () => {
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		expect(screen.getByRole("radiogroup")).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(3);
	});

	it("aria-checked reflects the active value", () => {
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		expect(screen.getByText("Day").getAttribute("aria-checked")).toBe("false");
		expect(screen.getByText("Week").getAttribute("aria-checked")).toBe("true");
		expect(screen.getByText("Month").getAttribute("aria-checked")).toBe("false");
	});

	it("clicking an option fires onChange with the correct value", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.click(screen.getByText("Month"));
		expect(onChange).toHaveBeenCalledWith("month");
	});

	it("ArrowRight moves to next option and fires onChange", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
		expect(onChange).toHaveBeenCalledWith("month");
	});

	it("ArrowLeft moves to previous option and wraps from first to last", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="day"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
		expect(onChange).toHaveBeenCalledWith("month");
	});

	it("Home key jumps to first option", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="month"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "Home" });
		expect(onChange).toHaveBeenCalledWith("day");
	});

	it("End key jumps to last option", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="day"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "End" });
		expect(onChange).toHaveBeenCalledWith("month");
	});

	it("ArrowRight skips disabled options", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={WITH_DISABLED}
				value="a"
				onChange={onChange}
				ariaLabel="Letters"
			/>,
		);
		// B is disabled — should jump to C
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
		expect(onChange).toHaveBeenCalledWith("c");
	});

	it("tabIndex=0 is only on the active option", () => {
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		const radios = screen.getAllByRole("radio");
		expect(radios[0].getAttribute("tabindex")).toBe("-1"); // Day
		expect(radios[1].getAttribute("tabindex")).toBe("0"); // Week (active)
		expect(radios[2].getAttribute("tabindex")).toBe("-1"); // Month
	});

	it("disabled group: clicking does not fire onChange", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={TWO_OPTIONS}
				value="active"
				onChange={onChange}
				ariaLabel="Status"
				disabled
			/>,
		);
		fireEvent.click(screen.getByText("Archived"));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("disabled group has data-disabled=true and keyboard is no-op", () => {
		const onChange = vi.fn();
		const { container } = render(
			<SegmentedControl
				options={TWO_OPTIONS}
				value="active"
				onChange={onChange}
				ariaLabel="Status"
				disabled
			/>,
		);
		expect(container.querySelector(".ds-atom-segmented")?.getAttribute("data-disabled")).toBe(
			"true",
		);
		fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("data-active is set on the active option button", () => {
		const { container } = render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		const buttons = container.querySelectorAll("button[role='radio']");
		expect(buttons[0].getAttribute("data-active")).toBeNull();
		expect(buttons[1].getAttribute("data-active")).toBe("true");
		expect(buttons[2].getAttribute("data-active")).toBeNull();
	});

	it("renders with size prop applied as data-size", () => {
		const { container } = render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
				size="lg"
			/>,
		);
		expect(container.querySelector(".ds-atom-segmented")?.getAttribute("data-size")).toBe("lg");
	});

	it("supports 2-option minimum", () => {
		render(
			<SegmentedControl
				options={TWO_OPTIONS}
				value="active"
				onChange={() => {}}
				ariaLabel="Status"
			/>,
		);
		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("supports 5-option maximum", () => {
		const fiveOptions: SegmentedOption[] = [
			{ value: "a", label: "A" },
			{ value: "b", label: "B" },
			{ value: "c", label: "C" },
			{ value: "d", label: "D" },
			{ value: "e", label: "E" },
		];
		render(
			<SegmentedControl
				options={fiveOptions}
				value="a"
				onChange={() => {}}
				ariaLabel="Five options"
			/>,
		);
		expect(screen.getAllByRole("radio")).toHaveLength(5);
	});
});
