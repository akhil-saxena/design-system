import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from ".";

describe("Pagination", () => {
	// Test 1: renders a <nav> with role="navigation" and aria-label="Pagination"
	it("renders a nav element with role='navigation' and default aria-label='Pagination'", () => {
		render(<Pagination totalPages={10} currentPage={3} onPageChange={vi.fn()} />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
	});

	// Test 2: custom ariaLabel prop is reflected on the nav element
	it("accepts a custom ariaLabel prop", () => {
		render(
			<Pagination totalPages={10} currentPage={3} onPageChange={vi.fn()} ariaLabel="Page navigation" />,
		);
		expect(screen.getByRole("navigation", { name: "Page navigation" })).toBeInTheDocument();
	});

	// Test 3: full variant — prev button disabled when currentPage=1
	it("full variant: prev button is disabled when currentPage=1", () => {
		render(<Pagination totalPages={10} currentPage={1} onPageChange={vi.fn()} />);
		const prevBtn = screen.getByRole("button", { name: "Previous page" });
		expect(prevBtn).toBeDisabled();
	});

	// Test 4: full variant — next button disabled when currentPage=totalPages
	it("full variant: next button is disabled when currentPage=totalPages", () => {
		render(<Pagination totalPages={10} currentPage={10} onPageChange={vi.fn()} />);
		const nextBtn = screen.getByRole("button", { name: "Next page" });
		expect(nextBtn).toBeDisabled();
	});

	// Test 5: full variant — active page button has aria-current="page"
	it("full variant: active page button has aria-current='page'", () => {
		render(<Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />);
		const activeBtn = screen.getByRole("button", { name: "Page 3" });
		expect(activeBtn).toHaveAttribute("aria-current", "page");
	});

	// Test 6: full variant — inactive page buttons do NOT have aria-current
	it("full variant: inactive page buttons do NOT have aria-current", () => {
		render(<Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />);
		const btn1 = screen.getByRole("button", { name: "Page 1" });
		const btn2 = screen.getByRole("button", { name: "Page 2" });
		expect(btn1).not.toHaveAttribute("aria-current");
		expect(btn2).not.toHaveAttribute("aria-current");
	});

	// Test 7: full variant — ellipsis items have aria-hidden="true"
	it("full variant: ellipsis items are aria-hidden='true'", () => {
		const { container } = render(
			<Pagination totalPages={12} currentPage={6} onPageChange={vi.fn()} />,
		);
		const ellipsisList = container.querySelectorAll(
			"li[aria-hidden='true']",
		);
		expect(ellipsisList.length).toBeGreaterThan(0);
	});

	// Test 8: full variant — "Page 3 of 12" label text is present
	it("full variant: 'Page N of M' label text is present (totalPages=12, currentPage=3)", () => {
		render(<Pagination totalPages={12} currentPage={3} onPageChange={vi.fn()} />);
		expect(screen.getByText("Page 3 of 12")).toBeInTheDocument();
	});

	// Test 9: compact variant — "3 / 12" text is present
	it("compact variant: 'N / M' text is present (totalPages=12, currentPage=3)", () => {
		render(
			<Pagination totalPages={12} currentPage={3} onPageChange={vi.fn()} variant="compact" />,
		);
		expect(screen.getByText("3 / 12")).toBeInTheDocument();
	});

	// Test 10: clicking a page button calls onPageChange with the correct page number
	it("clicking a page button calls onPageChange with correct page number", () => {
		const onPageChange = vi.fn();
		render(<Pagination totalPages={5} currentPage={1} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	// Test 11: clicking prev button calls onPageChange(currentPage - 1)
	it("clicking prev button calls onPageChange(currentPage - 1)", () => {
		const onPageChange = vi.fn();
		render(<Pagination totalPages={10} currentPage={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	// Test 12: clicking next button calls onPageChange(currentPage + 1)
	it("clicking next button calls onPageChange(currentPage + 1)", () => {
		const onPageChange = vi.fn();
		render(<Pagination totalPages={10} currentPage={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).toHaveBeenCalledWith(6);
	});

	// Test 13: totalPages <= 7 — no ellipsis rendered
	it("totalPages <= 7: no ellipsis rendered", () => {
		const { container } = render(
			<Pagination totalPages={7} currentPage={4} onPageChange={vi.fn()} />,
		);
		const ellipsisList = container.querySelectorAll("li[aria-hidden='true']");
		expect(ellipsisList.length).toBe(0);
		// All 7 page buttons present
		for (let i = 1; i <= 7; i++) {
			expect(screen.getByRole("button", { name: `Page ${i}` })).toBeInTheDocument();
		}
	});

	// Test 14: totalPages > 7, currentPage=3 — ellipsis appears between range and last page
	it("totalPages > 7, currentPage=3: ellipsis appears after the visible range", () => {
		const { container } = render(
			<Pagination totalPages={12} currentPage={3} onPageChange={vi.fn()} />,
		);
		const ellipsisList = container.querySelectorAll("li[aria-hidden='true']");
		expect(ellipsisList.length).toBeGreaterThan(0);
		// Last page should still be visible
		expect(screen.getByRole("button", { name: "Page 12" })).toBeInTheDocument();
	});
});
