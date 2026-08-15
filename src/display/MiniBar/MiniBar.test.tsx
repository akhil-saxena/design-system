import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MiniBar } from ".";

describe("MiniBar", () => {
	it("renders one column div per data point", () => {
		const { container } = render(<MiniBar data={[5, 8, 3]} />);
		expect(container.firstChild?.childNodes.length).toBe(3);
	});

	it("tallest bar gets height 70%", () => {
		const { container } = render(<MiniBar data={[5, 10, 3]} />);
		// Selected by class, not by an inline borderRadius: the static box moved
		// into primitives.css so only the value-derived height stays inline.
		const barDivs = Array.from(container.querySelectorAll<HTMLElement>(".ds-atom-minibar-bar"));
		// data[1] = 10 = max, so its bar should be 70%
		const maxBar = barDivs[1]!;
		expect(maxBar.style.height).toBe("70%");
	});

	it("renders value labels above bars", () => {
		render(<MiniBar data={[5, 8, 3]} />);
		expect(screen.getByText("5")).toBeInTheDocument();
		expect(screen.getByText("8")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("renders category labels when labels prop provided", () => {
		render(<MiniBar data={[5, 8, 3]} labels={["A", "B", "C"]} />);
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.getByText("C")).toBeInTheDocument();
	});

	it("omits category labels when labels prop absent", () => {
		render(<MiniBar data={[5, 8, 3]} />);
		expect(screen.queryByText("A")).not.toBeInTheDocument();
		expect(screen.queryByText("B")).not.toBeInTheDocument();
		expect(screen.queryByText("C")).not.toBeInTheDocument();
	});
});

describe("MiniBar — degenerate data", () => {
	function barHeights(container: HTMLElement): string[] {
		return [...container.querySelectorAll<HTMLElement>(".ds-atom-minibar-bar")].map(
			(b) => b.style.height,
		);
	}

	it("renders an all-zero series as empty bars, not NaN", () => {
		// An all-zero series is a normal state — "no sales yet this week" — but it
		// makes the max 0, and the height was computed as 0/0.
		const { container } = render(<MiniBar data={[0, 0, 0]} />);
		for (const h of barHeights(container)) {
			expect(h).not.toContain("NaN");
			expect(h).toBe("0%");
		}
	});

	it("renders nothing rather than crashing on an empty series", () => {
		// Math.max() with no arguments is -Infinity.
		const { container } = render(<MiniBar data={[]} />);
		expect(barHeights(container)).toHaveLength(0);
	});

	it("clamps a negative datum to an empty bar instead of inverting it", () => {
		const { container } = render(<MiniBar data={[-5, 10]} />);
		expect(barHeights(container)[0]).toBe("0%");
	});
});
