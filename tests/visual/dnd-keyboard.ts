import { type Page, expect } from "@playwright/test";

/**
 * Waits for dnd-kit's KeyboardSensor to be able to RECEIVE the next keystroke.
 *
 * ## The race, read out of dnd-kit's own source rather than inferred
 *
 * `@dnd-kit/core`'s KeyboardSensor constructor calls `attach()`:
 *
 *   attach() {
 *     this.handleStart();                       // -> onStart -> React commit
 *     this.windowListeners.add(Resize,  ...);
 *     this.windowListeners.add(VisibilityChange, ...);
 *     setTimeout(() => this.listeners.add(Keydown, this.handleKeyDown));
 *   }
 *
 * `handleStart()` runs FIRST and is what eventually paints `data-dragging="true"`
 * on the tile. The document-level keydown listener that every subsequent arrow
 * key depends on is added in a `setTimeout` — a macrotask that has not run yet.
 * So the tile LOOKS held before the sensor can hear anything, and an ArrowDown
 * sent in that window is delivered to nothing and silently lost.
 *
 * Measured, not deduced. Patching `Document.prototype.addEventListener` on the
 * single-list story and reading the record at three points:
 *
 *   immediately after Space          keydown listeners: ["bail"]        dragging=1
 *   after data-dragging="true"       keydown listeners: ["bail"]        dragging=1
 *   after one macrotask boundary     keydown listeners: ["bail",
 *                                      "bound handleKeyDown"]           dragging=1
 *
 * `bound handleKeyDown` — the sensor's — arrives 11.3ms after `bail`, and NOT
 * before `data-dragging` is observable. Every guard built on `data-dragging`
 * alone therefore returns too early by construction.
 *
 * ## Why this is not the sleep it replaces
 *
 * `sortable-keyboard-target.spec.ts` covered this with `waitForTimeout(100)` and
 * `sortable-announce.spec.ts` covered it with nothing at all, which is why the
 * latter is the one that failed two full-suite runs out of three. A fixed 100ms
 * is the same race with a longer fuse: it wins on an idle machine and loses when
 * six workers and a Vite dev server are competing for twelve cores.
 *
 * This waits for the ACTUAL precondition — the listener existing — by recording
 * every keydown listener added to the document and blocking until the sensor's
 * appears. There is no duration to tune and nothing to lose under load: a
 * machine that takes a second to get there simply waits a second.
 *
 * ## Its one dependency, stated plainly
 *
 * The sensor is recognised by function name: `bind()` gives it
 * `"bound handleKeyDown"`. Storybook's dev server serves dnd-kit's UNMINIFIED
 * development build, so the name survives; a minified build would not carry it.
 * That is a deliberate trade. If dnd-kit renames the method or ships minified
 * here, this throws with the full list of listeners it did see, naming the
 * mechanism — which is a loud failure a maintainer can act on, rather than a
 * quiet return to a flake nobody can reproduce.
 */

interface KeydownRecord {
	/** The listener function's name. dnd-kit's is `bound handleKeyDown`. */
	name: string;
	/** performance.now() at the moment it was added — kept because the gap
	 *  between `bail` and the sensor's handler IS the race window. */
	t: number;
}

declare global {
	interface Window {
		__dsDocKeydownListeners?: KeydownRecord[];
	}
}

/**
 * Installs the recorder. MUST be called before `page.goto` — it runs as an init
 * script so the patch is in place before any story module evaluates, which is
 * the only way to see a listener that is added during mount.
 */
export async function recordKeyboardSensorAttachment(page: Page): Promise<void> {
	await page.addInitScript(() => {
		const key = "__dsDocKeydownListeners";
		const w = window as unknown as Record<string, unknown>;
		if (w[key]) return;
		w[key] = [];
		const original = Document.prototype.addEventListener;
		// A pure wrapper: it records and delegates, and changes no argument. It
		// shadows EventTarget.prototype.addEventListener for documents only, so
		// element- and window-level listeners are untouched.
		Document.prototype.addEventListener = function patched(
			this: Document,
			type: string,
			listener: EventListenerOrEventListenerObject | null,
			options?: boolean | AddEventListenerOptions,
		) {
			if (type === "keydown") {
				(w[key] as { name: string; t: number }[]).push({
					name: typeof listener === "function" ? listener.name : "(object handler)",
					t: performance.now(),
				});
			}
			// `listener` is nullable in the DOM signature; `addEventListener(type,
			// null)` is a legal no-op, so it is forwarded rather than filtered.
			return original.call(this, type, listener as EventListenerOrEventListenerObject, options);
		} as typeof Document.prototype.addEventListener;
	});
}

/**
 * Presses Space to pick up the focused tile and does not return until the
 * KeyboardSensor can hear the NEXT key.
 *
 * This is the whole point of the module: every call site that presses Space and
 * then an arrow key must go through here, because every OTHER available signal
 * — `data-dragging="true"`, the live region's "Picked up ..." utterance — is
 * produced by `handleStart()` and therefore fires strictly BEFORE the listener
 * is attached. Pacing on one of those is what made `sortable-announce.spec.ts`
 * fail two full-suite runs in three while passing 95/95 in isolation.
 */
export async function pickUpWithSpace(page: Page): Promise<void> {
	const since = await keydownListenerCount(page);
	await page.keyboard.press("Space");
	await keyboardSensorAttached(page, since);
}

/** How many keydown listeners have been added to the document so far. Capture
 *  this immediately BEFORE the pick-up keystroke; the sensor's listener is the
 *  one that appears after it. */
export async function keydownListenerCount(page: Page): Promise<number> {
	return page.evaluate(() => (window.__dsDocKeydownListeners ?? []).length);
}

/**
 * Blocks until the KeyboardSensor created by the pick-up at `since` has attached
 * its document keydown listener. After this resolves, the next arrow key is
 * guaranteed to be delivered.
 */
export async function keyboardSensorAttached(page: Page, since: number): Promise<void> {
	await expect
		.poll(
			async () =>
				page.evaluate(
					(from) =>
						(window.__dsDocKeydownListeners ?? [])
							.slice(from)
							.map((r) => r.name)
							.join(","),
					since,
				),
			{
				timeout: 10_000,
				message:
					"dnd-kit's KeyboardSensor never attached its document keydown listener after the pick-up — " +
					"expected a handler named like `bound handleKeyDown` (see KeyboardSensor.attach()). " +
					"If dnd-kit was upgraded or is being served minified, this helper needs updating rather than removing.",
			},
		)
		.toContain("handleKeyDown");
}
