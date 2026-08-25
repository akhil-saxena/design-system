import { expect, test } from "@playwright/test";

/**
 * G-3 / F-14-1 — the seven measured input paths, driven with real ⌘ combinations
 * in Chromium.
 *
 * ## Why this exists alongside the vitest suite, and what it can and cannot press
 *
 * `src/interaction/RichText/RichText.test.tsx` asserts the same table in jsdom and
 * runs in `npm test`, which is where a regression should be caught. This spec adds
 * the two things jsdom cannot give: a real Chromium keymap, and Chromium's
 * **native contenteditable** formatting commands.
 *
 * Two platform facts had to be measured before any of it could be trusted, and
 * both are the shape of a check that passes for the wrong reason:
 *
 * 1. **`navigator.platform` is `"Win32"` in this harness.** `playwright.config.ts`
 *    uses `devices["Desktop Chrome"]`, which ships a Windows UA. prosemirror-keymap
 *    decides whether `Mod-` means Meta or Ctrl by reading that property, so every
 *    `Mod-x` binding in this browser resolves to **`Ctrl-x`** — the same thing
 *    jsdom does, and for the same reason. Measured: `Ctrl+Shift+h` produces
 *    `<mark>`; `Meta+Shift+h` and `Meta+Alt+Digit2` produce nothing at all.
 *
 *    So the keymap-only combos below are pressed with Control, and the plan's
 *    claim that all seven rows "came from a real keypress in Chromium" is
 *    corrected rather than repeated: two of them cannot be produced with ⌘ in this
 *    harness. On a real macOS Chrome, where `navigator.platform` is `MacIntel`,
 *    the same bindings answer to ⌘. The mark is reachable either way, which is
 *    what the finding was about.
 *
 * 2. **⌘B, ⌘I and ⌘U work anyway, and not through the keymap.** Chromium
 *    implements bold/italic/underline natively on a `contenteditable`, and
 *    ProseMirror picks the resulting DOM mutation back up. Measured on the
 *    unrestricted story: `Meta+b` -> `<strong>`, `Meta+i` -> `<em>`, `Meta+u` ->
 *    `<u>`, with `Mod-` bound to Ctrl throughout.
 *
 *    That makes this spec worth more than a keymap re-run. It exercises a second,
 *    independent input path that nobody named in the finding — and the restriction
 *    holds against it too, because a mark absent from the schema cannot survive
 *    ProseMirror's parse of the browser's own edit. Measured on the bold-only
 *    story: `Meta+i` and `Meta+u` change nothing, while `Meta+b` still bolds.
 *
 * ## Not a snapshot test
 *
 * Nothing here calls `toHaveScreenshot`, so this adds no baseline to
 * `storybook.spec.ts-snapshots/` and does not move the capture list 01-20
 * inherits. It reads the editor's own serialised HTML, which is the artefact the
 * finding was stated in.
 */

const STORY = {
	/** allow={["bold"]}, toolbar suppressed, markdown output. */
	boldOnly: "interaction-richtext--bold-only-no-toolbar",
	/** Every mark reachable, toolbar suppressed — the pre-plan configuration. */
	unrestricted: "interaction-richtext--no-toolbar",
};

/** Open a story in isolation and wait for TipTap to mount. */
async function openEditor(page: import("@playwright/test").Page, id: string) {
	await page.goto(`/iframe.html?id=${id}&viewMode=story`);
	const surface = page.locator(".ProseMirror");
	await expect(surface).toBeVisible({ timeout: 30_000 });
	return surface;
}

/**
 * Read the editor's serialised HTML from the live TipTap instance.
 *
 * TipTap 3 hangs an `editor` handle on the ProseMirror DOM node. Reading
 * `getHTML()` rather than `innerHTML` matters: `innerHTML` carries ProseMirror's
 * own decoration attributes and trailing-break placeholders, so an assertion on
 * it would be noisier and — worse — could match a `<br>` or a class name and
 * report a mark that is not in the document.
 */
async function editorHtml(page: import("@playwright/test").Page): Promise<string> {
	return page.evaluate(() => {
		const node = document.querySelector(".ProseMirror") as unknown as {
			editor?: { getHTML(): string };
		} | null;
		if (!node?.editor) throw new Error("no TipTap editor handle on .ProseMirror");
		return node.editor.getHTML();
	});
}

