import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
	it("renders 5 buttons inside role=radiogroup", () => {
		const { container } = render(<StarRating value={0} onChange={() => {}} label="Rating" />);
		expect(screen.getByRole("radiogroup")).toBeInTheDocument();
		expect(container.querySelectorAll(".ds-atom-star-btn").length).toBe(5);
	});

	it("clicking star N calls onChange(N)", () => {
		const fn = vi.fn();
		render(<StarRating value={0} onChange={fn} label="x" />);
		fireEvent.click(screen.getByLabelText("3 stars"));
		expect(fn).toHaveBeenCalledWith(3);
	});

	it("renders amber-vivid fill for stars 1..value, transparent for the rest", () => {
		const { container } = render(<StarRating value={3} onChange={() => {}} label="x" />);
		const svgs = container.querySelectorAll<SVGElement>(".ds-atom-star-btn svg");
		expect(svgs[0].getAttribute("fill")).toBe("var(--amber-vivid)");
		expect(svgs[1].getAttribute("fill")).toBe("var(--amber-vivid)");
		expect(svgs[2].getAttribute("fill")).toBe("var(--amber-vivid)");
		expect(svgs[3].getAttribute("fill")).toBe("transparent");
		expect(svgs[4].getAttribute("fill")).toBe("transparent");
	});

	it("readOnly disables buttons and prevents onChange", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} readOnly label="x" />);
		expect(screen.getByLabelText("5 stars")).toBeDisabled();
		fireEvent.click(screen.getByLabelText("5 stars"));
		expect(fn).not.toHaveBeenCalled();
	});

	it("hover state preview-fills stars", () => {
		const { container } = render(<StarRating value={2} onChange={() => {}} label="x" />);
		fireEvent.mouseEnter(screen.getByLabelText("4 stars"));
		const svgs = container.querySelectorAll<SVGElement>(".ds-atom-star-btn svg");
		expect(svgs[0].getAttribute("fill")).toBe("var(--amber-vivid)");
		expect(svgs[3].getAttribute("fill")).toBe("var(--amber-vivid)");
		expect(svgs[4].getAttribute("fill")).toBe("transparent");
	});

	it("disabled adds data-disabled and prevents onChange", () => {
		const fn = vi.fn();
		const { container } = render(<StarRating value={2} onChange={fn} disabled label="x" />);
		expect(container.querySelector(".ds-atom-star")?.getAttribute("data-disabled")).toBe("true");
		fireEvent.click(screen.getByLabelText("5 stars"));
		expect(fn).not.toHaveBeenCalled();
	});

	it("aria-checked is true on the button matching value", () => {
		render(<StarRating value={3} onChange={() => {}} label="x" />);
		expect(screen.getByLabelText("3 stars").getAttribute("aria-checked")).toBe("true");
		expect(screen.getByLabelText("4 stars").getAttribute("aria-checked")).toBe("false");
	});
});
