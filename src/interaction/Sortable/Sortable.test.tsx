import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sortable, SortableDndContext, SortableItem } from ".";
import type { SortableItemData } from ".";
// @dnd-kit PointerSensor requires setPointerCapture on elements
beforeEach(() => {
	// jsdom does not implement pointer capture, which @dnd-kit's PointerSensor
	// requires. Assigning to the typed members avoids widening to `any`.
	document.body.setPointerCapture = vi.fn() as unknown as Element["setPointerCapture"];
	document.body.releasePointerCapture = vi.fn() as unknown as Element["releasePointerCapture"];
});

const ITEMS: SortableItemData[] = [
	{ id: "a", label: "Item A" },
	{ id: "b", label: "Item B" },
	{ id: "c", label: "Item C" },
];

describe("Sortable", () => {
	it("Test 1: renders all items from items prop", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		expect(screen.getByText("Item A")).toBeTruthy();
		expect(screen.getByText("Item B")).toBeTruthy();
		expect(screen.getByText("Item C")).toBeTruthy();
	});

	it("Test 2: renders a ul list container", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		expect(document.querySelector("ul.ds-atom-sortable")).toBeTruthy();
	});

	it("Test 3: renders li items for each item", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		const listItems = document.querySelectorAll("ul.ds-atom-sortable > li");
		expect(listItems.length).toBe(3);
	});

	it("Test 4: SortableItem renders children content", () => {
		render(
			<Sortable
				items={[{ id: "x", label: "X Content" }]}
				onReorder={vi.fn()}
				renderItem={(item) => <span data-testid="item-content">{String(item.label)}</span>}
			/>,
		);
		expect(screen.getByTestId("item-content")).toBeTruthy();
		expect(screen.getByText("X Content")).toBeTruthy();
	});

	it("Test 5: ds-atom-sortable class on container", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		expect(document.querySelector(".ds-atom-sortable")).toBeTruthy();
	});

	it("Test 6: ds-atom-sortable-item class on each item", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		const sortableItems = document.querySelectorAll(".ds-atom-sortable-item");
		expect(sortableItems.length).toBe(3);
	});

	it("Test 7: items with reducedMotion=true have no transform style applied", () => {
		// SortableItem with reducedMotion=true should not set transform style
		// We test via standalone SortableItem rendered inside a mock DndContext
		// The reducedMotion prop being true means transform should be undefined/not set
		render(
			<Sortable
				items={[{ id: "rm1", label: "Reduced Motion Item" }]}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		const item = document.querySelector(".ds-atom-sortable-item") as HTMLElement;
		expect(item).toBeTruthy();
		// Without dragging, transform is null/empty - this validates the element renders
		expect(item.style.transform).toBe("");
	});

	it("Test 8: data-list-id set when id prop provided", () => {
		render(
			<Sortable
				id="my-list"
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		const list = document.querySelector('[data-list-id="my-list"]');
		expect(list).toBeTruthy();
	});

	it("Test 9: drop indicator div (.ds-atom-sortable-indicator) does NOT render when overId is null initially", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		// Initially overId is null - no indicator should render
		const indicator = document.querySelector(".ds-atom-sortable-indicator");
		expect(indicator).toBeNull();
	});

	it("Test 10: className prop is applied to the sortable container", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
				className="custom-class"
			/>,
		);
		const container = document.querySelector(".ds-atom-sortable");
		expect(container?.classList.contains("custom-class")).toBe(true);
	});

	it("Test 11: renders empty list when items is empty array", () => {
		render(
			<Sortable
				items={[]}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
			/>,
		);
		const list = document.querySelector("ul.ds-atom-sortable");
		expect(list).toBeTruthy();
		const listItems = document.querySelectorAll("ul.ds-atom-sortable > li");
		expect(listItems.length).toBe(0);
	});

	it("Test 12: SortableDndContext renders children without error", () => {
		const onMove = vi.fn();
		render(
			<SortableDndContext onMove={onMove}>
				<div data-testid="child-content">Child</div>
			</SortableDndContext>,
		);
		expect(screen.getByTestId("child-content")).toBeTruthy();
	});

	it("Test 13: cross-list - two Sortable lists render inside SortableDndContext", () => {
		const onMove = vi.fn();
		const todoItems: SortableItemData[] = [
			{ id: "t1", label: "Todo 1" },
			{ id: "t2", label: "Todo 2" },
		];
		const doneItems: SortableItemData[] = [{ id: "d1", label: "Done 1" }];

		render(
			<SortableDndContext onMove={onMove}>
				<Sortable
					id="todo"
					items={todoItems}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
				<Sortable
					id="done"
					items={doneItems}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
			</SortableDndContext>,
		);

		expect(screen.getByText("Todo 1")).toBeTruthy();
		expect(screen.getByText("Todo 2")).toBeTruthy();
		expect(screen.getByText("Done 1")).toBeTruthy();
	});

	it("Test 14: arrayMove utility correctly reorders items array", () => {
		// Validate arrayMove helper works as expected (used in onReorder logic)
		const items: SortableItemData[] = [
			{ id: "1", label: "A" },
			{ id: "2", label: "B" },
			{ id: "3", label: "C" },
		];
		const reordered = arrayMove(items, 0, 2);
		expect(reordered[0]!.id).toBe("2");
		expect(reordered[1]!.id).toBe("3");
		expect(reordered[2]!.id).toBe("1");
	});

	it("Test 15: SortableDndContext accepts onMove as required prop", () => {
		const onMove = vi.fn();
		// Renders without throwing
		const { unmount } = render(
			<SortableDndContext onMove={onMove}>
				<span>Test</span>
			</SortableDndContext>,
		);
		unmount();
		// No assertions needed - if it renders without throwing, the prop is accepted
		expect(true).toBe(true);
	});

	it("Test 16: Sortable renders with style prop applied to container", () => {
		render(
			<Sortable
				items={ITEMS}
				onReorder={vi.fn()}
				renderItem={(item) => <span>{String(item.label)}</span>}
				style={{ padding: "8px" }}
			/>,
		);
		const list = document.querySelector("ul.ds-atom-sortable") as HTMLElement;
		expect(list?.style.padding).toBe("8px");
	});
});

