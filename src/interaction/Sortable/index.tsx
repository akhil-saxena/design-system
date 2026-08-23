import {
	type Announcements,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	type KeyboardSensorProps,
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

// ─── Keyboard drag release ────────────────────────────────────────────────────
// E34. dnd-kit's KeyboardSensor opens a drag that ONLY a key can close. Measured
// in Chromium 147 against `interaction-sortable--single-list`: press Space on
// Task A, then click Task D, and the click moves DOM focus to Task D while
// dnd-kit keeps holding Task A — `data-dragging` stays on Task A, the live region
// keeps saying `task-a`, and the next ArrowDown/Space moves Task A. It has to,
// because `DndContext` refuses every new activation while `activeRef.current` is
// set, so the click cannot start a drag of its own and is discarded in silence.
// From the outside that reads as "it always drags the first item", because Tab
// lands on the first tile and Space there is the instruction the screen reader
// just gave: the very first thing a keyboard user is told to do wedges the list.
//
// The sensor only listens for `keydown` on the document and for window `resize`
// and `visibilitychange`. Nothing about the pointer or about focus reaches it.
// This subclass adds the two missing exits: a pointerdown outside the dragged
// tile, and a Tab off it. Both cancel rather than drop — a click elsewhere is not
// an instruction about WHERE to put the item, and cancelling restores the order
// the user started with and announces "Dragging was cancelled" through the live
// region that is already there.
//
// Both triggers deliberately fire BEFORE focus has actually moved (`pointerdown`
// in the capture phase precedes the browser's focus default action; `keydown`
// precedes Tab's). That ordering is load-bearing: dnd-kit's own `RestoreFocus`
// re-focuses the dragged tile after a keyboard drag ends UNLESS
// `document.activeElement` is already the activator's target, so cancelling
// while focus is still on the dragged tile lets that guard suppress the restore
// on its own. Cancel on `focusin` instead and focus is yanked back to Task A
// the instant the user clicks Task D — the same defect wearing a different coat.
//
// Not `accessibility.restoreFocus: false`, which would fix the yank by turning
// off focus restoration for every drag, including the ones that need it.

const noop = () => {};

/**
 * E35. Without an activation constraint, `pointerdown` starts a drag and
 * `pointerup` ends it, so a PLAIN CLICK runs a complete drag cycle. Measured in
 * Chromium against interaction-sortable--single-list, clicking the fourth tile:
 *
 *     click (0px)  -> "Draggable item task-d was dropped over droppable area task-d"
 *     2px / 3px    -> same phantom drop
 *
 * With the announcer this library added in 01-15, that sentence is spoken into
 * the live region on EVERY click. The admin's photo grid is 39 tiles and its core
 * gesture is reordering them, so it was continuous false narration on the most
 * used surface in the product, aimed exactly at the users the announcer exists
 * for.
 *
 * 4px, not a delay. dnd-kit compares `Math.sqrt(dx^2 + dy^2) > distance`
 * (core.esm.js:1043), so this is a radius rather than a per-axis box: any
 * direction of travel past 4px activates. `delay` + `tolerance` is the other
 * documented remedy and is worse for this component, because it puts latency in
 * front of every DELIBERATE drag to fix a problem caused by accidental ones.
 *
 * 4 is above the 0-3px range measured for a press that is meant to be a click,
 * and below a real drag: a 5px move still activates, so the dead zone is not
 * perceptible in a gesture that intends to move a tile. Applied to BOTH sensor
 * lists — `Sortable` and `SortableDndContext` — since the defect was in both.
 */
const POINTER_ACTIVATION = { distance: 4 } as const;

class FocusScopedKeyboardSensor extends KeyboardSensor {
	constructor(props: KeyboardSensorProps) {
		// Wrapped BEFORE `super` so dnd-kit's own drop (Space) and cancel (Escape)
		// paths remove these listeners too, not just the two exits added here.
		let release = () => {};
		const scoped: KeyboardSensorProps = {
			...props,
			onEnd: () => {
				release();
				props.onEnd();
			},
			onCancel: () => {
				release();
				props.onCancel();
			},
		};
		super(scoped);

		const node = props.activeNode.node.current;
		// No node means no "outside", and treating everything as outside would
		// cancel on the first pointerdown anywhere. Guard nothing instead.
		if (!node) return;
		const doc = node.ownerDocument;

		const bail = (event: Event) => {
			if (event.type === "pointerdown") {
				const target = event.target;
				if (target instanceof Node && node.contains(target)) return;
			} else if ((event as KeyboardEvent).code !== "Tab") {
				return;
			}
			release();
			// The base sensor's document keydown listener is still attached: its
			// `detach()` is private and reachable only from its own handlers. It
			// reads every callback and option off THIS object on each keystroke, so
			// blanking them makes it inert, and the first Space/Escape after this
			// runs its detach() and removes it for good. Without this, that stale
			// listener sees the Space that starts the NEXT pick-up and ends it
			// immediately — the bug, restored one keystroke later.
			scoped.onStart = noop;
			scoped.onMove = noop;
			scoped.onEnd = noop;
			scoped.onCancel = noop;
			scoped.options = { ...props.options, coordinateGetter: () => undefined };
			props.onCancel();
		};

		doc.addEventListener("pointerdown", bail, true);
		doc.addEventListener("keydown", bail, true);
		release = () => {
			doc.removeEventListener("pointerdown", bail, true);
			doc.removeEventListener("keydown", bail, true);
		};
	}
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
		useSensor(PointerSensor, { activationConstraint: POINTER_ACTIVATION }),
		useSensor(FocusScopedKeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
		useSensor(PointerSensor, { activationConstraint: POINTER_ACTIVATION }),
		useSensor(FocusScopedKeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