/**
 * Select the whole document, and **wait until the selection actually exists**
 * before returning.
 *
 * The poll is not defensive padding. Without it this spec flaked, and the flake
 * matters more in the negative direction than the positive: a mark command
 * dispatched onto an empty selection sets a *stored mark* rather than wrapping
 * text, so `getHTML()` is unchanged. In the unrestricted block that reads as a
 * false FAILURE (measured: `Control+Shift+h` produced no `<mark>` on 1 run in 3).
 * In the bold-only block, where every assertion has the form
 * `expect(html).toBe(before)`, the identical race reads as a false PASS — the
 * keystroke never had a range, nothing changed, and the test reports "the mark is
 * unreachable" when all it observed was its own timing.
 *
 * So the selection is asserted, not assumed, and `from !== to` is the assertion.
 */
async function selectAll(page: import("@playwright/test").Page) {
	const selectionWidth = () =>
		page.evaluate(() => {
			const node = document.querySelector(".ProseMirror") as unknown as {
				editor?: { state: { selection: { from: number; to: number } } };
			} | null;
			const sel = node?.editor?.state.selection;
			return sel ? sel.to - sel.from : 0;
		});

	// The click-and-press is retried, not just polled: when it loses the race the
	// keystroke went somewhere other than the editor, and no amount of waiting
	// makes a keystroke that was never delivered arrive. Measured cause — the
	// editor is not yet focused when the click resolves, so Meta+A reaches the
	// document instead. Five attempts, then fail loudly.
	for (let attempt = 0; attempt < 5; attempt += 1) {
		await page.locator(".ProseMirror").click();
		await page.keyboard.press("Meta+a");
		if ((await selectionWidth()) > 0) return;
		await page.waitForTimeout(150);
	}
	expect(await selectionWidth(), "the editor never acquired a non-empty selection").toBeGreaterThan(
		0,
	);
}

/**
 * Extends the selection from the start of the document until it covers exactly
 * `word`, CHECKING THE SELECTION AFTER EVERY SINGLE KEYSTROKE.
 *
 * The same lesson `selectAll` above records, in the one place that had not
 * learned it. G-4 used to press Shift+ArrowRight seven times in a row and then
 * assume seven characters were selected. Measured under a loaded machine — every
 * 0ms macrotask deferred, which is what six Playwright workers and a Vite dev
 * server do to each other on twelve cores — one of the seven is dropped, and the
 * failure reads:
 *
 *   Expected substring: "**Reduced**"
 *   Received string:    "**Reduce**d **p95 latency** by 40% across three services"
 *
 * Six characters, not seven. That is not a broken serializer, which is what the
 * assertion appears to be about; it is a lost keystroke, and no amount of
 * waiting afterwards recovers it — a key that was never delivered never arrives.
 *
 * So the press is retried against the selection rather than counted. Reading
 * `window.getSelection()` and not `editor.state.selection` is deliberate:
 * ProseMirror's mirror of the selection lags the DOM by design (measured: 13 of
 * 25 loads still reported the pre-keystroke position while the DOM selection was
 * already correct), so polling the mirror would wait on the wrong clock. The DOM
 * selection is also the thing Chromium's native ⌘B actually acts on, which is
 * the input path this case exercises.
 */
async function selectLeadingWord(page: import("@playwright/test").Page, word: string) {
	const domSelection = () => page.evaluate(() => window.getSelection()?.toString() ?? "");
	// The click-and-Home is retried as a unit for `selectAll`'s reason: if the
	// editor was not focused when the click resolved, Home went to the document
	// and every extension after it starts from the wrong place.
	for (let attempt = 0; attempt < 5; attempt += 1) {
		await page.locator(".ProseMirror").click();
		await page.keyboard.press("Home");
		// One press, one check. A dropped press leaves the selection unchanged and
		// is simply pressed again; there is no budget to exhaust.
		for (let i = 0; i < word.length * 3; i += 1) {
			const current = await domSelection();
			if (current === word) return;
			// Longer than the target, or diverging from it, means the anchor is
			// wrong — more presses cannot fix that, so start over.
			if (current.length >= word.length || !word.startsWith(current)) break;
			await page.keyboard.press("Shift+ArrowRight");
		}
	}
	expect(await domSelection(), `the editor selection never reached ${JSON.stringify(word)}`).toBe(
		word,
	);
}

