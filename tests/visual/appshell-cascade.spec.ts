import { type Page, expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * E2 — `--ds-sidebar-w` must be REACHABLE from CSS.
 *
 * WHY THIS CANNOT BE A UNIT TEST, AND CANNOT BE A GREP. Three separate reasons,
 * each of which has already produced a false pass in this repository:
 *
 *   1. The claim is "a media query can drive this property". A media query that
 *      never matches is indistinguishable, to a grep, from one that does — and a
 *      declaration's presence in `primitives.css` says nothing about whether it
 *      applied. Only a browser at a chosen viewport can decide.
 *   2. jsdom implements no CSS specificity and no cascade, so
 *      `AppShell.test.tsx` cannot tell a rule that wins from one that loses.
 *      Plan 12's negative control NC-A2 wrote a Footer floor onto the losing
 *      selector: the anchor stayed at 16px in Chromium while all 1624 vitest
 *      cases passed.
 *   3. An inline custom property beats every class rule without `!important`
 *      (findings E3, E5, F-12-2), and an inline custom property is fixed at
 *      construction, so there is no selector from which a media query could
 *      re-declare it. That is the entire content of E2 and it is a cascade fact,
 *      not an API fact.
 *
 * THE FOSSILISED NEGATIVE CONTROL. `an inline --ds-sidebar-w makes the media
 * query inert` below reproduces the pre-fix form of this component by writing the
 * property inline on the real shipped root, and asserts the media query fails to
 * take effect. It is both the proof that the reachability claim has teeth and the
 * proof that an explicit `sidebarWidth` is still honoured — those are the same
 * cascade fact seen from two sides. A transient control (reverting `index.tsx`
 * and watching this file go red) was also run; see 01-13-SUMMARY.md.
 *
 * THE SPECIFICITY LADDER, stated so a later reader does not have to re-derive it:
 *
 *   inline `style="--ds-sidebar-w:…"`                    beats everything
 *   `.ds-atom-appshell[data-sidebar-collapsed="true"]`   (0,2,0) — the 48px rail
 *   `.ds-atom-appshell`                                  (0,1,0) — the 240px default
 *
 * A consumer rule written on `.ds-atom-appshell` TIES with the library's own
 * (0,1,0) declaration, so it depends on source order — which is why the last case
 * here measures a consumer sheet injected AFTER the library's, the normal case,
 * and the AppShell docstring tells a consumer who cannot guarantee that ordering
 * to raise their specificity instead.
 */

const STORY = "layout-appshell--default";

interface Shell {
	/** The computed value of the custom property, var()-substituted. */
	declared: string;
	/** What the sidebar element actually paints. The only number that matters. */
	painted: number;
	/** Whether the emitted HTML carries the property as an inline style. */
	inline: boolean;
	collapsed: string | null;
}

async function readShell(page: Page): Promise<Shell> {
	return page.evaluate(() => {
		const root = document.querySelector<HTMLElement>(".ds-atom-appshell");
		if (!root) throw new Error("no .ds-atom-appshell in this story — nothing was measured");
		const aside = root.querySelector<HTMLElement>(".ds-atom-appshell-sidebar");
		if (!aside) throw new Error("no .ds-atom-appshell-sidebar — nothing was measured");
		return {
			declared: getComputedStyle(root).getPropertyValue("--ds-sidebar-w").trim(),
			painted: Math.round(aside.getBoundingClientRect().width * 100) / 100,
			inline: (root.getAttribute("style") ?? "").includes("--ds-sidebar-w"),
			collapsed: root.getAttribute("data-sidebar-collapsed"),
		};
	});
}

/** Land in a real charcoal x light render of the shell, animation frozen. */
async function open(page: Page, story = STORY): Promise<void> {
	// probeComputed carries the guards: it asserts the brand x mode cell it landed
	// in rather than trusting the query parameter, and it throws when the selector
	// matches nothing instead of returning an empty object.
	await probeComputed(page, {
		story,
		brand: "charcoal",
		mode: "light",
		selector: ".ds-atom-appshell",
		props: ["--ds-sidebar-w"],
	});
	await page.addStyleTag({
		content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
	});
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The media query a consumer writes to reach UI-SPEC's 208px compact sidebar. */
const CONSUMER_COMPACT = `
@media (min-width: 673px) and (max-width: 1023px) {
	.ds-atom-appshell { --ds-sidebar-w: 208px; }
}`;

test.describe("E2 — the sidebar width is reachable from CSS", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("the default width is declared at class level, not inline", async ({ page }) => {
		await open(page);
		const shell = await readShell(page);
		expect(
			shell.inline,
			'the emitted HTML still carries style="--ds-sidebar-w:…" — no media query can re-declare an inline custom property, which IS finding E2',
		).toBe(false);
		expect(shell.declared).toBe("240px");
		expect(shell.painted).toBe(240);
	});

	test("a consumer media query changes the RENDERED sidebar width", async ({ page }) => {
		await open(page);

		const before = await readShell(page);
		expect(before.painted, "baseline: the desktop width").toBe(240);

		// A consumer stylesheet, injected after the library's — the normal order.
		await page.addStyleTag({ content: CONSUMER_COMPACT });

		// Still outside the band: the query must not fire yet, or the next
		// assertion would prove nothing about the query.
		const outside = await readShell(page);
		expect(outside.declared, "the media query fired outside its own band").toBe("240px");
		expect(outside.painted).toBe(240);

		// Inside the band — device class 3, the foldable-unfolded canonical capture.
		await page.setViewportSize({ width: 841, height: 768 });
		const inside = await readShell(page);
		expect(inside.declared, "the media query did not reach --ds-sidebar-w").toBe("208px");
		expect(
			inside.painted,
			"UI-SPEC's 208px compact sidebar: declared by the query AND painted by the grid",
		).toBe(208);

		// And back out again, so the change is the query's and not the resize's.
		await page.setViewportSize({ width: 1440, height: 900 });
		const after = await readShell(page);
		expect(after.declared).toBe("240px");
		expect(after.painted).toBe(240);
	});

	test("an inline --ds-sidebar-w makes the same media query inert", async ({ page }) => {
		// FOSSILISED NEGATIVE CONTROL, and simultaneously the `sidebarWidth` feature.
		// Reproduces exactly what the component wrote before this plan, and exactly
		// what it still writes when a consumer passes `sidebarWidth`: an inline
		// custom property on the shell's own root.
		await open(page);
		await page.addStyleTag({ content: CONSUMER_COMPACT });
		await page.evaluate(() => {
			const root = document.querySelector<HTMLElement>(".ds-atom-appshell");
			if (!root) throw new Error("no .ds-atom-appshell");
			root.style.setProperty("--ds-sidebar-w", "240px");
		});

		await page.setViewportSize({ width: 841, height: 768 });
		const shell = await readShell(page);
		expect(shell.inline).toBe(true);
		expect(
			shell.declared,
			"an inline custom property has no selector, so the media query cannot re-declare it",
		).toBe("240px");
		expect(
			shell.painted,
			"this is the pre-fix behaviour: 208px is unreachable, which is why G-2 measured it as needing zero declarations",
		).toBe(240);
	});

	test("the 48px rail comes from the data attribute, not from an inline style", async ({
		page,
	}) => {
		await open(page);
		// The story's own toggle button is the first control in the sidebar.
		await page.click(".ds-atom-appshell-sidebar button");
		const shell = await readShell(page);
		expect(shell.collapsed).toBe("true");
		expect(shell.inline, "the collapsed rail must be a CSS state, not an inline write").toBe(false);
		expect(shell.declared).toBe("48px");
		expect(shell.painted).toBe(48);
	});

	test("a consumer media query reaches the collapsed rail too", async ({ page }) => {
		// The collapsed value is declared at (0,2,0), so a consumer who wants a
		// different rail must match that. Proving it here means the docstring's
		// advice is measured rather than asserted.
		await open(page);
		await page.click(".ds-atom-appshell-sidebar button");
		await page.addStyleTag({
			content: `@media (max-width: 1439px) {
				.ds-atom-appshell[data-sidebar-collapsed="true"] { --ds-sidebar-w: 64px; }
			}`,
		});
		await page.setViewportSize({ width: 841, height: 768 });
		const shell = await readShell(page);
		expect(shell.declared).toBe("64px");
		expect(shell.painted).toBe(64);
	});

	test("a tying consumer rule loses when its sheet is ordered FIRST", async ({ page }) => {
		// The caveat the docstring records, measured rather than assumed.
		// `.ds-atom-appshell` is (0,1,0) on both sides, so source order decides; a
		// consumer sheet that cannot be guaranteed to come last must raise its
		// specificity instead.
		await open(page);
		await page.evaluate((css: string) => {
			const style = document.createElement("style");
			style.textContent = css;
			document.head.insertBefore(style, document.head.firstChild);
		}, CONSUMER_COMPACT);
		await page.setViewportSize({ width: 841, height: 768 });
		const tied = await readShell(page);
		expect(
			tied.declared,
			"an equal-specificity consumer rule placed before the library's own must lose on source order",
		).toBe("240px");

		// And the recommended fix — one more class — wins regardless of order.
		await page.evaluate(() => {
			const style = document.createElement("style");
			style.textContent = `@media (min-width: 673px) and (max-width: 1023px) {
				html .ds-atom-appshell { --ds-sidebar-w: 208px; }
			}`;
			document.head.insertBefore(style, document.head.firstChild);
		});
		const raised = await readShell(page);
		expect(raised.declared, "a higher-specificity consumer rule must win from any position").toBe(
			"208px",
		);
		expect(raised.painted).toBe(208);
	});
});

test.describe("E2 — the hardcoded 767px breakpoint is gone", () => {
	test("the sidebar keeps its posture across device class 3", async ({ page }) => {
		// The defect: `@media (max-width: 767px)` bisected device class 3
		// (673-884px), so one device class rendered two different layouts. 767 is not
		// a boundary in the six-class matrix.
		await open(page);
		const widths: Record<number, Shell> = {};
		for (const w of [673, 766, 767, 768, 884]) {
			await page.setViewportSize({ width: w, height: 768 });
			widths[w] = await readShell(page);
		}
		const painted = Object.fromEntries(Object.entries(widths).map(([w, s]) => [w, s.painted]));
		expect(
			painted,
			"the sidebar changes posture inside device class 3 — the 767px rule is still live",
		).toEqual({ 673: 240, 766: 240, 767: 240, 768: 240, 884: 240 });
	});

	test("a consumer can restore the removed posture in two declarations", async ({ page }) => {
		// The migration path this plan hands to a consumer who relied on the removed
		// rule, verified rather than described. It works with any row template,
		// banner or no banner, because it collapses the column instead of rewriting
		// grid-template-areas — which is what a consumer was forced to do before
		// --ds-sidebar-w was reachable.
		await open(page);

		// Non-vacuity guard. With the 767px rule still in the sheet this whole case
		// passes for the wrong reason — the library is already hiding the sidebar at
		// 390px, so the consumer's two declarations would prove nothing. Assert the
		// removal first, then apply the migration.
		await page.setViewportSize({ width: 390, height: 844 });
		const beforeMigration = await readShell(page);
		expect(
			beforeMigration.painted,
			"the library still hides the sidebar at 390px, so the migration snippet below is untested",
		).toBe(240);

		await page.addStyleTag({
			content: `@media (max-width: 672px) {
				.ds-atom-appshell { --ds-sidebar-w: 0px; }
				.ds-atom-appshell-sidebar { display: none; }
			}`,
		});
		const hidden = await page.evaluate(() => {
			const root = document.querySelector<HTMLElement>(".ds-atom-appshell");
			const aside = root?.querySelector<HTMLElement>(".ds-atom-appshell-sidebar");
			const main = root?.querySelector<HTMLElement>(".ds-atom-appshell-main");
			if (!root || !aside || !main) throw new Error("shell not found");
			return {
				asideDisplay: getComputedStyle(aside).display,
				mainLeft: Math.round(main.getBoundingClientRect().left),
				mainWidth: Math.round(main.getBoundingClientRect().width),
				shellWidth: Math.round(root.getBoundingClientRect().width),
			};
		});
		expect(hidden.asideDisplay).toBe("none");
		expect(hidden.mainLeft, "main must start at the shell's left edge").toBe(0);
		expect(hidden.mainWidth, "main must run the full width once the column is collapsed").toBe(
			hidden.shellWidth,
		);
	});
});

/**
 * G-8 — the banner slot, measured as geometry rather than as markup.
 *
 * `AppShell.test.tsx` covers which ELEMENTS render in each of the four
 * banner x footer combinations, and it covers the landmark. It cannot cover the
 * grid, because jsdom lays nothing out: the specific failure it would miss is an
 * always-declared banner row leaving a visible gap above `main` in the three
 * combinations where the slot is empty. The plan names that failure mode
 * explicitly ("a naive fixed template leaves a gap"), so it is asserted here as
 * `topbar bottom == main top`.
 *
 * All four combinations use real stories rather than DOM injected by the probe,
 * so what is measured is what a consumer ships.
 */

interface Layout {
	topbarBottom: number;
	bannerTop: number | null;
	bannerBottom: number | null;
	bannerWidth: number | null;
	bannerInsideMain: boolean;
	bannerInsideTopbar: boolean;
	sidebarTop: number;
	mainTop: number;
	mainBottom: number;
	footerTop: number | null;
	shellWidth: number;
	shellBottom: number;
}

async function readLayout(page: Page): Promise<Layout> {
	return page.evaluate(() => {
		const px = (n: number) => Math.round(n * 100) / 100;
		const q = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
		const root = q(".ds-atom-appshell");
		if (!root) throw new Error("no .ds-atom-appshell in this story — nothing was measured");
		const topbar = q(".ds-atom-appshell-topbar");
		const sidebar = q(".ds-atom-appshell-sidebar");
		const main = q(".ds-atom-appshell-main");
		if (!topbar || !sidebar || !main) throw new Error("the shell is missing a required slot");
		const banner = q(".ds-atom-appshell-banner");
		const footer = q(".ds-atom-appshell-footer");
		const rb = root.getBoundingClientRect();
		const mb = main.getBoundingClientRect();
		const bb = banner?.getBoundingClientRect();
		return {
			topbarBottom: px(topbar.getBoundingClientRect().bottom),
			bannerTop: bb ? px(bb.top) : null,
			bannerBottom: bb ? px(bb.bottom) : null,
			bannerWidth: bb ? px(bb.width) : null,
			bannerInsideMain: banner ? main.contains(banner) : false,
			bannerInsideTopbar: banner ? topbar.contains(banner) : false,
			sidebarTop: px(sidebar.getBoundingClientRect().top),
			mainTop: px(mb.top),
			mainBottom: px(mb.bottom),
			footerTop: footer ? px(footer.getBoundingClientRect().top) : null,
			shellWidth: px(rb.width),
			shellBottom: px(rb.bottom),
		};
	});
}

test.describe("G-8 — the banner slot", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("no banner, no footer: no ghost row above main and none below it", async ({ page }) => {
		await open(page, "layout-appshell--default");
		const l = await readLayout(page);
		expect(l.bannerTop, "Default must render no banner element at all").toBeNull();
		expect(l.mainTop, "an empty banner row would push main down by its height").toBe(
			l.topbarBottom,
		);
		expect(l.mainBottom, "an empty footer row would leave a gap at the bottom").toBe(l.shellBottom);
	});

	test("an empty banner row would cost a consumer's row-gap twice", async ({ page }) => {
		// This is why the banner row is SWITCHED on :has(> .ds-atom-appshell-banner)
		// rather than always declared — and the reason is not the one the plan gave.
		//
		// The plan said "grid rows do not disappear because a slot is empty, so a
		// naive fixed template leaves a gap". Measured, that is false: an empty
		// `auto` row is 0px tall, and an always-declared banner row passes every
		// geometry case above. What it does NOT survive is a consumer who adds
		// `row-gap` to the shell — the 0px row still consumes a gap on each side, so
		// the space above main doubles. Numbers from Chromium at row-gap: 16px:
		//
		//   switched (shipped)   rows 49px 819px 0px        gap above main 16px
		//   always declared      rows 49px 0px 803px 0px    gap above main 32px
		//
		// Reachable now that --ds-sidebar-w put `.ds-atom-appshell` in a consumer's
		// hands, so it is a live hazard rather than a theoretical one.
		await open(page, "layout-appshell--default");
		await page.addStyleTag({ content: ".ds-atom-appshell { row-gap: 16px; }" });
		const measured = await page.evaluate(() => {
			const root = document.querySelector<HTMLElement>(".ds-atom-appshell");
			const topbar = document.querySelector<HTMLElement>(".ds-atom-appshell-topbar");
			const main = document.querySelector<HTMLElement>(".ds-atom-appshell-main");
			if (!root || !topbar || !main) throw new Error("shell not found");
			return {
				gapAboveMain:
					Math.round(
						(main.getBoundingClientRect().top - topbar.getBoundingClientRect().bottom) * 100,
					) / 100,
				rowCount: getComputedStyle(root).gridTemplateRows.split(/\s+/).length,
			};
		});
		expect(measured.rowCount, "the no-banner template must declare exactly three rows").toBe(3);
		expect(
			measured.gapAboveMain,
			"32px means an empty banner row is being declared and is eating a second row-gap",
		).toBe(16);
	});

	test("no banner, footer: the footer sits directly under main", async ({ page }) => {
		await open(page, "layout-appshell--with-footer");
		const l = await readLayout(page);
		expect(l.bannerTop).toBeNull();
		expect(l.mainTop).toBe(l.topbarBottom);
		expect(l.footerTop, "the footer must abut main, not float below a gap").toBe(l.mainBottom);
	});

	test("banner, no footer: the strip is its own full-width row between topbar and main", async ({
		page,
	}) => {
		await open(page, "layout-appshell--with-banner");
		const l = await readLayout(page);
		expect(l.bannerTop, "the banner must abut the topbar").toBe(l.topbarBottom);
		expect(l.mainTop, "main must start where the banner ends").toBe(l.bannerBottom);
		expect(l.sidebarTop, "the sidebar shares main's row, so it starts there too").toBe(
			l.bannerBottom,
		);
		expect(l.bannerWidth, "the strip spans both columns, so DOM order matches visual order").toBe(
			l.shellWidth,
		);
		expect(l.mainBottom, "no footer, so no trailing gap").toBe(l.shellBottom);
		expect(l.bannerInsideMain, "inside main it would scroll away — the thing G-8 rules out").toBe(
			false,
		);
		expect(l.bannerInsideTopbar, "inside the topbar IS the finding").toBe(false);
	});

	test("banner and footer: all four edges line up", async ({ page }) => {
		await open(page, "layout-appshell--with-banner-and-footer");
		const l = await readLayout(page);
		expect(l.bannerTop).toBe(l.topbarBottom);
		expect(l.mainTop).toBe(l.bannerBottom);
		expect(l.sidebarTop).toBe(l.bannerBottom);
		expect(l.bannerWidth).toBe(l.shellWidth);
		expect(l.footerTop).toBe(l.mainBottom);
	});

	test("main is NOT a scroll container by default — the plan's premise, falsified", async ({
		page,
	}) => {
		// The plan asserted "Only .ds-atom-appshell-main is the scroll container,
		// which the existing layout already establishes". It does not. The shell has
		// `min-height: 100vh`, not `height`, so the 1fr row has no definite size and
		// grows to fit main's content: `overflow: auto` never engages and the DOCUMENT
		// scrolls. That is why the topbar carries `position: sticky`.
		//
		// Pinned as an assertion rather than left as a note, so that a later plan
		// which changes the scroll model has to change this case deliberately.
		await open(page, "layout-appshell--with-banner");
		const state = await page.evaluate(() => {
			const root = document.querySelector<HTMLElement>(".ds-atom-appshell");
			const main = document.querySelector<HTMLElement>(".ds-atom-appshell-main");
			if (!root || !main) throw new Error("shell not found");
			main.scrollTop = 400;
			return {
				shellMinHeight: getComputedStyle(root).minHeight,
				shellHeight: getComputedStyle(root).height,
				mainOverflow: getComputedStyle(main).overflowY,
				scrollTop: main.scrollTop,
				viewport: window.innerHeight,
			};
		});
		expect(state.mainOverflow, "main still declares overflow: auto").toBe("auto");
		expect(
			state.scrollTop,
			"main scrolled, so the shell's scroll model changed — update the banner's comment in primitives.css and the case below",
		).toBe(0);
		expect(
			Number.parseFloat(state.shellHeight),
			"the shell grew past the viewport, which is what leaves the 1fr row indefinite",
		).toBeGreaterThan(state.viewport);
	});

	test("the banner persists once the shell is viewport-height — one declaration", async ({
		page,
	}) => {
		// The persistence the plan wanted, delivered in the shape the component
		// actually supports: the banner is OUTSIDE main, so the moment a consumer
		// makes the shell viewport-height, main becomes the real scroll container and
		// topbar, banner and footer all stay put. Reachable because it is a class
		// rule, which is the same property that made --ds-sidebar-w fixable.
		await open(page, "layout-appshell--with-banner");
		await page.addStyleTag({ content: ".ds-atom-appshell { height: 100dvh; }" });

		const before = await readLayout(page);
		const scrolled = await page.evaluate(() => {
			const main = document.querySelector<HTMLElement>(".ds-atom-appshell-main");
			if (!main) throw new Error("no main");
			main.scrollTop = 400;
			return { scrollTop: main.scrollTop };
		});
		expect(
			scrolled.scrollTop,
			"main did not scroll even at viewport height, so 'the banner persists' would be vacuous",
		).toBeGreaterThan(0);

		const after = await readLayout(page);
		expect(after.bannerTop, "the banner moved with main's scroll").toBe(before.bannerTop);
		expect(after.bannerBottom).toBe(before.bannerBottom);
		expect(after.topbarBottom).toBe(before.topbarBottom);
	});

	test("the banner is structurally outside main, so it never scrolls with it", async ({ page }) => {
		// The claim that does not depend on the scroll model at all, and the one G-8
		// actually needs: the strip is not welded into any slot that scrolls.
		await open(page, "layout-appshell--with-banner-and-footer");
		const l = await readLayout(page);
		expect(l.bannerInsideMain).toBe(false);
		expect(l.bannerInsideTopbar).toBe(false);
	});

	test("the banner is reachable as its own landmark", async ({ page }) => {
		await open(page, "layout-appshell--with-banner");
		// Playwright's own ARIA implementation, not a class-name proxy.
		const region = page.getByRole("region", { name: "Photo pipeline" });
		await expect(region).toHaveCount(1);
		await expect(region).toBeVisible();
		// And exactly one page-header landmark, which is the topbar.
		await expect(page.getByRole("banner")).toHaveCount(1);
	});

	test("the removed breakpoint stays removed with a banner present", async ({ page }) => {
		// The banner row is switched by :has(), and the migration snippet collapses
		// the column instead of rewriting grid-template-areas — so it must hold in
		// the banner case too. That is the whole reason the snippet is written that way.
		await open(page, "layout-appshell--with-banner");
		await page.setViewportSize({ width: 390, height: 844 });
		const live = await readShell(page);
		expect(live.painted, "the 767px rule is back, or the banner row broke the column").toBe(240);

		await page.addStyleTag({
			content: `@media (max-width: 672px) {
				.ds-atom-appshell { --ds-sidebar-w: 0px; }
				.ds-atom-appshell-sidebar { display: none; }
			}`,
		});
		const l = await readLayout(page);
		expect(l.bannerTop, "the banner row must survive the consumer's override").toBe(l.topbarBottom);
		expect(l.mainTop).toBe(l.bannerBottom);
		expect(l.bannerWidth).toBe(l.shellWidth);
	});
});
