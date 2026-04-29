import { expect, test } from "@playwright/test";

// Iterates Storybook stories and captures screenshots into tests/visual-baselines/.
// Storybook must be running on localhost:6006 — playwright.config.ts webServer
// handles starting `npm run storybook -- --quiet --no-open` automatically.
// Story IDs are discovered via /index.json on the running Storybook server.

test.describe("Storybook visual baselines", () => {
	test("captures all stories", async ({ page }) => {
		await page.goto("http://localhost:6006/index.json");
		const indexJson = await page.evaluate(() => document.body.innerText);
		const stories: { id: string }[] = Object.values(JSON.parse(indexJson).entries ?? {}).filter(
			(e: unknown) => (e as { type: string }).type === "story",
		) as {
			id: string;
		}[];
		expect(stories.length).toBeGreaterThan(0);
		for (const story of stories) {
			await page.goto(`http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`);
			await page.waitForSelector("#storybook-root", { timeout: 5000 });
			await expect(page).toHaveScreenshot(`${story.id}.png`, {
				fullPage: true,
			});
		}
	});
});
