import { type CSSProperties, type ReactNode, type Ref, useRef, useState } from "react";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { Button } from "../Button";
import { Field, type FieldWiring, useField } from "../Field";

export interface FileInputProps {
	/** Called when the user selects or drops file(s). */
	onSelect: (files: File[]) => void;
	/** MIME type or file extension allowlist (passed to hidden input `accept`).
	 * @example "application/pdf" | ".pdf,.docx,.md"
	 */
	accept?: string;
	/** Whether to allow multiple files.
	 * @default false
	 */
	multiple?: boolean;
	/** Maximum file size in bytes. `onError` is called if exceeded.
	 * @default undefined (no limit)
	 */
	maxSizeBytes?: number;
	/**
	 * Called when a file is rejected due to type or size constraint.
	 * Receives a human-readable reason string.
	 */
	onError?: (reason: string) => void;
	/** When true, disables interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Visual variant.
	 * - "dropzone" — dashed bordered drop area; accepts drag-and-drop.
	 * - "button"   — renders a Button-like trigger with no drop area.
	 * @default "dropzone"
	 */
	variant?: "dropzone" | "button";
	/** Accessible label for the trigger.
	 * @default "Upload file"
	 */
	ariaLabel?: string;
	/**
	 * Content rendered inside the dropzone area (dropzone variant only).
	 * When not provided, a default amber icon + "Drop a file here, or click
	 * to upload" + meta line is rendered (matching cairn UploadDropZone visual).
	 */
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
	/**
	 * Ref to the hidden `<input type="file">`. The only way for a consumer to
	 * reset the control after an upload — assigning `value = ""` — or to register
	 * it with a form library. Previously the node was unreachable, so a second
	 * upload of the same file fired no `change` event.
	 */
	ref?: Ref<HTMLInputElement>;
	/** Helper text under the control, wired to `aria-describedby`. */
	hint?: ReactNode;
	/** Applies the error state. Implied by `errorMessage`. */
	error?: boolean;
	/** Validation message under the control; sets `aria-invalid` and is announced. */
	errorMessage?: ReactNode;
}

