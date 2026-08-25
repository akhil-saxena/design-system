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

/* THE DOCS CHROME, and the one constraint that shapes it.
   `create()` runs ONCE at module scope, before any story renders, so docsTheme
   cannot be a function of context.globals — there is no re-render hook that would
   let it follow the Theme or Brand toolbar. That is a hard limit of Storybook's
   theming API, not an omission here.

   So the values are CSS custom properties rather than hexes. Storybook hands each
   one to Emotion, which emits it into a rule as-is, so `var(--cream)` is resolved
   by the browser against whatever <html data-brand> and <html class="dark"> the
   decorator has set. The theme object stays static while the chrome it produces
   tracks both toolbars. This was measured, not assumed: theme values that
   Storybook pipes through a colour function instead of emitting verbatim cannot
   take a var() and are left as literals below.

   These replace a hardcoded retired identity: cream #f5f3f0 surfaces, a #e7e2dc
   border, #292524 text, and two #f59e0b ambers that survived the monochrome
   rename because nothing in the brand sweep looks inside a JS theme object. */
const docsTheme = create({
	/* base only fills in values not named below; it cannot follow the toolbar. */
	base: "light",
	/* --- These ten are emitted verbatim into Emotion rules, so a var() resolves
	   in the browser against whatever <html data-brand>/<html class="dark"> the
	   decorator set. This is what lets a module-scope theme track both toolbars. */
	appBg: "var(--cream)",
	appContentBg: "var(--cream)",
	appPreviewBg: "var(--cream)",
	textInverseColor: "var(--ink-inverse)",
	barBg: "var(--cream)",
	barTextColor: "var(--ink-2)",
	inputBg: "var(--cream)",
	inputBorder: "var(--wire)",
	inputTextColor: "var(--ink)",
	colorPrimary: "var(--amber)",
	/* --- These three CANNOT take a var(), and it is measured rather than assumed:
	   Storybook pipes each through polished's parseToRgb to derive shades, which
	   throws "Couldn't parse the color string" on a custom property and blanks the
	   whole docs page. Each was tested individually; the other ten render fine.
	   They are therefore neutral LITERALS -- they no longer carry the retired warm
	   identity (#e7e2dc border, #f59e0b secondary), but they cannot follow the
	   Theme or Brand toggle, and no amount of restructuring here would change that.
	   What the eye actually sees on these surfaces is corrected in storybook.css,
	   which can use tokens because it is real CSS. */
	appBorderColor: "#8a8a8f",
	textColor: "#3f3f46",
	colorSecondary: "#8a8a8f",
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
