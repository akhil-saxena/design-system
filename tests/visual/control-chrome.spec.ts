import { expect, test } from "@playwright/test";

/**
 * No design-system control may render with the browser's default form chrome.
 *
 * A class written for a `<div>` and later applied to a `<button>` inherits the
 * UA button styles — a 2px outset border, a grey fill, shrink-to-fit width and
 * the system font — unless the rule explicitly resets them. Nothing else catches
 * this: the class exists so the class-existence test passes, unit tests assert
 * behaviour rather than paint, and the screenshot baselines were *recorded with
 * the bug already present*, so they compared clean forever.
 *
 * Two tells, because the first alone was not enough. `border-style: outset` is
 * the UA button border — no deliberate style here uses it. But a control can
 * reset its border and still not inherit `font`, which buttons never do by
 * default; that shipped a dropzone rendering in 13px Arial while the rest of the
 * system was on the type scale. Both are checked.
 *
 * Found this way: CommandPalette's rows (a <div> that became a <button> so
 * role="option" sat on a focusable element), Link's `as="button"` form, and
 * FileInput's dropzone.
 */
test("no control renders with UA form chrome", async ({ page }) => {
	await page.goto("http://localhost:6006/index.json");
	const entries = JSON.parse(await page.evaluate(() => document.body.innerText)).entries as Record<
		string,
		{ type: string }
	>;
	const ids = Object.entries(entries)
		.filter(([, e]) => e.type === "story")
		.map(([id]) => id);
	expect(ids.length).toBeGreaterThan(0);

	const offenders = new Map<string, string>();
	for (const id of ids) {
		await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`);
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 5000 });
		const hits = await page.evaluate(() => {
			const out: string[] = [];
			for (const el of document.querySelectorAll("button, input, select, textarea")) {
				const cls = [...el.classList].find((c) => c.startsWith("ds-"));
				if (!cls) continue;
				const cs = getComputedStyle(el);
				if (cs.borderTopStyle === "outset") out.push(`${cls} (UA border)`);
				// The UA button/input font. Every control here should be on --font-body
				// or --font-mono, both of which resolve to named families.
				if (/^(arial|-apple-system|system-ui|times)/i.test(cs.fontFamily.trim()))
					out.push(`${cls} (UA font: ${cs.fontFamily.slice(0, 20)})`);
			}
			return [...new Set(out)];
		});
		for (const c of hits) if (!offenders.has(c)) offenders.set(c, id);
	}

	const report = [...offenders].map(([c, id]) => `${c} (e.g. ${id})`);
	expect(report, `controls with unreset UA chrome:\n  ${report.join("\n  ")}`).toEqual([]);
});
