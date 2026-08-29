import { type Page, expect, test } from "@playwright/test";

/**
 * D-2 — `--ds-appbar-h` must be readable by the element that needs it, and the
 * number it reports must be the number the bar paints.
 *
 * ## Two independent defects, measured before the fix
 *
 * (a) It was declared on `.ds-atom-appbar`. Custom properties inherit to
 *     DESCENDANTS, not to siblings, and the property's own docstring hands a
 *     consumer `min-height: calc(100svh - var(--ds-appbar-h))` for a section
 *     placed UNDER the bar — which is a sibling. Read from a sibling it resolved
 *     to the empty string, so the calc fell back to `auto`. Measured on a real
 *     consumer, on every route, at both pointers.
 *
 * (b) It said 47px. At a fine pointer the library's own stories painted 53, 51,
 *     61 and 47, and the consumer's bar painted 57 — so a consumer who copied
 *     the number got a layout 10px short, which is the direction that causes
 *     scroll rather than a gap.
 *
 * ## Why the sibling case is the one that matters
 *
 * `touch-target.spec.ts` already asserted the value against the paint and passed
 * throughout, because it read the property from the BAR and used the one story
 * (`AnchorNavigation`) whose 47px happened to be right. Reading it from the bar
 * can never see defect (a) at all, and one story can never see (b). These cases
 * read it from a sibling, and from every story.
 */

const STORIES = [
	"layout-appbar--default",
	"layout-appbar--minimal",
	"layout-appbar--with-search",
	"layout-appbar--centered",
	"layout-appbar--scrolled",
	"layout-appbar--anchor-navigation",
	"layout-appbar--dark-mode",
] as const;

async function read(page: Page, story: string) {
	await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:light;brand:monochrome`);
	await page.waitForSelector(".ds-atom-appbar", { timeout: 20_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
	return page.evaluate(() => {
		const bar = document.querySelector(".ds-atom-appbar");
		if (!bar?.parentElement) throw new Error("no .ds-atom-appbar with a parent in this story");
		// A real sibling, inserted immediately after the bar — the exact position
		// the documented recipe is written for.
		const sib = document.createElement("div");
		bar.parentElement.insertBefore(sib, bar.nextSibling);
		const fromSibling = getComputedStyle(sib).getPropertyValue("--ds-appbar-h").trim();
		sib.style.height = "calc(100svh - var(--ds-appbar-h))";
		const siblingCalc = Math.round(sib.getBoundingClientRect().height * 100) / 100;
		sib.remove();
		return {
			fromSibling,
			siblingCalc,
			viewportH: window.innerHeight,
			painted: Math.round(bar.getBoundingClientRect().height * 100) / 100,
		};
	});
}

/* ── (a) reachability ────────────────────────────────────────────────────── */
test.describe("a sibling can read the property", () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	for (const story of STORIES) {
		test(`${story}`, async ({ page }) => {
			const r = await read(page, story);
			expect(
				r.fromSibling,
				"a sibling read the empty string — the property is declared somewhere only descendants can see",
			).toMatch(/^\d+(\.\d+)?px$/);
			// The documented recipe must actually resolve, not fall back to auto.
			expect(
				r.siblingCalc,
				`calc(100svh - var(--ds-appbar-h)) resolved to ${r.siblingCalc}px in a ${r.viewportH}px viewport`,
			).toBe(r.viewportH - Number.parseFloat(r.fromSibling));
		});
	}
});

/* ── (b) the number is the paint ─────────────────────────────────────────── */
for (const [label, opts] of [
	["fine", { hasTouch: false, viewport: { width: 1440, height: 900 } }],
	["coarse", { hasTouch: true, viewport: { width: 1440, height: 900 } }],
] as const) {
	test.describe(`${label} pointer: the value is the painted height`, () => {
		test.use(opts);

		for (const story of STORIES) {
			test(`${story}`, async ({ page }) => {
				const r = await read(page, story);
				expect(
					r.painted,
					`--ds-appbar-h says ${r.fromSibling} but the bar paints ${r.painted}px`,
				).toBe(Number.parseFloat(r.fromSibling));
			});
		}
	});
}

/* ── the residual, pinned rather than left to widen ──────────────────────── */
test.describe("the documented limitation", () => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

	test("a squeezed row paints taller than the floor, and the floor is never an OVER-claim", async ({
		page,
	}) => {
		const seen: string[] = [];
		for (const story of STORIES) {
			const r = await read(page, story);
			const declared = Number.parseFloat(r.fromSibling);
			// The one invariant that must hold everywhere: a floor may be exceeded
			// by content, but it must never claim MORE than the bar paints — that is
			// the direction that pushes a consumer's section below the fold.
			expect(
				declared,
				`${story}: the property claims ${declared}px while the bar paints only ${r.painted}px`,
			).toBeLessThanOrEqual(r.painted);
			if (declared !== r.painted) seen.push(`${story} ${declared}->${r.painted}`);
		}
		// Recorded, not asserted empty: at 390px the row does not fit and the logo
		// label wraps. If this list ever shrinks to nothing the limitation is gone
		// and this case should go with it.
		console.log(`390px squeezed rows: ${seen.join(", ") || "(none — the limitation is gone)"}`);
	});
});
