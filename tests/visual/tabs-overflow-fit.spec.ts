import { type Page, expect, test } from "@playwright/test";

/**
 * G8. Tabs must reach the SAME overflow count whether its measurement runs
 * before or after a webfont swaps, and the count it reaches must be the one the
 * geometry actually supports.
 *
 * THE DEFECT THIS LOCKS DOWN
 *
 * `Tabs` read tab widths once, from a ResizeObserver watching the ROOT element —
 * whose width is set by the consumer's container and never changes in response
 * to anything inside the component. So the observer fired on its initial
 * delivery and never again, and that delivery lands in the window before the
 * webfont swaps. On the Narrow/Overflow story, "Reports" measures 76.547px on
 * fallback metrics and 75.922px in DM Sans, and the container sits 0.25px from
 * the boundary: the strip showed two tabs or three depending on whether a font
 * arrived first, permanently for that page load. Cold cache and warm cache saw
 * different numbers of tabs.
 *
 * WHY NO EXISTING GATE CAUGHT IT
 *
 * The visual store DID see it, and could not name it. The Narrow/Overflow
 * baseline failed intermittently for three plans running and was diagnosed twice
 * as a stale baseline, because a pixel diff can only say "these bytes differ" —
 * it cannot say which of the two renders the layout supports. Worse, Playwright
 * printed "captured a stable screenshot" immediately before reporting the
 * mismatch: `toHaveScreenshot` compares two frames 100ms apart, and the wrong
 * state persists for the life of the page, so it is stable AND wrong. A gate
 * that measures the geometry is the only kind that can tell those apart.
 *
 * WHY THE OBVIOUS FIX WOULD HAVE PASSED A WEAKER GATE
 *
 * Re-running the measurement on `document.fonts.ready` — the fix the finding
 * recommended — changes nothing, and this spec was proved against it. The old
 * measurement read the RENDERED `[role='tab']` buttons, of which only
 * `visibleCount` exist, and estimated the hidden ones from the average of the
 * visible ones. That makes the input a function of the previous output: a
 * one-way ratchet that can shrink but never grow back. Re-measuring after the
 * font settles sees two buttons and recomputes two. Assertion 1 below still
 * fails, to the same decimal, which is what a gate proved by planting its own
 * target is for.
 *
 * THE ASSERTIONS, AND WHY NONE IS SUFFICIENT ALONE
 *
 * 1. THE COUNT DOES NOT DEPEND ON WHEN THE MEASUREMENT RUNS. Rendered twice —
 *    once at the component's natural timing, once with the ResizeObserver's
 *    first delivery deliberately deferred past `document.fonts.ready` — the two
 *    must agree. This is the race, stated directly.
 * 2. THE VISIBLE TABS FIT. Necessary, and on its own worthless: a component that
 *    hid every tab would satisfy it perfectly.
 * 3. THE FIRST HIDDEN TAB GENUINELY DOES NOT FIT. This is the load-bearing one,
 *    and it fails on a SINGLE load with no timing trickery at all — the shipped
 *    render left 80.17px of empty bar while hiding a tab that needs 79.92px.
 *    Assertion 2 is blind to that by construction; assertion 1 would miss it if
 *    the component were consistently wrong instead of intermittently wrong.
 *
 * The hidden tab's width is measured by cloning a rendered trigger and giving it
 * the hidden label, read out of the overflow menu. Deliberately NOT read from
 * the component's own measurement strip: a gate that trusts the mechanism under
 * test can only confirm that mechanism is self-consistent.
 */

const BRANDS = ["default", "monochrome"] as const;

const STORY = "data-display-tabs--narrow-overflow";

/**
 * Defer the ResizeObserver's FIRST delivery until after fonts have settled.
 *
 * This changes nothing about what the component computes — it only moves the
 * read to the far side of the font swap, which is what happens on a loaded
 * machine when the callback is delayed. Injected before any story code runs.
 */
function deferResizeObserverPastFonts(): void {
	const Native = window.ResizeObserver;
	class Deferred extends Native {
		observe(...args: Parameters<ResizeObserver["observe"]>): void {
			void document.fonts.ready.then(() => {
				// Two frames so the swapped metrics are laid out before the read.
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						super.observe(...args);
					});
				});
			});
		}
	}
	window.ResizeObserver = Deferred;
}

/**
 * Geometry of the RENDERED tab bar.
 *
 * Every lookup is anchored on `[role='tablist']` rather than on the class,
 * because the fixed component also mounts a hidden measurement strip carrying
 * the same classes. Anchoring on the class would silently measure the strip —
 * it did, on the first run of this probe, and reported a 550px bar inside a
 * 300px container.
 */
