import { type Page, expect, test } from "@playwright/test";
import { pickUpWithSpace, recordKeyboardSensorAttachment } from "./dnd-keyboard";

/**
 * E34 — which tile a keyboard pick-up actually grabs, measured in Chromium.
 *
 * The defect: press Space on Task A, then click Task D. The click moves DOM focus
 * to Task D, but dnd-kit is still holding Task A, and `DndContext` refuses every
 * new activation while `activeRef.current` is set — so the click cannot start a
 * drag of its own and is discarded silently. Every subsequent ArrowDown and Space
 * moves Task A. Read from the outside that is "it always drags the first item",
 * because Tab lands on the first tile and Space there is precisely what the
 * screen-reader instruction tells a keyboard user to do.
 *
 * Why `sortable-announce.spec.ts` passes on the broken component: every case in it
 * calls `.first().focus()`. "The tile that was picked up" and "the first tile"
 * were the same element in all five, so `task-a` in the live region was equally
 * consistent with a correct component and with one that can only pick up index 0.
 * Nothing there ever focused a tile that was not first, and nothing there ever
 * moved the pointer during a drag.
 *
 * These cases focus a tile that is NOT first, and assert the identity of the
 * moved item out of the DOM order — the strongest available statement, since a
 * live region can be truthful about the wrong item.
 */

const STORY = "interaction-sortable--single-list";
const TILE = ".ds-atom-sortable-item";
const LIVE_REGION = '[id^="DndLiveRegion"]';

async function openStory(page: Page) {
	// Before the goto: the recorder is an init script, and a listener added during
	// mount is invisible to a patch installed after the page has loaded.
	await recordKeyboardSensorAttachment(page);
	await page.goto(`/iframe.html?id=${STORY}&viewMode=story`);
	await page.waitForSelector(TILE, { state: "attached", timeout: 15_000 });
	// Mounted in an effect, so it is absent from the markup the page first parses.
	await page.waitForSelector(LIVE_REGION, { state: "attached", timeout: 15_000 });
}

const order = (page: Page) => page.locator(TILE).allTextContents();

/** The tiles dnd-kit currently reports as being dragged. Read from the DOM rather
 *  than from the live region: a wrong-item pick-up announces itself truthfully,
 *  so the utterance alone cannot distinguish the defect from correct behaviour. */
const held = (page: Page) => page.locator(`${TILE}[data-dragging="true"]`).allTextContents();

/** Waits until exactly `labels` are held, so a keystroke that fell on the floor
 *  fails here instead of being inherited by the next assertion. dnd-kit attaches
 *  the sensor's document listener across a frame, so back-to-back presses lose
 *  the second one — measured. */
async function expectHeld(page: Page, labels: string[]) {
	await expect
		.poll(async () => (await held(page)).join(","), {
			timeout: 5_000,
			message: `expected the held tile(s) to be ${JSON.stringify(labels)}`,
		})
		.toBe(labels.join(","));
}

/** Picks up the nth tile and does not return until the sensor can receive the
 *  NEXT keystroke. `data-dragging` lands one commit after the pick-up, but dnd-kit
 *  attaches the KeyboardSensor's document keydown listener in a `setTimeout` after
 *  that, so an ArrowDown sent the instant the tile looks held is dropped on the
 *  floor — and the failure then reads as a broken reorder rather than a lost key.
 *  Measured: this spec failed exactly that way before the settle was added.
 *
 *  That settle used to be `waitForTimeout(100)`. It has been replaced by a wait
 *  on the listener ITSELF (see ./dnd-keyboard). 100ms wins on an idle machine and
 *  is a coin toss when six workers and a Vite dev server share twelve cores — a
 *  fixed budget for an unbounded wait is the same race with a longer fuse, and
 *  the sibling spec sortable-announce.spec.ts, which paced on the live region
 *  instead, is the one that actually failed two full-suite runs in three.
 *
 *  `expectHeld` is KEPT, and not as belt-and-braces: it asserts the pick-up
 *  grabbed the tile this test named, which is the defect (E34) the whole file
 *  exists for. The sensor wait says the next key will be heard; expectHeld says
 *  the right tile is holding it. Neither implies the other. */
