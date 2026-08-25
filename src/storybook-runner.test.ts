import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { type Server, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { planRun, probeStorybook } from "../scripts/storybook-runner.mjs";

/**
 * F-11. `npm run test:a11y` must reuse a Storybook that is already running.
 *
 * THE DEFECT BEING GUARDED. The script used `start-server-and-test`, which always
 * spawns. Against an occupied 6006 that starts a SECOND Storybook, hits the
 * interactive `Port 6006 is not available… › (Y/n)` prompt, and runs the sweep
 * against a Storybook that has not finished booting. The observable result was 37
 * of 508 stories failing in `postVisit` with `globalThis.__getContext is not a
 * function` and ZERO axe violations — an accessibility gate reporting an
 * accessibility failure that was actually a port collision. Attaching to the same
 * tree by hand gave 508/508, exit 0.
 *
 * WHY THIS TEST BINDS A REAL SOCKET AND SPAWNS THE REAL SCRIPT. The failure was a
 * process/port interaction, so a test that stubbed the probe would be checking the
 * stub. It starts an actual HTTP server on an ephemeral port, runs
 * `scripts/storybook-runner.mjs --print-plan` as a real child process, and reads
 * the argv it would have executed. The only thing not exercised is the final
 * `spawn`, which is the part a unit test cannot assert without running a sweep.
 *
 * WHY AN EPHEMERAL PORT AND NOT 6006. This must pass in CI, where nothing is
 * listening, and on Akhil's machine, where Storybook is. Binding its own port
 * makes the result independent of both.
 */

const ROOT = join(__dirname, "..");
const RUNNER = join(ROOT, "scripts", "storybook-runner.mjs");

type Plan = {
	strategy: "attach" | "spawn";
	mode: string;
	url: string;
	command: string;
	args: string[];
	ci: boolean;
	reachable: boolean;
};

const run = promisify(execFile);

/**
 * ASYNC ON PURPOSE, and it is not style. `execFileSync` blocks this process's
 * event loop, so the stand-in Storybook below — which lives in THIS process —
 * cannot accept the child's connection while the child is probing it. The probe
 * then times out and the test asserts "not reachable" against a server that is
 * running perfectly. Measured: every attach case failed at exactly the 2000ms
 * probe timeout before this became async.
 */
async function plan(url: string, env: NodeJS.ProcessEnv = {}): Promise<Plan> {
	const { stdout } = await run(
		process.execPath,
		[RUNNER, "--mode", "a11y", "--url", url, "--print-plan"],
		{
			cwd: ROOT,
			encoding: "utf8",
			// CI is scrubbed unless a case sets it: vitest itself may be running
			// under CI=true, and inheriting that would silently turn every "local"
			// case below into a second copy of the CI case.
			env: { ...process.env, CI: "", ...env },
		},
	);
	return JSON.parse(stdout) as Plan;
}

/** A stand-in Storybook: the probe requires a parseable index with `entries`. */
function serve(handler: (path: string) => { status: number; body: string }): Promise<{
	url: string;
	close: () => Promise<void>;
}> {
	return new Promise((resolveServer) => {
		const server: Server = createServer((req, res) => {
			const { status, body } = handler(req.url ?? "/");
			res.writeHead(status, { "content-type": "application/json" });
			res.end(body);
		});
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address() as AddressInfo;
			resolveServer({
				url: `http://127.0.0.1:${port}`,
				close: () => new Promise((done) => server.close(() => done())),
			});
		});
	});
}

const STORYBOOK_INDEX = JSON.stringify({
	v: 5,
	entries: { "foundation-divider--default": { type: "story", id: "foundation-divider--default" } },
});

