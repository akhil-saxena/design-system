import { type Page, expect, test } from "@playwright/test";

/**
 * G6. The ink on a HOVERED primary control must clear the 4.5:1 AA text floor in
 * every brand x mode cell.
 *
 * THE DEFECT THIS LOCKS DOWN
 *
 * `.ds-atom-iconbtn[data-variant="primary"]:hover` pinned `color: #fff` over a
 * `background: var(--amber-d)` fill. --amber-d does not merely darken across
 * modes, it INVERTS: a dark orange in default light (#b45309) but a bright yellow
 * in default dark (#fbbf24); a mid grey in monochrome light (#64646a) but a light
 * grey in monochrome dark (#95959b). White therefore measured 5.02 / 5.88 in the
 * two light cells and 1.67 / 2.98 in the two dark ones. Worse, the rule's own base
 * declaration two blocks up already said `color: var(--ink-inverse)` -- the hover
 * was actively undoing a correct declaration with a literal.
 *
 * WHY NO EXISTING GATE CAUGHT IT
 *
 * No visual baseline captures a hover state, so the 1,019-image store is blind to
 * this by construction. `test:a11y` is blind too: axe only walks the resting DOM,
 * and nothing hovers a control before it runs. The defect was therefore invisible
 * to every committed gate in both brands, which is precisely the shape of failure
 * this phase keeps rediscovering.
 *
 * WHY A SPEC AND NOT A GREP
 *
 * A grep for `#fff` cannot tell a live declaration from a dead one, and in this
 * very neighbourhood that distinction is load-bearing:
 * `.ds-atom-btn[data-variant="primary"]:hover` carries the same literal and is
 * INERT, because Button applies `background`/`color` as inline styles that outrank
 * any class selector. A literal-count gate would have "found" two defects, fixed
 * the wrong one, and reported success. This measures the rendered cascade with the
 * pointer actually over the control.
 *
 * THE ASSERTIONS, AND WHY NONE IS SUFFICIENT ALONE
 *
 * 1. :hover ACTUALLY MATCHED. Without this the whole spec is vacuous -- an
 *    unhovered control reads its resting ink and passes comfortably. This is not
 *    hypothetical: the first draft of this measurement silently read resting
 *    values because the pointer landed outside the control's box.
 * 2. THE FILL IS STILL AN ACCENT STEP. A ratio assertion alone would pass if the
 *    control stopped being painted with the accent at all, which would make every
 *    figure comfortable and every assertion meaningless.
 * 3. THE BRAND AXIS RESOLVED, read at <html> AND cross-checked against a NEUTRAL.
 *    A node can carry the right brand while its neutrals are shadowed (01-19.1),
 *    so the accent alone would not catch a half-applied theme.
 * 4. THE RATIO, composited by hand. getComputedStyle does not composite alpha.
 */

const CELLS = [
	{ brand: "default", mode: "light", cream: "#fcfcfc", amber: "#f59e0b", amberD: "#b45309" },
	{ brand: "default", mode: "dark", cream: "#181818", amber: "#f59e0b", amberD: "#fbbf24" },
	{ brand: "monochrome", mode: "light", cream: "#fafafb", amber: "#111114", amberD: "#64646a" },
	{ brand: "monochrome", mode: "dark", cream: "#0d0d0f", amber: "#f2f2f4", amberD: "#95959b" },
] as const;

const CONTROLS = [
	{
		label: "IconButton primary",
		story: "inputs-iconbutton--variants",
		selector: '.ds-atom-iconbtn[data-variant="primary"]',
	},
	{
		label: "Button primary",
		story: "inputs-button--variants",
		selector: '.ds-atom-btn[data-variant="primary"]',
	},
] as const;

function parseRgb(c: string): [number, number, number, number] {
	const m = c.match(/[\d.]+/g);
	if (!m) throw new Error(`unparseable colour: ${c}`);
	return [Number(m[0]), Number(m[1]), Number(m[2]), m[3] === undefined ? 1 : Number(m[3])];
}
/** Composite fg over bg WITHOUT rounding — rounding reproduces the hex but misses
 *  ratios by ~0.019, which is the difference between a pass and a finding. */
