import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RICHTEXT_DEFAULT_FEATURES, RichText, type RichTextProps } from ".";
import type { RichTextSegment, RichTextSerializeLoss } from "./segments";
const SRC = {
	NoToolbar: `<RichText
  value={html}
  onChange={(v) => typeof v === "string" && setHtml(v)}
  toolbar={null}
/>`,
	BoldOnly: `const [markdown, setMarkdown] = useState("Reduced **p95 latency** by 40%");
return (
  <RichText
    value={markdown}
    onChange={(v) => typeof v === "string" && setMarkdown(v)}
    outputFormat="markdown"
    allow={["bold"]}
    hints
  />
);`,
	BoldOnlyNoToolbar: `<RichText
  value={markdown}
  onChange={(v) => typeof v === "string" && setMarkdown(v)}
  outputFormat="markdown"
  allow={["bold"]}
  toolbar={null}
  inline
/>`,
	SegmentOutput: `const [segments, setSegments] = useState<RichTextSegment[]>([
  { text: "Reduced " },
  { text: "p95 latency", emphasis: true },
  { text: " by 40%" },
]);
return (
  <RichText
    value={segments}
    onChange={(v) => Array.isArray(v) && setSegments(v as RichTextSegment[])}
    outputFormat="segments"
    allow={["bold"]}
  />
);`,
	SerializeLossReported: `const [loss, setLoss] = useState<RichTextSerializeLoss | null>(null);
return (
  <RichText
    value={markdown}
    onChange={(v) => typeof v === "string" && setMarkdown(v)}
    outputFormat="markdown"
    onSerializeLoss={setLoss}
  />
);`,
	CodeBlockOptIn: `<RichText
  value={html}
  onChange={(v) => typeof v === "string" && setHtml(v)}
  allow={[...RICHTEXT_DEFAULT_FEATURES, "codeBlock"]}
/>`,
	Default: `const [html, setHtml] = useState("<p>Write your <strong>document</strong> here.</p>");
return (
  <RichText
    value={html}
    onChange={(v) => { if (typeof v === "string") setHtml(v); }}
    placeholder="Start writing…"
    ariaLabel="Document editor"
  />
);`,
	Controlled: `const [html, setHtml] = useState("<p>Hello, <em>world</em>!</p>");
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
  />
);`,
	JSONOutput: `const [doc, setDoc] = useState({});
return (
  <RichText
    value="<p>Edit to see the <strong>JSON doc</strong> structure.</p>"
    outputFormat="json"
    onChange={(v) => { if (typeof v === "object") setDoc(v); }}
  />
);`,
	Placeholder: `const [html, setHtml] = useState("");
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
    placeholder="Start writing your story here…"
  />
);`,
	ReadOnly: `<RichText
  value="<p>Write your <strong>document</strong> here.</p>"
  onChange={() => {}}
  readOnly
  ariaLabel="Read-only document"
/>`,
	MarkdownShortcuts: `const [html, setHtml] = useState("");
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
    placeholder="Type markdown shortcuts here…"
  />
);`,
	CustomToolbar: `const [html, setHtml] = useState("<p>Custom toolbar demo.</p>");
const customToolbar = (
  <div style={{ padding: "6px 10px", background: "var(--surf-2)", borderBottom: "1px solid var(--rule)" }}>
    Custom toolbar - consumer can render anything here
  </div>
);
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
    toolbar={customToolbar}
  />
);`,
	DarkMode: `const [html, setHtml] = useState("<p>Write your <strong>document</strong> here.</p>");
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
    placeholder="Dark mode editor…"
  />
);`,
	Inline: `const [html, setHtml] = useState("<p>This editor has <strong>no chrome</strong> — it sits inline.</p>");
return (
  <div style={{ padding: 16, border: "1px solid var(--rule)", borderRadius: 12, background: "var(--surf-1)" }}>
    <RichText
      value={html}
      onChange={(v) => typeof v === "string" && setHtml(v)}
      inline
    />
  </div>
);`,
	Hints: `const [html, setHtml] = useState("<p>Focus the editor to reveal the shortcut hints.</p>");
return (
  <RichText
    value={html}
    onChange={(v) => typeof v === "string" && setHtml(v)}
    hints
  />
);`,
	InlineWithHints: `const [html, setHtml] = useState("<p>Click-to-edit card pattern: borderless editor + focus hints.</p>");
return (
  <div style={{ padding: 16, border: "1px solid var(--rule)", borderRadius: 12, background: "var(--surf-1)" }}>
    <RichText
      value={html}
      onChange={(v) => typeof v === "string" && setHtml(v)}
      inline
      hints
    />
  </div>
);`,
	Playground: `<RichText
  value="<p>Write your <strong>document</strong> here.</p>"
  placeholder="Start writing…"
  readOnly={false}
  outputFormat="html"
  inline={false}
  hints={false}
  onChange={(v) => console.log(v)}
/>`,
};