// FileInput — file-picker primitive. variant="dropzone" wraps drag-and-drop
// + click-to-select inside a paper-warm dashed-border surface; variant="button"
// is a click-only Button trigger. Both variants share the validation pipeline.
function FileInputControl({
	wiring,
	onSelect,
	accept,
	multiple = false,
	maxSizeBytes,
	onError,
	disabled = false,
	variant = "dropzone",
	ariaLabel = "Upload file",
	children,
	className,
	style,
	ref,
}: FileInputProps & { wiring: FieldWiring }) {
	// Internal ref opens the picker on trigger click; the composed ref also
	// exposes the node to the consumer.
	const inputRef = useRef<HTMLInputElement>(null);
	const composedRef = useComposedRefs<HTMLInputElement>(inputRef, ref);
	const [dragOver, setDragOver] = useState(false);

	// WHY shared: the same logic must run on both code paths (click-select via
	// the change handler AND drag-drop via the onDrop handler). Forking validation
	// would let one path accept files the other rejects.
	function validateFiles(files: FileList | File[]): File[] | null {
		const arr = Array.from(files);
		if (arr.length === 0) return null;
		const subset = multiple ? arr : arr.slice(0, 1);
		for (const f of subset) {
			if (accept) {
				// Accept can be MIME ("application/pdf") or comma-separated list of
				// MIME types and/or extensions (".pdf,.docx"). Match either.
				const tokens = accept
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean);
				const matches = tokens.some((t) =>
					t.startsWith(".") ? f.name.toLowerCase().endsWith(t.toLowerCase()) : f.type === t,
				);
				if (!matches) {
					onError?.(`Only ${accept} files are accepted.`);
					return null;
				}
			}
			if (typeof maxSizeBytes === "number" && f.size > maxSizeBytes) {
				const mb = Math.round(maxSizeBytes / (1024 * 1024));
				onError?.(`File must be under ${mb} MB.`);
				return null;
			}
		}
		return subset;
	}

	function handlePickedFiles(files: FileList | File[] | null) {
		if (!files) return;
		const valid = validateFiles(files);
		if (valid) onSelect(valid);
	}

	function handleTriggerClick() {
		if (disabled) return;
		inputRef.current?.click();
	}

	// WHY the hidden input lives in a fragment alongside the trigger (not inside
	// it): nested form-control nesting causes some browsers to fire a duplicate
	// click and re-open the picker.
	// display:none removes the input from the accessibility tree — aria-hidden
	// is redundant and triggers a11y lint (noAriaHiddenOnFocusable).
	const hiddenInput = (
		<input
			ref={composedRef}
			type="file"
			accept={accept}
			id={wiring.controlId}
			aria-invalid={wiring.invalid || undefined}
			aria-describedby={wiring.describedBy}
			multiple={multiple}
			style={{ display: "none" }}
			onChange={(e) => {
				handlePickedFiles(e.target.files);
				// Clear the control after reading. A file input only fires `change`
				// when its value *differs*, so without this, picking the same file
				// twice in a row is silently ignored — which is exactly what happens
				// when the user removes an upload and re-adds it, or when the first
				// attempt was rejected by validation and they retry the same file.
				e.target.value = "";
			}}
		/>
	);

	if (variant === "button") {
		return (
			<span
				className={["ds-atom-fileinput-button", className].filter(Boolean).join(" ")}
				style={style}
			>
				<Button
					variant="secondary"
					onClick={handleTriggerClick}
					disabled={disabled}
					aria-label={ariaLabel}
				>
					{children ?? "Upload file"}
				</Button>
				{hiddenInput}
			</span>
		);
	}

	// dropzone variant (default)
	const triggerStyle: CSSProperties = {
		width: "100%",
		padding: 18,
		background: dragOver ? "var(--paper-deep)" : "var(--paper-warm)",
		// --wire, not the previous hardcoded #E8D9AC: that hex did not respond to
		// the theme at all, and measured 1.37:1 against the dropzone's own paper
		// fill in monochrome light. The dropzone's dashed border is the only thing
		// delimiting it, which is Rule C-3's load-bearing case. Stays inline
		// because it is driven by the dragOver prop; only the token changes.
		border: `2px dashed ${dragOver ? "var(--amber)" : "var(--wire)"}`,
		borderRadius: 10,
		display: "flex",
		alignItems: "center",
		gap: 14,
		cursor: disabled ? "not-allowed" : "pointer",
		textAlign: "left",
		opacity: disabled ? 0.5 : 1,
		pointerEvents: disabled ? "none" : "auto",
		...style,
	};

	const dropzoneClasses = [
		"ds-atom-fileinput",
		dragOver ? "ds-atom-fileinput--dragover" : null,
		disabled ? "ds-atom-fileinput--disabled" : null,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<>
			<button
				type="button"
				className={dropzoneClasses}
				data-state={dragOver ? "dragover" : "idle"}
				aria-label={ariaLabel}
				aria-disabled={disabled}
				disabled={disabled}
				onClick={handleTriggerClick}
				onDragOver={(e) => {
					e.preventDefault();
					if (!disabled) setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragOver(false);
					if (disabled) return;
					handlePickedFiles(e.dataTransfer.files);
				}}
				style={triggerStyle}
			>
				{children ?? <DefaultDropzoneContent />}
			</button>
			{hiddenInput}
		</>
	);
}

/**
 * File picker with drag-and-drop or button variants.
 *
 * The wrapper exists because the control renders two different trees depending
 * on `variant`; wrapping once here is simpler and safer than threading the field
 * scaffold through both return paths.
 */
export function FileInput(props: FileInputProps) {
	const { hint, error, errorMessage } = props;
	const wiring = useField({ error, errorMessage, hint });
	const control = <FileInputControl {...props} wiring={wiring} />;
	if (!hint && !errorMessage) return control;
	return (
		<Field hint={hint} errorMessage={errorMessage} wiring={wiring}>
			{control}
		</Field>
	);
}

// Default dropzone content matches cairn UploadDropZone's "Drop a file here…"
// visual: amber-glyph square + headline + monospace meta line. Used only when
// the caller does NOT pass children. Caller-provided children override this.
function DefaultDropzoneContent() {
	return (
		<>
			<span
				aria-hidden="true"
				style={{
					width: 36,
					height: 36,
					borderRadius: 8,
					background: "var(--panel)",
					border: "1px solid var(--rule)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "var(--amber)",
					fontSize: 18,
					flexShrink: 0,
				}}
			>
				⤓
			</span>
			<span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
				<b
					style={{
						fontFamily: "var(--font)",
						fontSize: 13.5,
						fontWeight: 600,
						color: "var(--ink)",
						lineHeight: 1.4,
						marginBottom: 3,
					}}
				>
					Drop a file here, or click to upload
				</b>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "var(--ink-3)",
						letterSpacing: ".04em",
						lineHeight: 1.4,
					}}
				>
					File picker
				</span>
			</span>
		</>
	);
}
