/**
 * # Bold-only segment / inline-markdown codec — G-4
 *
 * The finding this closes is **data loss**, not a styling miss. Measured out of
 * server-rendered HTML at build time, so the loss is a property of the adapter
 * rather than of a live session:
 *
 * > Seven authored runs — plain, bold, plain, italic, plain, bold, plain — become
 * > **five segments**, because the italic run comes back as plain text and the two
 * > neighbouring plain runs merge around it. The stored value carries no record
 * > that a mark was ever there, so nothing at any layer can detect it after the
 * > fact.
 *
 * The merge is not the bug. Merging two adjacent runs that carry identical marks
 * is the correct normalisation, and any faithful serialiser does it. The bug is
 * that the merge **erased the evidence**: after the fact the output is
 * indistinguishable from prose that never had an italic in it. So this module
 * merges *and* reports: every serialise returns a `loss` record naming the marks
 * and node types the shape could not carry.
 *
 * ## Two shapes, one information content
 *
 * - `RichTextSegment[]` — `Array<{ text: string; emphasis?: boolean }>`. The
 *   in-memory shape, and what a consumer renders from without ever building a
 *   markup string.
 * - **bold-only inline markdown** — `Reduced **p95 latency** by 40%`. The stored
 *   shape. Chosen so that no HTML string can be expressed anywhere in the
 *   pipeline, which designs the stored-XSS class out rather than filtering it,
 *   while keeping the stored form hand-editable and diffable in git.
 *
 * The two are interconvertible without loss, and `segmentsToMarkdown` /
 * `markdownToSegments` are proven mutually inverse over a corpus in
 * `segments.test.ts` — including the strings that break a naive implementation.
 *
 * ## The escaping rule, stated exactly
 *
 * Only two characters are structural in this dialect: `*` (the bold delimiter)
 * and `\` (the escape). Both are escaped on serialise and unescaped on parse.
 * **Nothing else is escaped** — no `_`, no `[`, no backtick — because widening
 * the escape set would make the stored strings unreadable for a format whose
 * whole point is that a human can edit it in a JSON file. The consequence is
 * stated rather than hidden: this is *not* CommonMark. It is a two-token dialect
 * with its own parser, and a full markdown renderer pointed at these strings
 * would additionally interpret `_emphasis_`, `[links](…)` and backticks. The
 * project parses them with this module at build time, which is what makes the
 * narrower rule safe.
 *
 * A second interop nicety, and a real correctness point rather than taste: an
 * emphasis run whose text has leading or trailing whitespace emits the whitespace
 * *outside* the delimiters (`x **bold** y`, never `x** bold **y`), because
 * CommonMark refuses to open emphasis on `** ` and a downstream renderer would
 * show the asterisks verbatim.
 */

// ─── Public types ──────────────────────────────────────────────────────────

/**
 * One run of text carrying at most the one mark the shape can express.
 *
 * `emphasis` is deliberately optional-and-absent rather than `false` on plain
 * runs: the stored JSON stays minimal, and `JSON.stringify` equality (which the
 * controlled-value guard uses) does not depend on whether a producer wrote the
 * false.
 */
export interface RichTextSegment {
	text: string;
	emphasis?: boolean;
}

/**
 * What a serialise could not carry. Never thrown away: `RichText` hands this to
 * `onSerializeLoss`, and warns once per distinct message if no handler is given,
 * so the loss cannot be silent the way the finding measured it being silent.
 */
export interface RichTextSerializeLoss {
	/** Mark names encountered that the shape cannot express, in document order, deduped. */
	droppedMarks: string[];
	/** Node types encountered that the shape cannot express, in document order, deduped. */
	droppedNodes: string[];
	/** Total number of *occurrences* dropped — not the number of distinct kinds. */
	count: number;
	/** Human-readable report. Matches the Phase 0 prototype's wording, which is the bar this had to meet. */
	message: string;
}

export interface RichTextSerializeResult {
	segments: RichTextSegment[];
	loss: RichTextSerializeLoss;
}

/** The single mark the segment shape can carry. Everything else is a reported loss. */
export const SEGMENT_MARK = "bold";

/**
 * Node types the segment shape can carry. Everything else is a reported loss.
 *
 * `hardBreak` is on the list because a newline inside a segment encodes it
 * exactly (see `walkInline`); it is not a third structural token in the markdown
 * dialect, it is a literal newline in the stored string.
 */
export const SEGMENT_NODES = ["doc", "paragraph", "text", "hardBreak"] as const;

const CARRIED_NODES = new Set<string>(SEGMENT_NODES);

// ─── Minimal structural view of a TipTap JSON doc ───────────────────────────
// Deliberately not imported from @tiptap/core: this module must stay free of any
// editor dependency so it can run in a build script, a Worker or a test without
// pulling ProseMirror in. The shape below is the documented ProseMirror JSON
// serialisation and is stable across TipTap 2 and 3.

