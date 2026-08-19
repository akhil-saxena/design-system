import { expect, test } from "@playwright/test";
import { probeComputed } from "./computed";

/**
 * E6 — every design-system control must be perceptible, and where its boundary
 * is a border, that border must clear WCAG SC 1.4.11's 3:1 non-text floor.
 *
 * WHY charcoal × light AND WHY A BROWSER
 *
 * Charcoal light is the worst cell in the system and the one that produced the
 * finding: `.ds-atom-input` fills with `var(--cream)`, and charcoal's light
 * `--cream` is `#F4F1EA` — the page background. Measured fill delta 1.000:1,
 * exactly zero. Its only edge was `1px solid var(--rule)` at 1.38:1, so a text
 * field on the theme whose entire admin is interactive controls had no
 * perceptible boundary at all.
 *
 * This has to run in a browser, not in jsdom, and not as a grep. Two measured
 * reasons, both of which would have let a broken fix ship green:
 *
 *   1. jsdom implements no CSS specificity (01-09 measured it) — so it cannot
 *      decide which of two rules wins.
 *   2. jsdom DROPS `border: 1px solid var(--rule)` outright — a `var()` inside a
 *      multi-value shorthand does not parse, `borderColor` comes back `""`, and
 *      `borderTopColor` sits on the UA `buttonface` forever. An inline border
 *      shorthand is therefore INVISIBLE to a jsdom assertion, which is precisely
 *      the layer E6 is about.
 *
 * That second point is not hypothetical. Button carried
 * `border: "1px solid var(--rule)"` in its inline `baseStyle` while
 * `variantStyles.secondary` carried `borderColor: "var(--wire)"`. Moving only
 * the `--wire` into the stylesheet — the obvious reading of the fix, and one
 * that satisfies both halves of a source-level grep gate — would have left the
 * inline `--rule` shorthand winning and REGRESSED secondary from 3.44:1 to
 * 1.38:1.
 *
 * That regression was reinstated deliberately and measured. Both grep gates
 * stayed green. jsdom DID notice, but only in the weak sense: the inline
 * shorthand suppresses the sheet's `border-color` in its cascade model, so
 * `getComputedStyle(el).borderColor` came back `""` rather than wrong — jsdom
 * can say "something inline is in the way" and can never say which colour the
 * button paints. The case below failed with the two colours named:
 * `secondary must paint --wire (rgb(135, 129, 115)), not --rule
 * (rgb(213, 207, 194))`, and the same in dark. That is the difference between a
 * gate that detects a shape and a gate that measures the rendered result.
 *
 * THE TWO CONDITIONS
 *
 * (1) If a control paints a border, that border clears 3:1 against the better-
 *     contrasting of its own fill and the surface behind it.
 * (2) Unconditionally, the control is perceptible at all: its fill differs from
 *     the surface behind it by more than 1.1:1, OR its border clears 3:1.
 *
 * (2) is not implied by (1). A control passes (1) vacuously by painting no
 * border; only (2) catches the regression where someone sets the border
 * `transparent` on a fill identical to the page — which is the exact shape of
 * the defect this spec exists to prevent recurring.
 *
 * Discovery follows control-chrome.spec.ts verbatim, including its
 * `expect(ids.length).toBeGreaterThan(0)` guard: a spec that iterates an empty
 * list is green and measures nothing.
 */

/**
 * Controls whose affordance is their label rather than their boundary.
 *
 * A ghost button is transparent by design and is identified by its text, which
 * SC 1.4.3 covers; giving it a 3:1 rim would make it a secondary button. Each
 * entry needs a reason, and the list may shrink but must never grow — same
 * ratchet contract as src/styling-boundary.test.ts.
 */
