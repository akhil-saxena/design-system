import { type HTMLAttributes, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "./icons";

export interface CopyToClipboardProps
	extends Omit<HTMLAttributes<HTMLButtonElement>, "onCopy" | "onError"> {
	/** The string value written to the clipboard on click. */
	value: string;
	/** Display text shown inside the button; falls back to `value` when omitted. */
	label?: string;
	/**
	 * Text shown in place of `label`/`value` for 2 s after a successful copy.
	 * Omit to keep the original label visible (icon-swap + green border only).
	 * @example copiedLabel="Copied!"
	 */
	copiedLabel?: string;
	/** Called after a successful clipboard write; use to trigger a Toast or other feedback. */
	onCopy?: () => void;
	/** Called when the clipboard API fails (e.g. insecure context or permission denied). */
	onError?: (err: Error) => void;
}

/**
 * Inline value + Copy↔Check icon (DS-55, D-531).
 *
 * On click: navigator.clipboard.writeText(value) → success: icon swaps to
 * green Check for 2s, calls onCopy?(); failure: console.warn(err), icon
 * stays as Copy, calls onError?(err). NO internal Toast dep.
 */
export const CopyToClipboard = forwardRef<HTMLButtonElement, CopyToClipboardProps>(
	function CopyToClipboard(
		{ value, label, copiedLabel, onCopy, onError, className, style, ...rest },
		ref,
	) {
		const [copied, setCopied] = useState(false);
		const timerRef = useRef<number | null>(null);

		useEffect(() => {
			return () => {
				if (timerRef.current !== null) {
					globalThis.clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			};
		}, []);

		const handleClick = useCallback(async () => {
			const showCopied = () => {
				setCopied(true);
				onCopy?.();
				if (timerRef.current !== null) globalThis.clearTimeout(timerRef.current);
				timerRef.current = globalThis.setTimeout(() => {
					setCopied(false);
					timerRef.current = null;
				}, 2000);
			};

			// Try modern Clipboard API first.
			try {
				await navigator.clipboard.writeText(value);
				showCopied();
				return;
			} catch {
				// Clipboard API unavailable in this context (iframe without
				// clipboard-write permission, insecure context, or browser block).
				// Fall through to execCommand fallback below.
			}

			// execCommand fallback — works in iframes (e.g. Storybook docs) where
			// navigator.clipboard is blocked by the clipboard-write permission policy.
			try {
				const ta = document.createElement("textarea");
				ta.value = value;
				ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;top:0;left:0;";
				document.body.appendChild(ta);
				ta.focus();
				ta.select();
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				const ok = document.execCommand("copy");
				ta.remove();
				if (ok) {
					showCopied();
				} else {
					const error = new Error("Copy command unavailable");
					console.warn("[CopyToClipboard]", error.message);
					onError?.(error);
				}
			} catch (fallbackErr) {
				const error = fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr));
				console.warn("[CopyToClipboard] clipboard unavailable:", error.message);
				onError?.(error);
			}
		}, [value, onCopy, onError]);

		return (
			<button
				ref={ref}
				type="button"
				className={`ds-atom-copy${className ? ` ${className}` : ""}`}
				data-state={copied ? "copied" : "idle"}
				aria-label={`Copy ${label ?? value}`}
				style={style}
				onClick={handleClick}
				{...rest}
			>
				<span className="ds-atom-copy-value">
					{copied && copiedLabel ? copiedLabel : (label ?? value)}
				</span>
				{copied ? (
					<Check
						size={14}
						className="ds-atom-copy-icon ds-atom-copy-icon-check"
						aria-hidden="true"
					/>
				) : (
					<Copy size={14} className="ds-atom-copy-icon" aria-hidden="true" />
				)}
			</button>
		);
	},
);
