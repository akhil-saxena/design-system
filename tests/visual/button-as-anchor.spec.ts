import { type Page, expect, test } from "@playwright/test";

/**
 * D-5 / D-6 — `Button as="a"` must be a link that LOOKS like a button, and a
 * disabled one must actually be inert.
 *
 * ## Why this is a browser spec and not a unit test
 *
 * The DOM half — which attributes Button emits — is proved in
 * src/inputs/Button/Button.test.tsx, and jsdom can see all of it. What jsdom
 * cannot see is the half that decides whether the feature is safe:
 *
 *   - `.ds-atom-btn:disabled` DOES NOT MATCH AN ANCHOR. jsdom implements no
 *     selector matching against a stylesheet at all, so a suite that only ran
 *     there would stay green with a disabled anchor painting at full opacity
 *     and accepting clicks. This is the same shape as the `pan-y` finding in
 *     beta.2, where 3 browser cases failed while all 52 unit tests passed.
 *   - `pointer-events: none` is a paint-and-hit-test property. jsdom dispatches
 *     synthetic events straight at the node and never consults it, so
 *     `fireEvent.click` on a "disabled" anchor succeeds there even when a real
 *     browser would route the click to whatever is underneath.
 *   - Focusability follows from the ABSENCE of href, which is a browser rule
 *     about what counts as a link, not a React one.
 *
 * ## The negative control
 *
 * `the assertions are not vacuous` re-arms the rendered anchor in the page —
 * puts the href back and drops aria-disabled — and asserts the opposite outcome
 * on the same element. Without it, every case here would also pass against an
 * implementation that simply rendered nothing.
 */

const STORY =
	"/iframe.html?id=inputs-button--as-anchor&viewMode=story&globals=theme:light;brand:default";

async function open(page: Page) {
	await page.goto(STORY);
	await page.waitForSelector("a.ds-atom-btn", { timeout: 30_000 });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({
		content: "*,*::before,*::after{animation:none !important;transition:none !important}",
	});
}

/** The three controls in the story, in order: enabled primary, enabled secondary, disabled. */
const ENABLED = 'a.ds-atom-btn:not([aria-disabled="true"])';
const DISABLED = 'a.ds-atom-btn[aria-disabled="true"]';

test.describe("a Button that navigates", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("renders as an anchor and is a link to the accessibility tree", async ({ page }) => {
		await open(page);
		expect(await page.getByRole("link", { name: "See the work" }).count()).toBe(1);
		// It must NOT also be announced as a button: the whole point is that the
		// semantics follow the behaviour rather than the paint.
		expect(await page.getByRole("button", { name: "See the work" }).count()).toBe(0);
	});

	test("paints the button's fill, which is the entire reason the prop exists", async ({ page }) => {
		await open(page);
		const m = await page.evaluate((sel) => {
			const el = document.querySelector(sel) as HTMLElement;
			const cs = getComputedStyle(el);
			return {
				tag: el.tagName,
				background: cs.backgroundColor,
				borderRadius: cs.borderTopLeftRadius,
				textDecorationLine: cs.textDecorationLine,
				height: Math.round(el.getBoundingClientRect().height),
			};
		}, ENABLED);
		expect(m.tag).toBe("A");
		// --amber, the primary fill. A text link would be transparent here, which is
		// what the consumer was forced to ship.
		expect(m.background, `the anchor is not painting the primary fill: ${JSON.stringify(m)}`).toBe(
			"rgb(245, 158, 11)",
		);
		expect(m.borderRadius).not.toBe("0px");
		// .ds-atom-btn does not reset text-decoration; an <a> brings its own
		// underline from the UA sheet. If this ever reads "underline" the control
		// looks like a link again, which is the defect wearing a different hat.
		expect(m.textDecorationLine, "the button-shaped anchor is underlined").toBe("none");
	});

	test("emits no type attribute, where it would claim a MIME type", async ({ page }) => {
		await open(page);
		expect(await page.locator(ENABLED).first().getAttribute("type")).toBeNull();
	});
});

