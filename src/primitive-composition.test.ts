import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Complex components must be built out of the design system's own primitives,
 * not raw HTML controls.
 *
 * This is not stylistic. A hand-rolled `<input>` inside a component silently
 * opts out of everything the primitive guarantees — the focus ring, the error
 * state, `aria-invalid`, label wiring, the disabled treatment, dark mode. The
 * failure mode is quiet: ColorInput shipped a raw input carrying
 * `className="ds-input"`, a class that does not exist anywhere in the
 * stylesheet (the real one is `.ds-atom-input`), so the field had *no*
 * design-system styling at all and nobody noticed.
 *
 * A handful of primitives legitimately own a native control — that is what makes
 * them primitives. Those are listed below with the reason.
 */

const SRC = __dirname;

function componentFiles(dir: string, acc: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) componentFiles(p, acc);
		else if (/\.tsx$/.test(entry) && !/\.(test|stories)\.tsx$/.test(entry)) acc.push(p);
	}
	return acc;
}

const rel = (f: string) => f.replace(`${SRC}/`, "");
const files = componentFiles(SRC);

/** Strip comments and JSX-comment blocks so prose about `<input>` is not a hit. */
function code(source: string): string {
	return source
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/^\s*\/\/.*$/gm, "");
}

/**
 * Primitives that own a native control, and why no wrapper is possible.
 */
const OWNS_NATIVE_CONTROL: Record<string, string> = {
	"inputs/TextInput/index.tsx": "is the text-field primitive",
	"inputs/Textarea/index.tsx": "is the multi-line field primitive",
	"inputs/Checkbox/index.tsx": "hides a native checkbox behind a styled box",
	"inputs/Radio/index.tsx": "hides a native radio behind a styled dot",
	"inputs/Toggle/index.tsx": "hides a native checkbox behind a styled switch",
	"inputs/RangeSlider/index.tsx": "overlays a native range input to capture drag",
	"inputs/NumberStepper/index.tsx":
		"is the numeric-entry primitive; its field is chrome-less by design, between two steppers",
	"inputs/FileInput/index.tsx":
		"a visually-hidden <input type=file> is the only way to open the OS file picker",
};

describe("primitive composition", () => {
	it("no component renders a raw <input> or <textarea>", () => {
		const offenders: string[] = [];
		for (const f of files) {
			const src = code(readFileSync(f, "utf8"));
			if (!/<(input|textarea)[\s/>]/.test(src)) continue;
			if (OWNS_NATIVE_CONTROL[rel(f)]) continue;
			offenders.push(rel(f));
		}
		expect(
			offenders,
			"compose <TextInput>/<Textarea> instead of a bare control — or add the file to OWNS_NATIVE_CONTROL with a reason",
		).toEqual([]);
	});

	it("no component renders a raw <a> for navigation", () => {
		// The Link primitive owns anchor styling, the focus ring and its variants.
		const offenders: string[] = [];
		for (const f of files) {
			if (rel(f).startsWith("foundation/Link/")) continue;
			// OverviewPage is the standalone Storybook landing page, built on its own
			// --ov-* design language rather than the component library.
			if (rel(f) === "OverviewPage.tsx") continue;
			const src = code(readFileSync(f, "utf8"));
			if (/<a\s[^>]*href=/.test(src)) offenders.push(rel(f));
		}
		expect(offenders, "compose <Link> instead of a bare <a href>").toEqual([]);
	});

	it("no component hand-rolls an icon-only button", () => {
		// An icon-only <button> with aria-label and a single icon child is exactly
		// IconButton. Seventeen of these existed across ten components, each
		// re-deriving the accessible name, the focus ring and the disabled state.
		const offenders: string[] = [];
		for (const f of files) {
			if (rel(f).startsWith("inputs/IconButton/")) continue;
			const src = code(readFileSync(f, "utf8"));
			// <button …aria-label="…"…> whose entire body is one self-closing element
			for (const m of src.matchAll(/<button\b([^>]*)>\s*<([A-Z]\w*)[^>]*\/>\s*<\/button>/g)) {
				if (/aria-label=/.test(m[1]!)) offenders.push(`${rel(f)} (${m[2]})`);
			}
		}
		expect(offenders, "use <IconButton label=… icon=… /> instead").toEqual([]);
	});

	/**
	 * Classes applied purely as semantic/test hooks, with no styling of their own.
	 * A **ratchet**: it may shrink, never grow. Anything new appearing here is far
	 * more likely to be a typo than a deliberate hook.
	 */
	const UNSTYLED_HOOKS = new Set([
		// Down from 17: .ds-atom-fileinput and .ds-atom-richtext-hints came off the
		// list when their inline transitions moved into the stylesheet.
		//
		// Root containers whose layout is set inline by the component; the class is
		// only a targeting hook.
		"ds-atom-colorpicker",
		"ds-atom-icon",
		"ds-atom-calendar-body",
		"ds-atom-confirm-panel",
		"ds-atom-fileinput--disabled",
		"ds-atom-fileinput--dragover",
		"ds-atom-fileinput-button",
		"ds-atom-inlineeditfield",
		"ds-atom-inlineeditfield-input",
		"ds-atom-inlineeditfield-wrap",
		"ds-atom-snackbar-progress",
		"ds-atom-table-body",
		"ds-atom-tabs-label",
		"ds-layout-splithero",
		"ds-sidebar-collapsed",
	]);

	it("every styled class a component references actually exists", () => {
		// The bug that started this: `className="ds-input"` named a class that is
		// defined nowhere — the real one is `.ds-atom-input` — so the field rendered
		// completely unstyled, and silently.
		const sheets = ["primitives.css", "utilities.css", "tokens.css"]
			.map((n) => readFileSync(join(SRC, n), "utf8"))
			.join("\n");
		// Components may also inject their own <style> block (ActionSheet does), so
		// those count as definitions too.
		const inlineSheets = files
			.map((f) => readFileSync(f, "utf8"))
			.filter((src) => src.includes("<style>"))
			.join("\n");
		const all = `${sheets}\n${inlineSheets}`;
		const defined = new Set([
			...[...all.matchAll(/\.((?:ds|jd)-[a-z0-9-]+)/g)].map((m) => m[1]!),
			// @keyframes names share the ds- prefix and appear in quoted `animation`
			// shorthands, so they read like class references without this.
			...[...all.matchAll(/@keyframes\s+((?:ds|jd)-[a-z0-9-]+)/g)].map((m) => m[1]!),
		]);

		const missing = new Map<string, string[]>();
		for (const f of files) {
			const src = code(readFileSync(f, "utf8"));
			for (const m of src.matchAll(/["'`]((?:ds|jd)-[a-z0-9-]+)["'`\s]/g)) {
				const cls = m[1]!;
				if (defined.has(cls) || UNSTYLED_HOOKS.has(cls)) continue;
				const where = missing.get(cls) ?? [];
				if (!where.includes(rel(f))) where.push(rel(f));
				missing.set(cls, where);
			}
		}
		expect(
			Object.fromEntries(missing),
			"class is referenced but defined nowhere — a typo, or add it to UNSTYLED_HOOKS if it is only a hook",
		).toEqual({});
	});
});
