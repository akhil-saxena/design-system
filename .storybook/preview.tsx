import type { Preview } from "@storybook/react-vite";
import { create } from "@storybook/theming/create";
import "../src/tokens.css";
import "../src/primitives.css";
import "../src/utilities.css";
import "./storybook.css";

const docsTheme = create({
	base: "light",
	appBg: "#f5f3f0",
	appContentBg: "#f5f3f0",
	appBorderColor: "#e7e2dc",
	textColor: "#292524",
	colorPrimary: "#f59e0b",
	colorSecondary: "#f59e0b",
	fontCode: "ui-monospace, 'Cascadia Code', monospace",
});

const DARK_BG = "#1c1917";

const preview: Preview = {
	parameters: {
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
		layout: "centered",
		backgrounds: {
			default: "light",
			values: [
				{ name: "light", value: "#f5f3f0" },
				{ name: "dark", value: DARK_BG },
			],
			disable: false,
		},
		docs: {
			theme: docsTheme,
			source: { language: "tsx" },
		},
	},
	decorators: [
		(Story, context) => {
			const isDark = context.globals.backgrounds?.value === DARK_BG;
			// Always sync <html> so storybook.css dark overrides (sidebar, docs prose) work
			document.documentElement.classList.toggle("dark", isDark);
			// Also wrap the story in a scoped .dark div so DarkMode stories in the
			// Docs page have their own isolated dark context independent of <html>
			if (isDark) {
				return (
					<div className="dark" style={{ background: DARK_BG }}>
						{Story()}
					</div>
				);
			}
			return Story();
		},
	],
};

export default preview;