const LABEL_IS_THE_AFFORDANCE: Record<string, string> = {
	"ds-atom-btn":
		"variant=ghost is transparent fill + transparent border by design; its label is the control. The bordered variants are checked — secondary is the one E6 moved onto --wire.",
	"ds-atom-split": "variant=ghost, same contract as Button ghost.",
	"ds-atom-input-inner":
		"the chrome-less inner input of a decorated field. `.ds-atom-input-wrap` draws the border and the focus ring; giving the inner one too would double-rim every icon field.",
	"ds-atom-cmd-input":
		"CommandPalette's search field is border-less by design inside an already-delimited panel; the panel's own border and shadow are its boundary.",
	"ds-atom-cmd-search":
		"as above — its bottom hairline separates the search row from the results list, it is not the control's boundary.",
	"ds-atom-tabs-tab":
		"a tab is identified by its label plus the selected-state underline, not by a rim.",
	"ds-atom-iconbtn":
		'the default and ghost variants are transparent by design — an icon button in a toolbar is identified by its glyph. [data-variant="secondary"] is the bordered one, and it already bound --wire before this plan: it is the one stylesheet precedent Rule C-3 was applied from.',
	"ds-atom-pagination-btn":
		"page-number buttons are transparent; the numeral is the control, and the current page is marked by a filled [aria-current] state.",
	"ds-atom-calendar-cell":
		"a month-grid cell. Its borders ARE the grid, and the date numeral inside each cell says where the cell is — Rule C-3's 'a fill or a heading already does that job'. Rebinding these would turn the calendar into a dark spreadsheet, which is the over-application the plan's human-check warns about.",
	"ds-atom-datepicker-cell":
		"same as ds-atom-calendar-cell — a day button in a date grid, identified by its numeral.",
	"ds-atom-range-input":
		"a native range input with appearance:none; the track and thumb are drawn by ::-webkit-slider-* pseudo-elements, so the element's own border is not what the user sees.",
	"ds-atom-statuspill":
		"a status LABEL that happens to be clickable — its text is the status and is what identifies it. Its worst cell is a tone-tinted stage whose rgba fill is only 1.08:1, a tone-alpha problem rather than a --wire/--rule one; recorded as a finding rather than fixed here. The one neutral stage, wishlist, had no tint to rely on and was rebound to --wire.",
	"ds-atom-select-option":
		"a listbox option inside an already-delimited popover; its boundary is the popover's.",
};

/** Does `a` describe a worse case than `b`? Perceptibility first, then margin. */
function worse(a: Hit, b: Hit): boolean {
	const ok = (h: Hit) => h.fillDelta > 1.1 || h.borderContrast >= 3;
	if (ok(a) !== ok(b)) return !ok(a);
	return a.borderContrast < b.borderContrast;
}

interface Hit {
	cls: string;
	story: string;
	borderContrast: number;
	fillDelta: number;
	paintsBorder: boolean;
	border: string;
	fill: string;
	behind: string;
}

