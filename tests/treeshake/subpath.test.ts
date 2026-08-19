/**
 * DS-09 / G-15 — the per-component subpath tree-shaking gate.
 *
 * The regression this defends: `src/index.ts` is one barrel that *statically*
 * imports @tiptap/*, lowlight, @dnd-kit/* and lucide-react at top level, so
 * `dist/index.js` does too. One `import { Chip }` on a hydrated island was
 * measured at 570,555 B raw / 176,922 B gzip / 99 modules, carrying ProseMirror
 * x10, TipTap x23, lowlight x4, highlight.js x4 and dnd-kit x3. Three
 * configuration fixes were tried during research (`sideEffects: false`, dropping
 * the "use client" directive, marking `createLowlight()` `@__PURE__`) and each
 * produced byte-identical output — Astro 7 ships Vite 8, which is Rolldown-based,
 * and Rollup-era tree-shaking advice does not transfer. Per-component entries are
 * the fix; this asserts they keep working.
 *
 * ## How the module universe is collected
 *
 * esbuild's `--metafile` reports the modules it parsed, keyed by path. That is
 * the same *kind* of evidence check-bundle.mjs reads out of Rolldown's sourcemap
 * `sources` arrays, which is why the two are comparable. Most heavy families are
 * `external` in tsup.config.ts and so survive into dist as real bare imports,
 * which esbuild resolves to node_modules paths and names honestly.
 *
 * One class of module is invisible to the metafile alone: anything tsup BUNDLED
 * into a dist chunk has no name but that chunk's, e.g. `dist/css-W3EDTG4F.js`.
 * RichText's six code-highlight grammars are exactly that — it reaches them
 * through dynamic `import("highlight.js/lib/languages/…")`. So for every input
 * under dist/, this also folds in that file's `.js.map` `sources`, which name the
 * original modules. Measured contribution on RichText: highlight.js 194 -> 200.
 * The RichText case below asserts that delta directly rather than asserting a
 * bare `> 0` that would still pass with the chaining removed.
 *
 * ## Two caveats a future reader should not have to rediscover
 *
 * 1. The denominator differs from check-bundle.mjs on purpose: this counts
 *    modules *parsed*, that one counts modules that *contributed bytes* to an
 *    emitted chunk. Parsed is the stricter of the two — lucide-react contributes
 *    1,714 parsed inputs and ~0 output bytes to Chip — so it errs toward failing
 *    a clean bundle rather than passing a dirty one. Compare per-family counts
 *    between the two reports, never the raw module totals.
 * 2. `sideEffects: ["*.css"]` marks all JS side-effect-free, so esbuild drops the
 *    bare `import '../chunk-XXXX.js'` lines it finds in dist entries and logs
 *    `[ignored-bare-import]`. Heavy dependencies arrive through *named* imports,
 *    which are never dropped, so this does not blind the gate — but it does mean
 *    esbuild is slightly more aggressive here than a consumer's bundler may be.
 *    The authoritative measurement is a real Astro/Rolldown build through
 *    check-bundle.mjs; this is the fast regression guard in front of it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dist = join(root, "dist");

/**
 * The failure set is copied from
 * .planning/phases/00-design-ideation/scripts/playground-measurements/check-bundle.mjs
 * rather than re-chosen, so this gate and the DS-09 measurement cannot drift apart.
 */
const HEAVY_FAMILIES: Record<string, RegExp> = {
	prosemirror: /prosemirror/i,
	tiptap: /tiptap/i,
	lowlight: /lowlight/i,
	highlightjs: /highlight\.js/i,
	dndkit: /dnd-kit/i,
	lucide: /lucide/i,
};

/**
 * lucide-react is excluded from the failure set deliberately, and the reason is
 * copied verbatim from check-bundle.mjs so the two do not silently diverge: it is
 * a tree-shakeable icon package whose modules are individually small, and the
 * design system legitimately renders icons. The editor stack
 * (ProseMirror/TipTap/lowlight/highlight.js) and the drag-and-drop stack
 * (dnd-kit) are the families that have no business on a public island.
 */
const FAIL_ON = Object.keys(HEAVY_FAMILIES).filter((k) => k !== "lucide");

function tally(modules: Iterable<string>): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const module of modules) {
		for (const [family, re] of Object.entries(HEAVY_FAMILIES)) {
			if (re.test(module)) counts[family] = (counts[family] ?? 0) + 1;
		}
	}
	return counts;
}

interface Measurement {
	modules: number;
	bytes: number;
	/** Heavy-family counts over the full universe (metafile inputs + chunk sourcemaps). */
	counts: Record<string, number>;
	/** The same tally over metafile inputs ONLY, so the chaining's contribution is visible. */
	metafileOnly: Record<string, number>;
}

/**
 * Bundle one built subpath entry the way a consumer would reach it — through a
 * named import, so the entry's own exports are shaken too — and report which
 * heavy module families were pulled in.
 */
