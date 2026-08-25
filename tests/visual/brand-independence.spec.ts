import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

/**
 * F-2 — a failure in ONE brand pass must not suppress the other.
 *
 * ## The defect this exists to catch
 *
 * `storybook.spec.ts` captures every story twice, once per brand, as two tests
 * inside one `describe`. That describe was configured `mode: "serial"`, and
 * Playwright's serial mode does two separate things under one name: it runs the
 * group in declaration order in a single worker, AND it skips the rest of the
 * group as soon as one member fails.
 *
 * The second half is the defect. One default-brand mismatch reports as
 * "1 failed / 1 did not run", and all 504 monochrome stories go unchecked in a
 * run whose only visible symptom is a failure somebody has already attributed to
 * the other brand. Observed twice in seven runs (01-FIX-tabs-font-race.md §5.1);
 * it is how a monochrome tabs mismatch hid from that plan's first full run. A
 * monochrome regression landing in the same window would have been invisible.
 *
 * ## Why this gate spawns a child run instead of reading the file
 *
 * The property under test is a runtime scheduling behaviour of the real spec.
 * Grepping `storybook.spec.ts` for the string `serial` would pass against any
 * other coupling mechanism — `test.describe.serial()`, a project `dependencies`
 * chain, a shared fixture that throws — and this repository has shipped enough
 * gates that matched a spelling rather than a behaviour. So the child run IS the
 * measurement: a real `playwright test` on the real file, with one brand made to
 * fail, asserting from the child's own output that the other brand still ran.
 *
 * ## How the failure is planted, with no test-only hook in the capture loop
 *
 * `DS_VISUAL_ONLY` names baseline stems, which are brand-suffixed. Naming ONLY a
 * monochrome stem therefore leaves the default-brand pass with an empty
 * allowlist, and its own `captured no stories at all` assertion fails it. The
 * plant is entirely in the environment: nothing in `storybook.spec.ts` knows this
 * gate exists, and there is no "if planted, fail" branch in production test code
 * that could later be tripped by accident.
 *
 * The child is deliberately cheap — one story captured, `--workers=1`, so it adds
 * roughly ten seconds and one short-lived browser to a 3.4-minute suite rather
 * than a second full pass.
 *
 * ## Proved by planting its own target
 *
 * With `mode: "serial"` restored in `storybook.spec.ts`, this spec FAILS: the
 * child prints `1 did not run` and never prints a monochrome capture line. With
 * `mode: "default"` it PASSES on `captured 1`. Both directions were run.
 */

// This file is loaded as an ES module, so `__dirname` does not exist — resolved
// from import.meta.url instead. Measured, not assumed: the first draft used
// __dirname and Playwright reported "No tests found" because the module threw
// during collection, which is a silent pass shape worth remembering.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * BOTH DIRECTIONS, and that is not symmetry for its own sake — it closes a
 * walk-through this gate had while it only tested one.
 *
 * With `mode: "serial"` restored AND the `BRANDS` array reordered so monochrome
 * is declared first, a single-direction gate that only plants a default-brand
 * failure goes green: monochrome has already captured by the time the default
 * pass fails. The coupling is untouched, and a MONOCHROME mismatch would then
 * suppress the default brand instead. Planting each direction in turn means no
 * declaration order can satisfy the gate while the group is still coupled.
 *
 * `DS_VISUAL_ONLY` names baseline STEMS, which carry the brand suffix, so naming
 * only one brand's stem leaves the other brand's allowlist empty — which is the
 * plant.
 */
const DIRECTIONS = [
	{ fails: "default", survives: "monochrome", only: "inputs-button--default--monochrome" },
	{ fails: "monochrome", survives: "default", only: "inputs-button--default" },
] as const;

for (const { fails, survives, only: PLANT } of DIRECTIONS) {
	test(`a failing ${fails} pass does not suppress ${survives} coverage`, async () => {
		// A nested Playwright run must not inherit the parent's own test-runner
		// environment, and must not inherit CI: playwright.config.ts sets
		// `reuseExistingServer: !process.env.CI`, so a child that thinks it is in CI
		// would try to start a SECOND Storybook on 6006 and die on the bound port
		// instead of reusing the one the parent is already talking to.
		const env: NodeJS.ProcessEnv = { ...process.env, DS_VISUAL_ONLY: PLANT };
		for (const key of Object.keys(env)) {
			if (key.startsWith("PLAYWRIGHT") || key.startsWith("PW_") || key === "CI") delete env[key];
		}

		let output: string;
		try {
			output = execFileSync(
				"npx",
				[
					"playwright",
					"test",
					"tests/visual/storybook.spec.ts",
					"--workers=1",
					"--reporter=list",
					// The child is EXPECTED to exit non-zero — the planted brand fails.
					// `--retries=0` keeps it from re-running a pass that is failing on
					// purpose.
					"--retries=0",
					// MANDATORY, not tidiness. Playwright DELETES its output directory at
					// the start of every run, and the default is `test-results/` for parent
					// and child alike — so a child launched mid-suite would wipe the traces
					// and error contexts the PARENT run is still collecting, including any
					// it had already written for a genuine failure. Measured: without this
					// the child left two of its own failure directories sitting in the
					// parent's test-results. Same gitignored root, separate directory.
					`--output=test-results/brand-independence-child-${fails}`,
				],
				{ cwd: REPO, env, encoding: "utf8", timeout: 240_000, stdio: "pipe" },
			);
		} catch (err) {
			// Non-zero exit is the expected case; the child's output is what matters.
			const e = err as { stdout?: string; stderr?: string; status?: number | null };
			if (typeof e.stdout !== "string") throw err;
			output = e.stdout + (e.stderr ?? "");
		}

		// The plant landed: the named brand really did fail, so this run is exercising
		// the case under test rather than a green one. Without this the whole gate
		// would pass against a `storybook.spec.ts` that had simply stopped asserting
		// its own coverage.
		expect(output, `the planted ${fails}-brand failure did not occur`).toContain(
			`[${fails}] captured no stories at all`,
		);

		// The property: the surviving brand ran, and says so with a count. Asserting
		// the count and not merely "passed" is the point — Playwright reports a
		// skipped test as "did not run", never as a failure, so a run that suppressed
		// 504 stories and one that captured them differ ONLY in this line.
		expect(
			output,
			`the ${survives} pass was suppressed by the ${fails}-brand failure (serial mode?)`,
		).toContain(`visual baselines [${survives}]: captured 1`);

		// The exact string Playwright prints when a group member is skipped by serial
		// mode. Named explicitly so the failure message points at the mechanism.
		expect(output, "Playwright reported a skipped test — the brands are coupled").not.toContain(
			"did not run",
		);
	});
}
