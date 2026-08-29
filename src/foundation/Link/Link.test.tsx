import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Link } from ".";

describe("Link", () => {
	it("renders children inside <a>", () => {
		const { container, getByText } = render(<Link href="/x">Sign in</Link>);
		expect(getByText("Sign in")).toBeInTheDocument();
		const a = container.querySelector("a.ds-atom-link") as HTMLAnchorElement;
		expect(a.getAttribute("href")).toBe("/x");
	});

	it("emits data-variant for each variant", () => {
		const variants = ["default", "inline", "footer", "action", "quiet"] as const;
		for (const variant of variants) {
			const { container, unmount } = render(<Link variant={variant}>x</Link>);
			const a = container.querySelector(".ds-atom-link") as HTMLElement;
			expect(a.dataset.variant).toBe(variant);
			unmount();
		}
	});

	it("`as` swaps the rendered element (e.g. <button>)", () => {
		const onClick = vi.fn();
		const { container } = render(
			<Link as="button" onClick={onClick}>
				CLEAR
			</Link>,
		);
		expect(container.querySelector("a")).toBeNull();
		const btn = container.querySelector("button.ds-atom-link") as HTMLButtonElement;
		expect(btn).not.toBeNull();
		fireEvent.click(btn);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("color prop overrides inline color", () => {
		const { container } = render(<Link color="#ff0000">x</Link>);
		const a = container.querySelector("a") as HTMLAnchorElement;
		expect(a.style.color).toContain("rgb(255, 0, 0)");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLAnchorElement>();
		render(<Link ref={ref}>x</Link>);
		expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
	});

	it("merges className", () => {
		const { container } = render(<Link className="extra">x</Link>);
		const a = container.querySelector(".ds-atom-link") as HTMLElement;
		expect(a.className).toContain("ds-atom-link");
		expect(a.className).toContain("extra");
	});
	/**
	 * D-4 — the colour pair must not come back to the style attribute.
	 *
	 * This is a regression guard and nothing more. jsdom cannot see the defect
	 * that motivated the change: it implements no cascade, so it cannot tell that
	 * the dark-mode rule primitives.css declared for these two variants was being
	 * outranked. What it CAN see is whether the declaration that did the
	 * outranking is still being emitted, and that is the thing a future edit is
	 * most likely to reintroduce. The painted result is proved in a real browser,
	 * in tests/visual/link-underline-surface.spec.ts.
	 */
	describe("footer and action colours live in the stylesheet (D-4)", () => {
		for (const variant of ["footer", "action"] as const) {
			it(`${variant} emits no inline colour or underline colour`, () => {
				const { container } = render(
					<Link variant={variant} href="#">
						x
					</Link>,
				);
				const a = container.querySelector("a") as HTMLAnchorElement;
				expect(a.style.color, "the variant is inlining its colour again").toBe("");
				expect(
					a.style.textDecorationColor,
					"the variant is inlining its underline colour again — no stylesheet rule can beat it",
				).toBe("");
				// The literal that made it invisible on a dark surface, specifically.
				expect(a.getAttribute("style") ?? "").not.toContain("rgba(0, 0, 0, 0.25)");
			});

			it(`${variant} keeps its type metrics inline, which were never the finding`, () => {
				const { container } = render(
					<Link variant={variant} href="#">
						x
					</Link>,
				);
				const a = container.querySelector("a") as HTMLAnchorElement;
				expect(a.style.fontSize).toBe("12.5px");
				expect(a.style.fontWeight).toBe(variant === "footer" ? "600" : "700");
			});
		}

		it("still lets the color prop through, which is the documented escape hatch", () => {
			const { container } = render(
				<Link variant="footer" color="#ff0000" href="#">
					x
				</Link>,
			);
			const a = container.querySelector("a") as HTMLAnchorElement;
			expect(a.style.color).toContain("rgb(255, 0, 0)");
		});

		it("leaves the inline variant's amber alone — it is a token and it adapts", () => {
			const { container } = render(
				<Link variant="inline" href="#">
					x
				</Link>,
			);
			const a = container.querySelector("a") as HTMLAnchorElement;
			expect(a.getAttribute("style") ?? "").toContain("var(--amber-d)");
		});
	});
});
