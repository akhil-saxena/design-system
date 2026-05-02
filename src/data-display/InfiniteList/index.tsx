/**
 * # Usage Audit — InfiniteList (DS-67)
 *
 * Consumers (post v0.6):
 * - Job listings, search results, message threads — any paginated feed
 * - NOT a virtualization wrapper — bring TanStack Virtual if needed
 *
 * API:
 * - items: T[] (consumer-managed; we don't slice or paginate internally)
 * - renderItem: (item, i) => ReactNode
 * - hasMore: boolean (consumer says "fetch more available")
 * - loading: boolean (consumer says "fetch in flight")
 * - onLoadMore: () => void (fires when sentinel intersects viewport)
 * - rootMargin: string (default "200px" — pre-fetch margin)
 * - loadingSlot, endSlot: optional consumer overrides
 *
 * Implementation:
 * - IntersectionObserver on a sentinel div at list bottom
 * - Observer only created when hasMore && !loading
 * - React 19 strict-mode safe — disconnect on cleanup
 *
 * Virtualization: NOT included. Consumer brings TanStack Virtual or similar.
 */
import { type CSSProperties, type ReactNode, forwardRef, useEffect, useRef } from "react";
import { Skeleton } from "../../feedback/Skeleton";
export interface InfiniteListProps<T = unknown> {
	/** Consumer-managed array of items; InfiniteList never slices or paginates internally. */
	items: T[];
	/** Render function called for each item; returns the list-item content. */
	renderItem: (item: T, index: number) => ReactNode;
	/** Whether more items are available to load; controls sentinel and end-slot visibility. */
	hasMore: boolean;
	/** Whether a fetch is currently in flight; pauses the IntersectionObserver while true. */
	loading: boolean;
	/** Called when the sentinel element enters the viewport; consumer triggers the next page fetch. */
	onLoadMore: () => void;
	/** Custom loading indicator; replaces the default 3-Skeleton row. */
	loadingSlot?: ReactNode;
	/** Custom end-of-list message; replaces the default "End of list" text. */
	endSlot?: ReactNode;
	/** IntersectionObserver rootMargin for pre-fetching before the sentinel reaches the viewport.
	 * @default "200px"
	 */
	rootMargin?: string;
	/** Additional className applied to the root `<ul>` element. */
	className?: string;
	/** Inline styles applied to the root `<ul>` element. */
	style?: CSSProperties;
	/** Accessible label for the list region.
	 * @default "List"
	 */
	ariaLabel?: string;
}

function buildClassName(base: string, extra?: string): string {
	return extra ? `${base} ${extra}` : base;
}

function InfiniteListInner<T>(
	{
		items,
		renderItem,
		hasMore,
		loading,
		onLoadMore,
		loadingSlot,
		endSlot,
		rootMargin = "200px",
		className,
		style,
		ariaLabel = "List",
	}: InfiniteListProps<T>,
	ref: React.Ref<HTMLUListElement>,
) {
	const sentinelRef = useRef<HTMLLIElement | null>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		if (!hasMore || loading) return;

		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore();
				}
			},
			{ rootMargin },
		);
		io.observe(sentinel);
		return () => io.disconnect();
	}, [hasMore, loading, onLoadMore, rootMargin]);

	return (
		<ul
			ref={ref}
			aria-label={ariaLabel}
			className={buildClassName("ds-atom-infinitelist", className)}
			style={style}
		>
			{items.map((item, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: consumer items lack stable keys; index is idiomatic for paginated feeds
				<li key={i} className="ds-atom-infinitelist-item">
					{renderItem(item, i)}
				</li>
			))}

			{hasMore && (
				<>
					{loading &&
						(loadingSlot ?? (
							<li aria-hidden="true" className="ds-atom-infinitelist-loading">
								<Skeleton shape="text" />
								<Skeleton shape="text" />
								<Skeleton shape="text" />
							</li>
						))}
					<li ref={sentinelRef} aria-hidden="true" className="ds-atom-infinitelist-sentinel" />
				</>
			)}

			{!hasMore &&
				(endSlot ?? (
					<li className="ds-atom-infinitelist-end" aria-live="polite">
						End of list
					</li>
				))}
		</ul>
	);
}

export const InfiniteList = forwardRef(InfiniteListInner) as <T>(
	props: InfiniteListProps<T> & { ref?: React.Ref<HTMLUListElement> },
) => ReturnType<typeof InfiniteListInner>;
