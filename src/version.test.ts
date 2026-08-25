import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const version: string = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

/**
 * The Storybook landing page prints the package version in two places. Those
 * strings are hand-written, so they silently go stale the moment a release
 * happens — the page still read v1.9.1 while several versions had shipped.
 *
 * Rather than wire a build-time `define` (which would couple the Storybook config
 * to the component source for one string), this test simply fails when the
 * displayed version drifts from package.json. Cheap, and it catches the mistake
 * at the moment it is made.
 */
describe("displayed version", () => {
	const overview = readFileSync(join(root, "src", "OverviewPage.tsx"), "utf8");

	it("matches package.json everywhere the Overview page prints it", () => {
		// The prerelease suffix is part of the version, so it must be part of the capture.
		// Without `(?:-...)?` this regex reads only the `2.0.0` out of `v2.0.0-beta.1` and
		// compares it against package.json's `2.0.0-beta.1` — so the assertion could never
		// pass on a prerelease, and could never catch a page printing the bare `v2.0.0`
		// while a beta was what shipped. Widening the capture makes it bite in both cases.
		const printed = [...overview.matchAll(/v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g)].map(
			(m) => m[1],
		);
		expect(printed.length, "expected the Overview page to print the version").toBeGreaterThan(0);
		for (const found of printed) expect(found).toBe(version);
	});

	it("has a matching CHANGELOG entry for the current version", () => {
		// A release with no changelog section is a release nobody can review.
		const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
		expect(changelog).toMatch(new RegExp(`^## ${version.replace(/\./g, "\\.")}\\b`, "m"));
	});
});
