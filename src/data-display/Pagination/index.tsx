import { type CSSProperties, forwardRef, useRef } from "react";
import { ChevronLeft, ChevronRight } from "../../icons";

export interface PaginationProps {
	/** Total number of pages. */
	totalPages: number;
	/** Currently active page (1-based). */
	currentPage: number;
	/** Called when user navigates to a different page. */
	onPageChange: (page: number) => void;
	/** Display variant. "full" shows numbered page buttons; "compact" shows "N / M" only.
	 * @default "full"
	 */
	variant?: "full" | "compact";
	/** Accessible label for the nav landmark.
	 * @default "Pagination"
	 */
	ariaLabel?: string;
	/** Additional className applied to the root `<nav>` element. */
	className?: string;
	/** Inline styles applied to the root `<nav>` element. */
	style?: CSSProperties;
}

function getPageRange(current: number, total: number): (number | "…")[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const items: (number | "…")[] = [1];
	if (current > 3) items.push("…");
	for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
		items.push(p);
	}
	if (current < total - 2) items.push("…");
	items.push(total);
	return items;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
	{
		totalPages,
		currentPage,
		onPageChange,
		variant = "full",
		ariaLabel = "Pagination",
		className,
		style,
	},
	ref,
) {
	const listRef = useRef<HTMLOListElement>(null);

	function handleListKeyDown(e: React.KeyboardEvent<HTMLOListElement>) {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		const buttons = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>(
				"button.ds-atom-pagination-btn:not(:disabled)",
			) ?? [],
		);
		const focused = document.activeElement as HTMLButtonElement;
		const idx = buttons.indexOf(focused);
		if (idx === -1) return;
		if (e.key === "ArrowLeft" && idx > 0) {
			e.preventDefault();
			buttons[idx - 1].focus();
		} else if (e.key === "ArrowRight" && idx < buttons.length - 1) {
			e.preventDefault();
			buttons[idx + 1].focus();
		}
	}

	if (variant === "compact") {
		return (
			<nav
				ref={ref}
				aria-label={ariaLabel}
				className={`ds-atom-pagination${className ? ` ${className}` : ""}`}
				style={style}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<button
						type="button"
						className="ds-atom-pagination-icbtn"
						aria-label="Previous page"
						disabled={currentPage <= 1}
						onClick={() => onPageChange(currentPage - 1)}
					>
						<ChevronLeft size={11} aria-hidden />
					</button>
					<span className="ds-atom-pagination-count">
						{currentPage} / {totalPages}
					</span>
					<button
						type="button"
						className="ds-atom-pagination-icbtn"
						aria-label="Next page"
						disabled={currentPage >= totalPages}
						onClick={() => onPageChange(currentPage + 1)}
					>
						<ChevronRight size={11} aria-hidden />
					</button>
				</div>
			</nav>
		);
	}

	const pages = getPageRange(currentPage, totalPages);

	return (
		<nav
			ref={ref}
			aria-label={ariaLabel}
			className={`ds-atom-pagination${className ? ` ${className}` : ""}`}
			style={style}
		>
			<ol
				ref={listRef}
				className="ds-atom-pagination-list"
				role="list"
				onKeyDown={handleListKeyDown}
			>
				<li>
					<button
						type="button"
						className="ds-atom-pagination-icbtn"
						aria-label="Previous page"
						disabled={currentPage <= 1}
						onClick={() => onPageChange(currentPage - 1)}
					>
						<ChevronLeft size={12} aria-hidden />
					</button>
				</li>
				{pages.map((p, i) =>
					p === "…" ? (
						<li key={`ellipsis-${i}`} aria-hidden="true">
							<span className="ds-atom-pagination-ellipsis" aria-hidden="true">
								…
							</span>
						</li>
					) : (
						<li key={p}>
							<button
								type="button"
								className="ds-atom-pagination-btn"
								aria-label={`Page ${p}`}
								aria-current={p === currentPage ? "page" : undefined}
								onClick={() => p !== currentPage && onPageChange(p as number)}
							>
								{p}
							</button>
						</li>
					),
				)}
				<li>
					<button
						type="button"
						className="ds-atom-pagination-icbtn"
						aria-label="Next page"
						disabled={currentPage >= totalPages}
						onClick={() => onPageChange(currentPage + 1)}
					>
						<ChevronRight size={12} aria-hidden />
					</button>
				</li>
			</ol>
			<span className="ds-atom-pagination-label">
				Page {currentPage} of {totalPages}
			</span>
		</nav>
	);
});
