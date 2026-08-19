import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Button, type ButtonSize, type ButtonVariant } from ".";
describe("Button", () => {
	it("renders children", () => {
		const { getByRole } = render(<Button>Save</Button>);
		expect(getByRole("button")).toHaveTextContent("Save");
	});

	it("calls onClick when clicked", () => {
		const onClick = vi.fn();
		const { getByRole } = render(<Button onClick={onClick}>Save</Button>);
		fireEvent.click(getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("disabled state suppresses onClick", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<Button onClick={onClick} disabled>
				Save
			</Button>,
		);
		fireEvent.click(getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
		expect(getByRole("button")).toBeDisabled();
	});

	it("loading state renders spinner and disables button", () => {
		const onClick = vi.fn();
		const { getByRole, container } = render(
			<Button onClick={onClick} loading>
				Save
			</Button>,
		);
		expect(getByRole("button")).toBeDisabled();
		expect(container.querySelector(".ds-atom-btn-spinner")).toBeInTheDocument();
		fireEvent.click(getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Save</Button>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("style prop merges last (consumer overrides internal styles)", () => {
		const { getByRole } = render(<Button style={{ background: "red" }}>Save</Button>);
		const button = getByRole("button");
		expect(button.style.background).toContain("red");
	});

	it("renders icon before children", () => {
		const { getByRole, getByTestId } = render(
			<Button icon={<span data-testid="icon">★</span>}>Save</Button>,
		);
		const button = getByRole("button");
		expect(button).toContainElement(getByTestId("icon"));
		// Icon should appear before the text "Save" in the DOM.
		const iconIndex = button.textContent?.indexOf("★") ?? -1;
		const textIndex = button.textContent?.indexOf("Save") ?? -1;
		expect(iconIndex).toBeLessThan(textIndex);
	});

	it("renders all variant + size combinations without crashing", () => {
		// `satisfies` rejects a name that is not a real variant, and the
		// _Exhaustive alias below fails to compile if a variant is missing — so
		// this list cannot drift from the type in either direction.
		//
		// It previously included "amber", which is not a ButtonVariant. The test
		// still passed: `variantStyles["amber"]` was undefined and spreading
		// undefined is a no-op, so it silently rendered an unstyled button and
		// asserted nothing. Only type-checking test files surfaced it.
		const variants = [
			"primary",
			"secondary",
			"ghost",
			"danger",
		] as const satisfies readonly ButtonVariant[];
		type _Exhaustive = Exclude<ButtonVariant, (typeof variants)[number]> extends never
			? true
			: ["missing variant in test matrix", Exclude<ButtonVariant, (typeof variants)[number]>];
		const _check: _Exhaustive = true;
		void _check;

		const sizes = ["xs", "sm", "md", "lg"] as const satisfies readonly ButtonSize[];
		type _ExhaustiveSize = Exclude<ButtonSize, (typeof sizes)[number]> extends never
			? true
			: ["missing size in test matrix", Exclude<ButtonSize, (typeof sizes)[number]>];
		const _checkSize: _ExhaustiveSize = true;
		void _checkSize;
		for (const variant of variants) {
			for (const size of sizes) {
				const { unmount } = render(
					<Button variant={variant} size={size}>
						{variant}-{size}
					</Button>,
				);
				unmount();
			}
		}
	});

	it("data-variant attribute reflects the variant prop", () => {
		const { getByRole } = render(<Button variant="danger">Delete</Button>);
		expect(getByRole("button")).toHaveAttribute("data-variant", "danger");
	});
});

describe("Button — accessibility and token contract", () => {
	it("marks the control aria-busy while loading", () => {
		const { getByRole, rerender } = render(<Button>Save</Button>);
		expect(getByRole("button")).not.toHaveAttribute("aria-busy");
		rerender(<Button loading>Save</Button>);
		expect(getByRole("button")).toHaveAttribute("aria-busy", "true");
	});

	it("keeps a stable accessible name across the loading transition", () => {
		// The spinner is decorative; adding visible or SR-only "Loading" text
		// would rename the control mid-flight and break name-based queries.
		const { getByRole, rerender } = render(<Button>Save</Button>);
		expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
		rerender(<Button loading>Save</Button>);
		expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
	});

	it("defaults to type=button so it cannot submit an enclosing form", () => {
		const { getByRole } = render(<Button>Save</Button>);
		expect(getByRole("button")).toHaveAttribute("type", "button");
	});

	it("still lets a consumer opt into type=submit", () => {
		const { getByRole } = render(<Button type="submit">Save</Button>);
		expect(getByRole("button")).toHaveAttribute("type", "submit");
	});

	it("does not inline a `transition`, leaving the stylesheet's reduced-motion guard in force", () => {
		// An inline `transition: all .15s` used to beat both the enumerated
		// transition in primitives.css and its prefers-reduced-motion override.
		const { getByRole } = render(<Button>Save</Button>);
		expect(getByRole("button").style.transition).toBe("");
	});

	it("resolves borders and fills through tokens rather than raw hex", () => {
		const { getByRole } = render(<Button variant="secondary">Save</Button>);
		const style = getByRole("button").getAttribute("style") ?? "";
		// --wire is deliberately NOT here any more; see the boundary case below.
		expect(style).toContain("var(--panel)");
		expect(style).not.toContain("border-color");
		expect(style).not.toContain("1px solid");
	});

	/**
	 * E6 — secondary's boundary token must survive the move out of inline style.
	 *
	 * The obvious version of this fix ("delete borderColor from variantStyles,
	 * add a rule to primitives.css") silently REGRESSES secondary from --wire to
	 * --rule, because baseStyle also carried `border: 1px solid var(--rule)`
	 * inline and inline beats any class rule. Both halves of the plan's own grep
	 * gate stay green through that regression, so the assertion has to read a
	 * computed value with the real sheet attached, not an attribute.
	 *
	 * Two measured jsdom facts shape the assertion. It returns custom properties
	 * unsubstituted, so the expected value is the literal token reference. And it
	 * populates `borderColor` but NOT `borderTopColor` from a `border-color`
	 * longhand — while a `border: 1px solid var(--rule)` SHORTHAND is dropped
	 * outright, leaving `borderColor` empty. So this reads `borderColor`; a
	 * `borderTopColor` assertion here would sit on the UA `buttonface` forever.
	 * jsdom also resolves the cascade by source order rather than specificity —
	 * here the two agree, and the specificity claim is proven separately in
	 * tests/visual/control-boundary.spec.ts in a real browser.
	 */
	describe("secondary's boundary is --wire, from the stylesheet", () => {
		let dsSheet: HTMLStyleElement;

		beforeAll(() => {
			dsSheet = document.createElement("style");
			dsSheet.textContent = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
			document.head.appendChild(dsSheet);
		});
		afterAll(() => dsSheet.remove());

		it("computes --wire for secondary, from the sheet rather than the element", () => {
			const { getByRole, rerender } = render(<Button variant="secondary">Save</Button>);
			const el = getByRole("button");
			expect(el.style.borderColor, "must not be inline any more").toBe("");
			expect(getComputedStyle(el).borderColor).toBe("var(--wire)");
			// ghost still sets its border-color inline, so the [data-variant]
			// rule is doing the work rather than every button having moved token.
			rerender(<Button variant="ghost">Save</Button>);
			expect(getComputedStyle(getByRole("button")).borderColor).toBe("transparent");
		});

		it("keeps --wire on hover, where a 1.09:1 rgba used to be declared", () => {
			// The hover rule's border-color was removed rather than left to
			// activate: it had never applied (inline --wire outranked it) and it
			// sits far below the 3:1 non-text floor E6 exists to reach.
			const sheet = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
			const hover = sheet.slice(
				sheet.indexOf('.ds-atom-btn[data-variant="secondary"]:hover'),
				sheet.indexOf('.ds-atom-btn[data-variant="ghost"]:hover'),
			);
			expect(hover).not.toContain("border-color");
		});

		it("leaves padding inline — control geometry is Phase 06.1, not this change", () => {
			const { getByRole } = render(<Button variant="secondary">Save</Button>);
			expect(getByRole("button").style.padding).toBe("7px 14px");
		});
	});
});

describe("Button — token scale adherence", () => {
	// Button was the least token-compliant component in the system: fontSize
	// 10/11/12/13 and borderRadius 5/7/9, none on --text-* or --radius-*. That
	// made it unthemeable by token override, which is the whole point of the scale.
	const sizes = ["xs", "sm", "md", "lg"] as const satisfies readonly ButtonSize[];

	it("resolves font size and radius through tokens at every size", () => {
		for (const size of sizes) {
			const { getByRole, unmount } = render(<Button size={size}>x</Button>);
			const style = getByRole("button").getAttribute("style") ?? "";
			expect(style, `${size} font-size should use --text-*`).toMatch(/font-size:\s*var\(--text-/);
			expect(style, `${size} radius should use --radius-*`).toMatch(
				/border-radius:\s*var\(--radius-/,
			);
			unmount();
		}
	});

	it("resolves font weight through tokens for every variant", () => {
		for (const variant of ["primary", "secondary", "danger"] as const) {
			const { getByRole, unmount } = render(<Button variant={variant}>x</Button>);
			const style = getByRole("button").getAttribute("style") ?? "";
			expect(style, `${variant} weight should use --weight-*`).toMatch(
				/font-weight:\s*var\(--weight-/,
			);
			unmount();
		}
	});

	it("keeps lg on the 44px token height so it lines up with OAuthButton", () => {
		const { getByRole } = render(<Button size="lg">x</Button>);
		const style = getByRole("button").getAttribute("style") ?? "";
		expect(style).toContain("height: var(--space-11)");
	});
});
