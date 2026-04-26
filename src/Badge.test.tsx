import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
	it("renders children", () => {
		const { getByText } = render(<Badge>Upcoming</Badge>);
		expect(getByText("Upcoming")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Badge ref={ref}>x</Badge>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("style prop merges last", () => {
		const { container } = render(<Badge style={{ background: "red" }}>x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.style.background).toContain("red");
	});

	it("renders dot when dot prop is true", () => {
		const { container } = render(
			<Badge tone="upcoming" dot>
				Upcoming
			</Badge>,
		);
		// outer span + inner dot span = 2 spans
		const spans = container.querySelectorAll("span");
		expect(spans.length).toBeGreaterThanOrEqual(2);
	});

	it("renders all tone variants", () => {
		const tones = ["upcoming", "passed", "pending", "done", "count", "neutral"] as const;
		for (const tone of tones) {
			const { unmount } = render(<Badge tone={tone}>{tone}</Badge>);
			unmount();
		}
	});

	it("dotColor override applies to dot background when dot is true", () => {
		const { container } = render(
			<Badge tone="upcoming" dot dotColor="#ff00ff">
				Custom
			</Badge>,
		);
		const dot = container.querySelectorAll("span")[1] as HTMLSpanElement;
		expect(dot.style.background).toContain("rgb(255, 0, 255)");
	});
});
