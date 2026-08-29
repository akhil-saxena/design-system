import { type Page, expect, test } from "@playwright/test";

/**
 * `AppBarVariant` promised four variants and the package implemented three.
 *
 * ## What was measured, before
 *
 * `grep -c 'data-variant="minimal"' dist/primitives.css` returned **0**. The
 * component did branch on the variant — a minimal bar renders a different set of
 * children — but it painted its chrome from an inline `style` object that made no
 * distinction at all, so in Chromium at 1440x900 `layout-appbar--minimal` and
 * `layout-appbar--default` computed the IDENTICAL background
 * `rgba(255, 255, 255, 0.55)` and the IDENTICAL `blur(14px)`. A consumer selecting
 * "minimal" got the bar it already had and no way to find out why.
 *
 * ## The second thing the inline chrome was hiding
 *
 * `.dark .ds-atom-appbar[data-scrolled="true"]` has declared
 * `rgba(28, 25, 23, 0.92)` for as long as it has existed, and had never once
 * applied. Measured before this change: a scrolled bar in dark mode painted
 * `rgba(255, 255, 255, 0.92)` — very nearly white, across the top of a dark page.
 * No story covers dark + scrolled, so no screenshot baseline was ever going to
 * catch it; it is asserted directly below instead.
 *
 * ## Why a browser
 *
 * Every claim here is a cascade outcome. jsdom implements no specificity, no
 * `backdrop-filter` and no colour compositing, so the entire vitest suite stays
 * green with the inline chrome restored — the AppBar unit tests can only check
 * that the declarations are absent from the style attribute, which is a proxy.
 */

type Chrome = {
	background: string;
	backdropFilter: string;
	borderBottom: string;
	height: number;
	appbarH: string;
};