const meta: Meta<typeof RichText> = {
	title: "Interaction/RichText",
	component: RichText,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"WYSIWYG rich-text editor built on TipTap/StarterKit with a configurable toolbar, markdown shortcuts, read-only mode, and HTML, JSON, segment or bold-only-markdown output. `allow` restricts what the editor can produce by configuring the extension list; `toolbar={null}` suppresses the toolbar entirely; code blocks (and their syntax highlighter) are opt-in.",
			},
		},
	},
	argTypes: {
		value: { control: false, description: "Controlled HTML string or TipTap JSON Doc object." },
		onChange: {
			control: false,
			description: "Called on every editor change with the updated value.",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text shown in the empty editor surface.",
		},
		readOnly: {
			control: "boolean",
			description: "When true, hides the toolbar and makes the editor non-editable.",
		},
		outputFormat: {
			control: "select",
			options: ["html", "json", "segments", "markdown"],
			description:
				"Output format emitted to onChange. `segments` and `markdown` carry bold and nothing else, and report anything they cannot carry via onSerializeLoss.",
		},
		allow: {
			control: false,
			description:
				"Which marks and node types the editor may produce. Configures the TipTap extension list, so a suppressed feature is unreachable by keyboard, by input rule and by autolink — not merely missing from the toolbar. Omit for RICHTEXT_DEFAULT_FEATURES.",
		},
		onSerializeLoss: {
			control: false,
			description:
				'Called when a serialize could not carry something the document contains. Only fires for outputFormat="segments" and "markdown".',
		},
		toolbar: {
			control: false,
			description: "Replace the default toolbar with a custom ReactNode.",
		},
		ariaLabel: { control: "text", description: "Accessible label for the editor region." },
		className: { control: false },
		style: { control: false },
		inline: {
			control: "boolean",
			description:
				"Borderless/inline mode: strips border, background, padding, and min-height so the editor sits inline in a card.",
		},
		hints: {
			control: "boolean",
			description:
				"Show a keyboard-shortcut hint strip (⌘B ⌘I ⌘U ⌘⇧H ⌘K ⌘↵ Esc) revealed while the editor has focus.",
		},
	},
};
export default meta;
type Story = StoryObj<typeof RichText>;

// ─── Fixtures ─────────────────────────────────────────────────────────────

const INITIAL_HTML =
	"<p>Write your <strong>document</strong> here. Add <em>relevant</em> details. Use <mark>highlight</mark> to flag callouts.</p><ul><li>Delivered key milestone on schedule</li><li>Improved system performance by 40%</li></ul>";

// ─── Stories ──────────────────────────────────────────────────────────────

/** Uncontrolled-style: initial value set, onChange logs to console. */
export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => {
		const [html, setHtml] = useState(INITIAL_HTML);
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => {
						console.log("[RichText] onChange:", v);
						if (typeof v === "string") setHtml(v);
					}}
					placeholder="Start writing…"
					ariaLabel="Document editor"
				/>
			</div>
		);
	},
};

/** Controlled: parent state drives value, live preview shows synced output. */
export const Controlled: Story = {
	parameters: { docs: { source: { code: SRC.Controlled } } },
	render: () => {
		const [html, setHtml] = useState("<p>Hello, <em>world</em>!</p>");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
				<RichText value={html} onChange={(v) => typeof v === "string" && setHtml(v)} />
				<div>
					<div
						style={{
							fontFamily: "var(--font-mono, monospace)",
							fontSize: 11,
							color: "var(--ink-3, #888)",
							marginBottom: 4,
						}}
					>
						HTML output:
					</div>
					<pre
						style={{
							margin: 0,
							padding: "8px 12px",
							background: "var(--surf-2, #f5f5f0)",
							borderRadius: 6,
							fontSize: 11,
							fontFamily: "var(--font-mono, monospace)",
							whiteSpace: "pre-wrap",
							wordBreak: "break-all",
							color: "var(--ink, #1c1917)",
						}}
					>
						{html}
					</pre>
				</div>
			</div>
		);
	},
};

