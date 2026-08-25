import { type Page, expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * D-16-1 / E13 — AppBar's and Footer's own link targets must clear the project's
 * 44px coarse-pointer floor, without inflating either at a fine pointer.
 *
 * WHY 44 AND NOT 24. WCAG 2.5.8 Target Size (Minimum) asks for 24px. 44px is this
 * project's own responsive-contract floor for a coarse pointer and it is
 * stricter; these assertions are against the project's number.
 *
 * WHY A BROWSER, AND WHY NOT A GREP. Three separate reasons, each of which has
 * already let a broken fix look green somewhere in this repository:
 *
 *   1. The rule under test lives inside `@media (pointer: coarse)`. A media query
 *      that never matches is indistinguishable, to a grep, from one that does.
 *      Only a browser with touch emulation can say which.
 *   2. jsdom implements no CSS specificity (01-09 measured it), and the fix has
 *      to WIN a cascade contest it does not obviously win — see the Footer note
 *      below. jsdom cannot decide which of two tied rules applies.
 *   3. Inline styles beat class rules without `!important` (findings E3, E5,
 *      F-12-2). The consumer whose bar was audited sets `paddingBottom: 2` as an
 *      inline style on every nav link, so a padding-based fix is silently
 *      overridden on exactly the markup that produced the finding. The
 *      `inline style` case below is what keeps that from regressing.
 *
 * WHY THE TARGETS ARE NOT IN AppBar.tsx. `AppBar` renders no anchors at all — its
 * `logo`, `nav` and `actions` are ReactNode slots, so the three 20px anchors the
 * audit found were consumer children inside `.ds-atom-appbar`. A component cannot
 * restyle children it does not render; its stylesheet can. Hence a descendant
 * rule on the bar's class, and hence `AnchorNavigation`, a story added so the
 * library's own suite renders the link-shaped bar every other story missed.
 *
 * WHY THE FOOTER SELECTOR IS NOT `.ds-atom-footer-link`. `Footer` renders its
 * `href` links as `<Link className="ds-atom-footer-link">`, so that element
 * carries `.ds-atom-link` too. Both are single-class selectors — (0,1,0) each —
 * so they tie on specificity and source order decides, and `.ds-atom-link` is
 * declared roughly 900 lines further down `primitives.css`. Its `padding: 0`
 * consequently beats `.ds-atom-footer-link`'s `padding: 5px 0`, which is why the
 * `<a>` form measured 16px while the `<button>` form measured 22.5px. A fix
 * written on `.ds-atom-footer-link` would tie and lose in exactly the same way,
 * so the floor is declared on `.ds-atom-footer .ds-atom-footer-link` — (0,2,0),
 * which wins on specificity and therefore does not depend on where in the file
 * it happens to sit.
 */

const FLOOR = 44;

interface Box {
	tag: string;
	cls: string;
	h: number;
	w: number;
	text: string;
}

/**
 * Bounding boxes for every match of `selector`, in a chosen brand x mode cell.
 *
 * Mirrors computed.ts's guards deliberately, including the two ways a probe can
 * lie: it asserts the cell it landed in rather than trusting the query parameter,
 * and it throws when the selector matches nothing rather than returning an empty
 * list that would make every assertion below vacuous.
 */
async function probeBoxes(
	page: Page,
	opts: {
		story: string;
		brand: "default" | "monochrome";
		mode: "light" | "dark";
		selector: string;
	},
): Promise<Box[]> {
	const { story, brand, mode, selector } = opts;
	const want = { brand: brand === "monochrome" ? "monochrome" : null, dark: mode === "dark" };
	await page.goto(
		`/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=theme:${mode};brand:${brand}`,
	);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 15_000 });
	await page.waitForFunction(
		(arg: { brand: string | null; dark: boolean }) => {
			const html = document.documentElement;
			const root = document.querySelector("#storybook-root");
			return (
				html.getAttribute("data-brand") === arg.brand &&
				html.classList.contains("dark") === arg.dark &&
				(root?.children.length ?? 0) > 0
			);
		},
		want,
		{ timeout: 10_000 },
	);
	await page.addStyleTag({
		content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
	});
	await page.evaluate(() => document.fonts.ready.then(() => undefined));

	const read = await page.evaluate((sel: string) => {
		const els = [...document.querySelectorAll(sel)];
		return els.map((el) => {
			const b = el.getBoundingClientRect();
			return {
				tag: el.tagName.toLowerCase(),
				cls: el.className,
				h: Math.round(b.height * 100) / 100,
				w: Math.round(b.width * 100) / 100,
				text: (el.textContent ?? "").trim().slice(0, 24),
			};
		});
	}, selector);

	if (read.length === 0) {
		throw new Error(
			`probeBoxes matched no element for "${selector}" in story "${story}" (${brand} ${mode}); an empty list would make the assertion vacuous.`,
		);
	}
	return read;
}

