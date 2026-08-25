import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * G5. A rule that PINS a background must also pin its foreground.
 *
 * THE DEFECT THIS LOCKS DOWN
 *
 * `.ds-atom-richtext-surface .ProseMirror mark` declared `background: #fef08a`
 * — a pale yellow no brand or mode can move — and `color: inherit`. So the
 * foreground followed the page while the background did not. In dark mode the
 * inherited ink is near-white, and the highlighted word disappeared: 1.061:1
 * under charcoal, 1.006:1 under the default brand.
 *
 * WHY THE DEFAULT BRAND MATTERS HERE, AND WHY NOBODY SAW IT
 *
 * The charcoal triage recorded this as charcoal-specific, on the evidence that
 * the same story is clean under `brand: default`. It is not. The default brand
 * measures 1.006:1 — WORSE than charcoal — and the reason the gate is green is
 * that axe-core refuses to judge a ratio that rounds to 1.00: it returns
 * `incomplete` with messageKey `equalRatio` rather than a violation, and
 * `checkA11y` only fails on violations. A defect that is bad enough to round to
 * 1.00 is therefore INVISIBLE to the a11y gate in every brand, which is the
 * opposite of the failure mode anyone would guess.
 *
 * THE TWO ASSERTIONS, AND WHY THE SECOND IS THE IMPORTANT ONE
 *
 * 1. THE RATIO, in all four brand x mode cells. Necessary, and on its own it is
 *    a check that a specific number improved.
 *
 * 2. THE INK DOES NOT MOVE BETWEEN MODES. This is the invariant the defect
 *    actually broke, stated in a form that does not depend on any hex clearing
 *    any threshold: if the background is pinned across modes, the foreground must
 *    be too. A reintroduced `color: inherit` fails this even in a hypothetical
 *    palette where both modes happened to clear 4.5, and it fails for the right
 *    reason — the ink followed the page. Assertion (1) alone would let a future
 *    theme reintroduce `inherit` and stay green until some unrelated neutral
 *    moved.
 *
 * THE BACKGROUND IS ASSERTED PINNED, too. Both assertions above are about a
 * pinned surface; if the surface stops being pinned this file is measuring
 * something else, and that should be a deliberate edit rather than a silent
 * change of subject.
 */

/** Every RichText story that renders a highlight mark. */
const STORIES = [
	"interaction-richtext--default",
	"interaction-richtext--read-only",
	"interaction-richtext--playground",
	"interaction-richtext--dark-mode",
] as const;

/** Story-level globals win over URL globals, so this story has no light cell. */
const DARK_ONLY = new Set<string>(["interaction-richtext--dark-mode"]);

const SELECTOR = ".ds-atom-richtext-surface .ProseMirror mark";

/** The pinned highlight. If this moves, the file is measuring a new component. */
const PINNED_BG = "#fef08a";

/**
 * The ink the mark PINS, now one literal for every brand and mode.
 *
 * This used to read `--ink-inverse` per brand, on the premise that the token was
 * mode-independent in both. That premise died with the monochrome-accent repair:
 * --ink-inverse inks the accent fill, the accent fill inverts with the mode, and
 * so does the token. Reaching for it here would have put #fafafb on this pale
 * yellow at 1.12 — a fresh instance of the exact defect this file was written to
 * lock down, arriving through the token that was standing in for the rule.
 *
 * So the rule is now applied to itself: a pinned background pins its foreground,
 * with a literal, and no token gets to move underneath it. The value is what the
 * default brand already resolved --ink-inverse to, so that brand is unchanged.
 */
const INK: Record<string, string> = { charcoal: "#1c1917", default: "#1c1917" };

/** `--ink`, which DOES flip — the reason a pinned surface cannot inherit. */
const FLIPPING_INK: Record<string, Record<string, string>> = {
	charcoal: { light: "#111114", dark: "#f2f2f4" },
	default: { light: "#1c1c1a", dark: "#ededed" },
};

interface Mark {
	story: string;
	text: string;
	fg: string;
	bg: string;
	ratio: number;
	floor: number;
}

async function measureMarks(page: import("@playwright/test").Page, story: string): Promise<Mark[]> {
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

			const out: Mark[] = [];
			for (const node of document.querySelectorAll(`#storybook-root ${arg.selector}`)) {
				const el = node as HTMLElement;
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				if (r.width === 0 || r.height === 0) continue;
				const bgRaw = parse(cs.backgroundColor);
				// The mark's own fill is opaque by declaration; if that ever changes,
				// the pinned-background assertion below is what catches it.
				const bg = bgRaw.a < 1 ? over(bgRaw, { r: 255, g: 255, b: 255, a: 1 }) : bgRaw;
				const fgRaw = parse(cs.color);
				const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
				const px = Number.parseFloat(cs.fontSize);
				const wt = Number.parseInt(cs.fontWeight, 10) || 400;
				const large = px >= 24 || (px >= 18.66 && wt >= 700);
				out.push({
					story: arg.storyId,
					text: (el.textContent ?? "").trim().slice(0, 24),
					fg: hex(fg),
					bg: hex(bg),
					ratio: Number(ratio(fg, bg).toFixed(3)),
					floor: large ? 3.0 : 4.5,
				});
			}
			return out;
		},
		{ storyId: story, selector: SELECTOR },
	) as Promise<Mark[]>;
}

