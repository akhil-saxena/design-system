import { type Page, expect, test } from "@playwright/test";

/**
 * D-4 — a footer or action Link's underline must be visible on the surface it is
 * actually drawn on, and must be reachable from a consumer stylesheet.
 *
 * ## What was measured, before
 *
 * Both variants inlined `textDecorationColor: "rgba(0, 0, 0, 0.25)"` — a fixed
 * black. On the consumer's #0d0d0f page that composites to rgb(10, 10, 11)
 * against a rgb(13, 13, 15) surface: a difference of three parts in 255, which is
 * not an underline. Read on the built site at all six device classes and both
 * pointers, and reproduced in this package's own Storybook in dark mode.
 *
 * ## The part that makes it a cascade finding rather than a wrong colour
 *
 * primitives.css ALREADY carried the correct dark value — `.dark
 * .ds-atom-link[data-variant="footer"] { text-decoration-color: rgba(255, 255,
 * 255, 0.4) }` — and it had never once applied, because an inline declaration
 * outranks every stylesheet rule at every specificity. Swapping the literal for a
 * token in place would have fixed the colour and left the next override just as
 * dead, so the declaration moved into the sheet instead.
 *
 * ## Why the mode lives in a token and not in a `.dark` rule
 *
 * A `.dark .ds-atom-link[data-variant="footer"]` override is (0,3,0). The hover
 * rule that deepens the underline to `currentColor` is also (0,3,0), and the dark
 * override sits later in the file — so restoring it would have made dark-mode
 * hover stop working, silently. `--link-underline-quiet` carries the 25%/40%
 * difference instead, which leaves exactly one declaration in the cascade for
 * this property. `hover deepens in BOTH modes` is the case that would have
 * caught the alternative.
 *
 * ## Why a browser
 *
 * All of it is compositing and cascade. jsdom resolves no custom properties, does
 * not implement color-mix, and has no cascade to lose — the unit suite can only
 * assert that the inline declaration is gone.
 */

const STORY = "foundation-link--variants";
const VARIANTS = ["footer", "action"] as const;

/** Parses `rgb()`, `rgba()` and Chromium's `color(srgb r g b / a)` into 0-255 + alpha. */
function parseColor(v: string): { r: number; g: number; b: number; a: number } {
	const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(
		v.trim(),
	);
	if (srgb) {
		return {
			r: Number(srgb[1]) * 255,
			g: Number(srgb[2]) * 255,
			b: Number(srgb[3]) * 255,
			a: srgb[4] === undefined ? 1 : Number(srgb[4]),
		};
	}
	const rgb = /^rgba?\(([^)]+)\)$/.exec(v.trim());
	if (!rgb) throw new Error(`cannot parse colour ${JSON.stringify(v)}`);
	const parts = (rgb[1] ?? "")
		.split(/[,\s/]+/)
		.filter(Boolean)
		.map(Number);
	// Three channels is the floor. Bailing here rather than reading undefined
	// keeps a malformed colour from silently becoming NaN and turning every
	// contrast assertion downstream into a comparison against NaN, which passes
	// nothing and fails nothing legibly.
	const [r, g, b, a] = parts;
	if (r === undefined || g === undefined || b === undefined) {
		throw new Error(`cannot parse colour ${JSON.stringify(v)}`);
	}
	return { r, g, b, a: a === undefined ? 1 : a };
}

/** Relative luminance, WCAG definition. */
function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
	const f = (c: number) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Composites a translucent ink over an opaque surface and returns the contrast ratio. */
function contrastOver(ink: string, surface: string): number {
	const i = parseColor(ink);
	const s = parseColor(surface);
	const mixed = {
		r: i.r * i.a + s.r * (1 - i.a),
		g: i.g * i.a + s.g * (1 - i.a),
		b: i.b * i.a + s.b * (1 - i.a),
	};
	const la = luminance(mixed);
	const lb = luminance(s);
	const hi = Math.max(la, lb);
	const lo = Math.min(la, lb);
	return (hi + 0.05) / (lo + 0.05);
}

