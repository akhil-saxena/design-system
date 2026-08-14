import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const dist = join(root, "dist");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

/**
 * These assertions describe the *published* surface, so they need a build.
 * `prepublishOnly` runs `build && test`, so they are live on the path that
 * matters; a bare `npm test` on a clean checkout skips them rather than failing
 * for an unrelated reason.
 */
const built = existsSync(dist);

describe.skipIf(!built)("published package surface", () => {
	it("every path in `exports` actually exists in dist", () => {
		const missing: string[] = [];
		const walk = (value: unknown) => {
			if (typeof value === "string") {
				if (!value.startsWith("./")) return;
				if (value.includes("*")) {
					// Subpath *pattern* (e.g. "./dist/css/*.css"). Node resolves the
					// wildcard at import time, so assert the directory exists and holds
					// at least one match rather than stat-ing a literal path.
					const [dir = "", suffix = ""] = value.split("*");
					const abs = join(root, dir);
					const ext = suffix;
					const matches = existsSync(abs) && readdirSync(abs).some((f) => f.endsWith(ext));
					if (!matches) missing.push(`${value} (no files match)`);
					return;
				}
				if (!existsSync(join(root, value))) missing.push(value);
				return;
			}
			if (value && typeof value === "object") for (const v of Object.values(value)) walk(v);
		};
		walk(pkg.exports);
		// Also the legacy top-level fields.
		for (const field of ["main", "module", "types"]) walk(pkg[field]);
		expect(missing).toEqual([]);
	});

	it('marks every entrypoint with "use client"', () => {
		// React Server Components: the directive does not survive tsup's rollup
		// tree-shaking pass, so it is stamped by scripts/postbuild.mjs. Without it,
		// importing any of the 46 stateful components from a Next.js App Router
		// server component fails to build. Every entry is genuinely client-only —
		// even ./icons, whose Icon wrapper is built on forwardRef.
		for (const entry of ["index.js", "hooks/index.js", "icons/index.js"]) {
			const source = readFileSync(join(dist, entry), "utf8");
			expect(source.startsWith('"use client";'), `${entry} is missing the directive`).toBe(true);
		}
	});

	it("ships the three stylesheets the exports map promises", () => {
		for (const css of ["tokens.css", "primitives.css", "utilities.css"]) {
			expect(existsSync(join(dist, css)), `dist/${css} missing`).toBe(true);
			expect(readFileSync(join(dist, css), "utf8").length).toBeGreaterThan(0);
		}
	});

	it("declares CSS as side-effectful so bundlers do not drop the imports", () => {
		expect(pkg.sideEffects).toContain("*.css");
	});
});
