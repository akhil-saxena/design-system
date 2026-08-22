import { expect, test } from "@playwright/test";
import { type Brand, type Mode, probeComputed } from "./computed";

/**
 * G-9. `FilterNav` "shares `SegmentedControl`'s CSS classes for visual parity but
 * renders real `<a href>` anchors". Both halves of that sentence are testable and
 * both are tested here — the parity on computed style, the divergence on ARIA and
 * on the keyboard model.
 *
 * Parity is asserted on `getComputedStyle`, not by eye and not by screenshot. A
 * screenshot would catch it, but only after 01-20 records a baseline, and this
 * repository has already recorded a baseline with a bug present — see
 * control-chrome.spec.ts's docstring. A computed comparison fails on the commit
 * that breaks it.
 *
 * The story is `data-display-filternav--beside-segmented-control`, which renders
 * both components in one DOM so they are compared under one cascade rather than
 * across two navigations. It carries no `.dark` decorator: a story that sets
 * `className="dark"` re-declares tokens.css's neutral dark block inside its own
 * subtree while charcoal.css, being root-scoped, does not reach in — so a probe
 * there measures the default brand and passes.
 */

const STORY = "data-display-filternav--beside-segmented-control";
const BRAND_AMBER: Record<Brand, string> = {
	charcoal: "#b0722a",
	default: "#f59e0b",
};

/** Container-level properties that must match between the two. */
const CONTAINER_PROPS = [
	"background-color",
	"border-top-width",
	"border-top-style",
	"border-top-color",
	"border-radius",
	"padding-top",
	"padding-left",
	"gap",
	"display",
	"align-items",
];

/**
 * Item-level properties.
 *
 * `text-decoration-line` and `display` are here because a FIRST DRAFT OF THIS
 * LIST OMITTED THEM and the negative control walked straight through: deleting a
 * declaration from `.ds-atom-filternav-link` left all seven cases green. An
 * anchor's two loudest defaults against a button are the underline and the inline
 * box, so a parity list that does not read them is asserting parity on the
 * properties that were never going to differ.
 *
 * `height` is here because the shared `[data-size]` rule sets it and on an inline
 * element it would silently do nothing.
 *
 * `display` IS DELIBERATELY EXCLUDED, and this is the one exception worth
 * spelling out because deleting an inconvenient assertion is how a gate dies.
 * Measured: the anchor computes `flex` and the button computes `block`, both
 * 32px tall. That is not a parity failure, it is the mechanism — a `<button>`
 * centres its own content by UA default and an `<a>` does not, so the anchor
 * needs `inline-flex` + `justify-content` to land in the same place. Excluding a
 * property because it differs would be circular, so the OBSERVABLE consequence
 * is asserted instead, by measuring where the label actually sits inside its box
 * (`labelCentring` below). If the mechanism ever stops producing a centred
 * label, that assertion fails even though `display` was never read.
 */
const ITEM_PROPS = [
	"text-decoration-line",
	"height",
	"line-height",
	"padding-left",
	"padding-right",
	"font-family",
	"font-size",
	"font-weight",
	"border-radius",
	"color",
	"background-color",
	"white-space",
];

async function read(
	// biome-ignore lint/suspicious/noExplicitAny: Playwright's Page, imported transitively
	page: any,
	brand: Brand,
	mode: Mode,
	selector: string,
	props: string[],
) {
	const got = await probeComputed(page, {
		story: STORY,
		brand,
		mode,
		selector,
		props: [...props, "--amber"],
	});
	expect(
		got["--amber"],
		`brand did not reach ${selector}; a scoped .dark wrapper strands charcoal.css`,
	).toBe(BRAND_AMBER[brand]);
	const { "--amber": _drop, ...rest } = got;
	return rest;
}