function over(fg: string, bg: string): string {
	const [fr, fg_, fb, fa] = parseRgb(fg);
	const [br, bg_, bb] = parseRgb(bg);
	return `rgb(${fr * fa + br * (1 - fa)}, ${fg_ * fa + bg_ * (1 - fa)}, ${fb * fa + bb * (1 - fa)})`;
}
function luminance(c: string): number {
	const [r, g, b] = parseRgb(c);
	const f = (v: number) => {
		const s = v / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: string, b: string): number {
	const [x, y] = [luminance(a) + 0.05, luminance(b) + 0.05];
	return x > y ? x / y : y / x;
}
function hex(c: string): string {
	const [r, g, b] = parseRgb(c);
	return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

async function hoverAndRead(
	page: Page,
	story: string,
	selector: string,
	cell: (typeof CELLS)[number],
) {
	await page.goto(
		`/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=theme:${cell.mode};brand:${cell.brand}`,
	);
	await page.waitForSelector(selector, { state: "visible", timeout: 15_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	const want = {
		brand: cell.brand === "monochrome" ? "monochrome" : null,
		dark: cell.mode === "dark",
	};
	await page.waitForFunction(
		(w) =>
			document.documentElement.getAttribute("data-brand") === w.brand &&
			document.documentElement.classList.contains("dark") === w.dark,
		want,
		{ timeout: 15_000 },
	);
	// Move the real pointer to the control's centre. page.hover() proved unreliable
	// where a story renders several matching controls.
	const box = await page.locator(selector).first().boundingBox();
	if (!box) throw new Error(`no box for ${selector}`);
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.waitForTimeout(200);
	return page.evaluate((sel) => {
		const el = document.querySelector(sel);
		if (!el) throw new Error(`missing ${sel}`);
		const cs = getComputedStyle(el);
		const stack: string[] = [];
		let n: Element | null = el;
		while (n && n !== document.documentElement) {
			const c = getComputedStyle(n).backgroundColor;
			if (c && c !== "rgba(0, 0, 0, 0)") stack.push(c);
			n = n.parentElement;
		}
		stack.push(getComputedStyle(document.body).backgroundColor);
		return {
			hovered: el.matches(":hover"),
			brandAttr: document.documentElement.getAttribute("data-brand"),
			neutralCream: getComputedStyle(document.documentElement).getPropertyValue("--cream").trim(),
			color: cs.color,
			background: cs.backgroundColor,
			stack,
		};
	}, selector);
}

test.describe("G6 hovered primary ink clears AA in every brand x mode cell", () => {
	for (const control of CONTROLS) {
		for (const cell of CELLS) {
			test(`${control.label} — ${cell.brand} ${cell.mode}`, async ({ page }) => {
				const r = await hoverAndRead(page, control.story, control.selector, cell);

				// (1) the measurement is not vacuous
				expect(r.hovered, `${control.selector} was not actually hovered`).toBe(true);

				// (3) the brand axis resolved, at <html> and at a neutral
				expect(r.brandAttr).toBe(cell.brand === "monochrome" ? "monochrome" : null);
				expect(r.neutralCream.toLowerCase(), "neutral shadowed under a correct brand attr").toBe(
					cell.cream,
				);

				// (4) composite by hand, then measure
				let bg = r.background;
				for (const layer of r.stack.slice(1)) {
					if (!bg.startsWith("rgba")) break;
					bg = over(bg, layer);
				}
				const contrast = ratio(r.color, bg);

				// (2) the fill is still an accent step — otherwise the ratio is meaningless
				expect(
					[cell.amber, cell.amberD],
					`hover fill ${hex(bg)} is neither --amber nor --amber-d`,
				).toContain(hex(bg));

				expect(
					contrast,
					`${control.label} ${cell.brand}/${cell.mode}: ${hex(r.color)} on ${hex(bg)} = ${contrast.toFixed(2)}`,
				).toBeGreaterThanOrEqual(4.5);
			});
		}
	}
});
