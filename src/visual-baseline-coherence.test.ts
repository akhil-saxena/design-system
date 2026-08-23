import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * F-19-3. The baseline directories and the story set must agree, so a reviewer
 * approving a capture is looking at a coherent set.
 *
 * WHAT 01-19 MEASURED, AND WHAT IT ACTUALLY MEANT. It reported 240 baseline
 * directories against 502 stories — "444 unbacked, 186 orphaned, 75% stale". The
 * counts were right and the conclusion was wrong, because the directory it
 * counted is not the one the visual gate compares against. There are TWO
 * baseline mechanisms in this repository:
 *
 *   tests/visual/storybook.spec.ts-snapshots/   flat <id>-chromium-darwin.png
 *     Playwright's own snapshot store for the ONE spec that calls a snapshot
 *     matcher (storybook.spec.ts). `npm run test:visual` compares against this.
 *     THIS is the regression gate, and preview.tsx's own header calls its size
 *     out: "all 488 visual baselines".
 *
 *   tests/visual-baselines/<id>/{light,dark}.png
 *     Written by .storybook/test-runner.ts under DS_TEST_MODE=visual, i.e.
 *     `npm run test:visual:capture`, which D-31 deliberately makes local-only and
 *     NOT a CI job. Nothing compares against it.
 *
 * So "444 stories have no baseline" was measured against the non-gating store.
 * Against the gating one the shortfall is 21, not 444.
 *
 * WHY THE ORPHANS WERE NOT BULK-DELETED. 164 of the 186 are CATEGORY RENAMES:
 * the library moved components between categories (atoms->inputs,
 * surfaces->overlays, compound->inputs/interaction, pickers->inputs,
 * overlays->surfaces), which changes the story id while the story is unchanged. A
 * renamed story wants its baseline moved, not dropped. The mapping lives in
 * tests/visual-baselines/RENAME-PENDING.json for a human to action; this file
 * keeps it honest so it cannot rot into fiction.
 *
 * WHY THE IDS ARE DERIVED FROM SOURCE. The obvious oracle is
 * storybook-static/index.json, but that is a gitignored build artefact, so a test
 * reading it would SKIP in CI — and a skipping test is a false pass, which is the
 * exact shape of src/packaging.test.ts's describe.skipIf hazard. Deriving ids
 * from src/**\/*.stories.tsx instead needs no build. The derivation was validated
 * against a real built index at 502/502 exactly, including the four awkward cases
 * (`JSONOutput` -> json-output, `DropzonePDFOnly` -> dropzone-pdf-only,
 * `OlderThan30Days` -> older-than-30-days, `DeepPathMaxVisible3` ->
 * deep-path-max-visible-3) that a naive camelCase split gets wrong.
 */

/** Storybook's export-name -> story-slug transform (lodash startCase, then sanitize). */
const WORDS = /[A-Z]{2,}(?=[A-Z][a-z]|[0-9]|\b)|[A-Z]?[a-z]+|[A-Z]|[0-9]+/g;
const sanitize = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
const slugFromExport = (name: string) => sanitize((name.match(WORDS) ?? [name]).join(" "));

function storyFiles(root = "src"): string[] {
	const out: string[] = [];
	(function walk(dir: string) {
		for (const entry of readdirSync(dir)) {
			const p = path.join(dir, entry);
			if (statSync(p).isDirectory()) walk(p);
			else if (entry.endsWith(".stories.tsx")) out.push(p);
		}
	})(root);
	return out.sort();
}

/** Every story id the source declares. */
function derivedStoryIds(): Set<string> {
	const ids = new Set<string>();
	for (const file of storyFiles()) {
		const sf = ts.createSourceFile(
			file,
			readFileSync(file, "utf8"),
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);
		let title: string | null = null;
		const exported: string[] = [];
		(function visit(n: ts.Node) {
			if (
				ts.isPropertyAssignment(n) &&
				n.name.getText(sf) === "title" &&
				ts.isStringLiteralLike(n.initializer) &&
				title === null
			)
				title = n.initializer.text;
			if (
				ts.isVariableStatement(n) &&
				n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
			) {
				const decl = n.declarationList.declarations[0];
				if (!decl) return;
				const name = decl.name.getText(sf);
				if (
					name !== "default" &&
					decl.initializer &&
					ts.isObjectLiteralExpression(decl.initializer)
				)
					exported.push(name);
			}
			ts.forEachChild(n, visit);
		})(sf);
		if (title !== null)
			for (const name of exported) ids.add(`${sanitize(title)}--${slugFromExport(name)}`);
	}
	return ids;
}

interface IdParts {
	category: string;
	component: string;
	story: string;
}
function splitId(id: string): IdParts | null {
	const [prefix, story] = id.split("--");
	if (!prefix || !story) return null;
	const segs = prefix.split("-");
	return { category: segs.slice(0, -1).join("-"), component: segs.at(-1) as string, story };
}

