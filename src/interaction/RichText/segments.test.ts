/**
 * G-4 — the round-trip and loss-report proof for the bold-only shape.
 *
 * The claim under test is not "bold survives". It is the stronger pair:
 *
 * 1. `markdown -> segments -> doc -> segments -> markdown` is the identity on
 *    every normalised input, including the strings that break a naive
 *    implementation (a literal asterisk, a literal backslash, an unmatched `**`,
 *    emphasis with edge whitespace, adjacent emphasis runs).
 * 2. A mark the shape cannot carry is **named** in the loss report. The finding
 *    measured seven runs becoming five segments with "nothing in the output
 *    naming which one was lost", so the exact transcript is reproduced below and
 *    asserted against — both the five-segment merge *and* the report that makes
 *    it detectable.
 */

import { describe, expect, it } from "vitest";
import {
	type RichTextSegment,
	docToMarkdown,
	docToSegments,
	markdownToDoc,
	markdownToSegments,
	normalizeSegments,
	segmentsToDoc,
	segmentsToMarkdown,
} from "./segments";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const text = (t: string, ...marks: string[]) => ({
	type: "text",
	text: t,
	...(marks.length > 0 ? { marks: marks.map((m) => ({ type: m })) } : {}),
});
const para = (...content: object[]) => ({ type: "paragraph", content });
const doc = (...content: object[]) => ({ type: "doc", content });

/**
 * G-4's transcript, verbatim: seven authored runs — plain, bold, plain, italic,
 * plain, bold, plain.
 */
const SEVEN_RUNS = doc(
	para(
		text("Reduced "),
		text("p95 latency", "bold"),
		text(" by "),
		text("40%", "italic"),
		text(" across "),
		text("three services", "bold"),
		text(" last quarter"),
	),
);

/**
 * The strings a naive codec gets wrong. Each is a real hazard, not a fuzz
 * artefact: `*` and `\` are the dialect's only two structural characters, an
 * unmatched `**` is what a hand-edited JSON file produces, and edge whitespace
 * inside emphasis is what a double-click selection produces.
 */
const CORPUS: string[] = [
	"",
	"plain text only",
	"Reduced **p95 latency** by 40%",
	"**leading bold** then plain",
	"plain then **trailing bold**",
	"**all bold**",
	"a **b** c **d** e",
	"2 \\* 3 = 6",
	"a literal backslash \\\\ here",
	"an unmatched \\*\\* pair",
	"asterisks \\*around\\* a word",
	"**bold with \\* inside**",
	"**bold with \\\\ inside**",
	"line one\nline two",
	"**bold**\n**bold on the next line**",
	"100% \\* growth **and bold**",
	"\\*\\*not bold\\*\\*",
	"emoji ✅ and accents é **bold é**",
];

// ─── 1. The markdown round trip ─────────────────────────────────────────────

describe("bold-only markdown round-trips losslessly", () => {
	it.each(CORPUS)("markdown -> segments -> markdown is the identity on %j", (markdown) => {
		expect(segmentsToMarkdown(markdownToSegments(markdown))).toBe(markdown);
	});

	it.each(CORPUS)("markdown -> doc -> markdown is the identity on %j", (markdown) => {
		const { markdown: out, loss } = docToMarkdown(markdownToDoc(markdown));
		expect(out).toBe(markdown);
		// The whole point of the restricted shape: a doc built from this dialect
		// cannot contain anything the dialect cannot express, so a full round trip
		// must report exactly zero losses. If this ever fires the codec has grown
		// an asymmetry.
		expect(loss.count, loss.message).toBe(0);
	});

	it("survives a second and third pass (idempotent, not merely reversible)", () => {
		for (const markdown of CORPUS) {
			let current = markdown;
			for (let pass = 0; pass < 3; pass += 1) {
				current = docToMarkdown(markdownToDoc(current)).markdown;
			}
			expect(current).toBe(markdown);
		}
	});

	it("segments -> markdown -> segments is the identity on normalised segments", () => {
		const cases: RichTextSegment[][] = [
			[],
			[{ text: "plain" }],
			[{ text: "bold", emphasis: true }],
			[{ text: "a " }, { text: "b", emphasis: true }, { text: " c" }],
			[{ text: "*" }],
			[{ text: "\\" }],
			[{ text: "**", emphasis: true }],
			[{ text: "a\nb", emphasis: true }],
		];
		for (const segments of cases) {
			expect(markdownToSegments(segmentsToMarkdown(segments))).toEqual(normalizeSegments(segments));
		}
	});
});

// ─── 2. The escaping rule, stated as tests ──────────────────────────────────

