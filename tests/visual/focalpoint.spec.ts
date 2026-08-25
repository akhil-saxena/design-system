import { type CDPSession, type Page, expect, test } from "@playwright/test";
import { hexToRgb, probeComputed } from "./computed";

/**
 * G-1 / E12 — FocalPointPicker, measured in Chromium.
 *
 * WHY THIS FILE EXISTS AND `FocalPointPicker.test.tsx` IS NOT ENOUGH. Four
 * distinct claims cannot be made in jsdom at all, and each one is a legacy defect
 * or a recorded model divergence:
 *
 *   1. jsdom does not implement `PointerEvent` (measured:
 *      `typeof window.PointerEvent === "undefined"`), so it cannot produce a
 *      TOUCH pointer or a PEN pointer. Legacy defect 1 is that the control was
 *      inert to both, so the only place that claim can be tested is here.
 *   2. jsdom has no layout, so every `getBoundingClientRect()` is 0x0. The unit
 *      file stubs rects to make the arithmetic observable; the frame-size
 *      independence claim then has to be re-measured against real boxes, because
 *      a stub proves the arithmetic and not the geometry.
 *   3. jsdom resolves no `aspect-ratio`, so "the frame is 3:2" is unmeasurable
 *      there — and the ratio arrives through a CUSTOM PROPERTY, whose whole point
 *      is that the cascade can override it.
 *   4. `getComputedStyle` in jsdom implements no specificity (01-09 measured
 *      it), so it cannot say whether the marker's brand fill actually resolved.
 *
 * WHY IT WRITES NO SCREENSHOT. Every assertion below reads computed style,
 * geometry or text. `tests/visual-baselines/` must stay diff-clean and a pixel
 * baseline recorded by an executor is a baseline recorded against whatever state
 * that executor happened to be in — this repository already has a docstring
 * (control-chrome.spec.ts) recording baselines that were captured with a bug
 * present and so "compared clean forever".
 *
 * WHAT THIS FILE CANNOT PROVE, NAMED RATHER THAN LEFT IMPLIED.
 * `touch-action: none` on the frame is load-bearing on a real touch device — it
 * is what stops the browser claiming the gesture for a scroll and firing
 * `pointercancel` partway through. It is NOT falsifiable here. Measured twice:
 * deleting that one declaration from `.ds-atom-focalpoint-frame` leaves all
 * fifteen cases below green, on a non-scrollable page AND on a page given 3000px
 * of scrollable body. CDP's `Input.dispatchTouchEvent` dispatches DOM touch
 * events directly and never enters Chromium's touch-action / scroll-gesture
 * pipeline, so no Playwright-synthesised touch can observe it. An assertion was
 * written for it and then REMOVED rather than left in place, because an assertion
 * that cannot fail reads as proof. That declaration rests on the reasoning in its
 * own CSS comment and on a human check with a real finger.
 *
 * WHY EVERY PROBE ASSERTS ITS BRAND. E29: two stories in this repository set
 * `className="dark"` on a wrapper AND a hardcoded page colour, so a probe inside
 * them measured the DEFAULT brand while reporting a charcoal number. The stories
 * this file drives carry no such wrapper — the mode and brand come from the
 * toolbar globals — and `--ochre` is read off the probed element as proof of
 * which brand the measurement belongs to, because `--ochre` is declared only in
 * `charcoal.css`.
 */

const STORY = "inputs-focalpointpicker--default";
const WIDTHS_STORY = "inputs-focalpointpicker--frame-widths";
const RATIOS_STORY = "inputs-focalpointpicker--aspect-ratios";
const CSS_KNOB_STORY = "inputs-focalpointpicker--ratio-from-css";

const FRAME = ".ds-atom-focalpoint-frame";
const IMAGE = ".ds-atom-focalpoint-image";
const MARKER = ".ds-atom-focalpoint-marker";
const DOT = ".ds-atom-focalpoint-dot";
const READOUT = '[role="status"]';

/** Console + page errors for a whole test, collected from the first navigation. */
function watchErrors(page: Page) {
	const errors: string[] = [];
	page.on("console", (m) => {
		if (m.type() === "error" || m.type() === "warning")
			errors.push(`console.${m.type()}: ${m.text()}`);
	});
	page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
	return errors;
}

