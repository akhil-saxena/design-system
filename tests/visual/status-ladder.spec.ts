import { expect, test } from "@playwright/test";
import { type Brand, type Mode, hexToRgb, probeComputed } from "./computed";

/**
 * F-15-5: D-45's three statuses were **not distinguishable by fill**. Measured on
 * charcoal light: Live vs Maintained **1.02:1**, and all three fills within
 * 1.07–1.14:1 of the page. "Only the words and their text colours separate them,
 * at 9.5px."
 *
 * ## Why this is a browser test and not arithmetic
 *
 * The fills are `color-mix(in srgb, var(--ink) N%, var(--paper))`. Nothing in the
 * source states what that resolves to — it depends on which brand's `--ink` and
 * `--paper` won the cascade, which is precisely the thing a grep cannot see and
 * the thing that has already been got wrong here.
 *
 * ## The brand is asserted at the point of measurement
 *
 * `probeComputed` asserts `data-brand` on `<html>`, which catches the axis not
 * being applied. It cannot catch the axis being applied and then **overridden
 * inside the story**: `tokens.css` targets `:root.dark, .dark`, so a story
 * decorator that sets `className="dark"` re-declares ~50 neutral dark tokens
 * inside its own subtree while `charcoal.css`, being root-scoped, does not reach
 * in. A probe in such a story measures the DEFAULT brand and passes confidently.
 * Two of this component's sibling stories do exactly that, with a hardcoded
 * `#1c1917` background as well.
 *
 * So every read below also asserts `--amber` **on the probed element**. It is the
 * accent bridge: `tokens.css` declares it once as `#f59e0b`, and charcoal aliases
 * it onto `--ochre` (`#b0722a`) in both of its blocks. It therefore differs by
 * brand in all four cells, and it is exactly the kind of token a scoped `.dark`
 * wrapper strands. `--ochre` is asserted too — it exists in charcoal.css and
 * nowhere else, so an empty read is positive proof the brand did not apply.
 *
 * The story probed is `inputs-statuspill--status-ladder`, which carries no
 * decorator at all for this reason.
 */

const STORY = "inputs-statuspill--status-ladder";

/**
 * Only charcoal declares these. `--amber` is charcoal's accent bridge.
 *
 * Held as hex because that is what Chromium reports for a custom property:
 * `getPropertyValue` resolves the `var()` chain but keeps the AUTHORED format,
 * so `--amber: var(--ochre)` reads `#b0722a`, not `rgb(176, 114, 42)`. A first
 * draft of this file compared against the rgb spelling and every case failed —
 * which is the brand guard doing its job on itself.
 */
const BRAND_MARKER: Record<Brand, { amber: string; ochreIsSet: boolean }> = {
	charcoal: { amber: "#b0722a", ochreIsSet: true },
	default: { amber: "#f59e0b", ochreIsSet: false },
};

/**
 * "rgb(215, 213, 208)" / "color(srgb …)" / "#f4f1ea" → [r,g,b].
 *
 * Both spellings turn up in one comparison: `background-color` is a standard
 * property and comes back as `rgb()`, while `--cream` and `--panel2` are custom
 * properties and come back as the hex the token declares.
 */
