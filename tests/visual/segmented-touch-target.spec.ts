import { type Page, expect, test } from "@playwright/test";

/**
 * D-3 / OQ-4 — SegmentedControl's buttons, and FilterNav's anchors which share
 * the class, must clear the project's 44px coarse-pointer floor without growing
 * at a fine pointer.
 *
 * ## What was measured before the fix
 *
 * All three declared sizes were under the floor at a coarse pointer: `sm` 28px,
 * `md` 32px, `lg` 40px. The consumer that produced the finding runs its gallery
 * filter at `lg` and measured 40px on every phone.
 *
 * The heights ARE declared — `.ds-atom-segmented[data-size="lg"]
 * .ds-atom-segmented-btn { height: 40px }` at (0,3,0) — which is exactly why the
 * fix is a `min-height` rather than a competing `height`: used height is
 * max(min-height, height), so a single-class rule wins without having to beat a
 * three-part selector.
 *
 * ## Why a browser
 *
 * The rule lives inside `@media (pointer: coarse)`. jsdom implements neither
 * layout nor media queries, so a unit test cannot tell a rule that applies from
 * one that never matches — and cannot see the max(min-height, height) resolution
 * that is the whole mechanism.
 */

const FLOOR = 44;

/** Every segment button in a story, with the box and the two inputs to it. */
async function segments(page: Page, story: string) {
	await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:light;brand:monochrome`);
	await page.waitForSelector(".ds-atom-segmented-btn", { timeout: 20_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
	const read = await page.evaluate(() => {
		const els = [...document.querySelectorAll(".ds-atom-segmented-btn")];
		return els.map((el) => {
			const cs = getComputedStyle(el);
			const wrap = el.closest(".ds-atom-segmented");
			return {
				tag: el.tagName.toLowerCase(),
				size: wrap?.getAttribute("data-size") ?? "(none)",
				text: (el.textContent ?? "").trim().slice(0, 16),
				h: Math.round(el.getBoundingClientRect().height * 100) / 100,
				w: Math.round(el.getBoundingClientRect().width * 100) / 100,
				height: cs.height,
				minHeight: cs.minHeight,
			};
		});
	});
	if (read.length === 0) {
		throw new Error(`no .ds-atom-segmented-btn in "${story}" — the assertion would be vacuous`);
	}
	return read;
}

test.describe("coarse pointer", () => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

	test("the emulation really does select (pointer: coarse)", async ({ page }) => {
		await page.goto("/iframe.html?id=data-display-filternav--sizes&viewMode=story");
		await page.waitForSelector("#storybook-root", { state: "attached" });
		expect(
			await page.evaluate(() => ({
				coarse: matchMedia("(pointer: coarse)").matches,
				fine: matchMedia("(pointer: fine)").matches,
			})),
			"without a coarse pointer every other case in this block proves nothing",
		).toEqual({ coarse: true, fine: false });
	});

	for (const story of [
		"data-display-filternav--sizes",
		"data-display-filternav--default",
		"data-display-segmentedcontrol--sizes",
		"data-display-segmentedcontrol--default",
	]) {
		test(`every segment in ${story} clears 44px tall`, async ({ page }) => {
			const boxes = await segments(page, story);
			const under = boxes
				.filter((b) => b.h < FLOOR)
				.map((b) => `${b.tag}[${b.size}] "${b.text}" ${b.w}x${b.h} (height:${b.height})`);
			expect(under, `segments below the ${FLOOR}px height floor at a coarse pointer`).toEqual([]);
		});
	}

	test("the floor reaches every declared size, sm through lg", async ({ page }) => {
		const boxes = await segments(page, "data-display-filternav--sizes");
		const bySize = new Map(boxes.map((b) => [b.size, b]));
		expect(
			[...bySize.keys()].sort(),
			"this story must render all three sizes or the coverage claim is false",
		).toEqual(["lg", "md", "sm"]);
		for (const [size, b] of bySize) {
			expect(b.minHeight, `data-size="${size}" did not receive the coarse floor`).toBe("44px");
			expect(b.h, `data-size="${size}" resolved to ${b.h}px`).toBe(44);
		}
	});
});

test.describe("fine pointer", () => {
	test.use({ hasTouch: false, viewport: { width: 1440, height: 900 } });

	test("the emulation really does select (pointer: fine)", async ({ page }) => {
		await page.goto("/iframe.html?id=data-display-filternav--sizes&viewMode=story");
		await page.waitForSelector("#storybook-root", { state: "attached" });
		expect(
			await page.evaluate(() => ({
				coarse: matchMedia("(pointer: coarse)").matches,
				fine: matchMedia("(pointer: fine)").matches,
			})),
		).toEqual({ coarse: false, fine: true });
	});

	test("the designed density is untouched at a fine pointer", async ({ page }) => {
		const boxes = await segments(page, "data-display-filternav--sizes");
		const bySize = new Map(boxes.map((b) => [b.size, b]));
		// The drawn geometry, unchanged: these are the values the component has
		// always declared, and a leak of the coarse rule would replace all three
		// with 44.
		expect([bySize.get("sm")?.h, bySize.get("md")?.h, bySize.get("lg")?.h]).toEqual([28, 32, 40]);
		for (const [size, b] of bySize) {
			expect(
				b.minHeight,
				`a 44px floor is in effect at "${size}" — the coarse rule leaked`,
			).not.toBe("44px");
		}
	});
});