/**
 * The keymap-only combinations, pressed with Control.
 *
 * Not a convenience: `Mod-` is bound to Ctrl in this browser because
 * `devices["Desktop Chrome"]` reports `navigator.platform === "Win32"`. Pressing
 * ⌘ for these reaches no binding, so an assertion of the form "nothing happened"
 * would be green against any implementation whatsoever.
 */
const KEYMAP = {
	highlight: "Control+Shift+h",
	heading2: "Control+Alt+Digit2",
} as const;

/**
 * The combinations Chromium handles natively on a contenteditable, pressed with
 * the ⌘ a macOS operator actually uses.
 */
const NATIVE = { bold: "Meta+b", italic: "Meta+i", underline: "Meta+u" } as const;

test.describe("G-3: the unrestricted editor — every path is reachable", () => {
	test("⌘B applies bold, through Chromium's native contenteditable path", async ({ page }) => {
		await openEditor(page, STORY.unrestricted);
		await selectAll(page);
		await page.keyboard.press(NATIVE.bold);
		expect(await editorHtml(page)).toContain("<strong>");
	});

	test("⌘I and ⌘U apply italic and underline, natively", async ({ page }) => {
		await openEditor(page, STORY.unrestricted);
		await selectAll(page);
		await page.keyboard.press(NATIVE.italic);
		expect(await editorHtml(page), "⌘I").toContain("<em>");
		await page.keyboard.press(NATIVE.underline);
		expect(await editorHtml(page), "⌘U").toContain("<u>");
	});

	test("Mod+⇧H applies highlight and Mod+⌥2 makes a heading, through the keymap", async ({
		page,
	}) => {
		await openEditor(page, STORY.unrestricted);
		await selectAll(page);
		await page.keyboard.press(KEYMAP.highlight);
		expect(await editorHtml(page), KEYMAP.highlight).toContain("<mark>");
		await selectAll(page);
		await page.keyboard.press(KEYMAP.heading2);
		expect(await editorHtml(page), KEYMAP.heading2).toContain("<h2>");
	});

	test("⌘K creates no link — it was never a keyboard binding", async ({ page }) => {
		// The one correction to G-3's original wording. The component advertised ⌘K
		// in its own hint strip, which is where the report came from, but no
		// extension binds it and Chromium has no native handler for it either, so
		// the document is untouched.
		await openEditor(page, STORY.unrestricted);
		await selectAll(page);
		const before = await editorHtml(page);
		await page.keyboard.press("Meta+k");
		expect(await editorHtml(page), "⌘K").toBe(before);
		expect(await editorHtml(page), "⌘K makes no link").not.toContain("<a ");
	});

	test("Ctrl+K is macOS kill-line, and still not a link", async ({ page }) => {
		// Recorded because it surprised this spec's first draft, which asserted "no
		// change" for both modifiers and went red. Ctrl+K is the system
		// kill-to-end-of-line binding on macOS: it emptied the paragraph. So the
		// two modifiers are NOT interchangeable for a negative assertion — one is
		// inert and the other is destructive — and only the ⌘ result speaks to the
		// link claim. The claim itself survives either way: no anchor appears.
		await openEditor(page, STORY.unrestricted);
		await page.locator(".ProseMirror").click();
		await page.keyboard.press("Meta+ArrowLeft");
		await page.keyboard.press("Control+k");
		const after = await editorHtml(page);
		expect(after, "Ctrl+K deleted to end of line").toBe("<p></p>");
		expect(after).not.toContain("<a ");
	});

	test("typing a bare URL autolinks it — reachable with no keystroke at all", async ({ page }) => {
		await openEditor(page, STORY.unrestricted);
		await selectAll(page);
		await page.keyboard.press("Delete");
		await page.keyboard.type("example.com ");
		expect(await editorHtml(page)).toContain("<a ");
	});
});

