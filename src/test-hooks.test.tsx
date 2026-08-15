import { render, screen } from "@testing-library/react";
import { type ReactElement, createRef } from "react";
import { describe, expect, it } from "vitest";
import * as DS from "./index";

/**
 * Test hooks.
 *
 * The library deliberately does **not** hardcode `data-testid` attributes into
 * components. Two reasons:
 *
 *  1. Role + accessible name is the better query — it tests what a user and a
 *     screen reader actually perceive, and it fails when the component becomes
 *     unreachable. Several components could not be queried that way until
 *     recently (Select and MultiSelect had no accessible name at all; Avatar's
 *     name never reached the accessibility tree), which is fixed.
 *  2. Every component spreads its remaining props onto the root element, so a
 *     consumer can attach whatever hook their harness expects — `data-testid`,
 *     `data-cy`, `data-qa` — without the library picking a convention for them.
 *
 * These tests pin that passthrough as a contract, because it is the kind of
 * thing a refactor silently breaks: a component that stops spreading `...rest`
 * still renders correctly and only fails in the consumer's test suite.
 */

// Factories rather than elements: nothing is constructed until it is rendered,
// and an array of bare JSX reads to the linter as an unkeyed list.
const cases: Array<[string, () => ReactElement]> = [
	["Button", () => <DS.Button data-testid="hook">x</DS.Button>],
	["IconButton", () => <DS.IconButton data-testid="hook" label="Close" icon={<span />} />],
	["TextInput", () => <DS.TextInput data-testid="hook" aria-label="Field" />],
	["Textarea", () => <DS.Textarea data-testid="hook" aria-label="Field" />],
	["Checkbox", () => <DS.Checkbox data-testid="hook" label="Agree" />],
	["Radio", () => <DS.Radio data-testid="hook" name="g" value="a" label="A" />],
	["Toggle", () => <DS.Toggle data-testid="hook" label="On" />],
	["Badge", () => <DS.Badge data-testid="hook">x</DS.Badge>],
	["Chip", () => <DS.Chip data-testid="hook">x</DS.Chip>],
	["Card", () => <DS.Card data-testid="hook">x</DS.Card>],
	["Avatar", () => <DS.Avatar data-testid="hook" name="A B" />],
	["Kbd", () => <DS.Kbd data-testid="hook">K</DS.Kbd>],
	["Heading", () => <DS.Heading data-testid="hook">H</DS.Heading>],
	["Text", () => <DS.Text data-testid="hook">t</DS.Text>],
	["Divider", () => <DS.Divider data-testid="hook" />],
	["ColorInput", () => <DS.ColorInput data-testid="hook" label="Brand" />],
	// The three charts accepted no className, style, ref or data-* at all, so a
	// consumer could neither hook nor measure them — while RollingNumber and
	// StatCard, the same category, always could.
	["MiniBar", () => <DS.MiniBar data-testid="hook" data={[1, 2, 3]} />],
	["MiniDonut", () => <DS.MiniDonut data-testid="hook" value={40} />],
	["Sparkline", () => <DS.Sparkline data-testid="hook" data={[1, 2, 3]} />],
	["RollingNumber", () => <DS.RollingNumber data-testid="hook" value={42} />],
	["StatCard", () => <DS.StatCard data-testid="hook" label="Revenue" value="1" />],
];

describe("test hooks", () => {
	for (const [name, make] of cases) {
		it(`${name} forwards an arbitrary data-* hook to the DOM`, () => {
			const { unmount } = render(make());
			expect(screen.queryByTestId("hook"), `${name} dropped data-testid`).not.toBeNull();
			unmount();
		});
	}

	it("charts expose their root node via ref, for measuring and observing", () => {
		const bar = createRef<HTMLDivElement>();
		const donut = createRef<SVGSVGElement>();
		const spark = createRef<SVGSVGElement>();
		render(
			<>
				<DS.MiniBar data={[1, 2]} ref={bar} />
				<DS.MiniDonut value={40} ref={donut} />
				<DS.Sparkline data={[1, 2]} ref={spark} />
			</>,
		);
		expect(bar.current).toBeInstanceOf(HTMLElement);
		expect(donut.current?.tagName).toBe("svg");
		expect(spark.current?.tagName).toBe("svg");
	});

	it("ColorInput exposes its swatch, which has no role or name of its own", () => {
		// The swatch is aria-hidden — the hex text beside it carries the value — so
		// a hook is the only way for a consumer to assert on the rendered colour.
		render(<DS.ColorInput data-testid="brand" label="Brand" defaultValue="#ff0000" />);
		expect(screen.getByTestId("brand-swatch").style.background).toContain("rgb(255, 0, 0)");
	});
});
