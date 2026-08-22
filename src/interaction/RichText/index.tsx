/**
 * # RichText - DS-70 (D-17-14..D-17-19)
 *
 * Built on @tiptap/react 3.x + StarterKit + Link + Placeholder + UnderlineExtension.
 * Heaviest primitive in Phase 17 (~50-70 KB gzipped TipTap deps, externalized in tsup.config.ts).
 *
 * ## Controlled-value sync - DO NOT BREAK (RESEARCH.md § "Controlled Value Sync")
 *
 * TipTap is NOT natively a controlled component. The naive pattern infinite-loops:
 *   useEffect(() => editor.setContent(value), [value]); // BAD
 * because setContent fires onUpdate → onChange → parent setState → new value prop → effect → loop.
 *
 * Three-layer guard that prevents the loop:
 *   1. `lastEmittedRef` - tracks the last value we ourselves emitted so we can detect the echo
 *   2. a same-format comparison against the editor's current content - defensive equality check
 *   3. `{ emitUpdate: false }` passed to setContent - suppresses onUpdate even if both checks miss
 *
 * If you are tempted to "simplify" this sync by removing any of the three layers - don't.
 * Each layer catches a distinct race condition. The pattern is documented in RESEARCH.md.
 *
 * Layer 2 compares in whatever shape `outputFormat` names — HTML string against
 * `getHTML()`, markdown string against the serialized markdown, segments against
 * the serialized segments. Comparing a markdown value against `getHTML()` would
 * never match, so the guard would call `setContent` on every render and the
 * editor would fight the parent for the caret.
 *
 * ## Output formats (D-17-17, G-4)
 *
 * - `"html"` (default): `onChange(editor.getHTML())` — string
 * - `"json"`: `onChange(editor.getJSON())` — TipTap Doc object
 * - `"segments"`: `onChange(RichTextSegment[])` — `Array<{ text, emphasis? }>`
 * - `"markdown"`: `onChange(string)` — bold-only inline markdown, `Reduced **p95** by 40%`
 *
 * `"segments"` and `"markdown"` are the two lossless-by-construction shapes, and
 * the reason G-4 exists. They carry **bold and nothing else**, so a document
 * containing an italic run cannot be represented — and the finding measured that
 * happening in silence: seven authored runs became five segments with nothing in
 * the output naming which one was lost. Both formats therefore report:
 * `onSerializeLoss` is called with the marks and node types that could not be
 * carried, and if no handler is supplied the component warns on the console
 * instead. It cannot be silent. See `segments.ts` for the codec and its proof.
 *
 * With `outputFormat="json"` we do NOT update `lastEmittedRef` (consumers using
 * JSON output manage their own state sync — the component doesn't attempt to
 * round-trip JSON through getHTML).
 *
 * ## How `allow` and the loss report compose (and why neither is redundant)
 *
 * They solve adjacent halves of the same problem and are deliberately both here:
 *
 * - `allow={["bold"]}` makes an unrepresentable mark **unreachable**, so the loss
 *   cannot be created in the first place. In that configuration the report never
 *   fires — and a test asserts exactly that, so this claim is checked rather than
 *   promised.
 * - The loss report catches the case `allow` cannot: a consumer that **restricted
 *   less than it serialises**. `<RichText outputFormat="markdown" />` with no
 *   `allow` is a perfectly typed, perfectly plausible call in which every mark is
 *   reachable and only one is storable. That is the shape of the original defect.
 *
 * Delete either one and a real path to silent data loss reopens.
 *
 * ## Restricting what the editor can produce (G-3)
 *
 * The prop is `allow`, **not** `marks`, and the wider name is load-bearing rather
 * than cosmetic: it governs node types too. `⌘⌥2` produced an `<h2>` under the
 * old component, and a heading is a node, not a mark — so a prop called `marks`
 * that left headings reachable would not deliver the bold-only editor the résumé
 * bullet needs, while a prop called `marks` that disabled headings anyway would
 * be lying in its own name.
 *
 * `allow` configures **the extension list**, never the toolbar. That distinction
 * is the entire finding: suppressing the toolbar was never what made a mark
 * unreachable. Toolbar filtering happens too, but strictly as a *consequence* —
 * a button for an unregistered mark would be a button that does nothing.
 *
 * Two specific consequences worth naming, because each maps to a measured row:
 *
 * - **`autolink` goes with the link mark.** It was hardcoded on, which made the
 *   link the one mark reachable with *no keystroke at all* — typing a bare URL
 *   created one. Omitting `"link"` drops the whole Link extension, autolink
 *   included.
 * - **`⌘K` was never a keyboard binding.** The original gap wording said it was.
 *   It is a toolbar button the component nevertheless advertised in its hint
 *   list, which is why the hint strip is now filtered by `allow` as well.
 *
 * Omitting `allow` entirely leaves every mark registered exactly as before.
 *
 * ## Code blocks are opt-in (F-14-2)
 *
 * `"codeBlock"` is the one feature **not** in `RICHTEXT_DEFAULT_FEATURES`. The
 * extension and its `lowlight` instance live in `codeBlockExtension.ts` and are
 * reached only through a dynamic `import()`, so a default RichText has no
 * lowlight and no highlight.js in its static module graph and fetches none of the
 * six grammar chunks. Registering a six-language syntax highlighter to edit a
 * prose bullet was F-14-2; the numbers are in that module's header.
 *
 * Every *mark* still ships by default, including the inline `code` mark. Only the
 * code-block **node** moved behind the flag. An existing consumer that wants it
 * back writes `allow={[...RICHTEXT_DEFAULT_FEATURES, "codeBlock"]}`.
 *
 * ## Sanitization (D-17-18)
 *
 * StarterKit's extension allowlist filters tags/attrs on paste - equivalent to schema-based
 * sanitization. Inline <script>, <style>, <font>, JS-URL anchors, <iframe>, etc. are stripped
 * during ProseMirror schema parse. NO DOMPurify dependency in v0.6.
 *
 * Server-side sanitization is the consumer's responsibility (recommend sanitize-html or DOMPurify).
 *
 * `outputFormat="html"` is kept for the consumers that already use it, but it is
 * no longer the recommended choice: a markup string is exactly the thing whose
 * existence reopens the stored-XSS class the segment shapes design out. README.md
 * states the reasoning; the escape stays available.
 *
 * ## Threat model
 *
 * - T-17-13-01: XSS via paste - TipTap allowlist mitigates (cited in file header for traceability)
 * - T-17-13-02: XSS via server-side persistence - caller's responsibility (see above)
 * - T-17-13-03: Crafted initial value HTML - same schema parse on setContent; script tags stripped
 * - T-17-13-04: javascript: links - TipTap Link extension defaults filter out javascript:/data: URLs
 * - T-17-01: silent loss of an unrepresentable mark on serialize - reported, never dropped in silence
 *
 * ## Underline extension
 *
 * TipTap StarterKit 3.x does NOT include the Underline extension - it ships separately as
 * @tiptap/extension-underline. Imported as `UnderlineExtension` to avoid collision with the
 * `Underline` icon component imported from ./icons.
 */

