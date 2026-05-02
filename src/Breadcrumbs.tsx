/**
 * # Usage Audit — Breadcrumbs (DS-69)
 *
 * Consumers (post v0.6):
 * - JobDash app shell — current-page hierarchical nav
 * - Settings pages — section path
 *
 * API:
 * - items: BreadcrumbItem[] (label + optional href + onClick)
 * - maxVisible: number (default 4 — show first + trigger + last (maxVisible-2))
 * - ariaLabel: string (default "Breadcrumb")
 *
 * Implementation:
 * - <nav><ol> with aria-current="page" on last item per WAI-ARIA
 * - Truncation: middle items collapse into a DSDropdown trigger button
 * - ChevronRight separator from canonical /icons subpath
 */
import { type CSSProperties, forwardRef, useRef, useState } from "react";
import { DSDropdown } from "./_internals/DSDropdown";
import { ChevronRight, MoreHorizontal } from "./icons";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbsProps {
	/** Ordered list of breadcrumb items; last item is marked as the current page. */
	items: BreadcrumbItem[];
	/** Maximum items shown before collapsing middle items into a "…" overflow menu.
	 * @default 4
	 */
	maxVisible?: number;
	/** Accessible label for the `<nav>` landmark.
	 * @default "Breadcrumb"
	 */
	ariaLabel?: string;
	/** Additional className applied to the root `<nav>` element. */
	className?: string;
	/** Inline styles applied to the root `<nav>` element. */
	style?: CSSProperties;
}

type VisibleEntry =
	| { kind: "item"; data: BreadcrumbItem; index: number }
	| { kind: "more"; data: BreadcrumbItem[] };

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
	{ items, maxVisible = 4, ariaLabel = "Breadcrumb", className, style },
	ref,
) {
	const [overflowOpen, setOverflowOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const moreBtnRef = useRef<HTMLButtonElement | null>(null);

	// Truncate only when we have strictly more items than maxVisible AND maxVisible >= 3
	// (need at least: first + trigger + 1 tail item; below 3 is unsupported)
	const shouldTruncate = items.length > maxVisible && maxVisible >= 3;

	// Build the visible list:
	// - Normal: all items as-is
	// - Truncated: [first] [more-trigger w/ hidden items] [last (maxVisible-2) items]
	let visible: VisibleEntry[];
	if (!shouldTruncate) {
		visible = items.map((item, i) => ({ kind: "item" as const, data: item, index: i }));
	} else {
		const first = items[0]!;
		const tailCount = maxVisible - 2; // e.g. maxVisible=4 → 2 tail items
		const tailStart = items.length - tailCount;
		const hidden = items.slice(1, tailStart);
		const tail = items.slice(tailStart);
		visible = [
			{ kind: "item" as const, data: first, index: 0 },
			{ kind: "more" as const, data: hidden },
			...tail.map((item, i) => ({ kind: "item" as const, data: item, index: tailStart + i })),
		];
	}

	const handleSelectHidden = (i: number, hidden: BreadcrumbItem[]) => {
		const item = hidden[i];
		if (!item) return;
		if (item.onClick) {
			item.onClick({} as React.MouseEvent);
		} else if (item.href) {
			window.location.href = item.href;
		}
		setOverflowOpen(false);
	};

	const totalVisible = visible.length;

	return (
		<nav
			ref={ref}
			aria-label={ariaLabel}
			className={`ds-atom-breadcrumbs${className ? ` ${className}` : ""}`}
			style={style}
		>
			<ol className="ds-atom-breadcrumbs-list">
				{visible.map((entry, idx) => {
					const isLastVisible = idx === totalVisible - 1;

					if (entry.kind === "more") {
						const hidden = entry.data;
						return (
							<li key="__more__" className="ds-atom-breadcrumbs-li">
								<button
									ref={moreBtnRef}
									type="button"
									className="ds-atom-breadcrumbs-more"
									aria-label={`Show ${hidden.length} hidden breadcrumb${hidden.length === 1 ? "" : "s"}`}
									aria-expanded={overflowOpen}
									aria-haspopup="menu"
									onClick={() => {
										setActiveIndex(0);
										setOverflowOpen((o) => !o);
									}}
								>
									<MoreHorizontal size={14} aria-hidden />
								</button>
								{!isLastVisible && (
									<ChevronRight size={14} className="ds-atom-breadcrumbs-sep" aria-hidden />
								)}
								<DSDropdown
									anchorRef={moreBtnRef}
									open={overflowOpen}
									onOpenChange={setOverflowOpen}
									activeIndex={activeIndex}
									onActiveIndexChange={setActiveIndex}
									itemCount={hidden.length}
									onSelect={(i) => handleSelectHidden(i, hidden)}
									typeAheadGetText={(i) => hidden[i]?.label ?? ""}
									matchAnchorWidth={false}
								>
									<ul role="menu" className="ds-atom-breadcrumbs-menu">
										{hidden.map((h) => (
											<li key={h.label} className="ds-atom-breadcrumbs-menuitem">
												{h.href ? (
													<a
														href={h.href}
														onClick={(e) => {
															h.onClick?.(e);
															setOverflowOpen(false);
														}}
													>
														{h.label}
													</a>
												) : (
													<button
														type="button"
														onClick={() => {
															h.onClick?.({} as React.MouseEvent);
															setOverflowOpen(false);
														}}
													>
														{h.label}
													</button>
												)}
											</li>
										))}
									</ul>
								</DSDropdown>
							</li>
						);
					}

					// Regular breadcrumb item
					const item = entry.data;
					const isCurrent = entry.index === items.length - 1;

					return (
						<li key={entry.index} className="ds-atom-breadcrumbs-li">
							{item.href ? (
								<a
									href={item.href}
									onClick={item.onClick}
									aria-current={isCurrent ? "page" : undefined}
									className={isCurrent ? "ds-atom-breadcrumbs-current" : "ds-atom-breadcrumbs-link"}
								>
									{item.label}
								</a>
							) : (
								<span
									aria-current={isCurrent ? "page" : undefined}
									className={isCurrent ? "ds-atom-breadcrumbs-current" : "ds-atom-breadcrumbs-text"}
								>
									{item.label}
								</span>
							)}
							{!isLastVisible && (
								<ChevronRight size={14} className="ds-atom-breadcrumbs-sep" aria-hidden />
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
});
