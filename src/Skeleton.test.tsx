import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
	it("renders default shape='text' with .ds-atom-skeleton class and data-shape='text'", () => {
		const { container } = render(<Skeleton />);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-skeleton");
		expect(root).toHaveAttribute("data-shape", "text");
	});

	it("applies data-shape per shape prop", () => {
		for (const s of ["text", "circle", "pill"] as const) {
			const { container } = render(<Skeleton shape={s} />);
			expect(container.firstChild).toHaveAttribute("data-shape", s);
		}
	});

	it("sets aria-hidden='true' on the root", () => {
		const { container } = render(<Skeleton />);
		expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
	});

	it("applies numeric width prop as px", () => {
		const { container } = render(<Skeleton width={120} height={20} />);
		const root = container.firstChild as HTMLElement;
		// jsdom coerces number → "120px" via React's style serialization
		expect(root.style.width).toBe("120px");
		expect(root.style.height).toBe("20px");
	});

	it("forwards string width verbatim", () => {
		const { container } = render(<Skeleton width="50%" height="10px" />);
		const root = container.firstChild as HTMLElement;
		expect(root.style.width).toBe("50%");
		expect(root.style.height).toBe("10px");
	});

	it("renders a single root .ds-atom-skeleton (no wrapper)", () => {
		const { container } = render(<Skeleton />);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-skeleton");
		expect(container.querySelectorAll(".ds-atom-skeleton").length).toBe(1);
	});

	it("forwards ref to root", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Skeleton ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveClass("ds-atom-skeleton");
	});

	it("appends consumer className to .ds-atom-skeleton", () => {
		const { container } = render(<Skeleton className="extra" />);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-skeleton");
		expect(root).toHaveClass("extra");
	});
});
