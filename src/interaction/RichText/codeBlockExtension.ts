/**
 * # The opt-in code-block extension — F-14-2
 *
 * This module exists to be **unreachable except through a dynamic import**, and
 * that is its whole design constraint. Everything that mentions `lowlight`,
 * `highlight.js` or `@tiptap/extension-code-block-lowlight` lives here and
 * nowhere else, so a `RichText` that does not opt into code blocks never puts any
 * of it in its static module graph.
 *
 * ## The measurement that motivates it
 *
 * `CodeBlockLowlight` used to be registered unconditionally, so **every** mount
 * paid for a six-language grammar set to edit a résumé bullet. Measured on a
 * consumer-shaped bundle of `dist/components/RichText.js`, before this change:
 *
 * | | raw | gzip | modules |
 * |---|---:|---:|---:|
 * | eager (entry + static chunks) | 431,344 B | 139,280 B | 127, incl. lowlight x3, highlight.js x2 |
 * | async (six grammar chunks) | 33,395 B | 12,743 B | 12, all highlight.js |
 *
 * The 12,743 B is F-14-2's "12,718 B gzip", reproduced within 25 bytes. The
 * grammars were *already* dynamically imported; what was not deferred was the
 * `lowlight` instance, the `CodeBlockLowlight` extension and the `highlight.js`
 * core they pull, and — much more to the point — the six grammar chunks were
 * fetched on **every** mount, because the loader ran from an unconditional
 * effect. Deferring the registration is what stops the fetch.
 *
 * ## Why the grammars are awaited before the extension is returned
 *
 * The previous arrangement registered `CodeBlockLowlight` against an *empty*
 * `lowlight` instance and then, once the grammars arrived, re-set the whole
 * document with `{ emitUpdate: false }` to force the decoration plugin to
 * re-highlight — because that plugin only recomputes on a `docChanged`
 * transaction. Awaiting the grammars here means the extension is never handed to
 * an editor before it can highlight, so that re-set (and its selection-restoring
 * dance, and its interaction with the controlled-value guard) is deleted rather
 * than kept working. Strictly less machinery for strictly better behaviour.
 */

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";

/**
 * Module-scope singletons. Both are reached only after this module has been
 * dynamically imported, so "module scope" here means "after the consumer asked
 * for code blocks", not "at package import time".
 */
const lowlight = createLowlight();

let grammarsPromise: Promise<void> | null = null;

/**
 * The six grammars, fetched and registered at most once across every RichText
 * instance and re-mount. Kept as separate dynamic imports so a bundler emits one
 * chunk per language and a consumer that never opens a code block never fetches
 * any of them.
 */
function loadCodeGrammars(): Promise<void> {
	if (grammarsPromise) return grammarsPromise;
	grammarsPromise = Promise.all([
		import("highlight.js/lib/languages/xml"),
		import("highlight.js/lib/languages/css"),
		import("highlight.js/lib/languages/javascript"),
		import("highlight.js/lib/languages/typescript"),
		import("highlight.js/lib/languages/json"),
		import("highlight.js/lib/languages/python"),
	]).then(([xml, css, javascript, typescript, json, python]) => {
		lowlight.register("html", xml.default);
		lowlight.register("css", css.default);
		lowlight.register("js", javascript.default);
		lowlight.register("javascript", javascript.default);
		lowlight.register("ts", typescript.default);
		lowlight.register("typescript", typescript.default);
		lowlight.register("json", json.default);
		lowlight.register("python", python.default);
	});
	return grammarsPromise;
}

/**
 * The languages the toolbar's selector offers, colocated with the grammars they
 * need so the two cannot drift. Returned from `createCodeBlockExtension` rather
 * than exported for a static import: the selector only renders when the cursor is
 * inside a code block, which cannot happen before this module has loaded, so
 * there is no case where `index.tsx` needs the list earlier than the extension.
 */
const CODE_LANGUAGES = [
	{ value: "plaintext", label: "Plain text" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "python", label: "Python" },
] as const;

export interface CodeBlockSupport {
	/**
	 * A `CodeBlockLowlight` whose grammars are already registered.
	 *
	 * Typed `unknown` deliberately: naming TipTap's `AnyExtension` here would put
	 * a `@tiptap/core` type import in `index.tsx` for a value it only ever passes
	 * straight back into an extensions array — one more edge for a future
	 * refactor to turn into a value import. The array position checks it.
	 */
	extension: unknown;
	languages: readonly { value: string; label: string }[];
}

/** Resolve to the code-block extension with its grammars already registered. */
export async function createCodeBlockSupport(): Promise<CodeBlockSupport> {
	await loadCodeGrammars();
	return {
		extension: CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
		languages: CODE_LANGUAGES,
	};
}