test("every control's boundary clears 3:1 in charcoal light", async ({ page }) => {
	await page.goto("http://localhost:6006/index.json");
	const entries = JSON.parse(await page.evaluate(() => document.body.innerText)).entries as Record<
		string,
		{ type: string }
	>;
	const ids = Object.entries(entries)
		.filter(([, e]) => e.type === "story")
		.map(([id]) => id);
	expect(ids.length, "no stories discovered — the spec would measure nothing").toBeGreaterThan(0);

	/** class → worst hit, so the report names a reproducing story per control. */
	const seen = new Map<string, Hit>();
	let wire = "";
	let rule = "";

	for (const id of ids) {
		await page.goto(
			`http://localhost:6006/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:light;brand:charcoal`,
		);
		// `attached` alone is a race, and a silent one: #storybook-root ships in
		// iframe.html's static markup, so it exists long before React renders into
		// it. Waiting only for attachment made this scan read an EMPTY document for
		// the slower stories and skip them without saying so — measured, four
		// components silently left the roster. computed.ts guards the same race for
		// the same reason. Never `visible`: Lightbox auto-opens a dialog that hides
		// the root.
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 15_000 });
		await page
			.waitForFunction(
				() => (document.querySelector("#storybook-root")?.children.length ?? 0) > 0,
				undefined,
				{ timeout: 15_000 },
			)
			.catch(() => {
				throw new Error(
					`story ${id} never rendered anything into #storybook-root; skipping it silently is how this scan would shrink without failing`,
				);
			});
		// Assert the cell rather than trusting the query parameter. A harness that
		// silently stopped applying the brand would turn every assertion below into
		// a default-brand assertion that still passed — the exact failure mode
		// computed.ts's docstring records.
		const cell = await page.evaluate(() => ({
			brand: document.documentElement.getAttribute("data-brand"),
			dark: document.documentElement.classList.contains("dark"),
		}));
		if (cell.brand !== "charcoal" || cell.dark) {
			await page.evaluate(() => {
				document.documentElement.setAttribute("data-brand", "charcoal");
				document.documentElement.classList.remove("dark");
			});
		}
		const confirmed = await page.evaluate(() => ({
			brand: document.documentElement.getAttribute("data-brand"),
			dark: document.documentElement.classList.contains("dark"),
		}));
		expect(
			confirmed,
			`story ${id} could not be put into brand=charcoal mode=light; any value read there belongs to the wrong cell`,
		).toEqual({ brand: "charcoal", dark: false });

		const hits = await page.evaluate(() => {
			const parse = (c: string): [number, number, number, number] => {
				const m = c.match(/-?[\d.]+/g);
				if (!m) return [0, 0, 0, 0];
				const [r, g, b, a] = m.map(Number);
				return [r ?? 0, g ?? 0, b ?? 0, a === undefined ? 1 : a];
			};
			const over = (
				fg: [number, number, number, number],
				bg: [number, number, number, number],
			): [number, number, number, number] => [
				fg[3] * fg[0] + (1 - fg[3]) * bg[0],
				fg[3] * fg[1] + (1 - fg[3]) * bg[1],
				fg[3] * fg[2] + (1 - fg[3]) * bg[2],
				1,
			];
			const lum = ([r, g, b]: [number, number, number, number]) => {
				const f = (v: number) => {
					const s = v / 255;
					return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
				};
				return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
			};
			const ratio = (a: [number, number, number, number], b: [number, number, number, number]) => {
				const la = lum(a);
				const lb = lum(b);
				const x = Math.max(la, lb);
				const y = Math.min(la, lb);
				return (x + 0.05) / (y + 0.05);
			};
			/** Opaque colour actually painted behind `el`, compositing ancestors. */
			const behindOf = (el: Element): [number, number, number, number] => {
				let acc: [number, number, number, number] | null = null;
				let node: Element | null = el.parentElement;
				while (node) {
					const c = parse(getComputedStyle(node).backgroundColor);
					if (c[3] > 0) acc = acc === null ? c : over(acc, c);
					if (acc !== null && acc[3] >= 1) return acc;
					node = node.parentElement;
				}
				// Nothing opaque declared anywhere up the tree: the canvas is white.
				return acc === null ? [255, 255, 255, 1] : over(acc, [255, 255, 255, 1]);
			};

			// Resolve the two tokens through the live cascade rather than hardcoding
			// a hex, so this asserts "binds --wire" and not "happens to be #878173".
			const probe = document.createElement("span");
			document.documentElement.appendChild(probe);
			const resolve = (token: string) => {
				probe.style.color = `var(${token})`;
				return getComputedStyle(probe).color;
			};
			const tokens = { wire: resolve("--wire"), rule: resolve("--rule") };
			probe.remove();

			const out: Record<string, unknown>[] = [];
			for (const el of document.querySelectorAll("button, input, select, textarea")) {
				const cls = [...el.classList].find((c) => c.startsWith("ds-"));
				if (!cls) continue;
				// A story that demonstrates dark mode wraps its content in `.dark`, so its
				// controls are NOT in the cell this spec measures: they resolve the dark
				// token block, and in a brand-less demo they resolve the DEFAULT theme's
				// dark values rather than charcoal's. Reading them here reports a
				// dark-mode number as a charcoal-light failure.
				if (el.closest(".dark")) continue;
				const cs = getComputedStyle(el);
				// Checkbox, Radio and Toggle hide the native input and draw the control
				// with a sibling element. Measuring the hidden input measures nothing the
				// user can see, and its UA border reads as a bogus 1.2:1.
				const box = el.getBoundingClientRect();
				if (
					box.width === 0 ||
					box.height === 0 ||
					cs.visibility === "hidden" ||
					cs.display === "none" ||
					Number.parseFloat(cs.opacity) === 0
				)
					continue;
				const behind = behindOf(el);
				const fill = over(parse(cs.backgroundColor), behind);
				const bw = Number.parseFloat(cs.borderTopWidth) || 0;
				const bs = cs.borderTopStyle;
				const bc = parse(cs.borderTopColor);
				const paintsBorder = bw > 0 && bs !== "none" && bs !== "hidden" && bc[3] > 0;
				const painted = over(bc, fill);
				const borderContrast = Math.max(ratio(painted, fill), ratio(painted, behind));
				out.push({
					cls,
					borderContrast: Math.round(borderContrast * 100) / 100,
					fillDelta: Math.round(ratio(fill, behind) * 100) / 100,
					paintsBorder,
					border: cs.borderTopColor,
					fill: cs.backgroundColor,
					behind: `rgb(${behind.slice(0, 3).map(Math.round).join(", ")})`,
				});
			}
			return { out, tokens };
		});

		wire = hits.tokens.wire;
		rule = hits.tokens.rule;
		for (const h of hits.out as unknown as Omit<Hit, "story">[]) {
			const prev = seen.get(h.cls);
			// Worst case per class, not the first one found. `.ds-atom-statuspill`
			// has seven stages and `.ds-atom-btn` four variants behind one class
			// name; keeping the first hit would spot-check whichever story sorted
			// earliest and call the component clean.
			if (!prev || worse({ ...h, story: id }, prev)) seen.set(h.cls, { ...h, story: id });
		}
	}

	const controls = [...seen.values()];
	expect(
		controls.length,
		"no ds-* control elements were found in any story — the assertions below would be vacuous",
	).toBeGreaterThan(0);

	const allowed = (c: Hit) => c.cls in LABEL_IS_THE_AFFORDANCE;
	const checked = controls.map((c) => c.cls).sort();
	const roster = `Checked ${controls.length} controls across ${ids.length} stories: ${checked.join(", ")}`;
	expect(
		wire,
		"the --wire token did not resolve — every comparison below would be vacuous",
	).toMatch(/^rgb/);
	expect(rule).toMatch(/^rgb/);
	expect(wire, "--wire and --rule resolved to the same colour").not.toBe(rule);

	// (1) Rule C-3. A control whose fill does not delimit it is relying on its
	// border, and that border must clear SC 1.4.11's 3:1 non-text floor.
	const relying = controls.filter((c) => c.fillDelta <= 1.1 && !allowed(c));
	const weakBorder = relying
		.filter((c) => c.borderContrast < 3)
		.map(
			(c) =>
				`${c.cls} ${c.borderContrast}:1 (border ${c.border} on ${c.fill} over ${c.behind}) e.g. ${c.story}`,
		);
	expect(
		relying.length,
		"no control was found relying on its border — condition (1) would be vacuous",
	).toBeGreaterThan(0);
	expect
		.soft(
			weakBorder,
			[
				"SC 1.4.11: these controls have no fill to delimit them and a border below 3:1, in charcoal light.",
				`  ${weakBorder.join("\n  ")}`,
				roster,
			].join("\n"),
		)
		.toEqual([]);

	// (2) Perceptible at all. Restates (1) without reference to the border, so it
	// also catches the regression where a border is set `transparent` on a fill
	// identical to the page — the shape E6 measured at 1.000:1 + 1.38:1.
	const invisible = controls
		.filter((c) => c.fillDelta <= 1.1 && c.borderContrast < 3 && !allowed(c))
		.map(
			(c) =>
				`${c.cls} fill ${c.fillDelta}:1 + border ${c.borderContrast}:1 (${c.fill} over ${c.behind}) e.g. ${c.story}`,
		);
	expect
		.soft(
			invisible,
			[
				"These controls are imperceptible in charcoal light — the fill matches the page AND the border is below 3:1.",
				`  ${invisible.join("\n  ")}`,
				roster,
			].join("\n"),
		)
		.toEqual([]);

	// (3) The named controls bind --wire specifically, not merely something that
	// happens to clear 3:1. This is the assertion that catches the regression the
	// docstring describes: an inline `border: 1px solid var(--rule)` shorthand
	// outranking the stylesheet leaves a control at --rule, and --rule at 1.38:1
	// fails here by name rather than by a number a reader has to interpret.
	const MUST_BIND_WIRE = [
		"ds-atom-input",
		"ds-atom-textarea",
		"ds-atom-select",
		"ds-atom-multiselect",
		"ds-atom-copy",
		"ds-atom-fileinput",
		"ds-atom-datepicker-trigger",
	];
	const missing = MUST_BIND_WIRE.filter((c) => !seen.has(c));
	expect(
		missing,
		`these controls were never rendered by any story, so their token could not be checked: ${missing.join(", ")}`,
	).toEqual([]);
	const wrongToken = MUST_BIND_WIRE.map((c) => seen.get(c) as Hit)
		.filter((c) => c.border !== wire)
		.map(
			(c) =>
				`${c.cls} border ${c.border}, expected --wire ${wire} (--rule is ${rule}) e.g. ${c.story}`,
		);
	expect
		.soft(
			wrongToken,
			["These controls must bind --wire and do not:", `  ${wrongToken.join("\n  ")}`, roster].join(
				"\n",
			),
		)
		.toEqual([]);

	console.log(`control-boundary: ${roster}\n  --wire=${wire}  --rule=${rule}`);
});

