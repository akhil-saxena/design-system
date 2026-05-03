import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InfiniteList } from ".";
import { Skeleton } from "../../feedback/Skeleton";
const meta: Meta<typeof InfiniteList> = {
	title: "Data Display/InfiniteList",
	component: InfiniteList,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Scrollable list container that fires `onLoadMore` when its bottom sentinel intersects the viewport (IntersectionObserver, rootMargin=200px). Virtualization is the consumer's responsibility.",
			},
		},
	},
	argTypes: {
		items: {
			control: false,
			description: "Consumer-managed array of items; InfiniteList never paginates internally.",
		},
		renderItem: { control: false, description: "Render function called for each item." },
		hasMore: { control: "boolean", description: "Whether more items are available to load." },
		loading: { control: "boolean", description: "Whether a fetch is currently in flight." },
		onLoadMore: { control: false, description: "Called when the sentinel enters the viewport." },
		loadingSlot: {
			control: false,
			description: "Custom loading indicator; replaces the default 3-Skeleton row.",
		},
		endSlot: {
			control: false,
			description: "Custom end-of-list message; replaces the default 'End of list' text.",
		},
		rootMargin: {
			control: "text",
			description: "IntersectionObserver rootMargin for pre-fetching.",
		},
		ariaLabel: { control: "text", description: "Accessible label for the list region." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof InfiniteList>;

/* ─── helpers ─────────────────────────────────────────────────── */
const makeItems = (start: number, count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: start + i,
		label: `Item #${start + i + 1}`,
		sub: `Updated ${start + i + 1} hours ago`,
	}));

function ItemRow({ label, sub }: { label: string; sub: string }) {
	return (
		<div
			style={{
				padding: "10px 14px",
				borderBottom: "1px solid var(--rule)",
				display: "flex",
				flexDirection: "column",
				gap: 2,
				background: "var(--surf-1)",
				borderRadius: 6,
			}}
		>
			<span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
			<span style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</span>
		</div>
	);
}

/* Skeleton shaped to match ItemRow - same padding, same two-line layout */
function CardSkeleton() {
	return (
		<div
			style={{
				padding: "10px 14px",
				borderBottom: "1px solid var(--rule)",
				display: "flex",
				flexDirection: "column",
				gap: 6,
				background: "var(--surf-1)",
				borderRadius: 6,
			}}
		>
			<Skeleton shape="text" width="55%" height={13} />
			<Skeleton shape="text" width="35%" height={11} />
		</div>
	);
}

// ─── Source snippets ─────────────────────────────────────────────────────────

const SRC = {
	default: `const [items, setItems] = useState(makeItems(0, 8));
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const onLoadMore = () => {
  if (loading) return;
  setLoading(true);
  fetchNextPage().then((next) => {
    setItems((prev) => [...prev, ...next]);
    setLoading(false);
    if (items.length >= 40) setHasMore(false);
  });
};

<InfiniteList
  items={items}
  renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
  hasMore={hasMore}
  loading={loading}
  onLoadMore={onLoadMore}
  ariaLabel="Item list"
/>`,

	loading: `<InfiniteList
  items={existingItems}
  renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
  hasMore
  loading
  onLoadMore={onLoadMore}
  ariaLabel="Item list"
  loadingSlot={
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  }
/>`,

	endOfList: `<InfiniteList
  items={items}
  renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
  hasMore={false}
  loading={false}
  onLoadMore={() => {}}
  ariaLabel="Item list"
/>`,

	customSlots: `<InfiniteList
  items={items}
  renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
  hasMore={false}
  loading={false}
  onLoadMore={() => {}}
  ariaLabel="Item list"
  endSlot={
    <div style={{ padding: 16, textAlign: "center", color: "var(--amber)", fontWeight: 600 }}>
      You have reached the end
    </div>
  }
/>`,

	dark: `<InfiniteList
  items={items}
  renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
  hasMore={false}
  loading={false}
  onLoadMore={() => {}}
  ariaLabel="Item list"
/>`,
};

/* ─── Default ─────────────────────────────────────────────────── */
export const Default: Story = {
	name: "Default (scroll to load)",
	parameters: { docs: { source: { code: SRC.default } } },
	render: () => {
		const PAGE = 8;
		const [items, setItems] = useState(makeItems(0, PAGE));
		const [loading, setLoading] = useState(false);
		const [hasMore, setHasMore] = useState(true);

		const onLoadMore = () => {
			if (loading) return;
			setLoading(true);
			setTimeout(() => {
				const next = makeItems(items.length, PAGE);
				const newItems = [...items, ...next];
				setItems(newItems);
				setLoading(false);
				if (newItems.length >= 40) setHasMore(false);
			}, 800);
		};

		return (
			<div
				style={{
					height: 320,
					overflowY: "auto",
					border: "1px solid var(--rule)",
					borderRadius: 8,
					padding: 8,
				}}
			>
				<InfiniteList
					items={items}
					renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
					hasMore={hasMore}
					loading={loading}
					onLoadMore={onLoadMore}
					ariaLabel="Item list"
				/>
			</div>
		);
	},
};

