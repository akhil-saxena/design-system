#!/usr/bin/env node
/**
 * Split `src/primitives.css` into per-component stylesheets.
 *
 * WHY A BUILD STEP AND NOT 79 SOURCE FILES
 *
 * `primitives.css` stays the single authoring source. Splitting at build time
 * means there is nothing to keep in sync: no chance of a rule being edited in one
 * place and stale in another, and the cascade order of the original file is
 * preserved by construction. The alternative — 79 hand-maintained files — trades a
 * 160KB payload problem for a drift problem.
 *
 * WHAT IT GUARANTEES
 *
 * Concatenating `base.css` followed by every component file, in emission order,
 * reproduces `primitives.css` byte for byte. `scripts/split-css.mjs --check`
 * asserts that, and `src/css-split.test.ts` runs the same assertion in CI. If the
 * split ever loses or duplicates a rule, that fails.
 *
 * HOW SECTIONS ARE FOUND
 *
 * The sheet is already organised by `/* ─── DS atom: Name ─── *\/` banners. Each
 * banner starts a slice. Banners that are not component sections (the file
 * preamble, the shared visually-hidden rule, the system-wide reduced-motion
 * guard) are collected into `base.css`, which every consumer needs.
 *
 * Several components own more than one banner — Card, DatePicker, Link, Heading
 * and Divider each have a base section plus a later extensions section. Those
 * concatenate into one file, in original order.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "src", "primitives.css");

/** Banner labels that are not component sections. */
const BASE_LABELS = /^(Visually hidden|Reduced motion|Illustrations)/i;

function slugify(label) {
	// "DatePicker · popover variant (v0.6.0)" → "datepicker"
	// "Heading / Text / Eyebrow"              → "heading"
	// "Table (DS-61, part 1)"                 → "table"
	const head = label.split(/[(·]/)[0].split("/")[0].trim();
	return head
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export function splitCss(css) {
	// Every `─── … ───` banner opens a slice. Component banners are prefixed
	// "DS atom:" / "DS layout:"; anything else is shared.
	const banner = /\/\*+\s*─── ([^─\n]+?)\s*─+/g;
	const marks = [];
	for (const m of css.matchAll(banner)) marks.push({ index: m.index, label: m[1].trim() });

	/** @type {{name: string, css: string}[]} */
	const parts = [];
	// Everything before the first banner is the file header.
	if (marks.length === 0 || marks[0].index > 0) {
		parts.push({ name: "base", css: css.slice(0, marks.length ? marks[0].index : css.length) });
	}
	marks.forEach((mark, i) => {
		const end = i + 1 < marks.length ? marks[i + 1].index : css.length;
		const chunk = css.slice(mark.index, end);
		const component = /^DS (atom|layout):\s*(.+)$/.exec(mark.label);
		const name = component && !BASE_LABELS.test(component[2]) ? slugify(component[2]) : "base";
		parts.push({ name, css: chunk });
	});

	// Merge same-named slices, preserving first-appearance order so the emitted
	// concatenation matches the source cascade.
	/** @type {Map<string, string>} */
	const files = new Map();
	const order = [];
	for (const { name, css: chunk } of parts) {
		if (!files.has(name)) {
			files.set(name, "");
			order.push(name);
		}
		files.set(name, files.get(name) + chunk);
	}
	return { files, order, parts };
}

const source = readFileSync(SOURCE, "utf8");
const { files, order, parts } = splitCss(source);

// Integrity: the slices, in original order, must reconstruct the source exactly.
const rebuilt = parts.map((p) => p.css).join("");
if (rebuilt !== source) {
	throw new Error(
		`split-css: round-trip mismatch (source ${source.length} bytes, rebuilt ${rebuilt.length})`,
	);
}

if (process.argv.includes("--check")) {
	console.log(`split-css: OK — ${order.length} files, round-trip byte-exact`);
	process.exit(0);
}

const outDir = join(root, "dist", "css");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const BASE_HEADER = `/* @akhil-saxena/design-system — base.css
   Generated from src/primitives.css by scripts/split-css.mjs. Do not edit.

   Shared rules every component relies on (reset, .ds-visually-hidden, the
   system-wide prefers-reduced-motion guard). Import this once, alongside
   tokens.css, before any per-component sheet:
     import "@akhil-saxena/design-system/tokens.css";
     import "@akhil-saxena/design-system/css/base";
     import "@akhil-saxena/design-system/css/button";

   Importing "@akhil-saxena/design-system/primitives.css" instead pulls the whole
   sheet, which is the simpler default when tree-shaking CSS is not a concern. */

`;

const HEADER = (name) => `/* @akhil-saxena/design-system — ${name}.css
   Generated from src/primitives.css by scripts/split-css.mjs. Do not edit.

   Requires tokens.css, and base.css for the shared reset/utility rules:
     import "@akhil-saxena/design-system/tokens.css";
     import "@akhil-saxena/design-system/css/base";
     import "@akhil-saxena/design-system/css/${name}";

   Importing "@akhil-saxena/design-system/primitives.css" instead pulls the whole
   sheet, which is the simpler default when tree-shaking CSS is not a concern. */

`;

for (const name of order) {
	const header = name === "base" ? BASE_HEADER : HEADER(name);
	writeFileSync(join(outDir, `${name}.css`), header + files.get(name));
}

const total = order.reduce((n, k) => n + files.get(k).length, 0);
const biggest = [...order]
	.sort((a, b) => files.get(b).length - files.get(a).length)
	.slice(0, 3)
	.map((k) => `${k} ${(files.get(k).length / 1024).toFixed(1)}KB`)
	.join(", ");
console.log(
	`split-css: ${order.length} files, ${(total / 1024).toFixed(0)}KB total ` +
		`(base ${(files.get("base").length / 1024).toFixed(1)}KB; largest: ${biggest})`,
);

// Sanity: the emitted directory must contain exactly what we intended.
const written = readdirSync(outDir).filter((f) => f.endsWith(".css"));
if (written.length !== order.length) {
	throw new Error(`split-css: wrote ${written.length} files, expected ${order.length}`);
}