function measureSubpath(component: string, named: string): Measurement {
	const dir = mkdtempSync(join(tmpdir(), "ds-treeshake-"));
	try {
		const target = join(dist, "components", `${component}.js`);
		const entry = join(dir, "entry.ts");
		const out = join(dir, "out.js");
		const metafile = join(dir, "meta.json");
		writeFileSync(
			entry,
			`import { ${named} } from ${JSON.stringify(target)};\nconsole.log(${named});\n`,
		);

		// react/react-dom are the consumer's own peer deps and are never the
		// regression under test; everything else is left to resolve so the gate
		// sees what a real bundler would see.
		execFileSync(
			join(root, "node_modules/.bin/esbuild"),
			[
				entry,
				"--bundle",
				"--minify",
				"--format=esm",
				"--external:react",
				"--external:react-dom",
				`--metafile=${metafile}`,
				`--outfile=${out}`,
			],
			{ cwd: root, stdio: ["ignore", "pipe", "pipe"] },
		);

		const meta = JSON.parse(readFileSync(metafile, "utf8")) as { inputs: Record<string, unknown> };
		const metafileInputs = Object.keys(meta.inputs);
		const universe = new Set<string>(metafileInputs);

		// See the header: a module bundled INTO a dist chunk has no name of its
		// own in the metafile, so recover it from that chunk's sourcemap.
		for (const input of metafileInputs) {
			const abs = resolve(root, input);
			if (!abs.startsWith(dist)) continue;
			const map = `${abs}.map`;
			if (!existsSync(map)) continue;
			const sources = (JSON.parse(readFileSync(map, "utf8")) as { sources?: string[] }).sources;
			for (const source of sources ?? []) universe.add(resolve(dirname(abs), source));
		}

		return {
			modules: universe.size,
			bytes: readFileSync(out).length,
			counts: tally(universe),
			metafileOnly: tally(metafileInputs),
		};
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

/**
 * These assertions describe the *built* package, so they need a build — the same
 * contract src/packaging.test.ts documents. `prepublishOnly` runs
 * `build && test`, and .github/workflows/publish.yaml runs `npm run build`
 * before `npm test`, so the gate is live on both paths that matter; a bare
 * `npm test` on a clean checkout skips rather than failing for an unrelated
 * reason.
 */
const built = existsSync(join(dist, "components"));

describe.skipIf(!built)("per-component subpath tree-shaking (DS-09 / G-15)", () => {
	/**
	 * The sample is deliberate, not arbitrary:
	 *
	 * - Chip      the exact component G-15 measured. The before/after anchor, and
	 *             non-negotiable. It also imports an icon (`X`, via ../../icons),
	 *             so it doubles as the case proving lucide-react arriving is
	 *             tolerated rather than accidentally excluded.
	 * - Lightbox  the public-island component this project actually hydrates. It
	 *             pulls IconButton, DSPortal and four hooks, so it exercises the
	 *             shared-chunk path rather than a leaf.
	 */
	it.each([
		["Chip", "Chip"],
		["Lightbox", "Lightbox"],
	])("%s pulls in no editor or drag-and-drop modules", (component, named) => {
		const { counts, modules, bytes } = measureSubpath(component, named);
		const heavy = FAIL_ON.filter((family) => counts[family]);
		const found = heavy.map((f) => `${f} (${counts[f]} modules)`).join(", ");
		expect(
			heavy,
			`${component} subpath bundle (${modules} modules, ${bytes} B minified) reached ${found}. The per-component entry has regained a heavy dependency: importing one atom now drags the editor or drag-and-drop stack onto a hydrated public island, which is what DS-09 exists to prevent. Fix it upstream in this package, never with a consumer-side workaround.`,
		).toEqual([]);

		// lucide-react is permitted, and asserting it is PRESENT keeps the check
		// above honest: a bundle that resolved nothing at all would otherwise
		// report an empty failure set and pass.
		expect(counts.lucide, `${component} resolved no lucide modules at all`).toBeGreaterThan(0);
	});

	/**
	 * The inverse assertions. Without these the suite could pass by dropping every
	 * import — a bundler configuration that resolved nothing would report zero
	 * heavy families for every component and look perfect while shipping broken
	 * subpaths. One control per heavy stack:
	 */
	it("RichText DOES still carry the editor stack", () => {
		const { counts, metafileOnly } = measureSubpath("RichText", "RichText");
		expect(counts.tiptap, "RichText lost TipTap — the gate is measuring nothing").toBeGreaterThan(
			0,
		);
		expect(counts.prosemirror, "RichText lost ProseMirror").toBeGreaterThan(0);

		// The control for the sourcemap chaining specifically. RichText's six
		// code-highlight grammars are dynamically imported and were bundled into
		// dist chunks, so they exist in the universe ONLY because the chaining
		// recovered them. A strict inequality is required: ~194 highlight.js
		// modules are visible to the metafile directly, so a `> 0` assertion here
		// would still pass with the chaining deleted, and this control would be
		// decoration rather than a control.
		expect(
			counts.highlightjs ?? 0,
			`the sourcemap chaining recovered no highlight.js modules beyond what the metafile already named (${metafileOnly.highlightjs ?? 0}). Modules that tsup bundled INTO a dist chunk are invisible to metafile inputs, so with this broken the gate is blind to that whole class of dependency for every component it checks.`,
		).toBeGreaterThan(metafileOnly.highlightjs ?? 0);
	});

	it("Sortable DOES still carry the drag-and-drop stack", () => {
		const { counts } = measureSubpath("Sortable", "Sortable");
		expect(counts.dndkit, "Sortable lost dnd-kit — the gate is measuring nothing").toBeGreaterThan(
			0,
		);
	});
});