/** JSON output: onChange receives TipTap Doc object instead of HTML string. */
export const JSONOutput: Story = {
	parameters: { docs: { source: { code: SRC.JSONOutput } } },
	render: () => {
		const [doc, setDoc] = useState<object>({});
		const [html] = useState("<p>Edit to see the <strong>JSON doc</strong> structure.</p>");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
				<RichText
					value={html}
					outputFormat="json"
					onChange={(v) => {
						if (typeof v === "object") setDoc(v);
					}}
				/>
				<div>
					<div
						style={{
							fontFamily: "var(--font-mono, monospace)",
							fontSize: 11,
							color: "var(--ink-3, #888)",
							marginBottom: 4,
						}}
					>
						JSON Doc:
					</div>
					<pre
						style={{
							margin: 0,
							padding: "8px 12px",
							background: "var(--surf-2, #f5f5f0)",
							borderRadius: 6,
							fontSize: 11,
							fontFamily: "var(--font-mono, monospace)",
							whiteSpace: "pre-wrap",
							wordBreak: "break-all",
							color: "var(--ink, #1c1917)",
							maxHeight: 200,
							overflow: "auto",
						}}
					>
						{JSON.stringify(doc, null, 2)}
					</pre>
				</div>
			</div>
		);
	},
};

/** Placeholder visible on empty editor. */
export const Placeholder: Story = {
	parameters: { docs: { source: { code: SRC.Placeholder } } },
	render: () => {
		const [html, setHtml] = useState("");
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					placeholder="Start writing your story here…"
				/>
			</div>
		);
	},
};

/** Read-only: toolbar is hidden, editor is not editable. */
export const ReadOnly: Story = {
	parameters: { docs: { source: { code: SRC.ReadOnly } } },
	render: () => (
		<div style={{ maxWidth: 680 }}>
			<RichText value={INITIAL_HTML} onChange={() => {}} readOnly ariaLabel="Read-only document" />
		</div>
	),
};

/**
 * Markdown shortcuts (manual verification):
 * Type `**bold**` → becomes bold. Type `- ` → becomes bulleted list.
 * Type `## ` → becomes heading 2. Type `` ` `` → toggles code.
 * Type `> ` → becomes blockquote. Type `---` → inserts horizontal rule.
 */
export const MarkdownShortcuts: Story = {
	parameters: { docs: { source: { code: SRC.MarkdownShortcuts } } },
	render: () => {
		const [html, setHtml] = useState("<p></p>");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
				<div
					style={{
						padding: "10px 14px",
						background: "var(--surf-2, #f5f5f0)",
						borderRadius: 6,
						fontSize: 12,
						color: "var(--ink-2, #555)",
						lineHeight: 1.7,
					}}
				>
					<strong>Try these markdown shortcuts in the editor below:</strong>
					<br />• <code>**bold**</code> → bold text
					<br />• <code>*italic*</code> → italic text
					<br />• <code>`code`</code> → inline code
					<br />• <code>## </code> → Heading 2
					<br />• <code>### </code> → Heading 3
					<br />• <code>- </code> → bulleted list
					<br />• <code>1. </code> → ordered list
					<br />• <code>{"> "}</code> → blockquote
					<br />• <code>---</code> (Enter) → horizontal rule
				</div>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					placeholder="Type markdown shortcuts here…"
				/>
			</div>
		);
	},
};

/** Custom toolbar: consumer replaces the default toolbar with their own. */
export const CustomToolbar: Story = {
	parameters: { docs: { source: { code: SRC.CustomToolbar } } },
	render: () => {
		const [html, setHtml] = useState("<p>Custom toolbar demo.</p>");

		const customToolbar = (
			<div
				style={{
					padding: "6px 10px",
					background: "var(--surf-2, #f5f5f0)",
					borderBottom: "1px solid var(--rule, #e2e2de)",
					fontSize: 12,
					color: "var(--ink-3, #888)",
					fontFamily: "var(--font-mono, monospace)",
				}}
			>
				Custom toolbar - consumer can render anything here
			</div>
		);

		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					toolbar={customToolbar}
				/>
			</div>
		);
	},
};

