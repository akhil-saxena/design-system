/**
 * F-14-1 — a source-shape guard against reintroducing the `toolbar` fallthrough.
 *
 * The behavioural test (`RichText.test.tsx`, "toolbar={null} renders NO toolbar")
 * is the one that matters, and this does not replace it. This exists because the
 * defect was a **one-character class of error** that reads like a simplification:
 * `toolbar ?? defaultToolbar` is shorter and looks equivalent to
 * `toolbar === undefined ? defaultToolbar : toolbar`, and nullish coalescing
 * falls through on `null` — the exact value the prop's own docstring prescribes
 * for suppression. Somebody will tidy it back one day, and this names the reason
 * at the site.
 *
 * ## Why it parses instead of grepping
 *
 * A grep for the operator matches this file's own prose, and matches the
 * docstring in `index.tsx` that explains the bug. That is not a hypothetical:
 * this phase has shipped a gate that matched a comment rather than code six
 * times, twice in the immediately preceding plan, where a check returned 2 with
 * the code fully correct because it matched two JSDoc comments. A hand-rolled
 * comment stripper is not the answer either — the previous plan wrote one and it
 * desynchronised on the apostrophe in "don't" inside JSX text. So this walks the
 * TypeScript AST, where a comment is not a node and cannot be mistaken for one.
 *
 * ## What it checks
 *
 * Narrowly: no `??` expression anywhere in `index.tsx` whose left-hand side is
 * the identifier `toolbar`. Every *other* `??` in the file is legitimate
 * (`placeholder ?? ""`, `editor?.isActive(…) ?? false`, `attrs?.href ?? ""`) and
 * a blanket ban would be an unpassable gate — which is the other half of this
 * phase's gate-defect catalogue.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const COMPONENT = join(HERE, "index.tsx");

function parse(source: string, fileName = "index.tsx") {
	return ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
}

/**
 * Every `x ?? y` in `source` whose left operand is exactly the identifier
 * `name`, reported as `line:text`.
 */
function nullishFallbacksOn(source: string, name: string): string[] {
	const file = parse(source);
	const found: string[] = [];
	const visit = (node: ts.Node) => {
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
			ts.isIdentifier(node.left) &&
			node.left.text === name
		) {
			const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
			found.push(`${line + 1}:${node.getText(file)}`);
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	return found;
}

/** Does `source` compare `name` against `undefined` anywhere? */
function comparesToUndefined(source: string, name: string): boolean {
	const file = parse(source);
	let found = false;
	const visit = (node: ts.Node) => {
		if (ts.isBinaryExpression(node)) {
			const op = node.operatorToken.kind;
			const isEquality =
				op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
				op === ts.SyntaxKind.ExclamationEqualsEqualsToken;
			const sides = [node.left, node.right];
			if (
				isEquality &&
				sides.some((s) => ts.isIdentifier(s) && s.text === name) &&
				sides.some((s) => ts.isIdentifier(s) && s.text === "undefined")
			) {
				found = true;
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	return found;
}

describe("F-14-1: the toolbar prop is never routed through nullish coalescing", () => {
	const source = readFileSync(COMPONENT, "utf8");

	it("index.tsx has no `toolbar ??` fallback", () => {
		expect(nullishFallbacksOn(source, "toolbar")).toEqual([]);
	});

	it("index.tsx distinguishes 'not passed' from 'explicitly null'", () => {
		// The positive half. Without it the test above would pass on a component
		// that had deleted the toolbar prop altogether.
		expect(comparesToUndefined(source, "toolbar")).toBe(true);
	});

	it("does not object to the file's other, legitimate nullish fallbacks", () => {
		// Non-inert: if this read 0 the detector would be matching nothing at all
		// and the assertion above would be vacuous.
		const anyNullish = parse(source);
		let total = 0;
		const visit = (node: ts.Node) => {
			if (
				ts.isBinaryExpression(node) &&
				node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
			) {
				total += 1;
			}
			ts.forEachChild(node, visit);
		};
		visit(anyNullish);
		expect(total).toBeGreaterThan(0);
	});
});

describe("the detector itself", () => {
	it("catches the exact defect that shipped", () => {
		expect(
			nullishFallbacksOn("const x = !readOnly && (toolbar ?? defaultToolbar);", "toolbar"),
		).toEqual(["1:toolbar ?? defaultToolbar"]);
	});

	it("catches it inside JSX, which is where it lived", () => {
		expect(
			nullishFallbacksOn("const el = <div>{!readOnly && (toolbar ?? bar)}</div>;", "toolbar"),
		).toHaveLength(1);
	});

	it("is not fooled by the operator appearing in a line comment", () => {
		expect(nullishFallbacksOn("// toolbar ?? defaultToolbar was the bug\n", "toolbar")).toEqual([]);
	});

	it("is not fooled by the operator appearing in a JSDoc block", () => {
		expect(
			nullishFallbacksOn(
				"/**\n * `toolbar ?? defaultToolbar` fell through on null.\n */\n",
				"toolbar",
			),
		).toEqual([]);
	});

	it("is not fooled by the operator appearing in a string or template literal", () => {
		expect(nullishFallbacksOn('const s = "toolbar ?? defaultToolbar";', "toolbar")).toEqual([]);
		expect(nullishFallbacksOn("const s = `toolbar ?? defaultToolbar`;", "toolbar")).toEqual([]);
	});

	it("is not fooled by an apostrophe in nearby JSX text", () => {
		// The precise trap that broke a hand-rolled comment stripper in 01-19.1:
		// `don't` opens a phantom single-quoted string and desynchronises every
		// classification after it. An AST has no such state.
		const source = "const el = <p>don't simplify this</p>;\nconst x = toolbar ?? bar;\n";
		expect(nullishFallbacksOn(source, "toolbar")).toHaveLength(1);
	});

	it("ignores a nullish fallback on a DIFFERENT identifier", () => {
		expect(nullishFallbacksOn('const p = placeholder ?? "";', "toolbar")).toEqual([]);
	});

	it("known limit: an aliased toolbar is out of reach of a literal AST match", () => {
		// Stated rather than papered over. The behavioural test is what covers this
		// shape — it reads the rendered DOM, so the spelling cannot matter.
		const aliased = "const t = toolbar;\nconst x = t ?? defaultToolbar;";
		expect(nullishFallbacksOn(aliased, "toolbar")).toEqual([]);
	});
});
