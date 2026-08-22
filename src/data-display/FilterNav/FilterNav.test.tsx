import { render } from "@testing-library/react";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterNav } from ".";

const CATEGORIES = [
	{ href: "/photos", label: "All" },
	{ href: "/photos/street", label: "Street" },
	{ href: "/photos/landscape", label: "Landscape" },
];

/**
 * G-9, reclassified from UPDATE to NEW component. The finding is emphatic about
 * why: "Not a hooks problem — an ARIA-pattern problem." `SegmentedControl` is a
 * WAI-ARIA radiogroup with state-driven `onChange` selection, so it has no
 * navigable anchor semantics at all, and "an `as="nav"` prop on the same
 * component cannot serve radiogroup and nav/link-list ARIA patterns cleanly —
 * the roles, keyboard model and selected-state semantics all differ."
 *
 * PUB-04 needs prerendered `/photos/[category]` routes: crawlable,
 * Back-button-capable, zero JS. All three follow from real anchors and none can
 * be added afterwards.
 */
describe("FilterNav", () => {
	it("renders a nav containing one real anchor per item", () => {
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos/street" ariaLabel="Photo categories" />,
		);
		const nav = container.querySelector("nav");
		expect(nav).not.toBeNull();
		const links = [...container.querySelectorAll("a")];
		expect(links).toHaveLength(3);
		expect(links.map((a) => a.getAttribute("href"))).toEqual([
			"/photos",
			"/photos/street",
			"/photos/landscape",
		]);
	});

	it("names the nav landmark, because an unnamed one is not usefully announced", () => {
		// The same lesson AppShell's banner slot produced in 01-13.
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos" ariaLabel="Photo categories" />,
		);
		expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Photo categories");
	});

	it("marks exactly one item aria-current=page", () => {
		// Two is as wrong as zero: `aria-current` is the nav pattern's
		// selected-state semantics, where a radiogroup would use `aria-checked`.
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos/street" ariaLabel="Photo categories" />,
		);
		const current = [...container.querySelectorAll('[aria-current="page"]')];
		expect(current).toHaveLength(1);
		expect(current[0]?.getAttribute("href")).toBe("/photos/street");
	});

	it("marks nothing current when activeHref matches no item", () => {
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos/nope" ariaLabel="Photo categories" />,
		);
		expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(0);
	});

	it("marks exactly one item even when two items share an href", () => {
		// A duplicated href in consumer data must not produce two current items.
		const dupes = [
			{ href: "/photos", label: "All" },
			{ href: "/photos", label: "Everything" },
		];
		const { container } = render(
			<FilterNav items={dupes} activeHref="/photos" ariaLabel="Photo categories" />,
		);
		expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
	});

	it("survives server rendering with every href intact and no client JS", () => {
		// The whole point. Phase 5's check-no-js gate is the counterpart to G-15's
		// bundle gate, so this is measured rather than asserted.
		const html = renderToStaticMarkup(
			<FilterNav items={CATEGORIES} activeHref="/photos/landscape" ariaLabel="Photo categories" />,
		);
		expect(html).toContain('href="/photos"');
		expect(html).toContain('href="/photos/street"');
		expect(html).toContain('href="/photos/landscape"');
		expect(html).toContain('aria-current="page"');
		expect(html.match(/aria-current="page"/g)).toHaveLength(1);
		expect(html).toContain("<nav");
	});

	it("carries no radiogroup semantics anywhere", () => {
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos" ariaLabel="Photo categories" />,
		);
		expect(container.querySelector('[role="radiogroup"]')).toBeNull();
		expect(container.querySelector('[role="radio"]')).toBeNull();
		expect(container.querySelector("[aria-checked]")).toBeNull();
		// A link list is not a tablist either — that is a third pattern with a third
		// keyboard model, and reaching for it is how this component would go wrong.
		expect(container.querySelector('[role="tablist"]')).toBeNull();
		expect(container.querySelectorAll("button")).toHaveLength(0);
		// Keyboard behaviour is Tab-between-links, so nothing may take a tabIndex
		// out of the natural order the way a radiogroup's roving tabindex does.
		expect(container.querySelector("[tabindex]")).toBeNull();
	});

	it("shares SegmentedControl's classes for visual parity", () => {
		// The finding: "shares SegmentedControl's CSS classes for visual parity but
		// renders real <a href> anchors". Reuse rather than duplicate — a copied
		// rule is what drifts.
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos" ariaLabel="Photo categories" />,
		);
		const nav = container.querySelector("nav") as HTMLElement;
		expect(nav.className).toContain("ds-atom-segmented");
		expect(nav.className).toContain("ds-atom-filternav");
		const link = container.querySelector("a") as HTMLAnchorElement;
		expect(link.className).toContain("ds-atom-segmented-btn");
		expect(link.className).toContain("ds-atom-filternav-link");
		// data-active is the styling hook the shared sheet already keys on, so the
		// active anchor paints from the SAME rule the active segment does.
		expect(link.dataset.active).toBe("true");
	});

	it("renders a hostile href as plain text rather than a live anchor (T-18-01)", () => {
		// The same allow-shape rule 01-11 adopted for FormErrorSummary. React does
		// NOT block `javascript:` in href, so an unfiltered consumer value would
		// execute on click. FilterNav exists for prerendered in-app category
		// routes, so nothing is lost by refusing everything else.
		const hostile = [
			{ href: "/photos", label: "All" },
			// biome-ignore lint/suspicious/noExplicitAny: deliberately hostile fixture
			{ href: "javascript:alert(1)" as any, label: "Evil" },
			{ href: "//evil.example.com/photos", label: "Protocol relative" },
			{ href: " javascript:alert(2)", label: "Whitespace smuggle" },
			{ href: "https://evil.example.com", label: "Absolute" },
		];
		const { container, getByText } = render(
			<FilterNav items={hostile} activeHref="/photos" ariaLabel="Photo categories" />,
		);
		const links = [...container.querySelectorAll("a")];
		expect(links).toHaveLength(1);
		expect(links[0]?.getAttribute("href")).toBe("/photos");
		// Rejected items are still NAMED — they just are not clickable, which is
		// strictly better than a live hostile URL.
		for (const label of ["Evil", "Protocol relative", "Whitespace smuggle", "Absolute"]) {
			expect(getByText(label)).toBeInTheDocument();
		}
		expect(container.innerHTML).not.toContain("javascript:");
	});

	it("accepts a fragment and a relative href, which are in-app shapes", () => {
		const items = [
			{ href: "#street", label: "Street" },
			{ href: "./landscape", label: "Landscape" },
		];
		const { container } = render(
			<FilterNav items={items} activeHref="#street" ariaLabel="Photo categories" />,
		);
		expect(container.querySelectorAll("a")).toHaveLength(2);
	});

	it("merges a consumer className and forwards a ref to the nav", () => {
		const ref = createRef<HTMLElement>();
		const { container } = render(
			<FilterNav
				ref={ref}
				items={CATEGORIES}
				activeHref="/photos"
				ariaLabel="Photo categories"
				className="mine"
			/>,
		);
		expect(ref.current).toBeInstanceOf(HTMLElement);
		expect((container.querySelector("nav") as HTMLElement).className).toContain("mine");
	});

	it("passes the size through so the shared size rules apply", () => {
		const { container } = render(
			<FilterNav items={CATEGORIES} activeHref="/photos" ariaLabel="x" size="lg" />,
		);
		expect((container.querySelector("nav") as HTMLElement).dataset.size).toBe("lg");
	});

	it("renders nothing when there are no items", () => {
		const { container } = render(<FilterNav items={[]} activeHref="/photos" ariaLabel="x" />);
		// An empty labelled landmark is noise in the landmark list.
		expect(container.querySelector("nav")).toBeNull();
	});
});