async function openStory(
	page: Page,
	story: string,
	opts: { brand?: "default" | "charcoal"; mode?: "light" | "dark" } = {},
) {
	const brand = opts.brand ?? "default";
	const mode = opts.mode ?? "light";
	await page.goto(
		`/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=theme:${mode};brand:${brand}`,
	);
	await page.waitForSelector(FRAME, { state: "visible", timeout: 15_000 });
	// Same non-vacuity guard probeComputed uses: assert the cell rather than trust
	// the query parameter, which is undocumented Storybook surface.
	const cell = await page.evaluate(() => ({
		brand: document.documentElement.getAttribute("data-brand"),
		dark: document.documentElement.classList.contains("dark"),
	}));
	expect(cell.brand, `story ${story} did not land in brand ${brand}`).toBe(
		brand === "charcoal" ? "charcoal" : null,
	);
	expect(cell.dark).toBe(mode === "dark");
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/**
 * `noUncheckedIndexedAccess` is on, and it is on for a reason: an indexed read
 * that is silently `undefined` turns the assertion after it into a comparison
 * between two nothings. This throws instead of asserting on air.
 */
function req<T>(v: T | undefined, what: string): T {
	if (v === undefined) throw new Error(`focalpoint.spec: ${what} is missing`);
	return v;
}

/** The value as the component itself renders it — the img's own object-position. */
async function objectPosition(page: Page, index = 0): Promise<string> {
	return page.evaluate(
		([sel, i]) => {
			const el = document.querySelectorAll(sel as string)[i as number];
			if (!el) throw new Error(`no ${sel} at index ${i}`);
			return getComputedStyle(el).objectPosition;
		},
		[IMAGE, index] as const,
	);
}

/** `object-position: 25% 75%` comes back in px from Chromium, so read the source. */
async function storedValue(page: Page, index = 0): Promise<string> {
	return page.evaluate(
		([sel, i]) => {
			const el = document.querySelectorAll(sel as string)[i as number] as HTMLElement;
			if (!el) throw new Error(`no ${sel} at index ${i}`);
			return el.style.objectPosition;
		},
		[IMAGE, index] as const,
	);
}

async function frameBox(page: Page, index = 0) {
	const box = await page.locator(FRAME).nth(index).boundingBox();
	if (!box) throw new Error(`frame ${index} has no box`);
	return box;
}

// ── legacy defect 1: mouse-only, so inert to touch AND to pen ────────────────

test.describe("pointer uniformity (legacy defect 1)", () => {
	test("a real TOUCH drag moves the value — the assertion jsdom cannot make", async ({
		browser,
	}) => {
		// hasTouch, so Chromium reports a real touch pointer rather than a mouse.
		const context = await browser.newContext({ hasTouch: true });
		const page = await context.newPage();
		const errors = watchErrors(page);
		await openStory(page, STORY);

		const box = await frameBox(page);
		const cdp = await context.newCDPSession(page);
		const at = (fx: number, fy: number) => [
			{ x: Math.round(box.x + box.width * fx), y: Math.round(box.y + box.height * fy) },
		];

		expect(await storedValue(page)).toBe("50% 25%");

		// Record the pointerType Chromium actually delivers, in the capture phase so
		// it is seen regardless of what the component does with the event. Without
		// this the test would pass on a mouse drag dressed up as a touch one, which
		// is precisely the defect it exists to catch.
		await page.evaluate(() => {
			const w = window as unknown as { __kinds: string[] };
			w.__kinds = [];
			document.addEventListener(
				"pointerdown",
				(e) => w.__kinds.push((e as PointerEvent).pointerType),
				true,
			);
		});

		await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(0.5, 0.25) });
		await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: at(0.25, 0.75) });
		await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

		const kinds = await page.evaluate(() => (window as unknown as { __kinds: string[] }).__kinds);
		expect(kinds, "no pointerdown was delivered at all").not.toEqual([]);
		expect(kinds).toEqual(["touch"]);

		const stored = await storedValue(page);
		expect(stored, `touch drag left the value at ${stored}`).toBe("25% 75%");
		expect(await page.locator(READOUT).innerText()).toBe(
			"Focal point 25% from the left, 75% from the top.",
		);
		expect(errors, errors.join("\n")).toEqual([]);
		await context.close();
	});

	test("a real PEN drag moves the value through the same code path", async ({ page }) => {
		const errors = watchErrors(page);
		await openStory(page, STORY);
		const box = await frameBox(page);
		const cdp = await page.context().newCDPSession(page);
		const send = (
			type: "mousePressed" | "mouseReleased" | "mouseMoved",
			fx: number,
			fy: number,
			buttons: number,
		) =>
			cdp.send("Input.dispatchMouseEvent", {
				type,
				x: Math.round(box.x + box.width * fx),
				y: Math.round(box.y + box.height * fy),
				button: "left",
				buttons,
				pointerType: "pen",
				force: 0.5,
			});

		await send("mousePressed", 0.5, 0.25, 1);
		await send("mouseMoved", 0.75, 0.5, 1);
		await send("mouseReleased", 0.75, 0.5, 0);

		expect(await storedValue(page)).toBe("75% 50%");
		expect(errors, errors.join("\n")).toEqual([]);
	});

	test("a MOUSE drag moves the value, and the preview follows while dragging", async ({ page }) => {
		const errors = watchErrors(page);
		await openStory(page, STORY);
		const box = await frameBox(page);

		await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.25);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.9, { steps: 6 });
		// STILL HELD. This is the "live while dragging" half of the claim, and the
		// reason it is asserted before the release: a component that only committed
		// on pointerup would pass every post-release assertion in this file.
		const midDrag = await storedValue(page);
		expect(midDrag, "the preview did not follow mid-drag").toBe("10% 90%");
		// And the readout has NOT spoken yet — the announcement is throttled to one
		// per drag, because pointermove fires far faster than a reader can speak.
		expect(await page.locator(READOUT).innerText()).toBe("");

		await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75, { steps: 4 });
		await page.mouse.up();
		expect(await storedValue(page)).toBe("25% 75%");
		expect(await page.locator(READOUT).innerText()).toBe(
			"Focal point 25% from the left, 75% from the top.",
		);
		expect(errors, errors.join("\n")).toEqual([]);
	});

	test("the value reaches the rendered image's object-position, resolved and effective", async ({
		page,
	}) => {
		// The key_link the plan names. Its declared pattern
		// (/objectPosition|object-position/) is satisfied by a comment, by the prop
		// name and by a docstring, so it is re-made here as a resolved computed value.
		await openStory(page, STORY);
		const box = await frameBox(page);
		await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75);
		await page.mouse.down();
		await page.mouse.up();

		// MEASURED, against a first guess that was wrong: Chromium keeps
		// object-position as a PERCENTAGE pair in the computed value rather than
		// resolving it to two lengths the way it does for background-position. The
		// first version of this assertion compared 25 against `img.width * 0.25`
		// and failed with "Expected 104.5, Received 25".
		expect(await objectPosition(page)).toBe("25% 75%");

		// The declaration existing and resolving is still not the same as it having
		// an EFFECT: object-position is ignored entirely when object-fit is `fill`,
		// which is the initial value. Without this, a component that dropped
		// `object-fit: cover` would pass every other assertion in this file while
		// the crop did nothing at all.
		const fit = await page.locator(IMAGE).evaluate((el) => getComputedStyle(el).objectFit);
		expect(fit, "object-position is inert when object-fit is fill").toBe("cover");
	});
});