describe("the escaping rule", () => {
	it("escapes the two structural characters and nothing else", () => {
		const segments = [{ text: "a*b\\c_d[e]f`g" }];
		// `*` and `\` escaped; `_`, `[`, `]` and the backtick left alone, because
		// this dialect does not give them meaning and escaping them would make a
		// hand-edited JSON file unreadable.
		expect(segmentsToMarkdown(segments)).toBe("a\\*b\\\\c_d[e]f`g");
	});

	it("keeps edge whitespace outside the delimiters", () => {
		// CommonMark refuses to open emphasis on "** ", so `** bold **` would render
		// as literal asterisks in any downstream renderer.
		expect(segmentsToMarkdown([{ text: " bold ", emphasis: true }])).toBe(" **bold** ");
		expect(segmentsToMarkdown([{ text: "\tbold", emphasis: true }])).toBe("\t**bold**");
	});

	it("emits whitespace-only emphasis as plain text rather than empty delimiters", () => {
		// `****` is not emphasis in any dialect, and would parse back as literal.
		expect(segmentsToMarkdown([{ text: "   ", emphasis: true }])).toBe("   ");
	});

	it("treats an unmatched ** as literal, never as an unterminated mark", () => {
		// A hand-edited JSON file is the authoring surface, so a stray pair must not
		// swallow the rest of the bullet.
		expect(markdownToSegments("a ** b")).toEqual([{ text: "a ** b" }]);
		expect(markdownToSegments("**a ** b **")).toEqual([
			{ text: "a ", emphasis: true },
			{ text: " b **" },
		]);
	});

	it("never throws on adversarial operator input", () => {
		for (const input of ["*", "**", "***", "****", "\\", "\\\\", "\\*", "**\\", "*a*b*c*"]) {
			expect(() => markdownToSegments(input)).not.toThrow();
		}
	});
});

// ─── 3. Normalisation ───────────────────────────────────────────────────────

describe("normalizeSegments", () => {
	it("merges adjacent runs with the same mark and drops empties", () => {
		expect(
			normalizeSegments([
				{ text: "a" },
				{ text: "" },
				{ text: "b" },
				{ text: "c", emphasis: true },
				{ text: "d", emphasis: true },
				{ text: "e", emphasis: false },
			]),
		).toEqual([{ text: "ab" }, { text: "cd", emphasis: true }, { text: "e" }]);
	});

	it("does not mutate its input", () => {
		const input: RichTextSegment[] = [{ text: "a" }, { text: "b" }];
		normalizeSegments(input);
		expect(input).toEqual([{ text: "a" }, { text: "b" }]);
	});

	it("omits emphasis rather than writing false, so JSON equality is stable", () => {
		expect(JSON.stringify(normalizeSegments([{ text: "a", emphasis: false }]))).toBe(
			'[{"text":"a"}]',
		);
	});
});

// ─── 4. G-4's transcript, and the report that makes it detectable ───────────

describe("G-4: seven runs, five segments, and a report naming the loss", () => {
	const result = docToSegments(SEVEN_RUNS);

	it("reproduces the measured merge exactly — seven runs in, five segments out", () => {
		expect(result.segments).toEqual([
			{ text: "Reduced " },
			{ text: "p95 latency", emphasis: true },
			// The italic run came back as plain text and the two neighbouring plain
			// runs merged around it. This is the finding, reproduced.
			{ text: " by 40% across " },
			{ text: "three services", emphasis: true },
			{ text: " last quarter" },
		]);
		expect(result.segments).toHaveLength(5);
	});

	it("names the mark that was dropped, which the finding says nothing did", () => {
		expect(result.loss.droppedMarks).toEqual(["italic"]);
		expect(result.loss.count).toBe(1);
		expect(result.loss.message).toBe(
			"1 thing(s) dropped on serialize — Marks the shape cannot carry: italic. The editor still shows them. The stored value does not.",
		);
	});

	it("the stored markdown is clean — the loss is reported, not encoded", () => {
		// The point of reporting rather than annotating: the stored value stays the
		// hand-editable shape ADR-002 specifies. The report is out-of-band.
		expect(docToMarkdown(SEVEN_RUNS).markdown).toBe(
			"Reduced **p95 latency** by 40% across **three services** last quarter",
		);
	});
});

