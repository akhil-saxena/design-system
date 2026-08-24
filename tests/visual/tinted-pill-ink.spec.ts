import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * G4. A StatusPill label on a translucent amber tint must clear the 4.5:1 AA
 * floor against the surface that is ACTUALLY painted behind it, in all four
 * brand x mode cells.
 *
 * THE DEFECT THIS LOCKS DOWN
 *
 * `[data-stage="screening"]` and `[data-stage="interviewing"]` paint
 * `rgba(245,158,11,0.10)` / `0.18` and take `color: var(--amber-ink)`. The
 * default brand flips `--amber-ink` to a light `#f5c56b` in dark mode, which is
 * correct for a tint. Charcoal aliases it to `--ink-inverse` `#161616` in BOTH
 * modes, so charcoal dark put near-black ink on a near-black page and measured
 * 1.294:1 and 1.530:1 — the second-worst readings in the charcoal sweep.
 *
 * The component declarations were never wrong; the theme's alias was. Charcoal's
 * DARK `--amber-ink` now points at its own ochre-as-text step, which fixes all
 * FOUR of the token's charcoal-dark consumers — the two pills here, plus Badge
 * `[data-tone="warning"]` (1.30 -> 6.27) and the open DatePicker trigger
 * (1.09 -> 7.53). Neither of those two is rendered by any story, in either mode.
 *
 * WHY THE RATIO ASSERTION IS NOT ENOUGH, AND WHAT THE SECOND ONE ADDS
 *
 * 1. THE RATIO, composited by hand. These are the only two nodes in the whole
 *    charcoal violation set whose backdrop is translucent, so they are the only
 *    ones whose ratio is a function of the page rather than of the component.
 *    `getComputedStyle` reports `rgba(245,158,11,0.10)` verbatim and compositing
 *    it is the entire measurement — plan 01-18 read a fill as 2.020:1 where the
 *    composited truth was 1.114:1.
 *
 * 2. THE BACKDROP IS STILL TRANSLUCENT. This is the assertion that keeps the
 *    first one honest. A future change could make these pills clear AA by giving
 *    them an opaque fill, which would be a different component and would silently
 *    retire the case this file exists to measure — the ratio would pass and the
 *    coverage would be gone. If the tint stops being a tint, this must be a
 *    deliberate edit here, not an invisible one.
 *
 * 3. THE PAGE IS VARIED ON PURPOSE. A pill measured only on `--cream` proves
 *    nothing about `--cream-3`: the pre-fix defect measured 1.178 / 1.294 / 1.397
 *    across the three stops and failed on all of them, but the Tabs bug that
 *    preceded it PASSED on `--cream` at 4.882 while failing on the other two. So
 *    every StatusPill story is swept rather than the one the violation named, and
 *    the sweep asserts how many pills it saw.
 *
 * THE BRAND IS ASSERTED AT THE PROBED ELEMENT, both halves, per E29 — a
 * charcoal-only token AND a neutral, because 01-19.1 measured `--ochre` reading
 * correctly at a node whose neutrals were shadowed underneath.
 */

const STORIES = [
	"inputs-statuspill--default",
	"inputs-statuspill--all-stages",
	"inputs-statuspill--with-chevron",
	"inputs-statuspill--non-interactive",
	"inputs-statuspill--dark-mode",
	"inputs-statuspill--status-ladder",
] as const;

/** Story-level globals win over URL globals, so this story has no light cell. */
const DARK_ONLY = new Set<string>(["inputs-statuspill--dark-mode"]);

/** The two stages whose fill is a translucent amber wash. */
const SELECTOR =
	'.ds-atom-statuspill[data-stage="screening"], .ds-atom-statuspill[data-stage="interviewing"]';

interface Pill {
	story: string;
	stage: string;
	text: string;
	fg: string;
	bg: string;
	ratio: number;
	floor: number;
	nearestIsTranslucent: boolean;
	stack: string[];
}

