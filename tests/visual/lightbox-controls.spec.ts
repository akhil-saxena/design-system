import { type Page, expect, test } from "@playwright/test";

/**
 * D-17 — the Lightbox's close, prev and next controls must render at the size
 * the component intends, and clear the 44px floor on a coarse pointer.
 *
 * ## The defect was a lost cascade contest, not a wrong number
 *
 * Lightbox renders its three controls as `<IconButton>` at the default
 * `size="md"`, so they match `.ds-atom-iconbtn[data-size="md"]` — (0,2,0),
 * declaring 32px. The Lightbox's own `width: 40px; height: 40px` sat on
 * `.ds-atom-lightbox-close` at (0,1,0) and never applied. Measured before the
 * fix at 390x844 coarse AND 1440x900 fine: 32x32 in both. Not a touch-only
 * defect, and not fixable by changing the value.
 *
 * ## Why these cases are written against the cascade rather than the pixels
 *
 * jsdom implements no specificity at all — 01-09 measured that — so every unit
 * test in this repository would stay green with the losing rule restored. The
 * `size="lg"` case below is the discriminator: it proves the fix wins by
 * SPECIFICITY rather than by source order, because it survives IconButton
 * declaring a competing value from a different `[data-size]`.
 */

const FLOOR = 44;
const CONTROLS = [
	".ds-atom-lightbox-close",
	".ds-atom-lightbox-prev",
	".ds-atom-lightbox-next",
] as const;

async function openGallery(page: Page) {
	await page.goto(
		"/iframe.html?id=overlays-lightbox--gallery&viewMode=story&globals=theme:light;brand:monochrome",
	);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 20_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.getByRole("button", { name: /open gallery/i }).click();
	await page.waitForSelector(".ds-atom-lightbox-backdrop", { timeout: 10_000 });
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
}

async function boxes(page: Page) {
	return page.evaluate((sels: readonly string[]) => {
		const out: Record<string, { w: number; h: number; size: string | null }> = {};
		for (const s of sels) {
			const el = document.querySelector(s);
			if (!el) throw new Error(`no ${s} — the assertion would be vacuous`);
			const r = el.getBoundingClientRect();
			out[s] = {
				w: Math.round(r.width * 100) / 100,
				h: Math.round(r.height * 100) / 100,
				size: el.getAttribute("data-size"),
			};
		}
		return out;
	}, CONTROLS);
}

test.describe("fine pointer", () => {
	test.use({ hasTouch: false, viewport: { width: 1440, height: 900 } });

	test("the three controls render at the Lightbox's 40px, not IconButton's 32px", async ({
		page,
	}) => {
		await openGallery(page);
		const b = await boxes(page);
		expect(
			Object.values(b).map((x) => `${x.w}x${x.h}`),
			`the controls are still painting IconButton's [data-size] value: ${JSON.stringify(b)}`,
		).toEqual(["40x40", "40x40", "40x40"]);
		// They ARE still md IconButtons — the fix is in the cascade, not by
		// swapping the component's size prop, so this must stay true.
		expect(Object.values(b).map((x) => x.size)).toEqual(["md", "md", "md"]);
	});

	test("the fix wins on specificity, not on source order", async ({ page }) => {
		await openGallery(page);
		// THE DISCRIMINATOR. Restating IconButton's rule verbatim from an injected
		// sheet puts a (0,2,0) competitor LAST in the cascade — later than
		// primitives.css and therefore later than the fix. A fix that is itself
		// (0,2,0), such as `.ds-atom-lightbox-close.ds-atom-iconbtn`, ties with it
		// and LOSES the tie to source order; only a genuinely more specific
		// selector survives. Without this case, a tie-breaking-by-position fix
		// would pass every other assertion in this file.
		await page.addStyleTag({
			content: '.ds-atom-iconbtn[data-size="md"]{width:32px;height:32px}',
		});
		const b = await boxes(page);
		expect(
			Object.values(b).map((x) => `${x.w}x${x.h}`),
			"a later (0,2,0) rule beat the Lightbox rule — the fix is not more specific, it is only sitting further down the file",
		).toEqual(["40x40", "40x40", "40x40"]);
	});
});

test.describe("coarse pointer", () => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

	test("the emulation really does select (pointer: coarse)", async ({ page }) => {
		await page.goto("/iframe.html?id=overlays-lightbox--gallery&viewMode=story");
		await page.waitForSelector("#storybook-root", { state: "attached" });
		expect(
			await page.evaluate(() => ({
				coarse: matchMedia("(pointer: coarse)").matches,
				fine: matchMedia("(pointer: fine)").matches,
			})),
		).toEqual({ coarse: true, fine: false });
	});

	test("every control clears 44px on both axes", async ({ page }) => {
		await openGallery(page);
		const b = await boxes(page);
		const under = Object.entries(b)
			.filter(([, x]) => x.h < FLOOR || x.w < FLOOR)
			.map(([s, x]) => `${s} ${x.w}x${x.h}`);
		expect(
			under,
			`on a phone these are the only affordances for closing and navigating; below the ${FLOOR}px floor`,
		).toEqual([]);
	});
});
