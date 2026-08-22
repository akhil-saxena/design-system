/**
 * F-14-2 — the syntax highlighter is off the eager path.
 *
 * ## The gate this replaces could not fail
 *
 * Plan 01-17 specified:
 *
 * ```bash
 * if grep -qi 'lowlight' dist/components/RichText.js; then FAIL; fi
 * ```
 *
 * `dist/components/RichText.js` is a **508-byte re-export shim** — `export
 * { RichText } from '../chunk-MA6ZAU7Y.js'` plus twelve bare chunk imports. It
 * has never contained the string `lowlight`, before the fix or after, so that
 * check was unfailable in both directions. Measured on the untouched tree:
 * `grep -o lowlight | wc -l` = **0**, with `CodeBlockLowlight` registered
 * unconditionally three files down the graph.
 *
 * ## And a text gate on the whole graph would match a comment
 *
 * Following the shim into the chunks and grepping *those* does not fix it. On the
 * shipped tree the only occurrence of `lowlight` anywhere in the statically
 * reachable graph is `chunk-*.js:240`, which is this sentence's cousin:
 * `// when it is allowed at all it arrives as CodeBlockLowlight instead.` A
 * source comment, surviving into dist. This phase has now shipped a gate that
 * matched a comment rather than code seven times; the fix is to stop matching
 * text.
 *
 * ## What this asserts instead
 *
 * esbuild's metafile names every module it resolved and how each output chunk was
 * reached. Bundling the built subpath **with code splitting** — the way a
 * consumer's Vite/Rolldown build reaches it — partitions the chunks into the
 * *eager* set (the entry plus everything it imports with a static
 * `import`-statement, transitively) and the *async* set (everything reachable
 * only through a dynamic `import()`). The claim is about that partition, not
 * about any file's text:
 *
 * 1. No `lowlight` and no `highlight.js` module is in the **eager** set.
 * 2. Both **are** in the async set — the inverse control. Without it, a build
 *    that dropped code blocks entirely, or that resolved nothing at all, would
 *    pass assertion 1 while shipping a broken opt-in.
 * 3. TipTap and ProseMirror are still eager, because a RichText that had to wait
 *    for a network round trip to become an editor would be a different and worse
 *    component. `subpath.test.ts` asserts the same thing from the other side.
 *
 * ## Measured, before and after
 *
 * | | eager raw | eager gzip | eager modules | lowlight | highlight.js |
 * |---|---:|---:|---:|---:|---:|
 * | before | 431,344 B | 139,280 B | 127 | 3 | 2 |
 * | after | 410,418 B | 131,270 B | 123 | **0** | **0** |
 *
 * The async side moved the other way — 12,743 B gzip to 23,022 B — because the
 * `lowlight` instance, the `CodeBlockLowlight` extension and the `highlight.js`
 * core joined the six grammar chunks that were already deferred. The grammars
 * alone are F-14-2's "12,718 B gzip", reproduced here at 12,743 B.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dist = join(root, "dist");

/** Copied from subpath.test.ts so the two gates cannot drift on what counts as heavy. */
const HEAVY_FAMILIES: Record<string, RegExp> = {
	prosemirror: /prosemirror/i,
	tiptap: /tiptap/i,
	lowlight: /lowlight/i,
	highlightjs: /highlight\.js/i,
	lucide: /lucide/i,
};

interface Partitioned {
	eager: { modules: number; raw: number; gzip: number; counts: Record<string, number> };
	async: { modules: number; raw: number; gzip: number; counts: Record<string, number> };
	chunks: { total: number; eager: number; async: number };
}

/**
 * Bundle a built subpath with code splitting and partition the output chunks into
 * what a consumer downloads to render the component (eager) and what it
 * downloads only if the deferred branch is taken (async).
 */