import HighlightExtension from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { EditorContent, type Extensions, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Highlighter } from "lucide-react";
import { type CSSProperties, type ReactNode, forwardRef, useEffect, useRef, useState } from "react";
import { DSDropdown } from "../../_internals/DSDropdown";
import { DSPortal } from "../../_internals/DSPortal";
import {
	Bold,
	ChevronDown,
	Code,
	Heading2,
	Italic,
	Link2,
	List,
	ListOrdered,
	Minus,
	Moon,
	Quote,
	Strikethrough,
	Sun,
	Underline,
} from "../../icons";
import { Button } from "../../inputs/Button";
import { Kbd } from "../../inputs/Kbd";
import { Select } from "../../inputs/Select";
import { TextInput } from "../../inputs/TextInput";
import type { CodeBlockSupport } from "./codeBlockExtension";
import {
	type RichTextSegment,
	type RichTextSerializeLoss,
	docToMarkdown,
	docToSegments,
	markdownToDoc,
	segmentsToDoc,
} from "./segments";

export type {
	RichTextSegment,
	RichTextSerializeLoss,
	RichTextSerializeResult,
} from "./segments";

// ─── Public types ──────────────────────────────────────────────────────────

/**
 * One editing capability. Marks and node types share the list on purpose: a
 * bold-only editor needs both suppressed, and splitting them into two props
 * would let a caller restrict half of what it meant to.
 */
export type RichTextFeature =
	// marks
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "code"
	| "highlight"
	| "link"
	// node types
	| "heading"
	| "bulletList"
	| "orderedList"
	| "blockquote"
	| "horizontalRule"
	| "codeBlock";

/**
 * What `<RichText />` registers when `allow` is omitted — every mark and every
 * node type the component has ever offered, **except** `codeBlock`.
 *
 * Exported so a consumer that does want code blocks can write
 * `allow={[...RICHTEXT_DEFAULT_FEATURES, "codeBlock"]}` rather than re-listing
 * twelve features and silently missing one a later version adds.
 */
export const RICHTEXT_DEFAULT_FEATURES: readonly RichTextFeature[] = [
	"bold",
	"italic",
	"underline",
	"strike",
	"code",
	"highlight",
	"link",
	"heading",
	"bulletList",
	"orderedList",
	"blockquote",
	"horizontalRule",
];