/**
 * Button secondary, specifically — the one control whose --wire was already
 * correct and merely in the wrong layer.
 *
 * The scan above keys on the first `ds-` class, and all four Button variants
 * share `ds-atom-btn`, so `variant="secondary"` cannot be isolated there. It
 * needs its own case, because it is the single highest-risk edit in this plan:
 * `baseStyle` carried `border: 1px solid var(--rule)` inline, so deleting
 * `borderColor: "var(--wire)"` from `variantStyles` without also moving the base
 * border would have silently swapped secondary from 3.44:1 to 1.38:1 while both
 * halves of a source-level grep gate stayed green — and while jsdom, which drops
 * `var()` inside a border shorthand entirely, reported no change either.
 *
 * Checked in both modes: --wire is 3.44:1 on charcoal light and 3.72:1 on
 * charcoal dark, and the dark-mode secondary rules are separate declarations.
 */
for (const mode of ["light", "dark"] as const) {
	test(`Button secondary binds --wire from the stylesheet (charcoal ${mode})`, async ({ page }) => {
		const read = await probeComputed(page, {
			story: "inputs-button--variants",
			brand: "charcoal",
			mode,
			selector: '.ds-atom-btn[data-variant="secondary"]',
			props: ["border-top-color", "border-top-width", "border-top-style", "--wire", "--rule"],
		});
		const wire = read["--wire"];
		expect(wire, "--wire is not declared in this cell").not.toBe("");
		expect(read["--wire"]).not.toBe(read["--rule"]);
		// The border is still painted — a fix that removed it would pass a colour
		// assertion vacuously if the colour were never used.
		expect(read["border-top-style"]).toBe("solid");
		expect(Number.parseFloat(read["border-top-width"] ?? "0")).toBeGreaterThan(0);

		const probe = await page.evaluate(
			(tokens: string[]) => {
				const el = document.createElement("span");
				document.documentElement.appendChild(el);
				const out = tokens.map((t) => {
					el.style.color = `var(${t})`;
					return getComputedStyle(el).color;
				});
				el.remove();
				return out;
			},
			["--wire", "--rule"],
		);
		expect(
			read["border-top-color"],
			`secondary must paint --wire (${probe[0]}), not --rule (${probe[1]})`,
		).toBe(probe[0] ?? "");
	});
}
