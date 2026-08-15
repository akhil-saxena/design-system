import { render } from "@testing-library/react";
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
