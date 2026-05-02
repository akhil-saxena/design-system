import { arrayMove } from "@dnd-kit/sortable";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sortable, SortableDndContext } from ".";
import type { SortableItemData } from ".";
const meta: Meta<typeof Sortable> = {
	title: "Interaction/Sortable",
	component: Sortable,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Drag-and-drop sortable list built on @dnd-kit/sortable; supports single-list reordering and cross-list moves via the shared `SortableDndContext`.",
			},
		},
	},
	argTypes: {
		items: {
			control: false,
			description: "Array of sortable item objects; each must have a unique `id` string.",
			table: { type: { summary: "{ id: string; [key: string]: unknown }[]" } },
		},
		onReorder: {
			control: false,
			description: "Called with the new item array after a drag-and-drop reorder completes.",
			table: { type: { summary: "(items: SortableItemData[]) => void" } },
		},
		renderItem: {
			control: false,
			description:
				"Render function called for each item with `(item, index)` returning a ReactNode.",
			table: { type: { summary: "(item: SortableItemData, index: number) => React.ReactNode" } },
		},
		id: {
			control: "text",
			description:
				"Optional id for the droppable container; required when using multiple Sortable lists inside a shared SortableDndContext.",
			table: { type: { summary: "string" } },
		},
	},
};

export default meta;

// ─── Story: SingleList ────────────────────────────────────────────────────────
// Drag items within a single list to reorder. Amber drop indicator at target.

const TASK_ITEMS: SortableItemData[] = [
	{ id: "task-a", label: "Task A" },
	{ id: "task-b", label: "Task B" },
	{ id: "task-c", label: "Task C" },
	{ id: "task-d", label: "Task D" },
	{ id: "task-e", label: "Task E" },
];

function SingleListDemo() {
	const [items, setItems] = useState<SortableItemData[]>(TASK_ITEMS);
	return (
		<div style={{ maxWidth: 400 }}>
			<p style={{ marginBottom: 12, fontSize: 13, color: "var(--ink-3)" }}>
				Drag items to reorder. Amber drop indicator shows where item will land.
			</p>
			<Sortable
				items={items}
				onReorder={setItems}
				renderItem={(item) => (
					<div
						style={{
							background: "var(--cream-2, #f9f6f1)",
							border: "1px solid var(--rule, rgba(0,0,0,0.08))",
							borderRadius: 6,
							padding: "12px 16px",
							fontSize: 14,
							color: "var(--ink, #1a1410)",
							fontFamily: "var(--font, inherit)",
						}}
					>
						{String(item.label)}
					</div>
				)}
			/>
		</div>
	);
}

export const SingleList: StoryObj<typeof Sortable> = {
	render: () => <SingleListDemo />,
};

// ─── Story: CrossList ─────────────────────────────────────────────────────────
// Two side-by-side lists sharing a SortableDndContext - drag items between lists.

const TODO_ITEMS: SortableItemData[] = [
	{ id: "t1", label: "Write tests" },
	{ id: "t2", label: "Review PR" },
	{ id: "t3", label: "Update docs" },
];

const DONE_ITEMS: SortableItemData[] = [
	{ id: "d1", label: "Design tokens" },
	{ id: "d2", label: "Publish release" },
];