export interface RichTextProps {
	/**
	 * Controlled value, in whatever shape `outputFormat` names: an HTML string
	 * (default), a TipTap JSON Doc object, a `RichTextSegment[]`, or a bold-only
	 * inline-markdown string.
	 */
	value: string | object;
	/**
	 * Called on every editor change with the updated value, in the shape
	 * `outputFormat` names. `"segments"` emits a `RichTextSegment[]` (an `object`
	 * as far as this signature is concerned); `"markdown"` emits a string.
	 */
	onChange: (value: string | object) => void;
	/** Placeholder text shown in the empty editor surface. */
	placeholder?: string;
	/** When true, hides the toolbar and makes the editor non-editable.
	 * @default false
	 */
	readOnly?: boolean;
	/**
	 * Output format emitted to `onChange`.
	 *
	 * - `"html"` — a string. Kept for existing consumers; see README on why a new
	 *   consumer should not choose it.
	 * - `"json"` — a TipTap Doc object.
	 * - `"segments"` — `RichTextSegment[]`, bold-only and lossless by construction.
	 * - `"markdown"` — bold-only inline markdown, the recommended stored shape.
	 *
	 * The last two report anything they cannot carry via `onSerializeLoss`.
	 * @default "html"
	 */
	outputFormat?: "html" | "json" | "segments" | "markdown";
	/**
	 * Which marks and node types the editor may produce. Configures the TipTap
	 * **extension list**, so a suppressed feature is unreachable by keyboard, by
	 * input rule and by autolink — not merely missing from the toolbar.
	 *
	 * Omit for {@link RICHTEXT_DEFAULT_FEATURES}. `allow={[]}` is a plain-text
	 * editor; `allow={["bold"]}` is the bold-only editor a résumé bullet wants.
	 */
	allow?: readonly RichTextFeature[];
	/**
	 * Called when a serialize could not carry something the document contains.
	 * Only ever fires for `outputFormat="segments"` and `"markdown"`.
	 *
	 * If omitted the component warns on the console once per distinct message,
	 * because the one behaviour this must not have is silence.
	 */
	onSerializeLoss?: (loss: RichTextSerializeLoss) => void;
	/**
	 * Replace the default toolbar with a custom ReactNode; pass `null` to suppress
	 * the toolbar entirely.
	 *
	 * `null` genuinely suppresses it. It used to select the default toolbar
	 * instead — the nullish-coalescing fallback this once used falls through on
	 * exactly the value the docstring prescribed for suppression — so the twelve
	 * default buttons rendered for every consumer who followed the documentation.
	 * Suppression is now keyed on the prop being `undefined`, which is the only
	 * way to tell "not passed" from "explicitly nothing".
	 */
	toolbar?: ReactNode;
	/** Additional className applied to the inner editor surface wrapper. */
	className?: string;
	/** Accessible label for the editor region.
	 * @default "Rich text editor"
	 */
	ariaLabel?: string;
	/** Inline styles applied to the outer root wrapper. */
	style?: CSSProperties;
	/** Borderless/inline mode: strips the editor chrome (border, background, padding,
	 * min-height) so the editor sits inline inside a card or click-to-edit surface.
	 * Purely additive - default keeps the bordered "card" appearance.
	 * @default false
	 */
	inline?: boolean;
	/** Show a keyboard-shortcut hint strip (⌘B ⌘I ⌘U ⌘⇧H ⌘K ⌘↵ Esc) that is revealed
	 * while the editor has focus. Suppressed in `readOnly` mode, and filtered by
	 * `allow` so it never advertises a shortcut the editor cannot honour.
	 * @default false
	 */
	hints?: boolean;
}

// ─── Keyboard-shortcut hint strip items ──────────────────────────────────────
// Mirrors Cairn's HINT_ITEMS / PREP_Q_HINTS so click-to-edit surfaces stay consistent.
//
// `feature` ties each row to the capability it describes, so the strip cannot
// advertise ⌘I to an editor that has no italic extension. ⌘↵ and Esc carry no
// feature: they are always available. ⌘K is listed against "link" even though it
// is not a keyboard binding at all — the strip inherited that error from the
// component's own hint list, and filtering it by the link feature at least stops
// it being advertised to an editor that has no link mark either.

const HINT_ITEMS: { key: string; label: string; feature?: RichTextFeature }[] = [
	{ key: "⌘B", label: "Bold", feature: "bold" },
	{ key: "⌘I", label: "Italic", feature: "italic" },
	{ key: "⌘U", label: "Underline", feature: "underline" },
	{ key: "⌘⇧H", label: "Highlight", feature: "highlight" },
	{ key: "⌘K", label: "Link", feature: "link" },
	{ key: "⌘↵", label: "Save" },
	{ key: "Esc", label: "Discard" },
];

// ─── Heading menu items ────────────────────────────────────────────────────

const HEADING_ITEMS = [
	{ label: "Paragraph", markName: "paragraph" as const },
	{ label: "Heading 2", markName: "heading" as const, level: 2 },
	{ label: "Heading 3", markName: "heading" as const, level: 3 },
] as const;

// ─── Extension construction ────────────────────────────────────────────────

