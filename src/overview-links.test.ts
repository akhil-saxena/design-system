import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const indexPath = join(root, "storybook-static", "index.json");

/**
 * Every component tile on the Overview page links to that component's docs page.
 * The href is *derived* — `${categoryId}-${name.toLowerCase()}--docs` — so it is
 * only correct as long as the story exists, is filed under the matching title
 * prefix, and has the `autodocs` tag that generates a `--docs` entry.
 *
 * None of that is enforced by the type system, and a wrong link fails silently:
 * Storybook renders "Couldn't find story matching …" only once a user clicks it.
 * ActionSheet was broken exactly this way — it had a story but no `autodocs`
 * tag, so `overlays-actionsheet--docs` never existed.
 *
 * This reads the built index, so it needs `npm run build-storybook` first; it
 * skips rather than fails when the index is absent, so a plain `vitest` run in a
 * fresh clone does not report a phantom failure.
 */
describe("Overview page component links", () => {
	const src = readFileSync(join(root, "src", "OverviewPage.tsx"), "utf8");

	// Parse the real `categories` array rather than pattern-matching prose: each
	// entry is `{ name, id, components: ["A", "B", …] }`.
	// `components` is written both multi-line and on one line, so the pattern
	// tolerates arbitrary whitespace between the two keys. A stricter version of
	// this silently matched only seven of the nine categories.
	const categories = [...src.matchAll(/\bid:\s*"([a-z-]+)",\s*components:\s*\[([\s\S]*?)\]/g)].map(
		([, id, body]) => ({
			id,
			components: [...(body ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1] as string),
		}),
	);

	it("parses the Overview's own category data", () => {
		// Guards against the check silently passing because it found nothing —
		// which is exactly how a first attempt at this test reported zero problems.
		expect(categories.length).toBeGreaterThanOrEqual(9);
		expect(categories.reduce((n, c) => n + c.components.length, 0)).toBeGreaterThan(60);
	});

	it("links only to docs pages that exist", () => {
		if (!existsSync(indexPath)) {
			console.warn("storybook-static/index.json missing — run build-storybook");
			return;
		}
		const entries: Record<string, unknown> = JSON.parse(readFileSync(indexPath, "utf8")).entries;
		const have = new Set(Object.keys(entries));

		const broken: string[] = [];
		for (const cat of categories) {
			for (const name of cat.components) {
				const id = `${cat.id}-${name.toLowerCase().replaceAll(" ", "")}--docs`;
				if (!have.has(id)) broken.push(`${name} → ${id}`);
			}
		}
		expect(broken, `broken Overview links:\n  ${broken.join("\n  ")}`).toEqual([]);
	});
});
