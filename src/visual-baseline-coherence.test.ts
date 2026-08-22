import { readFileSync, readdirSync, statSync } from "node:fs";
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
			.map((f) => f.replace(/-chromium-darwin\.png$/, ""));
		const unexplained = snapshotIds
			.filter((id) => !ids.has(id))
			.filter((id) => renameCandidates(id, ids).length === 0);
		expect(unexplained).toEqual([]);
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
