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
import { Skeleton } from "./Skeleton";

export interface InfiniteListProps<T = unknown> {
	items: T[];
	renderItem: (item: T, index: number) => ReactNode;
	hasMore: boolean;
	loading: boolean;
	onLoadMore: () => void;
	/** Override the default 3-Skeleton loading indicator */
	loadingSlot?: ReactNode;
	/** Override the default "End of list" text */
	endSlot?: ReactNode;
	/** IntersectionObserver rootMargin — default "200px" pre-fetches before sentinel reaches viewport */
	rootMargin?: string;
	className?: string;
	style?: CSSProperties;
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