function parseRgb(value: string): [number, number, number] {
	const v = value.trim();
	const raw = v.startsWith("#") ? hexToRgb(v) : v;
	const nums = [...raw.matchAll(/[\d.]+%?/g)].map((m) => m[0]);
	if (nums.length < 3) throw new Error(`could not parse colour ${JSON.stringify(value)}`);
	const scale = (s: string) => {
		const n = Number.parseFloat(s);
		if (s.endsWith("%")) return (n / 100) * 255;
		return raw.includes("srgb") ? n * 255 : n;
	};
	return [scale(nums[0] as string), scale(nums[1] as string), scale(nums[2] as string)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
	const ch = (c: number) => {
		const s = c / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrast(a: string, b: string): number {
	const [x, y] = [relativeLuminance(parseRgb(a)) + 0.05, relativeLuminance(parseRgb(b)) + 0.05];
	return x > y ? x / y : y / x;
}

/** The two triads. Two tones share each ladder step, so a triad is the unit. */
const TRIADS = {
	neutral: ["muted", "secondary", "primary"],
	hued: ["success", "accent", "danger"],
} as const;

async function readTriad(
	// biome-ignore lint/suspicious/noExplicitAny: Playwright's Page, imported transitively
	page: any,
	brand: Brand,
	mode: Mode,
	tones: readonly string[],
) {
	const out: { tone: string; fill: string; text: string; page: string; panel: string }[] = [];
	for (const tone of tones) {
		const got = await probeComputed(page, {
			story: STORY,
			brand,
			mode,
			selector: `.ds-atom-statuspill[data-tone="${tone}"]`,
			props: ["background-color", "color", "--cream", "--panel2", "--amber", "--ochre"],
		});
		// The brand assertion, per read, on the probed element itself.
		const marker = BRAND_MARKER[brand];
		expect(
			got["--amber"],
			`brand did not reach the probed element: --amber read ${JSON.stringify(got["--amber"])}. A story decorator setting className="dark" strands charcoal.css, which is root-scoped.`,
		).toBe(marker.amber);
		expect(
			(got["--ochre"] ?? "").length > 0,
			`--ochre is declared only by charcoal.css; read ${JSON.stringify(got["--ochre"])}`,
		).toBe(marker.ochreIsSet);

		out.push({
			tone,
			fill: got["background-color"] as string,
			text: got.color as string,
			page: got["--cream"] as string,
			panel: got["--panel2"] as string,
		});
	}
	return out;
}

for (const brand of ["charcoal", "default"] as const) {
	for (const mode of ["light", "dark"] as const) {
		for (const [name, tones] of Object.entries(TRIADS)) {
			test(`${brand} x ${mode}: the ${name} triad is distinguishable by fill (F-15-5)`, async ({
				page,
			}) => {
				const read = await readTriad(page, brand, mode, tones);
				const lines: string[] = [];

				for (const r of read) {
					const vsPage = contrast(r.fill, r.page);
					const vsPanel = contrast(r.fill, r.panel);
					const onFill = contrast(r.text, r.fill);
					lines.push(
						`${r.tone}: fill ${r.fill} vsPage ${vsPage.toFixed(3)} vsPanel ${vsPanel.toFixed(3)} text-on-fill ${onFill.toFixed(2)}`,
					);
					// The finding's own bar, and the reason it was a finding: all three
					// were within 1.07–1.14:1 of the page.
					expect
						.soft(vsPage, `${r.tone} fill vs page — ${lines.at(-1)}`)
						.toBeGreaterThanOrEqual(1.2);
					// The panel is the deepest of the three surfaces and admin zebra puts
					// pills on it, so a fill that only separates from the page is not done.
					expect.soft(vsPanel, `${r.tone} fill vs panel`).toBeGreaterThanOrEqual(1.08);
					// 9.5–11px type: the large-text allowance never applies, and charcoal's
					// contract holds 7:1 elsewhere.
					expect.soft(onFill, `${r.tone} text on its own fill`).toBeGreaterThanOrEqual(7);
				}

				for (let i = 0; i < read.length; i++) {
					for (let j = i + 1; j < read.length; j++) {
						const c = contrast(read[i]!.fill, read[j]!.fill);
						expect
							.soft(
								c,
								`${read[i]!.tone} vs ${read[j]!.tone} fill separation — the finding measured 1.02:1 here\n  ${lines.join("\n  ")}`,
							)
							.toBeGreaterThanOrEqual(1.2);
					}
				}

				// Non-vacuity in the direction that matters. A parser bug returning
				// zeroes would fail the ratios above; this fails if the fills came back
				// as the PRE-PLAN values — the 12–15% alpha washes and --cream-2 — which
				// is what a `ds-atom-badge`-shaped fix (class added, inline object left
				// in place) would still produce.
				const fills = read.map((r) => r.fill);
				expect(new Set(fills).size, `three tones must not share one fill: ${fills.join(" ")}`).toBe(
					3,
				);
				for (const r of read) {
					expect(r.fill, "fill is still an alpha wash, so the inline object survived").not.toMatch(
						/rgba?\([^)]*,\s*0?\.1[0-9]?\s*\)/,
					);
				}
			});
		}
	}
}

test("charcoal x light: the marker is a shape distinction, not another colour", async ({
	page,
}) => {
	// The non-colour signal. Step 1 is a hollow ring (transparent centre, a real
	// border), step 2 a filled disc, step 3 a filled square (border-radius 1px).
	// A greyscale or colour-blind reader gets the same three-way split the fill
	// ladder gives a colour-sighted one.
	const shapes: Record<string, { transparent: boolean; radius: string }> = {};
	for (const tone of ["muted", "secondary", "primary"]) {
		const got = await probeComputed(page, {
			story: STORY,
			brand: "charcoal",
			mode: "light",
			selector: `.ds-atom-statuspill[data-tone="${tone}"] .ds-atom-statuspill-marker`,
			props: ["background-color", "border-radius", "border-top-width", "--amber"],
		});
		expect(got["--amber"], "brand did not reach the marker").toBe(BRAND_MARKER.charcoal.amber);
		shapes[tone] = {
			transparent: /rgba\([^)]*,\s*0\s*\)|transparent/.test(got["background-color"] as string),
			radius: got["border-radius"] as string,
		};
	}
	// step 1 — hollow.
	expect(shapes.muted?.transparent, "step 1's marker must be a ring, not a disc").toBe(true);
	// step 2 — filled disc, fully round.
	expect(shapes.secondary?.transparent).toBe(false);
	expect(shapes.secondary?.radius).toBe("50%");
	// step 3 — filled square.
	expect(shapes.primary?.transparent).toBe(false);
	expect(shapes.primary?.radius).not.toBe("50%");
});

test("the preset stage path renders no marker, so no existing pill moves", async ({ page }) => {
	// G-5 keeps the six job stages as a preset. The regression guard is that the
	// generic path's additions are additive: a stage pill has no marker and no
	// data-tone, so its fill is still the tint the stage rules give it.
	const got = await probeComputed(page, {
		story: "inputs-statuspill--all-stages",
		brand: "charcoal",
		mode: "light",
		selector: '.ds-atom-statuspill[data-stage="offer"]',
		props: ["background-color", "--amber"],
	});
	expect(got["--amber"]).toBe(BRAND_MARKER.charcoal.amber);
	// rgba(34,197,94,.14), unchanged by this plan.
	expect(got["background-color"]).toMatch(/34,\s*197,\s*94/);
});
