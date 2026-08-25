import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * E29. A story must not own its colour mode.
 *
 * `src/tokens.css` declares its dark block as `:root.dark, .dark`, so a wrapper
 * inside a story that carries the class re-declares roughly fifty neutral dark
 * tokens BELOW the brand layer, while `src/themes/monochrome.css` is scoped to
 * `:root[data-brand="monochrome"]` and cannot reach inside it. Measured
 * consequence: a monochrome-dark probe inside such a wrapper read `--cream`
 * `#181818` (the design system's neutral) instead of monochrome's `#161616`, and
 * `--wire` `rgba(255,255,255,0.22)` instead of `#727268` — so the capture pinned
 * the DEFAULT brand while still looking plausibly dark. Plan 01-19.1 measured
 * both values in a real browser before and after removing the wrappers.
 *
 * Dark is requested through the Storybook theme global instead
 * (`globals: { theme: "dark" }`), which `.storybook/preview.tsx`'s decorator
 * applies to `document.documentElement` in a single pass. Every `.dark` rule in
 * the system uses a descendant combinator, so all of them still match from
 * `<html>`.
 *
 * WHY THIS IS AN AST CHECK AND NOT A GREP. Five gates in phase 01 shipped
 * matching a prose comment rather than code, and this repository contains all
 * four of the traps that cause it: `className="dark"` appears inside JSDoc prose
 * (StatusPill, ConfirmDialog), inside a docs code sample in a template literal
 * (CommandPalette), and a hand-rolled comment stripper desynchronises on an
 * apostrophe in JSX text (`don't` in Tabs.stories.tsx) and mis-classifies a real
 * attribute as a string. The TypeScript parser is immune to all four by
 * construction. `ignores comments, strings and template literals` below pins
 * that immunity with fixtures, so the guard cannot silently regress into a grep.
 */

const STORY_ROOT = "src";

function storyFiles(root = STORY_ROOT): string[] {
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

function parse(file: string, source = readFileSync(file, "utf8")) {
	return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function line(sf: ts.SourceFile, node: ts.Node) {
	return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

const isDarkClassValue = (value: string) => value.split(/\s+/).includes("dark");

/**
 * Literal class values that include `dark` as a standalone class, applied either
 * declaratively (`className` / `class` JSX attribute) or imperatively
 * (`classList.add("dark")`, `el.className = "dark"`).
 *
 * KNOWN LIMIT, stated rather than hidden: a *computed* class name —
 * `clsx("dark")`, `"da" + "rk"`, or a variable — is beyond a static literal
 * check, and plan 01-19.1 verified by experiment that all three slip past this
 * function. They are not the shape anyone writes by accident, and the real
 * backstop is mechanism-independent: `tests/visual/brand-isolation.spec.ts`
 * asserts in a browser that under monochrome the ONLY element carrying `.dark` is
 * `<html>`, which catches any reintroduction however it was spelled.
 */
function findDarkWrappers(sf: ts.SourceFile): string[] {
	const hits: string[] = [];
	const literal = (node: ts.Node | undefined): string | null => {
		if (!node) return null;
		if (ts.isStringLiteralLike(node)) return node.text;
		if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression))
			return node.expression.text;
		return null;
	};
	(function visit(n: ts.Node) {
		// <div className="dark"> and the invalid-but-plausible <div class="dark">
		if (ts.isJsxAttribute(n) && /^class(Name)?$/.test(n.name.getText(sf))) {
			const value = literal(n.initializer);
			if (value !== null && isDarkClassValue(value))
				hits.push(`${sf.fileName}:${line(sf, n)} ${n.name.getText(sf)}="${value}"`);
		}
		// el.classList.add("dark") — but NOT on the document root, which is the
		// correct place for it: `.storybook/preview.tsx` puts the class on
		// document.documentElement deliberately, and every `.dark` rule in the
		// system uses a descendant combinator so it still matches from there. The
		// defect is a SCOPED wrapper, i.e. the class on anything that is not the root.
		if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
			const callee = n.expression.getText(sf);
			if (
				/\.classList\.(add|toggle)$/.test(callee) &&
				!/documentElement\.classList\.\w+$/.test(callee)
			)
				for (const arg of n.arguments) {
					const value = literal(arg);
					if (value !== null && isDarkClassValue(value))
						hits.push(`${sf.fileName}:${line(sf, n)} ${callee}("${value}")`);
				}
		}
		// el.className = "dark"
		if (
			ts.isBinaryExpression(n) &&
			n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
			ts.isPropertyAccessExpression(n.left) &&
			n.left.name.getText(sf) === "className" &&
			!/documentElement$/.test(n.left.expression.getText(sf))
		) {
			const value = literal(n.right);
			if (value !== null && isDarkClassValue(value))
				hits.push(`${sf.fileName}:${line(sf, n)} ${n.left.getText(sf)} = "${value}"`);
		}
		ts.forEachChild(n, visit);
	})(sf);
	return hits;
}

/**
 * `background: "#1c1917"` and friends. `#1c1917` is `DARK_BG` in
 * `.storybook/preview.tsx` — Storybook's own chrome constant, not a token. A
 * story pinning it defeats the brand exactly as the class does: `preview.tsx`
 * reads its backdrop from the cascade (`var(--cream)`) precisely so the backdrop
 * tracks whichever brand is mounted.
 */
const DARK_HEXES = /^#(?:1c1917|181818|161616|0c0a09)$/i;

function findPinnedDarkBackgrounds(sf: ts.SourceFile): string[] {
	const hits: string[] = [];
	(function visit(n: ts.Node) {
		if (
			ts.isPropertyAssignment(n) &&
			/^(background|backgroundColor)$/.test(n.name.getText(sf).replace(/['"]/g, "")) &&
			ts.isStringLiteral(n.initializer) &&
			DARK_HEXES.test(n.initializer.text)
		)
			hits.push(`${sf.fileName}:${line(sf, n)} ${n.getText(sf)}`);
		ts.forEachChild(n, visit);
	})(sf);
	return hits;
}

/** `globals: { backgrounds: { value: "#1c1917" } }` — dark selected by hex match. */
function findHexDarkGlobals(sf: ts.SourceFile): string[] {
	const hits: string[] = [];
	(function visit(n: ts.Node) {
		if (ts.isPropertyAssignment(n) && n.name.getText(sf) === "globals") {
			const text = n.getText(sf);
			if (
				/backgrounds/.test(text) &&
				DARK_HEXES.test(`#${/#([0-9a-f]{6})/i.exec(text)?.[1] ?? ""}`)
			)
				hits.push(`${sf.fileName}:${line(sf, n)} ${text.replace(/\s+/g, " ")}`);
		}
		ts.forEachChild(n, visit);
	})(sf);
	return hits;
}

/**
 * DotGrid renders a decorative dot texture whose entire subject is a DARK hero
 * panel, in a fixed 480x240 demo tile, and it carries no `.dark` class — so it
 * cannot shadow the brand layer, which is the E29 mechanism. It is exempt
 * because the design system has no token meaning "a surface that is dark in both
 * modes": `--cream` follows the mode and `--ink` inverts with it. Raised as a
 * finding by plan 01-19.1 rather than worked around silently.
 */
const PINNED_BACKGROUND_EXEMPT = new Set(["src/foundation/DotGrid/DotGrid.stories.tsx"]);

describe("story files do not own their colour mode (E29)", () => {
	const files = storyFiles();

	it("finds the story files it is supposed to be guarding", () => {
		expect(files.length).toBeGreaterThan(70);
	});

	it("no story file declares a scoped dark wrapper", () => {
		const hits = files.flatMap((f) => findDarkWrappers(parse(f)));
		expect(hits).toEqual([]);
	});

	it("no story file pins a dark page colour instead of reading it from the cascade", () => {
		const hits = files
			.filter((f) => !PINNED_BACKGROUND_EXEMPT.has(f))
			.flatMap((f) => findPinnedDarkBackgrounds(parse(f)));
		expect(hits).toEqual([]);
	});

	it("no story requests dark by pinning a backgrounds hex instead of the theme global", () => {
		const hits = files.flatMap((f) => findHexDarkGlobals(parse(f)));
		expect(hits).toEqual([]);
	});

	it("the exemption list stays honest — every exempt file still exists and still pins one", () => {
		for (const f of PINNED_BACKGROUND_EXEMPT) {
			expect(findPinnedDarkBackgrounds(parse(f)).length).toBeGreaterThan(0);
		}
	});
});

describe("the E29 guard detects what it claims to detect", () => {
	const at = (src: string) => findDarkWrappers(parse("fixture.tsx", src));

	it("fires on a reintroduced wrapper, in both attribute spellings", () => {
		expect(at('export const S = () => <div className="dark">x</div>;')).toHaveLength(1);
		expect(at('export const S = () => <div className={"dark"}>x</div>;')).toHaveLength(1);
		expect(at('export const S = () => <div className="dark panel">x</div>;')).toHaveLength(1);
		expect(at('export const S = () => <div className="panel dark">x</div>;')).toHaveLength(1);
	});

	it("ignores comments, strings and template literals", () => {
		expect(at('// <div className="dark">\nexport const S = 1;')).toEqual([]);
		expect(at('/** wraps itself in `<div className="dark">` */\nexport const S = 1;')).toEqual([]);
		expect(at('export const SRC = `<div className="dark">x</div>`;')).toEqual([]);
		expect(at("export const S = { code: '<div className=\"dark\">' };")).toEqual([]);
	});

	it("is not fooled by an apostrophe in JSX text, which desynchronises a hand-rolled scanner", () => {
		// `don't` opens a phantom single-quoted string for a naive stripper, which
		// then mis-classifies the real attribute below it as string content.
		const src =
			'export const S = () => (<div>tabs that don\'t fit<span className="dark">x</span></div>);';
		expect(at(src)).toHaveLength(1);
	});

	it("also catches the imperative and misspelled routes", () => {
		expect(at('export const S = () => <div class="dark">x</div>;')).toHaveLength(1);
		expect(at('export const f = () => { el.classList.add("dark"); };')).toHaveLength(1);
		expect(at('export const f = () => { el.classList.toggle("dark", true); };')).toHaveLength(1);
		expect(at('export const f = () => { el.className = "dark"; };')).toHaveLength(1);
	});

	it("does not fire when the class is put on the document root, which is correct", () => {
		// This is exactly what .storybook/preview.tsx does, and it must stay legal.
		expect(
			at('export const f = () => { document.documentElement.classList.toggle("dark", d); };'),
		).toEqual([]);
		expect(
			at('export const f = () => { document.documentElement.classList.add("dark"); };'),
		).toEqual([]);
		expect(at('export const f = () => { document.documentElement.className = "dark"; };')).toEqual(
			[],
		);
		// ...but a scoped element is still caught.
		expect(at('export const f = () => { wrapper.classList.add("dark"); };')).toHaveLength(1);
	});

	it("documents its known limit: a computed class name is out of reach of a literal check", () => {
		// Verified by experiment in plan 01-19.1. These are NOT caught here, and
		// the browser-level assertion in tests/visual/brand-isolation.spec.ts is
		// what covers them — it reads the DOM, so the spelling cannot matter.
		expect(at('export const S = () => <div className={"da" + "rk"}>x</div>;')).toEqual([]);
		expect(at('export const S = () => <div className={clsx("dark")}>x</div>;')).toEqual([]);
		expect(at('const C = "dark"; export const S = () => <div className={C}>x</div>;')).toEqual([]);
	});

	it("does not fire on a class that merely contains the letters d-a-r-k", () => {
		expect(at('export const S = () => <div className="darkroom">x</div>;')).toEqual([]);
		expect(at('export const S = () => <div className="ds-dark-panel">x</div>;')).toEqual([]);
	});
});

describe(".storybook/preview.tsx keeps its own guarded wrapper", () => {
	const PREVIEW = ".storybook/preview.tsx";

	it("still carries the brand-conditional wrapper, which is correct and load-bearing", () => {
		// Under monochrome the class must be absent, or the design system's
		// ":root.dark, .dark" block re-declares its neutrals below the brand layer
		// on this very wrapper. Under the default brand it is redundant but
		// harmless, and every recorded baseline was captured with it present.
		expect(readFileSync(PREVIEW, "utf8")).toContain(
			'className={isMonochrome ? undefined : "dark"}',
		);
	});

	it("is not flagged by the story guard, because the value is conditional rather than literal", () => {
		expect(findDarkWrappers(parse(PREVIEW))).toEqual([]);
	});

	it("still reads its backdrop from the cascade rather than the chrome constant", () => {
		expect(readFileSync(PREVIEW, "utf8")).toContain('background: "var(--cream)"');
	});
});
