import type { Preview } from "@storybook/react-vite";
import "../src/tokens.css";
import "../src/primitives.css";
import "../src/utilities.css";
import "./storybook.css";

const preview: Preview = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
		layout: "centered",
	},
	globalTypes: {
		theme: {
			description: "Color theme",
			defaultValue: "light",
			toolbar: {
				title: "Theme",
				icon: "circlehollow",
				items: ["light", "dark"],
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme as "light" | "dark";
			document.documentElement.classList.toggle("dark", theme === "dark");
			return Story();
		},
	],
};

export default preview;
