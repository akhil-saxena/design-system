import { arrayMove } from "@dnd-kit/sortable";
import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Sortable, SortableDndContext } from ".";
import type { SortableItemData } from ".";
// Imported from the library's own barrel, not from @dnd-kit/core, because that is
// the point of the re-export: a consumer types its announcer without taking
// @dnd-kit as a direct dependency. Contextual typing off `Announcements` also
// means the `active` / `over` arguments below need no imports of their own.
import type { Announcements, ScreenReaderInstructions } from "../..";
const meta: Meta<typeof Sortable> = {
	title: "Interaction/Sortable",
	tags: ["autodocs"],
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

// ─── Story: AnnouncedReorder ──────────────────────────────────────────────────
// E8 / G-13. The reference announcer: what to copy when a reorder has to speak
// something a person can act on.
//
// Passing NOTHING is not silence — dnd-kit substitutes its own defaults — but
// those defaults were measured in Chromium 147 against this very component and
// they have three faults. Verbatim, driving a reorder by keyboard alone:
//
//   Space      "Draggable item abstract-intothemist was moved over droppable
//               area abstract-intothemist."
//   ArrowDown  "Draggable item abstract-intothemist was moved over droppable
//               area abstract-lightscameraart."
//   Space      "Draggable item abstract-intothemist was dropped over droppable
//               area abstract-lightscameraart"
//
//   1. They speak the raw record id, never the photo's title.
//   2. They speak no position at all — never "position 2 of 5", which is the one
//      fact a reorder user needs.
//   3. The utterance after pick-up says the item moved over ITSELF, which reads
//      as a move that did not happen. That text comes from `onDragOver`, not
//      `onDragStart`: the active item collides with its own droppable the instant
//      a drag begins, and overwrites the pick-up message in the same live region.
//      Fixing `onDragStart` alone therefore changes nothing audible — the fix is
//      to return `undefined` from `onDragOver` for that self-collision, which
//      leaves the pick-up utterance standing rather than clearing it.
//
//   4. And the drop has no full stop, unlike the other two, which changes how a
//      screen reader paces the utterance.

const PHOTO_ITEMS: SortableItemData[] = [
	{ id: "abstract-intothemist", title: "Into the Mist" },
	{ id: "abstract-lightscameraart", title: "Lights, Camera, Art" },
	{ id: "harbour-lowtide", title: "Low Tide" },
	{ id: "street-crossing", title: "Crossing" },
	{ id: "portrait-atwork", title: "At Work" },
];

/**
 * dnd-kit hangs the authoritative slot on each entry's data ref. Prefer it over
 * `items.findIndex`: mid-drag, `over` is resolved against the visually shifted
 * layout, and an index looked up in the not-yet-committed array drifts.
 */
function slotOf(
	entry: { id: string | number; data: { current?: unknown } } | null | undefined,
	ids: string[],
): { position: number; total: number } {
	const sortable = (entry?.data?.current as { sortable?: { index?: number; items?: unknown[] } })
		?.sortable;
	const index = sortable?.index ?? (entry ? ids.indexOf(String(entry.id)) : -1);
	return { position: index + 1, total: sortable?.items?.length ?? ids.length };
}

/**
 * Position is phrased `{n} of {total}`, one-based and full-stop terminated, to
 * match the format `Lightbox` announces (`Image 2 of 3. Harbour wall`). Two
 * components in one library announcing position two different ways would be its
 * own small drift.
 */
function photoAnnouncer(items: SortableItemData[]): Announcements {
	const ids = items.map((item) => item.id);
	const titleOf = (id: string | number) =>
		String(items.find((item) => item.id === String(id))?.title ?? id);

	return {
		onDragStart: ({ active }) => {
			const { position, total } = slotOf(active, ids);
			return `Picked up ${titleOf(active.id)}. Position ${position} of ${total}. Use the arrow keys to move it, then press space to drop.`;
		},
		onDragOver: ({ active, over }) => {
			// The self-collision that fires immediately after pick-up. Returning
			// undefined leaves the pick-up utterance standing; returning a string
			// here is what produces "moved over <itself>".
			if (!over || over.id === active.id) return undefined;
			const { position, total } = slotOf(over, ids);
			return `${titleOf(active.id)} moved to position ${position} of ${total}, over ${titleOf(over.id)}.`;
		},
		onDragEnd: ({ active, over }) => {
			const title = titleOf(active.id);
			if (!over) return `Dropped ${title}. Position unchanged.`;
			const { position, total } = slotOf(over, ids);
			return `Dropped ${title} at position ${position} of ${total}.`;
		},
		onDragCancel: ({ active }) => {
			const { position, total } = slotOf(active, ids);
			return `Cancelled. ${titleOf(active.id)} is back at position ${position} of ${total}.`;
		},
	};
}

const PHOTO_INSTRUCTIONS: ScreenReaderInstructions = {
	draggable:
		"To reorder a photo, press the space bar to pick it up. Use the arrow keys to move it to a new position, then press space again to drop it there, or escape to leave it where it was.",
};

function AnnouncedReorderDemo() {
	const [items, setItems] = useState<SortableItemData[]>(PHOTO_ITEMS);
	// Rebuilt only when the order changes, so the announcer always reads the
	// current array rather than closing over the first render's copy.
	const announcements = useMemo(() => photoAnnouncer(items), [items]);

	return (
		<div style={{ maxWidth: 400 }}>
			<p style={{ marginBottom: 12, fontSize: 13, color: "var(--ink-3)" }}>
				Focus a photo and press space, then the arrow keys, then space again. A screen reader hears
				the photo's title and its one-based position instead of a record id.
			</p>
			<Sortable
				items={items}
				onReorder={setItems}
				announcements={announcements}
				screenReaderInstructions={PHOTO_INSTRUCTIONS}
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
						{String(item.title)}
					</div>
				)}
			/>
		</div>
	);
}

export const AnnouncedReorder: StoryObj<typeof Sortable> = {
	render: () => <AnnouncedReorderDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"Supplies `announcements` and `screenReaderInstructions`. Omitting them is not silence — dnd-kit substitutes defaults that speak the raw record id, no position at all, and describe the pick-up as a move over the item itself. Verified by keyboard in Chromium in `tests/visual/sortable-announce.spec.ts`.",
			},
		},
	},
};