async function chrome(page: Page, story: string, mode: "light" | "dark"): Promise<Chrome> {
	await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:${mode};brand:default`);
	await page.waitForSelector(".ds-atom-appbar", { timeout: 30_000 });
	await page.waitForFunction(
		(want) => document.documentElement.classList.contains("dark") === want,
		mode === "dark",
		{ timeout: 15_000 },
	);
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
	return page.evaluate(() => {
		const el = document.querySelector(".ds-atom-appbar") as HTMLElement;
		const cs = getComputedStyle(el);
		return {
			background: cs.backgroundColor,
			backdropFilter: cs.backdropFilter,
			borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
			height: Math.round(el.getBoundingClientRect().height),
			appbarH: getComputedStyle(document.documentElement).getPropertyValue("--ds-appbar-h").trim(),
		};
	});
}

test.describe("the minimal variant", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("paints differently from default, which it did not before", async ({ page }) => {
		const minimal = await chrome(page, "layout-appbar--minimal", "light");
		const dflt = await chrome(page, "layout-appbar--default", "light");
		expect(
			minimal.background,
			"minimal still paints the default surface fill — the variant is a type with nothing behind it",
		).not.toBe(dflt.background);
		expect(minimal.background, "minimal has a surface fill").toBe("rgba(0, 0, 0, 0)");
		expect(minimal.backdropFilter, "minimal is still blurring what is behind it").toBe("none");
		// The other bar must be unchanged, or "different" would be satisfied by
		// having broken the default one.
		expect(dflt.background).toBe("rgba(255, 255, 255, 0.55)");
		expect(dflt.backdropFilter).toBe("blur(14px)");
	});

	test("keeps the transparent border, and therefore the height the token promises", async ({
		page,
	}) => {
		const minimal = await chrome(page, "layout-appbar--minimal", "light");
		// 32px control + 2x12 padding + 1px border = 57. Dropping the border to make
		// the bar "more minimal" would take a pixel off every minimal bar while
		// --ds-appbar-h kept saying 57, and every consumer subtracting it would be
		// one pixel wrong.
		expect(minimal.borderBottom).toBe("1px solid rgba(0, 0, 0, 0)");
		expect(minimal.height).toBe(57);
		expect(minimal.appbarH).toBe("57px");
	});

	test("still takes the scrolled chrome, because that is what scrolled means", async ({ page }) => {
		const rest = await chrome(page, "layout-appbar--minimal", "light");
		// Drive the prop the way a consumer does, rather than trusting a second story.
		await page.evaluate(() => {
			const el = document.querySelector(".ds-atom-appbar") as HTMLElement;
			el.setAttribute("data-scrolled", "true");
		});
		const scrolled = await page.evaluate(() => {
			const cs = getComputedStyle(document.querySelector(".ds-atom-appbar") as HTMLElement);
			return { background: cs.backgroundColor, backdropFilter: cs.backdropFilter };
		});
		expect(rest.background).toBe("rgba(0, 0, 0, 0)");
		expect(
			scrolled.background,
			"a scrolled minimal bar is still transparent, so there is nothing separating it from the content moving under it",
		).toBe("rgba(255, 255, 255, 0.92)");
		expect(scrolled.backdropFilter).toBe("blur(14px)");
	});

	/**
	 * THE DISCRIMINATOR. The minimal rule is
	 * `[data-variant="minimal"][data-scrolled="false"]` at (0,3,0). A (0,2,0)
	 * spelling — `[data-variant="minimal"]` alone — would also pass every case
	 * above, because it sits LATER in primitives.css than the rule it has to beat.
	 * That is a tie decided by file order, and this repository has already lost a
	 * fix to exactly that (D-17).
	 *
	 * Restating a competing (0,2,0) rule from an injected sheet puts it after
	 * primitives.css in the cascade. Only a genuinely more specific selector
	 * survives it.
	 */
	test("minimal wins on specificity, not on source order", async ({ page }) => {
		await chrome(page, "layout-appbar--minimal", "light");
		await page.addStyleTag({
			content:
				'.ds-atom-appbar[data-scrolled="false"]{background:var(--surf-2);backdrop-filter:blur(14px)}',
		});
		const after = await page.evaluate(() => {
			const cs = getComputedStyle(document.querySelector(".ds-atom-appbar") as HTMLElement);
			return { background: cs.backgroundColor, backdropFilter: cs.backdropFilter };
		});
		expect(
			after,
			"a later (0,2,0) rule beat the minimal rule — the fix is not more specific, it is only sitting further down the file",
		).toEqual({ background: "rgba(0, 0, 0, 0)", backdropFilter: "none" });
	});
});

test.describe("the chrome the inline styles were hiding", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("a scrolled bar in dark mode is dark, not white", async ({ page }) => {
		const dark = await chrome(page, "layout-appbar--scrolled", "dark");
		expect(
			dark.background,
			"the scrolled bar is painting the light-mode fill over a dark page",
		).toBe("rgba(28, 25, 23, 0.92)");
		// The border picks up the dark --rule for the same reason.
		expect(dark.borderBottom).toBe("1px solid rgba(255, 255, 255, 0.09)");
	});

	test("light mode is unchanged, at rest and scrolled", async ({ page }) => {
		// The values moved out of the style attribute; they did not change. If
		// either of these moved, the move was not value-preserving and every
		// AppBar screenshot baseline is now wrong for a reason nobody intended.
		const rest = await chrome(page, "layout-appbar--default", "light");
		expect(rest.background).toBe("rgba(255, 255, 255, 0.55)");
		expect(rest.borderBottom).toBe("1px solid rgba(0, 0, 0, 0)");

		const scrolled = await chrome(page, "layout-appbar--scrolled", "light");
		expect(scrolled.background).toBe("rgba(255, 255, 255, 0.92)");
		expect(scrolled.borderBottom).toBe("1px solid rgba(0, 0, 0, 0.08)");
	});

	test("nothing paints the bar from the style attribute any more", async ({ page }) => {
		await chrome(page, "layout-appbar--scrolled", "light");
		const inline = await page.evaluate(
			() => (document.querySelector(".ds-atom-appbar") as HTMLElement).getAttribute("style") ?? "",
		);
		for (const decl of ["background", "backdrop-filter", "border-bottom", "box-shadow"]) {
			expect(inline, `${decl} is inline again; every rule above is unreachable`).not.toContain(
				decl,
			);
		}
	});
});
