import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl, type SegmentedOption } from ".";
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

const TONED_OPTIONS: SegmentedOption[] = [
	{
		value: "advanced",
		label: "Advanced",
		tone: { fg: "var(--green)", activeBg: "rgba(47,122,82,0.10)" },
	},
	{ value: "wait", label: "Wait", tone: { fg: "var(--ink-3)", activeBg: "var(--cream-2)" } },
	{
		value: "closed",
		label: "Closed",
		tone: { fg: "var(--red)", activeBg: "rgba(153,27,27,0.08)" },
	},
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
		// B is disabled - should jump to C
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

	it("toned active option applies its tone fg/activeBg inline; inactive toned options do not", () => {
		render(
			<SegmentedControl
				options={TONED_OPTIONS}
				value="advanced"
				onChange={() => {}}
				ariaLabel="Outcome"
			/>,
		);
		const active = screen.getByText("Advanced") as HTMLElement;
		// Active toned option paints fg + activeBg inline (overrides the default amber rule).
		expect(active.getAttribute("data-toned")).toBe("true");
		expect(active.style.color).toBe("var(--green)");
		// jsdom normalizes rgba whitespace/precision, so assert on the parsed parts.
		expect(active.style.background.replace(/\s/g, "")).toBe("rgba(47,122,82,0.1)");
		// Inactive toned options carry no inline tone styling and no data-toned flag.
		const inactive = screen.getByText("Closed") as HTMLElement;
		expect(inactive.getAttribute("data-toned")).toBeNull();
		expect(inactive.style.color).toBe("");
		expect(inactive.style.background).toBe("");
	});

	it("tone is optional: tone-less options render without inline tone styling (backward compatible)", () => {
		const { container } = render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		const active = container.querySelector("button[role='radio'][data-active]") as HTMLElement;
		expect(active.getAttribute("data-toned")).toBeNull();
		expect(active.style.color).toBe("");
		expect(active.style.background).toBe("");
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

	it("deselectable: clicking the active segment fires onChange with empty string", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={onChange}
				ariaLabel="View mode"
				deselectable
			/>,
		);
		fireEvent.click(screen.getByText("Week"));
		expect(onChange).toHaveBeenCalledWith("");
	});

	it("deselectable: clicking an inactive segment still selects it normally", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={onChange}
				ariaLabel="View mode"
				deselectable
			/>,
		);
		fireEvent.click(screen.getByText("Month"));
		expect(onChange).toHaveBeenCalledWith("month");
	});

	it("without deselectable: clicking the active segment re-selects it (backward compatible)", () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value="week"
				onChange={onChange}
				ariaLabel="View mode"
			/>,
		);
		fireEvent.click(screen.getByText("Week"));
		expect(onChange).toHaveBeenCalledWith("week");
	});

	it("non-matching value (e.g. empty string) renders all segments inactive", () => {
		render(
			<SegmentedControl
				options={VIEW_OPTIONS}
				value=""
				onChange={() => {}}
				ariaLabel="View mode"
			/>,
		);
		for (const radio of screen.getAllByRole("radio")) {
			expect(radio.getAttribute("aria-checked")).toBe("false");
			expect(radio.getAttribute("data-active")).toBeNull();
		}
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
