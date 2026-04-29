import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

const THREE_ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Section", href: "/section" },
	{ label: "Current Page" },
];

const SEVEN_ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Level 2", href: "/l2" },
	{ label: "Level 3", href: "/l3" },
	{ label: "Level 4", href: "/l4" },
	{ label: "Level 5", href: "/l5" },
	{ label: "Level 6", href: "/l6" },
	{ label: "Current Page" },
];

const ALL_LINKS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Section", href: "/section" },
	{ label: "Page", href: "/section/page" },
];

describe("Breadcrumbs", () => {
	it("renders a nav element with aria-label='Breadcrumb'", () => {
		render(<Breadcrumbs items={THREE_ITEMS} />);
		expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
	});

	it("accepts a custom ariaLabel prop", () => {
		render(<Breadcrumbs items={THREE_ITEMS} ariaLabel="Custom nav" />);
		expect(screen.getByRole("navigation", { name: "Custom nav" })).toBeInTheDocument();
	});

	it("renders an ordered list inside the nav", () => {
		const { container } = render(<Breadcrumbs items={THREE_ITEMS} />);
		const ol = container.querySelector("ol");
		expect(ol).toBeInTheDocument();
		const nav = screen.getByRole("navigation");
		expect(nav.contains(ol)).toBe(true);
	});

	it("renders N list items when items.length <= maxVisible", () => {
		render(<Breadcrumbs items={THREE_ITEMS} />);
		// 3 items + 2 separators; find li elements
		const { container } = render(<Breadcrumbs items={THREE_ITEMS} />);
		const lis = container.querySelectorAll("li.ds-atom-breadcrumbs-li");
		expect(lis).toHaveLength(3);
	});

	it("last item has aria-current='page'", () => {
		render(<Breadcrumbs items={THREE_ITEMS} />);
		// Last item is "Current Page" (a span since no href)
		const currentSpan = screen.getAllByText("Current Page")[0];
		expect(currentSpan).toHaveAttribute("aria-current", "page");
	});

	it("non-last items do NOT have aria-current", () => {
		render(<Breadcrumbs items={THREE_ITEMS} />);
		const homeLink = screen.getAllByText("Home")[0];
		const sectionLink = screen.getAllByText("Section")[0];
		expect(homeLink).not.toHaveAttribute("aria-current");
		expect(sectionLink).not.toHaveAttribute("aria-current");
	});

	it("renders anchor when href is provided, span when not", () => {
		render(<Breadcrumbs items={THREE_ITEMS} />);
		// Home and Section have href → rendered as <a>
		expect(screen.getAllByRole("link", { name: "Home" })[0].tagName).toBe("A");
		expect(screen.getAllByRole("link", { name: "Section" })[0].tagName).toBe("A");
		// "Current Page" has no href → rendered as span (not a link)
		expect(screen.queryByRole("link", { name: "Current Page" })).toBeNull();
	});

	it("separators appear between items (count == items.length - 1)", () => {
		const { container } = render(<Breadcrumbs items={THREE_ITEMS} />);
		const seps = container.querySelectorAll(".ds-atom-breadcrumbs-sep");
		// 3 items → 2 separators
		expect(seps).toHaveLength(2);
	});

	it("does NOT render separator after the last item", () => {
		const { container } = render(<Breadcrumbs items={ALL_LINKS} />);
		const lis = container.querySelectorAll("li.ds-atom-breadcrumbs-li");
		const lastLi = lis[lis.length - 1];
		expect(lastLi?.querySelector(".ds-atom-breadcrumbs-sep")).toBeNull();
	});

	it("truncates when items.length > maxVisible (7 items, maxVisible=4): shows first + more-trigger + last 2", () => {
		render(<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />);
		// First item (Home) always visible
		expect(screen.getByText("Home")).toBeInTheDocument();
		// Last 2 items visible: Level 6 and Current Page (maxVisible-2 = 2 from tail)
		expect(screen.getByText("Level 6")).toBeInTheDocument();
		expect(screen.getByText("Current Page")).toBeInTheDocument();
		// Middle items NOT visible in main breadcrumb (they're hidden in dropdown)
		expect(screen.queryByText("Level 2")).toBeNull();
		expect(screen.queryByText("Level 3")).toBeNull();
		expect(screen.queryByText("Level 4")).toBeNull();
		expect(screen.queryByText("Level 5")).toBeNull();
		// "more" trigger button present
		expect(
			screen.getByRole("button", { name: /Show \d+ hidden breadcrumbs?/ }),
		).toBeInTheDocument();
	});

	it("more trigger has aria-haspopup='menu' and aria-expanded='false' when closed", () => {
		render(<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />);
		const btn = screen.getByRole("button", { name: /Show \d+ hidden breadcrumbs?/ });
		expect(btn).toHaveAttribute("aria-haspopup", "menu");
		expect(btn).toHaveAttribute("aria-expanded", "false");
	});

	it("clicking more trigger opens dropdown with hidden items", () => {
		render(<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />);
		const btn = screen.getByRole("button", { name: /Show \d+ hidden breadcrumbs?/ });
		fireEvent.click(btn);
		// Hidden items Level 2–5 should now be visible in dropdown
		expect(screen.getByText("Level 2")).toBeInTheDocument();
		expect(screen.getByText("Level 3")).toBeInTheDocument();
		expect(screen.getByText("Level 4")).toBeInTheDocument();
		expect(screen.getByText("Level 5")).toBeInTheDocument();
	});

	it("more trigger aria-expanded changes to 'true' when dropdown is open", () => {
		render(<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />);
		const btn = screen.getByRole("button", { name: /Show \d+ hidden breadcrumbs?/ });
		fireEvent.click(btn);
		expect(btn).toHaveAttribute("aria-expanded", "true");
	});

	it("clicking a hidden item fires its onClick and closes dropdown", () => {
		const onClick = vi.fn();
		const itemsWithClick: BreadcrumbItem[] = [
			{ label: "Home", href: "/" },
			{ label: "Level 2", href: "/l2", onClick },
			{ label: "Level 3", href: "/l3" },
			{ label: "Level 4", href: "/l4" },
			{ label: "Level 5", href: "/l5" },
			{ label: "Level 6", href: "/l6" },
			{ label: "Current Page" },
		];
		render(<Breadcrumbs items={itemsWithClick} maxVisible={4} />);
		const btn = screen.getByRole("button", { name: /Show \d+ hidden breadcrumbs?/ });
		fireEvent.click(btn);
		// Click Level 2 link inside dropdown
		const level2Link = screen.getByText("Level 2");
		fireEvent.click(level2Link);
		expect(onClick).toHaveBeenCalled();
		// Dropdown should be closed
		expect(screen.queryByText("Level 3")).toBeNull();
	});

	it("does not truncate when items.length equals maxVisible", () => {
		const fourItems: BreadcrumbItem[] = [
			{ label: "Home", href: "/" },
			{ label: "A", href: "/a" },
			{ label: "B", href: "/b" },
			{ label: "Current" },
		];
		render(<Breadcrumbs items={fourItems} maxVisible={4} />);
		expect(screen.queryByRole("button", { name: /Show \d+ hidden breadcrumbs?/ })).toBeNull();
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("applies custom className to the nav element", () => {
		const { container } = render(<Breadcrumbs items={THREE_ITEMS} className="my-custom-class" />);
		const nav = container.querySelector("nav");
		expect(nav?.className).toContain("my-custom-class");
	});

	it("applies .ds-atom-breadcrumbs class to the nav element", () => {
		const { container } = render(<Breadcrumbs items={THREE_ITEMS} />);
		const nav = container.querySelector("nav");
		expect(nav?.className).toContain("ds-atom-breadcrumbs");
	});

	it("aria-label for more button states correct hidden count", () => {
		// 7 items, maxVisible=4: first + trigger + last 2; hidden = items[1..4] = 4 items
		render(<Breadcrumbs items={SEVEN_ITEMS} maxVisible={4} />);
		const btn = screen.getByRole("button", { name: "Show 4 hidden breadcrumbs" });
		expect(btn).toBeInTheDocument();
	});
});
