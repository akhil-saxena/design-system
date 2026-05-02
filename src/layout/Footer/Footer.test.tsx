import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Footer, type FooterColumn } from ".";
describe("Footer", () => {
	it("Test 1: variant=compact renders copyright text", () => {
		render(<Footer variant="compact" copyright="© 2026 Acme Corp" />);
		expect(screen.getByText("© 2026 Acme Corp")).toBeTruthy();
	});

	it("Test 2: variant=compact renders links array as clickable items", () => {
		const links = [
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
		];
		render(<Footer variant="compact" links={links} />);
		expect(screen.getByText("Privacy")).toBeTruthy();
		expect(screen.getByText("Terms")).toBeTruthy();
	});

	it("Test 3: variant=compact link renders as <a> when href provided", () => {
		const links = [{ label: "Privacy", href: "/privacy" }];
		render(<Footer variant="compact" links={links} />);
		const anchor = screen.getByText("Privacy").closest("a");
		expect(anchor).toBeTruthy();
		expect(anchor?.getAttribute("href")).toBe("/privacy");
	});

	it("Test 4: variant=compact link renders as <button> when no href", () => {
		const onClick = vi.fn();
		const links = [{ label: "Contact", onClick }];
		render(<Footer variant="compact" links={links} />);
		const btn = screen.getByRole("button", { name: "Contact" });
		expect(btn).toBeTruthy();
	});

	it("Test 5: variant=expanded renders 4-column grid with column titles", () => {
		const columns: FooterColumn[] = [
			{ title: "Product", links: [{ label: "Dashboard" }] },
			{ title: "Resources", links: [{ label: "Help Center" }] },
			{ title: "Company", links: [{ label: "About" }] },
			{ title: "Legal", links: [{ label: "Privacy" }] },
		];
		render(<Footer variant="expanded" columns={columns} />);
		expect(screen.getByText("Product")).toBeTruthy();
		expect(screen.getByText("Resources")).toBeTruthy();
		expect(screen.getByText("Company")).toBeTruthy();
		expect(screen.getByText("Legal")).toBeTruthy();
	});

	it("Test 6: variant=expanded renders links under each column title", () => {
		const columns: FooterColumn[] = [
			{ title: "Product", links: [{ label: "Dashboard" }, { label: "Tracker" }] },
		];
		render(<Footer variant="expanded" columns={columns} />);
		expect(screen.getByText("Dashboard")).toBeTruthy();
		expect(screen.getByText("Tracker")).toBeTruthy();
	});

	it("Test 7: Footer accepts className and style props", () => {
		render(<Footer className="my-footer" style={{ marginTop: 10 }} />);
		const footer = document.querySelector(".ds-atom-footer");
		expect(footer?.classList.contains("my-footer")).toBe(true);
	});

	it("Test 8: variant=expanded shows copyright in bottom row", () => {
		render(<Footer variant="expanded" copyright="© 2026 Acme" />);
		expect(screen.getByText("© 2026 Acme")).toBeTruthy();
	});
});