// ── legacy defect 2: keyboard-unreachable ───────────────────────────────────

test.describe("operable by keyboard alone (legacy defect 2)", () => {
	test("Tab reaches it and the measured prototype sequence reproduces exactly", async ({
		page,
	}) => {
		const errors = watchErrors(page);
		await openStory(page, STORY);

		// No mouse is used anywhere in this test. That is the claim.
		await page.locator("body").press("Tab");
		const focused = await page.evaluate(() => {
			const el = document.activeElement;
			return { cls: el?.className ?? "", role: el?.getAttribute("role") ?? "" };
		});
		expect(focused.cls).toContain("ds-atom-focalpoint-frame");
		expect(focused.role).toBe("application");

		expect(await storedValue(page)).toBe("50% 25%");

		// ↑↑→  →  51% 23%   (a fine step is 1% per press, per axis)
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("ArrowRight");
		expect(await storedValue(page)).toBe("51% 23%");
		expect(await page.locator(READOUT).innerText()).toBe(
			"Focal point 51% from the left, 23% from the top.",
		);

		// Shift+↓  →  51% 33%   (Shift is a coarse step of 10%)
		await page.keyboard.press("Shift+ArrowDown");
		expect(await storedValue(page)).toBe("51% 33%");
		expect(await page.locator(READOUT).innerText()).toBe(
			"Focal point 51% from the left, 33% from the top.",
		);

		// Home  →  50% 50%
		await page.keyboard.press("Home");
		expect(await storedValue(page)).toBe("50% 50%");
		expect(await page.locator(READOUT).innerText()).toBe(
			"Focal point 50% from the left, 50% from the top.",
		);

		// The preview followed the keyboard too, not only the pointer — read from
		// computed style, so this is the browser's own resolution of the value and
		// not a re-read of the attribute that was just written.
		expect(await objectPosition(page)).toBe("50% 50%");

		expect(errors, errors.join("\n")).toEqual([]);
	});

	test("the readout element exists before the first change, so the first one is announced", async ({
		page,
	}) => {
		// A live region inserted at the moment its content changes is frequently
		// never announced, because the assistive technology had nothing to observe.
		await openStory(page, STORY);
		const region = page.locator(READOUT);
		await expect(region).toHaveCount(1);
		expect(await region.innerText()).toBe("");
		expect(await region.getAttribute("aria-live")).toBe("polite");
		expect(await region.getAttribute("aria-atomic")).toBe("true");
	});

	test("arrow keys scroll the page when the control does NOT have focus", async ({ page }) => {
		// The other half of `preventDefault`. A component that bound the arrow keys
		// on `document` would pass every assertion above and steal a page scroll.
		await openStory(page, STORY);
		await page.setViewportSize({ width: 500, height: 300 });
		await page.evaluate(() => {
			document.body.style.height = "4000px";
			window.scrollTo(0, 0);
		});
		await page.locator("body").click({ position: { x: 2, y: 2 } });
		const before = await page.evaluate(() => window.scrollY);
		await page.keyboard.press("ArrowDown");
		await page.waitForFunction((y) => window.scrollY > (y as number), before, { timeout: 2000 });
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
		// And the value did not move.
		expect(await storedValue(page)).toBe("50% 25%");
	});
});