/**
 * Build the TipTap extension list from the allowed feature set.
 *
 * StarterKit's own options are the mechanism for the node types it brings:
 * it pushes each sub-extension only when its option is not `false`, so passing
 * `heading: false` removes the extension rather than hiding a button. `undefined`
 * means "default", which is why the ternaries below read the way they do.
 */
function buildExtensions(
	allowed: Set<RichTextFeature>,
	placeholder: string,
	codeBlock: CodeBlockSupport | null,
): Extensions {
	const lists = allowed.has("bulletList") || allowed.has("orderedList");
	return [
		StarterKit.configure({
			// StarterKit v3.22 bundles Link and Underline; `false` opts them out so
			// our own configured versions can be added below without a
			// "Duplicate extension" warning. codeBlock is always opted out here —
			// when it is allowed at all it arrives as CodeBlockLowlight instead.
			link: false,
			underline: false,
			codeBlock: false,
			bold: allowed.has("bold") ? undefined : false,
			italic: allowed.has("italic") ? undefined : false,
			strike: allowed.has("strike") ? undefined : false,
			code: allowed.has("code") ? undefined : false,
			heading: allowed.has("heading") ? undefined : false,
			bulletList: allowed.has("bulletList") ? undefined : false,
			orderedList: allowed.has("orderedList") ? undefined : false,
			// A listItem with no list to live in is an unreachable node type, and
			// leaving it registered would put a schema node in the document model
			// that nothing can ever create.
			listItem: lists ? undefined : false,
			listKeymap: lists ? undefined : false,
			blockquote: allowed.has("blockquote") ? undefined : false,
			horizontalRule: allowed.has("horizontalRule") ? undefined : false,
		}),
		// autolink travels with the link mark. It is why the link was the one mark
		// reachable with no keystroke at all.
		...(allowed.has("link") ? [Link.configure({ openOnClick: false, autolink: true })] : []),
		// NOTE: UnderlineExtension - renamed import to avoid collision with Underline icon
		...(allowed.has("underline") ? [UnderlineExtension] : []),
		// NOTE: HighlightExtension - multicolor:false keeps output as plain <mark>
		...(allowed.has("highlight") ? [HighlightExtension.configure({ multicolor: false })] : []),
		// The cast is the one place codeBlockExtension.ts's deliberately loose
		// `unknown` is narrowed. Keeping the loose type there is what stops a
		// @tiptap/core type import appearing in this file for a value that only
		// travels straight into this array.
		...(codeBlock ? [codeBlock.extension as Extensions[number]] : []),
		Placeholder.configure({ placeholder }),
	];
}

// ─── Component ────────────────────────────────────────────────────────────

