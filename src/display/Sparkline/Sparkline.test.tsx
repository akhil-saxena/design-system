import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from ".";

describe("Sparkline", () => {
	it("renders an SVG element", () => {
		const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} />);
		expect(container.querySelector("svg")).not.toBeNull();
	});

	it("renders a polyline with normalized points", () => {
		const { container } = render(<Sparkline data={[0, 10]} width={100} height={28} />);
		const polyline = container.querySelector("polyline");
		expect(polyline?.getAttribute("points")).toBe("0,26 100,2");
	});

	it("renders fill path when fill=true (default)", () => {
		const { container } = render(<Sparkline data={[1, 2, 3]} />);
		expect(container.querySelector("path")).not.toBeNull();
	});

	it("omits fill path when fill=false", () => {
		const { container } = render(<Sparkline data={[1, 2, 3]} fill={false} />);
		expect(container.querySelector("path")).toBeNull();
	});

	it("clamps flat data without NaN", () => {
		const { container } = render(<Sparkline data={[5, 5, 5]} />);
		const polyline = container.querySelector("polyline");
		expect(polyline?.getAttribute("points")).not.toContain("NaN");
	});

	it("renders terminal circle at cx=width", () => {
		const { container } = render(<Sparkline data={[1, 2, 3]} width={80} />);
		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("cx")).toBe("80");
	});

	it("returns null for data.length < 2", () => {
		const { container } = render(<Sparkline data={[42]} />);
		expect(container.querySelector("svg")).toBeNull();
	});
});
