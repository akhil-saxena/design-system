import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InfiniteList } from "./InfiniteList";

const meta: Meta<typeof InfiniteList> = {
	title: "Primitives/InfiniteList",
	component: InfiniteList,
	parameters: {
		docs: {
			description: {
				component:
					"Scrollable list container that fires `onLoadMore` when its bottom sentinel intersects the viewport (IntersectionObserver, rootMargin=200px). Virtualization is the consumer's responsibility.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof InfiniteList>;

/* ─── helpers ─────────────────────────────────────────────────── */
const makeItems = (start: number, count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: start + i,
		label: `Application #${start + i + 1}`,
		sub: `Status update ${start + i + 1}`,
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

/* ─── Default ─────────────────────────────────────────────────── */
export const Default: Story = {
	name: "Default (scroll to load)",
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
				style={{ height: 320, overflowY: "auto", border: "1px solid var(--rule)", borderRadius: 8 }}
			>
				<InfiniteList
					items={items}
					renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
					hasMore={hasMore}
					loading={loading}
					onLoadMore={onLoadMore}
					ariaLabel="Application list"
				/>
			</div>
		);
	},
};

/* ─── LoadingInProgress ───────────────────────────────────────── */
export const LoadingInProgress: Story = {
	name: "Loading in progress",
	render: () => (
		<div style={{ width: 400 }}>
			<InfiniteList
				items={makeItems(0, 5)}
				renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
				hasMore
				loading
				onLoadMore={() => {}}
				ariaLabel="Application list"
			/>
		</div>
	),
};

/* ─── EndOfList ──────────────────────────────────────────────── */
export const EndOfList: Story = {
	name: "End of list",
	render: () => (
		<div style={{ width: 400 }}>
			<InfiniteList
				items={makeItems(0, 5)}
				renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
				hasMore={false}
				loading={false}
				onLoadMore={() => {}}
				ariaLabel="Application list"
			/>
		</div>
	),
};

/* ─── LongList ───────────────────────────────────────────────── */
export const LongList: Story = {
	name: "Long list (200 items)",
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
				style={{ height: 400, overflowY: "auto", border: "1px solid var(--rule)", borderRadius: 8 }}
			>
				<InfiniteList
					items={items}
					renderItem={(item) => <ItemRow label={item.label} sub={item.sub} />}
					hasMore={hasMore}
					loading={loading}
					onLoadMore={onLoadMore}
					ariaLabel="Long application list"
				/>
			</div>
		);
	},
};

/* ─── CustomSlots ────────────────────────────────────────────── */
export const CustomSlots: Story = {
	name: "Custom loading + end slots",
	render: () => (
		<div style={{ width: 400 }}>
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
				ariaLabel="Application list"
			/>
		</div>
	),
};

/* ─── DarkMode ───────────────────────────────────────────────── */
export const DarkMode: Story = {
	name: "Dark mode — end of list",
	parameters: { backgrounds: { default: "dark" } },
	render: () => (
		<div
			className="dark"
			style={{ width: 400, padding: 16, background: "var(--surf-0, #0f172a)", borderRadius: 8 }}
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
				ariaLabel="Application list"
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
