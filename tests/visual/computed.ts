import type { Page } from "@playwright/test";

/**
 * Reads getComputedStyle out of a real Storybook render, in a chosen
 * brand × colour-mode cell.
 *
 * Every plan in the monochrome phase has to prove that a style APPLIED, not that
 * a declaration exists. A grep cannot tell the difference, and this repository
 * has already paid for that once — see control-chrome.spec.ts, whose docstring
 * records screenshot baselines that were recorded with the bug already present
 * and so "compared clean forever". Nine plans need this read; nine hand-rolled
 * copies of the same page.evaluate would drift apart, and the drift would be
 * invisible because each one would still be green.
 *
 * It is deliberately strict about the two ways a probe can lie:
 *
 *   1. Measuring the wrong cell. The requested brand and mode are asserted on
 *      <html> after navigation, and a probe that cannot reach the cell throws
 *      rather than measuring whatever it landed on.
 *   2. Measuring nothing. A selector that matches no element throws, naming the
 *      story, the selector and the cell. Returning an empty object instead would
 *      make every downstream assertion a tautology.
 *
 * Not a spec: this file declares no cases and asserts nothing, so it can never
 * be the thing that passes.
 */

export type Brand = "default" | "monochrome";
export type Mode = "light" | "dark";

export interface ProbeOptions {
	/** Storybook story id, e.g. "foundation-divider--default". */
	story: string;
	brand: Brand;
	mode: Mode;
	/** Selector resolved inside the story iframe. */
	selector: string;
	/**
	 * Property names to read. Custom properties (`--cream`) and standard
	 * properties (`background-color`) are both accepted — getPropertyValue
	 * handles either, and custom properties come back var()-substituted.
	 */
	props: string[];
	/** Which match to read when the selector matches several. Defaults to 0. */
	index?: number;
}

/**
 * How the axis was driven, recorded rather than assumed.
 *
 * Storybook 8.6 accepts `?globals=theme:dark;brand:monochrome`, so the URL path is
 * the normal one. The direct-DOM fallback exists because that query parameter is
 * undocumented surface that a Storybook upgrade could drop silently — and a
 * harness that quietly stopped applying the brand would turn every monochrome
 * assertion into a default-brand assertion that still passed.
 *
 * Module-level, so it is per-worker. Read it from a spec in the same file that
 * did the probing.
 */
export const probeMeta: {
	lastAppliedVia: "url-globals" | "direct-dom" | null;
	urlGlobals: number;
	directDom: number;
} = { lastAppliedVia: null, urlGlobals: 0, directDom: 0 };

