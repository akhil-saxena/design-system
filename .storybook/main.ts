import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
	addons: [
		{
			name: "@storybook/addon-essentials",
			options: {
				backgrounds: true, // keep toolbar button always mounted
			},
		},
		// Runs axe-core against the rendered story and surfaces violations in an
		// "Accessibility" panel. The same rules run headlessly over every story via
		// .storybook/test-runner.ts, so a regression fails `npm run test:a11y`
		// rather than waiting to be noticed in the UI.
		"@storybook/addon-a11y",
	],
	framework: { name: "@storybook/react-vite", options: {} },
	docs: { autodocs: "tag" },
	typescript: { check: false, reactDocgen: "react-docgen-typescript" },
};

export default config;
