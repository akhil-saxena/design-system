import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Card, type CardProps } from ".";
describe("Card", () => {
	it("renders default variant 'glass' on the root", () => {
		const { container } = render(<Card>hi</Card>);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveAttribute("data-variant", "glass");
		expect(root).toHaveClass("ds-atom-card");
	});

	it("applies data-variant for each explicit variant", () => {
		for (const v of ["glass", "amber", "dark", "kanban"] as const) {
			const { container } = render(<Card variant={v}>x</Card>);
			expect(container.firstChild).toHaveAttribute("data-variant", v);
		}
	});

	it("forwards ref to the root div", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Card ref={ref} variant="glass">
				x
			</Card>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveAttribute("data-variant", "glass");
	});

	it("spreads consumer props (className, data-*, onClick) onto the root", () => {
		const onClick = vi.fn();
		const { container } = render(
			<Card className="my-extra" data-testid="card-x" onClick={onClick}>
				body
			</Card>,
		);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-card");
		expect(root).toHaveClass("my-extra");
		expect(root).toHaveAttribute("data-testid", "card-x");
		root.click();
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("renders freely-composed children unchanged", () => {
		const { container, getByText } = render(
			<Card variant="glass">
				<h2>Title</h2>
				<p>Body paragraph.</p>
				<footer>Footer text</footer>
			</Card>,
		);
		expect(getByText("Title").tagName).toBe("H2");
		expect(getByText("Body paragraph.").tagName).toBe("P");
		expect(getByText("Footer text").tagName).toBe("FOOTER");
		// All three are descendants of the card root
		const root = container.firstChild as HTMLElement;
		expect(root.querySelector("h2")).not.toBeNull();
		expect(root.querySelector("p")).not.toBeNull();
		expect(root.querySelector("footer")).not.toBeNull();
	});

	it("merges consumer style last (consumer wins on collisions)", () => {
		const { container } = render(<Card style={{ padding: "999px" }}>x</Card>);
		const root = container.firstChild as HTMLElement;
		// Inline style is set; CSS rules in primitives.css don't run in jsdom but inline does.
		expect(root.style.padding).toBe("999px");
	});
});

describe("Card — surface axis", () => {
	it("emits data-surface for the semantic names", () => {
		const { container } = render(<Card surface="subtle">x</Card>);
		expect((container.firstElementChild as HTMLElement).dataset.surface).toBe("subtle");
	});

	it("maps the deprecated tone names onto surface", () => {
		// `tone` was three unrelated things and collided with `variant` on "amber".
		const cases: Array<[NonNullable<CardProps["tone"]>, string]> = [
			["amber", "tint"],
			["cream-2", "subtle"],
			["flat", "outline"],
		];
		for (const [tone, surface] of cases) {
			const { container, unmount } = render(<Card tone={tone}>x</Card>);
			expect((container.firstElementChild as HTMLElement).dataset.surface).toBe(surface);
			unmount();
		}
	});

	it("lets surface win when both are given", () => {
		const { container } = render(
			<Card surface="outline" tone="amber">
				x
			</Card>,
		);
		expect((container.firstElementChild as HTMLElement).dataset.surface).toBe("outline");
	});

	it("keeps variant and surface independent, so amber no longer means two things", () => {
		const { container } = render(
			<Card variant="amber" surface="tint">
				x
			</Card>,
		);
		const el = container.firstElementChild as HTMLElement;
		expect(el.dataset.variant).toBe("amber");
		expect(el.dataset.surface).toBe("tint");
	});

	it("accepts hover as a boolean and as the legacy string", () => {
		const { container: a } = render(<Card hover>x</Card>);
		expect((a.firstElementChild as HTMLElement).dataset.hover).toBe("elevate");
		const { container: b } = render(<Card hover="elevate">x</Card>);
		expect((b.firstElementChild as HTMLElement).dataset.hover).toBe("elevate");
		const { container: c } = render(<Card>x</Card>);
		expect((c.firstElementChild as HTMLElement).dataset.hover).toBeUndefined();
	});
});

/**
 * E3 — a consumer stylesheet must be able to set `display` on a Card.
 *
 * These read `getComputedStyle`, not the inline `style` attribute, because the
 * defect is precisely that a declaration can be present and not apply. An
 * attribute assertion passes against the *unfixed* component.
 *
 * The real `primitives.css` is injected rather than a hand-written excerpt, so
 * a rule that lands in the wrong place — or never lands — fails here instead of
 * being described correctly in a test fixture and missing from the shipped
 * sheet.
 *
 * jsdom caveat, measured rather than assumed: jsdom resolves the cascade by
 * SOURCE ORDER ONLY — it does not implement specificity. It does honour
 * inline-beats-stylesheet, which is the axis these cases turn on, so they bite
 * for the right reason. Any claim about one selector outranking another by
 * specificity belongs in tests/visual/brand-probe.spec.ts, in a real browser.
 */
describe("Card — consumer styling boundary (E3)", () => {
	let dsSheet: HTMLStyleElement;
	let consumerSheet: HTMLStyleElement;

	beforeAll(() => {
		dsSheet = document.createElement("style");
		dsSheet.textContent = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
		document.head.appendChild(dsSheet);
		// A consumer sheet, loaded after the design system's — the ordinary
		// arrangement in an app, and the one /work measured.
		consumerSheet = document.createElement("style");
		consumerSheet.textContent = ".wk-card { display: flex; flex-direction: column; }";
		document.head.appendChild(consumerSheet);
	});

	afterAll(() => {
		dsSheet.remove();
		consumerSheet.remove();
	});

	it("lets a consumer class set display, so a flex column card can bottom-align a child", () => {
		const { container } = render(<Card className="wk-card">x</Card>);
		const root = container.firstChild as HTMLElement;
		const cs = getComputedStyle(root);
		expect(cs.display, "consumer display must win once Card stops inlining it").toBe("flex");
		// flex-direction already applied before the fix — it was never inlined.
		// Asserting it here proves the consumer rule matched the element, so a
		// failure on `display` above cannot be blamed on a selector that missed.
		expect(cs.flexDirection).toBe("column");
	});

	it("still computes display: block with no consumer class", () => {
		const { container } = render(<Card>x</Card>);
		expect(getComputedStyle(container.firstChild as HTMLElement).display).toBe("block");
	});

	it("still computes box-sizing: border-box and the --font family", () => {
		const { container } = render(<Card>x</Card>);
		const cs = getComputedStyle(container.firstChild as HTMLElement);
		expect(cs.boxSizing).toBe("border-box");
		// jsdom does not substitute custom properties, so the literal var() is
		// what a correct rule produces here.
		expect(cs.fontFamily).toBe("var(--font)");
	});

	it("still lets a consumer's inline style prop win over its own class rule", () => {
		const { container } = render(
			<Card className="wk-card" style={{ display: "grid" }}>
				x
			</Card>,
		);
		expect(getComputedStyle(container.firstChild as HTMLElement).display).toBe("grid");
	});
});
