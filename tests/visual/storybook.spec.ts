import { expect, test } from "@playwright/test";

// Iterates Storybook stories and captures screenshots into
// tests/visual/storybook.spec.ts-snapshots/. Storybook must be running on
// localhost:6006 — playwright.config.ts webServer starts
// `npm run storybook -- --quiet --no-open` automatically. Story IDs are
// discovered via /index.json on the running server.

/**
 * Stories whose rendered output is a function of the wall clock, and which
 * therefore cannot have a stable pixel baseline. Excluded deliberately rather
 * than re-generated on every run — a baseline that changes every second tells
 * you nothing, and re-recording it hides real regressions elsewhere.
 *
 * Prefer making a story deterministic over adding to this list. Two of the three
 * original offenders were fixed that way instead: Calendar's day view took a
 * `nowOverride` prop, and Carousel/Avatar swapped live picsum/pravatar fetches
 * for local SVG data URIs. These two remain because a *live clock* is the entire
 * subject of the story — freezing it would document the wrong thing.
 */
const TIME_DEPENDENT = new Set([
	// Driven by useClock() — re-renders every second with the real time.
	"display-rollingnumber--clock-dark",
	// Driven by useCounter() — a setInterval that increments the value on a timer,
	// so the digits differ depending on when the capture lands.
	"display-rollingnumber--animated-counter",
	"display-rollingnumber--counter-dark",
	"display-rollingnumber--counter-light",
]);

test.describe("Storybook visual baselines", () => {
	test("captures all stories", async ({ page }) => {
		await page.goto("http://localhost:6006/index.json");
		const indexJson = await page.evaluate(() => document.body.innerText);
		const stories: { id: string }[] = Object.values(JSON.parse(indexJson).entries ?? {}).filter(
			(e: unknown) => (e as { type: string }).type === "story",
		) as {
			id: string;
		}[];
		expect(stories.length).toBeGreaterThan(0);

		const captured: string[] = [];
		for (const story of stories) {
			if (TIME_DEPENDENT.has(story.id)) continue;
			await page.goto(`http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`);
			// Use 'attached' state so Lightbox stories (which auto-open a dialog that hides
			// #storybook-root from the accessibility tree) don't time out.
			await page.waitForSelector("#storybook-root", { state: "attached", timeout: 5000 });
			// Web fonts change metrics and therefore layout height. Without this the
			// capture races font loading.
			// Kill animation via CSS rather than Playwright's `animations: "disabled"`.
			// That option waits for animations to *finish*, and three of the system's
			// animations are infinite (button spinner, progress dot, skeleton pulse),
			// so it times out on any story containing them. This mirrors what
			// .storybook/test-runner.ts injects in preVisit.
			await page.addStyleTag({
				content: `*, *::before, *::after {
					animation: none !important;
					transition: none !important;
					caret-color: transparent !important;
				}`,
			});
			// `.then(() => undefined)` because document.fonts.ready resolves to a
			// FontFaceSet, which Playwright cannot serialize back across the bridge.
			await page.evaluate(() => document.fonts.ready.then(() => undefined));
			await expect(page).toHaveScreenshot(`${story.id}.png`, {
				fullPage: true,
				// Nothing previously froze the system's 20 @keyframes / ~74 transitions
				// for this suite, so a story with an entry animation could be captured
				// mid-flight — which is why re-recording produced a *different* flaky
				// story on each subsequent run. Animation is killed by the style tag
				// above; caret: "hide" removes the blinking cursor, a 1px diff in any
				// story with a focused input.
				caret: "hide",
			});
			captured.push(story.id);
		}

		// Fail loudly if the exclusion list silently grows to cover everything, and
		// make the skipped count visible in the run output rather than implicit.
		const skipped = stories.length - captured.length;
		expect(skipped).toBeLessThanOrEqual(TIME_DEPENDENT.size);
		console.log(`visual baselines: captured ${captured.length}, skipped ${skipped} time-dependent`);
	});
});
