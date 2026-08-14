import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test-setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist", ".storybook"],
		coverage: {
			provider: "v8",
			reporter: ["text-summary", "html", "lcov"],
			// Stories, type-only modules and barrels carry no logic worth covering;
			// leaving them in deflates the number and hides real gaps.
			exclude: [
				"node_modules/",
				"dist/",
				".storybook/",
				"scripts/",
				"tests/",
				"src/**/*.stories.tsx",
				"src/**/*.test.{ts,tsx}",
				"src/test-setup.ts",
				"src/index.ts",
				"src/hooks/index.ts",
				"src/icons/index.ts",
				"src/OverviewPage.tsx",
			],
			// Thresholds are pinned just under the measured values at the time of
			// writing (statements 87.1 / branches 80.2 / functions 86.2 / lines 89.5)
			// so coverage cannot silently regress. They are a ratchet, not a target:
			// raise them when real coverage rises, never lower them to make a build
			// pass.
			thresholds: {
				statements: 86,
				branches: 79,
				functions: 85,
				lines: 88,
			},
		},
	},
});
