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
	],
	framework: { name: "@storybook/react-vite", options: {} },
	docs: { autodocs: "tag" },
	typescript: { check: false, reactDocgen: "react-docgen-typescript" },
};

export default config;
