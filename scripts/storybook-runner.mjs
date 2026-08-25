#!/usr/bin/env node
/**
 * Runs the Storybook test-runner against a Storybook that may already be open.
 *
 * ── F-11, the defect this replaces ────────────────────────────────────────────
 *
 * `test:a11y` was:
 *
 *   start-server-and-test "npm run storybook -- --quiet --no-open"
 *     http://localhost:6006 "DS_TEST_MODE=a11y test-storybook"
 *
 * `start-server-and-test` ALWAYS spawns. With a developer's Storybook already on
 * 6006 it starts a SECOND one, which hits `Port 6006 is not available. Would you
 * like to run Storybook on port 6007 instead? › (Y/n)` — an interactive prompt in
 * a non-interactive pipeline — and the run proceeds against a Storybook that is
 * still booting. Measured symptom: 37 of 508 stories fail in `postVisit` with
 * `globalThis.__getContext is not a function`, and ZERO axe violations.
 *
 * That is the part that matters. The gate reported an ACCESSIBILITY FAILURE when
 * the fault was a port collision. A red gate whose failure mode is
 * indistinguishable from the regression it exists to catch is worse than a slow
 * one, and this phase has spent real time on exactly that confusion. Attaching to
 * the same tree by hand — `DS_TEST_MODE=a11y test-storybook --url
 * http://localhost:6006` — gave 508/508, exit 0.
 *
 * `test:visual` never had this problem for one reason: `playwright.config.ts`
 * sets `reuseExistingServer: !process.env.CI`. This script gives the test-runner
 * the same rule, deliberately spelled the same way.
 *
 * ── The rule ──────────────────────────────────────────────────────────────────
 *
 *   CI               -> always spawn. There is no developer instance to reuse,
 *                       and reusing a stray process in CI would silently test
 *                       whatever that process happens to be serving. This mirrors
 *                       Playwright's `!CI` exactly rather than inventing a
 *                       second, subtly different policy.
 *   local, reachable -> attach. No spawn, no prompt, no second bundle.
 *   local, dead port -> spawn via start-server-and-test, unchanged from before.
 *
 * ── Why the probe is not just "is something listening" ────────────────────────
 *
 * It fetches `index.json` and requires a parseable `entries` object. A port check
 * alone would happily attach to any unrelated dev server on 6006 and report its
 * emptiness as a Storybook result — the same class of misleading green this
 * script exists to end.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 *   node scripts/storybook-runner.mjs --mode a11y [--url URL] [-- <test-runner args>]
 *   node scripts/storybook-runner.mjs --mode a11y --print-plan   # decide, print, exit 0
 *
 * `--print-plan` exists so the decision is testable without running a sweep;
 * src/storybook-runner.test.ts binds a real socket and asserts the plan flips.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_URL = "http://localhost:6006";

/** Local bin, resolved explicitly — never `npx`, which may reach the network. */
function bin(name) {
	const p = join(ROOT, "node_modules", ".bin", name);
	if (!existsSync(p)) throw new Error(`missing local binary: ${p} (run npm ci)`);
	return p;
}

/**
 * True only if `url` serves a Storybook index. Deliberately short-timeouted:
 * this runs before every sweep and a hung probe would be its own outage.
 */
export async function probeStorybook(url, timeoutMs = 2000) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(new URL("index.json", url), { signal: controller.signal });
		if (!res.ok) return false;
		const body = await res.json();
		return typeof body?.entries === "object" && body.entries !== null;
	} catch {
		return false;
	} finally {
		clearTimeout(timer);
	}
}

/** Shell-quotes one argv element for the single command STRING start-server-and-test takes. */
const quote = (s) => (/[\s"']/.test(s) ? JSON.stringify(s) : s);

/**
 * The decision, isolated from the doing so a test can read it.
 * `reachable` is injected rather than probed here for the same reason.
 */
export function planRun({ mode, url, reachable, ci, passthrough = [] }) {
	const strategy = !ci && reachable ? "attach" : "spawn";
	const runner = ["test-storybook", "--url", url, ...passthrough];
	if (strategy === "attach") {
		return { strategy, mode, url, command: runner[0], args: runner.slice(1) };
	}
	return {
		strategy,
		mode,
		url,
		command: "start-server-and-test",
		args: [
			// `--ci` is new and is defence in depth, not decoration. The probe and
			// the spawn are not atomic, so a Storybook started in between would put
			// us straight back on the interactive prompt — with `--ci` that becomes
			// a loud 120s start-server-and-test timeout instead of a silent hang.
			"npm run storybook -- --quiet --no-open --ci",
			url,
			[bin("test-storybook"), "--url", url, ...passthrough].map(quote).join(" "),
		],
	};
}

function parseArgs(argv) {
	const out = { mode: process.env.DS_TEST_MODE ?? "a11y", url: DEFAULT_URL, printPlan: false };
	const passthrough = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--mode") out.mode = argv[++i];
		else if (a === "--url") out.url = argv[++i];
		else if (a === "--print-plan") out.printPlan = true;
		else if (a === "--") {
			passthrough.push(...argv.slice(i + 1));
			break;
		} else passthrough.push(a);
	}
	out.passthrough = passthrough;
	return out;
}

async function main() {
	const { mode, url, printPlan, passthrough } = parseArgs(process.argv.slice(2));
	// `process.env.CI` is the same signal playwright.config.ts reads. Truthiness,
	// not equality: GitHub sets "true", other providers set "1".
	const ci = Boolean(process.env.CI);
	// The probe is skipped entirely in CI. Not an optimisation — it means a stray
	// listener in CI cannot change what runs, even for one branch of a log line.
	const reachable = ci ? false : await probeStorybook(url);
	const plan = planRun({ mode, url, reachable, ci, passthrough });

	if (printPlan) {
		process.stdout.write(`${JSON.stringify({ ...plan, ci, reachable }, null, 2)}\n`);
		return 0;
	}

	console.log(
		plan.strategy === "attach"
			? `[storybook-runner] reusing the Storybook already serving ${url} (DS_TEST_MODE=${mode})`
			: `[storybook-runner] no Storybook at ${url}${ci ? " (CI: reuse disabled)" : ""} — starting one (DS_TEST_MODE=${mode})`,
	);

	const child = spawn(bin(plan.command), plan.args, {
		cwd: ROOT,
		stdio: "inherit",
		// TARGET_URL is set explicitly as well as passed as --url: .storybook/
		// test-runner.ts's `prepare` hook reads TARGET_URL directly to build its
		// brand-carrying iframe URL, and a sweep that silently fell back to the
		// 6006 default while --url pointed elsewhere would be exactly the kind of
		// quiet mismatch this file exists to stop.
		env: { ...process.env, DS_TEST_MODE: mode, TARGET_URL: url },
	});
	return await new Promise((res) => {
		child.on("exit", (code, signal) => res(signal ? 1 : (code ?? 1)));
	});
}

// Only run when invoked as the entry point, so the test can import the pieces.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
	process.exitCode = await main();
}