describe("test:a11y reuses a running Storybook (F-11)", () => {
	let live: Awaited<ReturnType<typeof serve>>;
	let deadUrl: string;

	beforeAll(async () => {
		live = await serve((path) =>
			path.startsWith("/index.json")
				? { status: 200, body: STORYBOOK_INDEX }
				: { status: 404, body: "{}" },
		);
		// A port that was bound and then released: as close to "definitely nothing
		// there" as a test can get without guessing a number.
		const transient = await serve(() => ({ status: 200, body: "{}" }));
		deadUrl = transient.url;
		await transient.close();
	});

	afterAll(async () => {
		await live.close();
	});

	it("ATTACHES when a Storybook is already serving the URL — the F-11 repair", async () => {
		const p = await plan(live.url);
		expect(p.reachable, "the probe did not see the server this test just started").toBe(true);
		expect(p.strategy).toBe("attach");
		expect(p.command).toBe("test-storybook");
		expect(p.args).toEqual(["--url", live.url]);
		// The thing that caused the 37 failures must not be in the plan at all.
		expect(p.args.join(" ")).not.toContain("storybook dev");
		expect(p.command).not.toBe("start-server-and-test");
	});

	it("SPAWNS when nothing is there, so a cold machine still works", async () => {
		const p = await plan(deadUrl);
		expect(p.reachable).toBe(false);
		expect(p.strategy).toBe("spawn");
		expect(p.command).toBe("start-server-and-test");
		expect(p.args[0]).toContain("npm run storybook");
		// Non-interactive, so a Storybook started in the gap between probe and
		// spawn produces a timeout rather than a hidden (Y/n) prompt.
		expect(p.args[0]).toContain("--ci");
		expect(p.args[1]).toBe(deadUrl);
		expect(p.args[2]).toContain("test-storybook");
	});

	it("SPAWNS in CI even when something is reachable — mirrors reuseExistingServer: !CI", async () => {
		const p = await plan(live.url, { CI: "true" });
		expect(p.ci).toBe(true);
		// Reuse is not merely overridden in CI; the probe is not consulted at all,
		// so a stray listener cannot influence the run even by one branch.
		expect(p.reachable).toBe(false);
		expect(p.strategy).toBe("spawn");
		expect(p.command).toBe("start-server-and-test");
	});

	it("does NOT attach to a non-Storybook server that merely holds the port", async () => {
		// A port check alone would attach here and report an empty sweep as a
		// result — the same shape of misleading green F-11 is about.
		const impostor = await serve(() => ({ status: 200, body: JSON.stringify({ hello: "world" }) }));
		try {
			const p = await plan(impostor.url);
			expect(p.reachable).toBe(false);
			expect(p.strategy).toBe("spawn");
		} finally {
			await impostor.close();
		}
	});

	it("planRun refuses to attach when told reachable AND ci, which the CLI can never ask", async () => {
		// THE ROW THIS GATE WAS MISSING, added because proving it exposed the hole.
		// The CI policy is guarded twice — `main()` skips the probe, and `planRun`
		// re-checks `!ci` — and deleting the `planRun` half left every other case
		// green, because the CLI cannot hand `planRun` the combination the guard is
		// for. Calling it directly is the only way to see that half at all.
		expect(planRun({ mode: "a11y", url: live.url, reachable: true, ci: true }).strategy).toBe(
			"spawn",
		);
		expect(planRun({ mode: "a11y", url: live.url, reachable: true, ci: false }).strategy).toBe(
			"attach",
		);
		expect(planRun({ mode: "a11y", url: live.url, reachable: false, ci: false }).strategy).toBe(
			"spawn",
		);
		// And the probe itself, called directly rather than through a child, so a
		// broken `--print-plan` cannot make the reachability cases vacuous.
		await expect(probeStorybook(live.url)).resolves.toBe(true);
		await expect(probeStorybook(deadUrl, 500)).resolves.toBe(false);
	});

	it("the package script actually routes through the runner", () => {
		// The browser-independent half: a plan can be perfect while package.json
		// still calls start-server-and-test directly, which is the exact state this
		// commit is leaving behind.
		const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
			scripts: Record<string, string>;
		};
		expect(pkg.scripts["test:a11y"]).toContain("scripts/storybook-runner.mjs");
		expect(pkg.scripts["test:a11y"]).not.toContain("start-server-and-test");

		// AND `test:visual:capture` is deliberately NOT rewired — asserted so the
		// omission is a decision on the record rather than something forgotten.
		// Reuse is right for a read-only sweep and wrong for a WRITE: that script
		// overwrites 226 tracked PNGs under tests/visual-baselines/, and capturing
		// them against a developer's hot-reloaded Storybook would bake a
		// half-applied edit into committed baselines. A capture starts cold.
		expect(pkg.scripts["test:visual:capture"]).toContain("start-server-and-test");
	});
});
