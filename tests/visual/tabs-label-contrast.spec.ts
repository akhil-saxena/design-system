import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * E35. Every tab label must clear the 4.5:1 AA text floor against the surface
 * that is ACTUALLY painted behind it, in all four brand x mode cells.
 *
 * The failure this locks down: `Data Display/Tabs > DarkMode` reported two
 * axe `color-contrast` violations, both inactive pill labels, at 4.47:1. The
 * pill track was painted with `--surf-2`, which in dark is a translucent white
 * veil — `rgba(255, 255, 255, 0.055)` — so the label's contrast was not a
 * property of the component at all. It was a function of whatever surface the
 * strip happened to be dropped onto:
 *
 *     --surf-2 over --cream   #181818 -> #252525   4.88  pass
 *     --surf-2 over --cream-2 #1f1f1f -> #2b2b2b   4.47  FAIL
 *     --surf-2 over --cream-3 #2a2a2a -> #363636   3.85  FAIL
 *
 * THE TWO ASSERTIONS, AND WHY NEITHER IS SUFFICIENT ALONE
 *
 * 1. THE RATIO, composited by hand. `getComputedStyle` does not composite: it
 *    reports `--surf-2` as the literal `rgba(...)` it was declared as, and plan
 *    01-18 already paid for trusting that — it read a fill as 2.020:1 where the
 *    composited truth was 1.114:1. So the ancestor chain is walked and every
 *    translucent layer is composited down to the first opaque one.
 *
 *    What this assertion CANNOT distinguish, which is why (2) exists: "safe on
 *    every surface" from "safe on the surface this story happens to use". On the
 *    default dark page the broken track measured 4.88 and passed. A sweep that
 *    only visited stories sitting on `--cream` would have been green before the
 *    fix and green after it, proving nothing — the same shape as E34, where
 *    every case focused the first tile so "the tile picked up" and "the first
 *    tile" were indistinguishable.
 *
 * 2. THE OPACITY of the surface behind the label, in dark. A ratio is only a
 *    property of the component if the surface under the text is opaque. This is
 *    the assertion that generalises to a page nobody has written yet, and it is
 *    the one that fails on the pre-fix tree from ANY story rather than only from
 *    the one story whose decorator raised the page.
 *
 *    Scoped to dark ON PURPOSE, and the asymmetry is real rather than a
 *    convenience: a white veil UNDER LIGHT TEXT lowers contrast, so in dark it
 *    is unsafe by construction; the same veil under DARK text raises contrast,
 *    so in light it is safe by construction, and light measures 5.42-5.68 on all
 *    three stops. Light is therefore covered by (1) alone, and forcing an opaque
 *    track there would be a change with no accessibility argument behind it.
 *
 * THE STORY SET IS NOT CHERRY-PICKED. All eight Tabs stories are swept, and the
 * sweep asserts a floor on how many labels it saw and that it reached the
 * raised-page story specifically — because a selector that silently matched
 * nothing, or a story list that quietly lost the one story on a raised page,
 * would turn this whole file into a tautology.
 *
 * THE BRAND IS ASSERTED AT THE PROBED ELEMENT, both halves, per E29. `--ochre`
 * is declared only in `src/themes/monochrome.css`, so reading it proves the brand
 * layer reached the node; but 01-19.1 measured `--ochre` reading CORRECTLY at a
 * node whose neutrals were shadowed underneath, so a neutral is asserted too.
 */

/** Every Tabs story. `--docs` is excluded; it is a page, not a story. */
const STORIES = [
	"data-display-tabs--underline",
	"data-display-tabs--pill",
	"data-display-tabs--with-counts",
	"data-display-tabs--with-disabled",
	"data-display-tabs--manual-activation",
	"data-display-tabs--narrow-overflow",
	"data-display-tabs--dark-mode",
	"data-display-tabs--playground",
] as const;

/**
 * The one story that pins `globals: { theme: "dark" }` and wraps itself in a
 * `--cream-2` page. It is the reason (1) can fail at all, so the sweep asserts
 * it was reached rather than assuming it.
 */
const RAISED_PAGE_STORY = "data-display-tabs--dark-mode";

/** Story-level globals win over URL globals, so this story has no light cell. */
const DARK_ONLY = new Set<string>([RAISED_PAGE_STORY]);

interface Label {
	story: string;
	text: string;
	variant: string;
	active: boolean;
	fg: string;
	bg: string;
	ratio: number;
	bgIsOpaque: boolean;
	bgStack: string[];
}

/**
 * Walks the ancestor chain of every tab label, composites the background down to
 * the first opaque layer, and reports the measured ratio. Runs in the page so it
 * reads the real cascade rather than a re-derivation of it.
 */
