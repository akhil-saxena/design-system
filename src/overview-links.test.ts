import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

	/**
	 * Components that exist in src/ and are deliberately not catalogue entries.
	 *
	 * A **ratchet with a reason attached**, in the same spirit as
	 * control-boundary.spec.ts's LABEL_IS_THE_AFFORDANCE. Three sources used to
	 * disagree about how many components this library has — README said 80, the
	 * catalogue summed to 79, and src/ held 81 directories, so the README matched
	 * neither. Reconciling them on 79 is only half the job: a count that agrees
	 * because two components were quietly left out is the same defect with a
	 * tidier face on it, so the omissions are named here and the assertions below
	 * fail BY NAME when a new one appears.
	 */
	const EXCLUDED_FROM_CATALOG: Record<string, string> = {
		Field:
			"not a rendered component — useField() plus a wrapper that puts a label, hint and error around a control the caller supplies. It also has no story file, so inputs-field--docs does not exist and cataloguing it would create exactly the broken tile the test above prevents.",
		IconButton:
			"the icon-only form of Button, catalogued under Button. Editorial rather than technical: IconButton has a story tagged autodocs, so inputs-iconbutton--docs resolves and cataloguing it would work. Revisit the taxonomy and the asserted total becomes 80.",
	};

	/** src/<category>/<Component>/ — the same shape as `find src -mindepth 2 -maxdepth 2 -type d`. */
	const componentDirs = () => {
		const out: string[] = [];
		const srcDir = join(root, "src");
		for (const cat of readdirSync(srcDir)) {
			const catPath = join(srcDir, cat);
			if (!statSync(catPath).isDirectory()) continue;
			for (const name of readdirSync(catPath)) {
				if (statSync(join(catPath, name)).isDirectory()) out.push(`${cat}/${name}`);
			}
		}
		return out;
	};

	it("agrees with README and with src/ on how many components there are", () => {
		// The catalogue is the authority; README quotes it and src/ is reconciled
		// against it through the exclusion list. Deriving all three from one parse
		// is the point — three independent hand-maintained claims is what drifted.
		const catalogCount = categories.reduce((n, c) => n + c.components.length, 0);

		const readme = readFileSync(join(root, "README.md"), "utf8");
		const stated = /\*\*(\d+) components across (\d+) categories\.\*\*/.exec(readme);
		expect(
			stated,
			"could not find the component-count sentence in README.md — if its wording changed, this assertion is silently measuring nothing",
		).not.toBeNull();
		expect(Number(stated?.[1]), "README's component count disagrees with the catalogue").toBe(
			catalogCount,
		);
		expect(Number(stated?.[2]), "README's category count disagrees with the catalogue").toBe(
			categories.length,
		);

		const dirs = componentDirs();
		const cataloged = new Set(
			categories.flatMap((c) => c.components.map((n) => n.replaceAll(" ", ""))),
		);
		const excluded = new Set(Object.keys(EXCLUDED_FROM_CATALOG));

		// The useful one: it names the component rather than reporting a bad total.
		const uncatalogued = dirs.filter((d) => {
			const name = d.split("/")[1] as string;
			return !cataloged.has(name) && !excluded.has(name);
		});
		expect(
			uncatalogued,
			`these components exist in src/ but are neither in the Overview catalogue nor in EXCLUDED_FROM_CATALOG — add them to a category, or add them to that list with a reason:\n  ${uncatalogued.join("\n  ")}`,
		).toEqual([]);

		// A stale exclusion is as wrong as a missing one: it would hide a real
		// component having been deleted, and keep the arithmetic passing.
		const dirNames = new Set(dirs.map((d) => d.split("/")[1] as string));
		const phantom = [...excluded].filter((n) => !dirNames.has(n));
		expect(
			phantom,
			`EXCLUDED_FROM_CATALOG names components that no longer exist in src/: ${phantom.join(", ")}`,
		).toEqual([]);

		// And nothing may be both catalogued and excluded, which would make the
		// total below add up while double-counting.
		const both = [...excluded].filter((n) => cataloged.has(n));
		expect(both, `both catalogued and excluded: ${both.join(", ")}`).toEqual([]);

		expect(
			catalogCount + excluded.size,
			`catalogue (${catalogCount}) + exclusions (${excluded.size}) should equal the ${dirs.length} component directories in src/`,
		).toBe(dirs.length);
	});
});
