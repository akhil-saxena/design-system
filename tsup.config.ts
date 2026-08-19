import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "tsup";

/**
 * Per-component JS subpath entries — DS-09 / G-15.
 *
 * `src/index.ts` is one barrel that *statically* imports @tiptap/*, lowlight,
 * @dnd-kit/* and lucide-react at top level, so `dist/index.js` does too. A
 * single `import { Chip }` on a hydrated island therefore drags ProseMirror and
 * the drag-and-drop stack into the browser — measured at 570,555 B raw /
 * 176,922 B gzip / 99 modules. Three configuration fixes were tried during
 * research (`sideEffects: false`, dropping the "use client" directive, marking
 * `createLowlight()` as `@__PURE__`) and each produced byte-identical output:
 * Astro 7 ships Vite 8, which is Rolldown-based, and Rollup-era tree-shaking
 * advice does not transfer. Giving every component its own entry is the fix.
 *
 * The map is GENERATED rather than written out as ~81 literal lines so that a
 * component added in a later phase gets a subpath without anyone remembering
 * to add one, and a renamed component cannot leave a stale entry behind.
 *
 * ── Why package.json's `build` script invokes node with --max-old-space-size ──
 *
 * `dts: true` bundles the full type graph once PER ENTRY, so going from 3
 * entries to 84 took the declaration pass from ~2.6 s to ~28 s and its peak RSS
 * to ~9.3 GB. tsup runs that pass in a worker thread (`new Worker()` with no
 * resourceLimits), and a worker inherits `process.execArgv` — NOT NODE_OPTIONS.
 * So `NODE_OPTIONS=--max-old-space-size=… npm run build` does nothing here; the
 * flag has to be a real CLI argument on the node process that spawns tsup,
 * which is why `build` names tsup's bin file directly instead of `tsup`.
 * Measured: 4096 and 8192 both die with ERR_WORKER_OUT_OF_MEMORY, 12288 passes.
 *
 * Types are kept deliberately. A subpath without them would be a worse API than
 * the barrel it exists to replace, so the cost is taken rather than avoided.
 */

// Directories under src/ that are not <category>/<Component>/index.tsx shaped.
// `_internals` is listed for a different reason than the rest: DSPortal and
// friends are deliberately NOT public API, and giving them subpaths would
// publish them as such. (It holds flat files, not component directories, so it
// falls out of the scan anyway — the entry here is defence in depth against a
// future refactor that gives it the regular shape.)
const NON_COMPONENT_DIRS = new Set(["_internals", "fonts", "hooks", "icons", "themes"]);

// A glob that silently matches nothing yields a normal-looking three-entry
// build, so the floor is asserted rather than trusted. 81 components existed
// when this was written; the floor sits below that to tolerate deletions.
const MIN_COMPONENTS = 70;

function componentEntries(): Record<string, string> {
	const entries: Record<string, string> = {};
	const origin = new Map<string, string>();

	for (const category of readdirSync("src")) {
		if (NON_COMPONENT_DIRS.has(category)) continue;
		const categoryDir = join("src", category);
		if (!statSync(categoryDir).isDirectory()) continue;

		for (const name of readdirSync(categoryDir)) {
			const entry = join(categoryDir, name, "index.tsx");
			if (!existsSync(entry)) continue;

			// Two directories sharing a leaf name across categories would collide
			// on one output path and one would silently win, publishing the wrong
			// component under a documented specifier.
			const previous = origin.get(name);
			if (previous !== undefined) {
				throw new Error(
					`tsup.config: two components share the leaf name "${name}" — ${previous} and ${entry}. Both would emit dist/components/${name}.js and one would silently win. Rename one, or give the exports map an explicit disambiguation.`,
				);
			}
			origin.set(name, entry);
			entries[`components/${name}`] = entry;
		}
	}

	const found = Object.keys(entries).length;
	if (found < MIN_COMPONENTS) {
		throw new Error(
			`tsup.config: the component scan matched ${found} entries, below the floor of ${MIN_COMPONENTS}. package.json exports ./components/*, so this build would publish a package whose documented per-component entrypoints 404 — and a three-entry build looks completely normal. Check that src/<category>/<Component>/index.tsx still describes the source layout.`,
		);
	}
	return entries;
}

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"hooks/index": "src/hooks/index.ts",
		"icons/index": "src/icons/index.ts",
		...componentEntries(),
	},
	format: ["esm"],
	dts: true,
	splitting: true,
	// NOTE: the "use client" directive is applied by scripts/postbuild.mjs, not by
	// a `banner` here. esbuild does inject a banner, but `treeshake: true` below
	// pipes the output through rollup, which strips module level directives
	// ("Module level directives cause errors when bundled ... was ignored"). See
	// that script for the full rationale.
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: [
		"react",
		"react-dom",
		"lucide-react",
		"@tiptap/react",
		"@tiptap/starter-kit",
		"@tiptap/extension-link",
		"@tiptap/extension-placeholder",
		"@tiptap/extension-underline",
		"@tiptap/pm",
	],
	onSuccess: "node scripts/postbuild.mjs",
});
