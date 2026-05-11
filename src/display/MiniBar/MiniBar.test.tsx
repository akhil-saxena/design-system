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
		const allStyled = container.querySelectorAll<HTMLElement>("[style]");
		const barDivs = Array.from(allStyled).filter((el) => el.style.borderRadius === "4px 4px 0 0");
		// data[1] = 10 = max, so its bar should be 70%
		const maxBar = barDivs[1];
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
