import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RollingNumber } from "./RollingNumber";

describe("RollingNumber", () => {
	it("renders one cell per digit for value=42", () => {
		const { container } = render(<RollingNumber value={42} />);
		expect(container.querySelectorAll(".ds-atom-rolling-cell").length).toBe(2);
	});

	it("each digit cell has correct translateY (digit 4 → -88px, digit 2 → -44px)", () => {
		const { container } = render(<RollingNumber value={42} />);
		const strips = container.querySelectorAll<HTMLElement>(".ds-atom-rolling-strip");
		expect(strips[0].style.transform).toBe("translateY(-88px)");
		expect(strips[1].style.transform).toBe("translateY(-44px)");
	});

	it("rerendering with new value updates strip translateY", () => {
		const { container, rerender } = render(<RollingNumber value={42} />);
		rerender(<RollingNumber value={53} />);
		const strips = container.querySelectorAll<HTMLElement>(".ds-atom-rolling-strip");
		expect(strips[0].style.transform).toBe("translateY(-110px)");
		expect(strips[1].style.transform).toBe("translateY(-66px)");
	});

	it("format prop transforms display; commas render as static spans", () => {
		const { container } = render(<RollingNumber value={1234} format={(v) => v.toLocaleString()} />);
		expect(container.querySelectorAll(".ds-atom-rolling-cell").length).toBe(4);
		expect(container.querySelectorAll(".ds-atom-rolling-static").length).toBe(1);
	});

	it("non-digit suffix renders as .ds-atom-rolling-static", () => {
		const { container } = render(<RollingNumber value={50} suffix="%" />);
		const statics = container.querySelectorAll<HTMLElement>(".ds-atom-rolling-static");
		expect(statics.length).toBe(1);
		expect(statics[0].textContent).toBe("%");
	});

	it("aria-label is set and aria-live is polite", () => {
		render(<RollingNumber value={42} ariaLabel="Application count" />);
		const el = screen.getByLabelText("Application count");
		expect(el).toBeInTheDocument();
		expect(el.getAttribute("aria-live")).toBe("polite");
	});

	it("prefix + suffix together produce correct cell/static counts", () => {
		const { container } = render(<RollingNumber value={50} prefix="$" suffix="K" />);
		expect(container.querySelectorAll(".ds-atom-rolling-cell").length).toBe(2);
		expect(container.querySelectorAll(".ds-atom-rolling-static").length).toBe(2);
	});
});
