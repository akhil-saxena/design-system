import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Chip } from ".";
describe("Chip", () => {
	it("renders children", () => {
		const { getByText } = render(<Chip>React</Chip>);
		expect(getByText("React")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Chip ref={ref}>x</Chip>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("does not render × when onRemove absent", () => {
		const { queryByRole } = render(<Chip>x</Chip>);
		expect(queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders × button when onRemove present and calls it", () => {
		const onRemove = vi.fn();
		const { getByRole } = render(<Chip onRemove={onRemove}>x</Chip>);
		const removeBtn = getByRole("button", { name: /remove/i });
		fireEvent.click(removeBtn);
		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	it("× click stops propagation (does not bubble to parent click handler)", () => {
		const onParentClick = vi.fn();
		const onRemove = vi.fn();
		const { getByRole } = render(
			// biome-ignore lint/a11y/useKeyWithClickEvents: test harness needs raw click event
			<div onClick={onParentClick}>
				<Chip onRemove={onRemove}>x</Chip>
			</div>,
		);
		fireEvent.click(getByRole("button", { name: /remove/i }));
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onParentClick).not.toHaveBeenCalled();
	});

	it("renders all tones (incl. tag)", () => {
		const tones = ["default", "match", "miss", "learning", "tag"] as const;
		for (const tone of tones) {
			const { unmount } = render(<Chip tone={tone}>{tone}</Chip>);
			unmount();
		}
	});

	it("renders leading icon when icon prop set", () => {
		const { getByTestId } = render(
			<Chip icon={<span data-testid="chip-icon">★</span>}>Pinned</Chip>,
		);
		expect(getByTestId("chip-icon")).toBeInTheDocument();
	});
});

/**
 * E4 — a consumer `className` must be CONCATENATED with the atom hook, not
 * replace it. `Card` has always concatenated; `Chip` let `className` fall into
 * `...rest`, which spread after the literal attribute and overwrote it.
 * Measured in a browser during phase 0: `chipClassAttr: "wk-chip"`,
 * `chipKeepsAtomClass: false`.
 *
 * The cost is latent, not visual. Chip's inline `baseStyle`/`toneStyles`
 * already outrank `.dark .ds-atom-chip`, so losing the class changed no pixel —
 * but it also dropped `.ds-atom-chip[data-interactive]`, taking the keyboard
 * focus ring with it. That is what the computed `cursor` case below detects: it
 * is a real cascade read, so it cannot pass while the class is missing.
 */
describe("Chip — consumer styling boundary (E4)", () => {
	let dsSheet: HTMLStyleElement;

	beforeAll(() => {
		dsSheet = document.createElement("style");
		dsSheet.textContent = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
		document.head.appendChild(dsSheet);
	});

	afterAll(() => dsSheet.remove());

	it("concatenates a consumer className with the atom hook", () => {
		const { container } = render(<Chip className="wk-chip">React</Chip>);
		const el = container.firstElementChild as HTMLElement;
		expect(el.getAttribute("class")).toBe("ds-atom-chip wk-chip");
	});

	it("renders the bare atom class with no trailing space when className is absent", () => {
		const { container } = render(<Chip>React</Chip>);
		expect((container.firstElementChild as HTMLElement).getAttribute("class")).toBe("ds-atom-chip");
	});

	it("keeps an interactive chip inside the [data-interactive] rules when a consumer class is set", () => {
		const { container } = render(
			<Chip className="wk-chip" data-interactive="true" tabIndex={0}>
				React
			</Chip>,
		);
		const el = container.firstElementChild as HTMLElement;

		// The selector is read out of the shipped sheet rather than retyped, so
		// this cannot drift into asserting against a rule that no longer exists.
		const rules = [...(dsSheet.sheet?.cssRules ?? [])] as CSSStyleRule[];
		const focusRule = rules.find(
			(r) => r.selectorText === ".ds-atom-chip[data-interactive]:focus-visible",
		);
		expect(focusRule, "primitives.css must still declare the chip focus ring").toBeDefined();
		expect(focusRule?.style.getPropertyValue("outline")).toContain("var(--focus)");
		expect(el.matches(focusRule?.selectorText.replace(":focus-visible", "") ?? "")).toBe(true);

		// A cascade read, not a class-list read: the sibling [data-interactive]
		// rule only reaches this element while the atom class survives.
		expect(getComputedStyle(el).cursor).toBe("pointer");
	});

	it("still lets the inline style prop win over its own baseStyle", () => {
		const { container } = render(<Chip style={{ background: "rgb(1, 2, 3)" }}>x</Chip>);
		expect((container.firstElementChild as HTMLElement).style.background).toBe("rgb(1, 2, 3)");
	});
});
