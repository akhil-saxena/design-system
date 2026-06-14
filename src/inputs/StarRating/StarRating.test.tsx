import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from ".";
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

	// --- Roving tabindex ---

	it("only the selected star is a tab stop (rest are -1)", () => {
		render(<StarRating value={3} onChange={() => {}} label="x" />);
		expect(screen.getByLabelText("3 stars").getAttribute("tabindex")).toBe("0");
		for (const n of [1, 2, 4, 5]) {
			expect(screen.getByLabelText(`${n} star${n === 1 ? "" : "s"}`).getAttribute("tabindex")).toBe(
				"-1",
			);
		}
	});

	it("first star is the tab stop when nothing is selected", () => {
		render(<StarRating value={0} onChange={() => {}} label="x" />);
		expect(screen.getByLabelText("1 star").getAttribute("tabindex")).toBe("0");
		expect(screen.getByLabelText("2 stars").getAttribute("tabindex")).toBe("-1");
	});

	// --- Keyboard interaction (radiogroup pattern) ---

	it("ArrowRight increases the rating via onChange", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "ArrowRight" });
		expect(fn).toHaveBeenCalledWith(4);
	});

	it("ArrowLeft decreases the rating via onChange", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "ArrowLeft" });
		expect(fn).toHaveBeenCalledWith(2);
	});

	it("ArrowLeft clamps at 1, ArrowRight clamps at 5", () => {
		const fn = vi.fn();
		const { rerender } = render(<StarRating value={1} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("1 star"), { key: "ArrowLeft" });
		expect(fn).not.toHaveBeenCalled(); // already at min, no change
		rerender(<StarRating value={5} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("5 stars"), { key: "ArrowRight" });
		expect(fn).not.toHaveBeenCalled(); // already at max
	});

	it("Home selects 1, End selects 5", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "End" });
		expect(fn).toHaveBeenCalledWith(5);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "Home" });
		expect(fn).toHaveBeenCalledWith(1);
	});

	it("Space and Enter select the focused star", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} label="x" />);
		fireEvent.keyDown(screen.getByLabelText("5 stars"), { key: " " });
		expect(fn).toHaveBeenCalledWith(5);
		fireEvent.keyDown(screen.getByLabelText("2 stars"), { key: "Enter" });
		expect(fn).toHaveBeenCalledWith(2);
	});

	it("readOnly ignores keyboard interaction", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} readOnly label="x" />);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "ArrowRight" });
		expect(fn).not.toHaveBeenCalled();
	});

	it("disabled ignores keyboard interaction", () => {
		const fn = vi.fn();
		render(<StarRating value={3} onChange={fn} disabled label="x" />);
		fireEvent.keyDown(screen.getByLabelText("3 stars"), { key: "ArrowRight" });
		expect(fn).not.toHaveBeenCalled();
	});
});
