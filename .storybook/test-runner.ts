import type { TestRunnerConfig } from "@storybook/test-runner";
import { waitForPageReady } from "@storybook/test-runner";

// Storybook test-runner orchestration:
// - preVisit: injects CSS to disable animations/transitions for stable snapshots (D-32)
// - postVisit: captures a PNG per story per theme into tests/visual-baselines/ (D-64)
//
// The test-runner is invoked by `npm run test:visual` after Storybook has been
// started by `start-server-and-test`. LOCAL ONLY - never CI (D-31).
//
// Theme detection: getStoryContext returns the global default ("light") rather
// than the story-level globals override, so we read the dark class directly
// from the live DOM via page.evaluate. This matches what the user actually sees.
const config: TestRunnerConfig = {
	async preVisit(page) {
		await page.addStyleTag({
			content: `
				*, *::before, *::after {
					animation: none !important;
					transition: none !important;
					caret-color: transparent !important;
				}
			`,
		});
	},
	async postVisit(page, context) {
		await waitForPageReady(page);
		const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
		const theme = isDark ? "dark" : "light";
		const safeId = context.id.replace(/[^a-z0-9-]/gi, "_");
		await page.screenshot({
			path: `tests/visual-baselines/${safeId}/${theme}.png`,
			fullPage: true,
		});
	},
};

export default config;