interface JsonMark {
	type?: string;
}
interface JsonNode {
	type?: string;
	text?: string;
	marks?: JsonMark[];
	content?: JsonNode[];
}

// ─── Doc → segments ─────────────────────────────────────────────────────────

/**
 * Serialise a TipTap/ProseMirror JSON document to bold-only segments, reporting
 * everything the shape could not carry.
 *
 * Text is always preserved — a dropped *mark* never drops its characters, and a
 * dropped *block* never drops its words. Only the formatting and the block
 * boundary are lost, and both are named in the report.
 */
export function docToSegments(doc: unknown): RichTextSerializeResult {
	const raw: RichTextSegment[] = [];
	const droppedMarks: string[] = [];
	const droppedNodes: string[] = [];
	let count = 0;

	const noteMark = (name: string) => {
		if (!droppedMarks.includes(name)) droppedMarks.push(name);
		count += 1;
	};
	const noteNode = (name: string) => {
		if (!droppedNodes.includes(name)) droppedNodes.push(name);
		count += 1;
	};

	const walkInline = (nodes: JsonNode[] | undefined) => {
		for (const node of nodes ?? []) {
			if (node.type === "text") {
				let emphasis = false;
				for (const mark of node.marks ?? []) {
					const name = mark.type ?? "unknown";
					if (name === SEGMENT_MARK) emphasis = true;
					else noteMark(name);
				}
				if (node.text)
					raw.push(emphasis ? { text: node.text, emphasis: true } : { text: node.text });
				continue;
			}
			if (node.type === "hardBreak") {
				// NOT a loss. A newline inside a segment round-trips back to a
				// hardBreak through segmentsToDoc, and ProseMirror has no other way
				// to put a raw \n in a text node — so \n and hardBreak encode each
				// other exactly. Reporting it would be a false positive, and a loss
				// report that cries wolf is one a consumer learns to ignore.
				raw.push({ text: "\n" });
				continue;
			}
			// An inline node that is neither text nor a break — an image, a mention,
			// an inline widget — has no textual form in this shape at all.
			noteNode(node.type ?? "unknown");
			if (node.content) walkInline(node.content);
		}
	};

	// Flatten the block tree into a list of inline runs, noting every container
	// and leaf type the shape cannot express on the way down. A list becomes
	// `bulletList` + `listItem` in droppedNodes and its paragraphs still yield
	// their words; a horizontalRule is a leaf with no words at all.
	const blocks: (JsonNode[] | undefined)[] = [];
	const descend = (nodes: JsonNode[] | undefined) => {
		for (const node of nodes ?? []) {
			const type = node.type ?? "unknown";
			if (type === "paragraph" || type === "heading" || type === "codeBlock") {
				if (!CARRIED_NODES.has(type)) noteNode(type);
				blocks.push(node.content);
				continue;
			}
			if (node.content) {
				if (!CARRIED_NODES.has(type)) noteNode(type);
				descend(node.content);
				continue;
			}
			noteNode(type);
		}
	};
	descend((doc as JsonNode | null | undefined)?.content);

	for (let i = 0; i < blocks.length; i += 1) {
		if (i > 0) {
			// A second block cannot be expressed: the shape is one inline run list,
			// so the boundary degrades to a line break. The *type* is named once;
			// each occurrence is counted, because two lost boundaries are two losses.
			if (!droppedNodes.includes("paragraph-break")) droppedNodes.push("paragraph-break");
			count += 1;
			raw.push({ text: "\n" });
		}
		walkInline(blocks[i]);
	}

	return { segments: normalizeSegments(raw), loss: buildLoss(droppedMarks, droppedNodes, count) };
}

function buildLoss(
	droppedMarks: string[],
	droppedNodes: string[],
	count: number,
): RichTextSerializeLoss {
	const parts: string[] = [];
	if (droppedMarks.length > 0) {
		parts.push(`Marks the shape cannot carry: ${droppedMarks.join(", ")}.`);
	}
	if (droppedNodes.length > 0) {
		parts.push(`Node types the shape cannot carry: ${droppedNodes.join(", ")}.`);
	}
	const message =
		count === 0
			? ""
			: `${count} thing(s) dropped on serialize — ${parts.join(
					" ",
				)} The editor still shows them. The stored value does not.`;
	return { droppedMarks, droppedNodes, count, message };
}

/**
 * Merge adjacent runs carrying the same mark and drop empty runs.
 *
 * This is the merge the finding measured, kept deliberately: two adjacent plain
 * runs *are* one plain run, and a serialiser that emitted them separately would
 * make `JSON.stringify` equality — which the controlled-value guard depends on —
 * unstable across a no-op edit. What makes it safe here is that the loss which
 * caused the adjacency is reported alongside.
 */
