import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Page, expect, test } from "@playwright/test";

/**
 * F-6 — a recorded baseline must depict a state that PERSISTS.
 *
 * ## The defect this exists to catch
 *
 * `feedback-toast--tones` and `feedback-toast--dark-mode` fire four toasts into a
 * region capped at three. The fourth evicts the oldest, and the eviction
 * COMPLETES on a `setTimeout(SLIDE_OUT_MS)` inside `ToastProvider` — 200ms after
 * the toast is marked `data-dismissing="true"`. Both baselines, in both brands,
 * were recorded inside that 200ms window and held FOUR toasts — a fully drawn
 * fourth toast in a three-slot region, which is a state no user has ever seen,
 * since this suite kills the slide-out animation that would have been hiding it.
 *
 * That is a baseline that cannot catch a regression, because the thing it depicts
 * is not the thing that persists — and it fails permanently, not flakily, the
 * first time a loaded machine takes its first screenshot 200ms late.
 *
 * ## Why this gate compares the IMAGE against the DOM
 *
 * `storybook.spec.ts` now waits for `[data-dismissing="true"]` to disappear before
 * capturing, and that wait is what fixed the four images. Deleting that wait alone
 * is NOT silent — measured, 3 runs out of 3, the suite fails immediately, because
 * `toHaveScreenshot` does not retry until it matches. Its call log shows it takes
 * a screenshot, waits 100ms, takes a second, declares "captured a stable
 * screenshot" and compares ONCE. A 200ms transient outlives that 100ms stability
 * window, so the pair agrees and the comparison is made against the transient.
 * (That is also why the four-toast baselines were reproducible rather than flaky:
 * 200 > 100. Had SLIDE_OUT_MS been 50, the same defect would have presented as an
 * unreproducible flake instead.)
 *
 * What IS silent is the two-step that produced F-6 in the first place: capture
 * without the settle wait, see four mismatches, conclude "the baselines are
 * stale", and re-record. Measured end to end — the four-toast images come back,
 * `storybook.spec.ts` goes GREEN on them, and nothing else in the suite objects.
 * `--update-snapshots` invites exactly that move, and 01-22 already measured it
 * going wrong at scale.
 *
 * So the property worth standing guard over is not "the wait is present" — a grep
 * for a selector string would pass against a wait weakened to a sleep, and the
 * suite already fails loudly if the wait simply goes missing. It is the ARTIFACT:
 * whatever protocol produced it, the recorded image must depict the number of
 * toasts the settled DOM actually holds. This gate measures both and compares
 * them, which catches a bad re-record no matter what caused it. Verified against
 * that exact two-step: suite green, this gate red.
 *
 * ## Geometry is measured, never hardcoded
 *
 * The slot pitch, the stack origin and the sampling strip are all derived from a
 * live settled render of `--tones` in the same brand, in the same run. A padding
 * or gap change in `primitives.css` moves the measurement and the gate follows it
 * rather than going quietly wrong.
 *
 * ## Proved by planting its own target
 *
 * With the pre-fix four-toast PNGs restored into the snapshot directory, this gate
 * FAILS on all four stems with "recorded image holds 4 toasts, settled DOM holds
 * 3". With the settled images it PASSES. The four button-driven Toast stories,
 * which hold ZERO toasts at capture time, are included as negative controls: they
 * prove the gate is comparing against the DOM rather than asserting the number 3.
 */

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SNAPSHOT_DIR = path.join(REPO, "tests", "visual", "storybook.spec.ts-snapshots");

const BRANDS = [
	{ id: "default", suffix: "" },
	{ id: "monochrome", suffix: "--monochrome" },
] as const;

/**
 * Every Toast story. The four that hold zero toasts at capture time are NOT
 * padding — they are the negative controls. A gate that only checked the two
 * four-toast stories would pass just as well if it asserted the constant 3, and
 * would say nothing about a region that legitimately holds fewer.
 */
const TOAST_STORIES = [
	"feedback-toast--tones",
	"feedback-toast--dark-mode",
	"feedback-toast--default",
	"feedback-toast--stacking",
	"feedback-toast--auto-dismiss",
	"feedback-toast--persistent",
] as const;

/** Slots to probe: the cap is 3 and at most one node can be mid-eviction, so a
 *  correct image never occupies slot 4 — which makes slots 4 and 5 the empty
 *  reference pair. */
const SLOTS = 6;

interface StackGeometry {
	/** Left edge of a toast box, in image pixels. */
	x: number;
	/** Top edge of the first toast. */
	y: number;
	/** Toast height. */
	h: number;
	/** Distance between the tops of consecutive toasts (height + flex gap). */
	pitch: number;
}

/** The suite's capture protocol, in the order `storybook.spec.ts` applies it. */
async function openSettled(page: Page, id: string, brand: string): Promise<void> {
	await page.goto(
		`http://localhost:6006/iframe.html?id=${id}&viewMode=story&globals=brand:${brand}`,
	);
	await page.waitForSelector("#storybook-root", { state: "attached", timeout: 5000 });
	await page.waitForFunction(
		() => (document.querySelector("#storybook-root")?.childElementCount ?? 0) > 0,
		null,
		{ timeout: 30_000 },
	);
	await page.waitForFunction(
		() => document.querySelector('[data-dismissing="true"]') === null,
		null,
		{
			timeout: 30_000,
		},
	);
	await page.addStyleTag({
		content:
			"*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
	});
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** How many toasts the settled DOM holds, and where they are. */
async function readLiveStack(page: Page) {
	return page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll(".ds-atom-toast"));
		return {
			count: nodes.length,
			dismissing: nodes.filter((n) => n.getAttribute("data-dismissing") === "true").length,
			tones: nodes.map((n) => n.getAttribute("data-tone")),
			rects: nodes.map((n) => {
				const r = n.getBoundingClientRect();
				return {
					x: Math.round(r.x),
					y: Math.round(r.y),
					w: Math.round(r.width),
					h: Math.round(r.height),
				};
			}),
			dpr: window.devicePixelRatio,
		};
	});
}