export const RichText = forwardRef<HTMLDivElement, RichTextProps>(function RichText(
	{
		value,
		onChange,
		placeholder,
		readOnly = false,
		outputFormat = "html",
		allow,
		onSerializeLoss,
		toolbar,
		className,
		ariaLabel = "Rich text editor",
		style,
		inline = false,
		hints = false,
	},
	ref,
) {
	// Layer 1 of the three-layer guard: track what we last emitted. Always a
	// string — segments are compared as their JSON serialization.
	const lastEmittedRef = useRef<string>(typeof value === "string" ? value : "");

	// Button anchor refs for floating UI
	const linkBtnRef = useRef<HTMLButtonElement | null>(null);
	const headingBtnRef = useRef<HTMLButtonElement | null>(null);

	// Link popover state
	const [linkOpen, setLinkOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");

	// Heading dropdown state
	const [headingOpen, setHeadingOpen] = useState(false);
	const [headingActiveIndex, setHeadingActiveIndex] = useState(0);
	const [codeBlockDark, setCodeBlockDark] = useState(false);

	// Focus state - drives the optional keyboard-shortcut hint strip reveal.
	const [focused, setFocused] = useState(false);

	// ── Allowed feature set ────────────────────────────────────────────────
	// A stable string key so useEditor's dep array does not see a fresh array
	// identity on every render and tear the editor down each time.
	const allowKey = (allow ?? RICHTEXT_DEFAULT_FEATURES).join(",");
	const allowed = new Set<RichTextFeature>(allow ?? RICHTEXT_DEFAULT_FEATURES);
	const has = (feature: RichTextFeature) => allowed.has(feature);

	// ── Opt-in code block (F-14-2) ─────────────────────────────────────────
	// The dynamic import is the whole point: nothing here reaches lowlight,
	// highlight.js or @tiptap/extension-code-block-lowlight unless a consumer
	// asked for code blocks.
	const wantsCodeBlock = has("codeBlock");
	const [codeBlock, setCodeBlock] = useState<CodeBlockSupport | null>(null);
	useEffect(() => {
		if (!wantsCodeBlock || codeBlock) return;
		let cancelled = false;
		import("./codeBlockExtension").then(async (module) => {
			const support = await module.createCodeBlockSupport();
			if (!cancelled) setCodeBlock(support);
		});
		return () => {
			cancelled = true;
		};
	}, [wantsCodeBlock, codeBlock]);

	// When code blocks are requested we render the loading skeleton until the
	// extension has arrived, rather than mounting an editor without it and
	// swapping later. The editor IS recreated when `codeBlock` resolves — but
	// nobody has typed into the first one, because it was never shown, so the
	// recreate cannot lose an edit.
	const codeBlockReady = !wantsCodeBlock || codeBlock !== null;

	// ── Serialization helpers ──────────────────────────────────────────────
	const lastWarnedRef = useRef<string>("");
	const reportLoss = (loss: RichTextSerializeLoss) => {
		if (loss.count === 0) return;
		if (onSerializeLoss) {
			onSerializeLoss(loss);
			return;
		}
		// No handler: warn rather than swallow. Deduped by message so a per-keystroke
		// onUpdate does not flood the console, but never suppressed entirely — the
		// finding is that this loss was undetectable, and a console line is the
		// floor for detectability when the consumer has opted out of handling it.
		if (loss.message !== lastWarnedRef.current) {
			lastWarnedRef.current = loss.message;
			console.warn(`[RichText] ${loss.message}`);
		}
	};

	// ── Initial content, in whatever shape the caller passed ───────────────
	const initialContent: string | object =
		outputFormat === "markdown" && typeof value === "string"
			? markdownToDoc(value)
			: outputFormat === "segments" && Array.isArray(value)
				? segmentsToDoc(value as RichTextSegment[])
				: value;

	// ── TipTap editor instance ─────────────────────────────────────────────
	const editor = useEditor(
		{
			extensions: buildExtensions(allowed, placeholder ?? "", codeBlock),
			content: initialContent,
			editable: !readOnly,
			// TipTap renders the ProseMirror surface as a contenteditable with an
			// implicit `textbox` role, and a textbox must have an accessible name.
			// `ariaLabel` used to be applied only to the outer wrapper <div>, whose
			// `generic` role cannot carry a name — so the editable region itself
			// reached assistive tech unnamed (axe: aria-input-field-name).
			//
			// Applied only when editable: with `readOnly` the surface renders
			// `contenteditable="false"`, which drops it back to the `generic` role —
			// and naming a generic element is prohibited, not merely ignored.
			// (`aria-placeholder` is deliberately not set: it is invalid on a generic
			// role for the same reason, and the Placeholder extension already renders
			// the hint visually.)
			//
			// `editorProps` is always an object: passing `undefined` explicitly
			// overwrites TipTap's own default editorProps (which carry
			// dispatchTransaction), and the editor throws while mounting.
			editorProps: {
				attributes: readOnly
					? {}
					: {
							// Explicit role="textbox" alongside the label: a contenteditable div
							// has an *implicit* textbox role, but axe (and older assistive tech)
							// does not always infer it, so `aria-label` on it read as a naming
							// violation on a role-less div. Stating the role removes the
							// ambiguity. aria-multiline says it accepts newlines.
							role: "textbox",
							"aria-multiline": "true",
							"aria-label": ariaLabel,
						},
			},
			// MANDATORY: SSR-safe per D-17-19. Without this TipTap throws during SSR hydration.
			immediatelyRender: false,
			// Focus tracking only drives the optional `hints` strip; no behavioral impact when off.
			onFocus: () => setFocused(true),
			onBlur: () => setFocused(false),
			onUpdate: ({ editor }) => {
				if (outputFormat === "markdown") {
					const { markdown, loss } = docToMarkdown(editor.getJSON());
					reportLoss(loss);
					lastEmittedRef.current = markdown;
					onChange(markdown);
					return;
				}
				if (outputFormat === "segments") {
					const { segments, loss } = docToSegments(editor.getJSON());
					reportLoss(loss);
					lastEmittedRef.current = JSON.stringify(segments);
					onChange(segments);
					return;
				}
				if (outputFormat === "json") {
					// JSON output: emit TipTap Doc object; don't sync lastEmittedRef
					// (consumers using JSON output manage their own state)
					onChange(editor.getJSON());
					return;
				}
				const html = editor.getHTML();
				// Layer 1 update: record this emission so we can detect the echo below
				lastEmittedRef.current = html;
				onChange(html);
			},
		},
		// The editor is rebuilt when the extension set changes. `allowKey` is a
		// joined string rather than the array so a caller passing a fresh literal
		// each render does not remount the editor on every keystroke.
		[allowKey, codeBlock, outputFormat],
	);

	// ── Controlled value → editor sync (three-layer guard) ─────────────────
	// Called every time the parent passes a new value prop.
	// We must NOT call setContent when the change originated from our own onUpdate
	// (parent echoes our emission back as value) - that would loop.
	useEffect(() => {
		if (!editor) return;

		if (outputFormat === "markdown") {
			if (typeof value !== "string") return;
			// Layer 1: skip if parent just echoed back what we emitted
			if (value === lastEmittedRef.current) return;
			// Layer 2: defensive equality, in the SAME shape — comparing markdown to
			// getHTML() would never match and would setContent on every render
			if (value === docToMarkdown(editor.getJSON()).markdown) return;
			// Layer 3: { emitUpdate: false } prevents setContent from firing onUpdate
			editor.commands.setContent(markdownToDoc(value), { emitUpdate: false });
			return;
		}

		if (outputFormat === "segments") {
			if (!Array.isArray(value)) return;
			const incoming = JSON.stringify(value);
			if (incoming === lastEmittedRef.current) return;
			if (incoming === JSON.stringify(docToSegments(editor.getJSON()).segments)) return;
			editor.commands.setContent(segmentsToDoc(value as RichTextSegment[]), {
				emitUpdate: false,
			});
			return;
		}

		// Only HTML sync is supported for the remaining formats; JSON consumers own
		// their own state management
		if (typeof value !== "string") return;
		if (value === lastEmittedRef.current) return;
		if (value === editor.getHTML()) return;
		editor.commands.setContent(value, { emitUpdate: false });
	}, [editor, value, outputFormat]);

	// ── readOnly toggle ────────────────────────────────────────────────────
	useEffect(() => {
		if (!editor) return;
		if (editor.isEditable !== !readOnly) {
			editor.setEditable(!readOnly);
		}
	}, [editor, readOnly]);

	// ── Loss report for the INITIAL value ──────────────────────────────────
	// The dangerous case is not a keystroke, it is a consumer handing HTML with
	// italics to a markdown-output editor and never touching it: onUpdate would
	// never fire, so the loss would only appear on the first edit — after the
	// operator had already stopped looking.
	// biome-ignore lint/correctness/useExhaustiveDependencies: `reportLoss` closes over `onSerializeLoss`, so listing it would re-run this on every parent render that passes a fresh handler — double-reporting alongside onUpdate. The effect is deliberately keyed on the editor and the format only.
	useEffect(() => {
		if (!editor) return;
		if (outputFormat !== "markdown" && outputFormat !== "segments") return;
		reportLoss(docToSegments(editor.getJSON()).loss);
	}, [editor, outputFormat]);

	// ── Helpers ───────────────────────────────────────────────────────────
	const isActive = (name: string, attrs?: Record<string, unknown>) =>
		editor?.isActive(name, attrs) ?? false;

	const activeHeadingLabel = (): string => {
		if (isActive("heading", { level: 2 })) return "H2";
		if (isActive("heading", { level: 3 })) return "H3";
		return "P";
	};

	// ── Default toolbar ───────────────────────────────────────────────────
	// Every group is gated on the feature being registered. This is toolbar
	// filtering as a CONSEQUENCE of the extension set, which is the right
	// direction — the finding's complaint is about doing it the other way round,
	// where hiding a button left the mark reachable by keyboard.
	const defaultToolbar = (
		<div role="toolbar" aria-label="Formatting" className="ds-atom-richtext-toolbar">
			{/* ── Inline marks group ──────────────────────────── */}
			{has("bold") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Bold"
					aria-pressed={isActive("bold")}
					data-active={isActive("bold") || undefined}
					onClick={() => editor?.chain().focus().toggleBold().run()}
				>
					<Bold size={16} />
				</Button>
			)}
			{has("italic") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Italic"
					aria-pressed={isActive("italic")}
					data-active={isActive("italic") || undefined}
					onClick={() => editor?.chain().focus().toggleItalic().run()}
				>
					<Italic size={16} />
				</Button>
			)}
			{has("underline") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Underline"
					aria-pressed={isActive("underline")}
					data-active={isActive("underline") || undefined}
					onClick={() => editor?.chain().focus().toggleUnderline().run()}
				>
					<Underline size={16} />
				</Button>
			)}
			{has("highlight") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Highlight"
					aria-pressed={isActive("highlight")}
					data-active={isActive("highlight") || undefined}
					onClick={() => editor?.chain().focus().toggleHighlight().run()}
				>
					<Highlighter size={16} />
				</Button>
			)}
			{has("strike") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Strikethrough"
					aria-pressed={isActive("strike")}
					data-active={isActive("strike") || undefined}
					onClick={() => editor?.chain().focus().toggleStrike().run()}
				>
					<Strikethrough size={16} />
				</Button>
			)}
			{has("code") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Inline code"
					aria-pressed={isActive("code")}
					data-active={isActive("code") || undefined}
					onClick={() => editor?.chain().focus().toggleCode().run()}
				>
					<Code size={16} />
				</Button>
			)}

			{/* Language selector + dark toggle - only visible when cursor is inside a code block */}
			{codeBlock && isActive("codeBlock") && (
				<>
					<Select
						options={codeBlock.languages.map((l) => ({ value: l.value, label: l.label }))}
						value={editor?.getAttributes("codeBlock").language ?? "plaintext"}
						onChange={(lang) =>
							editor?.chain().focus().updateAttributes("codeBlock", { language: lang }).run()
						}
						style={{ height: 28, width: "fit-content", minWidth: 110, fontSize: 11 }}
					/>
					<Button
						variant="ghost"
						size="sm"
						aria-label={codeBlockDark ? "Switch code block to light" : "Switch code block to dark"}
						aria-pressed={codeBlockDark}
						data-active={codeBlockDark || undefined}
						onClick={() => setCodeBlockDark((d) => !d)}
					>
						{codeBlockDark ? <Sun size={16} /> : <Moon size={16} />}
					</Button>
				</>
			)}

			{has("heading") && (
				<>
					<span className="ds-atom-richtext-toolbar-divider" aria-hidden="true" />

					{/* ── Heading dropdown ─────────────────────────────── */}
					<Button
						ref={headingBtnRef}
						variant="ghost"
						size="sm"
						aria-label={`Heading style - currently ${activeHeadingLabel()}`}
						aria-haspopup="menu"
						aria-expanded={headingOpen}
						data-active={isActive("heading") || undefined}
						onClick={() => setHeadingOpen((o) => !o)}
					>
						<Heading2 size={16} />
						<ChevronDown size={12} />
					</Button>
					<DSDropdown
						anchorRef={headingBtnRef}
						open={headingOpen}
						onOpenChange={setHeadingOpen}
						activeIndex={headingActiveIndex}
						onActiveIndexChange={setHeadingActiveIndex}
						itemCount={HEADING_ITEMS.length}
						onSelect={(i) => {
							const item = HEADING_ITEMS[i];
							if (!item) return;
							if (item.markName === "paragraph") {
								editor?.chain().focus().setParagraph().run();
							} else {
								editor
									?.chain()
									.focus()
									.toggleHeading({ level: item.level as 2 | 3 })
									.run();
							}
							setHeadingOpen(false);
						}}
						typeAheadGetText={(i) => HEADING_ITEMS[i]?.label ?? ""}
						matchAnchorWidth={false}
					>
						<ul role="menu" className="ds-atom-richtext-headingmenu">
							{HEADING_ITEMS.map((item, i) => (
								<li
									key={item.label}
									role="presentation"
									data-active={headingActiveIndex === i || undefined}
								>
									<button
										type="button"
										role="menuitem"
										onClick={() => {
											if (item.markName === "paragraph") {
												editor?.chain().focus().setParagraph().run();
											} else {
												editor
													?.chain()
													.focus()
													.toggleHeading({ level: item.level as 2 | 3 })
													.run();
											}
											setHeadingOpen(false);
										}}
									>
										{item.label}
									</button>
								</li>
							))}
						</ul>
					</DSDropdown>
				</>
			)}

			{(has("bulletList") ||
				has("orderedList") ||
				has("blockquote") ||
				has("horizontalRule") ||
				has("link")) && <span className="ds-atom-richtext-toolbar-divider" aria-hidden="true" />}

			{/* ── Block formatting group ───────────────────────── */}
			{has("bulletList") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Bulleted list"
					aria-pressed={isActive("bulletList")}
					data-active={isActive("bulletList") || undefined}
					onClick={() => editor?.chain().focus().toggleBulletList().run()}
				>
					<List size={16} />
				</Button>
			)}
			{has("orderedList") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Ordered list"
					aria-pressed={isActive("orderedList")}
					data-active={isActive("orderedList") || undefined}
					onClick={() => editor?.chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered size={16} />
				</Button>
			)}
			{has("blockquote") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Blockquote"
					aria-pressed={isActive("blockquote")}
					data-active={isActive("blockquote") || undefined}
					onClick={() => editor?.chain().focus().toggleBlockquote().run()}
				>
					<Quote size={16} />
				</Button>
			)}
			{has("horizontalRule") && (
				<Button
					variant="ghost"
					size="sm"
					aria-label="Horizontal rule"
					onClick={() => editor?.chain().focus().setHorizontalRule().run()}
				>
					<Minus size={16} />
				</Button>
			)}

			{/* ── Link ─────────────────────────────────────────── */}
			{has("link") && (
				<Button
					ref={linkBtnRef}
					variant="ghost"
					size="sm"
					aria-label="Insert link"
					aria-pressed={isActive("link")}
					aria-expanded={linkOpen}
					data-active={isActive("link") || undefined}
					onClick={() => {
						// Pre-fill URL if selection already has a link
						const prev =
							(editor?.getAttributes("link") as { href?: string } | undefined)?.href ?? "";
						setLinkUrl(prev);
						setLinkOpen((o) => !o);
					}}
				>
					<Link2 size={16} />
				</Button>
			)}
		</div>
	);

	// ── Link popover (DSPortal-mounted, fixed-position) ───────────────────
	const linkPopover =
		linkOpen && linkBtnRef.current ? (
			<DSPortal>
				{/* dialog element satisfies biome useSemanticElements (replaces div+role="dialog") */}
				{/* open attribute keeps it in normal flow (no modal backdrop); position:fixed */}
				<dialog
					open
					className="ds-atom-richtext-linkpopover"
					aria-label="Edit link URL"
					style={{
						position: "fixed",
						top: linkBtnRef.current.getBoundingClientRect().bottom + 4,
						left: linkBtnRef.current.getBoundingClientRect().left,
						margin: 0,
					}}
				>
					<TextInput
						type="url"
						value={linkUrl}
						onChange={(e) => setLinkUrl(e.target.value)}
						placeholder="https://example.com"
						className="ds-atom-richtext-linkinput"
						aria-label="Link URL"
						data-testid="richtext-link-url"
						// autoFocus is deliberate: the link popover exists to be typed into.
						autoFocus
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								e.preventDefault();
								setLinkOpen(false);
								editor?.commands.focus();
							} else if (e.key === "Enter") {
								e.preventDefault();
								if (linkUrl) {
									editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
								} else {
									editor?.chain().focus().unsetLink().run();
								}
								setLinkOpen(false);
							}
						}}
					/>
					<div className="ds-atom-richtext-linkactions">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								editor?.chain().focus().unsetLink().run();
								setLinkOpen(false);
							}}
						>
							Remove
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => {
								if (linkUrl) {
									editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
								}
								setLinkOpen(false);
							}}
						>
							Apply
						</Button>
					</div>
				</dialog>
			</DSPortal>
		) : null;

	// ── Inline (borderless) chrome overrides ───────────────────────────────
	// Strips the card chrome via inline styles so we never touch primitives.css.
	// `style` (caller) is spread last in the root so consumers can still override.
	const inlineRootStyle: CSSProperties | undefined = inline
		? { border: "none", borderRadius: 0, background: "transparent", overflow: "visible" }
		: undefined;
	const inlineSurfaceStyle: CSSProperties | undefined = inline
		? { padding: 0, minHeight: 0 }
		: undefined;

	// ── Keyboard-shortcut hint strip (optional, focus-revealed) ─────────────
	const visibleHints = HINT_ITEMS.filter((h) => h.feature === undefined || has(h.feature));
	const hintStrip =
		hints && !readOnly ? (
			<div
				className="ds-atom-richtext-hints"
				aria-hidden="true"
				style={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 14,
					paddingLeft: inline ? 0 : 12,
					paddingRight: inline ? 0 : 12,
					// Collapse vertical space when unfocused so the default (unfocused)
					// layout is unchanged; reveal on focus.
					paddingTop: focused ? 6 : 0,
					paddingBottom: focused ? (inline ? 0 : 6) : 0,
					borderTop: inline ? "none" : "1px solid var(--rule)",
					fontFamily: "var(--mono)",
					fontSize: 9.5,
					color: "var(--ink-4)",
					letterSpacing: "0.03em",
					opacity: focused ? 1 : 0,
					maxHeight: focused ? 200 : 0,
					overflow: "hidden",
				}}
			>
				{visibleHints.map((h) => (
					<span
						key={h.key}
						style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-3)" }}
					>
						<Kbd size="sm">{h.key}</Kbd>
						{h.label}
					</span>
				))}
			</div>
		) : null;

	// ── SSR / pre-init skeleton ────────────────────────────────────────────
	if (!editor || !codeBlockReady) {
		return (
			<div
				ref={ref}
				className={`ds-atom-richtext ds-atom-richtext--loading${className ? ` ${className}` : ""}`}
				style={{ ...inlineRootStyle, ...style }}
				data-inline={inline || undefined}
				aria-label={ariaLabel}
				aria-busy="true"
			/>
		);
	}

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<div
			ref={ref}
			className="ds-atom-richtext"
			style={{ ...inlineRootStyle, ...style }}
			data-inline={inline || undefined}
		>
			{/*
			 * `toolbar === undefined` distinguishes "not passed" from "explicitly
			 * nothing". A nullish-coalescing fallback here selected the default
			 * toolbar for `toolbar={null}` — the exact value the prop's own
			 * docstring prescribes for suppression — so twelve buttons rendered.
			 * src/interaction/RichText/toolbar-suppression.test.ts asserts this
			 * shape from the AST so a future "simplification" cannot reintroduce it.
			 */}
			{!readOnly && (toolbar === undefined ? defaultToolbar : toolbar)}
			<div
				className={["ds-atom-richtext-surface", className].filter(Boolean).join(" ")}
				data-code-dark={codeBlockDark || undefined}
				style={inlineSurfaceStyle}
			>
				<EditorContent editor={editor} />
			</div>
			{hintStrip}
			{linkPopover}
		</div>
	);
});