test.describe("a disabled Button that would navigate", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("looks disabled, because the stylesheet matches aria-disabled too", async ({ page }) => {
		await open(page);
		const m = await page.evaluate((sel) => {
			const el = document.querySelector(sel) as HTMLElement;
			const cs = getComputedStyle(el);
			return { opacity: cs.opacity, pointerEvents: cs.pointerEvents, cursor: cs.cursor };
		}, DISABLED);
		// Two of the three declarations on
		// .ds-atom-btn:is(:disabled, [aria-disabled="true"]). Before the :is(), an
		// anchor matched none of them and painted fully opaque.
		expect(m.opacity, "the disabled anchor is not dimmed").toBe("0.4");
		expect(m.pointerEvents, "the disabled anchor still accepts pointer events").toBe("none");
		// `cursor` is deliberately NOT asserted, and the reason is recorded rather
		// than the assertion quietly dropped: Button inlines `cursor: pointer` in
		// baseStyle, so the stylesheet's `cursor: not-allowed` has never applied to
		// ANY disabled Button, native or not. It is inert rather than wrong —
		// `pointer-events: none` means this element is not hit-tested, so the cursor
		// over it comes from its parent and this value is never painted. Measured,
		// not assumed:
		expect(m.cursor, "the inline cursor is gone — the not-allowed rule may now be reachable").toBe(
			"pointer",
		);
	});

	test("has nowhere to go and cannot be reached by keyboard", async ({ page }) => {
		await open(page);
		const m = await page.evaluate((sel) => {
			const el = document.querySelector(sel) as HTMLAnchorElement;
			return { href: el.getAttribute("href"), tabIndex: el.tabIndex };
		}, DISABLED);
		expect(m.href, "a disabled link kept its href and can still be followed").toBeNull();
		expect(m.tabIndex).toBe(-1);

		// TAB TRAVERSAL, not `el.focus()`. tabIndex="-1" means "not in the tab
		// order", NOT "not focusable" — a programmatic .focus() succeeds on it, so
		// asserting against that would have failed for a control that is in fact
		// unreachable. The question the user actually asks with the keyboard is
		// whether Tab ever lands here.
		const reached: string[] = [];
		for (let i = 0; i < 8; i++) {
			await page.keyboard.press("Tab");
			reached.push(
				await page.evaluate(() => {
					const a = document.activeElement as HTMLElement | null;
					return a ? `${a.tagName}:${(a.textContent ?? "").trim().slice(0, 20)}` : "none";
				}),
			);
		}
		expect(
			reached.filter((r) => r.includes("Unavailable")),
			`Tab reached the disabled control: ${reached.join(" → ")}`,
		).toEqual([]);
		// The two enabled anchors MUST be reachable, or the loop above proves
		// nothing — a page where Tab reaches nothing would pass it trivially.
		expect(
			reached.some((r) => r.includes("See the work")),
			`Tab never reached the enabled controls either, so the assertion above is vacuous: ${reached.join(" → ")}`,
		).toBe(true);
	});

	test("does not navigate when clicked", async ({ page }) => {
		await open(page);
		const before = page.url();
		// force:true bypasses Playwright's own actionability guard, so this measures
		// the PAGE's behaviour rather than the test runner's caution.
		await page.locator(DISABLED).click({ force: true });
		await page.waitForTimeout(200);
		expect(page.url(), "the disabled link navigated").toBe(before);
	});

	/**
	 * The hover guard, and why the inline background has to be lifted to see it.
	 *
	 * Every `.ds-atom-btn[data-variant=…]:hover` rule in primitives.css is
	 * CURRENTLY INERT — Button sets `background` inline per variant, and an inline
	 * declaration outranks them all. The stylesheet says so itself, above the
	 * primary hover rule. So hovering a Button and reading its background measures
	 * nothing, and a test written that way passes against a guard that does not
	 * work.
	 *
	 * Clearing the element's own inline background is what makes the shipped rules
	 * reachable, and therefore what makes this case able to fail. It measures the
	 * rules as written; it does not inject a replacement for them.
	 */
	test("the hover guard excludes an aria-disabled anchor", async ({ page }) => {
		await open(page);
		const m = await page.evaluate(
			(sels: { enabled: string; disabled: string }) => {
				// Both controls are variant="secondary", so they answer to the same
				// hover rule and differ only in the guard.
				const enabled = document.querySelectorAll(sels.enabled)[1] as HTMLElement;
				const disabled = document.querySelector(sels.disabled) as HTMLElement;
				for (const el of [enabled, disabled]) {
					el.style.background = "";
					el.style.pointerEvents = "auto";
				}
				const rest = {
					enabled: getComputedStyle(enabled).backgroundColor,
					disabled: getComputedStyle(disabled).backgroundColor,
				};
				return {
					variant: [enabled.getAttribute("data-variant"), disabled.getAttribute("data-variant")],
					rest,
					matchesHover: {
						enabled: enabled.matches(
							'.ds-atom-btn[data-variant="secondary"]:hover:not(:disabled, [aria-disabled="true"])',
						),
						disabled: disabled.matches(
							'.ds-atom-btn[data-variant="secondary"]:hover:not(:disabled, [aria-disabled="true"])',
						),
					},
				};
			},
			{ enabled: ENABLED, disabled: DISABLED },
		);
		expect(
			m.variant,
			"the two controls are not the same variant, so they are not comparable",
		).toEqual(["secondary", "secondary"]);

		// Hover each in turn and read the fill the stylesheet applies.
		const hoverFill = async (sel: string, index: number) => {
			await page.locator(sel).nth(index).hover({ force: true });
			return page.evaluate(
				(arg: { sel: string; index: number }) =>
					getComputedStyle(document.querySelectorAll(arg.sel)[arg.index] as HTMLElement)
						.backgroundColor,
				{ sel, index },
			);
		};
		const enabledHovered = await hoverFill(ENABLED, 1);
		const disabledHovered = await hoverFill(DISABLED, 0);

		expect(
			enabledHovered,
			`the enabled secondary did not take the hover fill, so this case cannot detect the disabled one taking it either (at rest: ${m.rest.enabled})`,
		).not.toBe(m.rest.enabled);
		expect(
			disabledHovered,
			"the disabled anchor took the hover fill — `:not(:disabled)` alone is always true on an <a>",
		).toBe(m.rest.disabled);
	});

	/**
	 * THE DISCRIMINATOR. Everything above would also pass against an
	 * implementation that rendered no third control at all, or that rendered it as
	 * a native <button> — in which case `:disabled` would carry the paint and the
	 * `[aria-disabled="true"]` clause would be dead code that nothing detects.
	 *
	 * This re-arms the SAME element in the page and asserts the opposite. It
	 * proves the element under test really is an anchor whose inertness comes from
	 * the attributes the component chose, and that removing them removes it.
	 */
	test("the assertions are not vacuous", async ({ page }) => {
		await open(page);
		const m = await page.evaluate((sel) => {
			const el = document.querySelector(sel) as HTMLAnchorElement;
			if (el.tagName !== "A") throw new Error(`expected an anchor, got <${el.tagName}>`);
			if (el.matches(":disabled")) {
				throw new Error(
					"this anchor matches :disabled, so the [aria-disabled] clause is untested — the story is rendering a <button>",
				);
			}
			el.removeAttribute("aria-disabled");
			el.setAttribute("href", "#gone");
			el.tabIndex = 0;
			const cs = getComputedStyle(el);
			el.focus();
			return {
				opacity: cs.opacity,
				pointerEvents: cs.pointerEvents,
				focused: document.activeElement === el,
			};
		}, DISABLED);
		expect(
			m,
			"stripping aria-disabled changed nothing, so these assertions were never measuring it",
		).toEqual({ opacity: "1", pointerEvents: "auto", focused: true });
	});
});
