import { type CSSProperties, forwardRef } from "react";

export type FooterVariant = "compact" | "expanded";

export interface FooterColumn {
	title: string;
	links: Array<{ label: string; href?: string; onClick?: () => void }>;
}

export interface FooterProps {
	/** Visual variant. @default "compact" */
	variant?: FooterVariant;
	/** Copyright line text. @default "© 2026 - All rights reserved" */
	copyright?: string;
	/** Compact variant: right-side link row. */
	links?: Array<{ label: string; href?: string; onClick?: () => void }>;
	/** Expanded variant: array of column definitions (4 columns recommended). */
	columns?: FooterColumn[];
	className?: string;
	style?: CSSProperties;
}

/**
 * Footer - DS-73
 *
 * Standalone page footer primitive. Pass as the `footer` slot to AppShell (DS-71).
 * - `compact`: 1-line bar with copyright + utility links.
 * - `expanded`: 4-column marketing footer with column titles + links + bottom copyright row.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
	(
		{
			variant = "compact",
			copyright = "© 2026 - All rights reserved",
			links = [],
			columns = [],
			className,
			style,
		},
		ref,
	) => {
		const renderLink = (
			item: { label: string; href?: string; onClick?: () => void },
			key: string,
		) => {
			if (item.href) {
				return (
					<a key={key} href={item.href} className="ds-atom-footer-link">
						{item.label}
					</a>
				);
			}
			return (
				<button key={key} type="button" className="ds-atom-footer-link" onClick={item.onClick}>
					{item.label}
				</button>
			);
		};

		if (variant === "expanded") {
			return (
				<footer
					ref={ref}
					className={`ds-atom-footer${className ? ` ${className}` : ""}`}
					data-variant="expanded"
					style={style}
				>
					{columns.length > 0 && (
						<div className="ds-atom-footer-cols">
							{columns.map((col) => (
								<div key={col.title} className="ds-atom-footer-col">
									<div className="ds-atom-footer-col-title">{col.title}</div>
									<div style={{ display: "flex", flexDirection: "column" }}>
										{col.links.map((link) => renderLink(link, `${col.title}-${link.label}`))}
									</div>
								</div>
							))}
						</div>
					)}
					<div
						style={{
							paddingTop: 16,
							borderTop: "1px solid var(--rule)",
							display: "flex",
							justifyContent: "space-between",
							fontSize: 11,
							color: "var(--ink-4)",
						}}
					>
						<span>{copyright}</span>
					</div>
				</footer>
			);
		}

		// compact variant
		return (
			<footer
				ref={ref}
				className={`ds-atom-footer${className ? ` ${className}` : ""}`}
				data-variant="compact"
				style={style}
			>
				<span>{copyright}</span>
				{links.length > 0 && (
					<div style={{ display: "flex", gap: 16 }}>
						{links.map((link) => renderLink(link, link.label))}
					</div>
				)}
			</footer>
		);
	},
);

Footer.displayName = "Footer";