async function readBar(page: Page) {
	return page.evaluate(() => {
		const tablist = document.querySelector<HTMLElement>("[role='tablist']");
		if (!tablist) throw new Error("no [role='tablist'] rendered");
		const bar = tablist.closest<HTMLElement>(".ds-atom-tabs-list");
		if (!bar) throw new Error("[role='tablist'] is not inside a .ds-atom-tabs-list");
		const more = bar.querySelector<HTMLElement>(":scope > .ds-atom-tabs-more");
		// `bar` is already anchored on [role='tablist'], so this cannot be the
		// hidden strip's More button.
		const barStyle = getComputedStyle(bar);
		const gap = Number.parseFloat(barStyle.columnGap) || 0;
		const containerWidth =
			bar.clientWidth -
			(Number.parseFloat(barStyle.paddingLeft) || 0) -
			(Number.parseFloat(barStyle.paddingRight) || 0);
		const tablistWidth = tablist.getBoundingClientRect().width;
		const moreWidth = more ? more.getBoundingClientRect().width : 0;
		return {
			labels: Array.from(tablist.querySelectorAll<HTMLElement>("[role='tab']"), (b) =>
				(b.textContent ?? "").trim(),
			),
			hasMore: !!more,
			containerWidth,
			gap,
			occupied: tablistWidth + (more ? gap + moreWidth : 0),
			// A webfont that never arrived would make every figure below a
			// measurement of the fallback, and the whole spec vacuous.
			webfontSettled: document.fonts.status === "loaded",
		};
	});
}

