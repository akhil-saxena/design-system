import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Heading } from ".";

describe("Heading", () => {
	it("renders children", () => {
		const { getByText } = render(<Heading>Hello</Heading>);
		expect(getByText("Hello")).toBeInTheDocument();
	});

	it("defaults to <h2>", () => {
		const { container } = render(<Heading>x</Heading>);
		expect(container.querySelector("h2")).not.toBeNull();
	});

	it("renders correct heading tag for each level", () => {
		for (const level of [1, 2, 3, 4, 5, 6] as const) {
			const { container, unmount } = render(<Heading level={level}>x</Heading>);
			expect(container.querySelector(`h${level}`)).not.toBeNull();
			unmount();
		}
	});

	it("`as` prop overrides the rendered tag", () => {
		const { container } = render(
			<Heading level={1} as="div">
				x
			</Heading>,
		);
		// `as=div` wins; the semantic h1 is not rendered.
		expect(container.querySelector("h1")).toBeNull();
		expect(container.querySelector("div.ds-atom-heading")).not.toBeNull();
	});

	it("numeric size drives inline fontSize + letterSpacing + lineHeight", () => {
		const { container } = render(<Heading size={72}>x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.style.fontSize).toBe("72px");
		expect(h.style.letterSpacing).toBe("var(--ls-tighter)");
		expect(h.style.lineHeight).toBe("1");
	});

	it("token size emits data-size and leaves CSS to own font-size + line-height", () => {
		const { container } = render(<Heading size="2xl">x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.dataset.size).toBe("2xl");
		expect(h.style.fontSize).toBe("");
		expect(h.style.lineHeight).toBe("");
	});

	it("token weight emits data-weight", () => {
		const { container } = render(<Heading weight="black">x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.dataset.weight).toBe("black");
		expect(h.style.fontWeight).toBe("");
	});

	it("numeric weight drives inline fontWeight", () => {
		const { container } = render(<Heading weight={500}>x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.style.fontWeight).toBe("500");
	});

	it("tone emits data-tone and omits inline color", () => {
		const { container } = render(<Heading tone="amber">x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.dataset.tone).toBe("amber");
		expect(h.style.color).toBe("");
	});

	it("color prop overrides tone-derived inline color", () => {
		const { container } = render(<Heading color="#ff0000">x</Heading>);
		const h = container.querySelector("h2") as HTMLHeadingElement;
		expect(h.style.color).toContain("rgb(255, 0, 0)");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLHeadingElement>();
		render(<Heading ref={ref}>x</Heading>);
		expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
	});
});