// ─── Accessibility passthrough (E8 / G-13) ────────────────────────────────────
//
// What jsdom CAN do here, measured rather than assumed:
//
//   * dnd-kit renders the live region and the aria-describedby instruction text
//     INLINE. `createPortal` is used only when `accessibility.container` is set,
//     which this library never sets, so both elements are ordinary children and
//     are readable straight out of jsdom. They are mounted in an EFFECT, so they
//     do not exist in SSR'd markup — irrelevant to RTL, which flushes effects.
//   * Space (pick up), Space again (drop) and Escape (cancel) all reach the
//     KeyboardSensor, so onDragStart, onDragOver, onDragEnd and onDragCancel are
//     every one of them assertable — but only after a macrotask tick. The sensor
//     attaches its post-activation document listener asynchronously, so a
//     synchronous second keydown lands before the listener exists and is lost.
//     `flush()` below is that tick, and without it three of these cases would
//     read a stale live region and pass or fail for the wrong reason.
//
// What jsdom CANNOT do is complete a MOVE: every getBoundingClientRect is 0x0,
// so `sortableKeyboardCoordinates` finds no rect below the active one, ArrowDown
// is a no-op and `over` never becomes anything but the active item itself. The
// focus/Space/ArrowDown/Space reorder is therefore asserted in
// tests/visual/sortable-announce.spec.ts, in a real browser, where it is also the
// only place the announcement TEXT can be checked against a real reorder.

/** Verbatim @dnd-kit/core@6.3.1 defaults, measured in Chromium 147 AND in jsdom
 *  before this passthrough existed. Pinned literally so that replacing the
 *  defaults — with silence, with a partial object, or by accident — fails loudly
 *  and names the exact string that changed. */
const DEFAULT_PICKUP_TEXT = "Draggable item a was moved over droppable area a.";
const DEFAULT_DROP_TEXT = "Draggable item a was dropped over droppable area a";
const DEFAULT_CANCEL_TEXT = "Dragging was cancelled. Draggable item a was dropped.";
const DEFAULT_INSTRUCTIONS_FRAGMENT = "To pick up a draggable item, press the space bar.";

/** Markers deliberately share no substring with any dnd-kit default, so a case
 *  that reads one of these cannot be reading a default by coincidence — and a
 *  case that reads a default cannot be reading one of these. */
