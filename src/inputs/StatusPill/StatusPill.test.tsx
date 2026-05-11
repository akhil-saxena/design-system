import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { StatusPill, type StatusPillStage } from ".";

describe("StatusPill", () => {
	it("renders children", () => {
		const { getByText } = render(<StatusPill stage="applied">Applied</StatusPill>);
		expect(getByText("Applied")).toBeInTheDocument();
	});

	it("defaults to interactive <button type=button>", () => {
		const { container } = render(<StatusPill stage="offer">Offer</StatusPill>);
		const btn = container.querySelector("button") as HTMLButtonElement;
		expect(btn).not.toBeNull();
		expect(btn.type).toBe("button");
		expect(btn.dataset.interactive).toBe("true");
	});

	it("renders <span> when interactive=false and ignores onClick", () => {
		const { container } = render(
			<StatusPill stage="offer" interactive={false}>
				Offer
			</StatusPill>,
		);
		expect(container.querySelector("button")).toBeNull();
		const span = container.querySelector("span.ds-atom-statuspill") as HTMLSpanElement;
		expect(span).not.toBeNull();
		expect(span.dataset.interactive).toBe("false");
	});

	it("fires onClick when interactive", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<StatusPill stage="screening" onClick={onClick}>
				Screening
			</StatusPill>,
		);
		fireEvent.click(getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("emits data-stage for every stage", () => {
		const stages: StatusPillStage[] = [
			"wishlist",
			"applied",
			"screening",
			"interviewing",
			"offer",
			"closed",
		];
		for (const stage of stages) {
			const { container, unmount } = render(<StatusPill stage={stage}>{stage}</StatusPill>);
			const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
			expect(el.dataset.stage).toBe(stage);
			unmount();
		}
	});

	it("renders chevron only when withChevron is set", () => {
		const { container, rerender } = render(<StatusPill stage="applied">Applied</StatusPill>);
		expect(container.querySelector(".ds-atom-statuspill-chev")).toBeNull();
		rerender(
			<StatusPill stage="applied" withChevron>
				Applied
			</StatusPill>,
		);
		expect(container.querySelector(".ds-atom-statuspill-chev")).not.toBeNull();
	});

	it("forwards ref to <button> when interactive", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<StatusPill ref={ref} stage="applied">
				x
			</StatusPill>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("forwards ref to <span> when interactive=false", () => {
		const ref = createRef<HTMLSpanElement>();
		render(
			<StatusPill ref={ref} stage="applied" interactive={false}>
				x
			</StatusPill>,
		);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("merges custom className", () => {
		const { container } = render(
			<StatusPill stage="applied" className="my-class">
				x
			</StatusPill>,
		);
		const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
		expect(el.className).toContain("ds-atom-statuspill");
		expect(el.className).toContain("my-class");
	});
});
