import { type Page, expect, test } from "@playwright/test";
import { pickUpWithSpace, recordKeyboardSensorAttachment } from "./dnd-keyboard";

/**
 * E8 / G-13 — the announcer passthrough, driven by keyboard alone in a real
 * browser and read out of the live region dnd-kit mounts.
 *
 * Why a browser and not jsdom. `Sortable.test.tsx` can assert every one of the
 * four announcement callbacks, because Space, Space-again and Escape all reach
 * the KeyboardSensor under jsdom. What it CANNOT do is complete a move: every
 * getBoundingClientRect is 0x0, so `sortableKeyboardCoordinates` finds no rect
 * below the active one, ArrowDown is a no-op, and `over` never becomes anything
 * but the active item itself. The announcement that matters most — the one
 * naming the position an item moved TO — is therefore unreachable there. This
 * file is the only place it is checked.
 *
 * Two ways this file could lie, both guarded explicitly:
 *
 *   1. Reading too early. dnd-kit mounts the live region in an effect, so it is
 *      absent from SSR'd markup and briefly absent after navigation. A query that
 *      runs before it exists finds nothing, and "does not contain the record id"
 *      is then trivially true. Every read goes through `spoken()`, which waits for
 *      the region and ASSERTS THE TEXT IS NON-EMPTY before returning it.
 *   2. Reading a stale utterance. If a keystroke does nothing, the region still
 *      holds the previous sentence and the assertion passes against the wrong
 *      step. `spokenAfter()` requires the text to have CHANGED from the value
 *      passed in, so a keystroke that fell on the floor fails rather than
 *      inheriting.
 */

const ANNOUNCED = "interaction-sortable--announced-reorder";
const DEFAULTS = "interaction-sortable--single-list";

const LIVE_REGION = '[id^="DndLiveRegion"]';
const TILE = ".ds-atom-sortable-item";

/** The record ids the announced story uses. None may ever be spoken. */
const RECORD_IDS = [
	"abstract-intothemist",
	"abstract-lightscameraart",
	"harbour-lowtide",
	"street-crossing",
	"portrait-atwork",
];

async function openStory(page: Page, id: string) {
	// Before the goto: the recorder is an init script, and a listener added during
	// mount is invisible to a patch installed after the page has loaded.
	await recordKeyboardSensorAttachment(page);
	await page.goto(`/iframe.html?id=${id}&viewMode=story`);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 15_000 });
	await page.waitForSelector(TILE, { state: "attached", timeout: 15_000 });
	// Mounted in an effect, so it is NOT in the markup the page first parses.
	await page.waitForSelector(LIVE_REGION, { state: "attached", timeout: 15_000 });
}

/** Text currently in the live region, asserted non-empty so no downstream
 *  "does not contain X" assertion can pass against an empty string. */
async function spoken(page: Page): Promise<string> {
	const text = await page.locator(LIVE_REGION).first().textContent();
	expect(
		text,
		"the live region is empty — nothing was announced, so any assertion about its content would be vacuous",
	).toBeTruthy();
	return (text ?? "").trim();
}

/** Waits until the live region says something DIFFERENT from `previous`, so a
 *  keystroke that did nothing fails here rather than re-asserting the last one. */
async function spokenAfter(page: Page, previous: string): Promise<string> {
	await expect
		.poll(async () => ((await page.locator(LIVE_REGION).first().textContent()) ?? "").trim(), {
			timeout: 5_000,
			message: `the live region never changed from ${JSON.stringify(previous)} — the keystroke produced no announcement`,
		})
		.not.toBe(previous);
	return spoken(page);
}

const order = (page: Page) => page.locator(TILE).allTextContents();