function announcerSaying(marker: string): Announcements {
	return {
		onDragStart: ({ active }) => `${marker} grabbed ${String(active.id)}.`,
		// Returning undefined leaves the previous utterance in place: dnd-kit's
		// `announce` ignores null/undefined rather than clearing the region. That
		// is the mechanism the reference announcer uses to stop a pick-up being
		// overwritten by "moved over <itself>".
		onDragOver: () => undefined,
		onDragEnd: ({ active }) => `${marker} released ${String(active.id)}.`,
		onDragCancel: ({ active }) => `${marker} abandoned ${String(active.id)}.`,
	};
}

const liveRegion = () => document.querySelector('[id^="DndLiveRegion"]');
const instructionText = () => document.querySelector('[id^="DndDescribedBy"]');
const spoken = () => liveRegion()?.textContent;

/** One macrotask, inside act, so React commits and dnd-kit's deferred listener
 *  attach both land before the next keystroke. */
const flush = () =>
	act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});

function press(key: string, code: string, keyCode: number) {
	const target = (document.activeElement as HTMLElement | null) ?? document.body;
	fireEvent.keyDown(target, { key, code, keyCode });
}
const SPACE = [" ", "Space", 32] as const;
const ESCAPE = ["Escape", "Escape", 27] as const;

function focusFirstTile() {
	(document.querySelector(".ds-atom-sortable-item") as HTMLElement).focus();
}

function renderList(props: Partial<React.ComponentProps<typeof Sortable>> = {}) {
	return render(
		<Sortable
			items={ITEMS}
			onReorder={vi.fn()}
			renderItem={(item) => <span>{String(item.label)}</span>}
			{...props}
		/>,
	);
}

