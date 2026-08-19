import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as DS from "./index";

/**
 * Render every exported component and fail on any React console error/warning.
 * Catches unkeyed lists, controlled/uncontrolled switches, invalid DOM nesting
 * and bad prop types — none of which fail a normal assertion.
 */
const MINIMAL: Record<string, Record<string, unknown>> = {
	Avatar: { name: "A B" },
	Badge: { children: "b" },
	Chip: { children: "c" },
	Button: { children: "b" },
	IconButton: { label: "x", icon: null },
	Heading: { children: "h" },
	Text: { children: "t" },
	Kbd: { children: "K" },
	Eyebrow: { children: "e" },
	Link: { href: "#", children: "l" },
	Card: { children: "c" },
	StickyNote: { children: "s" },
	TextInput: { "aria-label": "f" },
	Textarea: { "aria-label": "f" },
	Checkbox: { label: "c" },
	Toggle: { label: "t" },
	Radio: { name: "g", value: "a", label: "A" },
	Select: { value: null, onChange: () => {}, options: [], ariaLabel: "s" },
	MultiSelect: { value: [], onChange: () => {}, options: [], ariaLabel: "m" },
	RangeSlider: { value: 1, onChange: () => {}, ariaLabel: "r" },
	NumberStepper: { value: 1, onChange: () => {} },
	FileInput: { onSelect: () => {} },
	ColorInput: { label: "c" },
	ColorPicker: {},
	StarRating: { value: 1, onChange: () => {}, label: "s" },
	ProgressBar: { value: 50 },
	Skeleton: {},
	Divider: {},
	Sparkline: { data: [1, 2, 3] },
	MiniBar: { data: [1, 2] },
	MiniDonut: { value: 1 },
	RollingNumber: { value: 1 },
	StatCard: { label: "l", value: "1" },
	StatusPill: { children: "s" },
	EmptyState: { title: "t" },
	Timeline: { events: [] },
	DotGrid: {},
	RelativeTime: { date: new Date(2020, 0, 1) },
};

describe("render smoke test", () => {
	const entries = Object.entries(DS as Record<string, unknown>).filter(
		([n, v]) =>
			/^[A-Z]/.test(n) &&
			(typeof v === "function" || (typeof v === "object" && v !== null && "render" in v)),
	);

	for (const [name, Comp] of entries) {
		const props = MINIMAL[name];
		if (!props) continue;
		it(`${name} renders without a React warning`, () => {
			const err = vi.spyOn(console, "error").mockImplementation(() => {});
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			// biome-ignore lint/suspicious/noExplicitAny: components are iterated generically
			const C = Comp as any;
			render(<C {...props} />);
			const msgs = [...err.mock.calls, ...warn.mock.calls].map((c) => String(c[0]));
			err.mockRestore();
			warn.mockRestore();
			expect(msgs, `${name}: ${msgs.join(" | ")}`).toHaveLength(0);
		});
	}
});

// ─── SSR reachability (F-15-1, F-15-6) ───────────────────────────────────────

const noop = () => {};

/**
 * Every overlay that mounts through `DSPortal` server-rendered to **0 B**.
 *
 * `DSPortal` returns null until a mount effect runs, so `react-dom/server`
 * produces nothing at all — measured at 0 B for Modal, ConfirmDialog,
 * TypeToConfirm and Sheet, twice, in Phase 0 and again here. No dialog in the
 * product existed for a no-JS reader or a crawler.
 *
 * `renderToStaticMarkup` is the measurement rather than a client render on
 * purpose: a client-side test proves nothing about server output. It is also
 * environment-independent here — `DSPortal`'s gate is a `useState`/`useEffect`
 * pair, not a `typeof document` check, so the byte counts are identical whether
 * or not a `document` exists. (Measured: identical in the node environment.)
 *
 * BOTH directions are asserted. The `> 0 B` half is the fix; the `0 B` half is
 * what proves `inline` is opt-in and the eight other consumers of `DSPortal` are
 * untouched.
 */