test.describe("Sortable announcer (E8 / G-13)", () => {
	test("a keyboard reorder speaks the photo's title and a one-based position, never a record id", async ({
		page,
	}) => {
		await openStory(page, ANNOUNCED);
		await page.locator(TILE).first().focus();
		await expect(page.locator(TILE).first()).toBeFocused();

		await pickUpWithSpace(page);
		const pickUp = await spokenAfter(page, "");
		console.log(`AFTER Space      ${JSON.stringify(pickUp)}`);

		await page.keyboard.press("ArrowDown");
		const moved = await spokenAfter(page, pickUp);
		console.log(`AFTER ArrowDown  ${JSON.stringify(moved)}`);

		await page.keyboard.press("Space");
		const dropped = await spokenAfter(page, moved);
		console.log(`AFTER Space      ${JSON.stringify(dropped)}`);

		for (const [step, text] of [
			["pick-up", pickUp],
			["move", moved],
			["drop", dropped],
		] as const) {
			// Speaks a human title...
			expect(text, `${step} should name the photo`).toContain("Into the Mist");
			// ...a one-based position AND its total...
			expect(text, `${step} should carry a one-based position and a total`).toMatch(
				/position \d+ of 5/i,
			);
			// ...and never a raw record id, which is defect 1 of the three measured.
			for (const id of RECORD_IDS) {
				expect(text, `${step} must not speak the record id ${id}`).not.toContain(id);
			}
			// Every utterance is a terminated sentence; dnd-kit's own drop message is
			// the one that is not, and it paces differently in a screen reader.
			expect(text.endsWith("."), `${step} should end in a full stop`).toBe(true);
		}

		// The position spoken on pick-up is the one it started at; the position
		// spoken on the move and the drop is where it went. If these were equal the
		// announcement would be reporting a move that did not move. Case-insensitive
		// because "Position" opens a sentence on pick-up and closes one on the move.
		expect(pickUp).toMatch(/position 1 of 5/i);
		expect(moved).toMatch(/position 2 of 5/i);
		expect(dropped).toMatch(/position 2 of 5/i);

		// The announcement is worth nothing if it describes a move that did not
		// happen, so the DOM order is checked in the same run that read the text.
		await expect
			.poll(async () => (await order(page))[0], { timeout: 5_000 })
			.toBe("Lights, Camera, Art");
	});

	test("the pick-up utterance does not claim the item moved over itself", async ({ page }) => {
		await openStory(page, ANNOUNCED);
		await page.locator(TILE).first().focus();
		await page.keyboard.press("Space");
		const pickUp = await spokenAfter(page, "");

		// Defect 3. dnd-kit's default text for this instant is "Draggable item X was
		// moved over droppable area X" — the same id twice — because onDragOver
		// fires on the self-collision straight after onDragStart and overwrites the
		// pick-up message. Both halves are asserted: it must not be phrased as a
		// move, and it must not name the same thing twice.
		expect(pickUp).not.toMatch(/moved over/i);
		expect(pickUp).toMatch(/^Picked up /);
		const titleOccurrences = pickUp.split("Into the Mist").length - 1;
		expect(titleOccurrences, "the pick-up names the item once, not twice").toBe(1);
	});

	test("the keyboard reorder itself still completes — focus, Space, ArrowDown, Space", async ({
		page,
	}) => {
		await openStory(page, ANNOUNCED);
		const before = await order(page);
		expect(before[0]).toBe("Into the Mist");
		expect(before[1]).toBe("Lights, Camera, Art");

		await page.locator(TILE).first().focus();
		// Paced on the SENSOR, not on the live region. The comment this replaces was
		// right about the mechanism and wrong about the remedy: dnd-kit attaches the
		// move listener in a setTimeout inside KeyboardSensor.attach(), but the
		// "Picked up ..." utterance is produced by handleStart() on the line ABOVE
		// that setTimeout. So waiting for the announcement returns inside the race
		// window rather than past it, and the lost ArrowDown reads as a broken
		// reorder: "expected Lights, Camera, Art, received Into the Mist".
		await pickUpWithSpace(page);
		const pickUp = await spokenAfter(page, "");
		await page.keyboard.press("ArrowDown");
		const moved = await spokenAfter(page, pickUp);
		await page.keyboard.press("Space");
		await spokenAfter(page, moved);

		await expect
			.poll(async () => (await order(page))[0], { timeout: 5_000 })
			.toBe("Lights, Camera, Art");
		const after = await order(page);
		expect(after[1]).toBe("Into the Mist");
		expect(after.length).toBe(before.length);
	});

	test("a Sortable given no announcer still gets dnd-kit's defaults, verbatim", async ({
		page,
	}) => {
		// The regression guard for "passing nothing keeps today's behaviour exactly".
		// Pinned as the literal strings measured in Chromium 147 BEFORE the
		// passthrough existed, so substituting `{}` for `undefined`, or defaulting
		// the prop, or merging anything into it, changes one of these and fails.
		await openStory(page, DEFAULTS);
		await page.locator(TILE).first().focus();

		await pickUpWithSpace(page);
		const pickUp = await spokenAfter(page, "");
		expect(pickUp).toBe("Draggable item task-a was moved over droppable area task-a.");

		await page.keyboard.press("ArrowDown");
		const moved = await spokenAfter(page, pickUp);
		expect(moved).toBe("Draggable item task-a was moved over droppable area task-b.");

		await page.keyboard.press("Space");
		const dropped = await spokenAfter(page, moved);
		// No terminating full stop — dnd-kit's default drop message lacks one where
		// the other two have it. Recorded rather than corrected: it is dnd-kit's
		// string, and correcting it would BE the behaviour change this guards.
		expect(dropped).toBe("Draggable item task-a was dropped over droppable area task-b");

		await expect.poll(async () => (await order(page))[0], { timeout: 5_000 }).toBe("Task B");
	});

	test("the live region is real, singular per DndContext, and not in the SSR'd markup", async ({
		page,
	}) => {
		// Two dnd-kit architectural properties, recorded rather than fixed — both are
		// dnd-kit's code, not this library's. Asserted so the SUMMARY's claims about
		// them are measurements and not recollections.
		await openStory(page, ANNOUNCED);
		const shape = await page.evaluate(() => {
			const regions = [...document.querySelectorAll('[id^="DndLiveRegion"]')];
			const root = document.querySelector("#storybook-root");
			return {
				count: regions.length,
				ariaLive: regions.map((r) => r.getAttribute("aria-live")),
				role: regions.map((r) => r.getAttribute("role")),
				// Portaled content is invisible to the a11y suite. These are not
				// portaled: createPortal is used only when `accessibility.container` is
				// set, which this library never sets.
				insideRoot: regions.every((r) => root?.contains(r) ?? false),
			};
		});
		expect(shape.count).toBe(1);
		expect(shape.ariaLive).toEqual(["assertive"]);
		expect(shape.role).toEqual(["status"]);
		expect(shape.insideRoot).toBe(true);

		// Mounted in an effect: the HTML the server sent contains no live region at
		// all. This is why every read here waits rather than querying immediately.
		const rawHtml = await (
			await page.request.get(`/iframe.html?id=${ANNOUNCED}&viewMode=story`)
		).text();
		expect(rawHtml).not.toContain("DndLiveRegion");
	});
});