async function pickUp(page: Page, index: number, label: string) {
	await page.locator(TILE).nth(index).focus();
	await pickUpWithSpace(page);
	await expectHeld(page, [label]);
}

/** Text currently in the live region, asserted non-empty so no downstream
 *  "contains" assertion can pass against an empty string. */
async function spoken(page: Page): Promise<string> {
	const text = (await page.locator(LIVE_REGION).first().textContent()) ?? "";
	expect(text.trim(), "the live region is empty — nothing was announced").toBeTruthy();
	return text;
}

/** Presses a key and waits for the announcement to name `fragment`, so a keystroke
 *  that produced nothing fails here instead of inheriting the previous utterance. */
async function pressUntilSpoken(page: Page, key: string, fragment: string) {
	await page.keyboard.press(key);
	await expect
		.poll(async () => spoken(page), {
			timeout: 5_000,
			message: `the live region never mentioned ${JSON.stringify(fragment)} after ${key}`,
		})
		.toContain(fragment);
}

test.describe("Sortable keyboard pick-up target (E34)", () => {
	test("Space picks up the tile that has focus, not the first tile", async ({ page }) => {
		await openStory(page);
		const before = await order(page);
		expect(before).toEqual(["Task A", "Task B", "Task C", "Task D", "Task E"]);

		await pickUp(page, 3, "Task D");
		await expect(page.locator(TILE).nth(3)).toBeFocused();
		expect(await spoken(page)).toContain("task-d");

		await pressUntilSpoken(page, "ArrowDown", "task-e");
		await page.keyboard.press("Space");

		// Task D moved and Task A did not. The reverse — Task A at the end — is the
		// exact shape of the reported defect.
		await expect
			.poll(async () => await order(page), { timeout: 5_000 })
			.toEqual(["Task A", "Task B", "Task C", "Task E", "Task D"]);
	});

	test("clicking another tile releases the held one, so the next Space picks up the tile that was clicked", async ({
		page,
	}) => {
		await openStory(page);

		// The wedge: the first thing the instruction text tells a keyboard user to do.
		await pickUp(page, 0, "Task A");

		// The developer's gesture, verbatim.
		await page.locator(TILE).nth(3).click();
		await expect(page.locator(TILE).nth(3)).toBeFocused();
		await expectHeld(page, []);

		await pickUpWithSpace(page);
		await expectHeld(page, ["Task D"]);
		await pressUntilSpoken(page, "ArrowDown", "task-e");
		await page.keyboard.press("Space");

		await expect
			.poll(async () => await order(page), { timeout: 5_000 })
			.toEqual(["Task A", "Task B", "Task C", "Task E", "Task D"]);
	});

	test("Tab off a held tile releases it", async ({ page }) => {
		await openStory(page);
		await pickUp(page, 1, "Task B");

		await page.keyboard.press("Tab");
		await expectHeld(page, []);
		await expect.poll(async () => spoken(page), { timeout: 5_000 }).toContain("cancelled");
		// Cancel, not drop: the order the user started with is intact.
		expect(await order(page)).toEqual(["Task A", "Task B", "Task C", "Task D", "Task E"]);
	});

	test("the plain keyboard reorder is unchanged — the guard does not fire on its own drag", async ({
		page,
	}) => {
		// The regression control. A guard that cancelled on any pointerdown, or on
		// focusin rather than before focus moves, would break this while still
		// passing the three cases above.
		await openStory(page);
		await pickUp(page, 0, "Task A");
		await pressUntilSpoken(page, "ArrowDown", "task-b");
		await page.keyboard.press("Space");
		await expect
			.poll(async () => await order(page), { timeout: 5_000 })
			.toEqual(["Task B", "Task A", "Task C", "Task D", "Task E"]);
		// dnd-kit restores focus to the tile that moved; the fix leans on that guard
		// staying intact, so it is asserted rather than assumed.
		await expect(page.locator(TILE).nth(1)).toBeFocused();
	});
});
