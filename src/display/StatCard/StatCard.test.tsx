import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { StatCard } from ".";

vi.mock("../Sparkline", () => ({
	Sparkline: ({ data }: { data: number[] }) => (
		<svg data-testid="sparkline" data-points={data.length} />
	),
}));

describe("StatCard", () => {
	it("renders the label text", () => {
		render(<StatCard label="Applications" value="24" />);
		expect(screen.getByText("Applications")).toBeInTheDocument();
	});

	/**
	 * The label's type used to be an inline style object, which is why this case
	 * read `element.style`. It now lives on `.ds-atom-statcard [data-part="label"]`
	 * in primitives.css, so the assertion reads the COMPUTED value with the real
	 * sheet attached — an attribute assertion would pass just as happily against a
	 * rule that never matched, which is the whole failure mode this phase keeps
	 * finding. jsdom returns custom properties unsubstituted, so the expected
	 * values are the literal token references.
	 */
	describe("label type comes from the stylesheet, not the element", () => {
		let dsSheet: HTMLStyleElement;
		beforeAll(() => {
			dsSheet = document.createElement("style");
			dsSheet.textContent = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
			document.head.appendChild(dsSheet);
		});
		afterAll(() => dsSheet.remove());

		it("computes the label's mono/uppercase treatment from .ds-atom-statcard", () => {
			const { container } = render(<StatCard label="Applications" value="24" />);
			const label = container.querySelector<HTMLElement>("[data-part='label']");
			expect(label).not.toBeNull();
			// Nothing inline any more — that is the fix, not an incidental detail.
			expect(label?.getAttribute("style")).toBeNull();
			const cs = getComputedStyle(label as HTMLElement);
			expect(cs.fontFamily).toBe("var(--mono)");
			expect(cs.fontSize).toBe("9px");
			expect(cs.letterSpacing).toBe("0.08em");
			expect(cs.textTransform).toBe("uppercase");
			expect(cs.color).toBe("var(--ink-3)");
			expect(cs.fontWeight).toBe("700");
		});

		it("computes padding from the class and keeps the 12px radius inline", () => {
			const { container } = render(<StatCard label="L" value="1" />);
			const root = container.firstChild as HTMLElement;
			expect(getComputedStyle(root).padding).toBe("16px");
			// borderRadius stays inline on purpose: `.glass` in utilities.css sets
			// var(--radius-xl) = 16px and loads after primitives.css, so a (0,1,0)
			// rule would lose the tie on source order and change the corners.
			expect(root.style.borderRadius).toBe("12px");
		});
	});

	/**
	 * The finding this closes: StatCard wore only `glass`, a SHARED class in the
	 * ds-* namespace contract, so `.glass { … }` in a consumer stylesheet restyled
	 * every glass surface on the page and there was no way to reach one stat card.
	 */
	it("carries its own atom class, the shared glass class, and a consumer class", () => {
		const { container } = render(<StatCard label="L" value="1" className="wk-stat" />);
		const root = container.firstChild as HTMLElement;
		expect(root.getAttribute("class")).toBe("ds-atom-statcard glass wk-stat");
	});

	it("still emits both classes with no consumer class", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect((container.firstChild as HTMLElement).getAttribute("class")).toBe(
			"ds-atom-statcard glass",
		);
	});

	it("renders the value text", () => {
		render(<StatCard label="L" value="24" />);
		expect(screen.getByText("24")).toBeInTheDocument();
	});

	it("positive changeDir renders green badge", () => {
		const { container } = render(<StatCard label="L" value="1" change="+12%" changeDir="up" />);
		const badge = container.querySelector<HTMLElement>("[data-part='badge']");
		expect(badge).not.toBeNull();
		expect(badge!.style.background).toBe("rgba(34, 197, 94, 0.1)");
		expect(badge!.style.color).toBe("var(--green)");
	});

	it("negative changeDir renders red badge", () => {
		const { container } = render(<StatCard label="L" value="1" change="-5%" changeDir="down" />);
		const badge = container.querySelector<HTMLElement>("[data-part='badge']");
		expect(badge).not.toBeNull();
		expect(badge!.style.background).toBe("rgba(239, 68, 68, 0.08)");
		expect(badge!.style.color).toBe("var(--red)");
	});

	it("does not render badge when change prop is absent", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.querySelector("[data-part='badge']")).toBeNull();
	});

	it("renders Sparkline when data has 2 or more points", () => {
		const { container } = render(<StatCard label="L" value="1" data={[1, 2, 3]} />);
		expect(container.querySelector("svg")).not.toBeNull();
	});

	it("does not render Sparkline when data is absent", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("does not render Sparkline when data has fewer than 2 points", () => {
		const { container } = render(<StatCard label="L" value="1" data={[5]} />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("root element carries the glass class", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.firstElementChild?.className).toContain("glass");
	});

	it("root element has borderRadius 12 inline style", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		const root = container.firstElementChild as HTMLElement;
		expect(root.style.borderRadius).toBe("12px");
	});
});
