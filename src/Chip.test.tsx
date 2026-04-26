import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
	it("renders children", () => {
		const { getByText } = render(<Chip>React</Chip>);
		expect(getByText("React")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Chip ref={ref}>x</Chip>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("does not render × when onRemove absent", () => {
		const { queryByRole } = render(<Chip>x</Chip>);
		expect(queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders × button when onRemove present and calls it", () => {
		const onRemove = vi.fn();
		const { getByRole } = render(<Chip onRemove={onRemove}>x</Chip>);
		const removeBtn = getByRole("button", { name: /remove/i });
		fireEvent.click(removeBtn);
		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	it("× click stops propagation (does not bubble to parent click handler)", () => {
		const onParentClick = vi.fn();
		const onRemove = vi.fn();
		const { getByRole } = render(
			// biome-ignore lint/a11y/useKeyWithClickEvents: test harness needs raw click event
			<div onClick={onParentClick}>
				<Chip onRemove={onRemove}>x</Chip>
			</div>,
		);
		fireEvent.click(getByRole("button", { name: /remove/i }));
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onParentClick).not.toHaveBeenCalled();
	});

	it("renders all tones (incl. tag)", () => {
		const tones = ["default", "match", "miss", "learning", "tag"] as const;
		for (const tone of tones) {
			const { unmount } = render(<Chip tone={tone}>{tone}</Chip>);
			unmount();
		}
	});

	it("renders leading icon when icon prop set", () => {
		const { getByTestId } = render(
			<Chip icon={<span data-testid="chip-icon">★</span>}>Pinned</Chip>,
		);
		expect(getByTestId("chip-icon")).toBeInTheDocument();
	});
});