/** ids sharing this one's component and story name but sitting under another category. */
function renameCandidates(id: string, all: Set<string>): string[] {
	const a = splitId(id);
	if (!a) return [];
	const out: string[] = [];
	for (const other of all) {
		if (other === id) continue;
		const b = splitId(other);
		if (b && b.component === a.component && b.story === a.story) out.push(other);
	}
	return out.sort();
}

/**
 * THE BRAND AXIS (D-37). Baseline names in the gating store carry an optional
 * brand suffix, so `inputs-button--default--charcoal` and
 * `inputs-button--default` are two recordings of ONE story. The suffix is
 * stripped before an id is compared to the story set.
 *
 * WHAT THE STRIP CHANGES, MEASURED - AND IT IS NOT A VERDICT. Both forms of the
 * orphan filter return the same answer on the current tree: zero unexplained,
 * before and after. What changes is WHY. `splitId` splits on "--" and keeps only
 * the first two segments, so it discards the brand suffix anyway and the strip
 * cannot alter `renameCandidates`. It alters the `ids.has()` lookup, and there
 * the difference is total: of the 504 charcoal names, the unstripped form
 * recognises 0 as live story ids and excuses all 504 through the rename
 * tolerance, while the stripped form recognises all 504 as live and excuses
 * none. The charcoal half of this store was green by way of a tolerance built
 * for a different purpose, which is the same shape as a test that passes for the
 * wrong reason.
 *
 * The first draft of this comment claimed the strip closes a hole that admits a
 * dead charcoal id. It does not, and the control meant to demonstrate it -
 * planting `overlays-card--default--charcoal`, a charcoal baseline for a
 * renamed-away story - stayed green both before and after, because the rename
 * tolerance is SUPPOSED to excuse exactly that. A control that plants something
 * the test deliberately tolerates proves nothing about the test.
 *
 * WHAT THIS FILE CAN AND CANNOT SEE. It can catch: a legacy directory that is
 * neither live nor in the manifest; a rotted manifest; a snapshot whose id has
 * no live story AND no same-component/story under another category (a typo, or
 * a genuinely deleted component); a live story missing a charcoal baseline; and
 * a charcoal baseline that is byte-identical to its default one. It CANNOT
 * catch: a baseline for a deliberately deleted story whose component name still
 * exists elsewhere, which the rename tolerance excuses by design; or anything
 * about image CONTENT, since every check here is over filenames and hashes. A
 * baseline recorded with a visual defect present still compares clean forever.
 */
const BRAND_SUFFIXES = ["--charcoal"] as const;

function stripBrand(name: string): { id: string; brand: string } {
	for (const suffix of BRAND_SUFFIXES) {
		if (name.endsWith(suffix)) return { id: name.slice(0, -suffix.length), brand: suffix.slice(2) };
	}
	return { id: name, brand: "default" };
}

const LEGACY_DIR = "tests/visual-baselines";
const MANIFEST = `${LEGACY_DIR}/RENAME-PENDING.json`;
const PLAYWRIGHT_DIR = "tests/visual/storybook.spec.ts-snapshots";

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
	categoryRenames: Record<string, string>;
	unresolved: Record<string, string[] | null>;
};

