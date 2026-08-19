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
