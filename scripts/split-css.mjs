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
 *
 * WHY EACH SHEET DECLARES ITS SIBLINGS
 *
 * Splitting by component means a COMPOSED component's sheet is incomplete by
 * construction. `DataGrid` renders `Pagination`, which renders `IconButton`, and
 * all three are separate banners — so `import ".../css/datagrid"` used to yield a
 * grid with an unstyled 21px pager, with nothing anywhere saying which other
 * sheets were needed (F-13-3).
 *
 * The header of every generated sheet now names them. The list is DERIVED from
 * the component import graph (`componentSheetDeps` below) rather than
 * hand-maintained, because a hand-maintained list is exactly what goes stale the
 * first time a component starts or stops rendering another one. `--deps-json`
 * prints the derived map, and `src/css-split.test.ts` asserts both that the graph
 * still finds the known compounds and that every edge it finds is declared in the
 * emitted header.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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

// ── Component import graph ────────────────────────────────────────────────────

/**
 * Every `src/<category>/<Component>/index.tsx`, mapped from its absolute
 * directory to its component name. The directory IS the identity here: an import
 * specifier resolves to a directory, so that is what the edges are keyed on.
 */
function componentDirs(srcDir) {
	/** @type {Map<string, string>} */
	const comps = new Map();
	for (const cat of readdirSync(srcDir, { withFileTypes: true })) {
		if (!cat.isDirectory()) continue;
		for (const name of readdirSync(join(srcDir, cat.name), { withFileTypes: true })) {
			if (!name.isDirectory() || !/^[A-Z]/.test(name.name)) continue;
			const dir = join(srcDir, cat.name, name.name);
			if (existsSync(join(dir, "index.tsx"))) comps.set(dir, name.name);
		}
	}
	return comps;
}

/**
 * Which components each component renders, read from its relative imports.
 *
 * Comments are stripped first — a docstring that names another component is
 * prose, and counting it would declare a stylesheet dependency that does not
 * exist. Only relative specifiers that resolve to a known component directory
 * become edges; `../../hooks/*`, `../../icons` and npm packages have no sheet.
 */
function componentEdges(comps) {
	/** @type {Map<string, Set<string>>} */
	const edges = new Map();
	for (const [dir, name] of comps) {
		const code = readFileSync(join(dir, "index.tsx"), "utf8")
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.replace(/^\s*\/\/.*$/gm, "");
		const out = new Set();
		for (const m of code.matchAll(/\bfrom\s*["']([^"']+)["']/g)) {
			if (!m[1].startsWith(".")) continue;
			const target = comps.get(resolve(dir, m[1]));
			if (target && target !== name) out.add(target);
		}
		edges.set(name, out);
	}
	return edges;
}

/**
 * Sheet name -> the other sheets a consumer must import alongside it.
 *
 * TRANSITIVE on purpose. `datagrid` needs `iconbutton` even though DataGrid does
 * not import IconButton: it renders Pagination, which does. A direct-only list
 * would name `pagination` and still leave the pager's buttons unstyled, which is
 * the F-13-3 failure one level down.
 *
 * A component with no banner of its own contributes no sheet — `Badge` is one
 * inline style object with no class at all — but it is still WALKED THROUGH, so
 * anything it renders is still declared.
 */
export function componentSheetDeps(srcDir, sheetNames) {
	const sheets = new Set(sheetNames);
	const comps = componentDirs(srcDir);
	const edges = componentEdges(comps);
	const closure = (name, seen = new Set()) => {
		for (const dep of edges.get(name) ?? []) {
			if (seen.has(dep)) continue;
			seen.add(dep);
			closure(dep, seen);
		}
		return seen;
	};
	/** @type {Record<string, string[]>} */
	const out = {};
	/** @type {Record<string, string[]>} */
	const owners = {};
	for (const name of comps.values()) {
		const own = name.toLowerCase();
		if (!sheets.has(own)) continue;
		const deps = [...closure(name)]
			.map((n) => n.toLowerCase())
			.filter((s) => sheets.has(s) && s !== own);
		out[own] = [...new Set([...(out[own] ?? []), ...deps])].sort();
		owners[own] = [...new Set([...(owners[own] ?? []), name])].sort();
		if (out[own].length === 0) delete out[own];
	}
	return { deps: out, owners };
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

// Reject an unrecognised flag rather than falling through to the write path. A
// typo'd flag used to silently rebuild dist/css and print the summary line where
// the caller expected JSON, which is a confusing way to find out.
const KNOWN_FLAGS = new Set(["--check", "--deps-json"]);
for (const arg of process.argv.slice(2)) {
	if (arg.startsWith("-") && !KNOWN_FLAGS.has(arg)) {
		console.error(`split-css: unknown flag ${arg} (known: ${[...KNOWN_FLAGS].join(", ")})`);
		process.exit(2);
	}
}

const { deps: SHEET_DEPS, owners: SHEET_OWNERS } = componentSheetDeps(join(root, "src"), order);

if (process.argv.includes("--deps-json")) {
	process.stdout.write(`${JSON.stringify(SHEET_DEPS, null, "\t")}\n`);
	process.exit(0);
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

/**
 * The sibling-sheet block, or "" for a component that renders nothing else.
 *
 * Emitted as `import ".../css/<dep>";` lines rather than prose so the claim is
 * machine-checkable: a rule comment further down the file that happens to name a
 * sibling component ("Footer — row count (left) + Pagination (right)") is not a
 * dependency declaration, and a gate that greps the whole sheet for the word
 * would pass on a file that declares nothing.
 */
const DEPS_BLOCK = (name) => {
	const deps = SHEET_DEPS[name];
	if (!deps || deps.length === 0) return "";
	const who = (SHEET_OWNERS[name] ?? [name]).join(" / ");
	const lines = deps.map((d) => `     import "@akhil-saxena/design-system/css/${d}";`).join("\n");
	return `
   ${who} renders other components, and the split is BY component, so their rules
   are not in this file. Import these alongside it or the composed parts render
   unstyled — a DataGrid imported on its own had a 21px unstyled pager:
${lines}
`;
};

const HEADER = (name) => `/* @akhil-saxena/design-system — ${name}.css
   Generated from src/primitives.css by scripts/split-css.mjs. Do not edit.

   Requires tokens.css, and base.css for the shared reset/utility rules:
     import "@akhil-saxena/design-system/tokens.css";
     import "@akhil-saxena/design-system/css/base";
     import "@akhil-saxena/design-system/css/${name}";
${DEPS_BLOCK(name)}
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
const withDeps = Object.keys(SHEET_DEPS).length;
console.log(
	`split-css: ${order.length} files, ${(total / 1024).toFixed(0)}KB total ` +
		`(base ${(files.get("base").length / 1024).toFixed(1)}KB; largest: ${biggest}); ` +
		`${withDeps} declare sibling sheets`,
);

// Sanity: the emitted directory must contain exactly what we intended.
const written = readdirSync(outDir).filter((f) => f.endsWith(".css"));
if (written.length !== order.length) {
	throw new Error(`split-css: wrote ${written.length} files, expected ${order.length}`);
}
