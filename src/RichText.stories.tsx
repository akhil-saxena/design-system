/**
 * # Usage Audit — RichText (DS-70, D-17-14..D-17-19)
 *
 * Stories demonstrate:
 * - Default uncontrolled-style usage
 * - Controlled value (parent manages HTML state)
 * - JSON output format (outputFormat="json")
 * - Placeholder text
 * - Read-only mode (no toolbar)
 * - Markdown shortcuts (manual verification)
 * - Custom toolbar override
 * - Dark mode
 * - Playground (all controls)
 *
 * ## Security note (T-17-13-02)
 *
 * TipTap's StarterKit allowlist filters paste input (client-side). Server-side:
 * validate HTML before persisting — recommend `sanitize-html` or `DOMPurify`.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RichText, type RichTextProps } from "./RichText";

const meta: Meta<typeof RichText> = {
	title: "Atoms/RichText",
	component: RichText,
	parameters: { layout: "padded" },
	argTypes: {
		outputFormat: {
			control: "radio",
			options: ["html", "json"],
		},
		readOnly: { control: "boolean" },
		placeholder: { control: "text" },
	},
};
export default meta;
type Story = StoryObj<typeof RichText>;

// ─── Fixtures ─────────────────────────────────────────────────────────────

const INITIAL_HTML =
	"<p>Write your <strong>cover letter</strong> here. Highlight key achievements.</p><ul><li>Led migration of legacy system to <strong>React</strong></li><li>Reduced page load time by 40%</li></ul>";

// ─── Stories ──────────────────────────────────────────────────────────────

/** Uncontrolled-style: initial value set, onChange logs to console. */
export const Default: Story = {
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
					ariaLabel="Cover letter editor"
				/>
			</div>
		);
	},
};

/** Controlled: parent state drives value, live preview shows synced output. */
export const Controlled: Story = {
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
							background: "var(--surface-2, #f5f5f0)",
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
							background: "var(--surface-2, #f5f5f0)",
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
	render: () => (
		<div style={{ maxWidth: 680 }}>
			<RichText
				value={INITIAL_HTML}
				onChange={() => {}}
				readOnly
				ariaLabel="Read-only cover letter"
			/>
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
	render: () => {
		const [html, setHtml] = useState("<p></p>");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
				<div
					style={{
						padding: "10px 14px",
						background: "var(--surface-2, #f5f5f0)",
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
	render: () => {
		const [html, setHtml] = useState("<p>Custom toolbar demo.</p>");

		const customToolbar = (
			<div
				style={{
					padding: "6px 10px",
					background: "var(--surface-2, #f5f5f0)",
					borderBottom: "1px solid var(--rule, #e2e2de)",
					fontSize: 12,
					color: "var(--ink-3, #888)",
					fontFamily: "var(--font-mono, monospace)",
				}}
			>
				Custom toolbar — consumer can render anything here
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
	parameters: { backgrounds: { default: "dark" } },
	render: () => {
		const [html, setHtml] = useState(INITIAL_HTML);
		return (
			<div className="dark" style={{ maxWidth: 680 }}>
				<RichText
					value={html}
					onChange={(v) => typeof v === "string" && setHtml(v)}
					placeholder="Dark mode editor…"
				/>
			</div>
		);
	},
};

/** Playground: all props controllable via Storybook controls. */
export const Playground: Story = {
	args: {
		value: INITIAL_HTML,
		placeholder: "Start writing…",
		readOnly: false,
		outputFormat: "html",
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
