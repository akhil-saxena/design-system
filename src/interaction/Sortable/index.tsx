import {
	type Announcements,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	type ScreenReaderInstructions,
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
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
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
	/** Stable list identifier - required when used inside SortableDndContext */
	id?: string;
	className?: string;
	style?: React.CSSProperties;
	/**
	 * Replaces what a screen reader hears during a reorder.
	 *
	 * Omitting this is NOT silence. dnd-kit substitutes `defaultAnnouncements` for
	 * an absent announcer, and those defaults speak the raw record id and never a
	 * position — measured verbatim as *"Draggable item abstract-intothemist was
	 * moved over droppable area abstract-lightscameraart."* This prop is the way
	 * to say something useful instead; `Sortable.stories.tsx` -> `AnnouncedReorder`
	 * is a reference announcer that speaks a title and a one-based position.
	 *
	 * Note that the utterance heard immediately after pick-up comes from
	 * `onDragOver`, not `onDragStart`: the active item collides with its own
	 * droppable the moment a drag begins, and both callbacks write to the same
	 * live region. An announcer that fixes only `onDragStart` changes nothing
	 * audible. Returning `undefined` from a callback leaves the previous utterance
	 * standing rather than clearing it.
	 *
	 * **Ignored when this Sortable is nested inside a `SortableDndContext`.** The
	 * parent owns the only `DndContext` on that subtree, so this Sortable renders
	 * none and has nowhere to forward the announcer; pass it to the
	 * `SortableDndContext` instead.
	 */
	announcements?: Announcements;
	/**
	 * Replaces dnd-kit's default *"To pick up a draggable item, press the space
	 * bar…"* text, which is rendered into the hidden element every tile points at
	 * with `aria-describedby`. Omit it to keep dnd-kit's default.
	 *
	 * **Ignored when this Sortable is nested inside a `SortableDndContext`**, for
	 * the same reason as `announcements`: the parent owns the only `DndContext`,
	 * so pass the instructions to the `SortableDndContext` instead.
	 */
	screenReaderInstructions?: ScreenReaderInstructions;
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
	 * @param activeId  - id of the dragged item
	 * @param overId    - id of the item it was dropped over
	 * @param activeListId - `id` prop of the source Sortable
	 * @param overListId   - `id` prop of the destination Sortable
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
	/**
	 * Replaces what a screen reader hears during a cross-list drag. This is the
	 * component that owns the shared `DndContext`, so this is where a cross-list
	 * announcer belongs — a nested `Sortable`'s own `announcements` prop has no
	 * `DndContext` to reach and is ignored.
	 *
	 * Omitting it keeps dnd-kit's defaults, which speak raw record ids and no
	 * position. See `SortableProps.announcements` for the pick-up/drag-over
	 * ordering that any replacement has to account for.
	 */
	announcements?: Announcements;
	/**
	 * Replaces dnd-kit's default draggable instruction text for every `Sortable`
	 * inside this context. Omit it to keep dnd-kit's default.
	 */
	screenReaderInstructions?: ScreenReaderInstructions;
}

// ─── Accessibility passthrough ────────────────────────────────────────────────
// E8 / G-13. dnd-kit takes both of these off a single `accessibility` object, and
// `<Accessibility>` substitutes its own default for any member that is
// `undefined`. Two rules this hook exists to keep:
//
//   1. Return `undefined` for the whole object when a consumer supplied neither
//      prop, so the props `DndContext` receives are identical to what they were
//      before this passthrough existed. `{}` would behave the same for the
//      defaults but would be a fresh object on every render.
//   2. Never merge, never default, never substitute `{}`. Every member of
//      dnd-kit's `Announcements` except `onDragMove` is REQUIRED, and dnd-kit
//      calls them unguarded. Measured: substituting `{}` throws
//      `announcements.onDragStart is not a function` on the first drag, and
//      because the throw happens inside dnd-kit's monitor dispatch the live
//      region is never written — so the result is silence AND an unhandled
//      error, which is strictly worse than the defaults it replaced. Absent
//      means absent.
//
// Deliberately NOT a `{...rest}` spread onto DndContext: that would let a
// consumer replace `sensors` or `collisionDetection` and break the keyboard path
// Phase 0 measured as working. Two named props, nothing else.

function useDndAccessibility(
	announcements: Announcements | undefined,
	screenReaderInstructions: ScreenReaderInstructions | undefined,
) {
	return useMemo(
		() =>
			announcements === undefined && screenReaderInstructions === undefined
				? undefined
				: { announcements, screenReaderInstructions },
		[announcements, screenReaderInstructions],
	);
}

// ─── Context sentinel ─────────────────────────────────────────────────────────
// Internal context - Sortable checks this to decide whether to render its own DndContext.
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
// Shared DndContext for cross-list drag - D-12.
// Hosts the DndContext and provides SortableDndCtx sentinel to children Sortable instances.

export function SortableDndContext({
	children,
	onMove,
	renderOverlay,
	announcements,
	screenReaderInstructions,
}: SortableDndContextProps) {
	const reducedMotion = useReducedMotion();
	const accessibility = useDndAccessibility(announcements, screenReaderInstructions);
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
				accessibility={accessibility}
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

export function Sortable({
	items,
	onReorder,
	renderItem,
	id,
	className,
	style,
	announcements,
	screenReaderInstructions,
}: SortableProps) {
	const reducedMotion = useReducedMotion();
	const hasParentDnd = useContext(SortableDndCtx);
	const accessibility = useDndAccessibility(announcements, screenReaderInstructions);

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
	// `accessibility` is deliberately unused on this branch — there is no DndContext
	// here to give it to. Documented on both props rather than warned about, because
	// this library ships no dev-mode warnings anywhere else; introducing the pattern
	// for one prop would be its own inconsistency.
	if (hasParentDnd) {
		return listContent;
	}

	// Standalone mode: wrap in own DndContext.
	return (
		<DndContext
			accessibility={accessibility}
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			{listContent}
			<DragOverlay dropAnimation={reducedMotion ? null : undefined}>
				{activeItem ? (
					// Render the actual card content as the drag overlay - same size as the source
					<div className="ds-atom-sortable-overlay" aria-hidden="true">
						{renderItem(activeItem, activeIndex)}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