test.describe("G-3: allow={['bold']} — only bold is reachable", () => {
	test("bold still works through BOTH input paths", async ({ page }) => {
		// The inverse control, doubled. Without it every assertion below would also
		// pass on an editor that had stopped responding to the keyboard entirely.
		for (const combo of [NATIVE.bold, "Control+b"]) {
			await openEditor(page, STORY.boldOnly);
			await selectAll(page);
			await page.keyboard.press(combo);
			expect(await editorHtml(page), combo).toContain("<strong>");
		}
	});

	test("⌘I and ⌘U produce nothing — the NATIVE path is restricted too", async ({ page }) => {
		// The path nobody named in the finding: Chromium's own contenteditable
		// italic/underline. A mark absent from the schema cannot survive
		// ProseMirror's parse of the browser's own edit, so the restriction holds
		// here as well — and this is the path a macOS ⌘I actually takes.
		await openEditor(page, STORY.boldOnly);
		await selectAll(page);
		const before = await editorHtml(page);
		for (const combo of [NATIVE.italic, NATIVE.underline]) {
			await page.keyboard.press(combo);
			expect(await editorHtml(page), combo).toBe(before);
		}
		expect(before).not.toContain("<em>");
		expect(before).not.toContain("<u>");
	});

	test("the keymap combinations produce nothing either", async ({ page }) => {
		await openEditor(page, STORY.boldOnly);
		await selectAll(page);
		const before = await editorHtml(page);
		for (const combo of ["Control+i", "Control+u", KEYMAP.highlight, KEYMAP.heading2]) {
			await page.keyboard.press(combo);
			expect(await editorHtml(page), combo).toBe(before);
		}
	});

	test("typing a bare URL produces no anchor", async ({ page }) => {
		await openEditor(page, STORY.boldOnly);
		await selectAll(page);
		await page.keyboard.press("Delete");
		await page.keyboard.type("example.com ");
		const html = await editorHtml(page);
		expect(html).not.toContain("<a ");
		// The characters are there: the mark is unreachable, not the typing.
		expect(html).toContain("example.com");
	});
});

test.describe("F-14-1: toolbar={null}", () => {
	test("renders no toolbar and no buttons, on both stories", async ({ page }) => {
		for (const id of [STORY.unrestricted, STORY.boldOnly]) {
			await openEditor(page, id);
			await expect(page.locator('[role="toolbar"]'), id).toHaveCount(0);
			await expect(page.locator("#storybook-root button"), id).toHaveCount(0);
		}
	});

	test("the bold-only story WITH a toolbar shows exactly one button", async ({ page }) => {
		// Non-inert companion to the assertion above: the suppression case could
		// otherwise pass on a component that never renders a toolbar at all.
		await openEditor(page, "interaction-richtext--bold-only");
		await expect(page.locator('[role="toolbar"] button')).toHaveCount(1);
		await expect(page.locator('[role="toolbar"] button[aria-label="Bold"]')).toHaveCount(1);
	});

	test("the default story still shows twelve", async ({ page }) => {
		await openEditor(page, "interaction-richtext--default");
		await expect(page.locator('[role="toolbar"] button')).toHaveCount(12);
	});
});

test.describe("G-4: the stored shape, in a browser", () => {
	test("bolding a phrase emits bold-only markdown, not HTML", async ({ page }) => {
		await openEditor(page, "interaction-richtext--bold-only");
		// Scoped to the story root on purpose: Storybook's iframe.html ships a
		// hidden `<pre class="sb-errordisplay_code">` in its static markup, and an
		// unscoped `locator("pre").first()` matches THAT — measured, and it read as
		// an empty string, which is a false failure today and would be a false pass
		// on any assertion phrased as "does not contain".
		const stored = page.locator("#storybook-root pre").first();
		await expect(stored).toContainText("Reduced **p95 latency** by 40%");
		// Bold the first word too and watch the stored string gain a second run.
		await selectLeadingWord(page, "Reduced");
		await page.keyboard.press("Meta+b");
		await expect(stored).toContainText("**Reduced**");
		// And no markup string anywhere in the stored value — the whole point.
		expect(await stored.textContent()).not.toContain("<");
	});

	test("an unrepresentable mark is reported by name", async ({ page }) => {
		await openEditor(page, "interaction-richtext--serialize-loss-reported");
		await expect(page.getByText("Nothing dropped yet.")).toBeVisible();
		await selectAll(page);
		await page.keyboard.press(NATIVE.italic);
		await expect(
			page.getByText("Marks the shape cannot carry: italic", { exact: false }),
		).toBeVisible();
	});
});
