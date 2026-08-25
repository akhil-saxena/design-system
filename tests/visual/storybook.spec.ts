import { type Page, expect, test } from "@playwright/test";

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
 *
 * This set is shared by every brand and is NOT widened per brand. A story that
 * is nondeterministic under monochrome but stable under the default brand would be
 * a finding about monochrome, not a candidate for this list.
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

/**
 * A fixed instant for the whole suite.
 *
 * Five stories rendered from the real clock — DatePicker/DateRangePicker
 * `disablePast`, and RelativeTime's "x days ago" — so their baselines went stale
 * the moment the date rolled over. Because the suite is one test looping over
 * every story, that failure used to abort the run and everything after it went
 * unchecked; freezing the clock removes the cause rather than the symptom, and
 * `expect.soft` below means a future mismatch can no longer hide the rest.
 */
const FIXED_NOW = new Date("2026-06-15T12:00:00Z");

/**
 * THE BRAND AXIS (D-37). Every story is captured once per brand, so monochrome
 * gains the visual companion DS-06's numeric contrast contract cannot provide —
 * a token can pass a ratio assertion and still look wrong. The accepted cost is
 * a doubled snapshot count and a doubled review burden; it was weighed in
 * 00-THEME-API.md §"Release and versioning" and taken.
 *
 * MODE IS NOT A THIRD LOOP, and that is not an omission. Mode is already an axis
 * of the story set itself: the library ships an explicit `--dark-mode` story per
 * component, and since 01-19.1 each one pins `globals: { theme: "dark" }` at the
 * story level rather than wrapping itself in a hardcoded `className="dark"`
 * island. So iterating brand over every story IS brand x mode. Adding a mode
 * loop here would re-capture every light story a second time under a theme
 * global that its own story-level global overrides — 504 identical duplicates.
 *
 * ONE TEST PER BRAND, rather than a raised `timeout`. playwright.config.ts
 * allows 300s per test and a single-brand pass over 504 stories measures ~1.7min,
 * so two tests both stay inside the existing budget while a failure report names
 * the brand that broke. Raising the timeout would have bought one test that can
 * only say "something, somewhere, moved".
 *
 * THE SUFFIX IS CHOSEN SO THE TWO BRANDS INTERLEAVE. `--monochrome` sorts
 * immediately before the bare default name, because "-" (0x2D) precedes the "c"
 * of the "-chromium-darwin" platform suffix Playwright appends:
 *
 *   inputs-button--default--monochrome-chromium-darwin.png
 *   inputs-button--default-chromium-darwin.png
 *
 * A reviewer comparing one component across brands reads two adjacent lines
 * instead of scrolling between two halves of a 1,000-file directory. Separate
 * subdirectories or a `monochrome-` prefix would both have produced that split.
 */
const BRANDS = [
	{ id: "default", suffix: "" },
	{ id: "monochrome", suffix: "--monochrome" },
] as const;

async function discoverStoryIds(page: Page): Promise<string[]> {
	await page.goto("http://localhost:6006/index.json");
	const indexJson = await page.evaluate(() => document.body.innerText);
	const stories: { id: string }[] = Object.values(JSON.parse(indexJson).entries ?? {}).filter(
		(e: unknown) => (e as { type: string }).type === "story",
	) as {
		id: string;
	}[];
	return stories.map((s) => s.id);
}