/** Dark mode: wrapper adds class="dark" to html element in Storybook. */
export const DarkMode: Story = {
	globals: { theme: "dark" },
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				style={{
					background: "var(--cream-2)",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => {
		const [html, setHtml] = useState(INITIAL_HTML);
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					placeholder="Dark mode editor…"
				/>
			</div>
		);
	},
};

/**
 * Inline (borderless) mode: chrome (border, background, padding, min-height) is stripped
 * so the editor sits inline inside an existing card — ideal for click-to-edit-in-place.
 */
export const Inline: Story = {
	parameters: { docs: { source: { code: SRC.Inline } } },
	render: () => {
		const [html, setHtml] = useState(
			"<p>This editor has <strong>no chrome</strong> — it sits inline inside the card.</p>",
		);
		return (
			<div
				style={{
					maxWidth: 680,
					padding: 16,
					border: "1px solid var(--rule, #e2e2de)",
					borderRadius: 12,
					background: "var(--surf-1, #fff)",
				}}
			>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					inline
					ariaLabel="Inline editor"
				/>
			</div>
		);
	},
};

/** Keyboard-shortcut hint strip: revealed while the editor has focus. Click in to see it. */
export const Hints: Story = {
	parameters: { docs: { source: { code: SRC.Hints } } },
	render: () => {
		const [html, setHtml] = useState("<p>Focus the editor to reveal the shortcut hints below.</p>");
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText value={html} onChange={(v) => typeof v === "string" && setHtml(v)} hints />
			</div>
		);
	},
};

/**
 * Inline + hints together: the click-to-edit-in-place card pattern (e.g. Cairn) —
 * a borderless editor inside a card with focus-revealed shortcut hints.
 */
export const InlineWithHints: Story = {
	parameters: { docs: { source: { code: SRC.InlineWithHints } } },
	render: () => {
		const [html, setHtml] = useState(
			"<p>Click-to-edit card pattern: borderless editor with focus hints.</p>",
		);
		return (
			<div
				style={{
					maxWidth: 680,
					padding: 16,
					border: "1px solid var(--rule, #e2e2de)",
					borderRadius: 12,
					background: "var(--surf-1, #fff)",
				}}
			>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					inline
					hints
					ariaLabel="Click-to-edit field"
				/>
			</div>
		);
	},
};

/** Playground: all props controllable via Storybook controls. */
export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	args: {
		value: INITIAL_HTML,
		placeholder: "Start writing…",
		readOnly: false,
		outputFormat: "html",
		inline: false,
		hints: false,
	} as Partial<RichTextProps>,
	render: (args) => {
		const [html, setHtml] = useState(typeof args.value === "string" ? args.value : INITIAL_HTML);
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					{...args}
					value={html}
					onChange={(v) => {
						if (typeof v === "string") setHtml(v);
					}}
				/>
			</div>
		);
	},
};

// ═══════════════════════════════════════════════════════════════════════════
// E10 / G-3 / G-4 / F-14-1 / F-14-2 — restriction, suppression and output shape
// ═══════════════════════════════════════════════════════════════════════════

/**
 * `toolbar={null}` suppresses the toolbar entirely.
 *
 * This used to render the DEFAULT twelve-button toolbar: the fallback was
 * nullish coalescing, which falls through on `null` — the exact value this
 * prop's docstring prescribes for suppression. Verify by eye: there should be
 * no buttons above the editor.
 */
export const NoToolbar: Story = {
	parameters: { docs: { source: { code: SRC.NoToolbar } } },
	render: () => {
		const [html, setHtml] = useState("<p>No toolbar. Keyboard shortcuts still work.</p>");
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					toolbar={null}
					ariaLabel="Editor with no toolbar"
				/>
			</div>
		);
	},
};

/**
 * `allow={["bold"]}` — the bold-only editor a résumé bullet needs.
 *
 * Try it by keyboard: **⌘B bolds**, and ⌘I, ⌘U, ⌘⇧H, ⌘⌥2 do nothing at all.
 * Type `example.com ` and no link appears either, because `autolink` travelled
 * with the link mark rather than being hardcoded on. The toolbar shows one
 * button because one extension is registered — the filtering is a consequence,
 * not the mechanism.
 */
