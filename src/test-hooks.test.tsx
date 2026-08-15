import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
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
];

describe("test hooks", () => {
	for (const [name, make] of cases) {
		it(`${name} forwards an arbitrary data-* hook to the DOM`, () => {
			const { unmount } = render(make());
			expect(screen.queryByTestId("hook"), `${name} dropped data-testid`).not.toBeNull();
			unmount();
		});
	}

	it("ColorInput exposes its swatch, which has no role or name of its own", () => {
		// The swatch is aria-hidden — the hex text beside it carries the value — so
		// a hook is the only way for a consumer to assert on the rendered colour.
		render(<DS.ColorInput data-testid="brand" label="Brand" defaultValue="#ff0000" />);
		expect(screen.getByTestId("brand-swatch").style.background).toContain("rgb(255, 0, 0)");
	});
});