test.describe("Storybook visual baselines", () => {
	/**
	 * SERIAL, AND THIS IS NOT A PERFORMANCE CHOICE -- IT IS CORRECTNESS.
	 *
	 * playwright.config.ts sets `fullyParallel: true` with a default worker count,
	 * so splitting one test into two put both brand passes on the wire at once
	 * against ONE Storybook dev server. Under that contention the monochrome pass
	 * flagged `data-display-tabs--narrow-overflow--monochrome` at 96 px (a ratio of
	 * 0.01), reporting "captured a stable screenshot" as it did so.
	 *
	 * The recorded bytes were never wrong. Re-running this same spec serially, with
	 * no `--update-snapshots` and no file touched, flags NOTHING: 504 + 504, clean.
	 * So the instability was in the concurrent comparison, not in the capture, and
	 * a story on a measurement-dependent layout (tab overflow: two triggers plus a
	 * 32px More button) is where it surfaces first. Serialising removes it.
	 *
	 * Worth stating because it nearly became a wrong fix: the obvious reading was
	 * "the baseline is bad, re-record it". Re-recording would have overwritten a
	 * correct image with whatever the next contended run produced, and the gate
	 * would have gone green while getting less trustworthy.
	 *
	 * This is the mechanism 01-SIBLING-PROTOCOL section 3(b) warns about ("two
	 * concurrent runs attach to ONE server... this repository has already recorded
	 * baselines with a bug present once"), reached from a direction it did not
	 * anticipate: not two executors, but one spec's own two tests.
	 *
	 * Serial costs wall-clock and buys nothing back, which is the correct trade for
	 * a store of 1,019 recorded images. Each test still measures ~1.6min against
	 * the 300s per-test budget, so the split's original purpose -- a failure report
	 * that names the brand -- is unaffected.
	 */
	test.describe.configure({ mode: "serial" });

	for (const brand of BRANDS) {
		test(`captures all stories — ${brand.id} brand`, async ({ page }) => {
			await page.clock.setFixedTime(FIXED_NOW);
			const storyIds = await discoverStoryIds(page);
			expect(storyIds.length).toBeGreaterThan(0);

			// A story id that already ends in a brand suffix would make two different
			// stories share one baseline filename, silently. Assert it cannot happen
			// rather than trusting that nobody ever names a story "--monochrome".
			for (const suffix of BRANDS.map((b) => b.suffix).filter(Boolean)) {
				const collisions = storyIds.filter((id) => id.endsWith(suffix));
				expect(
					collisions,
					`story ids ending in "${suffix}" would collide with a brand-suffixed baseline name`,
				).toEqual([]);
			}

			const captured: string[] = [];
			for (const id of storyIds) {
				if (TIME_DEPENDENT.has(id)) continue;
				// The brand is set through Storybook's own `globals` query param, which
				// is what .storybook/preview.tsx's decorator reads. It composes with a
				// story-level `globals: { theme: "dark" }` rather than replacing it:
				// story-level globals only override the keys they declare, so a dark
				// story stays dark and gains the brand. Measured, not assumed — under
				// `brand:monochrome` a dark story resolves --cream to monochrome's #161616
				// rather than the design system's #181818.
				await page.goto(
					`http://localhost:6006/iframe.html?id=${id}&viewMode=story&globals=brand:${brand.id}`,
				);
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
				// `expect.soft` so one mismatch does not abort the loop. This was a hard
				// `expect`, and the suite is a *single test* iterating every story — so the
				// first differing story ended the run and every story after it went
				// unchecked. A date-dependent DatePicker story failing on a date rollover
				// was silently hiding the rest of the suite. Kept in both brand tests: one
				// monochrome mismatch must not hide the other 503 monochrome stories either.
				await expect.soft(page).toHaveScreenshot(`${id}${brand.suffix}.png`, {
					fullPage: true,
					// Nothing previously froze the system's 20 @keyframes / ~74 transitions
					// for this suite, so a story with an entry animation could be captured
					// mid-flight — which is why re-recording produced a *different* flaky
					// story on each subsequent run. Animation is killed by the style tag
					// above; caret: "hide" removes the blinking cursor, a 1px diff in any
					// story with a focused input.
					caret: "hide",
				});
				captured.push(id);
			}

			// Fail loudly if the exclusion list silently grows to cover everything, and
			// make the skipped count visible in the run output rather than implicit.
			const skipped = storyIds.length - captured.length;
			expect(skipped).toBeLessThanOrEqual(TIME_DEPENDENT.size);
			console.log(
				`visual baselines [${brand.id}]: captured ${captured.length}, skipped ${skipped} time-dependent`,
			);
		});
	}
});
