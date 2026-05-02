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
 *   2. `editor.getHTML()` comparison - defensive equality check; cheap on small docs
 *   3. `{ emitUpdate: false }` passed to setContent - suppresses onUpdate even if both checks miss
 *
 * If you are tempted to "simplify" this sync by removing any of the three layers - don't.
 * Each layer catches a distinct race condition. The pattern is documented in RESEARCH.md.
 *
 * ## Output formats (D-17-17)
 *
 * - "html" (default): onChange(editor.getHTML())  - string
 * - "json":           onChange(editor.getJSON())  - TipTap Doc object
 *
 * When outputFormat="json", we do NOT update lastEmittedRef (consumers using JSON output manage
 * their own state sync - the component doesn't attempt to round-trip JSON through getHTML).
 *
 * ## Sanitization (D-17-18)
 *
 * StarterKit's extension allowlist filters tags/attrs on paste - equivalent to schema-based
 * sanitization. Inline <script>, <style>, <font>, JS-URL anchors, <iframe>, etc. are stripped
 * during ProseMirror schema parse. NO DOMPurify dependency in v0.6.
 *
 * Server-side sanitization is the consumer's responsibility (recommend sanitize-html or DOMPurify).
 *
 * ## Threat model
 *
 * - T-17-13-01: XSS via paste - TipTap allowlist mitigates (cited in file header for traceability)
 * - T-17-13-02: XSS via server-side persistence - caller's responsibility (see above)
 * - T-17-13-03: Crafted initial value HTML - same schema parse on setContent; script tags stripped
 * - T-17-13-04: javascript: links - TipTap Link extension defaults filter out javascript:/data: URLs
 *
 * ## Underline extension
 *
 * TipTap StarterKit 3.x does NOT include the Underline extension - it ships separately as
 * @tiptap/extension-underline. Imported as `UnderlineExtension` to avoid collision with the
 * `Underline` icon component imported from ./icons.
 */

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { createLowlight } from "lowlight";

const lowlight = createLowlight();
lowlight.register("html", xml);
lowlight.register("css", css);
lowlight.register("js", javascript);
lowlight.register("javascript", javascript);
lowlight.register("ts", typescript);
lowlight.register("typescript", typescript);
lowlight.register("json", json);
lowlight.register("python", python);
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
import { Select } from "../../inputs/Select";
// ─── Public types ──────────────────────────────────────────────────────────

export interface RichTextProps {
	/** Controlled HTML string (default) or TipTap JSON Doc object when `outputFormat="json"`. */
	value: string | object;
	/** Called on every editor change with the updated HTML string or JSON Doc. */
	onChange: (value: string | object) => void;
	/** Placeholder text shown in the empty editor surface. */
	placeholder?: string;
	/** When true, hides the toolbar and makes the editor non-editable.
	 * @default false
	 */
	readOnly?: boolean;
	/** Output format emitted to `onChange`; `"html"` emits a string, `"json"` emits a TipTap Doc object.
	 * @default "html"
	 */
	outputFormat?: "html" | "json";
	/** Replace the default toolbar with a custom ReactNode; pass `null` to suppress the toolbar entirely. */
	toolbar?: ReactNode;
	/** Additional className applied to the inner editor surface wrapper. */
	className?: string;
	/** Accessible label for the editor region.
	 * @default "Rich text editor"
	 */
	ariaLabel?: string;
	/** Inline styles applied to the outer root wrapper. */
	style?: CSSProperties;
}

// ─── Supported languages for the code block language selector ────────────────

const CODE_LANGUAGES = [
	{ value: "plaintext", label: "Plain text" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "python", label: "Python" },
] as const;

// ─── Heading menu items ────────────────────────────────────────────────────

const HEADING_ITEMS = [
	{ label: "Paragraph", markName: "paragraph" as const },
	{ label: "Heading 2", markName: "heading" as const, level: 2 },
	{ label: "Heading 3", markName: "heading" as const, level: 3 },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export const RichText = forwardRef<HTMLDivElement, RichTextProps>(function RichText(
	{
		value,
		onChange,
		placeholder,
		readOnly = false,
		outputFormat = "html",
		toolbar,
		className,
		ariaLabel = "Rich text editor",
		style,
	},
	ref,
) {
	// Layer 1 of the three-layer guard: track what we last emitted
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

	// ── TipTap editor instance ─────────────────────────────────────────────
	const editor = useEditor({
		extensions: [
			// Disable StarterKit's bundled Link and Underline so we can configure them ourselves.
			// StarterKit v3.22 includes both by default - providing false opts them out,
			// then we add our own configured versions below (avoids "Duplicate extension" warning).
			StarterKit.configure({ link: false, underline: false, codeBlock: false }),
			CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
			Link.configure({ openOnClick: false, autolink: true }),
			Placeholder.configure({ placeholder: placeholder ?? "" }),
			// NOTE: UnderlineExtension - renamed import to avoid collision with Underline icon
			UnderlineExtension,
		],
		content: value,
		editable: !readOnly,
		// MANDATORY: SSR-safe per D-17-19. Without this TipTap throws during SSR hydration.
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			if (outputFormat === "json") {
				// JSON output: emit TipTap Doc object; don't sync lastEmittedRef
				// (consumers using JSON output manage their own state)
				onChange(editor.getJSON());
			} else {
				const html = editor.getHTML();
				// Layer 1 update: record this emission so we can detect the echo below
				lastEmittedRef.current = html;
				onChange(html);
			}
		},
	});

	// ── Controlled value → editor sync (three-layer guard) ─────────────────
	// Called every time the parent passes a new value prop.
	// We must NOT call setContent when the change originated from our own onUpdate
	// (parent echoes our emission back as value) - that would loop.
	useEffect(() => {
		if (!editor) return;
		// Only HTML sync is supported; JSON consumers own their own state management
		if (typeof value !== "string") return;
		// Layer 1: skip if parent just echoed back what we emitted
		if (value === lastEmittedRef.current) return;
		// Layer 2: defensive equality - if editor already shows this HTML, do nothing
		if (value === editor.getHTML()) return;
		// Layer 3: { emitUpdate: false } prevents setContent from firing onUpdate
		editor.commands.setContent(value, { emitUpdate: false });
	}, [editor, value]);

	// ── readOnly toggle ────────────────────────────────────────────────────
	useEffect(() => {
		if (!editor) return;
		if (editor.isEditable !== !readOnly) {
			editor.setEditable(!readOnly);
		}
	}, [editor, readOnly]);

	// ── Helpers ───────────────────────────────────────────────────────────
	const isActive = (name: string, attrs?: Record<string, unknown>) =>
		editor?.isActive(name, attrs) ?? false;

	const activeHeadingLabel = (): string => {
		if (isActive("heading", { level: 2 })) return "H2";
		if (isActive("heading", { level: 3 })) return "H3";
		return "P";
	};

	// ── Default toolbar ───────────────────────────────────────────────────
	const defaultToolbar = (
		<div role="toolbar" aria-label="Formatting" className="ds-atom-richtext-toolbar">
			{/* ── Inline marks group ──────────────────────────── */}
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

			{/* Language selector + dark toggle - only visible when cursor is inside a code block */}
			{isActive("codeBlock") && (
				<>
					<Select
						options={CODE_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
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

			<span className="ds-atom-richtext-toolbar-divider" aria-hidden="true" />

			{/* ── Block formatting group ───────────────────────── */}
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
			<Button
				variant="ghost"
				size="sm"
				aria-label="Horizontal rule"
				onClick={() => editor?.chain().focus().setHorizontalRule().run()}
			>
				<Minus size={16} />
			</Button>

			{/* ── Link ─────────────────────────────────────────── */}
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
					const prev = (editor?.getAttributes("link") as { href?: string } | undefined)?.href ?? "";
					setLinkUrl(prev);
					setLinkOpen((o) => !o);
				}}
			>
				<Link2 size={16} />
			</Button>
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
					<input
						type="url"
						value={linkUrl}
						onChange={(e) => setLinkUrl(e.target.value)}
						placeholder="https://example.com"
						className="ds-atom-richtext-linkinput"
						// biome-ignore lint/a11y/noAutofocus: popover input should be focused when opened
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

	// ── SSR / pre-init skeleton ────────────────────────────────────────────
	if (!editor) {
		return (
			<div
				ref={ref}
				className={`ds-atom-richtext ds-atom-richtext--loading${className ? ` ${className}` : ""}`}
				style={style}
				aria-label={ariaLabel}
				aria-busy="true"
			/>
		);
	}

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<div ref={ref} className="ds-atom-richtext" style={style} aria-label={ariaLabel}>
			{!readOnly && (toolbar ?? defaultToolbar)}
			<div
				className={["ds-atom-richtext-surface", className].filter(Boolean).join(" ")}
				data-code-dark={codeBlockDark || undefined}
			>
				<EditorContent editor={editor} />
			</div>
			{linkPopover}
		</div>
	);
});
