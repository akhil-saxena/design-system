import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
	use: {
		baseURL: "http://localhost:6006",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "npm run storybook -- --quiet --no-open",
		url: "http://localhost:6006",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