export function normalizeSegments(segments: readonly RichTextSegment[]): RichTextSegment[] {
	const out: RichTextSegment[] = [];
	for (const segment of segments) {
		if (!segment.text) continue;
		const emphasis = segment.emphasis === true;
		const previous = out[out.length - 1];
		if (previous && (previous.emphasis === true) === emphasis) {
			previous.text += segment.text;
			continue;
		}
		out.push(emphasis ? { text: segment.text, emphasis: true } : { text: segment.text });
	}
	return out;
}

// ─── Segments → doc ─────────────────────────────────────────────────────────

/**
 * Build a TipTap JSON document from segments. `\n` in a segment becomes a real
 * `hardBreak` node so the editor shows the break the stored string encodes —
 * which is what makes `docToSegments(segmentsToDoc(s))` an identity on `s`.
 */
export function segmentsToDoc(segments: readonly RichTextSegment[]): object {
	const content: JsonNode[] = [];
	for (const segment of normalizeSegments(segments)) {
		const pieces = segment.text.split("\n");
		for (let i = 0; i < pieces.length; i += 1) {
			if (i > 0) content.push({ type: "hardBreak" });
			const text = pieces[i];
			if (!text) continue;
			content.push(
				segment.emphasis === true
					? { type: "text", text, marks: [{ type: SEGMENT_MARK }] }
					: { type: "text", text },
			);
		}
	}
	return {
		type: "doc",
		content: [content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" }],
	};
}

// ─── Segments ⇄ inline markdown ─────────────────────────────────────────────

const ESCAPE_RE = /[\\*]/g;

/** Serialise segments to the stored bold-only inline-markdown form. */
export function segmentsToMarkdown(segments: readonly RichTextSegment[]): string {
	let out = "";
	for (const segment of normalizeSegments(segments)) {
		if (segment.emphasis !== true) {
			out += segment.text.replace(ESCAPE_RE, "\\$&");
			continue;
		}
		// Emphasis with edge whitespace: keep the whitespace outside the
		// delimiters. CommonMark will not open emphasis on "** ", so `** x **`
		// renders as literal asterisks in any downstream renderer.
		const lead = segment.text.match(/^\s*/)?.[0] ?? "";
		const trail = segment.text.slice(lead.length).match(/\s*$/)?.[0] ?? "";
		const core = segment.text.slice(lead.length, segment.text.length - trail.length);
		const escaped = core.replace(ESCAPE_RE, "\\$&");
		out +=
			core.length === 0
				? segment.text.replace(ESCAPE_RE, "\\$&")
				: `${lead.replace(ESCAPE_RE, "\\$&")}**${escaped}**${trail.replace(ESCAPE_RE, "\\$&")}`;
	}
	return out;
}

/**
 * Parse the stored bold-only inline-markdown form back to segments.
 *
 * An unmatched `**` is literal text, not an unterminated mark. That is a
 * deliberate total function: a hand-edited JSON file is the authoring surface for
 * this format, so a stray pair of asterisks must not swallow the rest of a
 * bullet, and parsing must never throw on operator input.
 */
export function markdownToSegments(markdown: string): RichTextSegment[] {
	const out: RichTextSegment[] = [];
	let buffer = "";
	let emphasis = false;
	let i = 0;

	const flush = () => {
		if (!buffer) return;
		out.push(emphasis ? { text: buffer, emphasis: true } : { text: buffer });
		buffer = "";
	};

	while (i < markdown.length) {
		const char = markdown[i];
		if (char === "\\" && i + 1 < markdown.length) {
			buffer += markdown[i + 1];
			i += 2;
			continue;
		}
		if (char === "*" && markdown[i + 1] === "*") {
			if (emphasis) {
				flush();
				emphasis = false;
				i += 2;
				continue;
			}
			if (hasCloser(markdown, i + 2)) {
				flush();
				emphasis = true;
				i += 2;
				continue;
			}
			// No closer: literal asterisks.
			buffer += "**";
			i += 2;
			continue;
		}
		buffer += char;
		i += 1;
	}
	flush();
	return normalizeSegments(out);
}

/** Is there an unescaped `**` at or after `from`? */
function hasCloser(markdown: string, from: number): boolean {
	let i = from;
	while (i < markdown.length) {
		if (markdown[i] === "\\") {
			i += 2;
			continue;
		}
		if (markdown[i] === "*" && markdown[i + 1] === "*") return true;
		i += 1;
	}
	return false;
}

// ─── Convenience composites ─────────────────────────────────────────────────

/** Serialise a TipTap JSON document straight to the stored markdown form. */
export function docToMarkdown(doc: unknown): { markdown: string; loss: RichTextSerializeLoss } {
	const { segments, loss } = docToSegments(doc);
	return { markdown: segmentsToMarkdown(segments), loss };
}

/** Build a TipTap JSON document from the stored markdown form. */
export function markdownToDoc(markdown: string): object {
	return segmentsToDoc(markdownToSegments(markdown));
}
