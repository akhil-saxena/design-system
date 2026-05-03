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
	globalTypes: {
		theme: {
			description: "Color scheme",
			toolbar: {
				title: "Theme",
				icon: "circlehollow",
				items: [
					{ value: "light", icon: "sun", title: "Light" },
					{ value: "dark", icon: "moon", title: "Dark" },
				],
				dynamicTitle: false,
			},
		},
	},
	initialGlobals: {
		theme: "light",
	},
	parameters: {
		options: {
			storySort: {
				order: [
					"Overview",
					"Foundation",
					"Inputs",
					"Data Display",
					"Display",
					"Feedback",
					"Interaction",
					"Layout",
					"Overlays",
					"Patterns",
					"Internals",
				],
			},
		},
		controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
		viewport: {
			viewports: {
				mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
				tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
				desktop: { name: "Desktop", styles: { width: "1280px", height: "900px" } },
			},
		},
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
			const isDark =
				context.globals.theme === "dark" || context.globals.backgrounds?.value === DARK_BG;
			document.documentElement.classList.toggle("dark", isDark);
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