const under = (boxes: Box[]) =>
	boxes
		.filter((b) => b.h < FLOOR || b.w < FLOOR)
		.map((b) => `${b.tag}.${b.cls || "(no class)"} "${b.text}" ${b.w}x${b.h}`);

/* ── Coarse pointer: the floor applies ──────────────────────────────────────
   `hasTouch: true` is what drives `(pointer: coarse)`. Verified rather than
   assumed: the first case below asserts the media query actually matches, because
   every other assertion in this block is vacuous if it does not. */
test.describe("coarse pointer", () => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

	test("the touch emulation really does select (pointer: coarse)", async ({ page }) => {
		await page.goto("/iframe.html?id=layout-appbar--anchor-navigation&viewMode=story");
		await page.waitForSelector("#storybook-root", { state: "attached" });
		const m = await page.evaluate(() => ({
			coarse: matchMedia("(pointer: coarse)").matches,
			fine: matchMedia("(pointer: fine)").matches,
		}));
		expect(m, "without a coarse pointer every other case in this block proves nothing").toEqual({
			coarse: true,
			fine: false,
		});
	});

	test("every anchor in AppBar clears 44px", async ({ page }) => {
		const boxes = await probeBoxes(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar a",
		});
		expect(boxes.length, "the bar rendered no anchors — nothing was measured").toBe(3);
		expect(under(boxes), `AppBar anchors below the ${FLOOR}px floor at a coarse pointer`).toEqual(
			[],
		);
	});

	test("every link in Footer clears 44px — the <a> form", async ({ page }) => {
		const boxes = await probeBoxes(page, {
			story: "layout-footer--compact-with-links",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-footer-link",
		});
		expect(boxes.length).toBe(3);
		expect(
			boxes.every((b) => b.tag === "a"),
			`this story must render the <a> branch of renderLink, got ${boxes.map((b) => b.tag).join(",")}`,
		).toBe(true);
		expect(under(boxes), `Footer <a> links below the ${FLOOR}px floor`).toEqual([]);
	});

	test("every link in Footer clears 44px — the <button> form", async ({ page }) => {
		const boxes = await probeBoxes(page, {
			story: "layout-footer--compact",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-footer-link",
		});
		expect(boxes.length).toBe(3);
		expect(
			boxes.every((b) => b.tag === "button"),
			"this story must render the <button> branch of renderLink",
		).toBe(true);
		expect(under(boxes), `Footer <button> links below the ${FLOOR}px floor`).toEqual([]);
	});

	test("the floor survives a consumer's inline padding", async ({ page }) => {
		// The audited consumer writes `paddingBottom: 2` inline on every nav link.
		// An inline declaration beats a class rule without `!important`, so a
		// padding-based floor is dead on exactly this markup while still looking
		// correct in the source. Reproduced verbatim.
		await probeBoxes(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar",
		});
		const boxes = await page.evaluate(() => {
			const bar = document.querySelector(".ds-atom-appbar");
			if (!bar) throw new Error("no .ds-atom-appbar in this story");
			const host = bar.firstElementChild ?? bar;
			const made: HTMLAnchorElement[] = [];
			for (const label of ["work", "photographs"]) {
				const a = document.createElement("a");
				a.href = "#";
				a.textContent = label;
				a.style.fontFamily = "var(--font-body)";
				a.style.fontSize = "13px";
				a.style.fontWeight = "500";
				a.style.color = "var(--ink-3)";
				a.style.textDecoration = "none";
				a.style.paddingBottom = "2px";
				a.style.borderBottom = "1.5px solid transparent";
				host.appendChild(a);
				made.push(a);
			}
			const out = made.map((a) => {
				const b = a.getBoundingClientRect();
				return {
					tag: "a",
					cls: "(bare, inline-styled)",
					h: Math.round(b.height * 100) / 100,
					w: Math.round(b.width * 100) / 100,
					text: a.textContent ?? "",
				};
			});
			for (const a of made) a.remove();
			return out;
		});
		expect(boxes.length).toBe(2);
		expect(
			boxes.filter((b) => b.h < 44 || b.w < 44).map((b) => `${b.text} ${b.w}x${b.h}`),
			"a bare inline-styled consumer anchor is below the floor — the rule is being beaten by the inline declaration",
		).toEqual([]);
	});

	test("--ds-appbar-h still reports the height the bar actually paints", async ({ page }) => {
		const [bar] = await probeBoxes(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar",
		});
		const read = await probeComputed(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar",
			props: ["--ds-appbar-h", "min-height"],
		});
		const declared = Number.parseFloat(read["--ds-appbar-h"] ?? "NaN");
		expect(declared, "--ds-appbar-h did not resolve to a length").toBeGreaterThan(0);
		// A property that says 47px while the bar paints 69px on a phone is worse
		// than no property at all.
		expect(
			bar?.h,
			`--ds-appbar-h says ${declared}px but the bar paints ${bar?.h}px at a coarse pointer`,
		).toBe(declared);
	});
});