// ── legacy defect 3: uncleaned document listeners ───────────────────────────

/** Pointer listeners currently attached to `document`, straight out of the engine. */
async function documentPointerListeners(cdp: CDPSession): Promise<string[]> {
	const { result } = await cdp.send("Runtime.evaluate", { expression: "document" });
	if (!result.objectId) throw new Error("could not get a remote object for document");
	const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
		objectId: result.objectId,
	});
	return listeners
		.filter((l) => l.type.startsWith("pointer"))
		.map((l) => l.type)
		.sort();
}

test.describe("listener cleanup (legacy defect 3)", () => {
	test("document carries the drag listeners only for the duration of the drag", async ({
		page,
	}) => {
		// Read out of Chromium's own listener table rather than inferred from a side
		// effect. The legacy control removed these in its mouse-up handler only, so
		// the shape of the bug is exactly "still present after the gesture".
		const errors = watchErrors(page);
		await openStory(page, STORY);
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("DOM.enable");

		// MEASURED: `document` is NOT empty of pointer listeners at rest. Storybook's
		// own preview registers some, so the claim has to be about the DELTA this
		// component adds, not about an absolute count. An absolute assertion would
		// have failed here for a reason that has nothing to do with the component,
		// and "loosen it to greaterThan(0)" would have made it unfalsifiable.
		const baseline = await documentPointerListeners(cdp);
		const added = (now: string[]) => {
			const rest = [...baseline];
			return now.filter((t) => {
				const i = rest.indexOf(t);
				if (i === -1) return true;
				rest.splice(i, 1);
				return false;
			});
		};
		expect(added(baseline), "the delta helper is not self-consistent").toEqual([]);

		const box = await frameBox(page);
		await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6);
		expect(added(await documentPointerListeners(cdp)), "the drag registered no listeners").toEqual([
			"pointercancel",
			"pointermove",
			"pointerup",
		]);

		await page.mouse.up();
		expect(
			added(await documentPointerListeners(cdp)),
			"listeners survived the gesture — this is legacy defect 3",
		).toEqual([]);

		// Ten gestures must not accumulate anything either.
		for (let i = 0; i < 10; i++) {
			await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7);
			await page.mouse.up();
		}
		expect(
			added(await documentPointerListeners(cdp)),
			"ten gestures accumulated listeners",
		).toEqual([]);
		expect(errors, errors.join("\n")).toEqual([]);
	});
});