function partition(component: string, named: string): Partitioned {
	const dir = mkdtempSync(join(tmpdir(), "ds-codeblock-"));
	try {
		const target = join(dist, "components", `${component}.js`);
		const outdir = join(dir, "out");
		const metafile = join(dir, "meta.json");
		writeFileSync(
			join(dir, "entry.ts"),
			`import { ${named} } from ${JSON.stringify(target)};\nconsole.log(${named});\n`,
		);
		execFileSync(
			join(root, "node_modules/.bin/esbuild"),
			[
				join(dir, "entry.ts"),
				"--bundle",
				"--minify",
				"--format=esm",
				// Splitting is the whole point: without it esbuild inlines dynamic
				// imports into the entry chunk and the partition below collapses to
				// "everything", which is precisely the measurement that cannot tell a
				// deferred dependency from an eager one.
				"--splitting",
				"--external:react",
				"--external:react-dom",
				`--outdir=${outdir}`,
				`--metafile=${metafile}`,
			],
			{ cwd: root, stdio: ["ignore", "pipe", "pipe"] },
		);

		const meta = JSON.parse(readFileSync(metafile, "utf8")) as {
			outputs: Record<
				string,
				{
					entryPoint?: string;
					inputs?: Record<string, unknown>;
					imports?: { path: string; kind: string }[];
				}
			>;
		};
		const outputs = meta.outputs;
		const entryKey = Object.keys(outputs).find((k) => outputs[k]?.entryPoint);
		if (!entryKey) throw new Error("esbuild produced no entry chunk");

		// Transitive closure over static import statements only.
		const eagerKeys = new Set<string>([entryKey]);
		for (let changed = true; changed; ) {
			changed = false;
			for (const key of [...eagerKeys]) {
				for (const edge of outputs[key]?.imports ?? []) {
					if (edge.kind !== "import-statement") continue;
					if (!outputs[edge.path] || eagerKeys.has(edge.path)) continue;
					eagerKeys.add(edge.path);
					changed = true;
				}
			}
		}
		const asyncKeys = Object.keys(outputs).filter((k) => !eagerKeys.has(k));

		const summarise = (keys: string[]) => {
			const modules = new Set<string>();
			let raw = 0;
			let gzip = 0;
			for (const key of keys) {
				const buf = readFileSync(resolve(root, key));
				raw += buf.length;
				gzip += gzipSync(buf).length;
				for (const input of Object.keys(outputs[key]?.inputs ?? {})) {
					modules.add(input);
					// A module that tsup bundled INTO a dist chunk has no name but that
					// chunk's, so recover the originals from the chunk's sourcemap. The
					// six grammars are exactly that class, and without this the async
					// side reads as three modules instead of nineteen.
					const abs = resolve(root, input);
					if (!abs.startsWith(dist)) continue;
					const map = `${abs}.map`;
					if (!existsSync(map)) continue;
					const sources = (JSON.parse(readFileSync(map, "utf8")) as { sources?: string[] }).sources;
					for (const source of sources ?? []) modules.add(resolve(dirname(abs), source));
				}
			}
			const counts: Record<string, number> = {};
			for (const module of modules) {
				for (const [family, re] of Object.entries(HEAVY_FAMILIES)) {
					if (re.test(module)) counts[family] = (counts[family] ?? 0) + 1;
				}
			}
			return { modules: modules.size, raw, gzip, counts };
		};

		return {
			eager: summarise([...eagerKeys]),
			async: summarise(asyncKeys),
			chunks: {
				total: Object.keys(outputs).length,
				eager: eagerKeys.size,
				async: asyncKeys.length,
			},
		};
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

const built = existsSync(join(dist, "components"));

describe.skipIf(!built)("F-14-2: the code-block highlighter is opt-in", () => {
	const measured = partition("RichText", "RichText");
	const report = `eager ${measured.eager.raw} B / ${measured.eager.gzip} B gzip / ${measured.eager.modules} modules ${JSON.stringify(measured.eager.counts)}; async ${measured.async.raw} B / ${measured.async.gzip} B gzip / ${measured.async.modules} modules ${JSON.stringify(measured.async.counts)}`;

	it("splits into an eager and an async set at all", () => {
		// Guard before you read: with no async chunk every assertion below is
		// vacuous, and a partition of "everything is eager" would silently make the
		// inverse controls unreachable rather than failing.
		expect(measured.chunks.async, report).toBeGreaterThan(0);
		expect(measured.chunks.eager, report).toBeGreaterThan(0);
	});

	it("no lowlight module is on the eager path", () => {
		expect(
			measured.eager.counts.lowlight ?? 0,
			`lowlight is back on the eager path, so every RichText mount pays for the code-block highlighter again — including the one editing a résumé bullet. ${report}`,
		).toBe(0);
	});

	it("no highlight.js module is on the eager path", () => {
		expect(
			measured.eager.counts.highlightjs ?? 0,
			`highlight.js is back on the eager path. ${report}`,
		).toBe(0);
	});

	it("both ARE still reachable asynchronously — the opt-in still works", () => {
		// The inverse control. Without it, deleting code-block support entirely
		// would pass the two assertions above.
		expect(
			measured.async.counts.lowlight ?? 0,
			`lowlight is not reachable at all any more, so allow={[…, "codeBlock"]} would register nothing. ${report}`,
		).toBeGreaterThan(0);
		expect(measured.async.counts.highlightjs ?? 0, report).toBeGreaterThan(0);
	});

	it("the editor stack itself stays eager", () => {
		// Deferring TipTap would make the component wait on a network round trip
		// before it could become an editor. subpath.test.ts asserts the same
		// property from the other direction.
		expect(measured.eager.counts.tiptap ?? 0, report).toBeGreaterThan(0);
		expect(measured.eager.counts.prosemirror ?? 0, report).toBeGreaterThan(0);
	});

	it("resolved a real module universe, so the zero assertions are not vacuous", () => {
		// lucide-react is permitted here for the same reason subpath.test.ts asserts
		// it: a bundle that resolved nothing would report zero for every family and
		// look perfect.
		expect(measured.eager.counts.lucide ?? 0, report).toBeGreaterThan(0);
		expect(measured.eager.modules, report).toBeGreaterThan(50);
	});
});