async function openStory(page: Page, brand: string, { deferRO }: { deferRO: boolean }) {
	if (deferRO) await page.addInitScript(deferResizeObserverPastFonts);
	await page.goto(
		`http://localhost:6006/iframe.html?id=${STORY}&viewMode=story&globals=brand:${brand}`,
	);
	await page.waitForSelector("[role='tablist']", { timeout: 10_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	// Past the deferred delivery above and past any re-measure the component
	// schedules, so what is read is the settled answer rather than a transient.
	await page.waitForTimeout(1200);
}

test.describe("Tabs overflow is decided by geometry, not by font timing", () => {
	for (const brand of BRANDS) {
		test(`overflow count is independent of when the measurement runs — ${brand}`, async ({
			page,
		}) => {
			await openStory(page, brand, { deferRO: false });
			const natural = await readBar(page);

			await openStory(page, brand, { deferRO: true });
			const deferred = await readBar(page);

			expect(
				natural.webfontSettled,
				"webfont never settled — every figure would be a fallback",
			).toBe(true);
			expect(deferred.webfontSettled).toBe(true);

			expect(
				deferred.labels,
				`measuring after the webfont settled produced a different tab strip than measuring at the component's own timing: ${natural.labels.join("|")} vs ${deferred.labels.join("|")}`,
			).toEqual(natural.labels);
			expect(deferred.hasMore).toBe(natural.hasMore);
		});

		test(`the visible tabs fit the bar — ${brand}`, async ({ page }) => {
			await openStory(page, brand, { deferRO: false });
			const bar = await readBar(page);
			expect(
				bar.occupied,
				`tab strip occupies ${bar.occupied.toFixed(3)}px of a ${bar.containerWidth}px bar`,
			).toBeLessThanOrEqual(bar.containerWidth);
		});

		/**
		 * The walk-through this closes.
		 *
		 * The three assertions above all read the story at its shipped 300px, and
		 * the story sits 0.25px inside a boundary. Widening its container by 20px
		 * would therefore turn every one of them green while leaving the component
		 * exactly as broken — which is precisely the "move the story off the cliff"
		 * repair the original finding listed, and called the flattering one.
		 *
		 * Sweeping the container width removes the story's geometry from the
		 * argument. At each width the rendered count is compared against a count
		 * this test computes from tab widths IT measured, so there is no width at
		 * which the component can be wrong unobserved. It also catches the ratchet
		 * head-on: the old measurement could shrink but never grow, so it fails on
		 * the first widening step regardless of where the sweep starts.
		 */
		test(`the rendered count matches the geometry at every container width — ${brand}`, async ({
			page,
		}) => {
			await openStory(page, brand, { deferRO: false });

			const sweep = await page.evaluate(async () => {
				const LABELS = ["Dashboard", "Analytics", "Reports", "Settings", "Team", "Billing"];
				const COUNTS: (number | null)[] = [null, null, null, 2, null, null];
				const tablist = document.querySelector<HTMLElement>("[role='tablist']");
				if (!tablist) throw new Error("no tablist");
				const bar = tablist.closest<HTMLElement>(".ds-atom-tabs-list");
				const root = tablist.closest<HTMLElement>(".ds-atom-tabs");
				const wrapper = root?.parentElement;
				if (!bar || !root || !wrapper) throw new Error("story shape changed");

				// Intrinsic widths, measured by the TEST, from its own strip. These
				// depend on the font but not on the container, so once is enough.
				const holder = document.createElement("div");
				holder.style.cssText =
					"position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden";
				const strip = document.createElement("div");
				strip.className = "ds-atom-tabs-tablist";
				strip.style.width = "max-content";
				LABELS.forEach((label, i) => {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = "ds-atom-tabs-trigger";
					const span = document.createElement("span");
					span.className = "ds-atom-tabs-label";
					span.textContent = label;
					btn.appendChild(span);
					const c = COUNTS[i];
					if (typeof c === "number") {
						const cs = document.createElement("span");
						cs.className = "ds-atom-tabs-count";
						cs.textContent = String(c);
						btn.appendChild(cs);
					}
					strip.appendChild(btn);
				});
				const moreProbe = document.createElement("button");
				moreProbe.type = "button";
				moreProbe.className = "ds-atom-tabs-more";
				const icon = document.createElement("span");
				icon.style.cssText = "display:block;width:16px;height:16px";
				moreProbe.appendChild(icon);
				holder.appendChild(strip);
				holder.appendChild(moreProbe);
				root.appendChild(holder);
				const stripLeft = strip.getBoundingClientRect().left;
				const cumulative = Array.from(
					strip.children,
					(el) => el.getBoundingClientRect().right - stripLeft,
				);
				const moreWidth = moreProbe.getBoundingClientRect().width;
				holder.remove();

				const total = cumulative[cumulative.length - 1] ?? 0;
				const originalMaxWidth = wrapper.style.maxWidth;
				const rows: { width: number; container: number; rendered: number; expected: number }[] = [];

				// Upward, because the ratchet only shows on a widening step.
				for (let w = 240; w <= 440; w += 8) {
					wrapper.style.maxWidth = `${w}px`;
					await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
					await new Promise((r) => setTimeout(r, 40));
					const barStyle = getComputedStyle(bar);
					const gap = Number.parseFloat(barStyle.columnGap) || 0;
					const container =
						bar.clientWidth -
						(Number.parseFloat(barStyle.paddingLeft) || 0) -
						(Number.parseFloat(barStyle.paddingRight) || 0);
					let expected: number;
					if (total <= container) {
						expected = cumulative.length;
					} else {
						const available = container - (gap + moreWidth);
						expected = cumulative.filter((c) => c <= available).length;
					}
					rows.push({
						width: w,
						container,
						rendered: tablist.querySelectorAll("[role='tab']").length,
						expected,
					});
				}
				wrapper.style.maxWidth = originalMaxWidth;
				return rows;
			});

			const wrong = sweep.filter((r) => r.rendered !== r.expected);
			expect(
				wrong.map(
					(r) => `@${r.width}px(bar ${r.container}): rendered ${r.rendered}, fits ${r.expected}`,
				),
				"the rendered tab count disagrees with the measured geometry at these container widths",
			).toEqual([]);
			// A sweep that silently stopped measuring would pass vacuously.
			expect(sweep.length).toBeGreaterThan(20);
		});

		test(`the first hidden tab genuinely does not fit — ${brand}`, async ({ page }) => {
			await openStory(page, brand, { deferRO: false });
			const bar = await readBar(page);
			expect(bar.hasMore, "story is expected to overflow; nothing to assert if it does not").toBe(
				true,
			);

			// The hidden labels only exist in the DOM while the overflow menu is
			// open, so open it and read the first one.
			// `:has([role='tablist'])` because the fixed component's hidden strip
			// carries a .ds-atom-tabs-list with a .ds-atom-tabs-more of its own;
			// the bare class selector matches two elements.
			const REAL_MORE = ".ds-atom-tabs-list:has([role='tablist']) > .ds-atom-tabs-more";
			await page.click(REAL_MORE);
			await page.waitForSelector(".ds-atom-tabs-overflow-item", { timeout: 5000 });
			const firstHidden = (await page.textContent(".ds-atom-tabs-overflow-item button"))?.trim();
			if (!firstHidden) throw new Error("overflow menu rendered no items");

			// Measure that label at trigger metrics by cloning a RENDERED trigger —
			// not by reading the component's own measurement strip, which is the
			// mechanism under test.
			const hiddenWidth = await page.evaluate((label) => {
				const tablist = document.querySelector<HTMLElement>("[role='tablist']");
				if (!tablist) throw new Error("no tablist");
				const proto = tablist.querySelector<HTMLElement>("[role='tab']");
				if (!proto) throw new Error("no rendered trigger to clone");
				const probe = proto.cloneNode(true) as HTMLElement;
				probe.removeAttribute("data-active");
				probe.removeAttribute("role");
				const labelEl = probe.querySelector<HTMLElement>(".ds-atom-tabs-label");
				if (labelEl) labelEl.textContent = label;
				probe.querySelector(".ds-atom-tabs-count")?.remove();
				const holder = document.createElement("div");
				holder.style.cssText =
					"position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden";
				const row = document.createElement("div");
				row.className = "ds-atom-tabs-tablist";
				row.style.width = "max-content";
				row.appendChild(probe);
				holder.appendChild(row);
				tablist.parentElement?.appendChild(holder);
				const w = probe.getBoundingClientRect().width;
				holder.remove();
				return w;
			}, firstHidden);

			const needed = bar.occupied + bar.gap + hiddenWidth;
			expect(
				needed,
				`"${firstHidden}" is hidden behind the More menu but needs only ` +
					`${needed.toFixed(3)}px in a ${bar.containerWidth}px bar — ` +
					`the strip is using ${bar.occupied.toFixed(3)}px and leaving ` +
					`${(bar.containerWidth - bar.occupied).toFixed(3)}px empty`,
			).toBeGreaterThan(bar.containerWidth);
		});
	}
});