describe("the baseline stores agree with the story set (F-19-3)", () => {
	const ids = derivedStoryIds();

	it("derives a plausible story set from source, so nothing below is vacuous", () => {
		// Validated at 502/502 against a real built index when this was written. A
		// floor rather than an equality, so adding a story is not a failure.
		expect(ids.size).toBeGreaterThan(450);
	});

	it("every legacy baseline directory is either live or accounted for as a pending rename", () => {
		const dirs = readdirSync(LEGACY_DIR, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		const unaccounted = dirs.filter(
			(d) => !ids.has(d) && !(d in manifest.categoryRenames) && !(d in manifest.unresolved),
		);
		expect(unaccounted).toEqual([]);
	});

	it("the rename manifest has not rotted: keys are dead ids, targets are live ids", () => {
		const keysThatCameBack = Object.keys(manifest.categoryRenames).filter((k) => ids.has(k));
		expect(keysThatCameBack).toEqual([]);
		const targetsThatVanished = Object.entries(manifest.categoryRenames)
			.filter(([, v]) => !ids.has(v))
			.map(([k, v]) => `${k} -> ${v}`);
		expect(targetsThatVanished).toEqual([]);
		const unresolvedThatCameBack = Object.keys(manifest.unresolved).filter((k) => ids.has(k));
		expect(unresolvedThatCameBack).toEqual([]);
	});

	it("the gating Playwright store has no UNEXPLAINED orphan", () => {
		// Every orphan here must be explainable as a category rename. If a story is
		// genuinely deleted this goes red, which is the point: the decision to drop a
		// recorded baseline should be taken deliberately, not absorbed silently.
		const snapshotIds = readdirSync(PLAYWRIGHT_DIR)
			.filter((f) => f.endsWith(".png"))
			.map((f) => stripBrand(f.replace(/-chromium-darwin\.png$/, "")));
		const unexplained = snapshotIds
			.filter(({ id }) => !ids.has(id))
			.filter(({ id }) => renameCandidates(id, ids).length === 0)
			.map(({ id, brand }) => (brand === "default" ? id : `${id} [${brand}]`));
		expect(unexplained).toEqual([]);
	});

	it("D-37: every recorded story has a charcoal baseline beside its default one", () => {
		// The parity claim of plan 01-20 made checkable, so it cannot decay into a
		// one-time assertion in a SUMMARY. A story added later and captured under one
		// brand only turns this red.
		//
		// Scoped to LIVE ids on purpose: the store also holds pending-rename orphans
		// (overlays-card--*, overlays-stickynote--*) which were never captured under
		// charcoal and should not be, since the decision to move or drop them is
		// still open. Time-dependent stories have no baseline in either brand, so
		// they fall out of scope by having no default recording to pair with.
		const recorded = readdirSync(PLAYWRIGHT_DIR)
			.filter((f) => f.endsWith(".png"))
			.map((f) => stripBrand(f.replace(/-chromium-darwin\.png$/, "")));
		const byBrand = new Map<string, Set<string>>();
		for (const { id, brand } of recorded) {
			if (!byBrand.has(brand)) byBrand.set(brand, new Set());
			byBrand.get(brand)?.add(id);
		}
		const defaults = [...(byBrand.get("default") ?? [])].filter((id) => ids.has(id));
		expect(defaults.length).toBeGreaterThan(450);
		for (const suffix of BRAND_SUFFIXES) {
			const brand = suffix.slice(2);
			const captured = byBrand.get(brand) ?? new Set<string>();
			const missing = defaults.filter((id) => !captured.has(id)).sort();
			expect(missing, `stories with no ${brand} baseline`).toEqual([]);
		}
	});

	it("D-37: charcoal baselines are actually charcoal renders, not default ones", () => {
		// THE GAP THIS CLOSES. Every other check in this file is a FILENAME check. If
		// the `globals=brand:charcoal` query parameter silently stopped being honoured
		// - a Storybook upgrade, a renamed global, a decorator rewrite - the capture
		// would write 504 default-brand images under charcoal names and every
		// name-level assertion here would still pass. The a11y runner guards this per
		// story by asserting <html data-brand> in postVisit; the Playwright visual
		// suite has no equivalent, so the recorded bytes are the only evidence left.
		//
		// A charcoal render must therefore DIFFER from its default counterpart. Three
		// stories legitimately do not, and they are enumerated rather than absorbed by
		// a threshold, so a fourth is a failure and not a rounding error.
		const BRAND_INVARIANT = new Set([
			// An empty state: renders no themed surface at all.
			"data-display-timeline--empty",
			// Explicit per-instance colour props - the story's subject IS overriding the
			// palette, so it is brand-independent by construction.
			"display-sparkline--custom-colors",
			// DotGrid's demo canvas hardcodes its background and its amber dots. Left
			// deliberately by 01-19.1 (its finding 1) rather than tokenised.
			"foundation-dotgrid--high-opacity-amber",
		]);
		const suffix = "--charcoal-chromium-darwin.png";
		const charcoal = readdirSync(PLAYWRIGHT_DIR).filter((f) => f.endsWith(suffix));
		expect(charcoal.length).toBeGreaterThan(450);
		const sha = (f: string) =>
			createHash("sha256")
				.update(readFileSync(path.join(PLAYWRIGHT_DIR, f)))
				.digest("hex");
		const identical: string[] = [];
		for (const file of charcoal) {
			const id = file.slice(0, -suffix.length);
			const plain = `${id}-chromium-darwin.png`;
			if (!existsSync(path.join(PLAYWRIGHT_DIR, plain))) continue;
			if (sha(file) === sha(plain)) identical.push(id);
		}
		expect(
			identical.filter((id) => !BRAND_INVARIANT.has(id)).sort(),
			"charcoal baselines byte-identical to their default counterpart, so the brand axis did not reach these captures",
		).toEqual([]);
		// The allowlist must not rot either: an entry that starts differing is stale.
		expect(
			[...BRAND_INVARIANT].filter((id) => !identical.includes(id)).sort(),
			"BRAND_INVARIANT entries that now DO differ between brands, so the exemption is stale",
		).toEqual([]);
	});

	it("keeps the two stores from being confused for one another", () => {
		// The legacy store nests per id; the gating store is flat. If these ever
		// converge, the reasoning in this file's header stops being true.
		expect(
			statSync(
				path.join(LEGACY_DIR, Object.keys(manifest.categoryRenames)[0] as string),
			).isDirectory(),
		).toBe(true);
		expect(readdirSync(PLAYWRIGHT_DIR).every((f) => f.endsWith(".png"))).toBe(true);
	});
});
