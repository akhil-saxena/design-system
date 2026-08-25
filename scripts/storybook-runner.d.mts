/**
 * Types for `scripts/storybook-runner.mjs`.
 *
 * This file exists so `src/storybook-runner.test.ts` can call `planRun` DIRECTLY
 * rather than only through the CLI, and that is not a convenience. Proving the
 * gate revealed a row it could not make bite: deleting the `!ci &&` guard inside
 * `planRun` left all five cases green, because `main()` independently forces
 * `reachable = false` in CI and the CLI could therefore never present `planRun`
 * with the one input combination that guard exists for — reachable AND ci. The
 * doubled guard is deliberate defence in depth; a gate that can only see one half
 * of it is not.
 */

export declare const DEFAULT_URL: string;

export declare function probeStorybook(url: string, timeoutMs?: number): Promise<boolean>;

export interface RunPlan {
	strategy: "attach" | "spawn";
	mode: string;
	url: string;
	command: string;
	args: string[];
}

export declare function planRun(options: {
	mode: string;
	url: string;
	reachable: boolean;
	ci: boolean;
	passthrough?: string[];
}): RunPlan;