// ── the recorded model divergence: frame-size independence ───────────────────

test.describe("frame-size independence (the rejected legacy model)", () => {
	test("the same PROPORTIONAL release commits the same value on a 320px and a 640px frame", async ({
		page,
	}) => {
		await openStory(page, WIDTHS_STORY);
		const frames = page.locator(FRAME);
		await expect(frames).toHaveCount(2);

		const boxes = [await frameBox(page, 0), await frameBox(page, 1)];
		// Non-vacuity: if both frames were the same width this test would prove
		// nothing at all, which is the failure mode of an "at two widths" claim.
		expect(
			Math.round(req(boxes[1], "640px frame").width - req(boxes[0], "320px frame").width),
		).toBeGreaterThan(300);

		const values: string[] = [];
		for (const [i, box] of boxes.entries()) {
			await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75);
			await page.mouse.down();
			await page.mouse.up();
			values.push(await storedValue(page, i));
		}
		expect(req(values[0], "320px value")).toBe("25% 75%");
		expect(req(values[1], "640px value")).toBe("25% 75%");
		console.log(
			`frame-size independence: ${Math.round(req(boxes[0], "b0").width)}x${Math.round(req(boxes[0], "b0").height)} -> ${values[0]}, ${Math.round(req(boxes[1], "b1").width)}x${Math.round(req(boxes[1], "b1").height)} -> ${values[1]}`,
		);
	});

	test("an IDENTICAL PIXEL offset does NOT agree — the value is a position, not a delta", async ({
		page,
	}) => {
		// The mirror assertion. If these two ever match, the component has drifted
		// back to the legacy model: an accumulated pixel delta with a `/ 2` damping
		// factor means a fixed number of percentage points on any frame size.
		await openStory(page, WIDTHS_STORY);
		const boxes = [await frameBox(page, 0), await frameBox(page, 1)];
		const values: string[] = [];
		for (const [i, box] of boxes.entries()) {
			await page.mouse.move(box.x + 80, box.y + 40);
			await page.mouse.down();
			await page.mouse.up();
			values.push(await storedValue(page, i));
		}
		expect(req(values[0], "320px value")).not.toBe(req(values[1], "640px value"));
		console.log(
			`identical 80x40px offset: 320px frame -> ${values[0]}, 640px frame -> ${values[1]}`,
		);
	});
});

// ── geometry: the ratio, and the 44px floor ─────────────────────────────────

test.describe("frame geometry", () => {
	test("the default frame is 3:2, measured on its own box", async ({ page }) => {
		await openStory(page, STORY);
		const box = await frameBox(page);
		expect(box.width / box.height).toBeCloseTo(1.5, 2);
		console.log(
			`default frame: ${box.width} x ${box.height} = ${(box.width / box.height).toFixed(4)}`,
		);
	});

	test("an aspectRatio prop and the CSS knob both reach the box", async ({ page }) => {
		await openStory(page, RATIOS_STORY);
		const boxes = [await frameBox(page, 0), await frameBox(page, 1), await frameBox(page, 2)];
		const [r32, r11, r34] = boxes.map(
			(b) => req(b, "ratio frame").width / req(b, "ratio frame").height,
		);
		expect(req(r32, "3:2 ratio")).toBeCloseTo(1.5, 2);
		expect(req(r11, "1:1 ratio")).toBeCloseTo(1, 2);
		expect(req(r34, "3:4 ratio")).toBeCloseTo(0.75, 2);

		// E2. NEITHER picker in this story passes `aspectRatio`; the second is inside
		// a scope that re-declares --ds-focalpoint-ratio. If the component wrote the
		// property inline, the override would be unreachable and both would be 3:2.
		await openStory(page, CSS_KNOB_STORY);
		const knob = [await frameBox(page, 0), await frameBox(page, 1)];
		const kDefault = req(knob[0], "unscoped frame");
		const kOverridden = req(knob[1], "scoped frame");
		expect(kDefault.width / kDefault.height).toBeCloseTo(1.5, 2);
		expect(kOverridden.width / kOverridden.height).toBeCloseTo(1, 2);
		const inlineStyles = await page
			.locator(FRAME)
			.evaluateAll((els) => els.map((e) => e.getAttribute("style")));
		expect(inlineStyles, "a frame carried an inline style despite no aspectRatio prop").toEqual([
			null,
			null,
		]);
		console.log(
			`CSS knob: ${(kDefault.width / kDefault.height).toFixed(3)} default, ${(kOverridden.width / kOverridden.height).toFixed(3)} overridden, both with no inline style`,
		);
	});

	test("the marker's hit target clears the 44px coarse-pointer floor", async ({ page }) => {
		await openStory(page, STORY);
		const marker = await page.locator(MARKER).boundingBox();
		if (!marker) throw new Error("no marker box");
		expect(marker.width).toBeGreaterThanOrEqual(44);
		expect(marker.height).toBeGreaterThanOrEqual(44);

		// A 44px box with pointer-events: none measures 44px and catches nothing.
		const hits = await page.evaluate(
			([sel]) => {
				const el = document.querySelector(sel as string) as HTMLElement;
				const r = el.getBoundingClientRect();
				const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
				return { pe: getComputedStyle(el).pointerEvents, hit: el.contains(top) };
			},
			[MARKER] as const,
		);
		expect(hits.pe).not.toBe("none");
		expect(hits.hit, "the marker's own centre does not hit-test to the marker").toBe(true);

		// And it is centred on the point the percentages place.
		// Within a pixel, not to a pixel: the frame's own box is fractional (280 /
		// 4 = 70 lands the 25% row on a half pixel), and toBeCloseTo(…, 0) means
		// strictly < 0.5, which a legitimate 0.5 subpixel offset fails.
		const frame = await frameBox(page);
		expect(
			Math.abs(marker.x + marker.width / 2 - (frame.x + frame.width * 0.5)),
		).toBeLessThanOrEqual(1);
		expect(
			Math.abs(marker.y + marker.height / 2 - (frame.y + frame.height * 0.25)),
		).toBeLessThanOrEqual(1);
		console.log(`marker hit target: ${marker.width} x ${marker.height}`);
	});
});