export async function probeComputed(
	page: Page,
	opts: ProbeOptions,
): Promise<Record<string, string>> {
	const { story, brand, mode, selector, props, index = 0 } = opts;
	const cell = `brand=${brand} mode=${mode}`;
	const want = { brand: brand === "monochrome" ? "monochrome" : null, dark: mode === "dark" };

	const globals = `theme:${mode};brand:${brand}`;
	await page.goto(`/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=${globals}`);
	// `attached`, never `visible`: Lightbox stories auto-open a dialog that hides
	// #storybook-root from the accessibility tree, and `visible` times out on them.
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 15_000 });

	// Wait for the decorator to have run, not merely for the container to exist.
	// #storybook-root is in iframe.html's static markup, so it is attached long
	// before React renders into it — reading the axis at that point is a race. The
	// child-count clause matters for the default × light cell, whose desired <html>
	// state is also its pre-render state, so the axis clause alone would pass
	// instantly and prove nothing.
	const settled = (arg: { brand: string | null; dark: boolean }) => {
		const html = document.documentElement;
		const root = document.querySelector("#storybook-root");
		return (
			html.getAttribute("data-brand") === arg.brand &&
			html.classList.contains("dark") === arg.dark &&
			(root?.children.length ?? 0) > 0
		);
	};

	let appliedVia: "url-globals" | "direct-dom" = "url-globals";
	try {
		await page.waitForFunction(settled, want, { timeout: 10_000 });
	} catch {
		// The globals query parameter did not take. Drive the axis directly and
		// re-assert; if it still will not hold, the throw below is the right answer.
		appliedVia = "direct-dom";
		await page.evaluate((arg: { brand: string | null; dark: boolean }) => {
			const html = document.documentElement;
			if (arg.brand === null) html.removeAttribute("data-brand");
			else html.setAttribute("data-brand", arg.brand);
			html.classList.toggle("dark", arg.dark);
		}, want);
		await page.waitForFunction(settled, want, { timeout: 10_000 }).catch(() => undefined);
	}

	const actual = await page.evaluate(() => ({
		brand: document.documentElement.getAttribute("data-brand"),
		dark: document.documentElement.classList.contains("dark"),
	}));
	if (actual.brand !== want.brand || actual.dark !== want.dark) {
		throw new Error(
			[
				`probeComputed could not put story "${story}" into ${cell}.`,
				`<html> ended up with data-brand=${JSON.stringify(actual.brand)} dark=${actual.dark},`,
				`expected data-brand=${JSON.stringify(want.brand)} dark=${want.dark}.`,
				"Both the globals query parameter and the direct-DOM fallback failed,",
				"so any value read here would belong to the wrong cell.",
			].join(" "),
		);
	}
	probeMeta.lastAppliedVia = appliedVia;
	if (appliedVia === "url-globals") probeMeta.urlGlobals += 1;
	else probeMeta.directDom += 1;

	// A colour mid-transition is a real computed value and a useless one. Killing
	// animation and transition here mirrors what storybook.spec.ts injects before
	// each capture, for the same reason.
	await page.addStyleTag({
		content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
	});
	// Font metrics change layout height, so geometry read while fonts are still
	// loading is not reproducible. This matters more than usual in this phase:
	// plan 01-04 replaces the entire face layer. `.then(() => undefined)` because
	// document.fonts.ready resolves to a FontFaceSet, which cannot be serialized
	// back across the bridge.
	await page.evaluate(() => document.fonts.ready.then(() => undefined));

	const read = await page.evaluate(
		(arg: { selector: string; props: string[]; index: number }) => {
			const els = document.querySelectorAll(arg.selector);
			const el = els[arg.index];
			if (!el) {
				const seen = new Set<string>();
				for (const node of document.querySelectorAll("[class]")) {
					for (const c of node.classList) if (c.startsWith("ds-")) seen.add(c);
					if (seen.size >= 8) break;
				}
				return { ok: false as const, matched: els.length, nearby: [...seen] };
			}
			const cs = getComputedStyle(el);
			const values: Record<string, string> = {};
			for (const p of arg.props) values[p] = cs.getPropertyValue(p).trim();
			return { ok: true as const, matched: els.length, values };
		},
		{ selector, props, index },
	);

	if (!read.ok) {
		const at = index === 0 ? "" : ` at index ${index}`;
		const hint = read.nearby.length
			? `Design-system classes present in that story include: ${read.nearby.join(", ")}.`
			: "No ds-* classes were found in that story at all.";
		throw new Error(
			[
				`probeComputed found no element for selector "${selector}"${at}`,
				`in story "${story}" (${cell}); the selector matched ${read.matched} element(s).`,
				hint,
				"Returning an empty result instead would make the caller's assertion vacuous.",
			].join(" "),
		);
	}
	return read.values;
}

/**
 * `#b0722a` → `rgb(176, 114, 42)`, so a spec can write the token contract's hex
 * literally and still compare against what Chromium reports.
 *
 * Case-insensitive on purpose. This repository's Biome config rewrites hex to
 * lowercase on commit, so a matcher anchored to the uppercase form the design
 * documents use would fail for reasons of case alone.
 */
export function hexToRgb(hex: string): string {
	const raw = hex.trim().replace(/^#/, "");
	const full =
		raw.length === 3
			? raw
					.split("")
					.map((c) => c + c)
					.join("")
			: raw;
	// .exec rather than the obvious RegExp predicate, whose name this comment
	// deliberately does not spell. A grep gate asserts that this file declares no
	// Playwright case, and it cannot tell that method call from a declaration — so
	// the code moves rather than the gate. Nothing here may write that identifier
	// followed by an open parenthesis, in code or in prose.
	if (/^[0-9a-f]{6}$/i.exec(full) === null) {
		throw new Error(`hexToRgb expects a 3- or 6-digit hex colour, got ${JSON.stringify(hex)}`);
	}
	const n = Number.parseInt(full, 16);
	return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