function CrossListDemo() {
	const [todo, setTodo] = useState<SortableItemData[]>(TODO_ITEMS);
	const [done, setDone] = useState<SortableItemData[]>(DONE_ITEMS);

	function handleMove(
		activeId: string | number,
		overId: string | number,
		activeListId: string | undefined,
		overListId: string | undefined,
	) {
		if (activeListId === overListId) {
			// same-list reorder
			const setter = activeListId === "todo" ? setTodo : setDone;
			setter((prev) => {
				const oi = prev.findIndex((i) => i.id === activeId);
				const ni = prev.findIndex((i) => i.id === overId);
				if (oi === -1 || ni === -1) return prev;
				return arrayMove(prev, oi, ni);
			});
		} else {
			// cross-list move
			const srcItems = activeListId === "todo" ? todo : done;
			const item = srcItems.find((i) => i.id === activeId);
			if (!item) return;

			const srcSetter = activeListId === "todo" ? setTodo : setDone;
			const dstSetter = overListId === "todo" ? setTodo : setDone;

			srcSetter((prev) => prev.filter((i) => i.id !== activeId));
			dstSetter((prev) => {
				const ni = prev.findIndex((i) => i.id === overId);
				const idx = ni === -1 ? prev.length : ni;
				return [...prev.slice(0, idx), item, ...prev.slice(idx)];
			});
		}
	}

	const cardStyle = (label: string): React.CSSProperties => ({
		background: "var(--cream-2, #f9f6f1)",
		border: "1px solid var(--rule, rgba(0,0,0,0.08))",
		borderRadius: 6,
		padding: "10px 14px",
		fontSize: 13,
		color: "var(--ink, #1a1410)",
		fontFamily: "var(--font, inherit)",
	});

	return (
		<SortableDndContext onMove={handleMove}>
			<div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
				<div style={{ flex: 1 }}>
					<h3
						style={{
							fontSize: 12,
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							color: "var(--ink-3, #6b5e52)",
							marginBottom: 8,
						}}
					>
						To Do ({todo.length})
					</h3>
					<Sortable
						id="todo"
						items={todo}
						onReorder={setTodo}
						renderItem={(item) => (
							<div style={cardStyle(String(item.label))}>{String(item.label)}</div>
						)}
					/>
				</div>
				<div style={{ flex: 1 }}>
					<h3
						style={{
							fontSize: 12,
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							color: "var(--ink-3, #6b5e52)",
							marginBottom: 8,
						}}
					>
						Done ({done.length})
					</h3>
					<Sortable
						id="done"
						items={done}
						onReorder={setDone}
						renderItem={(item) => (
							<div style={cardStyle(String(item.label))}>{String(item.label)}</div>
						)}
					/>
				</div>
			</div>
		</SortableDndContext>
	);
}

export const CrossList: StoryObj<typeof Sortable> = {
	render: () => <CrossListDemo />,
};

// ─── Story: ReducedMotion ─────────────────────────────────────────────────────
// Items appear in stable positions - no transform spring on drag.

function ReducedMotionDemo() {
	const [items, setItems] = useState<SortableItemData[]>([
		{ id: "rm1", label: "Stable Item 1" },
		{ id: "rm2", label: "Stable Item 2" },
		{ id: "rm3", label: "Stable Item 3" },
	]);

	return (
		<div style={{ maxWidth: 400 }}>
			<p style={{ marginBottom: 12, fontSize: 13, color: "var(--ink-3)" }}>
				Reduced motion mode: no CSS transitions on drag. Items snap instantly.
			</p>
			<Sortable
				items={items}
				onReorder={setItems}
				renderItem={(item) => (
					<div
						style={{
							background: "var(--cream-2, #f9f6f1)",
							border: "1px solid var(--rule, rgba(0,0,0,0.08))",
							borderRadius: 6,
							padding: "12px 16px",
							fontSize: 14,
							color: "var(--ink, #1a1410)",
						}}
					>
						{String(item.label)}
					</div>
				)}
			/>
		</div>
	);
}

export const ReducedMotion: StoryObj<typeof Sortable> = {
	render: () => <ReducedMotionDemo />,
};

// ─── Story: Dark ──────────────────────────────────────────────────────────────

function DarkDemo() {
	const [items, setItems] = useState<SortableItemData[]>(TASK_ITEMS);
	return (
		<div
			className="dark"
			style={{
				background: "var(--cream, #1a1410)",
				padding: 24,
				borderRadius: 12,
				maxWidth: 400,
			}}
		>
			<Sortable
				items={items}
				onReorder={setItems}
				renderItem={(item) => (
					<div
						style={{
							background: "var(--cream-2, #241e19)",
							border: "1px solid var(--rule, rgba(255,255,255,0.08))",
							borderRadius: 6,
							padding: "12px 16px",
							fontSize: 14,
							color: "var(--ink, #f5ede4)",
						}}
					>
						{String(item.label)}
					</div>
				)}
			/>
		</div>
	);
}

export const Dark: StoryObj<typeof Sortable> = {
	render: () => <DarkDemo />,
};
