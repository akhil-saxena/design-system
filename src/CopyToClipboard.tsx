import { Check, Copy } from "lucide-react";
import { type HTMLAttributes, forwardRef, useCallback, useEffect, useRef, useState } from "react";

export interface CopyToClipboardProps
	extends Omit<HTMLAttributes<HTMLButtonElement>, "onCopy" | "onError"> {
	value: string;
	label?: string;
	onCopy?: () => void;
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
	function CopyToClipboard({ value, label, onCopy, onError, className, style, ...rest }, ref) {
		const [copied, setCopied] = useState(false);
		const timerRef = useRef<number | null>(null);

		useEffect(() => {
			return () => {
				if (timerRef.current !== null) {
					window.clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			};
		}, []);

		const handleClick = useCallback(async () => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				onCopy?.();
				if (timerRef.current !== null) window.clearTimeout(timerRef.current);
				timerRef.current = window.setTimeout(() => {
					setCopied(false);
					timerRef.current = null;
				}, 2000);
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				console.warn(error);
				setCopied(false);
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
				<span className="ds-atom-copy-value">{label ?? value}</span>
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
