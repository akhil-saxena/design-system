import { addons } from "@storybook/preview-api";
import { useEffect, useRef, useState } from "react";

const DARK_BG = "#1c1917";

// ─── Theme (wired to Storybook's `theme` global → `.dark` class on <html>) ─────

type GlobalsPayload = { globals: Record<string, unknown> };

function isDarkGlobals(globals: Record<string, unknown>) {
	return (
		globals.theme === "dark" ||
		(globals.backgrounds as { value?: string } | undefined)?.value === DARK_BG
	);
}

/**
 * Reflects the active Storybook theme and lets the masthead toggle drive it.
 * Emitting `updateGlobals` keeps the toolbar control in sync; toggling the
 * `.dark` class directly makes it work even when the page is opened standalone
 * (iframe.html) where the manager channel round-trip never completes.
 */
function useTheme(): [boolean, (dark: boolean) => void] {
	const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
	useEffect(() => {
		const channel = addons.getChannel();
		const onGlobalsUpdated = ({ globals }: GlobalsPayload) => {
			const dark = isDarkGlobals(globals);
			document.documentElement.classList.toggle("dark", dark);
			setIsDark(dark);
		};
		channel.on("globalsUpdated", onGlobalsUpdated);
		return () => channel.off("globalsUpdated", onGlobalsUpdated);
	}, []);
	const setTheme = (dark: boolean) => {
		document.documentElement.classList.toggle("dark", dark);
		setIsDark(dark);
		try {
			addons.getChannel().emit("updateGlobals", {
				globals: { theme: dark ? "dark" : "light" },
			});
		} catch {
			// standalone (no manager channel) — the class toggle above is enough
		}
	};
	return [isDark, setTheme];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const categories = [
	{
		name: "Inputs",
		id: "inputs",
		components: [
			"Autocomplete",
			"Badge",
			"Button",
			"Checkbox",
			"Chip",
			"ColorPicker",
			"DatePicker",
			"DateRangePicker",
			"FileInput",
			"InlineAddRow",
			"InlineEditField",
			"Kbd",
			"MultiSelect",
			"NumberStepper",
			"OAuthButton",
			"Radio",
			"RangeSlider",
			"Select",
			"StarRating",
			"StatusPill",
			"TextInput",
			"Textarea",
			"Toggle",
		],
	},
	{
		name: "Overlays",
		id: "overlays",
		components: [
			"ActionSheet",
			"BottomSheet",
			"Card",
			"CommandPalette",
			"ConfirmDialog",
			"HoverCard",
			"Lightbox",
			"Modal",
			"Popover",
			"Sheet",
			"StickyNote",
			"Tooltip",
		],
	},
	{
		name: "Data Display",
		id: "data-display",
		components: [
			"Accordion",
			"Breadcrumbs",
			"Calendar",
			"Carousel",
			"DataGrid",
			"InfiniteList",
			"Pagination",
			"SegmentedControl",
			"Table",
			"Tabs",
			"Timeline",
		],
	},
	{
		name: "Feedback",
		id: "feedback",
		components: [
			"AlertBanner",
			"EmptyState",
			"InlineConfirm",
			"ProgressBar",
			"Skeleton",
			"Snackbar",
			"Toast",
		],
	},
	{
		name: "Interaction",
		id: "interaction",
		components: [
			"CopyToClipboard",
			"InlineEdit",
			"RelativeTime",
			"RichText",
			"SearchAndFilters",
			"Sortable",
			"SplitButton",
		],
	},
	{ name: "Layout", id: "layout", components: ["AppBar", "AppShell", "Footer", "SplitHero"] },
	{
		name: "Display",
		id: "display",
		components: ["Avatar", "MiniBar", "MiniDonut", "RollingNumber", "Sparkline", "StatCard"],
	},
	{ name: "Patterns", id: "patterns", components: ["Coachmark", "FormValidation", "Wizard"] },
	{
		name: "Foundation",
		id: "foundation",
		components: ["Divider", "DotGrid", "Eyebrow", "Heading", "Link", "Text"],
	},
];

const componentStoryId = (categoryId: string, name: string) =>
	`${categoryId}-${name.toLowerCase().replaceAll(" ", "")}`;

const TOTAL = categories.reduce((s, c) => s + c.components.length, 0);

const PALETTE = [
	{
		name: "Neutrals",
		note: "Paper ramp and ink ramp · everything calm sits here",
		chips: [
			{ token: "cream", hex: "#fcfcfc", role: "Page" },
			{ token: "cream-2", hex: "#f4f4f4", role: "Raised" },
			{ token: "cream-3", hex: "#f0f0f0", role: "Sunken" },
			{ token: "paper-warm", hex: "#f4f4f4", role: "Warm" },
			{ token: "ink", hex: "#1c1c1a", role: "Text" },
			{ token: "ink-2", hex: "#57534e", role: "Muted" },
			{ token: "ink-3", hex: "#6b6560", role: "Subtle" },
		],
		aaa: false,
	},
	{
		name: "Accent",
		note: "Amber · used only when something needs attention",
		chips: [
			{ token: "amber", hex: "#f59e0b", role: "Attention" },
			{ token: "amber-d", hex: "#b45309", role: "Hover" },
			{ token: "amber-ink", hex: "#92400e", role: "On-light" },
		],
		aaa: false,
	},
	{
		name: "Status",
		note: "Success and error · reserved, never decorative",
		chips: [
			{ token: "green", hex: "#2f7a52", role: "Success" },
			{ token: "red", hex: "#b8463f", role: "Error" },
		],
		aaa: true,
	},
];

const STEPS = [
	{
		label: "Install the package",
		code: (
			<>
				<span className="k">npm</span> install @akhil-saxena/design-system
			</>
		),
	},
	{
		label: "Import the stylesheets",
		code: (
			<>
				<span className="k">import</span>{" "}
				<span className="s">'@akhil-saxena/design-system/tokens.css'</span>
				{";"}
				{"\n"}
				<span className="k">import</span>{" "}
				<span className="s">'@akhil-saxena/design-system/primitives.css'</span>
				{";"}
			</>
		),
	},
	{
		label: "Use a component",
		code: (
			<>
				<span className="k">import</span> {"{ "}
				<span className="p">Button</span>
				{" } "}
				<span className="k">from</span> <span className="s">'@akhil-saxena/design-system'</span>
				{";"}
			</>
		),
	},
];

// ─── Scoped styles ──────────────────────────────────────────────────────────────
// Everything is scoped under `.dsov` so it never leaks into other stories. Text
// uses div/span (never h1/p/pre/code) on purpose: storybook.css forces
// `color: … !important` on those tags inside docs, which would flatten the ink
// ramp. Dark mode keys off the `.dark` class the DS already toggles on <html>.

const CSS = `
.dsov{
  --ov-display:'Archivo',system-ui,sans-serif;
  --ov-body:'Inter',system-ui,sans-serif;
  --ov-mono:'JetBrains Mono',ui-monospace,'SF Mono',monospace;
  --ov-paper:#fcfcfc;--ov-paper-2:#f4f4f4;--ov-paper-3:#efece7;--ov-card:#ffffff;
  --ov-ink:#1c1c1a;--ov-ink-2:#57534e;--ov-ink-3:#857f78;
  --ov-rule:#e7e2dc;--ov-rule-2:#efeae3;
  --ov-amber:#f59e0b;--ov-amber-d:#b45309;--ov-amber-ink:#92400e;
  --ov-amber-soft:rgba(245,158,11,.12);--ov-amber-line:rgba(180,83,9,.30);
  --ov-green:#2f7a52;--ov-red:#b8463f;
  --ov-dot:rgba(28,28,26,.07);--ov-code-bg:#f4f1ec;
  --ov-shadow-sm:0 1px 2px rgba(28,28,26,.05);
  --ov-shadow:0 1px 2px rgba(28,28,26,.04),0 12px 32px -16px rgba(28,28,26,.14);
  --ov-ease:cubic-bezier(.22,.61,.36,1);
  background:var(--ov-paper);color:var(--ov-ink);font-family:var(--ov-body);line-height:1.5;
  transition:background .28s var(--ov-ease),color .28s var(--ov-ease);
}
.dark .dsov{
  --ov-paper:#1c1917;--ov-paper-2:#232020;--ov-paper-3:#191614;--ov-card:#211e1c;
  --ov-ink:#f3f0ea;--ov-ink-2:#b8b1a6;--ov-ink-3:#8c857b;
  --ov-rule:#33302c;--ov-rule-2:#262320;
  --ov-amber:#fbbf24;--ov-amber-d:#fbbf24;--ov-amber-ink:#fcd34d;
  --ov-amber-soft:rgba(245,158,11,.15);--ov-amber-line:rgba(251,191,36,.28);
  --ov-green:#54a87c;--ov-red:#df7a70;
  --ov-dot:rgba(255,255,255,.055);--ov-code-bg:#15120f;
  --ov-shadow-sm:0 1px 2px rgba(0,0,0,.3);
  --ov-shadow:0 1px 2px rgba(0,0,0,.3),0 14px 34px -16px rgba(0,0,0,.6);
}
.dsov *,.dsov *::before,.dsov *::after{box-sizing:border-box;}
.dsov a{color:inherit;text-decoration:none;}
/* Full-bleed: free the Overview from Storybook's centered ~1000px docs column.
   Scoped to this page — this <style> only mounts while OverviewPage renders. */
.sbdocs.sbdocs-content{max-width:none !important;padding:0 !important;}
.sbdocs.sbdocs-wrapper{padding:0 !important;}
.dsov .wrap{max-width:none;margin:0;padding:0 clamp(20px,5vw,72px);}

/* masthead */
.dsov .mast{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;
  gap:18px;padding:14px clamp(20px,5vw,72px);border-bottom:1px solid var(--ov-rule);
  background:color-mix(in srgb,var(--ov-paper) 90%,transparent);backdrop-filter:blur(10px) saturate(1.1);}
.dsov .ident{display:flex;align-items:center;gap:12px;min-width:0;}
.dsov .mark{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--ov-ink);
  display:flex;align-items:center;justify-content:center;flex:none;}
.dsov .mark i{width:7px;height:7px;border-radius:2px;background:var(--ov-amber);display:block;}
.dsov .wm{font-family:var(--ov-display);font-weight:800;font-size:14.5px;letter-spacing:-.02em;color:var(--ov-ink);white-space:nowrap;}
.dsov .wm .mut{color:var(--ov-ink-3);font-weight:600;}
.dsov .mast-right{display:flex;align-items:center;gap:18px;}
.dsov .edition{font-family:var(--ov-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ov-ink-3);white-space:nowrap;}
.dsov .crumb{font-family:var(--ov-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ov-ink-3);padding-left:14px;border-left:1px solid var(--ov-rule);white-space:nowrap;}
.dsov .toggle{display:inline-flex;padding:3px;border-radius:999px;background:var(--ov-paper-2);border:1px solid var(--ov-rule);}
.dsov .toggle button{appearance:none;border:0;cursor:pointer;font-family:var(--ov-mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:transparent;
  color:var(--ov-ink-3);display:inline-flex;align-items:center;gap:6px;transition:all .18s var(--ov-ease);}
.dsov .toggle button[aria-pressed="true"]{background:var(--ov-card);color:var(--ov-ink);box-shadow:var(--ov-shadow-sm);}
.dsov .toggle svg{width:13px;height:13px;}

/* section head */
.dsov .shead{display:flex;align-items:center;gap:16px;margin-bottom:clamp(26px,3vw,38px);}
.dsov .shead .ix{font-family:var(--ov-mono);font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ov-amber-d);white-space:nowrap;}
.dsov .shead .tt{font-family:var(--ov-mono);font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ov-ink);white-space:nowrap;}
.dsov .shead .ln{flex:1;height:0;border-top:1px dotted var(--ov-rule);}
.dsov .shead .meta{font-family:var(--ov-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ov-ink-3);white-space:nowrap;}

/* cover */
.dsov .cover{position:relative;padding:clamp(60px,9vw,120px) 0 clamp(40px,5vw,64px);overflow:hidden;}
.dsov .cover::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background-image:radial-gradient(var(--ov-dot) 1.2px,transparent 1.2px);background-size:24px 24px;
  -webkit-mask-image:linear-gradient(180deg,#000,#000 38%,transparent 90%);
  mask-image:linear-gradient(180deg,#000,#000 38%,transparent 90%);}
.dsov .cover > *{position:relative;z-index:1;}
.dsov .kick{font-family:var(--ov-mono);font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--ov-amber-d);margin-bottom:clamp(22px,3.4vw,34px);}
.dsov .h1{font-family:var(--ov-display);font-weight:900;letter-spacing:-.045em;line-height:.95;
  font-size:clamp(40px,6.6vw,84px);color:var(--ov-ink);max-width:16ch;text-wrap:balance;}
.dsov .sub{font-size:clamp(16px,1.7vw,20px);line-height:1.62;color:var(--ov-ink-2);max-width:52ch;margin-top:clamp(24px,3vw,36px);text-wrap:pretty;}
.dsov .ledger{display:flex;flex-wrap:wrap;align-items:baseline;margin-top:clamp(36px,4.6vw,58px);border-top:1px solid var(--ov-rule);padding-top:clamp(22px,2.6vw,28px);}
.dsov .led{display:flex;align-items:baseline;gap:11px;padding:2px 30px;border-right:1px solid var(--ov-rule);}
.dsov .led:first-child{padding-left:0;}
.dsov .led:last-child{border-right:0;}
.dsov .led .n{font-family:var(--ov-display);font-weight:800;letter-spacing:-.03em;line-height:1;font-size:clamp(26px,3vw,36px);color:var(--ov-ink);font-variant-numeric:tabular-nums;}
.dsov .led .l{font-family:var(--ov-mono);font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ov-ink-3);}

/* blocks */
.dsov .block{padding:clamp(50px,7vw,86px) 0;border-top:1px solid var(--ov-rule);}

/* setup */
.dsov .steps{display:grid;gap:16px;max-width:880px;}
.dsov .step{display:grid;grid-template-columns:32px 1fr;gap:18px;align-items:start;}
.dsov .step-mark{width:32px;height:32px;border-radius:999px;border:1px solid var(--ov-amber-line);
  color:var(--ov-amber-d);background:var(--ov-amber-soft);font-family:var(--ov-mono);font-size:12.5px;font-weight:700;
  display:flex;align-items:center;justify-content:center;}
.dsov .step-label{font-family:var(--ov-mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ov-ink-3);padding-top:7px;margin-bottom:10px;}
.dsov .code{font-family:var(--ov-mono);font-size:clamp(12.5px,1.4vw,14px);line-height:1.7;background:var(--ov-code-bg);
  border:1px solid var(--ov-rule);border-radius:10px;padding:13px 17px;color:var(--ov-ink);overflow-x:auto;white-space:pre;}
.dsov .code .k{color:var(--ov-amber-d);font-weight:700;}
.dsov .code .s{color:var(--ov-ink-3);}
.dsov .code .p{color:var(--ov-ink-2);}

/* contents */
.dsov .chapter{display:grid;grid-template-columns:236px 1fr;gap:clamp(28px,4vw,64px);
  padding:clamp(34px,4.4vw,52px) 0;border-top:1px dotted var(--ov-rule);align-items:start;}
.dsov .chapter:first-of-type{border-top:0;padding-top:6px;}
.dsov .ch-open{position:sticky;top:88px;}
.dsov .ch-num{font-family:var(--ov-display);font-weight:800;letter-spacing:-.04em;line-height:.82;font-size:clamp(48px,5.6vw,76px);color:var(--ov-ink-3);font-variant-numeric:tabular-nums;}
.dsov .ch-name{display:flex;align-items:center;gap:9px;font-family:var(--ov-display);font-weight:800;letter-spacing:-.02em;font-size:clamp(20px,2.2vw,27px);color:var(--ov-ink);margin-top:16px;line-height:1.05;}
.dsov .ch-name i{width:7px;height:7px;border-radius:2px;background:var(--ov-amber);flex:none;}
.dsov .ch-count{font-family:var(--ov-mono);font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ov-ink-3);margin-top:11px;}
.dsov .entries{display:grid;grid-template-columns:repeat(auto-fill,minmax(156px,1fr));gap:0 clamp(20px,2.6vw,40px);margin-top:6px;}
.dsov .entry{display:flex;align-items:baseline;gap:8px;padding:11px 1px;border-bottom:1px dotted var(--ov-rule);
  font-family:var(--ov-mono);font-size:13px;color:var(--ov-ink-2);transition:color .15s var(--ov-ease),border-color .15s var(--ov-ease);}
.dsov .entry .nm{transition:transform .15s var(--ov-ease);}
.dsov .entry .ar{margin-left:auto;color:var(--ov-amber-d);opacity:0;transform:translateX(-5px);font-weight:700;transition:opacity .15s var(--ov-ease),transform .15s var(--ov-ease);}
.dsov .entry:hover{color:var(--ov-ink);border-bottom-color:var(--ov-amber-line);}
.dsov .entry:hover .nm{transform:translateX(2px);}
.dsov .entry:hover .ar{opacity:1;transform:none;}

/* palette */
.dsov .pgroup{margin-bottom:clamp(30px,3.6vw,44px);}
.dsov .pgroup:last-child{margin-bottom:0;}
.dsov .pgroup-head{display:flex;align-items:baseline;gap:12px;margin-bottom:16px;flex-wrap:wrap;}
.dsov .pgroup-name{display:flex;align-items:center;gap:9px;font-family:var(--ov-display);font-weight:800;letter-spacing:-.02em;font-size:clamp(18px,2vw,23px);color:var(--ov-ink);}
.dsov .pgroup-name i{width:7px;height:7px;border-radius:2px;background:var(--ov-amber);flex:none;}
.dsov .pgroup-note{font-family:var(--ov-mono);font-size:10.5px;letter-spacing:.04em;color:var(--ov-ink-3);}
.dsov .plate{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:14px;}
.dsov .chipcard{border:1px solid var(--ov-rule);border-radius:13px;overflow:hidden;background:var(--ov-card);transition:transform .16s var(--ov-ease),box-shadow .16s var(--ov-ease);}
.dsov .chipcard:hover{transform:translateY(-3px);box-shadow:var(--ov-shadow);}
.dsov .chipcard .sw{height:92px;border-bottom:1px solid var(--ov-rule);}
.dsov .chipcard .info{padding:12px 14px 14px;}
.dsov .chipcard .cn{font-family:var(--ov-mono);font-size:12.5px;font-weight:700;color:var(--ov-ink);}
.dsov .chipcard .row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}
.dsov .chipcard .hex{font-family:var(--ov-mono);font-size:11px;color:var(--ov-ink-3);text-transform:uppercase;}
.dsov .chipcard .role{font-family:var(--ov-mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ov-ink-2);padding:3px 8px;border-radius:999px;background:var(--ov-paper-2);border:1px solid var(--ov-rule);}
.dsov .aaa{display:inline-flex;align-items:center;gap:9px;margin-top:18px;font-family:var(--ov-mono);font-size:11px;color:var(--ov-ink-2);padding:9px 15px;border-radius:999px;border:1px solid var(--ov-rule);background:var(--ov-paper-2);}
.dsov .aaa b{color:var(--ov-green);font-weight:700;letter-spacing:.06em;}

/* colophon */
.dsov .colophon{border-top:1px solid var(--ov-rule);margin-top:clamp(40px,6vw,72px);padding:28px 0 60px;display:flex;flex-wrap:wrap;gap:14px 40px;justify-content:space-between;align-items:baseline;}
.dsov .colophon .set{font-family:var(--ov-body);font-size:13px;color:var(--ov-ink-2);max-width:46ch;line-height:1.6;}
.dsov .colophon .set b{color:var(--ov-ink);font-weight:600;}
.dsov .colophon .mono{font-family:var(--ov-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ov-ink-3);}

/* reveal */
.dsov-js .reveal{opacity:0;transform:translateY(14px);transition:opacity .6s var(--ov-ease),transform .6s var(--ov-ease);}
.dsov-js .reveal.in-view{opacity:1;transform:none;}

@media (max-width:900px){
  .dsov .chapter{grid-template-columns:1fr;gap:18px;}
  .dsov .ch-open{position:static;display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;}
  .dsov .ch-num{font-size:44px;}
  .dsov .ch-name{margin-top:0;}
  .dsov .ch-count{margin-top:0;align-self:center;}
}
@media (max-width:560px){
  .dsov .edition,.dsov .crumb,.dsov .wm .mut{display:none;}
  .dsov .led{padding:2px 16px;}
  .dsov .led .n{font-size:26px;}
  .dsov .step{grid-template-columns:28px 1fr;gap:13px;}
  .dsov .step-mark{width:28px;height:28px;}
  .dsov .toggle button{padding:6px 10px;}
}
@media (prefers-reduced-motion:reduce){
  .dsov-js .reveal{opacity:1;transform:none;transition:none;}
  .dsov,.dsov *{transition:none !important;}
}
`;

// ─── Icons ──────────────────────────────────────────────────────────────────────

function SunIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
		</svg>
	);
}

