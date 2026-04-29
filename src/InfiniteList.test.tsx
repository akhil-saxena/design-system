import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteList } from "./InfiniteList";

let observerCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
let observeMock: ReturnType<typeof vi.fn>;
let disconnectMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	observerCallback = null;
	observeMock = vi.fn();
	disconnectMock = vi.fn();
	// Class mock — arrow functions are not newable; biome rewrites `function` expressions
	// to arrows during formatting, so we use a class to keep `new IntersectionObserver()`
	// working correctly across linting passes.
	class MockIntersectionObserver {
		constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
			observerCallback = cb;
		}
		observe = observeMock;
		disconnect = disconnectMock;
		unobserve = vi.fn();
		takeRecords = vi.fn();
	}
	// @ts-expect-error mock
	globalThis.IntersectionObserver = MockIntersectionObserver;
});

describe("InfiniteList", () => {
	it("creates observer when hasMore=true and loading=false", () => {
		render(
			<InfiniteList
				items={[1, 2, 3]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading={false}
				onLoadMore={vi.fn()}
			/>,
		);
		expect(observeMock).toHaveBeenCalled();
	});

	it("does NOT create observer when loading=true", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading
				onLoadMore={vi.fn()}
			/>,
		);
		expect(observeMock).not.toHaveBeenCalled();
	});

	it("does NOT create observer when hasMore=false", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore={false}
				loading={false}
				onLoadMore={vi.fn()}
			/>,
		);
		expect(observeMock).not.toHaveBeenCalled();
	});

	it("fires onLoadMore when sentinel intersects", () => {
		const onLoadMore = vi.fn();
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading={false}
				onLoadMore={onLoadMore}
			/>,
		);
		observerCallback?.([{ isIntersecting: true }]);
		expect(onLoadMore).toHaveBeenCalled();
	});

	it("does NOT fire onLoadMore when not intersecting", () => {
		const onLoadMore = vi.fn();
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading={false}
				onLoadMore={onLoadMore}
			/>,
		);
		observerCallback?.([{ isIntersecting: false }]);
		expect(onLoadMore).not.toHaveBeenCalled();
	});

	it("renders end-of-list slot when hasMore=false", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore={false}
				loading={false}
				onLoadMore={vi.fn()}
			/>,
		);
		expect(screen.getByText(/End of list/i)).toBeInTheDocument();
	});

	it("renders consumer endSlot override", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore={false}
				loading={false}
				onLoadMore={vi.fn()}
				endSlot={<span>Done!</span>}
			/>,
		);
		expect(screen.getByText("Done!")).toBeInTheDocument();
	});

	it("renders all items via renderItem", () => {
		render(
			<InfiniteList
				items={["a", "b", "c"]}
				renderItem={(s) => <span>item-{s}</span>}
				hasMore={false}
				loading={false}
				onLoadMore={vi.fn()}
			/>,
		);
		expect(screen.getByText("item-a")).toBeInTheDocument();
		expect(screen.getByText("item-c")).toBeInTheDocument();
	});

	it("disconnects observer on unmount", () => {
		const { unmount } = render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading={false}
				onLoadMore={vi.fn()}
			/>,
		);
		unmount();
		expect(disconnectMock).toHaveBeenCalled();
	});

	it("renders loading skeleton when hasMore=true and loading=true", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading
				onLoadMore={vi.fn()}
			/>,
		);
		// Skeleton elements render as ds-atom-skeleton divs (aria-hidden)
		const skeletons = document.querySelectorAll(".ds-atom-skeleton");
		expect(skeletons.length).toBeGreaterThanOrEqual(3);
	});

	it("renders consumer loadingSlot override", () => {
		render(
			<InfiniteList
				items={[1]}
				renderItem={(n) => <span>{String(n)}</span>}
				hasMore
				loading
				onLoadMore={vi.fn()}
				loadingSlot={<span>Custom loading</span>}
			/>,
		);
		expect(screen.getByText("Custom loading")).toBeInTheDocument();
	});
});
