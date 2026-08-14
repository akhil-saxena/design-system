#!/usr/bin/env node
/**
 * Post-build: ship the stylesheets, and stamp the React client directive.
 *
 * Why this is a script and not tsup config:
 *
 *   `banner: { js: '"use client";' }` does get injected by esbuild, but tsup's
 *   `treeshake: true` then runs the output through rollup, which strips module
 *   level directives and warns "Module level directives cause errors when
 *   bundled, \"use client\" ... was ignored". So the directive has to be applied
 *   after the whole pipeline finishes — here.
 *
 * Every emitted chunk is stamped, not just the three entrypoints. Entrypoints
 * alone would be enough for a well-behaved consumer (the boundary is
 * established where they import), but stamping chunks keeps the graph correct
 * even if a bundler reaches a chunk by another route, and costs ~14 bytes each.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const DIRECTIVE = '"use client";';

// ── 1. Stylesheets ──────────────────────────────────────────────────────────
// package.json `exports` maps ./tokens.css, ./primitives.css and
// ./utilities.css directly at these paths, so a silent failure here publishes a
// package whose documented stylesheet entrypoints 404. Throwing is the point.
for (const css of ["tokens.css", "primitives.css", "utilities.css"]) {
	copyFileSync(join(root, "src", css), join(dist, css));
}

// ── 2. Per-component stylesheets ────────────────────────────────────────────
// Emitted into dist/css/ so a consumer can import only what they render:
// `base.css` (3KB) plus one file per component, instead of the whole 165KB
// sheet. See scripts/split-css.mjs for the round-trip integrity guarantee.
execFileSync(process.execPath, [join(root, "scripts", "split-css.mjs")], { stdio: "inherit" });

// ── 3. Client directive ─────────────────────────────────────────────────────
function jsFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) out.push(...jsFiles(p));
		else if (entry.endsWith(".js")) out.push(p);
	}
	return out;
}

let stamped = 0;
for (const file of jsFiles(dist)) {
	const source = readFileSync(file, "utf8");
	if (source.startsWith(DIRECTIVE)) continue;
	writeFileSync(file, `${DIRECTIVE}\n${source}`);
	stamped += 1;
}

// A build that stamps nothing means the directive silently stopped being
// applied — the exact regression this script exists to prevent.
if (stamped === 0) {
	throw new Error(
		'postbuild: stamped 0 files with "use client" — expected at least the 3 entrypoints',
	);
}

console.log(`postbuild: copied 3 stylesheets, stamped ${stamped} JS files with "use client"`);