/* ── Fine pointer: the desktop bar is not inflated ──────────────────────────
   The desktop density is deliberate. Growing every nav link to 44px at every
   viewport would visibly redesign the bar, so the floor is keyed on the pointer
   and these cases assert it did not leak. The expected numbers are the values
   measured on this tree BEFORE the coarse rule was written, so a change here is a
   real density regression rather than a moved goalpost. */
test.describe("fine pointer", () => {
	test.use({ hasTouch: false, viewport: { width: 1440, height: 900 } });

	test("the emulation really does select (pointer: fine)", async ({ page }) => {
		await page.goto("/iframe.html?id=layout-appbar--anchor-navigation&viewMode=story");
		await page.waitForSelector("#storybook-root", { state: "attached" });
		const m = await page.evaluate(() => ({
			coarse: matchMedia("(pointer: coarse)").matches,
			fine: matchMedia("(pointer: fine)").matches,
		}));
		expect(m).toEqual({ coarse: false, fine: true });
	});

	// Measured on this tree before the coarse rule was written, for the record:
	// AppBar anchors 88.95x21 / 35.39x21 / 94.39x21, Footer <a> 44.41x16 /
	// 36.7x16 / 39.14x16, Footer <button> 42.06x22.5, bar 47px. Those exact
	// numbers are NOT asserted — they are functions of the face layer, and a font
	// change would fail these cases for a reason that has nothing to do with
	// density. What IS asserted is the thing that would actually constitute a leak:
	// that no floor is in effect here at all.
	test("AppBar anchors keep their designed density", async ({ page }) => {
		const boxes = await probeBoxes(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar a",
		});
		expect(boxes.length).toBe(3);
		for (const b of boxes) {
			expect(b.h, `anchor "${b.text}" grew at a fine pointer`).toBeLessThan(FLOOR);
		}
		const read = await probeComputed(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar a",
			props: ["min-height", "min-width"],
		});
		// Font-independent: if the coarse rule escaped its media query these become
		// 44px, whatever the type is doing.
		expect(
			[read["min-height"], read["min-width"]],
			"a 44px floor is in effect at a fine pointer — the coarse rule leaked",
		).not.toContain("44px");
		console.log(`FINE appbar anchors: ${JSON.stringify(boxes)} min=${JSON.stringify(read)}`);
	});

	test("Footer links keep their designed density", async ({ page }) => {
		const boxes = await probeBoxes(page, {
			story: "layout-footer--compact-with-links",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-footer-link",
		});
		for (const b of boxes) {
			expect(b.h, `footer link "${b.text}" grew at a fine pointer`).toBeLessThan(FLOOR);
		}
		const read = await probeComputed(page, {
			story: "layout-footer--compact-with-links",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-footer-link",
			props: ["min-height", "min-width"],
		});
		expect(
			[read["min-height"], read["min-width"]],
			"a 44px floor is in effect at a fine pointer — the coarse rule leaked",
		).not.toContain("44px");
		console.log(`FINE footer links: ${JSON.stringify(boxes)} min=${JSON.stringify(read)}`);
	});

	test("--ds-appbar-h reports the fine-pointer height", async ({ page }) => {
		const [bar] = await probeBoxes(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar",
		});
		const read = await probeComputed(page, {
			story: "layout-appbar--anchor-navigation",
			brand: "monochrome",
			mode: "light",
			selector: ".ds-atom-appbar",
			props: ["--ds-appbar-h"],
		});
		console.log(`FINE bar height=${bar?.h} --ds-appbar-h=${read["--ds-appbar-h"]}`);
		expect(bar?.h).toBe(Number.parseFloat(read["--ds-appbar-h"] ?? "NaN"));
	});
});