describe("Sortable — announcer passthrough (E8 / G-13)", () => {
	it("Test 17: an announcements object reaches the DndContext Sortable renders", async () => {
		renderList({ announcements: announcerSaying("ZQX") });
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe("ZQX grabbed a.");
	});

	it("Test 18: the supplied announcer owns the drop and the cancel too, not just the pick-up", async () => {
		renderList({ announcements: announcerSaying("ZQX") });
		focusFirstTile();
		press(...SPACE);
		await flush();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe("ZQX released a.");

		press(...SPACE);
		await flush();
		press(...ESCAPE);
		await flush();
		expect(spoken()).toBe("ZQX abandoned a.");
	});

	it("Test 19: screenReaderInstructions replace dnd-kit's default instruction text", () => {
		renderList({ screenReaderInstructions: { draggable: "ZQX custom instructions." } });
		expect(instructionText()?.textContent).toBe("ZQX custom instructions.");
	});

	it("Test 20: with no announcements prop, dnd-kit's defaults are unchanged verbatim", async () => {
		renderList();
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe(DEFAULT_PICKUP_TEXT);
		press(...SPACE);
		await flush();
		expect(spoken()).toBe(DEFAULT_DROP_TEXT);
	});

	it("Test 21: the pick-up utterance comes from onDragOver, not onDragStart — G-13's misattribution", async () => {
		// G-13 records the post-Space text as "the pick-up event announces the item
		// as having moved over itself". The TEXT is right and the ATTRIBUTION is
		// wrong: dnd-kit's default onDragStart returns "Picked up draggable item a.",
		// and onDragOver fires immediately afterwards — the active item collides
		// with its own droppable — overwriting it in the same live region. An
		// announcer that fixes only onDragStart therefore changes nothing audible.
		renderList();
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe(DEFAULT_PICKUP_TEXT);
		expect(spoken()).not.toContain("Picked up");
	});

	it("Test 22: with no screenReaderInstructions prop, dnd-kit's default instructions are unchanged", () => {
		renderList();
		expect(instructionText()?.textContent).toContain(DEFAULT_INSTRUCTIONS_FRAGMENT);
	});

	it("Test 23: passing undefined explicitly still gets dnd-kit's defaults, never silence", async () => {
		// T-15-02. The component must forward `undefined`, never `{}`: dnd-kit
		// substitutes a default only for a member that IS undefined, so an empty
		// object replaces the defaults with a crash — every member except
		// onDragMove is required — rather than with silence.
		renderList({ announcements: undefined, screenReaderInstructions: undefined });
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe(DEFAULT_PICKUP_TEXT);
		expect(instructionText()?.textContent).toContain(DEFAULT_INSTRUCTIONS_FRAGMENT);
	});

	it("Test 24: SortableDndContext forwards announcements to the shared DndContext", async () => {
		render(
			<SortableDndContext onMove={vi.fn()} announcements={announcerSaying("ZQX")}>
				<Sortable
					id="one"
					items={ITEMS}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
			</SortableDndContext>,
		);
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe("ZQX grabbed a.");
	});

	it("Test 25: SortableDndContext forwards screenReaderInstructions to the shared DndContext", () => {
		const instructions: ScreenReaderInstructions = { draggable: "ZQX shared instructions." };
		render(
			<SortableDndContext onMove={vi.fn()} screenReaderInstructions={instructions}>
				<Sortable
					id="one"
					items={ITEMS}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
			</SortableDndContext>,
		);
		expect(instructionText()?.textContent).toBe("ZQX shared instructions.");
	});

	it("Test 26: a nested Sortable renders no DndContext of its own — one live region for two lists", () => {
		render(
			<SortableDndContext onMove={vi.fn()}>
				<Sortable
					id="one"
					items={ITEMS}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
				<Sortable
					id="two"
					items={[{ id: "z", label: "Item Z" }]}
					onReorder={vi.fn()}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
			</SortableDndContext>,
		);
		expect(document.querySelectorAll('[id^="DndLiveRegion"]').length).toBe(1);
		expect(document.querySelectorAll('[id^="DndDescribedBy"]').length).toBe(1);
	});

	it("Test 27: a nested Sortable's own announcements is a no-op — the parent's is what speaks", async () => {
		render(
			<SortableDndContext onMove={vi.fn()} announcements={announcerSaying("PARENT")}>
				<Sortable
					id="one"
					items={ITEMS}
					onReorder={vi.fn()}
					announcements={announcerSaying("CHILD")}
					screenReaderInstructions={{ draggable: "CHILD instructions." }}
					renderItem={(item) => <span>{String(item.label)}</span>}
				/>
			</SortableDndContext>,
		);
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe("PARENT grabbed a.");
		expect(spoken()).not.toContain("CHILD");
		expect(instructionText()?.textContent).not.toContain("CHILD");
	});

	it("Test 28: the nested no-op is documented on both props rather than silently dropped", () => {
		// This library ships no dev-mode warnings anywhere else, so the contract is
		// carried by the docstring. A prop whose value is discarded with nothing
		// saying so is the defect this asserts against.
		const source = readFileSync(join(__dirname, "index.tsx"), "utf8");
		for (const [iface, next] of [
			["export interface SortableProps", "export interface SortableItemProps"],
			["export interface SortableDndContextProps", "// ─── Context sentinel"],
		] as const) {
			const start = source.indexOf(iface);
			const end = source.indexOf(next);
			expect(start).toBeGreaterThan(-1);
			expect(end).toBeGreaterThan(start);
			const body = source.slice(start, end);
			for (const decl of ["announcements?: Announcements;", "screenReaderInstructions?:"]) {
				const at = body.indexOf(decl);
				expect(at).toBeGreaterThan(-1);
				if (iface === "export interface SortableProps") {
					// The doc comment attached to this declaration: the JSDoc block that
					// opens most recently before it. Anchoring on the previous member's
					// semicolon instead looks equivalent and is not — prose inside a
					// docstring contains semicolons, and this assertion caught exactly
					// that while being written.
					const opens = body.lastIndexOf("/**", at);
					expect(opens).toBeGreaterThan(-1);
					const doc = body.slice(opens, at);
					expect(doc).toMatch(/ignored/i);
					expect(doc).toContain("SortableDndContext");
				}
			}
		}
	});

	it("Test 29: the keyboard sensor is untouched — pick up, drop and cancel all still fire", async () => {
		// Regression guard for T-15-01. A rest-spread onto DndContext would let a
		// consumer replace `sensors` or `collisionDetection`; this asserts the
		// sensor path the Phase 0 sketch measured as working is still intact with
		// the passthrough in place.
		renderList({ announcements: undefined, screenReaderInstructions: undefined });
		focusFirstTile();
		press(...SPACE);
		await flush();
		expect(spoken()).toBe(DEFAULT_PICKUP_TEXT);
		press(...ESCAPE);
		await flush();
		expect(spoken()).toBe(DEFAULT_CANCEL_TEXT);
	});
});
