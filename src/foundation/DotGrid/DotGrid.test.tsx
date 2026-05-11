import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { DotGrid } from ".";

describe("DotGrid", () => {
	it("renders an aria-hidden div with the ds-atom-dotgrid class", () => {
		const { container } = render(<DotGrid />);
		const el = container.querySelector(".ds-atom-dotgrid") as HTMLDivElement;
		expect(el).not.toBeNull();
		expect(el.getAttribute("aria-hidden")).toBe("true");
	});

	it("applies opacity prop inline", () => {
		const { container } = render(<DotGrid opacity={0.25} />);
		const el = container.querySelector(".ds-atom-dotgrid") as HTMLDivElement;
		expect(el.style.opacity).toBe("0.25");
	});

	it("tile prop sets backgroundSize", () => {
		const { container } = render(<DotGrid tile={24} />);
		const el = container.querySelector(".ds-atom-dotgrid") as HTMLDivElement;
		expect(el.style.backgroundSize).toBe("24px 24px");
	});

	it("color + dotRadius feed into the radial-gradient", () => {
		const { container } = render(<DotGrid color="#ff0000" dotRadius={2} />);
		const el = container.querySelector(".ds-atom-dotgrid") as HTMLDivElement;
		expect(el.style.backgroundImage).toContain("radial-gradient");
		expect(el.style.backgroundImage).toContain("#ff0000");
		expect(el.style.backgroundImage).toContain("2px");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<DotGrid ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