export const BoldOnly: Story = {
	parameters: { docs: { source: { code: SRC.BoldOnly } } },
	render: () => {
		const [markdown, setMarkdown] = useState(
			"Reduced **p95 latency** by 40% across three services",
		);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
				<RichText
					value={markdown}
					onChange={(v) => typeof v === "string" && setMarkdown(v)}
					outputFormat="markdown"
					allow={["bold"]}
					hints
					ariaLabel="Résumé bullet"
				/>
				<pre
					style={{
						margin: 0,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 12,
						background: "var(--cream-2)",
						border: "1px solid var(--rule)",
						borderRadius: 8,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
					}}
				>
					{markdown || "(empty)"}
				</pre>
			</div>
		);
	},
};

/**
 * `allow={["bold"]}` with the toolbar suppressed as well — the two fixes
 * together, which is the configuration the admin's bullet editor uses.
 */
export const BoldOnlyNoToolbar: Story = {
	parameters: { docs: { source: { code: SRC.BoldOnlyNoToolbar } } },
	render: () => {
		const [markdown, setMarkdown] = useState("Cut deploy time from **40 minutes** to **six**");
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={markdown}
					onChange={(v) => typeof v === "string" && setMarkdown(v)}
					outputFormat="markdown"
					allow={["bold"]}
					toolbar={null}
					inline
					ariaLabel="Inline résumé bullet"
				/>
			</div>
		);
	},
};

/**
 * `outputFormat="segments"` — the in-memory lossless shape,
 * `Array<{ text, emphasis? }>`. No markup string exists at any point, which is
 * what designs the stored-XSS class out rather than filtering it.
 */
export const SegmentOutput: Story = {
	parameters: { docs: { source: { code: SRC.SegmentOutput } } },
	render: () => {
		const [segments, setSegments] = useState<RichTextSegment[]>([
			{ text: "Reduced " },
			{ text: "p95 latency", emphasis: true },
			{ text: " by 40%" },
		]);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
				<RichText
					value={segments}
					onChange={(v) => Array.isArray(v) && setSegments(v as RichTextSegment[])}
					outputFormat="segments"
					allow={["bold"]}
					ariaLabel="Segment-output editor"
				/>
				<pre
					style={{
						margin: 0,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 12,
						background: "var(--cream-2)",
						border: "1px solid var(--rule)",
						borderRadius: 8,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
					}}
				>
					{JSON.stringify(segments, null, 2)}
				</pre>
			</div>
		);
	},
};

/**
 * The loss report, G-4's actual bar.
 *
 * Every mark is reachable here and only bold is storable — the shape of the
 * original defect. Select a word and press ⌘I, ⌘U or ⌘⇧H: the editor shows the
 * mark, the stored value below does not, and the report says so by name. Under
 * the old component this happened in silence: seven runs became five segments
 * with nothing naming which one was lost.
 */
export const SerializeLossReported: Story = {
	parameters: { docs: { source: { code: SRC.SerializeLossReported } } },
	render: () => {
		const [markdown, setMarkdown] = useState("Select a word and press Cmd-I, Cmd-U or Cmd-Shift-H");
		const [loss, setLoss] = useState<RichTextSerializeLoss | null>(null);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
				<RichText
					value={markdown}
					onChange={(v) => typeof v === "string" && setMarkdown(v)}
					outputFormat="markdown"
					onSerializeLoss={setLoss}
					hints
					ariaLabel="Unrestricted editor with markdown output"
				/>
				<pre
					style={{
						margin: 0,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 12,
						background: "var(--cream-2)",
						border: "1px solid var(--rule)",
						borderRadius: 8,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
					}}
				>
					{markdown || "(empty)"}
				</pre>
				<p
					style={{
						margin: 0,
						fontFamily: "var(--mono)",
						fontSize: 12,
						color: loss ? "var(--red-ink)" : "var(--ink-4)",
					}}
				>
					{loss ? loss.message : "Nothing dropped yet."}
				</p>
			</div>
		);
	},
};

/**
 * Code blocks are opt-in (F-14-2). The extension and its six-language
 * highlighter are reached only through a dynamic import, so a default RichText
 * never fetches them. This story asks for them explicitly.
 */
export const CodeBlockOptIn: Story = {
	parameters: { docs: { source: { code: SRC.CodeBlockOptIn } } },
	render: () => {
		const [html, setHtml] = useState(
			'<p>Code blocks are opt-in:</p><pre><code class="language-typescript">const answer: number = 42;</code></pre>',
		);
		return (
			<div style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					allow={[...RICHTEXT_DEFAULT_FEATURES, "codeBlock"]}
					ariaLabel="Editor with code blocks enabled"
				/>
			</div>
		);
	},
};
