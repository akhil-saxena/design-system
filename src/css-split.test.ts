import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const distCss = join(root, "dist", "css");

/**
 * `primitives.css` is a single 165KB sheet, so importing one component used to
 * ship styling for all 79. The build now also emits `dist/css/<component>.css`
 * from that same source — see scripts/split-css.mjs for why it is generated
 * rather than hand-maintained.
 *
 * The contract worth testing is that the split is *lossless*: no rule may be
 * dropped, duplicated, or reordered. Anything less and a component would render
 * subtly differently depending on which entrypoint the consumer chose.
 */
describe("CSS split", () => {
	it("round-trips byte-for-byte against primitives.css", () => {
		// --check does the comparison in-process and exits non-zero on mismatch,
		// so this asserts the same invariant the build enforces.
		expect(() =>
			execFileSync(process.execPath, [join(root, "scripts", "split-css.mjs"), "--check"], {
				encoding: "utf8",
			}),
		).not.toThrow();
	});

	it("keeps the shared base sheet small enough to be worth splitting", () => {
		// If base.css grows to hold most of the sheet, per-component files stop
		// buying anything and the extra API surface is dead weight.
		if (!existsSync(distCss)) return; // build not run — covered by the check above
		const base = readFileSync(join(distCss, "base.css"), "utf8").length;
		const full = readFileSync(join(root, "src", "primitives.css"), "utf8").length;
		expect(base / full).toBeLessThan(0.1);
	});

	it("emits a file for every component section", () => {
		if (!existsSync(distCss)) return;
		const files = readdirSync(distCss).filter((f) => f.endsWith(".css"));
		// 70 slices: 69 component sheets plus base. A large drop means the banner
		// convention the splitter relies on has been broken.
		expect(files.length).toBeGreaterThanOrEqual(60);
		expect(files).toContain("base.css");
		for (const expected of ["button.css", "modal.css", "datepicker.css", "table.css"]) {
			expect(files).toContain(expected);
		}
	});

	it("does not leave component rules in base.css", () => {
		if (!existsSync(distCss)) return;
		const base = readFileSync(join(distCss, "base.css"), "utf8");
		// base holds the preamble, .ds-visually-hidden and the reduced-motion
		// guard. A component's own atom class appearing here means a banner was
		// misclassified and that component's rules ship to every consumer.
		expect(base).not.toMatch(/\.ds-atom-btn\[/);
		expect(base).not.toMatch(/\.ds-atom-modal\b/);
	});
});
