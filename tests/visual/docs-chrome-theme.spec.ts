import { expect, test } from "@playwright/test";

/**
 * G7. Storybook's DOCS chrome must follow the Theme and Brand toolbars.
 *
 * WHY THIS IS A SHIPPING SURFACE, not developer comfort: Phase 9 hosts this
 * Storybook at /design-system, so the docs chrome is part of the published site.
 *
 * THE THREE DEFECTS THIS LOCKS DOWN, each with a different mechanism:
 *
 * 1. `.docs-story` rendered the retired cream #f5f3f0 in dark mode even though
 *    storybook.css already declared `background: var(--cream) !important` on it,
 *    and every sibling in that same rule obeyed. The backgrounds addon injects
 *    `#anchor--<storyId> .docs-story { background: <value> !important }` per story
 *    in docs mode, and an ID beats classes: (1,1,0) vs (0,1,0). Both were
 *    !important, so this was lost on SPECIFICITY, not priority -- adding another
 *    !important could never have fixed it.
 * 2. `docsTheme` was hardcoded to the retired identity, including two #f59e0b
 *    ambers that survived the monochrome rename because a brand sweep does not
 *    look inside a JS theme object. `create()` runs once at module scope and can
 *    never be a function of a global, so the values are CSS custom properties --
 *    for the ten keys that accept one. Three (appBorderColor, textColor,
 *    colorSecondary) are piped through polished's parseToRgb and blank the page.
 * 3. Inline <code> and the args-table pills are painted from a hardcoded Emotion
 *    class (#f7fafc) that no theme value reaches at all.
 *
 * WHY A SWEEP AND NOT FOUR ASSERTIONS. Each defect above was found only because
 * something else was being measured; a spec naming four selectors would have
 * missed the 37 code chips entirely. So this asserts the named wrappers AND sweeps
 * every element under #storybook-docs for any surviving retired-identity colour.
 */

const RETIRED = {
	"#f5f3f0 (retired cream)": "rgb(245, 243, 240)",
	"#f59e0b (JobDash amber)": "rgb(245, 158, 11)",
	"#f7fafc (unthemed code chip)": "rgb(247, 250, 252)",
	"#e7e2dc (retired border)": "rgb(231, 226, 220)",
} as const;

const CELLS = [
	{ brand: "default", mode: "light", cream: "rgb(252, 252, 252)" },
	{ brand: "default", mode: "dark", cream: "rgb(24, 24, 24)" },
	{ brand: "monochrome", mode: "light", cream: "rgb(250, 250, 251)" },
	{ brand: "monochrome", mode: "dark", cream: "rgb(13, 13, 15)" },
] as const;

const WRAPPERS = [".sbdocs-wrapper", ".sbdocs-content", ".sbdocs-preview", ".docs-story"];
const DOCS_ID = "foundation-heading--docs";

test.describe("G7 docs chrome follows the theme", () => {
	for (const cell of CELLS) {
		test(`${cell.brand} / ${cell.mode}`, async ({ page }) => {
			await page.goto(
				`/iframe.html?id=${DOCS_ID}&viewMode=docs&globals=theme:${cell.mode};brand:${cell.brand}`,
			);
			await page.waitForSelector(".docs-story", { state: "attached", timeout: 30_000 });
			await page.evaluate(() => document.fonts.ready.then(() => undefined));
			await page.waitForTimeout(1200);

			const r = await page.evaluate(
				({ wrappers, retired }) => {
					const found: Record<string, string[]> = {};
					for (const [label, rgb] of Object.entries(retired)) {
						const hits: string[] = [];
						for (const el of document.querySelectorAll("#storybook-docs *")) {
							const cs = getComputedStyle(el);
							// The story preview renders the design system itself; its own
							// colours are not this spec's business.
							if (el.closest(".docs-story")) continue;
							if (cs.backgroundColor === rgb || cs.color === rgb || cs.borderTopColor === rgb) {
								hits.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 28)}`);
							}
						}
						if (hits.length) found[label] = [...new Set(hits)].slice(0, 4);
					}
					return {
						brandAttr: document.documentElement.getAttribute("data-brand"),
						dark: document.documentElement.classList.contains("dark"),
						cream: getComputedStyle(document.documentElement).getPropertyValue("--cream").trim(),
						backgrounds: Object.fromEntries(
							wrappers.map((w) => {
								const el = document.querySelector(w);
								return [w, el ? getComputedStyle(el).backgroundColor : "(absent)"];
							}),
						),
						found,
					};
				},
				{ wrappers: WRAPPERS, retired: RETIRED as unknown as Record<string, string> },
			);

			// The axis really resolved — at <html> and at a neutral, because a node can
			// carry the right brand while its neutrals are shadowed (01-19.1).
			expect(r.brandAttr).toBe(cell.brand === "monochrome" ? "monochrome" : null);
			expect(r.dark).toBe(cell.mode === "dark");

			// Every docs wrapper paints the brand's page colour.
			for (const w of WRAPPERS) {
				expect(r.backgrounds[w], `${w} does not follow --cream in ${cell.brand}/${cell.mode}`).toBe(
					cell.cream,
				);
			}

			// And nothing anywhere in the docs chrome still carries the retired identity.
			expect(
				r.found,
				`retired-identity colours still painted in ${cell.brand}/${cell.mode}`,
			).toEqual({});
		});
	}
});