const PORTALED_OVERLAYS: { name: string; el: (inline: boolean) => React.ReactElement }[] = [
	{
		name: "Modal",
		el: (inline) => (
			<DS.Modal open onClose={noop} inline={inline} title="Re-authenticate">
				<p>SSR_BODY_MARKER</p>
			</DS.Modal>
		),
	},
	{
		name: "ConfirmDialog",
		el: (inline) => (
			<DS.ConfirmDialog
				open
				onClose={noop}
				onConfirm={noop}
				inline={inline}
				title="Delete?"
				body="SSR_BODY_MARKER"
			/>
		),
	},
	{
		name: "TypeToConfirm",
		el: (inline) => (
			<DS.TypeToConfirm
				open
				onClose={noop}
				onConfirm={noop}
				inline={inline}
				title="Delete?"
				body="SSR_BODY_MARKER"
			/>
		),
	},
	{
		name: "Sheet",
		el: (inline) => (
			<DS.Sheet open onClose={noop} inline={inline} title="Filters">
				<p>SSR_BODY_MARKER</p>
			</DS.Sheet>
		),
	},
];

describe("server-rendered overlays (F-15-1)", () => {
	for (const { name, el } of PORTALED_OVERLAYS) {
		it(`${name} server-renders 0 B by default and > 0 B with inline`, () => {
			const without = renderToStaticMarkup(el(false));
			const with_ = renderToStaticMarkup(el(true));
			expect(without, `${name} default must stay unrendered on the server`).toHaveLength(0);
			expect(with_.length, `${name} inline must produce bytes`).toBeGreaterThan(0);
			// Bytes alone could be an empty wrapper. The body content is what a
			// crawler or a no-JS reader actually needs to receive.
			expect(with_).toContain("SSR_BODY_MARKER");
		});
	}

	it("omitting inline is identical to inline={false}", () => {
		// The degenerate value must not be a third behaviour.
		expect(
			renderToStaticMarkup(
				<DS.Modal open onClose={noop} title="t">
					<p>x</p>
				</DS.Modal>,
			),
		).toBe(
			renderToStaticMarkup(
				<DS.Modal open onClose={noop} inline={false} title="t">
					<p>x</p>
				</DS.Modal>,
			),
		);
	});

	it("the non-portaled contrast pair renders on the server, unchanged", () => {
		// Phase 0's control: AlertBanner and FormErrorSummary DO server-render,
		// which is what makes 0 B a portal property rather than an overlay one. If
		// this ever reads 0 the harness is measuring nothing and every assertion
		// above is vacuous.
		expect(
			renderToStaticMarkup(<DS.AlertBanner open tone="warning" title="Heads up" />).length,
		).toBeGreaterThan(0);
		expect(
			renderToStaticMarkup(<DS.FormErrorSummary errors={[{ fieldId: "e", message: "Required" }]} />)
				.length,
		).toBeGreaterThan(0);
	});
});

describe("server-rendered Tabs panels (F-15-6)", () => {
	const tabs = [
		{ id: "a", label: "Alpha", content: <p>ALPHA_MARKER</p> },
		{ id: "b", label: "Beta", content: <p>BETA_MARKER</p> },
		{ id: "c", label: "Gamma", content: <p>GAMMA_MARKER</p> },
	];

	it("server-renders EVERY panel's children, not only the active panel's", () => {
		// Measured before the fix: the inactive `<div role="tabpanel" hidden>`
		// elements were present and empty, so in production no tab panel but the
		// first existed for a crawler.
		const html = renderToStaticMarkup(
			<DS.Tabs ariaLabel="T" value="a" onChange={noop} tabs={tabs} />,
		);
		expect(html).toContain("ALPHA_MARKER");
		expect(html).toContain("BETA_MARKER");
		expect(html).toContain("GAMMA_MARKER");
	});

	it("hides the inactive panels with the hidden attribute, not by omission", () => {
		// "Render everything" and "expose everything" are different things. The
		// WAI-ARIA tabs pattern requires inactive tabpanels be hidden, and `hidden`
		// removes them from both the accessibility tree and the tab order where
		// visibility/opacity would not.
		const html = renderToStaticMarkup(
			<DS.Tabs ariaLabel="T" value="b" onChange={noop} tabs={tabs} />,
		);
		const panels = [...html.matchAll(/<div role="tabpanel"[^>]*>/g)].map((m) => m[0]);
		expect(panels).toHaveLength(3);
		expect(panels.filter((p) => p.includes("hidden"))).toHaveLength(2);
		// Exactly one panel is exposed, and it is the active one.
		const exposed = panels.filter((p) => !p.includes("hidden"));
		expect(exposed).toHaveLength(1);
		expect(exposed[0]).toContain("-panel-b");
	});
});