const BRANDS = ["default", "charcoal"] as const;
const MODES = ["light", "dark"] as const;

for (const brand of BRANDS) {
	test(`the pinned highlight keeps a pinned ink, and clears AA — ${brand}`, async ({ page }) => {
		const seen: Record<string, Mark[]> = {};
		const failures: string[] = [];

		for (const mode of MODES) {
			const stories = STORIES.filter((s) => !(mode === "light" && DARK_ONLY.has(s)));
			seen[mode] = [];
			for (const story of stories) {
				const tok = await probeComputed(page, {
					story,
					brand,
					mode,
					selector: "#storybook-root",
					props: ["--ochre", "--cream", "--ink-inverse", "--ink"],
				});

				// Brand, both halves, at the probed element.
				if (brand === "charcoal") {
					expect(tok["--ochre"], `${story}/${mode}: charcoal must declare --ochre`).toBe(
						mode === "dark" ? "#f2f2f4" : "#111114",
					);
					expect(tok["--cream"], `${story}/${mode}: charcoal neutrals not shadowed`).toBe(
						mode === "dark" ? "#0d0d0f" : "#fafafb",
					);
				} else {
					expect(tok["--ochre"], `${story}/${mode}: default must NOT see --ochre`).toBe("");
					expect(tok["--cream"], `${story}/${mode}: default neutrals expected`).toBe(
						mode === "dark" ? "#181818" : "#fcfcfc",
					);
				}
				// The premise of the whole fix: --ink FLIPS between modes, so a mark
				// that inherits its foreground is unsafe. If --ink stopped flipping,
				// `color: inherit` would no longer be dangerous and this file would be
				// testing nothing.
				expect(
					tok["--ink"],
					`${story}/${mode}: --ink must flip between modes or this spec is vacuous`,
				).toBe(FLIPPING_INK[brand]?.[mode]);
				// And the ANTI-premise, which is new: --ink-inverse is no longer a
				// mode-independent near-black under charcoal, so it is no longer a
				// safe ink for a pinned surface. Asserted rather than assumed,
				// because the tempting "simplification" here is to point the mark
				// back at it — and that would paint #fafafb on #fef08a at 1.12.
				if (brand === "charcoal") {
					expect(
						tok["--ink-inverse"],
						`${story}/${mode}: charcoal --ink-inverse inverts with the accent fill, which is exactly why the mark must not read it`,
					).toBe(mode === "dark" ? "#0d0d0f" : "#fafafb");
				}

				const marks = await measureMarks(page, story);
				expect(
					marks.length,
					`${story}/${mode}: no highlight mark was found, so every assertion about it is vacuous`,
				).toBeGreaterThanOrEqual(1);
				seen[mode]?.push(...marks);

				for (const m of marks) {
					// (1) the ratio
					if (m.ratio < m.floor) {
						failures.push(
							`${story}/${mode} "${m.text}": ${m.fg} on ${m.bg} = ${m.ratio.toFixed(3)} < ${m.floor}`,
						);
					}
					// the surface must still be the pinned one
					if (m.bg !== PINNED_BG) {
						failures.push(
							`${story}/${mode} "${m.text}": highlight background is ${m.bg}, not the pinned ${PINNED_BG} — this spec is no longer measuring a pinned surface`,
						);
					}
				}
			}
		}

		// (2) THE INVARIANT: a pinned background demands a pinned ink. Stated as a
		//     comparison between the two modes so it holds without reference to any
		//     threshold, and so a reintroduced `color: inherit` fails for the right
		//     reason rather than by happening to drop below 4.5.
		const inks = (mode: string) => [...new Set((seen[mode] ?? []).map((m) => m.fg))];
		expect(inks("light"), "the highlight ink is not single-valued in light mode").toHaveLength(1);
		expect(inks("dark"), "the highlight ink is not single-valued in dark mode").toHaveLength(1);
		expect(
			inks("dark")[0],
			`the highlight ink moved between modes (light ${inks("light")[0]} vs dark ${inks("dark")[0]}) while its background stayed pinned at ${PINNED_BG} — that is the "pin the surface, inherit the text" defect, whatever the ratios happen to be`,
		).toBe(inks("light")[0]);

		expect(
			failures,
			"highlight marks below the AA floor, or no longer on a pinned surface",
		).toEqual([]);
	});
}