async function measureLabels(
	page: import("@playwright/test").Page,
	story: string,
): Promise<Label[]> {
	return page.evaluate((storyId: string) => {
		const parse = (s: string) => {
			const m = s.match(/rgba?\(([^)]+)\)/);
			if (!m) return null;
			const p = (m[1] ?? "")
				.split(/[,\s/]+/)
				.filter(Boolean)
				.map(Number);
			if (p.length < 3 || p.slice(0, 3).some((v) => Number.isNaN(v))) return null;
			return {
				r: p[0] as number,
				g: p[1] as number,
				b: p[2] as number,
				a: p.length > 3 ? (p[3] as number) : 1,
			};
		};
		type Rgb = { r: number; g: number; b: number; a: number };
		const lin = (c: number) => {
			const v = c / 255;
			return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
		};
		const lum = (c: Rgb) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
		const ratio = (a: Rgb, b: Rgb) => {
			const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
			return ((hi as number) + 0.05) / ((lo as number) + 0.05);
		};
		const over = (fg: Rgb, bg: Rgb): Rgb => ({
			r: fg.r * fg.a + bg.r * (1 - fg.a),
			g: fg.g * fg.a + bg.g * (1 - fg.a),
			b: fg.b * fg.a + bg.b * (1 - fg.a),
			a: 1,
		});
		const hex = (c: Rgb) =>
			`#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

		return [...document.querySelectorAll("#storybook-root .ds-atom-tabs-label")].map((node) => {
			const el = node as HTMLElement;
			const cs = getComputedStyle(el);
			// Collect every painted layer from the label upward, stopping at the
			// first fully opaque one — anything above it cannot affect the result.
			const stack: { label: string; color: Rgb }[] = [];
			let n: HTMLElement | null = el;
			while (n) {
				const bg = parse(getComputedStyle(n).backgroundColor);
				if (bg && bg.a > 0) {
					const cls = typeof n.className === "string" && n.className.trim();
					stack.push({
						label: n.tagName.toLowerCase() + (cls ? `.${cls.split(/\s+/).join(".")}` : ""),
						color: bg,
					});
					if (bg.a === 1) break;
				}
				n = n.parentElement;
			}
			// The first opaque layer found is the floor; if the chain never reached
			// one, the browser canvas is white and that is the honest backdrop.
			const deepest = stack.at(-1);
			let bg: Rgb =
				deepest && deepest.color.a === 1 ? deepest.color : { r: 255, g: 255, b: 255, a: 1 };
			for (let i = stack.length - (deepest && deepest.color.a === 1 ? 2 : 1); i >= 0; i--) {
				bg = over((stack[i] as { color: Rgb }).color, bg);
			}
			const fgRaw = parse(cs.color) ?? { r: 0, g: 0, b: 0, a: 1 };
			const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
			// "Opaque behind the label" means the nearest layer that actually
			// paints is opaque, i.e. no compositing was needed to get a colour.
			const nearest = stack[0];
			return {
				story: storyId,
				text: (el.textContent ?? "").trim(),
				variant: (el.closest(".ds-atom-tabs") as HTMLElement | null)?.dataset.variant ?? "?",
				active:
					(el.closest("[role=tab]") as HTMLElement | null)?.hasAttribute("data-active") ?? false,
				fg: hex(fg),
				bg: hex(bg),
				ratio: Number(ratio(fg, bg).toFixed(3)),
				bgIsOpaque: !!nearest && nearest.color.a === 1,
				bgStack: stack.map(
					(s) => `${s.label} = rgba(${s.color.r},${s.color.g},${s.color.b},${s.color.a})`,
				),
			};
		});
	}, story);
}

const CELLS = [
	{ brand: "default", mode: "light" },
	{ brand: "default", mode: "dark" },
	{ brand: "monochrome", mode: "light" },
	{ brand: "monochrome", mode: "dark" },
] as const;

for (const cell of CELLS) {
	test(`tab labels clear AA against their painted surface — ${cell.brand} ${cell.mode}`, async ({
		page,
	}) => {
		const stories = STORIES.filter((s) => !(cell.mode === "light" && DARK_ONLY.has(s)));
		const all: Label[] = [];
		const failures: string[] = [];

		for (const story of stories) {
			// Drives the cell, asserts <html> reached it, and throws if the selector
			// matches nothing — so a story that stopped rendering labels is an error
			// rather than a silent zero.
			const tok = await probeComputed(page, {
				story,
				brand: cell.brand,
				mode: cell.mode,
				selector: ".ds-atom-tabs-label",
				props: ["--ochre", "--cream", "--ink-3"],
			});

			// Brand, both halves, at the probed element.
			if (cell.brand === "monochrome") {
				expect(tok["--ochre"], `${story}: monochrome must declare --ochre at the label`).toBe(
					cell.mode === "dark" ? "#f2f2f4" : "#111114",
				);
				expect(tok["--cream"], `${story}: monochrome neutrals must not be shadowed`).toBe(
					cell.mode === "dark" ? "#0d0d0f" : "#fafafb",
				);
			} else {
				expect(tok["--ochre"], `${story}: default brand must NOT see monochrome's --ochre`).toBe(
					"",
				);
				expect(tok["--cream"], `${story}: default neutrals expected`).toBe(
					cell.mode === "dark" ? "#181818" : "#fcfcfc",
				);
			}

			const labels = await measureLabels(page, story);
			all.push(...labels);

			for (const l of labels) {
				if (l.ratio < 4.5) {
					failures.push(
						`${story} [${l.variant}${l.active ? ",active" : ""}] "${l.text}": ${l.fg} on ${l.bg} = ${l.ratio.toFixed(3)} (stack: ${l.bgStack.join(" <- ")})`,
					);
				}
				// Dark only — see the docstring on why the asymmetry is principled.
				if (cell.mode === "dark" && !l.bgIsOpaque) {
					failures.push(
						`${story} [${l.variant}] "${l.text}": the surface behind the label is translucent (${l.bgStack[0]}), so its contrast depends on the page rather than on the component`,
					);
				}
			}
		}

		// Guards against the sweep measuring nothing, or losing the one story whose
		// page is raised — either would make every assertion above vacuous.
		expect(all.length, "the sweep measured no tab labels at all").toBeGreaterThanOrEqual(
			3 * stories.length,
		);
		if (cell.mode === "dark") {
			expect(
				all.filter((l) => l.story === RAISED_PAGE_STORY && l.variant === "pill").length,
				"the raised-page pill story was not reached, so a page-dependent regression could hide",
			).toBeGreaterThan(0);
		}

		expect(failures, "tab labels below the 4.5:1 AA floor, or on a translucent surface").toEqual(
			[],
		);
	});
}
