import { expect, test } from "@playwright/test";
import { hexToRgb, probeComputed } from "./computed";

/**
 * E15 / E11 / G-6 — the three cascade claims plan 01-11 makes, measured in
 * Chromium instead of asserted from source.
 *
 * WHY A BROWSER, restated for this plan specifically. Every one of the three is
 * unverifiable in jsdom or by grep, and each has a measured precedent in this
 * repository for shipping green while broken:
 *
 *   1. The required marker's glyph is `content: "*"` on a pseudo-element. jsdom
 *      does not implement pseudo-element content, so a jsdom test cannot tell an
 *      applied marker from an empty <span>. The Field unit tests deliberately
 *      assert `textContent === ""` — that is the *absence* of a JSX literal, and
 *      it is silent about whether anything is visible.
 *   2. The warning tone is `.ds-atom-field-error[data-tone="warning"]` at (0,2,0),
 *      and it must outrank a base `.ds-atom-field-error` that is declared TWICE in
 *      primitives.css at (0,1,0) — once in the Field section and once ~5,160 lines
 *      later in the FormValidation section. jsdom implements no CSS specificity at
 *      all (01-09 measured a (0,2,0) rule declared first losing to a (0,1,0)
 *      declared later), so only a browser can settle it.
 *   3. The summary link composes `Link`, whose `[data-variant="default"]` rule is
 *      (0,2,0) and sits ~1,070 lines BELOW the summary's own rule. At the (0,1,1)
 *      this plan first wrote, Link won on both specificity and source order and
 *      painted the link `var(--ink-2)` — grey, inside a red error box. The fix is
 *      (0,2,1); this is the case that proves it took.
 *
 * Monochrome × light throughout: it is the worst cell for warning text, since
 * `--amber-d` aliases `--ochre-d` there rather than the brighter dark-mode step.
 *
 * 01-10's lesson is the reason this file exists at all: that plan's specified fix
 * regressed Button from 3.44:1 to 1.38:1 while BOTH of its greps stayed green,
 * and only a computed-style read in a real browser caught it.
 */

const CELL = { brand: "monochrome", mode: "light" } as const;

