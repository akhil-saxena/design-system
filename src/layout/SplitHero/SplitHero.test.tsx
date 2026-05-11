import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { SplitHero } from ".";

describe("SplitHero", () => {
	it("renders aside + main slots", () => {
		const { getByTestId } = render(
			<SplitHero
				aside={<div data-testid="aside-slot">aside</div>}
				main={<div data-testid="main-slot">main</div>}
			/>,
		);
		expect(getByTestId("aside-slot")).toBeInTheDocument();
		expect(getByTestId("main-slot")).toBeInTheDocument();
	});

	it("root is a <main> element", () => {
		const { container } = render(<SplitHero aside={<>a</>} main={<>m</>} />);
		const main = container.querySelector("main.ds-layout-splithero") as HTMLElement;
		expect(main).not.toBeNull();
	});

	it("emits component-scoped class encoding the breakpoints", () => {
		const { container } = render(
			<SplitHero stackBelow={1024} hideAsideBelow={640} aside={<>a</>} main={<>m</>} />,
		);
		const main = container.querySelector("main.ds-layout-splithero") as HTMLElement;
		expect(main.className).toContain("dssh-1024-640");
	});

	it("emits a scoped <style> tag for responsive rules", () => {
		const { container } = render(
			<SplitHero stackBelow={900} hideAsideBelow={600} aside={<>a</>} main={<>m</>} />,
		);
		const style = container.querySelector("style") as HTMLStyleElement;
		expect(style).not.toBeNull();
		expect(style.textContent).toContain("@media (max-width: 900px)");
		expect(style.textContent).toContain("@media (max-width: 600px)");
	});

	it("ratio prop drives gridTemplateColumns", () => {
		const { container } = render(<SplitHero ratio="1.15fr 1fr" aside={<>a</>} main={<>m</>} />);
		const main = container.querySelector("main.ds-layout-splithero") as HTMLElement;
		expect(main.style.gridTemplateColumns).toBe("1.15fr 1fr");
	});

	it("spreads native HTML attributes (id, aria-*)", () => {
		const { container } = render(
			<SplitHero id="hero" aria-label="onboarding" aside={<>a</>} main={<>m</>} />,
		);
		const main = container.querySelector("main.ds-layout-splithero") as HTMLElement;
		expect(main.id).toBe("hero");
		expect(main.getAttribute("aria-label")).toBe("onboarding");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLElement>();
		render(<SplitHero ref={ref} aside={<>a</>} main={<>m</>} />);
		expect(ref.current).not.toBeNull();
	});
});
