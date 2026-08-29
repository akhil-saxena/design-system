import { expect, test } from "@playwright/test";

/**
 * D-21 — AppBar must not overflow the narrowest device class, and its layout
 * gaps must be reachable from a consumer stylesheet.
 *
 * ## What was measured, and where
 *
 * A site built on this bar reported `document.documentElement.scrollWidth` of
 * **358** against a **344px** viewport on every one of its routes — 14px of
 * horizontal scroll at the folded-cover class, with the theme toggle as the
 * element pushed off the right edge. Re-measured on the built site before the
 * fix: 14px at a coarse pointer and 6px at a fine one, on all six routes.
 *
 * ## Why a browser and not a unit test
 *
 * The defect is a `gap` in a `@media (max-width: 380px)` block resolving against
 * a flex row's min-content width. jsdom lays nothing out — every element there
 * has a zero-sized box — so nothing in the vitest suite can see an overflow, and
 * jsdom implements no media queries that would select the rule under test.
 *
 * ## Why the shape is assembled here rather than shipped as a story
 *
 * The bar that overflows is `logo + THREE nav links + an icon-button action`, and
 * no story ships that composition: `AnchorNavigation` has two links and no
 * actions. Adding a story to reproduce it would add two visual baselines whose
 * only job is to be a fixture. The composition is assembled from the story's own
 * DOM instead — which is only possible BECAUSE of the fix under test: the two
 * groups now carry class names, so a third link and an actions group can be
 * placed in exactly the boxes AppBar renders. Before the fix those were unnamed
 * divs and this test could not have been written.
 */

const NARROW = { width: 344, height: 882 };

async function buildConsumerBar(page: import("@playwright/test").Page) {
	await page.goto(
		"/iframe.html?id=layout-appbar--anchor-navigation&viewMode=story&globals=theme:light;brand:monochrome",
	);
	await page.waitForSelector(".ds-atom-appbar", { timeout: 20_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
	// The audited consumer's bar: a brand mark, THREE route links, and a 32px
	// icon button in the actions slot. Reproduced from the built site's markup.
	await page.evaluate(() => {
		const bar = document.querySelector(".ds-atom-appbar");
		if (!bar) throw new Error("no .ds-atom-appbar in this story");
		const nav = bar.querySelector(".ds-atom-appbar-nav");
		if (!nav) throw new Error("no .ds-atom-appbar-nav — the layout groups are unnamed again");
		const third = document.createElement("a");
		third.className = "ds-atom-link";
		third.setAttribute("data-variant", "quiet");
		third.href = "#resume";
		third.textContent = "résumé";
		nav.appendChild(third);

		const actions = document.createElement("div");
		actions.className = "ds-atom-appbar-actions";
		const toggle = document.createElement("button");
		toggle.type = "button";
		toggle.className = "ds-atom-iconbtn";
		toggle.setAttribute("data-variant", "ghost");
		toggle.setAttribute("data-size", "md");
		toggle.setAttribute("aria-label", "Switch between the dark and light theme");
		actions.appendChild(toggle);
		bar.appendChild(actions);
	});
}

for (const pointer of ["coarse", "fine"] as const) {
	test.describe(`${pointer} pointer`, () => {
		test.use({ hasTouch: pointer === "coarse", viewport: NARROW });

		test(`the consumer's bar does not overflow 344px`, async ({ page }) => {
			await buildConsumerBar(page);
			const m = await page.evaluate(() => {
				const de = document.documentElement;
				const off = [...document.querySelectorAll(".ds-atom-appbar *")]
					.map((e) => ({ e, r: e.getBoundingClientRect() }))
					.filter((x) => x.r.right > de.clientWidth + 0.5)
					.map(
						(x) => `${x.e.tagName.toLowerCase()}.${x.e.className} right=${Math.round(x.r.right)}`,
					);
				return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, off };
			});
			expect(
				m.scrollWidth,
				`${m.scrollWidth - m.clientWidth}px of horizontal scroll at 344px; past the right edge: ${m.off.join(", ") || "(nothing — the overflow is elsewhere)"}`,
			).toBe(m.clientWidth);
		});
	});
}

test.describe("the gaps are reachable from a stylesheet", () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test("a consumer rule at (0,1,0) compresses the bar without !important", async ({ page }) => {
		await buildConsumerBar(page);

		const inline = await page.evaluate(() =>
			[".ds-atom-appbar-lead", ".ds-atom-appbar-nav"].map(
				(s) => document.querySelector(s)?.getAttribute("style") ?? null,
			),
		);
		expect(
			inline,
			"a layout group carries an inline style again — an inline declaration cannot be beaten from a consumer stylesheet at any specificity",
		).toEqual([null, null]);

		const before = await page.evaluate(() => ({
			lead: getComputedStyle(document.querySelector(".ds-atom-appbar-lead") as Element).gap,
			nav: getComputedStyle(document.querySelector(".ds-atom-appbar-nav") as Element).gap,
		}));
		expect(before).toEqual({ lead: "28px", nav: "18px" });

		// One single-class rule, no !important, no reaching past the component.
		await page.addStyleTag({
			content: ".ds-atom-appbar-lead{gap:4px}.ds-atom-appbar-nav{gap:2px}",
		});
		const after = await page.evaluate(() => ({
			lead: getComputedStyle(document.querySelector(".ds-atom-appbar-lead") as Element).gap,
			nav: getComputedStyle(document.querySelector(".ds-atom-appbar-nav") as Element).gap,
		}));
		expect(
			after,
			"a consumer stylesheet still cannot reach the bar's layout gaps — the whole point of D-21",
		).toEqual({ lead: "4px", nav: "2px" });
	});

	test("the wide-viewport geometry is unchanged by the narrow query", async ({ page }) => {
		await buildConsumerBar(page);
		// 380px is the query's edge; at 1280 the declared values must be the
		// originals, so moving them out of the style attribute moved no pixel.
		const gaps = await page.evaluate(() => [
			getComputedStyle(document.querySelector(".ds-atom-appbar-lead") as Element).gap,
			getComputedStyle(document.querySelector(".ds-atom-appbar-nav") as Element).gap,
			getComputedStyle(document.querySelector(".ds-atom-appbar-actions") as Element).gap,
		]);
		expect(gaps).toEqual(["28px", "18px", "8px"]);
	});
});