for (const brand of ["charcoal", "default"] as const) {
	for (const mode of ["light", "dark"] as const) {
		test(`${brand} x ${mode}: FilterNav is computationally identical to SegmentedControl`, async ({
			page,
		}) => {
			const navBox = await read(page, brand, mode, ".ds-atom-filternav", CONTAINER_PROPS);
			const segBox = await read(
				page,
				brand,
				mode,
				".ds-atom-segmented:not(.ds-atom-filternav)",
				CONTAINER_PROPS,
			);
			expect(navBox, "container parity").toEqual(segBox);

			// An INACTIVE item in each. FilterNav's first item is "All" and is not
			// current in this story; SegmentedControl's first option is likewise not
			// selected, so the pair is comparable.
			const navItem = await read(
				page,
				brand,
				mode,
				".ds-atom-filternav-link:not([data-active])",
				ITEM_PROPS,
			);
			const segItem = await read(
				page,
				brand,
				mode,
				".ds-atom-segmented-btn:not(.ds-atom-filternav-link):not([data-active])",
				ITEM_PROPS,
			);
			expect(navItem, "inactive item parity").toEqual(segItem);

			// And the ACTIVE one, which is the case most likely to diverge because the
			// two components express selection differently. It must not: the anchor
			// carries data-active="true" precisely so it paints from
			// .ds-atom-segmented-btn[data-active], the same rule the segment uses.
			const navActive = await read(page, brand, mode, '[aria-current="page"]', ITEM_PROPS);
			const segActive = await read(
				page,
				brand,
				mode,
				".ds-atom-segmented-btn[data-active]:not(.ds-atom-filternav-link)",
				ITEM_PROPS,
			);
			expect(navActive, "active item parity").toEqual(segActive);

			// Non-vacuity: an active item must actually differ from an inactive one,
			// or the three comparisons above could all be passing on one identical
			// unstyled box.
			expect(
				navActive["background-color"],
				"active and inactive paint the same, so parity is being asserted on nothing",
			).not.toBe(navItem["background-color"]);

			// The observable consequence of the `display` difference documented on
			// ITEM_PROPS. A Range over the item's text gives the label's real box, so
			// the left and right slack inside the item can be compared: equal slack
			// means centred. The button gets this from the UA, the anchor from
			// `justify-content`, and the point is that the RESULT matches.
			// BOTH AXES. A horizontal-only version of this measured nothing about
			// `align-items`, which is the declaration that vertically centres the
			// label inside a 32px box the parent stretched the anchor to fill.
			const slack = (selector: string) =>
				page.$$eval(selector, (els: Element[]) =>
					els.map((el) => {
						const range = document.createRange();
						range.selectNodeContents(el);
						const text = range.getBoundingClientRect();
						const box = el.getBoundingClientRect();
						const r = (n: number) => Math.round(n * 10) / 10;
						return {
							x: r(text.left - box.left) - r(box.right - text.right),
							y: r(text.top - box.top) - r(box.bottom - text.bottom),
						};
					}),
				);
			const navSlack = await slack(".ds-atom-filternav-link");
			const segSlack = await slack(".ds-atom-segmented-btn:not(.ds-atom-filternav-link)");
			expect(navSlack.length).toBeGreaterThan(0);
			expect(segSlack.length).toBeGreaterThan(0);
			for (const d of [...navSlack, ...segSlack]) {
				expect(
					Math.abs(d.x),
					`label is not horizontally centred in its item (slack delta ${d.x}px)`,
				).toBeLessThan(1.5);
				expect(
					Math.abs(d.y),
					`label is not vertically centred in its item (slack delta ${d.y}px)`,
				).toBeLessThan(2.5);
			}
		});
	}
}

test("the anchors are real, resolved links — crawlable and Back-button-capable", async ({
	page,
}) => {
	await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:dark;brand:charcoal`);
	await page.waitForSelector(".ds-atom-filternav a");
	const links = await page.$$eval(".ds-atom-filternav a", (els) =>
		els.map((e) => ({
			// `.href` is the RESOLVED absolute URL, which only a real anchor has. A
			// button with a click handler would give undefined.
			resolved: (e as HTMLAnchorElement).href,
			attr: e.getAttribute("href"),
			current: e.getAttribute("aria-current"),
			tabindex: e.getAttribute("tabindex"),
		})),
	);
	expect(links.length).toBe(4);
	for (const l of links) {
		expect(l.resolved).toMatch(/^https?:\/\//);
		expect(l.attr).toMatch(/^\//);
		// No roving tabindex: every link is in the natural tab order, which is the
		// nav pattern. A radiogroup puts -1 on all but one.
		expect(l.tabindex).toBeNull();
	}
	expect(links.filter((l) => l.current === "page")).toHaveLength(1);
});

test("the keyboard model is a link list, not a radiogroup", async ({ page }) => {
	await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:dark;brand:charcoal`);
	await page.waitForSelector(".ds-atom-filternav a");
	const first = page.locator(".ds-atom-filternav a").first();
	await first.focus();
	const focusedHref = () =>
		page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href"));
	expect(await focusedHref()).toBe("/photos");

	// A radiogroup would move selection AND focus on ArrowRight. A link list must
	// do nothing at all — this is the "keyboard model differs" half of G-9.
	await page.keyboard.press("ArrowRight");
	expect(await focusedHref(), "ArrowRight moved focus — that is radiogroup behaviour").toBe(
		"/photos",
	);
	const currentAfterArrow = await page.$$eval(".ds-atom-filternav a", (els) =>
		els.filter((e) => e.getAttribute("aria-current") === "page").map((e) => e.getAttribute("href")),
	);
	expect(currentAfterArrow, "ArrowRight changed the selection").toEqual(["/photos/street"]);

	// Tab moves between links, which is the whole keyboard contract.
	await page.keyboard.press("Tab");
	expect(await focusedHref()).toBe("/photos/street");
	await page.keyboard.press("Tab");
	expect(await focusedHref()).toBe("/photos/landscape");
});

test("a rejected href is not a link in the browser either (T-18-01)", async ({ page }) => {
	await page.goto(
		"/iframe.html?id=data-display-filternav--rejected-hrefs&viewMode=story&globals=theme:light;brand:charcoal",
	);
	await page.waitForSelector(".ds-atom-filternav");
	const anchors = await page.$$eval(".ds-atom-filternav a", (els) =>
		els.map((e) => e.getAttribute("href")),
	);
	// Two of the four items are in-app shapes; the protocol-relative and absolute
	// ones are spans.
	expect(anchors).toEqual(["/photos", "/photos/street"]);
	const rejected = await page.$$eval('.ds-atom-filternav [data-rejected="true"]', (els) =>
		els.map((e) => e.textContent),
	);
	expect(rejected).toEqual(["Protocol relative", "Absolute"]);
	const html = await page.innerHTML(".ds-atom-filternav");
	expect(html).not.toContain("evil.example.com");
});
