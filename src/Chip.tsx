import { X } from "lucide-react";
import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type ChipTone = "default" | "match" | "miss" | "learning" | "tag";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
	tone?: ChipTone;
	onRemove?: () => void;
	/** Optional leading icon (Lucide recommended size 10–11) per D-110. */
	icon?: ReactNode;
}

const baseStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 5,
	fontSize: 11,
	color: "var(--ink-2)",
	background: "rgba(255,255,255,.55)",
	border: "1px solid rgba(0,0,0,.05)",
	borderRadius: 999,
	padding: "4px 10px",
	fontWeight: 500,
	whiteSpace: "nowrap",
};

const toneStyles: Record<ChipTone, CSSProperties> = {
	default: {},
	match: {
		background: "rgba(34,197,94,.12)",
		color: "var(--green)",
		borderColor: "rgba(34,197,94,.25)",
	},
	miss: {
		background: "rgba(239,68,68,.10)",
		color: "var(--red)",
		borderColor: "rgba(239,68,68,.25)",
	},
	learning: {
		background: "rgba(59,130,246,.12)",
		color: "var(--blue)",
		borderColor: "rgba(59,130,246,.25)",
	},
	tag: {
		background: "rgba(245,158,11,.10)",
		color: "var(--amber-d)",
		borderColor: "rgba(245,158,11,.25)",
	},
};

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
	{ tone = "default", onRemove, icon, children, style, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className="ds-atom-chip"
			style={{ ...baseStyle, ...toneStyles[tone], ...style }}
			{...rest}
		>
			{icon ? <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span> : null}
			{children}
			{onRemove ? (
				<button
					type="button"
					className="ds-atom-chip-x"
					aria-label="Remove"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					style={{
						border: "none",
						background: "none",
						padding: 0,
						margin: "0 0 0 2px",
						cursor: "pointer",
						color: "var(--ink-4)",
						display: "inline-flex",
						alignItems: "center",
					}}
				>
					<X size={10} />
				</button>
			) : null}
		</span>
	);
});