/* ─── LoadingInProgress ───────────────────────────────────────── */
export const LoadingInProgress: Story = {
	name: "Loading in progress",
	parameters: { docs: { source: { code: SRC.loading } } },
	render: () => (
		<div style={{ maxWidth: 400, width: "100%" }}>
			<InfiniteList
				items={makeItems(0, 5)}
				renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
				hasMore
				loading
				onLoadMore={() => {}}
				ariaLabel="Item list"
				loadingSlot={
					<>
						<CardSkeleton />
						<CardSkeleton />
						<CardSkeleton />
					</>
				}
			/>
		</div>
	),
};

/* ─── EndOfList ──────────────────────────────────────────────── */
export const EndOfList: Story = {
	name: "End of list",
	parameters: { docs: { source: { code: SRC.endOfList } } },
	render: () => (
		<div style={{ maxWidth: 400, width: "100%" }}>
			<InfiniteList
				items={makeItems(0, 5)}
				renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
				hasMore={false}
				loading={false}
				onLoadMore={() => {}}
				ariaLabel="Item list"
			/>
		</div>
	),
};

/* ─── LongList ───────────────────────────────────────────────── */
export const LongList: Story = {
	name: "Long list (200 items)",
	parameters: { docs: { source: { code: SRC.default } } },
	render: () => {
		const PAGE = 20;
		const [items, setItems] = useState(makeItems(0, PAGE));
		const [loading, setLoading] = useState(false);
		const [hasMore, setHasMore] = useState(true);

		const onLoadMore = () => {
			if (loading) return;
			setLoading(true);
			setTimeout(() => {
				const next = makeItems(items.length, PAGE);
				const newItems = [...items, ...next];
				setItems(newItems);
				setLoading(false);
				if (newItems.length >= 200) setHasMore(false);
			}, 400);
		};

		return (
			<div
				style={{
					height: 400,
					overflowY: "auto",
					border: "1px solid var(--rule)",
					borderRadius: 8,
					padding: 8,
				}}
			>
				<InfiniteList
					items={items}
					renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
					hasMore={hasMore}
					loading={loading}
					onLoadMore={onLoadMore}
					ariaLabel="Item list"
				/>
			</div>
		);
	},
};

/* ─── CustomSlots ────────────────────────────────────────────── */
export const CustomSlots: Story = {
	name: "Custom loading + end slots",
	parameters: { docs: { source: { code: SRC.customSlots } } },
	render: () => (
		<div style={{ maxWidth: 400, width: "100%" }}>
			<InfiniteList
				items={makeItems(0, 3)}
				renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
				hasMore={false}
				loading={false}
				onLoadMore={() => {}}
				endSlot={
					<div
						style={{
							padding: "16px",
							textAlign: "center",
							fontSize: 13,
							color: "var(--amber)",
							fontWeight: 600,
						}}
					>
						You have reached the end
					</div>
				}
				ariaLabel="Item list"
			/>
		</div>
	),
};

/* ─── DarkMode ───────────────────────────────────────────────── */
export const DarkMode: Story = {
	name: "Dark mode",
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	parameters: { docs: { source: { code: SRC.dark } } },
	render: () => (
		<div
			style={{
				maxWidth: 400,
				width: "100%",
				padding: 16,
				background: "var(--surf-0, #0f172a)",
				borderRadius: 8,
			}}
		>
			<InfiniteList
				items={makeItems(0, 4)}
				renderItem={(item) => (
					<div
						style={{
							padding: "10px 14px",
							borderBottom: "1px solid var(--rule)",
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{item.label}</span>
						<span style={{ fontSize: 11, color: "var(--ink-3)" }}>{item.sub}</span>
					</div>
				)}
				hasMore={false}
				loading={false}
				onLoadMore={() => {}}
				ariaLabel="Item list"
			/>
		</div>
	),
};

/* ─── Playground ──────────────────────────────────────────────── */
export const Playground: Story = {
	args: {
		items: makeItems(0, 10),
		renderItem: (item: { id: number; label: string; sub: string }) => (
			<ItemRow label={item.label} sub={item.sub} />
		),
		hasMore: true,
		loading: false,
		onLoadMore: () => {},
		ariaLabel: "Playground list",
		rootMargin: "200px",
	},
};
