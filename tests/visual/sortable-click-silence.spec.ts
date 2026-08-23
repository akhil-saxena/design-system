import { type Page, expect, test } from "@playwright/test";

/**
 * E35. A plain click on a tile must not run a drag cycle — and a real drag must
 * still run one.
 *
 * `PointerSensor` was registered with no `activationConstraint`, so `pointerdown`
 * started a drag and `pointerup` ended it. With the announcer 01-15 added, every
 * click therefore spoke a completed drop into the live region. Measured before
 * the fix, clicking the fourth tile of interaction-sortable--single-list:
 *
 *     "Draggable item task-d was dropped over droppable area task-d"
 *
 * A screen-reader user heard a spurious drop on every click. The admin's photo
 * grid is 39 tiles and reordering them is its core gesture, so this was
 * continuous false narration on the most-used surface in the product.
 *
 * BOTH HALVES ARE ASSERTED, AND THAT IS THE POINT OF THE FILE.
 *
 * "The click is silent" is trivially satisfiable by a component that can no
 * longer drag at all — a constraint set to 400px would pass it. So every silence
 * case is paired with a case that drives a REAL gesture through to a changed DOM
 * order. Asking what the silence assertion alone could not distinguish is the
 * same question E34 answered too late: there, every case focused the first tile,
 * so "the tile picked up" and "the first tile" were indistinguishable.
 *
 * DOM ORDER, NOT THE ANNOUNCEMENT, IS THE EVIDENCE THAT A DRAG WORKED. E34
 * established that an announcement is a truthful report of what dnd-kit is
 * holding, which is not the same as the right thing having been held — the
 * announcer was correct while the component picked up the wrong tile. So the
 * positive cases assert the reordered order and read the utterance as a
 * secondary check.
 *
 * THE FOURTH TILE, NEVER THE FIRST, for the same E34 reason.
 *
 * The 4px radius is asserted at its boundary rather than assumed: 3px must stay
 * silent and 5px must activate. A single mid-range probe would pass against any
 * threshold between 1 and the probe distance, and so would not be evidence about
 * the value that actually shipped.
 */

const SINGLE = "interaction-sortable--single-list";
const CROSS = "interaction-sortable--cross-list";
const LIVE_REGION = '[id^="DndLiveRegion"]';
const TILE = ".ds-atom-sortable-item";
/** Not the first tile — see the docstring. */
const NTH = 3;

async function openStory(page: Page, id: string) {
	await page.goto(`/iframe.html?id=${id}&viewMode=story`);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 15_000 });
	await page.waitForSelector(TILE, { state: "attached", timeout: 15_000 });
	// dnd-kit mounts the live region in an effect, so it is absent from the
	// markup the page first parses. Waiting for it means "the region is empty"
	// can never be satisfied by the region simply not existing yet.
	await page.waitForSelector(LIVE_REGION, { state: "attached", timeout: 15_000 });
	await expect(page.locator(TILE).nth(NTH)).toBeVisible();
}

const spoken = async (page: Page) =>
	((await page.locator(LIVE_REGION).first().textContent()) ?? "").trim();

const order = (page: Page) =>
	page.$$eval(TILE, (ns) => ns.map((n) => (n.textContent ?? "").trim()));

/** Press on the nth tile, travel `dx`/`dy`, release. */
async function press(page: Page, nth: number, dx: number, dy: number, steps = 4) {
	const box = await page.locator(TILE).nth(nth).boundingBox();
	if (!box) throw new Error(`tile ${nth} has no box — the story did not render`);
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;
	await page.mouse.move(cx, cy);
	await page.mouse.down();
	if (dx !== 0 || dy !== 0) await page.mouse.move(cx + dx, cy + dy, { steps });
	await page.mouse.up();
	// The utterance is written in an effect after dragEnd; without this a silent
	// read could simply be a read that happened too early, which would make the
	// silence assertions pass for the wrong reason.
	await page.waitForTimeout(350);
	return { spoken: await spoken(page), order: await order(page) };
}

test.describe("Sortable pointer activation (E35)", () => {
	test("a plain click on a tile says nothing", async ({ page }) => {
		await openStory(page, SINGLE);
		const before = await order(page);
		const r = await press(page, NTH, 0, 0);
		expect(r.spoken, "a plain click must not speak a drag").toBe("");
		expect(r.order, "a plain click must not reorder").toEqual(before);
	});

	test("a sub-threshold twitch says nothing — 3px, inside the 4px radius", async ({ page }) => {
		await openStory(page, SINGLE);
		const r = await press(page, NTH, 3, 0, 2);
		expect(r.spoken, "a 3px twitch is a click, not a drag").toBe("");
	});

	test("5px activates, so the dead zone is the 4px radius and not something larger", async ({
		page,
	}) => {
		await openStory(page, SINGLE);
		const r = await press(page, NTH, 5, 0, 2);
		// Pins the constraint from ABOVE. Without this, a constraint of any size
		// would satisfy the two silence cases above.
		expect(r.spoken, "a 5px drag must still activate the pointer sensor").not.toBe("");
		expect(r.spoken).toContain("task-d");
	});

	test("a short deliberate drag still reorders, and still announces", async ({ page }) => {
		await openStory(page, SINGLE);
		const before = await order(page);
		const box = await page.locator(TILE).nth(NTH).boundingBox();
		if (!box) throw new Error("no tile box");
		// One tile down: the shortest gesture that can actually change the order.
		const r = await press(page, NTH, 0, box.height + 10, 8);
		expect(r.order, "a real drag must change the DOM order").not.toEqual(before);
		expect(r.order, "the dragged tile should have moved one place down").toEqual([
			"Task A",
			"Task B",
			"Task C",
			"Task E",
			"Task D",
		]);
		expect(r.spoken, "a real drag must still be announced").toContain("dropped over");
	});

	test("a keyboard reorder is untouched — it still moves and still announces", async ({ page }) => {
		await openStory(page, SINGLE);
		const before = await order(page);
		await page.locator(TILE).nth(NTH).focus();
		await page.keyboard.press("Space");
		// dnd-kit attaches the KeyboardSensor's document keydown listener inside a
		// setTimeout, so an ArrowDown sent immediately after Space is dropped on the
		// floor and the reorder silently does nothing.
		await page.waitForTimeout(250);
		expect(await spoken(page), "Space must announce a pick-up").toContain("task-d");
		await page.keyboard.press("ArrowDown");
		await page.waitForTimeout(250);
		expect(await spoken(page), "ArrowDown must announce movement over the next tile").toContain(
			"task-e",
		);
		await page.keyboard.press("Space");
		await page.waitForTimeout(350);
		expect(await order(page), "the keyboard reorder must change the DOM order").not.toEqual(before);
		expect(await spoken(page)).toContain("dropped over");
	});

	test("the cross-list context got the constraint too — a click there is silent", async ({
		page,
	}) => {
		// SortableDndContext has its own sensor list, and the defect was in both.
		// Only silence is asserted here: E34 recorded that the cross-list KEYBOARD
		// reorder does not move anything, pre-existing and unrelated, so asserting a
		// completed cross-list move would fail for a reason this fix does not own.
		await openStory(page, CROSS);
		const before = await order(page);
		const r = await press(page, NTH, 0, 0);
		expect(r.spoken, "a plain click in the cross-list context must not speak a drag").toBe("");
		expect(r.order).toEqual(before);
	});
});
