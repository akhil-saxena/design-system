import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MiniDonut } from ".";

describe("MiniDonut", () => {
	it("renders two circle elements (track + arc)", () => {
		const { container } = render(<MiniDonut value={50} />);
		expect(container.querySelectorAll("circle").length).toBe(2);
	});

	it("track circle has stroke var(--cream-2)", () => {
		const { container } = render(<MiniDonut value={50} />);
		const circles = container.querySelectorAll("circle");
		expect(circles[0].getAttribute("stroke")).toBe("var(--cream-2)");
	});

	it("arc circle has stroke equal to color prop", () => {
		const { container } = render(<MiniDonut value={50} color="var(--amber)" />);
		const circles = container.querySelectorAll("circle");
		expect(circles[1].getAttribute("stroke")).toBe("var(--amber)");
	});

	it("strokeDashoffset is 0 for value=max", () => {
		const { container } = render(
			<MiniDonut value={100} max={100} size={48} strokeWidth={5} />,
		);
		const circles = container.querySelectorAll("circle");
		expect(
			Number(circles[1].getAttribute("stroke-dashoffset")),
		).toBeCloseTo(0, 1);
	});

	it("strokeDashoffset equals circumference for value=0", () => {
		const { container } = render(
			<MiniDonut value={0} max={100} size={48} strokeWidth={5} />,
		);
		const circles = container.querySelectorAll("circle");
		const circ = 2 * Math.PI * ((48 - 5) / 2);
		expect(
			Number(circles[1].getAttribute("stroke-dashoffset")),
		).toBeCloseTo(circ, 1);
	});

	it("clamps value > max to full circle (offset = 0)", () => {
		const { container } = render(<MiniDonut value={150} max={100} />);
		const circles = container.querySelectorAll("circle");
		expect(
			Number(circles[1].getAttribute("stroke-dashoffset")),
		).toBeCloseTo(0, 1);
	});
});