/**
 * Counts toast boxes in a recorded PNG by decoding it in a Chromium canvas —
 * this repository has no image library installed, which is the same reason
 * 01-FIX-visual-suite.md's probes decoded through a canvas.
 *
 * The strip sampled is `x + 4 .. x + 14`: inside the toast's 1px border and
 * inside its 14px left padding, so it lands on the tone tint and can never land
 * on the icon or a message glyph. An earlier point-sample through the middle of
 * the box read a letterform instead of the tint.
 */
async function countToastsInPng(page: Page, file: string, g: StackGeometry): Promise<number> {
	expect(existsSync(file), `no recorded baseline at ${file}`).toBe(true);
	const b64 = (await readFile(file)).toString("base64");
	const { slots } = await page.evaluate(
		async ({ b64, g, SLOTS }) => {
			const img = new Image();
			img.src = `data:image/png;base64,${b64}`;
			await img.decode();
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) throw new Error("no 2d context");
			ctx.drawImage(img, 0, 0);
			const mean = (x0: number, y0: number, w: number, h: number) => {
				const d = ctx.getImageData(x0, y0, w, h).data;
				let r = 0;
				let gg = 0;
				let b = 0;
				for (let i = 0; i < d.length; i += 4) {
					r += d[i] as number;
					gg += d[i + 1] as number;
					b += d[i + 2] as number;
				}
				const n = d.length / 4;
				return [Math.round(r / n), Math.round(gg / n), Math.round(b / n)] as [
					number,
					number,
					number,
				];
			};
			const out: [number, number, number][] = [];
			for (let i = 0; i < SLOTS; i++) {
				// Interior rows only, so the 1px border and the box-shadow that bleeds
				// into the 8px gap cannot be mistaken for the tint.
				out.push(mean(g.x + 4, g.y + g.pitch * i + 12, 10, g.h - 24));
			}
			return { slots: out };
		},
		{ b64, g, SLOTS },
	);

	const dist = (a: [number, number, number], b: [number, number, number]) =>
		Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

	// The empty reference is slot 4 — always unoccupied, and unlike a strip further
	// down the page it is still INSIDE whatever container the story draws. A first
	// version referenced y 500-560, which for `--dark-mode` falls below the story's
	// own dark box and reported that box as a fifth toast.
	const ref = slots[SLOTS - 2] as [number, number, number];
	const refCheck = slots[SLOTS - 1] as [number, number, number];
	expect(
		dist(ref, refCheck),
		`${path.basename(file)}: the two reference slots disagree, so the empty-background reference is landing on content and the count cannot be trusted`,
	).toBeLessThanOrEqual(6);

	let count = 0;
	for (const slot of slots) {
		if (dist(slot as [number, number, number], ref) <= 6) break;
		count++;
	}
	return count;
}

for (const brand of BRANDS) {
	test(`recorded toast baselines depict the settled stack — ${brand.id} brand`, async ({
		page,
	}) => {
		// Geometry from a live settled render, in this brand, in this run.
		await openSettled(page, "feedback-toast--tones", brand.id);
		const reference = await readLiveStack(page);

		// Playwright screenshots this project at deviceScaleFactor 1, so image
		// pixels are CSS pixels. If that ever changes the geometry below is off by
		// a factor and every count silently becomes garbage — so assert it.
		expect(reference.dpr, "deviceScaleFactor must be 1 for image px == CSS px").toBe(1);

		// The component's own cap, checked against the settled render rather than
		// taken from a comment. `--tones` fires four toasts; three must survive.
		expect(reference.count, "--tones must settle to the 3-toast cap").toBe(3);
		expect(reference.dismissing, "nothing may still be mid-eviction after the settle wait").toBe(0);
		expect(
			reference.tones,
			"the evicted toast is the OLDEST — success — leaving these three",
		).toEqual(["error", "info", "warning"]);

		const [first, second] = reference.rects;
		if (!first || !second) throw new Error("expected at least two toasts to derive the pitch from");
		const geometry: StackGeometry = {
			x: first.x,
			y: first.y,
			h: first.h,
			pitch: second.y - first.y,
		};

		for (const id of TOAST_STORIES) {
			await openSettled(page, id, brand.id);
			const live = await readLiveStack(page);
			expect(live.dismissing, `${id}: still mid-eviction after the settle wait`).toBe(0);

			const file = path.join(SNAPSHOT_DIR, `${id}${brand.suffix}-chromium-darwin.png`);
			const recorded = await countToastsInPng(page, file, geometry);

			// THE PROPERTY. Not "the image has three toasts" — the image has whatever
			// the settled DOM has, which is 3 for the two stories that fire on mount
			// and 0 for the four that wait for a click.
			expect(
				recorded,
				`${id}${brand.suffix}: the recorded baseline holds ${recorded} toasts but the settled DOM holds ${live.count} — the image records a mid-eviction transient, not a state that persists (F-6)`,
			).toBe(live.count);
		}
	});
}
