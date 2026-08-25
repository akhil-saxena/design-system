import { addons } from "@storybook/preview-api";
import type { Preview, StoryContext } from "@storybook/react-vite";
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

/* ─── THE CHROME APPLIER, AND WHY IT IS NOT JUST A LINE IN THE DECORATOR ─────

   `<html class="dark">` and `<html data-brand>` are ONE element shared by the
   whole page. The decorator, however, runs once PER STORY — and a docs page
   renders every story of a component at once. Seventy stories in this repo pin
   their own `globals: { theme: "dark" }`, so on e.g. inputs-button--docs the
   DarkMode block's decorator ran with a merged theme of "dark" and wrote the
   class onto the shared root. Whichever block rendered LAST decided the whole
   page, and the dark one usually did.

   That is the defect Akhil reported as "theme toggle light/dark doesn't work,
   always dark" on /docs/inputs-button--docs. Measured through the real toolbar,
   six trials out of six: Dark applied, Light did not. On foundation-divider--docs,
   which has no dark story, the same six transitions all worked — the axis that
   stuck was exactly the one a story-level override contradicted.

   Two things follow, and both are load-bearing:

   1. IN DOCS MODE THE PAGE'S CHROME IS THE TOOLBAR'S, NOT A STORY'S. The
      decorator therefore applies `context.userGlobals` (the toolbar selection)
      rather than `context.globals` (the toolbar selection merged with the one
      story's override). Every block on the page then writes the SAME value and
      the last-writer race becomes a no-op. In story mode the canvas holds
      exactly one story, so its merged globals ARE the page's and `context.globals`
      stays authoritative — which is what the ~70 dark stories and all 1,019
      recorded baselines depend on.

   2. A DOCS PAGE CAN RENDER ZERO STORIES, so the decorator cannot be the only
      writer. src/Overview.mdx renders <OverviewPage /> and no <Story> block at
      all: measured on the pre-fix tree, /iframe.html?id=overview--docs&globals=
      theme:dark;brand:monochrome painted <html> with NO class and NO data-brand,
      because nothing ever ran. Hence the `globalsUpdated` subscription below.

   BRAND AND MODE ARE SET TOGETHER, IN ONE PASS, BY EVERY CALLER. Splitting them
   paints a frame in the wrong brand — the flash D-34's no-flash module exists to
   remove — and would make every first-frame screenshot unreliable. That is why
   this is a single function both callers use rather than two lines each. */
type ChromeGlobals = { theme?: unknown; brand?: unknown };

function applyChrome(globals: ChromeGlobals) {
	const root = document.documentElement;
	root.classList.toggle("dark", globals.theme === "dark");
	if (globals.brand === "monochrome") root.dataset.brand = "monochrome";
	else root.removeAttribute("data-brand");
}

/* The toolbar's own selection, un-merged with any story-level override.
   `userGlobals` IS on the runtime context — it appears in Object.keys(context),
   verified in a browser — but Storybook 8.6 declares it only on
   GlobalsUpdatedPayload, never on StoryContext. The cast is isolated here rather
   than spelled at the call site so there is one place to delete when the type
   catches up. If a future Storybook drops the property the fallback restores the
   pre-fix behaviour, which is why it is not silent: the four docs rows in
   tests/visual/theme-toggle-authority.spec.ts fail the moment it is taken. */
const userGlobalsOf = (context: StoryContext): ChromeGlobals =>
	(context as StoryContext & { userGlobals?: ChromeGlobals }).userGlobals ?? context.globals;

/* ─── THE SUBSCRIPTION ───────────────────────────────────────────────────────

   `globalsUpdated` is ONE mechanism that covers both first paint and updates,
   which is why there is no second boot-time hook here. Measured on a real boot:
   the preview emits `setGlobals` at ~t+85ms and `globalsUpdated` at ~t+110ms,
   both BEFORE the first story renders, and again on every toolbar change. The
   payload's `globals` field is already the correct value for either mode — in
   story mode it is merged with the current story's override, and in docs mode
   `storyGlobals` is `{}` so it equals the toolbar's own selection. No view-mode
   branch is needed here, and adding one would be a second place for the rule to
   drift.

   `addons.ready()` rather than `addons.getChannel()`: preview annotations are
   imported before the preview entry calls `setChannel`, so `getChannel()` throws
   at module scope. `ready()` resolves on the microtask after it is set, ~85ms
   ahead of the first event.

   The decorator still applies the chrome on its own render. That is deliberate
   belt-and-braces, not duplication: it keeps first paint correct even if this
   promise were ever to settle late, and it cannot disagree with the subscription
   because both call the same applyChrome with the same rule.

   src/OverviewPage.tsx subscribes to the same event for its masthead toggle and
   writes the same class onto the same element. The two agree by construction now
   that both read `theme` alone; that page is the reason this file cannot simply
   own the element unilaterally. */
