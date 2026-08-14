import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
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