/** WCAG 2.x relative-luminance contrast, on `rgb(r, g, b)` strings. */
function ratio(a: string, b: string): number {
	const lum = (c: string) => {
		const [r, g, bl] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number) as [
			number,
			number,
			number,
		];
		const ch = [r, g, bl].map((v) => {
			const s = v / 255;
			return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		}) as [number, number, number];
		return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
	};
	const x = lum(a);
	const y = lum(b);
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test.describe("field contract, monochrome x light", () => {
	test("E15: the required marker renders a visible glyph from the stylesheet", async ({ page }) => {
		// probeComputed owns the navigation and asserts the cell actually took, so a
		// value read below cannot silently belong to the default brand.
		await probeComputed(page, {
			...CELL,
			story: "patterns-formvalidation--field-required-marker",
			selector: ".ds-atom-field-required",
			props: ["color"],
		});

		const markers = await page.evaluate(() =>
			Array.from(document.querySelectorAll(".ds-atom-field-required")).map((el) => {
				const after = getComputedStyle(el, "::after");
				const host = el.closest("label, legend");
				return {
					content: after.content,
					// A rule can apply and still be invisible. Width is the check that the
					// glyph occupies space, which `content` alone does not establish.
					width: el.getBoundingClientRect().width,
					ariaHidden: el.getAttribute("aria-hidden"),
					ownText: el.textContent,
					host: host?.tagName ?? null,
				};
			}),
		);

		// The story renders three required fields, one of them grouped.
		expect(markers.length, "the required story rendered no markers").toBeGreaterThanOrEqual(3);
		for (const m of markers) {
			expect(m.content, "the ::after glyph did not apply").toBe('"*"');
			expect(m.width, "the marker applied but occupies no space").toBeGreaterThan(0);
			expect(m.ariaHidden, "requiredness would be announced twice").toBe("true");
			expect(m.ownText, "the glyph must come from CSS, not from JSX").toBe("");
		}
		// The grouped field's marker must be in the <legend>, not orphaned.
		expect(markers.map((m) => m.host)).toContain("LEGEND");
		expect(markers.map((m) => m.host)).toContain("LABEL");
	});

	test("E11: warning outranks BOTH base declarations and differs by more than colour", async ({
		page,
	}) => {
		await probeComputed(page, {
			...CELL,
			story: "patterns-formvalidation--field-error-severity",
			selector: ".ds-atom-field-error",
			props: ["color"],
		});

		const read = await page.evaluate(() => {
			const all = Array.from(document.querySelectorAll(".ds-atom-field-error"));
			const plain = all.find((el) => !el.hasAttribute("data-tone"));
			const warn = all.find((el) => el.getAttribute("data-tone") === "warning");
			const icon = warn?.querySelector(".ds-atom-field-error-icon");
			const probe = document.documentElement;
			const cs = getComputedStyle(probe);
			// Resolve the token from the LIVE cascade, so the assertion below is by
			// token identity rather than against a hex this file hardcodes.
			return {
				plainColor: plain ? getComputedStyle(plain).color : null,
				warnColor: warn ? getComputedStyle(warn).color : null,
				plainRole: plain?.getAttribute("role") ?? null,
				warnRole: warn?.getAttribute("role") ?? null,
				iconContent: icon ? getComputedStyle(icon, "::before").content : null,
				iconWidth: icon?.getBoundingClientRect().width ?? null,
				iconAriaHidden: icon?.getAttribute("aria-hidden") ?? null,
				amberD: cs.getPropertyValue("--amber-d").trim(),
				ochreD: cs.getPropertyValue("--ochre-d").trim(),
				// The surface the message actually sits on. document.body is transparent
				// in a Storybook iframe, so walking up to the first painted ancestor is
				// the difference between a real ratio and a ratio against rgba(0,0,0,0).
				behind: (() => {
					let node: Element | null = warn ?? null;
					while (node) {
						const bg = getComputedStyle(node).backgroundColor;
						if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
						node = node.parentElement;
					}
					return getComputedStyle(document.documentElement).backgroundColor;
				})(),
			};
		});

		// The announced half.
		expect(read.plainRole, "an error must interrupt").toBe("alert");
		expect(read.warnRole, "a warning must NOT interrupt").toBe("status");

		// The seen half, part one: the tone rule beat both base declarations.
		expect(read.warnColor).not.toBe(read.plainColor);
		// By identity: monochrome light aliases --amber-d onto --ochre-d.
		expect(read.amberD).toBe(read.ochreD);
		expect(read.warnColor, "warning is not painted with --amber-d").toBe(hexToRgb(read.amberD));

		// The seen half, part two: a colour alone is not a distinction.
		expect(read.iconContent, "no non-colour distinction rendered").not.toBe("none");
		expect(read.iconContent, "the ::before glyph did not apply").toBeTruthy();
		expect(read.iconWidth, "the icon applied but occupies no space").toBeGreaterThan(0);
		expect(read.iconAriaHidden, "the glyph would be spoken over the message").toBe("true");

		// AA for normal text, in the worst cell. Reported so the SUMMARY can quote it.
		const contrast = ratio(read.warnColor as string, read.behind);
		console.log(
			`[01-11] monochrome light warning text ${read.warnColor} on ${read.behind} = ${contrast.toFixed(2)}:1`,
		);
		expect(contrast, "warning text fails AA in monochrome light").toBeGreaterThanOrEqual(4.5);
	});

	test("G-6: the summary link is ON the item, and outranks Link's own variant rule", async ({
		page,
	}) => {
		await probeComputed(page, {
			...CELL,
			story: "patterns-formvalidation--anchored-error-summary",
			selector: ".ds-atom-form-error-summary",
			props: ["color"],
		});

		const read = await page.evaluate(() => {
			const root = document.querySelector(".ds-atom-form-error-summary") as HTMLElement;
			const links = Array.from(root.querySelectorAll("a"));
			const items = Array.from(root.querySelectorAll("li"));
			const plainItem = items.find((li) => !li.querySelector("a"));
			const cs = getComputedStyle(document.documentElement);
			return {
				listCount: root.querySelectorAll("ul, ol").length,
				linkCount: links.length,
				// Every link must live inside an <li>: a link BESIDE the list is the
				// workaround the finding exists to remove.
				allInsideItems: links.every((a) => a.closest("li") !== null),
				linkColor: links[0] ? getComputedStyle(links[0]).color : null,
				linkDecoration: links[0] ? getComputedStyle(links[0]).textDecorationLine : null,
				plainColor: plainItem ? getComputedStyle(plainItem).color : null,
				inkTwo: cs.getPropertyValue("--ink-2").trim(),
				redInk: cs.getPropertyValue("--red-ink").trim(),
				// Nothing but the title and the single list may be a child of the root.
				rootChildren: Array.from(root.children).map((c) => c.tagName),
			};
		});

		expect(read.listCount, "a second list is exactly the desynchronising workaround").toBe(1);
		expect(read.linkCount, "the anchored story rendered no links").toBe(2);
		expect(read.allInsideItems, "a link rendered beside the list, not on the item").toBe(true);
		expect(read.rootChildren).toEqual(["STRONG", "UL"]);

		// THE regression case. At (0,1,1) this read var(--ink-2) instead, because
		// Link's (0,2,0) variant rule is declared ~1,070 lines later.
		expect(read.linkColor, "Link's variant rule outranked the summary rule").not.toBe(
			hexToRgb(read.inkTwo),
		);
		expect(read.linkColor, "the link does not inherit the summary's colour").toBe(read.plainColor);
		expect(read.linkColor).toBe(hexToRgb(read.redInk));
		// The underline is the non-colour affordance that it is a link at all.
		expect(read.linkDecoration).toContain("underline");
	});
});