async function open(page: Page, mode: "light" | "dark") {
	await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:${mode};brand:default`);
	await page.waitForSelector('.ds-atom-link[data-variant="footer"]', { timeout: 30_000 });
	await page.waitForFunction(
		(want) => document.documentElement.classList.contains("dark") === want,
		mode === "dark",
		{ timeout: 15_000 },
	);
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
}

/**
 * The surface the underline is composited against, stated rather than read.
 *
 * Storybook's canvas background is owned by the preview harness and is
 * re-applied on render, so pinning `document.body.style.background` does not
 * hold — measured: it read back as the light canvas even in the dark cell, which
 * would have made every dark assertion below a light-mode assertion wearing the
 * wrong label. These two are the surfaces that matter in the real world: the
 * system's own paper in light, and the consumer's page — the #0d0d0f that
 * produced D-4 — in dark.
 */
const SURFACE = { light: "rgb(245, 243, 240)", dark: "rgb(13, 13, 15)" } as const;

async function read(page: Page, variant: string) {
	return page.evaluate((v: string) => {
		const el = document.querySelector(`.ds-atom-link[data-variant="${v}"]`) as HTMLElement;
		if (!el) throw new Error(`no ${v} link in the story — the assertion would be vacuous`);
		const cs = getComputedStyle(el);
		return {
			color: cs.color,
			underline: cs.getPropertyValue("text-decoration-color").trim(),
			inline: el.style.textDecorationColor,
		};
	}, variant);
}

for (const mode of ["light", "dark"] as const) {
	test.describe(`${mode} mode`, () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		for (const variant of VARIANTS) {
			test(`${variant} draws its underline in the link's own ink, not a fixed black`, async ({
				page,
			}) => {
				await open(page, mode);
				const m = await read(page, variant);
				expect(
					m.inline,
					"the colour is inline again — no stylesheet rule can beat it at any specificity",
				).toBe("");
				const u = parseColor(m.underline);
				const ink = parseColor(m.color);
				// The underline is the ink at reduced alpha. Compared channel-wise
				// rather than string-wise because Chromium serialises a color-mix()
				// result as color(srgb …) and a literal as rgba(…).
				for (const ch of ["r", "g", "b"] as const) {
					expect(
						Math.abs(u[ch] - ink[ch]),
						`the underline's ${ch} channel does not track the link's ink: underline ${m.underline}, ink ${m.color}`,
					).toBeLessThan(2);
				}
				expect(u.a).toBeCloseTo(mode === "dark" ? 0.4 : 0.25, 2);
			});

			test(`${variant} is actually visible against the surface`, async ({ page }) => {
				await open(page, mode);
				const m = await read(page, variant);
				const ratio = contrastOver(m.underline, SURFACE[mode]);
				// 1.5:1 is well below any WCAG text threshold and is chosen as a floor
				// for a DECORATIVE hairline, not as a compliance claim. The value it
				// replaces measured 1.02:1 on #0d0d0f — the number that made the
				// underline vanish. Anything at or under ~1.1 is not a line.
				expect(
					ratio,
					`the underline is ${ratio.toFixed(3)}:1 against ${SURFACE[mode]}; it is not visible`,
				).toBeGreaterThan(1.5);
			});
		}

		test("hover still deepens the underline to full opacity", async ({ page }) => {
			await open(page, mode);
			const before = await read(page, "footer");
			await page.locator('.ds-atom-link[data-variant="footer"]').hover();
			const after = await page.evaluate(() => {
				const el = document.querySelector('.ds-atom-link[data-variant="footer"]') as HTMLElement;
				const cs = getComputedStyle(el);
				return { underline: cs.getPropertyValue("text-decoration-color").trim(), color: cs.color };
			});
			// THE CASE THAT RULES OUT THE OBVIOUS ALTERNATIVE FIX. Putting the
			// mode difference in a `.dark .ds-atom-link[data-variant="footer"]`
			// rule would be (0,3,0), tie with the hover rule, and win on file
			// order — so dark-mode hover would stop deepening and nothing else
			// here would notice.
			expect(
				parseColor(after.underline).a,
				`hover did not reach full opacity in ${mode} mode: ${after.underline}`,
			).toBeCloseTo(1, 2);
			expect(after.underline).toBe(after.color);
			expect(parseColor(before.underline).a).toBeLessThan(1);
		});
	});
}

test.describe("the finding, which was reachability", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	/**
	 * D-4 as filed: "An inline declaration cannot be beaten by any app stylesheet
	 * at any specificity without `!important`." The colour being correct is not
	 * the whole fix — a consumer has to be able to take it over. (0,2,0) is one
	 * class more than a consumer's own class, so this uses (0,3,0), which is what
	 * an app stylesheet writes when it means it.
	 */
	test("a consumer stylesheet can now override the underline without !important", async ({
		page,
	}) => {
		await open(page, "dark");
		await page.addStyleTag({
			content:
				'html body .ds-atom-link[data-variant="footer"]{text-decoration-color:rgb(0, 255, 0)}',
		});
		const m = await read(page, "footer");
		expect(
			m.underline,
			"a (0,3,0) consumer rule still cannot reach the underline, which is the defect D-4 filed",
		).toBe("rgb(0, 255, 0)");
	});

	test("the measurement is not vacuous", async ({ page }) => {
		await open(page, "dark");
		// Re-inline the exact literal the component used to emit, on the same
		// element. If the assertions above were measuring something other than this
		// declaration, this would not change them.
		await page.evaluate(() => {
			const el = document.querySelector('.ds-atom-link[data-variant="footer"]') as HTMLElement;
			el.style.textDecorationColor = "rgba(0, 0, 0, 0.25)";
		});
		const m = await read(page, "footer");
		const ratio = contrastOver(m.underline, SURFACE.dark);
		expect(m.underline).toBe("rgba(0, 0, 0, 0.25)");
		expect(
			ratio,
			"restoring the old literal did not reproduce the invisible underline, so these cases are not measuring it",
		).toBeLessThan(1.1);
	});
});
