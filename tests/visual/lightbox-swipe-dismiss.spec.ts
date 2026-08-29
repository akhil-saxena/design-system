import { type Page, expect, test } from "@playwright/test";

/**
 * PUB-06 / D-16 — swipe DOWN to dismiss the Lightbox, with REAL touch input.
 *
 * ## Why this file exists next to the unit tests
 *
 * `Lightbox.test.tsx` owns the handler's arithmetic and passes with the backdrop
 * still declaring `touch-action: pan-y` — because jsdom implements no
 * `touch-action` at all, and `fireEvent.pointerUp` is a synthetic dispatch that
 * no browser gesture arbitration ever sees. In a real browser under `pan-y` the
 * compositor consumes a downward drag as a scroll before `pointerup` is ever
 * delivered, so the gesture is inert on exactly the devices it exists for. That
 * is also why a consumer could not add this: the CSS half is inside the
 * component's own stylesheet.
 *
 * These cases therefore drive `Input.dispatchTouchEvent` through CDP rather than
 * `page.mouse` or a synthetic PointerEvent. A synthetic event bypasses
 * `touch-action` entirely and would make every case here vacuous — the same trap
 * this repository records for `padding` vs an inline style.
 *
 * ## The value, and the two it is not
 *
 * Measured on this rig at 390x844, all with the dismiss branch already present:
 *
 *   pan-y (what shipped)  down: STILL OPEN     left: navigates
 *   pan-x (the proposal's alternative)
 *                         down: closes         left: DOES NOT NAVIGATE
 *   none  (the proposal)  down: closes         left: navigates
 *   pinch-zoom            down: closes         left: navigates
 *
 * `pinch-zoom` is chosen over `none` on the two-finger axis, which the table
 * above does not separate: dispatching a real pinch and reading
 * `visualViewport.scale` gives 1 under `none` and 5 under `pinch-zoom`. The
 * overlay's subject is a photograph, so magnifying it matters; `pan-y` already
 * forbade it, so this is a gain over what shipped as well as over the proposal.
 */

async function openGallery(page: Page) {
	await page.goto(
		"/iframe.html?id=overlays-lightbox--gallery&viewMode=story&globals=theme:light;brand:monochrome",
	);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 20_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.getByRole("button", { name: /open gallery/i }).click();
	await page.waitForSelector(".ds-atom-lightbox-backdrop", { timeout: 10_000 });
}

/** A one-finger drag as the touchscreen actually emits it. */
async function touchDrag(page: Page, from: [number, number], to: [number, number]) {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("Input.dispatchTouchEvent", {
		type: "touchStart",
		touchPoints: [{ x: from[0], y: from[1], id: 1 }],
	});
	const steps = 10;
	for (let i = 1; i <= steps; i++) {
		await cdp.send("Input.dispatchTouchEvent", {
			type: "touchMove",
			touchPoints: [
				{
					x: from[0] + ((to[0] - from[0]) * i) / steps,
					y: from[1] + ((to[1] - from[1]) * i) / steps,
					id: 1,
				},
			],
		});
	}
	await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
	await page.waitForTimeout(350);
	await cdp.detach();
}

test.describe("touch surface", () => {
	test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

	test("the backdrop keeps both pan axes and hands back pinch", async ({ page }) => {
		await openGallery(page);
		const ta = await page.evaluate(
			() =>
				getComputedStyle(document.querySelector(".ds-atom-lightbox-backdrop") as Element)
					.touchAction,
		);
		// pan-y or pan-x here means the browser owns one of the two axes and the
		// corresponding gesture below is dead, whatever the handler says.
		expect(ta, "the backdrop is giving a pan axis back to the browser").toBe("pinch-zoom");
	});

	test("a downward swipe dismisses the overlay", async ({ page }) => {
		await openGallery(page);
		await touchDrag(page, [195, 250], [195, 600]);
		await expect(
			page.locator(".ds-atom-lightbox-backdrop"),
			"350px of downward touch travel did not close the overlay",
		).toHaveCount(0);
	});

	test("a horizontal swipe still navigates, and does not dismiss", async ({ page }) => {
		await openGallery(page);
		const before = await page.getAttribute(".ds-atom-lightbox-image", "src");
		await touchDrag(page, [300, 420], [120, 420]);
		await expect(
			page.locator(".ds-atom-lightbox-backdrop"),
			"the horizontal swipe closed the overlay",
		).toHaveCount(1);
		const after = await page.getAttribute(".ds-atom-lightbox-image", "src");
		expect(after, "the horizontal swipe no longer navigates").not.toBe(before);
	});

	test("an upward swipe does neither", async ({ page }) => {
		await openGallery(page);
		const before = await page.getAttribute(".ds-atom-lightbox-image", "src");
		await touchDrag(page, [195, 600], [195, 250]);
		await expect(page.locator(".ds-atom-lightbox-backdrop")).toHaveCount(1);
		expect(await page.getAttribute(".ds-atom-lightbox-image", "src")).toBe(before);
	});

	test("pinch-to-zoom survives, which is what `none` would have cost", async ({ page }) => {
		await openGallery(page);
		const cdp = await page.context().newCDPSession(page);
		const before = await page.evaluate(() => visualViewport?.scale ?? Number.NaN);
		await cdp.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: [
				{ x: 150, y: 420, id: 1 },
				{ x: 240, y: 420, id: 2 },
			],
		});
		for (let i = 1; i <= 12; i++) {
			const d = 45 + i * 12;
			await cdp.send("Input.dispatchTouchEvent", {
				type: "touchMove",
				touchPoints: [
					{ x: 195 - d, y: 420, id: 1 },
					{ x: 195 + d, y: 420, id: 2 },
				],
			});
		}
		await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
		await page.waitForTimeout(400);
		const after = await page.evaluate(() => visualViewport?.scale ?? Number.NaN);
		await cdp.detach();
		expect(before).toBe(1);
		expect(
			after,
			"the photograph can no longer be magnified — the backdrop is forbidding pinch",
		).toBeGreaterThan(1);
	});
});
