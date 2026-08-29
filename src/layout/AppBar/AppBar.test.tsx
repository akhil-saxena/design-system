import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppBar } from ".";
describe("AppBar", () => {
	it("Test 1: variant=minimal renders with data-variant=minimal", () => {
		render(<AppBar variant="minimal" />);
		const header = document.querySelector<HTMLElement>(".ds-atom-appbar");
		expect(header).toBeTruthy();
		expect(header?.dataset.variant).toBe("minimal");
	});

	it("Test 2: variant=withSearch renders a search input of type search", () => {
		render(<AppBar variant="withSearch" />);
		const searchInput = document.querySelector('input[type="search"]');
		expect(searchInput).toBeTruthy();
	});

	it("Test 3: variant=default renders the nav slot", () => {
		render(<AppBar variant="default" nav={<nav data-testid="nav-slot">Nav</nav>} />);
		expect(screen.getByTestId("nav-slot")).toBeTruthy();
	});

	it("Test 4: variant=centered renders the header with data-variant=centered", () => {
		render(<AppBar variant="centered" />);
		const header = document.querySelector<HTMLElement>(".ds-atom-appbar");
		expect(header?.dataset.variant).toBe("centered");
	});

	it("Test 5: scrolled=false sets data-scrolled=false on root", () => {
		render(<AppBar scrolled={false} />);
		const header = document.querySelector<HTMLElement>(".ds-atom-appbar");
		expect(header?.dataset.scrolled).toBe("false");
	});

	it("Test 6: scrolled=true sets data-scrolled=true attribute on root", () => {
		render(<AppBar scrolled={true} />);
		const header = document.querySelector<HTMLElement>(".ds-atom-appbar");
		expect(header?.dataset.scrolled).toBe("true");
	});

	it("Test 7: AppBar forwards className and style props to root element", () => {
		render(<AppBar className="my-custom" style={{ zIndex: 99 }} />);
		const header = document.querySelector(".ds-atom-appbar");
		expect(header?.classList.contains("my-custom")).toBe(true);
	});

	it("Test 8: logo prop renders custom logo content", () => {
		render(<AppBar logo={<span data-testid="custom-logo">Brand</span>} />);
		expect(screen.getByTestId("custom-logo")).toBeTruthy();
	});

	it("Test 9: withSearch variant calls onSearchChange when input changes", () => {
		const onSearchChange = vi.fn();
		render(<AppBar variant="withSearch" onSearchChange={onSearchChange} />);
		const input = document.querySelector('input[type="search"]') as HTMLInputElement;
		fireEvent.change(input, { target: { value: "hello" } });
		expect(onSearchChange).toHaveBeenCalledWith("hello");
	});

	it("Test 10: withSearch variant uses searchPlaceholder prop", () => {
		render(<AppBar variant="withSearch" searchPlaceholder="Find something..." />);
		const input = document.querySelector('input[type="search"]') as HTMLInputElement;
		expect(input.placeholder).toBe("Find something...");
	});
	/**
	 * The bar's chrome moved out of the style attribute so primitives.css could
	 * reach it — which is what makes `minimal` expressible and what makes the
	 * dark scrolled rule apply. These cases guard the move; they cannot prove the
	 * result, because jsdom has no cascade. tests/visual/appbar-minimal.spec.ts
	 * measures what is actually painted.
	 */
	describe("chrome is not inlined", () => {
		for (const scrolled of [false, true]) {
			it(`scrolled=${scrolled} emits no background, blur, border or shadow inline`, () => {
				const { container } = render(<AppBar scrolled={scrolled} />);
				const header = container.querySelector("header") as HTMLElement;
				const style = header.getAttribute("style") ?? "";
				for (const decl of ["background", "backdrop-filter", "border-bottom", "box-shadow"]) {
					expect(style, `${decl} is inline again; no stylesheet rule can beat it`).not.toContain(
						decl,
					);
				}
			});
		}

		it("still exposes the state the stylesheet keys on", () => {
			const { container } = render(<AppBar variant="minimal" scrolled={false} />);
			const header = container.querySelector("header") as HTMLElement;
			expect(header).toHaveAttribute("data-variant", "minimal");
			// "false", not absent: the minimal rule is
			// [data-variant="minimal"][data-scrolled="false"], and an absent attribute
			// would drop it to (0,2,0) and into a tie.
			expect(header).toHaveAttribute("data-scrolled", "false");
		});

		it("still merges a consumer style prop", () => {
			const { container } = render(<AppBar style={{ paddingInline: 40 }} />);
			const header = container.querySelector("header") as HTMLElement;
			expect(header.style.paddingInline).toBe("40px");
		});
	});
});