addons.ready().then((channel) => {
	channel.on("globalsUpdated", ({ globals }: { globals: ChromeGlobals }) => applyChrome(globals));
});

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
		/* FLAGGED, DELIBERATELY NOT CHANGED. #f5f3f0 and #1c1917 are the RETIRED
		   identity's colours; they survived the monochrome rename because nothing in
		   a brand sweep looks inside an addon parameter. 12b723c left this alone for
		   a reason worth re-reading before anyone "finishes the job": pointing these
		   at var(--cream) repaints the STORY CANVAS, whose #f5f3f0 body is recorded
		   in all 1,019 visual baselines. A one-line change with a thousand-file blast
		   radius. What HAS changed is the stake: the decorator no longer reads this
		   parameter, so the wrong hexes are now cosmetic rather than load-bearing --
		   a smaller problem than it was, not a fixed one. */
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
			/* THE THEME TOOLBAR IS AUTHORITATIVE, and nothing else votes.

			   This line used to read:

			     context.globals.theme === "dark" ||
			       context.globals.backgrounds?.value === DARK_BG

			   The convenience was "pick a dark background, get a dark theme". The
			   cost was that the Theme control could only ever express ONE of its two
			   states. `backgrounds` is a STICKY global -- the manager persists the
			   toolbar selection and restores it -- so once it holds DARK_BG that
			   second clause is permanently true and every subsequent "Light" is
			   swallowed. Reproduced in a real browser rather than reasoned about:
			   with backgrounds pinned to #1c1917, driving theme dark -> light ->
			   dark -> light left `<html class="dark">` on all four reads.

			   NOTHING DEPENDED ON THE OR. Checked before removing it, not after:
			   every story that wants dark sets `globals: { theme: "dark" }` (~70 of
			   them since 01-19.1) and src/story-mode.test.ts FAILS the build if any
			   story selects dark by pinning a backgrounds hex instead; every
			   Playwright spec drives the axis with `?globals=theme:...`; the a11y
			   runner sets only `globals=brand:...`. `parameters.backgrounds.default`
			   does not feed it either -- measured on a fresh boot,
			   `globals.backgrounds` is null until the toolbar is touched, so the five
			   stories that declare their own `backgrounds.values` never reached this
			   branch. There was no one-way version left worth keeping: `theme` is
			   always defined by initialGlobals, so "an explicit theme wins" reduces
			   to "theme wins".

			   Guarded by tests/visual/theme-toggle-authority.spec.ts, which drives
			   the exact stuck state through the toolbar's own channel.

			   DARK_BG survives above because parameters.backgrounds still names it. */
			const isDark = context.globals.theme === "dark";
			const isMonochrome = context.globals.brand === "monochrome";
			/* THE PAGE'S chrome, which is not always THIS STORY's chrome. On a docs
			   page the toolbar owns <html>, because every story of the component
			   renders onto it at once and a story-level `globals: { theme: "dark" }`
			   would otherwise decide the whole page by winning a render-order race.
			   In story mode the canvas holds exactly one story, so its merged globals
			   ARE the page's. See the applyChrome header for the measurement. */
			const pageGlobals = context.viewMode === "docs" ? userGlobalsOf(context) : context.globals;
			const pageIsDark = pageGlobals.theme === "dark";
			// Brand and mode are applied in ONE pass, here and in the subscription
			// above, through the same function. Splitting them across two decorators
			// paints a frame in the wrong brand, which is the flash D-34's no-flash
			// module exists to remove — and it would make every first-frame
			// screenshot unreliable.
			applyChrome(pageGlobals);
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
						// `pageIsDark` rather than a bare `isMonochrome`, and only that
						// changed: in story mode <html> is dark whenever this branch runs,
						// so the two are identical and every recorded baseline is untouched.
						// In DOCS mode a dark story can now sit on a light page — <html>
						// follows the toolbar — and without the class that block would
						// render light under monochrome only, since monochrome is the one
						// brand for which this wrapper deliberately drops it.
						className={isMonochrome && pageIsDark ? undefined : "dark"}
						// Read from the cascade, not from the DARK_BG constant, so the
						// backdrop tracks whichever brand is mounted. DARK_BG is now used by
						// the backgrounds parameter alone -- Storybook's own chrome, and
						// brand-independent -- and no longer decides the mode.
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