// ── the a11y sweep's blind spot, measured rather than assumed ───────────────

test("every part of the component is inside #storybook-root, so test:a11y sees it", async ({
	page,
}) => {
	// `.storybook/test-runner.ts` runs `checkA11y(page, "#storybook-root")`. The
	// portal target used elsewhere in this library is `document.body`, which is
	// OUTSIDE that scope — so anything a component portals is invisible to the
	// whole a11y suite and a missing accessible name there would never be reported.
	//
	// Read out of the live DOM rather than inferred from the absence of a
	// createPortal import: a portal can arrive through a composed child.
	await openStory(page, STORY);
	const outside = await page.evaluate(() => {
		const root = document.querySelector("#storybook-root");
		if (!root) throw new Error("no #storybook-root");
		const all = [...document.querySelectorAll('[class*="ds-atom-focalpoint"], [role="status"]')];
		// Non-vacuity: if the query found nothing, the filter below is trivially [].
		if (all.length === 0) throw new Error("found no component nodes at all");
		return {
			found: all.length,
			escaped: all.filter((el) => !root.contains(el)).map((el) => el.className || el.tagName),
		};
	});
	expect(outside.found).toBeGreaterThanOrEqual(5);
	expect(outside.escaped, "part of the component renders outside the a11y scan's scope").toEqual(
		[],
	);
});

// ── the brand assertion, on the probed element (E29) ────────────────────────

test.describe("brand", () => {
	for (const mode of ["light", "dark"] as const) {
		test(`the marker fill is amber in the default brand and ochre in charcoal (${mode})`, async ({
			page,
		}) => {
			const def = await probeComputed(page, {
				story: STORY,
				brand: "default",
				mode,
				selector: DOT,
				props: ["background-color", "--ochre", "--amber"],
			});
			// The brand assertion ON THE PROBED ELEMENT. `--ochre` is declared only in
			// charcoal.css, so an empty value here is proof this read belongs to the
			// default brand rather than to a scoped wrapper (E29).
			expect(def["--ochre"]).toBe("");
			expect(def["background-color"]).toBe(hexToRgb("#f59e0b"));

			const cha = await probeComputed(page, {
				story: STORY,
				brand: "charcoal",
				mode,
				selector: DOT,
				props: ["background-color", "--ochre", "--amber"],
			});
			const charcoalAccent = mode === "dark" ? "#f2f2f4" : "#111114";
			expect(cha["--ochre"]).toBe(charcoalAccent);
			expect(cha["background-color"]).toBe(hexToRgb(charcoalAccent));
		});
	}
});
