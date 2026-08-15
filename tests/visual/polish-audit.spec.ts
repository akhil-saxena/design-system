import { expect, test } from "@playwright/test";

/**
 * Rendered-output audit across every story.
 *
 * The screenshot baselines only prove that nothing *changed* — two components
 * shipped visibly broken (CommandPalette rows with UA button chrome, a
 * misaligned ColorPicker row) and compared clean for as long as they existed,
 * because the wrongness was recorded into the baseline. Unit tests assert
 * behaviour, and axe assesses accessibility, not polish. This checks the
 * computed result directly, so a defect fails on its first run rather than never.
 */

/** Native inputs that are deliberately 1×1 and visually hidden — the visible
 *  label or box beside them is the real target, so their size is not a defect. */
const VISUALLY_HIDDEN_CONTROLS = [
	"ds-atom-checkbox-input",
	"ds-atom-radio-input",
	"ds-atom-toggle-input",
];

test("no story renders a defective control", async ({ page }) => {
	await page.goto("http://localhost:6006/index.json");
	const entries = JSON.parse(await page.evaluate(() => document.body.innerText)).entries as Record<
		string,
		{ type: string }
	>;
	const ids = Object.entries(entries)
		.filter(([, e]) => e.type === "story")
		.map(([id]) => id);
	expect(ids.length).toBeGreaterThan(100);

	const found = new Map<string, string>();
	for (const id of ids) {
		await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`);
		await page.waitForSelector("#storybook-root", { state: "attached", timeout: 5000 });
		const hits = await page.evaluate((hidden: string[]) => {
			const out: string[] = [];
			const ds = (el: Element) => [...el.classList].find((c) => c.startsWith("ds-")) ?? "";

			for (const el of document.querySelectorAll(
				"button, a[href], input, [role='option'], [role='tab']",
			)) {
				const c = ds(el);
				if (!c || hidden.includes(c)) continue;
				const r = el.getBoundingClientRect();
				// An interactive element with no box cannot be seen, clicked, or given
				// a visible focus ring.
				if (r.width === 0 || r.height === 0) {
					// `display: contents` is legitimate — the child carries the box.
					if (getComputedStyle(el).display !== "contents") out.push(`zero-size: ${c}`);
					continue;
				}
				// WCAG 2.5.8: a 24×24 target. Small glyphs expand their hit area with a
				// centred ::after rather than growing, so measure that too.
				const after = getComputedStyle(el, "::after");
				const hit = Math.max(r.height, Number.parseFloat(after.height) || 0);
				const hitW = Math.max(r.width, Number.parseFloat(after.width) || 0);
				if (hit < 24 && hitW < 24)
					out.push(`tiny-target: ${c} ${Math.round(hitW)}x${Math.round(hit)}`);
			}

			// Text that cannot be read because it matches what it sits on.
			for (const el of document.querySelectorAll("[class*='ds-']")) {
				if (!el.textContent?.trim() || el.children.length) continue;
				const cs = getComputedStyle(el);
				let bg = "rgba(0, 0, 0, 0)";
				let n: Element | null = el;
				while (n && bg === "rgba(0, 0, 0, 0)") {
					bg = getComputedStyle(n).backgroundColor;
					n = n.parentElement;
				}
				if (cs.color === bg) out.push(`invisible-text: ${ds(el)}`);
			}
			return [...new Set(out)];
		}, VISUALLY_HIDDEN_CONTROLS);

		for (const h of hits) if (!found.has(h)) found.set(h, id);
	}

	const report = [...found].map(([h, id]) => `${h}  [${id}]`);
	expect(report, `rendered-output defects:\n  ${report.join("\n  ")}`).toEqual([]);
});
