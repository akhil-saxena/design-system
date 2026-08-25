import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * G1. Ink on a full-strength accent fill must clear the 4.5:1 AA text floor in
 * every brand x mode cell.
 *
 * THE DEFECT THIS LOCKS DOWN
 *
 * Two declarations pinned `color: #1c1917` on a `background: var(--amber)` fill:
 * `.ds-atom-split-primary[data-variant="primary"]` and
 * `.ds-atom-datepicker-cell.is-selected`. That hex IS the default brand's
 * `--ink-inverse`, so `[data-brand="monochrome"]` could never override it. Monochrome
 * maps `--amber` to `--ochre` `#b0722a`, where `#1c1917` measures 4.402 and
 * monochrome's own `--ink-inverse` `#161616` measures 4.555. Twelve stories failed
 * `DS_BRAND=monochrome npm run test:a11y` on exactly this, at exactly 4.402, and it
 * is the same defect `004254f` had already fixed one component over in Tabs.
 *
 * WHY A SPEC AND NOT A GREP
 *
 * A grep for `#1c1917` cannot tell a live declaration from the paragraph above,
 * and this phase has already shipped a gate that `grep -qi 'brand'` satisfied
 * from a comment while the brand threading underneath was broken. This measures
 * the rendered cascade instead.
 *
 * THE FOUR ASSERTIONS, AND WHY NONE IS SUFFICIENT ALONE
 *
 * 1. THE RATIO, composited by hand. `getComputedStyle` does not composite --
 *    plan 01-18 read a fill as 2.020:1 where the composited truth was 1.114:1.
 *
 * 2. THE FILL IS ACTUALLY THE ACCENT. A ratio assertion alone would pass if the
 *    element stopped being painted with the accent at all -- a regression that
 *    removed `background: var(--amber)` would make every ratio comfortable and
 *    every assertion vacuous. So the composited backdrop is required to BE the
 *    brand's accent hex.
 *
 * 3. THE PSEUDO-PAINTED ENDPOINTS WERE REACHED. `.is-range-start` /
 *    `.is-range-end` paint their ochre pill with a `::before`, and axe-core
 *    reports them `incomplete` ("background could not be determined due to a
 *    pseudo element") rather than as violations -- so the shipping a11y gate has
 *    never measured them in either direction. They inherit their ink from
 *    `.is-selected`, which means they carry this exact defect invisibly. This
 *    assertion is the reason the spec reaches further than axe does, and it is
 *    asserted as a COUNT so that a future change which stops painting the pill
 *    with a pseudo-element goes red rather than silently dropping the coverage.
 *
 * 4. NODE-COUNT FLOORS, per cell. E34 survived 34 tests because every one
 *    focused the first tile, so "the tile picked up" and "the first tile" were
 *    indistinguishable. A selector that silently matched nothing would turn this
 *    file into a tautology, so each cell asserts how many nodes it saw.
 *
 * THE BRAND IS ASSERTED AT THE PROBED ELEMENT, both halves, per E29. `--ochre` is
 * declared only in `src/themes/monochrome.css`, so reading it proves the brand
 * layer reached the node; but 01-19.1 measured `--ochre` reading CORRECTLY at a
 * node whose neutrals were shadowed underneath, so a neutral is asserted too.
 */

/** Every story of the two components that carry the defect, plus DateRangePicker. */
const STORIES = [
	"interaction-splitbutton--default",
	"interaction-splitbutton--tones",
	"interaction-splitbutton--variants",
	"interaction-splitbutton--per-action-variant",
	"interaction-splitbutton--sizes",
	"interaction-splitbutton--with-icons",
	"interaction-splitbutton--dark-mode",
	"inputs-datepicker--default",
	"inputs-datepicker--with-events",
	"inputs-datepicker--disable-past",
	"inputs-datepicker--with-time-picker",
	"inputs-datepicker--popover-variant",
	"inputs-datepicker--playground",
	"inputs-datepicker--dark-mode",
	"inputs-daterangepicker--default",
	"inputs-daterangepicker--disable-past",
	"inputs-daterangepicker--playground",
	"inputs-daterangepicker--dark-mode",
] as const;

/** Story-level globals win over URL globals, so these have no light cell. */
const DARK_ONLY = new Set<string>([
	"interaction-splitbutton--dark-mode",
	"inputs-datepicker--dark-mode",
	"inputs-daterangepicker--dark-mode",
]);

/**
 * The text-bearing elements that sit on a full-strength accent fill. The
 * SplitButton chevron is included even though it holds only an icon: it carries
 * the same declaration, and a future change that puts a character in it must not
 * be the moment this is first measured.
 */
const SELECTOR = [
	'.ds-atom-split-primary[data-variant="primary"]',
	'.ds-atom-split-chevron[data-variant="primary"]',
	".ds-atom-datepicker-cell.is-selected .ds-atom-datepicker-cell-num",
].join(", ");

/**
 * The accent each brand paints these fills with, per cell.
 *
 * Monochrome is per-MODE since 01-22. Its accent used to be one ochre in both
 * modes; the near-monochrome accent is a light neutral that inverts with the
 * mode while --ink-inverse deliberately does not, which is the whole reason
 * a filled control still carries dark ink in both.
 */
const ACCENT: Record<string, Record<string, string>> = {
	monochrome: { light: "#111114", dark: "#f2f2f4" },
	default: { light: "#f59e0b", dark: "#f59e0b" },
};

interface Node {
	story: string;
	/** Which of the three covered declarations painted this node. */
	kind: "split-primary" | "split-chevron" | "datepicker-num" | "other";
	text: string;
	fg: string;
	bg: string;
	ratio: number;
	large: boolean;
	floor: number;
	pseudoSource: string | null;
	stack: string[];
}

async function measureAccentInk(
	page: import("@playwright/test").Page,
	story: string,
	selector: string,
): Promise<Node[]> {
	return page.evaluate(
		(arg: { storyId: string; selector: string }) => {
			type Rgb = { r: number; g: number; b: number; a: number };
			/** Throws rather than returning zeros: a parser that silently yields black
			 *  turns every ratio into a confident lie. */
			const parse = (s: string): Rgb => {
				const t = (s ?? "").trim();
				if (t === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
				const hx = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(t);
				if (hx) {
					const h =
						(hx[1] as string).length === 3
							? (hx[1] as string)
									.split("")
									.map((c) => c + c)
									.join("")
							: (hx[1] as string);
					const n = Number.parseInt(h, 16);
					return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
				}
				const m = /^rgba?\(([^)]*)\)$/.exec(t);
				if (!m) throw new Error(`unparseable colour ${JSON.stringify(s)}`);
				const p = (m[1] ?? "")
					.split(/[,\s/]+/)
					.filter(Boolean)
					.map(Number);
				if (p.length < 3 || p.slice(0, 3).some((v) => Number.isNaN(v))) {
					throw new Error(`bad channels in ${JSON.stringify(s)}`);
				}
				return {
					r: p[0] as number,
					g: p[1] as number,
					b: p[2] as number,
					a: p.length > 3 ? (p[3] as number) : 1,
				};
			};
			const lin = (c: number) => {
				const v = c / 255;
				return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
			};
			const lum = (c: Rgb) => {
				const L = 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
				if (Number.isNaN(L)) throw new Error("NaN luminance");
				return L;
			};
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

			/**
			 * Composites the backdrop down to the first opaque layer, treating an
			 * inset absolutely-positioned pseudo-element as a real painted layer.
			 * That pseudo case is the whole point: it is what axe declines to judge.
			 */
			const backdropOf = (el: Element) => {
				const stack: { label: string; color: Rgb }[] = [];
				let pseudoSource: string | null = null;
				let n: Element | null = el;
				const cls = (x: Element) =>
					typeof x.className === "string" && x.className.trim()
						? `.${x.className.trim().split(/\s+/).join(".")}`
						: "";
				while (n) {
					for (const which of ["::before", "::after"]) {
						const ps = getComputedStyle(n, which);
						if (ps.content === "none" || ps.content === "normal") continue;
						if (ps.position !== "absolute" && ps.position !== "fixed") continue;
						const z = ps.zIndex === "auto" ? 0 : Number(ps.zIndex);
						if (Number.isNaN(z) || z < 0) continue;
						let pc: Rgb;
						try {
							pc = parse(ps.backgroundColor);
						} catch {
							continue;
						}
						if (pc.a === 0) continue;
						stack.push({ label: `${n.tagName.toLowerCase()}${cls(n)}${which}`, color: pc });
						pseudoSource ??= `${n.tagName.toLowerCase()}${which}`;
						if (pc.a === 1) return done(stack, pseudoSource);
					}
					let bg: Rgb | null = null;
					try {
						bg = parse(getComputedStyle(n).backgroundColor);
					} catch {
						bg = null;
					}
					if (bg && bg.a > 0) {
						stack.push({ label: `${n.tagName.toLowerCase()}${cls(n)}`, color: bg });
						if (bg.a === 1) return done(stack, pseudoSource);
					}
					n = n.parentElement;
				}
				return done(stack, pseudoSource);
			};
			function done(stack: { label: string; color: Rgb }[], pseudoSource: string | null) {
				const deepest = stack.at(-1);
				let bg: Rgb =
					deepest && deepest.color.a === 1 ? deepest.color : { r: 255, g: 255, b: 255, a: 1 };
				for (let i = stack.length - (deepest && deepest.color.a === 1 ? 2 : 1); i >= 0; i--) {
					bg = over((stack[i] as { color: Rgb }).color, bg);
				}
				return { bg, stack, pseudoSource };
			}

			const out: Node[] = [];
			// Each comma-separated part is scoped individually: `querySelectorAll`
			// applies a prefix only to the FIRST part of a selector list, so
			// `#storybook-root a, b` would match `b` anywhere in the document —
			// including portalled content that is not the component under test.
			const scoped = arg.selector
				.split(",")
				.map((part) => `#storybook-root ${part.trim()}`)
				.join(", ");
			for (const node of document.querySelectorAll(scoped)) {
				const el = node as HTMLElement;
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				if (r.width === 0 || r.height === 0) continue;
				if (cs.visibility === "hidden" || cs.display === "none") continue;
				const { bg, stack, pseudoSource } = backdropOf(el);
				const fgRaw = parse(cs.color);
				const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
				const px = Number.parseFloat(cs.fontSize);
				const wt = Number.parseInt(cs.fontWeight, 10) || 400;
				const large = px >= 24 || (px >= 18.66 && wt >= 700);
				const kind = el.classList.contains("ds-atom-split-primary")
					? "split-primary"
					: el.classList.contains("ds-atom-split-chevron")
						? "split-chevron"
						: el.classList.contains("ds-atom-datepicker-cell-num")
							? "datepicker-num"
							: "other";
				out.push({
					story: arg.storyId,
					kind,
					text: (el.textContent ?? "").trim().slice(0, 24),
					fg: hex(fg),
					bg: hex(bg),
					ratio: Number(ratio(fg, bg).toFixed(3)),
					large,
					floor: large ? 3.0 : 4.5,
					pseudoSource,
					stack: stack.map((s) => s.label),
				});
			}
			return out;
		},
		{ storyId: story, selector },
	) as Promise<Node[]>;
}

const CELLS = [
	{ brand: "default", mode: "light" },
	{ brand: "default", mode: "dark" },
	{ brand: "monochrome", mode: "light" },
	{ brand: "monochrome", mode: "dark" },
] as const;

for (const cell of CELLS) {
	test(`ink on an accent fill clears AA — ${cell.brand} ${cell.mode}`, async ({ page }) => {
		const stories = STORIES.filter((s) => !(cell.mode === "light" && DARK_ONLY.has(s)));
		const all: Node[] = [];
		const failures: string[] = [];

		for (const story of stories) {
			// Drives the cell and asserts <html> reached it. The selector is passed as
			// something guaranteed present so a story that renders no accent fill (a
			// closed popover, a range picker with nothing selected) is not an error
			// here — the node-count floors below are what catch a vacuous sweep.
			const tok = await probeComputed(page, {
				story,
				brand: cell.brand,
				mode: cell.mode,
				selector: "#storybook-root",
				props: ["--ochre", "--cream", "--ink-inverse"],
			});

			// Brand, both halves, at the probed element.
			if (cell.brand === "monochrome") {
				expect(tok["--ochre"], `${story}: monochrome must declare --ochre`).toBe(
					cell.mode === "dark" ? "#f2f2f4" : "#111114",
				);
				expect(tok["--cream"], `${story}: monochrome neutrals must not be shadowed`).toBe(
					cell.mode === "dark" ? "#0d0d0f" : "#fafafb",
				);
				// --ink-inverse INVERTS under monochrome since the monochrome-accent repair:
				// it inks the accent fill, and the accent fill inverts. Asserting one
				// value here is what would go green on a theme that quietly re-pinned it
				// and put near-black ink back on a near-black button.
				expect(tok["--ink-inverse"], `${story}: monochrome --ink-inverse`).toBe(
					cell.mode === "dark" ? "#0d0d0f" : "#fafafb",
				);
			} else {
				expect(tok["--ochre"], `${story}: default brand must NOT see --ochre`).toBe("");
				expect(tok["--cream"], `${story}: default neutrals expected`).toBe(
					cell.mode === "dark" ? "#181818" : "#fcfcfc",
				);
				expect(tok["--ink-inverse"], `${story}: default --ink-inverse`).toBe("#1c1917");
			}

			const nodes = await measureAccentInk(page, story, SELECTOR);
			all.push(...nodes);

			for (const n of nodes) {
				// (1) the ratio
				if (n.ratio < n.floor) {
					failures.push(
						`${story} "${n.text}": ${n.fg} on ${n.bg} = ${n.ratio.toFixed(3)} < ${n.floor} (stack: ${n.stack.join(" <- ")})`,
					);
				}
				// (2) the fill really is the accent, so a ratio cannot pass by the
				//     element having stopped being an accent fill at all.
				if (n.bg !== ACCENT[cell.brand]?.[cell.mode]) {
					failures.push(
						`${story} "${n.text}": backdrop composited to ${n.bg}, expected the brand accent ${ACCENT[cell.brand]?.[cell.mode]} (stack: ${n.stack.join(" <- ")})`,
					);
				}
			}
		}

		// (4) node-count floors, PER DECLARATION rather than in total.
		//
		// A single total was measurably too weak: replacing the
		// `.ds-atom-split-primary` selector with a class that does not exist left
		// both DARK cells green, because the DatePicker nodes alone cleared the
		// total. Losing coverage of one of the three declarations has to be red in
		// every cell, not in half of them.
		const tally = (k: Node["kind"]) => all.filter((n) => n.kind === k).length;
		for (const kind of ["split-primary", "split-chevron", "datepicker-num"] as const) {
			expect(
				tally(kind),
				`no ${kind} node was measured in this cell — the selector or the story list has gone stale, and every ratio assertion above is vacuous for that declaration`,
			).toBeGreaterThanOrEqual(2);
		}
		expect(
			new Set(all.map((n) => n.story)).size,
			"too few stories contributed a node; a selector or a story list has quietly gone stale",
		).toBeGreaterThanOrEqual(cell.mode === "dark" ? 6 : 8);
		expect(tally("other"), "an unclassified node was measured; the kind mapping is stale").toBe(0);
		// Recorded so a future reader can see what the floors are actually clearing.
		console.log(
			`[${cell.brand} ${cell.mode}] split-primary=${tally("split-primary")} split-chevron=${tally("split-chevron")} datepicker-num=${tally("datepicker-num")} stories=${new Set(all.map((n) => n.story)).size} viaPseudo=${all.filter((n) => n.pseudoSource !== null).length}`,
		);

		// (3) the pseudo-painted range endpoints were reached. axe reports these
		//     `incomplete`, so without this the two worst-observed nodes in the set
		//     would be measured by nothing at all.
		const viaPseudo = all.filter((n) => n.pseudoSource !== null);
		expect(
			viaPseudo.length,
			"no accent fill painted by a pseudo-element was measured; the DateRangePicker range endpoints are the cases axe reports as `incomplete` and this spec exists to cover them",
		).toBeGreaterThanOrEqual(2);

		expect(failures, "ink on an accent fill below the AA floor, or not on the accent").toEqual([]);
	});
}
