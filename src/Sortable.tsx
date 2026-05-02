import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	type UniqueIdentifier,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import { useReducedMotion } from "./hooks/useReducedMotion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SortableItemData {
	id: string;
	[key: string]: unknown;
}

export interface SortableProps {
	/** Array of items; each must have a unique `id` string */
	items: SortableItemData[];
	/** Called after a successful drag-and-drop reorder with the new items array */
	onReorder: (items: SortableItemData[]) => void;
	/** Render each item's content */
	renderItem: (item: SortableItemData, index: number) => ReactNode;
	/** Stable list identifier — required when used inside SortableDndContext */
	id?: string;
	className?: string;
	style?: React.CSSProperties;
}

export interface SortableItemProps {
	id: string;
	children: ReactNode;
	reducedMotion: boolean;
}

export interface SortableDndContextProps {
	children: ReactNode;
	/**
	 * Called when an item moves between two lists.
	 * @param activeId  — id of the dragged item
	 * @param overId    — id of the item it was dropped over
	 * @param activeListId — `id` prop of the source Sortable
	 * @param overListId   — `id` prop of the destination Sortable
	 */
	onMove: (
		activeId: UniqueIdentifier,
		overId: UniqueIdentifier,
		activeListId: string | undefined,
		overListId: string | undefined,
	) => void;
	/**
	 * Renders the drag overlay card when an item is being dragged across lists.
	 * Receives the active item id. If omitted, a ghost placeholder is shown.
	 */
	renderOverlay?: (activeId: UniqueIdentifier) => ReactNode;
}

// ─── Context sentinel ─────────────────────────────────────────────────────────
// Internal context — Sortable checks this to decide whether to render its own DndContext.
const SortableDndCtx = createContext<boolean>(false);

// ─── SortableItem ─────────────────────────────────────────────────────────────

export function SortableItem({ id, children, reducedMotion }: SortableItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	const style: React.CSSProperties = {
		transform: reducedMotion ? undefined : (CSS.Transform.toString(transform) ?? undefined),
		transition: reducedMotion ? undefined : (transition ?? undefined),
		// Source slot shows as dotted placeholder via CSS [data-dragging]; no opacity change.
	};

	return (
		<div
			ref={setNodeRef}
			className="ds-atom-sortable-item"
			data-dragging={isDragging ? "true" : undefined}
			style={style}
			{...attributes}
			{...listeners}
		>
			{children}
		</div>
	);
}

// ─── SortableDndContext ───────────────────────────────────────────────────────
// Shared DndContext for cross-list drag — D-12.
// Hosts the DndContext and provides SortableDndCtx sentinel to children Sortable instances.

export function SortableDndContext({ children, onMove, renderOverlay }: SortableDndContextProps) {
	const reducedMotion = useReducedMotion();
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = useCallback((e: DragStartEvent) => {
		setActiveId(e.active.id);
	}, []);

	const handleDragOver = useCallback((_e: DragOverEvent) => {
		// cross-list overId tracking handled by parent state if needed
	}, []);

	const handleDragEnd = useCallback(
		(e: DragEndEvent) => {
			const { active, over } = e;
			setActiveId(null);
			if (!over || active.id === over.id) return;
			const activeListId = active.data.current?.sortable?.containerId as string | undefined;
			const overListId = over.data.current?.sortable?.containerId as string | undefined;
			onMove(active.id, over.id, activeListId, overListId);
		},
		[onMove],
	);

	return (
		<SortableDndCtx.Provider value={true}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
				<DragOverlay dropAnimation={reducedMotion ? null : undefined}>
					{activeId ? (
						<div className="ds-atom-sortable-overlay" aria-hidden="true">
							{renderOverlay ? (
								renderOverlay(activeId)
							) : (
								<div className="ds-atom-sortable-overlay-ghost" />
							)}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</SortableDndCtx.Provider>
	);
}

// ─── Sortable ─────────────────────────────────────────────────────────────────
// Self-contained sortable list. When inside a SortableDndContext, renders
// SortableContext only (parent owns DndContext).

export function Sortable({ items, onReorder, renderItem, id, className, style }: SortableProps) {
	const reducedMotion = useReducedMotion();
	const hasParentDnd = useContext(SortableDndCtx);

	// overId is only tracked when this Sortable owns its DndContext (standalone mode).
	// In cross-list mode (hasParentDnd=true), the parent SortableDndContext drives state.
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = useCallback((e: DragStartEvent) => {
		setActiveId(e.active.id);
	}, []);

	const handleDragOver = useCallback((_e: DragOverEvent) => {}, []);

	const handleDragEnd = useCallback(
		(e: DragEndEvent) => {
			setActiveId(null);
			const { active, over } = e;
			if (!over || active.id === over.id) return;
			const oldIndex = items.findIndex((item) => item.id === active.id);
			const newIndex = items.findIndex((item) => item.id === over.id);
			// T-18-08-02: guard against mismatched indexes
			if (oldIndex === -1 || newIndex === -1) return;
			onReorder(arrayMove(items, oldIndex, newIndex));
		},
		[items, onReorder],
	);

	const activeItem = items.find((item) => item.id === activeId);
	const activeIndex = activeItem ? items.indexOf(activeItem) : -1;

	const listContent = (
		<SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
			<ul
				className={`ds-atom-sortable${className ? ` ${className}` : ""}`}
				style={style}
				data-list-id={id}
			>
				{items.map((item, index) => (
					<li key={item.id} style={{ listStyle: "none", padding: 0, margin: 0 }}>
						<SortableItem id={item.id} reducedMotion={reducedMotion}>
							{renderItem(item, index)}
						</SortableItem>
					</li>
				))}
			</ul>
		</SortableContext>
	);

	// When inside SortableDndContext: render SortableContext only (parent owns DndContext).
	if (hasParentDnd) {
		return listContent;
	}

	// Standalone mode: wrap in own DndContext.
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			{listContent}
			<DragOverlay dropAnimation={reducedMotion ? null : undefined}>
				{activeItem ? (
					// Render the actual card content as the drag overlay — same size as the source
					<div className="ds-atom-sortable-overlay" aria-hidden="true">
						{renderItem(activeItem, activeIndex)}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
