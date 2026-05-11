import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Divider } from ".";

describe("Divider", () => {
	it("renders a horizontal rule by default", () => {
		const { container } = render(<Divider />);
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el).not.toBeNull();
		expect(el.dataset.orient).toBe("horizontal");
	});

	it("renders vertically when vertical prop set", () => {
		const { container } = render(<Divider vertical />);
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el.dataset.orient).toBe("vertical");
	});

	it("renders label between two hairlines", () => {
		const { container, getByText } = render(<Divider label="OR" />);
		expect(getByText("OR")).toBeInTheDocument();
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el.dataset.labeled).toBe("true");
		// labeled layout has two line spans + one label span
		expect(el.querySelectorAll("span").length).toBe(3);
	});

	it("emits data-spacing", () => {
		const { container } = render(<Divider spacing="md" />);
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el.dataset.spacing).toBe("md");
	});

	it("emits data-style for dashed accent", () => {
		const { container } = render(<Divider accent="dashed" />);
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el.dataset.style).toBe("dashed");
		// accent suppresses inline bg so the CSS rule can paint the dashed border
		expect(el.style.background).toBe("");
	});

	it("color prop overrides inline background (when no accent set)", () => {
		const { container } = render(<Divider color="#ff0000" />);
		const el = container.querySelector(".ds-atom-divider") as HTMLDivElement;
		expect(el.style.background).toContain("rgb(255, 0, 0)");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Divider ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