// ─── OverviewPage ─────────────────────────────────────────────────────────────

export function OverviewPage() {
	const [isDark, setTheme] = useTheme();
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		root.classList.add("dsov-js");
		const reveals = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
		if (!("IntersectionObserver" in window)) {
			for (const el of reveals) el.classList.add("in-view");
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.classList.add("in-view");
						io.unobserve(e.target);
					}
				}
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
		);
		for (const el of reveals) io.observe(el);
		const fallback = window.setTimeout(() => {
			for (const el of reveals) el.classList.add("in-view");
		}, 1200);
		return () => {
			io.disconnect();
			window.clearTimeout(fallback);
		};
	}, []);

	return (
		<div className="dsov" ref={rootRef}>
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static stylesheet for this docs-only page */}
			<style dangerouslySetInnerHTML={{ __html: CSS }} />

			{/* Masthead */}
			<header className="mast">
				<div className="ident">
					<span className="mark">
						<i />
					</span>
					<span className="wm">
						<span className="mut">@akhil-saxena/</span>design-system
					</span>
					<span className="crumb">Overview</span>
				</div>
				<div className="mast-right">
					<span className="edition">v1.9.1</span>
					<div className="toggle" role="radiogroup" aria-label="Color theme">
						<button type="button" aria-pressed={!isDark} onClick={() => setTheme(false)}>
							<SunIcon />
							Light
						</button>
						<button type="button" aria-pressed={isDark} onClick={() => setTheme(true)}>
							<MoonIcon />
							Dark
						</button>
					</div>
				</div>
			</header>

			<main className="wrap">
				{/* Cover */}
				<section className="cover reveal">
					<div className="kick">Component library · React</div>
					<div className="h1">Components for calm interfaces.</div>
					<div className="sub">
						A complete library of React primitives, patterns, and tokens. Opinionated where it
						matters, flexible where it counts.
					</div>
					<div className="ledger">
						<div className="led">
							<span className="n">{TOTAL}</span>
							<span className="l">Components</span>
						</div>
						<div className="led">
							<span className="n">{categories.length}</span>
							<span className="l">Chapters</span>
						</div>
						<div className="led">
							<span className="n">3</span>
							<span className="l">Patterns</span>
						</div>
						<div className="led">
							<span className="n">AAA</span>
							<span className="l">Contrast</span>
						</div>
					</div>
				</section>

				{/* Setup */}
				<section className="block reveal">
					<div className="shead">
						<span className="ix">01 /</span>
						<span className="tt">Setup</span>
						<span className="ln" />
						<span className="meta">three steps</span>
					</div>
					<div className="steps">
						{STEPS.map((step, i) => (
							<div className="step" key={step.label}>
								<div className="step-mark">{String(i + 1).padStart(2, "0")}</div>
								<div className="step-body">
									<div className="step-label">{step.label}</div>
									<div className="code">{step.code}</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Contents */}
				<section className="block reveal">
					<div className="shead">
						<span className="ix">02 /</span>
						<span className="tt">Contents</span>
						<span className="ln" />
						<span className="meta">nine chapters · seventy-nine entries</span>
					</div>
					{categories.map(({ name, id, components }, i) => (
						<div className="chapter" key={id}>
							<div className="ch-open">
								<div className="ch-num">{String(i + 1).padStart(2, "0")}</div>
								<div className="ch-name">
									<i />
									{name}
								</div>
								<div className="ch-count">{components.length} components</div>
							</div>
							<div className="entries">
								{components.map((label) => (
									<a
										className="entry"
										key={label}
										href={`/?path=/docs/${componentStoryId(id, label)}--docs`}
										target="_parent"
									>
										<span className="nm">{label}</span>
										<span className="ar">↗</span>
									</a>
								))}
							</div>
						</div>
					))}
				</section>

				{/* Palette */}
				<section className="block reveal">
					<div className="shead">
						<span className="ix">03 /</span>
						<span className="tt">Palette</span>
						<span className="ln" />
						<span className="meta">twelve tokens · three roles</span>
					</div>
					{PALETTE.map((group) => (
						<div className="pgroup" key={group.name}>
							<div className="pgroup-head">
								<span className="pgroup-name">
									<i />
									{group.name}
								</span>
								<span className="pgroup-note">{group.note}</span>
							</div>
							<div className="plate">
								{group.chips.map((chip) => (
									<div className="chipcard" key={chip.token}>
										<div className="sw" style={{ background: chip.hex }} />
										<div className="info">
											<div className="cn">{chip.token}</div>
											<div className="row">
												<span className="hex">{chip.hex}</span>
												<span className="role">{chip.role}</span>
											</div>
										</div>
									</div>
								))}
							</div>
							{group.aaa && (
								<div className="aaa">
									<b>AAA</b> Status colors are tuned to clear 7:1 contrast against both paper and
									ink.
								</div>
							)}
						</div>
					))}
				</section>

				{/* Colophon */}
				<footer className="colophon">
					<div className="set">
						Set in <b>Archivo</b>, <b>Inter</b> and <b>JetBrains&nbsp;Mono</b>. Calm by default,
						editorial type, considered motion. Tuned for AAA contrast in light and dark.
					</div>
					<div className="mono">@akhil-saxena/design-system · v1.9.1 · 2026</div>
				</footer>
			</main>
		</div>
	);
}