async function measurePills(page: import("@playwright/test").Page, story: string): Promise<Pill[]> {
	return page.evaluate(
		(arg: { storyId: string; selector: string }) => {
			type Rgb = { r: number; g: number; b: number; a: number };
			const parse = (s: string): Rgb => {
				const t = (s ?? "").trim();
				if (t === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
				const hx = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(t);
				if (hx) {
					const raw = hx[1] as string;
					const h =
						raw.length === 3
							? raw
									.split("")
									.map((c) => c + c)
									.join("")
							: raw;
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

			const scoped = arg.selector
				.split(",")
				.map((part) => `#storybook-root ${part.trim()}`)
				.join(", ");
			const out: Pill[] = [];
			for (const node of document.querySelectorAll(scoped)) {
				const el = node as HTMLElement;
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				if (r.width === 0 || r.height === 0) continue;

				// Collect every painted layer from the pill upward, stopping at the
				// first fully opaque one — nothing above it can affect the result.
				const stack: { label: string; color: Rgb }[] = [];
				let n: HTMLElement | null = el;
				while (n) {
					const bg = parse(getComputedStyle(n).backgroundColor);
					if (bg.a > 0) {
						const cls =
							typeof n.className === "string" && n.className.trim()
								? `.${n.className.trim().split(/\s+/).join(".")}`
								: "";
						stack.push({ label: `${n.tagName.toLowerCase()}${cls}`, color: bg });
						if (bg.a === 1) break;
					}
					n = n.parentElement;
				}
				const deepest = stack.at(-1);
				let bg: Rgb =
					deepest && deepest.color.a === 1 ? deepest.color : { r: 255, g: 255, b: 255, a: 1 };
				for (let i = stack.length - (deepest && deepest.color.a === 1 ? 2 : 1); i >= 0; i--) {
					bg = over((stack[i] as { color: Rgb }).color, bg);
				}
				const fgRaw = parse(cs.color);
				const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
				const px = Number.parseFloat(cs.fontSize);
				const wt = Number.parseInt(cs.fontWeight, 10) || 400;
				const large = px >= 24 || (px >= 18.66 && wt >= 700);
				const nearest = stack[0];
				out.push({
					story: arg.storyId,
					stage: el.dataset.stage ?? "?",
					text: (el.textContent ?? "").trim().slice(0, 24),
					fg: hex(fg),
					bg: hex(bg),
					ratio: Number(ratio(fg, bg).toFixed(3)),
					floor: large ? 3.0 : 4.5,
					nearestIsTranslucent: !!nearest && nearest.color.a < 1,
					stack: stack.map(
						(s) =>
							`${s.label} = rgba(${Math.round(s.color.r)},${Math.round(s.color.g)},${Math.round(s.color.b)},${s.color.a})`,
					),
				});
			}
			return out;
		},
		{ storyId: story, selector: SELECTOR },
	) as Promise<Pill[]>;
}

const CELLS = [
	{ brand: "default", mode: "light" },
	{ brand: "default", mode: "dark" },
	{ brand: "charcoal", mode: "light" },
	{ brand: "charcoal", mode: "dark" },
] as const;

for (const cell of CELLS) {
	test(`tinted StatusPill labels clear AA against their composited surface — ${cell.brand} ${cell.mode}`, async ({
		page,
	}) => {
		const stories = STORIES.filter((s) => !(cell.mode === "light" && DARK_ONLY.has(s)));
		const all: Pill[] = [];
		const failures: string[] = [];

		for (const story of stories) {
			const tok = await probeComputed(page, {
				story,
				brand: cell.brand,
				mode: cell.mode,
				selector: "#storybook-root",
				props: ["--ochre", "--cream", "--amber-ink"],
			});

			// Brand, both halves, at the probed element.
			if (cell.brand === "charcoal") {
				expect(tok["--ochre"], `${story}: charcoal must declare --ochre`).toBe(
					cell.mode === "dark" ? "#f2f2f4" : "#8e8e97",
				);
				expect(tok["--cream"], `${story}: charcoal neutrals must not be shadowed`).toBe(
					cell.mode === "dark" ? "#0d0d0f" : "#fafafb",
				);
			} else {
				expect(tok["--ochre"], `${story}: default brand must NOT see --ochre`).toBe("");
				expect(tok["--cream"], `${story}: default neutrals expected`).toBe(
					cell.mode === "dark" ? "#181818" : "#fcfcfc",
				);
			}

			// THE TOKEN CONTRACT, which is where the fix actually lives.
			//
			// tokens.css defines `--amber-ink` as the ink for a TINTED pill of the same
			// hue. Charcoal aliased it to `--ink-inverse` in BOTH modes, which is right
			// for a solid ochre fill and wrong for a wash, and that alias was the whole
			// defect. Pinning the resolved value per cell is worth more than the ratio
			// assertions below on their own, because `--amber-ink` has FOUR consumers in
			// charcoal dark and only one of them — this pill — is rendered by any story
			// at all. Badge `[data-tone="warning"]` and the open DatePicker trigger are
			// shipped states no story reaches, so no story-driven sweep, axe's or this
			// one's, can measure them. Asserting the token is the only coverage those
			// two have, which is why this is not redundant with the ratios below.
			expect(
				tok["--amber-ink"],
				`${story}: --amber-ink must be the tinted-pill ink for this cell. Charcoal dark aliasing it back to --ink-inverse is the defect this file exists for, and it would silently re-break Badge and the open DatePicker trigger too, which no story renders`,
			).toBe(
				cell.brand === "charcoal"
					? cell.mode === "dark"
						? "#a8a8ae"
						: "#0d0d0f"
					: cell.mode === "dark"
						? "#f5c56b"
						: "#92400e",
			);

			const pills = await measurePills(page, story);
			all.push(...pills);

			for (const p of pills) {
				if (p.ratio < p.floor) {
					failures.push(
						`${story} [${p.stage}] "${p.text}": ${p.fg} on ${p.bg} = ${p.ratio.toFixed(3)} < ${p.floor} (stack: ${p.stack.join(" <- ")})`,
					);
				}
				// (2) the case under test must still BE the tinted case.
				if (!p.nearestIsTranslucent) {
					failures.push(
						`${story} [${p.stage}]: the pill fill is no longer translucent (${p.stack[0]}), so this file has stopped measuring the tint-composited case it exists for`,
					);
				}
			}
		}

		// (3) floors, so a stale selector or story list cannot make this vacuous.
		//     MEASURED, not estimated: 4 pills / 2 stories per light cell and 6 / 3
		//     per dark cell. Floors rather than equalities, so adding a story is not
		//     a failure — but set from the observed numbers, because a floor guessed
		//     high fails for the wrong reason and a floor guessed low proves nothing.
		console.log(
			`[${cell.brand} ${cell.mode}] pills=${all.length} stories=${new Set(all.map((p) => p.story)).size} stages=${[...new Set(all.map((p) => p.stage))].join("+")} backdrops=${[...new Set(all.map((p) => p.bg))].join(",")}`,
		);
		expect(all.length, "the sweep measured no tinted StatusPills at all").toBeGreaterThanOrEqual(4);
		expect(
			new Set(all.map((p) => p.stage)).size,
			"both tinted stages must be reached; one of them going missing would halve the coverage silently",
		).toBe(2);
		expect(
			new Set(all.map((p) => p.story)).size,
			"too few stories contributed a pill; the story list has gone stale",
		).toBeGreaterThanOrEqual(2);
		// The pills must not all be sitting on the same page colour, or the sweep
		// says nothing about surface dependence — the exact gap that let the Tabs
		// bug pass on --cream while failing on --cream-2 and --cream-3.
		expect(
			new Set(all.map((p) => p.bg)).size,
			"every pill composited to the same backdrop, so this sweep cannot see a surface-dependent regression",
		).toBeGreaterThanOrEqual(2);

		expect(failures, "tinted StatusPill labels below the AA floor, or no longer tinted").toEqual(
			[],
		);
	});
}