describe("every unrepresentable mark and node is reported", () => {
	it.each([
		["italic", ["italic"]],
		["underline", ["underline"]],
		["strike", ["strike"]],
		["code", ["code"]],
		["highlight", ["highlight"]],
		["link", ["link"]],
	])("reports the %s mark", (mark, expected) => {
		const { loss, segments } = docToSegments(doc(para(text("a"), text("b", mark), text("c"))));
		expect(loss.droppedMarks).toEqual(expected);
		expect(loss.count).toBe(1);
		// The characters always survive — a dropped mark never drops its text.
		expect(segments).toEqual([{ text: "abc" }]);
	});

	it("reports a mark on a bold run without losing the bold", () => {
		const { loss, segments } = docToSegments(doc(para(text("both", "bold", "italic"))));
		expect(loss.droppedMarks).toEqual(["italic"]);
		expect(segments).toEqual([{ text: "both", emphasis: true }]);
	});

	it("reports heading, list, blockquote, rule and code block", () => {
		const source = doc(
			{ type: "heading", attrs: { level: 2 }, content: [text("Title")] },
			para(text("body")),
			{
				type: "bulletList",
				content: [{ type: "listItem", content: [para(text("item"))] }],
			},
			{ type: "blockquote", content: [para(text("quoted"))] },
			{ type: "horizontalRule" },
			{ type: "codeBlock", content: [text("const x = 1;")] },
		);
		const { loss, segments } = docToSegments(source);
		expect(loss.droppedNodes).toEqual([
			"heading",
			"bulletList",
			"listItem",
			"blockquote",
			"horizontalRule",
			"codeBlock",
			"paragraph-break",
		]);
		// Words survive; structure does not.
		expect(segments.map((s) => s.text).join("")).toBe("Title\nbody\nitem\nquoted\nconst x = 1;");
		expect(loss.message).toContain("Node types the shape cannot carry:");
	});

	it("reports one paragraph-break type but counts every lost boundary", () => {
		const { loss } = docToSegments(doc(para(text("a")), para(text("b")), para(text("c"))));
		expect(loss.droppedNodes).toEqual(["paragraph-break"]);
		expect(loss.count).toBe(2);
	});

	it("reports an inline node that has no textual form at all", () => {
		const { loss } = docToSegments(
			doc(para(text("a"), { type: "image", attrs: { src: "x.png" } })),
		);
		expect(loss.droppedNodes).toEqual(["image"]);
	});
});

// ─── 5. The zero-loss guarantee that makes the composition non-redundant ────

describe("a bold-only document reports no loss at all", () => {
	it.each([
		["empty", doc(para())],
		["plain", doc(para(text("plain")))],
		["bold", doc(para(text("a"), text("b", "bold"), text("c")))],
		["all bold", doc(para(text("everything", "bold")))],
		["with a hard break", doc(para(text("a"), { type: "hardBreak" }, text("b")))],
	])("%s", (_name, source) => {
		const { loss } = docToSegments(source);
		expect(loss.count, loss.message).toBe(0);
		expect(loss.message).toBe("");
	});

	it("a hard break is encoded, not dropped — it survives the full round trip", () => {
		const source = doc(para(text("a"), { type: "hardBreak" }, text("b", "bold")));
		const { segments, loss } = docToSegments(source);
		expect(loss.count).toBe(0);
		expect(segments).toEqual([{ text: "a\n" }, { text: "b", emphasis: true }]);
		expect(segmentsToDoc(segments)).toEqual(source);
	});
});

// ─── 6. Tolerance of malformed input ────────────────────────────────────────

describe("docToSegments tolerates anything", () => {
	it.each([
		["null", null],
		["undefined", undefined],
		["a bare object", {}],
		["a doc with no content", { type: "doc" }],
		["a string", "not a doc"],
		["a number", 7],
	])("does not throw on %s", (_name, input) => {
		expect(() => docToSegments(input)).not.toThrow();
		expect(docToSegments(input).segments).toEqual([]);
	});

	it("names an untyped node rather than crashing on it", () => {
		const { loss } = docToSegments({ type: "doc", content: [{ content: [{ text: "x" }] }] });
		expect(loss.droppedNodes).toContain("unknown");
	});
});

// ─── 7. segmentsToDoc ───────────────────────────────────────────────────────

describe("segmentsToDoc", () => {
	it("builds an empty paragraph from no segments", () => {
		expect(segmentsToDoc([])).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
	});

	it("marks emphasis runs with bold and leaves plain runs unmarked", () => {
		expect(segmentsToDoc([{ text: "a" }, { text: "b", emphasis: true }])).toEqual(
			doc(para(text("a"), text("b", "bold"))),
		);
	});

	it("turns newlines into real hardBreak nodes", () => {
		expect(segmentsToDoc([{ text: "a\nb" }])).toEqual(
			doc(para(text("a"), { type: "hardBreak" }, text("b"))),
		);
	});
});
