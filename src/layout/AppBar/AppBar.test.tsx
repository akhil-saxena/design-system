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
});
