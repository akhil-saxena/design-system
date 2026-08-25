import type { Preview } from "@storybook/react-vite";
import { create } from "@storybook/theming/create";
// The FACE layers. As of v2.0.0 tokens.css carries no face rules (D-29/D-36),
// so without these every story renders in a fallback family and all 488 visual
// baselines move. Both brands are loaded because Storybook is a two-brand
// development environment by construction; criterion 4 ("a page consuming only
// monochrome downloads only monochrome's three families") is a property of a real
// consumer, not of this preview, and is measured in tests/visual/font-download
// against an isolated page. Face rules do not participate in the cascade with
// selector rules, so their position relative to the token layers is arbitrary.
import "../src/fonts/default.css";
import "../src/fonts/monochrome.css";
import "../src/tokens.css";
// Monochrome is imported unconditionally, in the position its own header
// documents (after the token layer, before primitives). It costs nothing when
// the brand is off: every rule in it is scoped to :root[data-brand="monochrome"],
// which matches nothing until the decorator sets the attribute. Importing it
// conditionally would mean the toolbar could not switch brands without a reload.
import "../src/themes/monochrome.css";
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
		brand: {
			description: "Brand token layer",
			toolbar: {
				title: "Brand",
				icon: "paintbrush",
				items: [
					{ value: "default", title: "Default" },
					{ value: "monochrome", title: "Monochrome" },
				],
				dynamicTitle: false,
			},
		},
	},
	initialGlobals: {
		theme: "light",
		// Default, deliberately: monochrome must be opt-in so none of the recorded
		// visual baselines move. Monochrome's own captures are D-37 / plan 01-20.
		brand: "default",
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
			const isMonochrome = context.globals.brand === "monochrome";
			// Brand and mode are applied in ONE pass. Splitting them across two
			// decorators paints a frame in the wrong brand, which is the flash D-34's
			// no-flash module exists to remove — and it would make every first-frame
			// screenshot unreliable.
			document.documentElement.classList.toggle("dark", isDark);
			if (isMonochrome) document.documentElement.dataset.brand = "monochrome";
			else document.documentElement.removeAttribute("data-brand");
			if (isDark) {
				return (
					// The dark class on this wrapper is redundant — the decorator already
					// put it on <html>, and every .dark rule in the system is written with
					// a descendant combinator, so they all still match from there. Under
					// monochrome it is worse than redundant: the design system's own
					// ":root.dark, .dark" block would match this div and RE-DECLARE its 50
					// neutral dark tokens below the brand layer, so --cream resolved to
					// #181818 instead of monochrome's #161616 and --wire to
					// rgba(255,255,255,0.22) — measured, not assumed. Every monochrome-dark
					// probe in this phase reads an element inside this wrapper, so leaving
					// the class on would have made all of them measure the design system's
					// neutrals while still looking green.
					<div
						className={isMonochrome ? undefined : "dark"}
						// Read from the cascade, not from the DARK_BG constant, so the
						// backdrop tracks whichever brand is mounted. DARK_BG stays below
						// for the backgrounds parameter and the dark-detection branch,
						// which are Storybook's own chrome and brand-independent.
						style={{ background: "var(--cream)" }}
					>
						{Story()}
					</div>
				);
			}
			return Story();
		},
	],
};

export default preview;
